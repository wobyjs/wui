import { useOnClickOutside, useSelection } from '@woby/use'
import { $, $$, useEffect, JSX, useMemo, Observable, createContext, useContext, setRef, customElement, defaults } from 'woby'
import type { FocusManager } from './FocusManager'
import { saveSelectionAsOffsets, restoreSelectionFromOffsets, findEditorRoot } from './StyleEngine'
import { safeGetSelection } from './BrowserCompat'
import { captureScroll, currentLayout, Layout, paginate, unpaginatedHTML } from './PageLayout'

// 1. CREATE THE EDITOR DATA STORE
// createContext: Creates a "global" storage box so we don't have to pass props everywhere.
// <Observable<HTMLDivElement>>: TypeScript definition. This box will hold a "Reactive Reference" to the actual <div> of the editor.
export const EditorContext = createContext<Observable<HTMLDivElement>>()

// 2. CREATE A SHORTCUT (HOOK)
// Instead of importing 'useContext' and 'EditorContext' in every file, components just call 'useEditor()'.
// It returns the current Editor <div> so buttons can modify it.
// `createContext<T>()` with no default makes `useContext` return `T | undefined`. Every consumer
// of these hooks is rendered inside `<Editor>`, which always provides the value, so the hooks
// assert non-undefined here rather than forcing ~30 call sites to null-check a value that is
// never actually missing.
export const useEditor = () => useContext(EditorContext)!

// FocusManager context — toolbar buttons call beginCommand/endCommand to preserve selection
export const FocusManagerContext = createContext<FocusManager>()
// Same object-valued-context unwrap as `useUndoRedo` below — without it
// `focusManager.beginCommand` is undefined.
export const useFocusManager = () => $$(useContext(FocusManagerContext))!

// Readonly context — controls whether editor is in edit or readonly mode
export const ReadonlyContext = createContext<Observable<boolean>>()
export const useReadonly = () => useContext(ReadonlyContext)!

// 3. CREATE THE UNDO/REDO DATA STORE
// This creates another storage box that holds an object with specific properties:
// - undos/redos: Observable arrays (the history stacks).
// - undo/redo/saveDo: The functions logic to move backwards/forwards in history.
export const UndoRedoContext = createContext<{
    undos: Observable<HistoryEntry[]>,
    undo: () => void,
    redos: Observable<HistoryEntry[]>,
    redo: () => void,
    saveDo: () => void
}>()

// 4. CREATE A SHORTCUT (HOOK)
// Components call 'useUndoRedo()' to grab the functions defined above.
// Example usage: const { undo } = useUndoRedo();
// `useContext` hands back the raw Provider value, and woby stores that value in an
// observable — so for a context whose value is a plain OBJECT (not an observable the
// consumer is expected to unwrap) the hook returns a *function*, and every
// `ctx.saveDo` / `ctx.undo` property read silently yields undefined. Consumers then
// fell through to their no-op fallbacks, which is why nothing was ever pushed onto the
// history stacks and the toolbar's Undo/Redo buttons did nothing.
// `$$` unwraps functions recursively and passes plain values through untouched, so it
// is correct whether or not the value arrives wrapped.
export const useUndoRedo = () => $$(useContext(UndoRedoContext))!

/**
 * Defines the structure of the Undo/Redo state and its controller functions.
 */
export type UndoRedoType = {
    /** An observable array containing the history of HTML snapshots. */
    undos: Observable<HistoryEntry[]>,
    /** Moves the editor state one step backward in history. */
    undo: () => void,
    /** An observable array containing snapshots that were "undone" and can be restored. */
    redos: Observable<HistoryEntry[]>,
    /** Moves the editor state one step forward in history. */
    redo: () => void,
    /** Captures the current HTML of the editor and saves it into the undo history. */
    saveDo: () => void,
}

/**
 * Module-level constants for enhanced undo/redo
 * - Debouncing prevents saving on every keystroke
 * - History stack limits prevent memory issues
 */
const DEBOUNCE_MS = 300
const MAX_STACK = 100

/**
 * What a history entry stores: the document with the page sheets taken back out.
 *
 * History has to be layout-independent or it is not history. Snapshots used to be the
 * surface's raw `innerHTML`, so an entry taken in `page` mode carried the sheet wrappers
 * and the page-number strips while one taken in `flow` mode did not — and since undo
 * writes an entry back verbatim, a single Ctrl+Z could re-lay-out the whole document
 * instead of reverting an edit.
 *
 * Normalising here fixes both halves at once. Restoring can no longer smuggle in a
 * layout, and switching layout no longer *creates* an entry: the snapshot before and
 * after the switch are byte-identical, so `saveDo`'s own "did anything change" test
 * rejects it. That is why this is the real fix and the mutation filtering in
 * `Editor.tsx` was not — it stops the entry existing rather than trying to catch the
 * mutation that would have made it.
 */
const snapshot = (el: HTMLElement) => unpaginatedHTML(el.innerHTML)

/**
 * Rebuild the sheets after a snapshot has been written back.
 *
 * Entries are always flow markup (see `snapshot`), so in `page` mode restoring one
 * leaves the document visibly un-paginated until some unrelated edit happens to trigger
 * a reflow. `paginate` is idempotent and flattens first, so calling it is safe whatever
 * the entry turned out to contain.
 */
const relayout = (el: HTMLElement) => {
    if (currentLayout() === Layout.page) paginate(el)
}

/**
 * History entry type - stores content and selection for restoration.
 *
 * The history stacks hold these rather than bare HTML strings so undo can also restore the caret;
 * `UndoRedoContext` / `UndoRedoType` are typed against it.
 */
export type HistoryEntry = {
    content: string
    selection?: {
        startOffset: number
        endOffset: number
    }
}

/**
 * A Provider component that manages the history (undo/redo) for a contentEditable editor.
 * It must be placed inside an EditorContext.Provider.
 */
// #region Undo Redo
export const UndoRedo = ({ children, editor }: { children: JSX.Children, editor?: Observable<HTMLDivElement> }) => {
    // Local reactive state for the history stacks
    const undos = $([] as HistoryEntry[])
    const redos = $([] as HistoryEntry[])
    const isInitialized = $(false)

    // D-06: debounceTimer inside component closure prevents cross-instance timer sharing
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    // 2. Priority Logic: Use the prop if passed, otherwise fall back to context
    const contextEditor = useEditor()
    const activeEditor = editor || contextEditor


    // #region initialize-editor-content
    /**
     * Effect: Runs automatically when the component mounts or dependencies change.
     * It captures the very first state of the editor (e.g., the "Lorem Ipsum" text).
     *
     * D-14: Delay initialization until shadow DOM has content (after light DOM sync).
     * The EditorSurface syncs light DOM children into shadow DOM via a separate useEffect.
     * That effect may run after this one, leaving the shadow DOM empty at initialization time.
     * We use a polling mechanism with retries to wait for meaningful content before capturing.
     *
     * D-15: Prevent race condition where effect re-runs between retries.
     * Use a local flag to track if we've started initialization, and only set isInitialized
     * when we have meaningful content.
     */
    useEffect(() => {
        const currentEditor = $$(activeEditor) // unwrap
        // Initialize only if editor is available and not already initialized
        if (currentEditor && !$$(isInitialized)) { // unwrap
            // D-14: Check if shadow DOM has content. If empty, delay initialization.
            // The EditorSurface will sync light DOM content into shadow DOM shortly after mount.
            // Normalised, like every other entry — the editor can already be in `page`
            // mode by the time this runs (the mode is re-asserted whenever the surface is
            // rebuilt), and a paginated entry at the bottom of the stack is the one no
            // amount of undoing can get you out of.
            const initialContent = snapshot(currentEditor)

            // Check for meaningful content (not empty, not just whitespace, not just a br tag)
            const hasMeaningfulContent = initialContent &&
                initialContent.trim() !== '' &&
                initialContent !== '<br>' &&
                initialContent.length > 10 // Require at least 10 chars to have actual content

            if (!hasMeaningfulContent) {
                // Shadow DOM is empty or has minimal content - poll for real content
                // Poll every 50ms up to 10 retries (500ms total)
                let retries = 0
                const maxRetries = 10
                const pollInterval = 50

                const pollForContent = () => {
                    retries++
                    const polledContent = snapshot(currentEditor)
                    const polledHasContent = polledContent &&
                        polledContent.trim() !== '' &&
                        polledContent !== '<br>' &&
                        polledContent.length > 10

                    if (polledHasContent) {
                        undos([{ content: polledContent }])
                        isInitialized(true)
                    } else if (retries < maxRetries) {
                        // Continue polling
                        setTimeout(pollForContent, pollInterval)
                    } else {
                        // Final fallback - capture whatever we have even if minimal
                        // This ensures undo stack is not empty, just may have limited initial state
                        undos([{ content: polledContent || '<br>' }])
                        isInitialized(true)
                    }
                }

                setTimeout(pollForContent, pollInterval)
            } else {
                // Content already present (e.g., manually set or sync already ran)
                undos([{ content: initialContent }]) // initial state has no selection
                isInitialized(true) // set observable
            }
        }
    }) // No dependency array, Woby will auto-track $$(editor) and $$(isInitialized)
    // #endregion


    // #region saveDO
    /**
     * saveDo: The "Snapshot" function with debouncing.
     * Call this after any formatting change / new action (bold, indent, etc.) or significant typing.
     * Debouncing prevents saving on every keystroke (300ms delay).
     * D-13: Also saves selection state for restoration after undo/redo.
     */
    const saveDo = () => {
        // Clear any pending save
        if (debounceTimer) clearTimeout(debounceTimer)

        // Debounce: wait 300ms before actually saving
        debounceTimer = setTimeout(() => {
            const el = $$(activeEditor)

            if (typeof el === 'string' || !el || !(el instanceof Node)) {
                console.warn("🛑 SKIP: Waiting for valid DOM Node...", el)
                return
            }

            const element = el as HTMLElement
            // Capture from the shadow DOM — formatting lives here, not in light DOM (host) —
            // and with the page sheets normalised away, so the entry means the same thing
            // whichever layout it was taken in. See `snapshot`.
            const currentContent = snapshot(element)
            const u = $$(undos)

            // D-13: Capture selection state for restoration after undo/redo
            const sel = safeGetSelection()
            let selectionData: { startOffset: number, endOffset: number } | undefined = undefined
            if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0)
                const savedSel = saveSelectionAsOffsets(range)
                if (savedSel.editorRoot) {
                    selectionData = {
                        startOffset: savedSel.startOffset,
                        endOffset: savedSel.endOffset
                    }
                }
            }

            // Initialization Logic
            if (!$$(isInitialized)) {
                undos([{ content: currentContent, selection: selectionData }])
                isInitialized(true)
                return
            }

            // Check for changes
            const last = u.length ? u[u.length - 1].content : ""
            if (last !== currentContent) {
                // Add to undos stack
                const newUndos = [...u, { content: currentContent, selection: selectionData }]

                // Limit stack to MAX_STACK entries
                if (newUndos.length > MAX_STACK) {
                    newUndos.shift() // Remove oldest entry
                }

                undos(newUndos)
                redos([]) // Clear redo stack on new action
            }
        }, DEBOUNCE_MS)
    }
    // #endregion


    // #region undo
    /**
     * undo: Reverts to the previous HTML snapshot.
     * D-13: Also restores selection if it was saved with the snapshot.
     */
    const undo = () => {
        const u = $$(undos)
        const r = $$(redos)

        // If there's only the initial state (or fewer, though should not happen if initialized)
        // or editor is not available, can't undo.
        if (u.length <= 1 || !$$(activeEditor)) {
            return
        }

        // D-13: Save current selection to the redo stack entry before moving
        const sel = safeGetSelection()
        let currentSelection: { startOffset: number, endOffset: number } | undefined = undefined
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0)
            const savedSel = saveSelectionAsOffsets(range)
            if (savedSel.editorRoot) {
                currentSelection = {
                    startOffset: savedSel.startOffset,
                    endOffset: savedSel.endOffset
                }
            }
        }

        const entryToMoveToRedo = u.pop() // Removes last element and returns it
        // Add current selection to the redo entry
        const redoEntry = entryToMoveToRedo ? {
            content: entryToMoveToRedo.content,
            selection: currentSelection
        } : undefined

        undos([...u]) // Update undos stack (already modified by pop)

        if (redoEntry !== undefined) { // Ensure it's not undefined
            const newRedos = [...r, redoEntry]
            redos(newRedos)
        }

        // The state to restore is now the last element of the modified 'u'.
        // This is guaranteed to exist because u.length was > 1, so after pop it's >= 1.
        const stateToRestore = u[u.length - 1]
        // Restore directly to shadow DOM — formatting was captured from there.
        // Restoring host.innerHTML (light DOM) triggers syncChildren which would
        // overwrite the formatted shadow DOM with plain light DOM content.
        const el = $$(activeEditor) as HTMLElement
        const restoreScroll = captureScroll(el)
        el.innerHTML = stateToRestore.content

        // The entry is flow markup, so in `page` mode the sheets have to come back before
        // the caret is placed — `restoreSelectionFromOffsets` walks the live tree, and the
        // tree it walks has to be the one the user ends up looking at.
        relayout(el)

        // D-13: Restore selection if saved with the snapshot
        if (stateToRestore.selection) {
            const editorRoot = findEditorRoot(el)
            if (editorRoot) {
                restoreSelectionFromOffsets(
                    editorRoot,
                    stateToRestore.selection.startOffset,
                    stateToRestore.selection.endOffset
                )
            }
        }

        restoreScroll()
    }
    // #endregion


    // #region redo
    /**
     * redo: Restores a snapshot that was previously undone.
     * D-13: Also restores selection if it was saved with the snapshot.
     */
    const redo = () => {
        const u = $$(undos)
        const r = $$(redos)

        if (r.length === 0 || !$$(activeEditor)) {
            return
        }

        // D-13: Save current selection to the undo stack entry before moving
        const sel = safeGetSelection()
        let currentSelection: { startOffset: number, endOffset: number } | undefined = undefined
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0)
            const savedSel = saveSelectionAsOffsets(range)
            if (savedSel.editorRoot) {
                currentSelection = {
                    startOffset: savedSel.startOffset,
                    endOffset: savedSel.endOffset
                }
            }
        }

        const entryToRestore = r.pop() // Removes last element and returns it

        redos([...r]) // Update redos stack (already modified by pop)

        if (entryToRestore !== undefined) { // Ensure it's not undefined
            // Add current selection to the undo entry
            const undoEntry = {
                content: entryToRestore.content,
                selection: currentSelection
            }
            const newUndos = [...u, undoEntry]
            undos(newUndos)
            // Restore directly to shadow DOM — same source of truth as saveDo.
            const el = $$(activeEditor) as HTMLElement
            const restoreScroll = captureScroll(el)
            el.innerHTML = entryToRestore.content

            // Same as in `undo`: sheets first, then the caret.
            relayout(el)

            // D-13: Restore selection if saved with the snapshot
            if (entryToRestore.selection) {
                const editorRoot = findEditorRoot(el)
                if (editorRoot) {
                    restoreSelectionFromOffsets(
                        editorRoot,
                        entryToRestore.selection.startOffset,
                        entryToRestore.selection.endOffset
                    )
                }
            }

            restoreScroll()
        }
    }
    // #endregion

    // Bundle the state and functions together
    const rf = { undos, undo, redos, redo, saveDo }

    // Cleanup: clear pending debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer) clearTimeout(debounceTimer)
        }
    })

    // Provide this bundle to all child components (Buttons, Toolbars, etc.)
    return <UndoRedoContext.Provider value={rf}>{children}</UndoRedoContext.Provider>
}
// #endregion


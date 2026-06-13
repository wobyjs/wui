import { useOnClickOutside, useSelection } from '@woby/use/browser'
import { $, $$, useEffect, JSX, useMemo, Observable, createContext, useContext, setRef, customElement, defaults } from 'woby'
import type { FocusManager } from './FocusManager'

// 1. CREATE THE EDITOR DATA STORE
// createContext: Creates a "global" storage box so we don't have to pass props everywhere.
// <Observable<HTMLDivElement>>: TypeScript definition. This box will hold a "Reactive Reference" to the actual <div> of the editor.
export const EditorContext = createContext<Observable<HTMLDivElement>>()

// 2. CREATE A SHORTCUT (HOOK)
// Instead of importing 'useContext' and 'EditorContext' in every file, components just call 'useEditor()'.
// It returns the current Editor <div> so buttons can modify it.
export const useEditor = () => useContext(EditorContext)

// FocusManager context — toolbar buttons call beginCommand/endCommand to preserve selection
export const FocusManagerContext = createContext<FocusManager>()
export const useFocusManager = () => useContext(FocusManagerContext)

// 3. CREATE THE UNDO/REDO DATA STORE
// This creates another storage box that holds an object with specific properties:
// - undos/redos: Observable arrays (the history stacks).
// - undo/redo/saveDo: The functions logic to move backwards/forwards in history.
export const UndoRedoContext = createContext<{
    undos: Observable<string[]>,
    undo: () => void,
    redos: Observable<string[]>,
    redo: () => void,
    saveDo: () => void
}>()

// 4. CREATE A SHORTCUT (HOOK)
// Components call 'useUndoRedo()' to grab the functions defined above.
// Example usage: const { undo } = useUndoRedo();
export const useUndoRedo = () => useContext(UndoRedoContext)

/**
 * Defines the structure of the Undo/Redo state and its controller functions.
 */
export type UndoRedoType = {
    /** An observable array containing the history of HTML snapshots. */
    undos: Observable<string[]>,
    /** Moves the editor state one step backward in history. */
    undo: () => void,
    /** An observable array containing snapshots that were "undone" and can be restored. */
    redos: Observable<string[]>,
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
 * A Provider component that manages the history (undo/redo) for a contentEditable editor.
 * It must be placed inside an EditorContext.Provider.
 */
// #region Undo Redo
export const UndoRedo = ({ children, editor }: { children: JSX.Children, editor?: Observable<HTMLDivElement> }) => {
    // Local reactive state for the history stacks
    const undos = $([] as string[])
    const redos = $([] as string[])
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
     */
    useEffect(() => {
        const currentEditor = $$(activeEditor) // unwrap
        // Initialize only if editor is available and not already initialized
        if (currentEditor && !$$(isInitialized)) { // unwrap
            // Capture shadow DOM innerHTML — that is where contentEditable lives and where
            // formatting (bold/italic/etc.) is applied. host.innerHTML (light DOM) never
            // reflects formatting changes, so it cannot be used as the source of truth.
            const initialContent = currentEditor.innerHTML
            undos([initialContent]) // innerHTML should always be a string
            isInitialized(true) // set observable
            console.log('[UndoRedo] Initialized with:', initialContent.substring(0, 100))
        }
    }) // No dependency array, Woby will auto-track $$(editor) and $$(isInitialized)
    // #endregion


    // #region saveDO
    /**
     * saveDo: The "Snapshot" function with debouncing.
     * Call this after any formatting change / new action (bold, indent, etc.) or significant typing.
     * Debouncing prevents saving on every keystroke (300ms delay).
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
            // Capture shadow DOM innerHTML — formatting lives here, not in light DOM (host).
            const currentContent = element.innerHTML
            const u = $$(undos)

            // Initialization Logic
            if (!$$(isInitialized)) {
                undos([currentContent])
                isInitialized(true)
                console.log('[UndoRedo] SaveDo initialized:', currentContent.substring(0, 100))
                return
            }

            // Check for changes
            const last = u.length ? u[u.length - 1] : ""
            if (last !== currentContent) {
                // Add to undos stack
                const newUndos = [...u, currentContent]

                // Limit stack to MAX_STACK entries
                if (newUndos.length > MAX_STACK) {
                    newUndos.shift() // Remove oldest entry
                }

                undos(newUndos)
                redos([]) // Clear redo stack on new action
                console.log('[UndoRedo] Saved state:', newUndos.length, 'entries')
            }
        }, DEBOUNCE_MS)
    }
    // #endregion


    // #region undo
    /**
     * undo: Reverts to the previous HTML snapshot.
     */
    const undo = () => {
        const u = $$(undos)
        const r = $$(redos)

        // If there's only the initial state (or fewer, though should not happen if initialized)
        // or editor is not available, can't undo.
        if (u.length <= 1 || !$$(activeEditor)) {
            return
        }

        const contentToMoveToRedo = u.pop() // Removes last element and returns it

        undos([...u]) // Update undos stack (already modified by pop)

        if (contentToMoveToRedo !== undefined) { // Ensure it's not undefined
            const newRedos = [...r, contentToMoveToRedo]
            redos(newRedos)
        }

        // The state to restore is now the last element of the modified 'u'.
        // This is guaranteed to exist because u.length was > 1, so after pop it's >= 1.
        const stateToRestore = u[u.length - 1]
        // Restore directly to shadow DOM — formatting was captured from there.
        // Restoring host.innerHTML (light DOM) triggers syncChildren which would
        // overwrite the formatted shadow DOM with plain light DOM content.
        const el = $$(activeEditor) as HTMLElement
        el.innerHTML = stateToRestore
    }
    // #endregion


    // #region redo
    /**
     * redo: Restores a snapshot that was previously undone.
     */
    const redo = () => {
        const u = $$(undos)
        const r = $$(redos)

        if (r.length === 0 || !$$(activeEditor)) {
            return
        }

        const contentToRestoreAndMoveToUndo = r.pop() // Removes last element and returns it

        redos([...r]) // Update redos stack (already modified by pop)

        if (contentToRestoreAndMoveToUndo !== undefined) { // Ensure it's not undefined
            const newUndos = [...u, contentToRestoreAndMoveToUndo]
            undos(newUndos)
            // Restore directly to shadow DOM — same source of truth as saveDo.
            const el = $$(activeEditor) as HTMLElement
            el.innerHTML = contentToRestoreAndMoveToUndo
        }
    }
    // #endregion

    // Bundle the state and functions together
    const rf = { undos, undo, redos, redo, saveDo }

    // Provide this bundle to all child components (Buttons, Toolbars, etc.)
    return <UndoRedoContext.Provider value={rf}>{children}</UndoRedoContext.Provider>
}
// #endregion


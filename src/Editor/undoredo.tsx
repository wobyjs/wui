import { useOnClickOutside, useSelection } from '@woby/use'
import { $, $$, useEffect, JSX, useMemo, Observable, createContext, useContext, setRef, customElement, defaults } from 'woby'

// 1. CREATE THE EDITOR DATA STORE
// createContext: Creates a "global" storage box so we don't have to pass props everywhere.
// <Observable<HTMLDivElement>>: TypeScript definition. This box will hold a "Reactive Reference" to the actual <div> of the editor.
export const EditorContext = createContext<Observable<HTMLDivElement>>()

// 2. CREATE A SHORTCUT (HOOK)
// Instead of importing 'useContext' and 'EditorContext' in every file, components just call 'useEditor()'.
// It returns the current Editor <div> so buttons can modify it.
export const useEditor = () => useContext(EditorContext)

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
 * A Provider component that manages the history (undo/redo) for a contentEditable editor.
 * It must be placed inside an EditorContext.Provider.
 */
// #region Undo Redo
export const UndoRedo = ({ children, editor }: { children: JSX.Children, editor?: Observable<HTMLDivElement> }) => {
    // Local reactive state for the history stacks
    const undos = $([] as string[])
    const redos = $([] as string[])
    const isInitialized = $(false)

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
            const initialContent = currentEditor.innerHTML
            undos([initialContent]) // innerHTML should always be a string
            isInitialized(true) // set observable
        }
    }) // No dependency array, Woby will auto-track $$(editor) and $$(isInitialized)
    // #endregion


    // #region saveDO
    /**
     * saveDo: The "Snapshot" function.
     * Call this after any formatting change / new action (bold, indent, etc.) or significant typing.
     */
    const saveDo = () => {
        // 1. Unwrap the observable
        const el = $$(activeEditor)

        if (typeof el === 'string' || !el || !(el instanceof Node)) {
            console.warn("🛑 SKIP: Waiting for valid DOM Node...", el)
            return
        }

        // 2. Safely cast to HTMLElement since we passed the Node check
        const element = el as HTMLElement;
        const currentContent = element.innerHTML
        const u = $$(undos)

        // 3. Initialization Logic
        if (!$$(isInitialized)) {
            undos([currentContent])
            isInitialized(true)
            return
        }

        // 4. Check for changes
        const last = u.length ? u[u.length - 1] : ""
        if (last !== currentContent) {
            undos([...u, currentContent])
            redos([])
            // console.log("[saveDo] ✅ Change detected. Saving to history.", currentContent)
            // console.log("[saveDo] 🔹", { "undos": $$(undos).length, "redos": $$(redos).length })
            // console.log("[saveDo] undos", $$(undos))
        }
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
        $$(activeEditor).innerHTML = stateToRestore
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
            $$(activeEditor).innerHTML = contentToRestoreAndMoveToUndo
        }
    }
    // #endregion

    // Bundle the state and functions together
    const rf = { undos, undo, redos, redo, saveDo }

    // Provide this bundle to all child components (Buttons, Toolbars, etc.)
    return <UndoRedoContext.Provider value={rf}>{children}</UndoRedoContext.Provider>
}
// #endregion


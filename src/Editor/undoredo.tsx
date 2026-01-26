import { useOnClickOutside, useSelection } from '@woby/use'
import { $, $$, useEffect, JSX, useMemo, Observable, createContext, useContext, setRef } from 'woby'

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
export const UndoRedo = ({ children }: { children: JSX.Children }) => {
    // Local reactive state for the history stacks
    const undos = $([] as string[])
    const redos = $([] as string[])

    // Grab the editor reference from the parent EditorContext
    const editor = useEditor() // editor is Observable<HTMLDivElement>

    // Flag to ensure we only capture the 'initial state' once
    const isInitialized = $(false) // isInitialized is Observable<boolean>

    /**
     * Effect: Runs automatically when the component mounts or dependencies change.
     * It captures the very first state of the editor (e.g., the "Lorem Ipsum" text).
     */
    // #region initialize-editor-content
    useEffect(() => {
        const currentEditor = $$(editor) // unwrap
        // Initialize only if editor is available and not already initialized
        if (currentEditor && !$$(isInitialized)) { // unwrap
            const initialContent = currentEditor.innerHTML
            undos([initialContent]) // innerHTML should always be a string
            isInitialized(true) // set observable
        }
    }) // No dependency array, Woby will auto-track $$(editor) and $$(isInitialized)
    // #endregion

    /**
     * saveDo: The "Snapshot" function.
     * Call this after any formatting change / new action (bold, indent, etc.) or significant typing.
     */
    // #region saveDO (debug)
    const saveDo = () => {
        const currentEditorInstance: HTMLDivElement = $$(editor)

        // console.log("[saveDo] ", { "isInitialized": $$(isInitialized), "currentEditorInstance": currentEditorInstance, "currentEditor.innerHTML (type)": typeof currentEditorInstance.innerHTML });
        console.log("[saveDo] currentEditorInstance: ", {
            "currentEditorInstance": currentEditorInstance,
            "innerHTML": currentEditorInstance.innerHTML,
            "innerText": currentEditorInstance.innerText,
            "outerHTML": currentEditorInstance.outerHTML,
            "outerText": currentEditorInstance.outerText,
        });


        // ✅ Must be initialized AND must be a real element with string innerHTML
        if (!$$(isInitialized) || !currentEditorInstance || typeof currentEditorInstance.innerHTML != "string") {
            console.log("[saveDo] SKIP (not ready / not element)", {
                // isInitialized: $$(isInitialized),
                editorType: typeof currentEditorInstance,
                // editorValue: currentEditorInstance,
                innerHTMLType: typeof currentEditorInstance?.innerHTML,
            })
            return
        }

        const currentContent: string = currentEditorInstance.innerHTML
        const u = $$(undos)
        const last = u.length ? u[u.length - 1] : ""

        if (last === currentContent) {
            console.log("[saveDo] SKIP (duplicate)", {
                undosLen: u.length,
                preview: currentContent.slice(0, 120),
            })
            return
        }

        const newUndos = [...u, currentContent]
        undos(newUndos)
        redos([])

        console.log("[saveDo] ✅ SAVED", {
            from: u.length,
            to: newUndos.length,
            lastPreview: last.slice(0, 80),
            newPreview: currentContent.slice(0, 80),
        })

        // ✅ Show undo stack
        console.table(
            newUndos.map((html, i) => ({
                i,
                len: String(html).length,
                preview: String(html).replace(/\s+/g, " ").trim().slice(0, 100),
            }))
        )

    }
    // #endregion


    // #region original saveDo
    // const saveDo = () => { // Renamed unredo parameter for clarity as it's always undos here
    //     const currentEditorInstance = $$(editor) // Get the editor instance once
    //     // Ensure editor is initialized and available before saving state
    //         return
    //     }
    //     const currentContent = currentEditorInstance.innerHTML // Use the obtained instance
    //     const u = $$(undos)

    //     // If last saved state is the same as current, do nothing
    //     if (u.length > 0 && u[u.length - 1] === currentContent) {
    //         return
    //     }

    //     const newUndos = [...u, currentContent]
    //     undos(newUndos)
    //     redos([]) // New action clears redo stack
    // }
    // #endregion

    /**
     * undo: Reverts to the previous HTML snapshot.
     */
    // #region undo
    const undo = () => {
        const u = $$(undos)
        const r = $$(redos)

        // If there's only the initial state (or fewer, though should not happen if initialized)
        // or editor is not available, can't undo.
        if (u.length <= 1 || !$$(editor)) {
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
        $$(editor).innerHTML = stateToRestore
    }
    // #endregion

    /**
     * redo: Restores a snapshot that was previously undone.
     */
    // #region redo
    const redo = () => {
        const u = $$(undos)
        const r = $$(redos)

        if (r.length === 0 || !$$(editor)) {
            return
        }

        const contentToRestoreAndMoveToUndo = r.pop() // Removes last element and returns it

        redos([...r]) // Update redos stack (already modified by pop)

        if (contentToRestoreAndMoveToUndo !== undefined) { // Ensure it's not undefined
            const newUndos = [...u, contentToRestoreAndMoveToUndo]
            undos(newUndos)
            $$(editor).innerHTML = contentToRestoreAndMoveToUndo
        }
    }
    // #endregion

    // Bundle the state and functions together
    const rf = { undos, undo, redos, redo, saveDo }

    // Provide this bundle to all child components (Buttons, Toolbars, etc.)
    return <UndoRedoContext.Provider value={rf}>{children}</UndoRedoContext.Provider>
}

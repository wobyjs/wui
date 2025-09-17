import { useOnClickOutside, useSelection } from '@woby/use'
import { $, $$, useEffect, JSX, useMemo, Observable, createContext, useContext, setRef } from 'woby'

export const EditorContext = createContext<Observable<HTMLDivElement>>()
export const useEditor = () => useContext(EditorContext)
export const UndoRedoContext = createContext<{ undos: Observable<string[]>, undo: () => void, redos: Observable<string[]>, redo: () => void, saveDo: () => void }>()
export const useUndoRedo = () => useContext(UndoRedoContext)

export type UndoRedoType = {
    undos: Observable<string[]>,
    undo: () => void,
    redos: Observable<string[]>,
    redo: () => void,
    saveDo: () => void,
}

export const UndoRedo = ({ children }: { children: JSX.Children }) => {
    const undos = $([] as string[])
    const redos = $([] as string[])
    const editor = useEditor() // editor is Observable<HTMLDivElement>
    const isInitialized = $(false) // isInitialized is Observable<boolean>

    useEffect(() => {
        const currentEditor = $$(editor) // unwrap
        // Initialize only if editor is available and not already initialized
        if (currentEditor && !$$(isInitialized)) { // unwrap
            const initialContent = currentEditor.innerHTML
            undos([initialContent]) // innerHTML should always be a string
            isInitialized(true) // set observable
        }
    }) // No dependency array, Woby will auto-track $$(editor) and $$(isInitialized)

    // Called after a new action (typing, indent, etc.)
    const saveDo = () => { // Renamed unredo parameter for clarity as it's always undos here
        const currentEditorInstance = $$(editor) // Get the editor instance once
        // Ensure editor is initialized and available before saving state
        if (!$$(isInitialized) || !currentEditorInstance) {
            return
        }
        const currentContent = currentEditorInstance.innerHTML // Use the obtained instance
        const u = $$(undos)

        // If last saved state is the same as current, do nothing
        if (u.length > 0 && u[u.length - 1] === currentContent) {
            return
        }

        const newUndos = [...u, currentContent]
        undos(newUndos)
        redos([]) // New action clears redo stack
    }

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

    const rf = { undos, undo, redos, redo, saveDo }
    return <UndoRedoContext.Provider value={rf}>{children}</UndoRedoContext.Provider>
}

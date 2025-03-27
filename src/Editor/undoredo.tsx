import { useOnClickOutside, useSelection } from 'use-woby'
import { $, $$, useEffect, JSX, useMemo, Observable, createContext, useContext } from 'woby'

export const EditorContext = createContext<Observable<HTMLDivElement>>()
export const useEditor = () => useContext(EditorContext)
export const UndoRedoContext = createContext<{ undos: Observable<string[]>, undo: () => void, redos: Observable<string[]>, redo: () => void, saveDo: (unredo: Observable<string[]>) => void }>()
export const useUndoRedo = () => useContext(UndoRedoContext)

export const UndoRedo = ({ children }: { children: JSX.Children }) => {
    const undos = $([] as string[]) // Initialize history with initial content
    const redos = $([] as string[])

    const editor = useEditor()

    const saveDo = (unredo: Observable<string[]>) => {
        const currentContent = $$(editor)?.innerHTML || ''
        const h = $$(unredo)

        if (h[h.length - 1] === currentContent)
            return

        // If history index is not at the latest point, truncate history
        h.push(currentContent)

        unredo([...h])
    }

    const undo = () => {
        const u = $$(undos)
        const r = $$(redos)
        const c = u.pop()

        if (!c || !$$(editor))
            return

        saveDo(redos)
        $$(editor).innerHTML = c
    }

    const redo = () => {
        const u = $$(undos)
        const r = $$(redos)

        const c = r.pop()

        if (!c || !$$(editor))
            return

        saveDo(undos)
        $$(editor).innerHTML = c
    }

    return <UndoRedoContext.Provider value={{ undos, undo, redos, redo, saveDo }}>{children}</UndoRedoContext.Provider>
}


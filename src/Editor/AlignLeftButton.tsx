import { Observable, $$ } from 'woby'
import { Button, variant } from '../Button'
import AlignLeft from '../icons/align_left'
import { useEditor } from './undoredo' // Removed useUndoRedo
import { findBlockParent, range } from './utils'



export const applyTextAlign = (alignment: 'left' | 'center' | 'right', editor: Observable<HTMLDivElement>) => {
    const r = $$(range)

    let parentElement = r.commonAncestorContainer as HTMLElement
    if (parentElement.nodeType === 3)
        parentElement = parentElement.parentElement as HTMLElement

    if (!parentElement) return

    const blockElement = findBlockParent(parentElement, editor)
    if (blockElement)
        blockElement.style.textAlign = alignment
    else
        if ($$(editor)) $$(editor).style.textAlign = alignment
}


export const AlignLeftButton = () => {
    // const { undos, saveDo } = useUndoRedo() // Removed
    const editor = useEditor()

    return <Button class={variant.outlined} onClick={() => {
        // saveDo(undos) // Removed: MutationObserver in Editor.tsx should now handle this

        applyTextAlign('left', editor)
    }} title="Align Left"><AlignLeft /></Button>
}

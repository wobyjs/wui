import { Button, variant } from '../Button'
import Bold from '../icons/bold'
import { applyStyle } from './utils'
import { useEditor, useUndoRedo } from './undoredo'

export const BoldButton = () => {
    const { undos, saveDo } = useUndoRedo()

    return <Button class={variant.outlined} onClick={() => {
        saveDo(undos)

        applyStyle((element) => {
            const p = window.getComputedStyle(element?.parentElement)
            const before = window.getComputedStyle(element)
            element.style.fontWeight = before.fontWeight === 'bold' || before.fontWeight === '700' ? 'normal' : 'bold'
            const after = window.getComputedStyle(element)
            if (p.fontWeight === after.fontWeight)
                element.style.fontWeight = ''
        })
    }} title="Bold"><Bold /></Button>
}

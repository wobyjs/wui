import { Button, variant } from '../Button'
import Italic from '../icons/italic'
import { useEditor, useUndoRedo } from './undoredo'
import { applyStyle } from './utils'

export const ItalicButton = () => {
    const { undos, saveDo } = useUndoRedo()

    return <Button class={variant.outlined} onClick={() => {
        saveDo(undos)

        applyStyle((element) => {
            const p = window.getComputedStyle(element?.parentElement)
            const before = window.getComputedStyle(element)
            element.style.fontStyle = before.fontStyle === 'italic' ? 'normal' : 'italic'
            const after = window.getComputedStyle(element)
            if (p.fontStyle === after.fontStyle)
                element.style.fontStyle = ''
        })
    }} title="Italic"><Italic /></Button>
}

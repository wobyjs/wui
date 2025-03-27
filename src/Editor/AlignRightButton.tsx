import { Button, variant } from '../Button'
import AlignRight from '../icons/align_right'
import { useEditor, useUndoRedo } from './undoredo'
import { applyTextAlign } from './AlignLeftButton'

export const AlignRightButton = () => {
    const { undos, saveDo } = useUndoRedo()
    const editor = useEditor()

    return <Button class={variant.outlined} onClick={() => {
        saveDo(undos)

        applyTextAlign('right', editor)
    }} title="Align Right"><AlignRight /></Button>
}

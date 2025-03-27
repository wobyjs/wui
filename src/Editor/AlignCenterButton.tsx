import { Button, variant } from '../Button'
import AlignCenter from '../icons/align_center'
import { useEditor, useUndoRedo } from './undoredo'
import { applyTextAlign } from './AlignLeftButton'

export const AlignCenterButton = () => {
    const { undos, saveDo } = useUndoRedo()
    const editor = useEditor()

    return <Button class={variant.outlined} onClick={() => {
        saveDo(undos)

        applyTextAlign('center', editor)
    }} title="Align Center"><AlignCenter /></Button>
}

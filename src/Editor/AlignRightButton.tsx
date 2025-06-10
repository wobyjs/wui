import { Button, variant } from '../Button'
import AlignRight from '../icons/align_right'
import { useEditor } from './undoredo' // Removed useUndoRedo
import { applyTextAlign } from './AlignLeftButton'

export const AlignRightButton = () => {
    // const { undos, saveDo } = useUndoRedo() // Removed
    const editor = useEditor()

    return <Button class={variant.outlined} onClick={() => {
        // saveDo(undos) // Removed: MutationObserver in Editor.tsx should now handle this

        applyTextAlign('right', editor)
    }} title="Align Right"><AlignRight /></Button>
}

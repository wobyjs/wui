import { Button } from '../Button'
import AlignCenter from '../icons/align_center'
import { useEditor } from './undoredo' // Removed useUndoRedo
import { applyTextAlign } from './AlignLeftButton'

export const AlignCenterButton = () => {
    // const { undos, saveDo } = useUndoRedo() // Removed
    const editor = useEditor()

    return <Button buttonType='outlined' onClick={() => {
        // saveDo(undos) // Removed: MutationObserver in Editor.tsx should now handle this

        applyTextAlign('center', editor)
    }} title="Align Center"><AlignCenter /></Button>
}

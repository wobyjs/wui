/** @jsxImportSource woby */
import { $ } from 'woby'
import { AlignCenterButton } from '../../src/Editor/AlignCenterButton'
import { EditorContext, UndoRedo } from '../../src/Editor/undoredo'


const AlignCenterButtonDemo = () => {
    const editorRef = $({} as HTMLDivElement)
    return <>
        <EditorContext.Provider value={editorRef}>
            <UndoRedo>
                <div class="mb-4">
                    <div class="flex gap-4 items-center my-2 border border-gray-300 rounded p-4">
                        <AlignCenterButton />
                    </div>
                    <div contentEditable class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <p>Select this text and try the center alignment buttons below!</p>
                        <p>You can align center.</p>
                    </div>
                </div>
            </UndoRedo>
        </EditorContext.Provider>
    </>
}

export {
    AlignCenterButtonDemo,
}
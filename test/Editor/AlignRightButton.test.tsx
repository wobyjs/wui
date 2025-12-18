/** @jsxImportSource woby */
import { $ } from 'woby'
import { AlignRightButton } from '../../src/Editor/AlignRightButton'
import { EditorContext, UndoRedo } from '../../src/Editor/undoredo'


const AlignRightButtonDemo = () => {
    const editorRef = $({} as HTMLDivElement)
    return <>
        <EditorContext.Provider value={editorRef}>
            <UndoRedo>
                <div class="mb-4">
                    <div class="flex gap-4 items-center my-2 border border-gray-300 rounded p-4">
                        <AlignRightButton />
                    </div>
                    <div contentEditable class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left">
                        <p>Select this text and try the Align Right Button!</p>
                        <p>You can make text right or not.</p>
                    </div>
                </div>
            </UndoRedo>
        </EditorContext.Provider>
    </>
}

export {
    AlignRightButtonDemo,
}
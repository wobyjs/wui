/** @jsxImportSource woby */
import { $ } from 'woby'
import { AlignLeftButton } from '../../src/Editor/AlignLeftButton'
import { EditorContext, UndoRedo } from '../../src/Editor/undoredo'


const AlignLeftButtonDemo = () => {
    const editorRef = $({} as HTMLDivElement)
    return <>
        <EditorContext.Provider value={editorRef}>
            <UndoRedo>
                <div class="mb-4">
                    <div class="flex gap-4 items-center my-2 border border-gray-300 rounded p-4">
                        <AlignLeftButton />
                    </div>
                    <div contentEditable class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right">
                        <p>Select this text and try the Align Left Button!</p>
                        <p>You can make text left or not.</p>
                    </div>
                </div>
            </UndoRedo>
        </EditorContext.Provider>
    </>
}

export {
    AlignLeftButtonDemo,
}
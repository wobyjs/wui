/** @jsxImportSource woby */
import { $ } from 'woby'
import { ListButton } from '../../src/Editor/List'
import { EditorContext, UndoRedo } from '../../src/Editor/undoredo'


const ListButtonDemo = () => {
    const editorRef = $({} as HTMLDivElement)
    return <>
        <EditorContext.Provider value={editorRef}>
            <UndoRedo>
                <div class="mb-4">
                    <div class="flex gap-4 items-center my-2 border border-gray-300 rounded p-4">
                        <ListButton mode="bullet" />
                        <ListButton mode="number" />
                    </div>
                    <div
                        ref={editorRef}
                        contentEditable
                        class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <p>Select this text and try the List Buttons above!</p>
                        <p>You can create bullet lists or numbered lists.</p>
                    </div>
                </div>
            </UndoRedo>
        </EditorContext.Provider>
    </>
}



export {
    ListButtonDemo,
}
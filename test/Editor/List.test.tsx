/** @jsxImportSource woby */
import { $ } from 'woby'
import { ListButton } from '../../src/Editor/List'
import { EditorContext, UndoRedo } from '../../src/Editor/undoredo'


const ListButtonDemo = () => {
    // const editorRef = $({} as HTMLDivElement)
    const editorRef = $(null as HTMLDivElement | null)

    return <>
        <EditorContext.Provider value={editorRef}>
            {/* <UndoRedo> */}
            <div class="mb-4">
                <div class="flex gap-4 items-center my-2 border border-gray-300 rounded p-4">
                    <ListButton mode="bullet" class="text-black" />
                    <ListButton mode="number" class="text-black" />
                </div>
                <div
                    contentEditable
                    class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <p>Try selecting this text and click the List Buttons above!</p>
                    <p>You can transform text into bullet lists or numbered lists.</p>
                    <p>Test the functionality by highlighting any paragraph and clicking either button.</p>
                </div>
            </div>
            {/* </UndoRedo> */}
        </EditorContext.Provider>
    </>
}



export {
    ListButtonDemo,
}
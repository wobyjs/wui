/** @jsxImportSource woby */
import { $ } from 'woby'
import { UnderlineButton } from '../../src/Editor/UnderlineButton'
import { EditorContext, UndoRedo } from '../../src/Editor/undoredo'

const UnderlineButtonDemo = () => {
    const editorRef = $({} as HTMLDivElement)
    return <>
        <EditorContext.Provider value={editorRef}>
            <UndoRedo>
                <div class="mb-4">
                    <div class="flex gap-4 items-center my-2 border border-gray-300 rounded p-4">
                        Underline Button: <UnderlineButton cls="text-black" />
                    </div>
                    <div contentEditable class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <p>Select this text and try the Underline Buttons below!</p>
                        <p>You can make text bold or not.</p>
                    </div>
                </div>
            </UndoRedo>
        </EditorContext.Provider>
    </>
}




export {
    UnderlineButtonDemo,
}
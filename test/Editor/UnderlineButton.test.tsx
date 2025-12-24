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
                        <p>Select this text and try the Underline button above!</p>
                        <p>You can underline text or remove underline formatting.</p>
                        <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</p>
                    </div>
                </div>
            </UndoRedo>
        </EditorContext.Provider>
    </>
}




export {
    UnderlineButtonDemo,
}
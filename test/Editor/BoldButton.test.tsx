/** @jsxImportSource woby */
import { $ } from 'woby'
import { BoldButton } from '../../src/Editor/BoldButton'

import { EditorContext, UndoRedo } from '../../src/Editor/undoredo'

const BoldButtonDemo = () => {
    const editorRef = $({} as HTMLDivElement)
    return <>
        <EditorContext.Provider value={editorRef}>
            {/* <UndoRedo> */}
            <div class="mb-4">
                <div class="flex gap-4 items-center my-2 border border-gray-300 rounded p-4">
                    Bold Button: <BoldButton class="text-black" />
                </div>
                <div contentEditable class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <p>Select this text and try the Bold Buttons below!</p>
                    <p>You can make text bold or not.</p>
                    <br />
                    <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</p>
                </div>

            </div>
            {/* </UndoRedo> */}
        </EditorContext.Provider>
    </>
}





export {
    BoldButtonDemo,
}
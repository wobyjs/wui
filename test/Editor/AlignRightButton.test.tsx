/** @jsxImportSource woby */
import { $ } from 'woby'
import { AlignRightButton } from '../../src/Editor/AlignRightButton'
import { EditorContext, UndoRedo } from '../../src/Editor/undoredo'


const AlignRightButtonDemo = () => {
    // const editorRef = $({} as HTMLDivElement)
    const editorRef = $(null as HTMLDivElement | null)

    return <>
        <EditorContext.Provider value={editorRef}>
            {/* <UndoRedo> */}
            <div class="mb-4">
                <div class="flex gap-4 items-center my-2 border border-gray-300 rounded p-4">
                    <AlignRightButton />
                </div>
                <div contentEditable class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left">
                    <p>Select this text and try the Align Right Button!</p>
                    <p>You can make text right or not.</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</p>
                </div>
            </div>
            {/* </UndoRedo> */}
        </EditorContext.Provider>
    </>
}

export {
    AlignRightButtonDemo,
}
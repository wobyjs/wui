import { $ } from 'woby'
import { AlignButton } from '../../src/Editor/AlignButton'
import { EditorContext, UndoRedo } from '../../src/Editor/undoredo'

const AlignButtonDemo = () => {
    const editorRef = $(null as HTMLDivElement | null)
    return <>
        <EditorContext.Provider value={editorRef}>
            {/* <UndoRedo> */}
            <div class="mb-4">
                <p class="m-2 ">Disabled Button</p>
                <div class="flex gap-4 items-center my-2 border border-gray-300 rounded p-4">
                    <AlignButton mode="left" disabled />
                    <AlignButton mode="center" disabled />
                    <AlignButton mode="right" disabled />
                    <AlignButton mode="justify" disabled />
                </div>
                <p class="m-2 ">Enabled Button</p>
                <div class="flex gap-4 items-center my-2 border border-gray-300 rounded p-4">
                    <AlignButton mode="left" cls="text-black" />
                    <AlignButton mode="center" cls="text-black" />
                    <AlignButton mode="right" cls="text-black" />
                    <AlignButton mode="justify" cls="text-black" />
                </div>
                <div contentEditable class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <p>Select this text and try the alignment buttons below!</p>
                    <p>You can align left, center, right or justify text.</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</p>
                </div>

            </div>
            {/* </UndoRedo> */}
        </EditorContext.Provider>
    </>
}

export {
    AlignButtonDemo
}

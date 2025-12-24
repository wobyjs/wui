/** @jsxImportSource woby */
import { $ } from 'woby'
import { EditorContext, UndoRedo } from '../../src/Editor/undoredo'
import { TextBackgroundColorPicker } from '../../src/Editor/TextBackgroundColorPicker'


const Demo = () => {
    // const editorRef = $({} as HTMLDivElement)
    const editorRef = $(null as HTMLDivElement | null)

    return <>
        <EditorContext.Provider value={editorRef}>
            {/* <UndoRedo> */}
            <div class="mb-4">
                <div class="flex gap-4 items-center my-2 border border-gray-300 rounded p-4">
                    <TextBackgroundColorPicker />
                </div>
                <div
                    contentEditable
                    class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <p>Select this text and try the text background color picker above!</p>
                    <p>You can apply different background colors to your text.</p>
                    <br />
                    <p>Try different colors and see how they look!</p>
                </div>
            </div>
            {/* </UndoRedo> */}
        </EditorContext.Provider>
    </>
}



export {
    Demo
}
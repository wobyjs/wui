/** @jsxImportSource woby */
import { $ } from 'woby'
import { EditorContext, UndoRedo } from '../../src/Editor/undoredo'
import { TextColorPicker } from '../../src/Editor/TextColorPicker'


const Demo = () => {
    // const editorRef = $({} as HTMLDivElement)
    const editorRef = $(null as HTMLDivElement | null)

    return <>
        <EditorContext.Provider value={editorRef}>
            {/* <UndoRedo> */}
            <div class="mb-4">
                <div class="flex gap-4 items-center my-2 border border-gray-300 rounded p-4">
                    <TextColorPicker />
                </div>
                <div
                    contentEditable
                    class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <p>Select this text and try the Text Color Picker!</p>
                    <p>You can change the color of your text.</p>
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
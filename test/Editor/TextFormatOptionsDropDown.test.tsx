/** @jsxImportSource woby */
import { $ } from 'woby'
import { TextFormatOptionsDropDown } from '../../src/Editor/TextFormatOptionsDropDown'
import { EditorContext, UndoRedo } from '../../src/Editor/undoredo'



const TextFormatOptionsDropDownDemo = () => {
    // const editorRef = $({} as HTMLDivElement)
    const editorRef = $(null as HTMLDivElement | null)

    return <>
        <EditorContext.Provider value={editorRef}>
            {/* <UndoRedo> */}
            <div class="mb-4">
                <div class="flex gap-4 items-center my-2 border border-gray-300 rounded p-4">
                    <TextFormatOptionsDropDown />
                </div>
                <div contentEditable class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <p>Try selecting this text and experiment with the text format options dropdown above!</p>
                    <p>You can apply various formatting styles including different fonts, sizes, and colors to
                        your selected text.</p>
                    <p>This interactive editor allows you to customize your content with ease.</p>
                </div>
            </div>
            {/* </UndoRedo> */}
        </EditorContext.Provider>
    </>
}

export {
    TextFormatOptionsDropDownDemo,
}
/** @jsxImportSource woby */
import { $ } from 'woby'
import { TextFormatDropDown } from '../../src/Editor/TextFormatDropDown'
import { EditorContext, UndoRedo } from '../../src/Editor/undoredo'



const TextFormatOptionsDropDownDemo = () => {
    const editorRef = $({} as HTMLDivElement)
    // const editorRef = $(null as HTMLDivElement | null)


    return <>
        <EditorContext.Provider value={editorRef}>
            {/* <UndoRedo> */}
            <div class="mb-4">
                <div class="flex gap-4 items-center my-2 border border-gray-300 rounded p-4">
                    <TextFormatDropDown />
                </div>
                <div contentEditable class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <p>Select this text to explore the text formatting options in the dropdown menu above!</p>
                    <p>Experience various text format for your selected content.</p>
                    <br />
                    <p>This powerful editor provides flexible formatting capabilities to enhance your text.</p>
                </div>
            </div>
            {/* </UndoRedo> */}
        </EditorContext.Provider>
    </>
}

export {
    TextFormatOptionsDropDownDemo,
}
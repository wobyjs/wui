/** @jsxImportSource woby */
import { $ } from 'woby'
import { TextFormatOptionsDropDown } from '../../src/Editor/TextFormatOptionsDropDown'
import { EditorContext, UndoRedo } from '../../src/Editor/undoredo'



const TextFormatOptionsDropDownDemo = () => {
    const editorRef = $({} as HTMLDivElement)
    return <>
        <EditorContext.Provider value={editorRef}>
            <UndoRedo>
                <div class="mb-4">
                    <div class="flex gap-4 items-center my-2 border border-gray-300 rounded p-4">
                        <TextFormatOptionsDropDown />
                    </div>
                    <div contentEditable class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <p>Select this text and try the font family dropdown above!</p>
                        <p>Different fonts can be applied to your text selection.</p>
                    </div>

                </div>
            </UndoRedo>
        </EditorContext.Provider>
    </>
}

export {
    TextFormatOptionsDropDownDemo,
}
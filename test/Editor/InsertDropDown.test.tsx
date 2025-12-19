/** @jsxImportSource woby */
import { $ } from 'woby'
import { InsertDropDown } from '../../src/Editor/InsertDropDown'
import { EditorContext, UndoRedo } from '../../src/Editor/undoredo'


const InsertDropDownDemo = () => {
    const editorRef = $({} as HTMLDivElement)
    return <>
        <EditorContext.Provider value={editorRef}>
            <UndoRedo>
                <div class="mb-4">
                    <div class="flex gap-4 items-center my-2 border border-gray-300 rounded p-4">
                        <InsertDropDown />
                    </div>
                    <div
                        ref={editorRef}
                        contentEditable
                        class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <p>Click the Insert Dropdown above to add content!</p>
                        <p>You can insert various elements like tables, images, or other components.</p>
                        <p>Try selecting text and using the dropdown to enhance your content.</p>
                    </div>
                </div>
            </UndoRedo>
        </EditorContext.Provider>
    </>
}



export {
    InsertDropDownDemo,
}
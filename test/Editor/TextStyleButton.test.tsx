/** @jsxImportSource woby */

import { $ } from 'woby'
import { EditorContext, UndoRedo } from '../../src/Editor/undoredo'
import TextStyleButton from '../../src/Editor/TextStyleButton'


const TextStylesDemo = () => {
    const editorRef = $({} as HTMLDivElement)
    return (
        <EditorContext.Provider value={editorRef}>
            {/* <UndoRedo> */}
            <div class="mb-4">
                <div class="flex gap-4 items-center my-2 border border-gray-300 rounded p-4">
                    <TextStyleButton class="text-black" type="bold" />
                    <TextStyleButton class="text-black" type="italic" />
                    <TextStyleButton class="text-black" type="underline" />
                </div>
                <div contentEditable class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <p>Select this text and try the style buttons above!</p>
                    <p>You can make text <strong>bold</strong>, <em>italic</em>, or <u>underlined</u>.</p>
                    <br />
                    <p>Try selecting different parts of this text to test all formatting options.</p>
                </div>

            </div>
            {/* </UndoRedo> */}
        </EditorContext.Provider>
    )
}


export {
    TextStylesDemo,
}
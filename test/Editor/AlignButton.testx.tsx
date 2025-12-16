import { $ } from 'woby'
import { AlignButton } from '../../src/Editor/AlignButton'
import { EditorContext, UndoRedo } from '../../src/Editor/undoredo'

const DefaultAlignButton = () => {
    return <AlignButton />
}

const AlignLeftButton = () => {
    return <AlignButton contentAlign="start" />
}

const AlignCenterButton = () => {
    return <AlignButton contentAlign="center" />
}

const AlignRightButton = () => {
    return <AlignButton contentAlign="end" />
}

const DisableAlignButton = () => {
    return <AlignButton contentAlign="start" disabled />
}

const AlignButtonDemo = () => {
    const editorRef = $(null as HTMLDivElement | null)
    return <>
        <EditorContext.Provider value={editorRef}>
            <UndoRedo>
                <div class="mb-4">
                    <p class="m-2 ">Disabled Button</p>
                    <div class="flex gap-4 items-center my-2 border border-gray-300 rounded p-4">
                        <AlignButton contentAlign="start" disabled />
                        <AlignButton contentAlign="center" disabled />
                        <AlignButton contentAlign="end" disabled />
                    </div>
                    <p class="m-2 ">Enabled Button</p>
                    <div class="flex gap-4 items-center my-2 border border-gray-300 rounded p-4">
                        <AlignButton contentAlign="start" />
                        <AlignButton contentAlign="center" />
                        <AlignButton contentAlign="end" />
                    </div>
                    <div contentEditable class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <p>Select this text and try the alignment buttons below!</p>
                        <p>You can align start, center, or end.</p>
                    </div>

                </div>
            </UndoRedo>
        </EditorContext.Provider>
    </>
}

export {
    AlignButtonDemo
}
import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlString, JSX, Observable, ObservableMaybe } from 'woby'
import { Button } from '../Button'
import { EditorContext, useUndoRedo } from './undoredo'
import { useOnClickOutside } from '@woby/use'
import { range, getCurrentRange } from './utils' // Import getCurrentRange
import KeyboardDownArrow from '../icons/keyboard_down_arrow'
import Plus from '../icons/plus'

// Icons - placeholders, replace with actual SVGs or components
const HorizontalRuleIcon = () => <span>HR</span>
const ImageIcon = () => <span>Img</span>
const TableIcon = () => <span>Tbl</span>
const GifIcon = () => <span>GIF</span>
// ... other icons

// Helper to get shadow root selection for wui-editor
function getEditorSelection(): { selection: Selection | null, shadowRoot: ShadowRoot | null } {
    const editorHost = document.querySelector('wui-editor')
    const shadowRoot = editorHost?.shadowRoot || null
    const selection = shadowRoot ? shadowRoot.getSelection() : window.getSelection()
    return { selection, shadowRoot }
}

// #region Insert Actions
const execInsertHorizontalRule = () => {
    const { selection, shadowRoot } = getEditorSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)

    // Restore selection after potential focus loss
    selection.removeAllRanges()
    selection.addRange(range)

    const hrWithClasses = '<hr class="my-4 mx-auto border-gray-400" />'
    document.execCommand('insertHTML', false, hrWithClasses)
}

const execInsertImage = () => {
    const { selection, shadowRoot } = getEditorSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)

    const imageUrl = prompt('Enter image URL:')
    if (!imageUrl) return

    // Restore selection after prompt
    selection.removeAllRanges()
    selection.addRange(range)

    const imgHtml = `<img src="${imageUrl}" class="max-w-full h-auto my-2" />`
    document.execCommand('insertHTML', false, imgHtml)
}

const execInsertTable = () => {
    const { selection, shadowRoot } = getEditorSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)

    const rowsStr = prompt('Enter number of rows:', '2')
    if (rowsStr === null) return

    const colsStr = prompt('Enter number of columns:', '3')
    if (colsStr === null) return

    const rows = parseInt(rowsStr, 10)
    const cols = parseInt(colsStr, 10)

    if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
        alert('Invalid number of rows or columns.')
        return
    }

    // Restore selection after prompts
    selection.removeAllRanges()
    selection.addRange(range)

    // Build HTML String
    let tableHTML = '<table class="w-full border-collapse border border-gray-400 my-2"><tbody>'

    for (let i = 0; i < rows; i++) {
        tableHTML += '<tr>'
        for (let j = 0; j < cols; j++) {
            tableHTML += '<td class="border border-gray-300 p-2 min-w-[50px]">&nbsp;</td>'
        }
        tableHTML += '</tr>'
    }
    tableHTML += '</tbody></table><br>'

    document.execCommand('insertHTML', false, tableHTML)
}
// #endregion

const INSERT_OPTIONS = [
    { label: 'Horizontal Rule', action: execInsertHorizontalRule, icon: HorizontalRuleIcon },
    // { label: 'Page Break', action: () => console.log('Insert Page Break (TODO)'), icon: () => <span>PB</span> },
    { label: 'Image', action: execInsertImage, icon: ImageIcon },
    // { label: 'Inline Image', action: () => console.log('Insert Inline Image (TODO)'), icon: ImageIcon },
    { label: 'Table', action: execInsertTable, icon: TableIcon },
    // { label: 'GIF', action: () => console.log('Insert GIF (TODO)'), icon: GifIcon },
    // { label: 'Excalidraw', action: () => console.log('Insert Excalidraw (TODO)'), icon: () => <span>Ex</span> },
    // { label: 'Poll', action: () => console.log('Insert Poll (TODO)'), icon: () => <span>Poll</span> },
    // { label: 'Columns Layout', action: () => console.log('Insert Columns (TODO)'), icon: () => <span>Cols</span> },
    // { label: 'Equation', action: () => console.log('Insert Equation (TODO)'), icon: () => <span>Eq</span> },
    // { label: 'Sticky Note', action: () => console.log('Insert Sticky (TODO)'), icon: () => <span>Note</span> },
    // { label: 'Collapsible container', action: () => console.log('Insert Collapsible (TODO)'), icon: () => <span>Col</span> },
    // { label: 'X(Tweet)', action: () => console.log('Insert Tweet (TODO)'), icon: () => <span>X</span> },
    // { label: 'Youtube Video', action: () => console.log('Insert YouTube (TODO)'), icon: () => <span>YT</span> },
    // { label: 'Figma Document', action: () => console.log('Insert Figma (TODO)'), icon: () => <span>Fig</span> },
]

const def = () => ({
    cls: $(""),
    class: $(""),
    disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean>
})

const InsertDropDown = defaults(def, (props) => {

    const { cls, class: className, disabled, ...otherProps } = props

    const editor = $(EditorContext)
    // const { undos, saveDo } = useUndoRedo() // Removed as saveDo is handled by MutationObserver
    const isOpen = $(false)
    const dropdownRef = $<HTMLElement>(null)

    useOnClickOutside(dropdownRef as any, () => isOpen(false))

    const toggleDropdown = () => isOpen(!isOpen())

    const handleSelectOption = (action: () => void) => {
        if ($$(editor)) {
            // saveDo(undos) // Removed: MutationObserver in Editor.tsx should now handle this
            action()
            // $$(editor)?.focus() // Re-focus editor
        }
        isOpen(false)
    }

    const DropDownMenu = () => {
        return (
            <div
                class="origin-top-left absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 max-h-80 overflow-y-auto"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="insert-menu-button"
                onMouseDown={(e) => {
                    e.stopPropagation() // Prevents the menu from closing immediately
                    e.preventDefault()  // Prevents the editor from losing focus
                }}
            >
                <div class="py-1" role="none">
                    {INSERT_OPTIONS.map(opt => (
                        <Button
                            type='outlined'
                            cls="w-full flex items-center text-gray-700 px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900"
                            role="menuitem"
                            onClick={(e) => { e.preventDefault(); handleSelectOption(opt.action) }}
                        >
                            <span class="w-1/5 flex justify-center shrink-0">
                                <opt.icon />
                            </span>

                            <span class="w-4/5 text-left truncate">
                                {opt.label}
                            </span>
                        </Button>
                    ))}
                </div>
            </div>
        )
    }
    const BASE_BTN = "size-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"

    return (
        <div class="relative inline-block text-left" ref={dropdownRef}>
            <div class="flex">
                <Button
                    type='outlined'
                    cls={() => [BASE_BTN]}
                    onClick={toggleDropdown}
                    title="Insert content"
                    disabled={disabled}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                >
                    <span class="text-center truncate">
                        <Plus class="size-5" />
                    </span>
                </Button>
                <Button
                    type='outlined'
                    class="size-full inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 cursor-pointer px-2"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleDropdown(); }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    title="Toggle dropdown"
                    disabled={disabled}
                >
                    <KeyboardDownArrow class="h-5 w-5" />
                </Button>
            </div>

            {() => $$(isOpen) && (
                <DropDownMenu />
            )}
        </div>
    )
})

export { InsertDropDown }

customElement('wui-insert-dropdown', InsertDropDown)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-insert-dropdown': ElementAttributes<typeof InsertDropDown>
        }
    }
}

export default InsertDropDown
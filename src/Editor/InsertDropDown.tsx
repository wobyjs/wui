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

// Re-implement or import insertImage and insertTable if they are not globally accessible
// For now, assuming they might be passed via context or props if needed, or re-implemented simply.

// #region Insert Actions
const execInsertHorizontalRule = () => {
    // document.execCommand('insertHorizontalRule', false)
    const hrWithClasses = '<hr class="my-4 mx-auto border-gray-400" />'
    document.execCommand('insertHTML', false, hrWithClasses)
}

const execInsertImage_ = () => {
    const r = getCurrentRange()
    if (!r) return
    const imageUrl = prompt('Enter image URL:')
    if (!imageUrl) return

    const imgElement = document.createElement('img')
    imgElement.src = imageUrl
    imgElement.style.maxWidth = '100%' // Basic styling
    r.deleteContents()
    r.insertNode(imgElement)
}

const execInsertImage = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)

    const imageUrl = prompt('Enter image URL:')
    if (!imageUrl) return

    selection.removeAllRanges()
    selection.addRange(range)

    const imgHtml = `<img src="${imageUrl}" class="max-w-full h-auto my-2" />`

    document.execCommand('insertHTML', false, imgHtml)
}

const execInsertTable_ = () => {
    const r = getCurrentRange()
    if (!r) return
    const rowsStr = prompt('Enter number of rows:', '2')
    const colsStr = prompt('Enter number of columns:', '3')

    if (!rowsStr || !colsStr) return
    const rows = parseInt(rowsStr, 10)
    const cols = parseInt(colsStr, 10)

    if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
        alert('Invalid number of rows or columns.')
        return
    }

    let tableHTML = '<table class="border border-collapse border-gray-400"><tbody>'
    for (let i = 0; i < rows; i++) {
        tableHTML += '<tr>'
        for (let j = 0; j < cols; j++) {
            tableHTML += '<td class="border border-gray-300 p-2">Cell</td>'
        }
        tableHTML += '</tr>'
    }
    tableHTML += '</tbody></table>'

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = tableHTML
    const tableNode = tempDiv.firstChild
    if (tableNode) {
        r.deleteContents()
        r.insertNode(tableNode)
    }
}

const execInsertTable = () => {
    // 1. Capture selection before Prompt steals focus
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)

    const rowsStr = prompt('Enter number of rows:', '2')
    // If user cancels, stop immediately
    if (rowsStr === null) return

    const colsStr = prompt('Enter number of columns:', '3')
    if (colsStr === null) return

    const rows = parseInt(rowsStr, 10)
    const cols = parseInt(colsStr, 10)

    if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
        alert('Invalid number of rows or columns.')
        return
    }

    // 2. Restore Selection
    // The prompts caused the editor to lose focus. We must restore it
    // so execCommand knows where to put the table.
    selection.removeAllRanges()
    selection.addRange(range)

    // 3. Build HTML String
    // Added 'w-full' to make the table expand to fit the editor
    let tableHTML = '<table class="w-full border-collapse border border-gray-400 my-2"><tbody>'

    for (let i = 0; i < rows; i++) {
        tableHTML += '<tr>'
        for (let j = 0; j < cols; j++) {
            // Added min-w-[50px] so empty cells are clickable/visible
            tableHTML += '<td class="border border-gray-300 p-2 min-w-[50px]">&nbsp;</td>'
        }
        tableHTML += '</tr>'
    }
    tableHTML += '</tbody></table><br>' // Add <br> so user can click/type after table

    // 4. Insert Safe HTML
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
    const dropdownRef = $<HTMLDivElement>(null)

    useOnClickOutside(dropdownRef, () => isOpen(false))

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
            <div>
                <Button
                    type='outlined'
                    cls={() => [BASE_BTN]}
                    onClick={toggleDropdown}
                    title="Insert content"
                    disabled={disabled}
                >
                    <span class="text-center truncate">
                        <Plus class="size-5" />
                    </span>
                    <span class="flex justify-end">
                        <KeyboardDownArrow class="-mr-1 ml-2 h-5 w-5" />
                    </span>
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
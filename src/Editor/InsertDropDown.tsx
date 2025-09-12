import { $, $$, JSX, Observable } from 'woby'
import { Button } from '../Button'
import { EditorContext, useUndoRedo } from './undoredo'
import { useOnClickOutside } from '@woby/use'
import { range, getCurrentRange } from './utils' // Import getCurrentRange

// Icons - placeholders, replace with actual SVGs or components
const HorizontalRuleIcon = () => <span>HR</span>
const ImageIcon = () => <span>Img</span>
const TableIcon = () => <span>Tbl</span>
const GifIcon = () => <span>GIF</span>
// ... other icons

// Re-implement or import insertImage and insertTable if they are not globally accessible
// For now, assuming they might be passed via context or props if needed, or re-implemented simply.

const execInsertHorizontalRule = () => {
    document.execCommand('insertHorizontalRule', false)
}

const execInsertImage = () => {
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

const execInsertTable = () => {
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


const insertOptions = [
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

export const InsertDropDown = () => {
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

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div>
                <Button
                    buttonType='outlined'
                    class={["p-2 h-8"]}
                    onClick={toggleDropdown}
                    title="Insert content"
                >
                    {/* Placeholder Icon for Insert */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Button>
            </div>

            {() => $$(isOpen) && (
                <div
                    className="origin-top-left absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 max-h-80 overflow-y-auto"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="insert-menu-button"
                >
                    <div className="py-1" role="none">
                        {insertOptions.map(opt => (
                            <a
                                href="#"
                                className="text-gray-700 group flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900"
                                role="menuitem"
                                onClick={(e) => { e.preventDefault(); handleSelectOption(opt.action) }}
                            >
                                <opt.icon />
                                <span className="ml-3">{opt.label}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlString, JSX, ObservableMaybe, useEffect, useContext, Observable, HtmlClass } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { EditorContext, useEditor } from './undoredo'
import { useOnClickOutside } from '@woby/use'
import KeyboardDownArrow from '../icons/keyboard_down_arrow'





// #region Helper Functions
const getCurrentBlockInfo = (root: HTMLElement, range: Range) => {
    let node: Node | null = range.commonAncestorContainer
    if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement
    }

    const blockTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'DIV']

    while (node && node !== root) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement
            if (blockTags.includes(el.tagName)) {
                return el
            }
        }
        node = node.parentNode
    }
    return null
}

const applyFormatBlock = (editor: HTMLDivElement, tag: string, className: string) => {
    const formatTag = `<${tag}>`
    document.execCommand('formatBlock', false, formatTag)

    const selection = window.getSelection()

    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        let node: Node | null = range.commonAncestorContainer
        if (node.nodeType === Node.TEXT_NODE) node = node.parentElement

        // Traverse up to find the tag we just requested
        while (node && node !== editor) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement
                if (el.tagName.toLowerCase() === tag.toLowerCase()) {
                    el.className = className
                    return
                }
            }
            node = node.parentNode
        }
    }
}
// #endregion

// Dropdown items configuration
export const FORMAT_OPTIONS = [
    { label: 'Normal', tag: 'p', hotkey: 'Ctrl+Alt+0', class: '' },
    { label: 'Heading 1', tag: 'h1', hotkey: 'Ctrl+Alt+1', class: 'text-3xl font-bold mb-4' },
    { label: 'Heading 2', tag: 'h2', hotkey: 'Ctrl+Alt+2', class: 'text-2xl font-semibold mb-3' },
    { label: 'Heading 3', tag: 'h3', hotkey: 'Ctrl+Alt+3', class: 'text-xl font-medium mb-2' },
    { label: 'Quote', tag: 'blockquote', hotkey: 'Ctrl+Alt+Q', class: 'text-[15px] text-[#65676b] ml-10 mr-0 mt-0 mb-2.5 pl-2 border-l-[#ced0d4] border-l-4 border-solid inline-block italic' },
    { label: 'Code Block', tag: 'pre', hotkey: 'Ctrl+Alt+C', class: 'bg-gray-100 p-2 rounded font-mono text-sm overflow-x-auto' },
]
type TextFormatOptions = "Normal" | "Heading 1" | "Heading 2" | "Heading 3" | "Quote" | "Code Block"

const def = () => ({
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
    selectedFormat: $("Normal", HtmlString) as Observable<TextFormatOptions>,
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
})

const TextFormatDropDown = defaults(def, (props) => {
    const { cls, class: cn, disabled, selectedFormat, buttonType: btnType, ...otherProps } = props

    const BASE_BTN = "size-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 cursor-pointer"

    // const editor = useContext(EditorContext)
    // const editor = $(EditorContext)
    const editor = useEditor()

    const isOpen = $(false)
    const dropdownRef = $<HTMLDivElement>(null)

    useOnClickOutside(dropdownRef, () => isOpen(false))

    const toggleDropdown = () => isOpen(!isOpen())

    const handleSelectFormat = (tag: string, label: TextFormatOptions, cls: string | undefined) => {

        const editorDiv = $$(editor)
        // alert("Editor: " + editorDiv)
        if (editorDiv) {
            selectedFormat(label)
            applyFormatBlock(editorDiv, tag, cls)
            isOpen(false)
            editorDiv.focus()
        }
        isOpen(false)
    }

    const handleApplyCurrent = (e: MouseEvent) => {
        e.preventDefault()

        // Get the string currently displayed (e.g., "Heading 1")
        const currentLabel = $$(selectedFormat)

        // Find the full config object
        const opt = FORMAT_OPTIONS.find(o => o.label === currentLabel)

        if (opt) {
            // Apply it
            const editorDiv = $$(editor)
            if (editorDiv) {
                applyFormatBlock(editorDiv, opt.tag, opt.class)
                editorDiv.focus()
            }
        }
    }

    // Handle Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const editorDiv = $$(editor)
            if (!editorDiv) return

            for (const opt of FORMAT_OPTIONS) {
                if (!opt.hotkey) continue
                const parts = opt.hotkey.split('+')
                const key = parts.pop()?.toUpperCase()
                const ctrl = parts.includes('Ctrl')
                const alt = parts.includes('Alt')
                const shift = parts.includes('Shift')

                if (
                    key && event.key.toUpperCase() === key &&
                    event.ctrlKey === ctrl && event.altKey === alt && event.shiftKey === shift
                ) {
                    const target = event.target as HTMLElement
                    const currentDropdownEl = $$(dropdownRef)

                    // Check if event is relevant to this editor
                    if (editorDiv.contains(target) || target === editorDiv || currentDropdownEl?.contains(target)) {
                        event.preventDefault()
                        applyFormatBlock(editorDiv, opt.tag, opt.class)
                        selectedFormat(opt.label as TextFormatOptions)
                        isOpen(false)
                        editorDiv.focus()
                        break
                    }
                }
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    })

    // Update Label based on Selection (Active State)
    useEffect(() => {
        const handleSelectionChange = () => {
            const editorDiv = $$(editor)
            if (!editorDiv || typeof editorDiv.contains !== 'function') return

            const selection = window.getSelection()
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)

                // Ensure selection is inside editor
                if (editorDiv.contains(range.commonAncestorContainer)) {
                    const blockInfo = getCurrentBlockInfo(editorDiv, range)

                    if (blockInfo) {
                        const matched = FORMAT_OPTIONS.find(opt => opt.tag.toLowerCase() === blockInfo.tagName.toLowerCase())
                        selectedFormat(matched ? matched.label as TextFormatOptions : 'Normal')
                    } else {
                        selectedFormat('Normal')
                    }
                }
            }
        }

        document.addEventListener('selectionchange', handleSelectionChange)
        document.addEventListener('mouseup', handleSelectionChange)
        document.addEventListener('keyup', handleSelectionChange)

        // Initial check
        handleSelectionChange()

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange)
            document.removeEventListener('mouseup', handleSelectionChange)
            document.removeEventListener('keyup', handleSelectionChange)
        }
    })

    const DropDownMenu = () => {
        return (
            <div
                class="origin-top-left absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 max-h-80 overflow-y-auto"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="menu-button"
                onMouseDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault() // Prevents editor blur when clicking scrollbar/padding
                }}
            >
                <div class="py-1" role="none">
                    {FORMAT_OPTIONS.map(opt => (
                        <Button
                            type='outlined'
                            // Button handles click and basic hover styles
                            cls="w-full block text-gray-700 px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                            role="menuitem"
                            onClick={(e) => { e.preventDefault(); handleSelectFormat(opt.tag, opt.label as TextFormatOptions, opt.class) }}
                        >
                            <div class="w-full flex items-center justify-between pointer-events-none">
                                <span class="text-left truncate">
                                    {opt.label}
                                </span>

                                <span class="text-xs text-right text-gray-500 shrink-0 ml-4">
                                    {opt.hotkey}
                                </span>
                            </div>
                        </Button>
                    ))}
                </div>
            </div>
        )
    }


    return (
        <div class={() => ["relative inline-block text-left", cls]} ref={dropdownRef}>
            <div>
                <Button
                    type={btnType}
                    // cls={() => [BASE_BTN]}
                    class={() => [
                        () => $$(cls) ? $$(cls) : BASE_BTN, cn,
                    ]}
                    onClick={handleApplyCurrent}
                    title="Text format"
                    {...otherProps}
                >
                    <span class="text-center truncate">
                        {() => $$(selectedFormat)}
                    </span>
                    <span class="flex justify-end">
                        <KeyboardDownArrow class="-mr-1 ml-2 h-5 w-5" onClick={toggleDropdown} />
                    </span>
                </Button>
            </div>

            {() => $$(isOpen) && (
                <DropDownMenu />
            )}
        </div>
    )
})

export { TextFormatDropDown }

customElement('wui-text-format-drop-down', TextFormatDropDown)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-text-format-drop-down': ElementAttributes<typeof TextFormatDropDown>
        }
    }
}

export default TextFormatDropDown

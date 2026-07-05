import { $, $$, customElement, defaults, ElementAttributes, HtmlClass, HtmlString, JSX, Observable, ObservableMaybe, useEffect } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { EditorContext, useEditor, useUndoRedo } from './undoredo'
import { useOnClickOutside } from '@woby/use'

import AlignCenter from '../icons/align_center'
import AlignLeft from '../icons/align_left'
import AlignRight from '../icons/align_right'
import AlignJustify from '../icons/align_justify'
import Indent from '../icons/indent'
import Outdent from '../icons/outdent'
import KeyboardDownArrow from '../icons/keyboard_down_arrow'
import { applyTextAlign } from './StyleEngine'
import { applyIndent as applyIndentStyle, applyListIndent } from './StyleEngine'
import { applyBlockCommandToSelectedImage } from './ImageActions'

// Icons - placeholders, replace with actual SVGs or components
const AlignLeftIcon = () => <AlignLeft class="size-5" />
const AlignCenterIcon = () => <AlignCenter class="size-5" />
const AlignRightIcon = () => <AlignRight class="size-5" />
const AlignJustifyIcon = () => <AlignJustify class="size-5" />
const OutdentIcon = () => <Outdent class="size-5" />
const IndentIcon = () => <Indent class="size-5" />

const applyAlignment = (command: string) => {
    // Check for selected image first - route to image handler
    if (command === 'justifyLeft') {
        if (applyBlockCommandToSelectedImage('align-left')) return
    } else if (command === 'justifyCenter') {
        if (applyBlockCommandToSelectedImage('align-center')) return
    } else if (command === 'justifyRight') {
        if (applyBlockCommandToSelectedImage('align-right')) return
    } else if (command === 'justifyFull') {
        if (applyBlockCommandToSelectedImage('align-justify')) return
    } else if (command === 'indent') {
        if (applyBlockCommandToSelectedImage('indent')) return
    } else if (command === 'outdent') {
        if (applyBlockCommandToSelectedImage('outdent')) return
    }

    // Map execCommand names to CSS values
    const alignMap: Record<string, string> = {
        'justifyLeft': 'left',
        'justifyCenter': 'center',
        'justifyRight': 'right',
        'justifyFull': 'justify'
    }

    if (alignMap[command]) {
        applyTextAlign(alignMap[command])
    } else if (command === 'indent' || command === 'outdent') {
        // For indent/outdent, check if inside list
        const editor = document.querySelector('wui-editor')
        const shadow = editor?.shadowRoot
        const sel = shadow?.getSelection()
        const range = sel?.getRangeAt(0)

        if (range) {
            let node = range.commonAncestorContainer
            while (node && node !== shadow) {
                if (node instanceof HTMLElement) {
                    const tag = node.tagName.toUpperCase()
                    if (tag === 'LI' || tag === 'UL' || tag === 'OL') {
                        // Use StyleEngine's applyListIndent for list items (ml-* classes)
                        applyListIndent(command === 'outdent', 20)
                        return
                    }
                }
                node = node.parentNode
            }
        }

        // Non-list: use StyleEngine
        applyIndentStyle(command === 'outdent', 20)
    }
}

interface AlignmentOptionItem {
    label: string
    hotkey: string
    action: () => void
    icon: () => JSX.Element
    type?: undefined // Ensure type is not 'divider'
}

interface DividerOptionItem {
    type: 'divider'
    // Ensure other properties are not present or are optional and undefined
    label?: undefined
    hotkey?: undefined
    action?: undefined
    icon?: undefined
}

type AlignmentOption = AlignmentOptionItem | DividerOptionItem

// Note: 'Start Align' and 'End Align' are context-dependent (LTR/RTL).
// For simplicity, mapping to Left/Right.
const alignmentOptions: AlignmentOption[] = [
    { label: 'Left Align', hotkey: 'Ctrl+Shift+L', action: () => applyAlignment('justifyLeft'), icon: AlignLeftIcon },
    { label: 'Center Align', hotkey: 'Ctrl+Shift+E', action: () => applyAlignment('justifyCenter'), icon: AlignCenterIcon },
    { label: 'Right Align', hotkey: 'Ctrl+Shift+R', action: () => applyAlignment('justifyRight'), icon: AlignRightIcon },
    { label: 'Justify Align', hotkey: 'Ctrl+Shift+J', action: () => applyAlignment('justifyFull'), icon: AlignJustifyIcon },
    { type: 'divider' },
    { label: 'Outdent', hotkey: 'Ctrl+[', action: () => applyAlignment('outdent'), icon: OutdentIcon },
    { label: 'Indent', hotkey: 'Ctrl+]', action: () => applyAlignment('indent'), icon: IndentIcon },
]

const def = () => ({
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    selectedFormat: $("Left Align", HtmlString) as Observable<string>,
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
})

const TextAlignDropDown = defaults(def, (props) => {

    const { cls, class: cn, selectedFormat, buttonType: btnType, ...otherProps } = props

    const editor = useEditor()
    const { saveDo } = useUndoRedo()
    const isOpen = $(false)
    const dropdownRef = $<HTMLElement>(null)

    const BASE_BTN = "size-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 cursor-pointer"

    useOnClickOutside(dropdownRef as any, () => { isOpen(false) })

    const toggleDropdown = () => isOpen(!isOpen())

    const handleSelectOption = (action: () => void) => {
        if ($$(editor)) {
            saveDo()
            action()
        }
        isOpen(false)
    }

    const handleApplyCurrent = (e: MouseEvent) => {
        e.preventDefault()

        const currentLabel = $$(selectedFormat)
        const opt = alignmentOptions.find(o => o.label === currentLabel)

        if (opt) {
            if ($$(editor)) {
                handleSelectOption(opt.action)
                $$(editor).focus()
            }
        }
    }

    const DropDownMenu = () => {
        return (
            <div
                class="origin-top-left absolute left-0 mt-2 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="alignment-menu-button"
            >
                <div class="py-1" role="none">
                    {alignmentOptions.map((opt, index) => {
                        if (opt.type === 'divider') {
                            return <div key={`divider-${index}`} class="border-t border-gray-200 my-1 mx-2" />
                        }
                        // TypeScript should infer opt as AlignmentOptionItem here due to the check above
                        const item = opt as AlignmentOptionItem
                        return (
                            <Button
                                type="outlined"
                                cls="w-full text-gray-700 group flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900"
                                key={item.label}
                                role="menuitem"
                                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onClick={(e) => { e.preventDefault(); selectedFormat(item.label); handleSelectOption(item.action); }}
                                title={item.hotkey}
                            >
                                <item.icon />
                                <span class="ml-3">{item.label}</span>
                                {item.hotkey && <span class="ml-auto text-xs text-gray-500">{item.hotkey}</span>}
                            </Button>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div class={() => ["relative inline-block text-left", cls]} ref={dropdownRef}>
            <div class="flex">
                <Button
                    type={btnType}
                    class={() => [
                        () => $$(cls) ? $$(cls) : BASE_BTN, cn,
                    ]}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onClick={handleApplyCurrent}
                    title="Text format"
                    {...otherProps}
                >
                    <span class="text-center truncate">
                        {() => {
                            const currentLabel = $$(selectedFormat)
                            const opt = alignmentOptions.find(o => o.label === currentLabel)
                            if (opt) {
                                return opt.icon()
                            }
                            return <AlignLeftIcon />
                        }}
                    </span>
                </Button>
                <Button
                    type={btnType}
                    class="size-full inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 cursor-pointer px-2"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleDropdown(); }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    title="Toggle dropdown"
                >
                    <KeyboardDownArrow class="h-5 w-5" />
                </Button>
            </div>

            {() => $$(isOpen) && (<DropDownMenu />)}
        </div>
    )
})

export { TextAlignDropDown }

customElement('wui-text-align-drop-down', TextAlignDropDown)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-text-align-drop-down': ElementAttributes<typeof TextAlignDropDown>
        }
    }
}

export default TextAlignDropDown


export const TextAlignDropDown_ = () => {
    const editor = $(EditorContext)
    const { undos, saveDo } = useUndoRedo()
    const isOpen = $(false)
    const dropdownRef = $<HTMLElement>(null)
    // const currentAlignment = $('Left Align') // TODO: Detect current alignment


    const BASE_BTN = "size-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 cursor-pointer"

    useOnClickOutside(dropdownRef as any, () => isOpen(false))

    const toggleDropdown = () => isOpen(!isOpen())

    const handleSelectOption = (action: () => void) => {
        if ($$(editor)) {
            saveDo()
            action()
            // $$(editor)?.focus()
        }
        isOpen(false)
    }

    const DropDownMenu = () => {
        return (
            <div
                class="origin-top-left absolute left-0 mt-2 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="alignment-menu-button"
            >
                <div class="py-1" role="none">
                    {alignmentOptions.map((opt, index) => {
                        if (opt.type === 'divider') {
                            return <div key={`divider-${index}`} class="border-t border-gray-200 my-1 mx-2" />
                        }
                        // TypeScript should infer opt as AlignmentOptionItem here due to the check above
                        const item = opt as AlignmentOptionItem
                        return (
                            <a
                                key={item.label}
                                href="#"
                                class="text-gray-700 group flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900"
                                role="menuitem"
                                onClick={(e) => { e.preventDefault(); handleSelectOption(item.action) }}
                                title={item.hotkey}
                            >
                                <item.icon />
                                <span class="ml-3">{item.label}</span>
                                {item.hotkey && <span class="ml-auto text-xs text-gray-500">{item.hotkey}</span>}
                            </a>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div class="relative inline-block text-left" ref={dropdownRef}>
            <div>
                <Button
                    type='outlined'
                    cls="p-2"
                    onClick={toggleDropdown}
                    title="Text alignment"
                >
                    <AlignLeftIcon />
                    <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Button>
            </div>

            {() => $$(isOpen) && (<DropDownMenu />)}
        </div>
    )
}

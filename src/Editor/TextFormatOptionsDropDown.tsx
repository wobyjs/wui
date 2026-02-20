import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlNumber, HtmlString, JSX, Observable, ObservableMaybe, useEffect } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { EditorContext, useEditor, useUndoRedo } from './undoredo'
import { useOnClickOutside } from '@woby/use'
import { getCurrentRange, getSelectedText, replaceSelectedText } from './utils'
import KeyboardDownArrow from '../icons/keyboard_down_arrow'
import { getCurrentEditor, getActiveSelection } from './utils'

import StrikethroughIcon from '../icons/strikethrough'

// Icons (placeholders, replace with actual icons)
const Strikethrough = () => <span class="font-bold">S</span>
// const Strikethrough = () => <StrikethroughIcon class="size-5" />
const SubscriptIcon = () => <span class="font-bold">X<sub>2</sub></span>
const SuperscriptIcon = () => <span class="font-bold">X<sup>2</sup></span>
const HighlightIcon = () => <span class="font-bold" style={{ background: 'yellow' }}>H</span>
const ClearFormattingIcon = () => <span class="font-bold">Tx</span>
const CaseTransformIcon = () => <span class="font-bold">Aa</span>


const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
}

const transformCase = (transformType: 'lowercase' | 'uppercase' | 'capitalize', editorDiv: HTMLDivElement) => {

    const selection = getActiveSelection(editorDiv) // window.getSelection()
    if (!selection || selection.rangeCount === 0) { return }

    const range = selection.getRangeAt(0).cloneRange()
    const selectedText = range.toString()
    if (!selectedText) return

    // Get the start and end containers to check if we're spanning multiple elements
    const startContainer = range.startContainer
    const endContainer = range.endContainer

    // Helper function to transform text
    const transform = (text: string): string => {
        switch (transformType) {
            case 'lowercase': return text.toLowerCase()
            case 'uppercase': return text.toUpperCase()
            case 'capitalize': return text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase())
            default: return text
        }
    }

    // If selection is within a single text node
    if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
        const textNode = startContainer as Text
        const originalText = textNode.textContent || ''
        const before = originalText.substring(0, range.startOffset)
        const selected = originalText.substring(range.startOffset, range.endOffset)
        const after = originalText.substring(range.endOffset)

        textNode.textContent = before + transform(selected) + after

        // Restore selection
        const newRange = document.createRange()
        newRange.setStart(textNode, range.startOffset)
        newRange.setEnd(textNode, range.startOffset + transform(selected).length)
        selection.removeAllRanges()
        selection.addRange(newRange)
        return
    }

    // For multi-element selection, use TreeWalker to process text nodes
    const commonAncestor = range.commonAncestorContainer
    const walker = document.createTreeWalker(
        commonAncestor,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
            }
        }
    )

    const textNodesToProcess: { node: Text; start: number; end: number }[] = []
    let currentNode: Node | null

    while ((currentNode = walker.nextNode())) {
        if (currentNode.nodeType === Node.TEXT_NODE) {
            const textNode = currentNode as Text
            let start = 0
            let end = textNode.textContent?.length || 0

            // Adjust start for the first node
            if (currentNode === range.startContainer) {
                start = range.startOffset
            }

            // Adjust end for the last node
            if (currentNode === range.endContainer) {
                end = range.endOffset
            }

            if (start < end) {
                textNodesToProcess.push({ node: textNode, start, end })
            }
        }
    }

    // Transform each text node
    textNodesToProcess.forEach(({ node, start, end }) => {
        const originalText = node.textContent || ''
        const before = originalText.substring(0, start)
        const selected = originalText.substring(start, end)
        const after = originalText.substring(end)
        node.textContent = before + transform(selected) + after
    })

    // Restore the original selection range
    selection.removeAllRanges()
    selection.addRange(range)
}

interface FormatOption {
    label: string;
    hotkey: string;
    action: (editorDiv?: HTMLDivElement) => void;
    icon: any;
}


export const FORMAT_OPTIONS: FormatOption[] = [
    { label: 'Strikethrough', hotkey: 'Ctrl+Shift+S', action: () => applyFormat('strikeThrough'), icon: Strikethrough },
    { label: 'Subscript', hotkey: 'Ctrl+,', action: () => applyFormat('subscript'), icon: SubscriptIcon },
    { label: 'Superscript', hotkey: 'Ctrl+.', action: () => applyFormat('superscript'), icon: SuperscriptIcon },
    { label: 'Highlight', hotkey: '', action: () => applyFormat('hiliteColor', 'yellow'), icon: HighlightIcon }, // Default yellow highlight
    { label: 'Clear Formatting', hotkey: 'Ctrl+\\', action: () => applyFormat('removeFormat'), icon: ClearFormattingIcon },
    { label: 'Lowercase', hotkey: 'Ctrl+Shift+1', action: (editorDiv) => transformCase('lowercase', editorDiv), icon: CaseTransformIcon },
    { label: 'Uppercase', hotkey: 'Ctrl+Shift+2', action: (editorDiv) => transformCase('uppercase', editorDiv), icon: CaseTransformIcon },
    { label: 'Capitalize', hotkey: 'Ctrl+Shift+3', action: (editorDiv) => transformCase('capitalize', editorDiv), icon: CaseTransformIcon },
]



// type TextFormat = 'strikethrough' | 'subscript' | 'superscript' | 'highlight' | 'clear' | 'lowercase' | 'uppercase' | 'capitalize'
// #region TextFormatOptionsDropDown Component
const def = () => ({
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
})

const TextFormatOptionsDropDown = defaults(def, (props) => {

    const { class: cn, cls, buttonType: btnType, disabled, ...otherProps } = props

    const BASE_BTN = "size-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"

    const editor = useEditor()
    const isOpen = $(false)
    const dropdownRef = $<HTMLDivElement>(null)

    useOnClickOutside(dropdownRef, () => isOpen(false))

    const toggleDropdown = () => isOpen(!isOpen())

    const handleSelectOption = (action: (editor?: HTMLDivElement) => void) => {

        const el = editor ?? getCurrentEditor()

        if ($$(el)) {
            action($$(el))
        }
        isOpen(false)
    }

    const DropdownMenu = () => {
        return (
            <div
                class="origin-top-left absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="format-options-menu-button"
                onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
            >
                <div class="py-1" role="none">
                    {FORMAT_OPTIONS.map(opt => (
                        <Button
                            type="outlined"
                            cls="w-full text-gray-700 group flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900"
                            role="menuitem"
                            onClick={(e) => { e.preventDefault(); handleSelectOption(opt.action) }}
                            title={opt.hotkey}
                        >
                            <opt.icon />
                            <span class="ml-3">{opt.label}</span>
                            {opt.hotkey && <span class="ml-auto text-xs text-gray-500">{opt.hotkey}</span>}
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
                    class={() => [
                        () => $$(cls) ? $$(cls) : BASE_BTN, cn,
                    ]}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onClick={toggleDropdown}
                    title="More text formats"
                    disabled={disabled}
                    {...otherProps}
                >
                    <span class="text-center truncate">
                        <CaseTransformIcon />
                    </span>
                    <span class="flex justify-end">
                        <KeyboardDownArrow class="-mr-1 ml-2 h-5 w-5" />
                    </span>
                </Button>
            </div>

            {() => $$(isOpen) && (<DropdownMenu />)}
        </div>
    )
})
// #endregion

// #region Strikethrough Button Component
const def_Strikethrough = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Strikethrough", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const StrikethroughButton = defaults(def_Strikethrough, (props) => {
    const { buttonType: btnType, title, cls, class: cn, disabled, ...otherProps } = props

    const editor = useEditor()
    const isActive = $(false)
    const format = FORMAT_OPTIONS.find(f => f.label === 'Strikethrough')
    const action = () => format.action()
    const displayIcon = () => format.icon

    useEffect(() => {
        const el = editor ?? getCurrentEditor()
        return trackState(el, 'strikeThrough', isActive)
    })

    return formatButton(btnType, title, cls, cn, isActive, disabled, action, displayIcon, otherProps)

}) as typeof StrikethroughButton
// #endregion

// #region Subscript Button Component
const def_Subscript = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Subscript", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const SubscriptButton = defaults(def_Subscript, (props) => {
    const { buttonType: btnType, title, cls, class: cn, disabled, ...otherProps } = props

    const editor = useEditor()
    const isActive = $(false)
    const format = FORMAT_OPTIONS.find(f => f.label === 'Subscript')
    const action = () => format.action()
    const displayIcon = () => format.icon

    useEffect(() => {
        const el = editor ?? getCurrentEditor()
        return trackState(el, 'subscript', isActive)
    })

    return formatButton(btnType, title, cls, cn, isActive, disabled, action, displayIcon, otherProps)

}) as typeof SubscriptButton
// #endregion

// #region Superscript Button Component
const def_Superscript = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Superscript", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const SuperscriptButton = defaults(def_Superscript, (props) => {
    const { buttonType: btnType, title, cls, class: cn, disabled, ...otherProps } = props

    const editor = useEditor()
    const isActive = $(false)
    const format = FORMAT_OPTIONS.find(f => f.label === 'Superscript')
    const action = () => format.action()
    const displayIcon = () => format.icon

    useEffect(() => {
        const el = editor ?? getCurrentEditor()
        return trackState(el, 'superscript', isActive)
    })

    return formatButton(btnType, title, cls, cn, isActive, disabled, action, displayIcon, otherProps)

}) as typeof SuperscriptButton
// #endregion

// #region Highlight Button Component
const def_Highlight = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Highlight", HtmlString) as ObservableMaybe<string>,
    highlightColor: $('yellow', HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const HighlightButton = defaults(def_Highlight, (props) => {
    const { buttonType: btnType, title, cls, class: cn, disabled, highlightColor, ...otherProps } = props

    const editor = useEditor()
    const isActive = $(false)
    const format = FORMAT_OPTIONS.find(f => f.label === 'Highlight')
    const action = () => applyFormat('hiliteColor', $$(highlightColor))
    const displayIcon = () => format.icon

    useEffect(() => {
        const el = editor ?? getCurrentEditor()
        return trackState(el, 'hiliteColor', isActive)
    })

    return formatButton(btnType, title, cls, cn, isActive, disabled, action, displayIcon, otherProps)

}) as typeof HighlightButton
// #endregion

// #region Clear Format Button Component
const def_ClearFormat = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Clear Format", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const ClearFormatButton = defaults(def_ClearFormat, (props) => {
    const { buttonType: btnType, title, cls, class: cn, disabled, ...otherProps } = props
    const isActive = false
    const format = FORMAT_OPTIONS.find(f => f.label === 'Clear Formatting')
    const action = () => format.action()
    const displayIcon = () => format.icon

    return formatButton(btnType, title, cls, cn, isActive, disabled, action, displayIcon, otherProps)
}) as typeof ClearFormatButton

// #endregion

// #region Lowercase Button Component
const def_Lowercase = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Lowercase", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const LowercaseButton = defaults(def_Lowercase, (props) => {
    const { buttonType: btnType, title, cls, class: cn, disabled, ...otherProps } = props

    const editor = useEditor()

    const isActive = false
    const format = FORMAT_OPTIONS.find(f => f.label === 'Lowercase')
    const action = () => {
        const el = editor || getCurrentEditor()
        if (!$$(el)) return
        format.action($$(el))
    }
    const displayIcon = () => format.icon
    return formatButton(btnType, title, cls, cn, isActive, disabled, action, displayIcon, otherProps)
}) as typeof LowercaseButton
// #endregion

// #region Uppercase Button Component
const def_Uppercase = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Uppercase", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const UppercaseButton = defaults(def_Uppercase, (props) => {
    const { buttonType: btnType, title, cls, class: cn, disabled, ...otherProps } = props

    const editor = useEditor()

    const isActive = false
    const format = FORMAT_OPTIONS.find(f => f.label === 'Uppercase')
    const action = () => {
        const el = editor || getCurrentEditor()
        if (!$$(el)) return
        format.action($$(el))
    }
    const displayIcon = () => format.icon
    return formatButton(btnType, title, cls, cn, isActive, disabled, action, displayIcon, otherProps)
}) as typeof UppercaseButton
// #endregion

// #region Capitalize Button Component
const def_Capitalize = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Capitalize", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const CapitalizeButton = defaults(def_Capitalize, (props) => {
    const { buttonType: btnType, title, cls, class: cn, disabled, ...otherProps } = props

    const editor = useEditor()

    const isActive = false
    const format = FORMAT_OPTIONS.find(f => f.label === 'Capitalize')
    const action = () => {
        const el = editor || getCurrentEditor()
        if (!$$(el)) return
        format.action($$(el))
    }
    const displayIcon = () => format.icon
    return formatButton(btnType, title, cls, cn, isActive, disabled, action, displayIcon, otherProps)
}) as typeof CapitalizeButton
// #endregion

export {
    TextFormatOptionsDropDown,
    StrikethroughButton,
    SubscriptButton,
    SuperscriptButton,
    HighlightButton,
    ClearFormatButton,

    LowercaseButton,
    UppercaseButton,
    CapitalizeButton,
}

customElement('wui-text-format-options-drop-down', TextFormatOptionsDropDown)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-text-format-options-drop-down': ElementAttributes<typeof TextFormatOptionsDropDown>
        }
    }
}

export default TextFormatOptionsDropDown

// #region Helper
function trackState(editor: ObservableMaybe<HTMLDivElement>, command: string, isActive: Observable<boolean>) {

    const editorDiv = $$(editor)

    if (!editorDiv || typeof editorDiv.contains !== 'function') return

    const updateState = () => {
        const selection = window.getSelection()

        // 1. Check if the cursor is actually inside the editor
        if (selection && selection.rangeCount > 0) {
            const anchorNode = selection.anchorNode
            const isInside = editorDiv.contains(anchorNode)

            if (isInside) {
                // 2. Query the browser for the 'strikeThrough' state
                const struck = document.queryCommandState(command)
                isActive(struck)
                return
            }
        }

        // Default to false if selection is outside
        isActive(false)
    }

    // Listen for selection changes and mouse clicks (which move the cursor)
    document.addEventListener('selectionchange', updateState)
    document.addEventListener('mouseup', updateState)

    // Check initial state
    updateState()

    return () => {
        document.removeEventListener('selectionchange', updateState)
        document.removeEventListener('mouseup', updateState)
    }
}

function formatButton(btnType: ObservableMaybe<ButtonStyles>, title: ObservableMaybe<string>, cls: JSX.Class | undefined, cn: JSX.Class | undefined, isActive: ObservableMaybe<boolean>, disabled: Observable<boolean>, action: () => void, displayIcon: () => JSX.Element, otherProps: JSX.HTMLAttributes<HTMLButtonElement>) {
    return (
        <Button
            type={btnType}
            title={title}
            class={() => [
                () => $$(cls) ? $$(cls) : cn,
                () => $$(isActive) ? '!bg-slate-200' : ''
            ]}
            aria-pressed={() => $$(isActive) ? "true" : "false"}
            disabled={disabled}
            onMouseDown={(e) => { e.preventDefault(); }}
            onClick={action}
            {...otherProps}
        >
            {displayIcon}
        </Button>
    )
}
// #endregion
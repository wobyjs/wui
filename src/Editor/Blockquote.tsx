import { Button, ButtonStyles } from '../Button'
import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, Observable, ObservableMaybe, useContext, useEffect } from "woby"
import { useEditor } from './undoredo'
import { getCurrentEditor, getActiveSelection, findBlockParent } from './utils'

// change 'inline-block' to 'block'
export const QUOTE_CLASSES = "text-[15px] text-[#65676b] ml-10 mr-0 mt-0 mb-2.5 pl-2 border-l-[#ced0d4] border-l-4 border-solid block italic"
export const QUOTE_TAG = "blockquote"

const def = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Convert to Blockquote", HtmlString) as ObservableMaybe<string>,
    label: $("Blockquote", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const Blockquote = defaults(def, (props) => {

    const { buttonType: btnType, title: buttonTitle, label: buttonLabel, cls, class: cn, disabled, ...otherProps } = props

    const editor = useEditor()
    const isActive = $(false)

    const toggleBlockquote = () => {
        isActive(!$$(isActive))

        const editorDiv = $$(editor) ?? $$(getCurrentEditor())

        if (!editorDiv) { console.warn("[Blockquote] no editor found."); return; }

        if (!$$(isActive)) {
            applyFormatBlock(editorDiv, "p", "")
        } else {
            applyFormatBlock(editorDiv, QUOTE_TAG, QUOTE_CLASSES)
        }
        $$(editorDiv).focus()
    }

    /**
     * Logic to check if the current cursor position is inside a blockquote
     */
    const updateActiveStatus = () => {
        const editorDiv = $$(editor) ?? $$(getCurrentEditor())
        if (!editorDiv) return

        const selection = getActiveSelection(editorDiv)

        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const block = getCurrentBlockInfo(editorDiv, range)

            // Set active if the parent block matches our QUOTE_TAG
            const isInsideQuote = block?.tagName.toLowerCase() === QUOTE_TAG.toLowerCase()
            isActive(isInsideQuote)
        } else {
            isActive(false)
        }
    }

    // Monitor selection changes
    useEffect(() => {
        // 1. Listen for global selection changes
        document.addEventListener('selectionchange', updateActiveStatus)

        // 2. Also listen for keyup/mouseup inside the editor for immediate feedback
        const editorDiv = $$(editor) ?? $$(getCurrentEditor())
        if (editorDiv) {
            editorDiv.addEventListener('keyup', updateActiveStatus)
            editorDiv.addEventListener('mouseup', updateActiveStatus)
        }

        // Cleanup listeners
        return () => {
            document.removeEventListener('selectionchange', updateActiveStatus)
            if (editorDiv) {
                editorDiv.removeEventListener('keyup', updateActiveStatus)
                editorDiv.removeEventListener('mouseup', updateActiveStatus)
            }
        }
    })

    return (
        <Button
            type={btnType}
            disabled={disabled}
            title={buttonTitle}
            class={() => [
                () => $$(cls) ? $$(cls) : cn,
                () => $$(isActive) ? '!bg-slate-200' : ''
            ]}
            onClick={toggleBlockquote}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
        >
            <span class="flex items-center gap-2">
                {buttonLabel}
            </span>
        </Button>
    )
})

export { Blockquote }

customElement('wui-blockquote', Blockquote)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-blockquote': ElementAttributes<typeof Blockquote>
        }
    }
}


export default Blockquote


// #region Helper Functions
export const getCurrentBlockInfo = (root: HTMLElement, range: Range) => {
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

    const selection = getActiveSelection($$(editor))

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
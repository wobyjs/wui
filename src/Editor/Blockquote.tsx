import { Button, ButtonStyles } from '../Button'
import { $, $$, defaults, HtmlBoolean, HtmlClass, HtmlString, Observable, ObservableMaybe, useContext } from "woby"
import { useEditor, useUndoRedo } from './undoredo'


const QUOTE_CLASSES = "text-[15px] text-[#65676b] ml-10 mr-0 mt-0 mb-2.5 pl-2 border-l-[#ced0d4] border-l-4 border-solid inline-block italic"

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
    const { saveDo } = useUndoRedo()

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

    const toggleBlockquote_ = (e: MouseEvent) => {
        e.preventDefault()

        const editorDiv = $$(editor)
        if (editorDiv) {
            applyFormatBlock(editorDiv, "blockquote", QUOTE_CLASSES)
            editorDiv.focus()
        }
    }

    const toggleBlockquote = (e: MouseEvent) => {
        e.preventDefault()

        const editorDiv = $$(editor)
        const selection = window.getSelection()

        if (editorDiv && selection && selection.rangeCount > 0) {
            saveDo()

            const range = selection.getRangeAt(0)
            const currentBlock = getCurrentBlockInfo(editorDiv, range)

            if (currentBlock && currentBlock.tagName === 'BLOCKQUOTE') {
                applyFormatBlock(editorDiv, "p", "")
            } else {
                applyFormatBlock(editorDiv, "blockquote", QUOTE_CLASSES)
            }

            editorDiv.focus()
        }
    }

    return (
        <Button
            type={btnType}
            disabled={disabled}
            title={buttonTitle}
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleBlockquote(e)
            }}
        >
            <span class="flex items-center gap-2">
                {/* <svg class="size-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V13C14.017 13.5523 13.5693 14 13.017 14H12.017V21H14.017ZM6.017 21L6.017 18C6.017 16.8954 6.91238 16 8.017 16H11.017C11.5693 16 12.017 15.5523 12.017 15V9C12.017 8.44772 11.5693 8 11.017 8H7.017C6.46472 8 6.017 8.44772 6.017 9V13C6.017 13.5523 5.56928 14 5.017 14H4.017V21H6.017Z" />
                </svg> */}
                {buttonLabel}
            </span>
        </Button>
    )
})

export { Blockquote }
export default Blockquote

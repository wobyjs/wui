import { $, $$, defaults, type JSX, customElement, type ElementAttributes, type Observable, ObservableMaybe, HtmlString, HtmlNumber, HtmlClass, HtmlBoolean } from "woby"
import { Button, ButtonStyles } from '../Button'
import { useEditor, useUndoRedo } from './undoredo'
import IndentIcon from '../icons/indent'
import OutdentIcon from '../icons/outdent'
import { getCurrentEditor } from "./utils"
import { applyIndent as applyIndentStyle, applyListIndent } from './StyleEngine'
import { applyBlockCommandToSelectedImage } from './ImageActions'

type IndentMode = "increase" | "decrease"

// Default props definition matching your other components
const def = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    mode: $("increase", HtmlString) as ObservableMaybe<IndentMode>,
    step: $(1, HtmlNumber) as ObservableMaybe<number>,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
    identPx: $(20, HtmlNumber) as ObservableMaybe<number>,
})

const Indent = defaults(def, (props) => {
    const { buttonType, title, cls, class: cn, mode, step, disabled, identPx, ...otherProps } = props

    const editor = useEditor()
    const { saveDo } = useUndoRedo()
    const isDecrease = () => {
        return $$(mode) == 'decrease'
    }

    // Determine Icon and Title based on mode
    const displayIcon = () => $$(isDecrease) ? <OutdentIcon class="size-5" /> : <IndentIcon class="size-5" />

    const displayTitle = () => {
        const t = $$(title)
        if (t) return t
        return $$(isDecrease) ? "Decrease Indent" : "Increase Indent"
    }

    const handleClick = (e: any) => {
        // Check for image selection first - route to image handler
        const isDecreaseMode = $$(mode) === 'decrease'
        if (applyBlockCommandToSelectedImage(isDecreaseMode ? 'outdent' : 'indent')) {
            saveDo()
            return
        }

        const stepVal = $$(step)
        const pxVal = $$(identPx)
        const amount = pxVal * stepVal

        // Check if selection is inside a list (UL/OL)
        const editorEl = document.querySelector('wui-editor')
        const shadow = editorEl?.shadowRoot
        const sel = shadow?.getSelection()
        const range = sel?.getRangeAt(0)

        if (range) {
            const commonAncestor = range.commonAncestorContainer
            // Check if we're inside a list
            let node: Node | null = commonAncestor
            while (node && node !== shadow) {
                if (node instanceof HTMLElement) {
                    const tag = node.tagName.toUpperCase()
                    if (tag === 'LI' || tag === 'UL' || tag === 'OL') {
                        // Use StyleEngine's applyListIndent for list items (ml-* classes)
                        applyListIndent(isDecreaseMode, amount)
                        saveDo()
                        return
                    }
                }
                node = node.parentNode
            }
        }

        // Use StyleEngine's applyIndent for non-list blocks (paragraphs, headings)
        applyIndentStyle(isDecreaseMode, amount)
        saveDo()
    }

    return (
        <Button
            type={buttonType}
            title={displayTitle}
            class={() => [
                () => $$(cls) ? $$(cls) : cn
            ]}
            disabled={disabled}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
            onClick={handleClick}
            {...otherProps}
        >
            {displayIcon}
        </Button>
    )
}) as typeof Indent

export { Indent }

// Register Custom Element
customElement('wui-indent', Indent)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-indent': ElementAttributes<typeof Indent>
        }
    }
}

export default Indent


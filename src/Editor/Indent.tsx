import { $, $$, defaults, type JSX, customElement, type ElementAttributes, type Observable, ObservableMaybe, HtmlString, HtmlNumber, HtmlClass, HtmlBoolean } from "woby"
import { Button, ButtonStyles } from '../Button'
import { useEditor } from './undoredo'
import IndentIcon from '../icons/indent'
import OutdentIcon from '../icons/outdent'
import { getSelection, BLOCK_TAGS, getCurrentEditor, getClosestElementFromSelection } from "./utils"

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
    identPx: $(8, HtmlNumber) as ObservableMaybe<number>,
})

const Indent = defaults(def, (props) => {
    const { buttonType, title, cls, class: cn, mode, step, disabled, identPx, ...otherProps } = props

    const editor = useEditor()
    const isDecrease = () => {
        return $$(mode) == 'decrease'
    }

    // Determine Icon and Title based on mode
    const displayIcon = () => $$(isDecrease) ? <IndentIcon class="size-5" /> : <OutdentIcon class="size-5" />

    const displayTitle = () => {
        const t = $$(title)
        if (t) return t
        return $$(isDecrease) ? "Decrease Indent" : "Increase Indent"
    }

    const handleClick = (e: any) => {
        const stepVal = $$(step)
        const pxVal = $$(identPx)

        const el = editor ?? getCurrentEditor()

        // Call the helper logic
        applyIndent($$(el), $$(isDecrease), stepVal, pxVal)
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

// #region Indent Logic
export const applyIndent = (editor: HTMLElement, isDecrease: boolean, stepMultiplier: number, indentAmount: number) => {

    console.groupCollapsed(`[Indent] ${isDecrease ? 'Decrease' : 'Increase'} indent by ${indentAmount * stepMultiplier}px`)

    const { selection } = getSelection(editor)

    if (!selection || selection.rangeCount === 0) {
        console.log('[Indent] No selection or range, aborting')
        console.groupEnd()
        return
    }

    const selectedBlocks: HTMLElement[] = [];
    if (selection && selection.rangeCount > 0) {
        if (selection.isCollapsed) {
            const el = getClosestElementFromSelection(selection, BLOCK_TAGS);
            if (el) selectedBlocks.push(el);
        } else {
            // SMART: Find the closest common parent of the highlight
            const range = selection.getRangeAt(0);
            let ancestor = range.commonAncestorContainer as HTMLElement;
            if (ancestor.nodeType === Node.TEXT_NODE) ancestor = ancestor.parentElement!;

            // 🚀 OPTIMIZATION: Only search inside the ancestor, not the whole editor
            const allPossibleBlocks = ancestor.querySelectorAll<HTMLElement>(BLOCK_TAGS);

            // If the ancestor ITSELF is a block tag, add it too!
            if (ancestor.matches(BLOCK_TAGS) && !ancestor.hasAttribute('data-editor-root')) {
                selectedBlocks.push(ancestor);
            }

            allPossibleBlocks.forEach(block => {
                if (selection.containsNode(block, true)) {
                    selectedBlocks.push(block);
                }
            });
        }
    }

    const amount = indentAmount * stepMultiplier

    console.log(`[Indent] Total blocks to modify: ${selectedBlocks.length}`)
    console.log(`[Indent] Indent Amount: ${amount}px (${indentAmount}px * ${stepMultiplier})`)

    selectedBlocks.forEach((block, index) => {
        const currentValue = block.style.textIndent.valueOf() == '' ? 0 : parseInt(block.style.textIndent.valueOf())
        const newValue = currentValue + (isDecrease ? -amount : amount)
        block.style.textIndent = newValue < 0 ? '0px' : `${newValue}px`
    })
    console.groupEnd()
}

// #endregion
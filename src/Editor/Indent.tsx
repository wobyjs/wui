import { $, $$, defaults, type JSX, customElement, type ElementAttributes, type Observable, ObservableMaybe, HtmlString, HtmlNumber, HtmlClass, HtmlBoolean } from "woby"
import { Button, ButtonStyles } from '../Button'
import { useEditor, useUndoRedo } from './undoredo'
import IndentIcon from '../icons/indent'
import OutdentIcon from '../icons/outdent'
import { getCurrentEditor } from "./utils"
import { applyIndent as applyIndentStyle, applyListIndent } from './StyleEngine'
import { applyBlockCommandToSelectedImage } from './ImageActions'
import { t } from '../i18n'
import { TOOLBAR_CONTROL } from './toolbarControl'

type IndentMode = "increase" | "decrease"

// Default props definition matching your other components
const def = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as ObservableMaybe<string>,
    class: $('', HtmlClass) as ObservableMaybe<string>,
    mode: $("increase", HtmlString) as ObservableMaybe<IndentMode>,
    step: $(1, HtmlNumber) as ObservableMaybe<number>,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
    identPx: $(20, HtmlNumber) as ObservableMaybe<number>,
})

const Indent: Defaulted<typeof def> = defaults(def, (props) => {
    const { buttonType, title, cls, class: cn, mode, step, disabled, identPx, ...otherProps } = props

    const editor = useEditor()
    const undoRedoContext = useUndoRedo()
    const saveDo = undoRedoContext?.saveDo || (() => {})
    const isDecrease = () => {
        return $$(mode) == 'decrease'
    }

    // Determine Icon and Title based on mode
    const displayIcon = () => $$(isDecrease) ? <OutdentIcon class="size-5" /> : <IndentIcon class="size-5" />

    const displayTitle = () => {
        const given = $$(title)
        if (given) return given
        return $$(isDecrease) ? t('editor.decreaseIndent') : t('editor.increaseIndent')
    }

    const handleClick = () => {
        // The verb lives in `applyIndentMode`, shared with the `indent.*` commands and with
        // the Tab/Shift+Tab handler, so all three indent by the same rules.
        applyIndentMode($$(mode) === 'decrease', $$(identPx) * $$(step), $$(editor ?? getCurrentEditor()) as HTMLElement | null)
        saveDo()
    }

    return (
        <Button
            type={buttonType}
            title={displayTitle}
            class={() => [
                TOOLBAR_CONTROL,
                () => $$(cls) ? $$(cls) : $$(cn)
            ]}
            disabled={disabled}
            onMouseDown={(e: any) => { e.preventDefault(); e.stopPropagation() }}
            onClick={handleClick}
            {...otherProps}
        >
            {displayIcon}
        </Button>
    )
}) as typeof Indent

export { Indent }

/**
 * Indent or outdent the selection by `amount` pixels.
 *
 * Two engines, not one: a list item indents by swapping its `ml-*` class, because changing
 * `padding-left` on an `<li>` moves the text away from its own bullet instead of moving the
 * bullet. Everything else -- paragraphs, headings -- indents as a block. Which one applies is
 * decided by walking up from the caret, not by asking the editor what mode it is in.
 *
 * Exported so the `indent.*` commands and the Tab/Shift+Tab handler share it with the button.
 * Does not touch history; the caller owns the undo step.
 */
export const applyIndentMode = (isDecrease: boolean, amount: number, editor?: HTMLElement | null): void => {
    // An image selection is its own block command and never reaches the style engines.
    if (applyBlockCommandToSelectedImage(isDecrease ? 'outdent' : 'indent')) return

    const el = editor ?? ($$(getCurrentEditor()) as HTMLElement | null)
    const root = el?.getRootNode()
    const shadow = root instanceof ShadowRoot ? root : undefined
    const sel = shadow ? (shadow as any).getSelection?.() : window.getSelection()
    const range: Range | null = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null

    if (range) {
        let node: Node | null = range.commonAncestorContainer
        while (node && (!shadow || node.getRootNode() === shadow)) {
            if (node instanceof HTMLElement) {
                const tag = node.tagName.toUpperCase()
                if (tag === 'LI' || tag === 'UL' || tag === 'OL') {
                    try { applyListIndent(isDecrease, amount) }
                    catch (e) { console.warn('List indent failed:', e) }
                    return
                }
            }
            node = node.parentNode
        }
    }

    try { applyIndentStyle(isDecrease, amount) }
    catch (e) { console.warn('Indent style application failed:', e) }
}

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


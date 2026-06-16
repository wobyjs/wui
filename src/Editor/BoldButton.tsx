import { Button, ButtonStyles } from '../Button'
import BoldIcon from '../icons/bold' // Renamed for clarity if Bold is a type/component elsewhere
import { useEditor, useUndoRedo, useFocusManager } from './undoredo' // useUndoRedo needed for saveDo
import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, Observable, ObservableMaybe, useEffect } from 'woby'
import { getCurrentEditor } from './utils'
import { updateStylesState } from './TextStyleButton'
import { applyBold } from './StyleEngine'

const def = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Bold", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})


const BoldButton = defaults(def, (props) => {
    const { buttonType: btnType, title, cls, class: cn, disabled, ...otherProps } = props

    const editorNode = useEditor()
    const { saveDo } = useUndoRedo()
    const focusManager = useFocusManager()
    const isActive = $(false)
    const isMixed = $(false)
    const command = "bold"

    /**
     * Effect: Formatting State Controller
     *
     * Manages the lifecycle of a document-level listener to keep the button's
     * visual state synchronized with the current text selection.
     */
    useEffect(() => {
        const editor = editorNode ?? getCurrentEditor()

        if (!$$(editor) || typeof $$(editor).contains !== 'function') return

        const handler = () => { updateStylesState(isActive, editor, command, isMixed) }

        document.addEventListener('selectionchange', handler)
        // Check initial state
        handler()

        return () => document.removeEventListener('selectionchange', handler)
    })

    const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault()
        // D-09: Cache selection BEFORE browser can move focus and clear it
        // onMouseDown fires before focus shift, onClick fires after
        focusManager.beginCommand()
    }

    const handleClick = () => {
        // D-09: Apply formatting, selection already cached by onMouseDown
        applyBold()
        focusManager.endCommand()
        saveDo()
        // D-05: updateStylesState via selectionchange handles active state.
        // queryCommandState removed — it is shadow-DOM-blind.
    }

    return (
        <Button
            type={btnType}
            title={title}
            class={() => [
                () => $$(cls) ? $$(cls) : cn,
                () => $$(isActive) ? '!bg-slate-200' : '',
                () => $$(isMixed) ? '!bg-slate-100 opacity-60' : ''
            ]}
            aria-pressed={() => $$(isActive) ? "true" : $$(isMixed) ? "mixed" : "false"}
            disabled={disabled}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            {...otherProps}
        >
            <BoldIcon />
        </Button>
    )
}) as typeof BoldButton

export { BoldButton }

customElement('wui-bold-button', BoldButton)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-bold-button': ElementAttributes<typeof BoldButton>
        }
    }
}

export default BoldButton
import { Button, ButtonStyles } from '../Button'
import BoldIcon from '../icons/bold' // Renamed for clarity if Bold is a type/component elsewhere
import { useEditor } from './undoredo' // useUndoRedo not directly needed here anymore
import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, Observable, ObservableMaybe, useEffect } from 'woby'
import { getCurrentEditor } from './utils'
import { updateStylesState } from './TextStyleButton'

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
    const isActive = $(false)
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

        const handler = () => { updateStylesState(isActive, editor, command) }

        document.addEventListener('selectionchange', handler)
        // Check initial state
        handler()

        return () => document.removeEventListener('selectionchange', handler)
    })

    const handleClick = () => {
        // Use CSS spans (<span style="font-weight: bold">) instead of <b> tags
        document.execCommand('styleWithCSS', false, 'true')

        // Execute Native Bold Command
        document.execCommand(command, false)

        // Update state immediately
        isActive(document.queryCommandState(command))
    }

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
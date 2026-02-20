import { $, $$, defaults, useEffect, customElement, type ElementAttributes, type Observable, HtmlBoolean, HtmlClass, ObservableMaybe, HtmlString } from "woby"
import { Button, ButtonStyles } from '../Button'
import UnderlineIcon from '../icons/underline'
import { useEditor } from './undoredo'
import { getCurrentEditor } from "./utils"
import { updateStylesState } from "./TextStyleButton"

const def = () => ({
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Underline", HtmlString) as ObservableMaybe<string>,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const UnderlineButton = defaults(def, (props) => {
    const { buttonType: btnType, title, cls, class: cn, disabled, ...otherProps } = props

    const editorNode = useEditor()
    const isActive = $(false)
    const command = "underline"

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
        // Ensure modern CSS styles (span style="text-decoration: underline") instead of <u> tags
        document.execCommand('styleWithCSS', false, 'true')

        // Execute Native Underline Command
        document.execCommand(command, false)

        // Update state immediately
        isActive(document.queryCommandState(command))
    }

    return (
        <Button
            type={btnType}
            title={title}
            class={() => [
                () => $$(cls) ? $$(cls) : "size-fit", cn,
                () => $$(isActive) ? '!bg-slate-200' : ''
            ]}
            aria-pressed={() => $$(isActive) ? "true" : "false"}
            disabled={disabled}
            onMouseDown={(e) => { e.preventDefault(); }}
            onClick={handleClick}
            {...otherProps}
        >
            <UnderlineIcon />
        </Button>
    )
}) as typeof UnderlineButton

export { UnderlineButton }

customElement('wui-underline-button', UnderlineButton)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-underline-button': ElementAttributes<typeof UnderlineButton>
        }
    }
}

export default UnderlineButton

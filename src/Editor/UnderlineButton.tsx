import { $, $$, defaults, useEffect, customElement, type ElementAttributes, type Observable } from "woby"
import { Button } from '../Button'
import UnderlineIcon from '../icons/underline'
import { useEditor } from './undoredo'

const def = () => ({
    buttonType: $("outlined" as "text" | "contained" | "outlined" | "icon"),
    title: $("Underline"),
    cls: $(""),
    disabled: $(false) as Observable<boolean>,
})

const UnderlineButton = defaults(def, (props) => {
    const { buttonType: btnType, title, cls, disabled, ...otherProps } = props as any

    const editorNode = useEditor()
    const isActive = $(false)

    // 1. Monitor Selection State
    useEffect(() => {
        const editor = $$(editorNode)

        if (!editor) return

        const updateState = () => {
            if (document.activeElement === editor || editor.contains(document.activeElement)) {
                try {
                    // Check if 'underline' is applied to the current selection
                    isActive(document.queryCommandState('underline'))
                } catch (e) {
                    isActive(false)
                }
            }
        }

        document.addEventListener('selectionchange', updateState)
        updateState()

        return () => document.removeEventListener('selectionchange', updateState)
    })

    // 2. Click Handler
    const handleClick = (e: any) => {
        e.preventDefault() // Prevent button from stealing focus

        if (otherProps.onClick) {
            otherProps.onClick(e)
            return
        }

        // Ensure modern CSS styles (span style="text-decoration: underline") instead of <u> tags
        document.execCommand('styleWithCSS', false, 'true')

        // Execute Native Underline Command
        document.execCommand('underline', false)

        // Update state immediately
        isActive(document.queryCommandState('underline'))
    }

    return (
        <Button
            type={btnType}
            title={title}
            class={[
                cls, "size-fit",
                () => $$(isActive) ? '!bg-slate-200' : ''
            ]}
            aria-pressed={() => $$(isActive) ? "true" : "false"}
            disabled={disabled}
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

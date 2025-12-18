import { Button } from '../Button'
import ItalicIcon from '../icons/italic' // Renamed for clarity if Bold is a type/component elsewhere
import { applyStyle, range, getCurrentRange } from './utils'
import { useEditor } from './undoredo' // useUndoRedo not directly needed here anymore
import { $, $$, customElement, defaults, ElementAttributes, Observable, useEffect } from 'woby'


const def = () => ({
    buttonType: $("outlined" as "text" | "contained" | "outlined" | "icon"),
    title: $("Italic"),
    cls: $(""),
    disabled: $(false) as Observable<boolean>,
})

const ItalicButton = defaults(def, (props) => {
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
                    // Check if 'italic' is applied to the current selection
                    isActive(document.queryCommandState('italic'))
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

        // Ensure modern CSS styles (span style="font-style: italic") instead of <i> tags
        document.execCommand('styleWithCSS', false, 'true')

        // Execute Native Italic Command
        document.execCommand('italic', false)

        // Update state immediately
        isActive(document.queryCommandState('italic'))
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
            <ItalicIcon />
        </Button>
    )
}) as typeof ItalicButton

export { ItalicButton }

customElement('wui-italic-button', ItalicButton)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-italic-button': ElementAttributes<typeof ItalicButton>
        }
    }
}

export default ItalicButton

import { $, $$, defaults, type JSX, customElement, type ElementAttributes, type Observable, useEffect, type ObservableMaybe } from "woby"
import { Button } from '../Button'
import { useEditor } from './undoredo'
import BoldIcon from '../icons/bold'
import ItalicIcon from '../icons/italic'
import UnderlineIcon from '../icons/underline'

type TextStyleType = 'bold' | 'italic' | 'underline'

const def = () => ({
    type: $("bold" as TextStyleType),
    buttonType: $("outlined" as "text" | "contained" | "outlined" | "icon"),
    title: $("" as string),
    cls: $(""),
    disabled: $(false) as Observable<boolean>,
    children: $(null) as ObservableMaybe<JSX.Element>,
})

const TextStyleButton = defaults(def, (props) => {
    const { type, buttonType: btnType, title, cls, disabled, children, ...otherProps } = props as any

    const editorNode = useEditor()
    const isActive = $(false)

    // Configuration for each style
    const styleMap = {
        'bold': {
            icon: <BoldIcon />,
            defaultTitle: 'Bold',
            command: 'bold'
        },
        'italic': {
            icon: <ItalicIcon />,
            defaultTitle: 'Italic',
            command: 'italic'
        },
        'underline': {
            icon: <UnderlineIcon />,
            defaultTitle: 'Underline',
            command: 'underline'
        },
    }

    const currentStyleConfig = () => {
        const t = $$(type)
        return styleMap[t as keyof typeof styleMap]
    }

    const displayIcon = () => {
        return currentStyleConfig().icon
    }

    const displayTitle = () => {
        const titleValue = $$(title)
        if (titleValue) return titleValue
        return currentStyleConfig().defaultTitle
    }

    // ---------------------------------------------------------------------
    // 1. STATE DETECTION 
    // ---------------------------------------------------------------------
    useEffect(() => {
        const editor = $$(editorNode)
        const currentType = $$(type)
        const config = styleMap[currentType]

        if (!editor) return

        const updateState = () => {
            if (document.activeElement === editor || editor.contains(document.activeElement)) {
                try {
                    isActive(document.queryCommandState(config.command))
                } catch (e) {
                    isActive(false)
                }
            }
        }

        document.addEventListener('selectionchange', updateState)
        // Check initial state
        updateState()

        return () => document.removeEventListener('selectionchange', updateState)
    })

    // ---------------------------------------------------------------------
    // 2. CLICK HANDLER
    // ---------------------------------------------------------------------
    const handleClick = (e: any) => {
        e.preventDefault() // Stop button from stealing focus

        // Extract onClick from otherProps. Since we cast props to any, this is now safe.
        const customOnClick = otherProps.onClick
        if (customOnClick) {
            customOnClick(e)
            return
        }

        const config = currentStyleConfig()

        // Use CSS styles (span style="...") instead of HTML tags (<b>)
        document.execCommand('styleWithCSS', false, 'true')

        // Apply command
        document.execCommand(config.command, false)

        // Force update state
        isActive(document.queryCommandState(config.command))
    }

    return (
        <Button
            type={btnType}
            title={displayTitle}
            class={[
                cls, "size-fit",
                () => $$(isActive) ? '!bg-slate-200' : ''
            ]}
            aria-pressed={() => $$(isActive) ? "true" : "false"}
            disabled={disabled}
            onClick={handleClick}
            {...otherProps}
        >
            {displayIcon}
        </Button>
    )
}) as typeof TextStyleButton

export { TextStyleButton }

customElement('wui-text-style-button', TextStyleButton);

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-text-style-button': ElementAttributes<typeof TextStyleButton>
        }
    }
}

export default TextStyleButton
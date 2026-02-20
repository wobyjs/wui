import { $, $$, defaults, type JSX, customElement, type ElementAttributes, type Observable, useEffect, type ObservableMaybe, HtmlClass, HtmlString, HtmlBoolean } from "woby"
import { Button, ButtonStyles } from '../Button'
import { useEditor } from './undoredo'
import BoldIcon from '../icons/bold'
import ItalicIcon from '../icons/italic'
import UnderlineIcon from '../icons/underline'
import { getCurrentEditor } from "./utils"

type TextStyleType = 'bold' | 'italic' | 'underline'

const def = () => ({
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    mode: $("bold", HtmlString) as ObservableMaybe<TextStyleType>,
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("", HtmlString) as ObservableMaybe<string>,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
    children: $(null) as ObservableMaybe<JSX.Element>,
})

const TextStyleButton = defaults(def, (props) => {
    const { mode, buttonType: btnType, title, cls, class: cn, disabled, children, ...otherProps } = props

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
        const m = $$(mode)
        return styleMap[m as keyof typeof styleMap]
    }

    const displayIcon = () => {
        return currentStyleConfig().icon
    }

    const displayTitle = () => {
        const titleValue = $$(title)
        if (titleValue) return titleValue
        return currentStyleConfig().defaultTitle
    }


    /**
     * Effect: Style State Synchronization Controller
     * 
     * Synchronizes the visual "active" state of a formatting button (e.g., Bold, Italic) 
     * with the actual text formatting at the current cursor position.
     */
    useEffect(() => {
        const editor = editorNode ?? getCurrentEditor()
        const config = styleMap[$$(mode)]

        if (!$$(editor) || typeof $$(editor).contains !== 'function') return

        const handler = () => { updateStylesState(isActive, editor, config.command) }

        document.addEventListener('selectionchange', handler)
        // Check initial state
        handler()

        return () => document.removeEventListener('selectionchange', handler)
    })

    const handleClick = () => {
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
            class={() => [
                [() => $$(cls) ? $$(cls) : "size-fit", cn],
                () => $$(isActive) ? '!bg-slate-200' : ''
            ]}
            aria-pressed={() => $$(isActive) ? "true" : "false"}
            disabled={disabled}
            onClick={handleClick}
            onMouseDown={(e) => { e.preventDefault() }}
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

export const updateStylesState = (isActive: Observable<boolean>, editor: Observable<HTMLDivElement>, command: string) => {
    const el = $$(editor)
    if (document.activeElement === el || el.contains(document.activeElement)) {
        try {
            isActive(document.queryCommandState(command))
        } catch (e) {
            isActive(false)
        }
    }
}
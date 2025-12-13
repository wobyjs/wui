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
            cls={[
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

// Register Custom Element
customElement('wui-italic-button', ItalicButton)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-italic-button': ElementAttributes<typeof ItalicButton>
        }
    }
}

export default ItalicButton


export const ItalicButton_ = () => {
    const isActive = $(false)
    const editorNode = useEditor() // editorNode is an observable to the editor div

    useEffect(() => {
        const currentEditorNode = $$(editorNode)
        const currentRange = getCurrentRange() // Use the helper function

        if (!currentEditorNode || !currentRange) {
            isActive(false)
            return
        }

        let nodeToCheck = currentRange.startContainer
        if (nodeToCheck.nodeType === Node.TEXT_NODE) {
            nodeToCheck = nodeToCheck.parentElement
        }

        let foundStyle = false
        while (nodeToCheck && nodeToCheck !== currentEditorNode && nodeToCheck instanceof HTMLElement) {
            const style = window.getComputedStyle(nodeToCheck)
            if (style.fontStyle === 'italic') {
                foundStyle = true
                break
            }
            nodeToCheck = nodeToCheck.parentElement
        }

        if (!foundStyle && nodeToCheck === currentEditorNode && nodeToCheck instanceof HTMLElement) {
            const style = window.getComputedStyle(nodeToCheck)
            if (style.fontStyle === 'italic') {
                foundStyle = true
            }
        }

        isActive(foundStyle)
    })

    const handleClick = () => {
        applyStyle((element) => {
            const p = window.getComputedStyle(element?.parentElement)
            const before = window.getComputedStyle(element)
            element.style.fontStyle = before.fontStyle === 'italic' ? 'normal' : 'italic'
            const after = window.getComputedStyle(element)
            if (p.fontStyle === after.fontStyle) {
                element.style.fontStyle = ''
            }
        })
    }

    return <Button
        buttonType='outlined' cls='h-8 w-8' class={() => $$(isActive) ? '!bg-slate-200' : ''} // Matched selected class
        aria-pressed={isActive}
        onClick={handleClick}
        title="Italic"
    >
        <ItalicIcon />
    </Button>
}

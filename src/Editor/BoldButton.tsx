import { Button } from '../Button'
import BoldIcon from '../icons/bold' // Renamed for clarity if Bold is a type/component elsewhere
import { applyStyle, range, getCurrentRange } from './utils'
import { useEditor } from './undoredo' // useUndoRedo not directly needed here anymore
import { $, $$, customElement, defaults, ElementAttributes, Observable, useEffect } from 'woby'

const def = () => ({
    buttonType: $("outlined" as "text" | "contained" | "outlined" | "icon"),
    title: $("Bold"),
    cls: $(""),
    disabled: $(false) as Observable<boolean>,
})


const BoldButton = defaults(def, (props) => {
    const { buttonType: btnType, title, cls, disabled, ...otherProps } = props as any

    const editorNode = useEditor()
    const isActive = $(false)

    useEffect(() => {
        const editor = $$(editorNode)

        if (!editor) return

        const updateState = () => {
            if (document.activeElement === editor || editor.contains(document.activeElement)) {
                try {
                    isActive(document.queryCommandState('bold'))
                } catch (e) {
                    isActive(false)
                }
            }
        }

        document.addEventListener('selectionchange', updateState)
        updateState()

        return () => document.removeEventListener('selectionchange', updateState)
    })

    const handleClick = (e: any) => {
        e.preventDefault() // Prevent button from stealing focus

        // Handle custom onClick if passed
        if (otherProps.onClick) {
            otherProps.onClick(e)
            return
        }

        // Use CSS spans (<span style="font-weight: bold">) instead of <b> tags
        document.execCommand('styleWithCSS', false, 'true')

        // Execute Native Bold Command
        document.execCommand('bold', false)

        // Update state immediately
        isActive(document.queryCommandState('bold'))
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
            <BoldIcon />
        </Button>
    )
}) as typeof BoldButton

export { BoldButton }

// Register Custom Element
customElement('wui-bold-button', BoldButton)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-bold-button': ElementAttributes<typeof BoldButton>
        }
    }
}

export default BoldButton

export const BoldButton_ = () => {
    const isActive = $(false)
    const editorNode = useEditor()

    useEffect(() => {
        if (!$$(editorNode) || !$$(range)) {
            isActive(false)
            return
        }

        const currentRange = getCurrentRange()
        if (!currentRange) {
            isActive(false)
            return
        }
        let nodeToCheck = currentRange.startContainer
        if (nodeToCheck.nodeType === Node.TEXT_NODE) {
            nodeToCheck = nodeToCheck.parentElement
        }

        let foundStyle = false
        while (nodeToCheck && nodeToCheck !== $$(editorNode) && nodeToCheck instanceof HTMLElement) {
            const style = window.getComputedStyle(nodeToCheck)
            if (style.fontWeight === 'bold' || parseInt(style.fontWeight, 10) >= 700) {
                foundStyle = true
                break
            }
            // If it's a span and doesn't have the style, continue up.
            // If it's a block and doesn't have the style, the style is not considered active from this point.
            // However, for bold/italic, it's common to check up to the editor root or first block.
            // The current loop structure does this.
            nodeToCheck = nodeToCheck.parentElement
        }

        // Check editor root itself if style not found in descendants and nodeToCheck became editorNode
        if (!foundStyle && nodeToCheck === $$(editorNode) && nodeToCheck instanceof HTMLElement) {
            const style = window.getComputedStyle(nodeToCheck)
            if (style.fontWeight === 'bold' || parseInt(style.fontWeight, 10) >= 700) {
                foundStyle = true
            }
        }

        isActive(foundStyle)
    }) // Woby's useEffect will auto-track $$(currentRange$) and $$(editorDiv)

    const handleClick = () => {
        applyStyle((element) => {
            const p = window.getComputedStyle(element?.parentElement)
            const before = window.getComputedStyle(element)
            element.style.fontWeight = (before.fontWeight === 'bold' || parseInt(before.fontWeight, 10) >= 700) ? 'normal' : 'bold'
            const after = window.getComputedStyle(element)
            // If after applying, the style is the same as parent, effectively remove it (make it inherit)
            if (p.fontWeight === after.fontWeight) {
                element.style.fontWeight = ''
            }
        })
        // Manually update isActive after click, as selectionchange might not fire immediately
        // or the logic inside useEffect might need a re-evaluation based on the new DOM.
        // A more robust way would be to ensure selectionchange fires and handles it.
        // For now, let's assume the useEffect will correctly update.
        // If not, a direct call to update isActive might be needed here.
    }

    return (
        <Button
            buttonType='outlined' class={['h-8 w-8', () => $$(isActive) ? '!bg-slate-200' : '']} // Example selected class
            aria-pressed={isActive}
            onClick={handleClick}
            title="Bold"
        >
            <BoldIcon />
        </Button>
    )
}

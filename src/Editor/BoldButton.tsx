import { Button, variant } from '../Button'
import BoldIcon from '../icons/bold' // Renamed for clarity if Bold is a type/component elsewhere
import { applyStyle, range } from './utils'
import { useEditor } from './undoredo' // useUndoRedo not directly needed here anymore
import { $, $$, useEffect } from 'woby'
import { useSelection } from 'use-woby'

export const BoldButton = () => {
    const isActive = $(false)
    const editorNode = useEditor()

    useEffect(() => {
        if (!$$(editorNode) || !$$(range)) {
            isActive(false)
            return
        }

        let nodeToCheck = $$(range).startContainer
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

    return <Button
        class={[variant.outlined, 'h-8 w-8', () => $$(isActive) ? '!bg-slate-200' : '']} // Example selected class
        aria-pressed={isActive}
        onClick={handleClick}
        title="Bold"
    >
        <BoldIcon />
    </Button>
}

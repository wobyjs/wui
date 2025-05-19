import { Button, variant } from '../Button'
import UnderlineIcon from '../icons/underline' // Placeholder for UnderlineIcon
import { useEditor } from './undoredo'
import { applyStyle, range as globalRange } from './utils'
import { $, $$, useEffect } from 'woby'

export const UnderlineButton = () => {
    const isActive = $(false)
    const editorNode = useEditor()

    useEffect(() => {
        const currentEditorNode = $$(editorNode)
        const currentSelectionRange = $$(globalRange)

        if (!currentEditorNode || !currentSelectionRange) {
            isActive(false)
            return
        }

        let nodeToCheck = currentSelectionRange.startContainer
        if (nodeToCheck.nodeType === Node.TEXT_NODE) {
            nodeToCheck = nodeToCheck.parentElement
        }

        let foundStyle = false
        while (nodeToCheck && nodeToCheck !== currentEditorNode && nodeToCheck instanceof HTMLElement) {
            const style = window.getComputedStyle(nodeToCheck)
            if (style.textDecorationLine === 'underline') { // Check for underline
                foundStyle = true
                break
            }
            nodeToCheck = nodeToCheck.parentElement
        }

        if (!foundStyle && nodeToCheck === currentEditorNode && nodeToCheck instanceof HTMLElement) {
            const style = window.getComputedStyle(nodeToCheck)
            if (style.textDecorationLine === 'underline') { // Check for underline
                foundStyle = true
            }
        }

        isActive(foundStyle)
    })

    const handleClick = () => {
        applyStyle((element) => {
            const p = window.getComputedStyle(element?.parentElement)
            const before = window.getComputedStyle(element)
            element.style.textDecorationLine = before.textDecorationLine.includes('underline') ? 'none' : 'underline'
            const after = window.getComputedStyle(element)
            // If parent has the same text-decoration, remove it from the element to inherit
            if (p.textDecorationLine === after.textDecorationLine) {
                element.style.textDecorationLine = ''
            }
        })
    }

    return <Button
        class={[variant.outlined, 'h-8 w-8', () => $$(isActive) ? '!bg-slate-200' : '']}
        aria-pressed={isActive}
        onClick={handleClick}
        title="Underline" // Updated title
    >
        <UnderlineIcon />
    </Button>
}

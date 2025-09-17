import { Button } from '../Button'
import ItalicIcon from '../icons/italic' // Renamed for clarity
import { useEditor } from './undoredo' // useUndoRedo not directly needed here anymore
import { applyStyle, getCurrentRange } from './utils' // Import getCurrentRange helper
import { $, $$, useEffect } from 'woby'
// useSelection is not directly used here anymore if globalRange is sufficient

export const ItalicButton = () => {
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
        buttonType='outlined' class={['h-8 w-8', () => $$(isActive) ? '!bg-slate-200' : '']} // Matched selected class
        aria-pressed={isActive}
        onClick={handleClick}
        title="Italic"
    >
        <ItalicIcon />
    </Button>
}

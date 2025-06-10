import { $, $$, Observable, JSX, useMemo, useEffect } from 'woby' // Import useMemo
import { Button, variant } from '../Button'
import TextIncrease from '../icons/text_increase'
import TextDecrease from '../icons/text_decrease'
import { useUndoRedo, EditorContext, useEditor } from './undoredo'
import { applyStyle, range } from './utils'
// import { useEffect } from 'woby' // No longer needed

// Create the reactive font size string using useMemo directly
export const fontSizeValue = useMemo((): string => {
    let fontSize = '16px' // Default font size
    const currentRange = $$(range) // Read the observable dependency
    if (currentRange) {
        let parentElement = currentRange.commonAncestorContainer as HTMLElement
        // If the commonAncestorContainer is a text node, get its parent element
        if (parentElement.nodeType === Node.TEXT_NODE) {
            parentElement = parentElement.parentElement
        }

        if (parentElement && parentElement.nodeType === Node.ELEMENT_NODE) {
            // Ensure we are within the editor bounds if possible
            const editorDiv = $$(useEditor())
            if (editorDiv && editorDiv.contains(parentElement)) {
                const computedStyle = window.getComputedStyle(parentElement)
                fontSize = computedStyle.fontSize || fontSize
            } else if (!editorDiv) { // Fallback if editor context not available yet
                const computedStyle = window.getComputedStyle(parentElement)
                fontSize = computedStyle.fontSize || fontSize
            }
            // If parentElement is not inside editor, keep default? Or check editor itself?
        }
    } else {
        // Fallback or initial state if no range is selected (e.g., editor itself)
        const editorDiv = $$(useEditor()) // Read editor observable dependency
        if (editorDiv) {
            const computedStyle = window.getComputedStyle(editorDiv)
            fontSize = computedStyle.fontSize || fontSize
        }
    }
    return fontSize
})


export const applyFontSize = (newSize: string) => {
    applyStyle((element) => {
        // Ensure the element is not null and has a parentElement
        if (!element || !element.parentElement) return

        const parentStyle = window.getComputedStyle(element.parentElement)
        const currentStyle = window.getComputedStyle(element)

        // If the current font size is already the new size, do nothing
        if (currentStyle.fontSize === newSize) return

        element.style.fontSize = newSize

        // If after applying, the size is the same as parent, clear it to inherit
        const newCurrentStyle = window.getComputedStyle(element)
        if (parentStyle.fontSize === newCurrentStyle.fontSize) {
            element.style.fontSize = ''
        }
    })
}

const FontSizeInputComponent = () => {
    const { saveDo } = useUndoRedo()

    // Create reactive variable for the number part, derived from fontSizeValue
    const currentSizeNum = useMemo(() => parseFloat($$(fontSizeValue)))

    // useEffect(() => console.log('fontSize', $$(currentSizeNum)))
    // --- useEffect is removed ---

    const handleApplyFontSize = (newSize: number) => {
        if (isNaN(newSize) || newSize <= 0) return
        // saveDo() // Assuming MutationObserver handles undo/redo state saving
        applyFontSize(`${newSize}px`)
        // No need to manually update currentSizeNum/Px, useMemo handles it
    }

    const incrementSize = () => {
        handleApplyFontSize(Math.max(1, Math.round($$(currentSizeNum)) + 1))
    }

    const decrementSize = () => {
        handleApplyFontSize(Math.max(1, Math.round($$(currentSizeNum)) - 1))
    }

    const handleInputChange = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
        const val = parseFloat(e.currentTarget.value)
        if (!isNaN(val) && val > 0) {
            handleApplyFontSize(val)
        } else { // Reset input to current if invalid
            e.currentTarget.value = $$(currentSizeNum).toString()
        }
    }

    const handleInputBlur = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
        // Ensure the input reflects the actual current size if no valid change was made
        e.currentTarget.value = $$(currentSizeNum).toString()
    }


    return (
        <div className="relative inline-block text-left">
            <div>
                {/* <div className="inline-flex items-center rounded-md shadow-sm"> */}
                <Button
                    class={[variant.outlined, "h-8 rounded-r-none px-2 py-1 border-r-0"]} // Adjusted padding and removed right border
                    onClick={decrementSize}
                    title="Decrease Font Size"
                >
                    <TextDecrease />
                </Button>
                <input
                    // type="number"
                    value={currentSizeNum} // Bind directly to the reactive number derived via useMemo
                    onInput={handleInputChange}
                    onBlur={handleInputBlur}
                    className="h-8 w-12 text-center border-gray-300 border-y focus:ring-indigo-500 focus:border-indigo-500 text-sm py-1"
                    min="1"
                    title="Font size"
                    disabled
                />
                <Button
                    class={[variant.outlined, "h-8 rounded-l-none px-2 py-1"]} // Adjusted padding
                    onClick={incrementSize}
                    title="Increase Font Size"
                >
                    <TextIncrease />
                </Button>
            </div>
        </div>
    )
}

// Export the new component and potentially keep old ones if they are used elsewhere or for different UI
export { FontSizeInputComponent as FontSizeInput }

// Old components, can be removed if FontSizeInput replaces them entirely
// Old components, can be removed if FontSizeInput replaces them entirely
// Or update them to use $$fontSizeValue
export const IncreaseFontSize = () => {
    // const { undos, saveDo } = useUndoRedo() // Removed
    return <Button class={variant.outlined} onClick={() => {
        // saveDo(undos) // Removed: MutationObserver in Editor.tsx should now handle this
        const currentFontSize = $$(fontSizeValue) // Use reactive value
        const newFontSize = parseFloat(currentFontSize) + 2
        applyFontSize(newFontSize + 'px')
    }} title="Increase Font Size"><TextIncrease /></Button>
}

export const DecreaseFontSize = () => {
    // const { undos, saveDo } = useUndoRedo() // Removed
    return <Button class={variant.outlined} onClick={() => {
        // saveDo(undos) // Removed: MutationObserver in Editor.tsx should now handle this
        const currentFontSize = $$(fontSizeValue) // Use reactive value
        const newFontSize = parseFloat(currentFontSize) - 2
        applyFontSize(newFontSize + 'px')
    }} title="Decrease Font Size"><TextDecrease /></Button>
}

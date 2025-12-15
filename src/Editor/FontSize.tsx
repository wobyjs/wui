import { $, $$, Observable, JSX, useMemo, useEffect, defaults, ObservableMaybe, HtmlNumber, HtmlString, customElement, ElementAttributes, HtmlBoolean, isObservable } from 'woby' // Import useMemo
import { Button, ButtonStyles } from '../Button'
import TextIncrease from '../icons/text_increase'
import TextDecrease from '../icons/text_decrease'
import { useUndoRedo, EditorContext, useEditor } from './undoredo'
import { applyStyle, range, getCurrentRange } from './utils'


const def = () => ({
    cls: $(""),
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    editable: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
    // disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
    fontSize: $(16, HtmlNumber) as ObservableMaybe<number>,
})


const FontSize = defaults(def, (props) => {

    const { cls, editable, fontSize, ...otherProps } = props

    const buttonBaseClass = "w-1/5 justify-center px-2 py-1 border border-gray-300"

    const currentSizeNum = useMemo(() => parseFloat($$(fontSizeValue)))

    const handleApplyFontSize = (newSize: number) => {
        if (isNaN(newSize) || newSize <= 0) return
        // saveDo() // Assuming MutationObserver handles undo/redo state saving
        applyFontSize(`${newSize}px`)
        // No need to manually update currentSizeNum/Px, useMemo handles it
        if (isObservable(fontSize)) {
            (fontSize as any)(newSize)
        }
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


    // #region UI Component
    const decreaseSizeBtn = () => {
        return (
            <Button
                type='outlined'
                cls={() => [buttonBaseClass, "rounded-r-none"]}
                onClick={decrementSize}
                title="Decrease Font Size"
            >
                <TextDecrease class="w-full h-full text-gray-500" />
            </Button>
        )
    }

    const increaseSizeBtn = () => {
        return (
            <Button
                type='outlined'
                cls={() => [buttonBaseClass, "rounded-l-none"]}
                onClick={incrementSize}
                title="Increase Font Size"
            >
                <TextIncrease class="w-full h-full text-gray-500" />
            </Button>
        )
    }

    const textInput = () => {
        // return (
        //     <input
        //         type="number"
        //         value={currentSizeNum} // Bind directly to the reactive number derived via useMemo
        //         onInput={handleInputChange}
        //         onBlur={handleInputBlur}
        //         class={() => [
        //             "text-center focus:ring-indigo-500 focus:border-indigo-500 text-sm",
        //             "h-auto w-3/5",
        //             "border-y border-gray-300",
        //         ]}
        //         min="1"
        //         title="Font size"
        //         disabled
        //     />
        // )

        return (
            <input
                // type="number"
                value={currentSizeNum}
                onInput={handleInputChange}
                onBlur={handleInputBlur}
                class={() => [
                    "text-center focus:ring-indigo-500 focus:border-indigo-500 text-sm",
                    "h-auto w-3/5",
                    "border-y border-gray-300",
                    () => $$(editable) ? "bg-white" : "bg-gray-50 cursor-not-allowed",
                ]}
                min="1"
                title="Font size"
                disabled={() => !$$(editable)}   // ✅ dynamic now (was hard-coded)
                readOnly={() => !$$(editable)}   // ✅ prevents odd browser behaviors
            />
        )
    }
    // #endregion

    return (
        <div class={() => [
            cls,
            "inline-flex items-stretch rounded-md shadow-sm",
        ]}>
            {decreaseSizeBtn}
            {textInput}
            {increaseSizeBtn}
        </div>
    )


}) as typeof FontSize

export { FontSize }

customElement('wui-font-size', FontSize);

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-font-size': ElementAttributes<typeof FontSize>
        }
    }
}

export default FontSize


const fontSizeValue = useMemo((): string => {
    let fontSize = '16px' // Default font size
    const currentRange = getCurrentRange()
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


// Define the function that accepts a size string like "12px", "2rem", or "large"
const applyFontSize = (newSize: string) => {

    // 'applyStyle' is a helper that wraps the user's selected text in a <span>
    // and passes that <span> element into this callback function.
    applyStyle((element) => {

        // 1. SAFETY CHECK
        // Stop immediately if the element is null or has no parent (detached from DOM).
        if (!element || !element.parentElement) return

        // 2. SNAPSHOT THE ENVIRONMENT
        // Get the computed CSS of the container (e.g., the <p> tag surrounding the text).
        const parentStyle = window.getComputedStyle(element.parentElement)
        // Get the computed CSS of the text span itself.
        const currentStyle = window.getComputedStyle(element)

        // 3. EFFICIENCY CHECK
        // If the text is already the size we are trying to set, stop. 
        // Don't waste browser resources repainting.
        if (currentStyle.fontSize === newSize) return

        // 4. APPLY THE CHANGE
        // Add the inline style to the span.
        // Before: <span>Hello</span>
        // After:  <span style="font-size: 24px;">Hello</span>
        element.style.fontSize = newSize

        // 5. CLEANUP LOGIC (INHERITANCE CHECK)
        // Check the style again now that we've changed it.
        const newCurrentStyle = window.getComputedStyle(element)

        // Logic: If the Parent is 16px, and we just set this Span to 16px...
        // ...then the inline style is useless redundancy. 
        if (parentStyle.fontSize === newCurrentStyle.fontSize) {

            // Remove the specific font-size rule we just added.
            // The text will naturally inherit the size from the parent.
            // This keeps the HTML clean and cleaner to save/load later.
            element.style.fontSize = ''
        }
    })
}


// Old components, can be removed if FontSizeInput replaces them entirely
// Old components, can be removed if FontSizeInput replaces them entirely
// Or update them to use $$fontSizeValue
export const IncreaseFontSize = () => {
    // const { undos, saveDo } = useUndoRedo() // Removed
    return <Button buttonType='outlined' onClick={() => {
        // saveDo(undos) // Removed: MutationObserver in Editor.tsx should now handle this
        const currentFontSize = $$(fontSizeValue) // Use reactive value
        const newFontSize = parseFloat(currentFontSize) + 2
        applyFontSize(newFontSize + 'px')
    }} title="Increase Font Size"><TextIncrease /></Button>
}

export const DecreaseFontSize = () => {
    // const { undos, saveDo } = useUndoRedo() // Removed
    return <Button buttonType='outlined' onClick={() => {
        // saveDo(undos) // Removed: MutationObserver in Editor.tsx should now handle this
        const currentFontSize = $$(fontSizeValue) // Use reactive value
        const newFontSize = parseFloat(currentFontSize) - 2
        applyFontSize(newFontSize + 'px')
    }} title="Decrease Font Size"><TextDecrease /></Button>
}

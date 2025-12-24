import { $, $$, Observable, JSX, useEffect, defaults, ObservableMaybe, HtmlNumber, HtmlString, customElement, ElementAttributes, HtmlBoolean, isObservable, useMemo } from 'woby'
import { Button, ButtonStyles } from '../Button'
import TextIncrease from '../icons/text_increase'
import TextDecrease from '../icons/text_decrease'
import { useEditor } from './undoredo'
import { applyStyle, getCurrentRange } from './utils'

const def = () => ({
    cls: $(""),
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    editable: $(false, HtmlBoolean) as Observable<boolean>,
    fontSize: $(16, HtmlNumber) as ObservableMaybe<number>,
    step: $(1, HtmlNumber) as ObservableMaybe<number>,
})

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

const applyFontSize = (newSize: string) => {
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

const FontSize = defaults(def, (props) => {
    const { cls, buttonType, editable, fontSize, step, ...otherProps } = props as any
    const BASE_BTN = "w-1/5 justify-center px-2 py-1 border border-gray-300"


    // #region Handle Font Size
    const current = fontSize

    const updateFontSize = (newSize: number) => {
        fontSize(newSize)
    }

    const handleApplyFontSize = (newSize: number) => {
        if (isNaN(newSize) || newSize <= 0) return
        // saveDo() // Assuming MutationObserver handles undo/redo state saving
        applyFontSize(`${newSize}px`)
        // No need to manually update currentSizeNum/Px, useMemo handles it
    }


    const handleDecreaseSize = (e: any) => {
        e.preventDefault() // Important: Stop button from stealing focus from editor
        const newVal = Math.max($$(current) - $$(step))
        updateFontSize(newVal)
        handleApplyFontSize(newVal)
    }

    const handleIncreaseSize = (e: any) => {
        e.preventDefault() // Important: Stop button from stealing focus from editor
        const newVal = Math.max($$(current) + $$(step))
        updateFontSize(newVal)
        handleApplyFontSize(newVal)
    }

    const handleInputChange = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
        const val = parseFloat(e.currentTarget.value)
        if (!isNaN(val) && val > 0) {
            updateFontSize(val)
            handleApplyFontSize(val)
        } else { // Reset input to current if invalid
            e.currentTarget.value = current
        }
    }

    const handleInputBlur = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
        // Ensure the input reflects the actual current size if no valid change was made
        e.currentTarget.value = fontSize.toString()
    }
    // #endregion


    // #region UI COMPONENT
    const decreaseSizeBtn = () => (
        <Button
            type='outlined'
            cls={() => [BASE_BTN, "rounded-r-none"]}
            title="Decrease Font Size"
            onClick={handleDecreaseSize}
        >
            <TextDecrease class="w-full h-full text-gray-500" />
        </Button>
    )

    const increaseSizeBtn = () => (
        <Button
            type='outlined'
            cls={() => [BASE_BTN, "rounded-l-none"]}
            title="Increase Font Size"
            onClick={handleIncreaseSize}
        >
            <TextIncrease class="w-full h-full text-gray-500" />
        </Button>
    )

    const textInput = () => (
        <input
            value={current} // Bind to local state 'current', not prop 'fontSize'
            class={() => [
                "text-center focus:ring-indigo-500 focus:border-indigo-500 text-sm",
                "h-auto w-3/5",
                "border-y border-gray-300",
                () => $$(editable) ? "bg-white" : "bg-gray-50 cursor-not-allowed",
            ]}
            title="Font size"

            onFocus={handleInputChange}
            onBlur={handleInputBlur}

            disabled={() => !$$(editable)}
            readOnly={() => !$$(editable)}
        />
    )
    // #endregion


    return (
        <div class={() => [cls, "inline-flex items-stretch rounded-md shadow-sm"]}>
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
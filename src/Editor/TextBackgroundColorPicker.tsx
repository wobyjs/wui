import { $, $$, customElement, defaults, ElementAttributes, HtmlClass, HtmlString, JSX, Observable, ObservableMaybe, ObservableReadonly } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { useEditor, useUndoRedo } from './undoredo'
import FormatInkHighlighter from '../icons/format_ink_highlighter' // Import the highlighter icon
import KeyboardDownArrow from '../icons/keyboard_down_arrow'

const def = () => ({
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    color: $("#ffff00", HtmlString) as Observable<string>,
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
})

const TextBackgroundColorPicker = defaults(def, (props) => {
    const { class: cn, cls, color: selectedBgColor, buttonType: btnType, ...otherProps } = props

    const BASE_BTN = "size-full inline-flex items-center justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 cursor-pointer"

    const editor = useEditor() // Editor context, likely the contentEditable div
    const colorInputRef = $<HTMLInputElement>(null)

    // Updates selectedBgColor when the color input changes
    const handleNativeBgColorInputChange = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
        const newColor = e.currentTarget.value
        selectedBgColor(newColor)

        applyPickedBgColor() // Apply color immediately after input change
    }

    // Applies the selected color to the editor content
    const applyPickedBgColor = () => {
        const colorVal = $$(selectedBgColor)

        // 1. Force CSS style output (<span style="background-color: ...">)
        document.execCommand('styleWithCSS', false, 'true')

        // 2. Apply Background Color (hiliteColor)
        // This keeps text inline and doesn't break paragraphs
        document.execCommand('hiliteColor', false, colorVal)

        // 3. Notify Editor
        if ($$(editor)) {
            $$(editor).dispatchEvent(new Event('input', { bubbles: true }))
        }
    }

    const icons = () => { return <FormatInkHighlighter class="w-7 h-6" fill={selectedBgColor} /> }

    return (
        <div class="relative inline-block text-left">
            <Button
                type={btnType}
                class={() => [
                    () => $$(cls) ? $$(cls) : BASE_BTN,
                    cn,
                ]}
                title="Text background color"
                onMouseDown={(e) => { e.preventDefault(); }}
                onClick={applyPickedBgColor}
                {...otherProps}
            >
                <div class="flex flex-col items-center justify-center leading-none text-center truncate" onClick={(e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); applyPickedBgColor(); }}>
                    {icons}
                    <input
                        ref={colorInputRef}
                        type="color"
                        value={selectedBgColor}
                        onInput={handleNativeBgColorInputChange}
                        class="w-full h-3 p-0 border-0"
                        onClick={e => e.stopPropagation()}
                    />
                </div>

                <div class="flex justify-end" onClick={(e) => { e.preventDefault(); e.stopPropagation(); colorInputRef()?.click() }}>
                    <KeyboardDownArrow class="-mr-1 ml-2 size-5" />
                </div>
            </Button>
        </div>
    )
})

export { TextBackgroundColorPicker }

customElement('wui-text-background-color-picker', TextBackgroundColorPicker)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-text-background-color-picker': ElementAttributes<typeof TextBackgroundColorPicker>
        }
    }
}

export default TextBackgroundColorPicker

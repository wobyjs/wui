import { $, $$, JSX, Observable, ObservableMaybe, ObservableReadonly, Context, defaults, HtmlString, customElement, ElementAttributes } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { EditorContext, useEditor, useUndoRedo } from './undoredo'
import { applyStyle } from './utils' // Import applyStyle
import A from '../icons/a'
import KeyboardDownArrow from '../icons/keyboard_down_arrow'

const def = () => ({
    cls: $(""),
    class: $(""),
    color: $('#000000', HtmlString) as ObservableMaybe<string>,
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
})

const TextColorPicker = defaults(def, (props) => {
    const { class: cn, cls, color: selectedColor, buttonType: btnType, ...otherProps } = props

    const editor = useEditor() // Editor context, likely the contentEditable div
    const colorInputRef = $<HTMLInputElement>(null)
    // const { saveDo } = useUndoRedo()
    const undoRedoContext = useUndoRedo()
    const saveDo = undoRedoContext ? undoRedoContext.saveDo : () => { }

    // Updates selectedColor when the color input changes
    const handleNativeColorInputChange = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
        const newColor = e.currentTarget.value
        selectedColor(newColor)
        applyPickedColor()
    }

    // Applies the selected color to the editor content
    const applyPickedColor = () => {
        const colorVal = $$(selectedColor)
        saveDo()
        document.execCommand('styleWithCSS', false, 'true')
        document.execCommand('foreColor', false, colorVal)
        if ($$(editor)) {
            $$(editor).dispatchEvent(new Event('input', { bubbles: true }))
        }
    }
    // const applyPickedColor = () => {
    //     if ($$(editor)) { // Ensure editor context is available
    //         saveDo()
    //         // Use applyStyle to set the color
    //         applyStyle((element) => {
    //             element.style.color = $$(selectedColor)
    //         })
    //     }
    // }

    const BASE_BTN = "size-full inline-flex items-center justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 cursor-pointer"

    const icons = () => {
        return <A class="w-7 h-6" fill={selectedColor} />
    }

    const KeybordDropDownArrow = () => {
        return <KeyboardDownArrow class="-mr-1 ml-2 size-5" />
    }

    return (
        <div class="relative inline-block text-left">
            <Button
                type={btnType}
                cls={() => [BASE_BTN]}
                title="Text color"
                onClick={applyPickedColor}
            >
                <div class="flex flex-col items-center justify-center leading-none text-center truncate"
                    onClick={(e: MouseEvent) => {
                        e.preventDefault
                        e.stopPropagation
                        applyPickedColor
                    }}
                >
                    {icons}
                    <input
                        ref={colorInputRef}
                        type="color"
                        value={selectedColor}
                        onInput={handleNativeColorInputChange}
                        class="w-full h-3 p-0 border-0"
                        onClick={e => e.stopPropagation()}
                    />
                </div>

                <div class="flex justify-end"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        colorInputRef()?.click()
                    }}
                >
                    {KeybordDropDownArrow}
                </div>

            </Button>
        </div>
    )
})

export { TextColorPicker }

customElement('wui-text-color-picker', TextColorPicker)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-text-color-picker': ElementAttributes<typeof TextColorPicker>
        }
    }
}


export default TextColorPicker
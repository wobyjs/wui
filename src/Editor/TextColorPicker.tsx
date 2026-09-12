import { $, $$, useEffect, JSX, Observable, ObservableMaybe, defaults, HtmlString, customElement, ElementAttributes, HtmlClass } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { useEditor, useUndoRedo } from './undoredo'
import A from '../icons/a'
import KeyboardDownArrow from '../icons/keyboard_down_arrow'
import { applyTextColor } from './StyleEngine'
import { t } from '../i18n'

const def = () => ({
    cls: $('', HtmlClass) as JSX.Class,
    class: $('', HtmlClass) as JSX.Class,
    color: $('#000000', HtmlString) as Observable<string>,
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
})

const TextColorPicker = defaults(def, (props) => {
    const { class: cn, cls, color: selectedColor, buttonType: btnType, ...otherProps } = props

    const BASE_BTN = "size-full inline-flex items-center justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 cursor-pointer"

    const editor = useEditor() // Editor context, likely the contentEditable div
    const undoRedoContext = useUndoRedo() // Undo/redo context
    const saveDo = undoRedoContext?.saveDo || (() => {})
    const colorInputRef = $<HTMLInputElement>(null as any)

    // Updates selectedColor when the color input changes
    const handleNativeColorInputChange = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
        const newColor = e.currentTarget.value
        selectedColor(newColor)
        applyPickedColor()
    }

    // Applies the selected color to the editor content
    const applyPickedColor = () => {
        // Sync from input element if available (fixes default color issue)
        const colorInputEl = colorInputRef()
        if (colorInputEl) {
            selectedColor(colorInputEl.value)
        }

        const colorVal = $$(selectedColor)
        applyTextColor(colorVal) // Use StyleEngine instead of execCommand
        saveDo() // Save to undo/redo history
        if ($$(editor)) {
            $$(editor).dispatchEvent(new Event('input', { bubbles: true }))
        }
    }


    // ── Shadow-DOM click wiring ──
    // Button binds `btn.onclick` on the element itself and ends the dispatch there
    // with stopImmediatePropagation(), so the click never reaches document and woby's
    // delegated onClick on these inner nodes never runs -- the arrow was dead and the
    // native picker could not be opened from it. Bind on the elements themselves so
    // they fire on the way up, before the button's own handler.
    const arrowRef = $<HTMLDivElement>(null as any)
    useEffect(() => {
        const arrow = $$(arrowRef)
        if (arrow) arrow.onclick = (e: MouseEvent) => {
            e.preventDefault()
            // Without this the button would also fire and paint the selection with the
            // colour the user has only just set out to change.
            e.stopPropagation()
            $$(colorInputRef)?.click()
        }
        // The swatch opens the picker by itself (native activation behaviour); it only
        // needs the same guard against the button's apply-on-click.
        const input = $$(colorInputRef)
        if (input) input.onclick = (e: MouseEvent) => e.stopPropagation()
    })

    const icons = () => { return <A class="w-7 h-6" fill={selectedColor} /> }

    return (
        <div class="relative inline-block text-left">
            <Button
                type={btnType}
                class={() => [
                    () => $$(cls) ? $$(cls) : BASE_BTN, cn,
                ]}
                title={() => t('editor.textColor')}
                onMouseDown={(e: any) => { e.preventDefault(); }}
                onClick={applyPickedColor}
                {...otherProps}
            >
                <div class="flex flex-col items-center justify-center leading-none text-center truncate">
                    {icons}
                    <input
                        ref={colorInputRef}
                        type="color"
                        value={selectedColor}
                        onInput={handleNativeColorInputChange}
                        class="w-full h-3 p-0 border-0"
                    />
                </div>

                <div ref={arrowRef} class="flex justify-end">
                    <KeyboardDownArrow class="-mr-1 ml-2 size-5" />
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
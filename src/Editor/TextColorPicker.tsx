import { $, $$, JSX, Observable, ObservableMaybe, ObservableReadonly, Context } from 'woby'
import { Button } from '../Button'
import { EditorContext, useEditor, useUndoRedo } from './undoredo'
import { applyStyle } from './utils' // Import applyStyle
import A from '../icons/a'

export const TextColorPicker = () => {
    const editor = useEditor() // Editor context, likely the contentEditable div
    const { saveDo } = useUndoRedo()
    const selectedColor = $('#ee4444') // Default hex color, stores the picked color

    // Updates selectedColor when the color input changes
    const handleNativeColorInputChange = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
        const newColor = e.currentTarget.value
        selectedColor(newColor)
        applyPickedColor() // Apply color immediately after input change
    }

    // Applies the selected color to the editor content
    const applyPickedColor = () => {
        if ($$(editor)) { // Ensure editor context is available
            saveDo()
            // Use applyStyle to set the color
            applyStyle((element) => {
                element.style.color = $$(selectedColor)
                // If the new color is the default/inherited color, consider removing the style
                // This part depends on how "default" color is determined.
                // For simplicity, we'll just set it. To toggle off, user might pick black or a "remove color" option.
            })
        }
    }

    return (
        <div className="relative inline-block text-left">
            {/* Button to apply the picked color */}
            <Button
                buttonType='outlined'
                class={["p-2 h-8"]}
                title="Text color"
                onClick={applyPickedColor} // Apply color on button click
            >
                <A fill={selectedColor} /> {/* Icon reflects the currently selected color */}
                <input
                    type="color"
                    value={selectedColor} // Bind to selectedColor
                    onInput={handleNativeColorInputChange} // Update selectedColor on input change
                    className="w-6 h-6"
                    onClick={e => e.stopPropagation()} // Prevent button click when clicking input
                />
            </Button>
        </div>
    )
}

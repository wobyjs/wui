import { $, $$, JSX, Observable, ObservableMaybe, ObservableReadonly } from 'woby'
import { Button } from '../Button'
import { EditorContext, useUndoRedo } from './undoredo'
import { applyStyle } from './utils' // Import applyStyle
import FormatInkHighlighter from '../icons/format_ink_highlighter' // Import the highlighter icon

export const TextBackgroundColorPicker = () => {
    const editor = $(EditorContext) // Editor context, likely the contentEditable div
    const { saveDo } = useUndoRedo()
    const selectedBgColor = $('#ffff00') // Default hex color for background, stores the picked color

    // Updates selectedBgColor when the color input changes
    const handleNativeBgColorInputChange = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
        const newColor = e.currentTarget.value
        selectedBgColor(newColor)
        applyPickedBgColor() // Apply color immediately after input change
    }

    // Applies the selected background color to the editor content
    const applyPickedBgColor = () => {
        if ($$(editor)) { // Ensure editor context is available
            saveDo()
            // Use applyStyle to set the background color
            applyStyle((element) => {
                element.style.backgroundColor = $$(selectedBgColor)
                // If the new color is transparent or a "remove highlight" color, consider removing the style
                // For simplicity, we'll just set it. To toggle off, user might pick a "no color" option or transparent.
            })
        }
    }

    return (
        <div className="relative inline-block text-left">
            {/* Button to apply the picked background color */}
            <Button
                buttonType='outlined'
                class={["p-2 h-8"]}
                title="Text background color"
                onClick={applyPickedBgColor} // Apply color on button click
            >
                <FormatInkHighlighter fill={selectedBgColor} /> {/* Icon reflects the currently selected background color */}
                <input
                    type="color"
                    value={selectedBgColor} // Bind to selectedBgColor
                    onInput={handleNativeBgColorInputChange} // Update selectedBgColor on input change
                    className="w-6 h-6"
                    onClick={e => e.stopPropagation()} // Prevent button click when clicking input
                />
            </Button>
        </div>
    )
}

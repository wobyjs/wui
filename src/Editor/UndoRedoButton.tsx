import { $, $$, defaults, type JSX, customElement, type ElementAttributes, HtmlClass, HtmlString, ObservableMaybe, HtmlBoolean, useEffect } from "woby"
import { Button, ButtonStyles } from '../Button'
import UndoIcon from '../icons/undo'
import RedoIcon from '../icons/redo'
import { useUndoRedo } from "./undoredo"

type UndoRedoMode = 'undo' | 'redo'

const def = () => ({
    type: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    mode: $("undo", HtmlString) as ObservableMaybe<UndoRedoMode>,
})

const UndoRedoButton = defaults(def, (props) => {
    // We don't destructure 'title' or 'disabled' here so we can control them dynamically
    const { mode, cls, class: cn, ...otherProps } = props
    const { redo, redos, undo, undos } = useUndoRedo()

    const isUndo = $($$(mode) === 'undo')

    // Dynamic Title
    const displayTitle = () => $$(isUndo) ? 'Undo' : 'Redo'

    // Dynamic Icon
    const displayIcon = () => $$(isUndo) ? <UndoIcon class="size-5" /> : <RedoIcon class="size-5" />

    // Dynamic Click Handler
    const handleClick = () => $$(isUndo) ? undo() : redo()

    // Dynamic Disabled State
    const handleDisabled = () => $$(isUndo) ? $$(undos).length === 1 : $$(redos).length === 0

    return (
        <Button
            title={displayTitle}
            // disabled={isBtnDisabled}
            disabled={handleDisabled}
            onClick={handleClick}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
            cls={() => [
                "border-none p-1.5 transition-all",
                "text-gray-700 hover:bg-gray-100 cursor-pointer",
                "disabled:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            ]}
            {...otherProps}
        >
            {displayIcon}
        </Button>
    )
})

export { UndoRedoButton }
customElement('wui-undoredo-button', UndoRedoButton)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-undoredo-button': ElementAttributes<typeof UndoRedoButton>
        }
    }
}

export default UndoRedoButton
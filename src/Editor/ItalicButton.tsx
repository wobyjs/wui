import { Button, ButtonStyles } from '../Button'
import ItalicIcon from '../icons/italic' // Renamed for clarity if Bold is a type/component elsewhere
import { useEditor, useUndoRedo, useFocusManager } from './undoredo' // useUndoRedo needed for saveDo
import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, Observable, ObservableMaybe, useEffect } from 'woby'
import { getCurrentEditor } from './utils'
import { updateStylesState } from './TextStyleButton'
import { applyItalic } from './StyleEngine'
import { localized } from '../i18n'


const def = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as ObservableMaybe<string>,
    class: $('', HtmlClass) as ObservableMaybe<string>,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const ItalicButton: Defaulted<typeof def> = defaults(def, (props) => {
    const { buttonType: btnType, title, cls, class: cn, disabled, ...otherProps } = props

    const editorNode = useEditor()
    const undoRedoContext = useUndoRedo()
    const saveDo = undoRedoContext?.saveDo || (() => {})
    const focusManager = useFocusManager()
    const isActive = $(false)
    const command = "italic"

    /**
     * Effect: Formatting State Controller
     *
     * Manages the lifecycle of a document-level listener to keep the button's
     * visual state synchronized with the current text selection.
     */
    useEffect(() => {
        const editor = editorNode ?? getCurrentEditor()

        if (!$$(editor) || typeof $$(editor).contains !== 'function') return

        const handler = () => { updateStylesState(isActive, editor, command) }

        document.addEventListener('selectionchange', handler)
        // Check initial state
        handler()

        return () => document.removeEventListener('selectionchange', handler)
    })

    const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault()
        // D-09: Cache selection BEFORE browser can move focus and clear it
        // onMouseDown fires before focus shift, onClick fires after
        if (focusManager) focusManager.beginCommand()
    }

    const handleClick = () => {
        // D-09: Apply formatting, selection already cached by onMouseDown
        applyItalic()
        if (focusManager) focusManager.endCommand()
        saveDo()
        // D-05: updateStylesState via selectionchange handles active state.
        // queryCommandState removed — it is shadow-DOM-blind.
    }

    return (
        <Button
            type={btnType}
            title={localized(title, 'editor.italic')}
            class={() => [
                () => $$(cls) ? $$(cls) : $$(cn),
                () => $$(isActive) ? '!bg-slate-200' : ''
            ]}
            aria-pressed={() => $$(isActive) ? "true" : "false"}
            disabled={disabled}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            {...otherProps}
        >
            <ItalicIcon />
        </Button>
    )
}) as typeof ItalicButton

export { ItalicButton }

customElement('wui-italic-button', ItalicButton)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-italic-button': ElementAttributes<typeof ItalicButton>
        }
    }
}

export default ItalicButton

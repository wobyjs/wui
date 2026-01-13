import { Button, ButtonStyles } from '../Button'
import BoldIcon from '../icons/bold' // Renamed for clarity if Bold is a type/component elsewhere
import { applyStyle, range, getCurrentRange } from './utils'
import { useEditor } from './undoredo' // useUndoRedo not directly needed here anymore
import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, Observable, ObservableMaybe, useEffect } from 'woby'

const def = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Bold", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})


const BoldButton = defaults(def, (props) => {
    const { buttonType: btnType, title, cls, class: cn, disabled, ...otherProps } = props

    const editorNode = useEditor()
    const isActive = $(false)

    useEffect(() => {
        // 1. ACCESS DOM ELEMENT
        // $$() unwraps the Woby observable to get the actual HTML <div> element
        // of the editor so we can check against it.
        const editor = $$(editorNode)

        // 2. SAFETY CHECK
        // If the editor component hasn't rendered yet or is missing, stop here
        // to prevent crashes (cannot read properties of null).
        if (!editor || typeof editor.contains !== 'function') return

        // 3. DEFINE LOGIC FUNCTION
        // We create a function to check the current state. We don't run it yet,
        // just defining what should happen when the cursor moves.
        const updateState = () => {

            // 4. CHECK FOCUS
            // document.activeElement is the item currently selected on the page.
            // We ensure the user is actually inside OUR editor (or a child element like <p> inside it)
            // so the button doesn't light up when selecting text elsewhere on the page.
            if (document.activeElement === editor || editor.contains(document.activeElement)) {
                try {
                    // 5. QUERY BROWSER NATIVE STATE
                    // 'document.queryCommandState' asks the browser: 
                    // "Is the text at the current cursor position BOLD?"
                    // It returns TRUE or FALSE.
                    // We pass that result directly to 'isActive', which updates the button UI.
                    isActive(document.queryCommandState('bold'))
                } catch (e) {
                    // 6. ERROR HANDLING
                    // If the browser throws an error (edge case), default to "Not Active".
                    isActive(false)
                }
            }
        }

        // 7. ATTACH EVENT LISTENER
        // 'selectionchange' fires whenever the cursor moves or text is highlighted.
        // We tell the document to run our 'updateState' function every time this happens.
        document.addEventListener('selectionchange', updateState)

        // 8. INITIAL RUN
        // We run the function manually once right now to ensure the button state 
        // is correct immediately on load, without waiting for the user to click first.
        updateState()

        // 9. CLEANUP FUNCTION
        // This runs when the component unmounts (is removed from screen).
        // We MUST remove the event listener to prevent memory leaks and errors
        // where the code tries to update a button that no longer exists.
        return () => document.removeEventListener('selectionchange', updateState)
    })

    const handleClick = (e: any) => {
        e.preventDefault() // Prevent button from stealing focus

        // Use CSS spans (<span style="font-weight: bold">) instead of <b> tags
        document.execCommand('styleWithCSS', false, 'true')

        // Execute Native Bold Command
        document.execCommand('bold', false)

        // Update state immediately
        isActive(document.queryCommandState('bold'))
    }

    return (
        <Button
            type={btnType}
            title={title}
            // class={[
            //     cls, "size-fit",
            //     () => $$(isActive) ? '!bg-slate-200' : ''
            // ]}

            class={() => [
                () => $$(cls) ? $$(cls) : cn,
                () => $$(isActive) ? '!bg-slate-200' : ''
            ]}
            aria-pressed={() => $$(isActive) ? "true" : "false"}
            disabled={disabled}
            onMouseDown={(e) => { e.preventDefault(); }}
            onClick={handleClick}
            {...otherProps}
        >
            <BoldIcon />
        </Button>
    )
}) as typeof BoldButton

export { BoldButton }

customElement('wui-bold-button', BoldButton)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-bold-button': ElementAttributes<typeof BoldButton>
        }
    }
}

export default BoldButton
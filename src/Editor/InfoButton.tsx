/** @jsxImportSource woby */

import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, Observable, ObservableMaybe, useEffect } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { useFocusManager, useUndoRedo } from './undoredo'
import { usePropertyPanel } from './PropertyPanel'
import { detectSelectionType } from './PropertyExtractor'

const def = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Properties", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as ObservableMaybe<string>,
    class: $('', HtmlClass) as ObservableMaybe<string>,
    disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
})

/**
 * InfoButton: Toolbar button that opens the PropertyPanel
 * for the currently selected element (image, text, or custom element).
 *
 * Follows the BoldButton pattern:
 * - onMouseDown: preventDefault + focusManager.beginCommand() to preserve selection
 * - onClick: detect selection, set target, toggle panel
 * - Uses usePropertyPanel() context to communicate with PropertyPanel
 */
const InfoButton = defaults(def, (props) => {
    const { buttonType: btnType, title, cls, class: cn, disabled } = props

    const focusManager = useFocusManager()
    const { saveDo } = useUndoRedo()
    const panelCtx = usePropertyPanel()

    const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault()
        focusManager.beginCommand()
    }

    const handleClick = () => {
        // CRITICAL: useContext() returns an observable — must unwrap with $$()
        const ctx = $$(panelCtx)
        if (!ctx) {
            console.warn('[InfoButton] PropertyPanelContext not available')
            focusManager.endCommand()
            return
        }

        const { panelOpen, propertyTarget, selectionType } = ctx

        // If panel is currently open, just close it
        if ($$(panelOpen)) {
            panelOpen(false)
            propertyTarget(null)
            selectionType('none')
            focusManager.endCommand()
            return
        }

        // Detect what's selected
        const { type, element } = detectSelectionType()

        if (type === 'none' || !element) {
            // Open panel with no selection — shows "No Selection" message
            propertyTarget(null)
            selectionType('none')
            panelOpen(true)
            focusManager.endCommand()
            return
        }

        // Set target, type, and open panel
        // CRITICAL: Set these BEFORE panelOpen(true) so PropertyPanel
        // can read them in its useEffect without re-detecting selection
        propertyTarget(element)
        selectionType(type)
        panelOpen(true)
        focusManager.endCommand()
    }

    return (
        <Button
            type={btnType}
            title={title}
            class={() => [
                () => $$(cls) ? $$(cls) : cn,
                "border-none hover:bg-gray-100 p-1.5"
            ]}
            disabled={disabled}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
        </Button>
    )
}) as typeof InfoButton

export { InfoButton }

customElement('wui-info-button', InfoButton)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-info-button': ElementAttributes<typeof InfoButton>
        }
    }
}

export default InfoButton

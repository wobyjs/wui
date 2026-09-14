/** @jsxImportSource woby */

import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, JSX, ObservableMaybe } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { useFocusManager } from './undoredo'
import { localized } from '../i18n'
import { startHelpTour } from './EditorHelpStep'

const def = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as ObservableMaybe<string>,
    class: $('', HtmlClass) as ObservableMaybe<string>,
    disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
})

/**
 * HelpButton: Toolbar button that starts the in-place help tour.
 *
 * Modelled on InfoButton — same mousedown-preventDefault + focusManager
 * dance to keep the caret alive, same `localized(title, 'editor.help')`
 * tooltip pattern. A host that wants to drive the tour from its own chrome
 * can hide the button with `hideToolbarItem('help')` and call
 * `startHelpTour()` directly; the button being presentation-only is the
 * documented three-verb distinction in EditorToolbarItem.
 */
const HelpButton: Defaulted<typeof def> = defaults(def, (props) => {
    const { buttonType: btnType, title, cls, class: cn, disabled } = props

    const focusManager = useFocusManager()

    const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault()
        focusManager.beginCommand()
    }

    const handleClick = () => {
        startHelpTour()
        focusManager.endCommand()
    }

    return (
        <Button
            type={btnType}
            title={localized(title, 'editor.help')}
            class={() => [
                () => $$(cls) ? $$(cls) : $$(cn),
                "border-none hover:bg-gray-100 p-1.5"
            ]}
            disabled={disabled}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
        >
            {/* Question mark in a circle — universally "help", colour matches the
                rest of the toolbar. */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
            </svg>
        </Button>
    )
}) as typeof HelpButton

export { HelpButton }

customElement('wui-help-button', HelpButton)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-help-button': ElementAttributes<typeof HelpButton>
        }
    }
}

export default HelpButton

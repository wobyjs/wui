import { $, $$, defaults, type JSX, isObservable, customElement, type ElementAttributes, type Observable, type CustomElementChildren, type StyleEncapsulationProps, useEffect, HtmlClass, HtmlString, ObservableMaybe, HtmlBoolean } from "woby"
import '@woby/chk'
import '../input.css'

import { Button, ButtonStyles } from '../Button'
import AlignCenter from '../icons/align_center'
import { useEditor } from './undoredo'
import { applyTextAlign } from './AlignButton'

// Default props
const def = () => ({
    type: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Align Center", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const AlignCenterButton = defaults(def, (props) => {
    const { type: buttonType, title, cls, class: cn, disabled, ...otherProps } = props
    const editor = useEditor()

    return (
        <Button
            type={buttonType}
            title={title}
            class={[() => $$(cls) ? $$(cls) : "", cn]}
            disabled={disabled}
            onClick={() => {
                applyTextAlign('center', editor)
            }}
            {...otherProps}
        >
            <AlignCenter />
        </Button>
    )
}) as typeof AlignCenterButton


export { AlignCenterButton }

customElement('wui-align-center-button', AlignCenterButton)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-align-center-button': ElementAttributes<typeof AlignCenterButton>
        }
    }
}

export default AlignCenterButton
import { Observable, $$, $, HtmlString, ObservableMaybe, HtmlClass, HtmlBoolean, defaults, StyleEncapsulationProps, customElement, ElementAttributes } from 'woby'
import { Button, ButtonStyles } from '../Button'
import AlignLeft from '../icons/align_left'
import { useEditor } from './undoredo'
import { findBlockParent, getCurrentRange } from './utils'
import { applyTextAlign } from './AlignButton'

// Default props
const def = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Align Left", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const AlignLeftButton = defaults(def, (props) => {
    const { buttonType, title, cls, class: cn, disabled, ...otherProps } = props
    const editor = useEditor()

    return (
        <Button
            type={buttonType}
            title={title}
            class={[() => $$(cls) ? $$(cls) : "", cn]}
            disabled={disabled}
            onClick={() => {
                applyTextAlign('left', editor)
            }}
            {...otherProps}
        >
            <AlignLeft />
        </Button>
    )
}) as typeof AlignLeftButton & StyleEncapsulationProps


export { AlignLeftButton }

customElement('wui-align-left-button', AlignLeftButton)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-align-left-button': ElementAttributes<typeof AlignLeftButton>
        }
    }
}

export default AlignLeftButton
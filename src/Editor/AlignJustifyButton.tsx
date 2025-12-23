import { Button, ButtonStyles } from '../Button'
import AlignJustify from '../icons/align_justify'
import { useEditor } from './undoredo' // Removed useUndoRedo
import { applyTextAlign } from './AlignButton'
import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, Observable, ObservableMaybe, StyleEncapsulationProps } from 'woby'


// Default props
const def = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Align Justify", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const AlignJustifyButton = defaults(def, (props) => {
    const { buttonType, title, cls, class: cn, disabled, ...otherProps } = props
    const editor = useEditor()

    return (
        <Button
            type={buttonType}
            title={title}
            class={[() => $$(cls) ? $$(cls) : "", cn]}
            disabled={disabled}
            onClick={() => {
                applyTextAlign('justify', editor)
            }}
            {...otherProps}
        >
            <AlignJustify />
        </Button>
    )
}) as typeof AlignJustifyButton & StyleEncapsulationProps


export { AlignJustifyButton }

customElement('wui-align-justify-button', AlignJustifyButton)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-align-justify-button': ElementAttributes<typeof AlignJustifyButton>
        }
    }
}

export default AlignJustifyButton
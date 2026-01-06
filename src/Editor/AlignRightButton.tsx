import { Button, ButtonStyles } from '../Button'
import AlignRight from '../icons/align_right'
import { useEditor } from './undoredo' // Removed useUndoRedo
import { applyTextAlign } from './AlignButton'
import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, Observable, ObservableMaybe, StyleEncapsulationProps } from 'woby'


// Default props
const def = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Align Right", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const AlignRightButton = defaults(def, (props) => {
    const { buttonType, title, cls, class: cn, disabled, ...otherProps } = props
    const editor = useEditor()

    return (
        <Button
            type={buttonType}
            title={title}
            class={[() => $$(cls) ? $$(cls) : "", cn]}
            disabled={disabled}
            onClick={() => {
                applyTextAlign('right', editor)
            }}
            {...otherProps}
        >
            <AlignRight />
        </Button>
    )
}) as typeof AlignRightButton & StyleEncapsulationProps


export { AlignRightButton }

customElement('wui-align-right-button', AlignRightButton)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-align-right-button': ElementAttributes<typeof AlignRightButton>
        }
    }
}

export default AlignRightButton
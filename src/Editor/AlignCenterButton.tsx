import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, Observable, ObservableMaybe, useEffect } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { applyTextAlign, updateActiveStatus } from './AlignButton'
import { getCurrentEditor, useBlockEnforcer } from './utils'
import { useEditor } from './undoredo'
import AlignCenter from '../icons/align_center'

// Default props
const def = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Align Center", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const AlignCenterButton = defaults(def, (props) => {
    const { buttonType, title, cls, class: cn, disabled, ...otherProps } = props
    const editor = useEditor()

    const alignment = 'center'
    const isActive = $(false);

    useEffect(() => {
        const el = editor ?? getCurrentEditor()
        useBlockEnforcer($$(el))
    })

    useEffect(() => {
        // 1. Get the actual HTML Element
        const el = editor ?? getCurrentEditor();
        if (!el) return;

        // 2. Create a stable reference for the handler
        // This ensures addEventListener and removeEventListener refer to the SAME function
        const handler = () => {
            updateActiveStatus(alignment, isActive, el);
        };

        // 3. Attach listeners to the UNWRAPPED element 'el'
        document.addEventListener('selectionchange', handler);
        $$(el).addEventListener('click', handler);
        $$(el).addEventListener('keyup', handler);
        $$(el).addEventListener('mouseup', handler);

        // Run initial check
        handler();

        return () => {
            document.removeEventListener('selectionchange', handler);
            $$(el).removeEventListener('click', handler);
            $$(el).removeEventListener('keyup', handler);
            $$(el).removeEventListener('mouseup', handler);
        };
    });

    const handleClick = () => {
        const editorDiv = editor || getCurrentEditor()

        applyTextAlign(alignment, editorDiv)
        isActive(true)

        document.dispatchEvent(new Event('selectionchange'))
        $$(editorDiv).focus()
    }

    return (
        <Button
            type={buttonType}
            title={title}
            class={[
                () => $$(cls) ? $$(cls) : "",
                cn,
                () => $$(isActive) ? '!bg-slate-200' : '',
            ]}
            disabled={disabled}
            onClick={handleClick}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
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
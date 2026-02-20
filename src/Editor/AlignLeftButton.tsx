import { Observable, $$, $, HtmlString, ObservableMaybe, HtmlClass, HtmlBoolean, defaults, StyleEncapsulationProps, customElement, ElementAttributes, useEffect } from 'woby'
import { Button, ButtonStyles } from '../Button'
import AlignLeft from '../icons/align_left'
import { useEditor } from './undoredo'
import { findBlockParent, getCurrentEditor, getCurrentRange, useBlockEnforcer } from './utils'
import { applyTextAlign, updateActiveStatus } from './AlignButton'

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

    const alignment = 'left'
    const isActive = $(false);


    useEffect(() => { useBlockEnforcer($$(editor) ?? $$(getCurrentEditor())) })

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

    const handleClick = (e: any) => {
        e.preventDefault()

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
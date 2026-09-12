import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, Observable, ObservableMaybe, useEffect } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { applyTextAlign, updateActiveStatus, ALIGNMENT_MAP } from './AlignButton'
import { getCurrentEditor, useBlockEnforcer } from './utils'
import { useEditor } from './undoredo'
import { applyBlockCommandToSelectedImage } from './ImageActions'
import { localized } from '../i18n'

const CENTER_MAP = ALIGNMENT_MAP.center

const def = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class,
    class: $('', HtmlClass) as JSX.Class,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const AlignCenterButton: Defaulted<typeof def> = defaults(def, (props) => {
    const { buttonType, title, cls, class: cn, disabled, ...otherProps } = props
    const editor = useEditor()

    const alignment = CENTER_MAP.align
    const toAdd = CENTER_MAP.classToAdd
    const toRemove = CENTER_MAP.classToRemove

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

        // Run initial check
        handler();

        return () => {
            document.removeEventListener('selectionchange', handler);
            $$(el).removeEventListener('click', handler);
            $$(el).removeEventListener('keyup', handler);
        };
    });

    const handleClick = () => {
        // Check for image selection first - route to image handler
        if (applyBlockCommandToSelectedImage('align-center')) {
            isActive(true)
            return
        }

        const editorDiv = editor || getCurrentEditor()

        applyTextAlign(alignment, { toAdd, toRemove }, editorDiv)
        isActive(true)

        document.dispatchEvent(new Event('selectionchange'))
        $$(editorDiv).focus({ preventScroll: true })
    }

    return (
        <Button
            type={buttonType}
            title={localized(title, CENTER_MAP.titleKey)}
            class={[
                () => $$(cls) ? $$(cls) : "",
                cn,
                () => $$(isActive) ? '!bg-slate-200' : '',
            ]}
            disabled={disabled}
            onClick={handleClick}
            onMouseDown={(e: any) => { e.preventDefault(); e.stopPropagation() }}
            {...otherProps}
        >
            {CENTER_MAP.icon}
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
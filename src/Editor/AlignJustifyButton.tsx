import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, Observable, ObservableMaybe, useEffect } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { updateActiveStatus, ALIGNMENT_MAP } from './AlignButton'
// Same source AlignButton uses: the StyleEngine version resolves the editor's shadow root itself,
// whereas AlignButton's own legacy `applyTextAlign` needs an explicit class pair and container.
import { applyTextAlign as applyTextAlignStyle } from './StyleEngine'
import { getCurrentEditor, useBlockEnforcer } from './utils'
import { useEditor } from './undoredo'
import { applyBlockCommandToSelectedImage } from './ImageActions'

const JUSTIFY_MAP = ALIGNMENT_MAP.justify

const def = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $(JUSTIFY_MAP.defaultTitle, HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class,
    class: $('', HtmlClass) as JSX.Class,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const AlignJustifyButton: Defaulted<typeof def> = defaults(def, (props) => {
    const { buttonType, title, cls, class: cn, disabled, ...otherProps } = props
    const editor = useEditor()

    const alignment = JUSTIFY_MAP.align
    const toAdd = JUSTIFY_MAP.classToAdd
    const toRemove = JUSTIFY_MAP.classToRemove
    
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
        // Check for image selection first - route to image handler
        if (applyBlockCommandToSelectedImage('align-justify')) {
            isActive(true)
            return
        }

        applyTextAlignStyle(alignment)
        isActive(true)
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
            onMouseDown={(e: any) => { e.preventDefault(); e.stopPropagation() }}
            {...otherProps}
        >
            {JUSTIFY_MAP.icon}
        </Button>
    )
}) as typeof AlignJustifyButton

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
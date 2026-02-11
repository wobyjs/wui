import { $, $$, defaults, type JSX, isObservable, customElement, type ElementAttributes, type Observable, type CustomElementChildren, type StyleEncapsulationProps, useEffect, HtmlClass, HtmlString, ObservableMaybe, HtmlBoolean } from "woby"
import '@woby/chk'
import '../input.css'

import { Button, ButtonStyles } from '../Button'
import AlignCenter from '../icons/align_center'
import { useEditor } from './undoredo'
import { applyTextAlign, useAlignStatus } from './AlignButton'
import { getCurrentEditor, useBlockEnforcer } from "./utils"

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

    const alignment = 'center'
    const isActive = useAlignStatus(alignment, editor);
    // Enforce block-level structure in the editor to prevent loose text nodes.
    // This ensures all content is wrapped in block elements (like <div>),
    // which is essential for proper text alignment and formatting.
    useEffect(() => { useBlockEnforcer($$(editor) ?? $$(getCurrentEditor())) })

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
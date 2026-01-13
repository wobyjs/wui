import { $, $$, defaults, type JSX, isObservable, customElement, type ElementAttributes, type Observable, type CustomElementChildren, type StyleEncapsulationProps, useEffect, HtmlClass, HtmlString, ObservableMaybe, HtmlBoolean } from "woby"
import '@woby/chk'
import '../input.css'

import { Button, ButtonStyles } from '../Button'
import { useEditor } from './undoredo'
import { findBlockParent, getCurrentRange } from './utils'
import AlignCenter from '../icons/align_center'
import AlignLeft from '../icons/align_left'
import AlignRight from '../icons/align_right'
import AlignJustify from '../icons/align_justify'


type ContentAlign = 'left' | 'center' | 'right' | 'justify'

// Default props
const def = () => ({
    type: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Align Center", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
    mode: $("center", HtmlString) as ObservableMaybe<ContentAlign>,
})

const AlignButton = defaults(def, (props) => {
    const { type: buttonType, title, cls, class: cn, disabled, mode, ...otherProps } = props as any
    const editor = useEditor()

    // Extract onClick from otherProps if provided
    const customOnClick = otherProps.onClick as ((e: any) => void) | undefined

    // Content alignment logic
    const alignmentMap = {
        'left': { icon: <AlignLeft />, align: 'left' as const, defaultTitle: 'Align Left' },
        'center': { icon: <AlignCenter />, align: 'center' as const, defaultTitle: 'Align Center' },
        'right': { icon: <AlignRight />, align: 'right' as const, defaultTitle: 'Align Right' },
        'justify': { icon: <AlignJustify />, align: 'justify' as const, defaultTitle: 'Align justify' },
    }

    const currentAlignment = () => {
        const align = $$(mode)
        return alignmentMap[align as keyof typeof alignmentMap]
    }

    const displayIcon = () => {
        return currentAlignment().icon
    }

    const displayTitle = () => {
        return currentAlignment().defaultTitle
    }

    const handleClick = (e: any) => {
        e.preventDefault()

        if (customOnClick) {
            customOnClick(e)
            return
        }

        const alignment = currentAlignment().align
        applyTextAlign(alignment as ContentAlign, editor)
    }

    return (
        <Button
            type={buttonType}
            title={displayTitle}
            class={[() => $$(cls) ? $$(cls) : "", cn]}
            disabled={disabled}
            onClick={handleClick}
            {...otherProps}
        >
            {displayIcon}
        </Button>
    )
}) as typeof AlignButton

export { AlignButton }

customElement('wui-align-button', AlignButton)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-align-button': ElementAttributes<typeof AlignButton>
        }
    }
}

export default AlignButton

export const applyTextAlign = (alignment: ContentAlign, editor: Observable<HTMLDivElement>) => {
    // Get selection directly from window to ensure it's current
    const windowSelection = window.getSelection()
    if (!windowSelection || windowSelection.rangeCount === 0) {
        // console.log('No selection found')
        return
    }

    const ranges = windowSelection.getRangeAt(0)
    if (!ranges) return

    let parentElement = ranges.commonAncestorContainer as HTMLElement
    if (parentElement.nodeType === 3)
        parentElement = parentElement.parentElement as HTMLElement

    if (!parentElement) return

    const blockElement = findBlockParent(parentElement, editor)
    if (blockElement) {
        blockElement.style.textAlign = alignment
        // console.log('Applied alignment to blockElement:', alignment)
    } else {
        if ($$(editor)) {
            $$(editor).style.textAlign = alignment
            // console.log('Applied alignment to editor:', alignment)
        }
    }
}

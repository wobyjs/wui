import { $, $$, defaults, type JSX, isObservable, customElement, type ElementAttributes, type Observable, type CustomElementChildren, type StyleEncapsulationProps, useEffect } from "woby"
import '@woby/chk'
import '../input.css'

import { Button } from '../Button'
import { useEditor } from './undoredo'
import { findBlockParent, getCurrentRange } from './utils'
import AlignCenter from '../icons/align_center'
import AlignLeft from '../icons/align_left'
import AlignRight from '../icons/align_right'

type ContentAlign = 'start' | 'center' | 'end'

// Default props
const def = () => ({
    buttonType: $("outlined" as "text" | "contained" | "outlined" | "icon"),
    title: $("Align Center"),
    class: $(""),
    disabled: $(false) as Observable<boolean>,
    children: $(<AlignCenter />) as Observable<JSX.Element>,
    contentAlign: $("center" as ContentAlign),
})

const AlignButton = defaults(def, (props) => {
    const { buttonType, title, class: cls, disabled, children, contentAlign, ...otherProps } = props as any
    const editor = useEditor();

    // Extract onClick from otherProps if provided
    const customOnClick = otherProps.onClick as ((e: any) => void) | undefined

    // Content alignment logic
    const alignmentMap = {
        'start': { icon: <AlignLeft />, align: 'left' as const, defaultTitle: 'Align Left' },
        'center': { icon: <AlignCenter />, align: 'center' as const, defaultTitle: 'Align Center' },
        'end': { icon: <AlignRight />, align: 'right' as const, defaultTitle: 'Align Right' },
    }

    const currentAlignment = () => {
        const align = $$(contentAlign)
        return alignmentMap[align as keyof typeof alignmentMap]
    }

    const displayIcon = () => {
        return currentAlignment().icon
    }

    const displayTitle = () => {
        const titleValue = $$(title)

        // If title is customized (not default), use it
        if (titleValue !== "Align Center") {
            return titleValue
        }

        // Use mapped title for alignment
        return currentAlignment().defaultTitle
    }

    const handleClick = (e: any) => {
        // CRITICAL: Prevent the button from taking focus and clearing the selection
        e.preventDefault()

        // console.log('AlignButton clicked!', { contentAlign: $$(contentAlign), editor: $$(editor) })

        // If custom onClick is provided, use it
        if (customOnClick) {
            // console.log('Using custom onClick')
            customOnClick(e)
            return
        }

        // Apply alignment
        const alignment = currentAlignment().align
        // console.log('Applying alignment:', alignment)
        applyTextAlign(alignment as 'left' | 'center' | 'right', editor)
    }

    return (
        <div>
            {/* <p style={"margin-bottom: 10px; color: black;"}>Content Align: <span style={"font-weight: bold; color: blue;"}>{contentAlign}</span></p> */}
            <Button
                buttonType={buttonType}
                title={displayTitle}
                class={cls}
                disabled={disabled}
                onClick={handleClick}
                {...otherProps}
            >
                {displayIcon}
            </Button>
        </div>

    )
}) as typeof AlignButton & StyleEncapsulationProps

export { AlignButton }

// NOTE: Register the custom element
customElement('wui-align-button', AlignButton);

// NOTE: Add the custom element to the JSX namespace
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-align-button': ElementAttributes<typeof AlignButton>
        }
    }
}

export default AlignButton

const applyTextAlign = (alignment: 'left' | 'center' | 'right', editor: Observable<HTMLDivElement>) => {
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

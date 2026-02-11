import { $, $$, defaults, type JSX, isObservable, customElement, type ElementAttributes, type Observable, type CustomElementChildren, type StyleEncapsulationProps, useEffect, HtmlClass, HtmlString, ObservableMaybe, HtmlBoolean } from "woby"
import '@woby/chk'
import '../input.css'

import { Button, ButtonStyles } from '../Button'
import { useEditor } from './undoredo'
import { findBlockParent, getActiveSelection, getCurrentEditor, useBlockEnforcer } from './utils'
import AlignCenter from '../icons/align_center'
import AlignLeft from '../icons/align_left'
import AlignRight from '../icons/align_right'
import AlignJustify from '../icons/align_justify'
import { getCurrentBlockInfo } from "./Blockquote"


type ContentAlign = 'left' | 'center' | 'right' | 'justify'

// Default props
const def = () => ({
    type: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Align Left", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
    mode: $("left", HtmlString) as ObservableMaybe<ContentAlign>,
})

const AlignButton = defaults(def, (props) => {
    const { type: buttonType, title, cls, class: cn, disabled, mode, ...otherProps } = props as any
    const editor = useEditor()

    const isActive = useAlignStatus($$(mode), editor);
    // Enforce block-level structure in the editor to prevent loose text nodes.
    // This ensures all content is wrapped in block elements (like <div>),
    // which is essential for proper text alignment and formatting.
    useEffect(() => { useBlockEnforcer($$(editor) ?? $$(getCurrentEditor())) })

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
        const editorDiv = editor || getCurrentEditor()

        if (customOnClick) {
            customOnClick(e)
            return
        }

        const alignment = currentAlignment().align

        applyTextAlign(alignment as ContentAlign, editorDiv)
        isActive(true)
        document.dispatchEvent(new Event('selectionchange'))
        $$(editorDiv).focus()
    }

    return (
        <Button
            type={buttonType}
            title={displayTitle}
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

// #region Alignment Utilities
/**
 * Applies text alignment to the currently selected block or the editor root.
 * 
 * @param alignment - The target alignment direction ('left', 'center', 'right', or 'justify').
 * @param editor - The Observable representing the editor root element.
 */
export const applyTextAlign = (alignment: ContentAlign, editor: Observable<HTMLDivElement>) => {
    // Get selection directly from window to ensure it's current
    // const windowSelection = window.getSelection()
    const windowSelection = getActiveSelection($$(editor))

    if (!windowSelection || windowSelection.rangeCount === 0) {
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
    } else {
        if ($$(editor)) {
            $$(editor).style.textAlign = alignment
        }
    }
}

/**
 * Monitors the editor selection to determine if the current block matches a specific alignment.
 * 
 * @param targetMode - The alignment to check for (e.g., 'left', 'center').
 * @param editor - The editor element observable.
 * @returns An Observable<boolean> representing the active state.
 */
export const useAlignStatus = (targetMode: ObservableMaybe<ContentAlign>, editor: Observable<HTMLDivElement | undefined>) => {
    const isActive = $(false);

    const updateActiveStatus = () => {
        const editorDiv = $$(editor) ?? $$(getCurrentEditor());
        if (!editorDiv) return;

        const selection = getActiveSelection(editorDiv);

        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const block = getCurrentBlockInfo(editorDiv, range);

            if (!block) {
                isActive(false);
                return;
            }

            // Handle default alignment: if style is empty, browser default is 'left'
            const currentAlign = block.style.textAlign.toLowerCase();
            const target = $$(targetMode).toLowerCase();

            isActive(currentAlign === target);
        } else {
            isActive(false);
        }
    };

    useEffect(() => {
        // 1. Listen for global selection changes
        document.addEventListener('selectionchange', updateActiveStatus);

        // 2. Listen for editor-specific interactions
        const editorDiv = $$(editor) ?? $$(getCurrentEditor());
        if (editorDiv) {
            editorDiv.addEventListener('click', updateActiveStatus);
            editorDiv.addEventListener('keyup', updateActiveStatus);
            editorDiv.addEventListener('mouseup', updateActiveStatus);
        }

        // Run initial check
        updateActiveStatus();

        // Cleanup listeners on unmount
        return () => {
            document.removeEventListener('selectionchange', updateActiveStatus);
            if (editorDiv) {
                editorDiv.removeEventListener('click', updateActiveStatus);
                editorDiv.removeEventListener('keyup', updateActiveStatus);
                editorDiv.removeEventListener('mouseup', updateActiveStatus);
            }
        };
    });

    return isActive;
};
// #endregion
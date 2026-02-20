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
    const isActive = $(false)

    useEffect(() => { useBlockEnforcer($$(editor) ?? $$(getCurrentEditor())) })

    /**
     * Effect: Alignment State Controller
     * 
     * Orchestrates the lifecycle of event listeners required to keep the alignment button 
     * synchronized with the editor's content.
     */
    useEffect(() => {
        // 1. Get the actual HTML Element
        const el = editor ?? getCurrentEditor();
        if (!el) return;

        // 2. Create a stable reference for the handler
        // This ensures addEventListener and removeEventListener refer to the SAME function
        const handler = () => {
            updateActiveStatus($$(mode), isActive, el);
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
 * Logic: Alignment State Synchronizer
 * 
 * Inspects the DOM structure at the current caret (cursor) position to determine 
 * if the text alignment matches a specific target mode.
 * 
 * @param targetMode - The alignment string to check for (e.g., 'left', 'center', 'right', 'justify').
 * @param isActive   - The Woby Observable boolean that drives the visual active state of the button.
 * @param editor     - The Observable reference to the editor root element.
 * 
 * @returns The isActive observable, updated based on the detected block-level styles.
 */
export const updateActiveStatus = (targetMode: string, isActive: Observable<boolean>, editor: Observable<HTMLDivElement>) => {
    const modeValue = $$(targetMode);
    const editorDiv = $$(editor);


    if (!editorDiv) {
        console.warn(`[useAlignStatus:${modeValue}] Editor div not found.`);
        return;
    }

    const selection = getActiveSelection(editorDiv);

    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const block = getCurrentBlockInfo(editorDiv, range);

        // console.groupCollapsed(`[useAlignStatus:${modeValue}] Update`);

        if (!block) {
            // console.log("Verdict: No block element found at cursor.");
            isActive(false);
            console.groupEnd();
            return;
        }

        // Fallback to 'left' if style is empty, because that is the browser default
        const currentAlign = block.style.textAlign.toLowerCase();
        const target = modeValue.toLowerCase();
        const isMatch = currentAlign === target;

        // console.log("Information:", { target: target, detected: currentAlign, element: `<${block.tagName.toLowerCase()}>`, fullStyle: block.getAttribute('style'), isMatch: isMatch });

        if ($$(isActive) !== isMatch) {
            // console.log(`Action: Setting isActive to `, isMatch);
            isActive(isMatch);
        }

        // console.groupEnd();
    } else {
        // No selection usually means the editor isn't focused
        isActive(false);
    }

    return isActive
};
// #endregion
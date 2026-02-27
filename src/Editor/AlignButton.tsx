import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, Observable, ObservableMaybe, useEffect } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { findBlockParent, getSelection, getCurrentEditor, useBlockEnforcer } from './utils'
import { useEditor } from './undoredo'
import { getCurrentBlockInfo } from "./Blockquote"
import { getAffectedParagraphs } from "./FontSize"
import AlignCenter from '../icons/align_center'
import AlignLeft from '../icons/align_left'
import AlignRight from '../icons/align_right'
import AlignJustify from '../icons/align_justify'

type ContentAlign = 'left' | 'center' | 'right' | 'justify'

export const ALIGNMENT_MAP = {
    'left': { icon: <AlignLeft />, align: 'left' as const, defaultTitle: 'Align Left' },
    'center': { icon: <AlignCenter />, align: 'center' as const, defaultTitle: 'Align Center' },
    'right': { icon: <AlignRight />, align: 'right' as const, defaultTitle: 'Align Right' },
    'justify': { icon: <AlignJustify />, align: 'justify' as const, defaultTitle: 'Align justify' },
}

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

    useEffect(() => {
        const el = editor ?? getCurrentEditor()
        useBlockEnforcer($$(el))
    })

    /**
     * Effect: Alignment State Controller
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

    const currentAlignment = () => {
        const align = $$(mode)
        return ALIGNMENT_MAP[align as keyof typeof ALIGNMENT_MAP]
    }

    const displayIcon = () => { return currentAlignment().icon; }

    const displayTitle = () => { return currentAlignment().defaultTitle; }

    const handleClick = (e: any) => {
        const editorDiv = editor || getCurrentEditor()

        if (customOnClick) {
            customOnClick(e)
            return
        }

        const alignment = currentAlignment().align

        console.log("[Align Button] editor div: ", $$(editorDiv))
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
export const applyTextAlign = (alignment: ContentAlign, container: Observable<HTMLDivElement>) => {
    const { selection } = getSelection($$(container))

    if (!selection || selection.rangeCount === 0) { return }

    const ranges = selection.getRangeAt(0)
    if (!ranges) return

    let parentElement = ranges.commonAncestorContainer as HTMLElement
    if (parentElement.nodeType === 3) parentElement = parentElement.parentElement as HTMLElement

    if (!parentElement) return

    const isRoot = parentElement.hasAttribute('data-editor-root');

    const targets = isRoot ? getAffectedParagraphs($$(container), selection) : [parentElement];


    targets.forEach((target, index) => {
        const block = findBlockParent(target, container);
        if (block) {
            block.style.textAlign = alignment;
        } else {
            $$(container).style.textAlign = alignment;
        }
    });
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

    const { selection } = getSelection(editorDiv);

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
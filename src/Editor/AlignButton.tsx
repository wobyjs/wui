import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, Observable, ObservableMaybe, useEffect } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { getSelection, getCurrentEditor, useBlockEnforcer, BLOCK_TAGS, getCurrentBlock, getSelectedBlocks } from './utils'
import { useEditor } from './undoredo'
import AlignCenter from '../icons/align_center'
import AlignLeft from '../icons/align_left'
import AlignRight from '../icons/align_right'
import AlignJustify from '../icons/align_justify'

type ContentAlign = 'left' | 'center' | 'right' | 'justify'

export const ALIGNMENT_MAP = {
    'left': {
        icon: <AlignLeft />,
        align: 'left' as const,
        defaultTitle: 'Align Left',
        classToAdd: 'text-left',
        classToRemove: 'text-center text-right text-justify'
    },
    'center': {
        icon: <AlignCenter />,
        align: 'center' as const,
        defaultTitle: 'Align Center',
        classToAdd: 'text-center',
        classToRemove: 'text-left text-right text-justify'
    },
    'right': {
        icon: <AlignRight />,
        align: 'right' as const,
        defaultTitle: 'Align Right',
        classToAdd: 'text-right',
        classToRemove: 'text-left text-center text-justify'
    },
    'justify': {
        icon: <AlignJustify />,
        align: 'justify' as const,
        defaultTitle: 'Align Justify',
        classToAdd: 'text-justify',
        classToRemove: 'text-left text-center text-right'
    },
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
        applyTextAlign(alignment as ContentAlign, { toAdd: ALIGNMENT_MAP[alignment].classToAdd, toRemove: ALIGNMENT_MAP[alignment].classToRemove }, editorDiv)
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
export const applyTextAlign = (alignment: ContentAlign, classes: { toAdd: string, toRemove: string }, container: Observable<HTMLDivElement>) => {
    const { selection } = getSelection($$(container))

    if (!selection || selection.rangeCount === 0) { return }

    const ranges = selection.getRangeAt(0)
    if (!ranges) return

    let parentElement = ranges.commonAncestorContainer as HTMLElement
    if (parentElement.nodeType === 3) parentElement = parentElement.parentElement as HTMLElement

    if (!parentElement) return

    // let selectedItems = getSelectedBlocks(parentElement, selection)
    let selectedItems = getSelectedBlocks(parentElement, ranges, BLOCK_TAGS.filter((tag) => !['UL', 'OL'].includes(tag)));
    if (selectedItems.length == 0) {
        selectedItems = [parentElement]
    }

    selectedItems.forEach((target, index) => {
        console.log(`[Alignment] #${index + 1} Setting ${target.tagName.toLowerCase()} to ${alignment}`);

        const toAdd = classes.toAdd.split(' ').filter(c => c);
        const toRemove = classes.toRemove.split(' ').filter(c => c);

        if (target instanceof HTMLElement) {
            target.classList.add(...toAdd);
            target.classList.remove(...toRemove);
        }
    })
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

    const block = getCurrentBlock(editorDiv);
    if (!block) {
        isActive(false);
        return;
    }

    const alignmentClass = ALIGNMENT_MAP[modeValue.toLowerCase() as keyof typeof ALIGNMENT_MAP]?.classToAdd;
    const isMatch = block.classList.contains(alignmentClass);

    if ($$(isActive) !== isMatch) {
        isActive(isMatch);
    }
    return isActive
};
// #endregion

/**
 * Generic helper to find ALL selected block-level elements.
 */
// export const getSelectedBlocks = (container: HTMLElement, selection: Selection | null): HTMLElement[] => {
//     const selectedBlocks: HTMLElement[] = [];

//     if (!selection || selection.rangeCount === 0) return selectedBlocks;

//     if (selection.isCollapsed) {
//         // Blinking Cursor: Find the closest block tag
//         let node = selection.anchorNode;
//         if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement;

//         // closest() takes a CSS selector string!
//         const block = (node as HTMLElement)?.closest(BLOCK_TAGS.join(','));

//         if (block && container.contains(block)) {
//             selectedBlocks.push(block as HTMLElement);
//         }
//     } else {
//         // Highlighted Text: Find all block tags inside the container
//         // We use the comma-separated string to find P, H1, LI, etc. all at once
//         const allBlocks = container.querySelectorAll<HTMLElement>(BLOCK_TAGS.join(','));

//         allBlocks.forEach(block => {
//             // 'true' means include even if partially selected
//             if (selection.containsNode(block, true)) {

//                 // Extra safety: Ignore the main editor root div itself
//                 if (!block.hasAttribute('data-editor-root')) {
//                     selectedBlocks.push(block);
//                 }
//             }
//         });
//     }

//     return selectedBlocks;
// };
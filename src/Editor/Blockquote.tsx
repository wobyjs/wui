import { Button, ButtonStyles } from '../Button'
import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, Observable, ObservableMaybe, useEffect } from "woby"
import { useEditor } from './undoredo'
import { getCurrentEditor, getSelection, BLOCK_TAGS, isSelectionInside } from './utils'

// change 'inline-block' to 'block'
export const QUOTE_CLASSES = "text-[15px] text-[#65676b] ml-10 mr-0 mt-0 mb-2.5 pl-2 border-l-[#ced0d4] border-l-4 border-solid block italic"
export const QUOTE_TAG = "blockquote"

const def = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("Convert to Blockquote", HtmlString) as ObservableMaybe<string>,
    label: $("Blockquote", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
})

const Blockquote = defaults(def, (props) => {

    const { buttonType: btnType, title: buttonTitle, label: buttonLabel, cls, class: cn, disabled, ...otherProps } = props

    const editor = useEditor()
    const isActive = $(false)

    const toggleBlockquote = () => {
        isActive(!$$(isActive))

        const editorDiv = $$(editor) ?? $$(getCurrentEditor())

        if (!editorDiv) { console.warn("[Blockquote] no editor found."); return; }

        if (!$$(isActive)) {
            unwrapBlockquote(editorDiv)
        } else {
            applyFormatBlock(editorDiv, QUOTE_TAG, QUOTE_CLASSES)
        }
        $$(editorDiv).focus()
    }

    /**
     * Logic to check if the current cursor position is inside a blockquote
     */
    const updateActiveStatus = () => {
        const editorDiv = $$(editor) ?? $$(getCurrentEditor())
        if (!editorDiv) return

        const isInsideBlockquote = isSelectionInside(editorDiv, QUOTE_TAG)
        isActive(isInsideBlockquote);
    }

    // Monitor selection changes
    useEffect(() => {
        // 1. Listen for global selection changes
        document.addEventListener('selectionchange', updateActiveStatus)

        // 2. Also listen for keyup/mouseup inside the editor for immediate feedback
        const editorDiv = $$(editor) ?? $$(getCurrentEditor())
        if (editorDiv) {
            editorDiv.addEventListener('keyup', updateActiveStatus)
            editorDiv.addEventListener('mouseup', updateActiveStatus)
        }

        // Cleanup listeners
        return () => {
            document.removeEventListener('selectionchange', updateActiveStatus)
            if (editorDiv) {
                editorDiv.removeEventListener('keyup', updateActiveStatus)
                editorDiv.removeEventListener('mouseup', updateActiveStatus)
            }
        }
    })

    return (
        <Button
            type={btnType}
            disabled={disabled}
            title={buttonTitle}
            class={() => [
                () => $$(cls) ? $$(cls) : cn,
                () => $$(isActive) ? '!bg-slate-200' : ''
            ]}
            onClick={toggleBlockquote}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
        >
            <span class="flex items-center gap-2">
                {buttonLabel}
            </span>
        </Button>
    )
})

export { Blockquote }

customElement('wui-blockquote', Blockquote)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-blockquote': ElementAttributes<typeof Blockquote>
        }
    }
}


export default Blockquote


// #region Helper Functions
const applyFormatBlock = (editor: HTMLDivElement, tag: string, className: string) => {
    console.log("Apply Format Block")
    const { selection } = getSelection(editor);
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0)

    const allBlocks = Array.from(editor.querySelectorAll(BLOCK_TAGS.join(',')));
    const selectedBlocks = new Set<HTMLElement>();

    allBlocks.forEach(block => {
        if (range.intersectsNode(block)) {
            let element = block as HTMLElement;

            if (element.tagName === 'LI') {
                const parentList = element.closest('ul, ol');
                if (parentList) {
                    element = parentList as HTMLElement;
                }
            }

            selectedBlocks.add(element);
        }
    });

    const blocksArray = Array.from(selectedBlocks);
    if (blocksArray.length === 0) return;

    // 1. Create the new container
    const container = document.createElement(tag);
    container.className = className;

    // 2. Insert the container into the DOM before the first selected block
    const firstBlock = blocksArray[0];
    firstBlock.parentNode?.insertBefore(container, firstBlock);
    console.log("First Block: ", firstBlock);

    // 3. Move all selected blocks inside the new container
    selectedBlocks.forEach(block => {
        container.appendChild(block);
    });

    console.log("Successfully wrapped", blocksArray.length, "blocks in", tag);
}

const unwrapBlockquote = (editor: HTMLDivElement) => {
    const { selection } = getSelection(editor);
    if (!selection || selection.rangeCount === 0) return;

    // 1. Find the parent blockquote of the current cursor position
    const cursorNode = selection.anchorNode;
    const blockquote = (cursorNode instanceof HTMLElement ? cursorNode : cursorNode?.parentElement)?.closest('blockquote');

    if (!blockquote) {
        console.log("No blockquote found to unwrap!");
        return;
    }

    // 2. Unwrap the blockquote
    const parent = blockquote.parentNode;
    if (!parent) return;

    // Move every child (P, UL, etc.) out of the blockquote 
    // and place them right before the blockquote tag in the DOM
    while (blockquote.firstChild) {
        parent.insertBefore(blockquote.firstChild, blockquote);
    }

    // 3. Remove the empty blockquote
    blockquote.remove();

    console.log("Blockquote unwrapped successfully.");
};
// #endregion
import { $, $$, render, customElement, defaults, ElementAttributes, HtmlClass, HtmlString, ObservableMaybe, useEffect, } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { useEditor } from './undoredo'
import { Checkbox } from '../Checkbox'
import { getSelection, getCurrentEditor, selectElement, restoreSelection, restoreRangePosition, getClosestElementFromSelection, BLOCK_TAGS } from './utils'
import ListBulleted from '../icons/list_bulleted'
import ListNumbered from '../icons/list_numbered'
import ListCheckbox from '../icons/list_checkbox'
import { getSelectedBlocks } from './AlignButton'

// #region Types & Configuration
type ListMode = "bullet" | "number" | "checkbox"

const LIST_CONFIG = {
    bullet: { tag: 'ul', id: 'bullet-wrapper', classToAdd: 'list-disc', classToRemove: 'list-decimal list-none', title: "Bulleted List", icon: <ListBulleted class="size-5" /> },
    number: { tag: 'ol', id: 'number-wrapper', classToAdd: 'list-decimal', classToRemove: 'list-disc list-none', title: "Numbered List", icon: <ListNumbered class="size-5" /> },
    checkbox: { tag: 'ul', id: 'checkbox-wrapper', classToAdd: 'list-none', classToRemove: 'list-disc list-decimal', title: "Checkbox List", icon: <ListCheckbox class="size-5" /> }
} as const;

// const DEFAULT_CLASSES = "list-outside text-wrap pl-6";
const DEFAULT_CLASSES = "list-inside ml-6"
const CHECKBOX_CLASSES = "inline-block align-baseline mr-2"
const CHECKBOX_WRAPPER_ID = 'woby-checkbox-wrapper'
const PARAGRAPH_CLASSES = "inline align-baseline";
const WRAPPER_ID = { bullet: 'bullet-wrapper', number: 'number-wrapper', checkbox: 'checkbox-wrapper' }

const def = () => ({
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    mode: $("bullet", HtmlString) as ObservableMaybe<ListMode>,
})
// #endregion

const List = defaults(def, (props) => {
    const { class: cn, cls, mode, buttonType: btnType, ...otherProps } = props

    const editor = useEditor()
    const isActive = $(false)

    // Reactive Icon
    const listProps = () => {
        const list = $$(mode)
        return {
            tag: LIST_CONFIG[list].tag,
            id: LIST_CONFIG[list].id,
            classToAdd: LIST_CONFIG[list].classToAdd,
            classToRemove: LIST_CONFIG[list].classToRemove,
            icon: LIST_CONFIG[list].icon,
            title: LIST_CONFIG[list].title,
        }
    }

    // #region Active State Detection
    useEffect(() => {
        const currentMode = $$(mode)

        const updateState = () => {
            const el = editor ?? getCurrentEditor()
            let state = false

            // 1. Get current selection
            const { selection } = getSelection($$(el));
            if (!selection || selection.rangeCount === 0) {
                isActive(false)
                return
            }

            // 2. Find the closest list parent (UL or OL)
            let node: Node | null = selection.getRangeAt(0).commonAncestorContainer
            if (node.nodeType === Node.TEXT_NODE) node = node.parentElement
            const closestList = (node as HTMLElement)?.closest('ul, ol')

            // 3. Logic Branching by Mode
            if (closestList) {
                const isOrdered = closestList.tagName === 'OL'
                const isUnordered = closestList.tagName === 'UL'

                if (currentMode === 'number' && closestList.classList.contains('list-decimal')) {
                    // Number button is active ONLY if it's an <ol>
                    state = isOrdered
                }
                else if (currentMode === 'checkbox' && closestList.classList.contains('list-none')) {
                    // Checkbox button is active ONLY if it's a <ul> with our special class
                    state = isUnordered
                }
                else if (currentMode === 'bullet' && closestList.classList.contains('list-disc')) {
                    // Bullet button is active ONLY if it's a <ul> and NOT a checklist
                    state = isUnordered
                }

                // Security check: ensure the list belongs to our editor
                if (state && $$(el) && !$$(el).contains(closestList)) {
                    state = false
                }
            }
            isActive(state)
        }

        document.addEventListener('selectionchange', updateState)
        document.addEventListener('mouseup', updateState)
        document.addEventListener('keyup', updateState)

        // Run once on mount
        updateState()

        return () => {
            document.removeEventListener('selectionchange', updateState)
            document.removeEventListener('mouseup', updateState)
            document.removeEventListener('keyup', updateState)
        }
    })
    // #endregion

    // #region Auto-Render on "Enter"
    useEffect(() => {
        const el = editor ?? getCurrentEditor()
        if (!$$(el)) {
            console.error("[List] Cannot find editor element to observe")
            return
        }

        const observer = new MutationObserver(handleListMutations)

        // Start observing the editor
        observer.observe($$(el), {
            childList: true, // Watch for added/removed children
            subtree: true    // Watch deep inside the editor
        })

        return () => observer.disconnect()
    })

    const handleListMutations = (mutations: MutationRecord[]) => {
        // Optimization: Only run if we are currently in Checkbox mode!
        // if ($$(mode) !== 'checkbox') return

        mutations.forEach((mutation) => {
            // Check newly added nodes
            mutation.addedNodes.forEach((node) => {
                // We only care about Elements (not text nodes)
                if (node instanceof HTMLElement) {
                    if (node.tagName == 'LI') {
                        const parent = node.closest('ul')
                        if (parent && parent.id == LIST_CONFIG['checkbox'].id) {
                            // get all li tag
                            const li = parent.querySelectorAll('li');
                            li.forEach((el, index) => {
                                const isContainCheckbox = el.querySelector(`#${CHECKBOX_WRAPPER_ID}`) != null ? true : false
                                if (!isContainCheckbox) {
                                    console.log(`[List] #${index + 1} Injecting checkbox for li`)
                                    injectCheckbox(el)
                                }
                            })

                        }
                    }
                }
            })
        })
    }
    // #endregion

    const handleClick = () => {
        const el = editor ?? getCurrentEditor()
        // Ensure we don't force inline styles, we want classes
        document.execCommand('styleWithCSS', false, 'false')

        insertList($$(el), listProps().tag, listProps().classToAdd, listProps().classToRemove, $$(mode))
        // Force update UI state immediately
        // (Short timeout allows the DOM to update first)
        setTimeout(() => {
            // Manually trigger a check
            const evt = new Event('selectionchange')
            document.dispatchEvent(evt)
        }, 10)
    }

    return (
        <Button
            type={btnType}
            onClick={handleClick}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            title={() => listProps().title}
            class={() => [
                () => $$(cls) ? $$(cls) : cn,
                () => $$(isActive) ? '!bg-slate-200' : ''
            ]}

            aria-pressed={() => $$(isActive) ? "true" : "false"}
            {...otherProps}
        >
            {() => listProps().icon}
        </Button>
    )
})

export { List }

customElement('wui-list', List)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-list': ElementAttributes<typeof List>
        }
    }
}

export default List


// #region insertList - Handle list insertion and styling
/**
 * 1. list-disc (bullet)
 * 2. list-decimal (number)
 * 3. list-none (checkbox)
 */
const insertList = (editor: HTMLDivElement, listTag: 'ul' | 'ol', classToAdd: string, classToRemove: string, mode: ListMode) => {

    const { selection } = getSelection(editor);
    if (!selection) return

    document.execCommand('defaultParagraphSeparator', false, 'p');

    // 2. Identify Current Context
    const existingList = getClosestElementFromSelection(selection, 'ul, ol');
    const currentMode = existingList ? (existingList.id.includes('checkbox') ? 'checkbox' : existingList.id.includes('number') ? 'number' : 'bullet') : null;

    // 3. Execute Logic based on Context
    if (existingList) {
        if (currentMode === mode) {
            console.log('[List] 🔄 Toggling OFF'); // CASE A: Toggle Off (User clicked active mode)
            toggleListOff(existingList, mode, editor);
            return;
        } else {
            console.log('[List] 🔄 Switching Mode'); // CASE B: Switch Mode (User clicked different mode)
            switchListMode(existingList, listTag, editor);
        }
    } else {
        console.log('[List] ➕ Creating New List'); // CASE C: Create New List

        console.log("[List] Before create new list. To check block class.")
        const selectedBlocks: HTMLElement[] = [];
        if (selection && selection.rangeCount > 0) {
            if (selection.isCollapsed) {
                const el = getClosestElementFromSelection(selection, BLOCK_TAGS.join(','));
                if (el) selectedBlocks.push(el);
            } else {
                const allPossibleBlocks = editor.querySelectorAll(BLOCK_TAGS.join(','));
                // 2. Filter them to find which ones are inside the selection
                allPossibleBlocks.forEach(block => {
                    if (selection.containsNode(block, true)) {
                        selectedBlocks.push(block as HTMLElement);
                    }
                });
            }
        }


        const command = listTag === 'ul' ? 'insertUnorderedList' : 'insertOrderedList';
        document.execCommand(command, false);

        console.log("[List] Unwrapping paragraphs")
        unwrapParagraph(editor, listTag);

        console.log("[List] Restore class to blocks");
        const currentBlock = getClosestElementFromSelection(selection, listTag);
        const liItems = currentBlock.querySelectorAll('li');
        if (liItems.length == selectedBlocks.length) {
            for (let index = 0; index < liItems.length; index++) {
                const li = liItems[index];
                const block = selectedBlocks[index];
                const classToAdd = block.className == '' ? [] : block.className.split(' ');

                if (classToAdd.length > 0) li.classList.add(...classToAdd);
                li.style.cssText = block.style.cssText;
            }
        }
    }

    // 4. Apply Styles & Components (Runs for Case B and C)
    styleActiveList(editor, listTag, mode, { add: classToAdd, remove: classToRemove });
};
// #endregion

// #region handleCheckbox - Handle checkbox injection and styling
const injectCheckbox = (li: HTMLElement) => {
    console.groupCollapsed(`[injectCheckbox] Processing list item: ${li.textContent?.substring(0, 30)}`)

    const existingWrapper = li.querySelector('#woby-checkbox-wrapper')
    if (existingWrapper) {
        console.log('[injectCheckbox] 🗑️ Removing existing checkbox wrapper')
        existingWrapper.remove()
    }

    console.log('[injectCheckbox] ✅ Applied list item styles (relative positioning, padding)')

    // 3. Create the container
    const wrapper = document.createElement('span')
    wrapper.className = CHECKBOX_CLASSES
    wrapper.contentEditable = 'false'
    wrapper.style.userSelect = 'none'
    wrapper.id = CHECKBOX_WRAPPER_ID

    // 4. Insert at start
    li.prepend(wrapper)
    console.log('[injectCheckbox] 📦 Checkbox wrapper created and inserted at start of list item')

    // 5. Render the Woby Component
    render(<Checkbox />, wrapper)
    console.log('[injectCheckbox] ✅ Checkbox component rendered successfully')
    console.groupEnd()
}

const removeCheckboxWrapper = (listEl: HTMLElement) => {
    console.groupCollapsed(`[removeCheckboxWrapper] Removing checkboxes from ${listEl.tagName}`)

    const items: HTMLElement[] = [];

    if (listEl.tagName == 'UL' || listEl.tagName == 'OL') {
        const allList = listEl.querySelectorAll('li');
        allList.forEach((li) => { items.push(li as HTMLElement); });
    } else {
        // current listEl is li tag.
        listEl.tagName == 'LI' ? items.push(listEl) : null;
    }

    console.log(`[removeCheckboxWrapper] Processing ${items.length} list items`)

    let removedCount = 0

    items.forEach((li, index) => {
        const wrapper = li.querySelector('#woby-checkbox-wrapper')

        if (wrapper) {
            console.log(`[removeCheckboxWrapper] Removing wrapper from item ${index + 1}`)
            wrapper.remove()
            removedCount++
        }

        // If the style attribute is completely empty now, remove it entirely
        if (li.getAttribute('style') === '') {
            li.removeAttribute('style')
        }
    })

    console.log(`[removeCheckboxWrapper] ✅ Complete - Removed ${removedCount} checkbox wrappers`)
    console.groupEnd()
}
// #endregion

// #region Helper Function

/** Logic to turn a list BACK into paragraphs (Toggle Off) */
const toggleListOff = (listEl: HTMLElement, mode: ListMode, editor: HTMLElement) => {
    const { selection, state } = getSelection(editor);

    // 1. Cleanup Checkboxes
    if (mode === 'checkbox') removeCheckboxWrapper(listEl);

    // 2. Unwrap invalid parent <p> if exists
    if (listEl.parentElement?.tagName === 'P') {
        const parent = listEl.parentElement;
        const frag = document.createDocumentFragment();
        while (parent.firstChild) frag.appendChild(parent.firstChild);
        parent.replaceWith(frag);
    }

    // 3. Convert Items to Paragraphs Manually
    const fragment = document.createDocumentFragment();
    const listItems = listEl.querySelectorAll('li');
    let lastNode: HTMLElement | null = null;

    const pClass = PARAGRAPH_CLASSES.split(' ').filter(c => c)

    listItems.forEach((li, index) => {
        let p: HTMLElement;
        const child = li.firstElementChild;

        if (child && child.tagName == 'P') {
            p = child as HTMLElement;
            p.classList.remove(...pClass)
        } else {
            p = document.createElement('p');
            while (li.firstChild) { p.appendChild(li.firstChild) };
            const classes = li.className == '' ? [] : li.className.split(' ');
            if (classes.length > 0) p.classList.add(...classes)
            p.style.cssText = li.style.cssText;
        }
        fragment.appendChild(p);
        lastNode = p;
    })

    listEl.replaceWith(fragment);

    console.log("[List] Restoring selection:")
    if (state && state.startContainer && state.startContainer.isConnected) {
        console.log("[List] use restoreRangePosition")
        restoreRangePosition(selection, state.startContainer, state.startOffset, state.endContainer, state.endOffset, state.isCollapsed)
    } else if (lastNode && selection) {
        console.log("[List] use range selection")
        const range = document.createRange();
        range.selectNodeContents(lastNode);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        console.log("[List] no selection to restore")
    }
};

/** Logic to switch between list types (e.g., Bullet -> Number) */
const switchListMode = (listEl: HTMLElement, targetTag: string, editor: HTMLElement) => {

    // 1. Analyze Selection & Cleanup Checkboxes
    const { selection: preSelection } = getSelection(editor)!;
    const selectedItems: HTMLElement[] = [];

    if (preSelection && preSelection.rangeCount > 0) {
        if (preSelection.isCollapsed) {
            const li = getClosestElementFromSelection(preSelection, 'li');
            if (li) selectedItems.push(li);
        } else {
            const allLis = listEl.querySelectorAll('li');
            allLis.forEach(li => {
                if (preSelection.containsNode(li, true)) selectedItems.push(li);
            });
        }
    }

    if (selectedItems.length === 0) return;

    selectedItems.forEach((li) => {
        const firstChildEl = li.firstElementChild;
        const isCheckbox = firstChildEl && firstChildEl.id.includes(CHECKBOX_WRAPPER_ID);
        if (isCheckbox) removeCheckboxWrapper(li);
    });

    // 2. Logic to Switch Modes

    // Check if we are about to create a list next to another list of the same type
    // e.g. Converting OL -> UL, but there is already a UL right above it.
    const prev = listEl.previousElementSibling;
    const next = listEl.nextElementSibling;
    const isAdjacentToSameTag = (prev && prev.tagName === targetTag.toUpperCase()) || (next && next.tagName === targetTag.toUpperCase());

    // 🚀 UNIFIED PATH: Use "Force Split" if tags match OR if auto-merge is likely
    if (listEl.tagName.toLowerCase() === targetTag || isAdjacentToSameTag) {
        console.log(`[List] Force Split Mode (Same tag or adjacent merge risk). Current: ${listEl.tagName.toLowerCase()}, Target: ${targetTag}`);

        // Convert to the OPPOSITE type first (Temporary) to force a split
        let tempTagName = listEl.tagName.toLowerCase();
        if (listEl.tagName.toLowerCase() == targetTag) {
            const oppositeCommand = targetTag === 'ul' ? 'insertOrderedList' : 'insertUnorderedList';
            tempTagName = targetTag === 'ul' ? 'OL' : 'UL';
            document.execCommand(oppositeCommand, false);
        }

        // 2. Find the Temp List
        const { selection: postSelection } = getSelection(editor)!;
        const tempList = getClosestElementFromSelection(postSelection, tempTagName);

        if (tempList) {
            console.log("[List] Found Temp List:", tempList);

            // 🚀 Fix: Repair IDs for the bottom list (which lost them during split)
            const topList = tempList.previousElementSibling as HTMLElement;
            const bottomList = tempList.nextElementSibling as HTMLElement;

            if (topList && bottomList && topList.tagName === listEl.tagName && bottomList.tagName === listEl.tagName) {
                if (topList.id && !bottomList.id) {
                    bottomList.id = topList.id; // Copy ID from top to bottom
                }
            }

            // 3. Morph Temp List to Final List
            const finalList = document.createElement(targetTag);
            finalList.id = listEl.id === 'checkbox-wrapper' ? 'bullet-wrapper' : 'checkbox-wrapper';

            while (tempList.firstChild) {
                finalList.appendChild(tempList.firstChild);
            }

            tempList.replaceWith(finalList);

            // 4. Update Selection
            selectElement(finalList, preSelection);
        }

    } else {
        // Standard switching (e.g. UL -> OL with no adjacent OL)
        // Safe to use native command without merging
        console.log(`[List] Standard Switch (Different Tag, Safe)`);
        const command = targetTag === 'ul' ? 'insertUnorderedList' : 'insertOrderedList';
        document.execCommand(command, false);
    }
};

/** Logic to apply classes, IDs, and components to the active list */
const styleActiveList = (editor: HTMLElement, listTag: string, mode: ListMode, classes: { add: string, remove: string }) => {
    console.log('[List] 🎨 Styling List');

    let { selection, state } = getSelection(editor);
    if (!selection?.rangeCount) return;

    const listEl = getClosestElementFromSelection(selection, listTag);
    if (!listEl) return;

    // 1. Set ID
    listEl.id = mode === "bullet" ? WRAPPER_ID.bullet : mode === "number" ? WRAPPER_ID.number : WRAPPER_ID.checkbox;

    // 2. Apply Classes
    const toRemove = classes.remove.split(' ').filter(c => c);
    const toAdd = classes.add.split(' ').filter(c => c);
    const defaultStyles = DEFAULT_CLASSES.split(' ').filter(c => c);

    listEl.classList.remove(...toRemove);
    listEl.classList.add(...defaultStyles, ...toAdd);

    if (listEl.id == WRAPPER_ID.checkbox) {
        const items = listEl.querySelectorAll('li');
        items.forEach(item => injectCheckbox(item as HTMLElement));
    }
};

/** Logic to unwrap a paragraph tag around a list element */
const unwrapParagraph = (editor: HTMLDivElement, listTag: 'ul' | 'ol') => {
    const postSelection = getSelection(editor);

    if (postSelection && postSelection.selection.rangeCount > 0) {

        // 1. Find the newly created list
        const newList = getClosestElementFromSelection(postSelection.selection, listTag);

        if (newList && newList.parentElement) {
            const parentTag = newList.parentElement.tagName.toUpperCase();

            if (parentTag === 'P') {
                // 2. Unwrap <p> tag
                console.log('[List] 🛠️ Unwrapping invalid parent <P>');
                const parentElement = newList.parentElement;
                const fragment = document.createDocumentFragment();

                // Move everything out of the <P> and into the fragment
                while (parentElement.firstChild) {
                    fragment.appendChild(parentElement.firstChild);
                }

                // Destroy the <P> by replacing it with its own contents
                parentElement.replaceWith(fragment);

                // 3. Restore the exact cursor position
                restoreRangePosition(postSelection.selection, postSelection.state.startContainer, postSelection.state.startOffset, postSelection.state.endContainer, postSelection.state.endOffset, postSelection.state.isCollapsed);
            } else {
                // It's not a P tag, so just log it as requested
                console.log(`[List] ℹ️ Parent is <${parentTag}>, no unwrap needed.`);
            }
        }
    }
}
// #endregion
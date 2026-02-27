import { $, $$, render, customElement, defaults, ElementAttributes, HtmlClass, HtmlString, ObservableMaybe, useEffect, } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { useEditor } from './undoredo'
import { Checkbox } from '../Checkbox'
import { getSelection, getCurrentEditor } from './utils'
import ListBulleted from '../icons/list_bulleted'
import ListNumbered from '../icons/list_numbered'
import ListCheckbox from '../icons/list_checkbox'

// #region Types & Configuration
type ListMode = "bullet" | "number" | "checkbox"

const LIST_CONFIG = {
    bullet: { tag: 'ul', id: 'bullet-wrapper', classToAdd: 'list-disc', classToRemove: 'list-decimal list-none', title: "Bulleted List", icon: <ListBulleted class="size-5" /> },
    number: { tag: 'ol', id: 'number-wrapper', classToAdd: 'list-decimal', classToRemove: 'list-disc list-none', title: "Numbered List", icon: <ListNumbered class="size-5" /> },
    checkbox: { tag: 'ul', id: 'checkbox-wrapper', classToAdd: 'list-none', classToRemove: 'list-disc list-decimal', title: "Checkbox List", icon: <ListCheckbox class="size-5" /> }
} as const;

const DEFAULT_CLASSES = "list-outside text-wrap pl-6";

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
        if ($$(mode) !== 'checkbox') return

        mutations.forEach((mutation) => {
            // Check newly added nodes
            mutation.addedNodes.forEach((node) => {
                // We only care about Elements (not text nodes)
                if (node instanceof HTMLElement) {
                    // Scenario 1: A single LI was added (e.g., Pressing Enter)
                    if (node.tagName === 'LI') {
                        const parent = node.closest('ul')
                        // Double check: Only render if parent is our specific checkbox wrapper
                        if (parent && parent.id === 'checkbox-wrapper') {
                            injectCheckbox(node)
                        }
                    }

                    // Scenario 2: A whole UL was pasted or created (e.g., Paste or Undo)
                    if (node.tagName === 'UL' && node.id === 'checkbox-wrapper') {
                        node.querySelectorAll('li').forEach(li => injectCheckbox(li))
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
    // 1. Validation
    const state = validateEditorState(editor);
    if (!state) return; // Exit if invalid

    const { root, selection } = state;
    document.execCommand('defaultParagraphSeparator', false, 'p');

    // 2. Identify Current Context
    let anchorNode = selection.anchorNode;
    if (anchorNode?.nodeType === Node.TEXT_NODE) anchorNode = anchorNode.parentElement;

    const existingList = (anchorNode as HTMLElement)?.closest('ul, ol') as HTMLElement | null;
    const currentMode = existingList ? (existingList.id.includes('checkbox') ? 'checkbox' : existingList.id.includes('number') ? 'number' : 'bullet') : null;

    // 3. Execute Logic based on Context
    if (existingList) {
        if (currentMode === mode) {
            // CASE A: Toggle Off (User clicked active mode)
            toggleListOff(existingList, mode, editor);
            setTimeout(() => syncAllLists(root), 0);
            return; // Done, no styling needed
        } else {
            // CASE B: Switch Mode (User clicked different mode)
            switchListMode(existingList, listTag, editor);
        }
    } else {
        // CASE C: Create New List
        console.log('[List] ➕ Creating New List');
        const command = listTag === 'ul' ? 'insertUnorderedList' : 'insertOrderedList';
        document.execCommand(command, false);
    }

    // 4. Apply Styles & Components (Runs for Case B and C)
    styleActiveList(editor, listTag, mode, { add: classToAdd, remove: classToRemove });
};
// #endregion

// #region handleCheckbox - Handle checkbox injection and styling
const injectCheckbox = (li: HTMLElement) => {
    console.groupCollapsed(`[injectCheckbox] Processing list item: ${li.textContent?.substring(0, 30)}`)

    const existingWrapper = li.querySelector('.woby-checkbox-wrapper')
    if (existingWrapper) {
        console.log('[injectCheckbox] 🗑️ Removing existing checkbox wrapper')
        existingWrapper.remove()
    }

    // 2. Style the LI to act as a normal block, but make room for the checkbox
    // REMOVE flexbox styles so the browser can calculate the caret position correctly
    li.style.display = 'list-item'
    li.style.alignItems = '' // Clear old flex styles if any
    li.style.gap = ''        // Clear old flex styles if any

    // NEW LAYOUT: Use relative positioning and padding
    li.style.position = 'relative'
    li.style.paddingLeft = '28px' // Make room for the checkbox (adjust if your checkbox is wider)
    li.style.marginBottom = '4px'
    console.log('[injectCheckbox] ✅ Applied list item styles (relative positioning, padding)')

    // 3. Create the container
    const wrapper = document.createElement('span')
    wrapper.className = 'woby-checkbox-wrapper'
    wrapper.contentEditable = 'false' // Critical
    wrapper.style.userSelect = 'none'

    // 4. Position the checkbox absolutely inside the padded area
    wrapper.style.position = 'absolute'
    wrapper.style.left = '0'
    wrapper.style.top = '2px' // Fine-tune this so it aligns vertically with the text

    // 5. Insert at start
    li.prepend(wrapper)
    console.log('[injectCheckbox] 📦 Checkbox wrapper created and inserted at start of list item')

    // 6. Render the Woby Component
    render(<Checkbox />, wrapper)
    console.log('[injectCheckbox] ✅ Checkbox component rendered successfully')
    console.groupEnd()
}

const removeCheckboxWrapper = (listEl: HTMLElement) => {
    console.groupCollapsed(`[removeCheckboxWrapper] Removing checkboxes from ${listEl.tagName}`)
    const items = listEl.querySelectorAll('li')
    console.log(`[removeCheckboxWrapper] Processing ${items.length} list items`)

    let removedCount = 0

    items.forEach((li, index) => {
        const wrapper = li.querySelector('.woby-checkbox-wrapper')

        if (wrapper) {
            console.log(`[removeCheckboxWrapper] Removing wrapper from item ${index + 1}`)
            wrapper.remove()
            removedCount++
        }

        // 4. CLEANUP STYLES
        // Reset all the custom styles we applied so native bullets work correctly again.
        li.style.position = ''
        li.style.paddingLeft = ''
        li.style.marginBottom = ''
        li.style.display = ''

        // Remove old flex properties just in case they were left over
        li.style.alignItems = ''
        li.style.gap = ''

        // If the style attribute is completely empty now, remove it entirely
        if (li.getAttribute('style') === '') {
            li.removeAttribute('style')
        }
    })

    console.log(`[removeCheckboxWrapper] ✅ Complete - Removed ${removedCount} checkbox wrappers`)
    console.groupEnd()
}

const injectParagraph = (li: HTMLElement) => {

    if (li.querySelector(':scope > p')) {
        console.log('[injectParagraph] ⚠️ Already has <p> wrapper, skipping: ', li.textContent?.substring(0, 30));
        return;
    }

    console.groupCollapsed('[injectParagraph] 📝 Processing list item:', li.textContent?.substring(0, 30));

    // Otherwise, wrap the content...
    console.log('[injectParagraph] ➕ Creating new <p> wrapper');
    const p = document.createElement('p');
    const childCount = li.childNodes.length;
    console.log(`[injectParagraph] Moving ${childCount} child nodes to <p>`);

    while (li.firstChild) {
        p.appendChild(li.firstChild);
    }

    li.appendChild(p);
    console.log('[injectParagraph] ✅ Successfully wrapped content in <p> tag');
    console.groupEnd()
}
// #endregion

/**
 * WHAT IT DOES:
 * Acts as a cleanup crew for the editor. It scans all lists, ensures checkbox lists 
 * have their custom UI components, ensures normal lists do NOT have checkboxes, 
 * and deletes any "orphaned" checkboxes floating in normal paragraphs.
 * 
 * @param {HTMLElement} root - The main editor container element (the contenteditable div).
 * 
 * @returns {void} - Returns nothing. It modifies the DOM directly in place.
 */
const syncAllLists = (root: HTMLElement) => {
    console.groupCollapsed('[syncAllLists] Synchronizing all lists in editor')
    // 1. Find every UL/OL in the editor
    const allLists = root.querySelectorAll('ul, ol')
    console.log(`[syncAllLists] Found ${allLists.length} lists to sync`)

    allLists.forEach((list, index) => {
        const el = list as HTMLElement
        console.log(`[syncAllLists] Processing list ${index + 1}/${allLists.length}:`, { tag: el.tagName, id: el.id, classes: el.className })

        // Detect if this IS a checkbox list based on its class
        const isCheckboxList = el.tagName === 'UL' && el.classList.contains('list-none')
        console.log(`[syncAllLists] Is checkbox list: ${isCheckboxList}`)

        if (isCheckboxList) {
            console.log('[syncAllLists] Restoring checkbox list')
            // Restore the ID that the browser forgot to clone during the split
            el.id = 'checkbox-wrapper'

            // Ensure every item has a checkbox
            const items = el.querySelectorAll('li')
            console.log(`[syncAllLists] Injecting checkboxes into ${items.length} items`)
            items.forEach(li => injectCheckbox(li as HTMLElement))
        } else {
            console.log('[syncAllLists] Processing non-checkbox list')
            // If it's a normal bullet/number list, make sure no checkboxes are left inside
            if (el.id === 'checkbox-wrapper') {
                console.log('[syncAllLists] Removing incorrect checkbox-wrapper ID')
                el.removeAttribute('id')
            }
            removeCheckboxWrapper(el)
        }
    })

    // 2. Cleanup Orphans
    console.log('[syncAllLists] Cleaning up orphaned checkboxes')
    // If an item was removed from a list, it might still have a checkbox wrapper
    // inside a <p> or <div>. We must remove those.
    const orphans = root.querySelectorAll('.woby-checkbox-wrapper')
    console.log(`[syncAllLists] Found ${orphans.length} checkbox wrappers`)

    orphans.forEach((span, idx) => {
        const isInListItem = !!span.closest('li')
        if (!isInListItem) {
            console.log(`[syncAllLists] Removing orphaned wrapper ${idx + 1}`)
            span.remove()
        }
    })
    console.log('[syncAllLists] Sync complete')
    console.groupEnd()
}

// #region Helper Function
/** Helper to ensure the editor has focus and valid selection */
const validateEditorState = (editor: HTMLDivElement): { root: HTMLElement, selection: Selection } | null => {
    const { selection } = getSelection(editor);
    if (!selection || selection.rangeCount === 0) return null;

    let root: HTMLElement | null = (editor instanceof HTMLElement) ? editor : null;
    if (!root) {
        let node: Node | null = selection.getRangeAt(0).commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
        if (node instanceof HTMLElement) {
            root = node.isContentEditable ? node : node.closest('[contenteditable="true"]') as HTMLElement;
        }
    }

    if (!root) return null;

    // Ensure focus
    if (document.activeElement !== root && !root.contains(document.activeElement)) {
        root.focus();
    }

    return { root, selection };
};

/** Logic to turn a list BACK into paragraphs (Toggle Off) */
const toggleListOff = (listEl: HTMLElement, mode: ListMode, editor: HTMLElement) => {
    console.log('[List] 🔄 Toggling OFF');

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

    listItems.forEach(li => {
        let p: HTMLElement;
        const child = li.firstElementChild;

        // Reuse existing <p> or create new one
        if (child && child.tagName === 'P') {
            p = child as HTMLElement;
        } else {
            p = document.createElement('p');
            while (li.firstChild) p.appendChild(li.firstChild);
        }

        fragment.appendChild(p);
        lastNode = p;
    });

    // 4. Replace List
    listEl.replaceWith(fragment);

    // 5. Restore Cursor
    if (lastNode) {
        const range = document.createRange();
        const { selection: sel } = getSelection(editor);
        range.selectNodeContents(lastNode);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
    }
};

/** Logic to switch between list types (e.g., Bullet -> Number) */
const switchListMode = (listEl: HTMLElement, targetTag: string, editor: HTMLElement) => {
    console.log('[List] 🔄 Switching Mode');

    // Cleanup old checkboxes if moving away from checkbox mode
    if (listEl.id.includes('checkbox')) removeCheckboxWrapper(listEl);

    // Handle same-tag switching (e.g. UL -> UL for Bullet <-> Checkbox)
    if (listEl.tagName.toLowerCase() === targetTag) {
        console.log('[List] 🔄 Morphing list (Same Tag)');
        const oppositeCommand = targetTag === 'ul' ? 'insertOrderedList' : 'insertUnorderedList';

        // Native split hack
        document.execCommand(oppositeCommand, false);

        // Find the temp list
        const { selection } = getSelection(editor);
        let anchor = selection?.anchorNode;
        if (anchor?.nodeType === Node.TEXT_NODE) anchor = anchor.parentElement;

        const tempTag = targetTag === 'ul' ? 'ol' : 'ul';
        const splitList = (anchor as HTMLElement)?.closest(tempTag);

        if (splitList) {
            const morphedList = document.createElement(targetTag);
            while (splitList.firstChild) morphedList.appendChild(splitList.firstChild);
            splitList.replaceWith(morphedList);

            // Re-select for styling
            const range = document.createRange();
            range.selectNodeContents(morphedList);
            range.collapse(false);
            const { selection: sel } = getSelection(editor);
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
    } else {
        // Standard switching (UL <-> OL)
        const command = targetTag === 'ul' ? 'insertUnorderedList' : 'insertOrderedList';
        document.execCommand(command, false);
    }
};

/** Logic to apply classes, IDs, and components to the active list */
const styleActiveList = (editor: HTMLElement, listTag: string, mode: ListMode, classes: { add: string, remove: string }) => {
    console.log('[List] 🎨 Styling List');

    const { selection } = getSelection(editor);
    if (!selection?.rangeCount) return;

    // 0. Capture original selection
    console.log('[List] 📸 Capturing original selection');
    const originalRange = selection.getRangeAt(0).cloneRange();
    console.log('[List] Original range:', {
        startContainer: { node: originalRange.startContainer, offset: originalRange.startOffset, text: originalRange.startContainer.textContent },
        endContainer: { node: originalRange.endContainer, offset: originalRange.endOffset, text: originalRange.endContainer.textContent },
    });

    let anchor = selection.anchorNode;
    if (anchor?.nodeType === Node.TEXT_NODE) anchor = anchor.parentElement;

    const listEl = (anchor as HTMLElement)?.closest(listTag);

    if (!listEl) return;

    // 1. Set ID
    listEl.id = mode === "bullet" ? "bullet-wrapper" : mode === "number" ? "number-wrapper" : "checkbox-wrapper";

    // 2. Apply Classes
    const toRemove = classes.remove.split(' ').filter(c => c);
    const toAdd = classes.add.split(' ').filter(c => c);
    const defaultStyles = DEFAULT_CLASSES.split(' ').filter(c => c);

    listEl.classList.remove(...toRemove);
    listEl.classList.add(...defaultStyles, ...toAdd);

    // 3. Components & Inner Wrapping
    if (mode === "checkbox") {
        listEl.querySelectorAll('li').forEach(li => injectCheckbox(li as HTMLElement));
    } else {
        removeCheckboxWrapper(listEl as HTMLElement);
    }

    // 4. Paragraph Wrapping (Safety)
    listEl.querySelectorAll('li').forEach(li => injectParagraph(li as HTMLElement));

    // 5. Restore original selection
    console.log('[List] 🔄 Restoring original selection');
    try {
        selection.removeAllRanges();
        selection.addRange(originalRange);
        editor.focus();
        console.log('[List] ✅ Selection restored successfully');
    } catch (error) {
        console.warn('[List] ⚠️ Failed to restore exact selection, falling back', error);

        // Fallback: Try to restore to similar position
        const newRange = document.createRange();
        const targetLi = listEl.querySelector('li');

        if (targetLi) {
            const paragraph = targetLi.querySelector('p');
            const targetNode = paragraph || targetLi;

            newRange.selectNodeContents(targetNode);
            newRange.collapse(false); // Collapse to end

            selection.removeAllRanges();
            selection.addRange(newRange);
            editor.focus();
            console.log('[List] ✅ Selection restored with fallback');
        }
    }
};
// #endregion
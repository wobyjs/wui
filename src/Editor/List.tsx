import { $, $$, render, customElement, defaults, ElementAttributes, HtmlClass, HtmlString, ObservableMaybe, useEffect, } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { useEditor } from './undoredo'
import { Checkbox } from '../Checkbox'
import { getSelection, getCurrentEditor, getClosestElementFromSelection, BLOCK_TAGS, getSelectedBlocks, restoreRangePosition, LIST_TAGS, LI_TAG, P_TAG } from './utils'
import ListBulleted from '../icons/list_bulleted'
import ListNumbered from '../icons/list_numbered'
import ListCheckbox from '../icons/list_checkbox'


// #region Types & Configuration
type ListMode = "bullet" | "number" | "checkbox"

const LIST_CONFIG = {
    bullet: { tag: 'ul', id: 'bullet-wrapper', classToAdd: 'list-inside list-disc', classToRemove: 'list-decimal list-none', title: "Bulleted List", icon: <ListBulleted class="size-5" /> },
    number: { tag: 'ol', id: 'number-wrapper', classToAdd: 'list-inside list-decimal', classToRemove: 'list-disc list-none', title: "Numbered List", icon: <ListNumbered class="size-5" /> },
    checkbox: { tag: 'ul', id: 'checkbox-wrapper', classToAdd: 'list-inside list-none', classToRemove: 'list-disc list-decimal', title: "Checkbox List", icon: <ListCheckbox class="size-5" /> }
} as const;

// const DEFAULT_CLASSES = "list-outside text-wrap pl-6";
const DEFAULT_CLASSES = "list-inside ml-6"
const CHECKBOX_CLASSES = "inline-block align-baseline mr-2"
const CHECKBOX_WRAPPER_ID = 'woby-checkbox-wrapper'
const PARAGRAPH_CLASSES = "inline align-baseline";
const WRAPPER_ID = { bullet: 'bullet-wrapper', number: 'number-wrapper', checkbox: 'checkbox-wrapper' }

const CHECKLIST_ATTR = 'data-checklist';

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

        // insertList($$(el), listProps().tag, listProps().classToAdd, listProps().classToRemove, $$(mode))
        insertList($$(el), { tag: listProps().tag, classes: { add: listProps().classToAdd, remove: listProps().classToRemove }, id: listProps().id }, $$(mode))

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

// #region List Service 
export const ListService = {
    // Converts a block to an LI
    convertBlockToLi: (block: HTMLElement): HTMLLIElement => {
        const li = document.createElement('li');
        li.className = block.className;
        li.style.cssText = block.style.cssText;
        while (block.firstChild) li.appendChild(block.firstChild);
        block.remove();
        return li;
    },

    switchTag: (oldList: HTMLElement, targetTag: string, targetConfig: any) => {
        // Handles the Tag Swapping (UL <-> OL)
        const newList = document.createElement(targetTag.toUpperCase());
        newList.id = targetConfig.id;

        const currentClasses = oldList.className.split(' ');
        const toRemove = targetConfig.classes.remove.split(' ');
        const toAdd = targetConfig.classes.add.split(' ');
        const finalClasses = Array.from(new Set([...currentClasses.filter(c => !toRemove.includes(c)), ...toAdd]));

        newList.className = finalClasses.join(' ');
        Array.from(oldList.attributes).forEach(a => a.name !== 'class' && a.name !== 'id' && newList.setAttribute(a.name, a.value));

        while (oldList.firstChild) newList.appendChild(oldList.firstChild);
        oldList.parentNode?.replaceChild(newList, oldList);
        return newList;
    },

    // Handles the Flattening of Nested Lists (Toggle Off)
    flattenList: (listEl: HTMLElement) => {
        const items = listEl.querySelectorAll(':scope > li');
        items.forEach((item) => {
            const li = item as HTMLLIElement;
            const nested = li.querySelector(':scope > ul, :scope > ol') as HTMLElement;
            const p = document.createElement('p');
            // p.innerHTML = li.cloneNode(true).textContent?.trim() || ""; // Simplify text extraction

            // listEl.parentNode?.insertBefore(p, listEl);
            // if (nested) listEl.parentNode?.insertBefore(nested, listEl);

            // Convert childNodes to an array so it doesn't mutate while we loop
            Array.from(li.childNodes).forEach(child => {
                // Move everything into the <p> EXCEPT the nested list
                if (child !== nested) {
                    p.appendChild(child);
                }
            });

            // Insert the new <p> before the parent list
            listEl.parentNode?.insertBefore(p, listEl);

            // If there was a nested list, put it right after the <p>
            if (nested) {
                listEl.parentNode?.insertBefore(nested, listEl);
            }
        });
        listEl.remove();
    },

    splitList: (currentList: HTMLElement, targetItems: HTMLElement[], afterItems: HTMLElement[], createMiddle: (targetItems: HTMLElement[]) => HTMLElement | HTMLElement[]) => {
        // 1. Create the middle content (either a List or a Fragment of Paragraphs)
        const middleContent = createMiddle(targetItems);

        // 2. Insert Middle
        if (Array.isArray(middleContent)) {
            middleContent.reverse().forEach(p => currentList.after(p));
        } else {
            currentList.after(middleContent);
        }

        // 3. Handle After items
        if (afterItems.length > 0) {
            const bottomList = document.createElement(currentList.tagName);
            bottomList.className = currentList.className;
            bottomList.id = currentList.id;

            if (currentList.tagName === 'OL') {
                const start = parseInt(currentList.getAttribute('start') || '1', 10);
                const beforeCount = currentList.children.length - targetItems.length - afterItems.length;
                bottomList.setAttribute('start', (start + beforeCount + targetItems.length).toString());
            }
            afterItems.forEach(li => bottomList.appendChild(li));

            const anchor = Array.isArray(middleContent) ? middleContent[0] : middleContent;
            anchor.after(bottomList);
        }

        // 4. Cleanup empty list
        if (currentList.children.length === 0) currentList.remove();
    }
};
// #endregion

// #region insertList - Handle list insertion and styling
/**
 * 1. list-disc (bullet)
 * 2. list-decimal (number)
 * 3. list-none (checkbox)
 */
const insertList = (editor: HTMLDivElement, targetList: { tag: 'ul' | 'ol', classes: { add: string, remove: string }, id }, mode: ListMode) => {
    console.group("[List] Inserting List (mode: " + mode + ")");
    const { selection, state } = getSelection(editor);
    if (!selection?.rangeCount) return;

    let range = selection.getRangeAt(0);

    // This finds all lists touching the selection and merges them into the first one.
    let isPerformMergeList = false;

    const selectedBlocks = getSelectedBlocks(editor, range, BLOCK_TAGS.filter((tag) => !LIST_TAGS.includes(tag)))
    const selectedLists = getSelectedBlocks(editor, range, BLOCK_TAGS.filter((tag) => LIST_TAGS.includes(tag)))

    const isMixed = selectedBlocks.some(block => block.tagName === P_TAG) && selectedBlocks.some(block => block.tagName === LI_TAG);
    const isAllLI = selectedBlocks.every(block => block.tagName === LI_TAG);

    if (selectedLists.length > 1 && isAllLI) {
        console.log("[List] Multiple lists detected. Merging...");

        // 2. Save markers for the exact text nodes so we can restore the exact selection later
        const start = { node: state.startContainer, offset: state.startOffset }
        const end = { node: state.endContainer, offset: state.endOffset }
        const primaryList = selectedLists[0];

        selectedLists.slice(1).forEach(secondaryList => {
            while (secondaryList.firstChild) {
                primaryList.appendChild(secondaryList.firstChild);
            }
            secondaryList.remove();
        });

        isPerformMergeList = true
        range = restoreRangePosition(selection, start, end)
    }

    const startElement = range.startContainer.parentElement!;
    const endElement = range.endContainer.parentElement!;

    const startRange = { node: state.startContainer, offset: state.startOffset }
    const endRange = (!state.isCollapsed && state.endContainer && state.endOffset) ? { node: state.endContainer, offset: state.endOffset } : undefined

    console.log(`✨ start element [${startElement.tagName}]: ${startElement.textContent}`)
    console.log(`✨   end element [${endElement.tagName}]: ${endElement.textContent}`)

    console.groupCollapsed(`🟢 Selected Block (${selectedBlocks.length})`);
    selectedBlocks.forEach((block, index) => { console.log(`\t#${index + 1}. [${block.tagName.padStart(2, ' ')}] - ${block.textContent}`); })
    console.groupEnd();

    console.groupCollapsed(`🟢 Selected List (${selectedLists.length})`);
    selectedLists.forEach((list, index) => { console.log(`\t#${index + 1}. [${list.tagName.padStart(2, ' ')}] - ${list.textContent}`); })
    console.groupEnd();

    let action: string | null = null

    // selected items is all <li> tag
    if (isAllLI) {
        console.log("📌 Selected Items is all <li> tags.")
        const currentList = startElement.closest('ul, ol') as HTMLElement;
        const items = Array.from(currentList.children) as HTMLLIElement[];
        console.log("Current List: ", currentList)

        console.group("📦 List Items");
        items.forEach((li, index) => { console.log(`#${index + 1}. ${li.textContent}`) })
        console.groupEnd();

        // Case 1: Toggle Off
        if (currentList.id === targetList.id && !isPerformMergeList) {
            action = "Toggle Off"
            console.log(`Case 1: ${action}`)
        }
        // Case 2: Switch List
        else if (currentList.id !== targetList.id) {

            if (state.isCollapsed) {
                action = "Switch Tag (entire list)"
            } else {
                action = "Switch Tag (selected items)"
            }
            console.log(`Case 2: ${action}`)

        }
    }
    // selected items is not all <li> tag
    else {
        console.log("📌 Selected Items is NOT all <li> tags.")
    }


    console.log("Action: ", action)

    console.groupEnd()
    return

    // #region Case 1: Toggle/Switch List
    if (isAllLI) {
        const currentList = startElement.closest('ul, ol') as HTMLElement;

        const allItems = Array.from(currentList.children);
        const selectedItems = getSelectedBlocks(editor, range, ['LI', 'P']);

        // 1. Identify indices for splitting
        const firstSelectedIndex = allItems.indexOf(selectedItems[0]);
        const lastSelectedIndex = allItems.indexOf(selectedItems[selectedItems.length - 1]);

        const beforeItems = allItems.slice(0, firstSelectedIndex) as HTMLElement[];
        const targetItems = allItems.slice(firstSelectedIndex, lastSelectedIndex + 1) as HTMLElement[];
        const afterItems = allItems.slice(lastSelectedIndex + 1) as HTMLElement[];

        console.groupCollapsed(`Before Items (${beforeItems.length})`)
        beforeItems.forEach((item, index) => console.log(`\tℹ️#${index + 1}. ${item.textContent}`))
        console.groupEnd()

        console.groupCollapsed(`Target Items (${targetItems.length})`)
        targetItems.forEach((item, index) => console.log(`\t❗#${index + 1}. ${item.textContent}`))
        console.groupEnd()

        console.groupCollapsed(`After Items (${afterItems.length})`)
        afterItems.forEach((item, index) => console.log(`\tℹ️#${index + 1}. ${item.textContent}`))
        console.groupEnd()

        // #region Toggle Off List
        if (currentList.id === targetList.id && !isPerformMergeList) {
            console.groupCollapsed("Case 1: Toggle Off")
            ListService.splitList(currentList, targetItems, afterItems, (items) => {
                return items.map((li, index) => {
                    console.log(`\t#${index + 1}. ${li.textContent} `)

                    const p = document.createElement('p');
                    if (li.className) p.className = li.className;
                    if (li.style.cssText) p.style.cssText = li.style.cssText;
                    while (li.firstChild) p.appendChild(li.firstChild);
                    li.remove();
                    return p;
                });
            });
            console.groupEnd()
        }
        // #endregion

        // #region Switch Tag List
        else if (currentList.id !== targetList.id) {
            console.groupCollapsed("Case 1: Partial Switch Tag / Mixed Tag")
            if (state.isCollapsed) {
                console.log("Case 1: Switch Tag (entire list)")
                ListService.switchTag(currentList, targetList.tag, targetList);
            } else {
                console.log("Case 1: Switch Tag (selected items)")

                ListService.splitList(currentList, targetItems, afterItems, (items) => {
                    const middle = document.createElement(targetList.tag.toUpperCase());
                    middle.id = targetList.id;
                    middle.className = targetList.classes.add;

                    items.forEach((item, index) => {
                        console.log(`\t#${index + 1}. [${item.tagName}]`)

                        if (item.tagName == "P") {
                            const li = ListService.convertBlockToLi(item);
                            middle.appendChild(li)
                        } else if (item.tagName == 'LI') {
                            middle.appendChild(item)
                        }
                    })
                    return middle;
                });
            }
            console.groupEnd()
        }
        // #endregion
    }
    // #endregion

    // #region Case 2: Append/Split List (The Surgery)
    else if (startElement.tagName == "LI" || endElement.tagName == "LI") {
        console.groupCollapsed("CASE 2: Append/Split List (The Surgery)");
        console.log("Range Selection either start or end is a list tag.");

        const currentList = startElement.tagName == "LI" ? startElement.closest('ul, ol') : endElement.closest('ul, ol');

        if (currentList.id && currentList.id == targetList.id) {
            console.groupCollapsed("Add into same list");
            const selectedBlocks = getSelectedBlocks(editor, range, BLOCK_TAGS.filter((tag) => ['P', 'LI'].includes(tag)))

            // Check the position of the first selected P tag relative to the list
            const firstSelectedBlock = selectedBlocks[0];
            const position = firstSelectedBlock.compareDocumentPosition(currentList);
            const isParagraphBeforeList = position & Node.DOCUMENT_POSITION_FOLLOWING;

            if (isParagraphBeforeList) {
                [...selectedBlocks].reverse().forEach((block) => {
                    const li = ListService.convertBlockToLi(block);
                    currentList.prepend(li);
                });
            } else {
                selectedBlocks.forEach((block) => {
                    const li = ListService.convertBlockToLi(block);
                    currentList.appendChild(li);
                });
            }
            console.log(`Successfully converted [${selectedBlocks.length}] blocks to <li> items.`);
            console.groupEnd();
        } else {
            console.groupCollapsed("Mismatch detected or new list requested. Splitting and converting...");
            const selectedBlocks = getSelectedBlocks(editor, range, ['P', 'LI']);

            console.groupCollapsed("Selected Blocks (" + selectedBlocks.length + ")")
            selectedBlocks.forEach((block, index) => {
                console.log(`\t#${index + 1}[${block.tagName}]. ${block.textContent}`)
            })
            console.groupEnd();

            // 1. Determine relative position
            const firstBlock = selectedBlocks[0];
            const lastBlock = selectedBlocks[selectedBlocks.length - 1];
            const isInsertingBefore = firstBlock.tagName === 'P' && lastBlock.tagName === 'LI';
            const isInsertingAfter = firstBlock.tagName === 'LI' && lastBlock.tagName === 'P';

            console.log(`First Block: [${firstBlock.tagName}] ${firstBlock.textContent}`)
            console.log(`Last Block: [${lastBlock.tagName}] ${lastBlock.textContent}`)
            console.log("Is Inserting Before: ", isInsertingBefore)
            console.log("Is Inserting After: ", isInsertingAfter)


            // 2. Create the new list
            const newList = document.createElement(targetList.tag.toUpperCase()) as HTMLUListElement | HTMLOListElement;
            newList.id = targetList.id;
            newList.className = targetList.classes.add;

            // 3. surgery: logic based on insertion point
            if (isInsertingBefore) {
                // INSERT BEFORE: 
                currentList.before(newList);
                selectedBlocks.forEach((block, index) => {
                    console.log(`Processing #${index + 1} <${block.tagName.toLowerCase()}> -- insert Before`)
                    if (block.tagName === 'P') {
                        newList.appendChild(ListService.convertBlockToLi(block));
                    } else if (block.tagName === 'LI') {
                        newList.appendChild(block);
                    }
                });
            } else if (isInsertingAfter) {
                // INSERT AFTER:
                currentList.after(newList);
                const startLi = firstBlock.closest('li');
                console.log(`Start LI: [${startLi.tagName}] ${startLi.textContent}`)
                if (startLi) {
                    let nodeToMove: ChildNode | null = startLi;
                    while (nodeToMove) {
                        const next = nodeToMove.nextSibling;
                        newList.appendChild(nodeToMove);
                        nodeToMove = next;
                    }
                }
                // Now append the remaining P tags
                selectedBlocks.forEach((block, index) => {
                    console.log(`Processing #${index + 1} <${block.tagName.toLowerCase()}> -- append to new list`)
                    if (block.tagName === 'P') {
                        newList.appendChild(ListService.convertBlockToLi(block));
                    } else if (block.tagName === 'LI') {
                        newList.appendChild(block);
                    }
                });
            }
            // 4. Cleanup
            if (currentList.children.length === 0) currentList.remove();
            console.groupEnd();
        }
        console.groupEnd();
    }
    // #endregion

    // #region  Case 3: Create New List
    else {
        console.groupCollapsed("CASE 3: Create New List");
        console.log("Range Selection neither start nor end is a list tag.");

        const previousSibling = startElement.previousElementSibling as HTMLElement | null;
        const isList = ["UL", "OL"].includes(previousSibling?.tagName.toUpperCase() ?? "");

        // Path A: Join existing list
        if (isList && previousSibling!.id === targetList.id) {
            console.log("Previous List and Target List are the same. Join.");
            const selectedBlocks = getSelectedBlocks(editor, range, ['P']);

            selectedBlocks.forEach((block, index) => {
                console.log(`Processing #${index + 1} <${block.tagName.toLowerCase()}>`);
                previousSibling!.appendChild(ListService.convertBlockToLi(block));
            });
        }
        // Path B: Create new list (Handles both "Different ID" and "No Preceding List")
        else {
            console.log(isList ? "Previous List and Target List are different. Create new list." : "No preceding list. Create new list.");

            // 1. Get ALL selected blocks
            let selectedBlocks = getSelectedBlocks(editor, range);

            // 2. Filter: If a block's parent is also in the list, remove the child.
            selectedBlocks = selectedBlocks.filter(block => {
                const parentContainer = block.parentElement?.closest('ul, ol');
                // If the parent list is in selectedBlocks, ignore this LI child
                return !(parentContainer && selectedBlocks.includes(parentContainer as HTMLElement));
            });

            // 3. Create the new list container
            const newList = document.createElement(targetList.tag.toUpperCase());
            newList.id = targetList.id;
            newList.className = targetList.classes.add;

            // 4. Insert before/after
            previousSibling ? previousSibling.after(newList) : startElement.before(newList);

            // 5. Process blocks
            selectedBlocks.forEach((block, index) => {
                console.log(`Processing #${index + 1} <${block.tagName.toLowerCase()}>`);
                if (block.tagName.toUpperCase() === 'LI') {
                    // If it's already an LI, move it directly
                    newList.appendChild(block);
                } else if (block.tagName.toUpperCase() === 'UL' || block.tagName.toUpperCase() === 'OL') {
                    // If it's a whole list, move all its LI children to our new list
                    Array.from(block.querySelectorAll('li')).forEach(li => newList.appendChild(li));
                    block.remove(); // Remove the old list container
                } else {
                    // Otherwise, convert P, H1, etc. to LI
                    newList.appendChild(ListService.convertBlockToLi(block));
                }
            });
            console.log("Created a new list successfully.");
        }
        console.groupEnd();
    }
    // #endregion

    // #region Restore Selection
    console.log("Restore selection.")
    if (startRange.node && startRange.node.isConnected) {
        restoreRangePosition(selection, startRange, endRange);
    } else {
        console.warn("[List] Cannot restore selection: Nodes were destroyed during flatten.");
    }
    // #endregion
    console.groupEnd();

}

const insertList_ = (editor: HTMLDivElement, listTag: 'ul' | 'ol', classToAdd: string, classToRemove: string, mode: ListMode) => {

    console.groupCollapsed("[List] Inserting List (mode: " + mode + ")")

    const { selection } = getSelection(editor);
    if (!selection) return

    document.execCommand('defaultParagraphSeparator', false, 'p');

    // 2. Identify Current Context
    const existingList = getClosestElementFromSelection(selection, 'ul, ol');
    // const currentMode = existingList ? (existingList.id.includes('checkbox') ? 'checkbox' : existingList.id.includes('number') ? 'number' : 'bullet') : null;
    const isChecklist = !!existingList?.getAttribute(CHECKLIST_ATTR);
    const currentMode = isChecklist ? 'checkbox' : (existingList?.tagName === 'OL' ? 'number' : 'bullet');

    // 3. Execute Logic based on Context
    if (existingList) {
        if (currentMode === mode) {
            console.log('[List] 🔄 Toggling OFF'); // CASE A: Toggle Off (User clicked active mode)
            toggleListOff(existingList, mode, editor);
            return;
        } else {
            console.groupCollapsed('[List] 🔄 Switching Mode'); // CASE B: Switch Mode (User clicked different mode)
            switchListMode(existingList, listTag, editor);
            console.groupEnd();
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

    console.log("Apply Styles.")
    // 4. Apply Styles & Components (Runs for Case B and C)
    styleActiveList(editor, listTag, mode, { add: classToAdd, remove: classToRemove });
    console.groupEnd();
};
// #endregion

// #region handleCheckbox - Handle checkbox injection and styling
const injectCheckbox = (li: HTMLElement) => {
    // Find by class, not by ID
    const existingWrapper = li.querySelector('.checklist-item-wrapper');
    if (existingWrapper) return; // Already exists

    const wrapper = document.createElement('span');
    wrapper.className = "checklist-item-wrapper inline-block align-baseline mr-2";
    wrapper.contentEditable = 'false';
    wrapper.style.userSelect = 'none';

    wrapper.innerHTML = `
        <div contenteditable="false">
            <input type="checkbox">
        </div>
    `;

    li.prepend(wrapper);
    render(<Checkbox />, wrapper);
};
const injectCheckbox_ = (li: HTMLElement) => {
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
    listEl.querySelectorAll('.checklist-item-wrapper').forEach(wrapper => {
        wrapper.remove();
    });
};
const removeCheckboxWrapper_ = (listEl: HTMLElement) => {
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
        // restoreRangePosition(selection, state.startContainer, state.startOffset, state.endContainer, state.endOffset, state.isCollapsed)
        const start = { node: state.startContainer, offset: state.startOffset };
        const end = state.isCollapsed || !state.endContainer ? undefined : { node: state.endContainer, offset: state.endOffset };
        restoreRangePosition(selection, start, end);
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
const switchListMode = (listEl: HTMLElement, targetTag: 'ul' | 'ol', editor: HTMLElement) => {
    const targetConfig = Object.values(LIST_CONFIG).find((cfg) => cfg.tag.toUpperCase() === targetTag.toUpperCase());
    if (!targetConfig) return;

    // 1. Snapshot Cursor
    const cursorSnapshot = captureCursorPosition(listEl, editor);

    // 2. Perform DOM Transformation
    const newList = transformListContainer(listEl, targetTag, targetConfig);

    // 3. Side Effects (Checkbox management)
    manageCheckboxes(newList, targetTag, targetConfig.id);

    // 4. Restore Cursor
    restoreCursorPosition(newList, cursorSnapshot);

    console.log(`[List] Switched to ${targetTag} mode.`);
};

/** 1.Captures the active list item index and relative character offset */
const captureCursorPosition = (listEl: HTMLElement, editor: HTMLElement) => {

    console.log("[List] Capture Cursor Position: ", {
        listEl, editor
    })

    const { selection } = getSelection(editor);
    if (!selection?.rangeCount) return null;

    const range = selection.getRangeAt(0);
    const activeLi = range.startContainer.parentElement?.closest('li');
    if (!activeLi) return null;

    console.log("Active LI: ", activeLi)

    const liIndex = Array.from(listEl.querySelectorAll('li')).indexOf(activeLi);

    // Count offset relative to the start of the LI
    let offset = 0;
    const walker = document.createTreeWalker(activeLi, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
        if (node === range.startContainer) {
            offset += range.startOffset;
            break;
        }
        offset += node.textContent?.length || 0;
    }
    return { liIndex, offset };
};

/** 2.Transforms the list tag and migrates all content */
const transformListContainer = (listEl: HTMLElement, tag: string, config: any) => {
    const newList = document.createElement(tag.toLowerCase());

    // Style migration
    newList.className = listEl.className.replace(/list-(disc|decimal|none)/g, '').trim();
    newList.classList.add(...config.classToAdd.split(' '));
    newList.id = config.id;

    // Attribute migration
    Array.from(listEl.attributes).forEach(attr => {
        if (attr.name !== 'class' && attr.name !== 'id') newList.setAttribute(attr.name, attr.value);
    });

    // Move children
    while (listEl.firstChild) newList.appendChild(listEl.firstChild);
    listEl.parentNode?.replaceChild(newList, listEl);

    return newList;
};

/** 3.Manages checkbox rendering/removal */
const manageCheckboxes = (newList: HTMLElement, targetTag: string, id: string) => {
    const isCheckboxMode = targetTag.toLowerCase() === 'ul' && id === 'checkbox-wrapper';
    if (isCheckboxMode) {
        newList.querySelectorAll('li').forEach(li => injectCheckbox(li as HTMLElement));
    } else {
        removeCheckboxWrapper(newList);
    }
};

/** 4.Restores cursor to the correct LI and offset */
const restoreCursorPosition = (newList: HTMLElement, snapshot: { liIndex: number, offset: number } | null) => {
    if (!snapshot) return;

    const targetLi = newList.querySelectorAll('li')[snapshot.liIndex];
    if (!targetLi) return;

    const walker = document.createTreeWalker(targetLi, NodeFilter.SHOW_TEXT);
    let current = 0;
    let node: Node | null;

    while ((node = walker.nextNode())) {
        const len = node.textContent?.length || 0;
        if (current + len >= snapshot.offset) {
            const range = document.createRange();
            range.setStart(node, snapshot.offset - current);
            range.collapse(true);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
            return;
        }
        current += len;
    }
};

const switchListMode_ = (listEl: HTMLElement, targetTag: 'ul' | 'ol', editor: HTMLElement) => {
    // 1. Identify which config object we are switching TO
    const targetConfig = Object.values(LIST_CONFIG).find((cfg) => cfg.tag.toUpperCase() === targetTag.toUpperCase());
    if (!targetConfig) return;

    // We save which LI the user's cursor is currently inside
    const { selection } = getSelection(editor);
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const activeLi = range ? range.startContainer.parentElement?.closest('li') : null;
    const liIndex = activeLi ? Array.from(listEl.querySelectorAll('li')).indexOf(activeLi) : -1;

    // 2. Create the new list element
    const newList = document.createElement(targetTag.toLowerCase());

    // 3. Apply classes from the target configuration
    const allListClasses = ['list-disc', 'list-decimal', 'list-none'];
    newList.classList.remove(...allListClasses);
    newList.classList.add(...targetConfig.classToAdd.split(' '));

    // 4. Set the ID (or attribute as discussed)
    newList.id = targetConfig.id;

    // 5. Transfer attributes (preserving your data attributes)
    Array.from(listEl.attributes).forEach(attr => {
        if (attr.name !== 'class' && attr.name !== 'id') {
            newList.setAttribute(attr.name, attr.value);
        }
    });

    // 6. Move all children (the <li> elements) from old to new
    // Moving nodes is safer than innerHTML as it preserves event listeners and classes
    while (listEl.firstChild) {
        newList.appendChild(listEl.firstChild);
    }

    // 7. Replace in DOM
    listEl.parentNode?.replaceChild(newList, listEl);

    // 8. Handle Checkbox side effects
    if (targetTag.toLowerCase() === 'ul' && targetConfig.id === 'checkbox-wrapper') {
        newList.querySelectorAll('li').forEach(li => injectCheckbox(li as HTMLElement));
    } else {
        removeCheckboxWrapper(newList);
    }

    // --- RESTORE SELECTION ---
    if (liIndex !== -1 && range) {
        const newLis = newList.querySelectorAll('li');
        const targetLi = newLis[liIndex];

        if (targetLi) {
            // 1. Calculate the offset relative to the LI start
            // We use a helper to count how many characters into the LI the cursor was
            const getRelativeOffset = (node: Node, offset: number, container: Node): number => {
                let count = 0;
                const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
                let n: Node | null;
                while ((n = walker.nextNode())) {
                    if (n === node) {
                        return count + offset;
                    }
                    count += n.textContent?.length || 0;
                }
                return count;
            };

            const relativeOffset = getRelativeOffset(range.startContainer, range.startOffset, activeLi!);

            // 2. Set the new cursor position by walking the new LI
            const walker = document.createTreeWalker(targetLi, NodeFilter.SHOW_TEXT);
            let currentOffset = 0;
            let node: Node | null;
            let found = false;

            while ((node = walker.nextNode())) {
                const len = node.textContent?.length || 0;
                if (currentOffset + len >= relativeOffset) {
                    const newRange = document.createRange();
                    newRange.setStart(node, relativeOffset - currentOffset);
                    newRange.collapse(true);
                    selection?.removeAllRanges();
                    selection?.addRange(newRange);
                    found = true;
                    break;
                }
                currentOffset += len;
            }

            // Fallback if the walk fails
            if (!found) {
                targetLi.focus();
            }
        }
    }

    console.log(`[List] Switched to ${targetTag} and selection restored.`);
};

/** Logic to apply classes, IDs, and components to the active list */
const styleActiveList = (editor: HTMLElement, listTag: string, mode: ListMode, classes: { add: string, remove: string }) => {
    console.log("[List] 🎨 Styling List", { listTag, mode, add: classes.add, remove: classes.remove, })
    const { selection } = getSelection(editor);
    if (!selection?.rangeCount) return;

    const listEl = getClosestElementFromSelection(selection, listTag) as HTMLElement;
    if (!listEl) return;

    // 1. Set the attribute instead of ID
    if (mode === "checkbox") {
        listEl.setAttribute(CHECKLIST_ATTR, "true");
        listEl.id = LIST_CONFIG[mode].id;
    } else {
        listEl.removeAttribute(CHECKLIST_ATTR);
    }

    // 2. Apply Classes
    const toRemove = classes.remove.split(' ').filter(c => c);
    const toAdd = classes.add.split(' ').filter(c => c);

    console.log("[List] 🎨 Removing Classes:", toRemove);
    listEl.classList.remove(...toRemove);
    console.log("[List] 🎨 Adding Classes:", toAdd);
    listEl.classList.add(...toAdd);

    // 3. Inject checkboxes if mode is checkbox
    if (mode === "checkbox") {
        listEl.querySelectorAll('li').forEach(item => injectCheckbox(item as HTMLElement));
    } else {
        removeCheckboxWrapper(listEl);
    }
};

const styleActiveList_ = (editor: HTMLElement, listTag: string, mode: ListMode, classes: { add: string, remove: string }) => {
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
                // restoreRangePosition(postSelection.selection, postSelection.state.startContainer, postSelection.state.startOffset, postSelection.state.endContainer, postSelection.state.endOffset, postSelection.state.isCollapsed);
                const startRange = { node: postSelection.state.startContainer, offset: postSelection.state.startOffset }
                const endRange = postSelection.state.isCollapsed || !postSelection.state.endContainer ? undefined : { node: postSelection.state.endContainer, offset: postSelection.state.endOffset }
                restoreRangePosition(postSelection.selection, startRange, endRange)
            } else {
                // It's not a P tag, so just log it as requested
                console.log(`[List] ℹ️ Parent is <${parentTag}>, no unwrap needed.`);
            }
        }
    }
}
// #endregion
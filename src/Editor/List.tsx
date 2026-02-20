import { $, $$, render, customElement, defaults, ElementAttributes, HtmlClass, HtmlString, ObservableMaybe, useEffect, } from 'woby'
import { Button, ButtonStyles } from '../Button'
import ListBulleted from '../icons/list_bulleted'
import ListNumbered from '../icons/list_numbered'
import ListCheckbox from '../icons/list_checkbox'
import { useEditor } from './undoredo'
import { Checkbox } from '../Checkbox'
import { getCurrentEditor } from './utils'

// #region Types & Configuration
type ListMode = "bullet" | "number" | "checkbox"

const LIST_CONFIG = {
    bullet: { tag: 'ul', id: 'bullet-wrapper', classToAdd: 'list-disc', classToRemove: 'list-decimal list-none', title: "Bulleted List", icon: <ListBulleted class="size-5" /> },
    number: { tag: 'ol', id: 'number-wrapper', classToAdd: 'list-decimal', classToRemove: 'list-disc list-none', title: "Numbered List", icon: <ListNumbered class="size-5" /> },
    checkbox: { tag: 'ul', id: 'checkbox-wrapper', classToAdd: 'list-none', classToRemove: 'list-disc list-decimal', title: "Checkbox List", icon: <ListCheckbox class="size-5" /> }
} as const;

const def = () => ({
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    mode: $("bullet", HtmlString) as ObservableMaybe<ListMode>,
})
// #endregion

// #region Get Current Editor
/**
 * Finds the actual editable <div> the user is typing in.
 * 
 * Logic:
 * 1. Locates the cursor position.
 * 2. Climbs up the DOM to find the [contenteditable] container.
 * 3. If inside a <wui-editor>, it "pierces" the Shadow DOM to find the internal input area.
 * 
 * @returns The editable element or undefined.
 */
const getCurrentEditor_ = () => {
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let node = range.startContainer;
        let targetElement = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
        let root = (targetElement as HTMLElement).closest('[contenteditable]');

        if (!(targetElement as HTMLElement).hasAttribute("contenteditable")) {
            // while (targetElement && targetElement.parentElement !== root && targetElement.parentElement !== document.body) {
            while (targetElement && targetElement instanceof HTMLElement && !targetElement.hasAttribute("contenteditable") && targetElement !== document.body) {
                targetElement = targetElement.parentElement;
            }
        }

        const editorHost = (targetElement as HTMLElement).querySelector("wui-editor")

        console.log("[List] 🔍 Get Current Editor", {
            "target": { "element": targetElement, "type": typeof targetElement },
            "host": { "element": editorHost, "type": typeof editorHost }
        })

        return editorHost != undefined ? editorHost.shadowRoot.querySelector('[contenteditable]') as HTMLDivElement : targetElement as HTMLDivElement
    }

    console.warn("[List] 🔍 Get Current Editor - No selection found.")
    return
}

// #endregion


// #region insertList - Handle list insertion and styling
const insertList = (editor: HTMLDivElement, listTag: 'ul' | 'ol', classToAdd: string, classToRemove: string, mode: ListMode) => {

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    // 1. Resolve Editor Root
    let root: HTMLElement | null = (editor instanceof HTMLElement) ? editor : null

    if (!root) {
        let node: Node | null = selection.getRangeAt(0).commonAncestorContainer
        if (node.nodeType === Node.TEXT_NODE) { node = node.parentElement }
        if (node instanceof HTMLElement) { root = node.isContentEditable ? node : node.closest('[contenteditable="true"]') as HTMLElement }
    }

    if (!root || !(root instanceof HTMLElement)) return

    // 2. Ensure Focus
    if (document.activeElement !== root && !root.contains(document.activeElement)) { root.focus() }

    // DEBUG: to check the current list tag
    // Check if the cursor is currently inside a UL or OL
    const existingList = editor.querySelector("ul") ?? editor.querySelector("ol")
    const current = existingList ? { tag: existingList.tagName, id: existingList.id, class: existingList.className } : null
    const isSameMode = current ? current.id.includes(mode) : null


    if (existingList) {
        if (current.tag != listTag.toUpperCase() || isSameMode) {
            if (current.id.includes("checkbox")) {
                removeCheckboxWrapper(existingList as HTMLElement)
            }

            const command = listTag === 'ul' ? 'insertUnorderedList' : 'insertOrderedList'
            document.execCommand(command, false)

            setTimeout(() => {
                if (root) syncAllLists(root)
            }, 0)
        }
    } else {
        // 3. Execute Command
        const command = listTag === 'ul' ? 'insertUnorderedList' : 'insertOrderedList'
        document.execCommand(command, false)
    }

    // 4. Apply Styling & Cleanup
    const newSelection = window.getSelection()

    if (newSelection && newSelection.rangeCount > 0) {
        // Get the node where the cursor is currently blinking
        let anchorNode = newSelection.anchorNode;
        if (anchorNode?.nodeType === Node.TEXT_NODE) anchorNode = anchorNode.parentElement;

        // Find the list (UL/OL) by climbing up from the cursor position
        // This works perfectly inside Shadow DOM
        let listEl = (anchorNode as HTMLElement)?.closest(listTag);

        if (listEl == undefined) {
            listEl = editor.querySelector(listTag)
        }

        if (listEl) {
            // 1. Set the ID
            listEl.id = mode === "bullet" ? "bullet-wrapper" : mode === "number" ? "number-wrapper" : "checkbox-wrapper";

            // 2. Apply Classes
            const toRemove = classToRemove.split(' ').filter(c => c);
            const toAdd = classToAdd.split(' ').filter(c => c);
            listEl.classList.remove(...toRemove);
            listEl.classList.add('list-inside', 'text-wrap', ...toAdd);

            // 3. Handle Checkbox Components
            if (mode === "checkbox") {
                const items = listEl.querySelectorAll('li');
                items.forEach(li => injectCheckbox(li as HTMLElement));
            } else {
                removeCheckboxWrapper(listEl as HTMLElement);
            }
            // Exit early since we found and fixed the list
            return;
        } else {
            console.warn("❌ Could not find the list element to apply ID.");
        }
    }

    // 5. Fallback Cleanup
    const wrongLists = root.querySelectorAll(`${listTag}.${classToRemove}`)
    wrongLists.forEach(l => {
        l.classList.remove(classToRemove)
        l.classList.add('list-inside', classToAdd)
    })

    const bareLists = root.querySelectorAll(`${listTag}:not(.${classToAdd})`)
    bareLists.forEach(l => {
        l.classList.add('list-inside', classToAdd)
    })


}
// #endregion

// #region handleCheckbox - Handle checkbox injection and styling
const injectCheckbox = (li: HTMLElement) => {

    console.log("[List] ✨ inject checkbox")

    // 1. Check for "Dead" Clones (from pressing Enter)
    // Browsers clone the HTML of the previous line, but not the JS events.
    // We must remove the dead clone to render a fresh, working component.
    const existingWrapper = li.querySelector('.woby-checkbox-wrapper')
    if (existingWrapper) {
        existingWrapper.remove()
    }

    // 2. Style the LI to align text next to checkbox
    li.style.display = 'flex'
    li.style.alignItems = 'flex-start'
    li.style.gap = '8px'
    li.style.marginBottom = '4px'

    // 3. Create the container
    const wrapper = document.createElement('span')
    wrapper.className = 'woby-checkbox-wrapper'
    wrapper.contentEditable = 'false' // Critical: prevents cursor entering the checkbox
    wrapper.style.userSelect = 'none'
    wrapper.style.marginTop = '3px' // Optional: fine-tune vertical alignment

    // 4. Insert at start
    li.prepend(wrapper)

    // 5. Render the Woby Component
    render(<Checkbox />, wrapper)
}

const removeCheckboxWrapper = (listEl: HTMLElement) => {
    const items = listEl.querySelectorAll('li')
    items.forEach(li => {
        // 2. Find the wrapper span (Using class selector based on your screenshot)
        const wrapper = li.querySelector('.woby-checkbox-wrapper')

        // 3. Remove the wrapper (and the Checkbox component inside it)
        if (wrapper) {
            wrapper.remove()
        }

        // 4. CLEANUP STYLES
        // This is very important. You previously set these to 'flex' for the checkbox.
        // You must reset them so standard Bullets/Numbers render correctly.
        li.removeAttribute('style')
    })
}
// #endregion

const syncAllLists = (root: HTMLElement) => {
    // 1. Find every UL/OL in the editor
    const allLists = root.querySelectorAll('ul, ol')

    allLists.forEach((list, index) => {
        const el = list as HTMLElement

        // Detect if this IS a checkbox list based on its class
        const isCheckboxList = el.tagName === 'UL' && el.classList.contains('list-none')

        if (isCheckboxList) {
            // Restore the ID that the browser forgot to clone during the split
            el.id = 'checkbox-wrapper'

            // Ensure every item has a checkbox
            const items = el.querySelectorAll('li')
            items.forEach(li => injectCheckbox(li as HTMLElement))
        } else {
            // If it's a normal bullet/number list, make sure no checkboxes are left inside
            if (el.id === 'checkbox-wrapper') {
                el.removeAttribute('id')
            }
            removeCheckboxWrapper(el)
        }
    })

    // 2. Cleanup Orphans
    // If an item was removed from a list, it might still have a checkbox wrapper
    // inside a <p> or <div>. We must remove those.
    const orphans = root.querySelectorAll('.woby-checkbox-wrapper')

    orphans.forEach((span, idx) => {
        const isInListItem = !!span.closest('li')
        if (!isInListItem) {
            span.remove()
        }
    })
}


const List = defaults(def, (props) => {
    const { class: cn, cls, mode, buttonType: btnType, ...otherProps } = props

    const editor = useEditor()
    const isActive = $(false)

    // Reactive Icon
    const listProps = () => ({
        tag: LIST_CONFIG[$$(mode)].tag,
        id: LIST_CONFIG[$$(mode)].id,
        classToAdd: LIST_CONFIG[$$(mode)].classToAdd,
        classToRemove: LIST_CONFIG[$$(mode)].classToRemove,
        icon: LIST_CONFIG[$$(mode)].icon,
        title: LIST_CONFIG[$$(mode)].title,
    })

    // #region Active State Detection
    useEffect(() => {
        let editorEl = $$(editor) ?? $$(getCurrentEditor())
        const currentMode = $$(mode)

        const updateState = () => {
            let state = false

            // 1. Get current selection
            const sel = window.getSelection()
            if (!sel || sel.rangeCount === 0) {
                isActive(false)
                return
            }

            // 2. Find the closest list parent (UL or OL)
            let node: Node | null = sel.getRangeAt(0).commonAncestorContainer
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
                if (state && editorEl && !editorEl.contains(closestList)) {
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
        let editorEl = $$(editor) ?? $$(getCurrentEditor())
        // Still add the safety check
        if (!editorEl) {
            console.error("[List] Cannot find editor element to observe")
            return
        }

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                // Check newly added nodes
                mutation.addedNodes.forEach((node) => {
                    // We only care about Elements (not text nodes)
                    if (node instanceof HTMLElement) {

                        // Scenario 1: A single LI was added (Pressing Enter)
                        if (node.tagName === 'LI') {
                            const parent = node.closest('ul')
                            // ONLY render if parent is our specific checkbox wrapper
                            if (parent && parent.id === 'checkbox-wrapper') {
                                injectCheckbox(node)
                            }
                        }

                        // Scenario 2: A whole UL was pasted or created
                        if (node.tagName === 'UL' && node.id === 'checkbox-wrapper') {
                            node.querySelectorAll('li').forEach(li => injectCheckbox(li))
                        }
                    }
                })
            })
        })

        // Start observing the editor
        observer.observe(editorEl, {
            childList: true, // Watch for added/removed children
            subtree: true    // Watch deep inside the editor
        })

        return () => observer.disconnect()
    })
    // #endregion

    const handleClick = (e: MouseEvent) => {
        e.preventDefault()

        let editorEl = $$(editor) ?? $$(getCurrentEditor())

        // Ensure we don't force inline styles, we want classes
        document.execCommand('styleWithCSS', false, 'false')

        console.log("[List] Handle Click - Selection - ", window.getSelection());
        // list-disc (bullet)   list-decimal (number)   list-none (checkbox)
        insertList(editorEl, listProps().tag, listProps().classToAdd, listProps().classToRemove, $$(mode))

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


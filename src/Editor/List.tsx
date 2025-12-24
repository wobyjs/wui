import { $, $$, customElement, defaults, ElementAttributes, HtmlClass, HtmlString, ObservableMaybe, useEffect, } from 'woby'
import { Button, ButtonStyles } from '../Button'
import ListBulleted from '../icons/list_bulleted'
import ListNumbered from '../icons/list_numbered'
import { useEditor } from './undoredo'

type ListMode = "bullet" | "number"

const def = () => ({
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    mode: $("bullet", HtmlString) as ObservableMaybe<ListMode>,
})

const ListButton = defaults(def, (props) => {
    const { class: cn, cls, mode, buttonType: btnType, ...otherProps } = props

    const editor = useEditor()
    const isActive = $(false)

    // Reactive Icon
    const icon = () => {
        const m = $$(mode)
        if (m === "bullet") return <ListBulleted class="size-5" />
        if (m === "number") return <ListNumbered class="size-5" />
        return <ListBulleted class="size-5" />
    }

    // Reactive Title
    const title = () => {
        const m = $$(mode)
        if (m === "bullet") return "Bulleted List"
        if (m === "number") return "Numbered List"
        return "List"
    }

    useEffect(() => {
        const editorEl = $$(editor)
        const currentMode = $$(mode)
        const targetTag = currentMode === 'bullet' ? 'UL' : 'OL'

        const updateState = () => {
            let state = false

            // METHOD A: Native Command State (Try this first)
            try {
                const command = currentMode === 'bullet' ? 'insertUnorderedList' : 'insertOrderedList'
                if (document.queryCommandState(command)) {
                    state = true
                }
            } catch (e) { }

            // METHOD B: Manual DOM Check (Fallback & robustness)
            // If native check failed (or returned false), we verify the DOM manually.
            // This ensures the button lights up even if focus is slightly ambiguous.
            if (!state) {
                const sel = window.getSelection()
                if (sel && sel.rangeCount > 0) {
                    let node: Node | null = sel.getRangeAt(0).commonAncestorContainer
                    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement

                    if (node instanceof HTMLElement) {
                        // Find the CLOSEST list parent (either UL or OL)
                        // We use 'ul, ol' to find the immediate parent list type.
                        // This prevents highlighting Bullet button if we are inside an OL that is nested in a UL.
                        const closestList = node.closest('ul, ol')

                        if (closestList && closestList.tagName === targetTag) {
                            // Verify this list is actually inside our editor (if we know the editor)
                            if (editorEl) {
                                if (editorEl.contains(closestList)) state = true
                            } else {
                                // If no editor context (Web Component), just trust the selection
                                state = true
                            }
                        }
                    }
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

    const handleClick = (e: MouseEvent) => {
        e.preventDefault()

        const editorEl = $$(editor)
        const buttonMode = $$(mode)

        // Ensure we don't force inline styles, we want classes
        document.execCommand('styleWithCSS', false, 'false')

        if (buttonMode === "bullet") {
            insertList(editorEl, 'ul', 'list-disc', 'list-decimal')
        } else {
            insertList(editorEl, 'ol', 'list-decimal', 'list-disc')
        }

        // Force update UI state immediately
        // (Short timeout allows the DOM to update first)
        setTimeout(() => {
            // Manually trigger a check
            const evt = new Event('selectionchange')
            document.dispatchEvent(evt)
        }, 10)
    }

    const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    return (
        <Button
            type={btnType}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            title={title}
            class={() => [
                () => $$(cls) ? $$(cls) : cn,
                () => $$(isActive) ? '!bg-slate-200' : ''
            ]}

            aria-pressed={() => $$(isActive) ? "true" : "false"}
            {...otherProps}
        >
            {icon}
        </Button>
    )
})

export { ListButton }

customElement('wui-list-button', ListButton)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-list-button': ElementAttributes<typeof ListButton>
        }
    }
}

export default ListButton


// #region insertList - Handle list insertion and styling
const insertList = (editor: any, listTag: 'ul' | 'ol', classToAdd: string, classToRemove: string) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    // 1. Resolve Editor Root
    let root: HTMLElement | null = (editor instanceof HTMLElement) ? editor : null

    if (!root) {
        let node: Node | null = selection.getRangeAt(0).commonAncestorContainer
        if (node.nodeType === Node.TEXT_NODE) node = node.parentElement
        if (node instanceof HTMLElement) {
            root = node.isContentEditable
                ? node
                : node.closest('[contenteditable="true"]') as HTMLElement
        }
    }

    if (!root || !(root instanceof HTMLElement)) return

    // 2. Ensure Focus
    if (document.activeElement !== root && !root.contains(document.activeElement)) {
        root.focus()
    }

    // 3. Execute Command
    const command = listTag === 'ul' ? 'insertUnorderedList' : 'insertOrderedList'
    document.execCommand(command, false)

    // 4. Apply Styling & Cleanup
    const newSelection = window.getSelection()
    if (newSelection && newSelection.rangeCount > 0) {
        let node: Node | null = newSelection.getRangeAt(0).commonAncestorContainer
        if (node.nodeType === Node.TEXT_NODE) node = node.parentElement

        if (node instanceof HTMLElement) {
            const listEl = node.closest(listTag)
            if (listEl && root.contains(listEl)) {
                // Force remove opposing class to fix visual bugs during swap
                listEl.classList.remove(classToRemove)
                listEl.classList.add('list-inside', classToAdd)
                return
            }
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
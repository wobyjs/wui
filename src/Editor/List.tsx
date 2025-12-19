import { $, $$, customElement, defaults, ElementAttributes, HtmlString, Observable, ObservableMaybe, } from 'woby'
import { Button, ButtonStyles } from '../Button'
import ListBulleted from '../icons/list_bulleted'
import ListNumbered from '../icons/list_numbered'
import { useEditor } from './undoredo'

/**
 * Inserts a list (UL or OL) and applies the specified CSS classes.
 */
const insertList = (
    editorObs: HTMLElement | null | undefined,
    listTag: 'ul' | 'ol',
    className: string
) => {
    // 1. Resolve Editor Root
    // We try to use the passed editor object first (if Context works)
    let root = (editorObs instanceof HTMLElement) ? editorObs : null

    const selection = window.getSelection()

    // Fallback: If no root from context, find it via selection
    if (!root) {
        if (!selection || selection.rangeCount === 0) return

        let node = selection.getRangeAt(0).commonAncestorContainer
        if (node.nodeType === Node.TEXT_NODE) node = node.parentNode!

        // Find the editable wrapper
        root = (node as HTMLElement).closest('[contenteditable="true"]') as HTMLElement
    }

    if (!root) return

    // 2. Ensure Focus & Execute
    // Focus is required for execCommand to target the correct area
    root.focus()

    const command = listTag === 'ul' ? 'insertUnorderedList' : 'insertOrderedList'
    document.execCommand(command, false)

    // 3. Apply Styling (Primary Method)
    // We search UP from the current cursor position to find the new list element
    const newSelection = window.getSelection()
    if (newSelection && newSelection.rangeCount > 0) {
        const range = newSelection.getRangeAt(0)
        let current = range.commonAncestorContainer

        // Traverse up to find the UL/OL
        let depth = 0
        while (current && current !== root && depth < 20) {
            if (current.nodeType === Node.ELEMENT_NODE) {
                const el = current as HTMLElement
                const tag = el.tagName.toLowerCase()

                if (tag === 'ul' || tag === 'ol') {
                    el.className = className
                    break
                }
            }
            current = current.parentNode
            depth++
        }
    }

    // 4. Styling Fallback (Crucial for Empty Lines)
    // Sometimes selection logic fails on empty nodes. This ensures ALL lists have style.
    // We look for any UL/OL in the root that doesn't have our Tailwind classes yet.
    const rawLists = root.querySelectorAll(`${listTag}:not([class*="list-"])`)
    rawLists.forEach(l => l.className = className)
}

type ListMode = "bullet" | "number"

const def = () => ({
    cls: $(""),
    class: $(""),
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    mode: $("bullet", HtmlString) as ObservableMaybe<ListMode>,
})

const ListButton = defaults(def, (props) => {
    const { class: cn, cls, mode, buttonType: btnType, ...otherProps } = props

    const editor = useEditor()

    // Reactive Icon
    const icon = () => {
        const m = $$(mode)
        if (m === "bullet") return <ListBulleted class="text-black size-6" />
        if (m === "number") return <ListNumbered class="text-black size-6" />
        return <ListBulleted class="text-black size-6" />
    }

    // Reactive Title
    const title = () => {
        const m = $$(mode)
        if (m === "bullet") return "Bulleted List"
        if (m === "number") return "Numbered List"
        return "List"
    }

    const handleClick = (e: MouseEvent) => {
        e.preventDefault(); // Stop button from stealing focus

        // Unwrap editor before passing
        const currentEditor = $$(editor) as HTMLElement | null

        switch ($$(mode)) {
            case "bullet":
                insertList(currentEditor, 'ul', 'list-inside list-disc')
                break
            case "number":
                insertList(currentEditor, 'ol', 'list-inside list-decimal')
                break
        }
    }

    const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault(); // Prevent focus loss on click
    }

    return (
        <Button
            type={btnType}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            title={title}
            class={[cls, cn]}
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
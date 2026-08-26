import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, JSX, Observable, ObservableMaybe } from 'woby'
import { Button } from '../Button'
import { EditorContext, useUndoRedo } from './undoredo'
import { useDropdownDismiss } from './useDropdownDismiss'
import { range, getCurrentRange } from './utils' // Import getCurrentRange
import KeyboardDownArrow from '../icons/keyboard_down_arrow'
import Plus from '../icons/plus'
import { getEditorPlugins, pluginsToInsertItems, InsertMenuItem } from './EditorPlugin'
import { INSERT_IMAGE_EVENT, type InsertImageDetail } from './ImageDialog'

// Icons - placeholders, replace with actual SVGs or components
const HorizontalRuleIcon = () => <span>HR</span>
const ImageIcon = () => <span>Img</span>
const TableIcon = () => <span>Tbl</span>
const ContainerIcon = () => <span>Box</span>
const RowIcon = () => <span>Row</span>
const GifIcon = () => <span>GIF</span>
// ... other icons

// The attribute escaper that used to live here went with the image path: images are now
// built as detached DOM nodes by `ImageDialog`, where there is no attribute context to
// break out of, and `ImageSource.isAllowedSource` vets the URL scheme by parsing rather
// than by pattern-matching. Nothing else on this file's insert paths interpolates user
// input into HTML.

/**
 * Sanitize HTML content for safe insertion via document.execCommand('insertHTML').
 * Removes dangerous elements (script, iframe, object, embed, form, etc.)
 * and event handler attributes (on*).
 */
const sanitizeHTML = (html: string): string => {
    // Remove dangerous tags and their content
    html = html.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    html = html.replace(/<\s*\/?\s*(script|iframe|object|embed|applet|form|input|textarea|select|button|link|style|meta|base)[^>]*>/gi, '')
    // Remove event handler attributes (onclick, onload, onerror, etc.)
    html = html.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Remove javascript: URLs
    html = html.replace(/(href|src|action)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '$1=""')
    return html
}

// Helper to get shadow root selection for wui-editor
function getEditorSelection(): { selection: Selection | null, shadowRoot: ShadowRoot | null } {
    const editorHost = document.querySelector('wui-editor')
    const shadowRoot = editorHost?.shadowRoot || null
    const selection = shadowRoot ? shadowRoot.getSelection() : window.getSelection()
    return { selection, shadowRoot }
}

// #region Insert Actions
const execInsertHorizontalRule = () => {
    const { selection, shadowRoot } = getEditorSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)

    // Restore selection after potential focus loss
    selection.removeAllRanges()
    selection.addRange(range)

    const hrWithClasses = '<hr class="my-4 mx-auto border-gray-400" />'
    document.execCommand('insertHTML', false, hrWithClasses)
}

/**
 * Hand the caret to `ImageDialog` and let it do the rest.
 *
 * The caret has to be captured *here*, before anything steals focus: opening the dialog
 * blurs the contenteditable surface, and a blurred shadow root reports no selection at
 * all. The dialog restores this range when the user commits.
 */
const execInsertImage = () => {
    const { selection } = getEditorSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)

    const editorHost = document.querySelector('wui-editor')
    editorHost?.dispatchEvent(new CustomEvent<InsertImageDetail>(INSERT_IMAGE_EVENT, { detail: { range } }))
}

const execInsertTable = () => {
    const { selection, shadowRoot } = getEditorSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)

    const rowsStr = prompt('Enter number of rows:', '2')
    if (rowsStr === null) return

    const colsStr = prompt('Enter number of columns:', '3')
    if (colsStr === null) return

    const rows = parseInt(rowsStr, 10)
    const cols = parseInt(colsStr, 10)

    if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
        alert('Invalid number of rows or columns.')
        return
    }

    // Restore selection after prompts
    selection.removeAllRanges()
    selection.addRange(range)

    // Build HTML String
    let tableHTML = '<table class="w-full border-collapse border border-gray-400 my-2"><tbody>'

    for (let i = 0; i < rows; i++) {
        tableHTML += '<tr>'
        for (let j = 0; j < cols; j++) {
            tableHTML += '<td class="border border-gray-300 p-2 min-w-[50px]">&nbsp;</td>'
        }
        tableHTML += '</tr>'
    }
    tableHTML += '</tbody></table><br>'

    document.execCommand('insertHTML', false, sanitizeHTML(tableHTML))
}
/**
 * A neutral container to format with: padding, a margin and a faint dashed edge so an
 * empty one can be seen and grabbed. Everything here is inline style rather than a class
 * precisely so the property panel can edit or strip any of it afterwards.
 */
const CONTAINER_STYLE = 'padding: 12px; margin: 8px 0; border: 1px dashed #cbd5e1; border-radius: 8px;'

/** The same box laid out as a wrapping row -- the shape that makes components sit side by side. */
const ROW_STYLE = 'display: flex; gap: 16px; flex-wrap: wrap; align-items: center; ' + CONTAINER_STYLE

/** The child of the surface that `node` lives in, i.e. the top-level block around it. */
const topLevelBlock = (node: Node | null, surface: HTMLElement): Node | null => {
    let n: Node | null = node
    while (n && n.parentNode && n.parentNode !== surface) n = n.parentNode
    return n && n.parentNode === surface ? n : null
}

/**
 * Insert a plain <div> to format with: empty at a caret, or wrapped around the blocks the
 * selection covers.
 *
 * Built by hand rather than through `execCommand('insertHTML')` like the inserts above,
 * because that one splices at the caret -- inside a paragraph it would leave a <div> nested
 * in a <p>, which is invalid and which the next reparse pulls apart. Working in whole
 * top-level blocks instead keeps the result valid whatever the caret was sitting in, and
 * makes the wrap case mean the useful thing: "put these paragraphs in a box".
 *
 * The new container is left marked as the node selection, so its drag grip and the property
 * panel are on it immediately -- an empty container is otherwise hard to select, since every
 * click inside one lands on the text it wraps and a fresh one has no text to click.
 */
const insertContainer = (style: string) => {
    const { selection } = getEditorSelection()
    const surface = document.querySelector('wui-editor')?.shadowRoot
        ?.querySelector('[data-editor-root]') as HTMLElement | null
    if (!surface) return

    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null
    const withinSurface = !!range && surface.contains(range.commonAncestorContainer)
    const first = withinSurface ? topLevelBlock(range!.startContainer, surface) : null
    const last = withinSurface ? topLevelBlock(range!.endContainer, surface) : null

    const div = document.createElement('div')
    div.setAttribute('style', style)

    if (range && !range.collapsed && first && last) {
        // Wrap: park the container where the run starts, then walk the siblings into it.
        // `nextSibling` is read before each move, since moving a node clears its own.
        surface.insertBefore(div, first)
        let node: Node | null = first
        while (node) {
            const next: Node | null = node === last ? null : node.nextSibling
            div.appendChild(node)
            node = next
        }
    } else {
        // Empty: after the block holding the caret, or at the end when there is no caret
        // in the content (the toolbar was clicked before the surface was ever focused).
        // The <br> gives it a line box, so it has a height to click and a place to type.
        if (first) surface.insertBefore(div, first.nextSibling)
        else surface.appendChild(div)
        div.appendChild(document.createElement('br'))

        const caret = document.createRange()
        caret.selectNodeContents(div)
        caret.collapse(true)
        selection?.removeAllRanges()
        selection?.addRange(caret)
    }

    surface.querySelectorAll('[data-element-selected]')
        .forEach(el => el.removeAttribute('data-element-selected'))
    div.setAttribute('data-element-selected', '')
}

const execInsertContainer = () => insertContainer(CONTAINER_STYLE)
const execInsertRow = () => insertContainer(ROW_STYLE)
// #endregion

const getInsertOptions = (): InsertMenuItem[] => {
    const builtIn = [
        { label: 'Horizontal Rule', action: execInsertHorizontalRule, icon: HorizontalRuleIcon },
        { label: 'Image', action: execInsertImage, icon: ImageIcon },
        { label: 'Table', action: execInsertTable, icon: TableIcon },
        { label: 'Container', action: execInsertContainer, icon: ContainerIcon },
        { label: 'Row (flex)', action: execInsertRow, icon: RowIcon },
    ]

    // Merge registered plugin items
    const plugins = $$(getEditorPlugins())
    if (plugins.length > 0) {
        const pluginItems = pluginsToInsertItems(document.querySelector('wui-editor')?.shadowRoot?.querySelector('[data-editor-root]') as HTMLElement) as InsertMenuItem[]
        return [...builtIn, ...pluginItems]
    }

    return builtIn
}

const def = () => ({
    // HtmlClass, not a bare $(""): without the codec the attribute never flattens
    // array/dict class values, so `cls`/`class` round-trip differently here than on
    // every other wui component.
    cls: $("", HtmlClass) as JSX.Class,
    class: $("", HtmlClass) as JSX.Class,
    disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean>
})

const InsertDropDown = defaults(def, (props) => {

    const { cls, class: className, disabled, ...otherProps } = props

    const editor = $(EditorContext)
    // const { undos, saveDo } = useUndoRedo() // Removed as saveDo is handled by MutationObserver
    const isOpen = $(false)
    const dropdownRef = $<HTMLElement>(null as any)

    useDropdownDismiss(dropdownRef as any, () => isOpen(false))

    const toggleDropdown = () => isOpen(!isOpen())

    const handleSelectOption = (action: () => void) => {
        if ($$(editor)) {
            // saveDo(undos) // Removed: MutationObserver in Editor.tsx should now handle this
            action()
            // $$(editor)?.focus() // Re-focus editor
        }
        isOpen(false)
    }

    const DropDownMenu = () => {
        return (
            <div
                class="origin-top-left absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 max-h-80 overflow-y-auto"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="insert-menu-button"
                onMouseDown={(e: any) => {
                    e.stopPropagation() // Prevents the menu from closing immediately
                    e.preventDefault()  // Prevents the editor from losing focus
                }}
            >
                <div class="py-1" role="none">
                    {getInsertOptions().map(opt => (
                        <Button
                            type='outlined'
                            cls="w-full flex items-center text-gray-700 px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900"
                            role="menuitem"
                            onClick={(e) => { e.preventDefault(); handleSelectOption(opt.action) }}
                        >
                            <span class="w-1/5 flex justify-center shrink-0">
                                <opt.icon />
                            </span>

                            <span class="w-4/5 text-left truncate">
                                {opt.label}
                            </span>
                        </Button>
                    ))}
                </div>
            </div>
        )
    }
    const BASE_BTN = "size-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"

    return (
        <div class="relative inline-block text-left" ref={dropdownRef}>
            <div class="flex">
                <Button
                    type='outlined'
                    cls={() => [BASE_BTN]}
                    onClick={toggleDropdown}
                    title="Insert content"
                    disabled={disabled}
                    onMouseDown={(e: any) => { e.preventDefault(); e.stopPropagation() }}
                >
                    <span class="text-center truncate">
                        <Plus class="size-5" />
                    </span>
                </Button>
                <Button
                    type='outlined'
                    class="size-full inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 cursor-pointer px-2"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleDropdown(); }}
                    onMouseDown={(e: any) => { e.preventDefault(); e.stopPropagation(); }}
                    title="Choose what to insert"
                    disabled={disabled}
                >
                    <KeyboardDownArrow class="h-5 w-5" />
                </Button>
            </div>

            {() => $$(isOpen) && (
                <DropDownMenu />
            )}
        </div>
    )
})

export { InsertDropDown }

customElement('wui-insert-dropdown', InsertDropDown)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-insert-dropdown': ElementAttributes<typeof InsertDropDown>
        }
    }
}

export default InsertDropDown
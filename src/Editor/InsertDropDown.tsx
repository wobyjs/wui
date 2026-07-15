import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlString, JSX, Observable, ObservableMaybe } from 'woby'
import { Button } from '../Button'
import { EditorContext, useUndoRedo } from './undoredo'
import { useOnClickOutside } from '@woby/use'
import { range, getCurrentRange } from './utils' // Import getCurrentRange
import KeyboardDownArrow from '../icons/keyboard_down_arrow'
import Plus from '../icons/plus'
import { getEditorPlugins, pluginsToInsertItems, InsertMenuItem } from './EditorPlugin'

// Icons - placeholders, replace with actual SVGs or components
const HorizontalRuleIcon = () => <span>HR</span>
const ImageIcon = () => <span>Img</span>
const TableIcon = () => <span>Tbl</span>
const GifIcon = () => <span>GIF</span>
// ... other icons

/**
 * Sanitize a string for safe insertion as an HTML attribute value.
 * Strips characters that could break out of the attribute context.
 * This prevents XSS when user input is interpolated into HTML strings
 * passed to document.execCommand('insertHTML').
 */
const sanitizeAttr = (str: string): string => {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}

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

const execInsertImage = () => {
    const { selection, shadowRoot } = getEditorSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)

    const imageUrl = prompt('Enter image URL:')
    if (!imageUrl) return

    // Restore selection after prompt
    selection.removeAllRanges()
    selection.addRange(range)

    // Sanitize URL to prevent XSS via attribute injection
    const safeUrl = sanitizeAttr(imageUrl)
    const imgHtml = `<img src="${safeUrl}" class="max-w-full h-auto my-2" />`
    document.execCommand('insertHTML', false, sanitizeHTML(imgHtml))
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
// #endregion

const getInsertOptions = (): InsertMenuItem[] => {
    const builtIn = [
        { label: 'Horizontal Rule', action: execInsertHorizontalRule, icon: HorizontalRuleIcon },
        { label: 'Image', action: execInsertImage, icon: ImageIcon },
        { label: 'Table', action: execInsertTable, icon: TableIcon },
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
    cls: $(""),
    class: $(""),
    disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean>
})

const InsertDropDown = defaults(def, (props) => {

    const { cls, class: className, disabled, ...otherProps } = props

    const editor = $(EditorContext)
    // const { undos, saveDo } = useUndoRedo() // Removed as saveDo is handled by MutationObserver
    const isOpen = $(false)
    const dropdownRef = $<HTMLElement>(null)

    useOnClickOutside(dropdownRef as any, () => isOpen(false))

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
                onMouseDown={(e) => {
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
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                >
                    <span class="text-center truncate">
                        <Plus class="size-5" />
                    </span>
                </Button>
                <Button
                    type='outlined'
                    class="size-full inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 cursor-pointer px-2"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleDropdown(); }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    title="Toggle dropdown"
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
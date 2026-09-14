import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, JSX, Observable, ObservableMaybe } from 'woby'
import { Button } from '../Button'
import { EditorContext, useUndoRedo } from './undoredo'
import { useDropdownDismiss } from './useDropdownDismiss'
import { range, getCurrentRange } from './utils' // Import getCurrentRange
import KeyboardDownArrow from '../icons/keyboard_down_arrow'
import Plus from '../icons/plus'
import { getEditorPlugins, pluginsToInsertItems, pluginGroups, InsertMenuItem, BUILT_IN_ORDER } from './EditorPlugin'
import { INSERT_IMAGE_EVENT, type InsertImageDetail } from './ImageDialog'
import { TableGridPicker } from './TableGridPicker'
import { insertionRange } from './BlockInsert'
import { t, tx } from '../i18n'
import { TOOLBAR_CONTROL, TOOLBAR_CONTROL_WRAP } from './toolbarControl'

// Emoji, to match every registered plugin's icon. The built-in rows used to be the three
// letters of their own label ("Img", "Tbl"), which made the top of a sorted menu read as
// a column of grey text with the coloured glyphs starting underneath it. None of these
// repeats a plugin's: the picture frame is already the cover page's, so an image is a
// camera.
const ImageIcon = () => <span>📷</span>
const TableIcon = () => <span>📊</span>
const ContainerIcon = () => <span>📦</span>
const RowIcon = () => <span>↔️</span>

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

/**
 * The contenteditable surface an insert has to land inside, found from the menu outwards.
 *
 * Every lookup on this file used to be `document.querySelector('wui-editor')?.shadowRoot
 * ?.querySelector('[data-editor-root]')`, which assumes the editor is mounted as a custom
 * element. `<Editor>` is an ordinary component too, and an app that renders it directly has
 * no `wui-editor` host and no shadow root -- so that chain returned null and every entry in
 * this menu did nothing: the built-ins returned early on the null surface, and the plugin
 * rows, which are handed the surface rather than testing it, threw instead.
 *
 * The same climb ImageResizer and DocScroller do, and for the same reason: the toolbar is a
 * sibling of the surface under Editor's own container, so walking up from the menu's node
 * finds it in either shape -- and finds the *right* one on a page holding more than one
 * editor, which the global query could not. The shadow hop keeps the walk going when the
 * menu itself sits behind a boundary; the old chain stays last, for the window between
 * mount and the ref landing.
 */
const editorSurface = (from?: HTMLElement | null): HTMLElement | null => {
    let n: HTMLElement | null = from ?? null
    while (n) {
        const s = n.querySelector?.('[data-editor-root]') as HTMLElement | null
        if (s) return s
        n = n.parentElement ?? ((n.getRootNode() as ShadowRoot)?.host as HTMLElement | null) ?? null
    }
    return document.querySelector('wui-editor')?.shadowRoot
        ?.querySelector('[data-editor-root]') as HTMLElement | null
}

/**
 * The element the editor's own events are addressed to: its custom-element host when it has
 * one, and the surface itself when it does not. {@link ImageDialog} resolves the same way
 * from its side, which is what keeps the insert-image request and its listener on one node.
 */
const editorHostOf = (surface: HTMLElement | null): HTMLElement | null => {
    if (!surface) return document.querySelector('wui-editor')
    const root = surface.getRootNode()
    return root instanceof ShadowRoot ? root.host as HTMLElement : surface
}

/**
 * The selection object that owns the caret in `surface`.
 *
 * A shadow root keeps its own; a light-DOM editor uses the window's. Reading the wrong one
 * reports no selection at all, which is how an insert silently lands nowhere.
 */
function getEditorSelection(surface?: HTMLElement | null): { selection: Selection | null, shadowRoot: ShadowRoot | null } {
    const root = surface?.getRootNode?.() ?? document.querySelector('wui-editor')?.shadowRoot ?? null
    const shadowRoot = root instanceof ShadowRoot ? root : null
    const selection = shadowRoot
        ? (shadowRoot as unknown as { getSelection?: () => Selection | null }).getSelection?.() ?? window.getSelection()
        : window.getSelection()
    return { selection, shadowRoot }
}

/**
 * Put the caret where the insertion is about to happen and make sure the surface holds it.
 *
 * These inserts go through `execCommand`, which does nothing at all unless the editable
 * element is focused and carries the selection -- so a menu opened while focus was elsewhere
 * used to make every one of them a no-op with no error to show for it. {@link insertionRange}
 * supplies the end of the document when there is no caret to use.
 */
const seatCaret = (surface: HTMLElement): Range => {
    const range = insertionRange(surface)
    surface.focus({ preventScroll: true })
    const { selection } = getEditorSelection(surface)
    selection?.removeAllRanges()
    selection?.addRange(range)
    return range
}

// #region Insert Actions
/**
 * Hand the caret to `ImageDialog` and let it do the rest.
 *
 * The caret has to be captured *here*, before anything steals focus: opening the dialog
 * blurs the contenteditable surface, and a blurred shadow root reports no selection at
 * all. The dialog restores this range when the user commits.
 */
const execInsertImage = (from?: HTMLElement | null) => {
    const surface = editorSurface(from)
    if (!surface) return
    const range = insertionRange(surface)

    // Bubbling because ImageDialog listens on the document: it cannot resolve its own
    // editor host at mount time, only when the request arrives.
    editorHostOf(surface)?.dispatchEvent(
        new CustomEvent<InsertImageDetail>(INSERT_IMAGE_EVENT, { detail: { range }, bubbles: true }))
}

/**
 * Insert an empty `rows`×`cols` table at the caret.
 *
 * The size used to come from two stacked `prompt()` boxes; it now comes from
 * {@link TableGridPicker}, so this function only builds and inserts. That is why there is
 * no longer a saved range to put back: a native prompt is modal to the page and took the
 * selection with it, while the grid never touches focus at all, so `insertHTML` runs
 * against the caret that was already there.
 */
const insertTable = (rows: number, cols: number, from?: HTMLElement | null) => {
    const surface = editorSurface(from)
    if (!surface) return
    if (!(rows > 0) || !(cols > 0)) return
    seatCaret(surface)

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
const insertContainer = (style: string, from?: HTMLElement | null) => {
    const surface = editorSurface(from)
    if (!surface) return
    const { selection } = getEditorSelection(surface)

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

const execInsertContainer = (from?: HTMLElement | null) => insertContainer(CONTAINER_STYLE, from)
const execInsertRow = (from?: HTMLElement | null) => insertContainer(ROW_STYLE, from)
// #endregion

/**
 * @param openTableGrid What the "Table" row does. It is passed in rather than being a
 *   module-level action because, alone among these items, Table does not insert anything
 *   when clicked — it swaps the menu over to the size grid, which is per-menu state.
 * @param self The menu's own node, which every action resolves its surface from. A thunk
 *   and not the node: the menu is built as it opens and its actions run on a click after
 *   that, so the ref is read at the moment it is needed rather than captured early.
 * @param group Which menu this is. Omitted is wui's own -- the four built-in rows plus
 *   every ungrouped plugin. A string is a plugin family's own dropdown, which gets its
 *   members and *nothing* else: Image and Table are wui's blocks, not the family's, and
 *   repeating them under every group button would be four more rows per family to scroll
 *   past rather than fewer.
 */
const getInsertOptions = (openTableGrid: () => void, self: () => HTMLElement | null, group?: string): InsertMenuItem[] => {
    // No 'Horizontal Rule' here: the `rule` plugin is the same insert with a property
    // panel behind it, so the built-in row was two menu entries for one idea. See the
    // note above <wui-rule> in PageBlockPlugins.ts.
    //
    // BUILT_IN_ORDER, not 0: the menu is one sorted list, so the built-ins need a rank of
    // their own to keep the head of it. Leaving them at the plugin default would tie them
    // with every unordered plugin and hand the tie-break back to import order, which is the
    // thing `order` exists to take away.
    const builtIn: InsertMenuItem[] = [
        { label: 'Image', key: 'editor.insert.image', action: () => execInsertImage(self()), icon: ImageIcon, order: BUILT_IN_ORDER },
        { label: 'Table', key: 'editor.insert.table', action: openTableGrid, icon: TableIcon, order: BUILT_IN_ORDER },
        { label: 'Container', key: 'editor.insert.container', action: () => execInsertContainer(self()), icon: ContainerIcon, order: BUILT_IN_ORDER },
        { label: 'Row (flex)', key: 'editor.insert.row', action: () => execInsertRow(self()), icon: RowIcon, order: BUILT_IN_ORDER },
    ]

    // A group's dropdown is its members and nothing more, so the built-ins drop out and
    // there is nothing left to merge them with.
    if (group) {
        const surface = editorSurface(self())
        return surface ? pluginsToInsertItems(surface, group) as InsertMenuItem[] : []
    }

    // Merge registered plugin items
    const plugins = $$(getEditorPlugins())
    if (plugins.length === 0) return builtIn

    // No surface, no plugin rows: `pluginsToInsertItems` focuses and inserts into the
    // element it is handed, so a null one throws out of the click rather than declining it.
    const surface = editorSurface(self())
    if (!surface) return builtIn

    const pluginItems = pluginsToInsertItems(surface, undefined) as InsertMenuItem[]

    // One sort over the whole menu rather than `[...builtIn, ...pluginItems]`, so that a
    // plugin's `order` can place it anywhere in the list and not merely among its peers --
    // the page-structure blocks (banner, cover page, watermark, page break, rule) sit in the
    // gap between the built-ins and the default 0, which is what puts them under Row (flex)
    // and above counter. The sort is stable, so everything at the default keeps the order it
    // registered in.
    return [...builtIn, ...pluginItems].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

const def = () => ({
    // HtmlClass, not a bare $(""): without the codec the attribute never flattens
    // array/dict class values, so `cls`/`class` round-trip differently here than on
    // every other wui component.
    cls: $("", HtmlClass) as JSX.Class,
    class: $("", HtmlClass) as JSX.Class,
    disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
    /**
     * Render this plugin group's menu instead of wui's own "Insert content".
     *
     * Empty -- the default -- is wui's menu. A group name is a family's dropdown: its
     * members only, captioned and iconed from `pluginGroups()`, with no Table row and so
     * no size grid. The editor renders one of these per group reported by `pluginGroups()`;
     * a host embedding `<wui-insert-dropdown group="...">` by hand gets the same thing.
     */
    group: $("", HtmlString) as ObservableMaybe<string>
})

const InsertDropDown = defaults(def, (props) => {

    const { cls, class: className, disabled, group, ...otherProps } = props

    const editor = $(EditorContext)
    // const { undos, saveDo } = useUndoRedo() // Removed as saveDo is handled by MutationObserver
    const isOpen = $(false)
    // The menu has two faces: the list of things to insert, and the table size grid. The
    // grid replaces the list in place instead of flying out beside it, because this menu is
    // `max-h-80 overflow-y-auto` and would clip anything positioned outside its own box.
    const showGrid = $(false)
    const dropdownRef = $<HTMLElement>(null as any)

    /** Back to the list, closed, so the next open never starts on the grid. */
    const closeDropdown = () => { isOpen(false); showGrid(false) }

    useDropdownDismiss(dropdownRef as any, closeDropdown)

    const toggleDropdown = () => { if ($$(isOpen)) closeDropdown(); else isOpen(true) }

    const handleSelectOption = (action: () => void) => {
        if ($$(editor)) {
            // saveDo(undos) // Removed: MutationObserver in Editor.tsx should now handle this
            action()
            // $$(editor)?.focus() // Re-focus editor
        }
        // Every other item has inserted by now and the menu is done. Table has not: it just
        // asked for the grid, so leave the menu up for it.
        if (!$$(showGrid)) isOpen(false)
    }

    const DropDownMenu = () => {
        return (
            <div
                // The list is a fixed-width scrolling column; the grid is neither. A grid grown
                // to its full 16×16 is both wider and taller than those limits, and the limits
                // would clip it rather than scroll it usefully, so they come off while it is up.
                class={() => $$(showGrid)
                    ? "origin-top-left absolute left-0 mt-2 w-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    : "origin-top-left absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 max-h-80 overflow-y-auto"}
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="insert-menu-button"
                onMouseDown={(e: any) => {
                    e.stopPropagation() // Prevents the menu from closing immediately
                    e.preventDefault()  // Prevents the editor from losing focus
                }}
            >
                {() => $$(showGrid)
                    ? <TableGridPicker
                        onPick={(rows, cols) => { insertTable(rows, cols, $$(dropdownRef)); closeDropdown() }}
                        onCancel={() => showGrid(false)}
                    />
                    : <OptionList />}
            </div>
        )
    }

    const OptionList = () => {
        return (
            <div class="py-1" role="none">
                {getInsertOptions(() => showGrid(true), () => $$(dropdownRef) ?? null, $$(group)).map(opt => (
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
                            {/* Built-ins have a catalogue id; a plugin row is keyed by its own English. */}
                            {() => opt.key ? t(opt.key) : tx(opt.label)}
                        </span>
                    </Button>
                ))}
            </div>
        )
    }
    /**
     * The group descriptor behind `group`, or undefined for wui's own menu.
     *
     * A thunk rather than a value: `pluginGroups()` reads the registry observable, and a
     * plugin registered after this menu was built still has to be able to caption it.
     */
    const groupInfo = () => { const g = $$(group); return g ? pluginGroups().find(x => x.name === g) : undefined }

    const BASE_BTN = "size-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"

    return (
        <div
            // `data-plugin-group` is how the help tour anchors a step at a specific
            // family: the registry's `{at:'pluginGroup',group:...}` target resolves
            // against this attribute. Only stamped when a group is actually
            // supplied, so wui's own menu does not match the attribute query.
            class={[TOOLBAR_CONTROL_WRAP, "relative inline-block text-left"]}
            ref={dropdownRef}
            {...($$(group) ? { 'data-plugin-group': $$(group) } : {})}
        >
            <div class="flex">
                <Button
                    type='outlined'
                    cls={() => [BASE_BTN, TOOLBAR_CONTROL]}
                    onClick={toggleDropdown}
                    title={() => { const g = groupInfo(); return g ? tx(g.label) : t('editor.insertContent') }}
                    disabled={disabled}
                    onMouseDown={(e: any) => { e.preventDefault(); e.stopPropagation() }}
                >
                    <span class="text-center truncate">
                        {/* A family's own glyph when it offered one; the plus that means
                            "insert" when it did not, which is still truer than nothing. */}
                        {() => { const icon = groupInfo()?.icon; return icon ? icon() : <Plus class="size-5" /> }}
                    </span>
                </Button>
                <Button
                    type='outlined'
                    class={[TOOLBAR_CONTROL, "size-full inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 cursor-pointer px-2"]}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleDropdown(); }}
                    onMouseDown={(e: any) => { e.preventDefault(); e.stopPropagation(); }}
                    title={() => t('editor.chooseWhatToInsert')}
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
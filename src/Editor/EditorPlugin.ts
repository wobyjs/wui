import { $, $$, JSX, Observable, ObservableMaybe } from 'woby'
import { insertionRange } from './BlockInsert'

/**
 * Typed property schema for editor plugin custom elements.
 */
export type PluginPropType = 'string' | 'number' | 'boolean' | 'color' | 'enum' | 'date'

export interface PluginProp {
    /** Attribute name on the element, e.g. 'label', 'count', 'variant'. */
    name: string
    type: PluginPropType
    /** Row label; defaults to `name`. */
    label?: string
    /** Value used when the attribute is absent. Also the "unset" comparison value. */
    default?: string | number | boolean
    /**
     * Element-aware default, for a value the component computes rather than declares.
     *
     * Wins over {@link default} in both directions: the panel shows it when the
     * attribute is absent or empty, and an edit back to it clears the attribute again.
     * `cls` needs this -- the class it replaces is the element's own variant, so no
     * single literal can stand in for it, and an empty box tells the user nothing
     * about what an override would replace.
     */
    resolveDefault?: (el: HTMLElement) => string | number | boolean
    /** Required for type 'enum'. */
    options?: { value: string; label?: string }[]
    /** Rendered, but not editable (e.g. values resolved at construction time). */
    readonly?: boolean
    /** Never surfaced in the panel at all. */
    hidden?: boolean
    /** Tooltip / helper text for the row. */
    hint?: string
    /**
     * A button rendered *inside this row*, to the right of its editor.
     *
     * Same shape as an {@link EditorPlugin.actions} entry, placed differently: the
     * plugin-level strip is for operations on the element as a whole, this is for one
     * that belongs to a single value. "Reroll the seed" is the second kind -- the
     * button and the box it refills are the same control, and a strip at the bottom of
     * the panel makes the user work out which row it touched.
     *
     * The row updates itself afterwards with no help from the action. Writing the
     * attribute is seen by the panel's mirror observer, which pushes the new value
     * into this row's observable; that in turn runs the per-property effect, so the
     * edit lands on the undo stack exactly like a typed one. The only requirement is
     * that whatever `run` writes is a *declared* prop -- the observer's
     * attributeFilter is built from the schema, so an undeclared attribute changes
     * nothing on screen.
     */
    action?: PluginAction
    /**
     * This prop is the element's light-DOM text, not an attribute.
     *
     * Needed for the `children` prop of every wui-* component: woby's
     * customElement() always passes a <slot> as `children`, so a
     * children="Label" *attribute* is silently ignored and the component
     * renders blank. The label has to live in the light DOM to reach the slot.
     */
    textContent?: boolean
    /**
     * Bind the row to the component's *own* observable rather than to a snapshot
     * of the attribute.
     *
     * Needed for any prop the element's UI mutates on its own. Ticking a
     * `wui-checkbox`, dragging a `wui-switch` or typing into a `wui-number-field`
     * updates the observable the component renders from and never touches the
     * host attribute -- measured: after typing 77 into a number field the inner
     * input read 77, `el.props.value()` read 77, and `value=` on the host still
     * read 10. An attribute snapshot therefore goes stale the moment the user
     * touches the widget, and no MutationObserver can see it happen because no
     * mutation occurs.
     *
     * woby's customElement() parks the live observables on `el.props`, keyed by
     * the camelCase prop name, so handing that same observable to the row makes
     * the two genuinely share state. The per-property effect still writes the
     * attribute afterwards, which is what keeps the change in `innerHTML` and so
     * on the undo stack.
     *
     * Not for `cls`/`class` (the row shows a resolved base the observable does not
     * hold) or for `textContent` props (woby's `children` observable holds a
     * <slot>, not the text).
     */
    live?: boolean
}

/**
 * A button the property panel offers for a plugin's element.
 *
 * `props` describes *values* -- every entry there resolves to a row that reads and
 * writes an attribute. An action is the other thing a panel needs to offer: an
 * operation on the element that has no value of its own. "Re-randomise this block",
 * "recompute the layout", "reset to defaults" are all one function call and nothing
 * the user can meaningfully type.
 *
 * Actions are rendered as a strip below the property rows rather than as rows
 * themselves, because they belong to the element rather than to any one field.
 */
export interface PluginAction {
    /** Button caption. Keep it short -- the strip wraps rather than scrolls. */
    label: string
    /** Tooltip. Worth setting when {@link label} is an icon or a single glyph. */
    title?: string
    /** Optional leading icon, same shape as {@link EditorPlugin.icon}. */
    icon?: () => JSX.Child
    /**
     * Invoked with **the element the panel is bound to** -- the panel's current
     * target, which is not necessarily the editor's selection and is never the
     * editor root.
     *
     * Whatever this does to the DOM it does directly. That has two consequences
     * worth knowing before writing one:
     *
     * - `onPropChange` does **not** fire. The panel's own write path is what calls
     *   it, and an action bypasses that path entirely. A plugin that re-renders
     *   from `onPropChange` will look broken; re-render from the attribute change
     *   instead, or do it here.
     * - The panel pushes an undo step once `run` returns, so an attribute written
     *   here is undoable like any row edit. Nothing is snapshotted beforehand, so
     *   an action that mutates state outside the editor DOM is on its own.
     */
    run: (el: HTMLElement) => void
}

/**
 * Where a resize writes its result.
 *
 * `'style'` sets `el.style[widthProp]` in px -- right for anything the browser lays out
 * from CSS, `<img>` included. `'attr'` sets the HTML attribute instead, which is what a
 * custom element that sizes itself off `width=` / `height=` actually reads; a `style.width`
 * on such a host is inert. A function is the escape hatch for an element that has to be
 * told some other way.
 */
export type ResizeWrite = 'style' | 'attr' | ((el: HTMLElement, width: number, height: number) => void)

/**
 * Opt a plugin's element into the editor's resize handles.
 *
 * `resizable: true` takes every default below, which is the `<img>` behaviour. Everything
 * here exists because a custom element is not an image: it may not accept CSS sizing, it
 * may have a fixed aspect, and it may not survive being resized on every pointermove.
 */
export interface ResizableSpec {
    /** How the new size is committed. Default `'style'`. */
    write?: ResizeWrite
    /** Style property / attribute name carrying the width. Default `'width'`. */
    widthProp?: string
    /** Style property / attribute name carrying the height. Default `'height'`. */
    heightProp?: string
    /**
     * `'free'` (default) lets width and height move independently, `'lock'` keeps the ratio
     * the element had when the drag started, and a number pins width/height to that ratio.
     */
    aspect?: 'lock' | 'free' | number
    /** Floor, `[width, height]` in px. Default `[20, 20]`. */
    min?: [number, number]
    /**
     * Whether to write the size on every pointermove. Default `true`.
     *
     * Set `false` for an element whose size change tears it down and rebuilds it: a plugin
     * that re-inserts its node on a prop change would destroy the element mid-drag, taking
     * the drag with it. The overlay still follows the pointer; only the commit waits for
     * pointerup.
     */
    live?: boolean
}

/**
 * EditorPlugin: Interface for 3rd-party plugins that register custom elements
 * and toolbar insert items with the wui editor.
 */
export interface EditorPlugin {
    /** Unique plugin identifier (e.g. 'my-video', 'youtube-embed') */
    name: string
    /** Display label shown in the insert menu */
    label: string
    /** Optional icon component rendered in the insert menu */
    icon?: () => JSX.Child
    /** The custom element tag name (e.g. 'my-video', 'youtube-embed') */
    tagName: string

    /**
     * Called when the user selects this plugin from the insert menu.
     * The implementation should create the custom element, prompt for
     * any needed data, and insert it at the current cursor position.
     *
     * @param editorRoot - The editor's contenteditable element (shadow DOM)
     * @param range - The current selection range at the cursor position
     */
    onInsert: (editorRoot: HTMLElement, range: Range) => void

    /**
     * Optional: Called after a custom element is inserted into the editor.
     * Use this to attach event listeners, set up shadow DOM, or initialize
     * the element's internal state.
     *
     * @param element - The newly inserted custom element
     */
    onRender?: (element: HTMLElement) => void

    /**
     * Optional: Serialize the custom element to an HTML string for output.
     * If not provided, the element's outerHTML is used.
     *
     * @param element - The custom element instance in the editor
     * @returns HTML string representation
     */
    toHTML?: (element: HTMLElement) => string

    /**
     * Deserialize HTML back into the custom element when loading editor content.
     *
     * The inverse of {@link toHTML}, and called by {@link deserializeEditorContent}.
     * Omit it and the browser's own parser is the whole story, which is right for
     * every plugin shipped so far -- they all round-trip through plain `outerHTML`.
     * Provide it when the serialized form is not the live form: markup that has to be
     * rehydrated, an attribute that encodes state the element rebuilds on load, a
     * legacy shape that has to be migrated forward.
     *
     * The element you are handed back has already been parsed and upgraded, so the
     * hook is a *replacement* step, not a parse step: return the element you want in
     * the document and it is swapped in. Return the same node to leave it alone.
     *
     * Matching is by {@link tagName}, so a serialized form that does not keep the
     * custom element's own tag cannot be found again -- keep the tag and move the
     * detail into attributes or children.
     *
     * @param html - The outerHTML of one matched element
     * @returns The element to put in its place
     */
    fromHTML?: (html: string) => HTMLElement

    /**
     * Declarative, typed props for the property panel.
     * When present, the property panel renders typed editors instead of
     * blind string fields.
     */
    props?: PluginProp[]

    /**
     * Buttons rendered as a strip in the property panel for this element.
     *
     * Complementary to {@link props}, not a replacement: use a prop for anything the
     * user supplies a value for, and an action for anything they merely trigger.
     */
    actions?: PluginAction[]

    /**
     * Called after the panel has written an attribute.
     * Lets a plugin re-render, re-insert, or otherwise react to an edit that its
     * element cannot pick up from an attribute change on its own.
     */
    onPropChange?: (element: HTMLElement, key: string, value: any) => void

    /**
     * Give this plugin's element the editor's 8 resize handles -- the same ones an `<img>`
     * gets. `true` accepts every default in {@link ResizableSpec}.
     *
     * Selection is not gated on this: the click-to-select outline already covers every
     * custom element in the editor. This adds the handles, and with them a size the user
     * can drag.
     */
    resizable?: boolean | ResizableSpec

    /**
     * The box the handles measure and draw around, when that is not the element itself.
     *
     * A custom-element host has no intrinsic size -- it defaults to `display: inline`, and
     * once a class makes it `block` it fills the column no matter how small the thing it
     * paints. The clean fix is inside the component (`:host { width: fit-content }`); this
     * is the escape hatch for a component you cannot change.
     */
    anchor?: (el: HTMLElement) => HTMLElement

    /**
     * Where a page ends, when this plugin's element is a page break of some kind.
     *
     * This is what lets the editor's `page` layout paginate a document without knowing a
     * single one of the host app's tag names: pagination is *authored* in the document as
     * ordinary blocks, and this field is how a block says so.
     *
     *   'before'    the page ends immediately before this element
     *   'after'     the page ends immediately after it
     *   'own-page'  the element is a page: nothing shares a sheet with it
     *   'none'      not a break (the default, and the same as omitting the field)
     *
     * Use the function form when the answer lives in the element's own attributes -- a
     * break block with a "break before / break after" switch is the usual case.
     *
     * A block with no plugin, or a plugin that omits this, can still break a page with
     * plain CSS: `break-before: page` is honoured as a fallback. See PageLayout.ts.
     */
    pageBreak?: PageBreakKind | ((el: HTMLElement) => PageBreakKind)

    /**
     * This element's light DOM is the document's, not the plugin's.
     *
     * Most plugins keep everything in attributes, and that is what makes the plain
     * click-to-select rule safe: click the host, the panel opens, Backspace removes the
     * whole widget. A *container* -- a cover page whose photo is a backdrop for ordinary
     * prose, a callout box -- inverts that. Its children are the author's text, and
     * selecting the host every time the caret is placed in that text would put the whole
     * page one Backspace away from deletion.
     *
     * Set this and the editor splits clicks by where they actually land:
     *
     *   shadow DOM / the host itself   selects the block (the panel, the handles, delete)
     *   a light-DOM descendant        falls through to the caret, like any other text
     *
     * Which is why a container needs a piece of shadow chrome the author can aim at --
     * `wui-cover-page` covers the whole sheet with the photo behind the text, so any click
     * that misses the words selects the block.
     *
     * Off by default: `<wui-icon-button><svg/></wui-icon-button>` has light-DOM children
     * too, and it is not a container -- it must stay selectable by clicking its icon.
     */
    editableContent?: boolean

    /**
     * Where this plugin sits in the insert menu. Lower sorts earlier; the default is `0`.
     *
     * Without it the menu is in *registration* order, which is really module import order --
     * a plugin's position would then depend on the order of the `import` lines in whichever
     * app bundled it, which is neither stable nor something the plugin author controls.
     *
     * The menu is one sorted list, built-ins included, so the scale runs:
     *
     *   BUILT_IN_ORDER (-100)   Image, Table, Container, Row (flex)
     *   -99 .. -1               above the ordinary plugins, below the built-ins
     *   0 (the default)         the ordinary plugins, in registration order
     *   > 0                     below everything that did not ask
     *
     * The page-structure family (banner, cover page, watermark, page break, rule) sits in
     * the middle band, because those are the blocks an author reaches for while laying a
     * document out rather than while writing in it. Going *above* the built-ins is possible
     * -- anything below -100 -- but it is not what that family wanted.
     *
     * Ties keep registration order, so plugins that do not set this are unaffected.
     */
    order?: number

    /**
     * Put this plugin in an insert menu of its **own**, named by this string.
     *
     * Absent -- the default -- means wui's "Insert content" menu: Image, Table,
     * Container, Row (flex) and every plugin that did not ask otherwise, in one sorted
     * list. That list is the right home for a handful of blocks and the wrong one for a
     * *family*. Eight luopan plates appended under twenty built-ins make a menu the
     * author has to scroll past everyone else's tools to reach, and they bury the thing
     * that is actually true about them -- that they are one idea with eight presets.
     *
     * Set it and those rows leave the built-in menu entirely for a dropdown of their
     * own, one per distinct value, placed in the toolbar in the order the groups first
     * registered. Nothing else changes: `props`, `resizable`, `anchor`, `pageBreak` and
     * the property panel are all resolved by {@link tagName} and never look at this.
     *
     * {@link order} still sorts within the group. `BUILT_IN_ORDER` means nothing there --
     * a group has no built-ins to sit above.
     *
     * The value doubles as the group's caption, run through `tx()` like any other
     * plugin-authored English, so a locale pack can translate it. Use
     * {@link groupLabel} when the caption should differ from the identity.
     */
    group?: string

    /** Caption for the group's dropdown, when {@link group} itself is not the right word. */
    groupLabel?: string

    /**
     * Icon for the group's dropdown button.
     *
     * Declared per plugin because a group has no descriptor of its own -- it exists only
     * because some plugin named it. The first member to offer one wins, so a family
     * registered in a loop can hand the same thunk to all of them.
     */
    groupIcon?: () => JSX.Child
}

/**
 * One insert dropdown other than wui's own, as {@link pluginGroups} reports it.
 */
export interface PluginGroup {
    /** The {@link EditorPlugin.group} value that named it. */
    name: string
    /** Caption, resolved from `groupLabel ?? name` -- but not yet run through `tx()`. */
    label: string
    icon?: () => JSX.Child
}

/**
 * The rank `InsertDropDown` gives its own rows (Image, Table, Container, Row (flex)).
 *
 * Exported because it is the only fixed point on the `order` scale: a plugin that means
 * "just under the built-ins" has to know where they are, and a plugin that means "above
 * them" has to be able to say so without guessing how negative is negative enough.
 */
export const BUILT_IN_ORDER = -100

// Internal type for insert menu items (matches what InsertDropDown renders)
export type InsertMenuItem = {
    label: string
    /**
     * Catalogue id for the caption, when there is one. Built-in rows carry it; plugin rows
     * do not, and fall back to `tx(label)` — their English *is* the key, so a locale pack
     * can translate a plugin that has never heard of i18n.
     */
    key?: string
    action: () => void
    icon: () => JSX.Child
    /** See `EditorPlugin.order`. Absent means `0`. */
    order?: number
}

/** Global plugin registry observable */
const registeredPlugins = $<EditorPlugin[]>([])

/**
 * Register a plugin with the editor. Plugins appear in the insert menu
 * under the "Advanced Inserts" section.
 *
 * Re-registering an existing name is a no-op: it warns and keeps the first
 * registration rather than throwing, so a module imported twice for its
 * side-effects cannot take the page down.
 *
 * @param plugin - The plugin descriptor
 */
export const registerEditorPlugin = (plugin: EditorPlugin): void => {
    const current = $$(registeredPlugins)
    if (current.find(p => p.name === plugin.name)) {
        console.warn(`[EditorPlugin] Plugin "${plugin.name}" is already registered. Skipping.`)
        return
    }
    registeredPlugins([...current, plugin])
}

/**
 * Unregister a previously registered plugin by name.
 *
 * @param name - The plugin name to remove
 */
export const unregisterEditorPlugin = (name: string): void => {
    const current = $$(registeredPlugins)
    registeredPlugins(current.filter(p => p.name !== name))
}

/**
 * Get the observable array of registered plugins.
 * Components can use $$(getEditorPlugins()) to reactively read the list.
 */
export const getEditorPlugins = (): Observable<EditorPlugin[]> => registeredPlugins

/**
 * Look up a plugin by its element's tag name.
 * Returns undefined if no plugin matches.
 */
export const getPluginForElement = (el: HTMLElement): EditorPlugin | undefined =>
    $$(registeredPlugins).find(p => p.tagName.toUpperCase() === el.tagName.toUpperCase())

/**
 * The insert dropdowns that registered plugins have asked for, beyond wui's own.
 *
 * One entry per distinct {@link EditorPlugin.group}, in the order the group was first
 * named -- not the order of {@link EditorPlugin.order}, which sorts *within* a group and
 * has nothing to say about where the group's button sits in the toolbar. A family that
 * registers in a loop therefore lands wherever its first member did, which is the only
 * position the author can predict.
 *
 * `label` is `groupLabel ?? name` and is **not** run through `tx()` here: this is a
 * registry read, and the caller renders. `icon` is the first `groupIcon` any member
 * offered, or undefined if none did.
 *
 * Reads the registry observable, so calling it inside a reactive context re-runs when a
 * plugin registers.
 */
export const pluginGroups = (): PluginGroup[] => {
    const out: PluginGroup[] = []
    for (const p of $$(registeredPlugins)) {
        if (!p.group) continue
        const existing = out.find(g => g.name === p.group)
        if (!existing) {
            out.push({ name: p.group, label: p.groupLabel ?? p.group, icon: p.groupIcon })
            continue
        }
        // First member to offer one wins -- for the icon *and* for the label, so a family
        // where only one member bothered to spell the caption out still gets it.
        if (!existing.icon && p.groupIcon) existing.icon = p.groupIcon
        if (existing.label === existing.name && p.groupLabel) existing.label = p.groupLabel
    }
    return out
}

/**
 * How an element interrupts the flow of pages. See {@link EditorPlugin.pageBreak}.
 */
export type PageBreakKind = 'none' | 'before' | 'after' | 'own-page'

/** What `resizable: true`, and every omitted field of a {@link ResizableSpec}, mean. */
const RESIZE_DEFAULTS = {
    write: 'style',
    widthProp: 'width',
    heightProp: 'height',
    aspect: 'free',
    min: [20, 20],
    live: true,
} as const

/**
 * The resize spec for `el`, or null if it is not resizable.
 *
 * `<img>` answers first and always, with the bare defaults: it is resizable with no plugin
 * behind it, and its path through the resizer has to stay exactly what it was.
 */
export const resolveResizable = (el: HTMLElement | null | undefined): ResizableSpec | null => {
    if (!el) return null
    if (el instanceof HTMLImageElement) return {}
    const spec = getPluginForElement(el)?.resizable
    if (!spec) return null
    return spec === true ? {} : spec
}

/** The box to measure for `el` -- its plugin's {@link EditorPlugin.anchor}, else `el` itself. */
export const resolveAnchor = (el: HTMLElement): HTMLElement =>
    getPluginForElement(el)?.anchor?.(el) ?? el

/** How `el` breaks a page, per its plugin's {@link EditorPlugin.pageBreak}. `'none'` if it does not. */
export const resolvePageBreak = (el: HTMLElement | null | undefined): PageBreakKind => {
    if (!el) return 'none'
    const spec = getPluginForElement(el)?.pageBreak
    if (!spec) return 'none'
    return (typeof spec === 'function' ? spec(el) : spec) || 'none'
}

/**
 * Tag names of every registered plugin that declares a {@link EditorPlugin.pageBreak}.
 *
 * Pagination uses this to find a break that is nested inside the flow-level node rather
 * than being it -- an app that wraps each block in a frame of its own puts the break one
 * level down, and this is how it is reached without wui knowing the wrapper's shape.
 */
export const pageBreakTagNames = (): string[] =>
    $$(registeredPlugins).filter(p => p.pageBreak).map(p => p.tagName)

/** Upper-case tag names of every plugin that declares {@link EditorPlugin.editableContent}. */
export const editableContentTagNames = (): string[] =>
    $$(registeredPlugins).filter(p => p.editableContent).map(p => p.tagName.toUpperCase())

/** Commit a resized `width` / `height` (px) to `el`, the way its spec asks for. */
export const applyResize = (el: HTMLElement, spec: ResizableSpec, width: number, height: number): void => {
    const write = spec.write ?? RESIZE_DEFAULTS.write
    if (typeof write === 'function') { write(el, width, height); return }
    const wp = spec.widthProp ?? RESIZE_DEFAULTS.widthProp
    const hp = spec.heightProp ?? RESIZE_DEFAULTS.heightProp
    if (write === 'attr') {
        // Attributes are integers by convention (`width="600"`); a fractional one would
        // re-enter the element as a different number on every drag.
        el.setAttribute(wp, String(Math.round(width)))
        el.setAttribute(hp, String(Math.round(height)))
        return
    }
    ;(el.style as any)[wp] = `${width}px`
    ;(el.style as any)[hp] = `${height}px`
}

/**
 * Clamp and aspect-correct a proposed size.
 *
 * `startAspect` is the ratio the element had at mousedown, which is what `'lock'` holds to.
 */
export const constrainResize = (
    spec: ResizableSpec,
    direction: string,
    width: number,
    height: number,
    startAspect: number,
): [number, number] => {
    const aspect = spec.aspect ?? RESIZE_DEFAULTS.aspect
    let w = width
    let h = height
    if (aspect !== 'free') {
        const ratio = aspect === 'lock' ? startAspect : aspect
        if (ratio > 0) {
            // An edge handle has one degree of freedom, so the axis actually being dragged
            // drives the other one. Corners drive from the width.
            if (direction === 'n' || direction === 's') w = h * ratio
            else h = w / ratio
        }
    }
    const [minW, minH] = spec.min ?? RESIZE_DEFAULTS.min
    return [Math.max(minW, w), Math.max(minH, h)]
}

/**
 * Convert registered plugins into insert menu items consumable by InsertDropDown.
 * Each plugin becomes an item with label, icon, and an action that calls onInsert.
 *
 * @param editorRoot - The editor's contenteditable element (passed from EditorSurface)
 * @param group - Which menu is asking. Omitted means wui's own, which is every plugin
 *   that did **not** set {@link EditorPlugin.group}; a string means that group's dropdown
 *   and only its members. The two cases partition the registry, so a grouped plugin
 *   leaves the built-in menu entirely rather than appearing twice.
 * @returns Array of insert menu items
 */
export const pluginsToInsertItems = (editorRoot: HTMLElement, group?: string): ObservableMaybe<InsertMenuItem[]> => {
    // `|| undefined` on both sides so that `group: ''` reads as "no group" rather than as a
    // group whose name is the empty string -- a plugin that spreads a config object with an
    // unset field would otherwise vanish from every menu.
    const want = group || undefined

    // Sorted, not registration-ordered -- see `EditorPlugin.order`. `Array.prototype.sort` is
    // required to be stable, which is what keeps every plugin that declines to set `order`
    // exactly where it was.
    return $$(registeredPlugins).filter(p => (p.group || undefined) === want).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(plugin => ({
        label: plugin.label,
        icon: plugin.icon ?? (() => null),
        order: plugin.order,
        action: () => {
            // The caret when there is one, the end of the document when there is not. Never
            // `getRangeAt(0)` unguarded: on a surface that has lost focus that throws, and a
            // throw here kills the whole action silently -- the menu closes and nothing is
            // inserted, with no error the author could act on. See `insertionRange`.
            const range = insertionRange(editorRoot)

            // The surface has to hold the caret for the insertion to be visible afterwards,
            // and it may not: the fallback branch above exists precisely for the case where
            // it was not focused. `preventScroll` because the author is looking at the menu,
            // not at wherever the browser would otherwise scroll the caret into view.
            editorRoot.focus({ preventScroll: true })

            // Restore selection (may have been lost from dropdown interaction)
            const root = editorRoot.getRootNode()
            const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
            sel?.removeAllRanges()
            sel?.addRange(range)

            // Call the plugin's insert handler
            plugin.onInsert(editorRoot, range)

            // Call onRender if the inserted element was a custom element
            // The plugin is responsible for inserting the element; we try to find the last child
            // that matches the tagName as a best-effort post-init hook
            if (plugin.onRender) {
                const inserted = editorRoot.querySelector(`:scope > ${plugin.tagName}:last-child`)
                if (inserted) plugin.onRender(inserted as HTMLElement)
            }
        }
    }))
}

/**
 * Serialize editor content to HTML, running all registered plugin toHTML hooks.
 *
 * @param editorRoot - The editor's contenteditable element
 * @returns Serialized HTML string
 */
export const serializeEditorContent = (editorRoot: HTMLElement): string => {
    const plugins = $$(registeredPlugins)
    let html = editorRoot.innerHTML

    // Run each plugin's toHTML hook on matching elements
    for (const plugin of plugins) {
        if (!plugin.toHTML) continue
        const elements = editorRoot.querySelectorAll(plugin.tagName)
        elements.forEach(el => {
            const serialized = plugin.toHTML!(el as HTMLElement)
            html = html.replace(el.outerHTML, serialized)
        })
    }

    return html
}

/**
 * Load serialized HTML into the editor, running all registered plugin fromHTML hooks.
 *
 * The counterpart to {@link serializeEditorContent}, and for a long time the missing
 * half of it: `toHTML` had a caller and `fromHTML` had none, so a plugin could write a
 * serialized form it was then unable to read back.
 *
 * Content is parsed first and revived second. Assigning `innerHTML` hands the markup to
 * the browser's parser and upgrades any custom elements in it, which is what makes the
 * elements passed to `fromHTML` live, upgraded nodes rather than inert ones -- a plugin
 * that needs to inspect its own shadow root or props can. The cost is that an element is
 * built once and possibly replaced; that is cheap next to the clarity, and no shipped
 * plugin defines the hook at all.
 *
 * Elements are collected before any replacement runs. Replacing a node while iterating a
 * live NodeList is how you silently skip half of them.
 *
 * @param editorRoot - The editor's contenteditable element
 * @param html - Serialized HTML, typically from {@link serializeEditorContent}
 */
export const deserializeEditorContent = (editorRoot: HTMLElement, html: string): void => {
    editorRoot.innerHTML = html

    const plugins = $$(registeredPlugins)
    for (const plugin of plugins) {
        if (!plugin.fromHTML) continue
        const elements = Array.from(editorRoot.querySelectorAll(plugin.tagName))
        for (const el of elements) {
            const revived = plugin.fromHTML((el as HTMLElement).outerHTML)
            if (revived && revived !== el) el.replaceWith(revived)
        }
    }
}

export default EditorPlugin
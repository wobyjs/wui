import { $, $$, isObservable, Observable } from 'woby'
import { editableContentTagNames, getEditorPlugins, getPluginForElement, type PluginProp } from './EditorPlugin'

/**
 * PropertyExtractor: Utility for detecting the current selection type
 * and extracting element properties into observable objects for PropertyForm.
 */

export type SelectionType = 'image' | 'text' | 'custom' | 'none'

export interface SelectionInfo {
    type: SelectionType
    element: HTMLElement | null
}

/**
 * Detect what is currently selected in the editor.
 * Priority: image > custom element > text > none
 *
 * Works in two modes:
 * 1. Shadow DOM mode: when the editor is rendered as a <wui-editor> custom element
 * 2. Light DOM mode: when the editor is rendered as a TSX component directly
 */
export function detectSelectionType(): SelectionInfo {
    const host = document.querySelector('wui-editor') as HTMLElement | null
    const shadow = host?.shadowRoot

    // ── Marked-element priority (both modes) ──
    // Click-to-select in EditorSurface marks an embedded custom element with
    // data-element-selected. The mark outranks any selection-based detection,
    // because a well-behaved embedded block owns a shadow root (so a click
    // inside it leaves no light-DOM range pointing at the block at all).
    const root = shadow?.querySelector('[data-editor-root]') ?? document.querySelector('[data-editor-root]')
    const marked = root?.querySelector('[data-element-selected]') as HTMLElement | null
    // classifyElement rather than a hard-coded 'custom': the mark is no longer set
    // only by click-to-select on plugin elements -- the panel's parent walk moves it
    // onto whatever the user climbed to, which is routinely a plain tr/table/div.
    if (marked) return { type: classifyElement(marked), element: marked }

    // ── Shadow DOM mode ──
    if (shadow) {
        // 1. Check for visible ImageResizer overlay (most reliable — the overlay is a DOM element
        //    that's always visible when an image is selected, unlike __activeImage expando which
        //    can be cleared by event propagation quirks).
        const overlay = shadow.querySelector('[data-image-overlay]') as HTMLElement | null
        if (overlay && overlay.style.display !== 'none' && overlay.offsetWidth > 0) {
            const editorSurface = shadow.querySelector('[data-editor-root]') as HTMLElement | null
            if (editorSurface) {
                const rect = overlay.getBoundingClientRect()
                const centerX = rect.left + rect.width / 2
                const centerY = rect.top + rect.height / 2
                // Use elementsFromPoint() instead of elementFromPoint() — the overlay DIV
                // sits on top of the IMG with z-index 5, so elementFromPoint() returns the
                // overlay DIV, not the IMG. elementsFromPoint() returns ALL elements at the
                // point, listed in paint order (topmost first). We iterate through to find
                // the first IMG element underneath the overlay.
                const allEls = shadow.elementsFromPoint(centerX, centerY)
                for (const el of allEls) {
                    if (el.tagName === 'IMG') {
                        return { type: 'image', element: el as HTMLImageElement }
                    }
                    const img = (el as HTMLElement).closest('img')
                    if (img) return { type: 'image', element: img as HTMLImageElement }
                }
            }
        }

        // 2. Check for active image (ImageResizer sets this expando — fallback if overlay check
        //    fails for any reason)
        const activeImg = (shadow as any).__activeImage as HTMLImageElement | undefined
        if (activeImg && activeImg.tagName === 'IMG' && shadow.contains(activeImg)) {
            return { type: 'image', element: activeImg }
        }

        // 3. Check selection for custom element or text
        const sel = shadow.getSelection()
        if (!sel || sel.rangeCount === 0) return { type: 'none', element: null }

        const range = sel.getRangeAt(0)
        const origin: Node = range.commonAncestorContainer
        let node: Node | null = origin

        // Get registered plugin tag names for custom element detection
        const pluginTagNames = new Set($$(getEditorPlugins()).map(p => p.tagName.toUpperCase()))
        const containerTags = new Set(editableContentTagNames())

        // Walk up from selection to find a custom element or the editor root
        while (node && node !== shadow) {
            if (node instanceof HTMLElement) {
                // A container block stops the walk instead of answering it. Plugins that
                // declare editableContent hold ordinary document content -- the cover page
                // is a background with a whole page of prose, tables and images slotted on
                // top -- and their descendants have to report as themselves, or every cell
                // and paragraph inside one comes back as the block and the panel offers
                // scrim and focus rows for a <td>. Only an ancestor is skipped: a selection
                // that *is* the block still classifies as the block.
                if (node !== origin && containerTags.has(node.tagName.toUpperCase())) break
                const tag = node.tagName.toLowerCase()
                // Custom elements have hyphens in tag name
                if (tag.includes('-') && !tag.startsWith('wui-')) {
                    return { type: 'custom', element: node }
                }
                // Also check registered plugins
                if (pluginTagNames.has(node.tagName.toUpperCase())) {
                    return { type: 'custom', element: node }
                }
            }
            node = node.parentNode
        }

        // 4. Text selection (non-collapsed or collapsed cursor in text)
        if (!range.collapsed) {
            let el = range.startContainer instanceof HTMLElement
                ? range.startContainer
                : range.startContainer.parentElement
            if (el) return { type: 'text', element: el }
        }

        // Collapsed cursor in text node
        if (range.collapsed && range.startContainer.nodeType === Node.TEXT_NODE) {
            const el = range.startContainer.parentElement
            if (el) return { type: 'text', element: el }
        }

        return { type: 'none', element: null }
    }

    // ── Light DOM mode (no <wui-editor> custom element) ──
    // The editor is rendered as a TSX component with [data-editor-root] on a contenteditable div
    const editorRoots = document.querySelectorAll('[data-editor-root]') as NodeListOf<HTMLElement>
    if (!editorRoots.length) return { type: 'none', element: null }

    // 1. Check for selected image inside the editor
    const sel = document.getSelection()
    if (!sel || sel.rangeCount === 0) {
        // No active selection — check if an image resizer is visible
        const activeImg = document.querySelector('[data-editor-root] img[data-active-image]') as HTMLImageElement | null
        if (activeImg) return { type: 'image', element: activeImg }
        return { type: 'none', element: null }
    }

    const range = sel.getRangeAt(0)

    // Find which editor root contains the selection (there may be multiple editors on the page)
    let editorRoot: HTMLElement | null = null
    for (const root of editorRoots) {
        if (root.contains(range.commonAncestorContainer)) {
            editorRoot = root
            break
        }
    }
    if (!editorRoot) return { type: 'none', element: null }

    // Get registered plugin tag names for custom element detection
    const pluginTagNames = new Set($$(getEditorPlugins()).map(p => p.tagName.toUpperCase()))
    const containerTags = new Set(editableContentTagNames())

    // Check for image selection (img node or inside img)
    let node: Node | null = range.commonAncestorContainer
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement
    while (node && node !== editorRoot) {
        if (node instanceof HTMLElement && node.tagName === 'IMG') {
            return { type: 'image', element: node }
        }
        node = node.parentNode
    }

    // Check for custom element (hyphenated tag or registered plugin tag) — backstop
    // for light-DOM mode so a caret inside a custom element still reports 'custom'.
    node = range.commonAncestorContainer
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement
    const origin = node
    while (node && node !== editorRoot) {
        if (node instanceof HTMLElement) {
            // Same container rule as the shadow branch above.
            if (node !== origin && containerTags.has(node.tagName.toUpperCase())) break
            const tag = node.tagName.toLowerCase()
            if ((tag.includes('-') && !tag.startsWith('wui-')) || pluginTagNames.has(node.tagName.toUpperCase())) {
                return { type: 'custom', element: node }
            }
        }
        node = node.parentNode
    }

    // Check for text selection (non-collapsed)
    if (!range.collapsed) {
        let el = range.startContainer instanceof HTMLElement
            ? range.startContainer
            : range.startContainer.parentElement
        if (el) return { type: 'text', element: el }
    }

    // Collapsed cursor in text node
    if (range.collapsed && range.startContainer.nodeType === Node.TEXT_NODE) {
        const el = range.startContainer.parentElement
        if (el) return { type: 'text', element: el }
    }

    // If cursor is inside the editor but not in a text node, treat as text
    if (range.collapsed && editorRoot.contains(range.startContainer)) {
        return { type: 'text', element: editorRoot }
    }

    return { type: 'none', element: null }
}

/**
 * Classify a single element the same way {@link detectSelectionType} classifies a
 * selection, without consulting the selection at all.
 *
 * Extracted so that a target chosen by other means -- the parent walk below, or the
 * `data-element-selected` mark -- lands on the same extractor the selection path
 * would have used, instead of being assumed to be a custom element.
 */
export function classifyElement(el: HTMLElement | null): SelectionType {
    if (!el) return 'none'
    if (el.tagName === 'IMG') return 'image'
    const tag = el.tagName.toLowerCase()
    if (tag.includes('-') && !tag.startsWith('wui-')) return 'custom'
    const pluginTagNames = new Set($$(getEditorPlugins()).map(p => p.tagName.toUpperCase()))
    if (pluginTagNames.has(el.tagName)) return 'custom'
    return 'text'
}

/**
 * The parent of `node` in the *composed* tree.
 *
 * `parentElement` alone stops dead at a shadow boundary: for the top-most element of
 * a shadow root it is null, because the root is a DocumentFragment, not an Element.
 * Stepping to `root.host` continues the walk into the light tree that owns the
 * component -- which is what makes "select my parent" work for an element rendered
 * inside an embedded component's shadow root.
 *
 * Slotted light-DOM children need no special case: their `parentElement` is already
 * the host, since slotting changes where a node is *rendered*, not where it lives.
 */
function composedParent(node: Node | null): HTMLElement | null {
    if (!node) return null
    const parent = node.parentNode
    if (parent instanceof ShadowRoot) return parent.host as HTMLElement
    return (parent instanceof HTMLElement) ? parent : null
}

/**
 * The element the property panel should move to when the user asks for "parent".
 *
 * The ceiling is the `[data-editor-root]` content container *inclusive* -- the walk
 * can land on it, but not go past it. The root is the editor's document body, and
 * styling it (font, colour, alignment for the whole document) is a real authoring
 * operation, so refusing to select it would cut the chain one step short of the most
 * useful target. Everything above it is the editor's own chrome -- surface wrapper,
 * toolbar, the `wui-editor` host, the property panel itself -- which is not content,
 * so the control disables once the root is reached.
 *
 * Note this is deliberately more permissive than the selectionchange handler, which
 * refuses to *auto*-target the root: that guard exists so clicking empty space does
 * not silently retarget the panel. An explicit click on the up arrow is not ambiguous.
 *
 * The walk crosses shadow boundaries via {@link composedParent}, so the useful chains
 * are continuous: a `td` climbs to `tr` to `table`, and a node inside an embedded
 * component's shadow root climbs out to the component host and on up from there.
 */
export function getSelectableParent(el: HTMLElement | null): HTMLElement | null {
    if (!el) return null
    // Already at the ceiling -- the root is selectable but has no selectable parent.
    if (el.hasAttribute?.('data-editor-root')) return null
    const parent = composedParent(el)
    if (!parent) return null
    // Stop at the document scaffolding too, for the light-DOM case where the element
    // sits outside any editor root and the walk would otherwise run up to <html>.
    if (parent.tagName === 'BODY' || parent.tagName === 'HTML') return null
    if (parent.tagName === 'WUI-EDITOR') return null
    return parent
}


/**
 * Structural table boxes. Removing one of these raw leaves the table malformed --
 * a `tr` whose cells vanish with it, a `tbody` orphaned from its `table` -- so they
 * are refused here and routed to TablePopupMenu, which knows how to delete a row or
 * a column while keeping the remaining geometry consistent.
 *
 * Reachable because the property panel's up arrow walks the target up the tree, so
 * `td -> tr -> tbody -> table` are all legitimate panel targets even though no click
 * can land on them directly.
 */
const TABLE_STRUCTURAL = new Set([
    'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TD', 'TH', 'COL', 'COLGROUP', 'CAPTION',
])

export type DeleteRefusal = 'no-target' | 'detached' | 'editor-root' | 'table' | 'component-internal'

export interface DeleteResult {
    ok: boolean
    reason?: DeleteRefusal
}

/**
 * Why {@link deleteSelectedElement} would refuse `el`, or null if it would go ahead.
 *
 * Split out so the panel's delete control can disable itself and explain why, instead
 * of offering a button that silently does nothing.
 */
export function deleteRefusalReason(el: HTMLElement | null, editorRoot?: HTMLElement | null): DeleteRefusal | null {
    if (!el) return 'no-target'
    if (!el.isConnected) return 'detached'
    // The content container is the document itself; deleting it would take the
    // editable surface with it. The up arrow can land here, so this is reachable.
    if (el.hasAttribute?.('data-editor-root')) return 'editor-root'
    if (TABLE_STRUCTURAL.has(el.tagName)) return 'table'
    if (editorRoot) {
        // A different root node means the target lives inside an embedded component's
        // own shadow tree -- the up arrow can climb out of one, so the panel can be
        // pointed at a component's internals. Those are rendered by the component and
        // would be recreated on its next update, so removing them is meaningless at
        // best and corrupts the component at worst. Edit the host instead.
        if (el.getRootNode() !== editorRoot.getRootNode()) return 'component-internal'
        if (!editorRoot.contains(el)) return 'detached'
    }
    return null
}

/**
 * Remove the element the property panel is pointing at, and leave a caret where it was.
 *
 * This exists because **the browser will not delete an embedded component.** Native
 * editing -- Backspace, Delete, `execCommand('delete')` -- operates on the DOM
 * Selection, and Chrome's editing engine treats a shadow host as a boundary it refuses
 * to cross. Measured against this editor's own content:
 *
 *     strong        execCommand('delete')  ->  removed
 *     img           execCommand('delete')  ->  removed
 *     wui-button    execCommand('delete')  ->  returned true, removed nothing
 *     my-counter    execCommand('delete')  ->  returned true, removed nothing
 *
 * The refusal is silent: `execCommand` reports success. Nor is it a matter of giving
 * the engine a better range -- the two custom elements were the only cases where the
 * Range stayed non-collapsed around the node, and they were still skipped. Setting
 * `contenteditable="false"` on the host or its parent, with or without a forced
 * reflow, changes nothing; the usual atomic-widget trick does not apply to shadow
 * hosts. Placing the caret immediately after the element and pressing Backspace is
 * also a no-op, and pressing Delete just before it inserts a stray node.
 *
 * So the only thing that works is `remove()`, and every deletion of an embedded
 * component has to be driven explicitly. This is the same conclusion ImageResizer
 * reached for images, where `deleteImage()` calls `remove()` behind a toolbar button.
 *
 * Callers own the undo snapshot: call `saveDo()` after a successful result, from a
 * scope that has the UndoRedo context.
 */
export function deleteSelectedElement(el: HTMLElement | null, editorRoot?: HTMLElement | null): DeleteResult {
    const reason = deleteRefusalReason(el, editorRoot)
    if (reason) return { ok: false, reason }

    const target = el as HTMLElement
    const parent = target.parentNode
    if (!parent) return { ok: false, reason: 'detached' }

    // Record the slot before the node goes. Afterwards it is detached and its former
    // index is unrecoverable, so the caret would have nowhere principled to land.
    const index = Array.prototype.indexOf.call(parent.childNodes, target)

    target.removeAttribute('data-element-selected')
    target.remove()

    // Put the caret where the element used to be, so typing continues from there
    // rather than stranding focus in an editable surface with no insertion point.
    try {
        // window.getSelection(), NOT shadowRoot.getSelection(). Chrome hands a shadow
        // root its own Selection object (they are not the same object), and that one
        // cannot hold a range addressing content in the editor's tree -- every attempt
        // collapses to the document's first text node. The window selection addresses
        // nodes inside the shadow tree correctly.
        const sel = window.getSelection()
        if (sel) {
            const range = document.createRange()
            range.setStart(parent, Math.min(index, parent.childNodes.length))
            range.collapse(true)
            sel.removeAllRanges()
            sel.addRange(range)
        }
    } catch {
        // A restored caret is a nicety. A failure here must not report the delete as
        // failed, because the element is already gone.
    }

    return { ok: true }
}

/**
 * Extract image properties into observables for PropertyForm.
 * Each property is an observable that PropertyForm editors can read/write.
 */
export function extractImageProperties(img: HTMLImageElement): Record<string, Observable<any>> {
    return {
        src: $(img.getAttribute('src') || ''),
        alt: $(img.alt || ''),
        width: $(img.style.width || `${img.offsetWidth}px`),
        height: $(img.style.height || `${img.offsetHeight}px`),
        float: $(img.style.float || 'none'),
        display: $(img.style.display || 'inline'),
        marginLeft: $(img.style.marginLeft || '0'),
        marginRight: $(img.style.marginRight || '0'),
        maxWidth: $(img.style.maxWidth || '100%'),
    }
}

/**
 * Apply image property changes back to the DOM element.
 */
export function applyImageProperty(img: HTMLImageElement, key: string, value: any): void {
    switch (key) {
        case 'src':
            img.setAttribute('src', value)
            break
        case 'alt':
            img.alt = value
            break
        case 'width':
        case 'height':
        case 'float':
        case 'display':
        case 'marginLeft':
        case 'marginRight':
        case 'maxWidth':
            img.style[key as any] = value
            break
    }
}

/**
 * Extract text/computed style properties into observables for PropertyForm.
 */
export function extractTextProperties(element: HTMLElement): Record<string, Observable<any>> {
    const computed = window.getComputedStyle(element)
    return {
        tagName: element.tagName.toLowerCase() as any, // Read-only: shows p, li, pre, code, etc.
        fontWeight: $(computed.fontWeight),
        fontStyle: $(computed.fontStyle),
        fontSize: $(computed.fontSize),
        fontFamily: $(computed.fontFamily),
        color: $(computed.color),
        backgroundColor: $(computed.backgroundColor),
        textAlign: $(computed.textAlign),
    }
}

/**
 * Apply text property changes back to the DOM element.
 */
export function applyTextProperty(element: HTMLElement, key: string, value: any): void {
    // For text, apply inline style changes
    const styleMap: Record<string, string> = {
        fontWeight: 'fontWeight',
        fontStyle: 'fontStyle',
        fontSize: 'fontSize',
        fontFamily: 'fontFamily',
        color: 'color',
        backgroundColor: 'backgroundColor',
        textAlign: 'textAlign',
    }
    if (styleMap[key]) {
        element.style[styleMap[key] as any] = value
    }
}

/**
 * Attribute name for a schema prop.
 *
 * woby's customElement() maps a camelCase prop to a kebab-case attribute, so
 * `inputType` lives on the DOM as `input-type`. Writing `spec.name` straight
 * through gave `setAttribute('inputType')` → `inputtype="password"`, a dead
 * attribute sitting next to woby's live `input-type="text"`: the panel showed
 * "Password" while the field stayed a text box.
 */
const attrName = (name: string) => name.replace(/[A-Z]/g, c => '-' + c.toLowerCase())

/**
 * Coerce a raw attribute string to the runtime type declared in the plugin schema.
 * When the attribute is absent, returns the declared default (or the type's zero value).
 *
 * A prop with a `resolveDefault` treats an empty attribute the same as an absent
 * one. That is not a convenience: woby's customElement reflects `cls=""` onto
 * every upgraded element, so an unset class override never arrives here as null,
 * and keying off null alone would leave the row blank on exactly the elements it
 * exists to describe.
 */
function coerce(spec: PluginProp, raw: string | null, el?: HTMLElement): any {
    const resolved = el && spec.resolveDefault ? spec.resolveDefault(el) : undefined
    if (resolved !== undefined && (raw === null || raw === '')) return resolved

    if (raw === null) return spec.default ?? (
        spec.type === 'number' ? 0 :
        spec.type === 'boolean' ? false :
        spec.type === 'color' ? '#000000' :
        spec.type === 'enum' ? (spec.options?.[0]?.value ?? '') :
        ''
    )

    switch (spec.type) {
        case 'number': {
            const n = Number(raw)
            return isNaN(n) ? (spec.default ?? 0) : n
        }
        case 'boolean':
            // Must match woby's HtmlBoolean.fromHtml (`v === '' || v === 'true'`), which is
            // what the component itself reads the attribute with. The looser `raw !== 'false'`
            // used here before disagreed on hand-authored content: `disabled="disabled"` and
            // `disabled="0"` showed a ticked checkbox while the component stayed enabled.
            return raw === '' || raw === 'true'
        case 'string':
        case 'color':
        default:
            return raw
    }
}

/**
 * What the panel has to watch on a custom element to stay in step with changes
 * made anywhere else -- the element's own UI (a counter's +/- buttons), a
 * script, or an undo that rebuilds the node.
 *
 * A schema-declared plugin yields an exact attribute list, so the observer stays
 * narrow. Both spellings go in: `attrName()` is what the panel writes, but
 * hand-authored content and older serialized HTML carry the raw prop name.
 *
 * An element with no schema is read by the blind scrape, where *every* attribute
 * is a row -- there is no list to narrow to, so `attributeFilter` is omitted,
 * which MutationObserver reads as "all attributes".
 */
export function customElementWatchSpec(el: HTMLElement): { attributeFilter?: string[], text: boolean } {
    const props = getPluginForElement(el)?.props ?? []
    if (!props.length) return { text: false }

    const names = new Set<string>()
    let text = false
    for (const p of props) {
        if (p.hidden) continue
        // A textContent prop lives in the light DOM, but still falls back to a
        // same-named attribute, so it needs watching in both places.
        if (p.textContent) text = true
        names.add(attrName(p.name))
        names.add(p.name)
    }
    return { attributeFilter: Array.from(names), text }
}

/**
 * Extract custom element attributes into observables for PropertyForm.
 * When a plugin schema is registered, uses the declared types to produce
 * correctly-typed observable values. Falls back to the blind string scrape
 * when no schema exists.
 */
export function extractCustomElementProperties(el: HTMLElement): Record<string, Observable<any>> {
    const props: Record<string, any> = { tagName: el.tagName.toLowerCase() }

    const plugin = getPluginForElement(el)
    const declared = new Set<string>()

    for (const p of plugin?.props ?? []) {
        declared.add(p.name)
        if (p.hidden) continue
        // textContent props live in the light DOM; fall back to a legacy
        // same-named attribute so older serialized content still round-trips.
        const attr = attrName(p.name)
        const raw = p.textContent
            ? ((el.textContent ?? '').trim() || el.getAttribute(attr) || el.getAttribute(p.name))
            : (el.getAttribute(attr) ?? el.getAttribute(p.name))

        // A `live` prop shares the component's own observable instead of snapshotting
        // the attribute, so the row and the widget are the same piece of state and a
        // tick, drag or keystroke on the element shows up in the panel with nothing in
        // between. See PluginProp.live. The fallback covers an element that has not
        // been upgraded yet, and a prop the component does not actually declare.
        const shared = p.live ? (el as any).props?.[p.name] : undefined
        const obs: Observable<any> = isObservable(shared) ? shared : $(coerce(p, raw, el))

        // Hang enum options on the observable so EnumEditor can detect it
        if (p.type === 'enum' && p.options) {
            ;(obs as any).options = p.options
        }

        // The declared type, for editors that cannot infer it from the value alone.
        // 'date' is the case that forced this: a date attribute IS a string, so
        // StringEditor's typeof test matches it and the row rendered twice -- once as
        // the registered date picker and once as a raw text box that could fight it.
        // The observable is the only channel a row widget gets (PropertyRows hands its
        // renderCondition just the value and the key), which is why this rides along
        // with .options rather than being looked up from the schema.
        ;(obs as any).propType = p.type

        // Helper text, same side-channel. Declared since the schema's first draft and
        // rendered by nobody until now -- 44 plugins had written one into the void.
        if (p.hint) (obs as any).hint = p.hint

        // A row-level action rides the same channel, already bound to this element:
        // TableRow renders the button but knows nothing about plugins or selection,
        // and the observable is the only thing that reaches it from here.
        if (p.action) {
            const a = p.action
            ;(obs as any).action = { label: a.label, title: a.title, icon: a.icon, run: () => a.run(el) }
        }

        props[p.label ?? p.name] = obs
    }

    // Blind string scrape — ONLY for elements with no registered schema.
    //
    // When a plugin declares props, that schema is the contract and the scrape
    // does active harm: woby's customElement reflects every defaulted prop back
    // as an attribute, so a <wui-text-field> ended up with extra "Cls", "Effect"
    // and "Input-type" rows. "Input-type" is the worst of them — it is the kebab
    // reflection of the declared `inputType` enum, so the panel showed the same
    // property twice, once typed and once as a free-text field that could fight it.
    if (!plugin?.props?.length) {
        for (const attr of Array.from(el.attributes)) {
            if (declared.has(attr.name)) continue
            if (attr.name === 'style' || attr.name === 'class' || attr.name === 'contenteditable') continue
            if (attr.name.startsWith('data-')) continue
            props[attr.name] = $(attr.value)
        }
    }

    return props
}

/**
 * Apply custom element property changes back to the DOM element.
 * Type-directed: booleans become set/removeAttribute, values matching
 * the default unset the attribute. Calls the plugin's onPropChange hook.
 */
export function applyCustomElementProperty(el: HTMLElement, key: string, value: any): void {
    // tagName is an informational row (a plain string, not an attribute). Writing it
    // back produced a junk tagname="wui-button" attribute on every edited element.
    if (key === 'tagName') return

    const plugin = getPluginForElement(el)
    const spec = plugin?.props?.find(p => (p.label ?? p.name) === key)
    const name = spec?.name ?? key
    const attr = attrName(name)

    if (spec?.readonly) return

    // The "unset" value, which for a resolveDefault prop is whatever the element
    // itself resolves to. Typing the pre-filled base back into the Class Override
    // box has to clear the attribute, not bake a copy of the component's own
    // styling into the serialized HTML where the next variant change cannot reach it.
    const unset = spec?.resolveDefault ? spec.resolveDefault(el) : spec?.default

    // An earlier build wrote camelCase names straight to setAttribute, which the
    // DOM lowercased into a dead `inputtype`-style attribute. Sweep it away so the
    // kebab-case one below is the only value in the serialized HTML.
    if (attr !== name) el.removeAttribute(name)

    if (spec?.textContent) {
        // Replace the light-DOM text only — leave element children (icons, etc.) alone.
        const text = String(value)
        if (el.textContent !== text) el.textContent = text
        el.removeAttribute(attr)          // drop any legacy attribute form
        plugin?.onPropChange?.(el, attr, value)
        return
    }

    if (typeof value === 'boolean') {
        // Presence alone cannot express a boolean whose declared default is true:
        // absent is how its reader spells *on*, so unticking the box by removing the
        // attribute read straight back as ticked and the prop was write-once-on
        // ("Start a new page" could never be turned off). Spell the off state out,
        // and keep absent as the clean serialization of the default either way.
        if (unset === true) value ? el.removeAttribute(attr) : el.setAttribute(attr, 'false')
        else value ? el.setAttribute(attr, '') : el.removeAttribute(attr)
    } else if (value === '' || (spec && value === unset)) {
        el.removeAttribute(attr)          // back to default → keep serialized HTML clean
    } else {
        el.setAttribute(attr, String(value))
    }

    plugin?.onPropChange?.(el, attr, value)
}

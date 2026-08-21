import { $, $$, JSX, Observable, ObservableMaybe } from 'woby'

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
     * Optional: Deserialize HTML back into the custom element when loading
     * editor content. If not provided, the browser's innerHTML parser is used.
     *
     * @param html - The HTML string to parse
     * @returns The parsed custom element
     */
    fromHTML?: (html: string) => HTMLElement

    /**
     * Declarative, typed props for the property panel.
     * When present, the property panel renders typed editors instead of
     * blind string fields.
     */
    props?: PluginProp[]

    /**
     * Called after the panel has written an attribute.
     * Lets a plugin re-render, re-insert, or otherwise react to an edit that its
     * element cannot pick up from an attribute change on its own.
     */
    onPropChange?: (element: HTMLElement, key: string, value: any) => void
}

// Internal type for insert menu items (matches what InsertDropDown renders)
export type InsertMenuItem = {
    label: string
    action: () => void
    icon: () => JSX.Child
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
 * Convert registered plugins into insert menu items consumable by InsertDropDown.
 * Each plugin becomes an item with label, icon, and an action that calls onInsert.
 *
 * @param editorRoot - The editor's contenteditable element (passed from EditorSurface)
 * @returns Array of insert menu items
 */
export const pluginsToInsertItems = (editorRoot: HTMLElement): ObservableMaybe<InsertMenuItem[]> => {
    return $$(registeredPlugins).map(plugin => ({
        label: plugin.label,
        icon: plugin.icon ?? (() => null),
        action: () => {
            // Get the shadow root selection
            const root = editorRoot.getRootNode()
            const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
            const range = sel?.getRangeAt(0)
            if (!range) {
                console.warn(`[EditorPlugin] Cannot insert "${plugin.name}": no selection range`)
                return
            }

            // Restore selection (may have been lost from dropdown interaction)
            sel!.removeAllRanges()
            sel!.addRange(range)

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

export default EditorPlugin
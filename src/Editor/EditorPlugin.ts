import { $, $$, JSX, Observable, ObservableMaybe } from 'woby'

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
 * @param plugin - The plugin descriptor
 * @throws If a plugin with the same name is already registered
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
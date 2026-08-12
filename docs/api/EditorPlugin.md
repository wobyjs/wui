# EditorPlugin API

The **EditorPlugin API** defines the contract for third-party plugins that register custom elements and toolbar insert items with the WUI Editor. Plugins appear in the InsertDropDown under the "Advanced Inserts" section.

---

# Import

```tsx
import { registerEditorPlugin, unregisterEditorPlugin, getEditorPlugins, serializeEditorContent } from "./EditorPlugin";
import type { EditorPlugin, InsertMenuItem } from "./EditorPlugin";
```

---

# Interface: `EditorPlugin`

| Field       | Type                                                         | Required | Description                                                   |
| ----------- | ------------------------------------------------------------ | -------- | ------------------------------------------------------------- |
| **name**    | `string`                                                     | Yes      | Unique plugin identifier (e.g. `'my-video'`, `'counter'`)    |
| **label**   | `string`                                                     | Yes      | Display label shown in the insert menu                        |
| **icon**    | `() => JSX.Child`                                            | No       | Optional icon component rendered in the insert menu           |
| **tagName** | `string`                                                     | Yes      | The custom element tag name (e.g. `'my-counter'`)             |
| **onInsert**| `(editorRoot: HTMLElement, range: Range) => void`            | Yes      | Called when the user selects this plugin from the insert menu |
| **onRender**| `(element: HTMLElement) => void`                             | No       | Called after the custom element is inserted into the editor   |
| **toHTML**  | `(element: HTMLElement) => string`                           | No       | Serialize the custom element to an HTML string for output     |
| **fromHTML**| `(html: string) => HTMLElement`                              | No       | Deserialize HTML back into the custom element when loading    |

---

# Type: `InsertMenuItem`

| Field      | Type             | Description                                       |
| ---------- | ---------------- | ------------------------------------------------- |
| **label**  | `string`         | Display label in the insert menu                  |
| **action** | `() => void`     | Function to execute when the menu item is clicked |
| **icon**   | `() => JSX.Child`| Icon rendered alongside the label                 |

---

# Functions

## `registerEditorPlugin(plugin: EditorPlugin): void`

Register a plugin with the editor. The plugin appears in the InsertDropDown under the "Advanced Inserts" section.

- Prints a warning if a plugin with the same `name` is already registered (no-op, does not overwrite).
- The plugin's `onInsert` callback receives the editor's contentEditable root element and the current selection `Range`.
- The plugin's `onRender` callback is invoked after insertion with the inserted element (found by `tagName` query).

## `unregisterEditorPlugin(name: string): void`

Remove a previously registered plugin by its `name`.

## `getEditorPlugins(): Observable<EditorPlugin[]>`

Returns the reactive observable array of registered plugins. Components can use `$$(getEditorPlugins())` to reactively read the list.

## `pluginsToInsertItems(editorRoot: HTMLElement): InsertMenuItem[]`

Converts registered plugins into `InsertMenuItem` objects consumable by `InsertDropDown`. Each plugin becomes an item with its `label`, `icon`, and an `action` that calls `onInsert` with the editor's shadow root selection.

## `serializeEditorContent(editorRoot: HTMLElement): string`

Serializes the editor's HTML content, running each registered plugin's `toHTML` hook on matching elements. If a plugin does not provide `toHTML`, the element's outerHTML is used as-is.

---

# Internal Logic

## Plugin Registry

```ts
const registeredPlugins = $<EditorPlugin[]>([])
```

The registry is a Woby observable array. When `registerEditorPlugin` is called, the new plugin is appended to the array. The `InsertDropDown` component reads `getEditorPlugins()` reactively, so the insert menu updates automatically when plugins are registered or unregistered.

## Insert Flow

1. User clicks the "Insert" button in the toolbar, causing the dropdown to open.
2. Dropdown renders built-in items (Horizontal Rule, Image, Table) followed by registered plugin items.
3. When a plugin item is clicked, `pluginsToInsertItems` creates an action that:
   - Retrieves the current selection range from the shadow root (or document).
   - Restores the selection (may have been lost from the dropdown interaction).
   - Calls the plugin's `onInsert(editorRoot, range)`.
   - Optionally calls `onRender` on the last child matching the plugin's `tagName`.
4. The plugin is responsible for creating the custom element, setting its attributes, and inserting it into the DOM at the cursor position.

## Serialization Flow

When `serializeEditorContent` is called:
1. Reads the editor's innerHTML.
2. Iterates over registered plugins.
3. For each plugin with a `toHTML` hook, finds all elements matching the plugin's `tagName` and substitutes their outerHTML with the serialized output.
4. Returns the final HTML string.

---

# Usage Examples

## Basic Counter Plugin

```tsx
import { registerEditorPlugin } from "./EditorPlugin";

class MyCounter extends HTMLElement {
  private count = 0;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.count = parseInt(this.getAttribute("count") || "0", 10);
    this.render();
  }

  private render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-flex; align-items: center; gap: 8px;
                padding: 4px 12px; border: 2px dashed #3b82f6;
                border-radius: 6px; background: #eff6ff; }
      </style>
      <button data-action="dec">-</button>
      <span>${this.count}</span>
      <button data-action="inc">+</button>
    `;
  }
}

if (!customElements.get("my-counter")) {
  customElements.define("my-counter", MyCounter);
}

registerEditorPlugin({
  name: "counter",
  label: "Counter",
  tagName: "my-counter",
  icon: () => {
    const span = document.createElement("span");
    span.textContent = "+-";
    return span;
  },
  onInsert: (editorRoot, range) => {
    const el = document.createElement("my-counter");
    el.setAttribute("count", "0");
    range.deleteContents();
    range.insertNode(el);
    const newRange = document.createRange();
    newRange.setStartAfter(el);
    newRange.collapse(true);
    const root = editorRoot.getRootNode();
    const sel = root instanceof ShadowRoot
      ? root.getSelection()
      : window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(newRange);
  },
});
```

## Plugin with Custom Serialization

```tsx
registerEditorPlugin({
  name: "youtube-embed",
  label: "YouTube Video",
  tagName: "youtube-embed",
  icon: () => {
    const span = document.createElement("span");
    span.textContent = "YT";
    return span;
  },
  onInsert: (editorRoot, range) => {
    const url = prompt("Enter YouTube URL:");
    if (!url) return;
    const el = document.createElement("youtube-embed");
    el.setAttribute("src", url);
    range.deleteContents();
    range.insertNode(el);
  },
  toHTML: (element) => {
    const src = element.getAttribute("src") || "";
    return "<iframe src=\"" + src + "\" frameborder=\"0\" allowfullscreen></iframe>";
  },
  fromHTML: (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    const iframe = div.querySelector("iframe");
    const el = document.createElement("youtube-embed");
    el.setAttribute("src", iframe?.getAttribute("src") || "");
    return el;
  },
});
```

## Side-Effect Import Pattern

```ts
// CounterPlugin.ts registers the plugin as a side-effect
import "./CounterPlugin";
```

---

# Accessibility

- Plugin icons should provide meaningful visual representations of the inserted content.
- Custom elements registered through the plugin system should follow standard web component accessibility practices (ARIA attributes, keyboard navigation, focus management).
- The `onInsert` callback receives the editor's selection range, allowing plugins to place the cursor appropriately after insertion.

---

# Summary

The EditorPlugin system provides:

- A clean interface for registering custom elements with the WUI Editor
- Reactive plugin registry that updates the insert menu automatically
- Lifecycle hooks: `onInsert` (required), `onRender` (optional)
- Serialization hooks: `toHTML` and `fromHTML` for custom output formats
- Built-in safety: duplicate plugin name detection, no-op on re-registration
- Works with both shadow DOM and light DOM editor modes
- Example plugin (`CounterPlugin.ts`) included in the source tree
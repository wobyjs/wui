# Editor Plugin System

The `wui-editor` supports a plugin system for registering custom elements that appear in the editor's Insert menu and render inline within the editor content.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  InsertDropDown                      │
│  ┌──────────────┬──────────────┬──────────────────┐  │
│  │ Horizontal   │    Image     │      Table       │  │
│  │   Rule       │              │                  │  │
│  ├──────────────┼──────────────┼──────────────────┤  │
│  │   Counter    │  (plugin)    │  (plugin)        │  │
│  └──────────────┴──────────────┴──────────────────┘  │
│  Built-in items ↑         ↑ Plugin items             │
└─────────────────────────────────────────────────────┘
```

Plugins are registered via `registerEditorPlugin()` and automatically appear in the Insert dropdown menu below the built-in items.

> This page covers the **Insert menu**: custom elements a plugin drops into the document.
> A toolbar button, a formatting command or a keyboard chord is a different registry --
> see [Extending the Editor Toolbar](./editor-toolbar.md). The two compose: register the
> element here, and a toolbar item there if it deserves a button of its own.

## API Reference

### `registerEditorPlugin(plugin)`

Register a plugin with the editor. Plugins appear in the Insert menu automatically.

```ts
import { registerEditorPlugin } from '@woby/wui'

registerEditorPlugin({
    name: 'my-plugin',
    label: 'My Plugin',
    tagName: 'my-element',
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '🔌'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('my-element')
        range.deleteContents()
        range.insertNode(el)
        // Place cursor after the inserted element
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const sel = (editorRoot.getRootNode() instanceof ShadowRoot)
            ? (editorRoot.getRootNode() as ShadowRoot).getSelection()
            : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})
```

### Plugin Interface

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ✅ | Unique plugin identifier (e.g. `'my-video'`) |
| `label` | `string` | ✅ | Display label shown in the Insert menu |
| `tagName` | `string` | ✅ | The custom element tag name (e.g. `'my-video'`) |
| `icon` | `() => JSX.Child` | ❌ | Optional icon rendered in the insert menu |
| `onInsert` | `(editorRoot, range) => void` | ✅ | Called when the user selects this plugin from the insert menu. Receives the editor's contenteditable element and the current cursor Range. |
| `onRender` | `(element) => void` | ❌ | Called after a custom element is inserted. Use to attach event listeners or initialize state. |
| `toHTML` | `(element) => string` | ❌ | Serialize the custom element to an HTML string for output. If omitted, `outerHTML` is used. |
| `fromHTML` | `(html) => HTMLElement` | ❌ | Deserialize HTML back into the custom element when loading editor content. Run by `deserializeEditorContent`; load content through that rather than assigning `innerHTML`, or the hook never fires. |
| `props` | `PluginProp[]` | ❌ | Typed property schema that drives the property panel. Without it the panel falls back to blind free-text attribute rows. |
| `onPropChange` | `(element, key, value) => void` | ❌ | Called after the panel writes an attribute, for elements that cannot repaint from an attribute change alone. |

### Typed Props (`props`)

Declare `props` and the property panel renders real editors — a dropdown for an
enum, a spinner for a number, a swatch for a colour — instead of free-text
attribute rows:

```ts
registerEditorPlugin({
    name: 'callout',
    label: 'Callout',
    tagName: 'my-callout',
    props: [
        { name: 'tone', type: 'enum', label: 'Tone', default: 'info', options: [
            { value: 'info', label: 'Info' },
            { value: 'warn', label: 'Warning' },
        ] },
        { name: 'children', type: 'string', label: 'Text', default: 'Note', textContent: true },
        { name: 'accent', type: 'color', label: 'Accent', default: '#3b82f6' },
        { name: 'iconSize', type: 'number', label: 'Icon Size', default: 16 },
    ],
    onInsert: (editorRoot, range) => { /* ... */ },
})
```

`type` is one of `'string' | 'number' | 'boolean' | 'color' | 'enum'` (enum
requires `options`). Other useful fields: `label`, `default`, `hint`, `readonly`,
`hidden`.

`readonly` is enforced in both places it has to be: the row's control is disabled, and the write
path refuses the value. `hint` becomes the row's tooltip.

Two rules are easy to get wrong:

- **Declare camelCase names.** woby maps `iconSize` to the `icon-size`
  attribute; the panel does the conversion for you. Writing
  `setAttribute('iconSize', …)` yourself leaves a dead lowercased `iconsize`
  attribute next to the live one.
- **Slot content needs `textContent: true`.** woby's `customElement()` always
  passes a `<slot>` as `children`, so a `children="Label"` *attribute* is
  ignored and the element renders blank. With the flag, the panel writes
  `el.textContent` instead.

Declaring `props` also **turns off** the blind attribute scrape for that
element, which is what keeps reflected defaults (`cls`, `effect`, a duplicate
`input-type` row fighting the typed `inputType` enum) out of the panel.

The bundled `src/Editor/WuiPlugins.ts` registers eleven wui-* components
(`button`, `toggle-button`, `checkbox`, `switch`, `text-field`, `text-area`,
`number-field`, `icon-button`, `badge`, `fab`, `avatar`) this way — read it as a
worked reference. Portal-based components (the Wheeler family) are deliberately
left out: they render outside the document flow and are not document-centric, so
they do not belong in an editor insert menu.

### Other API Functions

```ts
// Unregister a previously registered plugin
unregisterEditorPlugin('my-plugin')

// Get the observable array of registered plugins (reactive)
getEditorPlugins()

// Resolve the plugin that owns a DOM element (by tagName), or undefined
getPluginForElement(el)

// Serialize editor content with all plugin toHTML hooks
serializeEditorContent(editorRoot)
```

## Complete Example: Counter Plugin

The full example is at `src/Editor/CounterPlugin.ts`:

```ts
import { registerEditorPlugin } from '@woby/wui'

class MyCounter extends HTMLElement {
    private _count = 0

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }

    // Required for property-panel edits to show up: reading the attribute once in
    // connectedCallback leaves the element stale after every later write.
    static get observedAttributes() { return ['count'] }

    attributeChangedCallback(name: string, _old: string | null, value: string | null) {
        if (name !== 'count') return
        const next = parseInt(value || '0', 10)
        if (Number.isNaN(next) || next === this._count) return
        this._count = next
        this.updateDisplay()
    }

    connectedCallback() {
        this._count = parseInt(this.getAttribute('count') || '0', 10)
        this.render()
    }

    private render() {
        if (!this.shadowRoot) return
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 4px 12px; border: 2px dashed #3b82f6;
                    border-radius: 6px; background: #eff6ff;
                    font-family: monospace; user-select: none;
                }
                span { font-size: 16px; font-weight: bold; color: #1e40af; min-width: 24px; text-align: center; }
                button { width: 24px; height: 24px; border: 1px solid #93c5fd; border-radius: 4px;
                         background: white; cursor: pointer; font-size: 14px; }
            </style>
            <button data-action="dec">−</button>
            <span>${this._count}</span>
            <button data-action="inc">+</button>
        `
        this.shadowRoot.querySelector('[data-action="dec"]')?.addEventListener('click', () => {
            this._count--; this.updateDisplay()
        })
        this.shadowRoot.querySelector('[data-action="inc"]')?.addEventListener('click', () => {
            this._count++; this.updateDisplay()
        })
    }

    private updateDisplay() {
        const display = this.shadowRoot?.querySelector('span')
        if (display) display.textContent = String(this._count)
        this.setAttribute('count', String(this._count))
    }
}

if (!customElements.get('my-counter')) {
    customElements.define('my-counter', MyCounter)
}

registerEditorPlugin({
    name: 'counter',
    label: 'Counter',
    tagName: 'my-counter',
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '±'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('my-counter')
        el.setAttribute('count', '0')
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const sel = (editorRoot.getRootNode() instanceof ShadowRoot)
            ? (editorRoot.getRootNode() as ShadowRoot).getSelection()
            : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})
```

## Usage

Import the plugin file as a side-effect — it auto-registers:

```ts
// editor-setup.ts or your page script
import './CounterPlugin'
// Or register inline:
import { registerEditorPlugin } from '@woby/wui'
registerEditorPlugin({ /* ... */ })
```

The plugin then appears in the editor's **Insert → +** menu.

The bundled wui-* component plugins live in their own side-effect module. The
demo app registers them from `src/main.ts`:

```ts
import './Editor/WuiPlugins'   // button, checkbox, text-field, … (11 plugins)
```

Skip that import and the file is inert — the components never reach the Insert
menu and the property panel falls back to blind attribute rows.

## Important Notes

- **Custom element insertion**: Use `document.createElement()` + `range.insertNode()` — `execCommand('insertHTML')` strips unknown custom element tags in some browsers.
- **Shadow DOM selection**: Always use `editorRoot.getRootNode().getSelection()` inside `onInsert` to get the correct selection (shadow root vs light DOM).
- **Plugin deduplication**: Registering a plugin with the same `name` twice is a no-op (warning logged).

## See also

- [Extending the Editor Toolbar](./editor-toolbar.md) - commands, toolbar items and keyboard
  chords, and the three different verbs for taking a built-in off the bar.

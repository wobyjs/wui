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
| `fromHTML` | `(html) => HTMLElement` | ❌ | Deserialize HTML back into the custom element when loading editor content. |

### Other API Functions

```ts
// Unregister a previously registered plugin
unregisterEditorPlugin('my-plugin')

// Get the observable array of registered plugins (reactive)
getEditorPlugins()

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

## Important Notes

- **Custom element insertion**: Use `document.createElement()` + `range.insertNode()` — `execCommand('insertHTML')` strips unknown custom element tags in some browsers.
- **Shadow DOM selection**: Always use `editorRoot.getRootNode().getSelection()` inside `onInsert` to get the correct selection (shadow root vs light DOM).
- **Plugin deduplication**: Registering a plugin with the same `name` twice is a no-op (warning logged).
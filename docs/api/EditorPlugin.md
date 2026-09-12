# EditorPlugin API

The **EditorPlugin API** defines the contract for third-party plugins that register custom elements and toolbar insert items with the WUI Editor. Plugins appear in the InsertDropDown under the "Advanced Inserts" section.

---

# Import

```tsx
import {
  registerEditorPlugin,
  unregisterEditorPlugin,
  getEditorPlugins,
  getPluginForElement,
  pluginsToInsertItems,
  serializeEditorContent,
  deserializeEditorContent,
} from "./EditorPlugin";
import type { EditorPlugin, InsertMenuItem, PluginProp, PluginPropType } from "./EditorPlugin";

// Registers the bundled wui-* component plugins as a side-effect.
import "./Editor/WuiPlugins";
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
| **fromHTML**| `(html: string) => HTMLElement`                              | No       | Deserialize HTML back into the custom element when loading. Run by `deserializeEditorContent` |
| **props**   | `PluginProp[]`                                               | No       | Typed property schema. When present the property panel renders typed editors instead of blind string fields |
| **onPropChange** | `(element: HTMLElement, key: string, value: any) => void` | No     | Called after the panel writes an attribute, so a plugin can re-render or re-insert an element that cannot pick the change up on its own |
| **actions** | `PluginAction[]`                                             | No       | Buttons rendered as a strip at the bottom of the property panel, for operations on the element as a whole |
| **resizable** | `boolean \| ResizableSpec`                                 | No       | Drag handles on the element. `true` means the defaults (see below) |
| **anchor**  | `(el: HTMLElement) => HTMLElement`                           | No       | The box to measure for handles and overlays, when it is not the host itself |
| **pageBreak** | `PageBreakKind \| ((el: HTMLElement) => PageBreakKind)`    | No       | How this element interrupts the flow of pages (see below) |
| **editableContent** | `boolean`                                            | No       | This element's light DOM is the document's, not the plugin's (see below) |
| **order**   | `number`                                                     | No       | Where the plugin sits in the insert menu. Lower sorts earlier; the default is `0` (see below) |

---

# Type: `PageBreakKind`

```ts
type PageBreakKind = 'none' | 'before' | 'after' | 'own-page'
```

| Value | Meaning |
| --- | --- |
| `'before'` | The page ends immediately **before** this element |
| `'after'` | The page ends immediately **after** it |
| `'own-page'` | The element **is** a page — nothing shares a sheet with it |
| `'none'` | Not a break. The default, and the same as omitting the field |

Use the function form when the answer lives in the element's own attributes — a break block with a
"break before / break after" switch is the usual case:

```ts
pageBreak: el => el.getAttribute('where') === 'after' ? 'after' : 'before'
```

A block with no plugin, or a plugin that omits this field, can still break a page with plain CSS:
`break-before: page` is honoured as a fallback. See [PageLayout.md](./PageLayout.md).

```ts
resolvePageBreak(el)   // 'none' if el's plugin declares nothing
pageBreakTagNames()    // every registered plugin that declares a pageBreak
```

---

# `editableContent` — containers vs widgets

Most plugins keep everything in attributes, and that is what makes the plain click-to-select rule
safe: click the host, the panel opens, `Backspace` removes the whole widget.

A **container** inverts that. A cover page whose photo is a backdrop for ordinary prose, a callout
box, a banner — their children are the *author's text*, and selecting the host every time the caret
is placed in that text would put the whole page one `Backspace` away from deletion.

Set `editableContent: true` and the editor splits clicks by where they actually land:

| Click lands on | Result |
| --- | --- |
| the shadow DOM, or the host itself | **selects the block** — panel, handles, delete |
| a light-DOM descendant | falls through to the **caret**, like any other text |

Which is why a container needs a piece of shadow chrome the author can aim at. `wui-cover-page`
covers the whole sheet with the photo behind the text, so any click that misses the words selects
the block; `wui-banner`'s backdrop does the same job.

Off by default: `<wui-icon-button><svg/></wui-icon-button>` has light-DOM children too, and it is
not a container — it must stay selectable by clicking its icon.

```ts
editableContentTagNames()   // upper-case tag names of every plugin that declares it
```

---

# Interface: `PluginAction`

```ts
interface PluginAction {
    label: string
    title?: string
    icon?: () => JSX.Child
    run: (el: HTMLElement) => void
}
```

The same shape serves two placements:

| Placed as | Where it renders | For |
| --- | --- | --- |
| `EditorPlugin.actions` | a strip at the bottom of the panel | operations on the element **as a whole** — "Replace image", "Reset" |
| `PluginProp.action` | **inside one row**, to the right of its editor | an operation belonging to a **single value** — "Reroll the seed", "Edit…" on a logo URL |

The row updates itself afterwards with no help from the action: writing the attribute is seen by
the panel's mirror observer, which pushes the new value into the row's observable, which runs the
per-property effect — so the edit lands on the undo stack exactly like a typed one.

The one requirement is that whatever `run` writes is a **declared** prop. The observer's
`attributeFilter` is built from the schema, so an undeclared attribute changes nothing on screen.

---

# Interface: `ResizableSpec`

`resizable: true` means all of these defaults; an object overrides the ones it names.

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| **write** | `ResizeWrite` | `'style'` | Where the new size is written — inline style or attributes |
| **widthProp** | `string` | `'width'` | Name of the width property/attribute |
| **heightProp** | `string` | `'height'` | Name of the height property/attribute |
| **aspect** | `'lock' \| 'free' \| number` | `'free'` | Aspect constraint while dragging |
| **min** | `[number, number]` | `[20, 20]` | Minimum width and height in px |
| **live** | `boolean` | `true` | Write during the drag, not only on release |

```ts
resolveResizable(el)   // the spec, or null. <img> answers first and always, with bare defaults
resolveAnchor(el)      // the plugin's anchor(el), else el itself
```

---

# Type: `PluginPropType`

```ts
type PluginPropType = 'string' | 'number' | 'boolean' | 'color' | 'enum'
```

Drives which editor row the property panel renders, and how the raw attribute
string is coerced back to a runtime value:

| Type        | Panel row       | Coercion from attribute                              | Value when the attribute is absent |
| ----------- | --------------- | ---------------------------------------------------- | ---------------------------------- |
| `'string'`  | `StringEditor`  | used verbatim                                         | `default ?? ''`                    |
| `'number'`  | `NumberEditor`  | `Number(raw)`; falls back to `default` when `NaN`     | `default ?? 0`                     |
| `'boolean'` | `BooleanEditor` | bare attribute → `true`, literal `"false"` → `false`  | `default ?? false`                 |
| `'color'`   | `ColorEditor`   | used verbatim (a CSS colour string)                   | `default ?? '#000000'`             |
| `'enum'`    | `EnumEditor`    | used verbatim                                         | `default ?? options[0].value`      |

---

# Interface: `PluginProp`

| Field           | Type                                    | Required | Description                                                              |
| --------------- | --------------------------------------- | -------- | ------------------------------------------------------------------------ |
| **name**        | `string`                                | Yes      | Attribute name on the element, e.g. `'label'`, `'count'`, `'variant'`     |
| **type**        | `PluginPropType`                        | Yes      | Value type; selects the editor row (see table above)                      |
| **label**       | `string`                                | No       | Row label in the property panel; defaults to `name`                       |
| **default**     | `string \| number \| boolean`           | No       | Value used when the attribute is absent, and the "unset" comparison value |
| **resolveDefault** | `(el: HTMLElement) => string \| number \| boolean` | No | A default computed from the element. Wins over `default` in both directions |
| **options**     | `{ value: string; label?: string }[]`   | For enum | Choices offered by `EnumEditor`; required when `type` is `'enum'`         |
| **readonly**    | `boolean`                               | No       | Rendered, but not editable (e.g. values resolved at construction time). The row's control is disabled, and the write path drops the value too |
| **hidden**      | `boolean`                               | No       | Never surfaced in the panel at all                                        |
| **hint**        | `string`                                | No       | Tooltip / helper text for the row                                         |
| **action**      | `PluginAction`                          | No       | A button rendered **inside this row**, to the right of its editor         |
| **textContent** | `boolean`                               | No       | This prop is the element's light-DOM text, not an attribute (see below)   |

> ### ⚠️ `default` must equal the component's own default
>
> The panel treats "value equals `default`" as *unset* and **removes the attribute**. If the
> schema's default disagrees with the component's `def()` fallback, setting that value strips the
> attribute and the widget visibly reverts to something else. Read the default from the same
> exported table the component uses — that is what `BANNER` in `Banner.tsx` is for.

## `resolveDefault` — when no literal will do

`resolveDefault` wins over `default` in both directions: the panel shows it when the attribute is
absent or empty, and an edit back to it clears the attribute again.

`cls` needs this. The class it replaces is the element's own variant, so no single literal can
stand in for it, and an empty box tells the user nothing about what an override would replace.
`registerBaseCls(tag, BASE_CLASS)` is how a component publishes that value.

## camelCase names become kebab-case attributes

woby's `customElement()` maps a camelCase prop to a kebab-case attribute, so a
prop declared as `inputType` lives on the DOM as `input-type`. Declare the prop
under its **camelCase** name — the panel converts it when reading and writing.
Writing `setAttribute('inputType', …)` directly produces a dead, lowercased
`inputtype` attribute sitting next to woby's live `input-type` one, which makes
the panel and the element disagree.

## `textContent: true` — light-DOM text, not an attribute

woby's `customElement()` always passes a `<slot>` as `children`, so a
`children="Label"` **attribute** is silently ignored and the component renders
blank. Any prop whose value has to reach a slot (typically `children`) must be
declared with `textContent: true`; the panel then writes `el.textContent`
instead of an attribute, leaving element children such as icons alone, and drops
any legacy same-named attribute.

## Write-back rules

`applyCustomElementProperty` (used by the property panel) is type-directed:

- `boolean` values → `setAttribute(attr, '')` when `true`, `removeAttribute` when `false`.
- A value equal to the declared `default`, or an empty string, removes the attribute so the serialized HTML stays clean.
- `readonly` props are never written, and the row's control is disabled so the keystroke is refused rather than silently discarded on commit.
- After every write, the owning plugin's `onPropChange(element, attr, value)` is called.

## Schema disables the blind attribute scrape

When a plugin declares `props`, that schema is the contract: the panel stops
scraping the element's other attributes. This matters because woby reflects
every defaulted prop back as an attribute, which would otherwise surface junk
rows (`Cls`, `Effect`) and — worse — a duplicate free-text `Input-type` row
fighting the typed `inputType` enum. Elements with no registered schema still
fall back to the blind string scrape.

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

## `getPluginForElement(el: HTMLElement): EditorPlugin | undefined`

Resolves the plugin that owns a DOM element by case-insensitive `tagName` match,
or `undefined` when no registered plugin claims the tag. The property panel calls
this to find an element's `props` schema and its `onPropChange` hook.

```ts
const plugin = getPluginForElement(selectedEl);
const schema = plugin?.props ?? [];
```

## `pluginsToInsertItems(editorRoot: HTMLElement): InsertMenuItem[]`

Converts registered plugins into `InsertMenuItem` objects consumable by `InsertDropDown`. Each plugin becomes an item with its `label`, `icon`, its `order`, and an `action` that calls `onInsert` with the editor's shadow root selection.

The list comes back **sorted by `order`**, not in registration order.

---

# `order` — where a plugin lands in the insert menu

Registration order is really *module import order*, which means a plugin's position in the menu
would depend on the order of the `import` lines in whichever app bundled it. That is neither
stable nor something the plugin author controls, so position is declared instead:

```ts
registerEditorPlugin({ name: 'banner', order: -50, /* … */ })
```

Lower sorts earlier. `InsertDropDown` sorts its own rows and the plugin items together as **one
list**, so `order` can place a plugin anywhere in the menu rather than only among its peers. The
scale:

| `order` | Where it lands |
| --- | --- |
| `BUILT_IN_ORDER` (`-100`) | The menu's own rows: Image, Table, Container, Row (flex) |
| `-99` … `-1` | Below the built-ins, above every plugin that did not ask |
| `0` — the default | The ordinary plugins, in registration order |
| `> 0` | Below everything that did not ask |

`BUILT_IN_ORDER` is exported, because it is the only fixed point on the scale: a plugin that means
"just under the built-ins" has to know where they are, and one that means "above them" has to be
able to say so without guessing how negative is negative enough.

The sort is stable, so every plugin that omits `order` keeps the order it registered in.

The bundled page-structure family sits in the middle band — under `Row (flex)`, above `counter`
and the widgets. They are the blocks an author reaches for while laying a document *out* rather
than while writing in it:

| Plugin | `order` |
| --- | --- |
| `banner` | `-50` |
| `cover-page` | `-49` |
| `watermark` | `-48` |
| `page-break` | `-47` |
| `rule` | `-46` |

## `serializeEditorContent(editorRoot: HTMLElement): string`

Serializes the editor's HTML content, running each registered plugin's `toHTML` hook on matching elements. If a plugin does not provide `toHTML`, the element's outerHTML is used as-is.

## `deserializeEditorContent(editorRoot: HTMLElement, html: string): void`

The inverse. Loads `html` into the editor and runs each registered plugin's `fromHTML` hook on
matching elements, replacing any element the hook returns a different node for.

Use it instead of assigning `editorRoot.innerHTML` yourself whenever plugins are in play. Assigning
directly skips every `fromHTML` hook, so a plugin that writes a serialized form other than its own
live markup gets no chance to read that form back.

The markup is parsed *first* and revived *second*. That ordering is deliberate: assigning
`innerHTML` hands the markup to the browser's parser and upgrades any custom elements in it, so the
element passed to `fromHTML` is a live, upgraded node — a plugin that needs to look at its own props
or shadow root can. The cost is that an element may be built and then immediately replaced, which is
cheap next to the clarity.

Elements are collected into an array before any replacement runs, because replacing a node while
iterating a live `NodeList` silently skips half of them.

---

# Internal Logic

## Plugin Registry

```ts
const registeredPlugins = $<EditorPlugin[]>([])
```

The registry is a Woby observable array. When `registerEditorPlugin` is called, the new plugin is appended to the array. The `InsertDropDown` component reads `getEditorPlugins()` reactively, so the insert menu updates automatically when plugins are registered or unregistered.

## Insert Flow

1. User clicks the "Insert" button in the toolbar, causing the dropdown to open.
2. Dropdown merges its built-in items (Image, Table, Container, Row) with the registered plugin
   items and sorts the whole list by `order`.
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

## Deserialization Flow

When `deserializeEditorContent` is called:
1. Assigns the HTML to the editor's innerHTML, which parses it and upgrades the custom elements in it.
2. Iterates over registered plugins.
3. For each plugin with a `fromHTML` hook, collects all elements matching the plugin's `tagName` into an array, then calls the hook with each element's outerHTML.
4. Replaces an element only when the hook returns a *different* node, so returning the element unchanged is a valid no-op.

Matching is by `tagName` in both directions. A `toHTML` that does not keep the custom element's own
tag produces markup `fromHTML` can never be found for — keep the tag and move the detail into
attributes or children.

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

  // Required for property-panel edits to show up: reading the attribute once in
  // connectedCallback leaves the element stale after every later write.
  static get observedAttributes() { return ["count"]; }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    if (name !== "count") return;
    const next = parseInt(value || "0", 10);
    if (Number.isNaN(next) || next === this.count) return;
    this.count = next;
    this.updateDisplay();
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

## Plugin with a Typed Property Schema

```tsx
registerEditorPlugin({
  name: "callout",
  label: "Callout",
  tagName: "my-callout",
  props: [
    {
      name: "tone", type: "enum", label: "Tone", default: "info",
      options: [
        { value: "info", label: "Info" },
        { value: "warn", label: "Warning" },
        { value: "error", label: "Error" },
      ],
    },
    // Light-DOM text: a children="…" attribute would be swallowed by the slot.
    { name: "children", type: "string", label: "Text", default: "Note", textContent: true },
    { name: "accent", type: "color", label: "Accent", default: "#3b82f6" },
    { name: "collapsed", type: "boolean", label: "Collapsed", default: false },
    // Declared camelCase; written to the DOM as icon-size.
    { name: "iconSize", type: "number", label: "Icon Size", default: 16, hint: "Pixels" },
  ],
  // The element caches its tone in JS, so an attribute write alone would not repaint.
  onPropChange: (element, key) => {
    if (key === "tone") (element as any).refresh?.();
  },
  onInsert: (editorRoot, range) => {
    const el = document.createElement("my-callout");
    el.textContent = "Note";
    range.deleteContents();
    range.insertNode(el);
  },
});
```

Selecting a `<my-callout>` in the editor now yields a property panel with an
enum dropdown, a text row bound to the element's light-DOM text, a colour
swatch, a checkbox and a number spinner — no free-text attribute rows.

## Bundled WUI Component Plugins

`src/Editor/WuiPlugins.ts` registers the wui-* components as editor plugins,
each with a typed `props` schema. It is a **side-effect module and is not
re-exported from the package index** — import it explicitly (the demo app does so
from `src/main.ts`), or the twelve plugins below never register:

```ts
import "./Editor/WuiPlugins";
```

| Plugin `name`     | `tagName`             | Declared props                                                        |
| ----------------- | --------------------- | --------------------------------------------------------------------- |
| `button`          | `wui-button`          | `type` (enum), `children` (text), `disabled`                           |
| `toggle-button`   | `wui-toggle-button`   | `children` (text), `checked`, `disabled`                               |
| `checkbox`        | `wui-checkbox`        | `children` (text), `checked`, `disabled`, `labelPosition` (enum)       |
| `switch`          | `wui-switch`          | `on`, `off`, `checked`, `effect` (enum)                                |
| `text-field`      | `wui-text-field`      | `label`, `value`, `placeholder`, `inputType` (enum), `disabled`        |
| `text-area`       | `wui-text-area`       | `label`, `value`, `placeholder`                                        |
| `number-field`    | `wui-number-field`    | `value`, `min`, `max`, `step` (numbers), `disabled`                    |
| `icon-button`     | `wui-icon-button`     | `disabled`                                                             |
| `badge`           | `wui-badge`           | `badgeContent`, `vertical` (enum), `horizontal` (enum)                 |
| `fab`             | `wui-fab`             | `type` (enum), `children` (text), `disabled`                           |
| `avatar`          | `wui-avatar`          | `size` (enum), `type` (enum), `src`, `children` (text initials)        |
| `banner`          | `wui-banner`          | `type` (enum), `src`, `focus` (enum), `scrim` (enum), `overlay` (number), `tint`/`tint2`/`ink` (color), `shadow`, `height`, `pad`, `align` (enum), `logo` (+ `Edit…` action), `logoHeight`, `print` |

`banner` is the one with `editableContent: true`: its backdrop selects the block, its words take
the caret. Insertion seeds an `<h2>` and a `<p>` so the caret has somewhere to land. Its defaults
come from the exported `BANNER` table, shared with the component — see [Banner.md](./Banner.md).

## Bundled Page-Block Plugins

`src/Editor/PageBlockPlugins.ts` registers the blocks that exist to shape the *paper*. Same
side-effect import rule as above.

| Plugin `name` | `tagName` | `pageBreak` | `editableContent` |
| --- | --- | --- | --- |
| `cover-page` | `wui-cover-page` | `'own-page'` | Yes — the photo is a backdrop for the author's prose |
| `watermark` | `wui-watermark` | `el => startsPage(el) ? 'before' : 'none'` | No |
| `page-break` | `wui-page-break` | `el => el.getAttribute('where') === 'after' ? 'after' : 'before'` | No |
| `rule` | `wui-rule` | — | No |

`rule` replaced the menu's old built-in **Horizontal Rule** row, which ran
`execCommand('insertHTML', '<hr class="my-4 mx-auto border-gray-400" />')`. Both insert a
horizontal line and only one of them is editable afterwards: a bare `<hr>` has no plugin, so
clicking it opens no property panel and its appearance is frozen in a class string, while
`<wui-rule>` carries `variant` / `weight` / `color` / `width` / `align` / `glyph` and can draw a
gradient or an ornament, neither of which is expressible as a border on one element. Two menu
rows for one idea, so the built-in one is gone. Documents that already contain a plain `<hr>`
still render — nothing rewrites them, they just have no panel.

Taking the built-in row away made two of its properties the plugin's problem. The old `<hr>`
carried `my-4`, so replacing it with a flush line was a visible regression; and a 1px line is a
1px *block*, which cannot be clicked — the press lands on the surface behind it, `<wui-rule>`
never appears in the `composedPath` the selection walk reads, and the property panel that
justified the merge is unreachable. `wui-rule` therefore pads itself vertically. The padding
goes on a node **inside** its shadow tree, not on `:host`: for normal declarations the outer
tree wins regardless of specificity, and the editor adopts Tailwind's preflight, whose
`*, ::after, ::before { padding: 0 }` matches the host and silently zeroes it. That is the same
cascade rule that makes cover page's `::slotted(*)` need `!important`.

A watermark that already sits at the top of a sheet does not need to force a break; one that does
not, does. That conditional is exactly why `pageBreak` takes a function.

In `flow` mode these render as **visible labelled markers** so the author can see and delete them;
in `page` mode they are consumed into real breaks, and in `screen` they are hidden.

Props marked *(text)* are declared `textContent: true` because they feed the
component's slot. Note that **Portal-based components (the Wheeler family) are
deliberately excluded** — they render outside the document flow and are not
document-centric, so they do not belong in an editor's insert menu.

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
- Serialization hooks: `toHTML` and `fromHTML` for custom output formats, driven by `serializeEditorContent` / `deserializeEditorContent`
- A typed property schema (`props: PluginProp[]`) that drives the property panel's editors, plus an `onPropChange` hook for elements that cannot react to attribute writes on their own
- `getPluginForElement(el)` to resolve a plugin from any DOM element
- Built-in safety: duplicate plugin name detection, no-op on re-registration
- Works with both shadow DOM and light DOM editor modes
- Example plugin (`CounterPlugin.ts`) and eleven bundled wui-* plugins (`WuiPlugins.ts`) included in the source tree
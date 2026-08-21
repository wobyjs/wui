# Handoff — typed plugin props in the Editor property panel

**Goal.** A consumer registers a custom element with `registerEditorPlugin(...)`. After
inserting `<my-component>` into the editor, the author should be able to **select the
block**, hit the **Property** button (`InfoButton`), and edit that element's
attributes through `PropertyForm` — with the *declared* props of the plugin, typed
(string / number / boolean / color / enum), not a blind scrape of whatever attributes
happen to be on the node.

Nothing below is app-specific; it is all inside `@woby/wui`.

---

## 1. How the pieces fit today

```
InfoButton.tsx           toolbar button
  └─ detectSelectionType()            PropertyExtractor.ts:24
  └─ sets ctx.propertyTarget / ctx.selectionType, then panelOpen(true)
PropertyPanel.tsx        right-side panel, reads the same context
  └─ extractCustomElementProperties()  PropertyExtractor.ts:246   → Record<string, Observable>
  └─ <PropertyForm obj={…}>            PropertyForm/PropertyForm.tsx
       └─ PropertyRows.tsx             one row per key
            └─ Editors registry        PropertyForm/Editors.ts
       (String/Number/Boolean/Color/Object editors self-register by side-effect import)
  └─ per-property effect → applyCustomElementProperty()  PropertyExtractor.ts:264
```

Editor choice is **duck-typed on the runtime value**, not on any declared type:
`StringEditor.renderCondition` = `typeof $$(v) === 'string'` and not hex-colour,
`NumberEditor` = `typeof $$(v) === 'number'`, `BooleanEditor` = `typeof $$(v) === 'boolean'`,
`DropdownEditor` = `Array.isArray($$(v))`.

That duck-typing is worth keeping — it means **if the extractor hands out an observable
of the right runtime type, the correct editor renders with no change to the registry.**

---

## 2. The four gaps

### Gap 1 — a custom element can only be selected in shadow-DOM mode

`detectSelectionType()` walks up the selection looking for a hyphenated tag **only in the
shadow branch** (`PropertyExtractor.ts:71-87`). The light-DOM branch
(`PropertyExtractor.ts:106-161`) recognises `img` → `text` → `none` and nothing else.

Any consumer that renders `<Editor>` as a plain JSX component (light DOM) therefore
gets *"Text Properties"* of the surrounding block, never *"Element Properties"*.

Worse, a well-behaved embedded block is usually `contenteditable="false"` and owns a
shadow root — so a click **inside** it leaves no light-DOM range pointing at the block at
all. Even with the ancestor walk added, selection alone is not a reliable signal. An
explicit click-to-select affordance is required.

### Gap 2 — props are a blind attribute scrape, all strings

```ts
// PropertyExtractor.ts:246
export function extractCustomElementProperties(el: HTMLElement) {
    const props = { tagName: el.tagName.toLowerCase() }
    for (const attr of Array.from(el.attributes)) {
        if (attr.name === 'style' || attr.name === 'class' || attr.name.startsWith('data-')) continue
        props[attr.name] = $(attr.value)          // ← always a string observable
    }
    return props
}
```

Consequences:

* an attribute that is **not already on the element cannot be added** — the panel can
  only edit what is there;
* every row is a `TextField`, even for a count or a flag;
* `contenteditable` leaks into the form (it is neither `style`, `class`, nor `data-*`);
* `applyCustomElementProperty` is `el.setAttribute(key, String(value))` for everything —
  no way to express "unset", "boolean attribute", "restore default".

### Gap 3 — an empty value renders no row

`PropertyRows.tsx:54` gates each row on

```ts
($$(value) && !(value instanceof HTMLElement)) || $$(value) === 0 || $$(value) === false
```

so `attr=""` silently produces nothing. With a declared schema this is fatal: an
unset-but-declared prop is exactly the row the author needs in order to set it.

### Gap 4 — no plain enum editor

`DropdownEditor` fires on `Array.isArray(value)` and renders a `MultiWheeler` with
hardcoded domain lists (`functions`, `projAsia`, …). There is no simple
`<select>`-style editor for "one of these N string values".

---

## 3. Proposed design

### 3.1 `EditorPlugin` gains a typed prop schema

`src/Editor/EditorPlugin.ts`:

```ts
export type PluginPropType = 'string' | 'number' | 'boolean' | 'color' | 'enum'

export interface PluginProp {
    /** Attribute name on the element, e.g. 'label', 'count', 'variant'. */
    name: string
    type: PluginPropType
    /** Row label; defaults to `name`. */
    label?: string
    /** Value used when the attribute is absent. Also the "unset" comparison value. */
    default?: string | number | boolean
    /** Required for type 'enum'. */
    options?: { value: string; label?: string }[]
    /** Rendered, but not editable (e.g. values resolved at construction time). */
    readonly?: boolean
    /** Never surfaced in the panel at all. */
    hidden?: boolean
    /** Tooltip / helper text for the row. */
    hint?: string
}

export interface EditorPlugin {
    name: string
    label: string
    tagName: string
    icon?: () => JSX.Child
    onInsert: (editorRoot: HTMLElement, range: Range) => void
    onRender?: (element: HTMLElement) => void
    toHTML?: (element: HTMLElement) => string
    fromHTML?: (html: string) => HTMLElement

    /** NEW — declarative, typed props for the property panel. */
    props?: PluginProp[]

    /**
     * NEW — called after the panel has written an attribute.
     * Lets a plugin re-render, re-insert, or otherwise react to an edit that its
     * element cannot pick up from an attribute change on its own.
     */
    onPropChange?: (element: HTMLElement, key: string, value: any) => void
}
```

Add a lookup helper next to `getEditorPlugins()`:

```ts
export const getPluginForElement = (el: HTMLElement): EditorPlugin | undefined =>
    $$(registeredPlugins).find(p => p.tagName.toUpperCase() === el.tagName.toUpperCase())
```

Registration example a consumer writes:

```ts
registerEditorPlugin({
    name: 'my-component',
    label: 'My Component',
    tagName: 'my-component',
    onInsert: (root, range) => { /* … */ },
    props: [
        { name: 'title',   type: 'string',  default: '' },
        { name: 'count',   type: 'number',  default: 3 },
        { name: 'compact', type: 'boolean', default: false },
        { name: 'accent',  type: 'color',   default: '#3366ff' },
        { name: 'variant', type: 'enum',    default: 'plain',
          options: [{ value: 'plain' }, { value: 'boxed' }, { value: 'card', label: 'Card' }] },
        { name: 'source',  type: 'string',  readonly: true, hint: 'resolved at insert time' },
    ],
})
```

### 3.2 Schema-aware extract / apply

`src/Editor/PropertyExtractor.ts` — same two exported functions, now consulting the
registry:

```ts
export function extractCustomElementProperties(el: HTMLElement): Record<string, Observable<any>> {
    const props: Record<string, any> = { tagName: el.tagName.toLowerCase() }   // read-only, as today
    const plugin = getPluginForElement(el)
    const declared = new Set<string>()

    for (const p of plugin?.props ?? []) {
        declared.add(p.name)
        if (p.hidden) continue
        const raw = el.getAttribute(p.name)
        props[p.label ?? p.name] = $(coerce(p, raw))     // ← typed runtime value
    }

    // Anything undeclared that is actually on the element stays editable as a string,
    // so a plugin without a schema behaves exactly as it does today.
    for (const attr of Array.from(el.attributes)) {
        if (declared.has(attr.name)) continue
        if (attr.name === 'style' || attr.name === 'class' || attr.name === 'contenteditable') continue
        if (attr.name.startsWith('data-')) continue
        props[attr.name] = $(attr.value)
    }
    return props
}
```

`coerce(prop, raw)` returns the value in the runtime type the Editors registry
duck-types on:

| type      | attribute absent            | attribute present                                   |
| --------- | --------------------------- | --------------------------------------------------- |
| `string`  | `default ?? ''`             | the string                                          |
| `number`  | `default ?? 0`              | `Number(raw)`, `default ?? 0` if `NaN`              |
| `boolean` | `default ?? false`          | `raw !== 'false'` (bare attribute ⇒ `true`)         |
| `color`   | `default ?? '#000000'`      | the string (must stay `#rrggbb` for `ColorEditor`)  |
| `enum`    | `default ?? options[0]`     | the string, with `options` hung off the observable  |

So `number` → `NumberField`, `boolean` → `Checkbox`, `#rrggbb` → colour picker, all with
**zero changes** to `Editors.ts` or the existing editors. Only `enum` needs a new editor
(§3.4).

Apply becomes type-directed and can *unset*:

```ts
export function applyCustomElementProperty(el: HTMLElement, key: string, value: any): void {
    const plugin = getPluginForElement(el)
    const spec = plugin?.props?.find(p => (p.label ?? p.name) === key)
    const attr = spec?.name ?? key

    if (spec?.readonly) return

    if (typeof value === 'boolean') {
        value ? el.setAttribute(attr, '') : el.removeAttribute(attr)
    } else if (value === '' || (spec && value === spec.default)) {
        el.removeAttribute(attr)          // back to default ⇒ keep serialized HTML clean
    } else {
        el.setAttribute(attr, String(value))
    }

    plugin?.onPropChange?.(el, attr, value)
}
```

> **Note for whoever implements this:** `PropertyPanel` creates one effect per property
> (`PropertyPanel.tsx:150-172`) and those effects fire once on creation with the current
> value. `applyCustomElementProperty` must therefore be idempotent and must not clobber
> an attribute with a stale default on the *first* run — writing the value that was just
> read back is a no-op, which the table above already satisfies.

### 3.3 Selection affordance for embedded elements

Two changes, both generic:

**(a) Click-to-select in `EditorSurface`** (`src/Editor/Editor.tsx:102`, the component that
owns `[data-editor-root]` at `:418`). Add one capture-phase `pointerdown` listener on the
editor root:

* take `e.composedPath()` (it pierces the block's own shadow root — `e.target` alone is
  retargeted to the host and is useless here);
* find the first entry that is an `HTMLElement`, is inside `[data-editor-root]`, and is
  either a registered plugin `tagName` or a hyphenated non-`wui-` tag;
* clear `data-element-selected` from any previously marked element and set it on this one;
* clicking anywhere in the editor that does not resolve to such an element clears the mark.

Styling: one rule in the editor stylesheet,
`[data-element-selected]{outline:2px solid theme(colors.blue.500);outline-offset:2px}` —
this is the only "selected" affordance authors get today, and it is also what tells them
the Property button now has a target.

**(b) `detectSelectionType()` consults the mark first**, in **both** modes, before the
image/text logic:

```ts
const root = shadow?.querySelector('[data-editor-root]') ?? document.querySelector('[data-editor-root]')
const marked = root?.querySelector('[data-element-selected]') as HTMLElement | null
if (marked) return { type: 'custom', element: marked }
```

and, as a backstop, port the existing shadow-branch ancestor walk (`:71-87`) into the
light-DOM branch so a caret that genuinely lands inside a custom element still reports
`'custom'`.

`PropertyPanel`'s `selectionchange` handler already re-targets the panel when the
detected element changes, and `InfoButton` already calls `detectSelectionType()` on
click — so both paths light up from this one change. `PropertyPanel.tsx:360-378` also
already closes the panel when the target leaves the DOM; the mark should be cleared
there too.

### 3.4 Two small `PropertyForm` fixes

**Empty rows.** Relax the gate at `PropertyRows.tsx:54` to render whenever the value is
not `null`/`undefined` (keeping the `instanceof HTMLElement` exclusion). Today `''` is
dropped; with a declared schema, an unset prop *must* render or it can never be set.
This changes behaviour for existing consumers of `PropertyForm` — grep the repo for
`<PropertyForm` / `wui-property-rows` before merging, and if the blast radius is
uncomfortable, gate it behind a `showEmpty` prop threaded from `PropertyPanel`.

**`EnumEditor`.** New `src/PropertyForm/EnumEditor.tsx`, registered by side-effect import
exactly like the others. Trigger it the way `DropdownEditor` already augments its
observable — hang the metadata off the observable and test for it:

```ts
// extractor: (obs as any).options = spec.options
const renderCondition = (value) => Array.isArray((value as any)?.options)
```

`renderCondition` runs before `StringEditor`'s in registration order **only if it is
registered first** — `PropertyRows` renders *every* editor whose `renderCondition`
passes, so `StringEditor` must also exclude values carrying `.options`, otherwise an
enum renders twice (a `<select>` and a `TextField`).

---

## 4. Suggested order of work

1. **Selection first** (§3.3) — without a target nothing else is observable. Verify:
   insert a plugin element, click it, see the outline, click Property, panel header reads
   *"Element Properties"* and lists the element's current attributes (this already works
   once the selection lands, via the existing untyped extractor).
2. **Schema + extract/apply** (§3.1, §3.2) — verify each of the five types renders the
   expected control and round-trips to the attribute, including unset.
3. **Empty rows + `EnumEditor`** (§3.4).
4. Update `src/Editor/index.ts` exports (`PluginProp`, `PluginPropType`,
   `getPluginForElement`) and the README/demo.

## 5. Build / verification notes

* Consumers load wui from **`dist`** (`@woby/wui/dist/index.es.js`, often over Vite's
  `/@fs/`), and `/@fs/`-served packages do **not** hot-reload. Every change here needs
  `pnpm run build:only` in this package **and** a restart of the consuming dev server
  before it is visible.
* The panel is noisy by design — `[PropertyPanel] …` and `[applyImageProperty] …`
  `console.log`s trace the selection/extraction/apply cycle. Keep them while working;
  they are the fastest way to see which of the three stages dropped an edit.
* `PropertyPanel` deliberately does **not** auto-open on selection (`:276`, `:343`) —
  selecting an element must not pop the panel; the user opens it with `InfoButton`.
  Preserve that.
* Watch the re-extraction guard at `PropertyPanel.tsx:109-118` (`lastExtractedTarget`):
  re-extracting the same element mid-edit resurrects stale DOM values and disposes the
  pending per-property sync effects. Any new code path that sets `propertyTarget` must
  set `lastExtractedTarget` alongside it, as the existing pointerdown path does at `:274`.

## 6. Files this touches

| File                                   | Change                                                        |
| -------------------------------------- | ------------------------------------------------------------- |
| `src/Editor/EditorPlugin.ts`           | `PluginProp` / `PluginPropType`, `props`, `onPropChange`, `getPluginForElement` |
| `src/Editor/PropertyExtractor.ts`      | schema-aware extract/apply, `data-element-selected` first, light-DOM custom walk |
| `src/Editor/Editor.tsx`                | click-to-select in `EditorSurface`, selected-outline style     |
| `src/Editor/PropertyPanel.tsx`         | clear the mark when the target is dropped                      |
| `src/PropertyForm/PropertyRows.tsx`    | render rows for empty values                                   |
| `src/PropertyForm/EnumEditor.tsx`      | **new** — plain `<select>` editor                              |
| `src/PropertyForm/StringEditor.tsx`    | skip values carrying `.options`                                |
| `src/Editor/index.ts`                  | export the new types/helper                                    |

Rough size: ~120 lines net.

# 🧩 IconButton API

The **IconButton API** defines the props, behavior, and internal logic of the icon-only action button.  
This component accepts SVGs, images, or custom visual elements.

---

# 📦 Import

### TSX

```tsx
import { IconButton } from "./IconButton";
```

### Web Component

```ts
import "./IconButton"; // registers <wui-icon-button>
```

---

# 🧭 Props Overview

| Prop              | Type                          | Default | Description                                                  |
| ----------------- | ----------------------------- | ------- | ------------------------------------------------------------ |
| **src**           | string or Observable<string>  | `""`    | Icon as an image URL, `data:` URI or inline SVG data URI. Takes precedence over `children` (HtmlString) |
| **children**      | JSX.Child                     | `null`  | Icon element (SVG, IMG, etc.). Fallback used when `src` is empty |
| **disabled**      | boolean or Observable<boolean> | `false` | Disables click interaction (HtmlBoolean)                     |
| **cls**           | string                        | `""`    | Primary class; overrides default base classes when set (HtmlClass) |
| **class**         | string                        | `""`    | Additional classes appended to the component                 |
| **...otherProps** | ButtonHTMLAttributes          | —       | Full support for all native `<button>` props, incl. `onClick` |

---

# 🎨 Styling Logic

The base class applied:

```
inline-flex items-center justify-center relative box-border
bg-transparent cursor-pointer select-none align-middle appearance-none
no-underline text-center flex-[0_0_auto] text-2xl overflow-visible
text-[rgba(0,0,0,0.54)] transition-[background-color] duration ease-in-out
delay-[0ms] m-0 p-2 rounded-[50%] border-0 [outline:0px] duration-[0.3s]
hover:bg-[#dde0dd]
```

### Icon Handling

```
svg → 1em width/height, fill-current
img → 1em width/height
```

---

# 🚫 Disabled Logic

When `disabled === true`:

```
disabled:bg-transparent
disabled:text-[rgba(0,0,0,0.26)]
disabled:pointer-events-none
disabled:cursor-default
disabled:[&_svg]:fill-[rgba(0,0,0,0.26)]
```

Effectively:

- Button fully deactivated
- Icon muted
- No click events

---

# ⚙️ Rendering Structure

Final output:

```tsx
<button
  disabled={disabled}
  class={[() => $$(cls) ? $$(cls) : baseClass, cn]}
  {...otherProps}
>
  {() => {
    const s = $$(src)
    if (s) return <img src={s} class="w-[1em] h-[1em] object-contain pointer-events-none" alt="icon" />
    return children
  }}
</button>
```

The icon is resolved reactively, `src` first:

- **`src` set** → an `<img>` sized to `1em`, `object-contain`, and
  `pointer-events-none` so the press always lands on the button, not the icon.
- **`src` empty** → `children` are inserted directly, allowing any icon node.

`src` deliberately wins over `children` rather than the other way round. woby's
`customElement()` always hands the component a `<slot>` as `children`, so inside
a registered `<wui-icon-button>` a children-first test is *always* taken and
`src` would be dead code. Keeping `children` as the fallback means existing
`<wui-icon-button><svg/></wui-icon-button>` markup is unaffected, setting `src`
replaces that icon, and removing the attribute brings the slotted icon back.

`cls` overrides the base class entirely when set; `class` (aliased as `cn`)
appends on top.

---

# 🖼️ Setting the icon from the rich text editor

`<wui-icon-button>` is registered as an editor plugin with an **Icon** row in the
property panel (`src/Editor/WuiPlugins.ts`). The row's `Edit…` action calls
`editImageAttr(el, 'src')`, which opens `<wui-image-editor>` against a proxy
`<img>` and writes the result back to the element's `src` attribute on apply.

From that dialog the icon can be replaced by URL, by file picker, or by dropping
an image on the panel, and it can be cropped and zoomed. SVG and animated GIF are
embedded as-is — `NO_RASTER` in `src/Editor/ImageSource.ts` keeps them out of the
canvas bake path, so an SVG icon stays a vector rather than being flattened to
pixels.

This works the same for a `<wui-icon-button>` nested inside `<wui-badge>`:
selecting the inner button binds the panel to it, and the badge's own content and
position are untouched.

---

# 🧪 Usage Examples

### TSX

```tsx
<IconButton>
  <svg viewBox="0 0 24 24">...</svg>
</IconButton>
```

### HTML

```html
<wui-icon-button>
  <svg viewBox="0 0 24 24">...</svg>
</wui-icon-button>
```

### From `src`

```tsx
<IconButton src="/icons/info.svg" />
```

```html
<wui-icon-button src="/icons/info.svg"></wui-icon-button>
```

### Inline SVG as a `data:` URI

```html
<wui-icon-button
  src='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230ea5e9"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3C/svg%3E'
></wui-icon-button>
```

### `src` replacing a slotted icon

```html
<!-- renders the data URI, not the <svg>; remove src and the <svg> comes back -->
<wui-icon-button src="/icons/check.svg">
  <svg viewBox="0 0 24 24">...</svg>
</wui-icon-button>
```

### Disabled

```tsx
<IconButton disabled>
  <img src="/icon.svg" />
</IconButton>
```

---

# ♿ Accessibility

- Renders as a semantic `<button>` → keyboard activatable
- `disabled` removes keyboard focus
- Add `aria-label="Action"` for icon-only buttons to help screen readers
- Supports all ARIA attributes via `...otherProps`

---

# 📝 Summary

IconButton provides:

- A compact, circular action control
- Support for any icon type (SVG, IMG), slotted or via `src`
- A reactive `src` prop the editor's property panel can drive, vectors kept vectors
- Full styling override via `cls` (override) and `class` (append)
- Native button semantics and accessibility
- Clean disabled state handling
- TSX and Web Component compatibility
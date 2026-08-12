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
| **children**      | JSX.Child                     | `null`  | Icon element (SVG, IMG, etc.)                                |
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
  {children}
</button>
```

Children are inserted directly, allowing any icon node. `cls` overrides the base class entirely when set; `class` (aliased as `cn`) appends on top.

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
- Support for any icon type (SVG, IMG)
- Full styling override via `cls` (override) and `class` (append)
- Native button semantics and accessibility
- Clean disabled state handling
- TSX and Web Component compatibility
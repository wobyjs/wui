# 🧩 IconButton API

The **IconButton API** defines the props, behavior, and internal logic of the icon-only action button.  
This component accepts SVGs, images, objects, or custom visual elements.

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

| Prop              | Type                  | Default     | Description                                   |
| ----------------- | --------------------- | ----------- | --------------------------------------------- |
| **children**      | JSX.Child             | `null`      | Icon element (SVG, IMG, OBJECT, etc.)         |
| **cls**           | string                | `""`        | Additional CSS classes merged with base style |
| **disabled**      | boolean or Observable | `false`     | Disables click interaction                    |
| **onClick**       | function              | `undefined` | Click handler                                 |
| **...otherProps** | ButtonHTMLAttributes  | —           | Full support for all native `<button>` props  |

---

# 🎨 Styling Logic

The base class applied:

```
inline-flex items-center justify-center
cursor-pointer select-none
bg-transparent rounded-[50%]
p-2 text-[rgba(0,0,0,0.54)]
transition-[background-color] ease-in-out
hover:bg-[#dde0dd]
```

### Icon Handling

```
svg → 1em size, fill-current
img → 1em size
object → inherits size
```

---

# 🚫 Disabled Logic

When `disabled === true`:

```
disabled:bg-transparent
disabled:text-[rgba(0,0,0,0.26)]
disabled:[&_svg]:fill-[rgba(0,0,0,0.26)]
disabled:pointer-events-none
```

Effectively:

- Button fully deactivated
- Icon muted
- No click events

---

# ⚙️ Rendering Structure

Final output:

```tsx
<button disabled={disabled} class={[baseClass, cls]} {...otherProps}>
  {children}
</button>
```

Children are inserted directly, allowing any icon node.

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
- Support for any icon type (SVG, IMG, OBJECT)
- Full styling override via `cls`
- Native button semantics and accessibility
- Clean disabled state handling
- TSX and Web Component compatibility

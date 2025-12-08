# 🧩 Fab API

The **Fab (Floating Action Button) API** describes the props, variant system, rendering logic, and styling rules for the component.  
It supports high-emphasis actions and both circular and extended layouts.

---

# 📦 Import

### TSX

```tsx
import { Fab } from "./Fab";
```

### Web Component

```ts
import "./Fab"; // registers <wui-fab>
```

---

# 🧭 Props Overview

| Prop              | Type                               | Default  | Description                 |
| ----------------- | ---------------------------------- | -------- | --------------------------- |
| **children**      | JSX.Child                          | `""`     | Icon, text, or both         |
| **type**          | `"pill" \| "circular" \| "custom"` | `"pill"` | Visual variant              |
| **disabled**      | boolean or observable              | `false`  | Disables interaction        |
| **cls**           | string                             | `""`     | Additional/override classes |
| **...otherProps** | HTML button attributes             | —        | Any standard button props   |

---

# 🎨 Variant Logic

### 1. **circular**

- Standard FAB style (large, round)
- Blue background
- Large shadow
- Hover darkening
- Fixed width/height (w-14 h-14)

### 2. **pill (default)**

- Extended FAB style
- Rounded capsule shape
- Blue background
- Larger text
- Supports icon + text layouts

### 3. **custom**

- No built-in styling
- Developer controls all visuals using `cls`

Variant styles are mapped by:

```ts
variantStyle = {
  circular: "...",
  pill: "...",
  custom: "",
};
```

---

# ⚙️ Rendering Logic

The core element is a `<button>`:

```tsx
<button class={[variantStyle[type], cls]} disabled={disabled} {...otherProps}>
  <div class="flex items-center">{children}</div>
</button>
```

Key behaviors:

- `cls` merges last → strongest override
- Disabled buttons prevent interaction
- Children are wrapped for consistent icon/text alignment

---

# 🧪 Usage Examples

### Default

```tsx
<Fab>Default FAB</Fab>
```

### Circular

```tsx
<Fab type="circular">❤️</Fab>
```

### Disabled

```tsx
<Fab disabled>Disabled</Fab>
```

### Custom

```tsx
<Fab type="circular" cls="!bg-green-500 !text-white">
  👍
</Fab>
```

---

# ♿ Accessibility

- Renders using a native `<button>` → keyboard accessible
- Supports all ARIA attributes via `...otherProps`
- Disabled state prevents tab focus and click events

---

# 📝 Summary

The Fab component provides:

- High-emphasis CTA actions
- Circular and pill variants
- Click handling & disabled states
- Full styling control via `cls`
- Works in TSX and Web Component usage
- Ideal for floating UI triggers and add-action patterns

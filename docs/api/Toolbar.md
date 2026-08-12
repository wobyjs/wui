# 🧩 Toolbar API

This API describes the core behavior, props, and internal rendering logic of the Toolbar component.

---

# 📦 Import

### TSX
```tsx
import { Toolbar } from './Toolbar'
```

### Web Component
```ts
import './Toolbar'   // registers <wui-toolbar>
```

---

# 🧭 Props Overview

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **children** | JSX.Child | `null` | Elements rendered inside the toolbar |
| **type** | string | `"default"` | Visual variant (currently only `"default"`) |
| **cls** | string | `""` | Override/extra classes |
| **class** | string | `""` | Append classes |
| **...otherProps** | HTMLAttributes\<div> | — | Passed directly to the root `<div>` |

---

# 🎨 Variant Logic

There is currently one variant:

### **default**
```
relative flex items-center px-4 h-full
```

This establishes baseline layout:

- Horizontal flex container
- Vertical centering (`items-center`)
- Horizontal padding
- Full height relative to its parent

---

# ⚙️ Rendering Structure

Toolbar renders:

```tsx
<div class={[variantStyle[type], cls, class]} {...otherProps}>
    {children}
</div>
```

This means:

- Built-in styles apply first
- `cls` overrides later styles
- `class` appends (plus `cls` and `class` are reactive)
- Children are rendered untouched — Toolbar does not modify or wrap them

---

# 🧩 Behavior Summary

- Pure layout component — no internal logic besides class resolution
- Does not manage click events
- Does not enforce spacing
- Does not alter child structure
- Provides a consistent, responsive alignment container

---

# 🧪 Usage Examples

### Basic
```tsx
<Toolbar>
    <div class="font-bold">App Title</div>
</Toolbar>
```

### With Actions
```tsx
<Toolbar>
    <div class="flex justify-between w-full">
        <span>Title</span>
        <Button>Menu</Button>
    </div>
</Toolbar>
```

### Custom Style
```tsx
<Toolbar cls="bg-blue-600 text-white shadow-lg">
    ...
</Toolbar>
```

### HTML Usage
```html
<wui-toolbar cls="bg-gray-200">
    <div>Toolbar Content</div>
</wui-toolbar>
```

---

# ♿ Accessibility

- Renders a native `<div>`; semantic meaning depends on context
- Add appropriate ARIA roles if used as navigation or application bar
- Fully supports keyboard-accessible children

---

# 📝 Summary

Toolbar provides:

- A clean horizontal layout container
- Responsive flex alignment
- Full styling customization via `cls` and `class`
- Compatible with TSX + Web Component use
- Ideal for headers, navbars, tool panels, and action bars
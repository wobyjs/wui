# 🧩 Checkbox API

The **Checkbox API** defines supported props, behavior, label logic, and rendering rules for the Checkbox component, usable in both TSX and Web Component formats.

---

# 📦 Import

### TSX
```tsx
import { Checkbox } from './Checkbox'
```

### Web Component
```ts
import './Checkbox'  // registers <wui-checkbox>
```

---

# 🧭 Props Overview

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **children** | JSX.Child | `null` | Label content |
| **labelPosition** | `"left" \| "right" \| "top" \| "bottom"` | `"left"` | Position of label relative to checkbox |
| **checked** | boolean or Observable<boolean> | `false` | Checkbox checked state |
| **disabled** | boolean or Observable<boolean> | `false` | Disables the checkbox |
| **id** | string | auto-generated | Unique identifier bound to label |
| **cls** | `JSX.Class` | `""` | Primary class for the wrapper `<div>`; when set it **replaces** the default classes |
| **class** | `JSX.Class` | `""` | Additional classes that patch/extend the resolved classes (never replaces them) |
| **...otherProps** | InputHTMLAttributes | — | All other native checkbox attributes |

---

# ⚙️ Internal Behavior

## Auto-Generated ID
Each checkbox receives:

```ts
id: `checkbox-${random}`
```

This ensures each label is properly bound via `for={id}`.

---

## Label Rendering Logic

Three helper functions determine placement:

### Before checkbox
```tsx
(labelPosition === "left" || labelPosition === "top")
    → render label before input
```

### After checkbox
```tsx
(labelPosition === "right" || labelPosition === "bottom")
    → render label after input
```

### Line breaks
```tsx
(top or bottom)
    → insert <br> before and/or after <input>
```

---

## Input Rendering

```tsx
<input
    id={id}
    type="checkbox"
    checked={checked}
    disabled={disabled}
    {...otherProps}
/>
```

The checkbox is fully controlled by Woby observables or plain booleans.

---

# 🧪 Usage Examples

### TSX
```tsx
<Checkbox labelPosition="right" checked>
    Example Checkbox
</Checkbox>
```

### HTML
```html
<wui-checkbox label-position="right" checked="true">
    Example Checkbox
</wui-checkbox>
```

---

# ♿ Accessibility

- Label is connected using `for={id}` → clicking label toggles checkbox  
- Works with screen readers via native `<input type="checkbox">` semantics  
- `disabled` correctly prevents all interaction  
- Whenever possible, include meaningful label text for clarity  

---

# 📝 Summary

Checkbox provides:

- Four flexible label positions  
- Reactive `checked` / `disabled` behavior  
- Auto-generated IDs for accessible labels  
- Works in both TSX and Web Component environments  
- Fully customizable wrapper via `cls`  
# 🧩 Button Component

The **Button** component is a core interactive element used across the UI.  
It provides consistent styling, multiple emphasis levels, icon support, and accessibility features.  
Buttons can be used in **TSX (Woby JSX)** or as **Web Components (`<wui-button>`)**.

---

# 📌 Component Signature

```tsx
<Button
    type="contained"
    disabled={false}
    cls=""
    onClick={...}
>
    Label
</Button>
```

HTML Custom Element:

```html
<wui-button
    type="contained"
    disabled="false"
    cls=""
    children="Label"
></wui-button>
```

---

# 🎨 Variants Overview

| Variant | Purpose | Visual Style |
|--------|---------|--------------|
| **text** | Low-emphasis actions | Transparent, subtle hover |
| **contained** | Primary action | Filled background, strong emphasis |
| **outlined** | Secondary action | Bordered, moderate emphasis |
| **icon** | Icon-only triggers | Circular, compact |

---

# ✨ Text Button

### TSX Example
```tsx
<Button type="text">Text Button</Button>
```

### HTML Example
```html
<wui-button type="text" children="Text Button"></wui-button>
```

---

# ✨ Contained Button (Primary)

### TSX Example
```tsx
<Button type="contained">Continue</Button>
```

### HTML Example
```html
<wui-button type="contained" children="Continue"></wui-button>
```

---

# ✨ Outlined Button

### TSX Example
```tsx
<Button type="outlined">Settings</Button>
```

### HTML Example
```html
<wui-button type="outlined" children="Settings"></wui-button>
```

---

# ✨ Icon Button

### TSX Example
```tsx
<Button type="icon">🔔</Button>
```

### HTML Example
```html
<wui-button type="icon" children="ℹ️"></wui-button>
```

---

# 🚫 Disabled State

### TSX
```tsx
<Button type="contained" disabled>
    Disabled
</Button>
```

### HTML
```html
<wui-button type="contained" disabled="true" children="Disabled"></wui-button>
```

---

# ⚡ Click Handling

```tsx
<Button
    type="contained"
    onClick={() => alert('Clicked!')}
>
    Click Me
</Button>
```

If `checked` is observable, the value toggles *after* the click handler.

---

# 🎨 Custom Styling

Use `cls` for both TSX and HTML.

### TSX
```tsx
<Button
    type="contained"
    cls="m-2 px-3 py-2 !rounded-md !text-red-500 !bg-green-200"
>
    Custom Style
</Button>
```

### HTML
```html
<wui-button
    type="contained"
    cls="!px-3 !py-2 !rounded-md !text-red-500 !bg-green-200"
    children="Custom Button"
></wui-button>
```

---

# 📝 Best Practices

### ✔ Use `contained` for primary actions  
### ✔ Use `outlined` or `text` for secondary actions  
### ✔ Use `icon` when the meaning is visually obvious  
### ✔ Pair icons with tooltips for accessibility  
### ✔ Avoid stacking too many primary buttons  

---

# 🧠 Notes

- Works in both **TSX** and **Web Component** environments  
- Reactive props (`checked`, `disabled`) update automatically  
- Variant system ensures consistent styling across the design system  
- Uses native `<button>` behaviors for accessibility  
- Slot-based rendering ensures consistent HTML output  
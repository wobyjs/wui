# 🧩 IconButton Component

The **IconButton** component is a compact, circular action button designed specifically for icons.  
It supports **SVG**, **IMG**, **OBJECT**, custom classes, hover states, disabled styling, and works in both **TSX** and **Web Component (`<wui-icon-button>`)** usage.

---

# 📌 Component Signature

### TSX
```tsx
<IconButton
    disabled={false}
    cls=""
>
    <svg>...</svg>
</IconButton>
```

### Web Component
```html
<wui-icon-button
    disabled="false"
    cls=""
>
    <svg>...</svg>
</wui-icon-button>
```

---

# ✨ Features

- Icon-only button with circular shape  
- Supports:
  - `<svg>`
  - `<img>`
  - `<object>`
  - Any icon element
- Hover ripple/background effect  
- Disabled styling with reduced opacity & removed events  
- Full style override via `cls`  
- Works as TSX component or Web Component  

---

# 🎨 Base Styling

IconButton comes with:

- Circular dimensions  
- Medium padding (`p-2`)  
- Subtle hover background (`hover:bg-[#dde0dd]`)  
- Icon auto-scaling via CSS:
  - `svg` → `1em` size + `fill-current`
  - `img` → `1em`
  - `object` → inherits space  

Disabled state:

- Greyed-out icon  
- No pointer events  
- No hover effects  

---

# 🖼️ Icon Types Supported

## SVG Icon
```tsx
<IconButton>
    <svg width="24" height="24">...</svg>
</IconButton>
```

## Image Icon
```tsx
<IconButton>
    <img src="/icons/info.svg" width="24" height="24" />
</IconButton>
```

## Object Icon
```tsx
<IconButton>
    <object data="/svg/info.svg" width="24" height="24"></object>
</IconButton>
```

---

# 🏷️ Basic Usage

### TSX
```tsx
<IconButton>
    <svg viewBox="0 0 24 24">
        <path d="..." />
    </svg>
</IconButton>
```

### HTML
```html
<wui-icon-button>
    <svg viewBox="0 0 24 24">
        <path d="..." />
    </svg>
</wui-icon-button>
```

---

# 🚫 Disabled IconButton

### TSX
```tsx
<IconButton disabled>
    <svg viewBox="0 0 24 24">...</svg>
</IconButton>
```

### HTML
```html
<wui-icon-button disabled="true">
    <svg viewBox="0 0 24 24">...</svg>
</wui-icon-button>
```

Disabled removes interactions and applies muted icon styling.

---

# 🎨 Custom Styling with `cls`

### Blue Background
```tsx
<IconButton cls="!bg-blue-500 !text-white hover:!bg-blue-600">
    <svg>...</svg>
</IconButton>
```

### Rounded Square Style
```tsx
<IconButton cls="!rounded-lg !p-3 !shadow-md">
    <svg>...</svg>
</IconButton>
```

### HTML Example
```html
<wui-icon-button cls="m-2 p-2 bg-blue-500 text-white rounded-full">
    <svg>...</svg>
</wui-icon-button>
```

---

# 🛎️ Click Handler

```tsx
<IconButton onClick={() => alert('Icon clicked!')}>
    <svg>...</svg>
</IconButton>
```

---

# 🧠 Notes

- IconButton renders a native `<button>` for accessibility.  
- Icon scaling is automatic via CSS selector rules (`&_svg`, `&_img`).  
- Disabled state blocks pointer events and keyboard activation.  
- Default styling mimics Material UI icon buttons.  
- Use `cls` to fully override or extend default look.  
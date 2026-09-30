# 🧩 Avatar Component

The **Avatar** component displays a user image, initials, or custom content inside a shaped container.  
It supports multiple **shapes**, **sizes**, **image rendering**, and works in both **TSX** and **Web Component (`<wui-avatar>`)** modes.  
:contentReference[oaicite:0]{index=0}

---

# 📌 Component Signature

### TSX
```tsx
<Avatar
    src={null}
    alt="Avatar"
    size="md"
    type="circular"
    cls=""
>
    A
</Avatar>
```

### Web Component
```html
<wui-avatar
    src=""
    alt="Avatar"
    size="md"
    type="circular"
    cls=""
>
    A
</wui-avatar>
```

---

# ✨ Features

- Supports **image avatar**, **initials**, or **custom JSX**
- Multiple shape variants: **circular**, **rounded**, **square**
- Four responsive sizes: **xs**, **sm**, **md**, **lg**
- Works with **TSX children** or **HTML inner content**
- Automatically renders an `<img>` when `src` is provided  
- Custom styling through `cls`
- Provides graceful fallback initials when image is missing

---

# 🎨 Variants Overview

| Variant | Visual Style |
|--------|--------------|
| **circular** | Fully rounded, profile-style |
| **rounded** | Rounded corners (xl radius) |
| **square** | Slightly rounded rectangle |

---

# 📏 Size Guide

| Size | Class | Example use |
|------|--------|-------------|
| **xs** | 24×24px | compact UI, chips |
| **sm** | 32×32px | sidebars, lists |
| **md** | 40×40px | default avatar |
| **lg** | 48×48px | profile screens |

(Size classes come from `sizeStyle` in implementation.)  
:contentReference[oaicite:1]{index=1}

---

# 🖼️ Default Avatar

### TSX
```tsx
<Avatar />
```

### HTML
```html
<wui-avatar></wui-avatar>
```

Uses:
- `size="md"`
- `type="circular"`
- grey background fallback  
:contentReference[oaicite:2]{index=2}

---

# 🖼️ Image Avatar

### TSX
```tsx
<Avatar src="profile.png" alt="User" />
```

### HTML
```html
<wui-avatar src="profile.png" alt="User"></wui-avatar>
```

Internally renders:
```tsx
<img src={src} alt={alt} class="w-full h-full object-cover" />
```  
:contentReference[oaicite:3]{index=3}

---

# 🔤 Initials / Text Avatar

### TSX
```tsx
<Avatar>H</Avatar>
```

### HTML
```html
<wui-avatar>H</wui-avatar>
```

If no children are provided, the component automatically uses the **first letter of `alt`**.

---

# ⚪ Shape Variants

## Circular
```tsx
<Avatar type="circular">C</Avatar>
```

## Rounded
```tsx
<Avatar type="rounded">R</Avatar>
```

## Square
```tsx
<Avatar type="square">S</Avatar>
```

All variants shown in test file.  
:contentReference[oaicite:4]{index=4}

---

# 📐 Size Variants

### XS
```tsx
<Avatar size="xs">xs</Avatar>
```

### SM
```tsx
<Avatar size="sm">sm</Avatar>
```

### MD
```tsx
<Avatar size="md">md</Avatar>
```

### LG
```tsx
<Avatar size="lg">lg</Avatar>
```

---

# 🎨 Custom Styling (cls)

You may override or expand styles with the `cls` prop.

### TSX
```tsx
<Avatar
    cls="w-6 h-6 bg-[var(--wui-purple-500)] text-[var(--wui-white)] font-bold"
>
    CU
</Avatar>
```

### HTML
```html
<wui-avatar
    cls="w-6 h-6 bg-[var(--wui-purple-500)] text-[var(--wui-white)] font-bold"
>
    CU
</wui-avatar>
```

From test file example.  
:contentReference[oaicite:5]{index=5}

---

# 🧠 Notes

- Renders as a `<div>` wrapper around content or `<img>`
- Uses `useMemo` to compute the correct child (image or initials)  
- Shape and size styles come from `variantStyle` & `sizeStyle`  
- Works identically in TSX and Web Component modes  
- Safe fallback if image fails or `src` is null
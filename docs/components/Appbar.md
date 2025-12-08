# 🧩 Appbar Component

The **Appbar** component is a high-level layout element used to display navigation, branding, or actions at the **top or bottom** of the viewport.  
It supports different **positions** (`fixed`, `sticky`, `static`) and **edges** (`top`, `bottom`), and can be used in both **TSX** and **Web Component (`<wui-appbar>`)** modes.

---

# 📌 Component Signature

### TSX

```tsx
<Appbar
    type="default"
    position="fixed"
    edge="top"
    cls=""
>
    <!-- content -->
</Appbar>
```

### Web Component

```html
<wui-appbar
    type="default"
    position="fixed"
    edge="top"
    cls=""
>
    <!-- content -->
</wui-appbar>
```

---

# ✨ Features

- Material-style elevated top bar
- Supports **fixed**, **sticky**, and **static** positioning
- Can be anchored to **top** or **bottom** edge
- Works in **TSX** and as a **custom element**
- Customizable via the `cls` class override

---

# 🎨 Variant & Position Overview

### Visual Variant

| Prop value | Description |
|-----------|-------------|
| **"default"** | Primary blue appbar with elevation and white text |

### Position + Edge

| Position | Edge options | Typical usage |
|----------|--------------|---------------|
| **fixed** | `top` / `bottom` | Persistent appbar that stays on screen |
| **sticky** | `top` / `bottom` | Appbar that sticks when scrolled to its edge |
| **static** | — (`top`/`bottom` ignored) | Appbar that flows with normal document layout |

---

# 📍 Default Appbar (Fixed Top)

A typical primary application header.

### TSX

```tsx
<Appbar>
    <div class="flex items-center h-12 px-4">
        <span class="font-medium">My Application</span>
    </div>
</Appbar>
```

*(Defaults: `type="default"`, `position="fixed"`, `edge="top"`.)*

### HTML

```html
<wui-appbar>
    <div class="flex items-center h-12 px-4">
        <span class="font-medium">My Application</span>
    </div>
</wui-appbar>
```

---

# 📍 Sticky Appbar

Sticks to the edge when scrolled into view.

### TSX

```tsx
<Appbar position="sticky">
    <div class="flex items-center h-12 px-4">
        <span class="font-medium">Sticky Appbar</span>
    </div>
</Appbar>
```

### HTML

```html
<wui-appbar position="sticky">
    <div class="flex items-center h-12 px-4">
        <span class="font-medium">Sticky Appbar</span>
    </div>
</wui-appbar>
```

---

# 📍 Static Appbar

Flows with the document layout (no fixed or sticky behavior).

### TSX

```tsx
<Appbar position="static">
    <div class="flex items-center h-12 px-4">
        <span class="font-medium">Static Appbar</span>
    </div>
</Appbar>
```

### HTML

```html
<wui-appbar position="static">
    <div class="flex items-center h-12 px-4">
        <span class="font-medium">Static Appbar</span>
    </div>
</wui-appbar>
```

---

# 📍 Bottom Appbar

Attach the bar to the bottom edge of the viewport.

### TSX

```tsx
<Appbar position="fixed" edge="bottom">
    <div class="flex items-center h-12 px-4 justify-between">
        <span>Bottom Appbar</span>
        <button class="text-sm underline">Action</button>
    </div>
</Appbar>
```

### HTML

```html
<wui-appbar position="fixed" edge="bottom">
    <div class="flex items-center h-12 px-4 justify-between">
        <span>Bottom Appbar</span>
        <button class="text-sm underline">Action</button>
    </div>
</wui-appbar>
```

---

# 🎨 Custom Styling

Use the `cls` prop to add or override classes on the appbar.

### TSX

```tsx
<Appbar
    cls="bg-black/80 text-white"
>
    <div class="flex items-center h-12 px-4">
        <span class="font-medium">Custom Appbar</span>
    </div>
</Appbar>
```

### HTML

```html
<wui-appbar
    cls="bg-black/80 text-white"
>
    <div class="flex items-center h-12 px-4">
        <span class="font-medium">Custom Appbar</span>
    </div>
</wui-appbar>
```

---

# 📝 Best Practices

- Use **fixed top** appbars for primary navigation and branding.
- Use **sticky** appbars within scrollable containers (e.g., panels or cards).
- Use **bottom** appbars for mobile-style navigation or frequently used actions.
- Keep appbar content concise: brand, page title, key actions.
- Avoid stacking multiple high-elevation appbars on the same screen.

---

# 🧠 Notes

- The Appbar renders as a semantic `<header>` element.
- It combines a **variant style** with the computed **position/edge** class and any custom `cls`.
- When `position="static"`, the `edge` value has no visual impact.
- The visual preset currently uses a Material-like blue background and shadow.

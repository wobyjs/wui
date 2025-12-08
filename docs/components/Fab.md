# 🧩 Fab Component

The **Fab (Floating Action Button)** is a high-emphasis action button used for primary actions, quick-add actions, or floating contextual operations.  
It supports **circular** and **pill (extended)** variants, full customization via `cls`, disabling, icons, and text content.  
Works seamlessly in **TSX** and **Web Component (`<wui-fab>`)** formats.

---

# 📌 Component Signature

### TSX
```tsx
<Fab
    type="pill"
    disabled={false}
    cls=""
>
    Action
</Fab>
```

### Web Component
```html
<wui-fab
    type="pill"
    disabled="false"
    cls=""
>
    Action
</wui-fab>
```

---

# ✨ Features

- Two variants:
  - **circular** → icon-only FAB  
  - **pill** (default) → extended FAB with text
- Supports **icons**, **text**, or both  
- Fully **customizable** through `cls`
- **Disabled** state support
- Smooth hover transitions
- Works in TSX and HTML

---

# 🎨 Variants Overview

| Variant | Description |
|--------|-------------|
| **circular** | Round FAB for icons (e.g., add, edit, notification) |
| **pill (default)** | Extended FAB with capsule shape and text content |
| **custom** | Styleless variant for full manual styling (empty style preset) |

---

# 🟦 Circular FAB

### TSX
```tsx
<Fab type="circular">❤️</Fab>
```

### HTML
```html
<wui-fab type="circular">❤️</wui-fab>
```

Best used for icon-only actions such as add, favorite, or notifications.

---

# 🟪 Pill / Extended FAB

### TSX
```tsx
<Fab type="pill">➕ Add Item</Fab>
```

### HTML
```html
<wui-fab type="pill">➕ Add Item</wui-fab>
```

Great for actions that require descriptive text.

---

# 🚫 Disabled FAB

### TSX
```tsx
<Fab disabled>Disabled</Fab>
```

### HTML
```html
<wui-fab disabled="true">Disabled</wui-fab>
```

Disabled FABs cannot be interacted with and will not fire click events.

---

# 🎨 Custom Styling Using `cls`

### Customize background & text
```tsx
<Fab type="circular" cls="!bg-green-500 !text-white">
    👍
</Fab>
```

### Custom pill FAB
```tsx
<Fab
    type="pill"
    cls="!px-8 !py-4 !bg-purple-600 !rounded-full !shadow-lg hover:!bg-purple-700"
>
    Custom Pill
</Fab>
```

---

# 🛎️ Clickable FAB (Interaction)

```tsx
<Fab type="circular" onClick={() => alert('FAB Clicked!')}>
    🔔
</Fab>
```

---

# 🧩 Layout & Positioning

FABs are often positioned at:

- Bottom-right corner  
- Bottom-left corner  
- Floating above UI sections  
- Docked inside cards/panels  

Use external containers or absolute positioning CSS to place the FAB as needed.

Example:

```html
<div class="fixed bottom-6 right-6">
    <wui-fab type="circular">➕</wui-fab>
</div>
```

---

# 🧠 Notes

- The base FAB uses strong shadows and rounded shapes inspired by Material Design.
- `cls` merges with variant styles, allowing total customization.
- FAB renders a `<button>` for accessibility and keyboard interaction.
- Default variant is **pill**, not circular.
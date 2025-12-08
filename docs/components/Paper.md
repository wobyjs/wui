# 🧩 Paper Component

The **Paper** component provides an elevated surface with configurable shadow depth (elevation).  
It is commonly used for cards, sheets, dialogs, containers, and UI surfaces that require depth and separation from the background.

---

# 📌 Component Signature

### TSX
```tsx
<Paper
    elevation={1}
    cls=""
>
    Content here
</Paper>
```

### Web Component
```html
<wui-paper
    elevation="1"
    cls=""
>
    Content here
</wui-paper>
```

---

# ✨ Features

- Multiple elevation levels (shadows)  
- Smooth transition between elevations  
- Customizable appearance via `cls`  
- Fully reactive (supports observable elevation values)  
- Works in TSX + Web Component usage  
- Automatically falls back to elevation `0` if an invalid value is supplied  

---

# 🎨 Elevation Levels

The Paper component supports the following elevation values:

| Elevation | Shadow |
|-----------|---------|
| **0** | No shadow |
| **1** | Small shadow (`shadow-sm`) |
| **2** | Base shadow (`shadow`) |
| **3** | Medium shadow (`shadow-md`) |
| **4** | Large shadow (`shadow-lg`) |
| **6** | XL shadow (`shadow-xl`) |
| **8**+ | 2XL shadow (`shadow-2xl`) |

If elevation is *not listed*, it defaults to the class for **0**.

---

# 🏷️ Basic Usage

## Default (elevation = 1)
```tsx
<Paper cls="p-4">
    <h3 class="font-bold">Default Paper</h3>
    <p class="text-sm">Uses elevation 1 by default.</p>
</Paper>
```

## HTML
```html
<wui-paper cls="p-4">
    <h3 class="font-bold">Default Paper</h3>
    <p class="text-sm">Uses elevation 1 by default.</p>
</wui-paper>
```

---

# 🎚 No Elevation

```tsx
<Paper elevation={0} cls="p-4">
    <h3>No Elevation</h3>
</Paper>
```

---

# ☁ High Elevation (16)

```tsx
<Paper elevation={16} cls="p-4">
    <h3 class="font-bold">High Elevation</h3>
    <p>This has a very deep shadow.</p>
</Paper>
```

---

# 🎨 Custom Styling with `cls`

You may override background, border, padding, etc.

```tsx
<Paper
    elevation={4}
    cls="p-6 bg-yellow-50 border-2 border-yellow-200"
>
    <h3 class="font-bold text-yellow-800">Custom Styled Paper</h3>
    <p class="text-sm">Mix elevation with custom colors.</p>
</Paper>
```

---

# 📦 Usage in Layouts

Paper pairs well with:

- Cards  
- Modals / Dialogs  
- Navigation drawers  
- Sections on dashboards  
- Forms and panels  

Example:

```tsx
<div class="space-y-4">
    <Paper elevation={2} cls="p-4">Section A</Paper>
    <Paper elevation={0} cls="p-4">Section B</Paper>
</div>
```

---

# 🧠 Notes

- Root element is always a `<div>`.  
- Shadows use Tailwind-like utility classes for consistency.  
- Elevation updates smoothly due to `transition-shadow`.  
- `cls` is merged last → your custom styles always win.  
- Children render directly inside the Paper container.
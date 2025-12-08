# 🧩 Toolbar Component

The **Toolbar** component provides a horizontal layout container commonly used at the top of pages, panels, dialogs, or application frames.  
It helps organize actions, navigation items, text, and icons into a clean, structured row.

Toolbar works in both **TSX** and **Web Component (`<wui-toolbar>`)** formats.

---

# 📌 Component Signature

### TSX
```tsx
<Toolbar cls="" type="default">
    ...content...
</Toolbar>
```

### Web Component
```html
<wui-toolbar cls="" type="default">
    ...content...
</wui-toolbar>
```

---

# ✨ Features

- Horizontal flex layout  
- Vertical centering of children  
- Supports custom `cls` styling  
- Fully responsive — content adapts to available space  
- Great for:
  - Page headers
  - App bars
  - Navigation rows
  - Editor toolbars
  - Action bars
- Simple & minimal: only controls layout, not styling of children  
- Shadow DOM isolation in Web Component mode

---

# 🎨 Default Styling

The default Toolbar style:

```
relative
flex
items-center
px-4
h-full
```

This gives:

- Horizontal alignment  
- Centered vertical alignment  
- Padding on the left/right  
- Full-height usage inside an AppBar or container  

---

# 🧭 Basic Usage

### TSX
```tsx
<Toolbar>
    <div class="flex items-center justify-between w-full">
        <div class="text-lg font-bold">App Title</div>
        <div class="flex space-x-2">
            <Button type="outlined">Menu</Button>
            <Button type="outlined">Settings</Button>
        </div>
    </div>
</Toolbar>
```

### HTML
```html
<wui-toolbar>
    <div class="flex items-center justify-between w-full">
        <div class="text-lg font-bold">App Title</div>
        <div class="flex space-x-2">
            <wui-button type="outlined">Menu</wui-button>
            <wui-button type="outlined">Settings</wui-button>
        </div>
    </div>
</wui-toolbar>
```

---

# 🎨 Custom Styling with `cls`

```tsx
<Toolbar cls="bg-blue-600 text-white shadow-lg">
    <div class="flex items-center justify-between w-full">
        <div class="text-xl font-bold">My Application</div>
        <div class="flex space-x-4">
            <Button type="outlined" cls="px-4 py-2 !border-white">Home</Button>
            <Button type="outlined" cls="px-4 py-2 !border-white">Profile</Button>
            <Button type="outlined" cls="px-4 py-2 !border-white">Settings</Button>
        </div>
    </div>
</Toolbar>
```

### HTML
```html
<wui-toolbar cls="bg-blue-600 text-white shadow-lg">
    ...
</wui-toolbar>
```

---

# 🧩 Toolbar with Icons

```tsx
<Toolbar cls="bg-gray-800 text-white">
    <div class="flex items-center space-x-4">
        <button class="p-2 hover:bg-gray-700 rounded-full">
            <svg ...></svg>
        </button>
        <button class="p-2 hover:bg-gray-700 rounded-full">
            <svg ...></svg>
        </button>
        <button class="p-2 hover:bg-gray-700 rounded-full">
            <svg ...></svg>
        </button>
    </div>
</Toolbar>
```

Great for action panels, media editors, or dashboards.

---

# 🧭 Navigation Toolbar Example

```tsx
<Toolbar cls="bg-white border-b border-gray-200">
    <div class="flex items-center justify-between w-full">
        <div class="flex space-x-8">
            <a class="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium">Dashboard</a>
            <a class="py-4 px-1 text-gray-500 hover:text-gray-700">Team</a>
            <a class="py-4 px-1 text-gray-500 hover:text-gray-700">Projects</a>
        </div>
        <button class="bg-blue-500 text-white px-4 py-2 rounded">New Item</button>
    </div>
</Toolbar>
```

---

# 🧩 Compact Toolbar

```tsx
<Toolbar cls="bg-gray-100 p-2">
    <div class="flex items-center justify-between">
        <div class="text-sm font-medium">Document Editor</div>
        <div class="flex space-x-1 px-2">
            <Button cls="!px-2 !py-1 text-xs bg-white border rounded">Save</Button>
            <Button cls="!px-2 !py-1 text-xs bg-white border rounded">Undo</Button>
            <Button cls="!px-2 !py-1 text-xs bg-white border rounded">Redo</Button>
        </div>
    </div>
</Toolbar>
```

Great for editors and small tools panels.

---

# 🧠 Notes

- Toolbar **never** enforces spacing between children — full control is in your layout.  
- Add backgrounds, borders, shadows, or padding using `cls`.  
- Works cleanly inside AppBar, Card, Paper, or standalone containers.  
- Perfect flex container for aligning actions and titles.
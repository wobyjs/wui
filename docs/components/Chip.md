# 🧩 Chip Component

The **Chip** component is a compact UI element used to display information, tags, filters, selectable tokens, and labels.  
It supports avatars, deletion behavior, custom styling, controlled/observable visibility, and works in both **TSX** and **Web Component (`<wui-chip>`)** modes.

---

# 📌 Component Signature

### TSX
```tsx
<Chip
    deletable={false}
    visible={true}
    cls=""
    onDelete={(e) => ...}
>
    Chip Content
</Chip>
```

### Web Component
```html
<wui-chip
    deletable="false"
    visible="true"
    cls=""
>
    Chip Content
</wui-chip>
```

---

# ✨ Features

- Optional **delete icon** with auto-hide behavior  
- Accepts **avatar + text + trailing delete icon**  
- Built-in **visibility control**, supports both boolean + observable  
- Fully customizable via `cls`  
- Works in TSX and HTML  
- Accessible: keyboard-focusable (`tabIndex=0`, `role="button"`)  
- Automatically prevents event propagation when clicking delete icon  

---

# 🎨 Visual Structure

A Chip typically consists of:

```
[ avatar ]  [ label text ]  [ delete icon ]
```

All wrapped within a rounded pill container.

---

# 🏷️ Basic Usage

### TSX
```tsx
<Chip>Default Chip</Chip>
```

### HTML
```html
<wui-chip>Default Chip</wui-chip>
```

---

# 👁️ Visibility Control

The `visible` prop determines whether the chip renders at all.

### Always visible
```tsx
<Chip visible={true}>Visible Chip</Chip>
```

### Hidden
```tsx
<Chip visible={false}>Hidden Chip</Chip>
```

### Observable visibility
```tsx
const show = $(true)
<Chip visible={show}>Reactive Visibility</Chip>
```

If visible is `false`, **the chip does not render**.

---

# ❌ Deletable Chips

Enable a delete icon by setting `deletable={true}`.

### TSX
```tsx
<Chip deletable>Deletable Chip (click X)</Chip>
```

### HTML
```html
<wui-chip deletable="true">Deletable Chip</wui-chip>
```

### Delete behavior

When the delete icon is clicked:

1. `onDelete(e)` is called (if provided)
2. The chip hides itself by setting internal visibility to `false`

---

# 🛠️ Custom Delete Behavior

```tsx
<Chip
    deletable
    onDelete={() => alert('Chip deleted')}
>
    Custom Delete Action
</Chip>
```

This overrides the default hide behavior *after* your handler is executed.

---

# 🧑‍🎤 Chip with Avatar

### TSX
```tsx
<Chip>
    <Avatar cls="!w-6 !h-6 bg-blue-500 text-white mx-1">S</Avatar>
    <span>Chip with Avatar</span>
</Chip>
```

### HTML
```html
<wui-chip>
    <wui-avatar cls="!w-6 !h-6 bg-blue-500 text-white mx-1">S</wui-avatar>
    <span>Chip with Avatar</span>
</wui-chip>
```

---

# 🧑‍🎤 Avatar + Delete

```tsx
<Chip deletable>
    <Avatar cls="!w-6 !h-6 bg-purple-500 text-white mx-1">A</Avatar>
    <span>Avatar & Delete</span>
</Chip>
```

---

# 🎨 Custom Styling with `cls`

```tsx
<Chip cls="!bg-red-100 !text-blue-800">
    Custom Styled Chip
</Chip>
```

HTML:
```html
<wui-chip cls="!bg-red-100 !text-blue-800">
    Custom Styled Chip
</wui-chip>
```

---

# 🎨 Colored Chips (Examples)

```tsx
<Chip cls="bg-green-100 text-green-800">Success</Chip>
<Chip cls="bg-red-100 text-red-800">Error</Chip>
<Chip cls="bg-yellow-100 text-yellow-800">Warning</Chip>
<Chip cls="bg-blue-100 text-blue-800">Info</Chip>
```

---

# 🧩 Multiple Chips

```tsx
<div class="flex gap-2 flex-wrap">
    <Chip deletable>Tag 1</Chip>
    <Chip deletable>Tag 2</Chip>
    <Chip deletable>Tag 3</Chip>
</div>
```

---

# 🔄 Dynamic Chip List (Common Use Case)

```tsx
const items = $(['React', 'Vue'])

{() => $$(items).map(label => (
    <Chip deletable onDelete={() =>
        items($$(items).filter(v => v !== label))
    }>
        {label}
    </Chip>
))}
```

---

# 🧠 Notes

- Chip renders nothing (`null`) when `visible` is false or becomes false  
- Works with both boolean and observable values for visibility/deletable  
- Delete icon click stops event bubbling  
- `cls` applies to the root `<div>` for full styling control  
- Children are rendered inside the main label container  
- `role="button"` + `tabIndex=0` improve keyboard accessibility  
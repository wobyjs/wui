# 🧩 Collapse Component

The **Collapse** component expands or hides its content using a smooth height transition.  
It supports **open/closed state**, **background styling**, **reactive observables**, and **custom styling** through `cls`.  
It works in both **TSX (`<Collapse>`)** and **Web Component (`<wui-collapse>`)** modes.

---

# 📌 Component Signature

### TSX
```tsx
<Collapse
    open={true}
    background={true}
    cls=""
>
    Content goes here
</Collapse>
```

### Web Component
```html
<wui-collapse
    open="true"
    background="true"
    cls=""
>
    Content goes here
</wui-collapse>
```

---

# ✨ Features

- Smooth expand & collapse height animation  
- Supports **boolean** or **observable** `open` state  
- Optional **background shading** (`background={true | false}`)  
- Content unmounts when closed (not hidden — *it does not render*)  
- Full override styling via `cls`  
- Works with any JSX content: text, lists, cards, complex layout  
- Works in TSX and Web Component modes the same way  

---

# 🎛️ Open / Closed Behavior

### ✔ `open={true}`  
Content is rendered and visible.

### ✔ `open={false}`  
Component returns `null`.  
The content **does not render**, improving performance.

### ✔ Reactive open state
```tsx
const isOpen = $(true)

<Collapse open={isOpen}>
    <div class="p-4 bg-green-100">
        Reactive content
    </div>
</Collapse>
```

Toggling the observable automatically shows/hides the Collapse.

---

# 🎨 Background Behavior

The `background` prop controls whether the collapse wrapper shows a grey background:

| Prop | Result |
|------|---------|
| `background={true}` | Grey background (`bg-[#ccc]`) |
| `background={false}` | Transparent (no background) |

### Example
```tsx
<Collapse background={false}>
    <div class="p-4 border border-gray-300">No BG</div>
</Collapse>
```

---

# 🧱 Base Styling

The Collapse wrapper always includes:

```
overflow-hidden
transition-height duration-200 ease-in-out
```

This gives it:

- Smooth height animation  
- Automatic collapse/expand transitions  

---

# 🏷️ Basic Examples

## Default (open)
```tsx
<Collapse>
    <div class="p-4 bg-gray-100">
        Default open collapse content.
    </div>
</Collapse>
```

### HTML
```html
<wui-collapse>
    <div class="p-4 bg-gray-100">Default open collapse content.</div>
</wui-collapse>
```

---

## Explicitly Open
```tsx
<Collapse open={true}>
    <div class="p-4 bg-blue-100">Content is visible.</div>
</Collapse>
```

---

## Explicitly Closed
```tsx
<Collapse open={false}>
    <div class="p-4 bg-red-100">This will not render.</div>
</Collapse>
```

---

# 🔄 Interactive Toggle Example

```tsx
const isOpen = $(true)

<div class="space-y-4">
    <Button onClick={() => isOpen(!$$(isOpen))}>
        Toggle ({() => $$(isOpen) ? 'Open' : 'Closed'})
    </Button>

    <Collapse open={isOpen}>
        <div class="p-4 bg-green-100">
            This collapse toggles when you click the button.
        </div>
    </Collapse>
</div>
```

---

# 🎨 Custom Styling (cls)

You can override or extend background, borders, spacing, colors:

### TSX
```tsx
<Collapse
    cls="!bg-yellow-100 !border-2 !border-purple-500"
    open={true}
>
    <div class="p-4">
        Custom styled collapse
    </div>
</Collapse>
```

### HTML
```html
<wui-collapse
    cls="!bg-yellow-100 !border-2 !border-purple-500"
    open="true"
>
    <div class="p-4">Custom styled collapse</div>
</wui-collapse>
```

---

# 🧩 Complex Content Example

```tsx
<Collapse open={true}>
    <div class="p-4 bg-green-100">
        <h4 class="font-bold">Complex Content</h4>
        <p>This collapse contains rich structured content:</p>
        <ul class="list-disc pl-5">
            <li>List item 1</li>
            <li>List item 2</li>
        </ul>
    </div>
</Collapse>
```

---

# 🧠 Notes

- Closed collapse returns `null` — the element is removed from layout  
- Great for menus, accordions, details sections, filter panels  
- Accepts all HTML attributes via `...otherProps`  
- `cls` overrides *after* built-in classes  
- Background is optional and disabled using `background={false}`  
# 🧩 Chip API

The **Chip API** documents all props, behaviors, rendering logic, and event interactions for the Chip component.  
The Chip supports avatars, delete behavior, visibility control, and content projection.

---

# 📦 Import

### TSX
```tsx
import { Chip } from './Chip'
```

### Web Component
```ts
import './Chip'   // registers <wui-chip>
```

---

# 🧭 Props Overview

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **children** | JSX.Child | `null` | Main chip content (text, avatar, etc.) |
| **avatar** | JSX.Child | `null` | (Reserved) optional avatar slot |
| **cls** | string | `""` | Custom classes applied to wrapper |
| **deletable** | boolean \| Observable | `false` | Enables delete icon |
| **visible** | boolean \| Observable | `true` | Controls chip visibility (auto-hide supported) |
| **deleteIcon** | JSX.Element | `<DeleteIcon />` | Custom delete icon element |
| **onDelete** | `(e) => void` | `undefined` | Called when delete icon is clicked |
| **...otherProps** | HTMLAttributes\<div> | — | Additional container attributes |

---

# ⚙️ Behavior

## 1. Visibility Logic

Chip supports both boolean and observable `visible`:

```ts
const internalVisible = isObservable(visible)
    ? visible
    : $(visible ?? true)
```

If `visible` is `false`, Chip returns:

```tsx
return null
```

---

## 2. Delete Icon + Delete Behavior

```tsx
if (deletable === true)
    return <div class="chip-delete-icon" onClick={...}><DeleteIcon/></div>
```

### When clicked:

1. `onDelete(e)` is triggered (if provided)
2. Chip automatically hides itself:

```ts
internalVisible(false)
```

Unless user overrides visibility externally.

---

## 3. Base Styles

The main wrapper combines:

- Flex layout  
- Rounded pill shape  
- Soft grey background  
- Subtle transition  

Internal code defines:

```ts
const baseClass =
 "relative cursor-pointer select-none max-w-full inline-flex items-center h-8
  text-[0.8125rem] bg-[rgba(0,0,0,0.08)]
  rounded-2xl p-0 m-0 transition-all"
```

---

## 4. Content Structure

Chip content is wrapped inside:

```tsx
<span class="overflow-hidden text-ellipsis whitespace-nowrap px-3 py-1 inline-flex items-center gap-1">
    {children}
</span>
```

---

## 5. Preventing Propagation

Clicking delete icon executes:

```ts
e.stopPropagation()
```

Prevents triggering the chip's main click handler.

---

# 🧪 Usage Examples

### TSX
```tsx
<Chip deletable onDelete={() => console.log("Deleted")}>
    Removable Chip
</Chip>
```

### Web Component
```html
<wui-chip deletable="true">Removable Chip</wui-chip>
```

---

# ♿ Accessibility

- Chip root has `tabIndex="0"` making it focusable  
- `role="button"` communicates interactivity  
- Delete icon is keyboard reachable via tab sequence  
- Use clear text or avatar for meaningful content  

---

# 📝 Summary

Chip provides:

- A compact, elegant, tag-like UI element  
- Built-in delete support with auto-hide  
- Reactive visibility  
- Avatar integration  
- Full TSX + Web Component support  
- Complete styling override control  
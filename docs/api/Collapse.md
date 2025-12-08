# 🧩 Collapse API

The **Collapse API** describes all props, behaviors, and internal rules for the collapsible container.  
This component provides animated expand/collapse behavior, optional background shading, and reactive support.

---

# 📦 Import

### TSX
```tsx
import { Collapse } from './Collapse'
```

### Web Component
```ts
import './Collapse'   // registers <wui-collapse>
```

---

# 🧭 Props Overview

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **children** | JSX.Child | `null` | Content shown inside collapse |
| **open** | boolean \| Observable<boolean> | `true` | Controls visibility; closed = not rendered |
| **background** | boolean \| Observable<boolean> | `true` | Enables grey background shading |
| **cls** | string | `""` | Additional classes merged with base styles |
| **...otherProps** | HTMLAttributes\<div> | — | All other HTML `<div>` attributes |

---

# ⚙️ Internal Behavior

## 1. Internal Open State

```ts
const internalOpen = isObservable(open) ? open : $(open ?? true)
```

If `open` is not observable, Collapse wraps it with an observable.

---

## 2. Rendering Logic

Collapse only renders when `open === true`:

```tsx
return internalOpen() === false ? null : renderCollapse()
```

This means:

✔ Content is completely unmounted when closed  
✔ Improves performance  
✔ Layout remains clean  

---

## 3. Background Logic

```ts
isBackground = () => background === true ? "bg-[#ccc]" : ""
```

- `background={true}` → grey shaded container  
- `background={false}` → transparent  

---

## 4. Wrapper Structure

```tsx
<div class={[baseClass, isBackground(), cls].join(" ")}>
    <div class="h-fit">
        {children}
    </div>
</div>
```

Where:

```
baseClass = "overflow-hidden transition-height duration-200 ease-in-out"
```

---

# 🎛️ Animation Behavior

Collapse uses:

```
overflow-hidden
transition-height duration-200 ease-in-out
```

This gives the component:

- Smooth expand/collapse animation  
- Automatic size adjustment  
- Support for dynamic, complex child content  

---

# 🧪 Usage Examples

### TSX
```tsx
<Collapse open={false}>Hidden initially</Collapse>
```

### HTML
```html
<wui-collapse open="false">Hidden initially</wui-collapse>
```

---

# ♿ Accessibility

- Collapse content is fully removed from the DOM when closed, preventing screen reader confusion  
- Use external controls (buttons, toggles) with clear labels for best UX  
- Use logical headings inside the collapse body for semantic structure  

---

# 📝 Summary

The Collapse component offers:

- Clean expand/collapse logic  
- Background control  
- Full styling override capability  
- Reactive open/close state  
- Unmounted content when closed  
- Smooth, built-in height animation  
- Identical behavior in TSX and Web Component usage  
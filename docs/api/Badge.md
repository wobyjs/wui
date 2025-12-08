# 🧩 Avatar API

The **Avatar API** describes all props, behaviors, and internal logic for the Avatar component.  
It applies to both **TSX usage** and **Web Component usage (`<wui-avatar>`)**.  
:contentReference[oaicite:6]{index=6}

---

# 📦 Import

### TSX
```tsx
import { Avatar } from './Avatar'
```

### Web Component
```ts
import './Avatar'   // registers <wui-avatar>
```

---

# 🧭 Props Overview

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **src** | `string \| null` (observable allowed) | `null` | Image source. If provided, an `<img>` is rendered. |
| **alt** | `string` | `"Avatar"` | Alternative text for image and fallback initial. |
| **children** | `JSX.Child` | `null` | Custom content or initials. |
| **size** | `"xs" \| "sm" \| "md" \| "lg"` | `"md"` | Controls the avatar’s dimensions & font size. |
| **type** | `"circular" \| "rounded" \| "square"` | `"circular"` | Shape variant. |
| **cls** | `ObservableMaybe<string>` | `""` | Additional class names merged into the base. |
| **...otherProps** | `HTMLAttributes<HTMLDivElement>` | — | Any additional `<div>` attributes. |

---

# ⚙️ Internal Logic

## 🔄 Child Rendering Logic

Avatar decides what to render in this order:

1. **If `src` exists → render `<img>`**
2. **Else if `children` exists → render children**
3. **Else use first letter of `alt`**

Implementation:  
```tsx
const child = useMemo(() => {
    const s = $$(srcObs)
    const a = $$(altObs)
    if (s) return <img src={s} alt={a} class="w-full h-full object-cover" />
    return children ?? (a ? a[0] : "")
})
```
:contentReference[oaicite:7]{index=7}

---

# 🎨 Styling Logic

## Variant classes

```ts
const variantStyle = {
    circular: BASE_CLASS + " rounded-full",
    rounded:  BASE_CLASS + " rounded-xl",
    square:   BASE_CLASS + " rounded-md",
}
```

`BASE_CLASS` includes:  
```
relative flex items-center justify-center
select-none leading-none overflow-hidden shrink-0 m-0 bg-[#bdbdbd]
```

---

## Size classes

```ts
const sizeStyle = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
}
```

---

# 🧩 Render Structure

Final HTML output:

```tsx
<div
    class={[
        () => variantStyle[$$(variant)],
        () => sizeStyle[$$(size)],
        cls
    ]}
    {...otherProps}
>
    {child}
</div>
```

:contentReference[oaicite:8]{index=8}

---

# 🧪 Usage Examples

## TSX
```tsx
<Avatar type="square" size="sm">R</Avatar>
```

## HTML
```html
<wui-avatar type="square" size="sm">R</wui-avatar>
```

---

# ♿ Accessibility

- When using `src`, `<img alt="...">` ensures proper screen reader support
- Initials fallback gives meaningful content even without images
- Uses semantic `<div>` container; ensure context provides role when needed

---

# 📝 Summary

Avatar provides:

- **Flexible content**: image / initials / custom JSX  
- **Configurable shape & size**  
- **Full TSX + Web Component support**  
- **Fallback logic for broken images**  
- **Customizable styling** with `cls`  
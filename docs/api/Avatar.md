# 🧩 Avatar API

The **Avatar API** describes all props, behaviors, and internal logic for the Avatar component.  
It applies to both **TSX usage** and **Web Component usage (`<wui-avatar>`)**.

---

# 📦 Import

### TSX

```tsx
import { Avatar } from "./Avatar";
```

### Web Component

```ts
import "./Avatar"; // registers <wui-avatar>
```

---

# 🧭 Props Overview

| Prop              | Type                                  | Default      | Description                                        |
| ----------------- | ------------------------------------- | ------------ | -------------------------------------------------- |
| **src**           | `string \| null` (observable allowed) | `null`       | Image source. If provided, an `<img>` is rendered. |
| **alt**           | `string`                              | `"Avatar"`   | Alternative text for image and fallback initial.   |
| **children**      | `JSX.Child`                           | `null`       | Custom content or initials.                        |
| **size**          | `"xs" \| "sm" \| "md" \| "lg"`        | `"md"`       | Controls dimensions and font size.                 |
| **type**          | `"circular" \| "rounded" \| "square"` | `"circular"` | Shape variant.                                     |
| **cls**           | `ObservableMaybe<string>`             | `""`         | Additional class names merged into the base.       |
| **...otherProps** | `HTMLAttributes<HTMLDivElement>`      | —            | Additional DOM attributes.                         |

---

# ⚙️ Internal Logic

## 🔄 Child Rendering Logic

Avatar computes what to render using the following order:

1. **If `src` exists → render `<img>`**
2. **Else if `children` exists → use children**
3. **Else → render the first letter of `alt`**

### Implementation

```tsx
const child = useMemo(() => {
  const s = $$(srcObs);
  const a = $$(altObs);
  if (s) {
    return <img src={s} alt={a} class="w-full h-full object-cover" />;
  }
  return children ?? (a ? a[0] : "");
});
```

---

# 🎨 Styling Logic

## Variant Classes

```ts
const variantStyle = {
  circular: BASE_CLASS + " rounded-full",
  rounded: BASE_CLASS + " rounded-xl",
  square: BASE_CLASS + " rounded-md",
};
```

### `BASE_CLASS` contains:

```
relative flex items-center justify-center
select-none leading-none overflow-hidden shrink-0 m-0 bg-[#bdbdbd]
```

---

## Size Classes

```ts
const sizeStyle = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
};
```

---

# 🧩 Render Structure

Final DOM structure:

```tsx
<div
    class={[
        () => variantStyle[$$(variant)],
        () => sizeStyle[$$(size)],
        cls
    ]}
    {.otherProps}
>
    {child}
</div>
```

---

# 🧪 Usage Examples

## TSX

```tsx
<Avatar type="square" size="sm">
  R
</Avatar>
```

## HTML

```html
<wui-avatar type="square" size="sm">R</wui-avatar>
```

---

# ♿ Accessibility

- Uses `<img alt="...">` when displaying images
- Initial fallback provides meaningful content
- Container is a `<div>`; add `role` when needed for semantics

---

# 📝 Summary

The Avatar component provides:

- **Flexible content:** image / initials / custom JSX
- **Shape variants:** circular, rounded, square
- **Full TSX + Web Component support**
- **Fallback logic** for broken/missing images
- **Customizable styling** through `cls`

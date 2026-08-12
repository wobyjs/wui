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
| **src**           | `string \| null` (observable allowed) | `""`         | Image source. If provided, an `<img>` is rendered. |
| **alt**           | `string`                              | `"Avatar"`   | Alternative text for image and fallback initial.   |
| **children**      | `JSX.Child`                           | `null`       | Custom content or initials.                        |
| **size**          | `"xs" \| "sm" \| "md" \| "lg"`        | `"md"`       | Controls dimensions and font size.                 |
| **type**          | `"circular" \| "rounded" \| "square" \| "custom"` | `"circular"` | Shape variant. `"custom"` applies no shape class. |
| **cls**           | `JSX.Class`                           | `""`         | **Overrides** the default `BASE_CLASS` when non-empty. |
| **class**         | `JSX.Class`                           | `""`         | **Appends** additional classes on top of the resolved class. |
| **...otherProps** | `HTMLAttributes<HTMLDivElement>`      | —            | Additional DOM attributes.                         |

> **Class override contract:** `cls` is the **primary class** — when non-empty it fully replaces the built-in `BASE_CLASS`. `class` (aliased `cn`) **appends/pads** extra classes on top of whatever was resolved.

---

# ⚙️ Internal Logic

## 🔄 Child Rendering Logic

Avatar computes what to render using the following order:

1. **If `src` exists → render `<img>`** (with `onerror` to hide the img on load failure)
2. **Else if `children` exists → use children**
3. **Else → render the first letter of `alt`**

### Implementation

```tsx
const child = useMemo(() => {
  const s = $$(srcObs);
  const a = $$(altObs);
  if (s) {
    return <img src={s} alt={a} class="w-full h-full object-cover" onerror={e => { (e.target as HTMLImageElement).style.display = 'none' }} />;
  }
  return children ?? (a ? a[0] : "");
});
```

When an image fails to load, the `onerror` handler hides the broken image element (`style.display = 'none'`), preventing the broken image icon from showing.

---

# 🎨 Styling Logic

## Base Class

```ts
const BASE_CLASS =
    "relative flex items-center justify-center align-middle select-none leading-none overflow-hidden shrink-0 m-0 bg-[rgb(189,189,189)] text-white"
```

## Variant Classes

```ts
const variantStyle = {
    circular: "rounded-full",
    rounded: "rounded-xl",
    square: "rounded-md",
}
```

Note: `"custom"` variant string is not keyed in `variantStyle` — it produces `undefined` which results in no shape class.

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
        $$(cls) != '' ? cls : BASE_CLASS,
        cn,
    ]}
    {...otherProps}
>
    {child}
</div>
```

The class composition order is:
1. Shape variant class (e.g. `rounded-full`)
2. Size class (e.g. `w-10 h-10 text-base`)
3. `BASE_CLASS` (when `cls` is empty) or `cls` (when non-empty, overriding the base)
4. `class` / `cn` (appended on top of everything)

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
- **Shape variants:** circular, rounded, square, custom
- **Broken image handling:** hides on error to avoid broken icon
- **Full TSX + Web Component support**
- **Fallback logic** for broken/missing images
- **Customizable styling** through `cls` (override) and `class` (append)
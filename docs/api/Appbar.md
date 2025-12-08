# 🧩 Appbar API

The **Appbar API** defines the props, positioning rules, and styling behavior of the `Appbar` component.  
It applies to both **TSX usage (`<Appbar>`)** and **Web Component usage (`<wui-appbar>`)**.

---

# 📦 Import

### TSX

```tsx
import { Appbar } from './Appbar'
```

### Web Component

```ts
import './Appbar'   // registers <wui-appbar>
```

---

# 🧭 Props Overview

The Appbar component is built on top of a `<header>` element and forwards standard HTML attributes.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **type** | `"default"` | `"default"` | Visual variant key for the appbar style preset. Currently only `"default"` is provided. |
| **position** | `"fixed" \| "sticky" \| "static"` | `"fixed"` | Controls how the appbar is positioned in the layout. |
| **edge** | `"top" \| "bottom"` | `"top"` | When `position` is `fixed` or `sticky`, determines which edge the bar attaches to. |
| **cls** | `ObservableMaybe<string>` | `""` | Additional class string merged into the root header element. |
| **children** | `ObservableMaybe<JSX.Child>` | `""` | Content rendered inside the appbar (title, actions, navigation, etc.). |
| **...otherProps** | `JSX.HTMLAttributes<HTMLElement>` | — | Any other valid `<header>` HTML attributes (e.g., `id`, `style`, `data-*`). |

---

# ⚙️ Internal Behavior

## Position Calculation

The component uses `position` and `edge` to compute the final positioning class:

```ts
const getPositionClass = () => {
    const pos = position()
    const edgePos = edge()

    let positionClass = ""
    switch (pos) {
        case "fixed":
            positionClass = "fixed"
            break
        case "sticky":
            positionClass = "sticky"
            break
        case "static":
            positionClass = "static"
            break
        default:
            positionClass = "fixed"
    }

    if (pos !== "static") {
        const edgeClass = edgePos === "top" ? "top-0" : "bottom-0"
        return `${positionClass} ${edgeClass}`
    }

    return positionClass
}
```

- For `fixed` or `sticky`, the resulting class is e.g. `"fixed top-0"` or `"sticky bottom-0"`.
- For `static`, the result is simply `"static"` and the `edge` value is ignored.

---

## Variant Styling

The base style preset is defined through `variantStyle`:

```ts
const variantStyle = {
    default:
        "shadow-[rgba(0,0,0,0.2)_0px_2px_4px_-1px,rgba(0,0,0,0.14)_0px_4px_5px_0px,rgba(0,0,0,0.12)_0px_1px_10px_0px] " +
        "[@media_screen]:flex [@media_screen]:flex-col w-full box-border shrink-0 " +
        "z-[1100] bg-[rgb(25,118,210)] text-white left-auto " +
        "[transition:box-shadow_300ms_cubic-bezier(0.4,0,0.2,1)0ms] ",
}
```

The final `class` for the `<header>` element is a combination of:

1. The `variantStyle[type]` preset  
2. The `getPositionClass()` result  
3. The user-provided `cls` value  

---

# 🧩 Rendered Element

Internally, Appbar renders a `<header>`:

```tsx
<header
    class={[
        () => variantStyle[$$(variant)],
        () => getPositionClass(),
        cls
    ]}
    {...otherProps}
>
    {children}
</header>
```

For Web Components, it is registered as:

```ts
customElement("wui-appbar", Appbar)
```

and typed under `wui-appbar` in `JSX.IntrinsicElements`.

---

# 🧪 Usage Examples

## TSX

```tsx
<Appbar position="fixed" edge="top">
    <div class="flex items-center h-12 px-4">
        <span class="font-medium">Dashboard</span>
    </div>
</Appbar>
```

## HTML

```html
<wui-appbar position="fixed" edge="top">
    <div class="flex items-center h-12 px-4">
        <span class="font-medium">Dashboard</span>
    </div>
</wui-appbar>
```

---

# ♿ Accessibility

- Renders as a semantic `<header>` element.
- Works well when placed at the **top of the document** to represent site or app-level navigation.
- Combine with `nav` landmarks inside the header for rich accessibility structure.
- When using **icon-only actions** in the appbar, provide labels via `aria-label` or tooltips.

---

# 📝 Summary

The Appbar component:

- Provides a **single styled appbar preset** for fast layout scaffolding.
- Supports **fixed**, **sticky**, and **static** positioning with **top** or **bottom** anchoring.
- Accepts **custom classes** via `cls` for flexible theming.
- Is available in both **TSX** and **Web Component** form with consistent behavior.
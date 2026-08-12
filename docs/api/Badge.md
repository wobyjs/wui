# 🏷️ Badge API

The **Badge API** describes the props, rendering logic, and styling behavior of the Badge component.  
A Badge visually annotates another element with a small indicator (count, dot, status, etc.).

---

# 📦 Import

### TSX

```tsx
import { Badge } from "./Badge";
```

### Web Component

```ts
import "./Badge"; // registers <wui-badge>
```

---

# 🧭 Props Overview

| Prop              | Type                                   | Default                     | Description                                      |
| ----------------- | -------------------------------------- | --------------------------- | ------------------------------------------------ |
| **badgeContent**  | `JSX.Child` (observable allowed)       | `null`                      | The text/number/content displayed inside the badge. |
| **badgeClass**    | `JSX.Class`                            | `"bg-[rgb(156,39,176)]"`    | Extra classes for the badge span (default is a purple background). |
| **vertical**      | `"top" \| "bottom"`                    | `"top"`                     | Vertical position of the badge.                  |
| **horizontal**    | `"left" \| "right"`                    | `"right"`                   | Horizontal position of the badge.                |
| **cls**           | `JSX.Class`                            | `""`                        | **Overrides** the default wrapper classes when non-empty. |
| **class**         | `JSX.Class`                            | `""`                        | **Appends** additional classes onto the wrapper. |
| **children**      | `JSX.Child`                            | `null`                      | The element the badge attaches to.               |
| **...otherProps** | HTML attributes                        | —                           | Additional HTML attributes (incl. `badgeContent` / `badge-content` / `children` for custom elements). |

> **Class override contract:** `cls` is the **primary class** for the wrapper — when non-empty it replaces the default `relative inline-flex align-middle shrink-0 m-4`. `class` (aliased `cn`) **appends** classes on top. `badgeClass` is separate and always applied to the badge span itself.

---

# ⚙️ Internal Logic

## 🧩 badgeContent Resolution

The component first normalizes `badgeContent` from various sources (important for custom-element usage where attributes arrive via `otherProps`):

```ts
useEffect(() => {
    const contentValue = $$(badgeContent)
    if (contentValue) return

    if (otherProps['badgeContent']) {
        badgeContent(otherProps['badgeContent'])
    } else if (otherProps['badge-content']) {
        badgeContent(otherProps['badge-content'])
    } else if (otherProps['children']) {
        badgeContent(otherProps['children'])
    }
})
```

The lookup order is: existing `badgeContent` prop → `badgeContent` attribute → `badge-content` attribute → `children`.

## 🎭 Visibility (isEmpty)

The badge is hidden when there is no content:

```ts
const isEmpty = () => !$$(badgeContent)
```

The visibility class toggles between `hidden` (empty) and the sized pill `min-w-[20px] h-5 rounded-[10px] px-1` (has content).

## 📐 Positioning & Transform

- **Placement:** `top-0`/`bottom-0` + `left-0`/`right-0` based on `vertical`/`horizontal`.
- **Transform origin:** the badge is offset by a half-translate so it straddles the corner. The origin flips based on corner (`origin-[100%_0%]`, `origin-[0%_0%]`, `origin-[100%_100%]`, `origin-[0%_100%]`).

---

# 🧩 Render Structure

```tsx
<div>
  <span class={[() => ($$(cls) ? $$(cls) : "relative inline-flex align-middle shrink-0 m-4"), cn]} {...otherProps}>
    <span class={[
        "flex place-content-center items-center absolute box-border font-medium text-xs leading-none z-[1] text-white scale-100 [flex-flow:wrap] [transition:transform_225ms_cubic-bezier(0.4,0,0.2,1)0ms]",
        visibilityClass(),
        transformOriginClass(),
        positionClasses(),
        badgeClass,
    ]}>
        {() => $$(badgeContent)}
    </span>
    {children}
  </span>
</div>
```

Note the outer `<div>` wrapper plus an inner `<span>` wrapper. The badge span is absolutely positioned relative to the wrapper span.

---

# 🧪 Usage Examples

## TSX

```tsx
<Badge badgeContent={5}>
    <Avatar>J</Avatar>
</Badge>
```

### Custom position & color

```tsx
<Badge badgeContent="9" vertical="bottom" horizontal="left">
    <Avatar>M</Avatar>
</Badge>
```

## HTML

```html
<wui-badge badge-content="9">
  <button>Messages</button>
</wui-badge>
```

---

# ♿ Accessibility

- Badge content is readable by screen readers
- Badges should include an accessible label via `aria-label` when used for status

---

# 📝 Summary

Badge provides:

- **Counts & indicators** via `badgeContent`
- **Position control** via `vertical` / `horizontal`
- **Custom badge styling** via `badgeClass`
- **TSX and Web Component support**
- **Flexible styling & layout**
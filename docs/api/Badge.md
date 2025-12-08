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

| Prop              | Type                                                          | Default                     | Description                                      |
| ----------------- | ------------------------------------------------------------- | --------------------------- | ------------------------------------------------ |
| **content**       | `number \| string \| null`                                    | `null`                      | The text/number displayed inside the badge.      |
| **dot**           | `boolean`                                                     | `false`                     | If true, renders a small dot instead of content. |
| **color**         | `"default" \| "primary" \| "success" \| "warning" \| "error"` | `"default"`                 | Badge theme color.                               |
| **cls**           | `string \| ObservableMaybe<string>`                           | `""`                        | Additional classes.                              |
| **children**      | `JSX.Child`                                                   | —                           | The element the badge attaches to.               |
| **...otherProps** | —                                                             | Additional HTML attributes. |

---

# ⚙️ Internal Logic

### Display Priority

Badge chooses what to render:

1. **If `dot = true` → render a dot badge**
2. **Else if `content != null` → render a badge with content**
3. **Else → hide badge (unless forced visible)**

### Positioning

Badge wraps children:

```tsx
<div class="relative inline-block">
  {children}
  <span class="absolute top-0 right-0 transform ...">{content}</span>
</div>
```

---

# 🎨 Styling Logic

### Color Variants

```ts
const colorMap = {
  default: "bg-gray-500 text-white",
  primary: "bg-blue-600 text-white",
  success: "bg-green-600 text-white",
  warning: "bg-yellow-500 text-white",
  error: "bg-red-600 text-white",
};
```

### Dot Badge

```html
<div class="w-2 h-2 rounded-full"></div>
```

### Content Badge

```html
<div class="px-2 py-[1px] text-xs rounded-full"></div>
```

---

# 🧩 Render Structure

```tsx
<div class="relative inline-block" {.otherProps}>
    {children}

    {() =>
        dot
            ? <span class={["badge-dot", colorClass, cls]} />
            : content != null && (
                <span class={["badge-content", colorClass, cls]}>
                    {content}
                </span>
            )
    }
</div>
```

---

# 🧪 Usage Examples

## TSX

```tsx
<Badge content={5}>
  <Button>Inbox</Button>
</Badge>
```

### Dot Badge

```tsx
<Badge dot>
  <Avatar>J</Avatar>
</Badge>
```

## HTML

```html
<wui-badge content="9">
  <button>Messages</button>
</wui-badge>
```

---

# ♿ Accessibility

- Badge content is readable by screen readers
- Dot badges should include an accessible label via `aria-label` when used for status

---

# 📝 Summary

Badge provides:

- **Counts & indicators**
- **Dot or content display**
- **Color variants**
- **TSX and Web Component support**
- **Flexible styling & layout**

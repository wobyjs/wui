# 🧩 Card API

The **Card API** defines props, styling logic, elevation behavior, interactive rules, and composition details for the Card system — which includes:  
- `Card`  
- `CardMedia`  
- `CardContent`  
- `CardActions`

---

# 📦 Import

### TSX
```tsx
import { Card, CardMedia, CardContent, CardActions } from './Card'
```

### Web Components
```ts
import './Card'
// Registers:
// <wui-card>, <wui-card-media>, <wui-card-content>, <wui-card-actions>
```

---

# 🧭 Card Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **variant** | `"elevated" \| "outlined" \| "filled"` | `"elevated"` | Determines card style |
| **elevation** | `0 \| 1 \| 2 \| 3 \| 4` | `1` | Shadow intensity |
| **interactive** | `boolean \| Observable<boolean>` | `false` | Enables hover shadow |
| **cls** | `JSX.Class` | `""` | **Overrides** the default base classes when non-empty |
| **class** | `JSX.Class` | `""` | **Appends** additional classes on top of the resolved class |
| **children** | JSX.Child | `null` | Card body |
| **...otherProps** | HTMLAttributes `<div>` | — | Additional `<div>` attributes |

> **Class override contract:** `cls` is the **primary class** — when non-empty it fully replaces the built-in base + variant + interactive classes. `class` (aliased `cn`) **appends/pads** extra classes on top of whatever was resolved.

---

# ⚙️ Variant Logic

```ts
variant === "outlined"
    → "border border-[rgba(0,0,0,0.12)] shadow-none"

variant === "filled"
    → "!bg-gray-50" + elevation shadow

variant === "elevated"
    → elevation shadow only
```

---

# ⚙️ Elevation Logic

```ts
0 → shadow-none
1 → shadow-md
2 → shadow-lg
3 → shadow-xl
4 → shadow-2xl
```

---

# ⚙️ Interactive Logic

```ts
interactive == true
    → "cursor-pointer hover:shadow-[rgba(0,0,0,0.2)_0px_4px_5px_-2px,rgba(0,0,0,0.14)_0px_7px_10px_1px,rgba(0,0,0,0.12)_0px_2px_16px_1px]"
```

Useful for clickable cards.

---

# 🖼️ CardMedia Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **src** | string | `""` | Background image URL (`background-image: url(...)`) |
| **alt** | string | `""` | Accessible label (`aria-label` + `title`) |
| **height** | string | `"140px"` | Height of media |
| **position** | string | `"center center"` | CSS background-position |
| **fit** | `"cover" \| "contain" \| "fill" \| "none" \| "scale-down"` | `"cover"` | background-size |
| **cls** | `JSX.Class` | `""` | **Overrides** the default `"block bg-no-repeat"` class when non-empty |
| **class** | `JSX.Class` | `""` | **Appends** additional classes |

Media renders as a `<div>` with `role="img"`, `title`, and `aria-label`:

```tsx
<div
    role="img"
    title={alt()}
    aria-label={alt()}
    class={[() => $$(cls) ? $$(cls) : "block bg-no-repeat", cn]}
    style={() => ({
        height: height(),
        backgroundImage: src() ? `url(${src()})` : "",
        backgroundPosition: position(),
        backgroundSize: fit(),
    })}
/>
```

---

# 📄 CardContent Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **padding** | `JSX.Class` | `"p-4"` | Padding utility class |
| **cls** | `JSX.Class` | `""` | **Overrides** the default padding class when non-empty |
| **class** | `JSX.Class` | `""` | **Appends** additional classes |
| **children** | JSX.Child | `null` | Content |

Renders as:

```tsx
<div class={[() => $$(cls) ? $$(cls) : [$$(padding)].join(" "), cn]}>
    {children}
</div>
```

---

# 🔘 CardActions Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **align** | `"start" \| "center" \| "between" \| "end"` | `"start"` | Horizontal alignment |
| **padding** | `JSX.Class` | `"p-2"` | Padding utility class |
| **cls** | `JSX.Class` | `""` | **Overrides** the default flex alignment classes when non-empty |
| **class** | `JSX.Class` | `""` | **Appends** additional classes |
| **children** | JSX.Child | `null` | Action buttons |

Alignment logic:

```ts
start   → justify-start
center  → justify-center
between → justify-between
end     → justify-end
```

Renders as:

```tsx
<div class={[() => $$(cls) ? $$(cls) : ["flex items-center", justify(), $$(padding)].join(" "), cn]}>
    {children}
</div>
```

---

# 🧪 Example

### TSX
```tsx
<Card variant="outlined" elevation={0}>
    <CardContent>Outlined card</CardContent>
</Card>
```

### HTML
```html
<wui-card variant="outlined" elevation="0">
    <wui-card-content>Outlined card</wui-card-content>
</wui-card>
```

---

# ♿ Accessibility

- `CardMedia` uses `role="img"` + `aria-label` + `title` for screen readers  
- Cards are neutral `<div>` elements; wrap in `<article>` or `<section>` for richer semantics  
- Interactive cards should include `tabindex` if they behave like buttons  
- Ensure text contrast meets WCAG when using filled variant  

---

# 📝 Summary

The Card system provides:

- **Composable, structured layout primitives**  
- **Flexible visual variants & elevation**  
- **Hover interactivity**  
- **Powerful media + content + actions pattern**  
- **Full TSX + Web Component compatibility**
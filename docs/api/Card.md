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
| **interactive** | `boolean` | `false` | Enables hover shadow/transform |
| **cls** | string | `""` | Additional classes |
| **children** | JSX.Child | `null` | Card body |
| **...otherProps** | HTMLAttributes `<div>` | — | Additional `<div>` attributes |

---

# ⚙️ Variant Logic

```ts
variant === "outlined"
    → "border shadow-none"

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
interactive === true
    → "cursor-pointer hover:shadow-[...]"
```

Useful for clickable cards.

---

# 🖼️ CardMedia Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **src** | string | `""` | Background image |
| **alt** | string | `""` | Accessible label |
| **height** | string | `"140px"` | Height of media |
| **position** | string | `"center center"` | CSS background-position |
| **fit** | `"cover" \| "contain" \| ..." ` | `"cover"` | Background-size |
| **cls** | string | `""` | Extra classes |

Media container uses:

```tsx
style={{
    height: height(),
    backgroundImage: src() ? `url(${src()})` : "",
    backgroundPosition: position(),
    backgroundSize: fit(),
}}
```

---

# 📄 CardContent Props

| Prop | Type | Default |
|------|------|---------|
| **padding** | string | `"p-4"` |
| **cls** | string | `""` |
| **children** | JSX.Child | content |

Renders as:

```tsx
<div class={[padding(), cls()].join(" ")}>
```

---

# 🔘 CardActions Props

| Prop | Type | Default |
|------|------|---------|
| **align** | `"start" \| "center" \| "between" \| "end"` | `"start"` |
| **padding** | string | `"p-2"` |
| **cls** | string | `""` |

Alignment logic:

```ts
start   → justify-start
center  → justify-center
between → justify-between
end     → justify-end
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

- `CardMedia` uses `role="img"` + `aria-label` for screen readers  
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
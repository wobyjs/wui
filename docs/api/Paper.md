# 🧩 Paper API

The **Paper API** describes all available props, styling behavior, and internal logic behind the Paper component.  
Paper provides a clean, elevated container with configurable shadow depth.

---

# 📦 Import

### TSX
```tsx
import { Paper } from './Paper'
```

### Web Component
```ts
import './Paper'   // registers <wui-paper>
```

---

# 🧭 Props Overview

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **children** | JSX.Child | `null` | Content inside the Paper container |
| **elevation** | number or Observable<number> | `1` | Shadow depth; presets applied via lookup (HtmlNumber) |
| **cls** | string | `""` | Primary class; overrides default base classes when set (HtmlClass) |
| **class** | string | `""` | Additional classes appended to the component |
| **...otherProps** | HTMLAttributes\<div> | — | Passed directly to the wrapper `<div>` |

---

# 🎨 Styling Logic

### Base styling
```txt
bg-white
rounded-lg
transition-shadow duration-300 ease-in-out
```

### Elevation preset mapping
```ts
const elevationClass = useMemo(() => {
  const elev = $$(elevation)
  return preset[elev] ?? preset[0]
})
```

### Mapping:
| Elevation | Class |
|-----------|--------|
| `0` | `shadow-none` |
| `1` | `shadow-sm` |
| `2` | `shadow` |
| `3` | `shadow-md` |
| `4` | `shadow-lg` |
| `6` | `shadow-xl` |
| `8` | `shadow-2xl` |
| `12` | `shadow-2xl` |
| `16` | `shadow-2xl` |
| `24` | `shadow-2xl` |

Invalid numbers (e.g., 5, 7, 15, etc.) automatically fallback to elevation 0.

---

# ⚙️ Rendering Structure

```tsx
<div class={[() => $$(cls) ? $$(cls) : baseClass, elevationClass, cn]} {...otherProps}>
    {children}
</div>
```

Where:

```
baseClass = "bg-white transition-shadow duration-300 ease-in-out rounded-lg "
```

`cls` overrides `baseClass` entirely when set, while `class` (aliased as `cn`) appends on top.

---

# 🧪 Usage Examples

### Default
```tsx
<Paper>Default elevation 1</Paper>
```

### Elevation 0
```tsx
<Paper elevation={0}>Flat panel</Paper>
```

### High elevation
```tsx
<Paper elevation={16}>Very elevated</Paper>
```

### HTML version
```html
<wui-paper elevation="4">Paper in HTML</wui-paper>
```

---

# ♿ Accessibility

- Structural container only; relies on developer’s content for semantics  
- Suitable for wrapping headings, sections, and interactive elements  
- Pure visual enhancement — does not modify keyboard behavior  

---

# 📝 Summary

Paper provides:

- Elevation-based visual depth  
- Smooth shadow transitions  
- Clean white container by default  
- Fully customizable styling via `cls` + `class`  
- TSX + Web Component support  
- Graceful fallback for unsupported elevation values
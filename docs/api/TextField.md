# 🧩 TextField API

This API describes the internal logic, props, reactive behavior, DOM structure, and effect resolution of the TextField component.

---

# 📦 Import

### TSX
```tsx
import { TextField } from './TextField'
```

### Web Component
```ts
import './TextField'   // registers <wui-text-field>
```

---

# 🧭 Props Overview

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **label** | string | `""` | Floating label text |
| **value** | string or Observable | `""` | Input value |
| **placeholder** | string | `""` | Placeholder text |
| **helperText** | string | `""` | Helper text below the field |
| **error** | boolean | `false` | Error state styling |
| **disabled** | boolean | `false` | Disables input interaction |
| **required** | boolean | `false` | Shows required indicator |
| **effect** | string | `"underline"` | One of 27 supported visual effects |
| **startIcon** | JSX.Child | `null` | Leading icon |
| **endIcon** | JSX.Child | `null` | Trailing icon |
| **multiline** | boolean | `false` | Uses `<textarea>` instead of `<input>` |
| **rows** | number | `3` | Textarea row count |
| **type** | string | `"text"` | Input type attribute |
| **cls** | string | `""` | Additional class overrides |
| **...otherProps** | HTMLAttributes | — | Passed to `<input>` or `<textarea>` |

---

# ⚙️ Value Logic

If an observable is passed:

```ts
value() → currentValue
value(newValue) → update
```

If a primitive is passed:

- TextField becomes controlled internally  
- Only parent re-render changes the value  

---

# 🎛 Focus & Floating Label Logic

TextField tracks:

- `isFocused`
- `hasValue`
- `isErrored`
- `isDisabled`

Label floats when:

```
isFocused === true
or
value !== ""
```

---

# 🎨 Effect Resolution

Effects are stored in a lookup object:

```ts
effects = {
    underline, underline2, underline3,
    box, box2, box3,
    outline, outline2, outline3,
    filled, filled2, ..., filled6,
    floatUnderline, floatUnderline2, floatUnderline3,
    floatBox, floatBox2, floatBox3,
    floatFill, floatFill2, floatFill3,
    labeledBox, labeledBox2, labeledBox3
}
```

Then selected via:

```ts
activeEffect = effects[effect] || effects["underline"]
```

---

# 📐 Rendering Structure

TextField outputs:

```tsx
<div class="textfield-wrapper [cls] [effectClass]">
    <div class="leading-icon">{startIcon}</div>

    <div class="input-container">
        <input or textarea ... />

        <label class="floating-label">{label}</label>

        <!-- Animated effect elements -->
        <div class="effect-layer"></div>
    </div>

    <div class="trailing-icon">{endIcon}</div>

    <div class="helper-text">{helperText}</div>
</div>
```

---

# 🔄 Events

TextField fires:

- `onFocus`
- `onBlur`
- `onInput`
- `onChange`
- `onKeyDown`
- `onKeyUp`

All support observables seamlessly.

---

# 🧪 Usage Examples

### Simple
```tsx
<TextField label="Name" />
```

### With error
```tsx
<TextField label="Email" error helperText="Invalid email." />
```

### With effect
```tsx
<TextField effect="outline" label="Search" />
```

### Multiline
```tsx
<TextField multiline rows={4} label="Message" />
```

---

# ♿ Accessibility

- Uses native `<input>` or `<textarea>` → full screen reader support  
- Floating label doubles as accessible `<label>`  
- Error & helper text are visibly connected  
- Disabled state blocks interaction and reduces opacity  

---

# 📝 Summary

TextField provides:

- 27 animated effect variants  
- Leading/trailing icons  
- Floating label system  
- Helper/error text  
- Observable-friendly input value  
- Full TSX + Web Component compatibility  
- Highly customizable visual styling  
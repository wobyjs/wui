# 🧩 TextField Component

The **TextField** component is a versatile, animated input field supporting:
- All major Material-style variants (filled, outlined, underline)  
- 27 visual effects  
- Floating labels  
- Leading/trailing icons  
- Validation & error states  
- Helper text / description  
- Reactive observable values  
- Full TSX and Web Component support  

This document covers usage, styling, behavior, and a full effect reference.

---

# 📌 Component Signature

### TSX
```tsx
<TextField
    label="Name"
    value="John"
    effect="filled"
    disabled={false}
    required={false}
    cls=""
>
</TextField>
```

### Web Component
```html
<wui-text-field
    label="Name"
    value="John"
    effect="filled"
    disabled="false"
    required="false"
    cls=""
></wui-text-field>
```

---

# ✨ Features

- 27 visual effects (Material-inspired + custom animated variants)
- **Floating label**, **bottom labels**, **error text**, **helper text**
- Leading & trailing **icons**
- **Reactive mode** with observables  
- Focused state animations  
- Disabled & error styling  
- Fully customizable using `cls`
- Compatible with HTML `<input>` and `<textarea>`

---

# 🧭 Basic Usage

```tsx
<TextField label="Username" />
```

### With preset value
```tsx
<TextField label="Email" value="user@gmail.com" />
```

### With observable value
```tsx
const name = $("Taylor")

<TextField label="Name" value={name} />
```

---

# 🔤 Label & Helper Text

```tsx
<TextField
    label="Email"
    helperText="We'll never share your email."
/>
```

### Error text
```tsx
<TextField
    label="Email"
    error
    helperText="Email is invalid."
/>
```

---

# 🧩 Icons

### Leading Icon
```tsx
<TextField
    label="Search"
    startIcon="🔍"
/>
```

### Trailing Icon
```tsx
<TextField
    label="Password"
    endIcon="👁️"
/>
```

---

# 🎛️ Input Types

```tsx
<TextField type="text" />
<TextField type="password" />
<TextField type="email" />
<TextField type="number" />
<TextField type="date" />
```

---

# 🎚 Effects — Full Library (27 Variants)

Below is a complete list of supported visual effects grouped by family.

---

## 🔵 **Underline Effects (1–3)**  
Classic Material underline animations.

| Effect | Description |
|--------|-------------|
| **effect1** | Simple underline expansion on focus. |
| **effect2** | Underline slides in from the left. |
| **effect3** | Underline slides in from the center outward. |

---

## 🟥 **Box Effects (4–6)**  
Box-style border animations.

| Effect | Description |
|--------|-------------|
| **effect4** | Full box border grows from the center. |
| **effect5** | Border animates clockwise like a drawn outline. |
| **effect6** | Borders appear with staggered timing for a segmented look. |

---

## 🟩 **Outline Effects (7–9)**  
Outlined input with animated border transitions.

| Effect | Description |
|--------|-------------|
| **effect7** | Classic outline with label lifting on focus. |
| **effect8** | Outline “jumps” slightly before settling. |
| **effect9** | Outline fades in smoothly while label floats. |

---

## 🟨 **Fill Effects (10–15)**  
Filled textfields with animated backgrounds.

| Effect | Description |
|--------|-------------|
| **effect10** | Soft background fill expands on focus. |
| **effect11** | Highlight color washes from left to right. |
| **effect12** | Background pulses once on focus. |
| **effect13** | Fill animates outward like liquid. |
| **effect14** | Ripple-style fill effect. |
| **effect15** | Strong color fill with elevation-style shadow. |

---

## 🟦 **Floating Label — Underline Effects (16–18)**  
Underline + float label hybrid.

| Effect | Description |
|--------|-------------|
| **effect16** | Label floats and underline expands simultaneously. |
| **effect17** | Label floats while underline animates left→right. |
| **effect18** | Underline ripple + floating label scaling. |

---

## 🟪 **Floating Label — Box Effects (19–21)**  
Floating label + animated border.

| Effect | Description |
|--------|-------------|
| **effect19** | Label slides upward while box border appears. |
| **effect20** | Label floats with a bouncing box outline. |
| **effect21** | Label floats and border fades in smoothly. |

---

## 🟧 **Floating Label — Fill Effects (22–24)**  
Filled variant with floating label.

| Effect | Description |
|--------|-------------|
| **effect22** | Label floats, background gently expands. |
| **effect23** | Filled background animates diagonally. |
| **effect24** | High-emphasis filled ripple + floating label. |

---

## ⚪ **Alternative Box Label Variants (19a–21a)**  
Special boxed styles with explicit label frame.

| Effect | Description |
|--------|-------------|
| **effect19a** | Label sits inside a top border cutout. |
| **effect20a** | Animated framed label box with border pulse. |
| **effect21a** | Smooth floating framed label with subtle color transition. |

---

# 📦 Example with Effect

```tsx
<TextField
    label="Email"
    effect="effect16"
    helperText="Floating underline + label effect"
/>
```

HTML:
```html
<wui-text-field label="Email" effect="effect16"></wui-text-field>
```

---

# 🎨 Custom Styling Using `cls`

```tsx
<TextField
    label="Name"
    cls="!bg-gray-50 !rounded-xl !p-3"
    effect="filled"
/>
```

---

# 🧠 Notes

- TextField automatically handles internal `focus`, `filled`, and `error` states.  
- Effects do not affect accessibility — visual only.  
- Supports slotted icon content in HTML mode.  
- Floating label adapts based on value and focus.  
- Works with `<input>` or `<textarea>` depending on props.
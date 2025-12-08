# 🧩 Checkbox Component

The **Checkbox** component provides a flexible selection control with customizable **label positions**, **checked / disabled states**, and **styling overrides**.  
It supports both **TSX usage** and **Web Component usage (`<wui-checkbox>`)**.

---

# 📌 Component Signature

### TSX
```tsx
<Checkbox
    checked={false}
    disabled={false}
    labelPosition="left"
    cls=""
>
    Label text
</Checkbox>
```

### HTML (Web Component)
```html
<wui-checkbox
    checked="false"
    disabled="false"
    label-position="left"
    cls=""
>
    Label text
</wui-checkbox>
```

---

# ✨ Features

- Four label positions: **left**, **right**, **top**, **bottom**
- Supports **checked** and **disabled** as reactive observable values
- Automatically generates a unique `id` for each checkbox
- Clicking the label toggles the checkbox (label is bound to the input)
- Supports custom styling through `cls`
- Works in both TSX and Web Component modes
- Children become the **label text**

---

# 🎨 Label Position Variants

| Position | Layout |
|----------|--------|
| **left** | Label appears before the checkbox |
| **right** | Label appears after the checkbox |
| **top** | Label above checkbox, separated by `<br>` |
| **bottom** | Label below checkbox, separated by `<br>` |

---

# 🏷️ Examples by Position

## Left Label (default)
### TSX
```tsx
<Checkbox labelPosition="left">Left Label</Checkbox>
```

### HTML
```html
<wui-checkbox label-position="left">Left Label</wui-checkbox>
```

---

## Right Label
```tsx
<Checkbox labelPosition="right">Right Label</Checkbox>
```

```html
<wui-checkbox label-position="right">Right Label</wui-checkbox>
```

---

## Top Label
```tsx
<Checkbox labelPosition="top">Top Label</Checkbox>
```

```html
<wui-checkbox label-position="top">Top Label</wui-checkbox>
```

---

## Bottom Label
```tsx
<Checkbox labelPosition="bottom">Bottom Label</Checkbox>
```

```html
<wui-checkbox label-position="bottom">Bottom Label</wui-checkbox>
```

---

# 🟦 Checked State

### TSX
```tsx
<Checkbox checked>Checked by default</Checkbox>
```

### HTML
```html
<wui-checkbox checked="true">Checked by default</wui-checkbox>
```

---

# 🚫 Disabled State

### TSX
```tsx
<Checkbox disabled>Disabled Checkbox</Checkbox>
```

### HTML
```html
<wui-checkbox disabled="true">Disabled Checkbox</wui-checkbox>
```

---

# 🚫 Disabled + Checked

### TSX
```tsx
<Checkbox checked disabled>Disabled & Checked</Checkbox>
```

### HTML
```html
<wui-checkbox checked="true" disabled="true">
    Disabled & Checked
</wui-checkbox>
```

---

# 🎨 Custom Styling with `cls`

### TSX
```tsx
<Checkbox
    labelPosition="right"
    cls="!text-blue-500 !font-bold"
>
    Custom styled checkbox
</Checkbox>
```

### HTML
```html
<wui-checkbox
    label-position="right"
    cls="!text-blue-500 !font-bold"
>
    Custom styled checkbox
</wui-checkbox>
```

---

# 🧠 Notes

- The component wraps everything in a root `<div>` so `cls` applies to the outer container.
- Label is associated with the checkbox using `for={id}`, allowing click toggling.
- `checked` and `disabled` accept **reactive observables** or primitive booleans.
- For `top` or `bottom`, line breaks (`<br>`) are inserted automatically.
- All HTML attributes (e.g., `id`, `onChange`, etc.) are passed directly to the underlying `<input>`.
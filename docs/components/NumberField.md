# 🧩 NumberField Component

The **NumberField** component is an advanced numeric input with built-in increment/decrement buttons, min/max validation, continuous press interaction, wheel support, reactive mode, and extensive configurability.  
It works in both **TSX (`<NumberField>`)** and **Web Component (`<wui-number-field>`)** formats.

---

# 📌 Component Signature

### TSX
```tsx
<NumberField
    value={10}
    min={0}
    max={100}
    step={1}
    reactive={false}
    noMinMax={false}
    noFix={false}
    noRotate={false}
    disabled={false}
    cls=""
>
    Optional children here
</NumberField>
```

### Web Component
```html
<wui-number-field
    value="10"
    min="0"
    max="100"
    step="1"
    reactive="false"
    no-min-max="false"
    no-fix="false"
    no-rotate="false"
    disabled="false"
    cls=""
></wui-number-field>
```

---

# ✨ Features

- Built-in increment **(+ button)** and decrement **(– button)**  
- **Reactive mode** (updates value immediately)  
- **Continuous hold pressing** with acceleration  
- **Min / Max validation**  
- Optional:
  - `noMinMax` → disables validation  
  - `noFix` → prevents auto-correcting out-of-range values  
  - `noRotate` → prevents wrapping (min→max or max→min)  
- Mouse wheel increment/decrement  
- Disabled state support  
- Custom styles with `cls`  
- Works with observable or static values  

---

# 🎛️ Value Behavior Overview

### ✔ `value` as a number
```tsx
<NumberField value={5} />
```

### ✔ `value` as an observable
```tsx
const count = $(10)
<NumberField value={count} />
```

Updating the observable reflects instantly in the input.

---

# 🔄 Increment / Decrement ( + / – )

NumberField includes two built-in buttons:

```tsx
<Button type="icon">-</Button>
<input type="number" />
<Button type="icon">+</Button>
```

## Behavior Rules

| Event | Result |
|-------|--------|
| Click "+" | value + step |
| Click "–" | value – step |
| Hold press | continuous increment/decrement |
| Wheel up | value – step |
| Wheel down | value + step |

Wheel behavior is disabled when NumberField is disabled.

---

# 🚧 Min / Max Behavior

### Default

```tsx
<NumberField min={0} max={50} />
```

If the user exceeds the range:

- Value auto-corrects to min/max  
- Or rotates if rotation is allowed  

---

# 🔁 Rotation Logic (min/max wrap)

### Default (rotation enabled)
- If value goes below min → wrap to max  
- If value goes above max → wrap to min  

### Disable wrapping
```tsx
<NumberField noRotate />
```

---

# 🧱 Fixing Logic (Auto-Correction)

### Default
NumberField auto-fixes values outside range.

### Disable fixing
```tsx
<NumberField noFix />
```

This allows out-of-range values without overriding.

---

# 🎚 Reactive vs Non-Reactive Input

### `reactive={true}`  
Updates observable immediately while typing.

### `reactive={false}` *(default)*  
Updates observable only after input change (blur / enter / inc-dec actions).

---

# 🛑 Disabled State

```tsx
<NumberField disabled />
```

Disabled NumberField:

- Blocks button clicks
- Blocks wheel scrolling
- Blocks keyboard changes
- Shows greyed-out styles

---

# 🖌️ Custom Styling

`cls` **replaces** the component's base classes — pass it only when you want to
restyle the element from scratch. To *add* utilities on top of the base, use
`class`, which is merged with whatever fills the `cls` slot.


### TSX
```tsx
<NumberField class="m-2 p-2 border-2 rounded-xl" />
```

### HTML
```html
<wui-number-field class="m-2 p-2 border-2 rounded-xl"></wui-number-field>
```

---

# 🧪 Example Gallery

## Default
```tsx
<NumberField />
```

## Preset Value
```tsx
<NumberField value={10} />
```

## Min / Max
```tsx
<NumberField min={0} max={50} value={25} />
```

## Step of 5
```tsx
<NumberField step={5} value={10} />
```

## Disabled
```tsx
<NumberField disabled />
```

---

# 🧠 Notes

- Uses custom increment/decrement buttons from `<Button type="icon">`
- `inputRef` tracks the DOM input element
- `updated()` function ensures value correction based on flags  
- Continuous increment uses **timeout + interval**  
- Wheel delta determines increment direction  
- Styling includes a **focus ring**, **rounded border**, and **divider lines**
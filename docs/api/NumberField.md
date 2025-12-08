# 🧩 NumberField API

The **NumberField API** defines all properties, behaviors, validation rules, and interaction patterns of the component.  
It functions as an enhanced number input with built-in increment/decrement controls and advanced constraints.

---

# 📦 Import

### TSX

```tsx
import { NumberField } from "./NumberField";
```

### Web Component

```ts
import "./NumberField"; // registers <wui-number-field>
```

---

# 🧭 Props Overview

| Prop              | Type                           | Default     | Description                                       |
| ----------------- | ------------------------------ | ----------- | ------------------------------------------------- |
| **children**      | JSX.Child                      | `null`      | Optional extra content appended to the right side |
| **reactive**      | boolean                        | `false`     | Updates observable immediately during typing      |
| **noMinMax**      | boolean                        | `false`     | Disables min/max comparison logic                 |
| **noFix**         | boolean                        | `false`     | Prevents auto-correction for out-of-range values  |
| **noRotate**      | boolean                        | `false`     | Prevents wrapping (min→max / max→min)             |
| **value**         | number or Observable<number>   | `0`         | Current numeric value                             |
| **min**           | number or Observable<number>   | `0`         | Minimum allowed value                             |
| **max**           | number or Observable<number>   | `100`       | Maximum allowed value                             |
| **step**          | number or Observable<number>   | `1`         | Increment/decrement step                          |
| **disabled**      | boolean or Observable<boolean> | `false`     | Fully disables all interactions                   |
| **cls**           | string                         | `""`        | Additional classes for the wrapper                |
| **onChange**      | function                       | `undefined` | Fired when value changes (non-reactive mode)      |
| **onKeyUp**       | function                       | `undefined` | Keyboard keyup handler                            |
| **...otherProps** | HTMLInputAttributes            | —           | Applied to `<input type="number">`                |

---

# ⚙️ Internal Logic

## 1. Error Detection

```ts
error = value < min || value > max;
```

Turns input text red when out of range.

---

## 2. Disabled Logic

Every mutation function (inc, dec, wheel, input change) starts with:

```ts
if (disabled) return;
```

---

## 3. Increment & Decrement Logic

### Reactive mode

```ts
value(value + step);
```

### Non-reactive mode

```ts
value(inputRef.valueAsNumber ± step)
```

---

## 4. Auto-Fix Logic (`updated()`)

When value changes:

- If `noFix === true` → skip fixing
- If below min:
  - `noRotate === true` → clamp to min
  - else → wrap to max
- If above max:
  - `noRotate === true` → clamp to max
  - else → wrap to min

---

## 5. Continuous Press Logic

```ts
onPointerDown → inc/dec once → after 200ms → repeat every 100ms
onPointerUp / onPointerLeave → stop repeating
```

Makes holding +/– button rapidly update the value.

---

## 6. Wheel Scrolling

```ts
deltaY > 0 → dec()
deltaY < 0 → inc()
```

Wheel is prevented when disabled.

---

# 🧩 Render Structure

```tsx
<div class="number-input ...">
  <Button type="icon">-</Button>

  <input
    ref={inputRef}
    type="number"
    value={value}
    min={min}
    max={max}
    step={step}
    class="..."
  />

  <Button type="icon">+</Button>

  {children}
</div>
```

---

# 🧪 Usage Examples

### TSX

```tsx
<NumberField min={0} max={50} step={5} value={10} />
```

### HTML

```html
<wui-number-field min="0" max="50" step="5" value="10"></wui-number-field>
```

---

# ♿ Accessibility

- Buttons are native `<button>` elements (keyboard accessible)
- Input is a native `<input type="number">`
- Wheel interaction is prevented when disabled
- Screen readers interpret the field correctly as a number input

---

# 📝 Summary

The NumberField provides:

- Advanced number handling with increment/decrement
- Reactive & non-reactive updating modes
- Min/max validation, rotation, and fixing logic
- Continuous press handling
- Wheel support
- Full TSX + Web Component compatibility
- Extensive styling control through `cls`

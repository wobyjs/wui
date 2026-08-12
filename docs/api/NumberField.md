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
| **reactive**      | boolean or Observable<boolean> | `false`     | Updates observable immediately during typing (HtmlBoolean) |
| **noMinMax**      | boolean or Observable<boolean> | `false`     | Disables min/max comparison logic (HtmlBoolean)   |
| **noFix**         | boolean or Observable<boolean> | `false`     | Prevents auto-correction for out-of-range values (HtmlBoolean) |
| **noRotate**      | boolean or Observable<boolean> | `false`     | Prevents wrapping (min→max / max→min) (HtmlBoolean) |
| **value**         | number or Observable<number>   | `0`         | Current numeric value (HtmlNumber)                |
| **min**           | number or Observable<number>   | `0`         | Minimum allowed value (HtmlNumber)                |
| **max**           | number or Observable<number>   | `100`       | Maximum allowed value (HtmlNumber)                |
| **step**          | number or Observable<number>   | `1`         | Increment/decrement step (HtmlNumber)             |
| **disabled**      | boolean or Observable<boolean> | `false`     | Fully disables all interactions (HtmlBoolean)     |
| **cls**           | string                         | `""`        | Primary class; overrides default wrapper classes when set (HtmlClass) |
| **class**         | string                         | `""`        | Additional classes appended to the wrapper        |
| **onChange**      | function                       | `undefined` | Fired when value changes (non-reactive mode)      |
| **onKeyUp**       | function                       | `undefined` | Keyboard keyup handler                            |
| **...otherProps** | HTMLInputAttributes            | —           | Applied to `<input type="number">`                |

---

# ⚙️ Internal Logic

## 1. Error Detection

```ts
const error = useMemo(() => {
  if ($$(noMinMax)) return false
  return +$$(value) < +$$(min) || +$$(value) > +$$(max)
})
```

Turns input text red when out of range (skipped when `noMinMax` is true).

## 2. Disabled / Limit Guards

Decrement and increment are each gated by a computed guard:

```ts
const cantMin = () => $$(disabled) || (!$$(noMinMax) && $$(value) <= $$(min) && $$(noRotate))
const cantMax = () => $$(disabled) || (!$$(noMinMax) && $$(value) >= $$(max) && $$(noRotate))
```

Every mutation function (inc, dec, wheel, input change) also starts with:

```ts
if ($$(disabled)) return;
```

---

## 3. Increment & Decrement Logic

### Reactive mode

```ts
value($$((value)) ± $$(step))
```

### Non-reactive mode

```ts
value(inputRef.valueAsNumber ± step)
```

---

## 4. Auto-Fix Logic (`updated()`)

When value changes (`useEffect(updated)`):

- If `disabled` → return
- If value unchanged since last run → return
- If `noFix === true` **or** `noMinMax === true` → skip fixing
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

A global `pointerup` / `pointercancel` document listener acts as a safety net to stop any active timers.

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
<div class={[
  "number-input inline-flex items-center bg-white border border-gray-300 rounded-lg ...",
  () => $$(disabled) ? "bg-gray-100 opacity-70" : "",
  () => $$(cls) ? $$(cls) : "",
  cn
]}>
  <Button type="icon" onPointerDown={...} onPointerUp={stopUpdate} disabled={cantMin}>-</Button>

  <input
    ref={inputRef}
    type="number"
    value={value}
    min={() => $$(noMinMax) ? undefined : $$(min)}
    max={() => $$(noMinMax) ? undefined : $$(max)}
    step={step}
  />

  <Button type="icon" onPointerDown={...} onPointerUp={stopUpdate} disabled={cantMax}>+</Button>

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
- Extensive styling control through `cls` (override) and `class` (append)
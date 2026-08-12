# ColorEditor API

The **ColorEditor** renders a native `<input type="color">` for hex color-typed string properties. It also supports an optional alpha slider when the color value includes an 8-digit hex (RRGGBBAA) format. It is automatically dispatched when the property value is a string matching the `#RRGGBB` hex pattern.

---

# Import

```tsx
import "./ColorEditor"; // registers into the Editors registry
```

---

# Editor Registration

```ts
Editors([...$$(Editors) as any, ColorEditor])
```

---

# Render Condition

```ts
const renderCondition = (value: ObservableMaybe<string>, key) => {
  if ($$(value) == undefined) return false
  const colorVal = $$(value).length == 9
    ? $$(value).slice(0, -2)
    : $$(value)
  const hexColorReg = /^#[0-9A-F]{6}$/i
  const isColor = isObservable(value)
    ? hexColorReg.test(colorVal)
    : hexColorReg.test(colorVal)
  const isString = isObservable(value)
    ? typeof $$(value) == "string"
    : typeof value == "string"
  return isString && isColor
}
```

The editor activates when the value is a string AND matches the `#RRGGBB` hex pattern (case-insensitive). For 9-character hex strings (with alpha), the last two characters are stripped before testing.

---

# Props (via UIProps)

| Prop | Type | Description |
| ---- | ---- | ----------- |
| **value** | `ObservableMaybe<string>` | The hex color string observable |
| **reactive** | `ObservableMaybe<boolean>` | When `true`, writes only on explicit change |
| **editorName** | `string` | Property key, transformed to display label |
| **indentLvl** | `number` | Indentation level for nested properties |

---

# Internal Logic

## Alpha Channel Detection

```ts
const hasAlpha = $$(value).length == 9
const colorVal = $$(value).length == 9
  ? $$(value).slice(0, -2)
  : $$(value)
const alphaVal = hasAlpha
  ? parseInt($$(value).slice(-2), 16) / 255
  : undefined
```

When the color value is 9 characters (`#RRGGBBAA`), the editor splits it into:
- **colorVal**: the 6-character hex (`#RRGGBB`)
- **alphaVal**: the alpha channel decoded from hex to a 0-1 float

---

# Rendering Behavior

```
<TableRow optionName={displayName}>
  <input type="color" value={colorVal} disabled={!isObservable(value)} />
  {hasAlpha && <input type="range" min="0" max="1" step="0.1" value={alphaVal} />}
</TableRow>
```

- **Color input**: standard HTML color picker, disabled when the value is not observable.
- **Alpha slider** (range input): rendered only when the original value is 9 characters (has alpha). Currently the alpha slider's onChange handler is a no-op (placeholder).

---

# Event Handling

- **Color input onChange**: When `reactive` is falsy and the value is observable, writes the new color value via `value(e.target.value)`. When `reactive` is true, the write is suppressed (reactive-only mode).
- **Alpha slider onChange**: Currently a placeholder; the alpha value is not written back to the observable.

---

# Usage Example

```tsx
const obj = {
  fillColor: $("#ff0000"),
  bgColor: $("#00ff0080") // with alpha
}

<PropertyForm obj={obj} />
// "fillColor" renders as a color picker
// "bgColor" renders as a color picker + alpha slider
```

---

# Summary

The ColorEditor provides:

- Automatic detection of hex color string properties
- Native HTML color picker for 6-digit hex colors
- Optional alpha slider for 8-digit hex colors (with alpha channel)
- Read-only mode for non-observable values
- Reactive update suppression via the `reactive` prop
- Integration with the PropertyForm editor dispatch system
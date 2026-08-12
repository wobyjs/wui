# StringEditor API

The **StringEditor** renders a `TextField` for string-typed properties that are not hex color values. It is automatically dispatched when the property value is a `string` that does not match the `#RRGGBB` hex color pattern.

---

# Import

```tsx
import "./StringEditor"; // registers into the Editors registry
```

---

# Editor Registration

```ts
Editors([...$$(Editors) as any, StringEditor])
```

---

# Render Condition

```ts
const renderCondition = (value: ObservableMaybe<string>, key) => {
  if ($$(value) == undefined) return false
  const hexColorReg = /^#[0-9A-F]{6}$/i
  const isColor = $$(value).length == 9
    ? hexColorReg.test($$(value).slice(0, -2))
    : hexColorReg.test($$(value))
  const isString = isObservable(value)
    ? typeof $$(value) == "string"
    : typeof value == "string"
  return isString && !isColor && !Array.isArray($$(value))
}
```

The editor activates when:
- The value is a `string` (typeof)
- The value is NOT a hex color (avoids conflict with ColorEditor)
- The value is NOT an array (avoids conflict with DropdownEditor)

---

# Props (via UIProps)

| Prop | Type | Description |
| ---- | ---- | ----------- |
| **value** | `ObservableMaybe<string>` | The string observable or plain value |
| **editorName** | `string` | Property key, transformed to display label |
| **indentLvl** | `number` | Indentation level for nested properties |

---

# Internal Logic

## Display Name

The editor transforms `editorName` from camelCase to Title Case, same as other editors.

## Skipped Properties

Properties listed in `skippedProperties` are silently skipped and return `null`.

---

# Rendering Behavior

```
<TableRow optionName={displayName}>
  <TextField
    value={value}
    assignOnEnter
    disabled={!isObservable(value)}
  />
</TableRow>
```

- Uses the **TextField** component from the library.
- **`assignOnEnter`**: the value is committed to the observable only when the user presses Enter (not on every keystroke).
- **Disabled** when the value is not observable -- the user cannot edit non-reactive string properties.

---

# Event Handling

- **TextField on Enter**: writes the current input value to the observable via the `value` prop binding.
- The editor delegates all event handling to the TextField component.

---

# Usage Example

```tsx
const obj = {
  title: $("Hello World"),
  description: "Read-only text",
}

<PropertyForm obj={obj} />
// "title" renders as an editable TextField (commit on Enter)
// "description" renders as a disabled TextField
```

---

# Summary

The StringEditor provides:

- Automatic detection of string properties (excluding hex colors)
- TextField UI with Enter-to-commit behavior
- Read-only mode for non-observable values
- CamelCase-to-title-case display name transformation
- Integration with the PropertyForm editor dispatch system
# BooleanEditor API

The **BooleanEditor** renders a `Checkbox` for boolean-typed properties. It is part of the PropertyForm editor registry and is automatically dispatched when the property value is a `boolean`.

---

# Import

```tsx
import "./BooleanEditor"; // registers into the Editors registry
```

No direct import is needed for typical usage -- the editor auto-registers itself when the module is loaded.

---

# Editor Registration

```ts
Editors([...$$(Editors) as any, BooleanEditor])
```

The `BooleanEditor` factory function is pushed into the shared `Editors` observable array at module load time.

---

# Render Condition

```ts
const renderCondition = (value: ObservableMaybe<string>) => {
  const isBoolean = isObservable(value)
    ? typeof $$(value) == "boolean"
    : typeof value == "boolean"
  return isBoolean
}
```

The editor activates when the property value (unwrapped) is `typeof === "boolean"`.

---

# Props (via UIProps)

| Prop | Type | Description |
| ---- | ---- | ----------- |
| **value** | `ObservableMaybe<boolean>` | The boolean observable or plain value |
| **reactive** | `ObservableMaybe<boolean>` | Passed through to the inner editor |
| **editorName** | `string` | Property key, transformed to display label |

---

# Internal Logic

## Display Name

The editor transforms `editorName` from camelCase to Title Case:

```ts
editorName.replace(/([a-z])([A-Z])/g, "$1 $2")
  .replace(/^./, str => str.toUpperCase())
```

For example, `"isVisible"` becomes `"Is Visible"`.

## Skipped Properties

Properties listed in `skippedProperties` (e.g. `"autoDistance"`, `"rotated"`, `"tolerance"`, etc.) are silently skipped and return `null`.

---

# Rendering Behavior

```
<TableRow optionName={displayName}>
  <Checkbox
    checked={$$(value)}
    disabled={!isObservable(value)}
    onChange={(e) => {
      value((e.target as HTMLInputElement).checked)
      onChange?.(e)
    }}
  />
</TableRow>
```

- Uses the **Checkbox** component from the library.
- Checked state is bound to the unwrapped value (`$$(value)`).
- **Disabled** when the value is not observable (plain boolean) -- the user cannot toggle non-reactive properties.
- On change, the new checked state is written back to the observable via `value(newChecked)`.

---

# Event Handling

- **onChange** toggles the observable and calls the parent `onChange` callback.
- The editor only writes to the observable if the value is observable.

---

# Usage Example

```tsx
const obj = { enabled: $(true), visible: false }

<PropertyForm obj={obj} />
// "enabled" renders as a togglable Checkbox
// "visible" renders as a disabled Checkbox
```

---

# Summary

The BooleanEditor provides:

- Automatic detection of boolean properties
- Checkbox UI for boolean toggling
- Disabled read-only mode for non-observable values
- CamelCase-to-title-case display name transformation
- Integration with the PropertyForm editor dispatch system
# NumberEditor API

The **NumberEditor** renders a `NumberField` for numeric-typed properties. It is automatically dispatched when the property value is a `number`.

---

# Import

```tsx
import "./NumberEditor"; // registers into the Editors registry
```

---

# Editor Registration

```ts
Editors([...$$(Editors) as any, NumberEditor])
```

---

# Render Condition

```ts
const renderCondition = (value: ObservableMaybe<string>) => {
  return isObservable(value)
    ? typeof $$(value) == "number"
    : typeof value == "number"
}
```

The editor activates when the unwrapped property value is `typeof === "number"`.

---

# Props (via UIProps)

| Prop | Type | Description |
| ---- | ---- | ----------- |
| **value** | `ObservableMaybe<number>` | The numeric observable or plain value |
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
  <NumberField
    noMinMax={true}
    reactive={true}
    value={value}
    disabled={!isObservable(value)}
  />
</TableRow>
```

- Uses the **NumberField** component from the library.
- **`noMinMax={true}`**: no minimum/maximum constraints on the input.
- **`reactive={true}`**: the NumberField operates in reactive mode, writing to the observable on change.
- **Disabled** when the value is not observable -- the user cannot edit non-reactive numeric properties.

---

# Event Handling

- **NumberField onChange**: writes the new numeric value to the observable via the `value` prop binding.
- The editor delegates all event handling to the NumberField component.

---

# Usage Example

```tsx
const obj = {
  width: $(100),
  height: 200, // plain value, read-only
}

<PropertyForm obj={obj} />
// "width" renders as an editable NumberField
// "height" renders as a disabled NumberField
```

---

# Summary

The NumberEditor provides:

- Automatic detection of numeric properties
- NumberField UI with no min/max constraints
- Reactive mode for observable-based value updates
- Read-only mode for non-observable values
- CamelCase-to-title-case display name transformation
- Integration with the PropertyForm editor dispatch system
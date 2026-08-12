# DropdownEditor API

The **DropdownEditor** renders a `MultiWheeler`-based selector for array-typed properties. It supports single-column selection (generic arrays) and multi-column selection (labels/thematic columns with operators and functions). It is automatically dispatched when the property value is an `Array`.

---

# Import

```tsx
import "./DropdownEditor"; // registers into the Editors registry
```

---

# Editor Registration

```ts
Editors([...$$(Editors) as any, DropDownEditor])
```

---

# Render Condition

```ts
const renderCondition = (value: ObservableMaybe<any>, key) => {
  return Array.isArray($$(value)) && key != "thematic"
}
```

The editor activates when the unwrapped value is an `Array`. The key `"thematic"` is excluded.

---

# Props (via UIProps)

| Prop | Type | Description |
| ---- | ---- | ----------- |
| **value** | `ObservableMaybe<any[]>` | The array observable (e.g., array of options or string values) |
| **data** | `ObservableMaybe<{}>` | The parent object, used to access sibling properties |
| **editorName** | `string` | Property key, used to determine the editor mode |

---

# Internal Logic

## Multi-Column Modes

The editor uses a `switch` on `editorName` to determine the data structure:

| Mode | `editorName` | Columns | Data Behavior |
| ---- | ------------ | ------- | ------------- |
| **Labels** | `"labels"` | 3 columns (Labels, Operators, Functions) | Reads `obj["colLabel"]`; writes back to `obj["colLabel"]` |
| **Thematic Columns** | `"thematicColumns"` | 3 columns (Labels, Operators, Functions) | Reads `obj["thematicColumn"]`; writes back to `obj["thematicColumn"]` |
| **Projection Name** | `"projectionName"` | 1 column (Projection Name) | Reads from `projAsia` lookup by `obj["projection"]` |
| **Default** | (any other) | 1 column (named after `editorName`) | Uses `selectedValue` observable attached to the array |

## SelectedValue Observable

For the default mode, the editor attaches a `selectedValue` observable to the array observable:

```ts
if (!(arrayObservable as any).selectedValue) {
  (arrayObservable as any).selectedValue = $(firstValue);
}
```

This enables other parts of the application to read the current selection via `myObservable.selectedValue()`.

## Synchronization Effects

The editor uses multiple `useEffect` hooks to synchronize the MultiWheeler's state:

1. **Input Synchronization**: Keeps the displayed input value in sync with the first wheel selection.
2. **Operator Concatenation**: Appends the operator (e.g., `+`, `-`, `*`) to the display string.
3. **Function Concatenation**: Appends the function name (e.g., `Abs`, `Cos`) to the display string.
4. **Selection Propagation**: Commits the final `inputValue` back to `selectionStore`.

## Data Persistence Effects

Additional effects persist values back to the parent object:

- `"labels"` mode writes to `obj["colLabel"]`.
- `"thematicColumns"` mode writes to `obj["thematicColumn"]`.
- `"thematicType"` mode reorders the array so the selected value is at index 0.

---

# Rendering Behavior

```
<TableRow optionName={displayName}>
  <input ref={outerInputRef} value={inputValue} onClick={() => open(!open)} />
  <MultiWheeler
    headers={headers}
    visible={open}
    options={data}
    value={inputValue}
    bottom
    mask
    ok
    changeValueOnClickOnly
  />
</TableRow>
```

- **Text input**: displays the current selection; clicking opens the MultiWheeler popup.
- **MultiWheeler**: presents columns of selectable options with a bottom-anchored popup, mask overlay, and OK button.

---

# Event Handling

- **Input click**: toggles the MultiWheeler popup visibility.
- **MultiWheeler selection changes**: propagated through the synchronization effects pipeline to update the display value and persist to the parent object.
- **`changeValueOnClickOnly`**: set to `true` for `"labels"` and `"thematicColumns"` modes, preventing premature value commits.

---

# Usage Example

```tsx
const obj = {
  colors: $(["red", "green", "blue"]),
  labels: $(["label1", "label2"]),
  thematicColumns: $(["col1", "col2"]),
  colLabel: $(""),
  thematicColumn: $(""),
}

<PropertyForm obj={obj} />
// "colors" renders as a single-column wheeler
// "labels" renders as a 3-column wheeler (Labels, Operators, Functions)
// "thematicColumns" renders as a 3-column wheeler (Labels, Operators, Functions)
```

---

# Summary

The DropdownEditor provides:

- Automatic detection of array-typed properties
- MultiWheeler-based selection UI with popup
- Single-column mode for generic arrays
- Multi-column mode (Labels + Operators + Functions) for expression building
- Reactive `selectedValue` observable attached to array observables
- Data persistence to parent object properties
- Integration with the PropertyForm editor dispatch system
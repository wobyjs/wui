# EditorProps API

The **EditorProps** type defines the shared prop contract between the PropertyForm system and every individual editor component. All editors (BooleanEditor, ColorEditor, DropdownEditor, NumberEditor, ObjectEditor, StringEditor) receive a subset of these props.

---

# Type Definition

```ts
export type EditorProps = {
  reactive?: ObservableMaybe<boolean>
  value: ObservableMaybe<any>
  onChange?: (e) => void
  name?: string
  obj?: ObservableMaybe<{}>
  editorName?: string
  changeValueOnClickOnly?: ObservableMaybe<boolean>
}
```

---

# Props Overview

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| **value** | `ObservableMaybe<any>` | required | The observable or plain value of the property being edited |
| **reactive** | `ObservableMaybe<boolean>` | `undefined` | When `true`, the editor only writes to the observable on explicit user interaction (e.g., color picker change), not on intermediate events |
| **onChange** | `(e) => void` | `undefined` | Callback invoked after the editor updates the value; receives the source event |
| **name** | `string` | `undefined` | Optional explicit display name for the property |
| **obj** | `ObservableMaybe<{}>` | `undefined` | Reference to the parent object, used by editors that need to read sibling properties (e.g., DropdownEditor reads `colLabel` / `thematicColumn`) |
| **editorName** | `string` | `undefined` | The property key on the parent object; used by editors to derive display labels and build reactive data bindings |
| **changeValueOnClickOnly** | `ObservableMaybe<boolean>` | `undefined` | When `true`, the editor commits changes only on click rather than on every input event |

---

# Data Flow

1. **PropertyForm** iterates the object's keys and dispatches each key to the matching editor.
2. Each editor receives `value` (the observable or plain value for that key) and `editorName` (the key name).
3. The editor reads the current value with `$$(value)` and writes updates by calling `value(newVal)`.
4. After writing, the editor optionally calls `onChange(e)` to notify upstream.
5. Editors check `isObservable(value)` to determine whether the property is reactive:
   - **Observable** — the editor enables writes and updates the observable.
   - **Plain value** — the editor renders the control as disabled (read-only).

---

# Usage Notes

- `reactive` is currently used by **ColorEditor** to gate writes: when `true`, the color input only writes to the observable on `onChange` (not intermediate events).
- `changeValueOnClickOnly` is used by **DropdownEditor** for `"labels"` and `"thematicColumns"` properties to prevent premature value commits.
- `obj` is used by **DropdownEditor** to access sibling properties like `colLabel` and `thematicColumn` for multi-column selection logic.
- `editorName` is the raw object key and is transformed by each editor for display (e.g., `"backgroundColor"` becomes `"Background Color"`).
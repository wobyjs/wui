# ObjectEditor API

The **ObjectEditor** renders a collapsible nested property editor for object-typed properties (excluding arrays). It is automatically dispatched when the property value is an `object` (but not an `Array`).

---

# Import

```tsx
import "./ObjectEditor"; // registers into the Editors registry
```

---

# Editor Registration

```ts
Editors([...$$(Editors) as any, ObjectEditor])
```

---

# Render Condition

```ts
const renderCondition = (value: ObservableMaybe<any>, key) => {
  const isObject = isObservable(value)
    ? typeof $$(value) == "object"
    : typeof value == "object"
  const isArray = isObservable(value)
    ? Array.isArray($$(value))
    : Array.isArray(value)
  return isObject && !isArray
}
```

The editor activates when the unwrapped value is `typeof === "object"` AND is not an `Array`.

---

# Props (via UIProps)

| Prop | Type | Description |
| ---- | ---- | ----------- |
| **value** | `ObservableMaybe<any>` | The object observable or plain value |
| **editorName** | `string` | Property key, transformed to display label |
| **indentLvl** | `number` | Indentation level (defaults to `-1`) |
| **open** | `Observable<boolean>` | External collapse/expand control (defaults to `$(false)`) |
| **button** | `JSX.Element` | Optional button rendered in the header row |

---

# Internal Logic

## Display Name

The editor transforms `editorName` from camelCase to Title Case. For numeric keys that reference a `column` property (e.g., array indices), the display name is derived dynamically:

```ts
if (parseInt(editorName) && value["column"] || parseInt(editorName) == 0) {
  optionName(`(${$$(value["column"])}) +  (${$$(value["name"])})`)
}
```

This reactive expression is also recalculated in a `useEffect` to stay in sync.

## Collapse/Expand State

The editor maintains a `open` observable (default `false`). A toggle button renders a minus icon (expanded) or plus icon (collapsed) SVG.

---

# Rendering Behavior

```
<tr class="flex h-fit items-stretch">
  <th>
    <button onClick={() => open(v => !v)}>
      {open ? <MinusIcon /> : <PlusIcon />}
    </button>
  </th>
  <th class="w-full flex items-center justify-between">
    <span class="whitespace-nowrap px-2 py-1">{optionName}</span>
    {button}
  </th>
</tr>
{open && (
  <tr>
    <td colSpan={2}>
      <PropertyRows obj={value} indentLvl={indentLvl + 1} />
    </td>
  </tr>
)}
```

- **Header row**: contains a collapse/expand toggle button on the left and the property name (with optional button) on the right.
- **Collapsed**: only the header row is visible.
- **Expanded**: a second row appears below, containing a `PropertyRows` component that recursively renders the nested object's properties with increased indentation.
- Indentation uses the `indent` class array (`pl-4`, `pl-8`, `pl-12`, `pl-16`).

---

# Event Handling

- **Toggle button click**: toggles the `open` observable via `open(v => !v)`.
- The editor uses a `ref`-based onclick handler (`el.onclick = ...`) instead of JSX `onClick` to avoid Shadow DOM event retargeting issues.

---

# Usage Example

```tsx
const obj = {
  style: $({
    color: $("#ff0000"),
    fontSize: $(14),
  }),
  metadata: {
    author: "Alice",
  },
}

<PropertyForm obj={obj} />
// "style" renders as a collapsible section with nested editors
// "metadata" renders as a collapsible section with nested editors
```

---

# Summary

The ObjectEditor provides:

- Automatic detection of object-typed (non-array) properties
- Collapsible/expandable nested property sections
- Recursive rendering via `PropertyRows` with increased indentation
- Dynamic display name for array-indexed objects (column + name)
- Toggle button with plus/minus SVG icons
- Integration with the PropertyForm editor dispatch system
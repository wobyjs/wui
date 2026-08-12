# PropertyForm API

The **PropertyForm** component renders a dynamic property-editing table for any object. It inspects the object's keys, dispatches each property to a matching editor from the **Editors** registry, and renders rows inside a bordered table with a header. It also supports a commit callback.

---

# Import

### TSX

```tsx
import { PropertyForm } from "./PropertyForm";
```

### Web Component

```ts
import "./PropertyForm"; // registers <wui-property-form>
```

---

# Props Overview

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| **obj** | `any` | `null` | The target object whose properties are edited |
| **order** | `string[]` | `[]` | Key ordering hint; matched keys float to the top |
| **class** | `JSX.Class` | `""` | Additional CSS classes for the outer container |
| **textAlign** | `string` | `""` | Optional text alignment override for editors |
| **onCommit** | `(() => void) \| null` | `null` | Callback invoked when the commit button is clicked |

---

# Internal Logic

## changeEnumerable()

The `changeEnumerable()` helper is called before rendering. It:

1. Scans all keys for pattern-matched keys: `^-<name>-` (dash-surrounded) and `^-<name>` (dash-prefixed).
2. Deletes the matched key and re-defines it with `enumerable: false` on the object so it becomes hidden from iteration.
3. Returns a new object with keys sorted alphabetically.

This is used to surface the "real" property key while hiding the dashed variant used for internal metadata.

## Key Filtering

Before rendering, the component filters out:

- Keys matching the dash pattern (`/^-([a-zA-Z].*)-$/`)
- Keys containing `"Obj"` (sub-object references)
- Keys starting with `"$"` (Woby internal / reactive metadata)
- The `"colLabel"` key (consumed internally by DropdownEditor)
- Keys whose value is an `HTMLElement` instance (except `"children"`)

## Editor Registry Dispatch

The form iterates every registered editor in `Editors` (an observable array of factory functions). Each editor exposes:

- `renderCondition(value, key)` — determines whether the editor handles this property
- `UI(props)` — the editor component to render

The first matching editor's `UI` is rendered for each property key. Editors are evaluated in registration order.

---

# Rendering Behavior

```
<div class="flex flex-col h-full">
  <div class="rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white">
    <div class="px-4 py-2 bg-gray-50 border-b border-gray-200">
      <h3>Component Properties</h3>
    </div>
    <table class="w-full border-collapse table-sm">
      <tbody>
        <!-- TableRow per property -->
      </tbody>
    </table>
  </div>
  <!-- Commit button (conditional) -->
</div>
```

## TableRow Component

Each property row is rendered by the `TableRow` helper:

```tsx
<tr class="flex w-full items-stretch border-x border-b border-gray-200 bg-white first:border-t">
  <th class="flex w-[150px] shrink-0 items-center px-4 py-2 bg-gray-50/50 border-r border-gray-200 select-none">
    <span class="text-[10px] uppercase tracking-wider font-bold text-slate-500 truncate pointer-events-none">
      {optionName}
    </span>
  </th>
  <td class="flex flex-1 items-center px-4 py-1.5 min-h-[38px] text-sm text-slate-700">
    <div class="w-full h-full flex items-center">
      {children}  <!-- editor control -->
    </div>
  </td>
</tr>
```

- Fixed 150px left column for the property name
- Flex-grow right column for the editor control
- Indentation support via `indent` class array (`pl-4`, `pl-8`, `pl-12`, `pl-16`)

## Commit Button

When `onCommit` is provided, a `Button` labeled "Commit Changes" is rendered below the table. Clicking it calls `onCommit` with `stopImmediatePropagation()`.

---

# Event Handling

- **Click propagation** is stopped on the outer container to prevent parent handlers from intercepting property edits.
- **Commit button** fires `onCommit` with `stopImmediatePropagation()` to avoid re-triggering the container's stop handler.
- Each individual editor manages its own `onChange` via the `EditorProps` contract.

---

# Usage Examples

### Basic

```tsx
const myObj = { width: 100, height: 200, visible: true, title: "Hello" }

<PropertyForm obj={myObj} />
```

### With Commit Callback

```tsx
<PropertyForm
  obj={myObj}
  order={["title", "width", "height"]}
  onCommit={() => console.log("Changes committed")}
/>
```

---

# Accessibility

- Uses a native `<table>` structure with `<tr>` / `<th>` / `<td>` elements for proper semantic structure.
- Individual editor controls (Checkbox, NumberField, TextField, etc.) inherit their own accessibility semantics.
- The commit button is a native `<button>` element.

---

# Summary

The PropertyForm component provides:

- Dynamic property inspection and editing of any JavaScript object
- Pluggable editor registry for extensibility
- Reactive re-rendering when the object or its observable properties change
- Table-based layout with property name column and editor column
- Optional commit callback for batch-change workflows
- Works in TSX and Web Component usage
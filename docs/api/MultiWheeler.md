# MultiWheeler API

The **MultiWheeler (Multi-Column Picker Wheel) API** describes the props, rendering logic, and data flow for a multi-column wheel picker. It composes multiple `Wheeler` instances (one per column) into a single popup or inline widget, with an OK/Cancel header bar.

---

# Import

### TSX

```tsx
import { MultiWheeler } from "./MultiWheeler";
```

### Web Component

```ts
import "./MultiWheeler"; // registers <wui-multi-wheeler>
```

---

# Props Overview

| Prop                     | Type                                                       | Default       | Description                                                                 |
| ------------------------ | ---------------------------------------------------------- | ------------- | --------------------------------------------------------------------------- |
| **options**              | `ObservableMaybe<any[][]>`                                 | `[]`          | Array of option arrays, one per wheel column. Each sub-array follows the same format as Wheeler `options`. |
| **value**                | `ObservableMaybe<any[]>`                                   | `[]`          | Array of value observables, one per wheel column. Each entry controls its column's selection. |
| **headers**              | `Array<((v) => JSX.Element) \| undefined>`                 | `[]`          | Array of header render functions, one per wheel column.                     |
| **title**                | `JSX.Element \| null`                                      | `null`        | Static title content rendered in the header bar center.                     |
| **divider**              | `ObservableMaybe<boolean>`                                 | `false`       | When `true`, shows vertical border lines between wheel columns.             |
| **visible**              | `ObservableMaybe<boolean>`                                 | `false`       | Visibility control. Props observable is also written.                       |
| **bottom**               | `ObservableMaybe<boolean>`                                 | `true`        | When `true`, renders as a fixed-position popup at the bottom of the viewport. |
| **ok**                   | `ObservableMaybe<boolean>`                                 | inherited     | When provided, value only commits when this observable becomes `true`.       |
| **cancelOnBlur**         | `ObservableMaybe<boolean>`                                 | inherited     | When `true`, clicking outside hides without saving.                         |
| **commitOnBlur**         | `ObservableMaybe<boolean>`                                 | inherited     | When `true`, clicking outside commits the value and hides.                  |
| **mask**                 | `ObservableMaybe<boolean>`                                 | inherited     | When `true`, shows a semi-transparent backdrop overlay.                     |
| **itemHeight**           | `ObservableMaybe<number>`                                  | `36`          | Passed through to each inner Wheeler.                                      |
| **itemCount**            | `ObservableMaybe<number>`                                  | `5`           | Passed through to each inner Wheeler.                                      |
| **cls**                  | `JSX.Class`                                                | `""`          | Additional CSS classes for the root element.                                |
| **changeValueOnClickOnly** | `ObservableMaybe<boolean>`                               | inherited     | Passed through to each inner Wheeler.                                      |
| **searchable**           | `Array<ObservableMaybe<boolean>>`                          | `[]`          | Array of searchable flags, one per wheel column.                            |
| **searchPlaceholder**    | `Array<ObservableMaybe<string>>`                           | `[]`          | Array of search placeholders, one per wheel column.                         |

Props marked "inherited" are picked from the base Wheeler `def()` via `pick()` and behave identically.

---

# Internal Logic

## Defaults Inheritance

The `def()` function uses `pick()` from the base Wheeler's `def()` to inherit shared props:

```ts
const inheritedKeys = [
  'cls', 'bottom', 'commitOnBlur', 'mask', 'cancelOnBlur',
  'itemHeight', 'itemCount', 'changeValueOnClickOnly', 'ok'
]
```

## Visibility Management

MultiWheeler uses the same pattern as DateTimeWheeler:

- `isVisible` is derived from `visibleProp` via `use()`.
- The `hide()` function sets `isVisible(false)` and, if `visibleProp` is an observable, also writes `false` to it.
- Popup rendering uses a reactive `display: none` style gate rather than a Portal conditional, to avoid a known woby Portal dual-rendering bug.

## Portal Dual-Rendering Workaround

The popup render path does NOT use `Portal` directly for the main content. Instead, it renders a fixed-position overlay inline, gated behind a reactive `style={{ display: ... }}` binding. This avoids a dual-rendering bug in woby's Portal where children appear both inside the portal element (correct) and inline at the parent's position (incorrect). The mask overlay is rendered as a plain `<div>` with `fixed inset-0` positioning.

## Column Composition

Each wheel column is rendered as an independent `<Wheeler>` instance:

```tsx
optionsArray.map((opts, index) => (
  <Wheeler
    header={headerFunc ? (v => headerFunc(v)) : undefined}
    options={opts}
    value={valueObs}
    itemHeight={itemHeight}
    itemCount={itemCount}
    cls={wheelWrapperCls}
    changeValueOnClickOnly={changeValueOnClickOnly}
    bottom={false}
    visible={true}
    searchable={searchableProp}
    searchPlaceholder={searchPlaceholderProp}
  />
))
```

Each inner Wheeler operates independently with its own options, value, and gesture state. The `bottom={false}` and `visible={true}` override ensures each column renders inline and always visible within the MultiWheeler container.

---

# Rendering Behavior

## Popup Layout

```
+--------------------------------------------+
|  [Cancel]  [Title]  [OK]                   |  <- Header bar
+--------------------------------------------+
|  [Column 1] | [Column 2] | [Column 3]      |  <- Wheel columns
+--------------------------------------------+
```

- The header bar has a fixed layout: Cancel button (left, 80px), title center (flex-1), OK button (right, 80px).
- OK click sets `ok(true)` and calls `hide()`.
- Cancel click calls `hide()` without committing.
- Each wheel column receives `wheelWrapperCls` and an optional divider border.

## Popup vs Inline

### Popup (`bottom=true`)

```tsx
<div style={() => $$(isVisible) ? null : { display: 'none' }}>
  {mask overlay}
  <div class="fixed inset-x-0 bottom-0 z-[100] ...">
    <div class="bg-white rounded-lg ...">
      <WheelerContent />
    </div>
  </div>
</div>
```

The outer wrapper is always present in the DOM; visibility is controlled by the reactive `display: none` style. The inner wrapper uses fixed positioning to appear at the bottom of the viewport, with `pointer-events-none` on the container and `pointer-events-auto` on the content to allow click-through on the backdrop.

### Inline (`bottom=false`)

```tsx
<div class="inline-block" style={() => $$(isVisible) ? null : { display: 'none' }}>
  <WheelerContent />
</div>
```

Same visibility gating pattern, but renders inline in the DOM flow.

---

# Event Handling

| Event             | Handler    | Behavior                                                               |
| ----------------- | ---------- | ---------------------------------------------------------------------- |
| **OK click**      | `onClick`  | Sets `ok(true)` via `isObservable` check, then calls `hide()`.         |
| **Cancel click**  | `onClick`  | Calls `hide()` without committing.                                     |
| **Mask click**    | `onClick`  | If `cancelOnBlur` is true, calls `hide()`.                              |
| **Column scroll** | Inner Wheeler | Each inner Wheeler handles its own drag/scroll via its internal gesture system. |

---

# Usage Examples

### Multi-Column Picker (Popup)

```tsx
import { $ } from 'woby'
import { MultiWheeler } from './MultiWheeler'

const columns = [
  ['red', 'green', 'blue'],
  ['small', 'medium', 'large'],
  ['cotton', 'polyester', 'silk'],
]

const col1 = $('red')
const col2 = $('medium')
const col3 = $('cotton')

<MultiWheeler
  options={columns}
  value={[col1, col2, col3]}
  title="Product Options"
  bottom={true}
/>
```

### With Searchable Columns

```tsx
<MultiWheeler
  options={[countries, cities]}
  value={[countryVal, cityVal]}
  searchable={[true, true]}
  searchPlaceholder={["Search country...", "Search city..."]}
  title="Location"
/>
```

### Inline Layout

```tsx
<MultiWheeler
  options={[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]}
  value={[qtyVal]}
  title="Quantity"
  bottom={false}
/>
```

### Web Component

```html
<wui-multi-wheeler
  id="mw"
  options='[["red","green","blue"],["small","large"]]'
  value='["red","small"]'
  title="Pick Options"
></wui-multi-wheeler>

<script>
  const el = document.getElementById('mw');
  // Read current values
  console.log(el.props.value());
  // Set a value for column 0
  el.props.value[0]('blue');
</script>
```

---

# Accessibility

- Each inner Wheeler provides `touch-none` and `cursor-grab` / `cursor-grabbing` interaction.
- The OK and Cancel buttons use the `Button` component with `type="contained"`.
- The header title is rendered inside a `<span>` for screen-reader compatibility.
- The mask overlay has `onClick` for dismiss behavior.

---

# Summary

The MultiWheeler component provides:

- Multi-column wheel picker composing independent Wheeler instances
- Popup (bottom-fixed) and inline layout modes
- Per-column searchable control via `searchable` and `searchPlaceholder` arrays
- OK/Cancel header bar with title
- Reactive `display: none` visibility gating (avoids Portal dual-rendering bug)
- Inherits all Wheeler gesture mechanics (drag, fling, scroll-wheel snap)
- Inherits shared props from the base Wheeler via `pick()`
- Works in TSX and Web Component (`<wui-multi-wheeler>`) usage
# Wheeler API

The **Wheeler (Picker Wheel) API** describes the props, rendering logic, gesture system, and data flow for the base single- and multi-select wheel picker component. It supports drag-based scrolling with velocity fling, mouse-wheel input, and both inline and popup modes.

---

# Import

### TSX

```tsx
import { Wheeler } from "./Wheeler";
```

### Web Component

```ts
import "./Wheeler"; // registers <wui-wheeler>
```

---

# Props Overview

| Prop                     | Type                                                     | Default       | Description                                                                 |
| ------------------------ | -------------------------------------------------------- | ------------- | --------------------------------------------------------------------------- |
| **options**              | `ObservableMaybe<(string \| number \| WheelerItem)[]>`   | `[]`          | Data items. Strings/numbers are normalized to `{value, label}` objects.     |
| **value**                | `ObservableMaybe<any>`                                   | `null`        | Currently selected value (single-select) or array of values (multi-select). |
| **itemHeight**           | `ObservableMaybe<number>`                                | `36`          | Height of each item in pixels.                                              |
| **itemCount**            | `ObservableMaybe<number>`                                | `5`           | Number of visible items (must be odd; even values are auto-incremented).    |
| **cls**                  | `JSX.Class`                                              | `""`          | Additional CSS classes for the root element.                                |
| **header**               | `(v) => JSX.Element`                                     | `undefined`   | Render function for the header label above the wheel.                       |
| **all**                  | `ObservableMaybe<string>`                                | `null`        | When set, enables multi-select mode with a "Select All" checkbox label.     |
| **ok**                   | `ObservableMaybe<boolean>`                               | `null`        | When passed, value only commits when this observable becomes `true`.        |
| **visible**              | `ObservableMaybe<boolean>`                               | `true`        | Visibility control. Props observable is also written.                       |
| **bottom**               | `ObservableMaybe<boolean>`                               | `true`        | When `true`, renders as a fixed-position popup at the bottom of the viewport. |
| **cancelOnBlur**         | `ObservableMaybe<boolean>`                               | `true`        | When `true`, clicking outside hides the wheeler without saving.             |
| **commitOnBlur**         | `ObservableMaybe<boolean>`                               | `false`       | When `true`, clicking outside commits the value and hides.                  |
| **mask**                 | `ObservableMaybe<boolean>`                               | `true`        | When `true`, shows a semi-transparent backdrop overlay.                     |
| **changeValueOnClickOnly** | `ObservableMaybe<boolean>`                             | `false`       | When `true`, scroll-wheel interaction does not update the parent value.     |
| **searchable**           | `ObservableMaybe<boolean>`                               | `false`       | When `true`, shows a search input field to filter/find items.               |
| **searchPlaceholder**    | `ObservableMaybe<string>`                                | `undefined`   | Custom placeholder for the search input.                                    |

## WheelerItem Type

```ts
type WheelerItem<T = unknown> = {
  value: T;
  label: string | number;
  component?: (props: { itemHeight: number; value: WheelerItem; index: number }) => JSX.Child;
  hasComponent?: boolean;
};
```

---

# Internal Logic

## ActiveWheelers Singleton

A module-level observable array `ActiveWheelers` tracks all currently visible Wheeler instances. Each Wheeler registers itself on show and unregisters on hide. This enables global coordination (e.g., closing other wheelers when one opens).

```ts
export const ActiveWheelers = $([])
```

## Drag Physics

The wheel column uses a direct-manipulation drag model with momentum fling:

- **handleStart**: Records initial pointer Y, list translateY, and timestamp. Cancels any pending snap timeout. Disables CSS transitions for immediate response.
- **handleMove**: Calculates delta from start position. Applies a rubber-band effect (30% resistance) when dragged past content boundaries. Tracks velocity (px/ms) over 10ms intervals for fling calculation. Uses `requestAnimationFrame` to batch DOM updates.
- **handleEnd**: If the gesture was a tap (under 5px threshold), finds the clicked item via `composedPath()` and snaps to it. If a drag/fling, computes an inertia-based coast distance (`velocity * 120`) and snaps to the nearest item index.

## Wheel Snapping

The `snapToIndex` function animates the list to center a given item:

1. Clamps the index to valid bounds.
2. Calculates the target `translateY` via `getTargetYForIndex`.
3. Applies a CSS `transform` transition (`0.3s ease-out`).
4. After the animation completes (310ms timeout), commits the `selectedIndex` and updates item styles.

## Scroll Wheel Input

The `handleWheel` handler captures mouse wheel events with debouncing:

1. Prevents default page scroll.
2. Applies direct movement (deltaY * 0.5 sensitivity) with CSS transitions disabled.
3. Schedules a debounced snap (150ms timeout) after the user stops scrolling.

## Item Style Management

The `updateItemStyles` function dynamically highlights the item nearest the viewport center. It uses `getBoundingClientRect()` to measure each item's position relative to the viewport and applies/removes CSS classes (`is-near-center`, `opacity-100`, `font-bold`, `text-[#007bff]`, `scale-100`) based on proximity.

## Multi-Select Mode

When the `all` prop is provided, the Wheeler operates in multi-select mode:

- A "Select All" checkbox is prepended to the options list.
- Each item renders with a checkbox.
- The `value` prop holds an array of selected values.
- **`value2chk`**: Synchronizes the `value` prop down to individual checkbox states (top-down data flow).
- **`chk2value`**: Fires on checkbox click, cascades state (e.g., "All" toggles all), and computes the new value array (bottom-up data flow).
- **`toggleAll`**: Selects or deselects all items at once.
- The `ok` prop gates the commit: when provided, `chk2value` only updates the internal `value`; the parent `oriValue` is updated only when `ok` becomes `true`.

## `useClickAway` Integration

The component uses `useClickAway` on the root element. On outside click:

- `cancelOnBlur`: Hides the wheeler, discarding the current selection.
- `commitOnBlur`: Commits the current value (via `ok(true)` if an `ok` observable exists, or directly on `oriValue`) and hides.

## Search

When `searchable` is `true`, a text input appears below the header. The `search` function performs a case-insensitive substring match on item labels. On match, it updates both the internal `value` and the parent `oriValue`, causing the wheel to snap to the matching item.

---

# Rendering Behavior

## Single-Select Wheel

```
+---------------------------+
|  [Header]                 |
|  +---------------------+  |
|  |  (padding item)     |  |  <- invisible
|  |  (padding item)     |  |  <- invisible
|  |  Item 1             |  |
|  |  Item 2             |  |  <- centered (selected)
|  |  Item 3             |  |
|  |  (padding item)     |  |  <- invisible
|  |  (padding item)     |  |  <- invisible
|  +---------------------+  |
|  [Selection Indicator]    |  <- blue highlight bar
+---------------------------+
```

- The viewport height is `itemHeight * itemCount`.
- Padding items (floor(itemCount/2) on each side) allow the first and last real items to scroll to center.
- The selection indicator is a semi-transparent blue bar positioned at the vertical center of the viewport.

## Popup vs Inline

- `bottom=true` (default): Renders inside a `Portal` mounted to `document.body` as a fixed-position bottom panel, with an optional backdrop mask.
- `bottom=false`: Renders inline at the component's position in the DOM flow.

## Render Modes

```
return () => {
  return !$$(isVisible) ? null
    : $$(bottom) ? renderAsPopup()
    : renderAsInline()
}
```

---

# Event Handling

| Event               | Handler        | Behavior                                                                 |
| ------------------- | -------------- | ------------------------------------------------------------------------ |
| **pointerdown**     | `handleStart`  | Initializes drag state, records anchor positions, disables transitions.  |
| **pointermove**     | `handleMove`   | Calculates delta, applies rubber-band at boundaries, tracks velocity.    |
| **pointerup**       | `handleEnd`    | Determines tap vs fling, snaps to nearest item, commits selection.       |
| **wheel**           | `handleWheel`  | Applies direct scroll movement, debounces snap to nearest item.          |
| **click away**      | `useClickAway` | Hides or commits based on `cancelOnBlur` / `commitOnBlur`.               |
| **ok change**       | `useEffect`    | When `ok` becomes `true`, commits value to `oriValue` and hides.         |
| **value change**    | `useEffect`    | Updates `selectedIndex` to match the external `value` prop.              |
| **selectedIndex**   | `useEffect`    | Propagates index change to `value` and triggers `snapToIndex`.           |

---

# Usage Examples

### Single-Select (Inline)

```tsx
import { $ } from 'woby'
import { Wheeler } from './Wheeler'

const value = $('apple')

<Wheeler
  options={['apple', 'banana', 'cherry', 'date', 'elderberry']}
  value={value}
  itemHeight={36}
  itemCount={5}
  bottom={false}
/>
```

### Single-Select (Popup with OK button)

```tsx
import { $ } from 'woby'
import { Wheeler } from './Wheeler'

const value = $('medium')
const ok = $(false)

<Wheeler
  options={['small', 'medium', 'large', 'x-large']}
  value={value}
  ok={ok}
  header={v => `Size: ${v}`}
  bottom={true}
/>

<button onClick={() => ok(true)}>OK</button>
```

### Multi-Select with Checkboxes

```tsx
import { $ } from 'woby'
import { Wheeler } from './Wheeler'

const value = $(['apple', 'cherry'])
const ok = $(false)

<Wheeler
  options={['apple', 'banana', 'cherry', 'date']}
  value={value}
  all="All"
  ok={ok}
  header={v => `Selected: ${v}`}
  bottom={true}
/>
```

### Web Component

```html
<wui-wheeler
  id="myWheeler"
  options='["red","green","blue","yellow"]'
  value="green"
  item-count="5"
  item-height="36"
  bottom="false"
></wui-wheeler>

<script>
  const el = document.getElementById('myWheeler');
  // Read value
  console.log(el.props.value());
  // Set value
  el.props.value('blue');
</script>
```

### Searchable Wheeler

```tsx
<Wheeler
  options={['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola']}
  value={value}
  searchable={true}
  searchPlaceholder="Search countries..."
  bottom={false}
/>
```

---

# Accessibility

- The Wheeler viewport is a `<div>` with `touch-none` and `cursor-grab` / `cursor-grabbing` classes.
- Items are rendered as `<li>` elements inside a `<ul>`.
- Multi-select mode uses native `<input type="checkbox">` elements with labels.
- The search input is a standard `<input type="text">` with `onInput` handling.
- Disabled items (in date/time contexts) are excluded from options rather than rendered as disabled.

---

# Summary

The Wheeler component provides:

- Drag-based wheel picker with momentum fling and rubber-band boundaries
- Single-select (spinning wheel) and multi-select (checkbox list) modes
- Popup (bottom-fixed) and inline layout variants
- Scroll-wheel input with debounced snap
- Search/filter capability for long lists
- Value commit gating via `ok` observable, `cancelOnBlur`, and `commitOnBlur`
- Global `ActiveWheelers` singleton for coordination across instances
- Custom header rendering and full styling via `cls`
- Works in TSX and Web Component (`<wui-wheeler>`) usage
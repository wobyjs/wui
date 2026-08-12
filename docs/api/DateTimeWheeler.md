# DateTimeWheeler API

The **DateTimeWheeler API** describes the props, rendering logic, and data flow for the date/time picker component. It composes multiple `Wheeler` instances (one per date/time field) into a single popup or inline widget with OK/Cancel controls and min/max date constraints.

---

# Import

### TSX

```tsx
import { DateTimeWheeler } from "./DateTimeWheeler";
```

### Web Component

```ts
import "./DateTimeWheeler"; // registers <wui-datetime-wheeler>
```

---

# Props Overview

| Prop                     | Type                                                           | Default                 | Description                                                                 |
| ------------------------ | -------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------- |
| **value**                | `ObservableMaybe<Date>`                                        | `new Date()`            | The currently selected date/time. ISO strings from HTML attributes are parsed. |
| **mode**                 | `ObservableMaybe<DateTimeWheelerType>`                          | `"datetime"`            | Which fields to show: `'year'`, `'month'`, `'date'`, `'time'`, `'datetime'`, `'hour'`. |
| **minDate**              | `ObservableMaybe<Date \| string>`                               | `new Date(1900, 0, 1)`  | Minimum selectable date. Earlier dates are disabled at the option level.    |
| **maxDate**              | `ObservableMaybe<Date \| string>`                               | `new Date(2100, 11, 31)`| Maximum selectable date. Later dates are disabled at the option level.      |
| **yearRange**            | `ObservableMaybe<{ start: number, end: number }>`              | `{ start: 1900, end: currentYear + 20 }` | Year range bounds for the year wheel. |
| **divider**              | `ObservableMaybe<boolean>`                                     | `true`                  | When `true`, shows vertical border lines between wheel columns.             |
| **title**                | `(d: Date) => JSX.Element`                                     | `undefined`             | Custom render function for the header title. Defaults to `modDate.toString().slice(0, 24)`. |
| **header**               | `(props: { ok, cancel, visible }) => JSX.Element`              | `undefined`             | Custom render function replacing the entire header bar (OK/Cancel buttons). |
| **cls**                  | `JSX.Class`                                                    | `""`                    | Overrides the base class entirely (replace, not append).                    |
| **class**                | `string`                                                       | `""`                    | Appended to the resolved class (extend, never replace).                     |
| **visible**              | `ObservableMaybe<boolean>`                                     | `true`                  | Visibility control. Props observable is also written.                       |
| **bottom**               | `ObservableMaybe<boolean>`                                     | `true`                  | When `true`, renders as a Portal-mounted popup at the bottom.               |
| **ok**                   | `ObservableMaybe<boolean>`                                     | `true`                  | When truthy (default), value only commits via OK button. When `"false"`, reactive mode: every scroll/tap commits immediately; Cancel reverts. |
| **cancelOnBlur**         | `ObservableMaybe<boolean>`                                     | `false`                 | When `true`, clicking outside triggers Cancel (revert + hide).              |
| **commitOnBlur**         | `ObservableMaybe<boolean>`                                     | `false`                 | When `true`, clicking outside commits the value and hides.                  |
| **mask**                 | `ObservableMaybe<boolean>`                                     | `true`                  | When `true`, shows a semi-transparent backdrop overlay.                     |
| **itemHeight**           | `ObservableMaybe<number>`                                      | `36`                    | Passed through to each inner Wheeler.                                      |
| **itemCount**            | `ObservableMaybe<number>`                                      | `5`                     | Passed through to each inner Wheeler.                                      |
| **changeValueOnClickOnly** | `ObservableMaybe<boolean>`                                   | `false`                 | Passed through to each inner Wheeler.                                      |

## DateTimeWheelerType

```ts
type DateTimeWheelerType = 'year' | 'month' | 'date' | 'time' | 'datetime' | 'hour'
```

### Field Visibility by Mode

| Mode         | Year | Month | Day | Hour | Minute | Second |
| ------------ | ---- | ----- | --- | ---- | ------ | ------ |
| `year`       | Yes  |       |     |      |        |        |
| `month`      | Yes  | Yes   |     |      |        |        |
| `date`       | Yes  | Yes   | Yes |      |        |        |
| `time`       |      |       |     | Yes  | Yes    | Yes    |
| `datetime`   | Yes  | Yes   | Yes | Yes  | Yes    | Yes    |
| `hour`       |      |       |     | Yes  |        |        |

---

# Internal Logic

## Defaults Inheritance

The `def()` function uses `pick()` from the base Wheeler's `def()` to inherit shared props:

```ts
const inheritedKeys = [
  'cls', 'bottom', 'commitOnBlur', 'ok', 'visible', 'mask',
  'cancelOnBlur', 'itemHeight', 'itemCount', 'changeValueOnClickOnly'
]
```

These are spread after the component-specific defaults so that `ok` defaults to `true` (DateTimeWheeler's override) instead of the base Wheeler's `null`.

## `ok` Truthy vs Falsy (Reactive Mode)

- **`ok` truthy (default)**: The main `value` only updates when the user clicks **OK**. Scroll/tap interactions update the internal `modDate` but do not propagate to the parent's `oriDate`.
- **`ok` falsy (reactive mode)**: Every scroll wheel change or tap on a value immediately commits to the parent's `oriDate`. The **Cancel** button reverts to the value captured in the `openSnapshot` when the wheeler opened.

## Open Snapshot for Revert

When the wheeler becomes visible, the current `oriDate` value is captured into `openSnapshot`. This is used:
- In reactive mode: Cancel reverts `modDate` and `oriDate` back to the snapshot.
- On reopen: The individual wheel states are re-initialized from the snapshot.

The snapshot is taken inside a `useEffect` that watches `isVisible`, using `untrack` to avoid capturing the reactive dependency chain.

## Central Date State

The component maintains a single central `modDate` observable. Individual wheel states (`selectedYear`, `selectedMonth`, `selectedDay`, `selectedHour`, `selectedMinute`, `selectedSecond`) are derived from it.

### Top-Down Sync (modDate -> Wheels)

A `useEffect` runs after every render, checking if each wheel's state is out of sync with `modDate`. It uses `untrack()` to read observable values without creating dependencies, preventing infinite loops. Day values are clamped to the valid range for the new month/year.

### Bottom-Up Sync (Wheels -> modDate)

A separate `useEffect` reads all wheel states, validates the combined date, and updates `modDate`:

1. **Day clamping**: If the selected day is beyond the days in the new month (e.g., Feb 30), it clamps the day and exits early. The effect re-runs with the corrected day.
2. **Min/Max constraints**: If the constructed date is outside `minDate` or `maxDate`, it clamps to the boundary and synchronizes all wheel states to the constrained date.
3. **Commit**: Updates `modDate`. In reactive mode (`ok` falsy), also writes to `oriDate` immediately.

## Option Generation

Each wheel column's options are generated from `useMemo`:

- **yearOptions**: Builds from `yearRange.start` to `yearRange.end`, further constrained by `minDate`/`maxDate` year limits.
- **monthOptions**: Generates 12 months, disabling those outside `minDate`/`maxDate` for the selected year.
- **dayOptions**: Generates 1 to `daysInMonth`, disabling days outside `minDate`/`maxDate` for the selected year/month.
- **hourOptions**: 0-23 with zero-padded labels.
- **minuteOptions**: 0-59 with zero-padded labels.
- **secondOptions**: 0-59 with zero-padded labels.

## Helper Functions

```ts
const padZero = (num: number): string => (num < 10 ? '0' : '') + num
const getDaysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate()
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const parseDate = (dateInput: Date | string | null | undefined): Date | null
```

---

# Rendering Behavior

## Layout

```
+--------------------------------------------+
|  [Cancel]  [Title / Live Date]  [OK]       |  <- Header bar
+--------------------------------------------+
|  [Year] | [Month] | [Day] | [Hour] | [Min] |  <- Wheel columns (varies by mode)
+--------------------------------------------+
```

- Each field is rendered as a `<Wheeler>` instance with `bottom={false}`, `cancelOnBlur={false}`, and `visible={true}`.
- Vertical dividers (border-left) separate columns when `divider` is `true`.
- The default header bar shows Cancel and OK buttons with the live date (updates as the user scrolls) in the center.

## Popup vs Inline

### Portal Path (`bottom=true`)

```tsx
<Portal mount={document.body} when={isVisible}>
  {() => !$$(isVisible) ? null : [
    mask overlay,
    fixed bottom panel with component
  ]}
</Portal>
```

The Portal's `when` prop controls attachment/removal. The children thunk provides reactive visibility gating: when hidden, the thunk returns null so no popup DOM is rendered.

### Inline Path (`bottom=false`)

No Portal wrapper. The component is returned directly as a `<div>` with a reactive `display: none` style binding. This avoids a known bug where Portal's `disposeRender()` would break the `useMemo` -> null -> DOM propagation chain.

## Class Policy

- `cls` overrides the base `DATETIME_WHEELER_CLS` entirely (replace).
- `class` is appended to the resolved class (extend, never replace).

---

# Event Handling

| Event             | Handler            | Behavior                                                                 |
| ----------------- | ------------------ | ------------------------------------------------------------------------ |
| **OK click**      | `handleOkClick`    | Commits `modDate` to `oriDate` and hides.                                |
| **Cancel click**  | `handleCancelClick`| Reverts `modDate` to `openSnapshot`. In reactive mode, also reverts `oriDate`. Hides. |
| **Click away**    | `useClickAway`     | `cancelOnBlur`: triggers Cancel. `commitOnBlur`: commits and hides.     |
| **Wheel scroll**  | Inner Wheeler      | Each inner Wheeler handles its own drag/scroll via its internal gesture system. |

---

# Usage Examples

### Basic Date Picker (Popup)

```tsx
import { $ } from 'woby'
import { DateTimeWheeler } from './DateTimeWheeler'

const date = $(new Date())

<DateTimeWheeler
  value={date}
  mode="date"
  bottom={true}
/>
```

### Date-Time Picker with Constraints

```tsx
const date = $(new Date())

<DateTimeWheeler
  value={date}
  mode="datetime"
  minDate={new Date(2024, 0, 1)}
  maxDate={new Date(2026, 11, 31)}
  yearRange={{ start: 2020, end: 2030 }}
/>
```

### Time Picker (Hour + Minute + Second)

```tsx
<DateTimeWheeler
  value={time}
  mode="time"
  bottom={true}
/>
```

### Reactive Mode (No OK button, instant commit)

```tsx
const date = $(new Date())

<DateTimeWheeler
  value={date}
  mode="date"
  ok={false}
  bottom={false}
/>
```

### Custom Header

```tsx
<DateTimeWheeler
  value={date}
  header={({ ok, cancel }) => (
    <div class="flex justify-between p-2 bg-blue-100">
      <button onClick={cancel}>Cancel</button>
      <span>Pick a Date</span>
      <button onClick={ok}>Confirm</button>
    </div>
  )}
/>
```

### Custom Title

```tsx
<DateTimeWheeler
  value={date}
  title={d => <span class="font-bold">{d.toLocaleDateString()}</span>}
/>
```

### Web Component

```html
<wui-datetime-wheeler
  id="dtw"
  mode="date"
  min-date="2024-01-01"
  max-date="2026-12-31"
  value="2025-06-15"
></wui-datetime-wheeler>
```

---

# Accessibility

- Each inner Wheeler provides `touch-none` and `cursor-grab` / `cursor-grabbing` interaction.
- OK and Cancel buttons are native `<button>` elements with hover styles.
- The header title is rendered inside a `<span>` for screen-reader compatibility.
- Disabled date options (outside min/max range) are excluded from the options array entirely.

---

# Summary

The DateTimeWheeler component provides:

- Composable date/time picking with 6 mode variants (year, month, date, time, datetime, hour)
- Min/max date constraints with per-field option disabling
- Year range configuration independent of min/max bounds
- OK/Cancel header bar with snapshot-based revert for reactive mode
- Responsive popup (Portal) and inline layout modes
- Reactive mode for instant commit without OK gating
- Custom header and title render functions
- Inherits all Wheeler gesture mechanics (drag, fling, scroll-wheel snap)
- Works in TSX and Web Component (`<wui-datetime-wheeler>`) usage
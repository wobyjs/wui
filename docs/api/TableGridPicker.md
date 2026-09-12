# 🧩 TableGridPicker API

The size picker every office suite has: a grid of empty squares you sweep a pointer across, where
the highlighted rectangle **is** the table you are about to get.

It is the editor's **Insert → Table** panel, exported so a host's own menu can reuse it.

---

# 📦 Import

```tsx
import { TableGridPicker, type TableGridPickerProps } from "@woby/wui";
```

A plain TSX component — no custom element, because it is a panel inside a menu, not a block in a
document.

---

# 🧭 Props Overview

| Prop | Type | Description |
| --- | --- | --- |
| **onPick** | `(rows: number, cols: number) => void` | Called with the chosen size. **Rows first**, matching the insert helpers. |
| **onCancel** | `() => void` | Escape, or the back button. The host decides whether that means "close" or "go back". |

---

# ⚙️ Why it replaced `prompt()`

Two stacked `prompt()` boxes were wrong for more than looks. A native prompt is **modal to the
whole page**, so it tore the caret out of the editor and forced the insert path to re-seat a saved
range afterwards.

Nothing in this panel takes focus: the menu hosting it already cancels the default action of its
`mousedown`, so the `contenteditable` surface keeps both focus and selection while the user picks,
and the insert runs against a **live caret**.

---

# 📐 The expanding grid

| Constant | Value | Meaning |
| --- | --- | --- |
| `MIN_COLS` × `MIN_ROWS` | 8 × 6 | Smallest grid ever shown, so the panel does not jitter at small sizes |
| `MAX_COLS` × `MAX_ROWS` | 16 × 16 | Largest offered — past this, add rows from the table's own popup menu |
| `CELL` | 16 px | Cell box |
| `GAP` | 3 px | Gap between cells |
| `PITCH` | 19 px | `CELL + GAP` — what the hit test divides by |

The grid always shows one more row and column than the furthest one touched, and shrinks back as
the pointer comes in. That is the Docs behaviour rather than Word's fixed 10×8 — a fixed grid
would put "more than eight rows" behind a second dialog, which is the thing being removed.

Hover state starts at `0 × 0`, meaning "nothing aimed at yet": the label starts blank and the
first arrow key lands on 1×1 rather than 1×2.

---

# 🖱️ One listener instead of 256

Every cell is a plain `<div>` with no handler of its own. The panel listens for **`pointermove`
once, on the container**, and turns the coordinate into a row and column by dividing by the pitch:

```ts
const col = clamp(Math.floor(x / PITCH) + 1, 1, MAX_COLS)
const row = clamp(Math.floor(y / PITCH) + 1, 1, MAX_ROWS)
```

That is cheaper than 256 listeners, it cannot miss a cell during a fast sweep, and — because the
cells carry no state — growing the grid does not have to re-bind anything.

Three deliberate choices sit underneath:

- **Pointer events, not mouse or touch.** One code path covers mouse, pen and finger, and a
  dragged finger highlights exactly the way a dragged mouse does.
- **Cells are shown and hidden by reactive `style`, never re-created**, so a sweep never rebuilds
  the DOM under the pointer.
- **Geometry is inline style, not Tailwind classes.** The column count is a runtime number, and a
  class name built at runtime is never seen by the build-time class scan.

---

# ⌨️ Keyboard

Arrow keys move the selection, `Enter` picks, `Escape` calls `onCancel`. The readout below the
grid names the current size (`3 × 4`), so the keyboard path is not a guess.

---

# 🧪 Usage Example

```tsx
import { TableGridPicker } from "@woby/wui";

<TableGridPicker
    onPick={(rows, cols) => insertTable(rows, cols)}
    onCancel={() => backToMenu()}
/>
```

---

# 📝 Summary

TableGridPicker provides:

- **A sweep-to-size grid** in place of two native prompts that stole the caret
- **Growth to 16×16**, so large tables need no second dialog
- **One `pointermove` listener**, not one per cell — no missed cells on a fast sweep
- **Pointer events only**, so finger and pen behave exactly like a mouse
- **Runtime geometry in inline style**, because Tailwind cannot see a class name built at runtime

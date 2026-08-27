# 🧭 NodeNavigation API

Keyboard navigation between the **boxes** in an editor document — embedded components and
images — as opposed to the caret navigation the browser gives you between characters.

A caret cannot live inside a shadow host, so once a component is selected the arrow keys
have nothing useful to do natively: the browser either drops the selection or steps the
caret past the whole component in one go. This module makes the arrows step from component
to component instead, and gives `Enter` something to do as well — open a fresh line
underneath the selected component, which is otherwise surprisingly hard to reach when a
component is the last thing in the document.

`data-element-selected` stays the single source of truth for what is selected; nothing here
holds state of its own. Callers move the mark, this module only says where to.

---

# 📦 Import

```ts
import {
    arrowDirection,
    navigableBoxes,
    navigateFrom,
    insertLineAfter,
    placeCaretIn,
} from "@woby/wui";
import type { NavDirection } from "@woby/wui";
```

---

# 🧩 Exports

| Export             | Signature                                                                        | Description                                              |
| ------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **NavDirection**   | `'prev' \| 'next' \| 'up' \| 'down'`                                            | The four directions navigation understands               |
| **arrowDirection** | `(key: string) => NavDirection \| null`                                          | Maps a `KeyboardEvent.key` to a direction, else `null`    |
| **navigableBoxes** | `(surface: HTMLElement) => HTMLElement[]`                                        | Every box navigation stops on, in document order         |
| **navigateFrom**   | `(current: HTMLElement, dir: NavDirection, boxes: HTMLElement[]) => HTMLElement \| null` | The box an arrow key moves to                     |
| **insertLineAfter**| `(el: HTMLElement, surface: HTMLElement) => HTMLElement \| null`                 | Inserts an empty `<p>` immediately after `el`            |
| **placeCaretIn**   | `(line: HTMLElement) => void`                                                    | Puts the caret at the start of `line`                    |

---

# ⚙️ Internal Logic Overview

## What counts as a navigable box

`navigableBoxes` uses the same test the capture-phase `pointerdown` handler in `Editor.tsx`
uses to decide what a click selects — a registered plugin tag, or any other custom element
that is not one of the editor's own `wui-` chrome — plus images, which are selectable by
clicking too but through `ImageResizer` rather than through the mark.

Two things are skipped:

- Anything `deleteRefusalReason` rejects: the document root, table structure, the internals
  of a component. Landing on one would be a selection that does nothing.
- Zero-sized boxes. There is nothing on screen to show as selected.

## How the arrows choose

**Left / right** walk the list in document order, which is the order the boxes are read in
and the only order that can reach every one of them.

**Up / down** are geometric: the nearest box wholly above or below the current one, ties
broken on horizontal distance, so a grid or a row of side-by-side components behaves the
way it looks rather than the way it is nested. A box that merely overlaps the current row is
neither above nor below it — which is also what keeps an ancestor or a descendant, whose
rect always overlaps, out of the running. When nothing qualifies (the current box is on the
last row) they fall back to document order, so the keys are never dead.

`current` need not itself be navigable. The property panel's parent arrow can park the mark
on a plain container; that case enters the list at the container's document position instead
of failing.

## Where the new line goes

`insertLineAfter` inserts in `el`'s **own parent**, so a component nested in a container gets
its line inside that container, next to it. Selecting the container itself with the property
panel's parent arrow is how you ask for a line after the whole row.

The insertion point moves only where the markup would otherwise be invalid — a paragraph
inside a paragraph, a heading or a `<span>` is phrasing content in a place that takes none,
and the next parse tears it back out; a paragraph inside a list or a table is the opposite
problem, since those containers take only `li`, `tr`, `dt`/`dd`. Both kinds are climbed past,
up to the nearest ancestor that can legally hold the line. The surface always stops the
climb; it is a flow container by construction.

The inserted `<p>` contains a `<br>`. That filler is what makes the paragraph reachable: an
empty block has zero height and the caret cannot be placed in it. Browsers write the same
filler themselves when `Enter` splits a paragraph.

## Why `window.getSelection()`

`placeCaretIn` uses `window.getSelection()`, never the shadow root's. Chrome's
`ShadowRoot.getSelection` is non-standard and a range set through it does not move the
visible caret — the same choice `deleteSelectedElement` documents.

---

# 🧪 Usage Examples

### Wiring the arrows to the mark

```ts
const dir = arrowDirection(e.key);
if (dir && marked) {
    const next = navigateFrom(marked, dir, navigableBoxes(surface));
    if (next) {
        e.preventDefault();
        select(next); // move `data-element-selected`
    }
}
```

### Opening a line under the selection

```ts
if (e.key === "Enter" && marked) {
    const line = insertLineAfter(marked, surface);
    if (line) {
        e.preventDefault();
        clearSelection();
        placeCaretIn(line);
    }
}
```

### Getting a caret between two adjacent components

Two components side by side leave nowhere to click. Select a neighbour, arrow onto the first
of the pair, and press `Enter`:

```html
<wui-text-field label="Name"></wui-text-field>
<wui-text-area label="Notes"></wui-text-area>
```

Clicking `wui-text-field` focuses its own `<input>`, and `Enter` then belongs to the field
(see **editsInPlace** in [Editor.md](./Editor.md)). Arrowing onto it marks it *without*
focusing it, so `Enter` reaches the editor and the new `<p>` lands between the two.

---

# 📝 Summary

`NodeNavigation` gives the arrow keys and `Enter` a job in the one place the browser has
none: around a shadow host the caret cannot enter. It is pure geometry and document order
over a mark held elsewhere, which keeps it independently testable and leaves selection
policy with the editor.

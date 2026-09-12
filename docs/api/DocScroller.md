# 🧩 DocScroller API

The **DocScroller** is the navigation rail beside the editor surface, and `ScrollerToggle` is the
toolbar button that shows it.

A long document has two navigation problems and they are not the same problem, so the rail
answers them with two different panels and picks between them by layout mode.

---

# 📦 Import

### TSX

```tsx
import { DocScroller, ScrollerToggle, scrollerOpen, toggleScroller } from "@woby/wui";
```

### Web Component

```ts
import "@woby/wui"; // registers <wui-doc-scroller> and <wui-scroller-toggle>
```

---

# 🧭 Props Overview

Both components take only the class slots:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| **cls** | `JSX.Class` | `""` | **Overrides** the base class when non-empty. |
| **class** | `JSX.Class` | `""` | **Appends** extra classes. |

## Module surface

| Export | Type | Description |
| --- | --- | --- |
| `scrollerOpen` | `Observable<boolean>` | Whether the rail is showing. Read it, write it, bind to it. |
| `toggleScroller` | `() => void` | Flip the rail. |
| `DocScroller` | component | The rail. Place it beside the surface. |
| `ScrollerToggle` | component | The toolbar button. |

`scrollerOpen` is module-level for the same reason `editorLayout` is: the toolbar button and the
rail live in different subtrees of the editor and neither is the other's parent, so a prop could
not reach across.

---

# ⚙️ Two panels, one rail

| Layout | Panel | Unit | Tooltip |
| --- | --- | --- | --- |
| `page` | **Thumbnails** | One miniature per sheet | *Page thumbnails* |
| `flow`, `screen` | **Fisheye map** | One thin row per top-level block | *Document map* |

Once a document has been cut into sheets, the sheet **is** the unit a reader thinks in — "the
table is on page 4" — so the rail draws one miniature per sheet and jumps to it.

In `flow` and `screen` there are no pages to count, so the rail lists the document's top-level
blocks instead, one thin row each, and magnifies the few under the pointer into readable text.
That is the point of a fisheye: the overview and the detail are the same strip, so finding a
paragraph never costs you the sense of where it sits in the whole.

---

# 🖼️ Wireframes, not clones

The obvious thumbnail is `sheet.cloneNode(true)` shrunk down, and it is wrong here for the reason
PageLayout gives for never cloning: a custom element is its tag plus its attributes, so a clone is
not a cheap copy of something already rendered — it is a **second component** that constructs
itself from scratch and re-resolves every context-sensitive attribute against wherever the copy
landed. A rail of twenty thumbnails would be twenty extra live copies of every banner, image and
table in the document.

So a thumbnail is **measured** instead. Each top-level block on the sheet contributes one
rectangle at its own fractional position, tinted by what kind of block it is:

```ts
type Box = { top: number, height: number, left: number, width: number, kind: Kind }
```

Those measurements are **ratios of the sheet's own box**, which makes them immune to whatever
`zoom` the surface is under — the same trick PageLayout's overflow test uses.

## The six kinds

| Kind | Tint | Matched by |
| --- | --- | --- |
| `heading` | `#475569` | `H1`–`H6` |
| `text` | `#cbd5e1` | anything else |
| `media` | `#60a5fa` | `IMG`, `FIGURE`, or contains an `img` |
| `table` | `#a78bfa` | `TABLE`, or contains a `table` |
| `component` | `#34d399` | **a hyphen in the tag name** — the spec-guaranteed marker of a custom element, so every plugin block a host ever registers is covered without a list |
| `break` | `#f59e0b` | `HR` |

Six kinds, because six is about what anyone can tell apart at thumbnail size. The colour is not
there to name the element — it is there to make "the page with the picture on it" findable
without reading anything.

---

# 🔍 The lens does not move the rows

A classic fisheye grows the row under the pointer, which moves its neighbours, which puts a
different row under the pointer, which grows **that** one — dock-icon jitter.

Here the rows are a **fixed height** and the magnification is *typographic*: type size, bar and
contrast grow; vertical position never does. So the row under the pointer is the row you clicked,
the map from rail position to document position stays linear, and there is no feedback loop to
damp.

```ts
const SIGMA = 2.2   // in rows — the lens covers about five
const weightAt = (i, focus) => Math.exp(-((i - focus) ** 2) / (2 * SIGMA * SIGMA))
const ROW_H   = 16  // px, fixed
const THUMB_W = 104 // px; thumbnail height follows the configured paper's aspect
```

A gaussian, so the falloff is smooth and leaves no edge for the eye to catch. At `SIGMA = 2.2` the
lens covers about five rows — enough to read a heading and the paragraph under it without the rail
turning back into a list.

---

# 🧩 Render Structure

The rail is **two boxes, not one**:

```
<aside>                    outer — a flex item, height comes from the editor row
  <div>                    inner — position:absolute, inset 0, overflow-y:auto
    …rows or thumbnails…
```

A single scrolling flex item sizes itself to its content and then grows the row it is in, so the
rail would push the editor taller instead of scrolling. The outer box takes its height from the
flex row; the inner box is taken out of flow so it can only ever fill that height, and scrolls
when its content exceeds it. The scrollbar therefore appears exactly when it is needed and never
otherwise, and the rail hides and shows with the editor rather than outliving it.

Revealing the active row uses a hand-rolled `nearest` scroll rather than `scrollIntoView`: the
native one scrolls **every** scrollable ancestor, which in `page` mode means the document surface
jumps too — the rail would drag the page it is meant to be pointing at.

## Finding the surface

`findSurface` climbs from the rail's parent until an ancestor contains a `[data-editor-root]`.
The rail may be a sibling of the surface, a cousin one wrapper out, or a free-standing custom
element the host placed itself; the climb covers all three without any of them having to agree on
a structure first.

---

# 🧪 Usage Examples

## TSX

```tsx
<div class="flex flex-row gap-2 h-full">
    <DocScroller />
    <div data-editor-root>…</div>
</div>
```

With the toggle in your own toolbar:

```tsx
<ScrollerToggle />
```

## HTML

```html
<wui-doc-scroller></wui-doc-scroller>
```

## Driving it from a host

```ts
import { scrollerOpen, toggleScroller } from "@woby/wui";

toggleScroller();
scrollerOpen(true);   // or set it outright
```

---

# ♿ Accessibility

- The toggle is a real `Button` with a title that follows the mode — *Page thumbnails* in `page`,
  *Document map* elsewhere.
- Rows are clickable and keyboard-reachable; the active one is marked and revealed.
- Thumbnails are decorative wireframes, not content — the document itself remains the accessible
  surface.

---

# 📝 Summary

DocScroller provides:

- **Two panels chosen by layout** — sheet thumbnails in `page`, a fisheye block map elsewhere
- **Wireframes, not clones**, so a twenty-page rail costs twenty measurements, not twenty live
  copies of every component
- **Fraction-based geometry**, immune to document zoom
- **A fixed-row lens**, so magnification never moves what is under the pointer
- **A two-box rail** that scrolls itself instead of stretching the editor
- **`scrollerOpen` / `toggleScroller`**, so a host can drive it from its own chrome

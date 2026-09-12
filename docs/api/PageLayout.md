# 🧩 PageLayout API

The **PageLayout API** is the editor's pagination engine: the thing that turns one long flow of
blocks into real, measured sheets of paper, scales the whole document, and puts it back the way
it was. It is a plain module — no component, no observables — so it can be driven from a toolbar
control, a keyboard shortcut, a host's own chrome, or from `printEditor`.

---

# 📦 Import

```ts
import {
    applyLayout, Layout, type LayoutMode,
    configurePageLayout, pageMetrics,
    paginate, unpaginate, unpaginatedHTML, settle, captureScroll,
    setLayoutZoom, layoutZoom, resolvedZoom, onZoomApplied, ZOOM_MIN, ZOOM_MAX, type ZoomLevel,
    silenceDuringLayout, flushLayoutSilenced,
    currentLayout, disposeLayout,
} from "@woby/wui";
```

The toolbar's own control is `LayoutSwitch`, and the observable mirror of the mode is
`editorLayout`. Prefer `setEditorLayout(surface, mode)` over raw `applyLayout` from UI code — it
does both.

---

# 🧭 The three modes

| Mode | For | Sheets | Markers | Editable |
| --- | --- | --- | --- | --- |
| **`flow`** | Authoring | No — one continuous column | **Visible** (page breaks, watermarks, rules all show as labelled markers) | Yes |
| **`page`** | Proofing | Yes — real 209×296mm sheets, numbered | Consumed into real breaks | **Yes** |
| **`screen`** | Reading / narrow viewports | No — reflows to the viewport | Hidden | No (read-only) |

```ts
Layout        // { flow: 'flow', page: 'page', screen: 'screen' }
currentLayout() // the mode applyLayout was last asked for
applyLayout(surface, Layout.page)
```

`page` mode is **fully editable**. That is the whole reason sheets are built by *re-parenting*
rather than by cloning: a cloned custom element reconstructs itself, re-resolves its context
attributes and loses its identity, so the caret, the undo stack and every plugin's state would
be thrown away on every layout switch.

```ts
export type Mover = (parent: Node, node: Node, before: Node | null) => void
export const moveNode: Mover // Element.moveBefore() where available, insertBefore otherwise
```

`moveBefore` keeps a custom element connected across the move — no `disconnectedCallback`, no
reconstruction. It throws rather than degrading when it cannot honour that contract, so the
fallback is real, not defensive noise.

---

# ⚙️ Geometry

```ts
export interface PageLayoutOptions {
    pageWidthMm: number                                   // default 209
    pageHeightMm: number                                  // default 296
    pageLabel: (page: number, total: number) => string    // default `Page N / M`
    overflowLabel: string
    breakOf?: (node: Node) => PageBreakKind | undefined | null
}

configurePageLayout({ pageWidthMm: 216, pageHeightMm: 279 })   // US Letter, less 1mm
pageMetrics()   // { width, height (CSS px), widthMm, heightMm }
```

> **209 × 296, not 210 × 297.** One millimetre shy of A4 on each axis, deliberately. A sheet
> sized to the page *exactly* rounds up as often as down once the browser converts mm to device
> pixels, and a page one pixel too tall emits a **blank page after every real one**. The shortfall
> is invisible at print scale; the guard is absolute. Do the same if you reconfigure.

`breakOf` overrides the break classifier for one flow-level node. Return `undefined` to fall
through to the built-in resolution: plugin `pageBreak` descriptors first, then the element's
computed `break-before` / `break-after`.

## Overflow is measured as a ratio

A block taller than one sheet cannot be split, so it is marked instead:

```ts
const scale = sheet.getBoundingClientRect().width / pageWidthPx
const limit = sheet.top + pageHeightPx * scale
```

Width is the stable yardstick, height is not — which makes the pass immune to `zoom`, to browser
zoom and to a `transform` an app put on an ancestor. An over-tall block gets `OVERFLOW_ATTR` and
a rule drawn across it carrying `overflowLabel`. That label is **screen-only**: by print time the
author has either fixed it or decided to live with it.

---

# 🔍 Zoom

```ts
export type ZoomLevel = number | 'fit'
ZOOM_MIN // 0.25
ZOOM_MAX // 4

setLayoutZoom(surface, 1.5)
layoutZoom()            // what the author asked for — a number, or 'fit'
resolvedZoom(surface)   // what is actually on screen right now, 'fit' resolved
onZoomApplied(cb)       // fires whenever the painted scale may have changed
```

> **`zoom`, not `transform: scale()`.** A transform paints the document smaller but leaves its
> hit-testing and caret geometry at full size, so clicks land in the wrong place and typed
> characters appear where the pointer is not. `zoom` scales layout itself, so a zoomed document
> is still an editable one.

**`'fit'` is a deferral, not a number.** It is recomputed on every resize — exactly what an author
wants while a window is being dragged, and exactly what they do not want after they have said
"150%". In `flow` and `screen` there is no paper to fit, so `fit` reads 100%.

`setLayoutZoom(root, 1)` **removes** the custom property rather than writing `1`: any `zoom`
establishes a containing block for fixed-position descendants, so writing `zoom: 1` would still
change the behaviour of every dialog, dropdown and overlay inside the surface.

From UI code prefer `setEditorZoom` (in `ZoomControl`) — it calls `setLayoutZoom` *and* publishes
to the `editorZoom` observable, so the toolbar readout stays honest.

---

# 💾 Saving and loading

```ts
paginate(root)                // rebuild sheets from current content. Idempotent.
unpaginate(root, moveNode)    // flatten sheets back to one flow
unpaginatedHTML(html)         // flatten a *string* of HTML, off-document
```

`unpaginatedHTML` is the save/load contract, and the reason **a layout switch is not an undo
step**. It parses with `DOMParser`, which has no browsing context — so custom elements are not
constructed, no `src` is fetched, nothing runs — then flattens the sheets and strips
`SELECTED_ATTR`. The result is byte-identical across a layout switch, which is what keeps both a
mode change and a component click out of the undo stack.

**Persist the unpaginated form.** Sheets are a view, not content.

```ts
const html = unpaginatedHTML(surface.innerHTML)   // what you store
```

## `settle`

```ts
await settle(root)
```

Waits for web fonts and images before measuring, because a sheet measured against a fallback font
or a zero-height image paginates at the wrong place and then does not re-run. Every wait is
capped: a document referencing a dead image URL still paginates, just against the broken-image
box — which is what the printer would see anyway. The rAF pair is raced against a timer because
animation frames do not fire in a background tab.

## `captureScroll`

```ts
const restore = captureScroll(surface)
// … mutate …
restore()   // call AFTER the caret has been placed, not before
```

Restoring a selection can scroll on its own, and the place the reader was actually looking should
win. This is what stopped `undo` from jumping to the top of the document: the debounced
pagination 250 ms later was undoing the scroll `undo` had already restored.

---

# 🔇 MutationObserver silencing

```ts
silenceDuringLayout(observer)   // register once, at observer creation
flushLayoutSilenced()           // engine calls takeRecords() on all of them
```

Pagination moves thousands of nodes. Any observer watching the surface — undo history, the
property panel, a plugin — would see that as an enormous edit.

A boolean guard **cannot** work here: `MutationObserver` delivers in a microtask, *after* the flag
would already have been cleared. The only reliable silence is to drain the queue with
`takeRecords()` at the end of the pass, which is exactly what `flushLayoutSilenced` does.

## Debounce policy

| Trigger | Delay |
| --- | --- |
| `input` | **never** — typing must not repaginate under the caret |
| Content mutations | `250ms` |
| ResizeObserver, **width changed only** | `120ms` |
| Attribute changes | not observed at all |

Height changes are ignored because pagination itself changes height — observing them is a loop.

---

# 🏷️ Attributes and custom properties

| Constant | Value | Meaning |
| --- | --- | --- |
| `LAYOUT_ATTR` | `data-layout` | The mode, on the surface |
| `NOT_PAGED` | selector | `:not([data-layout="page"]):not([data-layout="screen"])` — for authoring-only CSS |
| `PAGE_ATTR` | `data-wui-page` | A generated sheet |
| `PAGE_CHROME_ATTR` | `data-wui-page-chrome` | Generated furniture (the page-number strip) |
| `OVERFLOW_ATTR` | `data-wui-overflow` | A block taller than one sheet |
| `SELECTED_ATTR` | `data-element-selected` | The editor's selection ring — stripped on save |
| `NO_SCALE_ATTR` | `data-wui-noscale` | Opt a subtree out of the page scale |
| `PAGE_SCALE_VAR` | `--wui-page-scale` | The applied zoom |
| `PAGE_W_VAR` / `PAGE_H_VAR` | `--wui-page-w` / `--wui-page-h` | Sheet geometry, for host CSS |
| `OVERFLOW_LABEL_VAR` | `--wui-overflow-label` | The overflow rule's text |

---

# 🖨️ Printing

```ts
import { printEditor, isPrinting, PRINT_PATH_ATTR, PRINT_HIDE_ATTR } from "@woby/wui";

await printEditor(surface, { setMode: mode => setEditorLayout(surface, mode) })
```

Four steps: **proof → isolate → print → restore.**

1. **Proof** — switch to `page` and `await settle(surface)`. Printing a `flow` document prints
   whatever the browser's own page breaks decide, which is not what the author proofed.
2. **Isolate** — mark every ancestor of the surface `PRINT_PATH_ATTR` and every sibling along
   that path `PRINT_HIDE_ATTR`, **on both sides of the shadow boundary**. Hiding by
   `body > :not(.editor)` does not reach into a shadow root.
3. **Print** — `window.print()`, with `@page { size: 209mm 296mm; margin: 0 }` built **at print
   time**. `@page` does not see the cascade, so this cannot be a stylesheet rule that depends on
   the configured geometry. Without the size declaration, a 296 mm sheet on US Letter paper
   emitted a blank page after each one — four sheets printed as eight pages.
4. **Restore** — on `afterprint`, raced against a 60-second timer, because a browser that never
   fires it would otherwise leave the document marked up and half-hidden forever.

`opts.setMode` defaults to `applyLayout`, which makes the paper right but leaves the toolbar's
mirror of the mode behind. Pass your own setter if you have one. `isPrinting()` is there for
anything that should disable itself during a run.

---

# 🧹 Teardown

```ts
disposeLayout()   // drop observers, timers and the resize hookup
```

Call when the editor is unmounted. `applyLayout` re-installs everything it needs, so a disposed
engine is not a broken one.

---

# 🧪 Usage Example

```tsx
import { setEditorLayout, Layout, setEditorZoom, unpaginatedHTML, printEditor } from "@woby/wui";

const surface = document.querySelector<HTMLElement>('[data-editor-root]')!

setEditorLayout(surface, Layout.page)   // proof
setEditorZoom(surface, 'fit')           // fit the sheets to the pane
const saved = unpaginatedHTML(surface.innerHTML)   // store the flow, not the sheets
await printEditor(surface)
```

---

# 📝 Summary

PageLayout provides:

- **Three modes** — `flow` to author, `page` to proof on real sheets, `screen` to read
- **Re-parenting, never cloning**, so `page` mode stays editable and plugins keep their identity
- **209×296mm by default**, one millimetre shy of A4 so rounding cannot emit blank pages
- **Ratio-measured overflow**, immune to any scale applied above it
- **`zoom`, not `transform`**, so a scaled document is still editable, with `fit` as a live mode
- **`unpaginatedHTML`** — the save contract, and why a layout switch never enters undo
- **`takeRecords()`-based silencing**, the only kind that works against a microtask queue

# Change Request: opt-out for the center drag-handle on `resizable` plugins

- **Status:** proposed, not yet implemented
- **Requested by:** su-yen / `packages/风水` (compass plugin for the wui report editor)
- **Filed:** 2026-09-17
- **Affects:** `src/Editor/EditorPlugin.ts` (`ResizableSpec`), `src/Editor/ImageResizer.tsx`
- **Severity:** UX bug for any `resizable` custom element that owns its own pointer/wheel input (confirmed on `<sy-compass>`; likely affects any future interactive embed)

## Summary

`resolveResizable`'s `ResizableSpec` has no way to keep the 8 resize handles
while dropping the center drag-handle. Any element registered with
`resizable: true` (or a spec object) gets a full-bleed, invisible,
`pointer-events: auto` div over its center 60% × 60%, intended to let a user
reposition an `<img>` by grabbing its middle. For an element that renders its
own interactive canvas in that same area — `<sy-compass>`, via three.js
OrbitControls — that div silently swallows every wheel/pointer gesture aimed
at the middle of the block, which is exactly where a user instinctively
aims. There's no field to opt out today, so the only fix available from the
plugin side is not registering `resizable` at all — which loses the resize
handles too.

## Reproduction

1. Open the wui report editor, insert a `<sy-compass>` block, select it.
2. Move the mouse to the visual center of the block and scroll the wheel.
3. Nothing happens. Move to the outer ~20% ring near any edge and scroll —
   the compass zooms correctly.

Verified with a shadow-piercing hit-test + synthetic `WheelEvent` dispatch
(not `dv scroll`, which isn't real wheel input — see su-yen memory
`dv-scroll-is-not-real-wheel-input`):

- At `frac 0.20` from any edge (just inside the 20% inset boundary): hit
  target is the `<canvas>` inside `<sy-compass>`'s shadow root;
  `dispatchEvent(wheelEvent)` returns `false` (OrbitControls called
  `preventDefault()`); `camz` changes. Zoom works.
- At `frac 0.22` (12px further in, same sweep): hit target is
  `<div data-image-drag-handle>`; `dispatchEvent` returns `true` (nothing
  intercepted); `camz` unchanged. Zoom silently no-ops.
- Swept both centerlines, all 4 corners, and the near-boundary diagonals:
  the reachable zone is a uniform 20%-inset picture-frame ring around all
  four edges. The entire inner 60% × 60% box — including diagonals — is
  dead for wheel/pointer input aimed at the canvas.

The only existing (unintentional) discoverability cue is
`getComputedStyle(el).cursor`: `'move'` inside the dead zone (from the
handle's own CSS), `'auto'` outside it. There is no deliberate affordance —
no border, shading, or tooltip — telling a user why the block stops
responding to wheel input in its center.

## Root cause

`src/Editor/ImageResizer.tsx:850-866`:

```tsx
{/* Drag handle - allows repositioning by dragging center */}
<div
    ref={(el: HTMLDivElement) => { dragHandleEl = el }}
    data-image-drag-handle
    style={{
        position: 'absolute',
        left: '20%',
        top: '20%',
        width: '60%',
        height: '60%',
        cursor: 'move',
        pointerEvents: 'auto',
        ...DRAG_HANDLE_STYLE,
        background: 'transparent',
        zIndex: 6,
    }}
/>
```

This div is rendered unconditionally for every element `resolveResizable`
accepts — there is no gate on it besides `activeImage` (selection state).
`background: 'transparent'` is deliberate (it's meant to be invisible while
still being draggable), not a styling oversight — confirmed via
`getComputedStyle`: `background: rgba(0,0,0,0)`, no border/outline/shadow,
`pointer-events: auto`, `z-index: 6`, sitting above the canvas (`z-index`
context of the shadow host) and below the resize handles (`z-index: 10`).

This is a deliberate feature for the `<img>` case this component was
originally built for — grab the middle of a picture, drag it to reposition.
It was extended to cover `<sy-compass>` on purpose: the surrounding code
(`ImageResizer.tsx:306-350`, `onSelectDown`/`findResizable`) documents that
the select/resize hookpoint was switched from `mousedown` to `pointerdown`
specifically so `<sy-compass>` could be selected/resized at all — three.js
OrbitControls calls `preventDefault()` on `pointerdown`, which previously
starved the old `mousedown`-based listener, so the host was selectable but
never resizable. That fix (correctly) pulled `sy-compass` into the exact
same generic resize/drag-handle machinery used for `<img>`, including the
center drag-handle that images need and interactive canvases don't.

`src/Editor/EditorPlugin.ts:144-167`, `ResizableSpec`:

```ts
export interface ResizableSpec {
    write?: ResizeWrite
    widthProp?: string
    heightProp?: string
    aspect?: 'lock' | 'free' | number
    min?: [number, number]
    live?: boolean
}
```

None of these fields can suppress the center drag-handle or make it
pointer-transparent. The 8 resize handles and the 1 center drag-handle are
bundled as a single all-or-nothing unit tied to any truthy `resizable`
value — that's the structural gap. A plugin author has no way to say "give
me resize handles, but this element already owns its own center-area
pointer/wheel input, don't cover it."

## Proposed fix

Add one new optional field to `ResizableSpec`:

```ts
export interface ResizableSpec {
    write?: ResizeWrite
    widthProp?: string
    heightProp?: string
    aspect?: 'lock' | 'free' | number
    min?: [number, number]
    live?: boolean
    /**
     * Render the center drag-handle (repositions the element by dragging its
     * middle). Default `true`, matching the `<img>` behaviour this system was
     * built for. Set `false` for an element that owns its own pointer/wheel
     * input over its full area (e.g. an embedded interactive canvas) — the 8
     * resize handles still render, only the center overlay is omitted.
     */
    dragHandle?: boolean
}
```

`ImageResizer.tsx:850-866` gates the div's render on it:

```tsx
{$$(activeSpec)?.dragHandle !== false && (
    <div
        ref={(el: HTMLDivElement) => { dragHandleEl = el }}
        data-image-drag-handle
        style={{ /* unchanged */ }}
    />
)}
```

(`activeSpec` — or equivalent — needs to be the resolved `ResizableSpec` for
the currently-active element, available via `resolveResizable(activeImage)`;
name/plumbing left to whoever implements this, the point is the render gate.)

The 8 resize handles (`handles.map(...)`, lines 867-887) are unaffected —
this only removes the center overlay, not resizing itself.

### Consumer-side change (su-yen, once this ships)

`packages/风水/src/罗盘组件.tsx:63-70` already mirrors `ResizableSpec`
1:1 as `可缩放项` (`write`, `widthProp`, `heightProp`, `aspect`, `min`,
`live`) and passes it straight through as `resizable: c.可缩放`
(line 367). Once wui ships `dragHandle`, su-yen adds the matching field to
`可缩放项` and sets it `false` on the compass config
(`罗盘组件.tsx:149`, `罗盘缩放`) — no other su-yen code needs to change.

## Alternatives considered (and rejected)

- **Forward `wheel` events through the handle to the element beneath it**
  (keep the div, add a JS listener that re-dispatches onto
  `elementFromPoint` under it). Works for wheel but not for click-drag on
  the canvas (OrbitControls rotate/pan), and requires synthetic
  re-dispatch plumbing that's more fragile than just not rendering the div.
- **Shrink the drag-handle's hit area / require a modifier or long-press to
  start a drag.** Reduces the dead zone but doesn't eliminate it, and adds
  an undiscoverable modifier gesture. Doesn't fix the "invisible dead zone"
  problem in principle, just shrinks it.
- **Give up repositioning entirely for `resizable` custom elements.**
  Already possible today (omit `resizable`, or wrap in your own drag logic)
  but throws away the resize handles too — not acceptable for compass,
  which does need to be resizable in the report layout.

Option in this CR (new `dragHandle: false` field) was chosen because it's
the smallest change (one field, one render gate), it's additive/backward
compatible (default `true` preserves existing `<img>` behaviour exactly),
and it fully removes the dead zone rather than shrinking or working around
it — the div simply never exists over the canvas.

## Notes for whoever picks this up

- Don't change the `<img>` default. Every other current user of
  `resizable: true`/spec relies on drag-to-reposition working as-is.
- The fix is render-only; no changes needed to `findResizable`,
  `onSelectDown`, or the `pointerdown` hookpoint switch documented at
  `ImageResizer.tsx:306-350` — that part is correct and unrelated.
- Su-yen has already source-traced and confirmed this chain against the
  current tree (2026-09-17); see su-yen memory
  `compass-wheel-zoom-blocked-by-wui-drag-handle.md` for the full DOM-level
  reproduction (exact hit-test sweeps, `camz` before/after, cursor cue) if
  independent verification is wanted before implementing.

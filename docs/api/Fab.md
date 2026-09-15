# 🧩 Fab API

The **Fab (Floating Action Button) API** describes the props, variant system, rendering logic, and styling rules for the component.  
It supports high-emphasis actions and both circular and extended layouts.

---

# 📦 Import

### TSX

```tsx
import { Fab } from "./Fab";
```

### Web Component

```ts
import "./Fab"; // registers <wui-fab>
```

---

# 🧭 Props Overview

| Prop              | Type                              | Default  | Description                                                       |
| ----------------- | --------------------------------- | -------- | ----------------------------------------------------------------- |
| **children**      | JSX.Child                         | `""`     | Icon, text, or both                                               |
| **type**          | `"pill" \| "circular" \| "custom"` | `"pill"` | Visual variant (HtmlString)                                       |
| **disabled**      | boolean or Observable<boolean>    | `false`  | Disables interaction                                              |
| **avoid**         | boolean or Observable<boolean>    | `false`  | Step clear of whatever paints over the FAB (HtmlBoolean)          |
| **avoidMargin**   | number or Observable<number>      | `8`      | Clearance kept between FAB and cover, px (HtmlNumber)             |
| **avoidMax**      | number or Observable<number>      | `96`     | Total offset budget in px — never exceeded (HtmlNumber)           |
| **avoidWithin**   | string                            | `""`     | Stay-inside container selector (HtmlString)                       |
| **avoidIgnore**   | string                            | `""`     | Elements matching this selector never count as covers (HtmlString)|
| **onAvoid**       | (s: OcclusionState) => void       | `null`   | Fires on every avoidance-state change — TSX-only                  |
| **cls**           | string                            | `""`     | Primary class; overrides default variant classes when set (HtmlClass) |
| **class**         | string                            | `""`     | Additional classes appended to the component                      |
| **...otherProps** | HTML button attributes            | —        | Any standard button props                                         |

---

# 🎨 Variant Logic

### 1. **circular**

- Standard FAB style (large, round)
- Blue background
- Large shadow
- Hover darkening
- Fixed width/height (w-14 h-14)

### 2. **pill (default)**

- Extended FAB style
- Rounded capsule shape
- Blue background
- Larger text
- Supports icon + text layouts

### 3. **custom**

- No built-in styling
- Developer controls all visuals using `cls`

Variant styles are mapped by:

```ts
const variantStyle = {
  circular: "inline-flex items-center justify-center ... w-14 h-14 bg-[rgb(25,118,210)] hover:bg-[rgb(21,101,192)]",
  pill: "absolute bg-[rgb(25,118,210)] text-[white] text-4xl font-black ... rounded-[50px]",
  custom: ""
};
```

---

# ⚙️ Rendering Logic

The core element is a `<button>`:

```tsx
<button
  class={[() => $$(cls) ? $$(cls) : variantStyle[$$(variant)], cn]}
  disabled={disabled}
  {...otherProps}
>
  <div class="flex items-center">{children}</div>
</button>
```

Key behaviors:

- `cls` overrides the default variant classes; when it is unset, the variant style is applied
- `class` (aliased as `cn`) appends additional classes on top
- Disabled buttons prevent interaction
- Children are wrapped for consistent icon/text alignment

---

# 🛡️ Occlusion avoidance (`avoid`)

**Off by default** — a FAB that moves on its own is a surprise nobody asked for. Set `avoid` and the
FAB watches what paints over it and steps out from under, within limits.

### How it detects

Occlusion is decided by **hit-testing, not z-index arithmetic** — the effective z-index of two
elements in different stacking contexts is undecidable from JavaScript. The FAB probes its own rect
at four corners (inset a couple of px) plus the centre with `document.elementFromPoint`, descending
into open shadow roots (the `deepElementFromPoint` helper). If the topmost hit at any probe point is
neither the FAB itself nor its descendant, the FAB is covered; the hit is kept as the cover (`by`).

Re-probes fire on `resize`, on `scroll` (capture), on a `ResizeObserver` covering the FAB and its
container, and on a `MutationObserver` watching `document.body` for style/class flips and added or
removed nodes — the ways overlays appear. Probes are rAF-coalesced with a settle burst
(120/240/400 ms) so late layout settles before the verdict.

### What it does NOT dodge: modal masks

A cover that is a **modal mask** — `aria-modal="true"`, `role="dialog"`, an open `<dialog>`, or a
fixed/absolute element covering ≥ ~90% of the viewport with a painted background — is a cover you
must not dodge out from under. The FAB **freezes**: it holds its current offset, stops searching,
and reports `maskUp: true`. When the mask closes it re-probes and restores normally.

### How it dodges — bounded, gives up rather than teleports

Candidates are tried in order **down, left, down-left, up, right, up-left** at the margin clearance
(`avoidMargin`). `avoidMax` is a **ceiling, not a target**: candidates that would need more than the
budget are not generated. If nothing in budget is clear, the FAB **stays put and reports
`blocked: true`** until the next re-probe — it never teleports or escapes its bounds.

The dodge is applied as `transform: translate(dx, dy)` — never `top`/`left`, so the home position
survives. The FAB animates the move itself (a one-time `transform` transition), neither forcing
motion on a host that suppressed transitions nor dropping the host's own animations.

### Staying inside the parent

Candidates are clamped to the boundary — the `avoidWithin` selector's padding box, else the offset
parent's padding box, else the viewport (fixed FABs) — **before** testing, and probe-verified after
clamping. Siblings are simply obstacles; the probe is the judge.

### Restore

The stored state is an offset **from home, never a new home**. When the cover clears, the FAB
animates back to `translate(0,0)`. Nothing persists across remount.

### `onAvoid` state

```ts
interface OcclusionState {
  covered: boolean // something paints over the FAB right now
  by: Element | null // the topmost non-self hit — the cover itself
  dx: number // current offset from home, px
  dy: number
  blocked: boolean // covered and no in-budget dodge exists — staying put
  maskUp: boolean // the cover is a modal mask — frozen, not dodging
}
```

`onAvoid` is a **function prop: TSX-only** (attribute reflection stringifies functions).

### The headless hook

`Fab` is only the first caller. The machinery is exported for any element:

```tsx
import { useOcclusionAvoidance, deepElementFromPoint } from "wui";

const ref = $<HTMLElement | null>(null);
const state = useOcclusionAvoidance(ref, {
  enabled: avoid, // boolean | Observable<boolean>
  margin: 8, // clearance px
  max: 96, // total offset budget px
  within: ".stage", // stay-inside selector, optional
  ignore: ".no-dodge", // never-count-as-cover selector, optional
  onAvoid: (s) => console.log(s),
});
// state is an Observable<OcclusionState>
```

`deepElementFromPoint(x, y)` is the shadow-piercing hit-test the probe uses — `elementFromPoint` that
walks open shadow roots at the given coordinates.

---

# 🧪 Usage Examples

### Default

```tsx
<Fab>Default FAB</Fab>
```

### Circular

```tsx
<Fab type="circular">❤️</Fab>
```

### Disabled

```tsx
<Fab disabled>Disabled</Fab>
```

### Custom

```tsx
<Fab type="circular" cls="!bg-green-500 !text-white">
  👍
</Fab>
```

### Occlusion-aware

```tsx
// TSX: dodge pinned chrome, report every state change
<wui-fab avoid type="circular"
  style={{ position: "absolute", bottom: 12, right: 12 }}
  onAvoid={(s) => s.blocked && console.warn("FAB boxed in", s.by)}>
  +
</wui-fab>
```

```html
<!-- HTML attributes are kebab-case: avoid-margin → avoidMargin -->
<wui-fab avoid avoid-margin="12" avoid-max="64" avoid-within=".stage" type="circular">
</wui-fab>
```

---

# ♿ Accessibility

- Renders using a native `<button>` → keyboard accessible
- Supports all ARIA attributes via `...otherProps`
- Disabled state prevents tab focus and click events

---

# 📝 Summary

The Fab component provides:

- High-emphasis CTA actions
- Circular and pill variants
- Click handling & disabled states
- Full styling control via `cls` (override) and `class` (append)
- Works in TSX and Web Component usage
- Optional occlusion avoidance (`avoid` + `avoid-margin` / `avoid-max` / `avoid-within` / `avoid-ignore` / `onAvoid`), built on the exported `useOcclusionAvoidance` hook
- Ideal for floating UI triggers and add-action patterns
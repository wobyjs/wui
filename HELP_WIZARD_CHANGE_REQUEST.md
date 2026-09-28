# Change request — make the help wizard reachable by plugin authors

From: 风水 / compass (su-yen). Date: 2026-09-14. Against wui `521f1fe`.

This is a **delta on `EDITOR_HELP_WIZARD_HANDOFF.md`**, not a replacement. The
handoff describes the API and how a host uses it; §12 / §13.1 / §13.4 / §13.5
there already describe the blockers. This file is the short version a
concurrent agent can work from: one ask per section, each with the exact file
and line, what to change, and how to know it landed. Revisions are appended, not
rewritten — read the status table in revision 2 and the two new asks (CR-6,
CR-7) in revision 3 for what is still open.

Nothing in this request needs a new API. The engine is written and works —
`EditorHelpStep.ts`, `HelpTour.tsx`, `HelpBalloon.tsx`, `HelpButton.tsx` are
all complete. **Two lines of plumbing are what a third-party tour is missing.**

Status this session: the compass half is finished and verified in a real
editor (see §5). It reaches the user only through a private fallback runtime
that exists solely because CR‑1 and CR‑2 are open. Both fallbacks are marked
for deletion in 风水's source the day these land.

---

## CR‑1 — `EditorHelpStep` is not exported from the package (blocker)

Restates handoff §12, with one new fact: **rebuilding `dist` is part of the
fix**, and a fresh `dist` is not evidence that it landed.

`src/index.tsx` (mtime 2026‑09‑12 21:44) re-exports `./Editor/Editor`,
`./Editor/EditorPlugin`, `./Editor/PageLayout`, … and every `./PropertyForm/*`,
but **contains the string `Help` zero times**. So from downstream:

```ts
import { registerHelpSteps, startHelpTour } from '@woby/wui'   // both undefined
```

Downstream resolves wui through `node_modules/@woby/wui` → symlink to
`D:/Developments/tslib/@woby/wui`, and `package.json` `exports["."].import` is
`./dist/index.es.js`. So a `src/` change alone is invisible to 风水:

```
dist/index.es.js                 2026-09-14 15:40   grep -c startHelpTour → 0
src/Editor/EditorHelpStep.ts     2026-09-14 15:08
src/index.tsx                    2026-09-12 21:44
```

The dist is **newer** than `EditorHelpStep.ts` and still has no `startHelpTour`
— it is not stale, the symbol genuinely never enters the bundle.

**Change:**

```ts
// src/index.tsx, next to the other Editor re-exports
export * from './Editor/EditorHelpStep'
export * from './Editor/HelpButton'
```

then rebuild `dist`.

**Done when:** `grep -c startHelpTour dist/index.es.js` > 0, and
`dist/types/index.d.ts` re-exports `HelpStep`.

---

## CR‑2 — `{ at: 'prop' }` cannot anchor an editor property row (blocker)

Extends handoff §13.1. That section said `TableRow` carries no anchor. Two
further findings since:

**(a) The one existing stamp is on a boxless element.** `data-prop-row` is
written in exactly one place:

```tsx
// src/PropertyForm/PropertyRows.tsx:67
<span data-prop-row={key} class="contents">
    <UI data={propertyData} editorName={key} value={value} indentLvl={indentLvl} />
</span>
```

`class="contents"` ⇒ `display: contents` ⇒ `getBoundingClientRect()` is 0×0.
Even where this path *does* run, the spotlight has nothing to draw around. The
same shape already bit the toolbar, and `resolveHelpTarget` handles it there by
walking to a laid-out descendant — worth applying here too, or simply stamping
an element that has a box.

**(b) The editor's panel never runs that path anyway.**
`src/Editor/PropertyPanel.tsx:1188` renders

```tsx
<PropertyForm obj={obj} class="m-0" heading="" onCommit={commitPending} />
```

and `PropertyForm`'s rows come from `TableRow` (`PropertyForm.tsx`), whose
`<tr>` has no `data-prop-row`. Measured live, `<sy-compass>` selected, panel
open:

```js
document.querySelector('[data-property-panel]')
        .querySelectorAll('[data-prop-row]').length   // → 0
```

**Change** — `TableRow` is the right place, and every call site already holds
the key as `editorName`:

```tsx
// src/PropertyForm/PropertyForm.tsx — TableRow props
export const TableRow = (props: {
    optionName?: JSX.Child
    prop?: string            // ← untranslated property key
    children?: JSX.Child
    indentLvl?: number
    action?: RowAction
    hint?: string
}) => {
    …
    <tr data-prop-row={prop} class="flex w-full items-stretch …">
```

and pass it from the six editors that render a row — each one line, the value
is already in scope:

```
src/PropertyForm/BooleanEditor.tsx:20    prop={editorName}
src/PropertyForm/ColorEditor.tsx:24      prop={editorName}
src/PropertyForm/DropdownEditor.tsx:21   prop={editorName}
src/PropertyForm/EnumEditor.tsx:30       prop={editorName}
src/PropertyForm/NumberEditor.tsx:19     prop={editorName}
src/PropertyForm/StringEditor.tsx:30     prop={editorName}
```

The key must stay **untranslated** — a step names `{ at: 'prop', prop: '底图' }`,
while the row *prints* a label that is translated and may repeat across rows.
(That asymmetry is exactly what 风水 is working around today; see §5.)

**Done when:** with a plugin element selected and the panel open,
`[data-property-panel] [data-prop-row]` matches one element per row, and each
match has a non-zero client rect.

---

## CR‑3 — the property panel covers the toolbar's right end (carried, §13.4)

No new findings; repeated because it still breaks the *entry point* to the very
feature this request is about. `PropertyPanel` is `position: fixed; z-index: 1100`
with its box starting at y=96, over a toolbar row at y=163. While the panel is
open, `elementFromPoint` at the ? button's own centre returns a `TD` from inside
the panel, so a real click never reaches `?` — and ⓘ cannot close the panel it
opened. Full measurements in handoff §13.4.

**Suggested:** give the panel a top offset below the toolbar, or let it
participate in layout instead of floating over it. 风水 has no preference; the
tour needs only that ⓘ is clickable while the panel is closed, which it is.

---

## CR‑4 — `InsertDropDown`'s menu opens centred on its button (carried, §13.5)

`InsertDropDown.tsx:356-357` has `origin-top-left absolute left-0 mt-2 …` with
no `top-*`, so the menu keeps its static position; the wrapper's
`align-items: center` on a 32px line then centres a 296px menu and the computed
`top` comes out `-136px`. The menu straddles its button and its **top two entries
are unclickable** — in 风水 they land under the 报告名称 / 副标题 header.
`TextFormatDropDown.tsx:179` carries the identical class string.

This is the target of the compass tour's very first step
(`{ at: 'pluginGroup', group: '罗盘' }`): the spotlight is correct, but the menu
it tells the user to open hides its own first choice — which is 🧭罗盘.

**Suggested:** add `top-full` to both branches of the class in
`InsertDropDown.tsx:356-357` and `TextFormatDropDown.tsx:179`, matching the zoom
menu (`origin-top-left absolute left-0 top-full mt-1 w-28 …`) which opens
correctly.

---

## 5. What the compass ships in the meantime — delete-on-landing

So you can see the cost of the two blockers, and so nothing is left behind
afterwards. All of this is in su-yen, none of it touches wui.

| File | What it is | Deletable when |
|---|---|---|
| `packages/compass/src/向导运行.tsx` | A whole second balloon runtime — spotlight, placement, step gating, `z-index: 2147483647` — duplicating `HelpBalloon`/`HelpTour` | **CR‑1** |
| `向导运行.tsx` → `设向导属性标签` + `找属性行`'s text-matching branch | Finds a property row by the *text it prints*, because `[data-prop-row]` matches nothing | **CR‑2** |
| `packages/风水/src/语言.ts` → `面板词候选` | Returns a label in **all four** UI languages — wui boots English and catches up on the first `setLocale`, so the panel can print English while the app chrome is Chinese; any text match must accept every translation | **CR‑2** |
| `packages/风水/src/罗盘组件.tsx` → `属性标签候选` | prop → those candidates, via the compass's own property table | **CR‑2** |

`packages/compass/src/向导.ts` — the six steps themselves — is import-free data,
structurally assignable to your `HelpStep[]`, and **stays**. It is handed to
`registerHelpSteps` the moment that export exists; `开始罗盘向导()` already checks
`wui.startHelpTour` first and hands the whole job over when it is found.

Verified end to end this session (dv3, a real saved report, 玄空飞星 plate):
a `?` FAB inside `<sy-compass>` walks 2/6 选中它 → 4/6 放楼层平面图 → 5/6 设盘面朝向
→ 6/6 核对坐与向 in the app's language, auto-skipping step 1 (a compass already
exists) and step 3 (panel already open), spotlighting a real 57px row box on
BASE IMAGE URL. So the steps, their gates, and their targets are all correct —
they simply cannot be handed to you yet.

Also still open from handoff §12, not blocking: `startHelpTour` has no `onEnd`,
so a host cannot tell "finished" from "dismissed"; and the balloon has no
"don't show this again", so "not now" and "stop asking me" are the same gesture.

---

## 6. Acceptance

After CR‑1 + CR‑2 and a `dist` rebuild, in 风水 with a report open for editing:

1. `?` starts **wui's** tour (the built-ins), and the compass's six steps appear
   after them — the count reads past 9, not `1 / 9`.
2. The `底图` and `rotation` steps spotlight a **single row's box**, not the whole
   panel and not nothing.
3. 风水's first-run auto-start fires (it is written and inert until the symbol
   exists).
4. The four table rows in §5 can be deleted without the tour regressing.

CR‑3 and CR‑4 are independent of the above and can land separately.

---

# Revision 2 — 2026-09-14, after wui's first pass

Verified live in 风水 (dv3, report 「半山雅苑 12 号别墅 · 玄空飞星勘察报告」, a real saved report with a 玄空飞星
plate selected).

| | status |
|---|---|
| **CR-1** export + dist rebuild | **landed, verified** |
| **CR-2** `data-prop-row` on `TableRow` | **landed, but anchors the wrong string — see CR-2a** |
| **CR-3** panel clear of the toolbar | **landed, verified** |
| **CR-4** menu opens downward | **landed, verified — but see CR-5** |

CR-1: `src/index.tsx:26-27` now re-exports `EditorHelpStep` and `HelpButton`;
`dist/index.es.js` carries `startHelpTour`; `dist/types/index.d.ts` mirrors it.
`?` starts **wui's** tour and the compass steps are appended: **11 steps** with
the panel closed (9 built-ins + 选中它 + 打开属性面板), **14** with it open. Walked in
Chinese all the way to 14/14, each of the last three spotlighting a single
304x57 property row.

CR-3: the panel now sits at `[1085, 208, 300, 775]`, below the second toolbar row
(y 167-199). `elementFromPoint` at the `?` button's centre returns its own `svg`
with the panel open — previously a `TD` from inside the panel.

---

## CR-2a — the anchor carries the property's **label**, not its **name**

`TableRow` stamps it now and every row has a real box: measured,
`[data-property-panel] [data-prop-row]` returns **14** elements, each ~304x57
(it returned 0 before). That half is done. What it stamps is the problem.

`editorName` is a *record key*, and the record is built by label:

```ts
// src/Editor/PropertyExtractor.ts:612
props[p.label ?? p.name] = obs
```

So a plugin declaring `{ name: '底图', label: '底图网址' }` gets a row keyed
by the label; `PropertyPanel` passes that through as `editorName`, and the `<tr>`
ends up with `data-prop-row="底图网址"`. Measured in the running editor with
`<sy-compass>` selected and the panel open:

```
[data-prop-row="底图"]          -> 0 matches
[data-prop-row="底图网址"]        -> 1 match, 304x57
[data-prop-row="rotation"]        -> 0 matches
[data-prop-row="盘面朝向（度）"]         -> 1 match, 304x57
```

A step cannot name the label. A step is data — a plugin author writes
`{ at: 'prop', prop: 'rotation' }` straight from the schema they declared, and
CR-2 above already stipulated *"the key must stay untranslated"*. The label is
the opposite of untranslated: it is the display string, it is what 风水's panel
word table rewrites per locale (the panel prints `FACING (DEGREES)` right now
while the app chrome is Simplified Chinese), and two properties may legitimately
share one.

**Change** — a side-channel on the observable, exactly like the four that
already exist in that loop (`.propType`, `.hint`, `.readonly`, `.action`):

```ts
// src/Editor/PropertyExtractor.ts, same loop, just before line 612
;(obs as any).propName = p.name
props[p.label ?? p.name] = obs
```

then prefer it where `prop` is passed, in the six editors:

```tsx
prop={(value as any)?.propName ?? editorName}
```

— or resolve it once in `PropertyPanel` / `PropertyForm` if that reads
better. The requirement is only that `data-prop-row` holds `p.name` when the
plugin declared one, and falls back to today's key when it did not.

**Done when:** with `<sy-compass>` selected and the panel open,
`[data-prop-row="rotation"]` matches exactly one element with a non-zero rect.

Until then 风水 targets both spellings through your own documented escape hatch
(`packages/compass/src/向导.ts`):

```ts
const 属性行 = (名: string, 标: string): 向导目标 =>
    ({ at: 'selector', css: `[data-prop-row="${名}"],[data-prop-row="${标}"]` })
```

written to survive the fix rather than trade one breakage for another: it matches
the label today and the name the day this lands. The three steps that use it are
marked in-file for collapse back to `{ at: 'prop', prop: 名 }`.

---

## CR-5 — toolbar dropdowns at the right end open **under** the property panel

New, and a direct consequence of CR-4 landing: `top-full` is in place and the
menu now drops below its button — straight into the property panel's column.

With `<sy-compass>` selected, panel open, the 罗盘 plugin group's chevron
clicked:

```
menu    [1035, 207, 256, 296]   top: 32px   ... absolute left-0 top-full mt-2 w-64 ...
panel   [1085, 208, 300, 775]   position: fixed   z-index: 1100
```

The menu's own stacking chain tops out at `z-index: 10` (`origin-top-left
absolute` inside `sticky top-0 z-10`), so 1100 wins on every overlapping pixel.
`elementFromPoint` at the menu items' own centres returns the panel:

```
item 1   y=211   hit: DIV (panel)
item 2   y=247   hit: TH  (panel)
item 3   y=283   hit: TH  (panel)
```

Only the leftmost ~50px of a 256px menu is reachable. A screenshot shows the menu
reduced to a strip of bare compass icons with every label hidden behind the panel.

This is the target of the compass tour's very first step
(`{ at: 'pluginGroup', group: ... }`): the spotlight is right, the menu is now
correctly placed, and the user still cannot click what it points at — for as
long as the panel is open, which by that point in the tour it is.

**Suggested:** raise the toolbar's menu layer above `PropertyPanel` (portal it to
the editor root, or give an open menu a z-index above 1100), or collapse the
panel while a toolbar menu is open. 风水 has no preference.

**Done when:** with the panel open, `elementFromPoint` at each item's centre
returns that item.

---

## What 风水 can delete now

Of the four rows in section 5, **CR-1 retires the first**: `向导运行.tsx`'s balloon
runtime is dead code the moment `startHelpTour` exists, and 风水 will drop it.
The other three (the text-matching row finder, `面板词候选`, `属性标签候选`) were CR-2
workarounds, superseded by the selector above — they go with CR-2a, not
before.

Noticed while verifying, not asked for: the panel header grew its own
导览此面板 button. Handy — it is not in the handoff and 风水 does not drive it.

---

# Revision 3 — 2026‑09‑14, second pass: the plate's own controls

The scope grew, so there are two more asks. The user's words were **"to describe
every btn"**, on **`http://localhost:5187/compass.qm.html`** — the standalone
plate. That page has no `<Editor>` on it at all.

The compass half of that is finished and typechecks:

- all **25** controls in the FAB stack now carry a stable `data-fab`
  (`compass.tsx`, `help` / `settings` / `gyro` / `meridian` / `rotation` /
  `rot-minus10` / `rot-field` / `rot-plus10` / `rot-reset` / `map` /
  `map-touch` / `map-satellite` / `map-road` / `map-zoom-in` / `map-zoom-out` /
  `map-update` / `plan` / `plan-touch` / `plan-image` / `plan-visible` /
  `plan-rotate` / `plan-opacity-down` / `plan-opacity-up` / `plan-lock` /
  `plan-remove`);
- `向导.ts` carries one step per control, `order` 2000–2280, each gated on a live
  rect test so a closed sub-row stays dark and lights up in place when the row
  opens;
- copy exists in all four UI languages (zh‑Hans, zh‑Hant, en, ms).

**None of it can reach the screen.** Both reasons are in wui, and neither is
work 风水 can route around without rebuilding the clone CR‑1 just retired.

---

## CR-6 — `HelpTour` is not exported, so only an `<Editor>` can mount the driver

CR‑1 landed the *starter*; the *driver* is still private.

`src/index.tsx:26-27` re-exports `./Editor/EditorHelpStep` and
`./Editor/HelpButton` — and nothing else matching `/Help/i`. `HelpTour` is
imported privately by `Editor.tsx:18` and mounted once, at `Editor.tsx:1062`.
The built `dist` export list has no `HelpTour` either.

So `startHelpTour` is reachable from anywhere, but it only flips observables
(`helpTourActive(tour)`, `helpTourIndex(...)`); the balloon mount lives in
`HelpTour.tsx`. On a page with no `<Editor>`, pressing `?` sets the state and
nothing renders it. Measured on `compass.qm.html` after pressing the `?` FAB:

```
{"editor":false,"tourEl":false,"balloon":false}
```

That is the whole of the user-visible bug report — *"current dv3 pg, click on ?
btn, no balloon show"*.

**Suggested:** export `HelpTour` (or, nicer for hosts, a `<HelpTourHost/>`
wrapper that carries whatever context `Editor` currently provides it) so a page
without a writing surface can mount the driver once at its root. Steps whose
targets do not resolve already gate themselves off, so an editor-less host gets
the compass steps and skips the editor ones with no extra API.

A second, smaller thing while you are in there: `startHelpTour` has no `onEnd`,
and the balloon has no "don't show this again". Both are wanted but neither
blocks.

**Done when:** on a page whose only wui usage is `registerHelpSteps` +
`startHelpTour` + the exported host component, pressing `?` renders the balloon
at step 1 of N.

---

## CR-7 — `resolveHelpTarget` cannot see into an open shadow root

Even with CR‑6, not one of the 25 steps can anchor.

`resolveHelpTarget` (`EditorHelpStep.ts:~186`) does `root.querySelector(sel)`
and then, only when `root !== document`, `document.querySelector(sel)`. Both
stop at a shadow boundary.

The entire compass FAB stack is inside `sy-compass`'s **open** shadow root, and
the host renders **zero** light-DOM children. Measured on `compass.qm.html`:

```
{"inShadow":true,"inDoc":false,"lightChildren":0,"mode":"open"}
```

`document.querySelector('[title="Settings"]')` → `false`;
`c.shadowRoot.querySelector('[title="Settings"]')` → `true`.

This is not compass-specific. Any plugin shipped as a custom element with a
shadow root — which is the recommended way to ship one — is unreachable by the
tour for exactly this reason.

**Suggested, either way round:**

1. on a miss, walk the tree and retry inside each open `shadowRoot`
   (a `TreeWalker` collecting `el.shadowRoot`, depth-first, first match wins); or
2. add an explicit target shape, e.g. `{ at: 'shadow', host: 'sy-compass', css: '[data-fab="plan-lock"]' }`,
   so the host names the boundary and nothing has to be searched blind.

(1) needs no change on the compass side — the steps are already
`{ at: 'selector', css: '[data-fab="…"]' }`. (2) is a one-line edit in
`向导.ts`'s `控件()` helper. 风水 has no preference; (1) helps every other
custom-element plugin too.

Whichever lands, the **spotlight geometry** needs the same treatment:
`getBoundingClientRect()` on a shadow node is already in viewport coordinates,
so the overlay maths should work unchanged — but it is worth checking against a
plate scrolled off-centre before calling it done.

**Done when:** with a `<sy-compass>` on the page and its ⊞ stack open, the tour
spotlights `[data-fab="plan-lock"]` over the real button.

---

## Ordering

CR‑7 without CR‑6 fixes the editor case only (a compass dropped into a report,
where the driver is already mounted) — which is worth having on its own and is
the smaller change. CR‑6 without CR‑7 gets a balloon onto `compass.qm.html` that
can only point at whatever is in the light DOM, i.e. nothing. If only one
lands, **CR‑7 first**.

Still open from revision 2, unchanged: **CR‑2a** (`data-prop-row` carries the
label, not the name) and **CR‑5** (toolbar menus paint under the `z-index:1100`
property panel).

One more observation, not an ask: with the chrome set to 简体中文 the property
panel still prints English labels (`FACING (DEGREES)`, `BASE IMAGE URL`). The
panel path does not appear to follow `setLocale`. 风水 has not chased it.

---

# Revision 4 — 2026‑09‑15: a FAB that knows it is being sat on

Not a wizard bug this time, a **`Fab` bug** — but it is the wizard's `?` that
found it, and this is the document the wui side is working through, so it is
appended here rather than opened as a third file.

The ask, in the user's words:

> "fab btn self aware of it own position/state. current dv3, thr ? fab is
> covered by back btn. so self aware fab can reposition it self not to be
> covered"
>
> ". of cause, offseting position have some limit, it know it being covered by
> modal mask"
>
> "also not out of it parent container"

Three bounds, and the middle one is the interesting one: **a modal mask is not
something to dodge.** More on that below.

---

## CR-8 — `Fab` should detect that it is covered and step out from under, within limits

### The measured case

`http://localhost:5187/compass.qm.html`, live in dv3 just now. The `?` FAB is a
`<Fab>` (`compass.tsx:1756`) pinned to the plate's top‑right corner at
`z-index: 10001`. The page itself renders a fixed back link above everything:

```json
{ "vw": 1409, "vh": 1637,
  "help":     { "x": 1345, "y": 12,   "w": 64, "h": 72 },
  "settings": { "x": 1345, "y": 1557, "w": 64, "h": 72 },
  "hits": [
    { "x": 1377, "y": 48, "chain": ["sy-compass", "path"] },
    { "x": 1348, "y": 15, "chain": ["a"] },
    { "x": 1406, "y": 81, "chain": ["sy-compass", "canvas.absolute.top-0.bg-transparent"] } ],
  "overlapping": [
    { "tag": "a", "cls": "", "txt": "← 返回", "z": "2147483647", "pos": "fixed",
      "r": { "x": 1327, "y": 12, "w": 70, "h": 29 } } ] }
```

Read that middle block: `document.elementFromPoint` at the FAB's **centre**
(1377, 48) reaches the `?` glyph, but at its **top‑left** (1348, 15) it returns
the page's `<a>← 返回</a>`. The back link's 29 px‑tall box overlaps the top 29 px
of the FAB's 72 px box. The top‑left ~40 % of the `?` is dead to the pointer,
and visually the two overlap outright.

Nothing here is misconfigured. The FAB is `position: absolute` inside
`#罗盘`, at 10001 — the top of *the plate's* stack. The back link is
`position: fixed` at 2147483647 — the top of *the page's* stack. Two different
stacking contexts, two different owners, neither of which can see the other:
compass does not know the host page pins chrome to that corner, and the host
page does not know a plugin parks a control there. This is the normal condition
for any component library whose widgets get dropped into someone else's chrome.

### The ask

An **opt‑in** behaviour on `Fab`: notice that something is painting on top,
offset far enough to clear it, and put itself back when the cover goes away.

Sketch, taking `Fab`'s existing prop style:

```tsx
<Fab
    avoid                    // opt in; default off, nothing changes for existing callers
    avoid-margin="8"         // clearance to keep between FAB and cover (px)
    avoid-max="96"           // total offset budget (px) — never exceeded
    avoid-within=".plate"    // optional container; defaults to the offset parent
    onAvoid={s => …}         // optional: { covered, by, dx, dy, blocked, maskUp }
/>
```

…and, because not every floating control in an app is a `<Fab>`, the mechanism
is worth having headless as well — `useOcclusionAvoidance(ref, opts)` — with
`Fab` as its first caller. compass drives its whole 25‑button stack through
`<Fab>`, so shipping it on the component reaches the reported case directly.

### 1. Detect — hit test, not z‑index arithmetic

Comparing `z-index` numbers across stacking contexts is not decidable from the
outside: the back link's 2147483647 and the FAB's 10001 live in unrelated
contexts, and the winner is settled by ancestor order, not by the two integers.
**`elementFromPoint` gives paint order for free** and is the primitive to build
on.

Probe the FAB's own rect at five points — four corners inset by a pixel or two,
plus the centre. At each, `document.elementFromPoint(x, y)`, then descend:
while the hit element has an open `shadowRoot`, re‑hit inside it. If the final
element is neither the FAB nor a descendant of it, that point is covered.

That descent is **the same shadow‑piercing walk CR‑7 needs** for
`resolveHelpTarget`. One helper, two callers. It matters here for the same
reason: the FAB in the reported case *is itself inside* `sy-compass`'s shadow
root, while the thing covering it is in the light DOM.

To know *what* is covering — needed for step 2 — keep the topmost non‑self hit
element from the probe. It is already in hand.

**When to re‑probe.** Not unconditionally every frame; this runs on battery.
Suggested triggers: `resize`; `scroll` (capture, passive); a `ResizeObserver` on
the FAB and its container; a `MutationObserver` on `document.body` childList for
chrome that mounts late; and a short rAF burst (~400 ms) after any of those, so
a 300 ms CSS transition settles before the final placement is chosen. The pill
variant's own `[transition:top_0.3s_ease,left_0.3s_ease]` is exactly such a
transition.

### 2. Classify — a modal mask is a cover you must **not** dodge

This is the bound the user called out explicitly, and it inverts the whole
behaviour, so it is worth being precise about why.

A modal mask covers the FAB *on purpose*. Everything under it is inert: the FAB
is not clickable anywhere, so there is no clear spot to move to, and a button
scuttling across the screen while a dialog is open reads as a rendering bug.
Worse, a mask is `inset-0` — it covers every candidate position equally, so a
naive dodger either thrashes through its whole candidate list every frame or
slams into the offset budget and sits there; and then the FAB is in the *wrong*
place when the dialog closes.

**Correct behaviour under a mask: freeze.** Hold the current offset, do not
search, and when the mask goes away re‑probe once and restore. Optionally expose
it (`maskUp: true`) so a host can fade the FAB out instead — but that is the
host's call, not the component's.

Recognising one, in rough order of confidence:

- the cover, or an ancestor of it, has `aria-modal="true"` or `role="dialog"`;
- it is a `<dialog open>` / matches `:modal`;
- it is `position: fixed` and its rect covers ≥ ~90 % of the viewport in both
  axes with a non‑transparent background — the shape wui's own dialogs already
  use: `fixed inset-0 z-[1200] bg-black/30` (`Editor/ImageDialog.tsx:460`,
  `Editor/ImageEditor.tsx:556`).

The third test is the one that actually fires for wui's dialogs today, since
neither carries `aria-modal`. Adding `aria-modal="true"` + `role="dialog"` to
`ImageDialog` and `ImageEditor` is worth doing anyway — it is an a11y fix on its
own merits — and it turns this classification from heuristic into exact.

Anything else that covers — a page back link, an app bar, a toolbar, a sticky
header — is chrome that genuinely sits above the FAB in the layout, and **that**
is what the FAB steps out from under.

### 3. Dodge — bounded, and it gives up rather than teleports

The offset is a **short ordered list of candidates**, each tested with the same
probe, first clear one wins. Something like: down, left, down‑left, up, right,
up‑left — "down" first because the common case is chrome pinned to the top of
the container.

Two hard rules:

- **`avoid-max` is a ceiling, not a hint.** Candidates beyond it are not
  generated. In the measured case the needed displacement is small: the cover's
  bottom edge is at y = 41 and the FAB's top at y = 12, so `29 + margin` px of
  downward offset clears it completely — comfortably inside any sane budget.
- **If no candidate inside the budget is clear, stay put.** A FAB that half‑hides
  is better than a FAB that has relocated to a corner the user will not look in.
  Report it (`blocked: true`) and stop searching until the next re‑probe trigger.

**Apply the offset with `transform: translate(dx, dy)`, not by writing
`top`/`left`.** Callers author the FAB's home position themselves — compass
passes computed inline `top` and `right` on every one of its 25 FABs — and a
component that overwrites those has taken the position away from its owner. A
translate composes with whatever the host authored, is trivially reversible
(`translate(0,0)` is "home"), and animates on the compositor. It also survives
the host recomputing its own layout, which the reported stack does on every
resize.

One caveat for the implementation: the `?` FAB explicitly sets
`transition: 'none'` (`compass.tsx:1757`) so it does not slide when the stack
re‑anchors. The dodge should animate its `transform` through its own transition
property rather than relying on the caller's `transition` — neither forcing
motion on a host that suppressed it, nor inheriting the suppression.

### 4. Stay inside the parent — clamp before testing, not after

The user's third bound, and in this codebase it is not cosmetic: `#罗盘` is
`overflow: hidden`. A FAB that dodges past the container edge is not merely
outside its box, it is **clipped away and gone** — the same class of failure as
the `position: static` bug the comment block at `compass.tsx:1736` records.

So: resolve the boundary once (`avoid-within` selector if given, else
`offsetParent`'s padding box, else — for a `position: fixed` FAB — the viewport),
and clamp every candidate to it **before** the clear test. A candidate that has
been clamped into a still‑covered position is simply not a candidate; it must
not be silently accepted as "the best we could do".

Worth treating the FAB's own siblings as obstacles, too: in a stack like
compass's, dodging down by 80 px lands the `?` on top of the Settings FAB, which
trades one occlusion for another. Either probe against siblings as well, or let
the host opt out with an `avoid-ignore` selector.

### 5. Restore

The stored state is an **offset from home**, never a new home. When the cover
unmounts, the window resizes, or the mask closes, re‑probe and animate back to
`translate(0,0)` if home is clear. Nothing should persist across a remount.

### Done when

On `compass.qm.html`, with the page's `← 返回` link in the top‑right corner:

1. the `?` FAB sits fully clear of the link — `elementFromPoint` at all four of
   its corners returns the FAB or a descendant, not the `<a>`;
2. it is still inside `#罗盘`'s box, visible and unclipped;
3. with an `ImageDialog` open over an editor, a FAB underneath the backdrop does
   **not** move;
4. with `avoid-max` set below the required 29 px, the FAB stays home rather than
   moving to some random clear corner, and reports `blocked`.

### Notes

- Opt‑in, please. A FAB that silently relocates itself would be a surprising
  default for existing callers, and some floating buttons are *meant* to sit
  partly behind chrome.
- This composes with CR‑7: both want one shadow‑piercing hit‑test helper. If
  CR‑7 lands first, CR‑8 is mostly candidate generation and clamping on top of
  it.

---

## Still open, unchanged

**CR‑2a** (`data-prop-row` carries the label, not the name), **CR‑5** (toolbar
menus paint under the `z-index:1100` property panel), **CR‑6** (`HelpTour` not
exported), **CR‑7** (`resolveHelpTarget` stops at a shadow boundary).

Non‑blocking, carried: `startHelpTour` has no `onEnd`; the balloon has no
"don't show this again"; the property panel does not follow `setLocale`.

# In-place help wizard — a coachmark tour for the wui editor

**Audience:** the agent implementing this inside `D:\Developments\tslib\@woby\wui`.
**Status:** design + implementation plan. Nothing in this document is built yet.
**Verified against the working tree on 2026-09-14**, branch `main`, tip `477d413`
(*refactor(editor): drop the standalone blockquote button*), tree clean. Every
`file:line` below was read, not recalled.

Companion documents, same repo root, same conventions:
`EDITOR_PLUGIN_TOOLBAR_HANDOFF.md` (the toolbar registry this builds on) and
`RANDOM_ACTION_BUTTON_HANDOFF.md`.

---

## 0. The ask, in one paragraph

A first-time user opens a wui editor and does not know that the toolbar has an
Insert menu, that a plugin family collapses into its own dropdown, that selecting
an inserted element and pressing **属性 / Info** is how you reach its properties,
or that the property panel is where a compass gets its heading. The ask is an
**in-place help wizard**: a popup balloon that points at a real control, says one
sentence about it, and steps forward — *use the editor → add a compass → add a
floor plan → set rotation → set facing*. The editor-generic half of that (the
balloon, the step registry, the anchoring, the toolbar button that starts it)
belongs in wui. The compass-specific half — which four steps, what they say, what
they point at — belongs to `packages/compass` in the `su-yen` monorepo and must
reach wui **as data**, because compass does not depend on `@woby/wui` and will not
be made to.

Your half is wui's. The downstream half is described in §9 so you can check your
API against a real consumer, but you do not write it.

---

## 1. What exists today — verified

### 1.1 The three registries, and how a tour can see them

| Registry | File | What the wizard needs from it |
|---|---|---|
| Toolbar items | `src/Editor/EditorToolbarItem.ts` | A stable `name` per button — `bold`, `insert`, `plugin-groups`, `info`, `language` … |
| Editor plugins | `src/Editor/EditorPlugin.ts` | `name`, `tagName`, `group`, `props[]` — the vocabulary a step points at |
| Locales | `src/i18n/i18n.ts` | `t()` for wui keys, `tx()` for third-party English, `localized()` to merge |

All three are **module-global**, and all three are already exported from
`src/index.tsx` (`export * from './Editor/Editor'` line 24, `export * from './i18n'`
line 33). The help registry must be a fourth of the same shape — that symmetry is
most of the design.

### 1.2 Every toolbar button now renders through one component

This is the single most useful fact in the document, and it is recent.
`src/Editor/Editor.tsx:1129`:

```tsx
const FullToolbar = () => <ToolbarSlot />
```

and `Editor.tsx:1118-1122` records why:

> The JSX that used to live here moved verbatim into `builtinToolbar.tsx`, one
> registration per button … `ToolbarSlot` renders them all in `order`, and
> built-ins sit at the end of its band.

So `src/Editor/EditorToolbarSlot.tsx:83`

```tsx
{g.items.map(renderItem)}
```

is the **only** place any toolbar button — built-in or third-party — becomes DOM.
One wrapper there gives the wizard a stable anchor for all 26 built-ins *and*
everything a host registers, with no per-button edits and no registry change.

### 1.3 The DOM landmarks that already exist

Found by grep over `src/Editor/`:

| Attribute | Written at | Meaning |
|---|---|---|
| `data-editor-root` | the contenteditable surface | the writing area |
| `data-editor-body` | the page body wrapper | `PropertyPanel.tsx:968` climbs to it |
| `data-property-panel` | `PropertyPanel.tsx:1007` | the panel shell |
| `data-element-selected` | `PropertyPanel.tsx:205` | the currently bound element |
| `data-table-popup` | `TablePopupMenu.tsx:574+` | table popup buttons |

Two landmarks the wizard needs do **not** exist: a marker on a toolbar item, and a
marker on a property row. Adding them is Phase 1.

### 1.4 The popup precedent to copy

`src/Editor/TablePopupMenu.tsx` is the working example of a floating panel
positioned against a moving target inside the editor:

- `TablePopupMenu.tsx:436-437` takes `surface.getBoundingClientRect()` and
  `cell.getBoundingClientRect()` and subtracts;
- `TablePopupMenu.tsx:561-562` renders `position: 'absolute'` into the surface's
  own `relative` container (`PropertyPanel.tsx:57` documents that container).

Do the same. `getBoundingClientRect()` is viewport-relative and **shadow-safe**,
which matters because of §1.5.

`src/Editor/useDropdownDismiss.ts` (41 lines, read it in full before writing any
outside-click logic) already solved the two traps a balloon will hit:
listen in the **capture** phase, because toolbar buttons `stopPropagation()`; and
test with **`composedPath()`**, never `contains(target)`, because event targets are
retargeted to the `<wui-editor>` host at the shadow boundary. Reuse the hook —
do not write a second one.

### 1.5 The editor renders into a shadow root — sometimes

`Editor.tsx:222`:

```ts
const host = (el.getRootNode() as ShadowRoot).host as HTMLElement | null
```

and `Editor.tsx:224` handles the other branch: *"Non-shadow-DOM mode: children are
already rendered by the JSX tree"*. Both modes ship. Every anchor lookup the
wizard does must therefore start from the editor's **own root node**, not from
`document`, and fall back the way `PropertyPanel.tsx:546-547` already does:

```ts
const surface = shadow?.querySelector('[data-editor-root]')
    ?? document.querySelector('[data-editor-root]')
```

Copy that two-step. A `document.querySelector` alone finds nothing in shadow mode;
a shadow-only lookup finds nothing in light mode.

### 1.6 There is no tooltip, popover, tour or coachmark in wui today

`grep -iE "tooltip|popover|popper|balloon|tour|coach|hint|help|guide"` over `src/`
matches only the `helper/` directory (an unrelated utility folder). `src/` is:
`Appbar Avatar Badge Banner Button Card Checkbox Chip Collapse Editor/ Fab
IconButton NumberField Paper PropertyForm/ RuntimeTailwind.ts SideBar Switch Tabs
TextArea TextField ToggleButton Toolbar Wheeler/ Zoomable app.tsx demos/ helper/
i18n/ icons/ index.tsx input.css main.ts ssr/ test/ types/ use.ts`.

You are building the primitive, not wrapping one. Do not add a positioning
dependency (`floating-ui`, `popper`) — §7.3.

### 1.7 i18n has exactly two channels

`src/i18n/i18n.ts`: `t(key, params)` line 347 resolves a catalogue key and falls
back to the key itself; `tx(text, params)` line 363 passes third-party English
through the same interpolation without requiring a key; `localized(given, key)`
line 406 prefers a caller-supplied string and falls back to a key. `setLocale`
(252), `onLocaleChange` (281), `registerLocale` (161) are the host-side hooks, and
`su-yen/packages/风水/src/罗盘报告.tsx` already imports all four.

The wizard's own steps use `t()`. Third-party steps must be able to use **neither**
— see §3.4.

---

## 2. What is missing, and why each gap matters

1. **No way to point at a toolbar button.** A step that says "click Insert" has no
   element to draw an arrow to. `name` exists in the registry
   (`EditorToolbarItem.ts`), but it never reaches the DOM.
2. **No way to point at a property row.** `PropertyForm/PropertyRows.tsx:39`
   iterates `sortedKeys` and hands each key to an editor component
   (`PropertyRows.tsx:57-70`); no element in that path carries the key. A step
   that says "type the heading here" cannot find *here*.
3. **No registry for steps.** Without one, the tour is a hardcoded array in wui and
   compass can never contribute — which is the whole point of the ask.
4. **No overlay primitive.** §1.6.
5. **No way to start a tour.** Needs a toolbar item, and a programmatic entry point
   for a host that wants to auto-run it on a user's first visit.
6. **No step gating.** "Set rotation" is nonsense before a compass exists. A step
   needs a `when()` — the same reactive predicate `ToolbarItem.when` already is.

---

## 3. The design

### 3.1 Shape, in one line each

```
src/Editor/EditorHelpStep.ts     registry + anchor vocabulary + resolution  (pure data, no JSX)
src/Editor/HelpBalloon.tsx       one balloon: positioned card + arrow + spotlight
src/Editor/HelpTour.tsx          the driver: current index, next/back/skip, re-anchor on change
src/Editor/HelpButton.tsx        the toolbar item that starts it
src/Editor/builtinHelp.tsx       wui's own generic steps, registered as a side effect
```

Mirrors `EditorToolbarItem.ts` / `EditorToolbarSlot.tsx` / `builtinToolbar.tsx`
exactly. That is deliberate: a reader who has understood the toolbar work should
need no new concepts here.

### 3.2 `HelpStep` — the descriptor

```ts
export interface HelpStep {
    /** Unique. A duplicate warns and keeps the first, like registerToolbarItem. */
    name: string
    /** Sort key within the tour. Same spacing convention as TOOLBAR_GROUPS: leave gaps. */
    order?: number
    /** Which tour. Omitted means the default tour, the one the toolbar button starts. */
    tour?: string
    /** What this step points at. See 3.3. `undefined` renders a centred card, no arrow. */
    target?: HelpTarget
    /** Heading. A thunk is re-read on every render, so a host catalogue can drive it. */
    title: string | (() => string)
    /** One or two sentences. Same thunk rule. */
    body: string | (() => string)
    /**
     * Skip this step when it returns false. Reactive: read inside the tour's render,
     * so a step can appear the moment its precondition is met.
     * `el` is the resolved anchor, or null when the target did not resolve.
     */
    when?: (ctx: HelpContext) => boolean
    /**
     * Auto-advance. 'click' moves on when the anchor is clicked; 'insert' when an
     * element matching the target's tag appears under [data-editor-root];
     * 'manual' (default) waits for the Next button.
     */
    advanceOn?: 'manual' | 'click' | 'insert'
    /** Balloon side. Default 'auto' picks the side with room, preferring below. */
    placement?: 'auto' | 'top' | 'bottom' | 'left' | 'right'
}

export interface HelpContext {
    /** The editor host this tour is running in. Never document. */
    root: Document | ShadowRoot
    /** The contenteditable surface, i.e. [data-editor-root]. */
    surface: HTMLElement | null
    /** The resolved anchor for this step, or null. */
    el: HTMLElement | null
}
```

`title` and `body` are `string | (() => string)` and **not** `ObservableMaybe`, so a
plain-data contributor can hand over literals and a wui-aware one can hand over
`() => t('editor.help.insert')`. See §3.4 for why this specific choice is load-bearing.

### 3.3 `HelpTarget` — a vocabulary, not a CSS selector

```ts
export type HelpTarget =
    | { at: 'toolbar'; item: string }        // [data-toolbar-item="<item>"]
    | { at: 'surface' }                      // [data-editor-root]
    | { at: 'panel' }                        // [data-property-panel]
    | { at: 'prop'; prop: string }           // [data-prop-row="<prop>"] inside the panel
    | { at: 'element'; tag: string }         // first <tag> inside the surface
    | { at: 'selector'; css: string }        // escape hatch, searched from the editor root
```

Why a vocabulary: a raw CSS selector in a third-party step turns wui's internal
markup into public API, and the next refactor of `PropertyPanel.tsx` silently
breaks a step nobody in this repo can see. Five named cases cover everything the
downstream consumer needs (§9) and each one is a contract wui can keep. `selector`
stays as the escape hatch, documented as unsupported across versions.

Resolution is one exported function, and it is the *only* place the attribute names
appear:

```ts
export const resolveHelpTarget = (root: Document | ShadowRoot, t?: HelpTarget): HTMLElement | null
```

Every lookup goes `root.querySelector(...) ?? document.querySelector(...)` — §1.5.

### 3.4 How a third party contributes without importing wui

`packages/compass` must not gain a `@woby/wui` dependency. It also must not gain a
`woby` JSX dependency for this — it has one, but a *data* contribution should not
need one. Two consequences, both deliberate:

1. **`HelpStep` is structurally typeable.** Every field is a primitive, a string
   union, a plain function, or a plain object. No `Observable`, no `JSX.Child`, no
   `ObservableMaybe`. A contributor declares
   `export const steps: { name: string; title: string; ... }[]` and it is assignable
   to `HelpStep[]` with no import at all. Do not add an `icon?: () => JSX.Child`
   field "for symmetry with `ToolbarItem`" — it would break this property for the
   one consumer the feature exists for.
2. **`title`/`body` accept a thunk.** The downstream app translates through its own
   catalogue (`风水/src/语言.ts` exports `文(key)`), not through `t()`. A thunk lets
   it pass `() => 文('向导.加罗盘')` and get a live re-read when the user switches
   language, with wui knowing nothing about that catalogue. Read the thunk **inside**
   the balloon's render, never in the component body — the standing woby rule in this
   codebase (`EditorToolbarSlot.tsx:19-24`: plain function child, never
   `useMemo(() => <jsx/>)`, or the subtree is rebuilt and an open popup closes).

Registration itself is the host's job. `风水` already imports wui, so it does
`registerHelpStep(...compassSteps)`. Compass ships the array; wui exposes the verb;
neither knows about the other.

### 3.5 The registry API

```ts
export const registerHelpStep: (step: HelpStep) => void          // duplicate name: warn, keep first
export const registerHelpSteps: (steps: HelpStep[]) => void      // convenience, the common case
export const unregisterHelpStep: (name: string) => void
export const getHelpSteps: () => Observable<HelpStep[]>
export const resolveHelpSteps: (tour?: string, ctx?: HelpContext) => HelpStep[]  // sorted, when()-filtered
export const resolveHelpTarget: (root: Document | ShadowRoot, t?: HelpTarget) => HTMLElement | null
export type HelpTourEnd = 'finished' | 'dismissed' | 'suppressed'
export const startHelpTour: (
    tour?: string,
    opts?: { from?: string, onEnd?: (reason: HelpTourEnd) => void },
) => void
export const stopHelpTour: () => void
export const helpTourActive: Observable<string | null>           // the running tour's name
```

`registerHelpStep` keeps the first on duplicate, matching `registerToolbarItem`
(`EditorToolbarItem.ts`). Note the one documented exception in that file —
`registerToolbarGroup` *overwrites* — and do **not** copy it here; there is no group
concept to reconfigure.

`startHelpTour` is exported because a host wants to run the tour on a user's first
visit without a click, and because a "help" link elsewhere in the app should reach
the same tour.

**`onEnd` is not optional garnish — a host cannot implement first-run-only without
it.** The only thing a host can observe today is that it *started* a tour, so the
"has this author been shown the tour?" flag has to be written the moment the balloon
opens. That makes one stray `Escape` suppress the tour on that device forever, for
someone who never read a word of it. Report how the tour ended and the host writes
the flag for the right reason:

| reason | what happened | what a host does with it |
| --- | --- | --- |
| `finished` | Next pressed past the last step | remember — they have been taught |
| `dismissed` | Escape, outside click, or the close × | remember **nothing**; offer it again next visit |
| `suppressed` | "Don't show this again" ticked (§3.6) | remember — they asked to be left alone |

Call `onEnd` exactly once per `startHelpTour`, including when `stopHelpTour()` ends
it (that is a `dismissed`) and when zero steps survive `when()` filtering (also
`dismissed` — nothing was shown, so nothing was learned).

### 3.6 The balloon

- `position: absolute` inside the surface's existing `relative` container, offsets
  from two `getBoundingClientRect()` calls — `TablePopupMenu.tsx:436-437` is the
  worked example.
- A spotlight is a second absolutely-positioned `div` with the anchor's box, a
  `box-shadow: 0 0 0 9999px rgba(0,0,0,.45)` cutout, and `pointer-events: none` —
  so `advanceOn: 'click'` still lets the click through to the real button. **This is
  the point of the whole feature**: the user clicks the actual control, not a
  simulation of it.
- Re-measure on `resize`, on `scroll` (capture, so it catches the surface's own
  scroller), and whenever the step index changes. A `ResizeObserver` on the anchor
  is worth it; the toolbar wraps (`EditorToolbarSlot.tsx:67-74` is explicit about
  that) and a wrapped toolbar moves every button below it.
- Dismiss on `Escape`, and on an outside pointerdown routed through
  `useDropdownDismiss` — do not hand-roll it (§1.4). Either path ends the tour as
  `dismissed`, never as `finished`.
- A **"Don't show this again"** checkbox in the balloon's footer, `t()`-keyed like
  everything else. Ticked and then closed — by any route, including Escape — the
  tour ends as `suppressed`. This is the affordance that makes `dismissed`
  survivable: without it, "stop asking me" and "not now" are the same gesture, and
  a host has to guess which one the author meant.
- When `resolveHelpTarget` returns null, do **not** drop the step and do **not**
  throw: render the card centred with no arrow. A step whose target has not been
  created yet is the normal case, not an error.

### 3.7 The toolbar item

```tsx
registerToolbarItem({ name: 'help', group: 'insert', order: step(5), render: () => <HelpButton /> })
```

Last in the `insert` band, after `language` (`builtinToolbar.tsx:173`), for the same
reason the comment there gives: it is a property of the editor as a whole, not of
any group above it.

`HelpButton` follows `src/Editor/InfoButton.tsx` verbatim — it is the closest
existing precedent and it encodes three things you would otherwise get wrong:

```tsx
const handleMouseDown = (e: MouseEvent) => { e.preventDefault(); focusManager.beginCommand() }
```
(keeps the caret alive), `$(panelCtx)` because **`useContext()` returns an
observable** (InfoButton.tsx carries that as a CRITICAL comment), and
`localized(title, 'editor.help')` for the tooltip.

A host that does not want the button uses the existing
`hideToolbarItem('help')` — presentation only, `startHelpTour()` keeps working.
That is the documented three-verb distinction in `EditorToolbarItem.ts`: hide is
presentation, `replaces` takes the slot, `unregisterEditorCommand` removes the verb.

**Why the trigger cannot live in the plugin.** The obvious alternative — a help FAB
inside `<sy-compass>` itself — was checked against the code and does not work.
`compass/src/compass.tsx:912-913` gates the whole FAB stack on
`嵌入 ? 选中 : true`, and `选中` tracks `data-element-selected` on the host. Inside a
report the compass is always `嵌入`, so its controls appear only **after** the element
has been selected — which is step 2 of the tour, and is unreachable before step 1 has
put a compass in the document at all. The trigger has to sit on editor chrome that
exists before any plugin does. Hence the toolbar item, plus `startHelpTour()` for a
host that wants to run it unprompted (§9).

---

## 4. Implementation plan

### Phase 1 — anchors (do this first; everything else is dead without it)

**1a. `data-toolbar-item`.** `src/Editor/EditorToolbarSlot.tsx:40-41`:

```tsx
const renderItem = (item: ToolbarItem) =>
    item.render ? item.render() : <CommandButton command={item.command!} />
```

becomes

```tsx
const renderItem = (item: ToolbarItem) =>
    <span data-toolbar-item={item.name} class="contents">
        {item.render ? item.render() : <CommandButton command={item.command!} />}
    </span>
```

`class="contents"` (`display: contents`) is the whole reason this is safe: the
wrapper takes part in no layout, so the band's `flex items-center gap-1`
(`EditorToolbarSlot.tsx:51`) keeps applying to the buttons themselves and nothing
moves by a pixel. Verify that claim with a screenshot diff, not by reasoning —
`display: contents` has known accessibility caveats on interactive elements, and if
it bites, fall back to setting the attribute on the rendered node via a `ref`
instead of wrapping.

Note the hard constraint this file states at lines 10-17: *"the DOM of a wui editor
with no plugins installed must be byte-identical"*. A wrapper per item is not
byte-identical. Re-read that paragraph — its subject is the **empty case** (no
stray container when nothing is registered), and `ToolbarSlot` still returns `null`
at line 65 when `groups.length === 0`. But you are changing the non-empty DOM, so
it belongs in the changelog and it is the one place a downstream stylesheet could
notice.

**1b. `data-prop-row`.** `src/PropertyForm/PropertyRows.tsx:57-70` maps each
`key` to `<UI data={propertyData} editorName={key} … />`. The row element is emitted
inside each editor (`StringEditor`, `NumberEditor`, `EnumEditor`, `BooleanEditor`,
`ColorEditor`, `DropdownEditor`, `ObjectEditor` — `src/PropertyForm/Editors.ts`
registers them). Prefer **one** edit: wrap the `getFormUI().map(...)` result in
`PropertyRows.tsx` with `<span data-prop-row={key} class="contents">`, rather than
touching seven editor components. Same `display: contents` rationale, same
verification.

**1c.** Nothing else in Phase 1. Commit it on its own; it is independently
reviewable and independently revertable.

### Phase 2 — registry

`src/Editor/EditorHelpStep.ts`, per §3.2/§3.3/§3.5. Pure TypeScript, no JSX, no
DOM writes. `resolveHelpTarget` is the only function that knows an attribute name.
Unit-test `resolveHelpSteps` ordering, duplicate-name warn-and-keep-first, and
`when()` filtering against a hand-built DOM before any UI exists.

### Phase 3 — balloon and tour

`HelpBalloon.tsx` then `HelpTour.tsx`, per §3.6. Mount the tour once, next to the
toolbar in `Editor.tsx`, gated on `helpTourActive` — **not** inside a
`useMemo`-returning-JSX child (`EditorToolbarSlot.tsx:19-24`), and **not** as
`{() => cond ? <Tour/> : null}` if the codebase's known woby trap applies here: a
void-returning conditional child mounts but may never unmount. Follow whatever
pattern `Editor.tsx:1244` already uses for the toolbar itself —
`{() => !$$(isReadonly) && $$(isEditing) && $$(enableToolbar) && <EditorToolbar … />}` —
since that one is proven in this file.

### Phase 4 — button and built-in steps

`HelpButton.tsx` modelled on `InfoButton.tsx`; registration in `builtinToolbar.tsx`
per §3.7; `builtinHelp.tsx` with wui's own generic steps (§8) and a side-effect
import from `Editor.tsx` next to `import './builtinToolbar'` (`Editor.tsx:23`).

### Phase 5 — i18n and docs

Add `editor.help.*` keys to every pack under `src/i18n/locales/`. Add an API page
under `docs/api/` matching whatever `cedc83a` (*"docs(editor): an API reference for
the three toolbar registries"*) established, and a `CHANGELOG.md` entry that calls
out the two new DOM attributes explicitly — they are the observable part of this
change for anyone with a stylesheet.

---

## 5. Invariants you must not break

1. **A registry is module-global; an editor is not a singleton.** A `HelpStep` is a
   *descriptor*. Anything per-editor (the resolved anchor, the current index, the
   balloon node) lives in the tour component, never in the registry.
   `EditorToolbarItem.ts` states this for toolbar items; it is the same rule.
2. **Never `useMemo(() => <jsx/>)` as a child.** `EditorToolbarSlot.tsx:19-24`.
   Plain `{() => …}`. A memo child rebuilds its subtree and closes open popups —
   which for a tour means the balloon vanishing mid-step.
3. **`useContext()` returns an observable.** Unwrap with `$()`. Called out as
   CRITICAL in `InfoButton.tsx`.
4. **Cross shadow boundaries with `composedPath()`, never `contains()`.**
   `useDropdownDismiss.ts` explains exactly why, at length. Reuse the hook.
5. **Resolve anchors from the editor's root node, then fall back to `document`.**
   `PropertyPanel.tsx:546-547` is the pattern. Both modes ship (§1.5).
6. **Toolbar buttons `stopPropagation()`.** Any document-level listener the tour
   adds must be **capture**-phase.
7. **A missing anchor is not an error.** Centred card, no arrow, tour continues.
8. **The spotlight never eats the click.** `pointer-events: none` on the overlay.
   The user must be able to press the real button.
9. **No new runtime dependency.** §7.3.
10. **`HelpStep` stays plain data.** No `Observable`, no `JSX.Child` fields. §3.4.

---

## 6. Traps found while reading

- **`plugin-groups` is one toolbar item that renders N dropdowns.**
  `builtinToolbar.tsx:147-152` registers `name: 'plugin-groups'` whose `render`
  returns *a function* that maps `pluginGroups()` to `<InsertDropDown group={…} />`.
  So `[data-toolbar-item="plugin-groups"]` is a wrapper around **all** grouped
  plugin dropdowns, not one of them. A step that wants to point at the compass
  family's own button cannot use `{ at: 'toolbar', item: 'plugin-groups' }` and get
  a single target. Either point at the wrapper and word the step accordingly
  ("your plugin menus live here"), or — better — have `InsertDropDown` stamp
  `data-plugin-group={group}` when it is rendered for a group, and extend
  `HelpTarget` with `{ at: 'pluginGroup'; group: string }`. The downstream consumer
  needs exactly this (§9), so plan for it rather than discovering it late.
  The comment at `builtinToolbar.tsx:136-145` also warns the thunk must stay a
  function child, not a memo — invariant 2 again.
- **The toolbar wraps.** `EditorToolbarSlot.tsx:37` sets `TOOLBAR_ITEM_WARN_AT = 32`
  and lines 67-74 explain that `flex-wrap` pushes the surface down the page. Adding
  `help` makes 27 built-ins. Fine — but a host with several plugins can wrap, and a
  wrapped toolbar invalidates every cached anchor rect. Re-measure, don't cache.
- **`registerToolbarGroup` overwrites; everything else keeps the first.** Stated in
  `EditorToolbarItem.ts`. Do not generalise from it (§3.5).
- **`defaults()` wraps a `null` default into `observable(null)`, which is itself a
  function**, so `typeof x === 'function'` guards pass spuriously. The fix already in
  the tree is `$$(props.onCommit, false)` — `PropertyRows.tsx:92-98` documents it.
  If a `HelpStep` callback ever travels through `defaults()`, you will hit this.
- **`PropertyRows.tsx:41-48` silently drops keys** matching `/^-([a-zA-Z].*)-$/`, or
  containing `Obj`, or starting with `$`. A step targeting such a prop resolves to
  nothing. Fall back to the centred card (invariant 7) rather than warning — the
  step author cannot always know.
- **Quote is not a button.** If you write a built-in step about block styles, point
  at `textFormat`, not at a blockquote button: `477d413` removed it and
  `builtinToolbar.tsx:154-168` explains that Quote lives in `TextFormatDropDown`.
- **`localized(given, key)` vs a bare `t(key)`.** Titles that a host may override go
  through `localized`; wui's own fixed strings go through `t`. Third-party English
  goes through `tx`. Three channels, and the balloon touches all three.

---

## 7. Why not the cheaper alternatives

**7.1 A static help page or a modal with screenshots.** It cannot point at anything,
so it re-describes the UI in prose and goes stale the first time a button moves.
The ask is explicitly *in-place*: the value is that the arrow lands on the control
the user is about to press.

**7.2 A hardcoded step array inside wui.** Half the requested steps — add compass,
add plan, set rotation, set facing — are meaningless in a wui editor with no compass
plugin installed, and wui must not know what a compass is. Without a registry the
feature cannot be delivered as asked.

**7.3 `floating-ui` / `popper.js` for positioning.** wui has no such dependency
today, and the two hard parts here are not positioning: they are crossing the shadow
boundary and keeping the spotlight click-through. A general-purpose positioner
solves neither and adds a bundle cost to every consumer — `su-yen/packages/风水`
already tracks wui's weight closely enough that `<sy-罗盘报告>` is deliberately kept
out of an index barrel to avoid pulling in `wui.css`. `TablePopupMenu.tsx` already
demonstrates that two `getBoundingClientRect()` calls are sufficient.

**7.4 `title` attributes / native tooltips.** No sequencing, no gating, no styling,
and they do not appear until hover — the opposite of a guided first run.

---

## 8. wui's own steps (the editor-generic half)

These ship in `builtinHelp.tsx` and use `t()`. They are the "how to use the editor"
part of the ask; everything compass-specific comes from outside.

| order | name | target | gist |
|---|---|---|---|
| 0 | `help.welcome` | *(none — centred)* | What this tour covers; Escape to leave. |
| 100 | `help.type` | `{ at: 'surface' }` | Click and type. The page is the document. |
| 200 | `help.format` | `{ at: 'toolbar', item: 'textFormat' }` | Headings, Normal, Quote, Code — block styles live here, not as separate buttons. |
| 300 | `help.inline` | `{ at: 'toolbar', item: 'bold' }` | Select text first; bold/italic/underline apply to the selection. |
| 400 | `help.insert` | `{ at: 'toolbar', item: 'insert' }` | Images, tables and page blocks. |
| 500 | `help.groups` | `{ at: 'toolbar', item: 'plugin-groups' }` | Plugin families get their own menus — *rendered only when `pluginGroups().length > 0`, via `when()`.* |
| 600 | `help.select` | `{ at: 'element', tag: '*' }` | Click an inserted element to select it; it gets a blue outline (`data-element-selected`). |
| 700 | `help.properties` | `{ at: 'toolbar', item: 'info' }` | With something selected, this opens its property panel. |
| 800 | `help.panel` | `{ at: 'panel' }` | Every property of the selected element; edits land on the undo stack. `when: ctx => !!ctx.el`. |
| 900 | `help.language` | `{ at: 'toolbar', item: 'language' }` | Switch the editor's language. |

Leave 1000+ free: the downstream consumer's steps sort into that range (§9).

---

## 9. The downstream consumer, and what it needs on day one

`su-yen/packages/风水` is a Feng Shui report workbench. It mounts a wui editor
(`packages/风水/src/罗盘报告.tsx`), registers eight compass plates as editor plugins
grouped under a `罗盘` dropdown (`packages/风水/src/罗盘组件.tsx`), and already
bridges wui's locale to its own catalogue:

```tsx
import { Editor, serializeEditorContent, locale, setLocale, onLocaleChange, registerLocale } from '@woby/wui'
连接wui({ locale, setLocale, onLocaleChange, registerLocale })
```

`packages/compass` does **not** import `@woby/wui` and will not. It will export a
plain array; `风水` will call `registerHelpSteps(...)` with it. What that array
needs from your API, concretely:

| # | Step | Needs from you |
|---|---|---|
| 1 | **Add a compass** | A target that resolves to the `罗盘` family's own dropdown button — i.e. the `{ at: 'pluginGroup'; group: '罗盘' }` case from §6, *not* `plugin-groups`. |
| 2 | **Add a floor plan** | `{ at: 'prop', prop: '底图' }` — the base-map URL row. Verified present: `罗盘组件.tsx` declares `文本('底图', '底图网址', …)` and `布尔('底图启用', '显示底图', …)`, and `compass/src/compass.tsx:177-178` reads them. Needs Phase 1b. |
| 3 | **Set rotation** | `{ at: 'prop', prop: 'rotation' }`. `compass.tsx:208` — `rotation: $(0, HtmlNumber)`, "manual compass heading, 0–359". `罗盘组件.tsx` exposes it as 文本 `'盘面朝向（度）'`. |
| 4 | **Set facing** | Also anchored on `rotation` (`compass.tsx:1715` renders the 坐/向 readout *from* it), so the step points at the same row with different words. Two steps sharing one anchor must both work — do not de-duplicate by target. |

Every one of those four needs `when: ctx => …` so it does not fire before a compass
exists in the document, and step 1 wants `advanceOn: 'insert'` so the tour moves on
by itself the moment the user actually inserts one. Both are in §3.2 because of
this consumer.

`风水` auto-starts the tour when the editor first mounts, right after the saved html
is parsed into the surface — a first-time author gets the tour without hunting for a
button, and everyone else gets the button. That call is already written and guarded
(`typeof startHelpTour === 'function'`), so it is inert until you land this and
self-activates the day you do. Which means: **do not rename `startHelpTour` or
change it to require an argument** without saying so.

It auto-starts at most once, and it decides that from `onEnd`:

```ts
// 风水/src/罗盘报告.tsx — 开场向导()
if (localStorage.getItem('fengshui:wizard-seen')) return   // already taught, or opted out
startHelpTour(undefined, { onEnd: r => { if (r !== 'dismissed') 记住() } })
```

Note the arity probe next to it: `if (开始.length < 2)` falls back to stamping on
open, because a one-argument `startHelpTour` gives the host no end signal and the
alternative is re-opening the tour on every page load forever. Ship `onEnd` and the
probe stops mattering; ship `startHelpTour` without it and this consumer is stuck
with exactly the behaviour the callback exists to fix.

Their titles and bodies arrive as **thunks over a non-wui catalogue**
(`风水/src/语言.ts` exports `文(key)` across `en` / `zh-Hans` / `zh-Hant` / `ms`), so
`title: () => 文('向导.加罗盘')`. If you narrow `title` to `string` or to
`ObservableMaybe<string>`, this consumer cannot use the feature — §3.4.

One more constraint from that package: `compass` also owns a `plan` layer separate
from `底图` (`compass.tsx:287` destructures `plan, planorigin, planx, plany,
planscale, planheading, planopacity, planvisible, planlock`). Those are not yet
exposed as editor props downstream. Nothing for you to do — but it means the "add
plan" step may later re-target from `底图` to `plan`, which is another reason the
target vocabulary must stay declarative rather than a frozen CSS selector.

---

## 10. Acceptance criteria

1. A wui editor with **no** help steps registered renders exactly as it does today,
   and the `help` toolbar button either is absent or opens a tour that says so —
   your choice, but it must not throw.
2. `data-toolbar-item` is present on every rendered toolbar item, built-in and
   third-party, and a screenshot diff of the toolbar at 1280px before and after
   Phase 1 shows no pixel change.
3. `data-prop-row` is present on every rendered property row, and the property panel
   is unchanged visually.
4. Starting the tour from the toolbar button walks all ten built-in steps; each one
   places the balloon against the right control, and the spotlight cutout tracks it.
5. The real control under the spotlight is still clickable.
6. `Escape` and an outside pointerdown both end the tour. Neither leaves a stray
   overlay, and neither loses the caret position in the document.
7. Resizing the window so the toolbar wraps re-positions the balloon without a
   reload.
8. The tour works with the editor in shadow-DOM mode **and** in light-DOM mode.
9. A step whose target does not resolve renders centred, with no arrow, and the tour
   continues to the next step.
10. `registerHelpSteps` accepts an array of object literals written in a file that
    imports **nothing** from `@woby/wui` or `woby`, and typechecks. Prove it with a
    fixture under `src/test/` that declares its steps with no imports.
11. `title`/`body` thunks are re-read when `locale` changes, without the balloon
    being torn down and rebuilt.
12. `hideToolbarItem('help')` hides the button and `startHelpTour()` still runs.
13. `onEnd` fires exactly once per tour, with `finished` after the last step,
    `dismissed` for Escape / outside click / close × / `stopHelpTour()` / zero
    surviving steps, and `suppressed` when "don't show this again" was ticked.
    Assert all four in a test — a host's first-run logic is built on this.
14. `pnpm run build` is clean, and `tsc --declaration --emitDeclarationOnly`
    produces types for every new export.

---

## 11. Working-tree state you are starting from

- Branch `main`, tip `477d413`, `git status` clean.
- `477d413` removed the standalone blockquote toolbar button; `cedc83a` added the
  toolbar-registry API reference under `docs/`; `92fc881` opened the toolbar to
  third-party plugins. The last three commits are all in this area — read them
  before starting.
- Nothing in this document has been implemented. No file named `HelpBalloon`,
  `HelpTour`, `HelpButton`, `EditorHelpStep` or `builtinHelp` exists.
- The `su-yen` side (compass step data, `风水` registration) is **not** yours. It is
  being written in parallel against the API in §3.2, §3.3 and §3.5. Those three
  sections are the contract; if you need to change one, say so in the changelog
  entry rather than changing it silently.

---

## 12. Post-landing check — one line still missing

Read against your working tree on 2026-09-14 (`EditorHelpStep.ts`, `HelpTour.tsx`,
`HelpBalloon.tsx`, `HelpButton.tsx`, `builtinHelp.tsx`, `?` registered at
`builtinToolbar.tsx:180`, `<HelpTour />` mounted at `Editor.tsx:1059`). The in-editor
half works. The **downstream** half cannot reach it yet:

`src/index.tsx` re-exports `./Editor/Editor`, `./Editor/EditorPlugin`, … but **not
`./Editor/EditorHelpStep`**. So `import { registerHelpSteps, startHelpTour } from
'@woby/wui'` is `undefined`, and every third-party step — including the five compass
steps 风水 already registers — silently never lands. The `?` button still runs your
ten built-ins, which is why this does not look broken from inside wui.

```ts
// src/index.tsx, next to the other Editor re-exports
export * from './Editor/EditorHelpStep'
```

That single line also switches on 风水's first-run auto-start, which is written and
guarded (§9) and inert until the symbol exists.

Two smaller notes while you are in there:

- `startHelpTour(tour = 'default', opts?: { from?: string })` has no `onEnd` (§3.5).
  Until it does, a host cannot tell "finished" from "dismissed", so 风水 falls back
  to stamping its first-run flag on open — the exact behaviour the callback exists
  to prevent. Arity cannot advertise the callback either: `Function.length` is **0**
  here, not 2, because `tour` has a default, and it stays 0 after you add `onEnd`.
  风水 therefore sniffs `Function.prototype.toString` for `onEnd`, which works
  because `opts?.onEnd` is a property read off the caller's literal and survives
  minification. If you would rather not have a consumer reading your source text,
  export a plain capability flag next to it and 风水 will switch to that.
- No "don't show this again" affordance in the balloon yet (§3.6). Without it,
  "not now" and "stop asking me" are the same gesture.


---

## 13. Second blocker, found by walking the tour in a real editor

Checked in the running app (风水 dev server, a saved report opened for editing) at
commit `521f1fe`. Two of the three things a plugin tour needs are there; the third
is not.

### 13.1 `{ at: 'prop' }` does not reach plugin properties

`selectorFor` maps `{ at: 'prop', prop }` to `[data-prop-row="…"]`, and that
attribute is stamped in exactly one place — `PropertyForm/PropertyRows.tsx:67`,
the generic object form. The property panel renders a **custom element's** plugin
properties through `PropertyForm.tsx`'s `TableRow` instead, which carries no such
attribute. Measured in the live panel with `<sy-compass>` selected and the panel
open:

```
[data-property-panel]          visible: true
[data-panel-part]              header, parent, identity, help, delete, close, form, style, resize
[data-prop-row] inside form    0          ← every plugin row, none of them stamped
```

So a third-party step that points at one of its own properties — the entire point
of a plugin-authored tour — resolves to nothing and is skipped. 风水's three
property steps (底图, rotation ×2) are in that position today.

The fix is the same one line `0d19cff` already applied to the other form:

```tsx
// PropertyForm/PropertyForm.tsx, in TableRow
<tr data-prop-row={propName} class="flex w-full items-stretch …">
```

`TableRow` currently receives the label (`optionName`, a `JSX.Child`), not the
property's key, so the key has to come down with it — a `name?: string` prop passed
by whatever builds the plugin rows. Labels are translated and can repeat; the key is
what a step names, and it must stay untranslated.

### 13.2 Selecting an element does not open the panel — please keep it that way

Worth stating because the tour copy depended on it and was wrong. Clicking
`<sy-compass>` stamps `data-element-selected` and leaves the panel at
`display:none`; the ⓘ toolbar button (`registerToolbarItem({ name: 'info' … })`) is
what opens it, and it toggles.

No change requested — the tour now has its own step pointing at ⓘ, gated on the
panel not already being open. Flagged only so it is not "fixed" later into an
auto-open, which would leave that step pressing ⓘ to close the panel it just asked
the user to look at.

### 13.3 What is verified on the compass side

With the editor open on a report, all non-prop anchors resolve:

```
[data-editor-root]              1
[data-toolbar-item]             26   (incl. "help" and "info")
[data-plugin-group="罗盘"]       1
[data-editor-root] sy-compass   1
```

So of the six compass steps, three (insert → select → ⓘ) are ready the moment
§12's export lands, and the remaining three need §13.1 as well.

### 13.4 The property panel covers the toolbar's right end — ? is unclickable while it is open

Not a help-API bug, but it breaks the help *entry point*, so it belongs here.

`PropertyPanel` lays out `position: fixed; z-index: 1100`. Measured in a real
editor at a 1409×1637 viewport:

```
[data-property-panel]                  fixed  z=1100  rect = 1085, 96, 300, 513
toolbar row 2 (sticky, z=10)                          rect =   14,163,1380,  40
[data-toolbar-item="info"]     button                 rect = 1147,167,  54, 32
[data-toolbar-item="language"] button                 rect = 1207,167,  54, 32
[data-toolbar-item="help"]     button                 rect = 1267,167,  54, 32
```

The panel's box starts at y=96, so its top strip sits over the toolbar and the
three right-most buttons land underneath it. `document.elementFromPoint` at the
? button's own centre (1294,183) returns a `TD` from inside the panel, not the
button — and a real (non-synthetic) click there lands on the panel. Three
consequences, all reproduced:

- **? cannot be reached while the panel is open.** A synthetic
  `button.dispatchEvent(new MouseEvent('click'))` starts the tour normally; a
  genuine pointer click at the same coordinates does not, because it never
  reaches the button. This is what "the ? does nothing" turned out to be.
- **ⓘ cannot close the panel it opened.** `InfoButton` toggles, but once the
  panel is up it covers its own toggle, so the only way out is the panel's own
  ✕ (`[data-panel-part="close"]`).
- Same for the language button.

Suggested fix on your side: give the panel a top offset below the toolbar, or
let it participate in the layout rather than float over it. From 风水's seat
either is fine — the tour does not depend on the panel's position, only on ⓘ
being clickable when the panel is closed, which it is.

For the record, the parts of the tour that *do* work were walked end to end at
this viewport: ? starts it, all 9 built-in steps advance, and every toolbar
anchor spotlights its real button box despite `[data-toolbar-item]` being
`display: contents` with a zero-sized rect of its own —

```
段落格式    spot = 100,127,124,40
插入内容    spot = 919,163,116,40
插件家族    spot = 1031,163,115,40
属性面板    spot = 1143,163, 62,40
语言        spot = 1201,163, 66,40
```

so `{ at: 'toolbar', item: … }` is sound and the compass tour's ⓘ step will
anchor correctly. Only §12 and §13.1 are outstanding.

### 13.5 `InsertDropDown`'s menu has no `top-full` — it opens *centred on* its button

Found while driving the compass tour's very first step (insert a 罗盘 from the
plugin-group menu) through the real UI. Not a help-API bug either, but it breaks
step 1's target, so it belongs with the rest.

`InsertDropDown.tsx:356-357` gives the menu:

    origin-top-left absolute left-0 mt-2 w-64 … z-10 max-h-80 overflow-y-auto

`left-0` is there, `top-*` is not, so the menu keeps its **static position** — and
the wrapper that provides the containing block is

    DIV.!h-8.!box-border.!inline-flex.!items-center.relative   rect = 1035,167,107,32

`align-items: center` on a 32px-tall flex line vertically centres a 296px-tall
菜单, so the used offset comes out negative. Measured in a real editor
(1409×1637, the 风水 新建报告 page):

    getComputedStyle(menu).top      = -136px        ← used value, not authored
    menu.getBoundingClientRect()    = 1035, 39, 256, 296
    button (offsetParent)           = 1035,167,107, 32

i.e. the menu straddles its button instead of hanging below it, and its top
~128px lands over whatever the host app puts above the toolbar. In 风水 that is
the 报告名称 / 副标题 header row, and the two topmost entries become
unclickable — `document.elementFromPoint` at their own centres returns the
header's `LABEL`:

    item 0  🧭罗盘          y= 43   reachable = false   (hit: LABEL 副标题)
    item 1  🧭奇门风水      y= 79   reachable = false   (hit: LABEL 副标题)
    item 2  🧭个人风水      y=115   reachable = true
    item 3  🧭八宅风水      y=151   reachable = true
    …
    item 7  🧭二十四山      y=295   reachable = true

A user can only insert the entries from the third one down. The compass tour's
`compass.insert` step points at `{ at: 'pluginGroup', group: '罗盘' }`, which
spotlights the button correctly — but the menu it opens hides its own first
choice.

`TextFormatDropDown.tsx:179` carries the identical class string, so it has the
same defect wherever its menu is taller than its button.

Suggested fix on your side: add `top-full` to both branches of the class in
`InsertDropDown.tsx:356-357` (and to `TextFormatDropDown.tsx:179`), matching the
older dropdowns that still have it — e.g. the zoom menu is
`origin-top-left absolute left-0 top-full mt-1 w-28 …` and opens correctly.
`self-start` on the menu would also work but leaves the offset implicit.

Verified this session against wui `521f1fe`: §12 (the `EditorHelpStep` export)
and §13.1 (`data-prop-row`) are still outstanding — a `?` tour in 风水 reports
**1 / 9**, wui's built-ins only, with none of the compass package's six steps.

---

A short, actionable version of the outstanding items in this file — §12, §13.1,
§13.4, §13.5, each with its exact fix site and an acceptance check — is in
`HELP_WIZARD_CHANGE_REQUEST.md` (2026-09-14).

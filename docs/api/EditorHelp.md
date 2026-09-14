# Editor Help API

The **Editor Help** API is the in-place coachmark tour — the balloon that walks a new user through
the toolbar, the surface, the property panel and back out again. Everything wui's own tour does
goes through one registry, so a host can add its own steps (or replace wui's) without touching the
tour driver.

| Registry entry | Module | Answers |
| --- | --- | --- |
| **`registerHelpStep(s)`** | `EditorHelpStep.ts` | A single step's data |
| **`registerHelpSteps(arr)`** | `EditorHelpStep.ts` | Several steps at once |
| **`unregisterHelpStep(name)`** | `EditorHelpStep.ts` | Remove one |
| **`startHelpTour(tour?, opts?)`** | `EditorHelpStep.ts` | Run a tour |
| **`stopHelpTour()`** | `EditorHelpStep.ts` | Dismiss the running tour |

The tour itself is per-editor runtime — a balloon mounted inside the editor, gated on the registry.
The registry is module-global: a wui page with several editors still has one tour at a time, and
a second `startHelpTour()` replaces the first.

> For the narrative version — when to reach for this, and the design constraints behind it — see
> the *In-place help wizard* section of the editor guides. This page is the reference.

---

# Import

```tsx
import {
  registerHelpStep,
  registerHelpSteps,
  unregisterHelpStep,
  getHelpSteps,
  resolveHelpSteps,
  startHelpTour,
  stopHelpTour,
  helpTourNext,
  helpTourBack,
} from '@woby/wui/Editor/EditorHelpStep'
```

`EditorHelpStep` exports the type vocabulary too:

```tsx
import type {
  HelpStep,
  HelpTarget,
  HelpPlacement,
  HelpContext,
} from '@woby/wui/Editor/EditorHelpStep'
```

The package barrel re-exports all of it, so `import { startHelpTour } from '@woby/wui'` works
too, along with `HelpButton` for hosts assembling their own toolbar. The deep
`@woby/wui/Editor/...` paths above keep working.

---

# The shape of a step

A `HelpStep` is plain data. No observables, no JSX — just the fields the tour driver reads.

```ts
interface HelpStep {
  /** Unique across the registry. Used by `unregisterHelpStep`. */
  name: string
  /** Tour this step belongs to. `'default'` is wui's own. */
  tour?: string
  /** Lower numbers sort first; equal numbers sort by registration order. */
  order?: number
  /** Where the arrow points. `undefined` renders a centred card with no arrow. */
  target?: HelpTarget
  /** Heading text. A thunk is read on every paint so locales can swap strings live. */
  title: string | (() => string)
  /** Body text. Same thunks-as-strings rule as `title`. */
  body: string | (() => string)
  /** Optional filter — the step is hidden if `when(ctx)` returns false. */
  when?: (ctx: HelpContext) => boolean
  /** How the step moves on: manual (Back/Next), click on the anchor, or watching for an insert. */
  advanceOn?: 'manual' | 'click' | 'insert'
  /** Side preference. `'auto'` picks the side with the most room. */
  placement?: HelpPlacement
}
```

# Where the arrow can point

`HelpTarget` is a closed union of eight cases. Anything else is a compile error, by design — the
tour's anchor resolver only knows these shapes.

| `at` | Fields | Resolves to |
| --- | --- | --- |
| `'surface'` | — | The `[data-editor-root]` element |
| `'toolbar'` | `item: string` | `<span data-toolbar-item={item}>` — the wrapper `EditorToolbarSlot` stamps around every registered item |
| `'panel'` | — | The `[data-property-panel]` element |
| `'panelPart'` | `part: string` | `[data-panel-part={part}]` — one named region inside the property panel |
| `'prop'` | `prop: string` | `[data-prop-row={prop}]` — the property row itself. See the `prop` section below. |
| `'element'` | `tag: string` | The first `<tag>` inside the surface. `tag: '*'` matches any descendant. |
| `'pluginGroup'` | `group: string` | `<div data-plugin-group={group}>` — the wrapper `InsertDropDown` stamps when it is rendered for a plugin family |
| `'selector'` | `css: string` | A literal CSS selector run against the editor's root |

All eight resolve through the editor's root node (ShadowRoot when shadow-DOM, Document
otherwise), with a single fallback to `document.querySelector` when the editor is in shadow mode.
Light-DOM editors never hit the fallback — `root` already is `document`.

## `panelPart` — the property panel's named regions

`part` is a **closed vocabulary**, not a free selector. `PropertyPanel.tsx` stamps exactly these:

| `part` | Region |
| --- | --- |
| `header` | The title bar — also the drag handle |
| `parent` | The ↑ "select my parent" button |
| `identity` | The `<h3>` naming the selected tag and its editor kind |
| `help` | The "?" that launches the `'properties'` tour |
| `delete` | The 🗑 button |
| `close` | The ✕ button |
| `form` | The scrolling property-rows area |
| `actions` | The plugin-action / image-action strip (present only for a custom element or an `<img>`) |
| `style` | The collapsible style-editor section (stamped in `StyleEditor.tsx`) |
| `resize` | The bottom-right resize grip |

A step naming a part that does not exist simply fails to resolve and is skipped, exactly like any
other unresolved target — there is no error.

## `prop` — one property row

`prop` is the property's **untranslated** name — the same `editorName` the row editors receive
(`Background`, not `背景`). Translation happens in the row's label cell; the identity never moves.

The attribute is stamped twice per row, on purpose. `PropertyRows` wraps each row editor in a
`<span data-prop-row={key} class="contents">`, and `TableRow` stamps the `<tr>` itself with the
`prop` its editor passes. The span is `display: contents` — it owns no box — so the resolver's
box-bearing descent falls through it onto the `<tr>`, which is the rect the balloon measures and
the spotlight outlines.

## Anchors that live inside an overlay: `data-help-clear`

Toolbar anchors have empty page around them; an anchor *inside a floating overlay* does not. The
property panel is pinned to the right edge of the viewport, so "beside the 🗑 button" and "on top of
the panel" are the same place — a coachmark that covers the thing it is pointing at.

An overlay opts out of that by stamping **`data-help-clear`** on its root (the property panel
does). The balloon then measures the **outward** edge of every placement from the marked overlay's
box instead of the anchor's, while the cross-axis alignment and the spotlight keep following the
anchor exactly. For an anchor not inside a marked overlay the keep-clear box *is* the anchor box and
nothing changes.

The available-room test uses the same box, so `placement: 'left'` will not be chosen just because
there happens to be room between the button and the panel's own left border.

# Running the tour

```ts
import { startHelpTour, stopHelpTour } from '@woby/wui/Editor/EditorHelpStep'

// wui's built-in editor tour — the toolbar walk
startHelpTour()            // same as startHelpTour('default')

// The property panel's own tour — what the panel's "?" button runs
startHelpTour('properties')

// A specific named tour
startHelpTour('onboarding')

// Start at the second step (e.g. resume after refresh)
startHelpTour('onboarding', { from: 1 })
```

`stopHelpTour()` is also the close button on the balloon and the listener behind Escape / outside
clicks. There is no `pause`; the tour either runs or it doesn't.

# Where it mounts

The tour is mounted once inside `Editor.tsx`, next to the toolbar, inside the same `relative`
container that the toolbar, resizer and property panel share. Its `position: absolute; inset: 0`
wrapper covers the surface's box, so the balloon's surface-relative offsets land where the geometry
code expects them.

Its `z-index` is **1150** — above the property panel (`z-[1100]`) and below the image dialogs
(`z-[1200]`). The panel is the reason for the number: at a lower value the tour painted *behind* the
panel, so every step pointing into the panel was covered by the thing it was pointing at. It costs
the toolbar steps nothing, because the spotlight is a box-shadow *cutout* — drawing it above an
element leaves that element undimmed rather than hiding it. The dialogs stay on top deliberately:
they are modal, and a tour is not.

The card is clamped to the union of the surface box and the keep-clear box, intersected with the
window, so a step anchored to a fixed overlay outside the surface still gets a fully on-screen card.

A host that wants to drive the tour from its own chrome can hide the toolbar button:

```ts
import { hideToolbarItem } from '@woby/wui/Editor/EditorToolbarItem'

hideToolbarItem('help')
```

The button is presentation-only. The tour, the registry and `startHelpTour()` are independent of it.

## The wrapper is `pointer-events: none`

The tour wrapper covers the whole editor so the spotlight can dim it, but it is
`pointer-events: none` — a press has to reach the real control underneath, which is the
point of a coachmark. That value **inherits**, so anything interactive the tour renders has
to opt back in with `pointer-events: auto`. The balloon card does this for its own
Back / Skip / Next; custom step content that draws its own buttons must do the same, or a
real mouse click falls straight through to the document behind it.

This is invisible to `element.click()`, which dispatches on the node without hit-testing.
Test tour buttons by hit-testing the centre point first — `root.elementFromPoint(cx, cy)`
has to return the button (or a descendant) before a synthetic press means anything.

# Built-in steps

`builtinHelp.tsx` registers ten steps at module load, all on the `'default'` tour. They sit at
`order` 0–900 in 100-step gaps, so a host can drop a "before everything" step at order `-100` or
slide one in between two of them at, say, `order: 250`.

| `order` | `name` | Anchor |
| --- | --- | --- |
| 0 | `help.welcome` | none — centred card |
| 100 | `help.type` | the surface |
| 200 | `help.format` | the `textFormat` toolbar item |
| 300 | `help.inline` | the `bold` toolbar item |
| 400 | `help.insert` | the `insert` toolbar item |
| 500 | `help.groups` | the `plugin-groups` toolbar item (only when at least one family is registered) |
| 600 | `help.select` | the first descendant of the surface |
| 700 | `help.properties` | the `info` toolbar item |
| 800 | `help.panel` | the property panel (only once something is selected) |
| 900 | `help.language` | the `language` toolbar item |

A host that wants its own tour — say, an *onboarding* tour that points at its own plugin's chrome
first and the built-ins after — registers steps with `tour: 'onboarding'` and calls
`startHelpTour('onboarding')`. The two lists never collide: the built-ins are filtered out by name
when the requested tour does not match.

# The property panel tour

A second built-in tour, registered under the name `'properties'` by `builtinHelpProperties.tsx` and
launched from the panel's own header rather than the toolbar.

## Launching it

1. Put the caret in the surface, or select an element.
2. Press the **ⓘ** toolbar item (`[data-toolbar-item="info"]`) — the property panel opens.
3. Press the circled **?** in the panel header (`[data-panel-part="help"]`).

Step 3 is literally `startHelpTour('properties')`; a host that wants the tour from its own chrome
calls that directly. The toolbar's own "?" runs `startHelpTour()` → the `'default'` tour.

## Why a second tour instead of more steps on `'default'`

The two answer different questions: the editor tour is "how do I write", this one is "what is this
dialog". Folding the panel's steps into the editor tour would double the length of the toolbar walk
for a user who only wanted the first half, and would run the panel steps before the user had any
reason to care about the panel. Launching from the panel starts the tour at the moment the question
arises, with the panel already open on the element being asked about.

## The steps

| `order` | `name` | Anchor (`panelPart`) |
| --- | --- | --- |
| 0 | `props.welcome` | none — centred card |
| 100 | `props.header` | `header` |
| 200 | `props.identity` | `identity` |
| 300 | `props.parent` | `parent` |
| 400 | `props.form` | `form` |
| 500 | `props.actions` | `actions` (only for a custom element with actions, or an `<img>`) |
| 600 | `props.style` | `style` |
| 700 | `props.delete` | `delete` |
| 800 | `props.resize` | `resize` |
| 900 | `props.close` | `close` |

Every targeted step shares one `when` gate — `el.getClientRects().length > 0`. That is what skips
`props.actions` for a plain paragraph, and it is also the graceful degradation: close the panel
mid-tour and every remaining step drops out, leaving the untargeted welcome step as the only thing
the tour can show.

All of them prefer `placement: 'left'`. The panel is pinned to the right edge of the viewport, and
`'auto'` prefers *below* — which for a panel step means a card drawn over the rest of the panel.
Combined with the panel's `data-help-clear` (above), `'left'` puts the card in the empty space
beside the **panel**, not beside the button, while the spotlight stays on the button.

# i18n

The ten editor steps' and ten panel steps' titles and bodies are `() => t('editor.help.<name>.<title|body>')` thunks.
A host that wants to retranslate them adds the keys to its own catalogue and the thunks pick them
up on the next paint — no re-mount required. The four balloon footer keys
(`back`, `next`, `skip`, `done`) and the counter (`stepOf`) are looked up the same way.

# Acceptance criterion

An editor with no help registered renders identically to one with the built-ins loaded. The tour
is gated on `helpTourActive !== null` and the registry is a module-level side effect of
`Editor.tsx`'s import graph; without `builtinHelp` the registry is empty, `startHelpTour()` finds
no steps, and the tour exits without painting anything.
# See also

- [EditorToolbar](./EditorToolbar.md) — the three registries whose `data-toolbar-item` anchors most
  of these steps point at
- [EditorPlugin](./EditorPlugin.md) — the plugin registry; its families are what the
  `plugin-groups` toolbar item and the `'pluginGroup'` anchor point at
- [Editor](./Editor.md) — the component the tour mounts inside
- [I18n](./I18n.md) — the `t()` thunks behind every built-in title and body

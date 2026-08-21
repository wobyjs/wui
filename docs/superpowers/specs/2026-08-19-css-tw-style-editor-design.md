# CSS / Tailwind style editor

**Date:** 2026-08-19
**Status:** implemented
**Location:** `src/Editor/StyleEditor/`

## Problem

The Properties panel edits a component's *declared props* — the list a plugin
publishes through `PropertyExtractor`. It cannot touch anything else about the
element. Changing a margin, a hover colour, or a `mask-type` meant leaving the
editor and editing source.

The panel needed a second section that edits the **element itself**: every CSS
property, on both surfaces an element actually carries style on — the `style`
attribute and its class list.

## Prior art

Browser devtools (Elements → Styles) edit the cascade but write nowhere
persistent. Tailwind-specific visual editors (Windframe, Tailwind Studio,
Builder.io's visual editor) write classes but only the ones in their own table,
so anything outside the utility set is unreachable. Neither shape fits: the
panel has to write somewhere the app can read back, *and* it has to reach
properties no utility names.

## Decisions

Three questions were settled before implementation.

### 1. Where an edit lands: per-row target toggle

Each row carries a small `tw` / `css` toggle deciding where that row's edit is
written. The row reads back from **both** surfaces and shows which one wins,
with a ⚠ badge when both set the same property.

Rejected: a panel-wide mode (an edit's destination then depends on invisible
state), and inferring the destination from the current origin (an element with
no value set has no origin to infer from).

### 2. States: a base / hover / focus / active bar

Editing under `hover` writes `hover:bg-blue-600`. Breakpoints were deliberately
deferred — they multiply the state space by five and the panel has no way to
preview them.

### 3. Coverage: everything the browser reports

The catalogue is the full computed enumeration (~350 longhands) plus a
hand-written shorthand list, not a curated subset. A curated subset is a promise
that keeps breaking: `mask-type`, `text-wrap`, `anchor-name`, and everything
shipped next year are all missing from it.

## Architecture

Four modules, each usable and testable on its own.

```
propertyCatalog.ts   what properties exist, how they group, what control edits one
TwBridge.ts          class token <-> CSS declarations
StyleModel.ts        read/write one property on one element, across both surfaces
StyleRow.tsx         one row of UI
StyleEditor.tsx      the collapsible section, mounted into PropertyPanel
```

### propertyCatalog

`allProperties()` iterates `getComputedStyle(document.documentElement)` — the
computed declaration of any element enumerates the full supported set, while an
element's *inline* declaration enumerates only what is set (so
`document.body.style` yields nothing). Custom properties are dropped; they mean
something different on every element.

Shorthands are added by hand, because `getComputedStyle` resolves them away:
there is no computed `padding`, only four longhands — but "padding" is what a
person looks for.

The curated group lists are also seeded into `allProperties()` unconditionally.
A real browser enumerates every one of them anyway; a partial DOM (happy-dom
reports nine) would otherwise collapse the catalogue to the shorthand list and
take every grouped row with it.

### TwBridge — the asymmetry that makes this work

The two directions are deliberately **not** inverses of each other:

- **token → CSS** is resolved by *scanning stylesheets*. Whatever `p-4` means is
  whatever the rule `.p-4` says. No parser, no theme config, no dependency on
  how the class got there — so it works identically for build-time Tailwind,
  `RuntimeTailwind`'s output, and a `.card` from the project stylesheet that has
  nothing to do with Tailwind.
- **CSS → token** is *built*: a small `UTILITY` map where an exactly-equivalent
  utility exists (`text-[red]` rather than `[color:red]`), and Tailwind v4's
  arbitrary-property syntax `[prop:value]` otherwise. The arbitrary form is what
  makes "every property" achievable — it needs no table entry and composes with
  variants (`hover:[mask-type:luminance]`).

"Exactly equivalent" is the whole bar for `UTILITY`: `w-[100px]` must set
`width` and nothing else. Everything ambiguous falls through to the arbitrary
form, which is never wrong.

Because the directions are independent, the panel never has to trust that they
agree — it writes with one and reads back with the other, so a disagreement
shows up as a visibly wrong value rather than silent corruption.

Three subtleties in the scan:

- **Grouping rules are descended into.** Tailwind v4 wraps utilities in
  `@layer utilities` and puts `hover:` behind `@media (hover: hover)`.
- **`cssRules` is not the mark of a grouping rule.** CSS nesting gave every
  style rule an (almost always empty) child list, so testing for the property
  alone descends into nothing *and drops the rule itself* — which silently
  emptied the whole index. This was a real bug, found by the tests.
- **Shorthands are probed by name.** A declaration list enumerates longhands
  only, so a `padding` row would never find itself in `.p-4`'s declarations.
  `getPropertyValue('padding')` returns a value only when the rule really does
  set the whole shorthand, so this adds keys without inventing them.

A `written` map records what `buildToken` produced, so a read in the frame
before `RuntimeTailwind` compiles still reports the value the user just typed
instead of blanking the row and refilling it.

### StyleModel — precedence, and never writing an invisible edit

`readStyleState` reports all three sources so a row can show the effective value
*and* where it came from: `style` attribute → class tokens → computed.

The clearing rules are the part that matters:

- A `tw` write **removes the inline declaration**, which would otherwise
  override the new class and make the edit look like it did nothing.
- Either write removes class tokens that set *only* this property.
- A token setting several properties (`.card`, or `p-4` under a `padding-top`
  row) is **left alone** and reported in `blockedBy`. Deleting it to change one
  property would silently take the others too — worse than the badge shown
  instead.
- An invalid value is rejected without touching the element. Validation asks the
  CSSOM (`probe.style.setProperty`, then read back) because that is the only
  correct answer: a declaration silently drops what it cannot parse.

Under a non-base state the surface is forced to `tw` — a `style` attribute
cannot express `:hover` — and the row disables the `css` toggle to match.

### Known limitation: states cannot be read

No scripting API forces a pseudo-state, so `getComputedStyle` cannot report
`:hover`. Under a state with nothing set, the only honest reading is base's
value, and the row shows it greyed and italic with `fromBase: true` rather than
pretending it knows.

## UI

- **State bar** — base / hover / focus / active, with a "tw only" hint off base.
- **Set on this element** — the properties actually set, on either surface,
  including ones contributed by classes nobody here wrote. Almost always what
  someone opened the panel to change.
- **Search** — filters the full catalogue, capped at 80 results with an explicit
  "N more — narrow the search" line rather than a silent truncation.
- **Collapsed groups** — Layout, Size, Flex & Grid, Spacing, Typography,
  Background, Border, Effects, Transitions, Interactivity, Other. A closed group
  renders `null`, so ~350 rows cost nothing until asked for.
- **Class bar** — every token as a removable chip, plus a free-text add field,
  for classes the property rows cannot express.

Controls are chosen from the property name: colour swatch + text, length with
unit and arrow-key stepping, `<datalist>`-backed enum, plain text otherwise.
CSS-wide keywords (`inherit`/`initial`/`unset`/`revert`) are offered everywhere.

Two woby-specific constraints shape the implementation:

- Handlers are bound imperatively through `ref` (`el.onclick = …`), not through
  JSX props, because delegated events do not reach inside the editor's shadow
  root.
- Conditional sections are written `cond ? <X/> : null`, never
  `{() => cond && <X/>}`, which renders but never un-renders.

`src/Collapse.tsx` is deliberately not used for the header: it pulls in
`@woby/chk` and `./input.css` and forces its own background.

## Integration

`<StyleEditor target={propertyTarget} onEdit={saveDo} />` is appended inside
PropertyPanel's existing scroll container, below `PropertyForm`, collapsed by
default so the panel opens at its usual height. It is appended rather than
folded into PropertyForm because the two edit different things: PropertyForm's
rows come from a plugin's declared property list, while these rows exist for any
element at all. `onEdit` pushes an undo entry through the existing `saveDo`.

## Testing

`test/StyleEditor.test.ts` — 37 tests over the catalogue, the bridge, and the
model: variant splitting and joining, token building including underscore
escaping, stylesheet resolution (plain, variant, nested in an at-rule, and a
non-Tailwind class), precedence, both write surfaces, the shared-token
`blockedBy` path, state forcing, clearing, validation, and a
write-then-read-back round trip through the stylesheet.

Not covered: a real-browser pass. The repo's Playwright config is parked
(`test/playwright.config.parked.ts`), so the browser-side round trip is
currently manual. happy-dom did reproduce the CSS-nesting bug above, which was
the failure mode most likely to have needed a real engine.

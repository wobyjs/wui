# Handoff: action buttons in the property panel (`type: 'action'` / `EditorPlugin.actions`)

**Audience:** the agent implementing this inside `D:\Developments\tslib\@woby\wui`.
**Status:** design + verification complete, nothing implemented. No wui source file was
modified in producing this document.

Every `file:line` below was read and verified against the working tree on 2026-08-20.
Line numbers are from `@woby/wui/src/...` unless the path says otherwise.

---

## 0. Scope, in one paragraph

Downstream (`su-yen/packages/report`) needs a **button** in the property panel: select a
`<sy-bq>` block, click "🎲 Reroll", and the block re-randomises its own look. Today wui's
`PluginProp` can only describe *values* — `string | number | boolean | color | enum | date`
(`Editor/EditorPlugin.ts:6`) — so a plugin can render a text box for `seed` but cannot render
anything the user can *press*. The report app worked around this with a toolbar button
(`report/src/templates/模板编辑.tsx:297-299`), which proves the mechanism works but is
global, not per-element, and lives in the wrong package. Your job is the generic wui-side
affordance. You are **not** implementing the reroll itself.

---

## 1. The two problems, stated separately

### Problem A — no button affordance exists

`PluginProp` (`Editor/EditorPlugin.ts:8-67`) describes a value with a type, a label, a default
and some presentation flags. Every one of those types resolves, eventually, to a row widget
that reads and writes an attribute. There is no member that means "run this function".

The prior art in report is a toolbar button, and its own comment already names the gap
(`report/src/templates/模板编辑.tsx:141`, verbatim):

> It is a button rather than a panel row because wui's `PluginProp` has no button type;
> the panel still exposes `seed` as text.

What that button does is one line
(`report/src/templates/模板编辑.tsx:157-165`, condensed):

```ts
el.setAttribute('seed', String(Math.floor(Math.random() * 100000)))
```

…where `el` is `range.commonAncestorContainer`'s nearest `closest('sy-bq, sy-cd')`
(`模板编辑.tsx:151-155`). The element re-renders immediately, because `sy-bq` recomputes its
class list from `seed` in a `useMemo` (`styles/src/bq.tsx:394-408`) and writes it in an effect
(`styles/src/bq.tsx:411-418`). **So attribute-driven reroll already works end to end.** The
missing pieces are (i) a place to put the button that is per-plugin and inside the panel, and
(ii) Problem B.

### Problem B — the dropdowns do not reflect the roll

**wui's property panel is NOT at fault. Do not go looking for a reactivity bug in wui.**

Here is the whole causal chain, verified:

* `generateStyle(id, props, sessionSeed)` (`styles/src/bq.tsx:34`) seeds an LCG from the id and
  session seed (`bq.tsx:35`, `bq.tsx:38`) and derives colour (`:48`), font (`:55`), rotation
  (`:61-65`), radius (`:68-99`), background (`:102-131`), pattern (`:134-161`), border
  (`:164-225`), shadow (`:234-255`) and decoration (`:258-366`). Each facet has an optional
  attribute override that wins if present (`:50-53` for colour, `:57` for font, and so on).
* It returns `{ id, css, desc, baseClass }` (`bq.tsx:369-374`). **The individual choices are
  never returned and never written anywhere.** Only the joined class string escapes.
* The panel's rows for `color`, `background`, `border`, `shadow`, `radius`, `decoration` are
  declared in report's catalogue as enums with an empty first option labelled `'依样式编号'`
  (`report/src/templates/组件表.ts:434-455`).
* Rerolling writes only `seed`. The override attributes stay absent. The panel mirrors the DOM
  faithfully — and the DOM genuinely still says "no override". So the dropdowns correctly show
  "依样式编号" (empty) both before and after the roll, and the user reads that as "the panel
  didn't update".

The panel's mirror is doing its job. `seed` *does* update in the panel after a reroll, via the
MutationObserver at `Editor/PropertyPanel.tsx:338-367`. The rolled choices simply never become
DOM state, so there is nothing for any observer to observe.

---

## 2. Ground truth — how the panel actually works

Read this section before designing anything; three of the design constraints fall straight
out of it.

### 2.1 Extraction is a snapshot, keyed by label

`extractCustomElementProperties(el)` (`Editor/PropertyExtractor.ts:541-599`):

* seeds the map with a plain string `tagName` (`:542`) — *not* an observable; the mirror has to
  special-case it (`PropertyPanel.tsx:344-350`);
* skips `hidden` props (`:549`);
* reads the attribute under both the kebab spelling and the raw prop name (`:552-555`), because
  woby maps camelCase props to kebab attributes (`attrName`, `:463`);
* for `live` props shares the component's own observable off `el.props[p.name]` (`:562-563`);
* hangs `.options` on the observable for enums (`:566-568`) and `.propType` on every observable
  (`:577`) — **the observable is the only channel a row widget gets**, as the comment at
  `:571-576` spells out;
* keys the map by `p.label ?? p.name` (`:579`);
* runs the blind attribute scrape **only** when the plugin declares no props at all (`:590`),
  and that scrape skips `style`, `class`, `contenteditable` (`:593`) and anything starting with
  `data-` (`:594`).

### 2.2 Row dispatch is value-shaped, and refuses empty values

`PropertyForm` (`PropertyForm/PropertyForm.tsx:96`) walks the extracted map and, per key:

```ts
// PropertyForm.tsx:134-138
const isRenderable = actualValue !== null && actualValue !== undefined && (
    !(actualValue instanceof HTMLElement) || key === 'children')
if (!isRenderable) return null
```

then asks every registered editor's `renderCondition` (`PropertyForm.tsx:140-145`) and renders
**every** one that returns true — two matches means two rows.

The registry is `Editors` (`PropertyForm/Editors.ts:18-23`), a global observable array of
`{ UI, renderCondition(value, key) }`. Registration order matters because dispatch is
"all matches", and `EnumEditor` deliberately unshifts itself to the front
(`PropertyForm/EnumEditor.tsx:74`) while `StringEditor` appends (`StringEditor.tsx:65`).
Current conditions:

| editor | `renderCondition` | line |
|---|---|---|
| EnumEditor | `Array.isArray(value.options)` | `EnumEditor.tsx:19-22` |
| ColorEditor | string matching `/^#[0-9A-F]{6}$/i` | `ColorEditor.tsx:9-17` |
| NumberEditor | `typeof value === 'number'` | `NumberEditor.tsx:9-12` |
| BooleanEditor | boolean | `BooleanEditor.tsx` (registered `:60`) |
| ObjectEditor | object and not array | `ObjectEditor.tsx:7-12` |
| DropDownEditor | array, key ≠ `thematic` | `DropdownEditor.tsx:13-15` |
| StringEditor | string, no `.options`, `propType !== 'date'` | `StringEditor.tsx:11-23` |

`TableRow` (`PropertyForm/PropertyForm.tsx:56-78`) is the shared `<tr>` / 150px `<th>` / `<td>`
shell; any new row widget must reuse it or the panel's columns stop lining up. Note there is a
**second** renderer with the same dispatch shape, `PropertyRows`
(`PropertyForm/PropertyRows.tsx:38-80`, registered as `wui-property-rows` at `:113`) — a new
editor registered in `Editors` shows up in both, so test both or knowingly accept the second.

### 2.3 Write-back, and the two places it bails

One `useEffect` per property (`PropertyPanel.tsx:262-311`), each of which:

* **skips its first run** (`extractionPass`, `:276-279`) — the long comment at `:263-275`
  explains that replaying the extracted value would strip attributes equal to the default;
* returns early on `undefined`/`null` (`:280`);
* calls `applyCustomElementProperty(target, key, val)` (`:288-290`) for custom elements;
* then `saveDo()` (`:310`) to push an undo step.

`applyCustomElementProperty` (`PropertyExtractor.ts:607-648`):

* ignores `tagName` (`:610`);
* finds the spec by `(p.label ?? p.name) === key` (`:613`);
* **`if (spec?.readonly) return` (`:617`) — `readonly` is enforced only on write.** Nothing at
  render time consults it, so a `readonly` prop still draws an ordinary editable widget whose
  edits silently do nothing. Relevant if you plan to lean on `readonly` for Problem B.
* computes `unset` from `resolveDefault ?? default` (`:623`);
* booleans set/remove (`:638-639`), `''` or `unset` removes (`:640-641`), else `setAttribute`
  (`:643`);
* calls `plugin.onPropChange(el, attr, value)` (`:647`, and `:635` on the textContent path) —
  **note it passes the kebab attribute name, not the schema key**. A plugin matching on
  `p.name` for a camelCase prop will never match.

### 2.4 The mirror, and its termination argument

`PropertyPanel.tsx:314-367`. The doc comment at `:333-336` is the loop-termination argument you
were told to re-check; verbatim:

> The round trip terminates on its own. A mirrored value re-runs that prop's effect, which
> writes the same value back to the attribute; the resulting mutation record extracts to a value
> the observable already holds, and writing an unchanged value into a woby observable notifies
> nobody.

Mechanically (`:338-367`): it reads `customElementWatchSpec(target)` for an `attributeFilter`,
re-runs `extractCustomElementProperties` on every mutation, and writes into the **existing**
observables, skipping non-observables (`:346-349`). Only keys already present are synced
(`:341` iterates `Object.keys(obj)`), because a new key would need a new row — a fact that
matters in §5.

`customElementWatchSpec` (`PropertyExtractor.ts:518-533`) returns **no filter at all** for a
schema-less element (`:520`), which MutationObserver reads as "all attributes"; for a schema it
returns both spellings of every non-hidden prop (`:525-530`).

### 2.5 Buttons in the panel must not use `onClick`

The panel lives in a shadow root. Both existing panel buttons wire the handler imperatively:

```tsx
// PropertyPanel.tsx:895-898 (select-parent) and :941-945 (delete)
ref={(el) => { if (el) el.onclick = selectParent }}
```

with the comment at `:942-944`: *"woby's synthetic onClick delegation does not reach into a
shadow root"*. Same at `:968` for the close button. **Any button you add must do the same.**

### 2.6 Precedent for a non-row panel section

`<StyleEditor target={propertyTarget} onEdit={saveDo} />` is rendered **after**
`<PropertyForm>` rather than inside it (`PropertyPanel.tsx:987` then `:998`), and the comment at
`:990-997` justifies it: it edits the element itself, not the component's declared props. This
is the in-repo precedent for the button-strip option in §4.

### 2.7 What is exported, and from where

* `Editor/index.ts:27-28` exports the plugin functions and `export type { EditorPlugin,
  InsertMenuItem, PluginProp, PluginPropType }`. It exports `extractCustomElementProperties`
  (`:33`) but **not** `customElementWatchSpec` and **not** `applyCustomElementProperty`.
* The root barrel `src/index.tsx` re-exports `./Editor/Editor` and `./Editor/EditorPlugin`, but
  **not** `./Editor/index.ts`.
* `package.json`'s `exports` map has only `.`, `./style.css`, `./dist/wui.css` — **no deep
  subpaths**.

**Consequence:** anything `packages/report` must import has to live in
`Editor/EditorPlugin.ts` (already re-exported from the root barrel) or be explicitly added to
the root barrel. Putting a new public type in `PropertyPanel.tsx` or a new module makes it
unreachable downstream. This is the single most likely way to ship something that compiles
here and cannot be wired up there.

---

## 3. Option 1 — `type: 'action'` on `PluginProp`

```ts
// Editor/EditorPlugin.ts:6
export type PluginPropType = 'string' | 'number' | 'boolean' | 'color' | 'enum' | 'date' | 'action'

export interface PluginProp {
    // …
    /** For type 'action': invoked when the row's button is pressed. */
    onAction?: (el: HTMLElement) => void
    /** For type 'action': button caption. Defaults to `label ?? name`. */
    buttonLabel?: string
}
```

An action prop has **no value**. That single fact is what makes this option expensive, because
the entire pipeline in §2 is value-shaped. Exactly which functions need a guard:

| function | file:line | required change |
|---|---|---|
| `coerce` | `PropertyExtractor.ts:475-503` | Add `case 'action'` before the `default:` string fall-through (`:499-501`), returning a stable non-null sentinel. Also guard the null-attribute branch at `:479-485`, which would otherwise hand back `spec.default ?? ''`. Without this the row value is `''`, which `applyCustomElementProperty:640` treats as "unset" and which `StringEditor` happily claims. |
| `extractCustomElementProperties` | `PropertyExtractor.ts:541-599` | For `p.type === 'action'` do **not** read any attribute (`:552-555`); emit an observable holding the sentinel, tag it `.propType = 'action'` (already unconditional at `:577`) and hang whatever the row widget needs (the callback, the caption) on it, exactly as `.options` is hung at `:567`. **The `.options`/`.propType` side-channel is the only route to the row** (`:571-576`). |
| `customElementWatchSpec` | `PropertyExtractor.ts:518-533` | Skip action props at `:525` so their names do not enter `attributeFilter`. Not correctness-critical (nothing writes that attribute) but it keeps the observer narrow and stops a stray hand-authored `reroll=""` from firing re-extractions. |
| `applyCustomElementProperty` | `PropertyExtractor.ts:607-648` | Early-return for an action spec, next to the `tagName` guard at `:610` / the `readonly` guard at `:617`. **Mandatory** — otherwise the sentinel is written to the DOM as a junk attribute on every panel open, and `onPropChange` (`:647`) fires spuriously. |

Plus a new editor module registered into `Editors`, with
`renderCondition = (v) => (v as any)?.propType === 'action'`, reusing `TableRow`
(`PropertyForm.tsx:56-78`) and wiring the click with `ref={el => el.onclick = …}` (§2.5).

**Interaction with `default` / `resolveDefault`:** they must be ignored for actions, and the
sentinel must never equal `unset` (`PropertyExtractor.ts:623`) or the write path would treat a
press as an attribute removal. Cleanest is to leave the value out of the DOM contract entirely,
which is what the `applyCustomElementProperty` guard achieves.

**Interaction with the mirror:** the mirror writes `cur($$(next))` only for observables already
in the map (`PropertyPanel.tsx:341-350`). A sentinel-valued observable is an observable, so it
would be rewritten with the same sentinel on every mutation — harmless *if* the sentinel is
value-stable (`'action'`, `0`, `false`). It is **not** harmless if you make the sentinel the
callback function or a fresh object per extraction: each mirror pass would then notify, re-run
the per-prop effect, and (absent the `applyCustomElementProperty` guard) write an attribute,
which is a genuine loop. **Keep the sentinel a primitive; carry the callback on the observable's
side-channel, not in its value.**

**Cost:** four extractor guards + one editor module + one type change, and the sentinel is a
hack visible in three files.

---

## 4. Option 2 — `EditorPlugin.actions?: { label, title?, run(el) }[]`

```ts
// Editor/EditorPlugin.ts, alongside props at :125
export interface PluginAction {
    /** Button caption. */
    label: string
    /** Tooltip. */
    title?: string
    /** Invoked with the selected element. */
    run: (el: HTMLElement) => void
    /** Optional icon, same shape as EditorPlugin.icon (:79). */
    icon?: () => JSX.Child
}

export interface EditorPlugin {
    // …
    /** Buttons rendered as a strip in the property panel for this element. */
    actions?: PluginAction[]
}
```

Rendered as a strip in `PropertyPanel.tsx`, placed next to `<StyleEditor>` at `:998` (i.e.
after `<PropertyForm>` at `:987`), guarded on `$$(selectionType) === 'custom'` and on
`getPluginForElement(target)?.actions?.length`.

**Touches zero value-pipeline code.** `coerce`, `extractCustomElementProperties`,
`customElementWatchSpec` and `applyCustomElementProperty` are all untouched; there is no
sentinel, no `Editors` registration, no dispatch collision, no `PropertyRows` duplicate. It
needs `getPluginForElement`, already imported by the panel via `Editor/index.ts:27`.

**Cost:** the buttons are not adjacent to any particular row. For "reroll the whole block" that
is *correct* — the action is about the element, not about `seed`.

---

## 5. Recommendation

**Implement Option 2 (`EditorPlugin.actions`) as the primary API and ship it first. Add
`type: 'action'` (Option 1) as a second, narrower affordance only if a caller actually needs a
button pinned beside one field — and if you do add it, add all four guards from §3 in the same
change.**

Reasons, in order of weight:

1. **A value-less concept does not fit a value-shaped pipeline.** `PropertyForm.tsx:134-138`
   refuses to render a row for `null`/`undefined`, and `PropertyPanel.tsx:280` refuses to
   write one. An action prop therefore only exists by carrying a fake value through four
   functions whose entire job is to keep fake values *out* of the DOM
   (`applyCustomElementProperty:640` deletes attributes equal to the default; the
   `extractionPass` skip at `PropertyPanel.tsx:276-279` exists because an earlier build
   stripped `type=` and `children=` off `<wui-button>` merely by opening the panel). Adding a
   member whose invariant is "never let this reach the DOM" to that pipeline is four new places
   to get it wrong.
2. **The strip has direct precedent.** `StyleEditor` at `PropertyPanel.tsx:998` is already a
   non-row panel section appended after the form, with a comment at `:990-997` articulating
   exactly this rationale.
3. **Registration-order fragility.** `Editors` dispatch renders *every* match
   (`PropertyForm.tsx:140-145`); `EnumEditor` already has to unshift itself (`EnumEditor.tsx:74`)
   and `StringEditor` already carries two exclusion clauses (`:14`, `:17`) to avoid double rows.
   A new editor makes that list one entry longer in two renderers (`PropertyForm` and
   `PropertyRows`).
4. **Semantics.** "Reroll this block" is an operation on the element. It is not a property of it.

Do not delete or deprecate the existing `props` path; the two are complementary.

---

## 6. Problem B — making the roll visible

Restating the constraint from §1: the panel is correct; the choices are not in the DOM. Two
ways to put them there.

### Option (a) — `generateStyle` returns structured choices; the action writes them back

`generateStyle` grows a `choices` field; the reroll action calls it and does
`el.setAttribute('color', choices.color)` and so on for every facet.

**This does not work as stated, for two independent reasons.**

*Reason 1 — those attributes are OVERRIDES.* `bq.tsx:50-53` and `:57` (and the equivalents for
every other facet) apply the attribute *in place of* the rolled value. The moment the action
writes them, the block is fully pinned: the next reroll changes `seed`, `computedCss`
(`bq.tsx:394-408`) recomputes, and every facet comes back from the overrides — the look does
not change at all. To keep rerolling you must first `removeAttribute` every facet you previously
wrote, which means the action has to know which attributes were machine-written versus which the
user chose deliberately. There is no marker in the DOM distinguishing them. You would have to
invent one — at which point you are in option (b)'s namespace anyway.

*Reason 2 — `sy-cd` cannot do this at all.* See §8, premise corrections: `generateCDStyle`
returns a bare string (`styles/src/cd.tsx:137`) and `CD` declares only `seed`, `styles`, `all`,
`cls`, `class` (`cd.tsx:156-161`). There are no facet attributes to write.

### Option (b) — the element reflects its resolved choices itself, into a separate namespace

After each render, `sy-bq` writes its *resolved* choices to read-only attributes in a distinct
namespace — `data-rolled-color`, `data-rolled-font`, … — leaving the override attributes alone.
The panel shows them as read-only rows; the override dropdowns keep meaning "override", stay
empty when there is no override, and the user can still see what the roll actually produced.

There is precedent for an element writing its own DOM from inside an effect:
`bq.tsx:411-418` already assigns `el.className` that way.

**This is the recommendation** — but with three caveats you must design around, all of which
land in wui:

1. **`data-`-prefixed attributes are invisible to the blind scrape** (`PropertyExtractor.ts:594`).
   Irrelevant here, because `sy-bq` *has* a schema (`组件表.ts:434-455`), so the scrape is
   skipped anyway (`:590`) and every row must be a declared `PluginProp`. So the rolled fields
   must be declared props with `readonly: true`. **And per §2.3, `readonly` is enforced only on
   write (`:617`), never at render — so a `readonly` row still draws an editable widget.** If a
   genuinely non-editable presentation is wanted, that is a *separate* wui change (make
   `PropertyForm`/the editors consult `.propType`-style metadata for readonly), and it should be
   called out rather than assumed.
2. **The attribute filter must include them.** `customElementWatchSpec` builds the filter from
   declared props (`:525-530`). Declared `readonly` props are included (only `hidden` is
   skipped, `:525`), so this works *provided* the prop names match the attribute names after
   `attrName` (`:463`) — i.e. declare `name: 'data-rolled-color'` literally, not
   `dataRolledColor`.
3. **The loop-termination argument at `PropertyPanel.tsx:333-336` still holds — but only
   because of the `readonly` guard.** Re-derive it for this case: element writes
   `data-rolled-color` → mutation → mirror re-extracts → writes the new value into the existing
   observable → that observable's per-prop effect runs → `applyCustomElementProperty` →
   **`spec.readonly` returns at `:617`** → no attribute write → no further mutation. Terminated.
   Drop `readonly` and the argument falls back to the original one (write the same value, DOM
   unchanged, no mutation record), which also terminates — *unless* the element's own effect
   re-runs on that attribute change and rewrites it, which would be a real cycle. **So:
   `readonly: true` on every reflected field is load-bearing, and the element must not read its
   own `data-rolled-*` attributes back as inputs.** Say so in the styles-side ticket.

One more mirror limitation to note downstream: the mirror only syncs keys **already present** in
the extracted map (`PropertyPanel.tsx:341`), by design (`:329-332`). So the rolled fields must be
declared props from the start; an element that starts emitting a brand-new attribute mid-session
will not grow a row until the user reselects.

### What you (wui) actually build for Problem B

Nothing, beyond §5, **except** one decision to surface: whether `readonly` should also suppress
editing at render time. Everything else in Problem B is a `packages/styles` change. Do not
attempt to fix Problem B from inside wui.

---

## 7. Ownership split

### `@woby/wui` — you. Build:

* `PluginAction` type + `EditorPlugin.actions?: PluginAction[]` in **`src/Editor/EditorPlugin.ts`**
  (must be there or in the root barrel — §2.7).
* Render the strip in **`src/Editor/PropertyPanel.tsx`**, near `:998`, using
  `ref={el => el.onclick = …}` (§2.5).
* Add `PluginAction` to the type export at `Editor/index.ts:28` for internal consistency.
* Optional, only if you also do Option 1: `'action'` in `PluginPropType` (`EditorPlugin.ts:6`),
  the four guards in `PropertyExtractor.ts` (§3 table), and one editor module registered into
  `Editors`.

### `@woby/wui` — you. Do **not**:

* touch `styles/src/bq.tsx` or `styles/src/cd.tsx` — different repo (`su-yen`), and Problem B is
  theirs;
* touch `report/src/templates/*` — including removing the toolbar button at `模板编辑.tsx:297`;
  it stays until the panel affordance ships and is verified;
* change `generateStyle`'s return shape, or design the reroll algorithm;
* refactor the `Editors` dispatch, `EnumEditor`'s unshift, or `StringEditor`'s exclusions;
* "fix" the panel mirror. It is not broken (§1, Problem B).

### `packages/styles` — later, someone else:

Reflect resolved choices into `data-rolled-*` on `sy-bq` (§6b), and decide whether `sy-cd` grows
facet overrides at all (§8).

### `packages/report` — later, someone else:

Add `actions: [{ label: '🎲', title: '随机样式', run: el => el.setAttribute('seed', …) }]` to the
`sy-bq` / `sy-cd` catalogue entries (`组件表.ts:434-455`, `:456-463`) and pass it through
`注册模板插件()` (`plugins.tsx:228-252`, which currently maps only `props: c.属性` at `:242` and
`onPropChange` at `:243-250` — it will need one more line). Then delete the toolbar workaround.

### The contract you must expose so those two can wire in

1. `PluginAction` and the `actions` field, **exported from `./Editor/EditorPlugin`** so
   `import { registerEditorPlugin } from '@woby/wui'` picks them up through the root barrel.
2. `run` receives the selected `HTMLElement` — the element the panel is bound to
   (`propertyTarget`), not the editor root. Document this in the JSDoc; report's workaround
   currently derives the element from the *selection*, which is a different thing.
3. Whether the panel calls `saveDo()` after `run` returns. **Recommendation: yes** — attribute
   edits made through rows are undoable (`PropertyPanel.tsx:310`), and an action that writes an
   attribute should be too, otherwise a reroll is silently unundoable. Note `saveDo` is debounced
   300ms (see the comment at `:301-309`).
4. Whether `onPropChange` fires for action-driven attribute writes. It does **not** — the action
   writes the DOM directly, bypassing `applyCustomElementProperty:647`. State this explicitly;
   a plugin relying on `onPropChange` to re-render will look broken.

---

## 8. Premise corrections (the task brief is wrong on three points)

Verified against source. Carry these forward.

1. **`generateCDStyle` does not return `{ id, css, desc, baseClass }`.** It returns a bare joined
   class string: `return classes.join(' ')` (`styles/src/cd.tsx:137`). Only `bq.tsx:369-374`
   returns the structured object. Any plan that treats the two generators as interchangeable is
   wrong, and option (a) in §6 would require a breaking signature change on `cd.tsx` that it does
   not require on `bq.tsx`.
2. **Per-facet override attributes exist only on `sy-bq`.** `BQ` declares `seed`, `styleId`,
   `cls`, `class`, `color`, `font`, `rotation`, `radius`, `background`, `pattern`, `border`,
   `shadow`, `decoration` (`bq.tsx:377-392`). `CD` declares only `seed`, `styles`, `all`, `cls`,
   `class` (`cd.tsx:156-161`). **Problem B is a `sy-bq`-only symptom today**; `sy-cd` has no
   dropdowns for a reroll to fail to update. Also note `cd.tsx:202-209`: a non-empty `cls`
   bypasses generation entirely.
3. **`cd.tsx`'s `newSeed` is at line 229**, not ~231. (`bq.tsx`'s is at `:431-436`; both set the
   `seed` attribute directly, which is the same mechanism as report's toolbar button.)

---

## 9. Acceptance criteria

1. `EditorPlugin.actions` compiles and is reachable as
   `import type { PluginAction } from '@woby/wui'`. Verify by grepping the built
   `dist/types/**` after a build, not by inspection — `src/index.tsx` does not re-export
   `Editor/index.ts` (§2.7).
2. A test plugin registered with `actions: [{ label: 'X', run: el => el.setAttribute('data-hit','1') }]`
   and no `props` still renders its blind-scrape rows *and* shows the button strip.
3. Clicking that button in the wui demo/editor sets the attribute. This proves the shadow-DOM
   `ref`-based handler works (§2.5); an `onClick={…}` implementation will silently do nothing and
   look identical in code review.
4. A plugin **without** `actions` renders a byte-identical panel to before the change: no empty
   strip, no extra spacing, no extra `<tr>`.
5. Selecting a `wui-button` (a schema-declared plugin) and opening/closing the panel does not add
   or remove any attribute — the regression the `extractionPass` skip at
   `PropertyPanel.tsx:276-279` was written for. Check `outerHTML` before and after.
6. Undo after an action press restores the previous attribute state, if you wired `saveDo()`
   (§7 contract 3).
7. If Option 1 was also implemented: an action prop produces exactly **one** row (not one plus a
   `StringEditor` row), writes **no** attribute on panel open, and does not appear in the
   MutationObserver's `attributeFilter`. Assert the last one by calling
   `customElementWatchSpec` directly in a test.
8. `pnpm run build:only` in `@woby/wui` succeeds — downstream packages consume `dist`, so a
   `src`-only change is invisible to them until this runs.

---

## 10. Risks and open questions

* **`readonly` is not honoured at render time** (`PropertyExtractor.ts:617` is the only check).
  §6's reflected-choices design leans on `readonly` for both non-editability *and* loop
  termination. Decide whether to extend `readonly` to the render path. If you do, it touches the
  editors in `src/PropertyForm/` and is a behaviour change for any existing `readonly` prop —
  scope it as its own commit.
* **`onPropChange` receives the kebab attribute name, not the schema key**
  (`PropertyExtractor.ts:635`, `:647`). Existing downstream handlers may be matching on the wrong
  string already. Out of scope, but do not "fix" it incidentally — report's
  `plugins.tsx:243-250` may depend on current behaviour.
* **Two renderers, one registry.** Anything added to `Editors` appears in both `PropertyForm`
  (`PropertyForm.tsx:140-145`) and `PropertyRows` (`PropertyRows.tsx:38-80`). Only relevant to
  Option 1.
* **Sentinel value stability** (Option 1 only). If the sentinel is not a primitive, the mirror at
  `PropertyPanel.tsx:341-350` will notify on every mutation and the loop-termination argument
  at `:333-336` stops applying. §3 spells this out.
* **The report toolbar button must survive this change.** Deleting it before the panel
  affordance is verified end to end removes the only working reroll in the product.
* **Placement of the strip is unspecified.** Top (above `<PropertyForm>` at `:987`) makes it
  prominent; bottom (beside `<StyleEditor>` at `:998`) matches the existing precedent. This
  document recommends bottom, next to `StyleEditor`, but it is a UI judgement call and the
  acceptance criteria do not pin it.

---

## 11. Could not verify

Stated plainly, so nothing below is taken as established:

1. **Nothing was run.** No build, no test, no browser. Every claim is from reading source. In
   particular acceptance criterion 3 (shadow-DOM click delegation) is inferred from the comment
   at `PropertyPanel.tsx:942-944` and the two existing `ref`-based handlers — it was not
   reproduced.
2. **Whether a wui test suite exists that covers the property panel**, and what shape a new test
   should take, was not investigated. Criterion 7 assumes `customElementWatchSpec` is callable
   from a test; it is exported from `PropertyExtractor.ts:518` but **not** from
   `Editor/index.ts`, so a test outside the folder cannot import it without a change.
3. **The exact visual/CSS conventions for a button strip in the panel** — no design token or
   existing strip component was located. `StyleEditor` (`src/Editor/StyleEditor.tsx`) was
   referenced only via its import at `PropertyPanel.tsx:27` and its call site at `:998`; its
   internals were not read, so it may or may not contain a reusable button style.
4. **`BooleanEditor`'s `renderCondition` body** was not read line-by-line (only its registration
   at `BooleanEditor.tsx:60`); the table in §2.2 states its condition from its name and the
   surrounding pattern.
5. **Whether report's `注册模板插件()` can pass a new field through without other changes** — the
   mapping at `plugins.tsx:228-252` was read, but the catalogue type
   (`组件表.ts:65`, `:69`, `:81`) would need a new optional field and that was not designed here.
6. **Whether `sy-bq`'s runtime Tailwind JIT** (`report/src/templates/即时样式.ts`, referenced in
   the package's own notes) compiles classes fast enough that reflected `data-rolled-*` values
   are accurate at the moment the panel reads them. Not investigated; it is a styles/report
   concern, but it could make §6b's reflected values lag by a frame.
7. **Whether any other consumer of `@woby/wui` already defines a plugin field named `actions`**
   — only `su-yen/packages/report` was checked as a consumer.

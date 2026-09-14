# EditorToolbar API

The **EditorToolbar API** is three registries, not one. Everything `wui-editor`'s own toolbar
does goes through them, so anything wui can do a third party can do — a button in the middle of
a built-in band, a formatting command with no button at all, a keyboard chord, a replacement for
Bold — without editing wui and without a prop being added for it.

| Registry | Module | Answers |
| --- | --- | --- |
| **Commands** | `EditorCommand.ts` | What the editor can **do** |
| **Toolbar** | `EditorToolbarItem.ts` | What it **shows**, and where |
| **Keymap** | `EditorKeymap.ts` | How a command is **reached from the keyboard** |

They are separate because the relationship is not one to one. A command with no button is
reachable by chord alone. One button can drive six commands. Hiding a button must not take the
chord away with it.

> For the narrative version — when to reach for each, and the reasoning behind the split — see
> [Extending the Editor Toolbar](../guides/editor-toolbar.md). This page is the reference.

---

# Import

```tsx
import {
  // 1. commands
  registerEditorCommand,
  unregisterEditorCommand,
  getEditorCommand,
  getEditorCommands,
  runEditorCommand,
  buildCommandContext,
  attachEditorRuntime,
  getEditorRuntime,
  // 2. toolbar items
  TOOLBAR_GROUPS,
  registerToolbarItem,
  unregisterToolbarItem,
  getToolbarItems,
  registerToolbarGroup,
  getToolbarGroups,
  hideToolbarItem,
  showToolbarItem,
  isToolbarItemHidden,
  resolveToolbarItems,
  // 3. keymap
  registerEditorKeys,
  unregisterEditorKeys,
  getEditorKeys,
  getChordFor,
  handleEditorKeyDown,
} from "@woby/wui";

import type {
  EditorCommand, CommandContext, EditorRuntime, RunCommandOptions,
  ToolbarItem, ToolbarGroup, ResolvedToolbarGroup,
  KeyBinding,
} from "@woby/wui";
```

All three registries are **module-global**; the editor is not a singleton. This is safe because
what you register is a *descriptor*, not state — a `render` thunk is invoked once per editor that
paints a toolbar, and which editor a command acts on comes from its argument, never from the
registration. Scope an item to one editor of several with `when()`.

---

# 1. Commands

## Interface: `EditorCommand`

| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| **name** | `string` | Yes | — | Unique id. Namespace third-party commands (`'acme.highlight'`, not `'highlight'`); a collision warns and keeps the first registration, which would be wui's |
| **run** | `(ctx: CommandContext) => void` | Yes | — | Do the thing. Step 3 of five; the other four are handled for you |
| **isActive** | `(ctx) => boolean \| 'mixed'` | No | — | Is the selection already in this state? Drives the pressed look and `aria-pressed`. Return `'mixed'` for a half-bold paragraph rather than lying in either direction. Called on every `selectionchange`, so keep it cheap |
| **isEnabled** | `(ctx) => boolean` | No | always | Can it run right now? Drives the disabled look |
| **history** | `'auto' \| 'manual' \| 'none'` | No | `'auto'` | See below |
| **selection** | `'restore' \| 'none'` | No | `'restore'` | See below |
| **label** | `string` | No | — | English caption and tooltip, for a command wui has never heard of. Goes through `tx()` |
| **labelKey** | `string` | No | — | ...or a wui message id, for a command that is part of wui. Goes through `t()`, and **wins over `label`** when both are set |
| **icon** | `() => JSX.Child` | No | — | The glyph. A thunk, so one registration serves two editors |

### `history`

| Value | Meaning |
| --- | --- |
| `'auto'` | `saveDo()` once, after `run`. One click, one undo step |
| `'manual'` | The command calls `ctx.undoRedo.saveDo()` itself — for a command that makes several separable changes, or decides at runtime whether it changed anything at all |
| `'none'` | No history entry. Undo and Redo are the case: they **are** the history, and recording them would make the stack unusable |

### `selection`

| Value | Meaning |
| --- | --- |
| `'restore'` | Cache the selection before and put it back after, so the caret survives the trip through the toolbar button |
| `'none'` | Do not. For a command that replaces the document wholesale, is async, or moves focus somewhere else on purpose. Restoring a stale offset pair puts the caret in the wrong place, which is worse than not restoring it |

## Interface: `CommandContext`

Built fresh per invocation. **Never cache it.**

| Field | Type | Description |
| --- | --- | --- |
| **editor** | `HTMLElement` | The contenteditable surface, already focused and holding the caret |
| **range** | `Range \| null` | The live range, resolved **through the shadow root**. `null` when the surface genuinely has no selection — a command that needs one must check, because `runEditorCommand` deliberately does not refuse to run in that case |
| **selection** | `Selection \| null` | The selection the range came from, same shadow-root resolution |
| **undoRedo** | `UndoRedoType` | The editor's history. Only needed for `history: 'manual'` |
| **focus** | `FocusManager` | The editor's focus/selection cache. Only needed for `selection: 'none'` |

Every field is non-optional on purpose. When an editor has not published its runtime yet,
`undoRedo` and `focus` are inert stand-ins rather than `undefined`, so a third-party `run` never
has to null-check them — a command that fires a frame too early does nothing instead of throwing.

## Interface: `RunCommandOptions`

| Field | Type | Description |
| --- | --- | --- |
| **selectionCached** | `boolean` | The caller already called `focus.beginCommand()`. A toolbar button has to: mousedown fires *before* the browser moves focus, so a button that caches on click has already lost the selection. `endCommand()` still runs either way, so the pairing stays balanced |

## Interface: `EditorRuntime`

The per-editor services a command needs. These are woby contexts, and therefore not reachable
from `runEditorCommand`'s plain-function call site — a keyboard handler, a host's own button, a
test. `Editor` publishes them on mount, keyed by its own surface element in a `WeakMap` (not a
module variable, because two editors on one page have two of each).

| Field | Type |
| --- | --- |
| **undoRedo** | `UndoRedoType` |
| **focus** | `FocusManager` |

## Functions

| Function | Signature | Description |
| --- | --- | --- |
| **registerEditorCommand** | `(command: EditorCommand) => void` | Register. A duplicate name warns and keeps the first — a module imported twice for its side effects must not take the page down |
| **unregisterEditorCommand** | `(name: string) => void` | Remove the verb. A toolbar item still registered for it is **not** removed with it; it renders disabled |
| **getEditorCommand** | `(name: string) => EditorCommand \| undefined` | Look one up. Reads the registry observable, so it is reactive inside an effect |
| **getEditorCommands** | `() => Observable<EditorCommand[]>` | The whole registry, for a host that wants to list what is available |
| **runEditorCommand** | `(name: string, editor?: HTMLElement, options?: RunCommandOptions) => void` | Run one. Omit `editor` to act on the editor the user is typing in. An unknown name **warns and returns** — it does not throw |
| **buildCommandContext** | `(editor?: HTMLElement) => CommandContext \| null` | The context `runEditorCommand` would build. For a host implementing its own invocation |
| **attachEditorRuntime** | `(editor: HTMLElement, runtime: EditorRuntime) => void` | Called by `Editor` on mount. Hosts do not need this |
| **getEditorRuntime** | `(editor: HTMLElement) => EditorRuntime \| undefined` | The services for one editor, or `undefined` if it has not mounted yet |

## The five steps

`run` is step 3. `runEditorCommand` performs the other four around it, in this order, so you
never write them:

1. `preventDefault()` on **mousedown**, then `focus.beginCommand()` — mousedown, not click,
   because the browser moves focus between the two
2. resolve the range **through the shadow root**
3. `run(ctx)` — the only part a registrant writes
4. `focus.endCommand()`, which puts the caret back
5. `ctx.undoRedo.saveDo()`, so the change is one undo step and not zero or three

`run` throwing is caught: the error is logged, `endCommand()` still runs, and the history step is
skipped. One bad plugin does not strand the caret or the page.

> **`readonly` is the caller's business.** The toolbar is not rendered at all when the editor is
> readonly, so a button cannot fire then — but a chord can, and so can `runEditorCommand`. The
> keymap checks; anything else that can fire while readonly must check too.

---

# 2. Toolbar items

## Interface: `ToolbarItem`

| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| **name** | `string` | Yes | — | Unique. A duplicate warns and keeps the first |
| **group** | `string` | No | `'insert'` | A built-in band or one of your own. A band nobody declared sends the item to the **end of the toolbar**, which is the safe place for something the editor knows nothing about |
| **order** | `number` | No | `0` | Within the band. Ties keep registration order |
| **command** | `string` | One of the two | — | Render wui's standard `CommandButton` for this command |
| **render** | `() => JSX.Child` | One of the two | — | ...or bring your own widget. A **thunk**, invoked once per editor that paints the toolbar |
| **when** | `() => boolean` | No | always | Reactive visibility. Evaluated once per resolve, per editor, and **not at all** for a hidden item |
| **replaces** | `string` | No | — | Take over another item's slot — its band and its order, not where you declared yours |

Exactly one of `command` and `render` is required. Setting both, or neither, warns and skips.

**Prefer `command`.** It is the path that gets i18n, active state, mixed state, disabled state,
`aria-pressed`, focus ordering and the undo step for free. `render` is the escape hatch for
things that are not a single toggle — dropdowns, colour pickers, anything with a panel — and its
author owns all of the above.

## Interface: `ToolbarGroup`

| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| **name** | `string` | Yes | — | Band id, referenced by `ToolbarItem.group` |
| **order** | `number` | Yes | — | Rank among bands |
| **label** | `string` | No | — | For a host rendering its own chrome around the band |
| **divider** | `boolean` | No | `true` | `false` welds this band onto the previous one |
| **cls** | `string` | No | `flex items-center gap-1` | The class on the band's flex container. wui's own bands are not uniform — `history`, `inline` and `list` sit at `gap-0.5` because their buttons are icon-only and read as one control at the wider gap |

## Constant: `TOOLBAR_GROUPS`

```ts
TOOLBAR_GROUPS = { history: 0, structure: 100, inline: 200, color: 300,
                   list: 400, layout: 500, insert: 600 }
```

The gap of 100 is deliberate: `registerToolbarGroup({ name: 'acme', order: 250 })` puts a band of
your own between the inline styles and the colours, and a band past `insert` needs no negotiation
at all.

Within a band, **wui's own items sit at negative `order`** (`-100` and up, in steps of 10). An
item that names a band but no order takes the documented default of `0` and so lands at the
**end** of that band — where an appended item has always gone. Choosing `-85` to sit between two
built-ins is then an opt-in rather than an accident.

## Interface: `ResolvedToolbarGroup`

What `resolveToolbarItems()` returns, in paint order.

| Field | Type |
| --- | --- |
| **group** | `ToolbarGroup` |
| **items** | `ToolbarItem[]` |

## Functions

| Function | Signature | Description |
| --- | --- | --- |
| **registerToolbarItem** | `(item: ToolbarItem) => void` | Register. Duplicates warn and keep the first |
| **unregisterToolbarItem** | `(name: string) => void` | Remove. Unregistering a replacement puts the built-in back |
| **getToolbarItems** | `() => Observable<ToolbarItem[]>` | The raw registry, unresolved |
| **registerToolbarGroup** | `(group: ToolbarGroup) => void` | Declare a band. Unlike items, re-registering a name **replaces** the band — restyling a built-in band is a legitimate thing to want |
| **getToolbarGroups** | `() => ToolbarGroup[]` | Built-in bands plus declared ones, sorted by `order` |
| **hideToolbarItem** | `(name: string) => void` | Stop it painting **without** unregistering it. The command and its chord keep working |
| **showToolbarItem** | `(name: string) => void` | Undo that |
| **isToolbarItemHidden** | `(name: string) => boolean` | Report the state |
| **resolveToolbarItems** | `() => ResolvedToolbarGroup[]` | Apply `replaces`, `hidden` and `when()`, sort, and return what the toolbar should paint. Never calls `render` |

## Remove, hide and replace are three different verbs

Conflating them is the classic mistake, so the API keeps them apart:

```ts
hideToolbarItem('bold')                                               // the button goes...
```

…and the command and `Mod+B` keep working. Reversible.

```ts
registerToolbarItem({ name: 'acme.bold', replaces: 'bold', render: () => <AcmeBold /> })
```

Your widget renders in Bold's band, at Bold's position. The built-in stays registered, so
unregistering your replacement puts it back. Chains resolve to the original slot, and a
replacement that is itself hidden — or whose `when()` is false — does **not** take the built-in
down with it, because that would leave the band with a hole and no way to reason about which verb
suppressed it. Two items replacing each other terminates rather than looping.

```ts
unregisterEditorCommand('bold')                                       // the verb itself is gone
```

Only if you mean it. A button still registered for a removed command renders **disabled** rather
than throwing.

---

## Your widget must wear `TOOLBAR_CONTROL`

The toolbar does **not** size what you render. It is a `flex items-center` band, so a widget that
is taller than the rest pushes nothing around — it just sits on a different baseline, and the
whole row looks crooked. The heights are stated once, in `toolbarControl.ts`:

| Export | Value | Use it on |
| --- | --- | --- |
| **TOOLBAR_CONTROL** | `!h-8 !box-border !py-0 !inline-flex !items-center` | the control itself — a button, a dropdown trigger, a stepper key |
| **TOOLBAR_CONTROL_WRAP** | `!h-8 !box-border !inline-flex !items-center` | the `relative` wrapper a dropdown puts around its trigger and its panel |
| **TOOLBAR_CONTROL_BOX** | `!h-8 !box-border` | a wrapper that already lays its children out correctly |
| **TOOLBAR_CONTROL_HEIGHT** | `32` | when you need the number rather than the class |

```tsx
import { TOOLBAR_CONTROL } from '@woby/wui/Editor/toolbarControl'

registerToolbarItem({
    name: 'acme.stamp',
    group: 'insert',
    render: () => <Button class={TOOLBAR_CONTROL} onClick={…}>Stamp</Button>,
})
```

Every utility is `!`-important on purpose. The string is appended to a class list that already
contains `py-2` or `p-1.5`, and Tailwind emits utilities in its own order rather than the order
they appear in the attribute — a plain `py-0` would silently lose to the `py-2` in `Button`'s
variant table. Only vertical padding is zeroed; horizontal padding, colours, hover states and
rounding are untouched, so widths and the design stay as they were.

A wrapper needs `TOOLBAR_CONTROL_WRAP` rather than the plain box because an `inline-block` that
contains an inline-level child also contains a *line box*, and the line box reserves room for
descenders — worth half a pixel, which is enough to break the row.

---

# 3. Keymap

## Interface: `KeyBinding`

| Field | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| **chord** | `string` | Yes | — | The chord as written, e.g. `'Mod+Shift+Z'`. Kept for diagnostics and unregistering |
| **command** | `string` | Yes | — | The command name. An unknown name is a no-op with a console warning |
| **allowReadonly** | `boolean` | No | `false` | Run even when the surface is not editable |

The `allowReadonly: false` default is the important one: a readonly editor renders no toolbar, so
the keymap would be the *only* way a formatting command could reach it, and "readonly" must not
mean "readonly unless you know the shortcut". Turn it on for commands that do **not** modify the
document — printing, exporting, opening a host's own dialog — which are exactly the things a
reader of a locked document still expects to work.

## Chord grammar

| Token | Means |
| --- | --- |
| `Mod` | The platform's command modifier — **Cmd** on macOS, **Ctrl** everywhere else |
| `Ctrl` | Literally Ctrl, on every platform. Occasionally what you want, usually not |
| `Alt` / `Option` | Alt |
| `Shift` | Shift |
| anything else | The key itself: `B`, `Enter`, `ArrowLeft`, `/` |

Case-insensitive on both sides: `Mod+Shift+Z` matches whether the browser reports `z` or `Z` —
the bug this table replaced was a `switch` on the raw key, where holding shift changed `e.key`
from `'z'` to `'Z'` and `Ctrl+Shift+Z` fell through to plain undo. A chord does **not** match when
a modifier it did not ask for is held. An unknown modifier is rejected outright, with a warning,
rather than binding half a chord.

## Functions

| Function | Signature | Description |
| --- | --- | --- |
| **registerEditorKeys** | `(chord: string \| string[], command: string, options?: { allowReadonly?: boolean }) => void` | Bind one chord or several to one command. A chord already claimed warns and keeps the first binding |
| **unregisterEditorKeys** | `(command: string, chord?: string) => void` | Drop one chord, or — with no `chord` — every chord bound to that command |
| **getEditorKeys** | `() => Observable<KeyBinding[]>` | The whole table, reactive. For a shortcut cheatsheet |
| **getChordFor** | `(command: string) => string \| undefined` | The first chord bound to a command. For your own tooltip |
| **handleEditorKeyDown** | `(e: KeyboardEvent, editor?: HTMLElement \| null) => boolean` | Dispatch. Returns `true` and calls `preventDefault()` when it claimed the keystroke, `false` when it left it alone |

Rebinding is deliberate — unregister, then register:

```ts
unregisterEditorKeys('bold', 'Mod+B')      // one chord
unregisterEditorKeys('bold')               // every chord bound to the command
registerEditorKeys('Mod+B', 'acme.bold')
```

### Choose chords sparingly

A shortcut is a claim on a key the user's browser, screen reader and OS may already want. wui
registers exactly six and no more.

---

# Built-in names

The names a plugin passes to `hideToolbarItem`, `replaces` or `unregisterEditorCommand`.

## Commands

| Name | Chord | Toolbar item |
| --- | --- | --- |
| `bold` | `Mod+B` | `bold` |
| `italic` | `Mod+I` | `italic` |
| `underline` | `Mod+U` | `underline` |
| `strikethrough` | — | via `textFormatOptions` |
| `undo` | `Mod+Z` | `undo` |
| `redo` | `Mod+Shift+Z`, `Mod+Y` | `redo` |
| `list.bullet` | — | `list.bullet` |
| `list.number` | — | `list.number` |
| `list.checkbox` | — | `list.checkbox` |
| `indent.increase` | — | `indent.increase` |
| `indent.decrease` | — | `indent.decrease` |
| `blockquote` | — | `blockquote` |
| `print` | — | `print` |

## Toolbar items, by band

| Band | Items, in paint order |
| --- | --- |
| `history` | `undo`, `redo` |
| `structure` | `textFormat`, `fontFamily`, `fontSize` |
| `inline` | `bold`, `italic`, `underline` |
| `color` | `textColor`, `textBackgroundColor`, `textFormatOptions` |
| `list` | `list.bullet`, `list.number`, `list.checkbox`, `textAlign`, `indent.decrease`, `indent.increase` |
| `layout` | `layout`, `zoom`, `scroller`, `print` |
| `insert` | `insert`, `plugin-groups`, `blockquote`, `info`, `language` |

Only `bold`, `italic` and `underline` are `command:` items today. Everything else is a `render:`
widget, because it opens a panel or carries its own internal state.

---

# Known limits

Three, worth knowing before you build on this.

**`CommandButton` refreshes on `selectionchange` only.** `isActive` and `isEnabled` are evaluated
once at setup and then on every `selectionchange`. That covers every built-in, since all of them
depend on the selection — but a command whose enablement depends on something *else* (a network
flag, a document mode, a licence check) renders stale until the caret moves. Drive such a button
from a `render:` widget with its own reactive binding until this is addressed.

**`undo` and `redo` are `render:` items, not `command:` items.** They predate the command
registry and still render `UndoRedoButton`, whose `disabled` is bound to a reactive thunk. They
work, but they sit outside the standard button path and therefore carry **no `aria-pressed`**.
`replaces: 'undo'` works as normal; `hideToolbarItem('undo')` works as normal.

**The toolbar wraps.** It carries `flex-wrap`, so enough registered items push it onto a second
row and shove the writing surface down the page. Past about 32 items the editor warns on the
console (`EditorToolbarSlot.tsx`). There is no overflow policy yet — budget your buttons.

---

# Things that will bite you

**Selection is shadow-DOM-scoped.** The surface lives inside `wui-editor`'s shadow root.
`window.getSelection()` reports the *host*, not the node inside the shadow tree, so code built on
it silently formats nothing. `ctx.range` and `ctx.selection` are already resolved correctly — use
them. If you must resolve one yourself:

```ts
const root = editorRoot.getRootNode()
const sel = root instanceof ShadowRoot ? root.getSelection() : window.getSelection()
```

`document.execCommand` and `queryCommandState` are shadow-DOM-blind for the same reason and are
not used anywhere in this editor. `StyleEngine`'s `applyStyle` family and `getStyleStateInRange`
are the sanctioned replacements, and are exported.

**Everything the toolbar renders is also a custom element.** Each widget calls
`customElement('wui-…', …)` at module scope, so a registered item that renders one must be
reached by an import or the tag never upgrades. Keep the side-effect-import idiom.

**A panel must dismiss through `useDropdownDismiss`.** `@woby/use`'s `useEventListener` dedupes
globally by `(target, event)`, so a hand-rolled outside-click handler on `window` will simply
never fire if anything else got there first.

**i18n has two channels and they are not interchangeable.** `labelKey` goes through `t()` and is
for wui's own message ids; `label` goes through `tx()`, which is English-as-key with an identity
fallback, and is for your strings. `labelKey` wins when both are set. Do not invent a third
channel.

---

# Usage

## A button that does something

Two registrations — the verb, then the widget that runs it.

```tsx
import { registerEditorCommand, registerToolbarItem, registerEditorKeys } from "@woby/wui";

registerEditorCommand({
  name: "acme.highlight",
  label: "Highlight",
  icon: () => <HighlighterIcon />,
  run: ctx => {
    if (!ctx.range) return;
    ctx.range.surroundContents(document.createElement("mark"));
  },
  isActive: ctx => !!ctx.range?.commonAncestorContainer.parentElement?.closest("mark"),
});

registerToolbarItem({ name: "acme.highlight", group: "color", command: "acme.highlight" });
registerEditorKeys("Mod+Shift+H", "acme.highlight");
```

That is the whole plugin. The button draws itself from the command — icon, tooltip, pressed
state, `aria-pressed`, disabled state, focus handling, one undo step per click — and the chord
runs the identical code path. Import the module for its side effects, once, wherever you set the
editor up.

## A band of your own, between two built-ins

```tsx
registerToolbarGroup({ name: "acme", order: 250, divider: true });
registerToolbarItem({ name: "acme.palette", group: "acme", render: () => <AcmePalette /> });
```

## Slimming the bar down without breaking the shortcuts

```ts
["fontFamily", "fontSize", "scroller", "zoom"].forEach(hideToolbarItem);
// Mod+B, Mod+I, Mod+U, Mod+Z, Mod+Shift+Z and Mod+Y all still work.
```

## Replacing Bold with your own widget

```tsx
registerToolbarItem({ name: "acme.bold", replaces: "bold", render: () => <AcmeBold /> });
// The chord still runs wui's `bold`. To claim it too:
unregisterEditorKeys("bold", "Mod+B");
registerEditorKeys("Mod+B", "acme.bold");
```

## Scoping one registration to one of two editors

```tsx
registerToolbarItem({
  name: "acme.draft-only",
  group: "insert",
  command: "acme.draft",
  when: () => currentDocumentIsDraft(),
});
```

## Running a command yourself

```ts
runEditorCommand("acme.highlight");            // the editor the user is typing in
runEditorCommand("acme.highlight", surfaceEl); // ...or a named one
```

---

# Tests

Unlike most of this directory, the three registries are pinned by **unit tests** rather than SSR
snapshots — they are pure functions over descriptors, and nothing here renders.

| File | Asserts |
| --- | --- |
| `test/Editor/EditorToolbarItem.test.ts` | Ordering, bands, and the interaction of `hidden` × `replaces` × `when()` — each of the three can suppress an item, and the combinations are where a plugin ends up deleting a built-in it only meant to shadow |
| `test/Editor/EditorKeymap.test.ts` | Chord parsing and matching, including shifted-vs-unshifted, `Mod` resolving to exactly one of Ctrl/Cmd, and the readonly refusal |
| `test/Editor/editorRegistries.test.ts` | The thing that only shows up where the three meet: hide, replace and unregister are different verbs, and each leaves the other two alone |

Run them with `pnpm exec vitest run`. The include pattern is `.ts` only — `test/*.test.tsx` files
are demo fixtures, not suites, and are deliberately not collected.

Behaviour that needs a real browser — shadow-DOM selection, the 300 ms history debounce, chord
dispatch through actual key events — is not covered by these and is verified against
`editor-demo.html` instead.

---

# See also

- [Extending the Editor Toolbar](../guides/editor-toolbar.md) — the narrative guide
- [EditorPlugin](./EditorPlugin.md) — registering custom elements that appear in the Insert menu
  and render inline, with typed `props` for the property panel
- [EditorHelp](./EditorHelp.md) — the fourth registry: coachmark steps anchored to these items
- [Editor](./Editor.md) — the component these registries drive
- [I18n](./I18n.md) — `t()` vs `tx()`, and writing a locale pack

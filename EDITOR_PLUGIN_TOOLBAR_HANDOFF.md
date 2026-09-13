# Handoff: make every editor function pluggable — toolbar items, commands, keymap, history

**Audience:** the agent implementing this inside `D:\Developments\tslib\@woby\wui`.
**Status:** design complete, **not implemented**. One unrelated in-flight edit is sitting in
the working tree — see §8 before you touch `EditorPlugin.ts`.
**Verified against the working tree on 2026-09-13**, branch `main`, tip `87d9d9b`.
Every `file:line` below was read, not recalled. Paths are `src/...` unless stated.

---

## 0. The ask, in one paragraph

A third party must be able to contribute **any** editor function without editing wui:
a toolbar button, a dropdown, a formatting command, an insert, a keyboard shortcut,
an undo/redo-aware action. Today wui is a plugin framework for **blocks** only —
`registerEditorPlugin` buys you a row in one insert menu and per-element metadata. The
toolbar itself is a closed, hard-coded JSX tree. This document specifies the three
registries that close the gap, in the order they should be built, and the invariants that
will silently break if they are built in the wrong order.

---

## 1. What is pluggable today — verified

`registerEditorPlugin(plugin)` (`Editor/EditorPlugin.ts:428`) pushes into one module-level
observable `registeredPlugins` (`:416`). Duplicate `name` warns and keeps the first
registration (`:430-433`) — a module imported twice for side effects cannot take the page
down. `unregisterEditorPlugin` (`:442`) removes by name; `getEditorPlugins` (`:451`) hands
out the observable itself.

That single registry is read for **two unrelated purposes**, and this is the most important
structural fact in the file:

| Read path | Keyed by | Feeds |
|---|---|---|
| `pluginsToInsertItems(editorRoot)` `:567` | nothing — all plugins, sorted by `order` | the rows in the one "Insert content" menu |
| `getPluginForElement(el)` `:457` | **`tagName`** | property panel rows, `actions` |
| `resolveResizable` `:481` | `tagName` | the 8 drag handles |
| `resolveAnchor` `:490` | `tagName` | which box the handles wrap |
| `resolvePageBreak` `:494`, `pageBreakTagNames` `:508` | `tagName` | pagination |
| `editableContentTagNames` `:512` | `tagName` | click-splitting inside containers |
| `serializeEditorContent` `:614` / `deserializeEditorContent` `:651` | `tagName` | `toHTML` / `fromHTML` |

**Consequence, and it has already bitten a downstream consumer:** you cannot unregister a
plugin merely to remove it from the insert menu — the element loses its property rows, its
resize handles and its serialization at the same time. Any "hide this from the menu"
feature must be a *presentation* flag, never an unregistration.

wui dogfoods its own registry, which is the precedent to follow: `Editor/WuiPlugins.ts`
registers the `wui-*` components, `Editor/PageBlockPlugins.ts` registers `wui-cover-page`,
`wui-watermark` and `wui-page-break`, `Editor/CounterPlugin.ts` the counter. All three are
side-effect imports. That is the shape the toolbar registry should copy.

---

## 2. What is not pluggable, and why it matters

### 2.1 There is no toolbar slot

`Editor`'s `def()` (`Editor/Editor.tsx:59-68`) is the entire public surface:

```
children, cls, class, enableToolbar, externalPropertyPanel, readonly, height, maxHeight
```

`children` is destructured at `:1247` and reaches **only** `EditorSurface` (passed at
`:1321`, `:1342`, `:1365`) — it is the initial document, not a slot. The toolbar is
`EditorToolbar` (`:1101`), whose `FullToolbar` (`:1149-1220`) is a literal JSX tree of
seven groups separated by a local `Divider` (`:1105`):

| Group | Line | Members |
|---|---|---|
| 1 History | 1151 | `UndoRedoButton mode=undo/redo` |
| 2 Text Structure | 1159 | `TextFormatDropDown`, `FontFamilyDropDown`, `FontSize` |
| 3 Inline Styles | 1168 | `BoldButton`, `ItalicButton`, `UnderlineButton` |
| 4 Colors | 1177 | `TextColorPicker`, `TextBackgroundColorPicker`, `TextFormatOptionsDropDown` |
| 5 Lists & Alignment | 1186 | `List` x3, `TextAlignDropDown`, `Indent` x2 |
| 6 Layout | 1200 | `LayoutSwitch`, `ZoomControl`, `ScrollerToggle`, `PrintButton` |
| 7 Advanced Inserts | 1211 | `InsertDropDown`, `Blockquote`, `InfoButton`, `LanguageSwitch` |

Mounted at `:1335` and `:1358`, gated on `!readonly && enableToolbar`. `enableToolbar` is
all-or-nothing: a host that wants to add one button by turning the toolbar off loses all
~30 built-in controls. That is not an extension point, it is a demolition switch.

### 2.2 There is no command layer — every button hand-rolls the same five-step ritual

`BoldButton.tsx` is the shortest formatting button in the tree and it is still this:

1. `useEditor()` / `useUndoRedo()` / `useFocusManager()`, with a `saveDo` fallback that is a
   silent no-op when the context is missing;
2. a `useEffect` subscribing to `document` `selectionchange` that calls
   `updateStylesState(isActive, editor, 'bold', isMixed)` to keep the pressed state honest;
3. `onMouseDown` -> `preventDefault()` **then** `focusManager.beginCommand()` — the comment
   at the call site (D-09) records why: mousedown fires *before* the browser moves focus
   and clears the selection, click fires after;
4. `onClick` -> `applyBold()` -> `focusManager.endCommand()` -> `saveDo()`;
5. class juggling for `isActive` / `isMixed`, plus `aria-pressed` with a `"mixed"` value.

A third-party author cannot be expected to discover any of that. Steps 3 and 4 in
particular are invisible correctness: get them wrong and the button appears to work while
silently formatting the wrong range, or works but is not undoable. **This is the argument
for a command registry rather than "just let people pass JSX into the toolbar."** If the
only extension point is a JSX slot, every third-party button will be subtly wrong, and the
bug reports will land on wui.

Note step 2's escape hatch: `updateStylesState` is exported from `TextStyleButton` and
`applyBold` from `StyleEngine` (both re-exported in `Editor/index.ts`), so the *primitives*
are already public. What is missing is the wiring, not the verbs.

### 2.3 Undo/redo is a context, not a registry

`Editor/undoredo.tsx` exports `UndoRedoContext` (`:36`), `useUndoRedo` (`:55`), the
`UndoRedo` provider (`:130`) and `UndoRedoType` (`:60`). A third-party command can already
call `saveDo()` *if* it renders inside the provider. It cannot today, because it has
nowhere to render. Once the toolbar registry exists this falls out for free — which is why
history needs no registry of its own, only a default.

### 2.4 Keyboard shortcuts are two hard-coded switches

`handleToolbarKeyDown` (`Editor/Editor.tsx:1108-1145`) matches `ctrl+z` / `ctrl+shift+z` /
`ctrl+y` and `Tab`, with a sibling handler on the surface above it. Both lowercase `e.key`
deliberately — with shift held the key is `'Z'` and the switch used to miss entirely. A
third party has no way to claim a chord.

---

## 3. The design: three registries and one group table

Keep these in **new files**. Do not grow `EditorPlugin.ts` — it is already double-duty (§1),
and the block registry and the toolbar registry have different lifetimes.

```
Editor/EditorCommand.ts     -- what can be done
Editor/EditorToolbarItem.ts -- what is shown, and where
Editor/EditorKeymap.ts      -- what a chord means
```

### 3.1 Command registry — the substrate

```ts
export interface CommandContext {
    editor: HTMLElement          // the contenteditable surface, already focused
    range: Range | null          // the restored range, shadow-DOM-correct
    selection: Selection | null
    undoRedo: UndoRedoType
    focus: FocusManager
}

export interface EditorCommand {
    name: string                              // 'bold', 'fengshui.compass.insert'
    run: (ctx: CommandContext) => void
    isActive?: (ctx: CommandContext) => boolean
    isEnabled?: (ctx: CommandContext) => boolean
    history?: 'auto' | 'manual' | 'none'      // default 'auto' => saveDo() after run
    selection?: 'restore' | 'none'            // default 'restore' => begin/endCommand
    label?: string                            // third-party English, goes through tx()
    labelKey?: string                         // wui message id, goes through t() -- wins
    icon?: () => JSX.Child
}

export const registerEditorCommand: (c: EditorCommand) => void
export const unregisterEditorCommand: (name: string) => void
export const getEditorCommand: (name: string) => EditorCommand | undefined
export const runEditorCommand: (name: string, editor?: HTMLElement) => void
```

`runEditorCommand` is the whole point: it performs the five-step ritual from §2.2 once, in
one place — `beginCommand()`, resolve the range through the shadow root, `run(ctx)`,
`endCommand()`, `saveDo()` unless `history: 'none'`. A command author writes only `run`.

Duplicate `name` must **warn and skip**, same as `registerEditorPlugin:430`. Same reason.

### 3.2 Toolbar registry

```ts
export interface ToolbarItem {
    name: string
    group?: string           // a key from TOOLBAR_GROUPS, or a third-party group id
    order?: number           // within the group; ties keep registration order
    command?: string         // render the standard CommandButton for this command
    render?: () => JSX.Child // ...or bring your own widget (dropdowns, pickers)
    when?: () => boolean     // reactive visibility; absent = always
    replaces?: string        // take over a built-in item's slot (see 3.5)
}

export const registerToolbarItem / unregisterToolbarItem / getToolbarItems
export const hideToolbarItem: (name: string) => void   // presentation, NOT unregistration
```

Exactly one of `command` or `render` is required. `command` is the path that gets i18n,
active state, disabled state, `aria-pressed` and history for free; `render` is the escape
hatch for anything that is not a button, and its author owns all of that.

### 3.3 Keymap registry

```ts
export const registerEditorKeys: (chords: string[], command: string) => void
// 'Mod+B' -- Mod is Ctrl on Windows/Linux, Cmd on macOS
```

Phase 4 replaces the two switches in `Editor.tsx` with a lookup. Until then, register the
built-in chords (`Mod+Z`, `Mod+Shift+Z`, `Mod+Y`) so the table is the single source of
truth and the switches become dead code you can delete in one commit.

### 3.4 Groups are first-class

```ts
export const TOOLBAR_GROUPS = {
    history: 0, structure: 100, inline: 200, color: 300,
    list: 400, layout: 500, insert: 600,
} as const
export const registerToolbarGroup:
    (g: { name: string, order: number, label?: string, divider?: boolean }) => void
```

Third parties get a numeric gap of 100 between built-in groups to slot into, and can declare
their own group past `insert`. Dividers are rendered *between* groups by the renderer, not
authored by hand — today `Divider` (`Editor.tsx:1105`) is placed manually six times, which
is exactly the kind of thing that rots the moment items become dynamic.

### 3.5 Removal and override are three different verbs

Conflating them is the classic mistake:

* `hideToolbarItem('bold')` — the item stays registered (so its command and keymap still
  work) but is not painted. Reversible.
* `replaces: 'bold'` on a new item — the new widget takes the old item's group and order
  slot. The old item is not unregistered.
* `unregisterEditorCommand('bold')` — the verb itself is gone. A button still registered for
  it must then render disabled rather than throw.

---

## 4. Implementation plan

Five phases. **Each ships on its own and leaves the toolbar pixel-identical unless a third
party registers something.** Do not collapse them; phase 3 is the test of phases 1-2, and
you want the API frozen before migrating 30 widgets onto it.

### Phase 0 — resolve the in-flight edit (§8)

Nothing else should be built on top of a half-applied file.

### Phase 1 — toolbar slot + group table

New `Editor/EditorToolbarItem.ts`. In `Editor.tsx`, after Group 7 (`:1211-1219`), render the
registered items grouped and sorted. `FullToolbar` is already consumed as a function child
(`{FullToolbar}` at `:1236`), so a reactive list is safe there — but return the array from a
plain function, **not** from a `useMemo` that returns JSX (known woby gotcha: a
useMemo-returning-JSX used as a child reconstructs its subtree on every read).

Risk: near zero. Exit criterion: with no registrations, a DOM snapshot of the toolbar is
unchanged.

### Phase 2 — command registry + `CommandButton`

New `Editor/EditorCommand.ts` plus a `CommandButton` widget that is the generalisation of
`BoldButton.tsx`: `localized(title, labelKey)` for the tooltip, the `selectionchange` effect
driving `isActive`/`isMixed`, `!bg-slate-200` when active, `aria-pressed` with the `"mixed"`
third state, `onMouseDown` preventDefault + `beginCommand`.

Exit criterion: a command registered from a test file gets a working, undoable,
selection-correct button with zero knowledge of `FocusManager`.

### Phase 3 — migrate the built-ins (the real test)

Order matters, easiest first:

1. `Bold`, `Italic`, `Underline` — pure five-step buttons, the template case.
2. `List` x3, `Indent` x2, `Blockquote` — same shape, different verbs.
3. `UndoRedoButton` — proves `history: 'none'` and a disabled predicate that reads the
   history arrays (`undos.length === 1`, `redos.length === 0`; note the off-by-one — the
   first entry is the empty document and is not undoable).
4. `PrintButton`, `ScrollerToggle`, `InfoButton` — prove non-formatting commands.
5. The dropdowns (`TextFormatDropDown`, `FontFamilyDropDown`, `FontSize`, `TextColorPicker`,
   `TextBackgroundColorPicker`, `TextAlignDropDown`, `TextFormatOptionsDropDown`,
   `LayoutSwitch`, `ZoomControl`, `LanguageSwitch`, `InsertDropDown`) — these are **not**
   buttons. They migrate as `render` items only. Do not model a colour picker as a command;
   model the *result* (`applyTextColor(c)`) as one if you want it keyboard-bound.

**If `BoldButton` cannot be expressed as a registration without losing behaviour, the API is
wrong — stop and fix the API, do not special-case it.**

### Phase 4 — keymap

Replace `handleToolbarKeyDown` (`Editor.tsx:1108`) and its surface sibling with a keymap
lookup. Keep the `Tab` branch as-is at first: it routes list-indent vs block-indent by
walking ancestors, and it is the one handler with real conditional logic.

### Phase 5 — hide / replace / per-instance scoping

Ship `hideToolbarItem`, `replaces`, and the scoping decision from §5.1.

---

## 5. Invariants you must not break

### 5.1 The registries are module-global; the editor is not a singleton

`registeredPlugins` is one module-level observable. Today that is nearly harmless, because
its consumers key on `tagName`. A **toolbar** registry makes it visible: two `<wui-editor>`
elements on one page would each paint the other's buttons. Decide deliberately, and write
the decision into the doc comment:

* **global + `when()`** — simplest, and a host with two editors filters by hand. Recommended
  for phase 1; it is what `registeredPlugins` already does.
* **provider-scoped** — a `ToolbarContext` per editor, registrations addressed to it.
  Correct, more surface, and it breaks the side-effect-import idiom `WuiPlugins.ts` relies on.

Do not leave this implicit. A page with an editor in a dialog *and* one behind it is not
exotic, and the monorepo has already shipped one module-global-vs-two-instances bug
(two `<sy-compass>` elements rendering the same plate).

### 5.2 Selection is shadow-DOM-scoped

The surface lives inside `wui-editor`'s shadow root. Every selection read must go through
the root node, never `window.getSelection()` blindly — the pattern is in
`pluginsToInsertItems` (`EditorPlugin.ts:588-590`):

```ts
const root = editorRoot.getRootNode()
const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
```

`document.execCommand` / `queryCommandState` are shadow-DOM-blind — the codebase has already
removed `queryCommandState` for exactly this reason (comment in `BoldButton.tsx`, D-05).
`StyleEngine`'s `applyStyle` family and `getStyleStateInRange` are the sanctioned
replacements and are already exported from `Editor/index.ts`.

### 5.3 Focus, in this order, or the command formats the wrong range

`onMouseDown` -> `preventDefault()` -> `focus.beginCommand()`; `onClick` -> run ->
`focus.endCommand()`. `FocusManager` (`Editor/FocusManager.ts:21`) exposes `cacheSelection`
`:87`, `restoreSelection` `:112`, `beginCommand` `:132`, `endCommand` `:138`.
`runEditorCommand` owns this sequence so nobody else has to.

### 5.4 i18n has two channels and they are not interchangeable

`t(key)` (`i18n/i18n.ts:347`) for wui's own chrome, keyed (`'editor.bold'`).
`tx(english)` (`:363`) for third-party strings, English-as-key with identity fallback.
`localized(given, key)` (`:406`) keeps a prop overridable *and* translatable, and is what
every built-in button already uses. A third-party `label` goes through `tx`; a `labelKey`
goes through `t` and wins when both are present. Do not invent a third channel.

### 5.5 Everything the toolbar renders is also a custom element

Each widget calls `customElement('wui-bold-button', ...)` at module scope. A registered item
that renders one must be reached by an import or the tag never upgrades. Keep the
side-effect-import idiom (`import './Editor/WuiPlugins'`) and say so in the doc comment.

### 5.6 The toolbar wraps

`BASE_CLASS` (`Editor.tsx:1107`) carries `flex-wrap`. Unbounded third-party items will push
the toolbar onto a second and third row and shove the surface down the page. Phase 1 should
at minimum log the count; a later phase needs an overflow policy (a trailing "more" menu is
the obvious one). Do not ship an API that lets a plugin silently eat a third of the viewport.

### 5.7 `readonly` and `enableToolbar` gate the toolbar, not the commands

At `:1335` / `:1358` the toolbar is not rendered at all when readonly or disabled. Keymap and
`runEditorCommand` must therefore check `useReadonly()` themselves (`undoredo.tsx:29`), or a
host that disabled the toolbar for a reason will find the chords still mutate the document.

---

## 6. Traps found while reading

* **`Editor.tsx:1442-1686` is a commented-out duplicate of the whole toolbar**, complete with
  its own `Group 1: History` markers. Search-and-edit by comment text will hit the wrong one.
  The live tree is `1149-1240`.
* **`DebugToolbar` (`:1222`) is live code**, currently not rendered (`:1237` is commented
  out). Leave it; it is a bisection aid.
* **`InsertDropDown` swaps its list for `TableGridPicker` in place** (`:345`) inside a
  `max-h-80 overflow-y-auto` box. A fly-out submenu will clip. If a group dropdown needs
  nesting, it needs a different container, not a nested menu.
* **Dropdown dismissal is centralised** in `Editor/useDropdownDismiss.ts`. A third-party
  `render` item that opens a panel must use it or it will not close on outside click — this
  has already been reported once downstream as "dropdown not dismissing".
* **`UndoRedoButton`'s undo predicate is `undos.length === 1`, not `0`.** Copy it, do not
  re-derive it.
* **`registerEditorPlugin` warns and skips, it does not throw.** Any new registry must match,
  or a double side-effect import becomes a hard failure in production only.

---

## 7. Why not the two cheaper alternatives

* **A `toolbar` JSX slot on `<Editor>`.** Gives a host arbitrary markup and nothing else: no
  `FocusManager`, no `saveDo`, no active state, no i18n, no ordering against built-ins. Every
  consumer reimplements §2.2 and gets it wrong. It also cannot express *removal* or
  *reordering* of built-ins, which is half of what integrators actually ask for.
* **DOM injection into the rendered toolbar from outside.** No wui change at all, but it is
  surgery on a tree wui owns and re-renders. It breaks on any layout change and cannot
  participate in reactivity. Reject it if it is proposed.

---

## 8. Current working-tree state — read before editing `EditorPlugin.ts`

`git status` on `@woby/wui` shows exactly one modified file:

```
 M src/Editor/EditorPlugin.ts      (+47 lines, no deletions)
```

That is a **half-applied, unrelated feature**: an attempt to let a *family* of block plugins
leave the single insert menu for a dropdown of their own (the motivating case is eight
luopan plates in a downstream app). What landed:

* `group?: string` (`:365`), `groupLabel?: string` (`:368`), `groupIcon?: () => JSX.Child`
  (`:377`) on `EditorPlugin`, with doc comments;
* `export interface PluginGroup` (`:383`).

What did **not** land:

* there is no `pluginGroups()` function — so the `{@link pluginGroups}` in `PluginGroup`'s
  doc comment (`:381`) dangles;
* `pluginsToInsertItems` (`:567`) still ignores `group` entirely, so a plugin that sets it
  today still appears in the built-in menu;
* `InsertDropDown` has no `group` prop and `Editor.tsx` renders no extra dropdowns;
* nothing new is exported from `Editor/index.ts`.

**Two ways forward, both acceptable; "leave it" is not one of them:**

1. **Finish it** as originally scoped — `pluginGroups()` returning distinct groups in
   first-registration order; a `group` filter on `pluginsToInsertItems(root, group?)`; a
   `group` prop on `InsertDropDown` that suppresses the four built-ins and captions itself
   from `pluginGroups()`; one line in Group 7 mapping groups to dropdowns. Roughly 40 lines.
   Then export the new symbols and `PluginGroup` from `Editor/index.ts`.
2. **Revert it** (`git checkout -- src/Editor/EditorPlugin.ts`) and re-derive grouping from
   the toolbar registry in Phase 1, where a plugin family's dropdown is just a registered
   `render` item. Cleaner end state; makes `group` redundant.

Recommendation: **finish it as Phase 0.** It is already 80% written, it unblocks the
downstream consumer immediately, and `group` stays meaningful afterwards as "which menu does
this block live in", which the toolbar registry does not answer.

The doc comment already promises the right non-behaviour and it must stay true: grouping is
presentation only — `props`, `resizable`, `anchor`, `pageBreak` and the property panel all
resolve by `tagName` and must never consult `group` (§1).

---

## 9. The downstream consumer, and what it needs day one

`su-yen/packages/风水` (`src/罗盘组件.tsx`) registers **eight** plugins that all share
`tagName: 'sy-compass'` — the `name` is the plate key precisely because
`registerEditorPlugin` dedupes on `name` and all eight would otherwise collapse into one.
They carry `props`, `resizable`, `anchor` and `onPropChange`, so §1 applies in full: they
cannot be unregistered to tidy the menu.

What that app wants, in priority order:

1. the eight rows out of the built-in insert menu and into one "罗盘" dropdown — **Phase 0**;
2. its own toolbar button for report-level actions — **Phases 1-2**;
3. captions translated through `tx()` — already works: the app bridges wui's i18n via
   `连接wui({ locale, setLocale, onLocaleChange, registerLocale })` and its plate names are
   already in the `tx` catalogue, so changing a plugin `label` needs no locale edit.

Use it as the acceptance harness. It exercises grouping, a shared `tagName`, custom elements
inside the editable surface, resize, and the property panel simultaneously.

---

## 10. Acceptance criteria

* With no third-party registrations, the toolbar's DOM is unchanged from `87d9d9b`.
* `BoldButton` re-expressed as `registerEditorCommand` + `ToolbarItem` is behaviourally
  identical: active state, mixed state, `aria-pressed="mixed"`, shadow-DOM selection, one
  undo step per click.
* A third party adds a working button in under 20 lines, importing nothing from
  `FocusManager`, `undoredo` or `StyleEngine`.
* `hideToolbarItem('bold')` hides the button and leaves `Mod+B` working.
* Two `<wui-editor>` elements on one page behave per the §5.1 decision, with a test asserting
  it.
* `pnpm build` clean; no new export breaks `Editor/index.ts` consumers.

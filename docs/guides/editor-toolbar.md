# Extending the Editor Toolbar

`wui-editor` is built on three registries, and everything its own toolbar does goes through
them. Anything wui can do, a third party can do — a button in the middle of a built-in band,
a formatting command with no button at all, a keyboard chord, a replacement for Bold — without
editing wui and without a prop being added for it.

| Registry | File | Answers |
| --- | --- | --- |
| **Commands** | `EditorCommand.ts` | What the editor can **do** |
| **Toolbar** | `EditorToolbarItem.ts` | What it **shows**, and where |
| **Keymap** | `EditorKeymap.ts` | How a command is **reached from the keyboard** |

They are separate because the relationship is not one to one. A command with no button is
reachable by chord alone. One button can drive six commands. Hiding a button must not take
the chord away with it. Keep them separate in your own plugin for the same reason.

Everything below is exported from the package root:

```ts
import { registerEditorCommand, registerToolbarItem, registerEditorKeys } from '@woby/wui'
```

---

## Quick start: a button that does something

Two registrations — the verb, then the widget that runs it.

```ts
import { registerEditorCommand, registerToolbarItem, registerEditorKeys } from '@woby/wui'

registerEditorCommand({
    name: 'acme.highlight',
    label: 'Highlight',                       // English; see i18n below
    icon: () => <HighlighterIcon />,
    run: ctx => {
        if (!ctx.range) return
        const mark = document.createElement('mark')
        ctx.range.surroundContents(mark)
    },
    isActive: ctx => !!ctx.range?.commonAncestorContainer.parentElement?.closest('mark'),
})

registerToolbarItem({ name: 'acme.highlight', group: 'color', command: 'acme.highlight' })
registerEditorKeys('Mod+Shift+H', 'acme.highlight')
```

That is the whole plugin. The button draws itself from the command — icon, tooltip, pressed
state, `aria-pressed`, disabled state, focus handling, one undo step per click — and the chord
runs the identical code path.

Import the module for its side effects, once, wherever you set the editor up:

```ts
import './AcmeHighlight'
```

---

## 1. Commands — the verb

```ts
registerEditorCommand({
    name: string,                                    // namespace it: 'acme.foo', not 'foo'
    run: (ctx: CommandContext) => void,              // the only required behaviour
    isActive?: ctx => boolean | 'mixed',             // pressed look + aria-pressed
    isEnabled?: ctx => boolean,                      // disabled look
    history?: 'auto' | 'manual' | 'none',            // default 'auto'
    selection?: 'restore' | 'none',                  // default 'restore'
    label?: string,                                  // English caption
    labelKey?: string,                               // ...or a wui message id
    icon?: () => JSX.Child,
})
```

`run` is step 3 of five. `runEditorCommand` performs the other four around it, in this order,
so you never write them:

1. cache the selection and suppress the blur the button's own focus would cause
2. resolve the range **through the shadow root**
3. `run(ctx)`
4. put the caret back
5. `saveDo()` — one invocation, one undo step

### The context

```ts
interface CommandContext {
    editor: HTMLElement        // the contenteditable surface
    range: Range | null        // resolved through the shadow root; null means no selection
    selection: Selection | null
    undoRedo: UndoRedoType     // only for history: 'manual'
    focus: FocusManager        // only for selection: 'none'
}
```

`range` is null when there genuinely is no selection. `runEditorCommand` does not refuse to
run in that case — "insert at the end" is a legitimate thing for a command to mean — so a
command that needs a range must check.

### `history` and `selection`

Leave both alone unless you are sure. The defaults are what a formatting command wants.

- `history: 'manual'` — you call `ctx.undoRedo.saveDo()` yourself, for a command that makes
  several separable changes or decides at runtime whether it changed anything at all.
- `history: 'none'` — no undo entry. Undo and Redo are the case: they *are* the history.
- `selection: 'none'` — do not restore the caret. For a command that replaces the document
  wholesale, is async, or moves focus somewhere else on purpose. Restoring a stale offset
  pair puts the caret in the wrong place, which is worse than not restoring it.

### Running one yourself

```ts
import { runEditorCommand } from '@woby/wui'
runEditorCommand('acme.highlight')            // acts on the editor the user is typing in
runEditorCommand('acme.highlight', surfaceEl) // ...or on a named one
```

An unknown name warns and returns. It does not throw: a page that stops rendering is a worse
outcome than a click that does nothing.

> **`readonly` is the caller's business.** The toolbar is not rendered at all when the editor
> is readonly, so a button cannot fire then — but a chord can, and so can this call. The
> keymap checks; anything else that can fire while readonly must check too.

---

## 2. Toolbar items — the widget

```ts
registerToolbarItem({
    name: string,              // unique; duplicates warn and keep the first
    group?: string,            // a built-in band or your own; absent means 'insert'
    order?: number,            // within the band; ties keep registration order
    command?: string,          // render wui's standard button for this command
    render?: () => JSX.Child,  // ...or bring your own widget
    when?: () => boolean,      // reactive visibility
    replaces?: string,         // take over another item's slot
})
```

Exactly one of `command` and `render` is required; setting both, or neither, warns and skips.

**Prefer `command`.** It is the path that gets i18n, active state, mixed state, disabled
state, `aria-pressed`, focus ordering and the undo step for free. `render` is the escape hatch
for things that are not a single toggle — dropdowns, colour pickers, anything with a panel —
and its author owns all of the above.

### Bands and ordering

```ts
TOOLBAR_GROUPS = { history: 0, structure: 100, inline: 200, color: 300,
                   list: 400, layout: 500, insert: 600 }
```

The gap of 100 is deliberate: `registerToolbarGroup({ name: 'acme', order: 250 })` puts a band
of your own between the inline styles and the colours, and a band past `insert` needs no
negotiation at all.

Within a band, **wui's own items sit at negative `order`** (`-100` and up in steps of 10). An
item that names a band but no order gets the documented default of `0`, and so lands at the
**end** of that band — which is where an appended item has always gone. Choosing `-85` to sit
between two built-ins is then an opt-in rather than an accident.

An item naming a band nobody declared goes to the end of the toolbar, which is the safe place
for something the editor knows nothing about.

```ts
registerToolbarGroup({
    name: 'acme',
    order: 250,
    divider: true,               // default; false welds this band onto the previous one
    cls: 'flex items-center gap-1',
})
```

### Your own widget

```ts
registerToolbarItem({
    name: 'acme.palette',
    group: 'color',
    render: () => <AcmePalette />,
})
```

`render` is a **thunk**, invoked once per editor that paints the toolbar — so one registration
serves two editors on a page without them sharing a node.

A widget that opens a panel must dismiss through `useDropdownDismiss`. `@woby/use`'s
`useEventListener` dedupes globally by `(target, event)`, so a hand-rolled outside-click
handler on `window` will simply never fire if anything else got there first.

---

## 3. Remove, hide and replace are three different verbs

Conflating them is the classic mistake, so the API keeps them apart:

```ts
hideToolbarItem('bold')                               // the button goes...
```

…and the command and `Mod+B` keep working. Reversible with `showToolbarItem('bold')`, and
`isToolbarItemHidden('bold')` reports the state. Use this to slim the bar down.

```ts
registerToolbarItem({ name: 'acme.bold', replaces: 'bold', render: () => <AcmeBold /> })
```

Your widget renders in Bold's band, at Bold's position — not at the end, and not where you
declared it. The built-in stays registered, so unregistering your replacement puts it back.
Chains resolve to the original slot, and a replacement whose `when()` is false (or that is
itself hidden) does **not** take the built-in down with it.

```ts
unregisterEditorCommand('bold')                       // the verb itself is gone
```

Only if you mean it. A button still registered for a removed command renders disabled rather
than throwing.

---

## 4. Keyboard chords

```ts
registerEditorKeys('Mod+Shift+H', 'acme.highlight')
registerEditorKeys(['Mod+Shift+Z', 'Mod+Y'], 'redo')     // several chords, one command
```

Write **`Mod`** and mean "the platform's command modifier" — Cmd on macOS, Ctrl everywhere
else. `Ctrl` written literally means Ctrl on every platform, which is occasionally what you
want and usually not. `Alt`/`Option` and `Shift` are also understood, and everything is
case-insensitive on both sides: `Mod+Shift+Z` matches whether the browser reports `z` or `Z`.

A chord already bound warns and keeps the first binding. Rebinding is deliberate:

```ts
unregisterEditorKeys('bold', 'Mod+B')      // one chord
unregisterEditorKeys('bold')               // every chord bound to the command
registerEditorKeys('Mod+B', 'acme.bold')
```

Two more:

- `getChordFor('bold')` — for your own tooltip.
- `getEditorKeys()` — the whole table, reactive, for a shortcut cheatsheet.

### Readonly

A binding does **not** fire on a surface that is not editable. That default is the important
one: a readonly editor renders no toolbar, so the keymap would be the only way a formatting
command could reach it, and "readonly" must not mean "readonly unless you know the shortcut".

Opt out for commands that do not modify the document — print, export, opening a dialog of your
own — which are exactly the things a reader of a locked document still expects to work:

```ts
registerEditorKeys('Mod+P', 'print', { allowReadonly: true })
```

### Choose chords sparingly

A shortcut is a claim on a key the user's browser, screen reader and OS may already want.
wui registers exactly six (`Mod+B/I/U/Z/Y` and `Mod+Shift+Z`) and no more.

---

## 5. Things that will bite you

**Selection is shadow-DOM-scoped.** The surface lives inside `wui-editor`'s shadow root.
`window.getSelection()` reports the *host*, not the node inside the shadow tree, so code built
on it silently formats nothing. `ctx.range` and `ctx.selection` are already resolved correctly
— use them. If you must resolve one yourself:

```ts
const root = editorRoot.getRootNode()
const sel = root instanceof ShadowRoot ? root.getSelection() : window.getSelection()
```

`document.execCommand` and `queryCommandState` are shadow-DOM-blind for the same reason and
are not used anywhere in this editor. `StyleEngine`'s `applyStyle` family and
`getStyleStateInRange` are the sanctioned replacements, and are exported.

**Everything the toolbar renders is also a custom element.** Each widget calls
`customElement('wui-…', …)` at module scope, so a registered item that renders one must be
reached by an import or the tag never upgrades. Keep the side-effect-import idiom.

**i18n has two channels and they are not interchangeable.** `labelKey` goes through `t()` and
is for wui's own message ids; `label` goes through `tx()`, which is English-as-key with an
identity fallback, and is for your strings. `labelKey` wins when both are set. Do not invent a
third channel.

**The toolbar wraps.** It carries `flex-wrap`, so enough registered items will push it onto a
second row and shove the writing surface down the page. Past about 32 items the editor warns
on the console. There is no overflow policy yet — budget your buttons.

**The registries are module-global; the editor is not a singleton.** Two `<wui-editor>`
elements on one page share one registry. This is safe because a `ToolbarItem` is a
*descriptor*, not state: `render` is a thunk invoked once per editor, so two editors get two
independent widgets from one registration. An item that genuinely belongs to one editor and
not the other uses `when()`, which is evaluated per editor:

```ts
registerToolbarItem({
    name: 'acme.draft-only',
    group: 'insert',
    command: 'acme.draft',
    when: () => currentDocumentIsDraft(),
})
```

---

## See also

- [Editor Plugin System](./editor-plugins.md) — registering custom elements that appear in
  the Insert menu and render inline, with typed `props` for the property panel.
- [Styling Components](./styling.md) — `cls` (replace) vs `class` (extend).

import { registerToolbarGroup, registerToolbarItem, TOOLBAR_GROUPS } from './EditorToolbarItem'
import { CommandButton } from './CommandButton'
import { UndoRedoButton } from './UndoRedoButton'
import { TextFormatDropDown } from './TextFormatDropDown'
import { FontFamilyDropDown } from './FontFamilyDropDown'
import { FontSize } from './FontSize'
import { TextColorPicker } from './TextColorPicker'
import { TextBackgroundColorPicker } from './TextBackgroundColorPicker'
import { TextFormatOptionsDropDown } from './TextFormatOptionsDropDown'
import { List } from './List'
import { TextAlignDropDown } from './TextAlignDropDown'
import { Indent } from './Indent'
import { LayoutSwitch } from './LayoutSwitch'
import { ZoomControl } from './ZoomControl'
import { ScrollerToggle } from './DocScroller'
import { PrintButton } from './PrintButton'
import { InsertDropDown } from './InsertDropDown'
import { Blockquote } from './Blockquote'
import { InfoButton } from './InfoButton'
import { LanguageSwitch } from './LanguageSwitch'
import { pluginGroups } from './EditorPlugin'
import './builtinCommands'

/**
 * # wui's own toolbar, as registrations
 *
 * The seven bands the editor has always had, moved out of `FullToolbar`'s JSX and into the
 * same registry a plugin writes to. `FullToolbar` is now one `<ToolbarSlot />`.
 *
 * This is what "plugin ready" actually has to mean. A slot appended after a hardcoded
 * toolbar only lets a third party add to the *end*; once the built-ins are registrations
 * like any other, a plugin can put its button between the colour pickers and the lists,
 * hide the one it is replacing, or take over its slot -- without wui shipping a prop for it.
 *
 * ## Why most of these are `render` and not `command`
 *
 * Bold, Italic and Underline are `command` items: they are single toggles with a pressed
 * state, which is exactly what `CommandButton` draws, and routing them through it is what
 * proves the command API carries real weight rather than being third-party scaffolding.
 *
 * The rest keep their own widgets, for two different reasons. The dropdowns are not toggles
 * at all -- a colour picker has a panel, a grid and its own dismissal, and squeezing it
 * through a button interface would only produce a worse picker. And the remaining buttons
 * (undo, the lists, indent, print) carry behaviour a generic button has no business knowing:
 * the list buttons own the `MutationObserver` that injects a checkbox when Enter opens a new
 * item, and undo's disabled look is driven by history arrays rather than by the selection.
 *
 * Every one of them still has a registered *command* behind it -- see `builtinCommands.tsx` --
 * so a keyboard chord, a host's `runEditorCommand` call and a click all run the same verb.
 * The split is between the widget and the verb, which is the whole reason there are two
 * registries.
 *
 * ## Ordering
 *
 * Built-in items sit at negative `order`. A third-party item that names a group but no order
 * gets the documented default of `0`, and so lands at the end of that band -- the same place
 * the old appended `<ToolbarSlot />` put it. Deliberately picking `-85` to sit between two
 * built-ins is then an opt-in, not an accident.
 *
 * Imported for its side effects, once, by `Editor.tsx`.
 */

/** Built-in bands start here and step by 10, leaving room to insert between any two. */
const BUILT_IN_ORDER_BASE = -100
const step = (n: number) => BUILT_IN_ORDER_BASE + n * 10

// #region Groups
/**
 * The seven bands, with the classes they have always carried.
 *
 * The gaps are not arbitrary and not uniform: icon-only bands sit at `gap-0.5` so three
 * glyphs read as one segmented control, while bands holding dropdowns need `gap-1` or the
 * captions collide. Registering them here is what lets a fully registry-driven toolbar
 * reproduce the hand-written one exactly.
 */
const GROUP_CLASS = {
    history: 'flex items-center gap-0.5',
    structure: 'flex items-center gap-1',
    inline: 'flex items-center gap-0.5',
    color: 'flex items-center gap-1',
    list: 'flex items-center gap-0.5',
    layout: 'flex items-center gap-1',
    insert: 'flex items-center gap-1',
} as const

for (const [name, order] of Object.entries(TOOLBAR_GROUPS))
    registerToolbarGroup({ name, order, cls: GROUP_CLASS[name as keyof typeof GROUP_CLASS] })
// #endregion

// #region Group 1 -- History
registerToolbarItem({ name: 'undo', group: 'history', order: step(0), render: () => <UndoRedoButton mode="undo" /> })
registerToolbarItem({ name: 'redo', group: 'history', order: step(1), render: () => <UndoRedoButton mode="redo" /> })
// #endregion

// #region Group 2 -- Text structure
registerToolbarItem({ name: 'textFormat', group: 'structure', order: step(0), render: () => <TextFormatDropDown /> })
registerToolbarItem({ name: 'fontFamily', group: 'structure', order: step(1), render: () => <FontFamilyDropDown /> })
registerToolbarItem({ name: 'fontSize', group: 'structure', order: step(2), render: () => <FontSize /> })
// #endregion

// #region Group 3 -- Inline styles
// The three that go through the command registry end to end. `CommandButton` reads the
// icon, the tooltip key, the pressed state and the mixed state off the registration, so
// there is nothing left here to say but the name.
registerToolbarItem({ name: 'bold', group: 'inline', order: step(0), command: 'bold' })
registerToolbarItem({ name: 'italic', group: 'inline', order: step(1), command: 'italic' })
registerToolbarItem({ name: 'underline', group: 'inline', order: step(2), command: 'underline' })
// #endregion

// #region Group 4 -- Colours
registerToolbarItem({ name: 'textColor', group: 'color', order: step(0), render: () => <TextColorPicker /> })
registerToolbarItem({ name: 'textBackgroundColor', group: 'color', order: step(1), render: () => <TextBackgroundColorPicker /> })
registerToolbarItem({ name: 'textFormatOptions', group: 'color', order: step(2), render: () => <TextFormatOptionsDropDown /> })
// #endregion

// #region Group 5 -- Lists and alignment
registerToolbarItem({ name: 'list.bullet', group: 'list', order: step(0), render: () => <List mode="bullet" /> })
registerToolbarItem({ name: 'list.number', group: 'list', order: step(1), render: () => <List mode="number" /> })
registerToolbarItem({ name: 'list.checkbox', group: 'list', order: step(2), render: () => <List mode="checkbox" /> })
registerToolbarItem({ name: 'textAlign', group: 'list', order: step(3), render: () => <TextAlignDropDown /> })
registerToolbarItem({ name: 'indent.decrease', group: 'list', order: step(4), render: () => <Indent mode="decrease" /> })
registerToolbarItem({ name: 'indent.increase', group: 'list', order: step(5), render: () => <Indent mode="increase" /> })
// #endregion

// #region Group 6 -- Layout
// Authoring / proofing / reading, and the paper it ends on. Print sits with the layout
// switch and not with the inserts because it is the same subject: it puts the editor into
// `page` and prints exactly what that mode shows.
registerToolbarItem({ name: 'layout', group: 'layout', order: step(0), render: () => <LayoutSwitch /> })
registerToolbarItem({ name: 'zoom', group: 'layout', order: step(1), render: () => <ZoomControl /> })
registerToolbarItem({ name: 'scroller', group: 'layout', order: step(2), render: () => <ScrollerToggle /> })
registerToolbarItem({ name: 'print', group: 'layout', order: step(3), render: () => <PrintButton /> })
// #endregion

// #region Group 7 -- Inserts
registerToolbarItem({ name: 'insert', group: 'insert', order: step(0), render: () => <InsertDropDown /> })

/**
 * One button per plugin family that asked for a menu of its own.
 *
 * The thunk returns a *function*, not an array: woby re-reads a function child when the
 * registry changes, whereas an array is captured once. It must not become a `useMemo`
 * returning JSX either -- a memo read as a child rebuilds its whole subtree, which would
 * close an open dropdown the moment anything else on the toolbar changed.
 *
 * Empty until some plugin sets `group`, so a page with no such plugin has the toolbar it
 * always had.
 */
registerToolbarItem({
    name: 'plugin-groups',
    group: 'insert',
    order: step(1),
    render: () => () => pluginGroups().map(g => <InsertDropDown group={g.name} />),
})

registerToolbarItem({ name: 'blockquote', group: 'insert', order: step(2), render: () => <Blockquote /> })
registerToolbarItem({ name: 'info', group: 'insert', order: step(3), render: () => <InfoButton /> })
// Last in the row: it relabels the whole toolbar, so it reads as a property of the editor
// rather than of any one group above it.
registerToolbarItem({ name: 'language', group: 'insert', order: step(4), render: () => <LanguageSwitch /> })
// #endregion

/** Re-exported so `Editor.tsx` has something to import besides a bare side effect. */
export const BUILT_IN_TOOLBAR_REGISTERED = true

// Referenced so a bundler's tree-shaker cannot decide this module is inert. `CommandButton`
// is reached only through a string command name, which static analysis cannot see.
void CommandButton

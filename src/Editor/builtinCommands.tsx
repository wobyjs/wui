import { $$ } from 'woby'
import { registerEditorCommand, type CommandContext } from './EditorCommand'
import { registerEditorKeys } from './EditorKeymap'
import { applyBold, applyItalic, applyStrikethrough, applyUnderline, getStyleStateInRange } from './StyleEngine'
import { applyIndentMode } from './Indent'
import { applyListMode, isListModeActive } from './List'
import { toggleBlockquoteIn } from './Blockquote'
import { printEditor } from './Print'
import { QUOTE_TAG } from './Blockquote'
import { isSelectionInside } from './utils'
import BoldIcon from '../icons/bold'
import ItalicIcon from '../icons/italic'
import UnderlineIcon from '../icons/underline'
import IndentIcon from '../icons/indent'
import OutdentIcon from '../icons/outdent'

/**
 * # wui's own commands
 *
 * Every verb the built-in toolbar performs, registered through the same public API a third
 * party would use. That is the point of the file, and it is worth being blunt about why:
 *
 * A registry whose only clients are third parties rots. The built-ins are what keep it
 * honest -- if `bold` cannot be expressed as `{ name, run, isActive }` without losing the
 * mixed state or the caret, then the API is wrong and the fix belongs here, not in a special
 * case. (`Bold`, `Italic` and `Underline` are now drawn *entirely* by `CommandButton` from
 * these registrations; the rest keep their bespoke widgets and use these as the verb behind
 * the button, so a keyboard chord and a click run the same code.)
 *
 * ## What is deliberately absent
 *
 * No command for the dropdowns. A colour picker is not a verb -- the *result* is:
 * `applyTextColor('#c00')` is a thing you can bind to a key, "open the colour picker" is
 * not. Anything a host wants keyboard-bound should be registered as the result, with the
 * argument baked in, which a host can do for itself in three lines.
 *
 * Imported for its side effects. `Editor.tsx` imports it once; the registries warn and skip
 * on duplicate names, so importing it twice is harmless.
 */

/**
 * The CSS pair behind each inline style, as `StyleEngine` stores it.
 *
 * `document.queryCommandState` would answer this in one call and is not used anywhere in
 * this editor, because it is blind to shadow DOM -- it reports on the document's selection,
 * which for a surface inside a shadow root is not the user's selection at all.
 */
const INLINE_STYLE = {
    bold: { prop: 'fontWeight', value: 'bold' },
    italic: { prop: 'fontStyle', value: 'italic' },
    underline: { prop: 'textDecorationLine', value: 'underline' },
    strikethrough: { prop: 'textDecorationLine', value: 'line-through' },
} as const

/** Pressed / half-pressed / not, from the range the context already resolved. */
const inlineState = (ctx: CommandContext, kind: keyof typeof INLINE_STYLE): boolean | 'mixed' => {
    if (!ctx.range) return false
    const { prop, value } = INLINE_STYLE[kind]
    const state = getStyleStateInRange(ctx.range, prop, value)
    return state === 'mixed' ? 'mixed' : state === 'all'
}

// #region Inline styles
registerEditorCommand({
    name: 'bold',
    labelKey: 'editor.bold',
    icon: () => <BoldIcon />,
    run: () => applyBold(),
    isActive: ctx => inlineState(ctx, 'bold'),
})

registerEditorCommand({
    name: 'italic',
    labelKey: 'editor.italic',
    icon: () => <ItalicIcon />,
    run: () => applyItalic(),
    isActive: ctx => inlineState(ctx, 'italic'),
})

registerEditorCommand({
    name: 'underline',
    labelKey: 'editor.underline',
    icon: () => <UnderlineIcon />,
    run: () => applyUnderline(),
    isActive: ctx => inlineState(ctx, 'underline'),
})

// No button of its own -- it lives inside the "more formats" dropdown. Registered anyway,
// because a command with no button is exactly the case the two registries were split for:
// it is reachable by chord and by `runEditorCommand` without occupying toolbar width.
registerEditorCommand({
    name: 'strikethrough',
    labelKey: 'editor.strikethrough',
    run: () => applyStrikethrough(),
    isActive: ctx => inlineState(ctx, 'strikethrough'),
})
// #endregion

// #region History
/**
 * Undo and redo are the two commands that must opt out of both defaults.
 *
 * `history: 'none'` because they *are* the history: a `saveDo()` after an undo would push
 * the state you just left back onto the stack, and the second press would undo the undo.
 *
 * `selection: 'none'` because restoring the cached caret would be restoring it into a
 * document that no longer has those offsets -- undo replaces the content wholesale, and the
 * history entry carries its own caret position.
 */
registerEditorCommand({
    name: 'undo',
    labelKey: 'editor.undo',
    history: 'none',
    selection: 'none',
    run: ctx => ctx.undoRedo.undo(),
    // The first entry is the document as it was found, which there is nothing before; so the
    // floor is one, not zero. Off by one here means a first press that silently blanks the page.
    isEnabled: ctx => $$(ctx.undoRedo.undos).length > 1,
})

registerEditorCommand({
    name: 'redo',
    labelKey: 'editor.redo',
    history: 'none',
    selection: 'none',
    run: ctx => ctx.undoRedo.redo(),
    isEnabled: ctx => $$(ctx.undoRedo.redos).length > 0,
})
// #endregion

// #region Blocks
const LIST_MODES = [
    { name: 'list.bullet', mode: 'bullet', labelKey: 'editor.bulletedList' },
    { name: 'list.number', mode: 'number', labelKey: 'editor.numberedList' },
    { name: 'list.checkbox', mode: 'checkbox', labelKey: 'editor.checkboxList' },
] as const

for (const { name, mode, labelKey } of LIST_MODES)
    registerEditorCommand({
        name,
        labelKey,
        run: ctx => applyListMode(ctx.editor, mode),
        isActive: ctx => isListModeActive(ctx.editor, mode),
    })

/** The step the toolbar buttons use. A host wanting another can call `applyIndentMode`. */
const INDENT_PX = 20

registerEditorCommand({
    name: 'indent.increase',
    labelKey: 'editor.increaseIndent',
    icon: () => <IndentIcon class="size-5" />,
    run: ctx => applyIndentMode(false, INDENT_PX, ctx.editor),
})

registerEditorCommand({
    name: 'indent.decrease',
    labelKey: 'editor.decreaseIndent',
    icon: () => <OutdentIcon class="size-5" />,
    run: ctx => applyIndentMode(true, INDENT_PX, ctx.editor),
})

registerEditorCommand({
    name: 'blockquote',
    labelKey: 'editor.blockquote',
    run: ctx => toggleBlockquoteIn(ctx.editor),
    isActive: ctx => isSelectionInside(ctx.editor as HTMLDivElement, QUOTE_TAG),
})
// #endregion

// #region Non-formatting
/**
 * Print changes nothing in the document, so there is nothing to undo and nothing to put the
 * caret back into -- and it is async, which is the other reason it opts out of the selection
 * restore: `endCommand()` would fire while the print sheet was still being built.
 */
registerEditorCommand({
    name: 'print',
    labelKey: 'editor.print',
    history: 'none',
    selection: 'none',
    run: ctx => { void printEditor(ctx.editor) },
})
// #endregion

// #region Keyboard
/**
 * The chords the editor has always answered to, now in one table instead of two switch
 * statements that had already drifted apart.
 *
 * Exactly the six that worked before this file existed, and no more. A keyboard shortcut is
 * a claim on a key the user's browser, screen reader and OS may already want, so inventing
 * new ones is a product decision rather than a tidy-up -- `strikethrough` and `print` stay
 * unbound here for that reason, and a host that wants them can say so in one line.
 *
 * `Tab` is absent because it is not a chord: it routes list-indent against block-indent by
 * walking ancestors, and it competes with table-cell navigation. It stays a hand-written
 * branch in `Editor.tsx` until there is a reason for the table to grow conditions.
 */
registerEditorKeys('Mod+B', 'bold')
registerEditorKeys('Mod+I', 'italic')
registerEditorKeys('Mod+U', 'underline')
registerEditorKeys('Mod+Z', 'undo')
// Both redo chords: Ctrl+Shift+Z is what Windows and Linux editors use, Ctrl+Y is what
// Office trained everyone else to press. Cmd+Shift+Z is the Mac one, and `Mod` makes it
// the same row.
registerEditorKeys(['Mod+Shift+Z', 'Mod+Y'], 'redo')
// #endregion

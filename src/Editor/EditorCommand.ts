import { $, $$, JSX, Observable } from 'woby'
import { FocusManager } from './FocusManager'
import type { UndoRedoType } from './undoredo'
import { safeGetRange } from './BrowserCompat'
import { getCurrentEditor } from './utils'

/**
 * # The command registry
 *
 * What can be *done* to the document. Its sibling `EditorToolbarItem.ts` holds what is
 * *shown*.
 *
 * A command exists so that the five things every formatting button in this codebase used
 * to do by hand happen in exactly one place. Those five, in the order they must occur:
 *
 * 1. `preventDefault()` on **mousedown**, then `focusManager.beginCommand()`. Mousedown,
 *    not click: the browser moves focus between the two, so a button that caches the
 *    selection on click has already lost it.
 * 2. Resolve the range through the shadow root. `window.getSelection()` returns nothing
 *    useful for a surface inside a shadow tree, and `document.execCommand` /
 *    `queryCommandState` are blind to it entirely -- which is why neither appears here.
 * 3. Run the command.
 * 4. `focusManager.endCommand()`, which puts the caret back where it was.
 * 5. `saveDo()`, so the change is one undo step and not zero or three.
 *
 * Getting any one of them wrong produces a button that *looks* right and loses the user's
 * selection, or silently skips the undo stack. {@link runEditorCommand} does all five.
 * A registrant writes only step 3.
 *
 * ## Scope
 *
 * Module-global, like the toolbar registry -- see the scope note at the top of
 * `EditorToolbarItem.ts`. A command is a function, not state, so one registration serves
 * every editor on the page; which editor it acts on comes from the argument, never from
 * the registration.
 */

/** Everything a command is handed. Built fresh per invocation; never cache it. */
export interface CommandContext {
    /** The contenteditable surface, already focused and holding the caret. */
    editor: HTMLElement
    /**
     * The live range, resolved through the shadow root if there is one.
     *
     * Null when the surface genuinely has no selection. A command that needs one should
     * return early rather than assume -- `runEditorCommand` deliberately does *not* refuse
     * to run in that case, because "insert at the end" is a legitimate thing for a command
     * to mean.
     */
    range: Range | null
    /** The selection the range came from, same shadow-root resolution. */
    selection: Selection | null
    /** The editor's history. Only needed for `history: 'manual'`. */
    undoRedo: UndoRedoType
    /** The editor's focus/selection cache. Only needed for `selection: 'none'` commands. */
    focus: FocusManager
}

/**
 * A verb the editor can perform.
 *
 * The minimum is `{ name, run }`. Everything else exists so the standard button can draw
 * itself without the registrant writing any UI.
 */
export interface EditorCommand {
    /**
     * Unique id. Namespace third-party commands -- `'fengshui.compass.insert'`, not
     * `'insert'` -- because the registry is global and a collision warns and keeps the
     * first registration, which would be wui's.
     */
    name: string

    /** Do the thing. Step 3 of the five; the other four are handled for you. */
    run: (ctx: CommandContext) => void

    /**
     * Is the current selection already in this state? Drives the pressed look and
     * `aria-pressed`.
     *
     * Called on every `selectionchange`, so keep it cheap. Return `'mixed'` for a
     * selection that is partly in the state -- a paragraph half bold -- which the button
     * renders as `aria-pressed="mixed"` rather than lying in either direction.
     */
    isActive?: (ctx: CommandContext) => boolean | 'mixed'

    /** Can it run at all right now? Absent means always. Drives the disabled look. */
    isEnabled?: (ctx: CommandContext) => boolean

    /**
     * - `'auto'` (default) -- `saveDo()` once, after `run`. One click, one undo step.
     * - `'manual'` -- the command calls `ctx.undoRedo.saveDo()` itself, for a command that
     *   makes several separable changes or decides at runtime whether it changed anything.
     * - `'none'` -- no history entry. Undo and Redo themselves are the case: they *are* the
     *   history, and recording them would make the stack unusable.
     */
    history?: 'auto' | 'manual' | 'none'

    /**
     * - `'restore'` (default) -- cache the selection before and put it back after, so the
     *   caret survives the trip through the toolbar button.
     * - `'none'` -- do not. For commands that replace the document wholesale (undo, redo)
     *   or move focus somewhere else on purpose, where restoring a stale offset pair would
     *   put the caret in the wrong place rather than back where it was.
     */
    selection?: 'restore' | 'none'

    /**
     * Caption and tooltip, in English, for a command wui has never heard of. Goes through
     * `tx()`, so a locale pack can still translate it by keying on the English.
     */
    label?: string

    /**
     * ...or a wui message id, for a command that is part of wui. Goes through `t()`, and
     * wins over {@link label} when both are set.
     *
     * These are the only two channels. Do not invent a third.
     */
    labelKey?: string

    /** The glyph on the button. A thunk, so one registration can serve two editors. */
    icon?: () => JSX.Child
}

/** Fine print for {@link runEditorCommand}. Most callers pass nothing. */
export interface RunCommandOptions {
    /**
     * The caller already called `focusManager.beginCommand()`.
     *
     * A toolbar button has to: mousedown fires *before* the browser moves focus, and by
     * the time the click arrives the selection to cache may be gone. So the button caches
     * on mousedown, and tells this function not to cache a second time over the top of it.
     * `endCommand()` still runs here either way, so the pairing stays balanced.
     */
    selectionCached?: boolean
}

const registeredCommands = $<EditorCommand[]>([])

/**
 * Register a command.
 *
 * Duplicate names warn and keep the first registration, as every registry here does -- a
 * module imported twice for its side effects must not take the page down.
 */
export const registerEditorCommand = (command: EditorCommand): void => {
    const current = $$(registeredCommands)
    if (current.find(c => c.name === command.name)) {
        console.warn(`[EditorCommand] Command "${command.name}" is already registered. Skipping.`)
        return
    }
    registeredCommands([...current, command])
}

/**
 * Remove a command.
 *
 * A toolbar item still registered for it is **not** removed with it: it renders disabled.
 * That is the difference between taking a verb away and taking a button away, and the
 * button case is `hideToolbarItem`.
 */
export const unregisterEditorCommand = (name: string): void => {
    registeredCommands($$(registeredCommands).filter(c => c.name !== name))
}

/** Look one up. Reads the registry observable, so it is reactive inside an effect. */
export const getEditorCommand = (name: string): EditorCommand | undefined =>
    $$(registeredCommands).find(c => c.name === name)

/** The whole registry, for hosts that want to list what is available. */
export const getEditorCommands = (): Observable<EditorCommand[]> => registeredCommands

/**
 * The per-editor services a command needs, which are woby contexts and therefore not
 * reachable from `runEditorCommand`'s plain-function call site -- a keyboard handler, a
 * host's own button, a test.
 *
 * `Editor` publishes them here on mount, keyed by its own surface element. A WeakMap and
 * not a module variable, because two editors on one page have two of each and the
 * "current" one is whichever the caller named.
 */
export interface EditorRuntime {
    undoRedo: UndoRedoType
    focus: FocusManager
}

const runtimes = new WeakMap<HTMLElement, EditorRuntime>()

/** Called by `Editor` on mount. Hosts do not need this. */
export const attachEditorRuntime = (editor: HTMLElement, runtime: EditorRuntime): void => {
    runtimes.set(editor, runtime)
}

/** The services for one editor, or undefined if it has not mounted yet. */
export const getEditorRuntime = (editor: HTMLElement): EditorRuntime | undefined => runtimes.get(editor)

/**
 * Stand-ins for an editor whose runtime has not been published.
 *
 * Every field of `CommandContext` is non-optional on purpose: a third-party `run` should
 * never have to null-check `ctx.undoRedo` before calling `saveDo()`. The cost is these
 * two, which do nothing rather than throwing. An unattached `FocusManager` is genuinely
 * safe -- every one of its methods returns early on a null `editorElement`.
 */
const NO_HISTORY: UndoRedoType = {
    undos: $([]) as any,
    undo: () => { },
    redos: $([]) as any,
    redo: () => { },
    saveDo: () => { },
}
const DETACHED_FOCUS = new FocusManager()

/**
 * Resolve the surface a command should act on.
 *
 * An explicit element wins. Otherwise `getCurrentEditor()`, which finds the one the user
 * is typing in -- including through a shadow root, which is the case that matters here.
 */
const resolveEditor = (editor?: HTMLElement): HTMLElement | null =>
    editor ?? ($$(getCurrentEditor()) as HTMLElement | null) ?? null

/**
 * Build the context a command sees, without running anything.
 *
 * Used by `isActive`/`isEnabled` on every `selectionchange`, so it does no work beyond
 * reading the selection.
 */
export const buildCommandContext = (editor?: HTMLElement): CommandContext | null => {
    const el = resolveEditor(editor)
    if (!el) return null

    // Shadow-DOM-correct, every time. `window.getSelection()` reports the host, not the
    // node inside the shadow tree, so a toolbar built on it silently formats nothing.
    const root = el.getRootNode()
    const shadow = root instanceof ShadowRoot ? root : undefined
    const selection = (shadow ? (shadow as any).getSelection?.() : null) ?? window.getSelection()
    const range = safeGetRange(shadow) ?? null

    const runtime = runtimes.get(el)
    return {
        editor: el,
        range,
        selection: selection ?? null,
        undoRedo: runtime?.undoRedo ?? NO_HISTORY,
        focus: runtime?.focus ?? DETACHED_FOCUS,
    }
}

/**
 * Run a registered command, performing the whole five-step ritual around it.
 *
 * Safe to call from anywhere: a keyboard handler, a host's own button, a test. An unknown
 * name warns and returns -- it does not throw, because the usual cause is a button whose
 * command was unregistered, and a page that stops rendering is a worse outcome than a
 * click that does nothing.
 *
 * **Readonly is the caller's business.** The toolbar is not rendered when the editor is
 * readonly, so a command reached through a button cannot fire then -- but a keyboard chord
 * can, and so can a host calling this directly. `EditorKeymap` checks; anything else that
 * can fire while readonly must check too.
 *
 * @param name - The registered command name
 * @param editor - Which surface to act on. Omitted means the one the user is typing in.
 * @param options - See {@link RunCommandOptions}. Buttons pass `selectionCached`.
 */
export const runEditorCommand = (name: string, editor?: HTMLElement, options?: RunCommandOptions): void => {
    const command = getEditorCommand(name)
    if (!command) {
        console.warn(`[EditorCommand] No command registered as "${name}".`)
        return
    }

    const ctx = buildCommandContext(editor)
    if (!ctx) return
    if (command.isEnabled && !command.isEnabled(ctx)) return

    const restore = (command.selection ?? 'restore') === 'restore'

    // 1. Cache the selection and suppress the blur that the button's own focus would cause.
    //    Skipped when the caller already did it on mousedown -- see `RunCommandOptions`.
    if (restore && !options?.selectionCached) ctx.focus.beginCommand()

    try {
        // 3. The only step the registrant wrote.
        command.run(ctx)
    } catch (e) {
        // A throwing command must not leave `suppressBlur` stuck on -- the editor would
        // stop reacting to focus loss for the rest of the session.
        console.error(`[EditorCommand] "${name}" threw:`, e)
        if (restore) ctx.focus.endCommand()
        return
    }

    // 4. Put the caret back.
    if (restore) ctx.focus.endCommand()

    // 5. One click, one undo step.
    if ((command.history ?? 'auto') === 'auto') ctx.undoRedo.saveDo()
}

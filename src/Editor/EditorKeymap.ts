import { $, $$, Observable } from 'woby'
import { runEditorCommand, getEditorCommand } from './EditorCommand'

/**
 * # Keyboard chords, as a table
 *
 * The third registry, and the smallest: a chord string maps to a command name, and that is
 * the whole model. Nothing here knows what `bold` does -- it looks the name up in
 * `EditorCommand` and calls `runEditorCommand`, so a chord and a toolbar click run the same
 * five steps in the same order, including the undo entry.
 *
 * That indirection is the point. Before this file the editor had two hand-written
 * `switch (e.key)` blocks, one on the surface and one on the toolbar, and they had already
 * drifted: the toolbar's lowercased `e.key` and the surface's did not, so `Ctrl+Shift+Z`
 * matched in one and fell through to plain undo in the other. A table cannot drift from
 * itself.
 *
 * ## Scope
 *
 * Module-global, like {@link registerEditorCommand} and the toolbar registry. A chord is not
 * state; which editor it acts on comes from the event's target, never from the registration.
 *
 * ## `Mod`
 *
 * Write `Mod` and mean "the platform's command modifier": Cmd on macOS, Ctrl everywhere
 * else. Writing `Ctrl` literally is allowed and means Ctrl on every platform, which is
 * occasionally what you want and usually not.
 *
 * ## What this deliberately does not do
 *
 * No sequences (`g g`), no per-editor keymaps, no user-rebinding UI. Each of those is a
 * real feature with a real design, and none of them is needed to stop the editor having two
 * switch statements. A host that wants rebinding can unregister and re-register.
 */

/** One row of the table. Built by {@link registerEditorKeys}; hosts never construct these. */
export interface KeyBinding {
    /** The chord as written, e.g. `'Mod+Shift+Z'`. Kept for diagnostics and unregistering. */
    chord: string
    /** The registered command name. An unknown name is a no-op with a console warning. */
    command: string
    /**
     * Run even when the surface is not editable.
     *
     * Off by default, and that default is the important one: a readonly editor renders no
     * toolbar, so the keymap is the *only* way a formatting command could reach it, and
     * "readonly" must not mean "readonly unless you know the shortcut".
     *
     * Turn it on for commands that do not modify the document -- printing, exporting,
     * opening a host's own dialog. Those are exactly the things a reader of a locked
     * document still expects to work.
     */
    allowReadonly?: boolean
}

/** Normalized modifier flags plus a lowercased key name. The lookup key is built from this. */
interface Chord {
    alt: boolean
    ctrl: boolean
    meta: boolean
    shift: boolean
    key: string
}

/**
 * Is this a Mac?
 *
 * `navigator.platform` is deprecated and `userAgentData` is Chromium-only, so both are
 * tried and the answer is cached: it cannot change within a page's lifetime, and this is
 * asked on every registration.
 */
const isMac = (() => {
    if (typeof navigator === 'undefined') return false
    const data = (navigator as any).userAgentData
    if (data?.platform) return /mac/i.test(data.platform)
    return /mac/i.test(navigator.platform || navigator.userAgent || '')
})()

/**
 * Parse `'Mod+Shift+Z'` into flags and a key.
 *
 * Case-insensitive throughout, including the key: `e.key` is `'Z'` when shift is held and
 * `'z'` when it is not, and a table that distinguished those would match one of the two.
 * That was the `Ctrl+Shift+Z` bug, in one line.
 */
const parseChord = (chord: string): Chord | null => {
    const parts = chord.split('+').map(p => p.trim())

    // `'Mod++'` splits to `['Mod', '', '']`: the key is a literal plus, and the empty
    // slot after it is the split artefact. Rebuild it rather than reject the chord.
    if (parts.length > 1 && parts[parts.length - 1] === '') {
        parts.pop()
        parts[parts.length - 1] = '+'
    }

    const key = parts.pop()?.toLowerCase()
    if (!key) {
        console.warn(`[EditorKeymap] "${chord}" names no key.`)
        return null
    }

    const out: Chord = { alt: false, ctrl: false, meta: false, shift: false, key }
    for (const part of parts) {
        switch (part.toLowerCase()) {
            case 'mod': isMac ? (out.meta = true) : (out.ctrl = true); break
            case 'ctrl': case 'control': out.ctrl = true; break
            case 'cmd': case 'meta': case 'command': out.meta = true; break
            case 'alt': case 'option': out.alt = true; break
            case 'shift': out.shift = true; break
            default:
                console.warn(`[EditorKeymap] "${chord}" has an unknown modifier "${part}".`)
                return null
        }
    }
    return out
}

/** The map key. Order is fixed here and nowhere else, so a chord always hashes the same. */
const hash = (c: Chord) =>
    `${c.alt ? 'a' : ''}${c.ctrl ? 'c' : ''}${c.meta ? 'm' : ''}${c.shift ? 's' : ''}+${c.key}`

/** Same hash, from the event the browser handed us. */
const hashEvent = (e: KeyboardEvent) =>
    hash({ alt: e.altKey, ctrl: e.ctrlKey, meta: e.metaKey, shift: e.shiftKey, key: e.key.toLowerCase() })

const bindings = $<KeyBinding[]>([])

/** Hash to binding. Rebuilt on every registration; read on every keystroke. */
let index = new Map<string, KeyBinding>()

const reindex = () => {
    const next = new Map<string, KeyBinding>()
    for (const binding of $$(bindings)) {
        const parsed = parseChord(binding.chord)
        if (parsed) next.set(hash(parsed), binding)
    }
    index = next
}

/**
 * Bind one or more chords to a command.
 *
 * ```ts
 * registerEditorKeys('Mod+B', 'bold')
 * registerEditorKeys(['Mod+Shift+Z', 'Mod+Y'], 'redo')
 * ```
 *
 * The command does not have to exist yet -- import order between a plugin's commands and
 * its keys should not be load-bearing -- but an unbound name is reported when the chord
 * is actually pressed rather than swallowed.
 *
 * A chord already bound warns and keeps the first binding, as every registry here does.
 * Rebinding is `unregisterEditorKeys` then register, which is deliberate: silently taking
 * over `Mod+B` from another plugin is not something that should happen by import order.
 */
export const registerEditorKeys = (
    chords: string | string[],
    command: string,
    options?: { allowReadonly?: boolean },
): void => {
    const list = Array.isArray(chords) ? chords : [chords]
    const current = $$(bindings)
    const added: KeyBinding[] = []

    for (const chord of list) {
        const parsed = parseChord(chord)
        if (!parsed) continue

        const key = hash(parsed)
        const clash = [...current, ...added].find(b => {
            const p = parseChord(b.chord)
            return p && hash(p) === key
        })
        if (clash) {
            console.warn(`[EditorKeymap] "${chord}" is already bound to "${clash.command}". Skipping "${command}".`)
            continue
        }

        added.push({ chord, command, allowReadonly: options?.allowReadonly })
    }

    if (!added.length) return
    bindings([...current, ...added])
    reindex()
}

/** Drop every chord bound to a command, or just the one chord if named. */
export const unregisterEditorKeys = (command: string, chord?: string): void => {
    bindings($$(bindings).filter(b => b.command !== command || (chord !== undefined && b.chord !== chord)))
    reindex()
}

/** The whole table, reactive. For a host drawing a shortcut cheatsheet. */
export const getEditorKeys = (): Observable<KeyBinding[]> => bindings

/** The chord bound to a command, for a tooltip. First registered wins, as the table does. */
export const getChordFor = (command: string): string | undefined =>
    $$(bindings).find(b => b.command === command)?.chord

/**
 * Can this surface be typed into?
 *
 * A plain DOM question and not `useReadonly()`, because the keymap is reached from event
 * handlers and from a host's own code -- neither of which sits inside the component tree
 * that provides the context. `isContentEditable` is the same fact from the other side: the
 * readonly editor sets `contentEditable={false}`, and so does `screen` layout, which is a
 * reading mode and should behave identically here.
 */
const isEditable = (el: HTMLElement | null | undefined): boolean => !!el?.isContentEditable

/**
 * Run whatever the keystroke is bound to, and say whether anything ran.
 *
 * Calls `preventDefault` on a match, which the hand-written surface switch it replaces did
 * for `Ctrl+B/I/U` but not for `Ctrl+Z`. That was a bug rather than a preference: the
 * browser's own undo ran *after* ours on the same keystroke, re-editing the document we
 * had just restored wholesale.
 *
 * @param e - The keydown event.
 * @param editor - The surface to act on. Omit from a toolbar handler, where the caret is
 *   not in the event's target: `runEditorCommand` then resolves the editor the user was
 *   last typing in, which is the same resolution a toolbar button uses.
 */
export const handleEditorKeyDown = (e: KeyboardEvent, editor?: HTMLElement | null): boolean => {
    const binding = index.get(hashEvent(e))
    if (!binding) return false

    // Readonly is checked against the surface and not the event target, so a chord pressed
    // with focus in the toolbar of a readonly editor is refused too.
    if (!binding.allowReadonly && editor !== undefined && !isEditable(editor)) return false

    if (!getEditorCommand(binding.command)) {
        console.warn(`[EditorKeymap] "${binding.chord}" is bound to "${binding.command}", which is not registered.`)
        return false
    }

    e.preventDefault()
    runEditorCommand(binding.command, editor ?? undefined)
    return true
}

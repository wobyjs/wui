import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
    registerEditorKeys,
    unregisterEditorKeys,
    getEditorKeys,
    getChordFor,
    handleEditorKeyDown,
} from '../../src/Editor/EditorKeymap'
import { registerEditorCommand, unregisterEditorCommand } from '../../src/Editor/EditorCommand'
import { $$ } from 'woby'

/**
 * The keymap is the one registry that can be tested without a browser: it is a string
 * parser and a Map lookup, and the only DOM it touches is `isContentEditable`.
 *
 * The cases that matter are the ones that were bugs before the table existed -- shift
 * changing `e.key` from 'z' to 'Z', and two handlers disagreeing about whether to lowercase
 * it -- so those are asserted directly rather than through a component.
 */

/** A keydown event with the modifiers spelled out. `key` as the browser would report it. */
const keydown = (key: string, mods: Partial<Record<'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey', boolean>> = {}) =>
    new KeyboardEvent('keydown', { key, cancelable: true, ...mods })

/** A stand-in surface. `isContentEditable` is a getter in the DOM, hence defineProperty. */
const surface = (editable = true) => {
    const el = document.createElement('div')
    Object.defineProperty(el, 'isContentEditable', { value: editable, configurable: true })
    return el
}

/** Fire a chord and report whether the keymap claimed it. */
const press = (key: string, mods: Parameters<typeof keydown>[1], el?: HTMLElement | null) =>
    handleEditorKeyDown(keydown(key, mods), el)

let ran: string[] = []

beforeEach(() => {
    ran = []
    registerEditorCommand({ name: 'test.noop', history: 'none', selection: 'none', run: () => { ran.push('test.noop') } })
    registerEditorCommand({ name: 'test.other', history: 'none', selection: 'none', run: () => { ran.push('test.other') } })
})

afterEach(() => {
    unregisterEditorCommand('test.noop')
    unregisterEditorCommand('test.other')
    unregisterEditorKeys('test.noop')
    unregisterEditorKeys('test.other')
    unregisterEditorKeys('test.missing')
})

describe('registerEditorKeys', () => {
    it('binds a chord and reports it back', () => {
        registerEditorKeys('Alt+K', 'test.noop')
        expect(getChordFor('test.noop')).toBe('Alt+K')
        expect($$(getEditorKeys()).some(b => b.chord === 'Alt+K' && b.command === 'test.noop')).toBe(true)
    })

    it('accepts several chords for one command', () => {
        registerEditorKeys(['Alt+K', 'Alt+J'], 'test.noop')
        expect(press('k', { altKey: true }, surface())).toBe(true)
        expect(press('j', { altKey: true }, surface())).toBe(true)
        expect(ran).toEqual(['test.noop', 'test.noop'])
    })

    it('keeps the first binding when a chord is claimed twice', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => { })
        registerEditorKeys('Alt+K', 'test.noop')
        registerEditorKeys('Alt+K', 'test.other')
        press('k', { altKey: true }, surface())
        expect(ran).toEqual(['test.noop'])
        expect(warn).toHaveBeenCalled()
        warn.mockRestore()
    })

    it('rejects an unknown modifier rather than binding half a chord', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => { })
        registerEditorKeys('Hyper+K', 'test.noop')
        expect(getChordFor('test.noop')).toBeUndefined()
        expect(warn).toHaveBeenCalled()
        warn.mockRestore()
    })

    it('unregisters one chord without dropping the other', () => {
        registerEditorKeys(['Alt+K', 'Alt+J'], 'test.noop')
        unregisterEditorKeys('test.noop', 'Alt+K')
        expect(press('k', { altKey: true }, surface())).toBe(false)
        expect(press('j', { altKey: true }, surface())).toBe(true)
    })
})

describe('chord matching', () => {
    it('distinguishes shifted from unshifted, whatever case the browser reports', () => {
        registerEditorKeys('Alt+Z', 'test.noop')
        registerEditorKeys('Alt+Shift+Z', 'test.other')

        // The bug this replaced: with shift held the browser reports 'Z', and a switch on
        // the raw key matched neither arm -- so Ctrl+Shift+Z fell through to plain undo.
        press('z', { altKey: true }, surface())
        press('Z', { altKey: true, shiftKey: true }, surface())
        expect(ran).toEqual(['test.noop', 'test.other'])
    })

    it('does not match when a modifier the chord did not ask for is held', () => {
        registerEditorKeys('Alt+K', 'test.noop')
        expect(press('k', { altKey: true, shiftKey: true }, surface())).toBe(false)
        expect(press('k', {}, surface())).toBe(false)
    })

    it('resolves Mod to exactly one of Ctrl or Cmd', () => {
        registerEditorKeys('Mod+K', 'test.noop')
        const ctrl = press('k', { ctrlKey: true }, surface())
        const meta = press('k', { metaKey: true }, surface())
        expect([ctrl, meta].filter(Boolean)).toHaveLength(1)
    })

    it('takes a literal Ctrl as Ctrl on every platform', () => {
        registerEditorKeys('Ctrl+K', 'test.noop')
        expect(press('k', { ctrlKey: true }, surface())).toBe(true)
    })

    it('binds a named key', () => {
        registerEditorKeys('Alt+Enter', 'test.noop')
        expect(press('Enter', { altKey: true }, surface())).toBe(true)
    })
})

describe('handleEditorKeyDown', () => {
    it('claims the keystroke it handles and leaves the rest alone', () => {
        registerEditorKeys('Alt+K', 'test.noop')
        const handled = keydown('k', { altKey: true })
        const ignored = keydown('q', { altKey: true })
        expect(handleEditorKeyDown(handled, surface())).toBe(true)
        expect(handled.defaultPrevented).toBe(true)
        expect(handleEditorKeyDown(ignored, surface())).toBe(false)
        expect(ignored.defaultPrevented).toBe(false)
    })

    it('refuses a bound chord on a surface that is not editable', () => {
        registerEditorKeys('Alt+K', 'test.noop')
        expect(press('k', { altKey: true }, surface(false))).toBe(false)
        expect(ran).toEqual([])
    })

    it('runs a readonly-safe binding on a surface that is not editable', () => {
        registerEditorKeys('Alt+K', 'test.noop', { allowReadonly: true })
        expect(press('k', { altKey: true }, surface(false))).toBe(true)
        expect(ran).toEqual(['test.noop'])
    })

    it('warns rather than throws when the bound command is not registered', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => { })
        registerEditorKeys('Alt+K', 'test.missing')
        expect(press('k', { altKey: true }, surface())).toBe(false)
        expect(warn).toHaveBeenCalled()
        warn.mockRestore()
    })
})

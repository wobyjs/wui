import { describe, it, expect, afterEach } from 'vitest'
import { registerEditorCommand, unregisterEditorCommand, runEditorCommand } from '../../src/Editor/EditorCommand'
import {
    registerToolbarItem,
    unregisterToolbarItem,
    hideToolbarItem,
    showToolbarItem,
    resolveToolbarItems,
} from '../../src/Editor/EditorToolbarItem'
import { registerEditorKeys, unregisterEditorKeys, handleEditorKeyDown } from '../../src/Editor/EditorKeymap'

/**
 * The three registries have their own tests. This file asserts the thing that only shows up
 * where they meet, and that is the reason they were split in the first place: the three verbs
 * for taking a built-in away are *different verbs*, and each one has to leave the other two
 * alone.
 *
 * Written as a unit test rather than a browser check because the fact under test is the
 * absence of a coupling. A browser can show that Bold's button disappeared; only this can
 * show that nothing in the keymap ever consulted the toolbar to decide whether to run.
 */

/** A surface the keymap will accept. `isContentEditable` is a getter, hence defineProperty. */
const surface = () => {
    const el = document.createElement('div')
    Object.defineProperty(el, 'isContentEditable', { value: true, configurable: true })
    return el
}

const press = (key: string, el = surface()) =>
    handleEditorKeyDown(new KeyboardEvent('keydown', { key, ctrlKey: true, cancelable: true }), el)

/** Rendered item names, flattened, in paint order. */
const rendered = () => resolveToolbarItems().flatMap(g => g.items.map(i => i.name))

let ran = 0

/** A stand-in for `bold`: a command, a button, and a chord -- registered the public way. */
const installBold = () => {
    ran = 0
    registerEditorCommand({
        name: 'test.bold',
        history: 'none',
        selection: 'none',
        run: () => { ran++ },
    })
    registerToolbarItem({ name: 'test.bold', group: 'inline', command: 'test.bold' })
    registerEditorKeys('Ctrl+B', 'test.bold')
}

afterEach(() => {
    unregisterEditorCommand('test.bold')
    unregisterToolbarItem('test.bold')
    unregisterToolbarItem('test.myBold')
    showToolbarItem('test.bold')
    showToolbarItem('test.myBold')
    unregisterEditorKeys('test.bold')
})

describe('the three verbs are independent', () => {
    it('hides the button and leaves the chord working', () => {
        installBold()
        hideToolbarItem('test.bold')

        expect(rendered()).not.toContain('test.bold')
        expect(press('b')).toBe(true)
        expect(ran).toBe(1)
    })

    it('keeps the chord pointed at the built-in when a plugin replaces its button', () => {
        installBold()
        registerToolbarItem({ name: 'test.myBold', replaces: 'test.bold', render: () => null })

        // The widget changed; the verb did not. A plugin that wants the chord too has to say
        // so -- unregister the key and rebind it -- which is the whole point of keeping the
        // keymap out of the toolbar.
        expect(rendered()).toEqual(['test.myBold'])
        expect(press('b')).toBe(true)
        expect(ran).toBe(1)
    })

    it('stops the chord running once the command itself is unregistered', () => {
        installBold()
        unregisterEditorCommand('test.bold')

        // The button is still registered and still painted. Clicking it is a no-op with a
        // warning rather than a throw, and so is the chord -- an unregistered command must
        // degrade, not take the page down.
        expect(rendered()).toContain('test.bold')
        expect(press('b')).toBe(false)
        expect(ran).toBe(0)
        expect(() => runEditorCommand('test.bold')).not.toThrow()
    })
})

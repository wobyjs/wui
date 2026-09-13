import { describe, it, expect, afterEach, vi } from 'vitest'
import {
    registerToolbarItem,
    unregisterToolbarItem,
    registerToolbarGroup,
    getToolbarItems,
    getToolbarGroups,
    hideToolbarItem,
    showToolbarItem,
    isToolbarItemHidden,
    resolveToolbarItems,
    type ToolbarItem,
} from '../../src/Editor/EditorToolbarItem'
import { $$ } from 'woby'

/**
 * The toolbar registry is pure: descriptors in, an ordered list of descriptors out. Which
 * makes the part worth testing the part that is *not* obvious -- how `hideToolbarItem`,
 * `replaces` and `when()` interact, because each of the three can suppress an item and the
 * combinations are where a plugin ends up deleting a built-in it only meant to shadow.
 *
 * Nothing here renders. `resolveToolbarItems` never calls `render`, and the editor is not
 * imported, so the registry starts empty rather than holding wui's own 26 items.
 */

/** Register and remember, so `afterEach` can put the registry back to empty. */
const registered: string[] = []
const add = (item: ToolbarItem) => {
    registerToolbarItem(item)
    registered.push(item.name)
    return item
}

/** A minimal item. `command` rather than `render` -- nothing here paints. */
const item = (name: string, rest: Partial<ToolbarItem> = {}) =>
    add({ name, command: name, ...rest })

/** Rendered item names, flattened, in the order the toolbar would paint them. */
const rendered = () => resolveToolbarItems().flatMap(g => g.items.map(i => i.name))

/** Which band an item resolved into. */
const bandOf = (name: string) =>
    resolveToolbarItems().find(g => g.items.some(i => i.name === name))?.group.name

afterEach(() => {
    for (const name of registered) { unregisterToolbarItem(name); showToolbarItem(name) }
    registered.length = 0
})

describe('registerToolbarItem', () => {
    it('keeps the first registration when a name is used twice', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => { })
        item('a', { group: 'inline', order: 1 })
        registerToolbarItem({ name: 'a', command: 'other', group: 'layout' })
        expect(bandOf('a')).toBe('inline')
        expect(warn).toHaveBeenCalled()
        warn.mockRestore()
    })

    it('refuses an item that sets neither command nor render', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => { })
        registerToolbarItem({ name: 'bare' } as ToolbarItem)
        expect(rendered()).not.toContain('bare')
        expect(warn).toHaveBeenCalled()
        warn.mockRestore()
    })

    it('refuses an item that sets both', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => { })
        registerToolbarItem({ name: 'both', command: 'x', render: () => null })
        expect(rendered()).not.toContain('both')
        expect(warn).toHaveBeenCalled()
        warn.mockRestore()
    })
})

describe('ordering', () => {
    it('sorts groups by rank and items by order within them', () => {
        item('late', { group: 'layout', order: 0 })
        item('second', { group: 'inline', order: 10 })
        item('first', { group: 'inline', order: -10 })
        expect(rendered()).toEqual(['first', 'second', 'late'])
    })

    it('keeps registration order for a tie', () => {
        item('one', { group: 'inline', order: 0 })
        item('two', { group: 'inline', order: 0 })
        expect(rendered()).toEqual(['one', 'two'])
    })

    it('puts an item with no group in insert, and an unknown group at the end', () => {
        item('nowhere', { group: 'not-a-group' })
        item('defaulted')
        expect(rendered()).toEqual(['defaulted', 'nowhere'])
        expect(bandOf('defaulted')).toBe('insert')
    })

    it('places a declared group where it asked to be', () => {
        registerToolbarGroup({ name: 'mine', order: 250 })
        item('plugin', { group: 'mine' })
        item('colour', { group: 'color' })
        item('bold', { group: 'inline' })
        expect(rendered()).toEqual(['bold', 'plugin', 'colour'])
        expect(getToolbarGroups().find(g => g.name === 'mine')?.order).toBe(250)
    })
})

describe('hideToolbarItem', () => {
    it('stops an item painting without unregistering it', () => {
        item('bold', { group: 'inline' })
        hideToolbarItem('bold')
        expect(rendered()).not.toContain('bold')
        expect(isToolbarItemHidden('bold')).toBe(true)
        // The registration -- and so the command behind it, and its chord -- is untouched.
        expect($$(getToolbarItems()).some(i => i.name === 'bold')).toBe(true)
    })

    it('is reversible', () => {
        item('bold', { group: 'inline' })
        hideToolbarItem('bold')
        showToolbarItem('bold')
        expect(rendered()).toContain('bold')
        expect(isToolbarItemHidden('bold')).toBe(false)
    })
})

describe('replaces', () => {
    it('takes the replaced item off the bar and inherits its slot', () => {
        item('bold', { group: 'inline', order: -100 })
        item('trailing', { group: 'inline', order: 50 })
        item('myBold', { group: 'layout', order: 999, replaces: 'bold' })

        // Declared in `layout` at 999, rendered in `inline` at -100: the slot comes from the
        // item being replaced, or "take over Bold's place" would still mean "go last".
        expect(rendered()).toEqual(['myBold', 'trailing'])
        expect(bandOf('myBold')).toBe('inline')
    })

    it('restores the built-in when the replacement is unregistered', () => {
        item('bold', { group: 'inline' })
        item('myBold', { replaces: 'bold' })
        unregisterToolbarItem('myBold')
        expect(rendered()).toEqual(['bold'])
    })

    it('does not claim the slot when the replacement is hidden', () => {
        item('bold', { group: 'inline' })
        item('myBold', { replaces: 'bold' })
        hideToolbarItem('myBold')
        // Hiding the replacement must not hide the thing it replaced as well -- that would
        // leave the band with a hole and no way to reason about which verb suppressed it.
        expect(rendered()).toEqual(['bold'])
    })

    it('does not claim the slot when the replacement is switched off by when()', () => {
        item('bold', { group: 'inline' })
        let on = false
        item('myBold', { replaces: 'bold', when: () => on })
        expect(rendered()).toEqual(['bold'])
        on = true
        expect(rendered()).toEqual(['myBold'])
    })

    it('follows a chain of replacements to the original slot', () => {
        item('bold', { group: 'inline', order: -100 })
        item('theirBold', { group: 'layout', replaces: 'bold' })
        item('myBold', { group: 'insert', replaces: 'theirBold' })
        expect(rendered()).toEqual(['myBold'])
        expect(bandOf('myBold')).toBe('inline')
    })

    it('survives two items replacing each other', () => {
        item('a', { group: 'inline', replaces: 'b' })
        item('b', { group: 'inline', replaces: 'a' })
        // Both are claimed, so nothing paints -- but resolving must terminate, which is the
        // whole assertion. Two plugin authors who never met can write this.
        expect(() => rendered()).not.toThrow()
    })
})

describe('when()', () => {
    it('is not evaluated for a hidden item', () => {
        const predicate = vi.fn(() => true)
        item('bold', { group: 'inline', when: predicate })
        hideToolbarItem('bold')
        rendered()
        expect(predicate).not.toHaveBeenCalled()
    })

    it('is evaluated once per resolve', () => {
        const predicate = vi.fn(() => true)
        item('bold', { group: 'inline', when: predicate })
        rendered()
        expect(predicate).toHaveBeenCalledTimes(1)
    })

    /**
     * The scoping decision, asserted: the registry is module-global and `when()` is what
     * scopes an item to one editor of several. Two editors resolve the bar separately, so a
     * predicate reading "which editor am I resolving for" gives each one a different toolbar
     * from a single registration -- which is the whole reason the decision is safe.
     */
    it('scopes one registration to one of two editors', () => {
        let current = 'a'
        item('shared', { group: 'inline' })
        item('onlyA', { group: 'inline', when: () => current === 'a' })

        expect(rendered()).toEqual(['shared', 'onlyA'])
        current = 'b'
        expect(rendered()).toEqual(['shared'])
    })

    it('gives each editor its own node from one render thunk', () => {
        // The other half of the decision: a `ToolbarItem` is a descriptor, not state. The
        // thunk runs once per editor, so two editors never share a DOM node.
        const seen: object[] = []
        add({ name: 'widget', group: 'inline', render: () => { const n = {}; seen.push(n); return n as any } })
        for (const g of resolveToolbarItems()) g.items.forEach(i => i.render!())
        for (const g of resolveToolbarItems()) g.items.forEach(i => i.render!())
        expect(seen).toHaveLength(2)
        expect(seen[0]).not.toBe(seen[1])
    })
})

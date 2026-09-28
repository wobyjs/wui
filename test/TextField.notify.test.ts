import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { $, $$, render } from 'woby'

/**
 * The notification contract of TextField.
 *
 * `onChange` used to be forwarded from two places at once -- the native `input`
 * listener on the <input> and a JSX `onChange` (which woby binds as the DOM
 * `change` event, since `onchange` is not on its delegation allow-list). In live
 * mode a consumer heard every keystroke twice over; in `assignOnEnter` mode only
 * the JSX side ever fired, and blur threw the edit away. These tests pin the
 * single-notification behaviour so it cannot drift back.
 *
 * The component is called directly rather than through <wui-text-field>: function
 * props are not wired by the custom-element pipeline (their defaults are plain
 * `undefined`, not `$()`), so `onChange` is reachable from TSX only.
 */
describe('TextField notification contract', () => {
    let container: HTMLDivElement
    let dispose: () => void
    let input: HTMLInputElement
    let value: ReturnType<typeof $<string>>
    let changes: string[]
    let keyups: string[]

    /** One typed character: the browser fires `input`, then `keyup`. */
    const type = (text: string, key = 'a') => {
        input.value = text
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }))
    }

    const blur = () => input.dispatchEvent(new FocusEvent('blur', { bubbles: true }))

    const mount = async (assignOnEnter: boolean) => {
        const { default: TextField } = await import('../src/TextField')
        value = $('')
        changes = []
        keyups = []
        container = document.createElement('div')
        document.body.appendChild(container)
        dispose = render(TextField({
            value,
            assignOnEnter,
            onChange: () => changes.push($$(value)),
            onKeyUp: (e: KeyboardEvent) => keyups.push(e.key),
        } as any) as any, container)
        input = container.querySelector('input') as HTMLInputElement
        expect(input, 'the field rendered an <input>').toBeTruthy()
    }

    afterEach(() => {
        dispose?.()
        container?.remove()
    })

    describe('live mode', () => {
        beforeEach(() => mount(false))

        it('reports one change per keystroke, not one per listener', () => {
            type('a')
            expect(changes).toEqual(['a'])
        })

        it('reports every keyup exactly once', () => {
            type('a', 'a')
            type('ab', 'b')
            expect(keyups).toEqual(['a', 'b'])
        })

        it('stays quiet on a blur that changed nothing', () => {
            type('a')
            blur()
            expect(changes).toEqual(['a'])
        })

        it('writes the observable', () => {
            type('hello')
            expect($$(value)).toBe('hello')
        })
    })

    describe('assignOnEnter mode', () => {
        beforeEach(() => mount(true))

        it('holds the value back until Enter', () => {
            type('draft', 'd')
            expect($$(value)).toBe('')
            expect(changes).toEqual([])
        })

        it('commits and reports once on Enter', () => {
            type('draft', 'Enter')
            expect($$(value)).toBe('draft')
            expect(changes).toEqual(['draft'])
        })

        it('commits and reports once on blur -- leaving the field is a commit too', () => {
            type('draft', 'd')
            blur()
            expect($$(value)).toBe('draft')
            expect(changes).toEqual(['draft'])
        })

        it('does not report a second time when Enter is followed by blur', () => {
            type('draft', 'Enter')
            blur()
            expect(changes).toEqual(['draft'])
        })

        it('still reports keyups that did not commit', () => {
            type('d', 'd')
            expect(keyups).toEqual(['d'])
        })
    })
})

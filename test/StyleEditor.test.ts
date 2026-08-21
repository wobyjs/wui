import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
    buildToken, joinVariant, refresh, resolveToken, splitVariant, tokenIsShared, tokensFor,
} from '../src/Editor/StyleEditor/TwBridge'
import {
    applyStyle, clearStyle, readStyleState, setProperties, validate,
} from '../src/Editor/StyleEditor/StyleModel'
import { allProperties, controlFor, groupOf, propertyGroups } from '../src/Editor/StyleEditor/propertyCatalog'

/**
 * A stylesheet standing in for compiled Tailwind output, so `resolveToken` has
 * something to scan. Its contents are the point of the test: the bridge is
 * supposed to learn what a class means from the CSS, not from the class name.
 */
let sheet: HTMLStyleElement

function addRule(css: string) {
    sheet.textContent += css + '\n'
    refresh()
}

beforeEach(() => {
    sheet = document.createElement('style')
    document.head.appendChild(sheet)
    refresh()
})

afterEach(() => {
    sheet.remove()
    refresh()
})

describe('propertyCatalog', () => {
    it('enumerates properties without duplicates and in sorted order', () => {
        const props = allProperties()
        expect(props.length).toBeGreaterThan(0)
        expect(new Set(props).size).toBe(props.length)
        expect([...props].sort()).toEqual(props)
    })

    it('includes shorthands the computed enumeration omits', () => {
        expect(allProperties()).toContain('padding')
        expect(allProperties()).toContain('border-radius')
    })

    it('never lists a property in two groups', () => {
        const seen = new Set<string>()
        for (const group of propertyGroups())
            for (const prop of group.props) {
                expect(seen.has(prop)).toBe(false)
                seen.add(prop)
            }
    })

    it('picks a control from the property name', () => {
        expect(controlFor('color')).toBe('color')
        expect(controlFor('display')).toBe('enum')
        expect(controlFor('width')).toBe('length')
        expect(controlFor('grid-template-areas')).toBe('text')
        // `background` accepts a colour but is not only a colour, so it must not
        // get a picker that would discard the rest of the shorthand.
        expect(controlFor('background')).not.toBe('color')
    })

    it('puts curated properties in their group and the rest in Other', () => {
        expect(groupOf('display')).toBe('Layout')
        expect(groupOf('margin-top')).toBe('Spacing')
    })
})

describe('splitVariant', () => {
    it('separates a state prefix from the utility', () => {
        expect(splitVariant('hover:bg-red-500')).toEqual({ variant: 'hover', utility: 'bg-red-500' })
        expect(splitVariant('p-4')).toEqual({ variant: 'base', utility: 'p-4' })
    })

    it('does not mistake an arbitrary property colon for a variant', () => {
        expect(splitVariant('[mask-type:luminance]').variant).toBe('base')
    })

    it('leaves prefixes it does not model alone', () => {
        // `md:` is a breakpoint, which this panel does not edit. Claiming it as
        // a state would let a base-state edit silently delete it.
        expect(splitVariant('md:p-4')).toEqual({ variant: 'base', utility: 'md:p-4' })
    })

    it('round-trips through joinVariant', () => {
        for (const token of ['p-4', 'hover:p-4', 'focus:[mask-type:alpha]']) {
            const { variant, utility } = splitVariant(token)
            expect(joinVariant(variant, utility)).toBe(token)
        }
    })
})

describe('buildToken', () => {
    it('uses an equivalent utility where one exists', () => {
        expect(buildToken('color', '#ff0000')).toBe('text-[#ff0000]')
        expect(buildToken('padding', '4px')).toBe('p-[4px]')
    })

    it('falls back to arbitrary-property syntax for anything else', () => {
        expect(buildToken('mask-type', 'luminance')).toBe('[mask-type:luminance]')
    })

    it('prefixes the variant', () => {
        expect(buildToken('color', 'red', 'hover')).toBe('hover:text-[red]')
        expect(buildToken('mask-type', 'alpha', 'focus')).toBe('focus:[mask-type:alpha]')
    })

    it('encodes spaces as underscores and escapes real underscores', () => {
        const BS = String.fromCharCode(92)
        expect(buildToken('font-family', 'Fira Code')).toBe('[font-family:Fira_Code]')
        expect(buildToken('font-family', 'Fira_Code')).toBe('[font-family:Fira' + BS + '_Code]')
    })

    it('reports its own declarations before any stylesheet defines it', () => {
        // RuntimeTailwind compiles asynchronously: for a frame after the class
        // lands on the element, no rule for it exists. A read in that window
        // must still report the value the user just typed.
        const token = buildToken('mask-type', 'alpha')
        expect(resolveToken(token)).toEqual({ 'mask-type': 'alpha' })
    })
})

describe('resolveToken', () => {
    it('reads declarations out of the stylesheet, not out of the class name', () => {
        addRule('.p-4 { padding: 1rem; }')
        expect(resolveToken('p-4')?.padding).toBe('1rem')
        expect(resolveToken('p-4')?.['padding-top']).toBe('1rem')
    })

    it('returns null for a class nothing defines', () => {
        expect(resolveToken('not-a-class-anywhere')).toBe(null)
    })

    it('resolves a state variant through its pseudo-class selector', () => {
        // The rule below is written as Tailwind emits it: the escaped token
        // followed by the pseudo-class it stands for.
        addRule('.hover' + String.fromCharCode(92) + ':bg-red:hover { color: red; }')
        expect(resolveToken('hover:bg-red')).toEqual({ color: 'red' })
        // ...and the same token must not resolve off its own selector.
        expect(resolveToken('bg-red')).toBe(null)
    })

    it('sees rules nested in at-rules', () => {
        // Tailwind v4 wraps utilities in `@layer` and hover in `@media (hover:
        // hover)`. A scan that only read top-level rules would find nothing.
        addRule('@media (min-width: 1px) { .nested-x { opacity: 0.5; } }')
        expect(resolveToken('nested-x')).toEqual({ opacity: '0.5' })
    })

    it('recognises a class that has nothing to do with Tailwind', () => {
        addRule('.card { padding: 8px; border-radius: 4px; }')
        expect(resolveToken('card')?.padding).toBe('8px')
    })
})

describe('readStyleState', () => {
    it('lets the style attribute win over a class, and says both are set', () => {
        addRule('.text-red { color: red; }')
        const el = document.createElement('div')
        el.className = 'text-red'
        el.style.setProperty('color', 'blue')

        const state = readStyleState(el, 'color')
        expect(state.value).toBe('blue')
        expect(state.origin).toBe('inline')
        expect(state.classValue).toBe('red')
        expect(state.conflict).toBe(true)
        expect(state.classTokens).toEqual(['text-red'])
    })

    it('reports a class value when nothing is set inline', () => {
        addRule('.text-green { color: green; }')
        const el = document.createElement('div')
        el.className = 'text-green'

        const state = readStyleState(el, 'color')
        expect(state.value).toBe('green')
        expect(state.origin).toBe('class')
        expect(state.conflict).toBe(false)
    })

    it('falls back to the base value under a state, and flags that it did', () => {
        // No API forces `:hover`, so the honest reading under a state with
        // nothing set is base's value, marked as borrowed.
        addRule('.text-black { color: black; }')
        const el = document.createElement('div')
        el.className = 'text-black'

        const state = readStyleState(el, 'color', 'hover')
        expect(state.value).toBe('black')
        expect(state.fromBase).toBe(true)
        expect(state.classTokens).toEqual([])
    })

    it('prefers a variant class over the base value under that state', () => {
        const BS = String.fromCharCode(92)
        addRule('.text-black { color: black; }')
        addRule('.hover' + BS + ':text-white:hover { color: white; }')
        const el = document.createElement('div')
        el.className = 'text-black hover:text-white'

        expect(readStyleState(el, 'color', 'hover').value).toBe('white')
        expect(readStyleState(el, 'color', 'hover').fromBase).toBe(false)
        expect(readStyleState(el, 'color').value).toBe('black')
    })
})

describe('setProperties', () => {
    it('collects both surfaces, and classes nobody here wrote', () => {
        addRule('.card { padding: 8px; border-radius: 4px; }')
        const el = document.createElement('div')
        el.className = 'card'
        el.style.setProperty('opacity', '0.5')

        const props = setProperties(el)
        expect(props).toContain('opacity')
        expect(props).toContain('padding')
        expect(props).toContain('border-radius')
        expect([...props].sort()).toEqual(props)
    })

    it('lists only the tokens belonging to the variant asked for', () => {
        const BS = String.fromCharCode(92)
        addRule('.hover' + BS + ':underline:hover { text-decoration-line: underline; }')
        const el = document.createElement('div')
        el.className = 'hover:underline'
        el.style.setProperty('opacity', '0.5')

        // Inline declarations belong to base alone.
        expect(setProperties(el, 'hover')).toEqual(['text-decoration-line'])
    })
})

describe('applyStyle', () => {
    it('writes a class and clears the inline declaration it would lose to', () => {
        const el = document.createElement('div')
        el.style.setProperty('color', 'blue')

        const result = applyStyle(el, 'color', 'red', 'tw')
        expect(result.ok).toBe(true)
        expect(el.classList.contains('text-[red]')).toBe(true)
        // Left in place, the inline value would override the class and the edit
        // would look like it did nothing.
        expect(el.style.getPropertyValue('color')).toBe('')
    })

    it('writes the style attribute and removes the class it replaces', () => {
        addRule('.text-red { color: red; }')
        const el = document.createElement('div')
        el.className = 'text-red'

        const result = applyStyle(el, 'color', 'blue', 'css')
        expect(result.ok).toBe(true)
        expect(el.style.getPropertyValue('color')).toBe('blue')
        expect(el.classList.contains('text-red')).toBe(false)
        expect(result.blockedBy).toEqual([])
    })

    it('keeps a shared class and reports it instead of deleting it', () => {
        // Removing `.card` to change its padding would silently drop its
        // border-radius too, so it stays and the row badges the conflict.
        addRule('.card { padding: 8px; border-radius: 4px; }')
        const el = document.createElement('div')
        el.className = 'card'

        const result = applyStyle(el, 'padding', '2px', 'css')
        expect(result.ok).toBe(true)
        expect(result.blockedBy).toEqual(['card'])
        expect(el.classList.contains('card')).toBe(true)
        expect(readStyleState(el, 'padding').conflict).toBe(true)
    })
})

describe('applyStyle under a state', () => {
    it('forces the class surface, whatever the row asked for', () => {
        const el = document.createElement('div')

        const result = applyStyle(el, 'color', 'red', 'css', 'hover')
        expect(result.ok).toBe(true)
        expect(el.classList.contains('hover:text-[red]')).toBe(true)
        // A `style` attribute cannot express `:hover` at all.
        expect(el.getAttribute('style')).toBeFalsy()
    })

    it('rejects a value the browser will not parse, without touching anything', () => {
        const el = document.createElement('div')
        el.style.setProperty('color', 'blue')

        const result = applyStyle(el, 'color', 'not-a-colour-at-all', 'tw')
        expect(result.ok).toBe(false)
        expect(el.className).toBe('')
        expect(el.style.getPropertyValue('color')).toBe('blue')
    })

    it('clears both surfaces when given an empty value', () => {
        addRule('.text-red { color: red; }')
        const el = document.createElement('div')
        el.className = 'text-red'
        el.style.setProperty('color', 'blue')

        expect(applyStyle(el, 'color', '  ', 'css').ok).toBe(true)
        expect(el.style.getPropertyValue('color')).toBe('')
        expect(el.classList.contains('text-red')).toBe(false)
    })
})

describe('clearStyle', () => {
    it('leaves neither surface setting the property', () => {
        addRule('.text-red { color: red; }')
        const el = document.createElement('div')
        el.className = 'text-red'
        el.style.setProperty('color', 'blue')

        expect(clearStyle(el, 'color')).toBe(true)
        expect(readStyleState(el, 'color').origin).toBe('computed')
    })

    it('reports failure when a shared class still sets the property', () => {
        addRule('.card { padding: 8px; border-radius: 4px; }')
        const el = document.createElement('div')
        el.className = 'card'

        expect(clearStyle(el, 'padding')).toBe(false)
        expect(el.classList.contains('card')).toBe(true)
    })

    it('removes only the variant asked for', () => {
        const BS = String.fromCharCode(92)
        addRule('.text-black { color: black; }')
        addRule('.hover' + BS + ':text-white:hover { color: white; }')
        const el = document.createElement('div')
        el.className = 'text-black hover:text-white'

        clearStyle(el, 'color', 'hover')
        expect(el.classList.contains('hover:text-white')).toBe(false)
        expect(el.classList.contains('text-black')).toBe(true)
    })
})

describe('validate', () => {
    it('accepts what the CSSOM parses and rejects what it drops', () => {
        expect(validate('color', 'red')).toBe(true)
        expect(validate('width', '10px')).toBe(true)
        expect(validate('color', 'definitely-not-a-colour')).toBe(false)
    })

    it('treats the empty value as valid, because it means clear', () => {
        expect(validate('color', '')).toBe(true)
        expect(validate('color', '   ')).toBe(true)
    })
})

describe('round trip', () => {
    it('reads back through the stylesheet what it wrote as a class', () => {
        // The two directions are independent: `buildToken` names the class,
        // `resolveToken` learns its meaning from the CSS. This is the test that
        // they agree for a property with no utility of its own.
        const BS = String.fromCharCode(92)
        const el = document.createElement('div')
        applyStyle(el, 'mask-type', 'luminance', 'tw')

        const token = el.classList[0]
        expect(token).toBe('[mask-type:luminance]')
        addRule('.' + token.replace(/[[\]:]/g, c => BS + c) + ' { mask-type: luminance; }')
        expect(readStyleState(el, 'mask-type').value).toBe('luminance')
        expect(readStyleState(el, 'mask-type').origin).toBe('class')
    })
})

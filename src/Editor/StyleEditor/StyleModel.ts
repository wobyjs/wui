/**
 * Reading and writing one property on one element, across both style surfaces.
 *
 * An element carries a property's value in up to three places, and they do not
 * agree by default:
 *
 *  1. the `style` attribute -- highest precedence, no way to express `:hover`
 *  2. class tokens -- can express states, may be shared with other properties
 *  3. the cascade -- what `getComputedStyle` reports, read-only
 *
 * `readStyleState` reports all three so a row can show the effective value *and*
 * where it came from; `applyStyle` writes to exactly one of them and clears the
 * other where it safely can, so an edit is never invisible because a
 * higher-precedence surface overrode it.
 *
 * @module StyleModel
 */

import { getBaseCls } from '../../helper/baseCls'
import { type Variant, buildToken, resolveToken, splitVariant, tokenIsShared, tokensFor } from './TwBridge'

/** Which surface an edit is written to. */
export type Target = 'tw' | 'css'

/** Where the value a row displays actually comes from. */
export type Origin = 'inline' | 'class' | 'computed'

export type PropState = {
    prop: string
    /** The value to display: whichever surface currently wins. */
    value: string
    origin: Origin
    /** Value from the `style` attribute, `''` when unset. Always `''` off base. */
    inline: string
    /** Value contributed by class tokens, `''` when none. */
    classValue: string
    /** Class tokens that set this property in this variant. */
    classTokens: string[]
    /**
     * Both `style` and a class set this property. The class is being overridden
     * and the row says so, because silently showing the winner makes the loser
     * look like an edit that did not take.
     */
    conflict: boolean
    /**
     * Nothing is set for this state, so the base value is shown instead.
     *
     * `getComputedStyle` has no way to report `:hover` -- no API forces a
     * pseudo-state -- so under a non-base state the only honest reading is
     * "whatever base says, unless a variant class overrides it".
     */
    fromBase: boolean
}

/** Read a property's full state on an element for a given variant. */
export function readStyleState(
    el: HTMLElement,
    prop: string,
    variant: Variant = 'base',
    root: Document | ShadowRoot = document,
): PropState {
    const tokens = classTokens(el)
    const own = tokensFor(prop, variant, tokens, root)
    // Later classes do not win by document order, but when several tokens set
    // the same property the last one written is the one the user just added, so
    // it is the most useful to show.
    const last = own[own.length - 1]
    const classValue = last ? (resolveToken(last, root)?.[prop] ?? '') : ''

    const inline = variant === 'base' ? el.style.getPropertyValue(prop).trim() : ''

    if (inline) return {
        prop, value: inline, origin: 'inline', inline, classValue,
        classTokens: own, conflict: !!classValue, fromBase: false,
    }
    if (classValue) return {
        prop, value: classValue, origin: 'class', inline: '', classValue,
        classTokens: own, conflict: false, fromBase: false,
    }

    if (variant !== 'base') {
        const base = readStyleState(el, prop, 'base', root)
        return {
            prop, value: base.value, origin: base.origin, inline: '', classValue: '',
            classTokens: [], conflict: false, fromBase: true,
        }
    }

    let computed = ''
    try { computed = window.getComputedStyle(el).getPropertyValue(prop).trim() } catch { /* */ }
    return {
        prop, value: computed, origin: 'computed', inline: '', classValue: '',
        classTokens: [], conflict: false, fromBase: false,
    }
}

/** The element's classes as a token array. */
export function classTokens(el: HTMLElement): string[] {
    return Array.from(el.classList)
}

/**
 * The tokens currently filling the component's `cls` slot.
 *
 * That is the override when one is set, and the published base class otherwise
 * -- the same fallback the component itself renders (`$$(cls) ? $$(cls) : BASE`).
 * These are the component classes a chip *can* remove, because rewriting `cls`
 * is exactly how the slot is replaced.
 */
export function clsTokens(el: HTMLElement): string[] {
    // Truthiness, not blankness, exactly as the component reads it: `''` (and a
    // missing attribute) means "use the base", while `' '` is a real override
    // that happens to contribute no classes.
    const override = el.getAttribute('cls')
    const source = override ? override : getBaseCls(el)
    return source.trim() ? source.trim().split(/\s+/) : []
}

/**
 * Drop one token from the `cls` slot, writing the rest back as the override.
 *
 * Removing the first token is what turns the published base into an explicit
 * override; from then on the attribute is the source of truth and each further
 * removal edits it.
 *
 * Emptying the slot completely writes a single space rather than `''`, because
 * the components read `cls` as `$$(cls) ? $$(cls) : BASE` -- an empty string is
 * "no override, use the base", so the last removal would hand back every class
 * the user had just finished deleting. A space is truthy, contributes no token,
 * and stays visible in the Class Override row as the deliberate blank it is.
 */
export function removeClsToken(el: HTMLElement, token: string): void {
    const next = clsTokens(el).filter(t => t !== token)
    el.setAttribute('cls', next.length ? next.join(' ') : ' ')
}

/**
 * Component classes no chip can remove: everything on the rendered root that
 * neither the host's `class` attribute nor the `cls` slot contributed.
 *
 * A wui component renders into a shadow root, so `<wui-avatar class="p-2">`
 * carries one token while the box on screen has sixteen. Listing only the host's
 * leaves the panel describing an element nobody can see. What lands here is the
 * variant and size classes, which sit *outside* the `cls` slot by design so an
 * override cannot cost the element its shape -- the way to change them is the
 * variant/size prop in the Properties section, not a class edit.
 */
export function componentTokens(el: HTMLElement): string[] {
    const rendered = el.shadowRoot?.firstElementChild
    if (!rendered) return []
    const own = new Set(classTokens(el))
    for (const t of clsTokens(el)) own.add(t)
    return Array.from(rendered.classList).filter(t => !own.has(t))
}

/**
 * Properties explicitly set on the element for a variant, in a stable order.
 *
 * This is what the panel shows before anything is searched or expanded. With
 * ~350 properties enumerated, a flat list is unusable; the handful actually set
 * on the element is almost always what someone opened the panel to change.
 *
 * Both surfaces contribute, and so do classes nobody here wrote -- a `.card`
 * from the project stylesheet shows its properties like any other source.
 */
export function setProperties(
    el: HTMLElement,
    variant: Variant = 'base',
    root: Document | ShadowRoot = document,
): string[] {
    const out = new Set<string>()
    if (variant === 'base')
        for (let i = 0; i < el.style.length; i++) out.add(el.style[i])

    for (const token of classTokens(el)) {
        if (splitVariant(token).variant !== variant) continue
        const decls = resolveToken(token, root)
        if (decls) for (const p of Object.keys(decls)) out.add(p)
    }

    return Array.from(out).filter(p => !p.startsWith('--')).sort()
}

// -- Validation --------------------------------------------------------------

let probe: CSSStyleDeclaration | null = null

/**
 * Whether the browser accepts `value` for `prop`.
 *
 * Asking the CSSOM is the only correct answer: a declaration silently drops
 * what it cannot parse, so a value that reads back empty was rejected. This
 * catches typos before they reach the element, where an ignored declaration
 * would look like the panel doing nothing.
 *
 * The empty string is treated as valid -- it means "clear", which every
 * property accepts.
 */
export function validate(prop: string, value: string): boolean {
    const v = value.trim()
    if (!v) return true
    if (!probe) {
        try { probe = document.createElement('div').style } catch { return true }
    }
    try {
        probe.removeProperty(prop)
        probe.setProperty(prop, v)
        const accepted = probe.getPropertyValue(prop) !== ''
        probe.removeProperty(prop)
        return accepted
    } catch {
        return false
    }
}

// -- Writing -----------------------------------------------------------------

export type ApplyResult = {
    ok: boolean
    /** Class tokens left in place that still set this property. */
    blockedBy: string[]
}

/**
 * Remove the class tokens that set `prop` in `variant`, and report the ones
 * that could not be removed.
 *
 * A token setting several properties -- `.card`, or Tailwind's `p-4` under a
 * catalogue entry for `padding-top` -- is left alone. Deleting it to change one
 * property would silently take the others with it, which is a worse outcome
 * than the conflict badge the caller shows instead.
 */
function dropTokens(
    el: HTMLElement,
    prop: string,
    variant: Variant,
    root: Document | ShadowRoot,
): string[] {
    const blocked: string[] = []
    for (const token of tokensFor(prop, variant, classTokens(el), root)) {
        if (tokenIsShared(token, prop, root)) blocked.push(token)
        else el.classList.remove(token)
    }
    return blocked
}

/**
 * Write `prop: value` to one surface, clearing what would override it.
 *
 * The clearing is the part that matters. Writing a class while the `style`
 * attribute still sets the property produces an edit with no visible effect,
 * and the user's only clue would be a badge -- so a `tw` write removes the
 * inline declaration, and either write removes the class tokens it safely can.
 * What survives is reported in `blockedBy` for the row to badge.
 *
 * An invalid value is rejected without touching the element: a half-applied
 * edit is harder to recover from than one that visibly did not take.
 */
export function applyStyle(
    el: HTMLElement,
    prop: string,
    value: string,
    target: Target,
    variant: Variant = 'base',
    root: Document | ShadowRoot = document,
): ApplyResult {
    const v = value.trim()
    if (!v) return { ok: clearStyle(el, prop, variant, root), blockedBy: [] }
    if (!validate(prop, v)) return { ok: false, blockedBy: [] }

    // Inline styles cannot express a pseudo-state, so off base there is only one
    // surface to write to. The row disables the `css` toggle to match.
    const surface: Target = variant === 'base' ? target : 'tw'

    const blockedBy = dropTokens(el, prop, variant, root)

    if (surface === 'css') {
        el.style.setProperty(prop, v)
    } else {
        if (variant === 'base') el.style.removeProperty(prop)
        el.classList.add(buildToken(prop, v, variant))
    }

    return { ok: true, blockedBy }
}

/**
 * Remove `prop` from both surfaces for a variant.
 *
 * Returns false when a shared class still sets the property -- the element did
 * change, but not all the way to unset, and the row must keep showing why.
 */
export function clearStyle(
    el: HTMLElement,
    prop: string,
    variant: Variant = 'base',
    root: Document | ShadowRoot = document,
): boolean {
    if (variant === 'base') el.style.removeProperty(prop)
    return dropTokens(el, prop, variant, root).length === 0
}

/** @jsxImportSource woby */

/**
 * The style section appended to the property panel: every CSS property the
 * browser knows, editable on either the `style` attribute or a Tailwind class,
 * per pseudo-state.
 *
 * The panel enumerates ~350 properties, so what it shows *first* is the whole
 * design. Opening straight into a 350-row list would be useless. Instead:
 *
 *  - **Set on this element** comes first and is almost always the answer --
 *    it is the properties the element actually has, from either surface.
 *  - **Search** finds a property by name without expanding anything.
 *  - **Groups** are collapsed, and a collapsed group renders no rows at all
 *    (the `{cond ? <rows/> : null}` below is what makes the full catalogue
 *    affordable).
 *
 * Sections use a ternary returning `null` rather than `cond && <rows/>`: a woby
 * regression leaves a `&&` child mounted after the condition goes false, so the
 * rows would appear and never disappear.
 *
 * @module StyleEditor
 */

import { $, $$, useEffect, useMemo, type Observable } from 'woby'
import { allProperties, propertyGroups } from './propertyCatalog'
import { VARIANTS, type Variant, refresh, splitVariant, trackRoot } from './TwBridge'
import { classTokens, clsTokens, componentTokens, removeClsToken, setProperties } from './StyleModel'
import { StyleRow } from './StyleRow'
import { t } from '../../i18n'

/**
 * A group's heading, translated.
 *
 * The English name stays the identity everywhere else -- `openGroups` keys on it and
 * `groupOf` returns it -- so it is translated at the last possible moment, here. A group
 * with no catalogue entry (a browser-only one, or a group added later) comes back from
 * `t` as its own id, which would put `style.group.Foo` on screen; fall back to the raw
 * name instead.
 */
const groupLabel = (name: string): string => {
    const id = 'style.group.' + name
    const s = t(id)
    return s === id ? name : s
}

export type StyleEditorProps = {
    /** The element being edited. `null` renders the empty state. */
    target: Observable<HTMLElement | null>
    /** Called after every write, for the host to record an undo step. */
    onEdit?: () => void
    /** Start expanded. Off by default so the panel opens at its usual height. */
    open?: boolean
}

/** The style/class root a class token would resolve against. */
function rootOf(el: HTMLElement | null): Document | ShadowRoot {
    if (!el) return document
    const root = el.getRootNode()
    return root instanceof ShadowRoot ? root : document
}

export const StyleEditor = ({ target, onEdit, open }: StyleEditorProps) => {
    const expanded = $(open ?? false)
    const variant = $<Variant>('base')
    const search = $('')
    const version = $(0)
    const openGroups = $<Record<string, boolean>>({})

    const root = useMemo(() => rootOf($$(target)))
    useEffect(() => trackRoot($$(root)))

    /**
     * Re-read every row.
     *
     * The stylesheet index is dropped first because a write may have introduced
     * a class that Tailwind compiled only just now; keeping the old index would
     * report the token as unknown and blank the row the user just edited.
     */
    const rebuild = () => {
        refresh()
        version($$(version) + 1)
        onEdit?.()
    }

    // A different element means different values everywhere, and the previous
    // element's stylesheets may not apply to this one.
    useEffect(() => { $$(target); refresh() })

    /**
     * Re-read when the element is restyled from anywhere but here.
     *
     * The chips and the property panel's own CSS Class row edit the same
     * attribute from two places, and undo/redo edits it from a third. Without
     * this the section keeps rendering whatever it read on selection, so adding
     * a class in the row silently drops the chips a version behind -- and the
     * next chip removal writes that stale list back over the row's edit.
     */
    useEffect(() => {
        const el = $$(target)
        if (!el) return
        const mo = new MutationObserver(() => version($$(version) + 1))
        mo.observe(el, { attributes: true, attributeFilter: ['class', 'style', 'cls'] })
        return () => mo.disconnect()
    })

    const rowFor = (prop: string) => (
        <StyleRow prop={prop} el={target} variant={variant} root={root} version={version} onEdit={rebuild} />
    )

    const toggleGroup = (name: string) => {
        const next = { ...$$(openGroups) }
        next[name] = !next[name]
        openGroups(next)
    }

    const removeClass = (token: string) => {
        const el = $$(target)
        if (!el) return
        el.classList.remove(token)
        rebuild()
    }

    /**
     * Remove one of the component's own base classes, by narrowing the `cls` slot.
     *
     * The chip is not on this element -- it is on a node inside the shadow root --
     * so there is no classList to remove it from. What there is, is the attribute
     * that decides what that node renders, and rewriting it without the token says
     * the same thing the × implies.
     */
    const removeSlotClass = (token: string) => {
        const el = $$(target)
        if (!el) return
        removeClsToken(el, token)
        rebuild()
    }

    const addClass = (raw: string) => {
        const el = $$(target)
        const value = raw.trim()
        if (!el || !value) return
        // Accept a whole class string, the way it would be pasted from markup.
        for (const token of value.split(/\s+/)) el.classList.add(token)
        rebuild()
    }

    /** Properties set on the element, re-read on every version bump. */
    const setProps = useMemo(() => {
        $$(version)
        const el = $$(target)
        return el ? setProperties(el, $$(variant), $$(root)) : []
    })

    /** Class tokens on the element, re-read on every version bump. */
    const tokens = useMemo(() => {
        $$(version)
        const el = $$(target)
        return el ? classTokens(el) : []
    })

    /** The component's base classes, i.e. whatever currently fills its `cls` slot. */
    const slot = useMemo(() => {
        $$(version)
        const el = $$(target)
        return el ? clsTokens(el) : []
    })

    /** Component classes outside the `cls` slot -- variant and size, which no chip can remove. */
    const inherited = useMemo(() => {
        $$(version)
        const el = $$(target)
        return el ? componentTokens(el) : []
    })

    const MAX_SEARCH_RESULTS = 80

    const matches = useMemo(() => {
        const q = $$(search).trim().toLowerCase()
        if (!q) return null
        return allProperties().filter(p => p.includes(q))
    })

    const variantClass = (v: Variant) => () => [
        'px-2 py-0.5 text-[10px] font-medium rounded border leading-none',
        $$(variant) === v
            ? 'text-[#1976d2] bg-[#1976d2]/10 border-[#1976d2]/50'
            : 'text-gray-500 bg-transparent border-transparent hover:bg-gray-100',
    ].join(' ')

    const body = () => (
        <div class="bg-white">
            <div class="flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-gray-50/60">
                {VARIANTS.map(v => (
                    <button
                        type="button"
                        class={variantClass(v)}
                        title={() => v === 'base' ? t('style.normalState') : t('style.pseudoState', { state: v })}
                        ref={(e: HTMLButtonElement) => { if (e) e.onclick = () => variant(v) }}
                    >{v}</button>
                ))}
                <span class="ml-auto text-[9px] text-gray-400 select-none">
                    {() => $$(variant) === 'base' ? '' : 'tw only'}
                </span>
            </div>

            <div class="px-2 py-1.5 border-b border-gray-200">
                <input
                    type="text"
                    placeholder={() => t('style.searchProperties')}
                    spellCheck={false}
                    class="w-full px-2 py-1 text-[11px] rounded border border-gray-200 bg-white outline-none focus:border-[#1976d2]"
                    ref={(e: HTMLInputElement) => {
                        if (!e) return
                        // `input` is a delegated event in woby and this panel lives
                        // in a shadow root; assigning the handler directly keeps
                        // the field responsive per keystroke regardless.
                        e.oninput = () => search(e.value)
                    }}
                />
            </div>

            {() => {
                const found = $$(matches)
                if (!found) return null
                if (!found.length)
                    return <div class="px-3 py-3 text-[11px] text-gray-400">No property matches that name.</div>
                const shown = found.slice(0, MAX_SEARCH_RESULTS)
                return (
                    <div>
                        {shown.map(rowFor)}
                        {found.length > shown.length
                            ? <div class="px-3 py-1.5 text-[10px] text-gray-400">
                                {found.length - shown.length} more — narrow the search to see them.
                            </div>
                            : null}
                    </div>
                )
            }}

            {() => {
                if ($$(matches)) return null
                const props = $$(setProps)
                return (
                    <div>
                        <div class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-gray-50/60 border-b border-gray-200">
                            Set on this element
                            <span class="ml-1 font-normal text-gray-400">({props.length})</span>
                        </div>
                        {props.length
                            ? props.map(rowFor)
                            : <div class="px-3 py-2 text-[11px] text-gray-400">
                                Nothing set for this state. Open a group below, or search.
                            </div>}
                    </div>
                )
            }}

            {() => {
                if ($$(matches)) return null
                return propertyGroups().map(group => (
                    <div>
                        <button
                            type="button"
                            class="flex w-full items-center gap-1.5 px-3 py-1 text-left bg-gray-50/60 hover:bg-gray-100 border-b border-gray-200"
                            ref={(e: HTMLButtonElement) => { if (e) e.onclick = () => toggleGroup(group.name) }}
                        >
                            <span class="w-2 text-[9px] text-gray-400">
                                {() => $$(openGroups)[group.name] ? '\u25be' : '\u25b8'}
                            </span>
                            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                {/* A thunk: `groupLabel` reads the locale observable. */}
                                {() => groupLabel(group.name)}
                            </span>
                            <span class="ml-auto text-[10px] text-gray-400 font-mono">{group.props.length}</span>
                        </button>
                        {/* Rows exist only while the group is open — this is what
                            keeps a 350-property catalogue cheap. */}
                        {() => $$(openGroups)[group.name] ? <div>{group.props.map(rowFor)}</div> : null}
                    </div>
                ))
            }}
        </div>
    )

    /**
     * The raw class list, and a field to paste into.
     *
     * The rows cover any single property, but a class can do things a property
     * row cannot -- a project utility, a variant this panel does not model, a
     * string copied from markup. Exposing the list keeps those reachable
     * instead of making the panel a wall around the element.
     *
     * Three layers, in the order they apply. First the component's base classes,
     * the ones filling its `cls` slot: they are not on this element -- they live
     * on a node inside the shadow root -- but they are still removable, because
     * removing one just rewrites `cls` with the rest, which is what that slot is
     * for. Showing them matters: on a wui component they are most of what is on
     * screen, and hiding them leaves the section looking empty next to an element
     * that is clearly styled.
     *
     * Then the variant and size classes, greyed and without a ×. Those sit
     * outside the slot on purpose so an override cannot cost the element its
     * shape, which also means no class edit can reach them -- the control for
     * those is the variant/size property row.
     *
     * The element's own classes come last, and those are plain classList edits.
     */
    const classBar = () => (
        <div class="border-t border-gray-200 bg-gray-50/60">
            <div class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {() => t('style.classes')}
            </div>
            <div class="flex flex-wrap gap-1 px-2 pb-1.5">
                {() => $$(slot).map(token => (
                    <span
                        class="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border border-gray-300 bg-gray-100 text-gray-500"
                        title={() => t('style.fromBase')}
                    >
                        {token}
                        <button
                            type="button"
                            class="text-gray-400 hover:text-red-500 leading-none"
                            title={() => t('style.removeToken', { token })}
                            ref={(e: HTMLButtonElement) => { if (e) e.onclick = () => removeSlotClass(token) }}
                        >&times;</button>
                    </span>
                ))}
                {() => $$(inherited).map(token => (
                    <span
                        class="flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border border-dashed border-gray-300 bg-gray-100 text-gray-400"
                        title={() => t('style.fromVariant')}
                    >
                        {token}
                    </span>
                ))}
                {() => $$(tokens).map(token => {
                    const { variant: v } = splitVariant(token)
                    return (
                        <span class={[
                            'flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border',
                            v === 'base'
                                ? 'bg-white border-gray-200 text-slate-600'
                                : 'bg-[#1976d2]/5 border-[#1976d2]/30 text-[#1976d2]',
                        ].join(' ')}>
                            {token}
                            <button
                                type="button"
                                class="text-gray-400 hover:text-red-500 leading-none"
                                title={() => t('style.removeToken', { token })}
                                ref={(e: HTMLButtonElement) => { if (e) e.onclick = () => removeClass(token) }}
                            >&times;</button>
                        </span>
                    )
                })}
            </div>
            <div class="px-2 pb-2">
                <input
                    type="text"
                    placeholder="Add classes"
                    spellCheck={false}
                    class="w-full px-2 py-1 text-[11px] font-mono rounded border border-gray-200 bg-white outline-none focus:border-[#1976d2]"
                    ref={(e: HTMLInputElement) => {
                        if (!e) return
                        e.onkeydown = (ev: KeyboardEvent) => {
                            if (ev.key !== 'Enter') return
                            addClass(e.value)
                            e.value = ''
                        }
                        e.onchange = () => { addClass(e.value); e.value = '' }
                    }}
                />
            </div>
        </div>
    )

    return (
        <div class="border-t border-gray-200">
            <button
                type="button"
                class="flex w-full items-center gap-2 px-3 py-2 text-left bg-gray-100 hover:bg-gray-200 border-b border-gray-200"
                ref={(e: HTMLButtonElement) => { if (e) e.onclick = () => expanded(!$$(expanded)) }}
            >
                <span class="w-2 text-[10px] text-gray-500">
                    {() => $$(expanded) ? '\u25be' : '\u25b8'}
                </span>
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-600">Styles</span>
                <span class="ml-auto text-[10px] text-gray-400 font-mono">
                    {() => {
                        const el = $$(target)
                        if (!el) return ''
                        return `${$$(setProps).length} set`
                    }}
                </span>
            </button>

            {() => {
                if (!$$(expanded)) return null
                if (!$$(target))
                    return <div class="px-3 py-3 text-[11px] text-gray-400">Select an element to edit its styles.</div>
                return <>{body()}{classBar()}</>
            }}
        </div>
    )
}

export default StyleEditor

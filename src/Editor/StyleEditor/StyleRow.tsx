/** @jsxImportSource woby */

/**
 * One property row: label, value control, target toggle, conflict badge, clear.
 *
 * Every control is a text field. A colour gets a swatch beside it and an
 * enumerated property gets a `<datalist>`, but the field itself always accepts
 * free text, because the catalogue's keyword tables are deliberately incomplete
 * (see `propertyCatalog`) and a closed `<select>` would make the missing values
 * unreachable. Validation happens against the CSSOM on commit, so typing
 * something the tables never heard of is fine and typing nonsense is refused.
 *
 * Handlers are bound imperatively through `ref`. woby delegates `click` and
 * `input` from `document`, and this panel renders inside the editor's shadow
 * root where that delegation has proven unreliable; a directly-assigned
 * `onclick` has no such dependency.
 *
 * @module StyleRow
 */

import { $, $$, useEffect, useMemo, type Observable } from 'woby'
import { CSS_WIDE, KEYWORDS, controlFor } from './propertyCatalog'
import { type Variant } from './TwBridge'
import { type Target, applyStyle, clearStyle, readStyleState, validate } from './StyleModel'

export type StyleRowProps = {
    prop: string
    el: Observable<HTMLElement | null>
    variant: Observable<Variant>
    root: Observable<Document | ShadowRoot>
    /** Bumped whenever the element changes, to re-read every row. */
    version: Observable<number>
    /** Called after a write lands, so the panel can re-read and record undo. */
    onEdit: () => void
}

/** Colour when the swatch can show it; `''` when the value is not a plain colour. */
function swatchValue(value: string): string {
    if (/^#[0-9a-f]{3,8}$/i.test(value)) return value.length === 4 || value.length === 7 ? value : value.slice(0, 7)
    // `rgb()`/named colours cannot go into an `<input type=color>` directly, but
    // the browser will normalise them for us through a probe element.
    try {
        const probe = document.createElement('div')
        probe.style.color = value
        if (!probe.style.color) return ''
        document.head.appendChild(probe)
        const rgb = getComputedStyle(probe).color
        probe.remove()
        const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
        if (!m) return ''
        return '#' + [m[1], m[2], m[3]].map(n => (+n).toString(16).padStart(2, '0')).join('')
    } catch {
        return ''
    }
}

/** Nudge the numeric part of a length by `delta`, preserving its unit. */
function step(value: string, delta: number): string {
    const m = value.trim().match(/^(-?[\d.]+)(.*)$/)
    if (!m) return value
    const next = +(parseFloat(m[1]) + delta).toFixed(4)
    return `${next}${m[2]}`
}

export const StyleRow = ({ prop, el, variant, root, version, onEdit }: StyleRowProps) => {
    const kind = controlFor(prop)

    const state = useMemo(() => {
        $$(version)
        const element = $$(el)
        return element ? readStyleState(element, prop, $$(variant), $$(root)) : null
    })

    /**
     * Which surface this row writes to.
     *
     * Seeded from where the value already lives, so editing something that came
     * from the `style` attribute writes back to the `style` attribute. Migrating
     * it to a class unasked would change the element's specificity behaviour as
     * a side effect of an unrelated edit.
     */
    const target = $<Target>($$(state)?.origin === 'inline' ? 'css' : 'tw')
    const invalid = $(false)
    const blocked = $<string[]>([])

    /**
     * The two controls, as observables rather than plain `let`s.
     *
     * They have to be tracked. The effect below is what puts a value on screen, and
     * it runs the moment the component is created -- which is BEFORE the `ref`
     * callbacks fire and hand it the inputs. With a plain `let` the effect saw
     * `null`, skipped the assignment, and never ran again, because `state` does not
     * change after mount: every row rendered blank while its tooltip correctly
     * reported "style attribute". Reading them through `$$` makes the ref landing a
     * dependency, so the effect re-runs with the element in hand.
     */
    const field = $<HTMLInputElement | null>(null)
    const swatch = $<HTMLInputElement | null>(null)

    /** True while the user is typing here, so a re-read must not overwrite them. */
    const editing = () => {
        const f = $$(field)
        if (!f) return false
        const rootNode = f.getRootNode() as Document | ShadowRoot
        return (rootNode as any).activeElement === f
    }

    const commit = (raw: string) => {
        const element = $$(el)
        if (!element) return
        const v = raw.trim()
        const current = $$(state)

        // Re-committing the displayed value is a no-op only when that value is
        // actually set here. When it is inherited from base (or from the
        // cascade), the same text is a real edit: it pins the value to this
        // state.
        if (current && v === current.value && !current.fromBase && current.origin !== 'computed') return

        if (v && !validate(prop, v)) { invalid(true); return }
        invalid(false)

        if (!v) {
            clearStyle(element, prop, $$(variant), $$(root))
            blocked([])
        } else {
            const result = applyStyle(element, prop, v, $$(target), $$(variant), $$(root))
            blocked(result.blockedBy)
        }
        onEdit()
    }

    const clear = () => {
        const element = $$(el)
        if (!element) return
        clearStyle(element, prop, $$(variant), $$(root))
        blocked([])
        invalid(false)
        onEdit()
    }

    // Push the current value into the controls, except while they are being
    // typed into -- assigning `.value` under the caret moves it to the end.
    useEffect(() => {
        const s = $$(state)
        const value = s?.value ?? ''
        const f = $$(field)
        const sw = $$(swatch)
        if (f && !editing()) f.value = value
        if (sw) {
            const hex = swatchValue(value)
            if (hex) sw.value = hex
        }
    })

    const listId = `sd-${prop}`
    const options = kind === 'enum' ? [...(KEYWORDS[prop] ?? []), ...CSS_WIDE] : null

    /** Muted when the value is inherited rather than set on this element. */
    const valueClass = () => {
        const s = $$(state)
        const muted = !s || s.fromBase || s.origin === 'computed'
        return [
            'flex-1 min-w-0 px-1.5 py-0.5 text-[11px] font-mono rounded border bg-white',
            'outline-none focus:border-[#1976d2]',
            $$(invalid) ? 'border-red-400 text-red-600' : 'border-gray-200',
            muted && !$$(invalid) ? 'text-gray-400 italic' : 'text-slate-700',
        ].join(' ')
    }

    const toggleClass = (which: Target) => () => {
        const active = $$(target) === which
        const disabled = which === 'css' && $$(variant) !== 'base'
        return [
            'px-1 py-0.5 text-[9px] font-bold uppercase rounded border leading-none',
            disabled
                ? 'text-gray-300 border-transparent cursor-not-allowed'
                : active
                    ? 'text-[#1976d2] bg-[#1976d2]/10 border-[#1976d2]/50'
                    : 'text-gray-500 bg-transparent border-transparent hover:bg-gray-100',
        ].join(' ')
    }

    /** Why this row is badged, or `''` when it is not. */
    const warning = () => {
        const s = $$(state)
        const stuck = $$(blocked)
        if (stuck.length) return `Also set by ${stuck.join(' ')}, which sets other properties too — left in place.`
        if (s?.conflict) return `The style attribute overrides ${s.classTokens.join(' ')}.`
        return ''
    }

    return (
        <div class="flex items-center gap-1 px-2 py-[3px] border-b border-gray-100 last:border-b-0 hover:bg-gray-50/60">
            <span
                class="w-[124px] shrink-0 truncate text-[10px] font-mono text-slate-500 select-none"
                title={prop}
            >
                {prop}
            </span>

            <div class="flex flex-1 items-center gap-1 min-w-0">
                {kind === 'color'
                    ? <input
                        type="color"
                        class="w-5 h-5 shrink-0 rounded border border-gray-200 bg-white p-0 cursor-pointer"
                        ref={(e: HTMLInputElement) => {
                            if (!e) return
                            swatch(e)
                            e.oninput = () => commit(e.value)
                        }}
                    />
                    : null}

                <input
                    type="text"
                    spellCheck={false}
                    list={options ? listId : undefined}
                    class={valueClass}
                    title={() => {
                        const s = $$(state)
                        if (!s) return ''
                        if (s.fromBase) return 'Inherited from base — type a value to set it for this state'
                        if (s.origin === 'computed') return 'From the cascade — type a value to set it on this element'
                        return `${s.origin === 'inline' ? 'style attribute' : s.classTokens.join(' ')}`
                    }}
                    ref={(e: HTMLInputElement) => {
                        if (!e) return
                        field(e)
                        e.onchange = () => commit(e.value)
                        e.onkeydown = (ev: KeyboardEvent) => {
                            if (ev.key === 'Enter') { commit(e.value); return }
                            if (ev.key === 'Escape') { e.value = $$(state)?.value ?? ''; e.blur(); return }
                            if (kind !== 'length') return
                            if (ev.key !== 'ArrowUp' && ev.key !== 'ArrowDown') return
                            const delta = (ev.key === 'ArrowUp' ? 1 : -1) * (ev.shiftKey ? 10 : 1)
                            const next = step(e.value, delta)
                            if (next === e.value) return
                            ev.preventDefault()
                            e.value = next
                            commit(next)
                        }
                    }}
                />

                {options
                    ? <datalist id={listId}>
                        {options.map(o => <option value={o} />)}
                    </datalist>
                    : null}
            </div>

            <div class="flex shrink-0 items-center gap-0.5">
                <span
                    class="w-3 text-[10px] text-amber-500 cursor-help select-none"
                    title={warning}
                >
                    {() => (warning() ? '\u26a0' : '')}
                </span>

                <button
                    type="button"
                    class={toggleClass('tw')}
                    title="Write this property as a Tailwind class"
                    ref={(e: HTMLButtonElement) => { if (e) e.onclick = () => target('tw') }}
                >tw</button>

                <button
                    type="button"
                    class={toggleClass('css')}
                    title={() => $$(variant) === 'base'
                        ? 'Write this property to the style attribute'
                        : 'The style attribute cannot express a pseudo-state'}
                    ref={(e: HTMLButtonElement) => {
                        if (e) e.onclick = () => { if ($$(variant) === 'base') target('css') }
                    }}
                >css</button>

                <button
                    type="button"
                    class={() => {
                        const s = $$(state)
                        const settable = s && !s.fromBase && s.origin !== 'computed'
                        return [
                            'w-4 h-4 text-[11px] leading-none rounded',
                            settable
                                ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                : 'text-transparent pointer-events-none',
                        ].join(' ')
                    }}
                    title="Remove this property"
                    ref={(e: HTMLButtonElement) => { if (e) e.onclick = clear }}
                >&times;</button>
            </div>
        </div>
    )
}

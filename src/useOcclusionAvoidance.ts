import { $, $$, useEffect, type Observable, type ObservableMaybe } from 'woby'
import { deepElementFromPoint } from './helper/deepElementFromPoint'
import { composedParent, composedClosest } from './helper/composedParent'

/**
 * Occlusion avoidance — "the FAB knows when it is covered, and steps out from
 * under, within limits".
 *
 * Detection is a paint-order hit-test, not z-index arithmetic: z-index only
 * compares within one stacking context, so "is anything over me" is undecidable
 * from styles alone. `elementFromPoint` answers it directly, and piercing open
 * shadow roots keeps the answer honest for shadow-DOM chrome. But it can only
 * answer for positions the element actually occupies: probing a *virtual* rect
 * from home lets everything beneath the candidate — the canvas under a FAB, the
 * container's own background — masquerade as a cover, because the prober is
 * still sitting at home and not there to outrank them. So every position,
 * home included, is tested by parking the element there for a synchronous
 * moment and asking the hit-test what is on top now. Nothing paints between
 * the park and the restore, so the page never flickers.
 *
 * Displacement is a `transform: translate(dx, dy)`, never `top`/`left` — it
 * composes with whatever position the host already authored, it is reversible,
 * and it animates on the compositor.
 *
 * The state is an offset from home, never a new home; nothing persists across a
 * remount. `wui-fab` is the first caller (its `avoid` family of props); the hook
 * itself is headless so any element can use it.
 */
export interface OcclusionState {
    /** Something painted over the home position (measured before any offset). */
    covered: boolean
    /** The topmost non-self element found over the home position, when nameable. */
    by: Element | null
    /** Offset currently applied, in px. Home is `(0, 0)`. */
    dx: number
    dy: number
    /** Covered, and no in-budget position was clear: stayed put, gave up. */
    blocked: boolean
    /** The cover is a modal mask. Held in place, not dodged, until it goes away. */
    maskUp: boolean
}

export interface OcclusionAvoidanceOptions {
    /** Master switch, default `true` — `wui-fab` passes its `avoid` prop here. */
    enabled?: ObservableMaybe<boolean>
    /** Clearance kept between the element and the cover, px. Default 8. */
    margin?: ObservableMaybe<number>
    /** Total offset budget, px — never exceeded, however much would be needed. Default 96. */
    max?: ObservableMaybe<number>
    /** Stay-inside container selector; defaults to the offset parent's padding box. */
    within?: ObservableMaybe<string>
    /** Elements matching this selector are never counted as covers. */
    ignore?: ObservableMaybe<string>
    /** Called whenever the reported state changes. A plain function or the
     *  observable a `defaults()` prop wraps — unwrapped at call time, like every
     *  other option. */
    onAvoid?: ObservableMaybe<((s: OcclusionState) => void) | null>
}

/** Candidate directions in preference order: down first — chrome hangs from the top. */
const DIRS: readonly (readonly [number, number])[] = [
    [0, 1], [-1, 0], [-1, 1], [0, -1], [1, 0], [-1, -1],
]

interface Rect { left: number; top: number; right: number; bottom: number }

/** `Number('')` and `Number(null)` are both 0 — only genuinely finite values count,
 *  so an intentional `0` (e.g. `avoid-max="0"`) stays `0` and does not fall back. */
const finite = (v: unknown, fallback: number): number => {
    const n = Number(v)
    return Number.isFinite(n) ? n : fallback
}

/**
 * Keep an element clear of whatever paints over it, by hit-testing and stepping
 * aside within a budget. Returns the state as an observable; `onAvoid` hears the
 * same changes as they happen.
 */
export const useOcclusionAvoidance = (
    ref: ObservableMaybe<HTMLElement | null | undefined>,
    opts: OcclusionAvoidanceOptions = {},
): Observable<OcclusionState> => {
    const state = $<OcclusionState>({ covered: false, by: null, dx: 0, dy: 0, blocked: false, maskUp: false })

    useEffect(() => {
        // Reactive reads — an option change tears the wiring down and re-runs it.
        const enabled = $$(opts.enabled) ?? true
        const margin = finite($$(opts.margin), 8)
        const max = finite($$(opts.max), 96)
        const withinSel = $$(opts.within) ?? ''
        const ignoreSel = $$(opts.ignore) ?? ''
        const el = $$(ref)
        if (!enabled || !el) return

        // The widget shell: from the element, climb through its shadow host and any
        // wrapping custom elements. The first plain-DOM element ends the climb — from
        // there on it is the outside world (a container, the page). A bare light-DOM
        // element is its own shell.
        let base: HTMLElement = el
        // A tag name with a dash is a custom element, hence an HTMLElement.
        for (let p: Element | null = composedParent(base); p && p.tagName.includes('-'); p = composedParent(base)) base = p as HTMLElement

        const isSelf = (hit: Element): boolean => {
            for (let n: Node | null = hit; n; n = n instanceof ShadowRoot ? n.host : n.parentNode)
                if (n === base || n === el) return true
            return false
        }

        /** A custom-element host that paints nothing of its own — no background,
         *  border or shadow. Its visible content lives in children, and those paint
         *  above the host's own box (a widget button sits at a healthy z-index), so
         *  when the host itself is the topmost hit, nothing of the widget is painted
         *  there either. An inline host's line box even extends past its content on
         *  every side, so these hollow shells grab hit-tests from real geometry —
         *  a neighbouring FAB's host was "covering" a 4px strip of the dodged-to
         *  position. A shell is bookkeeping, not chrome; a host that paints counts
         *  like any element. */
        const isShell = (hit: Element): boolean => {
            if (!hit.tagName.includes('-')) return false
            const cs = getComputedStyle(hit)
            return cs.backgroundColor === 'rgba(0, 0, 0, 0)'
                && (cs.backgroundImage === 'none' || cs.backgroundImage === '')
                && cs.borderTopWidth === '0px' && cs.borderRightWidth === '0px'
                && cs.borderBottomWidth === '0px' && cs.borderLeftWidth === '0px'
                && cs.boxShadow === 'none'
        }

        /**
         * Park the element at an offset from home, hit-test its real on-page
         * shape, and restore. This is the truth-teller: probed from home, a
         * candidate position reports everything that merely sits *under* it (in
         * the wild: the compass canvas, a sibling painting below the FAB) as a
         * phantom cover no dodge could ever clear; parked there, the element
         * outranks its own ground and `elementFromPoint` returns it — self, clear.
         * The park is synchronous and nothing paints in between, so the page
         * never flickers. The transition is zeroed for the moment so the park
         * lands immediately rather than starting an animation.
         *
         * undefined = clear; an Element = that cover; null = covered by something
         * we cannot name (probe point off-viewport — a probe we cannot see cannot
         * vouch).
         */
        const coverWhenAt = (dx: number, dy: number): Element | null | undefined => {
            const prevT = el.style.transition
            const prevX = el.style.transform
            el.style.transition = 'none'
            el.style.transform = dx || dy ? `translate(${dx}px, ${dy}px)` : ''
            try {
                const r = el.getBoundingClientRect()
                // Four corners plus the centre. A rounded element's border-box
                // corners lie OUTSIDE its own hit shape — at `rounded-[50%]` the
                // corner is a full radius away from any painted pixel, so a probe
                // there falls through to whatever sits under the element and
                // reads as a phantom cover. Each corner is therefore pulled
                // inside along the diagonal by its own border radius: for a
                // circle that is the inscribed square, scaled a little further
                // in to stay off the tangent; a square corner (radius 0) keeps
                // the plain 2px inset.
                const w = r.right - r.left, h = r.bottom - r.top
                // The radius belongs to the element whose rect is being probed, not
                // to its host: the shell climb's `base` carries no rounding of its
                // own, and a 0 read there puts the corner probes outside a rounded
                // element's hit shape — the floor beneath then reads as a cover at
                // every candidate, and the dodge reports `blocked` no matter what.
                const cs = getComputedStyle(el)
                // 1 − 0.9/√2: the inscribed square of a radius-r corner sits r·k in
                // from each edge; the 0.9 keeps the probe strictly inside the arc.
                const k = 1 - 0.9 / Math.SQRT2
                const rad = (v: string): [number, number] => {
                    const [a, b] = v.trim().split(/\s+/)
                    const rx = a.endsWith('%') ? parseFloat(a) / 100 * w : parseFloat(a) || 0
                    const bv = b ?? a
                    const ry = bv.endsWith('%') ? parseFloat(bv) / 100 * h : parseFloat(bv) || 0
                    return [Math.min(w / 2, rx), Math.min(h / 2, ry)]
                }
                const tl = rad(cs.borderTopLeftRadius), tr = rad(cs.borderTopRightRadius)
                const bl = rad(cs.borderBottomLeftRadius), br = rad(cs.borderBottomRightRadius)
                const cx = (n: number) => Math.min(Math.max(2, k * n), Math.max(1, w / 2 - 1))
                const cy = (n: number) => Math.min(Math.max(2, k * n), Math.max(1, h / 2 - 1))
                const pts = [
                    [r.left + cx(tl[0]), r.top + cy(tl[1])], [r.right - cx(tr[0]), r.top + cy(tr[1])],
                    [r.left + cx(bl[0]), r.bottom - cy(bl[1])], [r.right - cx(br[0]), r.bottom - cy(br[1])],
                    [(r.left + r.right) / 2, (r.top + r.bottom) / 2],
                ]
                // A modal mask outranks whatever else paints over the element: chrome
                // above the mask (a z-max back link) wins the early probe points, but
                // the element is still inside a modal session and must freeze, not
                // dodge. Scan every point; a mask hit anywhere wins over a plain cover
                // found earlier.
                let first: Element | null = null
                for (const [x, y] of pts) {
                    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return null
                    const hit = deepElementFromPoint(x, y)
                    if (!hit) return null
                    if (isSelf(hit) || isShell(hit)) continue
                    if (composedClosest(hit, ignoreSel)) continue
                    if (isMask(hit)) return hit
                    if (!first) first = hit
                }
                return first ?? undefined
            } finally {
                el.style.transition = prevT
                el.style.transform = prevX
            }
        }

        /** The cover's background actually paints (Tailwind's `bg-black/30` does). */
        const paints = (cs: CSSStyleDeclaration): boolean => {
            const m = cs.backgroundColor.match(/rgba?\(([^)]*)\)/)
            if (!m) return cs.backgroundColor !== '' && cs.backgroundColor !== 'transparent'
            const parts = m[1].split(/[,/ ]+/).map(parseFloat).filter(n => !isNaN(n))
            return (parts.length >= 4 ? parts[3] : 1) > 0
        }

        /**
         * A modal mask is a cover you must NOT dodge — the FAB holds still under it.
         * Exact signals first (walk the composed tree): `aria-modal`, `role="dialog"`,
         * an open `<dialog>`. Then the geometric fallback for unmarked overlays:
         * positioned, ~the whole viewport, and painted — wui's own image dialogs
         * (`fixed inset-0 z-[1200] bg-black/30`) also carry the exact markers now.
         */
        const isMask = (cover: Element): boolean => {
            for (let n: Node | null = cover; n; n = n instanceof ShadowRoot ? n.host : n.parentNode) {
                if (!(n instanceof Element)) continue
                if (n.getAttribute('aria-modal') === 'true' || n.getAttribute('role') === 'dialog') return true
                if (n.tagName === 'DIALOG' && n.hasAttribute('open')) return true
            }
            const cs = getComputedStyle(cover)
            if (cs.position !== 'fixed' && cs.position !== 'absolute') return false
            const r = cover.getBoundingClientRect()
            return r.width >= innerWidth * 0.9 && r.height >= innerHeight * 0.9 && paints(cs)
        }

        const paddingBox = (e: Element): Rect => {
            const r = e.getBoundingClientRect()
            const cs = getComputedStyle(e)
            return {
                left: r.left + (parseFloat(cs.borderLeftWidth) || 0),
                top: r.top + (parseFloat(cs.borderTopWidth) || 0),
                right: r.right - (parseFloat(cs.borderRightWidth) || 0),
                bottom: r.bottom - (parseFloat(cs.borderBottomWidth) || 0),
            }
        }

        // The stay-inside boundary: an `overflow: hidden` container clips a FAB past
        // its edge away entirely, so candidates are clamped to it before testing.
        const boundary = (): Rect => {
            const w = composedClosest(base, withinSel)
            if (w) return paddingBox(w)
            const op = base.offsetParent
            if (op) return paddingBox(op)
            return { left: 0, top: 0, right: innerWidth, bottom: innerHeight }   // fixed or detached
        }

        let curDx = 0
        let curDy = 0
        let patched = false
        let savedTransition = ''
        let savedTransform = ''

        const apply = (dx: number, dy: number) => {
            if (dx === curDx && dy === curDy) return
            curDx = dx
            curDy = dy
            if (!patched) {
                patched = true
                savedTransition = el.style.transition
                savedTransform = el.style.transform
                // The dodge moves through a transition of its own: neither forcing
                // motion on a host that suppressed it (inline `transition: none`), nor
                // inheriting that suppression, nor dropping what the host already
                // animates. Inline style wins over classes, so the *computed* value is
                // the truth; and when nothing there animates (`all 0s` — the computed
                // default) extending it costs the host nothing.
                if (el.style.transition !== 'none') {
                    const t = getComputedStyle(el).transition
                    if (t && t !== 'none') {
                        const animates = t.split(',').map(g => g.trim()).filter(Boolean).some(g => {
                            const toks = g.split(/\s+/)
                            return (toks[0] === 'all' || toks[0] === 'transform')
                                && toks.some(tok => /^[\d.]+m?s$/.test(tok) && parseFloat(tok) > 0)
                        })
                        if (!animates) el.style.transition = t + ', transform 0.25s ease'
                    } else if (t !== 'none') {
                        el.style.transition = 'transform 0.25s ease'
                    }
                }
            }
            el.style.transform = dx || dy ? `translate(${dx}px, ${dy}px)` : ''
        }

        /** True while the dodge transition is still travelling — a probe then would
         *  measure a rect that is neither home nor destination. */
        const inFlight = (): boolean => {
            const t = getComputedStyle(el).transform
            if (!t || t === 'none') return false
            const nums = t.match(/-?[\d.]+/g)?.map(Number) ?? []
            if (nums.length < 6) return false
            const [px, py] = nums.length >= 16 ? [nums[12], nums[13]] : [nums[4], nums[5]]
            return Math.abs(px - curDx) > 1 || Math.abs(py - curDy) > 1
        }

        const commit = (covered: boolean, by: Element | null, blocked: boolean, maskUp: boolean) => {
            const prev = state()
            if (prev.covered === covered && prev.by === by && prev.dx === curDx && prev.dy === curDy
                && prev.blocked === blocked && prev.maskUp === maskUp) return
            const next: OcclusionState = { covered, by, dx: curDx, dy: curDy, blocked, maskUp }
            state(next)
            const cb = $$(opts.onAvoid, false)
            if (typeof cb === 'function') cb(next)
        }

        /** The first in-budget, boundary-clamped, probe-verified clear position —
         *  `null` when there is none. Siblings count as obstacles: the probe is the
         *  judge, not the geometry. */
        const findDodge = (home: Rect, cover: Rect): [number, number] | null => {
            const b = boundary()
            const dyDown = Math.ceil(cover.bottom + margin - home.top)
            const dyUp = -Math.ceil(home.bottom - (cover.top - margin))
            const dxLeft = -Math.ceil(home.right - (cover.left - margin))
            const dxRight = Math.ceil(cover.right + margin - home.left)
            // Offsets that keep the home box inside the boundary.
            const xLo = b.left - home.left, xHi = b.right - home.right
            const yLo = b.top - home.top, yHi = b.bottom - home.bottom
            const seen = new Set<string>()
            for (const [ux, uy] of DIRS) {
                let dx = ux > 0 ? dxRight : ux < 0 ? dxLeft : 0
                let dy = uy > 0 ? dyDown : uy < 0 ? dyUp : 0
                if (Math.max(Math.abs(dx), Math.abs(dy)) > max) continue    // beyond budget: not generated
                // Clamp inside the boundary, then let the probe judge: a candidate
                // clamped into a still-covered spot fails `coverWhenAt` like any other.
                dx = Math.round(xLo <= xHi ? Math.min(Math.max(dx, xLo), xHi) : (xLo + xHi) / 2)
                dy = Math.round(yLo <= yHi ? Math.min(Math.max(dy, yLo), yHi) : (yLo + yHi) / 2)
                const key = dx + ',' + dy
                if (seen.has(key)) continue
                seen.add(key)
                if (coverWhenAt(dx, dy) === undefined)
                    return [dx, dy]
            }
            return null
        }

        const probe = () => {
            if (!el.isConnected) return
            if (inFlight()) return               // the settle probes judge the landing
            const r = el.getBoundingClientRect()
            if (r.width === 0 && r.height === 0) return
            // Home is where the host placed us: the current rect with our own
            // displacement removed.
            const home: Rect = { left: r.left - curDx, top: r.top - curDy, right: r.right - curDx, bottom: r.bottom - curDy }
            const cover = coverWhenAt(0, 0)
            if (cover === undefined) {
                if (curDx || curDy) apply(0, 0)  // clear — animate back home
                commit(false, null, false, false)
                return
            }
            if (cover && isMask(cover)) {
                // A modal mask is a cover by design. Hold the offset, stop searching;
                // the next re-probe (mask gone) restores or dodges as needed.
                commit(true, cover, false, true)
                return
            }
            const dodge = cover ? findDodge(home, cover.getBoundingClientRect()) : null
            if (dodge) {
                apply(dodge[0], dodge[1])
                commit(true, cover, false, false)
            } else {
                // Nothing in budget is clear. Stay put, say so, search no further
                // until the next re-probe.
                commit(true, cover, true, false)
            }
        }

        let raf = 0
        let settle: number[] = []
        const schedule = () => {
            if (raf) return
            raf = requestAnimationFrame(() => {
                raf = 0
                probe()
                settle.forEach(clearTimeout)
                // A host CSS transition (300ms) is mid-flight the moment a trigger
                // fires; re-probe past its settling, cheaply.
                settle = [120, 240, 400].map(ms => setTimeout(probe, ms))
            })
        }

        window.addEventListener('resize', schedule, { passive: true })
        document.addEventListener('scroll', schedule, { capture: true, passive: true })

        const ro = new ResizeObserver(schedule)
        ro.observe(el)
        const boundEl = composedClosest(base, withinSel) ?? base.offsetParent
        if (boundEl) ro.observe(boundEl)

        // Late-mounting chrome, and display-flipped overlays: childList catches the
        // mount, `style`/`class` the flip — the gating pattern wui's own dialogs use.
        // (A MutationObserver does not cross shadow boundaries; shadow-internal
        // changes are covered by the resize/scroll observers and the settle burst.)
        // Records on the element itself are the probe's own park/restore and the
        // applied dodge — feeding those back would make every probe schedule the
        // next, forever.
        const mo = new MutationObserver(muts => { if (muts.some(m => m.target !== el)) schedule() })
        mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] })

        schedule()

        return () => {
            if (raf) cancelAnimationFrame(raf)
            settle.forEach(clearTimeout)
            window.removeEventListener('resize', schedule)
            document.removeEventListener('scroll', schedule, { capture: true })
            ro.disconnect()
            mo.disconnect()
            if (patched) {
                el.style.transition = savedTransition
                el.style.transform = savedTransform
            }
        }
    })

    return state
}

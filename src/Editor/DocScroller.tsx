/**
 * DocScroller.tsx — the navigation rail beside the editor, and the button that shows it.
 *
 * A long document has two navigation problems and they are not the same problem, so this
 * file answers them with two different panels and picks between them by layout mode.
 *
 *   page    thumbnails. Once a document has been cut into sheets, the sheet IS the unit a
 *           reader thinks in — "the table is on page 4" — so the rail draws one miniature
 *           per sheet and jumps to it. The miniatures are WIREFRAMES, not copies; see below.
 *
 *   flow    a fisheye map. There are no pages to count, so the rail lists the document's
 *   screen  top-level blocks instead, one thin row each, and magnifies the few under the
 *           pointer into readable text. That is the point of a fisheye: the overview and
 *           the detail are the same strip, so finding a paragraph never costs you the sense
 *           of where it sits in the whole.
 *
 * ## Wireframes, not clones
 *
 * The obvious thumbnail is `sheet.cloneNode(true)` shrunk down, and it is wrong here for
 * the reason PageLayout gives for never cloning: a custom element is its tag plus its
 * attributes, so a clone is not a cheap copy of something already rendered — it is a
 * SECOND component that constructs itself from scratch and re-resolves every
 * context-sensitive attribute against wherever the copy landed. A rail of twenty
 * thumbnails would be twenty extra live copies of every banner, image and table in the
 * document.
 *
 * So a thumbnail is measured instead: each top-level block on the sheet contributes one
 * rectangle at its own fractional position, tinted by what kind of block it is. The
 * measurements are RATIOS of the sheet's own box, which makes them immune to the `zoom`
 * the surface is under — the same trick PageLayout's overflow test uses.
 *
 * ## The lens does not move the rows
 *
 * The classic fisheye grows the row under the pointer, which moves its neighbours, which
 * puts a different row under the pointer, which grows THAT one — dock-icon jitter. Here
 * the rows are a fixed height and the magnification is typographic: type size, bar and
 * contrast grow, vertical position never does. So the row under the pointer is the row you
 * clicked, the map from rail position to document position stays linear, and there is no
 * feedback loop to damp.
 *
 * @example
 * ```tsx
 * <ScrollerToggle />   // in the toolbar
 * <DocScroller />      // beside the editor surface
 * ```
 */

import { $, $$, customElement, defaults, ElementAttributes, HtmlClass, JSX, useEffect } from 'woby'
import { Button } from '../Button'
import { editorLayout } from './LayoutSwitch'
import { Layout, PAGE_ATTR, PAGE_CHROME_ATTR, pageMetrics } from './PageLayout'

/**
 * Whether the rail is showing. Module-level for the same reason {@link editorLayout} is:
 * the toolbar button and the rail are in different subtrees of the editor and neither is
 * the other's parent, so a prop could not reach across.
 */
export const scrollerOpen = $(false)

/** Flip the rail. Exported so a host's own chrome can drive it. */
export const toggleScroller = () => scrollerOpen(!$$(scrollerOpen))

/* ── what a block looks like from a long way off ───────────────────────────
   Six kinds, because six is about what anyone can tell apart at thumbnail size. The colour
   is not there to name the element — it is there to make "the page with the picture on it"
   findable without reading anything. */

type Kind = 'heading' | 'text' | 'media' | 'table' | 'component' | 'break'

const TINT: Record<Kind, string> = {
    heading: '#475569',
    text: '#cbd5e1',
    media: '#60a5fa',
    table: '#a78bfa',
    component: '#34d399',
    break: '#f59e0b',
}

const kindOf = (el: HTMLElement): Kind => {
    const t = el.tagName
    if (/^H[1-6]$/.test(t)) return 'heading'
    if (t === 'HR') return 'break'
    if (t === 'IMG' || t === 'FIGURE' || el.querySelector?.('img')) return 'media'
    if (t === 'TABLE' || el.querySelector?.('table')) return 'table'
    // Custom elements are the editor's plugin blocks — banners, page blocks, whatever a host
    // registered. A hyphen in the tag name is the only thing that marks them, and the spec
    // guarantees it.
    if (t.includes('-')) return 'component'
    return 'text'
}

/** One measured rectangle inside a thumbnail, as fractions of the sheet's own box. */
type Box = { top: number, height: number, left: number, width: number, kind: Kind }

/** One row of the rail: a sheet in `page` mode, a top-level block everywhere else. */
type Entry = {
    el: HTMLElement
    kind: Kind
    /** Page number in `page` mode; the block's opening words elsewhere. */
    text: string
    boxes: Box[]
}

/* ── the lens ──────────────────────────────────────────────────────────────
   A gaussian, so the falloff is smooth and leaves no edge for the eye to catch. SIGMA is in
   rows: at 2.2 the lens covers about five, enough to read a heading and the paragraph under
   it without the rail turning back into a list. */
const SIGMA = 2.2
const weightAt = (i: number, focus: number) =>
    focus < 0 ? 0 : Math.exp(-((i - focus) ** 2) / (2 * SIGMA * SIGMA))

/** Row height in the fisheye, px. Fixed — see the header. */
const ROW_H = 16

/** Thumbnail width in `page` mode, px. Height follows the configured paper's aspect. */
const THUMB_W = 104

/**
 * Find the editor surface from anywhere in the rail's neighbourhood.
 *
 * The same walk ImageResizer does, and for the same reason: the rail may be a sibling of
 * the surface, a cousin one wrapper out, or a free-standing custom element the host placed
 * itself. Climbing until an ancestor contains a `[data-editor-root]` covers all three
 * without any of them having to agree on a structure first.
 */
const findSurface = (from: HTMLElement | null | undefined): HTMLElement | null => {
    let p = from?.parentElement
    while (p) {
        const s = p.querySelector('[data-editor-root]') as HTMLElement | null
        if (s) return s
        p = p.parentElement
    }
    return null
}

const def = () => ({
    cls: $('', HtmlClass) as JSX.Class,
    class: $('', HtmlClass) as JSX.Class,
})

const DocScroller = defaults(def, (props) => {
    const { cls, class: cn } = props

    const entries = $<Entry[]>([])
    /** Index of the entry at the top of the viewport. Drives the highlight. */
    const active = $(-1)
    /** Fractional row index under the pointer, or -1 when the pointer is away. */
    const focus = $(-1)

    const railRef = $<HTMLDivElement>(null as any)

    /**
     * The row elements, by index, so the highlighted one can be kept in sight.
     *
     * Indices rather than a map keyed on the entry: the entries are rebuilt wholesale by
     * every scan, and an index is the one thing that survives that and still matches what
     * `active` holds. Stale slots are harmless -- the reader checks `isConnected`.
     */
    const rowEls: HTMLElement[] = []

    const paged = () => $$(editorLayout) === Layout.page

    /**
     * Jump to an entry.
     *
     * `scrollIntoView` rather than arithmetic on `scrollTop`: the surface carries a CSS
     * `zoom`, and the relationship between a zoomed element's scroll offset and the rects
     * measured inside it is exactly the thing not worth re-deriving. The browser knows.
     */
    const goTo = (entry: Entry, i: number) => {
        active(i)
        entry.el.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }

    /** Which entry sits at the top of the surface's viewport. */
    const syncActive = (root: HTMLElement | null) => {
        const list = $$(entries)
        if (!root || !list.length) { active(-1); return }
        const top = root.getBoundingClientRect().top
        let best = 0
        let bestD = Infinity
        list.forEach((e, i) => {
            const d = Math.abs(e.el.getBoundingClientRect().top - top)
            if (d < bestD) { bestD = d; best = i }
        })
        active(best)
    }

    /* ── measuring ──────────────────────────────────────────────────────── */

    const scan = (root: HTMLElement | null) => {
        if (!root) { entries([]); return }

        if (paged()) {
            const sheets = Array.from(root.querySelectorAll<HTMLElement>(`[${PAGE_ATTR}]`))
            entries(sheets.map((sheet, i) => {
                const sr = sheet.getBoundingClientRect()
                const w = sr.width || 1
                const h = sr.height || 1
                const boxes = Array.from(sheet.children)
                    .filter(c => !(c as HTMLElement).hasAttribute?.(PAGE_CHROME_ATTR))
                    .map(c => {
                        const el = c as HTMLElement
                        const r = el.getBoundingClientRect()
                        return {
                            top: (r.top - sr.top) / h,
                            // A floor on each, so a one-line paragraph is still a visible
                            // mark rather than a sub-pixel nothing.
                            height: Math.max(r.height / h, 0.005),
                            left: (r.left - sr.left) / w,
                            width: Math.max(r.width / w, 0.02),
                            kind: kindOf(el),
                        }
                    })
                    .filter(b => b.top >= -0.05 && b.top < 1.05)
                return { el: sheet, kind: 'text' as Kind, text: String(i + 1), boxes }
            }))
        } else {
            const kids = Array.from(root.children) as HTMLElement[]
            entries(kids
                .filter(el => el.nodeType === 1 && el.offsetHeight > 0)
                .map(el => ({
                    el,
                    kind: kindOf(el),
                    // Enough to recognise a paragraph by, not enough to make the lens a
                    // reading pane. The rail is for finding, not for reading.
                    text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120)
                        || el.tagName.toLowerCase(),
                    boxes: [],
                })))
        }
        syncActive(root)
    }

    /* ── staying in step with the document ──────────────────────────────── */

    useEffect(() => {
        const rail = $$(railRef)
        // Read both so closing the rail tears the observers down and opening it rebuilds
        // them: a panel nobody can see has no business measuring anything.
        const open = $$(scrollerOpen)
        $$(editorLayout)
        if (!rail || !open) { entries([]); return }

        const root = findSurface(rail)
        if (!root) return

        let timer: any = null
        const later = () => {
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => { timer = null; scan(root) }, 200)
        }

        // Debounced, for the reason PageLayout gives about re-measuring between keystrokes.
        // This pass only reads, so it cannot disturb pagination — but it is not free.
        const mo = new MutationObserver(later)
        mo.observe(root, { childList: true, subtree: true, characterData: true })

        const onScroll = () => syncActive(root)
        root.addEventListener('scroll', onScroll, { passive: true })

        // The first pass waits a frame: in `page` mode the sheets are assembled after the
        // mode switch returns, and a scan that beats them finds an empty document.
        const raf = requestAnimationFrame(() => scan(root))

        return () => {
            mo.disconnect()
            root.removeEventListener('scroll', onScroll)
            cancelAnimationFrame(raf)
            if (timer) clearTimeout(timer)
        }
    })

    /* ── pointer ────────────────────────────────────────────────────────── */

    useEffect(() => {
        const el = $$(railRef)
        if (!el) return

        // Pointer events, not mouse: one path covers mouse, pen and finger, and a dragged
        // finger sweeps the lens exactly the way a moved mouse does.
        const onMove = (e: PointerEvent) => {
            if (paged()) return
            const b = el.getBoundingClientRect()
            const f = (e.clientY - b.top + el.scrollTop) / ROW_H - 0.5
            // Quantised: every row's style is a function of this, so a raw pixel stream
            // would recompute the whole strip several times per row crossed.
            const q = Math.round(f * 5) / 5
            if (q !== $$(focus)) focus(q)
        }
        const onLeave = () => focus(-1)

        const onDown = (e: PointerEvent) => {
            if (paged()) return
            const b = el.getBoundingClientRect()
            const list = $$(entries)
            // Rows are a fixed height, so the row under the pointer is arithmetic rather
            // than a hit test — and it agrees with what is drawn there, because the lens
            // never moves a row.
            const i = Math.floor((e.clientY - b.top + el.scrollTop) / ROW_H)
            if (i >= 0 && i < list.length) goTo(list[i], i)
        }

        // The rail must never take the caret out of the surface: the whole point of jumping
        // to a page is to carry on editing when you arrive. Assigned natively rather than
        // bound through JSX because woby's delegation does not reach into a shadow root,
        // which is where the editor lives.
        const hold = (e: Event) => { e.preventDefault(); e.stopPropagation() }

        el.addEventListener('mousedown', hold)
        el.addEventListener('pointermove', onMove)
        el.addEventListener('pointerleave', onLeave)
        el.addEventListener('pointerdown', onDown)
        return () => {
            el.removeEventListener('mousedown', hold)
            el.removeEventListener('pointermove', onMove)
            el.removeEventListener('pointerleave', onLeave)
            el.removeEventListener('pointerdown', onDown)
        }
    })

    /* ── drawing ────────────────────────────────────────────────────────── */

    const thumbH = () => {
        const m = pageMetrics()
        return Math.round(THUMB_W * (m.height / (m.width || 1)))
    }

    const Thumbnails = () => <>
        {() => $$(entries).map((e, i) =>
            <div
                ref={(el: HTMLElement) => { if (el) { rowEls[i] = el; el.onclick = () => goTo(e, i) } }}
                style={() => ({
                    marginBottom: '10px',
                    cursor: 'pointer',
                    outline: $$(active) === i ? '2px solid #2563eb' : '1px solid #cbd5e1',
                })}
            >
                <div style={() => ({
                    position: 'relative',
                    width: `${THUMB_W}px`,
                    height: `${thumbH()}px`,
                    background: '#ffffff',
                    overflow: 'hidden',
                })}>
                    {e.boxes.map(b =>
                        <div style={{
                            position: 'absolute',
                            top: `${b.top * 100}%`,
                            left: `${b.left * 100}%`,
                            width: `${b.width * 100}%`,
                            height: `${b.height * 100}%`,
                            background: TINT[b.kind],
                            borderRadius: '1px',
                        }} />
                    )}
                </div>
                <div style={() => ({
                    textAlign: 'center',
                    fontSize: '10px',
                    lineHeight: '14px',
                    color: $$(active) === i ? '#2563eb' : '#64748b',
                })}>{e.text}</div>
            </div>
        )}
    </>

    const Fisheye = () => <>
        {() => $$(entries).map((e, i) =>
            <div
                ref={(el: HTMLElement) => { if (el) rowEls[i] = el }}
                style={() => ({
                // Fixed height. The magnification is type and contrast, never the row box —
                // see the header.
                height: `${ROW_H}px`,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0 4px',
                cursor: 'pointer',
                background: $$(active) === i
                    ? '#dbeafe'
                    : (weightAt(i, $$(focus)) > 0.5 ? '#f1f5f9' : 'transparent'),
            })}>
                <div style={() => {
                    const w = weightAt(i, $$(focus))
                    return {
                        flex: '0 0 auto',
                        width: `${4 + w * 4}px`,
                        height: `${3 + w * 6}px`,
                        borderRadius: '1px',
                        background: TINT[e.kind],
                    }
                }} />
                <div style={() => {
                    const w = weightAt(i, $$(focus))
                    return {
                        flex: '1 1 auto',
                        minWidth: '0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        // Under the lens the words are legible; away from it the row is a
                        // grey tick that still says where the block is and how long it runs.
                        fontSize: `${5 + w * 6}px`,
                        lineHeight: `${ROW_H}px`,
                        color: w > 0.35 ? '#0f172a' : '#94a3b8',
                    }
                }}>{e.text}</div>
            </div>
        )}
    </>

    /**
     * Keep the highlighted row in sight.
     *
     * The rail is no taller than the editor now, so a forty-page document puts most of its
     * thumbnails out of view -- and the one worth looking at is the page being edited.
     * Scrolling the surface used to move the highlight to somewhere the author could not
     * see, which is a map that stops saying where you are.
     *
     * Written as arithmetic on the rail's own `scrollTop` rather than `scrollIntoView`:
     * that call walks every scrollable ancestor, so nudging a thumbnail would also scroll
     * the page -- and in `screen` mode, the surface itself -- out from under the author.
     * `goTo` can afford `scrollIntoView` because moving the document *is* its job.
     */
    useEffect(() => {
        const rail = $$(railRef)
        const i = $$(active)
        // Read so a rescan re-reveals: the rows are rebuilt and the old boxes are gone.
        $$(entries)
        const row = rowEls[i]
        if (!rail || !row || !row.isConnected) return
        const rb = rail.getBoundingClientRect()
        const b = row.getBoundingClientRect()
        // `nearest` semantics, by hand: a row already in view is left exactly where it is,
        // so an author reading down the rail is not dragged back to the top by a scroll
        // that happened to cross a page boundary.
        if (b.top < rb.top) rail.scrollTop += b.top - rb.top
        else if (b.bottom > rb.bottom) rail.scrollTop += b.bottom - rb.bottom
    })

    /*
     * Two boxes, and the split is the point.
     *
     * The outer one is the flex item: it owns the width, the margins and the rule, and it
     * stretches to the row like every other item. The inner one is the scroller, taken out
     * of flow so that its content has no say in how tall the rail is.
     *
     * A single box could not do both. The row is `items-stretch`, and a line's height is the
     * tallest thing in it -- so a rail holding forty thumbnails made the row forty
     * thumbnails tall, the editor column stretched to match, and the page grew a scrollbar
     * for a panel rather than for the document. Measured at 1555px of rail beside 752px of
     * editor. Absolutely positioning the content leaves the outer box with nothing to be
     * tall for, so the editor sets the height and the thumbnails scroll inside it.
     *
     * Reactive style, not Tailwind classes: the build-time class scan does not read the
     * shadow DOM, so both the visibility and the geometry have to be something the browser
     * can act on without a stylesheet having heard of them.
     */
    return <div
        style={() => ({
            display: $$(scrollerOpen) ? 'block' : 'none',
            position: 'relative',
            alignSelf: 'stretch',
            flex: '0 0 auto',
            width: paged() ? `${THUMB_W + 24}px` : '188px',
            margin: '1rem 0',
            borderLeft: '1px solid #e2e8f0',
        })}
        class={() => [() => $$(cls) ? $$(cls) : $$(cn)]}
    >
        <div
            ref={railRef}
            style={() => ({
                position: 'absolute',
                top: '0',
                right: '0',
                bottom: '0',
                left: '0',
                padding: paged() ? '8px 10px 8px 8px' : '4px 0',
                overflowY: 'auto',
                overflowX: 'hidden',
                overscrollBehavior: 'contain',
                scrollbarWidth: 'thin',
                touchAction: 'pan-y',
                userSelect: 'none',
            })}
        >
            {() => paged() ? <Thumbnails /> : <Fisheye />}
        </div>
    </div>
})

/* ── the toggle ────────────────────────────────────────────────────────── */

const toggleDef = () => ({
    cls: $('', HtmlClass) as JSX.Class,
    class: $('', HtmlClass) as JSX.Class,
})

/**
 * The toolbar button. Its tooltip names whichever panel the current mode would show, so the
 * one control does not have to pretend the two panels are the same thing.
 */
const ScrollerToggle = defaults(toggleDef, (props) => {
    const { cls, class: cn } = props

    return <Button
        type="text"
        title={() => $$(editorLayout) === Layout.page ? 'Page thumbnails' : 'Document map'}
        class={() => [
            () => $$(cls) ? $$(cls) : $$(cn),
            () => $$(scrollerOpen) ? '!bg-slate-200' : '',
        ]}
        onClick={() => toggleScroller()}
        onMouseDown={(e: any) => { e.preventDefault(); e.stopPropagation() }}
    >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
            <rect x="1.5" y="2" width="13" height="12" rx="1.5" />
            <line x1="10" y1="2" x2="10" y2="14" />
            <line x1="11.5" y1="5" x2="13" y2="5" />
            <line x1="11.5" y1="8" x2="13" y2="8" />
            <line x1="11.5" y1="11" x2="13" y2="11" />
        </svg>
    </Button>
})

export { DocScroller, ScrollerToggle }

customElement('wui-doc-scroller', DocScroller)
customElement('wui-scroller-toggle', ScrollerToggle)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-doc-scroller': ElementAttributes<typeof DocScroller>
            'wui-scroller-toggle': ElementAttributes<typeof ScrollerToggle>
        }
    }
}

export default DocScroller

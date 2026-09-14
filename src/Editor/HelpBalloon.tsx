/** @jsxImportSource woby */

import { $, $$, JSX, useEffect } from 'woby'
import { t } from '../i18n'
import {
    HelpStep,
    HelpPlacement,
} from './EditorHelpStep'

/**
 * # The balloon — one positioned card + arrow + spotlight cutout.
 *
 * Two pieces of DOM:
 *
 * - A **spotlight** `<div>` absolutely positioned over the anchor with a huge
 *   `box-shadow` cutout and `pointer-events: none`. The user clicks the real
 *   control underneath; the cutout is decoration, never a hit target.
 * - A **balloon** card with the title, the body, Back/Next/Skip buttons, and
 *   an arrow. Positioned against the anchor, clamped to the surface's box,
 *   re-measured on resize and on every step change.
 *
 * Re-measurement strategy:
 *
 * - On mount and on step change, `getBoundingClientRect()` is called on both
 *   the surface and the anchor. Subtracting gives a surface-relative offset.
 * - A `ResizeObserver` on the anchor catches toolbar wraps (§6 in the handoff).
 * - `window`'s resize and the surface's own scroll listener reposition too.
 *
 * `title` and `body` are thunks (`() => string`) and are read inside the
 * render — re-read on every pass, so a host catalogue can swap strings under
 * the balloon when `locale` changes.
 *
 * The arrow direction is a function of which side of the anchor the balloon
 * ended up on — `bottom` (default) draws the arrow on the card's top edge,
 * `top` on the bottom edge, and so on.
 */

/** Geometry the balloon and its arrow share. */
interface BalloonGeom {
    /** Anchor's box, in surface coordinates. */
    ax: number
    ay: number
    aw: number
    ah: number
    /** Balloon's box, in surface coordinates. */
    bx: number
    by: number
    bw: number
    bh: number
    /** Side the balloon is on relative to the anchor. */
    side: 'top' | 'bottom' | 'left' | 'right'
    /**
     * Whether to draw the arrow. False when the card is centred rather than
     * placed beside the anchor — either because the step has no anchor at
     * all, or because the anchor fills the visible area and there is no side
     * to sit on. An arrow in those cases points at nothing in particular.
     */
    arrow: boolean
}

/** A step rendered to nothing but the values the balloon needs. */
export interface Resolved {
    step: HelpStep
    anchor: HTMLElement | null
}

export interface HelpBalloonProps {
    /** The step to render, plus its resolved anchor (null = render centred). */
    resolved: Resolved
    /** The surface the balloon and spotlight are positioned inside. */
    surface: HTMLElement
    /**
     * The element the card is absolutely positioned inside — the tour
     * wrapper. Offsets are taken against its box; the surface is used only
     * for clamping. `null` on the very first paint, before the wrapper's
     * ref has stamped; the gate then falls back to the surface as the
     * positioning origin and re-runs when the ref lands.
     */
    container: HTMLElement | null
    /** Total step count for the "X of N" footer. */
    total: number
    /** Zero-based index, for the footer. */
    index: number
    /** Handlers — wired by the tour. */
    onBack: () => void
    onNext: () => void
    onSkip: () => void
}

/** Default balloon dimensions — measured once on first paint, then cached. */
const BALLOON_DEFAULT = { width: 320, gap: 8, arrow: 8 }

/**
 * Compute the balloon's box given the anchor, the surface, and the container
 * the card is positioned inside.
 *
 * The card is `position: absolute` inside the tour wrapper, which spans the
 * whole editor container — bigger than the surface by its margins (the
 * surface carries `my-4`). Offsets are therefore taken against the
 * container, while the clamp keeps the card inside the surface box *clipped
 * to the window* — the part of the container the user is actually looking at.
 *
 * `placement` is a preference, not a constraint: `'auto'` picks the side
 * with the most room, defaulting to `bottom`. When the anchor does not
 * resolve, the balloon is centred on the surface with no arrow.
 *
 * `container` may be `null` on the first paint, before the wrapper's ref
 * has stamped — fall back to the surface, which is off by only the margins,
 * and the gate re-runs the moment the ref lands.
 */
const computeGeom = (
    surface: HTMLElement,
    container: HTMLElement | null,
    anchor: HTMLElement | null,
    placement: HelpPlacement,
): BalloonGeom | null => {
    const cr = (container ?? surface).getBoundingClientRect()
    const sr = surface.getBoundingClientRect()
    const ar = anchor ? anchor.getBoundingClientRect() : null

    // The box the card must stay *clear* of. An anchor inside a floating
    // overlay — the property panel is the one that exists today — is a small
    // control near that overlay's edge, so "beside the anchor" and "on top of
    // the overlay" are the same place. Pointing at the Delete button by
    // covering the panel that contains it is not a coachmark, it is a blindfold.
    //
    // Opt-in, via `data-help-clear` on the overlay's root: the outward edge of
    // every placement is measured from this box instead of the anchor's, while
    // the cross-axis alignment and the spotlight still follow the anchor
    // exactly. When the anchor is not inside a marked overlay — every toolbar
    // and surface step — `kr` *is* `ar` and the arithmetic below is unchanged.
    //
    // `closest` does not cross shadow boundaries, which is correct here: the
    // panel and its parts live in the same root, and an anchor in a *different*
    // root is not inside this overlay in any sense that matters.
    const kr = (anchor?.closest('[data-help-clear]') as HTMLElement | null)?.getBoundingClientRect() ?? ar

    // The box the card may occupy: the surface *unioned with the anchor*,
    // clipped to the window, in container coordinates. Every placement is
    // measured and clamped against this, not against the surface alone.
    //
    // Two separate failures make each half of that necessary. The surface
    // scrolls and is routinely several screens tall, so clipping to the window
    // is what stops a card from landing entirely below the fold — or, when the
    // anchor *is* the surface and no side has room, from being pushed clean off
    // the left edge. The union is what handles an anchor outside the surface
    // box: the property panel is `position: fixed` against the viewport's right
    // edge and can sit well clear of the document, and clamping a panel step to
    // the surface would drag its card back across the page, away from the
    // control it is describing. Both failures read to the user as "the button
    // did nothing".
    const boxL = Math.max(kr ? Math.min(sr.left, kr.left) : sr.left, 0)
    const boxT = Math.max(kr ? Math.min(sr.top, kr.top) : sr.top, 0)
    const boxR = Math.min(kr ? Math.max(sr.right, kr.right) : sr.right, window.innerWidth)
    const boxB = Math.min(kr ? Math.max(sr.bottom, kr.bottom) : sr.bottom, window.innerHeight)
    const vx = boxL - cr.left
    const vy = boxT - cr.top
    const vw = boxR - boxL
    const vh = boxB - boxT

    /** Centre the card in the visible box — the no-room-anywhere fallback. */
    const centred = (aw: number, ah: number, ax: number, ay: number): BalloonGeom => ({
        ax, ay, aw, ah,
        bx: vx + vw / 2 - BALLOON_DEFAULT.width / 2,
        by: vy + vh / 2 - 60,
        bw: BALLOON_DEFAULT.width,
        bh: 120,
        side: 'bottom',
        arrow: false,
    })

    if (!ar) return centred(0, 0, 0, 0)

    const ax = ar.left - cr.left
    const ay = ar.top - cr.top
    const aw = ar.width
    const ah = ar.height

    // The keep-clear box in the same coordinates. Equal to the anchor's own
    // box unless the anchor sits inside a `data-help-clear` overlay.
    const kx = (kr ?? ar).left - cr.left
    const ky = (kr ?? ar).top - cr.top
    const kw = (kr ?? ar).width
    const kh = (kr ?? ar).height

    // Against the visible box, not the surface: the clamp below works in the
    // same coordinates, and a card wider than the box it is clamped into can
    // only be clamped to one edge and overflow the other.
    const bw = Math.min(BALLOON_DEFAULT.width, vw - 16)
    // We can't know `bh` until the card paints; pick a value that keeps the
    // arrow roughly aligned with the anchor's vertical centre until the real
    // height arrives on the next measure.
    const bh = 140

    const gap = BALLOON_DEFAULT.gap
    // Room per side, in container coordinates, measured to the *visible* box —
    // room that exists only below the fold is not room the card can use.
    // Measured to the keep-clear box, not the anchor: room that exists beside
    // the Delete button but underneath the panel is not room the card can use.
    const roomBelow = vy + vh - (ky + kh) - gap
    const roomAbove = ky - vy - gap
    const roomRight = vx + vw - (kx + kw) - gap
    const roomLeft = kx - vx - gap

    // An anchor that fills the visible area — the `surface` target is exactly
    // this — leaves no side to sit on. Centre over it instead of shoving the
    // card off-screen; the spotlight still marks what the step is about.
    if (roomBelow < bh && roomAbove < bh && roomRight < bw && roomLeft < bw)
        return centred(aw, ah, ax, ay)

    let side: BalloonGeom['side']
    if (placement === 'top') side = roomAbove >= bh ? 'top' : 'bottom'
    else if (placement === 'bottom') side = roomBelow >= bh ? 'bottom' : 'top'
    else if (placement === 'left') side = roomLeft >= bw ? 'left' : 'right'
    else if (placement === 'right') side = roomRight >= bw ? 'right' : 'left'
    else {
        // 'auto' — prefer below, but fall back to whichever side has room.
        if (roomBelow >= bh) side = 'bottom'
        else if (roomAbove >= bh) side = 'top'
        else if (roomRight >= bw) side = 'right'
        else side = 'left'
    }

    let bx: number
    let by: number
    switch (side) {
        // Outward edge from the keep-clear box, cross-axis from the anchor:
        // the card clears the overlay but still lines up with the control.
        case 'bottom':
            bx = ax + aw / 2 - bw / 2
            by = ky + kh + gap
            break
        case 'top':
            bx = ax + aw / 2 - bw / 2
            by = ky - bh - gap
            break
        case 'right':
            bx = kx + kw + gap
            by = ay + ah / 2 - bh / 2
            break
        case 'left':
            bx = kx - bw - gap
            by = ay + ah / 2 - bh / 2
            break
    }

    // One clamp on both axes, after the side is chosen. The per-branch clamps
    // this replaces each covered only the axis the side did *not* pin, so the
    // pinned axis could still run off the visible box.
    bx = Math.max(vx + 8, Math.min(bx, vx + vw - bw - 8))
    by = Math.max(vy + 8, Math.min(by, vy + vh - bh - 8))

    return { ax, ay, aw, ah, bx, by, bw, bh, side, arrow: true }
}

/**
 * The arrow's offset from the card's leading edge so it points at the
 * anchor's centre.
 */
const arrowOffset = (g: BalloonGeom): number => {
    if (g.side === 'bottom' || g.side === 'top') {
        return g.ax + g.aw / 2 - g.bx
    }
    return g.ay + g.ah / 2 - g.by
}

/**
 * The arrow glyph, drawn with CSS borders so it scales and themes with the
 * card. Returns the inline style for the arrow `<div>` given the side it
 * belongs to and the offset (px) from the card's leading edge to the
 * anchor's centre.
 *
 * `offset` is clamped to the card's box; the user only sees the arrow
 * shift, not stick out past the corner.
 */
const arrowStyle = (side: BalloonGeom['side'], offset: number, cardW: number, cardH: number): JSX.CSSProperties => {
    const clamped = Math.max(16, Math.min(offset, side === 'top' || side === 'bottom' ? cardW - 16 : cardH - 16))
    if (side === 'bottom') return { top: -8, left: clamped }
    if (side === 'top') return { bottom: -8, left: clamped }
    if (side === 'right') return { left: -8, top: clamped }
    return { right: -8, top: clamped }
}

/**
 * The arrow's border color, matched to the card. Drawn as a square rotated
 * 45° with two borders visible.
 */
const arrowBase = (side: BalloonGeom['side']): JSX.CSSProperties => {
    const base: JSX.CSSProperties = {
        position: 'absolute',
        width: 16,
        height: 16,
        background: 'white',
        transform: 'rotate(45deg)',
        pointerEvents: 'none',
    }
    if (side === 'bottom') { base.borderLeft = '1px solid #e5e7eb'; base.borderTop = '1px solid #e5e7eb' }
    else if (side === 'top') { base.borderRight = '1px solid #e5e7eb'; base.borderBottom = '1px solid #e5e7eb' }
    else if (side === 'right') { base.borderTop = '1px solid #e5e7eb'; base.borderLeft = '1px solid #e5e7eb' }
    else { base.borderBottom = '1px solid #e5e7eb'; base.borderRight = '1px solid #e5e7eb' }
    return base
}

/** Plain button styling — the balloon is not a toolbar button and should not
 *  inherit `CommandButton`'s look. */
const btnStyle = (primary: boolean): JSX.CSSProperties => ({
    appearance: 'none',
    border: primary ? '1px solid #2563eb' : '1px solid #d1d5db',
    background: primary ? '#2563eb' : 'white',
    color: primary ? 'white' : '#111827',
    borderRadius: 4,
    padding: '4px 10px',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'inherit',
})

/**
 * The balloon. Pure presentation: the tour owns the index, the step list
 * and the dismissal logic. Reads `title`/`body` as thunks *inside* the
 * render, so a host catalogue can update them without the balloon being
 * rebuilt.
 */
export const HelpBalloon = (props: HelpBalloonProps): JSX.Child => {
    const { resolved, surface, container, total, index } = props

    // A tick observable that bumps on window resize / surface scroll / anchor
    // resize. Reading it inside `() => ...` is what re-runs `computeGeom`.
    const tick = $(0)

    useEffect(() => {
        const bump = () => tick(tick() + 1)
        window.addEventListener('resize', bump)
        surface.addEventListener('scroll', bump, true)
        let observer: ResizeObserver | undefined
        if (typeof ResizeObserver !== 'undefined' && resolved.anchor) {
            observer = new ResizeObserver(bump)
            observer.observe(resolved.anchor)
        }
        return () => {
            window.removeEventListener('resize', bump)
            surface.removeEventListener('scroll', bump, true)
            observer?.disconnect()
        }
    })

    return <>
        {() => {
            // Read tick to subscribe; `computeGeom` is otherwise pure on inputs.
            $$(tick)
            const g = computeGeom(surface, container, resolved.anchor, resolved.step.placement ?? 'auto')
            if (!g) return null

            const step = resolved.step
            const titleText = typeof step.title === 'function' ? step.title() : step.title
            const bodyText = typeof step.body === 'function' ? step.body() : step.body

            const offset = arrowOffset(g)
            const cardStyle: JSX.CSSProperties = {
                position: 'absolute',
                left: `${g.bx}px`,
                top: `${g.by}px`,
                width: `${g.bw}px`,
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                padding: '12px 14px',
                zIndex: 60,
                fontFamily: 'system-ui, sans-serif',
                fontSize: 13,
                color: '#111827',
                boxSizing: 'border-box',
                // The tour wrapper is `pointer-events: none` so the spotlight
                // lets a press reach the real control underneath. That value
                // inherits, so the card has to opt back *in* — without this the
                // Back/Skip/Next buttons are invisible to hit-testing and a real
                // mouse click falls straight through to the document behind.
                // `element.click()` bypasses hit-testing entirely, so this is
                // exactly the bug a synthetic-click test cannot see.
                pointerEvents: 'auto',
            }

            const arrow: JSX.CSSProperties = {
                ...arrowBase(g.side),
                ...arrowStyle(g.side, offset, g.bw, g.bh),
            }

            const footerLabel = total > 0
                ? t('editor.help.stepOf', { n: index + 1, total })
                : ''

            return <>
                {/* Spotlight. `pointer-events: none` is the whole point: the user must be
                    able to press the real button through it. The cutout is a giant box-shadow
                    on a transparent box -- the simplest shape that works for any anchor size. */}
                {(() => {
                    // A step with no anchor still needs the dim. Collapsing the
                    // cutout to 0x0 leaves the 9999px shadow covering
                    // everything, so the same element serves as a plain
                    // backdrop -- and the user gets an unmistakable signal that
                    // the tour opened, instead of a small white card lost on a
                    // white page.
                    const lit = g.aw > 0 && g.ah > 0
                    return <div
                        data-help-spotlight
                        style={{
                            position: 'absolute',
                            left: `${lit ? g.ax - 4 : g.bx + g.bw / 2}px`,
                            top: `${lit ? g.ay - 4 : g.by + 60}px`,
                            width: `${lit ? g.aw + 8 : 0}px`,
                            height: `${lit ? g.ah + 8 : 0}px`,
                            borderRadius: 6,
                            boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
                            pointerEvents: 'none',
                            zIndex: 50,
                        }}
                    />
                })()}
                <div data-help-balloon style={cardStyle}>
                    {g.arrow && <div style={arrow} />}
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{titleText}</div>
                    <div style={{ marginBottom: 10, lineHeight: 1.4 }}>{bodyText}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ color: '#6b7280', fontSize: 12 }}>{footerLabel}</span>
                        {/* `preventDefault` on mousedown, not just `stopPropagation` on
                            click: without it the press moves focus off whatever the user
                            was in. Stepping through the property panel's tour would then
                            blur the panel, and its `panelFocused` guard would let the next
                            `selectionchange` drop the target — the tour would walk itself
                            out of the panel it is describing. Keeping focus put also keeps
                            the caret and the document selection alive for the editor
                            tour's own steps. */}
                        <div style={{ display: 'flex', gap: 6 }} onMouseDown={(e: MouseEvent) => e.preventDefault()}>
                            {index > 0 && (
                                <button
                                    data-help-back
                                    style={btnStyle(false)}
                                    onClick={(e: MouseEvent) => { e.stopPropagation(); props.onBack() }}
                                >{t('editor.help.back')}</button>
                            )}
                            <button
                                data-help-skip
                                style={btnStyle(false)}
                                onClick={(e: MouseEvent) => { e.stopPropagation(); props.onSkip() }}
                            >{t('editor.help.skip')}</button>
                            <button
                                data-help-next
                                style={btnStyle(true)}
                                onClick={(e: MouseEvent) => { e.stopPropagation(); props.onNext() }}
                            >{index + 1 >= total ? t('editor.help.done') : t('editor.help.next')}</button>
                        </div>
                    </div>
                </div>
            </>
        }}
    </>
}

export default HelpBalloon

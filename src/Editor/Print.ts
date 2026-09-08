/**
 * Print.ts — putting the document on paper, and nothing else.
 *
 * `window.print()` on its own prints the HOST PAGE: the app's header, its sidebar, the
 * editor's own toolbar, whatever else shares the viewport. None of that is the document.
 * So printing is three jobs, not one:
 *
 *   1. proof   switch to `page` layout and let it settle. That mode already builds the
 *              exact boxes the printer gets, so the honest way to print is to print what
 *              page mode shows rather than to invent a second layout for paper.
 *   2. isolate hide everything that is not on the path from the document surface out to
 *              the root, on both sides of the shadow boundary.
 *   3. restore put the layout back the way the author had it.
 *
 * The isolation is done by MARKING rather than by naming: walk from the surface up to the
 * root, tag each ancestor as on-path and each of its siblings as hidden. Nothing here
 * needs to know what the host page is built out of, or what other chrome the editor
 * renders next to its surface — a panel added later is hidden by the same rule that hides
 * the toolbar today, because it is a sibling and not an ancestor.
 */

import {
    applyLayout, currentLayout, Layout, LAYOUT_ATTR, settle, pageMetrics, PAGE_ATTR, PAGE_SCALE_VAR,
    flushLayoutSilenced, type LayoutMode,
} from './PageLayout'

/** On the path from the surface out to the root: kept, and stripped of screen framing. */
export const PRINT_PATH_ATTR = 'data-wui-print-path'
/** Beside that path: not part of the document, so not on the paper. */
export const PRINT_HIDE_ATTR = 'data-wui-print-hide'

/** Marks our style element so a second run finds it instead of adding another. */
const STYLE_MARK = 'data-wui-print-styles'

/**
 * The isolation rules, for a sheet `widthMm` x `heightMm`.
 *
 * The `@page` line is the load-bearing one, and it is why this is built at print time
 * instead of being a constant. A sheet is the size the host configured — 209x296mm by
 * default, a hair under A4 — while the page box, left undeclared, is whatever the
 * printer's paper happens to be. On US Letter that box is 279mm tall, so every 296mm
 * sheet was 17mm too long for it and pushed a second, nearly-blank physical page after
 * itself: four sheets came out as eight pages. Declaring the size makes the page box and
 * the sheet the same box, and the printer's own fit-to-paper handles the rest.
 *
 * `margin: 0` for the same reason from the other side: the document carries its margins
 * inside its blocks, which is what page mode has always shown, so the page box must not
 * add more. CSS custom properties are no use in either declaration — `@page` does not see
 * the cascade — hence the interpolation.
 *
 * The reset on the path is deliberately blunt. Those elements are scaffolding — a scroll
 * container, a rounded border, a card shadow, an app shell's grid cell — and every one of
 * those properties is a screen affordance that either clips the document or prints as an
 * artefact. `overflow` and `max-height` matter most: a printed scroll container emits one
 * page and silently drops the rest.
 */
const buildCss = (widthMm: number, heightMm: number) => `
@media print {
    @page {
        size: ${widthMm}mm ${heightMm}mm;
        margin: 0;
    }

    [${PRINT_HIDE_ATTR}] { display: none !important; }

    [${PRINT_PATH_ATTR}] {
        display: block !important;
        position: static !important;
        overflow: visible !important;
        width: auto !important;
        min-width: 0 !important;
        max-width: none !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        outline: none !important;
        background: none !important;
        box-shadow: none !important;
        float: none !important;
        transform: none !important;
        /* The screen fit shrinks sheets to the window; paper is the size it is. */
        zoom: 1 !important;
        ${PAGE_SCALE_VAR}: 1 !important;
    }
}
`

/** Everything one run touched, so the restore is exact rather than a re-scan. */
interface Marks {
    tagged: Element[]
    styles: HTMLStyleElement[]
}

/**
 * Climb one step, crossing out of a shadow root at its host.
 *
 * Returns null at the document, which is where the walk stops: the root element is the
 * last one worth marking and the Document itself has no siblings to hide.
 */
const climb = (node: Node): Element | null => {
    const parent = node.parentNode
    if (!parent) return null
    if (parent instanceof ShadowRoot) return parent.host
    if (parent.nodeType === Node.ELEMENT_NODE) return parent as Element
    return null
}

/**
 * Elements that render nothing, so hiding them says nothing.
 *
 * `<head>` is a sibling of `<body>` and would be marked by the walk like any other, and
 * a `<style>` beside the surface is how both the page rules and these very rules get into
 * a root. Marking them costs an attribute write and, worse, reads later as if the
 * stylesheet had been suppressed on purpose.
 */
const NOT_RENDERED = ['HEAD', 'STYLE', 'SCRIPT', 'LINK', 'META', 'TITLE', 'TEMPLATE', 'BASE', 'NOSCRIPT']

/** Put the isolation rules into `target` if they are not already there. */
const ensureStyles = (target: ShadowRoot | HTMLHeadElement, doc: Document, out: HTMLStyleElement[]) => {
    if (target.querySelector(`style[${STYLE_MARK}]`)) return
    const tag = doc.createElement('style')
    tag.setAttribute(STYLE_MARK, '')
    const { widthMm, heightMm } = pageMetrics()
    tag.textContent = buildCss(widthMm, heightMm)
    target.appendChild(tag)
    out.push(tag)
}

/**
 * Tag the path from `surface` outwards, and inject the rules into every root the path
 * passes through.
 *
 * The styles go in per-root because a document stylesheet does not reach into a shadow
 * tree: the same rules are needed on both sides of the boundary, and appending ours after
 * the page rules is also what makes them win — same specificity, later wins.
 */
const mark = (surface: HTMLElement): Marks => {
    const doc = surface.ownerDocument
    const marks: Marks = { tagged: [], styles: [] }

    let node: Element | null = surface
    while (node) {
        node.setAttribute(PRINT_PATH_ATTR, '')
        marks.tagged.push(node)

        const root = node.getRootNode()
        if (root instanceof ShadowRoot) ensureStyles(root, doc, marks.styles)

        const parent = node.parentNode as ParentNode | null
        if (parent) {
            for (const sib of Array.from(parent.children ?? [])) {
                // An earlier iteration may already have claimed this one for the path.
                if (sib === node || sib.hasAttribute(PRINT_PATH_ATTR)) continue
                if (NOT_RENDERED.includes(sib.tagName)) continue
                sib.setAttribute(PRINT_HIDE_ATTR, '')
                marks.tagged.push(sib)
            }
        }

        node = climb(node)
    }

    ensureStyles(doc.head, doc, marks.styles)
    return marks
}

/** Undo {@link mark}. Nothing here can throw on a node that has since been replaced. */
const unmark = (marks: Marks) => {
    for (const el of marks.tagged) {
        el.removeAttribute(PRINT_PATH_ATTR)
        el.removeAttribute(PRINT_HIDE_ATTR)
    }
    for (const tag of marks.styles) tag.remove()
    marks.tagged = []
    marks.styles = []
}

/**
 * A frame, or a timer if this document is not being drawn. Never hangs.
 *
 * Everything below has to keep running in a tab the user is not looking at. A hidden or
 * minimised tab gets NO animation frames at all, so a bare `requestAnimationFrame` wait
 * never settles — and every caller here sits between `printing = true` and the `finally`
 * that clears it, which means one such wait latches the button off for the rest of the
 * page's life. That is exactly the failure this races away: a timer always fires, so the
 * worst case is that the wait is a beat late rather than never.
 */
const nextFrame = (fallbackMs: number) => Promise.race([
    new Promise<void>(r => requestAnimationFrame(() => r())),
    new Promise<void>(r => setTimeout(r, fallbackMs)),
])

/**
 * Wait until pagination has actually produced sheets and stopped changing its mind.
 *
 * `applyLayout` kicks the first pass off behind `settle()` and a zero-delay timer, so a
 * `print()` fired on the next line prints an unpaginated column. Polling the sheet count
 * rather than guessing a delay means a two-page document does not pay for a fifty-page
 * one; the cap means a document that never settles still prints, just as it stands.
 *
 * The poll is driven by {@link nextFrame} rather than by animation frames alone for the
 * reason given there. Background timers are clamped to about a second, so a hidden tab
 * reaches the two-tick stability test in a couple of seconds instead of a couple of
 * frames — slower, but it arrives, which the frame-only version did not.
 */
const sheetsReady = async (surface: HTMLElement, timeoutMs = 4000) => {
    const started = performance.now()
    let last = -1
    let stable = 0

    for (; ;) {
        const count = surface.querySelectorAll(`[${PAGE_ATTR}]`).length
        if (count > 0 && count === last) stable++
        else stable = 0
        last = count

        // Two consecutive ticks at the same non-zero count: the pass is done.
        if (stable >= 2 || performance.now() - started > timeoutMs) return
        await nextFrame(120)
    }
}

/** Guards against a second click while the first print is still being set up. */
let printing = false

/** True while a print run owns the document, for anything that wants to disable itself. */
export const isPrinting = () => printing

export interface PrintOptions {
    /**
     * How to change layout mode. Defaults to {@link applyLayout}, which is enough to make
     * the paper right but leaves the toolbar's own mirror of the mode behind; a caller
     * that has one — the toolbar does — passes its setter so the switch stays honest
     * about which mode the editor is in while the dialog is open.
     */
    setMode?: (mode: LayoutMode) => void
}

/**
 * Proof, isolate, print, restore.
 *
 * Resolves once the print dialog has been dismissed and the editor is back the way it
 * was. `afterprint` is what tells us that, raced against a timer because a browser that
 * never fires it would otherwise leave the document marked up and half-hidden forever.
 */
export const printEditor = async (surface: HTMLElement | null | undefined, opts: PrintOptions = {}): Promise<void> => {
    if (!surface || printing) return
    printing = true

    const setMode = opts.setMode ?? ((mode: LayoutMode) => applyLayout(surface, mode))

    // The surface's own attribute first, `currentLayout()` only as a fallback. That
    // module-level value is the mode `applyLayout` was last asked for in this page, which
    // is not the same thing as the mode this surface is in: a host that set the attribute
    // itself, or a second editor, leaves the two disagreeing. Trusting the stale one costs
    // twice — the proof runs a switch the document did not need, and the restore afterwards
    // puts the author in a mode they were never in.
    const attr = surface.getAttribute(LAYOUT_ATTR) as LayoutMode | null
    const was: LayoutMode = attr && attr in Layout ? attr : currentLayout()
    let marks: Marks | null = null

    try {
        if (was !== Layout.page) {
            setMode(Layout.page)
            await sheetsReady(surface)
        } else {
            // Already proofing, but an image or a font may still be in flight.
            await settle(surface)
        }

        marks = mark(surface)
        // One frame for the isolation rules to reach the box tree before the print
        // dialog takes its snapshot.
        await nextFrame(120)

        await new Promise<void>(resolve => {
            let done = false
            const finish = () => {
                if (done) return
                done = true
                window.removeEventListener('afterprint', finish)
                clearTimeout(timer)
                resolve()
            }
            const timer = setTimeout(finish, 60000)
            window.addEventListener('afterprint', finish)
            window.print()
        })
    } finally {
        if (marks) unmark(marks)
        if (was !== Layout.page) {
            setMode(was)
            flushLayoutSilenced()
        }
        printing = false
    }
}

/**
 * PageLayout.ts — the three layout modes of <Editor>.
 *
 * A long document is authored as a flow and consumed as pages, and those two shapes
 * disagree about almost everything. This module is the switch between them, plus the
 * one that turns both off for reading.
 *
 *   flow     the authoring shape. One continuous column — exactly what <Editor> gives
 *            you without this module. Pagination is invisible in the sense that
 *            matters (nothing on screen is a page), so the MARKERS that stand in for it
 *            are shown: a page-break block's dashed rule, a full-page block's
 *            placeholder, whatever else an app gates on `NOT_PAGED`. Fast: no
 *            measuring, no observers, restructuring is free.
 *
 *   page     the proofing shape, and the point of the whole file: switching to `page`
 *            while editing is how an author prepares a document for printing. The same
 *            nodes, re-parented into real sheets (209x296mm by default), still fully
 *            editable. The markers hide, because the sheet edge now says what they said.
 *
 *   screen   the reading shape. Read-only, markers hidden, and free to reflow for
 *            whatever screen is in front of it — phone or desktop.
 *
 * === Move, never clone ===
 *
 * Sheets are built by RE-PARENTING the flow's existing children, not by copying them.
 * A custom element is nothing but its tag and its attributes: the browser materialises
 * the shadow root and the light DOM natively once the host exists, and the attributes
 * are what drive it. So a clone is not a cheap copy of a rendered component — it is a
 * SECOND custom element that must construct itself from scratch, and whose
 * context-resolving attributes re-resolve against whatever ancestor the copy happened
 * to land under. Moving the host moves the element, wholesale and already rendered.
 *
 * `Element.moveBefore()` is used where available: it is an ATOMIC move, so the element
 * is never disconnected, never torn down, never rebuilt — custom elements keep their
 * state and the caret survives. Where it is missing, `insertBefore` is the fallback,
 * which does churn the connection; that is why the selection is captured and restored
 * around every pass regardless.
 *
 * The sheets themselves are presentation only. `unpaginate()` takes them away, and an
 * app's serialiser should call it on BOTH the load and the save path — so a document
 * that spent an hour in `page` mode serialises to exactly the string it had in `flow`,
 * and a dirty-check stays quiet.
 *
 * === Measuring ===
 *
 * Break positions are only as good as the layout they were measured against, and a
 * document measured before its webfont arrives is measured against a fallback face with
 * different metrics — every break moves when the real font lands. So the first pass of
 * a `page` session waits on `document.fonts.ready` and on every image (including the
 * ones inside component shadow roots, which is where a full-page image block keeps its
 * picture), then on two animation frames, then measures.
 *
 * Overflow is detected as a RATIO, never as an absolute pixel count:
 *
 *     scale = sheet.getBoundingClientRect().width / pageWidthPx
 *     limit = sheet.top + pageHeightPx * scale
 *
 * A sheet's WIDTH is fixed no matter what it contains, so it is a reliable yardstick;
 * its height is not, because it grows with the overflow being measured. Reading the
 * scale off the width makes the whole pass immune to the `zoom` that fits a sheet onto
 * a narrow window, and to any transform an ancestor applies.
 *
 * === What is NOT solved ===
 *
 * A single block taller than one page is not split — it cannot be, without the
 * line-level fragmentation the browser will only do for us in real paged media. It is
 * MARKED instead (`OVERFLOW_ATTR`, a rule drawn where the paper ends and a label saying
 * so), because silent clipping is the failure mode that ships broken PDFs.
 *
 * And `page` mode approximates print, it does not become it. A hand-written
 * `@media print` rule still does not show up in `page` mode. The alternative considered
 * was walking the CSSOM to re-emit every print rule under `[data-layout="page"]`; it was
 * rejected as thousands of duplicated rules and a doubled style cost.
 */

import { pageBreakTagNames, resolvePageBreak, type PageBreakKind } from './EditorPlugin'
import { ensurePageStyles } from './PageStyles'

export type { PageBreakKind }

/* ── the vocabulary ────────────────────────────────────────────────────────
   Everything an app needs to write CSS against is a constant here, so a selector and
   the code that satisfies it can never drift apart. */

/** Written on the editor surface to say which mode it is in. */
export const LAYOUT_ATTR = 'data-layout'

export const Layout = { flow: 'flow', page: 'page', screen: 'screen' } as const
export type LayoutMode = typeof Layout[keyof typeof Layout]

/**
 * Selector fragment matching a surface that is NOT paginated and NOT read-only —
 * i.e. `flow`, the mode where editor-only markers belong.
 *
 * Written as two `:not()`s rather than as a positive `[data-layout="flow"]` on purpose:
 * a surface that has never been through `applyLayout` carries no `data-layout` at all,
 * and a positive match would blank the markers on every one of them. Note it adds
 * 0,2,0 of specificity — a later rule that resets the same elements has to repeat the
 * gate or it loses.
 */
export const NOT_PAGED = `:not([${LAYOUT_ATTR}="${Layout.page}"]):not([${LAYOUT_ATTR}="${Layout.screen}"])`

/** Marks a `page` layout sheet. Valueless — presence is the whole signal. */
export const PAGE_ATTR = 'data-wui-page'

/** Marks the injected "Page N / M" strip inside a sheet. Never authored, never saved. */
export const PAGE_CHROME_ATTR = 'data-wui-page-chrome'

/** Set on a sheet whose first block is taller than one page and so cannot be split. */
export const OVERFLOW_ATTR = 'data-wui-overflow'

/** Custom property carrying the fit-to-window scale. Consumed by `zoom` in the CSS. */
export const PAGE_SCALE_VAR = '--wui-page-scale'

/* The next three carry the configurable half of the page rules, so that the RULES
   themselves are constant and one constructed stylesheet can serve every editor on the
   page whatever size it prints at.

   The two sizes are carried UNITLESS and multiplied by `1mm` in the CSS, rather than
   being written as `209mm` here. A millimetre is a real physical unit to a printer and
   an assumed-96dpi one on screen; letting CSS do the multiplication means the sheet is
   the same length on paper as `@page` thinks it is, and it also lets a rule do
   arithmetic on the number (the numbering strip sits 12mm up from the bottom edge). */

/** Custom property: sheet width, unitless millimetres. */
export const PAGE_W_VAR = '--wui-page-w'

/** Custom property: sheet height, unitless millimetres. */
export const PAGE_H_VAR = '--wui-page-h'

/** Custom property: the overflow warning's text, as a CSS string for `content`. */
export const OVERFLOW_LABEL_VAR = '--wui-overflow-label'

const MM = 96 / 25.4

/* ── options ───────────────────────────────────────────────────────────────
   209 x 296, not 210 x 297. One millimetre shy of A4 on each axis, deliberately: a
   sheet sized to the page exactly rounds UP as often as down once the browser converts
   mm to device pixels, and a page one pixel too tall emits a blank page after every real
   one. The shortfall is invisible at print scale and the guard is absolute. */
export interface PageLayoutOptions {
    /** Sheet width in millimetres. Default 209 (A4 less 1mm). */
    pageWidthMm: number
    /** Sheet height in millimetres. Default 296 (A4 less 1mm). */
    pageHeightMm: number
    /** Text of the injected page-number strip. Default `Page N / M`. */
    pageLabel: (page: number, total: number) => string
    /**
     * What the rule drawn across an over-tall sheet says. Screen only — it is hidden in
     * print, because by then the author has either fixed it or decided to live with it.
     */
    overflowLabel: string
    /**
     * Override the break classifier for one flow-level node. Return `undefined` to fall
     * through to the built-in resolution (plugin `pageBreak` descriptors, then the
     * element's computed `break-before` / `break-after`).
     */
    breakOf?: (node: Node) => PageBreakKind | undefined | null
}

const options: PageLayoutOptions = {
    pageWidthMm: 209,
    pageHeightMm: 296,
    pageLabel: (page, total) => `Page ${page} / ${total}`,
    overflowLabel: 'This block is taller than one page and cannot be split automatically',
}

/**
 * Set the defaults every `applyLayout` uses. Call once at app start.
 *
 * A module-level default rather than a prop because the built-in toolbar control drives
 * `applyLayout` itself: there is no call site an app could pass a callback through.
 */
export const configurePageLayout = (o: Partial<PageLayoutOptions>) => { Object.assign(options, o) }

/** Current sheet geometry in CSS pixels. */
export const pageMetrics = () => ({
    width: options.pageWidthMm * MM,
    height: options.pageHeightMm * MM,
    widthMm: options.pageWidthMm,
    heightMm: options.pageHeightMm,
})

/* ── the mover ─────────────────────────────────────────────────────────────
   `moveBefore` throws rather than degrading when it cannot honour its atomicity
   contract (a disconnected node, a cross-document move), so the try is real, not
   defensive noise. Whatever it refuses, `insertBefore` still accepts. */
const canMoveInPlace = typeof Element !== 'undefined' && 'moveBefore' in Element.prototype

/** How a node is relocated. `insertBefore` semantics: `(parent, node, before)`. */
export type Mover = (parent: Node, node: Node, before: Node | null) => void

export const moveNode: Mover = (parent, node, before) => {
    if (canMoveInPlace && node.isConnected && parent.isConnected) {
        try { (parent as any).moveBefore(node, before); return } catch { /* fall through */ }
    }
    parent.insertBefore(node, before)
}

const plainMove: Mover = (parent, node, before) => { parent.insertBefore(node, before) }

/* ── selection ─────────────────────────────────────────────────────────────
   Offsets are re-clamped on the way back in. With `moveBefore` the containers are the
   same objects and the offsets are still valid; with the `insertBefore` fallback a text
   node can be re-normalised under the caret, and a stale offset throws IndexSizeError
   and drops the selection entirely. Clamping degrades to "caret at the end of the right
   node" instead of losing it. */
type SelectionRecord = { sc: Node, so: number, ec: Node, eo: number } | null

const lengthOf = (n: Node) => n.nodeType === 3 ? (n as Text).length : n.childNodes.length

/**
 * The selection object that actually owns the caret in `root`.
 *
 * `document.getSelection()` is retargeted at shadow boundaries. With the caret inside the
 * editor's shadow tree it does not report "no selection" — it reports a live `Caret` at a
 * position in the LIGHT DOM, the host's nearest ancestor at some unrelated offset. Saving
 * that and handing it back to `addRange` does not restore the caret, it moves it out of the
 * document being edited, and the real one is destroyed on the way. That is exactly what a
 * keystroke in a table cell hit: typing re-paginates, re-pagination "restored" a light-DOM
 * position, and the next character had nowhere to land — the editor looked like it had lost
 * focus while still holding it.
 *
 * `ShadowRoot.getSelection()` returns the untargeted selection for that tree. For a
 * light-DOM editor it is the same object `document.getSelection()` returns, so the fallback
 * is not a lesser path — it is the same path.
 */
const selectionOf = (root: Node): Selection | null => {
    if (typeof document === 'undefined') return null
    const host = root.getRootNode?.()
    if (host instanceof ShadowRoot && typeof (host as any).getSelection === 'function')
        return (host as any).getSelection() ?? null
    return document.getSelection()
}

const saveSelection = (root: Node): SelectionRecord => {
    const sel = selectionOf(root)
    if (!sel || sel.rangeCount === 0) return null
    const r = sel.getRangeAt(0)
    return { sc: r.startContainer, so: r.startOffset, ec: r.endContainer, eo: r.endOffset }
}

const restoreSelection = (root: Node, rec: SelectionRecord) => {
    if (!rec || !rec.sc.isConnected || !rec.ec.isConnected) return
    try {
        const r = document.createRange()
        r.setStart(rec.sc, Math.min(rec.so, lengthOf(rec.sc)))
        r.setEnd(rec.ec, Math.min(rec.eo, lengthOf(rec.ec)))
        const sel = selectionOf(root)
        sel?.removeAllRanges()
        sel?.addRange(r)
    } catch { /* the caret was where a node no longer is; leave it to the browser */ }
}

/* ── settling ──────────────────────────────────────────────────────────────
   Images inside a component live in ITS shadow root, so a plain
   `root.querySelectorAll('img')` finds none of the ones that actually decide a sheet's
   height. This pierces. */
const collectImages = (n: ParentNode, out: HTMLImageElement[] = []): HTMLImageElement[] => {
    for (const el of Array.from(n.querySelectorAll<HTMLElement>('*'))) {
        if (el.tagName === 'IMG') out.push(el as HTMLImageElement)
        const sr = (el as any).shadowRoot as ShadowRoot | null
        if (sr) collectImages(sr, out)
    }
    return out
}

const withTimeout = <T,>(p: Promise<T>, ms: number) =>
    Promise.race([p, new Promise<void>(r => setTimeout(r, ms))])

const imageReady = (img: HTMLImageElement) => img.complete
    ? Promise.resolve()
    : withTimeout(new Promise<void>(r => {
        const done = () => r()
        img.addEventListener('load', done, { once: true })
        img.addEventListener('error', done, { once: true })
    }), 5000)

/**
 * Resolve once the subtree is safe to measure: fonts loaded, images decoded, layout
 * flushed. Every wait is capped — a document referencing a dead image URL still gets
 * paginated, just against the broken-image box, which is what the printer would see too.
 *
 * The rAF pair is raced against a timer because animation frames do not fire in a
 * background tab, and an author who opens `page` mode and switches away would otherwise
 * come back to an unpaginated document.
 */
export const settle = async (root: HTMLElement) => {
    try { await withTimeout((document as any).fonts?.ready ?? Promise.resolve(), 3000) } catch { /* no font API */ }
    await Promise.all(collectImages(root).map(imageReady))
    await Promise.race([
        new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
        new Promise<void>(r => setTimeout(r, 400)),
    ])
}

/* ── breaks ────────────────────────────────────────────────────────────────
   Pagination is AUTHORED before it is computed. `page` mode's first pass does not
   invent breaks, it obeys the ones already in the document; only the leftovers — a run
   of content longer than a sheet — are broken automatically, in the second pass.

   A break is declared on the EditorPlugin that owns the element, so no second registry
   exists and no app-specific tag name reaches this file:

       registerEditorPlugin({ name: 'page-break', tagName: 'my-break', pageBreak: 'after', … })
       registerEditorPlugin({ name: 'full-page',  tagName: 'my-page',  pageBreak: 'own-page', … })

   The value may be a function when the answer depends on the element's own attributes
   (a break block with a "before / after" switch, say). Plain CSS `break-before: page`
   is honoured too, so markup that never went through the plugin registry still breaks
   where it says it does. */
const PAGE_BREAK_VALUES = ['page', 'always', 'left', 'right', 'recto', 'verso']

const cssBreak = (el: Element): PageBreakKind => {
    const cs = typeof getComputedStyle === 'function' ? getComputedStyle(el) : null
    if (!cs) return 'none'
    const before = (cs as any).breakBefore || (cs as any).pageBreakBefore
    const after = (cs as any).breakAfter || (cs as any).pageBreakAfter
    if (PAGE_BREAK_VALUES.includes(before)) return 'before'
    if (PAGE_BREAK_VALUES.includes(after)) return 'after'
    return 'none'
}

const breakOf = (node: Node): PageBreakKind => {
    const custom = options.breakOf?.(node)
    if (custom) return custom
    if (node.nodeType !== 1) return 'none'
    const el = node as Element

    // The flow-level node is often a wrapper the app puts around the real block, so the
    // element that declares the break can be a descendant rather than the node itself.
    const own = resolvePageBreak(el as HTMLElement)
    if (own !== 'none') return own

    const sel = pageBreakTagNames().join(',')
    if (sel) {
        const inner = el.querySelector<HTMLElement>(sel)
        if (inner) {
            const k = resolvePageBreak(inner)
            if (k !== 'none') return k
        }
    }
    return cssBreak(el)
}

/**
 * Cut the flow into groups at the authored breaks.
 *
 * Empty groups are never emitted, which is the whole fix for the classic
 * break-at-the-edges bug: a document that opens or closes with a page break yields no
 * leading or trailing blank sheet, and the page count is right.
 *
 * A break element stays inside its group rather than being consumed. It is authored
 * content the user must still be able to select, drag and delete in `page` mode; with
 * its marker hidden it occupies no height, so keeping it costs nothing.
 */
const groupNodes = (nodes: Node[]) => {
    const groups: Node[][] = []
    let current: Node[] = []
    const flush = () => { if (current.length) { groups.push(current); current = [] } }
    for (const n of nodes) {
        const d = breakOf(n)
        if (d === 'own-page') { flush(); groups.push([n]); continue }
        if (d === 'before') flush()
        current.push(n)
        if (d === 'after') flush()
    }
    flush()
    return groups
}

const makeSheet = (root: HTMLElement, before: Node | null) => {
    const sheet = root.ownerDocument.createElement('div')
    sheet.setAttribute(PAGE_ATTR, '')
    root.insertBefore(sheet, before)
    return sheet
}

/* ── auto-flow ─────────────────────────────────────────────────────────────
   What the authored breaks did not cover: a group longer than one sheet spills into a
   continuation sheet, and that sheet is re-measured in turn, so a ten-page run resolves
   in one forward walk without recursion. */
const reflowOverflow = (root: HTMLElement) => {
    const { width: pageW, height: pageH } = pageMetrics()
    let sheet = root.firstElementChild as HTMLElement | null
    // Each turn either advances past a sheet or produces a sheet with strictly fewer
    // children, so this terminates. The counter is a backstop against a zero-height
    // pathology (a block whose rect is 0x0 can never clear the limit), not a design.
    let guard = 0
    while (sheet && guard++ < 4000) {
        const next = sheet.nextElementSibling as HTMLElement | null
        if (!sheet.hasAttribute(PAGE_ATTR)) { sheet = next; continue }

        const box = sheet.getBoundingClientRect()
        const scale = box.width > 0 ? box.width / pageW : 1
        // +1px of slack: content sized to exactly one page must not be read as
        // overflowing its own sheet by a rounding error.
        const limit = box.top + pageH * scale + 1
        const over = (n: Node) => n.nodeType === 1 && (n as Element).getBoundingClientRect().bottom > limit

        const kids = Array.from(sheet.childNodes)
        let i = kids.findIndex(over)
        if (i < 0) { sheet = next; continue }

        if (i === 0) {
            // The first thing on the sheet is already too tall. It cannot be split, so it
            // is flagged rather than clipped — the sheet grows, a rule is drawn where the
            // paper ends, and a label says why. Everything AFTER it still moves on.
            sheet.setAttribute(OVERFLOW_ATTR, '')
            i = kids.findIndex((n, k) => k > 0 && over(n))
            if (i < 0) { sheet = next; continue }
        }

        const cont = makeSheet(root, next)
        for (const n of kids.slice(i)) moveNode(cont, n, null)
        sheet = cont
    }
}

/* ── page numbering ────────────────────────────────────────────────────────
   `counter(page)` only exists in paged media — on screen it resolves to nothing, which
   is why every WYSIWYG preview of this shape shows a blank page number. So `page` mode
   assigns numbers in JS instead, into a strip of its own that the CSS hides in print.
   Two mechanisms, one visible at a time, never doubled up. */
const numberSheets = (root: HTMLElement) => {
    const sheets = Array.from(root.querySelectorAll<HTMLElement>(`[${PAGE_ATTR}]`))
    sheets.forEach((sheet, i) => {
        const strip = sheet.ownerDocument.createElement('div')
        strip.setAttribute(PAGE_CHROME_ATTR, '')
        // Belt and braces against the caret: the attribute keeps the editing engine out,
        // and the stylesheet adds pointer-events/user-select none so the strip cannot be
        // clicked into or dragged over.
        strip.setAttribute('contenteditable', 'false')
        strip.textContent = options.pageLabel(i + 1, sheets.length)
        sheet.appendChild(strip)
    })
}

/* ── fitting ───────────────────────────────────────────────────────────────
   `zoom`, not `transform: scale()`. A transform paints the sheet smaller but leaves its
   hit-testing and caret geometry at full size, so clicks land in the wrong place and
   typing puts characters where the pointer is not — the classic broken zoomed editor.
   `zoom` scales layout itself, so input keeps working.

   The width is read off the PARENT, which carries no zoom of its own. Reading it off
   the zoomed element would feed the previous scale back into the next one. */
const fitScale = (root: HTMLElement) => {
    const parent = root.parentElement
    const avail = (parent?.clientWidth ?? 0) || root.clientWidth
    if (!avail) return 0
    const ratio = Math.max(0.25, Math.min(1, (avail - 24) / pageMetrics().width))
    root.style.setProperty(PAGE_SCALE_VAR, String(Math.round(ratio * 1000) / 1000))
    return avail
}

/**
 * Flatten every sheet in `root` back into `root`'s own child list, in document order,
 * and remove the page furniture.
 *
 * Idempotent, and a no-op on a document that was never paginated — which is what lets a
 * serialiser call it unconditionally on both the save and the load path. That is the
 * whole reason a document round-trips byte-identically through `page` mode.
 *
 * Only DIRECT sheet children of `root` are unwrapped, then their children re-scanned:
 * sheets never nest, and this must not reach into a nested editable island and start
 * relocating someone else's markup.
 *
 * `move` defaults to plain `insertBefore` so this is safe on a DOMParser document, which
 * has no `moveBefore`. The editor passes `moveNode`.
 */
export const unpaginate = (root: ParentNode, move: Mover = plainMove) => {
    for (const chrome of Array.from(root.querySelectorAll(`[${PAGE_CHROME_ATTR}]`))) chrome.remove()
    let sheet = root.firstElementChild
    while (sheet) {
        const next = sheet.nextElementSibling
        if (sheet.hasAttribute(PAGE_ATTR)) {
            for (const kid of Array.from(sheet.childNodes)) move(root, kid, sheet)
            sheet.remove()
        }
        sheet = next
    }
    for (const el of Array.from(root.querySelectorAll(`[${OVERFLOW_ATTR}]`))) el.removeAttribute(OVERFLOW_ATTR)
}

/**
 * `html`, with every sheet flattened away — the document as anything that stores it
 * should see it.
 *
 * Sheets are presentation. A history snapshot, a save file or a diff that captured them
 * would be recording which mode the editor happened to be in, and the undo stack proved
 * how badly that goes: entries taken in `page` mode carried the sheets, entries taken in
 * `flow` mode did not, so a single Ctrl+Z could swap the whole document between the two
 * layouts. Normalising on the way IN makes a layout switch produce a byte-identical
 * snapshot, which is what stops it reaching the stack at all — a stronger guarantee than
 * filtering the mutation that caused it, because it does not depend on catching the
 * mutation.
 *
 * Parsed rather than assigned into a live element on purpose: a `DOMParser` document has
 * no browsing context, so the custom elements in the markup are not constructed and no
 * `src` is fetched. Just normalising a string must not run the document.
 */
export const unpaginatedHTML = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    unpaginate(doc.body)
    return doc.body.innerHTML
}

/**
 * Rebuild the sheets of `root` from its current content. Idempotent: it flattens first,
 * so running it twice is the same as running it once.
 */
export const paginate = (root: HTMLElement) => {
    // Sheets without the rules that draw them are just divs, and a pass can be reached
    // without going through `applyLayout` -- undo restores a snapshot and re-paginates
    // directly. Cheap when they are already installed; see `ensurePageStyles`.
    ensurePageStyles(root)
    const rec = saveSelection(root)
    unpaginate(root, moveNode)
    for (const group of groupNodes(Array.from(root.childNodes))) {
        const sheet = makeSheet(root, group[0])
        for (const n of group) moveNode(sheet, n, null)
    }
    reflowOverflow(root)
    numberSheets(root)
    restoreSelection(root, rec)
}

/* ══════════════════════════════════════════════════════════════════════════
   The session — one editor root at a time, which is all a page ever has.
   ══════════════════════════════════════════════════════════════════════════ */

let currentRoot: HTMLElement | null = null
let currentMode: LayoutMode = Layout.flow
let mutationWatch: MutationObserver | null = null
let resizeWatch: ResizeObserver | null = null
let timer: ReturnType<typeof setTimeout> | null = null
let paginating = false
let lastWidth = -1

/**
 * Observers the host wants held quiet while the layout engine rewrites the document.
 *
 * Switching mode is not an edit. It re-parents the whole document into sheets (or back
 * out of them) and writes two attributes on the surface, which to any subtree observer
 * looks exactly like the author replacing the entire document -- so the editor's history
 * observer would record the paginated markup as an undo step, and Ctrl+Z would "undo" the
 * button rather than the last thing typed.
 *
 * A boolean the observer could read is no use here, for the same reason `paginateNow`
 * gives: MutationObserver delivers in a microtask, long after the flag would be cleared.
 * Discarding the queued records is the only thing that works, and only the observer that
 * owns them can do it -- hence a registry rather than a flag.
 */
const silenced = new Set<MutationObserver>()

/**
 * Register `o` to be silenced across layout passes. Returns the un-register.
 *
 * Records queued by anything OTHER than a layout pass are untouched: this discards only
 * what is pending at the moment a pass finishes, so an edit on the next keystroke still
 * reaches `o` normally.
 */
export const silenceDuringLayout = (o: MutationObserver) => {
    silenced.add(o)
    return () => { silenced.delete(o) }
}

/**
 * Drop everything the pass we just finished queued on the registered observers.
 *
 * Exported because the switch's own handler has to call it as well: writing the mode
 * observable re-runs the surface's reactive bindings, and woby re-asserts
 * `contentEditable` on the surface *after* `applyLayout` has returned. That one record is
 * queued too late for the flush inside `applyLayout` to catch, and one record is all it
 * takes -- the history observer does not look at what changed, only that something did.
 */
export const flushLayoutSilenced = () => { for (const o of silenced) o.takeRecords() }

const paginateNow = () => {
    const root = currentRoot
    if (!root || !root.isConnected || currentMode !== Layout.page || paginating) return
    paginating = true
    try {
        lastWidth = fitScale(root) || lastWidth
        paginate(root)
    } finally {
        // Discard the records our own pass just queued. `takeRecords()` is the only thing
        // that works here: MutationObserver delivers in a microtask, so a boolean guard
        // would already have been cleared by the time the callback ran and the pass would
        // re-trigger itself forever.
        mutationWatch?.takeRecords()
        flushLayoutSilenced()
        paginating = false
    }
}

/**
 * Re-page after a quiet period.
 *
 * Never on `input`. Repaginating per keystroke is what makes these editors feel broken:
 * it re-measures the whole document between two letters and snaps the scroll position
 * while the author is still typing. A debounce lets the sheets settle a moment after the
 * sentence does.
 */
const schedule = (delay = 250) => {
    if (currentMode !== Layout.page) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { timer = null; paginateNow() }, delay)
}

const stopWatching = () => {
    mutationWatch?.disconnect()
    resizeWatch?.disconnect()
    if (timer) { clearTimeout(timer); timer = null }
}

const startWatching = (root: HTMLElement) => {
    mutationWatch ??= new MutationObserver(() => { if (!paginating) schedule() })
    // `attributes` is deliberately NOT observed: the mode switch writes `data-layout` and
    // `contenteditable` onto this very element, and the editor stamps selection markers
    // on every click. None of that changes the layout.
    mutationWatch.observe(root, { childList: true, subtree: true, characterData: true })

    resizeWatch ??= new ResizeObserver(() => {
        // Height changes are OUR OWN doing — pagination makes the document taller. Only a
        // WIDTH change means the fit has to be recomputed, and gating on it is what keeps
        // the observer from driving itself in a loop.
        const w = currentRoot?.parentElement?.clientWidth ?? -1
        if (w === lastWidth) return
        lastWidth = w
        schedule(120)
    })
    const parent = root.parentElement
    if (parent) resizeWatch.observe(parent)
}

/**
 * Push the configured page size and wording onto the surface as custom properties.
 *
 * This is the whole of the configuration path: the stylesheet is shared and constant, and
 * these three properties are what make it describe THIS editor's paper. Written on the
 * surface rather than on `:root` so two editors on one page can print differently.
 */
const writePageVars = (root: HTMLElement) => {
    root.style.setProperty(PAGE_W_VAR, String(options.pageWidthMm))
    root.style.setProperty(PAGE_H_VAR, String(options.pageHeightMm))
    // JSON.stringify, because `content` takes a CSS *string* and the label is arbitrary
    // host text: a stray quote in it would otherwise break the declaration and silently
    // drop the whole rule.
    root.style.setProperty(OVERFLOW_LABEL_VAR, JSON.stringify(options.overflowLabel))
}

/**
 * Put `root` into `mode`.
 *
 * Cheap and safe to call again with the same arguments, which is what lets a caller
 * re-assert the mode whenever the editor surface is rebuilt.
 */
export const applyLayout = (root: HTMLElement | null | undefined, mode: LayoutMode) => {
    if (!root) return
    if (currentRoot === root && currentMode === mode && root.getAttribute(LAYOUT_ATTR) === mode) return

    currentRoot = root
    currentMode = mode
    root.setAttribute(LAYOUT_ATTR, mode)

    // `screen` is read-only, and it turns editing off by writing the ONE attribute the
    // editor's own read-only toggle writes — from here rather than through that toggle,
    // because flipping `readonly` unmounts the toolbar, and the toolbar is where this
    // very switch lives. The editor's `isReadonly` therefore stays false and the chrome
    // stays put.
    root.setAttribute('contenteditable', mode === Layout.screen ? 'false' : 'true')

    stopWatching()

    if (mode !== Layout.page) {
        const rec = saveSelection(root)
        unpaginate(root, moveNode)
        root.style.removeProperty(PAGE_SCALE_VAR)
        root.style.removeProperty(PAGE_W_VAR)
        root.style.removeProperty(PAGE_H_VAR)
        root.style.removeProperty(OVERFLOW_LABEL_VAR)
        restoreSelection(root, rec)
        flushLayoutSilenced()
        return
    }

    // The page rules arrive with the first switch into `page`, so an editor that never
    // leaves `flow` never pays for them at all. Re-asserted here on every switch rather
    // than once, because the host can take them back out from under us.
    ensurePageStyles(root)
    writePageVars(root)

    lastWidth = -1
    startWatching(root)
    // The attribute writes above are already queued on the host's observers; the sheets
    // themselves arrive later and are dropped by `paginateNow`'s own flush.
    flushLayoutSilenced()
    // The first pass of a `page` session waits for the document to stop moving; every
    // pass after it rides the debounce. See `settle`.
    void settle(root).then(() => schedule(0))
}

/** Tear the session down. Call from the host page's own teardown. */
export const disposeLayout = () => {
    stopWatching()
    currentRoot = null
    currentMode = Layout.flow
    lastWidth = -1
}

/** The mode the session is currently in. */
export const currentLayout = () => currentMode

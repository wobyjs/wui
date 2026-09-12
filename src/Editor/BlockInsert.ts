/**
 * BlockInsert.ts — the two things every *block-level* plugin needs and no inline widget does.
 *
 * `wui-cover-page`, `wui-watermark` and `wui-banner` are page furniture: they occupy a band
 * of the sheet rather than a run of text, and they are configured from attributes rather than
 * from what the author types into them. That gives them two problems in common — how to get
 * onto the surface in the first place, and how to let the property panel edit an image that
 * has no `<img>` to point at — and those are what lives here.
 *
 * Kept out of `PageBlockPlugins.ts` because `wui-banner` is a woby component registered from
 * `WuiPlugins.ts`; importing the module that registers the cover page just to reach a helper
 * would drag three shadow-DOM blocks into the bundle as a side effect.
 */

import { openImageEditor } from './ImageEditor'
import { PAGE_ATTR, PAGE_CHROME_ATTR } from './PageLayout'

/**
 * Where a block belongs, and which child of it the caret is inside.
 *
 * In `flow` mode the surface holds the document's blocks directly, so "the child of the
 * surface the caret is inside" is the paragraph to insert after. In `page` mode it holds
 * *sheets*, and the blocks are one level further down -- so that same climb lands on the
 * whole page and the block is inserted after everything on it. A page break put in that
 * way breaks after the page the caret is on instead of at the caret: the banner the author
 * meant to push stays exactly where it was, and a new sheet appears past the end of the
 * document.
 *
 * So the container is the caret's sheet when it has one, and the surface otherwise. The
 * repagination that follows the insertion redistributes from there, which is why this only
 * has to know which sheet the block came from, never which one it ends up on.
 */
const isChrome = (n: Element | null): boolean => !!n && n.hasAttribute(PAGE_CHROME_ATTR)

/** The first thing on `sheet` the author can actually put a caret in. */
const firstBlock = (sheet: Element | null): HTMLElement | null => {
    let n = sheet?.firstElementChild ?? null
    while (isChrome(n)) n = n!.nextElementSibling
    return n as HTMLElement | null
}

/**
 * An empty paragraph the author is not using — `<p><br></p>`, the placeholder every editor
 * leaves behind so there is somewhere to type. A block dropped next to one of these should
 * take its place rather than sit under it: after a page break the caret is in exactly such a
 * paragraph, and inserting after it opens the page with a blank line the author then has to
 * delete before the banner sits at the top of the sheet.
 */
const isBlankParagraph = (n: Node | null): n is HTMLElement =>
    !!n && n.nodeType === 1 && (n as Element).tagName === 'P'
    && !(n as Element).textContent!.trim()
    && ![...(n as Element).children].some(c => c.tagName !== 'BR')

const flowAnchor = (editorRoot: HTMLElement, node: Node) => {
    const el = node.nodeType === 1 ? node as Element : node.parentElement
    const sheet = el?.closest<HTMLElement>(`[${PAGE_ATTR}]`)
    const container: HTMLElement = sheet && editorRoot.contains(sheet) ? sheet : editorRoot

    let anchor: Node | null = node
    while (anchor && anchor.parentNode && anchor.parentNode !== container) anchor = anchor.parentNode
    return { container, anchor: anchor && anchor.parentNode === container ? anchor : null }
}

/**
 * Put `el` on the surface as a flow-level block and leave the caret after it.
 *
 * A page-sized block cannot be inserted at the caret the way an inline widget can: dropped
 * inside a `<p>` it becomes a block box in an inline context, and the paragraph's own
 * margins push it off the sheet it is supposed to fill. So climb to the flow-level ancestor
 * — the child of the sheet, or of the surface, the caret is inside — and insert after that
 * instead. See `flowAnchor` for why the sheet matters.
 */
/** The last thing on `container` the author can put a caret in, skipping page chrome. */
const lastBlock = (container: Element): Element | null => {
    let n = container.lastElementChild
    while (isChrome(n)) n = n!.previousElementSibling
    return n
}

/**
 * The range an insertion should happen at: the author's caret when there is one, and the
 * end of the document when there is not.
 *
 * Without the fallback every item on the insert menu is dead whenever the surface has lost
 * focus — a blurred shadow root reports `rangeCount === 0`, and the menu's own `mousedown`
 * guard only protects the caret that was already there. Opening the menu straight after a
 * dialog, a click on the page chrome, or a fresh load leaves nothing to insert *at*, and the
 * author gets a menu that reacts to nothing at all with no way to tell why.
 *
 * The end of the document is the right place to land: it is what an author who has not
 * pointed anywhere means by "insert", it is where `insertContainer` already puts one, and
 * the caret `insertAsBlock` leaves behind afterwards shows them where it went.
 *
 * Note the containment test — a caret sitting in some *other* editable on the page (or in
 * the toolbar's own fields) is not this document's caret, and inserting there would put the
 * block outside the surface entirely.
 */
export const insertionRange = (editorRoot: HTMLElement): Range => {
    const root = editorRoot.getRootNode()
    const sel: Selection | null = root instanceof ShadowRoot
        ? (root as any).getSelection?.() ?? null
        : editorRoot.ownerDocument.defaultView!.getSelection()

    // `rangeCount` first: `getRangeAt(0)` throws IndexSizeError on an empty selection, and
    // the throw is what used to take the whole insert action down with it.
    if (sel && sel.rangeCount > 0) {
        const r = sel.getRangeAt(0)
        if (editorRoot.contains(r.commonAncestorContainer)) return r
    }

    // Down to the last block of the last sheet, so that in `page` mode the fallback lands
    // *on* a page rather than after the last one, where repagination would have to rescue it.
    let end: Element = editorRoot
    const last = lastBlock(editorRoot)
    if (last) {
        end = last
        if (last.hasAttribute(PAGE_ATTR)) end = lastBlock(last) ?? last
    }

    const r = editorRoot.ownerDocument.createRange()
    r.selectNodeContents(end)
    r.collapse(false)
    return r
}

export const insertAsBlock = (editorRoot: HTMLElement, range: Range, el: HTMLElement) => {
    const doc = editorRoot.ownerDocument

    const { container, anchor } = flowAnchor(editorRoot, range.startContainer)
    if (isBlankParagraph(anchor)) container.replaceChild(el, anchor)
    else if (anchor) container.insertBefore(el, anchor.nextSibling)
    else container.appendChild(el)

    // Where the caret goes: the next block along. A block that finishes a sheet is followed
    // by the next sheet's first block, not by nothing — inventing a paragraph there would
    // leave litter in the middle of the document for the author to delete.
    //
    // The page-number strip is not a block. It is the sheet's last child in `page` mode and
    // it is `contenteditable="false"`, so a caret left in it is quietly relocated by the
    // browser — and the *next* insertion reads that relocated caret and lands nowhere near
    // where the author is looking. Skipping it is what makes "break, then insert" work at
    // the end of the document.
    let after = el.nextElementSibling as HTMLElement | null
    if (isChrome(after)) after = null
    if (!after && container !== editorRoot) after = firstBlock(container.nextElementSibling)

    // Only at the true end of the document is there nowhere to type, and that does need a
    // landing paragraph rather than a document that cannot be continued. Placed right after
    // the block for the same reason: appending would put it past the page strip.
    if (!after) {
        after = doc.createElement('p')
        after.appendChild(doc.createElement('br'))
        container.insertBefore(after, el.nextSibling)
    }

    const r = doc.createRange()
    r.setStart(after, 0)
    r.collapse(true)
    const root = editorRoot.getRootNode()
    const sel = root instanceof ShadowRoot ? (root as any).getSelection?.() : window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(r)
}

/**
 * Hand `el`'s image attribute to the shared image editor.
 *
 * `wui-image-editor` is the editor's one image dialog — the same crop/replace/restore panel
 * an ordinary `<img>` gets — and it works on an `<img>`. These plugins have no light-DOM
 * image to give it, so it gets a hidden proxy instead, seeded from the attribute, with
 * `onApply` diverting the result back to the attribute rather than to the proxy's `src`.
 *
 * One proxy **per host**, kept alive in a WeakMap, because the proxy is where the dialog
 * records `data-image-origin` — the pre-crop URL that "Restore original" restores to, and
 * that keeps a second crop from compounding on the first. A single shared proxy loses that
 * on every open, so Restore never appears; worse, `rememberImageOrigin` refuses to overwrite
 * an origin that is already on record, so the second block to be edited would inherit the
 * first one's original and Restore would put the *wrong* picture back.
 *
 * The proxy lives in `el.getRootNode()` — the editor's own shadow root — on purpose:
 * `openImageEditor` mounts its dialog into the image's root node, and a proxy parked inside
 * the cover's `overflow: hidden`, one-page-tall box would clip the dialog out of existence.
 */
const proxies = new WeakMap<HTMLElement, HTMLImageElement>()

export const editImageAttr = (el: HTMLElement, attr: string) => {
    const root = el.getRootNode()
    const host = (root instanceof ShadowRoot ? root : document.body) as ParentNode & Node

    let proxy = proxies.get(el)
    if (!proxy || !proxy.isConnected) {
        proxy = document.createElement('img')
        proxy.setAttribute('data-wui-block-proxy', '')
        proxy.style.display = 'none'
        host.appendChild(proxy)
        proxies.set(el, proxy)
    }

    // Only when it actually differs: assigning the same value still restarts the load, and
    // the dialog measures the image as soon as it opens.
    const src = el.getAttribute(attr) ?? ''
    if ((proxy.getAttribute('src') ?? '') !== src) proxy.setAttribute('src', src)

    openImageEditor(proxy, { onApply: next => el.setAttribute(attr, next) })
}

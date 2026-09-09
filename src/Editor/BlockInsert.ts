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

/**
 * Put `el` on the surface as a flow-level block and leave the caret after it.
 *
 * A page-sized block cannot be inserted at the caret the way an inline widget can: dropped
 * inside a `<p>` it becomes a block box in an inline context, and the paragraph's own
 * margins push it off the sheet it is supposed to fill. So climb to the flow-level ancestor
 * — the child of the surface the caret is inside — and insert after that instead.
 */
export const insertAsBlock = (editorRoot: HTMLElement, range: Range, el: HTMLElement) => {
    const doc = editorRoot.ownerDocument

    let anchor: Node | null = range.startContainer
    while (anchor && anchor.parentNode && anchor.parentNode !== editorRoot) anchor = anchor.parentNode
    if (anchor && anchor.parentNode === editorRoot) editorRoot.insertBefore(el, anchor.nextSibling)
    else editorRoot.appendChild(el)

    // A block inserted as the last child leaves nowhere to type; give the author a landing
    // paragraph rather than a document that cannot be continued.
    let after = el.nextElementSibling as HTMLElement | null
    if (!after) {
        after = doc.createElement('p')
        after.appendChild(doc.createElement('br'))
        editorRoot.appendChild(after)
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

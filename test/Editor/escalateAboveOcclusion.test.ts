import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render } from 'woby'
import { openImageEditor } from '../../src/Editor/ImageEditor'
import { ImageDialog, INSERT_IMAGE_EVENT } from '../../src/Editor/ImageDialog'
import { composedParent } from '../../src/helper/composedParent'
import { ESCALATED_Z_INDEX, escalateAboveOcclusion, shadowHostsOf } from '../../src/helper/escalateAboveOcclusion'

/**
 * `escalateAboveOcclusion`, driven through the two dialogs that call it.
 *
 * happy-dom does no layout and no hit-testing, so both are stubbed with a small
 * paint-order model: every displayed element fills the viewport, and the element
 * painted at a point is the `data-cover` / `role="dialog"` candidate that wins CSS
 * stacking -- stacking contexts (positioned + z-index) compared outermost first, tree
 * order breaking ties, across shadow boundaries. That is what makes the assertions
 * below about *who paints on top*, not merely about which inline values got written:
 * escalating only the innermost host of a nested dialog leaves it under the cover in
 * this model, exactly as it would in a browser.
 */

// --- the paint-order model ------------------------------------------------------

const displayed = (el: Element): boolean => {
    for (let n: Element | null = el; n; n = composedParent(n))
        if ((n as HTMLElement).style?.display === 'none') return false
    return el.isConnected
}

const zOf = (el: Element): number | null => {
    const s = (el as HTMLElement).style
    const pos = s?.position
    const z = s?.zIndex
    if (!pos || pos === 'static' || !z || z === 'auto') return null
    return Number(z)
}

/** Composed ancestry, outermost first, ending at `el`. */
const path = (el: Element): Element[] => {
    const out: Element[] = []
    for (let n: Element | null = el; n; n = composedParent(n)) out.unshift(n)
    return out
}

/** Stacking contexts on the way down to `el`, plus `el` itself as the leaf. */
const chain = (el: Element): Element[] =>
    [...path(el).slice(0, -1).filter(n => zOf(n) !== null), el]

/** Composed tree order of two elements: negative when `a` comes first. */
const treeOrder = (a: Element, b: Element): number => {
    const pa = path(a), pb = path(b)
    let i = 0
    while (i < pa.length && i < pb.length && pa[i] === pb[i]) i++
    if (i === pa.length) return -1
    if (i === pb.length) return 1
    const siblings = Array.from(pa[i].parentNode!.childNodes)
    return siblings.indexOf(pa[i]) - siblings.indexOf(pb[i])
}

/** Positive when `a` paints above `b`. */
const paintsAbove = (a: Element, b: Element): number => {
    const ca = chain(a), cb = chain(b)
    let i = 0
    while (i < ca.length && i < cb.length && ca[i] === cb[i]) i++
    if (i === ca.length) return -1                 // `b` is inside `a`: the descendant is on top
    if (i === cb.length) return 1
    const za = zOf(ca[i]) ?? 0, zb = zOf(cb[i]) ?? 0
    return za !== zb ? za - zb : treeOrder(ca[i], cb[i])
}

const topmost = (): Element | null => {
    const all: Element[] = []
    const collect = (root: Document | ShadowRoot) => root.querySelectorAll('*').forEach(e => {
        if (e.matches('[data-cover], [role="dialog"]') && displayed(e)) all.push(e)
        if (e.shadowRoot) collect(e.shadowRoot)
    })
    collect(document)
    return all.sort(paintsAbove).pop() ?? null
}

/** `elementFromPoint` retargets to the scope it is called on. */
const retarget = (el: Element | null, scope: Document | ShadowRoot): Element | null => {
    for (let n = el; n; n = composedParent(n)) if (n.getRootNode() === scope) return n
    return null
}

const installPaintModel = () => {
    const rect = (w: number, h: number) => ({ left: 0, top: 0, right: w, bottom: h, width: w, height: h, x: 0, y: 0, toJSON() { } })
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
        return (displayed(this) ? rect(innerWidth, innerHeight) : rect(0, 0)) as DOMRect
    })
    ;(document as any).elementFromPoint = () => retarget(topmost(), document)
    ;(ShadowRoot.prototype as any).elementFromPoint = function (this: ShadowRoot) { return retarget(topmost(), this) }
}

// --- fixtures -------------------------------------------------------------------

const frame = () => new Promise<void>(r => requestAnimationFrame(() => r()))
const escape = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
const clearBody = () => document.body.replaceChildren()

const addCover = (z = 5000) => {
    const c = document.createElement('div')
    c.setAttribute('data-cover', '')
    c.style.position = 'fixed'
    c.style.zIndex = String(z)
    document.body.appendChild(c)
    return c
}

/** A plain element with an open shadow root, standing in for any widget's host. */
const shadowHost = (parent: Node, tag: string) => {
    const el = document.createElement(tag)
    el.attachShadow({ mode: 'open' })
    parent.appendChild(el)
    return el
}

const styleSnapshot = (els: Element[]) => els.map(e => e.getAttribute('style'))

/** Each dialog, reduced to: open it (returning its root), close it. */
interface Harness {
    open(): Promise<HTMLElement>
    close(): void
}

/** `openImageEditor` on an image living in `scope` -- `hostFor()` mounts there. */
const imageEditorIn = (scope: Node): Harness => {
    const img = document.createElement('img')
    img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACw='
    scope.appendChild(img)
    return {
        async open() {
            openImageEditor(img)
            await frame()
            const host = (img.getRootNode() as ParentNode).querySelector('wui-image-editor')!
            const root = host.shadowRoot!.querySelector('[data-image-editor]') as HTMLElement
            expect(root, 'the image editor rendered its dialog').toBeTruthy()
            expect(root.style.display, 'the image editor opened').toBe('flex')
            await frame()
            return root
        },
        close: escape,
    }
}

/** `ImageDialog` rendered into a shadow host under `scope`, as `<wui-editor>` renders it. */
const imageDialogIn = (scope: Node, disposers: (() => void)[]): Harness => {
    const host = shadowHost(scope, 'x-editor-host')
    disposers.push(render(ImageDialog as any, host.shadowRoot!))
    return {
        async open() {
            await frame()
            // Composed so the request reaches ImageDialog's document listener from inside
            // an outer shadow root too; the editor's own dispatches are bubbling only.
            host.dispatchEvent(new CustomEvent(INSERT_IMAGE_EVENT, { bubbles: true, composed: true, detail: {} }))
            const root = host.shadowRoot!.querySelector('[data-image-dialog]') as HTMLElement
            expect(root, 'the image dialog rendered').toBeTruthy()
            expect(root.style.display, 'the image dialog opened').toBe('flex')
            await frame()
            return root
        },
        close: escape,
    }
}

// --- the contract ---------------------------------------------------------------

const dialogs: [string, (scope: Node, d: (() => void)[]) => Harness][] = [
    ['ImageEditor', s => imageEditorIn(s)],
    ['ImageDialog', imageDialogIn],
]

describe.each(dialogs)('%s stacking self-awareness', (_name, make) => {
    let disposers: (() => void)[]

    beforeEach(() => {
        disposers = []
        installPaintModel()
    })

    afterEach(() => {
        disposers.forEach(d => d())
        clearBody()
        vi.restoreAllMocks()
    })

    it('touches no ancestor when nothing covers it', async () => {
        const d = make(document.body, disposers)
        const root = await d.open()
        expect(root.style.display).toBe('flex')
        const ancestors = path(root).slice(0, -1)
        const before = styleSnapshot(ancestors)
        await frame()
        expect(topmost()).toBe(root)
        expect(styleSnapshot(ancestors)).toEqual(before)
        expect(shadowHostsOf(root).every(h => h.style.zIndex === '')).toBe(true)
        d.close()
    })

    it('climbs above a higher-z sibling in document.body, and paints on top', async () => {
        const d = make(document.body, disposers)
        const cover = addCover()
        const root = await d.open()
        expect(topmost(), 'the dialog paints above the cover').toBe(root)
        const [host] = shadowHostsOf(root)
        expect(host.parentNode).toBe(document.body)
        expect(host.style.zIndex).toBe(ESCALATED_Z_INDEX)
        expect(host.style.position).toBe('relative')

        d.close()
        expect(host.hasAttribute('style'), 'no style attribute left behind').toBe(false)
        expect(root.style.display).toBe('none')
        expect(topmost()).toBe(cover)
    })

    it('escalates every shadow host between a nested dialog and the document', async () => {
        // Two widget hosts around the dialog's own; the outermost is a stacking context
        // a page author set, which is what makes raising the inner hosts alone useless.
        const outer = shadowHost(document.body, 'x-shell')
        outer.style.position = 'relative'
        outer.style.zIndex = '1'
        const middle = shadowHost(outer.shadowRoot!, 'x-panel')
        const d = make(middle.shadowRoot!, disposers)
        addCover()

        const root = await d.open()
        const hosts = shadowHostsOf(root)
        expect(hosts.length).toBe(3)
        expect(hosts.slice(1)).toEqual([middle, outer])
        expect(hosts.every(h => h.style.zIndex === ESCALATED_Z_INDEX)).toBe(true)
        expect(topmost(), 'the dialog paints above the cover').toBe(root)

        // Put back just the outer host: the dialog is under the cover again -- the inner
        // escalations alone do not lift it out of the shell's stacking context.
        outer.style.zIndex = '1'
        expect(topmost()).not.toBe(root)
        outer.style.zIndex = ESCALATED_Z_INDEX

        d.close()
        expect(outer.style.position).toBe('relative')
        expect(outer.style.zIndex).toBe('1')
        expect(middle.hasAttribute('style')).toBe(false)
        expect(hosts[0].hasAttribute('style')).toBe(false)
    })

    it('restores exact inline styles across repeated open/close cycles', async () => {
        const d = make(document.body, disposers)
        addCover()
        const host = shadowHostsOf(await d.open())[0]
        d.close()
        host.style.position = 'absolute'
        host.style.zIndex = '7'
        const original = host.getAttribute('style')

        for (let i = 0; i < 3; i++) {
            const root = await d.open()
            expect(topmost()).toBe(root)
            expect(host.style.zIndex).toBe(ESCALATED_Z_INDEX)
            expect(host.style.position, 'a positioned host keeps its position').toBe('absolute')
            d.close()
            expect(host.getAttribute('style')).toBe(original)
        }
    })
})

describe('escalateAboveOcclusion timing', () => {
    afterEach(() => {
        clearBody()
        vi.restoreAllMocks()
    })

    it('a close before the probe frame cancels the probe', async () => {
        installPaintModel()
        const host = shadowHost(document.body, 'x-dialog-host')
        const root = document.createElement('div')
        root.setAttribute('role', 'dialog')
        host.shadowRoot!.appendChild(root)
        addCover()

        const undo = escalateAboveOcclusion(root)
        undo()
        await frame()
        expect(host.hasAttribute('style')).toBe(false)
    })
})

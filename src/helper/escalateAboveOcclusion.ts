import { deepElementFromPoint } from './deepElementFromPoint'
import { composedContains, composedParent } from './composedParent'

/**
 * Lift a just-opened modal above whatever is painting over it, and only then.
 *
 * wui's image dialogs are `fixed inset-0 z-[1200]` overlays, but a z-index only
 * competes inside its own stacking context: the dialog lives in the shadow root of
 * its custom-element host, and when a host page stacks something over *that host*
 * the dialog loses however large its own z-index is. Which side wins is undecidable
 * from styles alone, so this asks the paint order directly -- a hit-test at the
 * centre of the shown dialog -- and intervenes only when something else is on top.
 *
 * When covered, every shadow host between the dialog and the document is raised to
 * Int32-max (`2147483647`, the same value the consumer-side workaround used), one per
 * shadow boundary crossed: a dialog mounted inside another widget's shadow root sits
 * behind two hosts, and raising only the inner one does nothing for how the outer one
 * competes with its siblings.
 *
 * Call it right after the dialog root is shown; the probe waits one animation frame so
 * it measures the layout the page actually painted. The returned closure cancels a
 * probe still pending or puts every touched host's inline `position`/`z-index` back
 * exactly (including removing a `style` attribute that was not there before). It is
 * idempotent, so a close path may call it unconditionally.
 *
 * @module escalateAboveOcclusion
 */

/** Int32 max: nothing can be stacked above it, only tied with and out-ordered. */
export const ESCALATED_Z_INDEX = '2147483647'

/** A cover is anything the centre hit-test lands on that is neither the dialog (or
 *  inside it) nor one of the dialog's own ancestors -- a hit on an ancestor means the
 *  dialog paints nothing there, which no escalation would change. */
export const isCovered = (root: Element): boolean => {
    const r = root.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) return false          // not shown: nothing to judge
    const hit = deepElementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2)
    if (!hit) return false                                     // nothing we can name: stay conservative
    return !composedContains(root, hit) && !composedContains(hit, root)
}

/** Every shadow host between `el` and the document, innermost first. */
export const shadowHostsOf = (el: Element): HTMLElement[] => {
    const hosts: HTMLElement[] = []
    for (let n: Node | null = el; n && n !== document.documentElement;) {
        const p = composedParent(n)
        if (p && n.parentNode instanceof ShadowRoot) hosts.push(p as HTMLElement)
        n = p
    }
    return hosts
}

interface Saved { el: HTMLElement; hadStyle: boolean; position: string; zIndex: string }

const escalate = (targets: HTMLElement[]): Saved[] => targets.map(el => {
    const saved: Saved = { el, hadStyle: el.hasAttribute('style'), position: el.style.position, zIndex: el.style.zIndex }
    const pos = getComputedStyle(el).position
    if (!pos || pos === 'static') el.style.position = 'relative'
    el.style.zIndex = ESCALATED_Z_INDEX
    return saved
})

const restore = (saved: Saved[]) => {
    for (const { el, hadStyle, position, zIndex } of saved) {
        el.style.position = position
        el.style.zIndex = zIndex
        if (!hadStyle && !el.getAttribute('style')) el.removeAttribute('style')
    }
}

/**
 * Probe whether `root` (a shown modal) is covered and, if so, raise every shadow host
 * on its composed ancestry above the cover. Returns the undo.
 */
export const escalateAboveOcclusion = (root: HTMLElement): (() => void) => {
    let saved: Saved[] | null = null
    let done = false

    const probe = () => {
        frame = 0
        if (done || !root.isConnected || !isCovered(root)) return
        saved = escalate(shadowHostsOf(root))
    }

    const raf = typeof requestAnimationFrame === 'function'
    let frame: number = raf ? requestAnimationFrame(probe) : setTimeout(probe, 0) as unknown as number

    return () => {
        if (done) return
        done = true
        if (frame) {
            if (raf) cancelAnimationFrame(frame)
            else clearTimeout(frame)
        }
        if (saved) restore(saved)
        saved = null
    }
}

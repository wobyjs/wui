/**
 * Shadow-piercing ancestor walks. The plain DOM ones (`parentElement`, `closest`,
 * `contains`) stop at a shadow root; wui's chrome lives behind one almost
 * everywhere, so anything that asks "what is around me" has to step out through
 * `ShadowRoot.host` instead.
 *
 * @module composedParent
 */

/** The composed (shadow-crossing) parent of a node, or null at the document. */
export const composedParent = (n: Node): Element | null => {
    const p: Node | null = n instanceof ShadowRoot ? n.host : n.parentNode
    if (p instanceof ShadowRoot) return p.host
    return p instanceof Element ? p : null
}

/** `closest` that walks out of open shadow roots, matching anywhere on the composed chain. */
export const composedClosest = (start: Element, selector: string): Element | null => {
    if (!selector) return null
    let n: Node | null = start
    while (n) {
        if (n instanceof Element && n.matches(selector)) return n
        n = n instanceof ShadowRoot ? n.host : n.parentNode
    }
    return null
}

/** `contains` over the composed tree: true when `node` is `ancestor` or sits anywhere
 *  under it, including inside shadow roots nested below it. */
export const composedContains = (ancestor: Node, node: Node | null): boolean => {
    for (let n: Node | null = node; n; n = composedParent(n))
        if (n === ancestor) return true
    return false
}

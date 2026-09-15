/**
 * `document.elementFromPoint` stops at the shadow host: content inside an open
 * shadow root is reported as the host element, which is retargeting working as
 * designed — but an occlusion check wants the element actually painted at the
 * point. This walks down through every open shadow root at the coordinates and
 * returns the innermost element there. Closed roots are opaque by design and
 * stop the walk, exactly as they stop the plain DOM call.
 *
 * @module deepElementFromPoint
 */
export const deepElementFromPoint = (x: number, y: number): Element | null => {
    let el = document.elementFromPoint(x, y)
    const seen = new Set<Element>()
    while (el && el.shadowRoot && !seen.has(el)) {
        seen.add(el)
        el = el.shadowRoot.elementFromPoint(x, y) ?? el
    }
    return el
}

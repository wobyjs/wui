import { $$ } from 'woby'
import { getEditorPlugins } from './EditorPlugin'
import { deleteRefusalReason } from './PropertyExtractor'

/**
 * Keyboard navigation between the *boxes* in the document -- embedded components and
 * images -- as opposed to the caret navigation the browser gives you between characters.
 *
 * A caret cannot live inside a shadow host, so once a component is selected the arrow
 * keys have nothing useful to do natively: the browser either drops the selection or
 * steps the caret past the whole component in one go. This module makes the arrows step
 * from component to component instead, and gives Enter something to do as well -- open a
 * fresh line underneath the selected component, which is otherwise surprisingly hard to
 * reach when a component is the last thing in the document.
 *
 * `data-element-selected` stays the single source of truth for what is selected; nothing
 * here holds state of its own. Callers move the mark, this module only says where to.
 */

export type NavDirection = 'prev' | 'next' | 'up' | 'down'

const ARROW_DIRECTIONS: Record<string, NavDirection> = {
    ArrowLeft: 'prev',
    ArrowRight: 'next',
    ArrowUp: 'up',
    ArrowDown: 'down',
}

/** The direction an arrow key means, or null for any other key. */
export const arrowDirection = (key: string): NavDirection | null => ARROW_DIRECTIONS[key] ?? null

/**
 * Is this element one of the boxes navigation stops on?
 *
 * The same test the capture-phase pointerdown handler in Editor.tsx uses to decide what a
 * click selects -- a registered plugin tag, or any other custom element that is not one of
 * the editor's own `wui-` chrome -- plus images, which are selectable by clicking too but
 * through ImageResizer rather than through the mark.
 *
 * Anything `deleteRefusalReason` rejects is skipped: those are boxes you cannot act on
 * (the document root, table structure, the internals of a component), so landing on one
 * would be a selection that does nothing. A zero-sized box is skipped for the same
 * reason -- there is nothing on screen to show as selected.
 */
const isNavigable = (el: HTMLElement, surface: HTMLElement, pluginTags: Set<string>) => {
    const tag = el.tagName.toLowerCase()
    const component = pluginTags.has(el.tagName) || (tag.includes('-') && !tag.startsWith('wui-'))
    if (!component && el.tagName !== 'IMG') return false
    if (deleteRefusalReason(el, surface)) return false
    const r = el.getBoundingClientRect()
    return r.width > 0 || r.height > 0
}

/** Every navigable box in `surface`, in document order. */
export const navigableBoxes = (surface: HTMLElement): HTMLElement[] => {
    const pluginTags = new Set($$(getEditorPlugins()).map(p => p.tagName.toUpperCase()))
    return Array.from(surface.querySelectorAll<HTMLElement>('*'))
        .filter(el => isNavigable(el, surface, pluginTags))
}

/**
 * The box an arrow key moves to, or null when there is nowhere to go.
 *
 * Left/right walk the list in document order, which is the order the boxes are read in and
 * the only order that can reach every one of them. Up/down are geometric: the nearest box
 * wholly above or below the current one, ties broken on horizontal distance, so a grid or
 * a row of side-by-side components behaves the way it looks rather than the way it is
 * nested. When nothing qualifies -- the current box is on the last row -- they fall back
 * to document order so the keys are never dead.
 *
 * `current` need not itself be navigable: the property panel's parent arrow can park the
 * mark on a plain container. That case enters the list at the container's document
 * position instead of failing.
 */
export const navigateFrom = (current: HTMLElement, dir: NavDirection, boxes: HTMLElement[]): HTMLElement | null => {
    const index = boxes.indexOf(current)

    if (index === -1) {
        const following = boxes.findIndex(b =>
            !!(current.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING))
        if (dir === 'next' || dir === 'down') return following === -1 ? null : boxes[following]
        const preceding = (following === -1 ? boxes.length : following) - 1
        return preceding < 0 ? null : boxes[preceding]
    }

    if (dir === 'prev') return boxes[index - 1] ?? null
    if (dir === 'next') return boxes[index + 1] ?? null

    const rect = current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let best: HTMLElement | null = null
    let bestScore = Infinity
    for (const box of boxes) {
        if (box === current) continue
        const r = box.getBoundingClientRect()
        // Strictly on the requested side. A box that merely overlaps the current row is
        // neither above nor below it -- and this is also what keeps an ancestor or a
        // descendant, whose rect always overlaps, out of the running.
        if (dir === 'up' ? r.bottom > rect.top + 1 : r.top < rect.bottom - 1) continue
        const dy = Math.abs(r.top + r.height / 2 - cy)
        const dx = Math.abs(r.left + r.width / 2 - cx)
        // Vertical distance dominates so the adjacent row always wins; horizontal distance
        // only chooses between the boxes on it.
        const score = dy * 2 + dx
        if (score < bestScore) { bestScore = score; best = box }
    }
    return best ?? navigateFrom(current, dir === 'up' ? 'prev' : 'next', boxes)
}

/**
 * Containers a `<p>` may not be inserted into, whatever the layout looks like.
 *
 * Not a style judgement -- these are the cases where the browser would refuse the markup.
 * A paragraph inside a paragraph, a heading or a `<span>` is phrasing content in a place
 * that takes none, and the next parse tears it back out. A paragraph inside a list or a
 * table is the opposite problem: those containers take only `li`, `tr`, `dt`/`dd`. Both
 * kinds are climbed past, up to the nearest ancestor that can legally hold the line.
 *
 * Nothing else causes a climb. A component inside a flex row gets its new line inside that
 * row, next to it, because that is where the component lives -- selecting the row itself
 * with the property panel's parent arrow is how you ask for a line after the whole row.
 */
const CANNOT_HOLD_PARAGRAPH = new Set([
    'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'PRE',
    'SPAN', 'A', 'EM', 'STRONG', 'B', 'I', 'U', 'S', 'CODE', 'SMALL', 'SUB', 'SUP', 'LABEL',
    'UL', 'OL', 'DL', 'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'SELECT',
])

/**
 * The element the new line is inserted after: `el` itself, unless its parent cannot legally
 * hold a paragraph, in which case the nearest ancestor whose parent can. The surface always
 * stops the climb; it is a flow container by construction.
 */
const paragraphAnchor = (el: HTMLElement, surface: HTMLElement): HTMLElement => {
    let anchor = el
    while (anchor.parentElement && anchor.parentElement !== surface
        && CANNOT_HOLD_PARAGRAPH.has(anchor.parentElement.tagName))
        anchor = anchor.parentElement
    return anchor
}

/**
 * Insert an empty paragraph immediately after `el` and return it, or null when `el` has
 * nowhere to be inserted after (it is the surface itself, or it is detached).
 *
 * "Immediately after" means in `el`'s own parent, so a component nested in a container gets
 * its line inside that container. Only `paragraphAnchor` moves the insertion point, and only
 * where the markup would otherwise be invalid.
 *
 * The `<br>` is what makes the paragraph reachable: an empty block has zero height and the
 * caret cannot be placed in it. Browsers write the same filler themselves when Enter
 * splits a paragraph.
 */
export const insertLineAfter = (el: HTMLElement, surface: HTMLElement): HTMLElement | null => {
    if (el === surface || !surface.contains(el)) return null
    const anchor = paragraphAnchor(el, surface)
    const parent = anchor.parentElement
    if (!parent) return null
    const doc = anchor.ownerDocument
    const line = doc.createElement('p')
    line.appendChild(doc.createElement('br'))
    parent.insertBefore(line, anchor.nextSibling)
    return line
}

/**
 * Put the caret at the start of `line`.
 *
 * `window.getSelection()`, never the shadow root's: Chrome's `ShadowRoot.getSelection` is
 * non-standard and a range set through it does not move the visible caret. Same choice
 * `deleteSelectedElement` documents.
 */
export const placeCaretIn = (line: HTMLElement) => {
    const sel = window.getSelection()
    if (!sel) return
    const range = line.ownerDocument.createRange()
    range.setStart(line, 0)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
}

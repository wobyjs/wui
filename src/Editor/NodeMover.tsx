import { $, $$, useEffect } from 'woby'
import { deleteRefusalReason } from './PropertyExtractor'
import { t } from '../i18n'

/**
 * NodeMover: drag-to-reposition for the editor's node selection.
 *
 * Embedded components cannot be moved the way ordinary content is. Dragging inside
 * `contenteditable` is a *selection* drag -- the browser picks up whatever the DOM
 * Selection covers -- and a shadow host is exactly what a Selection cannot cover, the
 * same boundary that makes Backspace over a <wui-button> a silent no-op. So a
 * <my-counter>, or the container holding a row of them, has no way to be dragged
 * anywhere: there is nothing for the browser to pick up. Images already have their own
 * answer to this in {@link ImageResizer}; this is the equivalent for everything the
 * node-selection mark can point at, which after the property panel's parent arrow means
 * plain containers too.
 *
 * The handle is a floating grip rendered *outside* the editable content, over the top-left
 * corner of the selected box. It has to live outside: anything appended into the surface
 * to act as a handle would be part of the document -- serialized into the saved HTML,
 * snapshotted by undo, and selectable as text. That also lets the handle be the anchor
 * indicator the selection outline used to draw with a `::before` glyph, which had to be
 * suppressed on every table-structural box because generated content on a <tr> gets
 * wrapped in an anonymous table cell and shifted the real cells sideways. A grip that is
 * not in the content cannot disturb the content's layout.
 *
 * There are two ways to pick a box up: the grip, and alt+drag on the element itself.
 * They exist for the same reason as the two ways to select one -- a container is a thing
 * you can see but not put a caret in, so both the selecting and the moving of it have to
 * be driven from a gesture of their own.
 *
 * Drop targeting deliberately mirrors how the box is laid out rather than always assuming
 * a vertical stack: inside a flex row -- the shape the demo's component container uses --
 * the insertion point is decided by the cursor's X against the midpoint of the box under
 * it, so components reorder along the row instead of only being able to land above or
 * below it.
 */

/** Side length of the square grip, in px. */
const HANDLE_SIZE = 16

/** Pixels the pointer must travel before a press turns into a drag rather than a click. */
const DRAG_THRESHOLD = 4

/**
 * A resolved drop: exactly the arguments for `parent.insertBefore(dragged, reference)`,
 * plus the viewport rect to draw the insertion caret in.
 *
 * Resolved to parent + reference rather than "next to this box" because the two are not
 * always the same thing. A drop onto a table cell has to land *inside* the cell; placing
 * it beside the cell would make the element a sibling of a <td> inside a <tr>, which is
 * not valid table markup.
 */
interface Placement {
    parent: Node
    /** insertBefore reference; null appends. */
    reference: Node | null
    /** Where to draw the caret, in viewport coordinates. */
    rect: { left: number; top: number; width: number; height: number }
}

/**
 * Boxes that belong to a table's grid rather than to the content flow. Nothing may be
 * inserted beside one of these. Cells are absent on purpose: a cell is an ordinary
 * containing block, and content drops into it happily.
 */
const TABLE_GRID = new Set(['TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'COL', 'COLGROUP', 'CAPTION'])

const NodeMover = () => {
    /** The marked element, or null when nothing is node-selected (or it cannot be moved). */
    const target = $<HTMLElement | null>(null)
    /** Grip position in the wrapper's coordinate space; null hides it. */
    const spot = $<{ left: number; top: number } | null>(null)
    const dragging = $(false)

    // `ref` takes an observable so the effect below re-runs once the element actually
    // mounts. A plain `let` assigned from a ref callback would leave the effect with
    // nothing to track, and it would run once against a null root and never retry.
    const rootRef = $<HTMLDivElement>()
    let gripEl: HTMLDivElement | null = null
    let indicatorEl: HTMLDivElement | null = null

    useEffect(() => {
        const root = $$(rootRef)
        if (!root) return

        // The positioned wrapper EditorSurface renders us into, and the editable surface
        // beside us. Found through our own parent rather than a document-wide query for
        // <wui-editor> so this keeps working in the toolbar-less variants and on a page
        // holding more than one editor.
        const wrapper = root.parentElement
        const surface = wrapper?.querySelector('[data-editor-root]') as HTMLElement | null
        if (!wrapper || !surface) return

        /**
         * Read the mark and decide whether it is something we can offer to move.
         *
         * Reuses the delete guard: what may not be deleted may not be dragged out of
         * place either, and for the same reasons -- the content root is not a node in the
         * document, a <td> belongs to its table's grid rather than to the flow, and a node
         * inside a component's shadow root is that component's business.
         */
        const readMark = () => {
            const marked = (surface.hasAttribute('data-element-selected')
                ? surface
                : surface.querySelector('[data-element-selected]')) as HTMLElement | null
            target(marked && !deleteRefusalReason(marked, surface) ? marked : null)
        }

        /** Park the grip just above the selected box's top-left corner. */
        const measure = () => {
            const el = $$(target)
            if (!el?.isConnected) { spot(null); return }
            const r = el.getBoundingClientRect()
            const w = wrapper.getBoundingClientRect()
            // The surface scrolls its own content and the grip is a sibling of it, so it
            // is never clipped: once the selected box has scrolled out of the visible
            // strip the clamp below would park the grip at the surface's top edge, over
            // content it has nothing to do with. Hide it until the box comes back.
            const s = surface.getBoundingClientRect()
            if (r.bottom < s.top || r.top > s.bottom) { spot(null); return }
            spot({
                left: Math.max(0, r.left - w.left - 2),
                top: Math.max(0, r.top - w.top - HANDLE_SIZE - 2),
            })
        }

        // One rAF per burst: a drag rewrites the tree and the observer would otherwise
        // fire measure() once per mutation record, for a position that only has to be
        // right at the end of the frame.
        let frame = 0
        const schedule = () => {
            if (frame) return
            frame = requestAnimationFrame(() => { frame = 0; readMark(); measure() })
        }

        // Attribute records catch the mark moving between elements -- it is set from the
        // capture-phase pointerdown handler, from the panel's parent arrow, and cleared on
        // the next keystroke. childList records catch the selected element being deleted
        // out from under us, which measure() turns into a hidden grip.
        const observer = new MutationObserver(schedule)
        observer.observe(surface, { attributes: true, attributeFilter: ['data-element-selected'], childList: true, subtree: true })

        // Capture-phase scroll: a scroll in any ancestor moves the box without touching the
        // DOM, so no mutation record would ever arrive.
        const onScroll = () => measure()
        const onResize = () => measure()
        window.addEventListener('scroll', onScroll, true)
        window.addEventListener('resize', onResize)
        // The surface is its own scroll container and lives in a shadow root. Scroll
        // events are not composed, so they never leave that root and the capture-phase
        // window listener above never sees them -- the surface has to be listened to
        // directly or the grip freezes while the document slides underneath it.
        surface.addEventListener('scroll', onScroll)

        /**
         * Where would a drop at these viewport coordinates land?
         *
         * `elementFromPoint` on the editor's shadow root stops at that tree, so a cursor
         * over a component's internals reports the host rather than some button inside it.
         * From there we climb to the nearest block-level box: inserting a container next
         * to, say, a <strong> would bury it inside a run of inline formatting, whereas the
         * first block-level ancestor is a real sibling slot in the flow.
         */
        const findPlacement = (clientX: number, clientY: number, dragged: HTMLElement): Placement | null => {
            const tree = surface.getRootNode() as ShadowRoot | Document
            const hit = tree.elementFromPoint?.(clientX, clientY) as HTMLElement | null
            if (!hit || !surface.contains(hit) || hit === surface) return null

            let box: HTMLElement | null = hit
            while (box && box !== surface) {
                const display = getComputedStyle(box).display
                if (display !== 'inline' && display !== 'contents') break
                box = box.parentElement
            }
            if (!box || box === surface) return null

            // A grid box cannot take a sibling, so the whole table stands in for it and the
            // element lands before or after the table in the surrounding flow. Cells are not
            // remapped: dropping into one is valid, and is the obvious reading of the gesture.
            if (TABLE_GRID.has(box.tagName)) {
                const table = box.closest('table') as HTMLElement | null
                if (!table || !surface.contains(table)) return null
                box = table
            }

            // Dropping onto itself is a no-op, and dropping into its own subtree would ask
            // the element to become its own descendant.
            if (box === dragged || dragged.contains(box)) return null

            const rect = box.getBoundingClientRect()

            // Onto a cell: land inside it, at whichever end of its children the cursor is
            // nearer. A cell stacks its content vertically, so the near edge is decided on Y.
            if (box.tagName === 'TD' || box.tagName === 'TH') {
                const atStart = clientY < rect.top + rect.height / 2
                return {
                    parent: box,
                    reference: atStart ? box.firstChild : null,
                    rect: { left: rect.left, top: (atStart ? rect.top : rect.bottom) - 1, width: rect.width, height: 2 },
                }
            }

            const parent = box.parentElement
            if (!parent) return null

            // Horizontal when the neighbours actually sit side by side: a flex/grid row, or
            // an inline-level box such as a <wui-button> sharing a line with its siblings.
            const parentStyle = getComputedStyle(parent)
            const boxStyle = getComputedStyle(box)
            const rowLayout = (parentStyle.display === 'flex' || parentStyle.display === 'inline-flex')
                ? parentStyle.flexDirection.startsWith('row')
                : (parentStyle.display === 'grid' || parentStyle.display === 'inline-grid')
                    ? true
                    : boxStyle.display.startsWith('inline')
            const before = rowLayout
                ? clientX < rect.left + rect.width / 2
                : clientY < rect.top + rect.height / 2
            return {
                parent,
                reference: before ? box : box.nextSibling,
                rect: rowLayout
                    ? { left: (before ? rect.left : rect.right) - 1, top: rect.top, width: 2, height: rect.height }
                    : { left: rect.left, top: (before ? rect.top : rect.bottom) - 1, width: rect.width, height: 2 },
            }
        }

        /** Draw the insertion caret for a placement, or hide it when there is none. */
        const paintIndicator = (placement: Placement | null) => {
            const bar = indicatorEl
            if (!bar) return
            if (!placement) { bar.style.display = 'none'; return }
            const w = wrapper.getBoundingClientRect()
            bar.style.display = 'block'
            bar.style.left = `${placement.rect.left - w.left}px`
            bar.style.top = `${placement.rect.top - w.top}px`
            bar.style.width = `${placement.rect.width}px`
            bar.style.height = `${placement.rect.height}px`
        }

        /**
         * @param explicit  The element to move, when the caller already knows it. The
         *                  alt+drag path passes this: EditorSurface marks the box on the
         *                  pointerdown of the very same gesture, one event earlier, and the
         *                  `target` observable does not catch up until the next animation
         *                  frame -- so reading the observable here would drag the *previous*
         *                  selection, or nothing at all on the first gesture.
         */
        const startDrag = (down: MouseEvent, explicit?: HTMLElement) => {
            const dragged = explicit ?? $$(target)
            if (!dragged) return
            // The grip sits over the editable surface; without this the press would run the
            // editor's own pointerdown handling and clear the very mark being dragged.
            down.preventDefault()
            down.stopPropagation()

            let started = false
            let placement: Placement | null = null

            // elementFromPoint reports the topmost box, which for most of the drag is the
            // element being dragged. Taking it out of hit testing is what lets the cursor
            // see the boxes it is being dropped between.
            const origPointerEvents = dragged.style.pointerEvents

            const onMove = (move: MouseEvent) => {
                if (!started) {
                    if (Math.abs(move.clientX - down.clientX) < DRAG_THRESHOLD
                        && Math.abs(move.clientY - down.clientY) < DRAG_THRESHOLD) return
                    started = true
                    dragging(true)
                    dragged.style.pointerEvents = 'none'
                }
                placement = findPlacement(move.clientX, move.clientY, dragged)
                paintIndicator(placement)
            }

            const onUp = () => {
                document.removeEventListener('mousemove', onMove)
                document.removeEventListener('mouseup', onUp)
                paintIndicator(null)
                dragging(false)
                if (!started) return

                // Restoring the property rather than clearing it: the element may have been
                // authored with its own pointer-events, and this is content, not chrome.
                if (origPointerEvents) dragged.style.pointerEvents = origPointerEvents
                else dragged.style.removeProperty('pointer-events')
                if (!dragged.getAttribute('style')) dragged.removeAttribute('style')

                if (placement) {
                    placement.parent.insertBefore(dragged, placement.reference)
                    // The mark rides along on the element, so the selection survives the move
                    // and the grip simply re-measures against the new position.
                    measure()
                    // Undo already sees this: EditorSurface's MutationObserver calls saveDo()
                    // for any change under the surface. This is the notification for code
                    // outside the editor, matching what an image drop dispatches.
                    const host = (surface.getRootNode() as ShadowRoot).host
                    host?.dispatchEvent(new CustomEvent('editor-change', { bubbles: true, composed: true }))
                }
            }

            document.addEventListener('mousemove', onMove)
            document.addEventListener('mouseup', onUp)
        }

        // Direct assignment rather than an onMouseDown prop: woby's synthetic event
        // delegation is rooted at the document and does not reach listeners registered
        // inside a shadow root.
        if (gripEl) gripEl.onmousedown = startDrag

        /**
         * Alt+drag anywhere on the selected box, as an alternative to aiming at the grip.
         *
         * The grip is 16px and parked above the box's top-left corner, which is a small
         * target and can be off-screen when the box starts above the viewport. Alt is
         * already the "select the box, not the text" modifier in EditorSurface, so holding
         * it through the drag reads as one gesture: alt+press picks the box, and moving
         * while still held carries it. Releasing without moving past the threshold leaves
         * an ordinary alt+click, which just selects.
         *
         * Capture phase so the press is claimed before contenteditable starts a text
         * selection from it.
         */
        const onSurfaceMouseDown = (down: MouseEvent) => {
            if (!down.altKey || down.button !== 0) return
            const marked = surface.querySelector('[data-element-selected]') as HTMLElement | null
            if (!marked || deleteRefusalReason(marked, surface)) return
            startDrag(down, marked)
        }
        surface.addEventListener('mousedown', onSurfaceMouseDown, true)

        readMark()
        measure()

        return () => {
            surface.removeEventListener('mousedown', onSurfaceMouseDown, true)
            observer.disconnect()
            window.removeEventListener('scroll', onScroll, true)
            window.removeEventListener('resize', onResize)
            surface.removeEventListener('scroll', onScroll)
            if (frame) cancelAnimationFrame(frame)
            if (gripEl) gripEl.onmousedown = null
        }
    })

    return (
        <div ref={rootRef} data-node-mover-root>
            <div
                ref={(el: HTMLDivElement) => { gripEl = el }}
                data-node-drag-handle
                title={() => t('editor.dragToMoveElement')}
                style={() => ({
                    position: 'absolute',
                    display: $$(spot) ? 'flex' : 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    left: `${$$(spot)?.left ?? 0}px`,
                    top: `${$$(spot)?.top ?? 0}px`,
                    width: `${HANDLE_SIZE}px`,
                    height: `${HANDLE_SIZE}px`,
                    borderRadius: '3px',
                    background: '#3b82f6',
                    color: 'white',
                    cursor: $$(dragging) ? 'grabbing' : 'grab',
                    pointerEvents: 'auto',
                    userSelect: 'none',
                    zIndex: 30,
                })}
            >
                {/* Six-dot grip: the conventional "this is draggable" glyph. */}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ pointerEvents: 'none' }}>
                    <circle cx="9" cy="5" r="2" /><circle cx="15" cy="5" r="2" />
                    <circle cx="9" cy="12" r="2" /><circle cx="15" cy="12" r="2" />
                    <circle cx="9" cy="19" r="2" /><circle cx="15" cy="19" r="2" />
                </svg>
            </div>

            {/* Insertion caret shown while dragging. Lives here, outside the editable
                surface, so a drag in progress never shows up in the document's HTML. */}
            <div
                ref={(el: HTMLDivElement) => { indicatorEl = el }}
                data-node-drop-indicator
                style={{
                    position: 'absolute',
                    display: 'none',
                    background: '#3b82f6',
                    borderRadius: '1px',
                    pointerEvents: 'none',
                    zIndex: 29,
                }}
            />
        </div>
    )
}

export { NodeMover }
export default NodeMover

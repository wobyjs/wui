/**
 * pointerDrag -- one press/move/release gesture, from any input device.
 *
 * Every drag in the editor was three `document` listeners on `mousemove` and `mouseup`.
 * That works for a mouse and for nothing else: on a touchscreen the browser synthesises
 * mouse events only *after* the finger lifts, and only if it decided the gesture was not a
 * scroll -- so image resize, image drop and node move were mouse-only features that read
 * as implemented. Pointer events cover mouse, touch and pen through one path.
 *
 * Three details have to be right, and each is easy to get wrong on its own, which is why
 * they live in one place:
 *
 *  - **`pointercancel` ends the drag too.** The browser takes the pointer away the moment
 *    it decides the gesture is its own -- a scroll, a pinch, the edge-swipe back gesture.
 *    There is no `pointerup` in that case. Miss it and the move listener stays on
 *    `document` for the life of the page, and the next press drags something.
 *  - **One pointer only.** A second finger raises `pointermove` with its own `pointerId`.
 *    Ignoring the ones that are not ours is what keeps a two-finger pinch from being read
 *    as a violent drag.
 *  - **`touch-action: none` on the handle**, which is a style, not a listener, so it is not
 *    set here -- spread {@link DRAG_HANDLE_STYLE} into the handle's own style instead.
 *    Without it the browser claims the gesture for scrolling partway through and the
 *    `pointermove` stream just stops, which looks like a dropped frame rather than a bug.
 *
 * The listeners go on `document` rather than on the handle. Implicit pointer capture
 * retargets a touch's moves to the element the gesture started on and they bubble from
 * there, so `document` sees the whole gesture either way -- and a mouse that wanders off
 * the handle mid-drag keeps driving it, which is the behaviour a drag needs.
 *
 * ### The mousedown that has to stay
 *
 * A handle sitting over `contenteditable` still needs a plain `mousedown` listener whose
 * only job is `preventDefault()`. Cancelling `pointerdown` suppresses the compatibility
 * mouse events for *touch*, but for mouse input it does not stop the browser moving the
 * caret and collapsing the selection -- only cancelling `mousedown` does. So the pattern
 * at a handle is two listeners: `pointerdown` starts the drag, `mousedown` guards the
 * caret. Do not "clean up" the second one.
 *
 * @module Editor/pointerDrag
 */

/** What a drag does while the pointer moves, and when it ends. */
export type PointerDragHandlers = {
    onMove: (e: PointerEvent) => void
    /** Called for `pointerup` *and* `pointercancel`; listeners are already detached. */
    onUp: (e: PointerEvent) => void
}

/**
 * Spread into a drag handle's style. See the `touch-action` note in the module doc --
 * without it the gesture dies partway through on any touchscreen.
 */
export const DRAG_HANDLE_STYLE = { touchAction: 'none' } as const

/**
 * Track one pointer from a `pointerdown` until it is released or cancelled.
 *
 * @param down - The `pointerdown` that opened the gesture; its `pointerId` is the one followed
 * @param handlers - What to do on move, and on release
 * @returns A function that ends the drag early and detaches every listener
 */
export const startPointerDrag = (down: PointerEvent, handlers: PointerDragHandlers): (() => void) => {
    const id = down.pointerId

    const stop = () => {
        document.removeEventListener('pointermove', move)
        document.removeEventListener('pointerup', up)
        document.removeEventListener('pointercancel', up)
    }
    const move = (e: PointerEvent) => { if (e.pointerId === id) handlers.onMove(e) }
    const up = (e: PointerEvent) => {
        if (e.pointerId !== id) return
        // Detach first: `onUp` commits the drag, and a commit that throws must not leave
        // the page with a live move listener on it.
        stop()
        handlers.onUp(e)
    }

    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', up)
    document.addEventListener('pointercancel', up)
    return stop
}

export default startPointerDrag

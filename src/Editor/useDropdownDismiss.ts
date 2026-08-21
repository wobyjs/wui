import { $$, Observable, useEffect } from 'woby'

/**
 * Collapse a toolbar dropdown when the user points anywhere outside it.
 *
 * Deliberately NOT `useOnClickOutside` from `@woby/use`. That hook memoises its
 * listener in a module-level `Map` keyed by (target, eventName), and every caller
 * here asks for the same `window` + `mousedown` pair -- so only the *first*
 * component to mount ever gets a listener registered, and every dropdown after it
 * silently gets none -- whichever dropdown happens to render first claims the pair
 * and the other four are dead. The slot is never released on cleanup either, so
 * that first registration wins for the lifetime of the page.
 *
 * Two details this listener has to get right:
 *
 * - **Capture phase.** The toolbar buttons call `stopPropagation()` on their own
 *   pointer/mouse events to keep the editor's selection alive, which would swallow
 *   the event before any bubble-phase listener saw it.
 * - **`composedPath()`, not `contains(target)`.** The editor renders into a shadow
 *   root, so by the time an event reaches `document` its `target` has been
 *   retargeted to the `<wui-editor>` host. `el.contains(host)` is false for every
 *   click on the page, including clicks on the menu itself, so a `contains()` test
 *   can only ever answer "outside". `composedPath()` is the pre-retargeting path
 *   and crosses shadow boundaries, so it stays correct at any nesting depth.
 *
 * @param ref   The dropdown's outermost element -- button *and* menu. A pointerdown
 *              anywhere inside it is "inside".
 * @param close Called once per outside pointerdown; safe to call when already closed.
 */
export const useDropdownDismiss = (ref: Observable<HTMLElement>, close: () => void) => {
    useEffect(() => {
        const onPointerDown = (e: PointerEvent) => {
            const el = $$(ref)
            if (!el || e.composedPath().includes(el)) return
            close()
        }

        document.addEventListener('pointerdown', onPointerDown, true)
        return () => document.removeEventListener('pointerdown', onPointerDown, true)
    })
}

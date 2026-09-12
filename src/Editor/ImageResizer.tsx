import { $, $$, JSX, useEffect } from 'woby'
import { applyImageAlignment, applyImageIndent } from './ImageActions'
import { openImageEditor } from './ImageEditor'
import { resolveResizable, resolveAnchor, applyResize, constrainResize, type ResizableSpec } from './EditorPlugin'
import { NO_SCALE_ATTR } from './PageLayout'
import { t } from '../i18n'

/**
 * ImageResizer: Overlays a resizable box inside the editor with:
 * - A visible blue selection border when active
 * - 8 resize anchors (corners + edges) for size adjustment
 * - A floating mini-toolbar with align/indent/outdent actions
 * - Drag-and-drop repositioning
 *
 * Despite the name it is not image-only. Any element `resolveResizable()` answers for
 * gets the same chrome: `<img>` always, plus any plugin element whose registration carries
 * a `resizable` spec. The spec is what decouples the two -- an image takes `style.width`,
 * a custom element may need an attribute instead, may have a locked aspect, and may not
 * survive a write on every mousemove.
 *
 * Uses direct DOM manipulation for overlay visibility/positioning
 * because Woby's reactive expressions don't respond to observable
 * changes made from DOM event listeners (addEventListener callbacks).
 *
 * CRITICAL: Event listeners are attached in useEffect with cleanup
 * to prevent memory leaks on unmount.
 */

type ResizeDirection = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

interface ResizeState {
    img: HTMLElement
    /** Resolved once at mousedown, so the drag cannot change policy underneath itself. */
    spec: ResizableSpec
    startX: number
    startY: number
    startWidth: number
    startHeight: number
    direction: ResizeDirection
    aspect: number
}

interface DragState {
    img: HTMLElement
    startX: number
    startY: number
    origLeft: number
    origRight: number
}

/**
 * Select (or deselect) an image from outside this module.
 *
 * Dispatched on anything inside the editor's shadow root with
 * `detail.image` set to the image to select, or null to clear. Image selection lives in
 * ImageResizer's closure -- `activeImage`, the overlay elements, `__activeImage` on the
 * root -- and there is no handle to it, so keyboard navigation needs a door in. Without
 * one, arrowing onto an image would outline nothing and arrowing off it would leave the
 * resize handles hanging on the image behind.
 */
export const SELECT_IMAGE_EVENT = 'wui-select-image'

export interface SelectImageDetail {
    /** Any resizable element, not only an `<img>`. The name is kept for compatibility. */
    image: HTMLElement | null
}

const HANDLE_SIZE = 10

const cursorMap: Record<ResizeDirection, string> = {
    nw: 'nwse-resize', n: 'ns-resize', ne: 'nesw-resize',
    e: 'ew-resize', se: 'nwse-resize', s: 'ns-resize',
    sw: 'nesw-resize', w: 'ew-resize',
}

const btnStyle: JSX.CSSProperties = {
    width: '28px',
    height: '28px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    color: 'white',
    background: 'transparent',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
}

const ImageResizer = () => {
    const activeImage = $<HTMLElement | null>(null)
    const resizing = $<ResizeState | null>(null)
    const dragging = $<DragState | null>(null)
    const currentAlign = $<'left' | 'center' | 'right' | null>(null)
    const overlayRect = $<{ left: number; top: number; width: number; height: number } | null>(null)

    /**
     * This resizer's own outermost node, published once its ref lands.
     *
     * An observable and not a plain `let`, so the setup effect below re-runs when it
     * arrives: effects are scheduled, refs are assigned during render, and the order
     * between them is not something to bet the whole component on.
     */
    const selfRoot = $<HTMLElement | null>(null)

    /**
     * The contenteditable surface this resizer belongs to.
     *
     * Every lookup here used to be `document.querySelector('wui-editor')?.shadowRoot
     * ?.querySelector('[data-editor-root]')`, which quietly assumes the editor is mounted
     * as a custom element. It is not always -- `<Editor>` is an ordinary component, and an
     * app that renders it directly has no `wui-editor` host and no shadow root, so that
     * chain returned null and the entire resizer did nothing: no handles, on images either.
     *
     * `<ImageResizer />` is a sibling of the surface (Editor.tsx), so walking up from its
     * own node finds the right one in either shape -- and finds the *right* one when a page
     * holds more than one editor, which the global query could not. The old chain stays as
     * a fallback for the window between mount and the ref landing.
     */
    const findSurface = (): HTMLElement | null =>
        ($$(selfRoot)?.parentElement?.querySelector('[data-editor-root]') as HTMLElement | null)
        ?? (document.querySelector('wui-editor')?.shadowRoot
            ?.querySelector('[data-editor-root]') as HTMLElement | null)

    /**
     * Where `__activeImage` lives -- the shadow root when the editor is a custom element,
     * the document when it is not. Editor.tsx reads it off `[data-editor-root]`'s root node,
     * so writing it anywhere else is how the two selection systems fall out of step.
     */
    const findSelectionRoot = (): any => findSurface()?.getRootNode() ?? null

    /**
     * The box every overlay coordinate is measured from.
     *
     * The chrome is `position: absolute`, so the browser lays it out against its
     * CONTAINING BLOCK -- the nearest positioned ancestor of the resizer root. Every
     * measurement here used to subtract the editor SURFACE's rect instead, which is only
     * the same box when the surface happens to sit flush inside that ancestor. It does not:
     * `[data-editor-root]` carries `margin: 16px 0`, so the outline, all eight handles and
     * the mini-toolbar were drawn 16px above the element they belong to -- a resize handle
     * that is not on the corner it claims. Horizontal margin would skew x the same way.
     *
     * Falls back to the surface, then to the viewport, so a resizer whose ref has not landed
     * yet degrades to the old behaviour rather than to NaN.
     */
    const overlayBasis = (): DOMRect => {
        const el = $$(selfRoot)
        const parent = (el?.offsetParent as HTMLElement | null) ?? null
        return (parent ?? findSurface())?.getBoundingClientRect()
            ?? new DOMRect(0, 0, 0, 0)
    }

    /** Tell the host something in the document changed. Whichever node is actually there. */
    const notifyChange = () => {
        const target = document.querySelector('wui-editor') ?? findSurface()
        target?.dispatchEvent(new CustomEvent('editor-change', { bubbles: true }))
    }

    // Sync activeImage to the selection root so other components can detect image selection
    // Only sync when activeImage actually changes, not on every render
    useEffect(() => {
        const selection = findSelectionRoot()
        if (selection) selection.__activeImage = $$(activeImage)
    })

    // Refs for direct DOM manipulation
    let overlayEl: HTMLDivElement | null = null
    let toolbarEl: HTMLDivElement | null = null
    let handleEls: HTMLDivElement[] = []
    let handleInnerEls: HTMLDivElement[] = []
    let dragHandleEl: HTMLDivElement | null = null
    let alignLBtn: HTMLButtonElement | null = null
    let alignCBtn: HTMLButtonElement | null = null
    let alignRBtn: HTMLButtonElement | null = null
    let outdentBtn: HTMLButtonElement | null = null
    let indentBtn: HTMLButtonElement | null = null
    let deleteBtn: HTMLButtonElement | null = null
    let editBtn: HTMLButtonElement | null = null

    // Set up event listeners in useEffect with cleanup to prevent memory leaks
    useEffect(() => {
            const editorSurface = findSurface()
            if (!editorSurface) return

            // Delegated listeners and the `__activeImage` marker hang off the surface's root
            // node: a ShadowRoot under a `wui-editor` host, the Document without one. Both
            // answer `addEventListener` / `contains` / `elementFromPoint`, which is all this
            // module ever asks of it.
            const root = editorSurface.getRootNode() as ShadowRoot | Document
            // The host, when there is one. A shadow root does not see the capture-phase
            // mousedown until it has passed the host, so that hop is worth listening on
            // separately; in light DOM there is no hop and `root` alone covers it.
            const editor = document.querySelector('wui-editor') as HTMLElement | null

        const computeRect = (img: HTMLElement) => {
            const surfaceRect = overlayBasis()
            const imgRect = resolveAnchor(img).getBoundingClientRect()
            return {
                left: imgRect.left - surfaceRect.left,
                top: imgRect.top - surfaceRect.top,
                width: imgRect.width,
                height: imgRect.height,
            }
        }

        const detectAlign = (img: HTMLElement) => {
            const inlineAlign = (img.style.display === 'block' && img.style.marginLeft === 'auto' && img.style.marginRight === 'auto')
                ? 'center'
                : img.style.float === 'left' ? 'left'
                    : img.style.float === 'right' ? 'right'
                        : null
            if (inlineAlign) return inlineAlign
            // Check parent LI for text-align (image in a list)
            const li = img.closest('li')
            if (li) {
                const ta = li.style.textAlign
                if (ta === 'center' || ta === 'right' || ta === 'left') return ta
            }
            let parent: HTMLElement | null = img.parentElement
            while (parent && parent !== editorSurface) {
                const textAlign = parent.style.textAlign
                if (textAlign === 'center' || textAlign === 'right' || textAlign === 'left') return textAlign
                parent = parent.parentElement
            }
            return null
        }

        const showOverlay = (img: HTMLElement) => {
            const rect = computeRect(img)
            const align = detectAlign(img)

            overlayRect({ left: rect.left, top: rect.top, width: rect.width, height: rect.height })

            if (overlayEl) {
                overlayEl.style.display = ''
                overlayEl.style.left = `${rect.left}px`
                overlayEl.style.top = `${rect.top}px`
                overlayEl.style.width = `${rect.width}px`
                overlayEl.style.height = `${rect.height}px`
            }
            if (toolbarEl) toolbarEl.style.display = ''

            // Position handles
            const hw = HANDLE_SIZE / 2
            const handlePositions: [string, string][] = [
                [`-${hw}px`, `-${hw}px`],           // nw
                [`calc(50% - ${hw}px)`, `-${hw}px`], // n
                [`calc(100% - ${hw}px)`, `-${hw}px`], // ne
                [`calc(100% - ${hw}px)`, `calc(50% - ${hw}px)`], // e
                [`calc(100% - ${hw}px)`, `calc(100% - ${hw}px)`], // se
                [`calc(50% - ${hw}px)`, `calc(100% - ${hw}px)`], // s
                [`-${hw}px`, `calc(100% - ${hw}px)`], // sw
                [`-${hw}px`, `calc(50% - ${hw}px)`], // w
            ]
            handleEls.forEach((el, i) => {
                if (handlePositions[i]) {
                    el.style.left = handlePositions[i][0]
                    el.style.top = handlePositions[i][1]
                }
            })

            // Position toolbar
            if (toolbarEl) {
                toolbarEl.style.left = `${rect.left}px`
                toolbarEl.style.top = `${Math.max(0, rect.top - 38)}px`
            }

            // Update align button states
            const updateAlignBtns = (a: string | null) => {
                [alignLBtn, alignCBtn, alignRBtn].forEach(b => {
                    if (!b) return
                    b.style.background = 'transparent'
                    b.style.color = 'white'
                })
                if (a === 'left' && alignLBtn) { alignLBtn.style.background = 'white'; alignLBtn.style.color = '#3b82f6' }
                if (a === 'center' && alignCBtn) { alignCBtn.style.background = 'white'; alignCBtn.style.color = '#3b82f6' }
                if (a === 'right' && alignRBtn) { alignRBtn.style.background = 'white'; alignRBtn.style.color = '#3b82f6' }
            }
            updateAlignBtns(align)
            currentAlign(align)

            // The mini-toolbar's crop/zoom editor takes an <img>; a plugin element has no
            // pixels to crop, so hide the button rather than hand it something it cannot open.
            // Restore the flex display btnStyle set inline -- `''` would clear it and drop
            // the button back to the UA's `inline-block`, un-centering its icon against the
            // rest of the strip.
            if (editBtn) editBtn.style.display = img instanceof HTMLImageElement ? 'inline-flex' : 'none'
        }

        const hideOverlay = () => {
            overlayRect(null)
            if (overlayEl) overlayEl.style.display = 'none'
            if (toolbarEl) toolbarEl.style.display = 'none'
            if (root) (root as any).__activeImage = null
        }

        /**
         * The resizable box a click landed on, or null.
         *
         * Walks the composed path rather than testing `[0]`, because a custom element paints
         * in its own shadow root: the innermost target is the plugin's canvas, and the host
         * that owns the size sits further along. `contains()` does not cross a shadow
         * boundary, which is exactly the filter wanted -- it skips the plugin's internals
         * and matches its host. An `<img>` still matches at `[0]`, as it always did.
         */
        const findResizable = (path: EventTarget[]): HTMLElement | null => {
            for (const entry of path) {
                if (!(entry instanceof HTMLElement)) continue
                if (!editorSurface.contains(entry)) continue
                if (resolveResizable(entry)) return entry
            }
            return null
        }

        /**
         * Select the box under the pointer. Bound to `pointerdown` — the one press event that
         * covers mouse, touch and pen alike.
         *
         * NOT `mousedown`, which is what this used to listen to. `mousedown` is a
         * *compatibility* event, synthesized only after the `pointerdown` it follows goes
         * un-prevented — and a plugin that drives its own gesture off `pointerdown`
         * legitimately prevents it. three.js OrbitControls, mounted inside `<sy-compass>`
         * whenever its `touch` layer is the WebGL canvas, does exactly that: the host was
         * selectable but never resizable, because no `mousedown` ever arrived here. Editor.tsx
         * marks `[data-element-selected]` from `pointerdown`, so the two halves of selection
         * only agree once they read the same event.
         */
        const onSelectDown = (e: MouseEvent) => {
            // Don't select images in readonly mode. Deliberately the surface resolved at
            // setup, not a fresh query off `root`: with a Document root that query would find
            // whichever editor on the page happens to come first.
            if (editorSurface.getAttribute('contenteditable') === 'false') return

            // Use composedPath()[0] to get the actual target before shadow DOM retargeting
            const actualTarget = e.composedPath()[0] as HTMLElement
            // Skip if clicking on overlay, mini-toolbar, or main editor toolbar
            if (actualTarget.closest('[data-image-overlay],[data-image-mini-toolbar],.editor-toolbar')) return
            const hit = findResizable(e.composedPath())
            if (hit) {
                // Suppress the browser's own press behaviour for a plain `<img>` only: a picture
                // has no gesture of its own, and without this the press starts a drag-image or
                // drags a text selection across it. `preventDefault()` here is what the old
                // `mousedown` suppression amounted to — it stops the compat `mousedown` from
                // being synthesized at all, so the caret never lands in the image's block.
                //
                // Deliberately NO `stopPropagation()`. This listener sits on the CAPTURE phase,
                // so stopping the event would also starve Editor.tsx's own `pointerdown` —
                // the half that draws `[data-element-selected]` — and any gesture a plugin runs
                // off the same event. That is what kept `<sy-compass>` from being resizable in
                // the first place: three.js OrbitControls prevents the pointerdown, no compat
                // `mousedown` is ever synthesized, and the old listener heard nothing. A plugin
                // that needs the press suppressed prevents it itself, downstream.
                if (hit.tagName === 'IMG') e.preventDefault()
                // CRITICAL: Explicitly clear text selection when clicking an image.
                // preventDefault() on the press prevents the browser from clearing the
                // text selection, leaving the old text highlight visible even though
                // the image is now selected.
                window.getSelection()?.removeAllRanges()
                activeImage(hit)
                // Directly set __activeImage on shadow root since Woby reactivity
                // doesn't trigger from addEventListener callbacks
                if (root) (root as any).__activeImage = hit
                showOverlay(hit)
            } else if ($$(activeImage)) {
                activeImage(null)
                if (root) (root as any).__activeImage = null
                hideOverlay()
            }
        }

        /**
         * The keyboard's half of image selection. Deliberately the same steps as the
         * pointerdown path above, including clearing the text selection: an image and a
         * caret must never look selected at once.
         */
        const onSelectImage = (e: Event) => {
            const img = (e as CustomEvent<SelectImageDetail>).detail?.image ?? null
            if (img && editorSurface.contains(img) && resolveResizable(img)) {
                window.getSelection()?.removeAllRanges()
                activeImage(img)
                if (root) (root as any).__activeImage = img
                showOverlay(img)
            } else if ($$(activeImage)) {
                activeImage(null)
                if (root) (root as any).__activeImage = null
                hideOverlay()
            }
        }

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && $$(activeImage)) {
                activeImage(null)
                if (root) (root as any).__activeImage = null
                hideOverlay()
            }
        }

        const onScrollOrResize = () => {
            const img = $$(activeImage)
            if (!img) return
            // The surface scrolls its own content while the handles live outside it as
            // positioned siblings, so nothing clips them: once the image has scrolled out
            // of the surface's visible strip the handles would hang over whatever took its
            // place. Park them instead of moving them, and keep activeImage so scrolling
            // back brings the same selection straight back.
            const s = editorSurface.getBoundingClientRect()
            const r = img.getBoundingClientRect()
            if (r.bottom < s.top || r.top > s.bottom) {
                overlayRect(null)
                if (overlayEl) overlayEl.style.display = 'none'
                if (toolbarEl) toolbarEl.style.display = 'none'
                return
            }
            showOverlay(img)
        }

        // `pointerdown`, not `mousedown` — see onSelectDown's header.
        editor?.addEventListener('pointerdown', onSelectDown as EventListener, true)
        root.addEventListener('pointerdown', onSelectDown as EventListener, true)
        root.addEventListener(SELECT_IMAGE_EVENT, onSelectImage)
        document.addEventListener('keydown', onKey)
        window.addEventListener('scroll', onScrollOrResize, true)
        window.addEventListener('resize', onScrollOrResize)
        // Scroll events are not composed, so the surface's own scrolling never escapes
        // the shadow root to the window listener above: listen on it directly.
        editorSurface.addEventListener('scroll', onScrollOrResize)

        const observer = new MutationObserver(() => {
            const img = $$(activeImage)
            if (img && (!editorSurface.contains(img) || !root.contains(img))) {
                activeImage(null)
                if (root) (root as any).__activeImage = null
                hideOverlay()
            } else if (img) {
                // Image still in DOM but may have been repositioned by indent/align
                // Re-position the overlay to follow the image
                showOverlay(img)
            }
        })
        observer.observe(editorSurface, { childList: true, subtree: true, attributes: true })

        // Attach direct click handlers for mini-toolbar buttons (Woby's onClick delegation doesn't work in shadow DOM)
        // NOTE: Do NOT preventDefault on mousedown - it prevents click events from firing!
        // Instead, restore focus to editor after click to prevent blur issues.
        const attachClickHandlers = () => {
            const attach = (btn: HTMLButtonElement | null, handler: () => void) => {
                if (!btn) return false
                // Just stop propagation to prevent event reaching other handlers
                btn.onmousedown = (e: MouseEvent) => { e.stopPropagation() }
                btn.onclick = (e: MouseEvent) => {
                    e.stopPropagation()
                    handler()
                    // Restore focus to editor after click. `preventScroll` because in Page
                    // layout the surface *is* the scroll container: a plain focus() asks the
                    // browser to reveal it, and revealing a container taller than its own box
                    // means scrolling it to the top -- the document jumps away from the image
                    // you just clicked a button on.
                    findSurface()?.focus({ preventScroll: true })
                }
                return true
            }
            const allAttached =
                attach(alignLBtn, () => align('left')) &&
                attach(alignCBtn, () => align('center')) &&
                attach(alignRBtn, () => align('right')) &&
                attach(outdentBtn, () => indent(true)) &&
                attach(indentBtn, () => indent(false)) &&
                attach(editBtn, editImage) &&
                attach(deleteBtn, deleteImage)

            // Also attach mousedown handler to toolbar container (stopPropagation only, not preventDefault)
            if (toolbarEl) {
                toolbarEl.onmousedown = (e: MouseEvent) => { e.stopPropagation() }
            }

            if (!allAttached) {
                // Retry after a short delay if refs aren't populated yet
                setTimeout(attachClickHandlers, 50)
            }
        }
        // Attach direct mousedown handlers for drag and resize handles
        // (Woby's onMouseDown delegation doesn't work in shadow DOM)
        const attachDragHandlers = () => {
            if (dragHandleEl) {
                dragHandleEl.onmousedown = (e: MouseEvent) => {
                    startDrag(e)
                }
            }
            let allResizeAttached = true
            handleInnerEls.forEach((el, i) => {
                if (el) {
                    const dir = handles[i]
                    el.onmousedown = (e: MouseEvent) => {
                        startResize(e, dir)
                    }
                } else {
                    allResizeAttached = false
                }
            })
            if (!dragHandleEl || !allResizeAttached || handleInnerEls.length !== 8) {
                setTimeout(attachDragHandlers, 50)
            }
        }
        setTimeout(attachDragHandlers, 50)
        setTimeout(attachClickHandlers, 100)

        // Cleanup: remove all event listeners and observer on unmount
        return () => {
            editor?.removeEventListener('pointerdown', onSelectDown, true)
            root.removeEventListener('pointerdown', onSelectDown as EventListener, true)
            root.removeEventListener(SELECT_IMAGE_EVENT, onSelectImage)
            document.removeEventListener('keydown', onKey)
            window.removeEventListener('scroll', onScrollOrResize, true)
            window.removeEventListener('resize', onScrollOrResize)
            editorSurface.removeEventListener('scroll', onScrollOrResize)
            observer.disconnect()
        }
    })

    const startResize = (e: MouseEvent, direction: ResizeDirection) => {
        const img = $$(activeImage)
        const spec = resolveResizable(img)
        if (!img || !spec) return
        e.preventDefault()
        e.stopPropagation()

        const rect = resolveAnchor(img).getBoundingClientRect()
        resizing({
            img,
            spec,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: rect.width,
            startHeight: rect.height,
            direction,
            aspect: rect.width / rect.height || 1,
        })

        // The last size the pointer asked for. Needed on mouseup for a deferred commit,
        // and to tell a drag that moved from one that only pressed and released.
        let pending: [number, number] | null = null

        const onMove = (ev: MouseEvent) => {
            const state = $$(resizing)
            if (!state) return
            const dx = ev.clientX - state.startX
            const dy = ev.clientY - state.startY
            let newWidth = state.startWidth
            let newHeight = state.startHeight

            switch (state.direction) {
                case 'e': newWidth = state.startWidth + dx; break
                case 'w': newWidth = state.startWidth - dx; break
                case 's': newHeight = state.startHeight + dy; break
                case 'n': newHeight = state.startHeight - dy; break
                case 'se': newWidth = state.startWidth + dx; newHeight = state.startHeight + dy; break
                case 'sw': newWidth = state.startWidth - dx; newHeight = state.startHeight + dy; break
                case 'ne': newWidth = state.startWidth + dx; newHeight = state.startHeight - dy; break
                case 'nw': newWidth = state.startWidth - dx; newHeight = state.startHeight - dy; break
            }

            const constrained = constrainResize(state.spec, state.direction, newWidth, newHeight, state.aspect)
            newWidth = constrained[0]
            newHeight = constrained[1]
            pending = constrained

            // `live: false` means the element cannot survive being written to on every
            // mousemove -- a plugin that re-inserts its node on a size change would destroy
            // the very element the drag is holding. Show the pending size on the overlay and
            // commit once, on mouseup.
            if (state.spec.live !== false) applyResize(state.img, state.spec, newWidth, newHeight)

            // Update overlay position during resize
            const surface = findSurface()
            if (surface && overlayEl) {
                const surfaceRect = overlayBasis()
                const measured = resolveAnchor(state.img).getBoundingClientRect()
                // With a deferred commit the element has not moved yet, so what it measures
                // is still the OLD box: hold the corner the drag is anchored by and draw the
                // new extent from it.
                const imgRect = state.spec.live !== false
                    ? measured
                    : new DOMRect(
                        state.direction.includes('w') ? measured.right - newWidth : measured.left,
                        state.direction.includes('n') ? measured.bottom - newHeight : measured.top,
                        newWidth,
                        newHeight)
                overlayEl.style.left = `${imgRect.left - surfaceRect.left}px`
                overlayEl.style.top = `${imgRect.top - surfaceRect.top}px`
                overlayEl.style.width = `${imgRect.width}px`
                overlayEl.style.height = `${imgRect.height}px`
                if (toolbarEl) {
                    const toolbarTop = imgRect.top - surfaceRect.top - 38
                    toolbarEl.style.left = `${imgRect.left - surfaceRect.left}px`
                    toolbarEl.style.top = `${Math.max(0, toolbarTop)}px`
                }
            }
        }

        const onUp = () => {
            const state = $$(resizing)
            if (state && pending) {
                if (state.spec.live === false) applyResize(state.img, state.spec, pending[0], pending[1])
                // A resize is a content change like any other. Fired once here rather than
                // from onMove, so a listener that re-renders does not do it per mousemove.
                notifyChange()
                // Twice: now, so the handles never lag a frame behind the pointer, and again
                // after layout, because an element that re-renders from an attribute settles
                // on its real box only after this tick. `isConnected` because that re-render
                // may have replaced the node outright.
                showOverlay(state.img)
                requestAnimationFrame(() => { if (state.img.isConnected) showOverlay(state.img) })
            }
            resizing(null)
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)
        }

        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
    }

    const startDrag = (e: MouseEvent) => {
        const img = $$(activeImage)
        if (!img) return
        e.preventDefault()
        e.stopPropagation()

        // Store reference to the image being dragged
        const draggedImg = img
        const surface = findSurface()
        if (!surface) return
        const root = surface.getRootNode() as ShadowRoot | Document

        // Hide overlay during drag
        if (overlayEl) overlayEl.style.opacity = '0.5'
        if (toolbarEl) toolbarEl.style.display = 'none'

        // Make image pointer-events:none during drag so elementFromPoint sees through it
        const origPointerEvents = draggedImg.style.pointerEvents
        draggedImg.style.pointerEvents = 'none'

        // Create drop indicator
        let dropIndicator: HTMLElement | null = document.createElement('div')
        dropIndicator.style.cssText = 'position:absolute;height:2px;background:#3b82f6;pointer-events:none;z-index:1000;display:none;'
        // A direct child of the surface, but not document: the document zoom is applied to
        // the surface's children, and this one is positioned from painted client rects
        // against the surface's own (unzoomed) box, so it has to opt out of the scaling.
        dropIndicator.setAttribute(NO_SCALE_ATTR, '')
        surface.appendChild(dropIndicator)

        let lastTarget: Node | null = null
        let lastInsertBefore: boolean = true

        const findDropTarget = (clientX: number, clientY: number): { target: Node; insertBefore: boolean } | null => {
            const el = root.elementFromPoint(clientX, clientY)
            if (!el || !surface.contains(el)) return null
            if (el === draggedImg || el.contains(draggedImg)) return null

            // Walk up from the element to find the best block-level parent or text node
            const rect = el.getBoundingClientRect()
            const insertBefore = (clientY - rect.top) < rect.height / 2

            return { target: el, insertBefore }
        }

        const onMove = (ev: MouseEvent) => {
            const drop = findDropTarget(ev.clientX, ev.clientY)

            if (drop) {
                lastTarget = drop.target
                lastInsertBefore = drop.insertBefore

                const targetRect = (drop.target as HTMLElement).getBoundingClientRect()
                const surfaceRect = surface.getBoundingClientRect()

                dropIndicator!.style.display = 'block'
                dropIndicator!.style.left = `${targetRect.left - surfaceRect.left}px`
                dropIndicator!.style.width = `${targetRect.width}px`
                if (drop.insertBefore) {
                    dropIndicator!.style.top = `${targetRect.top - surfaceRect.top - 2}px`
                } else {
                    dropIndicator!.style.top = `${targetRect.bottom - surfaceRect.top - 2}px`
                }
            } else {
                dropIndicator!.style.display = 'none'
                lastTarget = null
            }

            // Update overlay position to follow cursor
            const imgRect = draggedImg.getBoundingClientRect()
            if (overlayEl) {
                overlayEl.style.left = `${imgRect.left - surface.getBoundingClientRect().left}px`
                overlayEl.style.top = `${imgRect.top - surface.getBoundingClientRect().top}px`
            }
        }

        const onUp = (ev: MouseEvent) => {
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)

            // Restore image pointer-events
            draggedImg.style.pointerEvents = origPointerEvents

            // Remove drop indicator
            if (dropIndicator && dropIndicator.parentNode) {
                dropIndicator.parentNode.removeChild(dropIndicator)
            }
            dropIndicator = null

            // Restore overlay opacity
            if (overlayEl) overlayEl.style.opacity = '1'

            const drop = findDropTarget(ev.clientX, ev.clientY)

            if (drop && drop.target !== draggedImg && !draggedImg.contains(drop.target)) {
                // Clear alignment styles before moving
                draggedImg.style.float = ''
                draggedImg.style.display = ''
                draggedImg.style.marginLeft = ''
                draggedImg.style.marginRight = ''

                // Move the image before/after the target element
                if (drop.insertBefore) {
                    drop.target.parentNode?.insertBefore(draggedImg, drop.target)
                } else {
                    drop.target.parentNode?.insertBefore(draggedImg, drop.target.nextSibling)
                }

                // Wrap in paragraph if not already in a block
                const parent = draggedImg.parentElement
                if (parent && parent !== surface && !['P', 'DIV', 'FIGURE'].includes(parent.tagName)) {
                    const p = document.createElement('p')
                    parent.insertBefore(p, draggedImg)
                    p.appendChild(draggedImg)
                }

                // Re-select the image
                activeImage(draggedImg)
                showOverlay(draggedImg)
            }

            dragging(null)
            // Fire editor-change event
            notifyChange()
        }

        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
    }

    const align = (a: 'left' | 'center' | 'right') => {
        const img = $$(activeImage)
        if (!img) return
        applyImageAlignment(img as HTMLImageElement, a)
        currentAlign(a);
        // Update button visuals
        [alignLBtn, alignCBtn, alignRBtn].forEach((b: any) => {
            if (!b) return
            b.style.background = 'transparent'
            b.style.color = 'white'
        })
        if (a === 'left' && alignLBtn) { alignLBtn.style.background = 'white'; alignLBtn.style.color = '#3b82f6' }
        if (a === 'center' && alignCBtn) { alignCBtn.style.background = 'white'; alignCBtn.style.color = '#3b82f6' }
        if (a === 'right' && alignRBtn) { alignRBtn.style.background = 'white'; alignRBtn.style.color = '#3b82f6' }
        notifyChange()
    }

    const indent = (outdent: boolean) => {
        const img = $$(activeImage)
        if (!img) return
        applyImageIndent(img as HTMLImageElement, outdent)
    }

    /**
     * Hand the selected image to `<wui-image-editor>`.
     *
     * The overlay is dismissed first: it is positioned against the image's old box, and a
     * crop changes that box. It comes back on the next click, measured against the result.
     */
    const editImage = () => {
        const img = $$(activeImage)
        // Gated as well as hidden: the button is display:none for a non-image, but a stray
        // click handler must not hand a custom element to the pixel editor.
        if (!(img instanceof HTMLImageElement)) return
        hideOverlay()
        openImageEditor(img)
    }

    const deleteImage = () => {
        const im = $$(activeImage)
        if (im) im.remove()
        activeImage(null)
        hideOverlay()
    }

    /**
     * Re-show the selection chrome for `img`.
     *
     * The drag/drop handler runs outside the `useEffect` closure that owns the original
     * `showOverlay`, so it needs its own copy: recompute the rect relative to the editor surface,
     * publish it to `overlayRect` (the JSX reads that reactively) and unhide the chrome.
     */
    const showOverlay = (img: HTMLElement) => {
        const surface = findSurface()
        if (!surface) return
        const surfaceRect = overlayBasis()
        const imgRect = resolveAnchor(img).getBoundingClientRect()
        overlayRect({
            left: imgRect.left - surfaceRect.left,
            top: imgRect.top - surfaceRect.top,
            width: imgRect.width,
            height: imgRect.height,
        })
        if (overlayEl) overlayEl.style.display = ''
        if (toolbarEl) toolbarEl.style.display = ''
    }

    const hideOverlay = () => {
        if (overlayEl) overlayEl.style.display = 'none'
        if (toolbarEl) toolbarEl.style.display = 'none'
    }

    const handles: ResizeDirection[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

    return (
        <div class="image-resizer-root" data-image-resizer-root ref={(el: HTMLElement) => selfRoot(el)}>
            {/* Selection border + 8 handles (hidden by default) */}
            <div
                ref={(el: HTMLDivElement) => { overlayEl = el }}
                data-image-overlay
                style={() => ({
                    position: 'absolute',
                    display: $$(activeImage) ? '' : 'none',
                    left: `${$$(overlayRect)?.left ?? 0}px`,
                    top: `${$$(overlayRect)?.top ?? 0}px`,
                    width: `${$$(overlayRect)?.width ?? 0}px`,
                    height: `${$$(overlayRect)?.height ?? 0}px`,
                    border: '2px solid #3b82f6',
                    pointerEvents: 'none',
                    zIndex: 5,
                })}
            >
                {/* Drag handle - allows repositioning by dragging center */}
                <div
                    ref={(el: HTMLDivElement) => { dragHandleEl = el }}
                    data-image-drag-handle
                    style={{
                        position: 'absolute',
                        left: '20%',
                        top: '20%',
                        width: '60%',
                        height: '60%',
                        cursor: 'move',
                        pointerEvents: 'auto',
                        background: 'transparent',
                        zIndex: 6,
                    }}
                />
                {handles.map((dir, i) => (
                    <div
                        ref={(el: HTMLDivElement) => { handleEls[i] = el }}
                        style={{ position: 'absolute', pointerEvents: 'auto' }}
                    >
                        <div
                            ref={(el: HTMLDivElement) => { handleInnerEls[i] = el }}
                            data-image-handle={dir}
                            style={{
                                width: `${HANDLE_SIZE}px`,
                                height: `${HANDLE_SIZE}px`,
                                background: 'white',
                                border: '2px solid #3b82f6',
                                borderRadius: '2px',
                                cursor: cursorMap[dir],
                                zIndex: 10,
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Mini floating toolbar (hidden by default) */}
            <div
                ref={(el: HTMLDivElement) => { toolbarEl = el }}
                data-image-mini-toolbar
                onMouseDown={(e: MouseEvent) => { e.preventDefault(); e.stopPropagation() }}
                style={() => ({
                    position: 'absolute',
                    display: $$(activeImage) ? '' : 'none',
                    left: `${$$(overlayRect)?.left ?? 0}px`,
                    top: `${Math.max(0, ($$(overlayRect)?.top ?? 0) - 38)}px`,
                    gap: '2px',
                    padding: '2px',
                    background: '#3b82f6',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    zIndex: 20,
                    pointerEvents: 'auto',
                })}
            >
                <button ref={(el: HTMLButtonElement) => { alignLBtn = el }} data-image-mini-toolbar title={() => t('editor.alignLeftTitle')} style={btnStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v2H3V3zm0 6h12v2H3V9zm0 6h18v2H3v-2zm0 6h12v2H3v-2z"/></svg>
                </button>
                <button ref={(el: HTMLButtonElement) => { alignCBtn = el }} data-image-mini-toolbar title={() => t('editor.alignCenterTitle')} style={btnStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v2H3V3zm4 6h10v2H7V9zm0 6h10v2H7v-2zm-4 6h18v2H3v-2z"/></svg>
                </button>
                <button ref={(el: HTMLButtonElement) => { alignRBtn = el }} data-image-mini-toolbar title={() => t('editor.alignRightTitle')} style={btnStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v2H3V3zm6 6h12v2H9V9zm-6 6h18v2H3v-2zm6 6h12v2H9v-2z"/></svg>
                </button>
                <span data-image-mini-toolbar style={{ width: '1px', background: 'rgba(255,255,255,0.3)', margin: '2px' }} />
                <button ref={(el: HTMLButtonElement) => { outdentBtn = el }} data-image-mini-toolbar title={() => t('editor.outdent')} style={btnStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21V3h2v18H3zm8-11v10l-7-5 7-5z"/></svg>
                </button>
                <button ref={(el: HTMLButtonElement) => { indentBtn = el }} data-image-mini-toolbar title={() => t('editor.indent')} style={btnStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21V3h2v18H3zm8-11v10l7-5-7-5z"/></svg>
                </button>
                <span data-image-mini-toolbar style={{ width: '1px', background: 'rgba(255,255,255,0.3)', margin: '2px' }} />
                <button ref={(el: HTMLButtonElement) => { editBtn = el }} data-image-mini-toolbar title={() => t('editor.image.edit')} style={btnStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 1h2v4h10v2H9v10H7V7H3V5h4V1zm10 22v-4H7v-2h10V7h2v10h4v2h-4v4h-2z"/></svg>
                </button>
                <button ref={(el: HTMLButtonElement) => { deleteBtn = el }} data-image-mini-toolbar title={() => t('editor.image.delete')} style={btnStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
            </div>
        </div>
    )
}

export { ImageResizer }
export default ImageResizer

import { $, $$, JSX, useEffect } from 'woby'
import { applyImageAlignment, applyImageIndent } from './ImageActions'

/**
 * ImageResizer: Overlays an <img> inside the editor with:
 * - A visible blue selection border when active
 * - 8 resize anchors (corners + edges) for size adjustment
 * - A floating mini-toolbar with align/indent/outdent actions
 * - Drag-and-drop repositioning
 *
 * Uses direct DOM manipulation for overlay visibility/positioning
 * because Woby's reactive expressions don't respond to observable
 * changes made from DOM event listeners (addEventListener callbacks).
 *
 * CRITICAL: Event listeners are attached ONCE using a mounted ref,
 * not in useEffect (which runs on every render and removes listeners).
 */

type ResizeDirection = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

interface ResizeState {
    img: HTMLImageElement
    startX: number
    startY: number
    startWidth: number
    startHeight: number
    direction: ResizeDirection
    aspect: number
}

interface DragState {
    img: HTMLImageElement
    startX: number
    startY: number
    origLeft: number
    origRight: number
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
    const activeImage = $<HTMLImageElement | null>(null)
    const resizing = $<ResizeState | null>(null)
    const dragging = $<DragState | null>(null)
    const currentAlign = $<'left' | 'center' | 'right' | null>(null)
    const overlayRect = $<{ left: number; top: number; width: number; height: number } | null>(null)

    // Sync activeImage to shadow root so other components can detect image selection
    // Only sync when activeImage actually changes, not on every render
    useEffect(() => {
        const editor = document.querySelector('wui-editor')
        const shadow = editor?.shadowRoot
        if (shadow) {
            (shadow as any).__activeImage = $$(activeImage)
        }
    }, [activeImage])

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

    // One-time setup: attach event listeners in a microtask after DOM refs are populated
    Promise.resolve().then(() => {
            const editor = document.querySelector('wui-editor') as HTMLElement | null
            const root = editor?.shadowRoot
            if (!editor || !root) { console.log('[ImageResizer] no editor/root'); return }

            const editorSurface = root.querySelector('[data-editor-root]') as HTMLElement | null
            if (!editorSurface) { console.log('[ImageResizer] no editorSurface'); return }
            console.log('[ImageResizer] one-time setup on', editorSurface.tagName)

        const computeRect = (img: HTMLImageElement) => {
            const surfaceRect = editorSurface.getBoundingClientRect()
            const imgRect = img.getBoundingClientRect()
            return {
                left: imgRect.left - surfaceRect.left,
                top: imgRect.top - surfaceRect.top,
                width: imgRect.width,
                height: imgRect.height,
            }
        }

        const detectAlign = (img: HTMLImageElement) => {
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

        const showOverlay = (img: HTMLImageElement) => {
            const rect = computeRect(img)
            const align = detectAlign(img)
            console.log('[ImageResizer] showOverlay', JSON.stringify({ rect, align }))

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
        }

        const hideOverlay = () => {
            overlayRect(null)
            if (overlayEl) overlayEl.style.display = 'none'
            if (toolbarEl) toolbarEl.style.display = 'none'
            if (root) (root as any).__activeImage = null
        }

        const onMouseDown = (e: MouseEvent) => {
            // Use composedPath()[0] to get the actual target before shadow DOM retargeting
            // event.target is retargeted to the host element when crossing shadow boundary
            const actualTarget = e.composedPath()[0] as HTMLElement
            console.log('[ImageResizer] mousedown handler called', actualTarget.tagName)
            // Skip if clicking on overlay, mini-toolbar, or main editor toolbar
            if (actualTarget.closest('[data-image-overlay],[data-image-mini-toolbar],.editor-toolbar')) return
            if (actualTarget instanceof HTMLImageElement && editorSurface.contains(actualTarget)) {
                console.log('[ImageResizer] image clicked!')
                e.preventDefault()
                e.stopPropagation()
                activeImage(actualTarget)
                // Directly set __activeImage on shadow root since Woby reactivity
                // doesn't trigger from addEventListener callbacks
                if (root) (root as any).__activeImage = actualTarget
                console.log('[ImageResizer] activeImage set:', $$(activeImage) ? 'has-img' : 'null')
                showOverlay(actualTarget)
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
            if (img) showOverlay(img)
        }

        editor.addEventListener('mousedown', onMouseDown, true)
        root.addEventListener('mousedown', onMouseDown, true)
        document.addEventListener('keydown', onKey)
        window.addEventListener('scroll', onScrollOrResize, true)
        window.addEventListener('resize', onScrollOrResize)

        const observer = new MutationObserver(() => {
            const img = $$(activeImage)
            if (img && (!editorSurface.contains(img) || !root.contains(img))) {
                activeImage(null)
                if (root) (root as any).__activeImage = null
                hideOverlay()
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
                    // Restore focus to editor after click
                    const editor = document.querySelector('wui-editor')
                    const editorRoot = editor?.shadowRoot?.querySelector('[data-editor-root]') as HTMLElement
                    if (editorRoot) editorRoot.focus()
                }
                return true
            }
            const allAttached =
                attach(alignLBtn, () => align('left')) &&
                attach(alignCBtn, () => align('center')) &&
                attach(alignRBtn, () => align('right')) &&
                attach(outdentBtn, () => indent(true)) &&
                attach(indentBtn, () => indent(false)) &&
                attach(deleteBtn, deleteImage)

            // Also attach mousedown handler to toolbar container (stopPropagation only, not preventDefault)
            if (toolbarEl) {
                toolbarEl.onmousedown = (e: MouseEvent) => { e.stopPropagation() }
            }

            if (allAttached) {
                console.log('[ImageResizer] click handlers attached successfully')
            } else {
                // Retry after a short delay if refs aren't populated yet
                console.log('[ImageResizer] refs not ready, retrying...')
                setTimeout(attachClickHandlers, 50)
            }
        }
        // Attach direct mousedown handlers for drag and resize handles
            // (Woby's onMouseDown delegation doesn't work in shadow DOM)
            const attachDragHandlers = () => {
                if (dragHandleEl) {
                    dragHandleEl.onmousedown = (e: MouseEvent) => {
                        console.log('[ImageResizer] dragHandle onmousedown fired!')
                        startDrag(e)
                    }
                }
                let allResizeAttached = true
                handleInnerEls.forEach((el, i) => {
                    if (el) {
                        const dir = handles[i]
                        el.onmousedown = (e: MouseEvent) => {
                            console.log('[ImageResizer] resize handle onmousedown fired!', dir)
                            startResize(e, dir)
                        }
                    } else {
                        allResizeAttached = false
                    }
                })
                if (!dragHandleEl || !allResizeAttached || handleInnerEls.length !== 8) {
                    setTimeout(attachDragHandlers, 50)
                } else {
                    console.log('[ImageResizer] drag handlers attached successfully')
                }
            }
            setTimeout(attachDragHandlers, 50)
            setTimeout(attachClickHandlers, 100)
    })

    const startResize = (e: MouseEvent, direction: ResizeDirection) => {
        const img = $$(activeImage)
        if (!img) return
        e.preventDefault()
        e.stopPropagation()

        const rect = img.getBoundingClientRect()
        resizing({
            img,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: rect.width,
            startHeight: rect.height,
            direction,
            aspect: rect.width / rect.height || 1,
        })

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

            newWidth = Math.max(20, newWidth)
            newHeight = Math.max(20, newHeight)

            state.img.style.width = `${newWidth}px`
            state.img.style.height = `${newHeight}px`

            // Update overlay position during resize
            const editor = document.querySelector('wui-editor') as HTMLElement
            const surface = editor?.shadowRoot?.querySelector('[data-editor-root]') as HTMLElement
            if (surface && overlayEl) {
                const surfaceRect = surface.getBoundingClientRect()
                const imgRect = state.img.getBoundingClientRect()
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
            resizing(null)
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)
        }

        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
    }

    const startDrag = (e: MouseEvent) => {
        console.log('[ImageResizer] startDrag called', e.type, e.clientX, e.clientY)
        const img = $$(activeImage)
        if (!img) { console.log('[ImageResizer] startDrag: no activeImage'); return }
        e.preventDefault()
        e.stopPropagation()

        // Store reference to the image being dragged
        const draggedImg = img
        const editor = document.querySelector('wui-editor') as HTMLElement
        const root = editor?.shadowRoot
        const surface = root?.querySelector('[data-editor-root]') as HTMLElement
        if (!root || !surface) return

        // Hide overlay during drag
        if (overlayEl) overlayEl.style.opacity = '0.5'
        if (toolbarEl) toolbarEl.style.display = 'none'

        // Make image pointer-events:none during drag so elementFromPoint sees through it
        const origPointerEvents = draggedImg.style.pointerEvents
        draggedImg.style.pointerEvents = 'none'

        // Create drop indicator
        let dropIndicator: HTMLElement | null = document.createElement('div')
        dropIndicator.style.cssText = 'position:absolute;height:2px;background:#3b82f6;pointer-events:none;z-index:1000;display:none;'
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

                const targetRect = drop.target.getBoundingClientRect()
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
            editor?.dispatchEvent?.(new CustomEvent('editor-change', { bubbles: true }))
        }

        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
    }

    const align = (a: 'left' | 'center' | 'right') => {
        const img = $$(activeImage)
        console.log('[ImageResizer] align called, direction:', a, 'activeImage:', img ? 'has-img' : 'null')
        if (!img) return
        applyImageAlignment(img, a)
        console.log('[ImageResizer] after applyImageAlignment:', img.style.display, img.style.marginLeft, img.style.marginRight)
        currentAlign(a)
        // Update button visuals
        [alignLBtn, alignCBtn, alignRBtn].forEach(b => {
            if (!b) return
            b.style.background = 'transparent'
            b.style.color = 'white'
        })
        if (a === 'left' && alignLBtn) { alignLBtn.style.background = 'white'; alignLBtn.style.color = '#3b82f6' }
        if (a === 'center' && alignCBtn) { alignCBtn.style.background = 'white'; alignCBtn.style.color = '#3b82f6' }
        if (a === 'right' && alignRBtn) { alignRBtn.style.background = 'white'; alignRBtn.style.color = '#3b82f6' }
        const editor = document.querySelector('wui-editor') as any
        editor?.dispatchEvent?.(new CustomEvent('editor-change', { bubbles: true }))
    }

    const indent = (outdent: boolean) => {
        const img = $$(activeImage)
        if (!img) return
        applyImageIndent(img, outdent)
    }

    const deleteImage = () => {
        const im = $$(activeImage)
        if (im) im.remove()
        activeImage(null)
        hideOverlay()
    }

    const hideOverlay = () => {
        if (overlayEl) overlayEl.style.display = 'none'
        if (toolbarEl) toolbarEl.style.display = 'none'
    }

    const handles: ResizeDirection[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

    return (
        <div class="image-resizer-root" data-image-resizer-root>
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
                <button ref={(el: HTMLButtonElement) => { alignLBtn = el }} data-image-mini-toolbar title="Align left" style={btnStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v2H3V3zm0 6h12v2H3V9zm0 6h18v2H3v-2zm0 6h12v2H3v-2z"/></svg>
                </button>
                <button ref={(el: HTMLButtonElement) => { alignCBtn = el }} data-image-mini-toolbar title="Align center" style={btnStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v2H3V3zm4 6h10v2H7V9zm0 6h10v2H7v-2zm-4 6h18v2H3v-2z"/></svg>
                </button>
                <button ref={(el: HTMLButtonElement) => { alignRBtn = el }} data-image-mini-toolbar title="Align right" style={btnStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v2H3V3zm6 6h12v2H9V9zm-6 6h18v2H3v-2zm6 6h12v2H9v-2z"/></svg>
                </button>
                <span data-image-mini-toolbar style={{ width: '1px', background: 'rgba(255,255,255,0.3)', margin: '2px' }} />
                <button ref={(el: HTMLButtonElement) => { outdentBtn = el }} data-image-mini-toolbar title="Outdent" style={btnStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21V3h2v18H3zm8-11v10l-7-5 7-5z"/></svg>
                </button>
                <button ref={(el: HTMLButtonElement) => { indentBtn = el }} data-image-mini-toolbar title="Indent" style={btnStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21V3h2v18H3zm8-11v10l7-5-7-5z"/></svg>
                </button>
                <span data-image-mini-toolbar style={{ width: '1px', background: 'rgba(255,255,255,0.3)', margin: '2px' }} />
                <button ref={(el: HTMLButtonElement) => { deleteBtn = el }} data-image-mini-toolbar title="Delete image" style={btnStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
            </div>
        </div>
    )
}

export { ImageResizer }
export default ImageResizer

/** @jsxImportSource woby */

import { JSX, useEffect } from 'woby'
import {
    bakeCrop,
    cropOutputSize,
    isRasterisable,
    mimeOf,
    naturalSize,
    type CropFrame,
    type CropTransform,
} from './ImageSource'

/**
 * ImageCropper: the editable preview inside the image dialog.
 *
 * A fixed viewport (the "frame") with the image floating behind it. The user pans the
 * image by dragging, zooms with ctrl+wheel or the zoom buttons, and resizes the frame
 * itself by its bottom-right handle. Whatever the frame shows when Insert is pressed is
 * exactly what gets embedded -- which is the point: cropping before the encode is what
 * keeps the data URI small, rather than embedding a twelve-megapixel photo and then
 * hiding most of it behind CSS.
 *
 * ## Why this is imperative
 *
 * Everything here is driven from pointer and wheel listeners, and woby's reactive
 * expressions do not re-run for observables written from `addEventListener` callbacks
 * (the same constraint `ImageResizer` documents at the top of its file). So the
 * transform lives in plain closure variables, the DOM is written directly in `apply`,
 * and the component hands the dialog an imperative {@link CropperHandle} rather than
 * exposing observables. Listeners are attached in `useEffect` and removed in its
 * cleanup.
 *
 * ## Coordinates
 *
 * `scale`/`x`/`y` are the {@link CropTransform} contract: the image is drawn at `scale`
 * with its top-left corner `x`,`y` px from the frame's top-left. The `<img>` is sized to
 * its natural pixels and then transformed from `origin-top-left`, so the CSS and the
 * canvas in `bakeCrop` describe the same rectangle without a second set of conversions.
 */

/** Frame size limits, in CSS px. The lower bound keeps the resize handle reachable. */
const FRAME_MIN = { w: 140, h: 100 }
const FRAME_MAX = { w: 760, h: 560 }
const FRAME_DEFAULT = { w: 460, h: 320 }

/** Zoom limits, as multiples of the "whole image fits the frame" scale. */
const ZOOM_OUT_LIMIT = 0.25
const ZOOM_IN_LIMIT = 12

/** Multiplier per zoom-button press. Wheel zoom is continuous and ignores this. */
const ZOOM_STEP = 1.25

export interface CropperHandle {
    /** Decode `src` and fit it to the frame. Rejects if the image cannot be decoded. */
    load(src: string): Promise<void>
    /** Drop the current image and blank the frame. */
    clear(): void
    /**
     * The visible crop as a `data:` URI, or `null` when there is nothing to bake or the
     * format must not be re-encoded (SVG, animated GIF -- see `isRasterisable`). A null
     * return means "use the source unchanged", not "something went wrong".
     */
    bake(): string | null
    /** Whether an image is currently loaded. */
    ready(): boolean
}

export const ImageCropper = ({ onHandle }: { onHandle?: (handle: CropperHandle) => void }): JSX.Element => {
    let frameEl: HTMLDivElement | null = null
    let imgEl: HTMLImageElement | null = null
    let readoutEl: HTMLElement | null = null
    let placeholderEl: HTMLElement | null = null

    /** Natural pixel size of the loaded image; null until one decodes. */
    let nat: { w: number, h: number } | null = null
    let mime = ''

    let frame: CropFrame = { ...FRAME_DEFAULT }
    let t: CropTransform = { scale: 1, x: 0, y: 0 }

    /** Scale at which the whole image just fits the frame -- the anchor for zoom limits. */
    let fitScale = 1

    /** Push the current frame and transform into the DOM. The only writer of geometry. */
    const apply = () => {
        if (frameEl) {
            frameEl.style.width = `${frame.w}px`
            frameEl.style.height = `${frame.h}px`
        }
        if (imgEl && nat) {
            imgEl.style.width = `${nat.w}px`
            imgEl.style.height = `${nat.h}px`
            imgEl.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.scale})`
        }
        if (placeholderEl) placeholderEl.style.display = nat ? 'none' : 'grid'
        if (readoutEl) {
            if (!nat) readoutEl.textContent = ''
            else if (!isRasterisable(mime)) readoutEl.textContent = `${nat.w} x ${nat.h} px -- embedded as-is (${mime})`
            else {
                const out = cropOutputSize(frame, t)
                const visible = Math.round(frame.w / t.scale)
                readoutEl.textContent = `output ${out.w} x ${out.h} px${out.w < visible ? ' (capped to A4)' : ''}`
            }
        }
    }

    /** Centre the whole image in the frame. Also re-establishes the zoom limits. */
    const fit = () => {
        if (!nat) return
        fitScale = Math.min(frame.w / nat.w, frame.h / nat.h)
        t = {
            scale: fitScale,
            x: (frame.w - nat.w * fitScale) / 2,
            y: (frame.h - nat.h * fitScale) / 2,
        }
        apply()
    }

    const clampScale = (s: number) =>
        Math.min(fitScale * ZOOM_IN_LIMIT, Math.max(fitScale * ZOOM_OUT_LIMIT, s))

    /**
     * Zoom about a point in frame coordinates, so whatever is under the cursor stays
     * under the cursor: the source pixel there is (fx - x) / scale, and holding that
     * constant across the scale change gives x' = fx - (fx - x) * (scale' / scale).
     */
    const zoomAt = (fx: number, fy: number, factor: number) => {
        if (!nat) return
        const next = clampScale(t.scale * factor)
        const k = next / t.scale
        if (k === 1) return
        t = { scale: next, x: fx - (fx - t.x) * k, y: fy - (fy - t.y) * k }
        apply()
    }

    /** Zoom about the frame's centre, for the +/- buttons. */
    const zoomCentre = (factor: number) => zoomAt(frame.w / 2, frame.h / 2, factor)

    const handle: CropperHandle = {
        load: (src: string) => new Promise<void>((resolve, reject) => {
            if (!imgEl) { reject(new Error('the preview is not mounted')); return }
            const el = imgEl
            mime = mimeOf(src)
            el.onload = () => {
                nat = naturalSize(el)
                fit()
                resolve()
            }
            el.onerror = () => {
                nat = null
                apply()
                reject(new Error('the image could not be decoded'))
            }
            el.src = src
        }),

        clear: () => {
            nat = null
            mime = ''
            if (imgEl) imgEl.removeAttribute('src')
            apply()
        },

        bake: () => {
            if (!imgEl || !nat) return null
            if (!isRasterisable(mime)) return null
            return bakeCrop(imgEl, frame, t)
        },

        ready: () => !!nat,
    }

    useEffect(() => {
        const el = frameEl
        if (!el) return

        // --- panning -------------------------------------------------------------
        let panning: { px: number, py: number, ox: number, oy: number } | null = null

        const onPointerDown = (e: PointerEvent) => {
            if (!nat) return
            // The resize handle sits inside the frame and drives its own gesture.
            // composedPath()[0] rather than e.target: inside a shadow root the target is
            // retargeted to the host, so a plain closest() would never see the handle.
            const target = e.composedPath()[0] as HTMLElement | undefined
            if (target?.closest?.('[data-crop-resize]')) return
            e.preventDefault()
            el.setPointerCapture(e.pointerId)
            panning = { px: e.clientX, py: e.clientY, ox: t.x, oy: t.y }
            el.style.cursor = 'grabbing'
        }

        const onPointerMove = (e: PointerEvent) => {
            if (!panning) return
            t = { ...t, x: panning.ox + (e.clientX - panning.px), y: panning.oy + (e.clientY - panning.py) }
            apply()
        }

        const endPan = (e: PointerEvent) => {
            if (!panning) return
            panning = null
            el.style.cursor = ''
            try { el.releasePointerCapture(e.pointerId) } catch { /* already released */ }
        }

        // --- ctrl+wheel zoom -----------------------------------------------------
        // Registered non-passive: without preventDefault the browser answers ctrl+wheel
        // with a page zoom, which fights the crop and cannot be undone from in here.
        const onWheel = (e: WheelEvent) => {
            if (!nat || !e.ctrlKey) return
            e.preventDefault()
            const box = el.getBoundingClientRect()
            // deltaY arrives in lines or pixels depending on the device; exponentiating a
            // normalised delta makes a trackpad's many small events and a mouse wheel's
            // few large ones feel like the same gesture.
            zoomAt(e.clientX - box.left, e.clientY - box.top, Math.exp(-e.deltaY / 300))
        }

        el.addEventListener('pointerdown', onPointerDown)
        el.addEventListener('pointermove', onPointerMove)
        el.addEventListener('pointerup', endPan)
        el.addEventListener('pointercancel', endPan)
        el.addEventListener('wheel', onWheel, { passive: false })

        apply()
        onHandle?.(handle)

        return () => {
            el.removeEventListener('pointerdown', onPointerDown)
            el.removeEventListener('pointermove', onPointerMove)
            el.removeEventListener('pointerup', endPan)
            el.removeEventListener('pointercancel', endPan)
            el.removeEventListener('wheel', onWheel)
        }
    })

    /** Frame resize, from the handle in the bottom-right corner. */
    const startResize = (e: PointerEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const grip = e.currentTarget as HTMLElement
        grip.setPointerCapture(e.pointerId)
        const start = { x: e.clientX, y: e.clientY, w: frame.w, h: frame.h }

        const move = (ev: PointerEvent) => {
            frame = {
                w: Math.min(FRAME_MAX.w, Math.max(FRAME_MIN.w, start.w + (ev.clientX - start.x))),
                h: Math.min(FRAME_MAX.h, Math.max(FRAME_MIN.h, start.h + (ev.clientY - start.y))),
            }
            // The zoom limits are relative to "fits the frame", so growing the frame has
            // to move them with it -- otherwise the floor drifts out from under a user
            // who resizes after zooming out.
            if (nat) fitScale = Math.min(frame.w / nat.w, frame.h / nat.h)
            apply()
        }
        const up = (ev: PointerEvent) => {
            grip.removeEventListener('pointermove', move)
            grip.removeEventListener('pointerup', up)
            try { grip.releasePointerCapture(ev.pointerId) } catch { /* already released */ }
        }
        grip.addEventListener('pointermove', move)
        grip.addEventListener('pointerup', up)
    }

    /**
     * Ref-based onclick throughout: woby's synthetic click delegation does not cross the
     * shadow boundary this dialog lives behind, so the buttons wire themselves.
     */
    const bindClick = (fn: () => void) => (el: HTMLElement | null) => {
        if (!el) return
        el.onclick = (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); fn() }
    }

    const toolBtn = 'px-2 h-6 min-w-[26px] text-xs leading-none rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'

    return (
        <div class="flex flex-col gap-1.5">
            <div class="flex items-center gap-1">
                <button type="button" class={toolBtn} title="Zoom out" ref={bindClick(() => zoomCentre(1 / ZOOM_STEP))}>&minus;</button>
                <button type="button" class={toolBtn} title="Zoom in" ref={bindClick(() => zoomCentre(ZOOM_STEP))}>+</button>
                <button type="button" class={toolBtn} title="Fit the whole image in the frame" ref={bindClick(fit)}>Fit</button>
                <span class="ml-auto text-[11px] text-gray-500 select-none">drag to pan &middot; ctrl+wheel to zoom</span>
            </div>

            <div
                ref={el => { frameEl = el as HTMLDivElement }}
                class="relative overflow-hidden rounded border border-gray-300 cursor-grab touch-none select-none"
                style={{
                    // A checkerboard, so the transparent margin left by zooming out past
                    // the image edge reads as "nothing here" rather than "white here".
                    backgroundColor: '#ffffff',
                    backgroundImage: 'repeating-conic-gradient(#eceff1 0% 25%, #ffffff 0% 50%)',
                    backgroundSize: '16px 16px',
                } as JSX.CSSProperties}
            >
                <img
                    ref={el => { imgEl = el as HTMLImageElement }}
                    alt=""
                    class="absolute top-0 left-0 max-w-none origin-top-left pointer-events-none"
                />

                <div
                    ref={el => { placeholderEl = el as HTMLElement }}
                    class="absolute inset-0 grid place-items-center text-xs text-gray-400 pointer-events-none"
                >
                    No image yet
                </div>

                <div
                    data-crop-resize
                    title="Drag to resize the crop frame"
                    class="absolute right-0 bottom-0 w-3.5 h-3.5 bg-blue-600 rounded-tl-sm cursor-se-resize touch-none"
                    ref={el => { if (el) (el as HTMLElement).onpointerdown = startResize }}
                />
            </div>

            <span ref={el => { readoutEl = el as HTMLElement }} class="text-[11px] text-gray-500 select-none" />
        </div>
    )
}

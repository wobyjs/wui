/** @jsxImportSource woby */

import { $, type CustomElementChildren, customElement, defaults, ElementAttributes, HtmlClass, JSX, ObservableMaybe, useEffect } from 'woby'
import { ImageCropper, type CropperHandle } from './ImageCropper'
import {
    ORIGIN_ATTR,
    dataUrlBytes,
    fileToDataUrl,
    formatBytes,
    isAllowedSource,
    loadImage,
    naturalSize,
    pristineSource,
    readImageOrigin,
    rememberImageOrigin,
    resolveImageSource,
} from './ImageSource'
import { t } from '../i18n'

/**
 * `<wui-image-editor>`: pan / zoom / resize / crop, pointed at an `<img>` that already
 * exists.
 *
 * The same {@link ImageCropper} the insert dialog uses, wrapped in a modal that reads an
 * image, bakes what the frame shows, and writes it back. It is deliberately not tied to
 * the editor: it takes an `HTMLImageElement`, and the element it belongs to may be
 * anywhere -- inside the editor's shadow root, inside someone else's, or in a plain
 * document.
 *
 * ## Opening it
 *
 * ```ts
 * import { openImageEditor } from '@woby/wui'
 * openImageEditor(someImg)                       // mounts <wui-image-editor> if needed
 * openImageEditor(someImg, { onApplied: save })  // e.g. push an undo step
 * ```
 *
 * {@link openImageEditor} finds or creates a `<wui-image-editor>` in the image's own root
 * node -- one per root, reused thereafter -- and hands it the image. Placing the tag by
 * hand works too; it will be found and reused rather than duplicated.
 *
 * ## Replacing the image
 *
 * The same modal doubles as a source picker: paste a URL, browse for a file, or drop one
 * anywhere on the panel, and the cropper switches to those pixels. Apply then writes the
 * replacement to the same `<img>`, keeping its place, size and alt text. A replacement is
 * not a crop -- the pixels no longer descend from the recorded origin -- so the old origin
 * is dropped and the new source becomes the one on record.
 *
 * ## What gets edited, and what survives
 *
 * Cropping is destructive, so the pixels fed to the cropper are the best available rather
 * than whatever is currently embedded: {@link pristineSource} prefers the URL recorded in
 * {@link ORIGIN_ATTR} and only falls back to the embedded copy. That makes a second crop
 * a crop of the original instead of a crop of a crop, and it is what the **Restore
 * original** button spends.
 *
 * An image that arrived from a local file has no URL to record, so its original is gone
 * once a crop is applied and Restore is not offered. That asymmetry is intentional --
 * keeping the original bytes would double what the document carries.
 *
 * ## Why this is imperative
 *
 * Same constraint as `ImageCropper` and `ImageDialog`: woby's reactive expressions do not
 * re-run for observables written from `addEventListener` callbacks, and everything here
 * starts in a pointer or keyboard event. State is closure variables, the DOM is written
 * directly, handlers are bound through refs because synthetic click delegation does not
 * cross the shadow boundary this lives behind.
 */

/** Dispatched on a `<wui-image-editor>` element to open it. See {@link openImageEditor}. */
export const EDIT_IMAGE_EVENT = 'wui-edit-image'

/**
 * Dispatched from the edited image once a change has landed, bubbling and composed so a
 * host can hear it through a shadow boundary. The editor uses it to push an undo step.
 */
export const IMAGE_APPLIED_EVENT = 'wui-image-applied'

export interface EditImageDetail {
    /** The image to edit. Its `src` is read on open and written on apply. */
    image: HTMLImageElement
    /**
     * Receive the new source instead of having it written to the image.
     *
     * For callers that own the image's state and would be overwritten by a direct DOM
     * write -- a framework binding, a model the DOM is rendered from.
     */
    onApply?: (src: string) => void
    /** Called after the change has landed. The place to push an undo step. */
    onApplied?: () => void
}

/** Parked on the host so an open() that arrives before the element has rendered survives. */
const PENDING = '__wuiPendingImageEdit'

/**
 * Required by `customElement`: woby builds the element's props from this, and a component
 * without it throws in the constructor. Nothing here is read -- the modal is fixed to the
 * viewport and takes its content from the image it is pointed at -- but `children` must
 * be a writable observable for the slot wiring, and `cls`/`class` exist because every
 * other wui element has them.
 */
const def = () => ({
    children: $(null) as CustomElementChildren,
    cls: $(null, HtmlClass) as ObservableMaybe<JSX.Class>,
    class: $(null, HtmlClass) as ObservableMaybe<JSX.Class>,
})

export const ImageEditor = defaults(def, (): JSX.Element => {
    let rootEl: HTMLElement | null = null
    let noteEl: HTMLElement | null = null
    let applyBtn: HTMLButtonElement | null = null
    let restoreBtn: HTMLButtonElement | null = null
    let panelEl: HTMLElement | null = null

    /**
     * How far the panel has been dragged from the centre, in px.
     *
     * Kept as a pair of numbers rather than read back off the element because the panel is
     * laid out by the overlay's `items-center justify-center` -- it has no left/top of its
     * own to add to, and a `transform` is the one offset that composites without asking
     * the flex container to reflow on every pointermove.
     */
    let dragX = 0
    let dragY = 0
    let srcInput: HTMLInputElement | null = null
    let fileInput: HTMLInputElement | null = null

    let cropper: CropperHandle | null = null

    /** The image being edited, and the callbacks the opener supplied. */
    let target: HTMLImageElement | null = null
    let onApply: ((src: string) => void) | undefined
    let onApplied: (() => void) | undefined

    /** `src` as it stood when the editor opened -- the candidate origin to record. */
    let openSrc = ''
    /** The bytes currently in the cropper. Used when `bake()` declines (SVG, GIF). */
    let editingSrc = ''
    /** False for a replacement that had to stay a link: a canvas cannot read those pixels. */
    let editingEmbedded = true
    /** Set once a different source has been adopted, which changes what apply records. */
    let replaced = false
    /**
     * The field is showing a description -- a picked file's name, or the size of an
     * embedded image -- rather than a URL, so committing it as one would be nonsense.
     */
    let fieldShowsSummary = false
    /**
     * The URL the field currently stands for. Distinct from `openSrc`: the field shows the
     * *origin* where there is one, while `openSrc` is whatever is in the `src` attribute,
     * usually an embedded crop of it. Committing the field is a no-op while they match,
     * which is what stops a blur from re-fetching what is already loaded.
     */
    let fieldSrc = ''

    /** Guards against a slow fetch resolving after the user has closed or reopened. */
    let loadToken = 0

    const setNote = (text: string, tone: 'info' | 'warn' = 'info') => {
        if (!noteEl) return
        noteEl.textContent = text
        noteEl.style.display = text ? 'block' : 'none'
        noteEl.className = text && tone === 'warn'
            ? 'text-[11px] leading-snug text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1'
            : 'text-[11px] leading-snug text-gray-500'
    }

    /** Put `value` in the source field. A summary is text about the image, not a URL. */
    const setField = (value: string, summary = false) => {
        fieldShowsSummary = summary
        fieldSrc = summary ? '' : value
        if (srcInput) srcInput.value = value
    }

    const setBusy = (busy: boolean) => {
        if (applyBtn) applyBtn.disabled = busy
        if (rootEl) rootEl.style.cursor = busy ? 'progress' : ''
    }

    // --- replacing the source ------------------------------------------------------

    /**
     * Point the editor at different pixels, keeping the same target `<img>`.
     *
     * Everything is staged until Apply, so a replacement can be typed, reconsidered and
     * dropped again without touching the document.
     */
    const adopt = async (source: string, summary?: string) => {
        const raw = source.trim()
        if (!raw) return
        if (!isAllowedSource(raw)) {
            setNote('Only http, https and data:image sources can be used.', 'warn')
            return
        }

        const token = ++loadToken
        setBusy(true)
        setNote('Loading…')
        try {
            // Embedding is requested rather than required: a host that refuses the fetch
            // yields a link, which is still a perfectly good image -- just not a croppable
            // one, and the warning says so.
            const { src, warning } = await resolveImageSource({ source: raw, embed: true })
            if (token !== loadToken) return
            await cropper?.load(src)
            if (token !== loadToken) return

            editingSrc = src
            editingEmbedded = /^data:/i.test(src)
            replaced = true
            openSrc = raw

            // Restore points at the origin of the pixels being replaced, which these are
            // not. It comes back on the next open, recorded against the new source.
            if (restoreBtn) restoreBtn.style.display = 'none'
            setField(summary ?? raw, !!summary)

            if (warning) setNote(`${warning} Cropping applies to embedded images only.`, 'warn')
            else setNote(`Replacement loaded — ${formatBytes(dataUrlBytes(src))}. Apply writes it to the image.`)
        } catch (e) {
            if (token !== loadToken) return
            setNote(e instanceof Error ? e.message : 'That image could not be loaded.', 'warn')
        } finally {
            if (token === loadToken) setBusy(false)
        }
    }

    const takeFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setNote(`That is not an image (${file.type || 'unknown type'}).`, 'warn')
            return
        }
        setBusy(true)
        let data: string
        try {
            data = await fileToDataUrl(file)
        } finally {
            setBusy(false)
        }
        await adopt(data, `${file.name} — ${formatBytes(file.size)}`)
    }

    /**
     * Commit whatever is in the field. Guarded against re-fetching what is already loaded,
     * because this fires on blur as well as on Enter.
     */
    const commitField = () => {
        const v = (srcInput?.value ?? '').trim()
        if (!v || fieldShowsSummary || v === fieldSrc) return
        void adopt(v)
    }

    const bindDropZone = (el: HTMLElement) => {
        el.ondragover = (e: DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
            el.classList.add('ring-2', 'ring-blue-400')
        }
        el.ondragleave = () => el.classList.remove('ring-2', 'ring-blue-400')
        el.ondrop = (e: DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            el.classList.remove('ring-2', 'ring-blue-400')
            const dt = e.dataTransfer
            if (!dt) return
            const file = Array.from(dt.files).find(f => f.type.startsWith('image/'))
            if (file) { void takeFile(file); return }
            // Dragging an image out of another browser tab hands over a URL, not a file.
            const url = (dt.getData('text/uri-list') || dt.getData('text/plain') || '').trim()
            if (!url) return
            setField(url)
            void adopt(url)
        }
    }

    // --- opening -----------------------------------------------------------------

    const open = async (detail: EditImageDetail) => {
        const img = detail.image
        if (!img || img.tagName !== 'IMG') return

        const token = ++loadToken
        target = img
        onApply = detail.onApply
        onApplied = detail.onApplied
        openSrc = (img.getAttribute('src') ?? '').trim()
        editingSrc = ''
        editingEmbedded = true
        replaced = false

        // The field opens showing where these pixels come from -- the recorded original by
        // preference, the image's own URL otherwise -- so the source is visible, copyable
        // and editable rather than being a blank box. An embedded image has no URL to
        // show, so it gets described instead, below, once its size is known.
        const origin = readImageOrigin(img)
        setField(origin || (/^https?:\/\//i.test(openSrc) ? openSrc : ''))

        cropper?.clear()
        recentre()
        if (rootEl) rootEl.style.display = 'flex'
        // Restore is only meaningful while an origin is on record; a local file never has
        // one, and applying Restore clears it because the image is then the original.
        if (restoreBtn) restoreBtn.style.display = origin ? '' : 'none'

        setBusy(true)
        setNote('Loading…')
        try {
            const { src, fromOrigin, warning } = await pristineSource(img)
            if (token !== loadToken) return
            editingSrc = src
            await cropper?.load(src)
            if (token !== loadToken) return
            const size = formatBytes(dataUrlBytes(src))
            if (!fieldSrc) setField(`embedded image — ${size}`, true)
            if (warning) setNote(warning, 'warn')
            else if (fromOrigin) setNote(`Editing the original — ${size}. Crops start from these pixels, not from the copy in the document.`)
            else setNote(`Editing the embedded copy — ${size}. There is no original on record, so this crop cannot be undone by Restore.`)
        } catch (e) {
            if (token !== loadToken) return
            cropper?.clear()
            editingSrc = ''
            setNote(e instanceof Error ? e.message : 'This image could not be loaded.', 'warn')
        } finally {
            if (token === loadToken) setBusy(false)
        }
    }

    const close = () => {
        loadToken++
        target = null
        onApply = undefined
        onApplied = undefined
        editingSrc = ''
        replaced = false
        setField('')
        cropper?.clear()
        if (rootEl) rootEl.style.display = 'none'
    }

    // --- writing back ------------------------------------------------------------

    /** The shadow host the image lives behind, if any -- where `editor-change` is heard. */
    const hostOf = (img: HTMLImageElement): HTMLElement | null => {
        const root = img.getRootNode()
        return root instanceof ShadowRoot ? (root.host as HTMLElement) : null
    }

    const notify = (img: HTMLImageElement) => {
        // Composed as well as bubbling: the image is usually inside a shadow root and the
        // listener that cares about it is outside one.
        img.dispatchEvent(new CustomEvent(IMAGE_APPLIED_EVENT, { bubbles: true, composed: true }))
        hostOf(img)?.dispatchEvent(new CustomEvent('editor-change', { bubbles: true, composed: true }))
        onApplied?.()
    }

    /**
     * Keep the image the width it was on screen, at the new aspect ratio.
     *
     * `ImageResizer` writes both `style.width` and `style.height` in px, so a crop that
     * changes the ratio would otherwise stretch the result. Only the height moves; the
     * width is what the user chose.
     */
    const refitBox = async (img: HTMLImageElement, src: string) => {
        const w = parseFloat(img.style.width || '')
        if (!Number.isFinite(w) || w <= 0) return
        try {
            const n = naturalSize(await loadImage(src))
            img.style.height = `${Math.round(w * n.h / n.w)}px`
        } catch {
            // Undecodable is not worth failing the apply over; drop the fixed height and
            // let the ratio come from the image itself.
            img.style.height = 'auto'
        }
    }

    const write = async (img: HTMLImageElement, src: string) => {
        if (onApply) onApply(src)
        else img.src = src
        await refitBox(img, src)
        notify(img)
    }

    const apply = () => {
        const img = target
        if (!img) return
        if (!editingSrc) {
            setNote('There is nothing to apply.', 'warn')
            return
        }

        // `bake()` returns null for formats a canvas would ruin (SVG, animated GIF); those
        // keep the bytes they arrived with, uncropped. That is a result, not a failure.
        // A replacement that stayed a link has no readable pixels at all, so it goes in
        // as it is.
        let next: string
        try {
            next = editingEmbedded ? cropper?.bake() ?? editingSrc : editingSrc
        } catch {
            setNote('The crop could not be applied.', 'warn')
            return
        }

        // A replacement descends from a different image, so the origin on record describes
        // pixels that are about to be thrown away. Cleared so the new source can take it.
        if (replaced) img.removeAttribute(ORIGIN_ATTR)

        // Recorded before the src is overwritten, and only if it is a URL -- this is the
        // whole of what makes Restore and a non-compounding re-crop possible.
        rememberImageOrigin(img, openSrc)

        setBusy(true)
        void write(img, next).finally(() => {
            setBusy(false)
            close()
        })
    }

    const restore = () => {
        const img = target
        if (!img) return
        const origin = readImageOrigin(img)
        if (!origin) return

        // The image *is* the original again, so there is nothing left to restore to. A
        // later crop re-records it from the URL that is now in `src`.
        img.removeAttribute(ORIGIN_ATTR)
        setBusy(true)
        void write(img, origin).finally(() => {
            setBusy(false)
            close()
        })
    }

    // --- wiring ------------------------------------------------------------------

    useEffect(() => {
        const el = rootEl
        if (!el) return

        // The custom element host, which is what `openImageEditor` dispatches on. Falls
        // back to the document so a hand-placed <ImageEditor/> is still reachable.
        const root = el.getRootNode()
        const host: EventTarget = root instanceof ShadowRoot ? root.host : document

        const onOpen = (e: Event) => {
            delete (host as any)[PENDING]
            void open((e as CustomEvent<EditImageDetail>).detail)
        }
        const onKeyDown = (e: KeyboardEvent) => {
            if (el.style.display === 'none') return
            if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close() }
        }

        host.addEventListener(EDIT_IMAGE_EVENT, onOpen)
        // Capture phase: Escape has to win over the key handling of whatever surface this
        // was opened over, and that surface is usually behind a shadow boundary a bubbling
        // listener would not reach first.
        document.addEventListener('keydown', onKeyDown, true)

        el.style.display = 'none'
        setNote('')

        // An open() dispatched before this effect ran -- the ordinary case the first time
        // `openImageEditor` creates the element -- is parked on the host rather than lost.
        const pending = (host as any)[PENDING] as EditImageDetail | undefined
        if (pending) {
            delete (host as any)[PENDING]
            void open(pending)
        }

        return () => {
            host.removeEventListener(EDIT_IMAGE_EVENT, onOpen)
            document.removeEventListener('keydown', onKeyDown, true)
        }
    })

    /** Ref-bound clicks: woby's synthetic delegation does not cross a shadow boundary. */
    const bindClick = (fn: () => void) => (el: HTMLElement | null) => {
        if (!el) return
        el.onclick = (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); fn() }
    }

    /**
     * Drag the panel by its title bar.
     *
     * A modal that cannot move is a modal that hides the thing being edited: the cropper
     * shows the image, but the *document* underneath is what tells you whether the crop
     * suits the page it lands on. The overlay stays put and keeps swallowing clicks --
     * only the panel moves.
     *
     * Listeners go on `window`, not on the handle: a pointer that leaves the 520px panel
     * mid-drag would otherwise stop reporting, and the panel would stick. Pointer capture
     * would also work, but `setPointerCapture` on an element inside a shadow root retargets
     * the events in ways the rest of this file does not need to know about.
     */
    const startDrag = (e: PointerEvent) => {
        if (!panelEl || e.button !== 0) return
        const sx = e.clientX, sy = e.clientY
        const ox = dragX, oy = dragY
        const move = (m: PointerEvent) => {
            dragX = ox + m.clientX - sx
            dragY = oy + m.clientY - sy
            panelEl!.style.transform = `translate(${dragX}px, ${dragY}px)`
        }
        const up = () => {
            window.removeEventListener('pointermove', move)
            window.removeEventListener('pointerup', up)
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', up)
        // Stops the press from selecting the title text, and from reaching the overlay's
        // click-to-close.
        e.preventDefault()
        e.stopPropagation()
    }

    /** Put the panel back in the middle. Called on every open, so it never opens off-screen. */
    const recentre = () => {
        dragX = dragY = 0
        if (panelEl) panelEl.style.transform = ''
    }

    const field = 'w-full h-8 px-2 text-xs rounded border border-gray-300 bg-white text-gray-800 focus:outline-none focus:border-blue-500'
    const btn = 'h-8 px-3 text-xs rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 whitespace-nowrap'
    const primaryBtn = 'h-8 px-3 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap'

    return (
        <div
            ref={el => {
                rootEl = el as HTMLElement
                if (el) (el as HTMLElement).onclick = () => close()
            }}
            data-image-editor
            class="fixed inset-0 z-[1200] items-center justify-center bg-black/30"
            style={{ display: 'none' } as JSX.CSSProperties}
        >
            <div
                class="flex flex-col gap-2.5 w-[520px] max-w-[92vw] max-h-[88vh] overflow-auto p-3 bg-white border border-gray-200 rounded-md shadow-xl"
                ref={el => {
                    if (!el) return
                    const panel = el as HTMLElement
                    panelEl = panel
                    panel.onclick = (e: MouseEvent) => e.stopPropagation()
                    // The whole panel takes drops, not just the field: aiming at a 32px
                    // input is a worse experience than aiming at the thing being replaced.
                    bindDropZone(panel)
                }}
            >
                <div
                    ref={el => { if (el) (el as HTMLElement).onpointerdown = startDrag }}
                    class="-m-3 mb-0 px-3 py-2 flex items-center gap-2 text-sm font-medium text-gray-800 bg-gray-50 border-b border-gray-200 rounded-t-md cursor-move select-none"
                    title={() => t('editor.dragToMoveDialog')}
                >
                    <span class="text-gray-400">&#x2725;</span>
                    Edit image
                </div>

                <ImageCropper onHandle={h => { cropper = h }} />

                <div class="flex flex-col gap-1.5">
                    <label class="text-[11px] text-gray-600">{() => t('editor.image.sourceEdit')}</label>
                    <div class="flex items-center gap-2">
                        <input
                            ref={el => {
                                srcInput = el as HTMLInputElement
                                if (!el) return
                                const input = el as HTMLInputElement
                                input.oninput = () => { fieldShowsSummary = false }
                                input.onchange = commitField
                                input.onblur = commitField
                                input.onkeydown = (e: KeyboardEvent) => {
                                    // Enter commits rather than doing nothing; Escape still
                                    // closes, so the two keys stay distinguishable here.
                                    if (e.key !== 'Enter') return
                                    e.preventDefault()
                                    e.stopPropagation()
                                    commitField()
                                }
                            }}
                            type="text"
                            class={field}
                            placeholder="https://example.com/photo.jpg"
                            spellCheck={false}
                        />
                        <button type="button" class={btn} ref={bindClick(() => fileInput?.click())}>{() => t('common.browse')}</button>
                    </div>
                    <input
                        ref={el => {
                            fileInput = el as HTMLInputElement
                            if (!el) return
                            ;(el as HTMLInputElement).onchange = () => {
                                const f = fileInput?.files?.[0]
                                if (f) void takeFile(f)
                                // Cleared so picking the same file twice still fires change.
                                if (fileInput) fileInput.value = ''
                            }
                        }}
                        type="file"
                        accept="image/*"
                        class="hidden"
                    />
                </div>

                <div
                    ref={el => { noteEl = el as HTMLElement }}
                    class="text-[11px] leading-snug text-gray-500"
                    style={{ display: 'none' } as JSX.CSSProperties}
                />

                <div class="flex items-center gap-2 pt-1">
                    <button
                        type="button"
                        class={btn}
                        title={() => t('editor.image.discardCropsPlain')}
                        ref={el => { restoreBtn = el as HTMLButtonElement; bindClick(restore)(el) }}
                        style={{ display: 'none' } as JSX.CSSProperties}
                    >
                        {() => t('editor.image.restoreOriginal')}
                    </button>
                    <div class="ml-auto flex gap-2">
                        <button type="button" class={btn} ref={bindClick(close)}>{() => t('common.cancel')}</button>
                        <button
                            type="button"
                            class={primaryBtn}
                            ref={el => { applyBtn = el as HTMLButtonElement; bindClick(apply)(el) }}
                        >
                            {() => t('common.apply')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
})

/**
 * Find or create the `<wui-image-editor>` serving this image's root node.
 *
 * One per root: images in the editor's shadow root share an instance, images in the main
 * document share another. Appended to the root rather than to the image's parent so it
 * never lands inside a contenteditable surface.
 */
const hostFor = (image: HTMLImageElement): HTMLElement => {
    const root = image.getRootNode()
    const scope: ShadowRoot | Document = root instanceof ShadowRoot ? root : document
    const existing = scope.querySelector('wui-image-editor') as HTMLElement | null
    if (existing) return existing

    const el = document.createElement('wui-image-editor')
    if (root instanceof ShadowRoot) root.appendChild(el)
    else document.body.appendChild(el)
    return el
}

/**
 * Open the image editor on `image`.
 *
 * The public entry point, and the only one that needs to exist: it mounts the element on
 * first use, so a caller anywhere -- a toolbar button, a property panel action, a context
 * menu in an app that has never heard of the editor -- needs nothing but the image.
 */
export const openImageEditor = (
    image: HTMLImageElement,
    opts: { onApply?: (src: string) => void, onApplied?: () => void } = {},
): void => {
    const host = hostFor(image)
    const detail: EditImageDetail = { image, ...opts }
    // Parked as well as dispatched: on first use the element has just been created and
    // its listener is not attached yet, so the event alone would be dropped.
    ;(host as any)[PENDING] = detail
    host.dispatchEvent(new CustomEvent<EditImageDetail>(EDIT_IMAGE_EVENT, { detail }))
}

customElement('wui-image-editor', ImageEditor)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-image-editor': ElementAttributes<typeof ImageEditor>
        }
    }
}

export default ImageEditor

/** @jsxImportSource woby */

import { JSX, useEffect } from 'woby'
import { ImageCropper, type CropperHandle } from './ImageCropper'
import {
    dataUrlBytes,
    fileToDataUrl,
    formatBytes,
    isAllowedSource,
    rememberImageOrigin,
    resolveImageSource,
} from './ImageSource'
import { useUndoRedo } from './undoredo'

/**
 * ImageDialog: the one way an image gets into the editor.
 *
 * Replaces the `prompt('Enter image URL:')` that used to be the whole feature. It is a
 * modal inside the editor's shadow root -- mounted next to `ImageResizer`,
 * `TablePopupMenu` and `PropertyPanel` -- and it opens in response to an
 * {@link INSERT_IMAGE_EVENT} CustomEvent on the editor host, so the toolbar's insert
 * menu, a paste and a drop can all reach it without any of them knowing where it lives.
 *
 * ## Why the dialog owns the caret
 *
 * Opening it moves focus out of the contenteditable surface, which destroys the shadow
 * root's selection. So the caller captures the `Range` first and passes it in the
 * event's `detail`; the dialog restores it just before inserting. This is the same
 * dance the old prompt-based code did, made explicit because a modal keeps focus for a
 * lot longer than a prompt does.
 *
 * ## One field
 *
 * Source, file picker and drop target are a single row rather than one row each: a URL,
 * a picked file and a dropped file are the same question asked three ways, and the field
 * always shows the answer whichever way it arrived.
 *
 * ## Why this is imperative
 *
 * Every state change here originates in a DOM event listener, and woby's reactive
 * expressions do not re-run for observables written from those (see the note atop
 * `ImageResizer`). So the dialog reads its values straight off the inputs and writes
 * visibility, warnings and disabled states straight to the elements.
 */

/** Dispatched on the `wui-editor` host to open the dialog. */
export const INSERT_IMAGE_EVENT = 'editor-insert-image'

export interface InsertImageDetail {
    /** Caret position captured before focus left the editor. Required to insert. */
    range?: Range
    /** A file from a paste or a drop, pre-selected as the source. */
    file?: File
}

/** Classes applied to every inserted image, matching what the old insert path produced. */
const IMG_CLASS = 'max-w-full h-auto my-2'

export const ImageDialog = (): JSX.Element => {
    // Undo/redo is a context the editor may not have provided (the dialog is also usable
    // in isolation in tests), so every read is guarded -- same as `EditorSurface`.
    const undoRedo = useUndoRedo()
    const saveDo = undoRedo?.saveDo ?? (() => { })

    let rootEl: HTMLElement | null = null
    let srcInput: HTMLInputElement | null = null
    let altInput: HTMLInputElement | null = null
    let embedInput: HTMLInputElement | null = null
    let fileInput: HTMLInputElement | null = null
    let noteEl: HTMLElement | null = null
    let insertBtn: HTMLButtonElement | null = null

    let cropper: CropperHandle | null = null

    /** The caret to insert at, captured by whoever opened the dialog. */
    let savedRange: Range | null = null

    /**
     * The source as the user gave it, which is not always what the field shows: a picked
     * or dropped file puts a readable summary in the field instead of a megabyte of
     * base64. Typing in the field takes ownership back (see `onSrcInput`).
     */
    let rawSource = ''
    let fieldShowsSummary = false

    /** What the preview is currently showing, and whether it is embeddable bytes. */
    let previewSrc = ''
    let embedded = false

    /** Guards against a slow fetch resolving after the user has moved on. */
    let previewToken = 0

    const setNote = (text: string, tone: 'info' | 'warn' = 'info') => {
        if (!noteEl) return
        noteEl.textContent = text
        noteEl.style.display = text ? 'block' : 'none'
        noteEl.className = text && tone === 'warn'
            ? 'text-[11px] leading-snug text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1'
            : 'text-[11px] leading-snug text-gray-500'
    }

    const setBusy = (busy: boolean) => {
        if (insertBtn) insertBtn.disabled = busy
        if (rootEl) rootEl.style.cursor = busy ? 'progress' : ''
    }

    /**
     * Resolve the current source and show it in the cropper.
     *
     * `resolveImageSource` is what decides whether the result is embeddable bytes or a
     * plain link, so the dialog does not repeat that judgement -- it only reports it.
     */
    const preview = async () => {
        const token = ++previewToken
        const source = rawSource.trim()
        if (!source) {
            cropper?.clear()
            previewSrc = ''
            embedded = false
            setNote('')
            return
        }
        if (!isAllowedSource(source)) {
            cropper?.clear()
            previewSrc = ''
            embedded = false
            setNote('Only http, https and data:image sources can be inserted.', 'warn')
            return
        }

        setBusy(true)
        setNote('Loading…')
        try {
            const { src, warning } = await resolveImageSource({ source, embed: !!embedInput?.checked })
            if (token !== previewToken) return
            previewSrc = src
            embedded = /^data:/i.test(src)
            await cropper?.load(src)
            if (token !== previewToken) return
            if (warning) setNote(`${warning} Cropping is unavailable for linked images.`, 'warn')
            else if (embedded) setNote(`Embedded — ${formatBytes(dataUrlBytes(src))} before cropping.`)
            else setNote('Linked, not embedded — the document will point at this URL. Cropping applies to embedded images only.')
        } catch (e) {
            if (token !== previewToken) return
            cropper?.clear()
            previewSrc = ''
            embedded = false
            setNote(e instanceof Error ? e.message : 'That image could not be loaded.', 'warn')
        } finally {
            if (token === previewToken) setBusy(false)
        }
    }

    /** Adopt a picked, dropped or pasted file as the source. */
    const takeFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setNote(`That is not an image (${file.type || 'unknown type'}).`, 'warn')
            return
        }
        setBusy(true)
        try {
            rawSource = await fileToDataUrl(file)
            fieldShowsSummary = true
            if (srcInput) srcInput.value = `${file.name} — ${formatBytes(file.size)}`
            // A local file has no URL to fall back to, so it can only be embedded.
            if (embedInput) { embedInput.checked = true; embedInput.disabled = true }
        } finally {
            setBusy(false)
        }
        await preview()
    }

    const open = (detail: InsertImageDetail) => {
        savedRange = detail.range ?? null
        rawSource = ''
        fieldShowsSummary = false
        previewSrc = ''
        embedded = false
        previewToken++
        cropper?.clear()
        if (srcInput) srcInput.value = ''
        if (altInput) altInput.value = ''
        if (embedInput) { embedInput.checked = true; embedInput.disabled = false }
        setNote('')
        if (rootEl) rootEl.style.display = 'flex'
        if (detail.file) void takeFile(detail.file)
        else srcInput?.focus()
    }

    const close = () => {
        previewToken++
        savedRange = null
        cropper?.clear()
        if (rootEl) rootEl.style.display = 'none'
    }

    /** The editor host this dialog was rendered into. */
    const host = (): HTMLElement | null => {
        const root = rootEl?.getRootNode?.()
        if (root instanceof ShadowRoot) return root.host as HTMLElement
        return document.querySelector('wui-editor')
    }

    const insert = () => {
        if (!previewSrc) {
            setNote('Enter an image URL, or choose a file.', 'warn')
            return
        }

        // Baking is what makes the crop real. `bake()` returns null for formats a canvas
        // would ruin (SVG, animated GIF) -- those keep their original bytes, uncropped.
        let src = previewSrc
        if (embedded) {
            try {
                src = cropper?.bake() ?? previewSrc
            } catch {
                // A tainted canvas. Should be unreachable: `embedded` means the preview is
                // a data: URI. Falling back to the uncropped bytes beats failing to insert.
                src = previewSrc
                setNote('The crop could not be applied; the full image was inserted.', 'warn')
            }
        }

        const range = savedRange
        if (!range) {
            setNote('The insertion point was lost. Click in the document and try again.', 'warn')
            return
        }

        const img = document.createElement('img')
        // Assigned as properties on a detached element rather than interpolated into an
        // HTML string for execCommand: there is no attribute context to escape out of, so
        // no sanitiser is needed and the base64 payload is never regex-scanned.
        img.src = src
        img.className = IMG_CLASS
        // Record where the pixels came from while the URL is still in hand. Once embedded
        // and cropped there is no way back to it, and this is what `wui-image-editor`
        // spends to re-crop from the original and to offer Restore.
        rememberImageOrigin(img, rawSource)
        const alt = altInput?.value.trim()
        if (alt) img.alt = alt

        range.deleteContents()
        range.insertNode(img)

        // Leave the caret after the image so typing continues where the user expects.
        const after = document.createRange()
        after.setStartAfter(img)
        after.collapse(true)
        const shadow = host()?.shadowRoot
        const selection = shadow ? (shadow as unknown as { getSelection?: () => Selection | null }).getSelection?.() ?? window.getSelection() : window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(after)

        close()
        host()?.dispatchEvent(new CustomEvent('editor-change', { bubbles: true }))
        saveDo()
    }

    // --- wiring ------------------------------------------------------------------

    useEffect(() => {
        const el = rootEl
        if (!el) return
        const editorHost = host()
        if (!editorHost) return

        const onOpen = (e: Event) => open((e as CustomEvent<InsertImageDetail>).detail ?? {})
        const onKeyDown = (e: KeyboardEvent) => {
            if (el.style.display === 'none') return
            if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close() }
        }

        editorHost.addEventListener(INSERT_IMAGE_EVENT, onOpen)
        // Capture phase on the document: Escape must win over the editor's own key
        // handling while the modal is up, and the modal lives behind a shadow boundary
        // that a bubbling listener on the host would not see first.
        document.addEventListener('keydown', onKeyDown, true)

        el.style.display = 'none'
        setNote('')

        return () => {
            editorHost.removeEventListener(INSERT_IMAGE_EVENT, onOpen)
            document.removeEventListener('keydown', onKeyDown, true)
        }
    })

    /**
     * Ref-based DOM handlers throughout: woby's synthetic event delegation does not cross
     * the shadow boundary this dialog lives behind.
     */
    const bindClick = (fn: () => void) => (el: HTMLElement | null) => {
        if (!el) return
        el.onclick = (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); fn() }
    }

    const onSrcInput = () => {
        // The moment the user types, the field is the truth again -- even if it was
        // showing the summary of a picked file a keystroke ago.
        fieldShowsSummary = false
        rawSource = srcInput?.value ?? ''
        if (embedInput) embedInput.disabled = false
    }

    const bindDropZone = (el: HTMLElement | null) => {
        if (!el) return
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
            if (url) {
                fieldShowsSummary = false
                rawSource = url
                if (srcInput) srcInput.value = url
                if (embedInput) embedInput.disabled = false
                void preview()
            }
        }
    }

    const field = 'w-full h-8 px-2 text-xs rounded border border-gray-300 bg-white text-gray-800 focus:outline-none focus:border-blue-500'
    const btn = 'h-8 px-3 text-xs rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 whitespace-nowrap'
    const primaryBtn = 'h-8 px-3 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap'

    return (
        <div
            ref={el => {
                rootEl = el as HTMLElement
                // Clicking the backdrop cancels, which is what a modal is expected to do.
                // The panel below stops its own clicks from reaching here.
                if (el) (el as HTMLElement).onclick = () => close()
            }}
            data-image-dialog
            class="fixed inset-0 z-[1200] items-center justify-center bg-black/30"
            style={{ display: 'none' } as JSX.CSSProperties}
        >
            <div
                class="flex flex-col gap-2.5 w-[520px] max-w-[92vw] max-h-[88vh] overflow-auto p-3 bg-white border border-gray-200 rounded-md shadow-xl"
                ref={el => {
                    // Clicks inside the dialog must not reach the backdrop's close handler.
                    if (el) (el as HTMLElement).onclick = (e: MouseEvent) => e.stopPropagation()
                }}
            >
                <div class="text-sm font-medium text-gray-800">Insert image</div>

                <div ref={bindDropZone} class="flex flex-col gap-2 rounded p-2 -m-2">
                    <label class="text-[11px] text-gray-600">Source &mdash; paste a URL, browse, or drop an image here</label>
                    <div class="flex items-center gap-2">
                        <input
                            ref={el => {
                                srcInput = el as HTMLInputElement
                                if (el) {
                                    const input = el as HTMLInputElement
                                    input.oninput = onSrcInput
                                    input.onchange = () => { onSrcInput(); void preview() }
                                    input.onkeydown = (e: KeyboardEvent) => {
                                        if (e.key !== 'Enter') return
                                        e.preventDefault()
                                        onSrcInput()
                                        void preview()
                                    }
                                    input.onblur = () => { if (!fieldShowsSummary) void preview() }
                                }
                            }}
                            type="text"
                            class={field}
                            placeholder="https://example.com/photo.jpg"
                            spellCheck={false}
                        />
                        <button type="button" class={btn} ref={bindClick(() => fileInput?.click())}>Browse&hellip;</button>
                    </div>

                    <input
                        ref={el => {
                            fileInput = el as HTMLInputElement
                            if (el) (el as HTMLInputElement).onchange = () => {
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

                    <ImageCropper onHandle={h => { cropper = h }} />
                </div>

                <div ref={el => { noteEl = el as HTMLElement }} class="text-[11px] leading-snug text-gray-500" style={{ display: 'none' } as JSX.CSSProperties} />

                <div class="flex items-center gap-2">
                    <label class="text-[11px] text-gray-600 w-16 shrink-0">Alt text</label>
                    <input ref={el => { altInput = el as HTMLInputElement }} type="text" class={field} placeholder="Describes the image for screen readers" />
                </div>

                <label class="flex items-center gap-2 text-[11px] text-gray-700 select-none">
                    <input
                        ref={el => {
                            embedInput = el as HTMLInputElement
                            if (el) (el as HTMLInputElement).onchange = () => { void preview() }
                        }}
                        type="checkbox"
                        checked
                        class="w-3.5 h-3.5"
                    />
                    Embed the image in the document (data: URI)
                </label>

                <div class="flex justify-end gap-2 pt-1">
                    <button type="button" class={btn} ref={bindClick(close)}>Cancel</button>
                    <button
                        type="button"
                        class={primaryBtn}
                        ref={el => { insertBtn = el as HTMLButtonElement; bindClick(insert)(el) }}
                    >
                        Insert
                    </button>
                </div>
            </div>
        </div>
    )
}

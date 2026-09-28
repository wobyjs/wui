import { $, $$ } from 'woby'
import { openImageEditor } from '../../src/Editor/ImageEditor'
import { ImageDialog, INSERT_IMAGE_EVENT } from '../../src/Editor/ImageDialog'

/**
 * Live, real-browser companion to `test/Editor/escalateAboveOcclusion.test.ts` (which proves
 * the same contract against a happy-dom paint-order model). Each demo opens the real dialog
 * and toggles a real high z-index covering overlay, so `escalateAboveOcclusion` can be
 * verified against actual browser stacking/paint, not a simulation.
 */

const Cover = ({ visible }: { visible: any }) => (
    <div
        data-cover
        class="fixed inset-0 z-[5000] bg-red-500/40 flex items-center justify-center text-white font-bold text-xl pointer-events-none"
        style={{ display: () => ($$(visible) ? 'flex' : 'none') }}
    >
        Covering overlay (z-index: 5000)
    </div>
)

const ImageEditorOcclusionDemo = () => {
    const coverOn = $(false)
    const imgRef = $(null as HTMLImageElement | null)

    return <>
        <div class="mb-4 p-4 border border-gray-300 rounded">
            <p class="m-2">
                Opens the real <code>wui-image-editor</code> custom element (mounted on
                <code>document.body</code> by <code>openImageEditor</code>) and toggles a high
                z-index (5000) covering overlay, to prove <code>escalateAboveOcclusion</code>
                lifts the dialog above it in a real browser.
            </p>
            <div class="flex gap-4 items-center my-2">
                <button
                    class="px-3 py-1.5 bg-blue-600 text-white rounded cursor-pointer"
                    onClick={() => openImageEditor($$(imgRef) as HTMLImageElement)}
                >
                    Open Image Editor
                </button>
                <button
                    class="px-3 py-1.5 bg-red-600 text-white rounded cursor-pointer"
                    onClick={() => coverOn(v => !v)}
                >
                    {() => $$(coverOn) ? 'Remove Cover (z-index 5000)' : 'Add Cover (z-index 5000)'}
                </button>
            </div>
            <img
                ref={imgRef}
                src="data:image/gif;base64,R0lGODlhAQABAAAAACw="
                width="1"
                height="1"
                class="hidden"
            />
        </div>
        <Cover visible={coverOn} />
    </>
}

const ImageDialogOcclusionDemo = () => {
    const coverOn = $(false)

    return <>
        <div class="mb-4 p-4 border border-gray-300 rounded">
            <p class="m-2">
                Mounts the real <code>ImageDialog</code> and dispatches the real
                <code>editor-insert-image</code> event on <code>document</code> (as the
                editor's toolbar does) to open it, then toggles a high z-index (5000) covering
                overlay, to prove <code>escalateAboveOcclusion</code> lifts the dialog above it
                in a real browser.
            </p>
            <div class="flex gap-4 items-center my-2">
                <button
                    class="px-3 py-1.5 bg-blue-600 text-white rounded cursor-pointer"
                    onClick={() => document.dispatchEvent(new CustomEvent(INSERT_IMAGE_EVENT, { bubbles: true, detail: {} }))}
                >
                    Open Image Dialog
                </button>
                <button
                    class="px-3 py-1.5 bg-red-600 text-white rounded cursor-pointer"
                    onClick={() => coverOn(v => !v)}
                >
                    {() => $$(coverOn) ? 'Remove Cover (z-index 5000)' : 'Add Cover (z-index 5000)'}
                </button>
            </div>
            <ImageDialog />
        </div>
        <Cover visible={coverOn} />
    </>
}

export {
    ImageEditorOcclusionDemo,
    ImageDialogOcclusionDemo,
}

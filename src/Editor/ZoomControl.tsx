/**
 * ZoomControl.tsx — the document zoom: `−`, a percentage, `+`.
 *
 * The engine is {@link setLayoutZoom} in PageLayout.ts, which writes one custom property
 * that one CSS declaration consumes. This file is the strip of buttons that drives it and
 * the observable that lets the rest of the editor read the result.
 *
 * ## Why `zoom` and not a transform
 *
 * Settled in PageLayout: a `transform: scale()` paints the document smaller but leaves its
 * hit-testing and caret geometry at full size, so clicks land in the wrong place and typed
 * characters appear where the pointer is not. `zoom` scales layout itself, so a zoomed
 * document is still an editable one. That is the whole reason this control can exist in an
 * editor rather than only in a preview.
 *
 * ## Fit is a mode, not a number
 *
 * `Fit` defers the decision to the surface: it is recomputed on every resize, which is
 * exactly what an author wants while a window is being dragged about and exactly what they
 * do not want after they have said "150%". So the two are kept distinct all the way down —
 * pressing `+` from `Fit` leaves fit behind and lands on the next step up from whatever fit
 * happened to come to, which is the least surprising thing it can do.
 *
 * In `flow` and `screen` there is no paper to fit, so `Fit` there reads 100%.
 *
 * @example
 * ```tsx
 * <ZoomControl />                       // in the toolbar
 * setEditorZoom(surface, 1.5)           // or from a host's own chrome
 * ```
 */

import { $, $$, customElement, defaults, ElementAttributes, HtmlClass, HtmlString, JSX, ObservableMaybe, useEffect } from 'woby'
import { Button, ButtonStyles } from '../Button'
import { useEditor } from './undoredo'
import { getCurrentEditor } from './utils'
import { useDropdownDismiss } from './useDropdownDismiss'
import { setLayoutZoom, resolvedZoom, onZoomApplied, ZOOM_MIN, ZOOM_MAX, type ZoomLevel } from './PageLayout'
import { editorLayout } from './LayoutSwitch'

/** The stops `−` and `+` walk between. Coarse at the ends, fine around 100%. */
const STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4]

/** What the menu offers. `fit` first, because it is the default and the one to come back to. */
const PRESETS: ZoomLevel[] = ['fit', 0.5, 0.75, 1, 1.25, 1.5, 2]

/**
 * The zoom as the author set it, mirrored out of PageLayout so the UI can bind to it.
 *
 * PageLayout is the single owner of the value — this is a published copy, written only by
 * {@link setEditorZoom}, exactly as {@link editorLayout} mirrors the layout mode.
 */
export const editorZoom = $<ZoomLevel>('fit')

/**
 * Bumped whenever the painted scale may have changed for a reason the zoom itself did not
 * cause — a resize under `Fit`, or a switch into `page`. The readout reads it so that
 * "Fit" still shows the right percentage without polling for it.
 */
const zoomTick = $(0)

/** Refresh the readout. Cheap, and idempotent — it only invalidates a derived string. */
export const notifyZoomChanged = () => zoomTick($$(zoomTick) + 1)

// The window `resize` listener below only catches the window. A `Fit` document is also
// re-fitted whenever the room beside it changes -- the scroller rail toggling is the one
// in this toolbar -- and that arrives as a ResizeObserver callback inside PageLayout with
// nothing in the DOM to bind to. Subscribing to the engine's own announcement is what
// keeps the percentage honest in every case rather than just the obvious one.
onZoomApplied(() => notifyZoomChanged())

/**
 * Set the document zoom and publish it.
 *
 * Exported so a host can zoom from its own chrome, and so a keyboard shortcut can, without
 * reaching into the toolbar for a button to press.
 */
export const setEditorZoom = (root: HTMLElement | null | undefined, z: ZoomLevel) => {
    setLayoutZoom(root, z)
    editorZoom(z)
    notifyZoomChanged()
}

/** The wording, app-wide — the same escape hatch {@link editorLayout}'s text has. */
export interface ZoomText {
    fit: string
    out: string
    in: string
    outTitle: string
    inTitle: string
    menuTitle: string
}

export const zoomText = $<ZoomText>({
    fit: 'Fit',
    out: '−',
    in: '+',
    outTitle: 'Zoom out',
    inTitle: 'Zoom in',
    menuTitle: 'Document zoom',
})

const def = () => ({
    buttonType: $('text', HtmlString) as ObservableMaybe<ButtonStyles>,
    cls: $('', HtmlClass) as JSX.Class,
    class: $('', HtmlClass) as JSX.Class,
})

const ZoomControl = defaults(def, (props) => {
    const { buttonType, cls, class: cn } = props

    const editor = useEditor()
    const isOpen = $(false)
    const dropdownRef = $<HTMLElement>(null as any)

    useDropdownDismiss(dropdownRef as any, () => isOpen(false))

    /** The surface, by the same two-step every toolbar control uses. */
    const surface = () => ($$(editor) ?? $$(getCurrentEditor())) as HTMLElement | undefined

    /** The scale on screen right now, with `Fit` resolved against the surface. */
    const current = () => {
        // Read all three so the string re-derives when the mode changes or something bumps
        // the tick; only the last is used for its value.
        $$(editorLayout); $$(zoomTick); $$(editorZoom)
        return resolvedZoom(surface() ?? null)
    }

    const label = () => $$(editorZoom) === 'fit'
        ? `${$$(zoomText).fit} ${Math.round(current() * 100)}%`
        : `${Math.round(current() * 100)}%`

    const step = (dir: 1 | -1) => () => {
        const now = current()
        // Strictly past the current scale in the direction asked for, so a `Fit` that landed
        // between two stops still moves — a `>=` would stall on the nearest one.
        const next = dir > 0
            ? STEPS.find(s => s > now + 0.001)
            : [...STEPS].reverse().find(s => s < now - 0.001)
        setEditorZoom(surface(), Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, next ?? now)))
    }

    const pickPreset = (z: ZoomLevel) => () => { setEditorZoom(surface(), z); isOpen(false) }

    // The same reason FontFamilyDropDown does it this way: the menu is shown and hidden by
    // style rather than by mounting, so nothing is rebuilt under a pointer already over it.
    const menuRef = $<HTMLElement>(null as any)
    useEffect(() => {
        const menu = $$(menuRef)
        if (menu) menu.style.display = $$(isOpen) ? '' : 'none'
    })

    // `Fit` is recomputed from the surface's width, so a window drag changes what the
    // readout should say without anything here being pressed.
    useEffect(() => {
        if (typeof window === 'undefined') return
        const onResize = () => { if ($$(editorZoom) === 'fit') notifyZoomChanged() }
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    })

    // Every button carries the toolbar's caret guard: a mousedown that reaches the document
    // collapses the selection, and the author's place is the thing a zoom must not cost.
    const hold = (e: any) => { e.preventDefault(); e.stopPropagation() }

    return <div class={() => ['relative inline-flex items-center gap-0.5', () => $$(cls) ? $$(cls) : $$(cn)]} ref={dropdownRef}>
        <Button
            type={buttonType}
            title={() => $$(zoomText).outTitle}
            onClick={step(-1)}
            onMouseDown={hold}
        >
            <span class="w-4 text-center leading-none">{() => $$(zoomText).out}</span>
        </Button>

        <Button
            type={buttonType}
            title={() => $$(zoomText).menuTitle}
            onClick={() => isOpen(!$$(isOpen))}
            onMouseDown={hold}
        >
            {/* Fixed width so the strip does not shuffle sideways every time the number
                gains or loses a digit. */}
            <span class="inline-block w-16 text-center tabular-nums text-xs">{label}</span>
        </Button>

        <Button
            type={buttonType}
            title={() => $$(zoomText).inTitle}
            onClick={step(1)}
            onMouseDown={hold}
        >
            <span class="w-4 text-center leading-none">{() => $$(zoomText).in}</span>
        </Button>

        <div
            ref={menuRef}
            class="origin-top-left absolute left-0 top-full mt-1 w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 py-1"
            onMouseDown={hold}
        >
            {PRESETS.map(z =>
                <Button
                    type="text"
                    class={() => [
                        'w-full !justify-start !px-3 !py-1 text-xs',
                        () => $$(editorZoom) === z ? '!bg-slate-200' : '',
                    ]}
                    onClick={pickPreset(z)}
                    onMouseDown={hold}
                >
                    {z === 'fit' ? () => $$(zoomText).fit : `${Math.round((z as number) * 100)}%`}
                </Button>
            )}
        </div>
    </div>
})

export { ZoomControl }

customElement('wui-zoom-control', ZoomControl)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-zoom-control': ElementAttributes<typeof ZoomControl>
        }
    }
}

export default ZoomControl

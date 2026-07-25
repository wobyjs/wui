/** @jsxImportSource woby */

import { $, $$, Observable, ObservableMaybe, createContext, useContext, useEffect, JSX } from 'woby'
import { PropertyForm } from '../PropertyForm/PropertyForm' // Import component directly (not just side-effect)
import '../PropertyForm/StringEditor' // Side-effect: registers StringEditor
import '../PropertyForm/NumberEditor' // Side-effect: registers NumberEditor
import '../PropertyForm/BooleanEditor' // Side-effect: registers BooleanEditor
import '../PropertyForm/ColorEditor' // Side-effect: registers ColorEditor
import '../PropertyForm/ObjectEditor' // Side-effect: registers ObjectEditor
import {
    detectSelectionType,
    extractImageProperties,
    extractTextProperties,
    extractCustomElementProperties,
    applyImageProperty,
    applyTextProperty,
    applyCustomElementProperty,
    SelectionType,
} from './PropertyExtractor'

/**
 * PropertyPanelContext: Shared state between InfoButton (toolbar)
 * and PropertyPanel (editor surface).
 *
 * CRITICAL: InfoButton sets propertyTarget and selectionType BEFORE
 * opening the panel. PropertyPanel reads these values instead of
 * re-detecting the selection (which would fail because focus shifts
 * to the button on click, clearing the shadow root selection).
 */
export const PropertyPanelContext = createContext<{
    panelOpen: Observable<boolean>
    propertyTarget: Observable<HTMLElement | null>
    selectionType: Observable<SelectionType>
}>()

export const usePropertyPanel = () => useContext(PropertyPanelContext)

/**
 * PropertyPanel: A right-side panel that renders <PropertyForm>
 * for the currently selected element (image, text, or custom element).
 *
 * Rendered as a sibling of <ImageResizer /> and <TablePopupMenu />
 * inside EditorSurface's <div class="relative"> container.
 *
 * CRITICAL: Uses onMouseDown with preventDefault/stopPropagation to
 * prevent focus loss when clicking inside the panel. Uses ref-based
 * onclick for close button (shadow DOM pattern).
 *
 * CRITICAL: Reads observables from PropertyPanelContext (usePropertyPanel())
 * instead of receiving them as JSX props. This ensures the same observable
 * references are shared with InfoButton, so reactivity works correctly.
 */
export const PropertyPanel = () => {
    // CRITICAL: Read from context directly, NOT from props.
    // When observables are passed through JSX props, Woby may wrap them
    // in a new observable, breaking reactivity with the source.
    const panelCtx = usePropertyPanel()
    // CRITICAL: useContext() returns an observable wrapping the context value.
    // Must unwrap with $$() to get the actual object with panelOpen, propertyTarget, selectionType.
    const ctx = $$(panelCtx)
    const panelOpen = ctx.panelOpen
    const propertyTarget = ctx.propertyTarget
    const selectionType = ctx.selectionType
    const propsObj = $<Record<string, Observable<any>> | null>(null)
    // CRITICAL: Tracks the last element we extracted properties from.
    // Used to prevent re-extraction when the same element triggers a reactive
    // cascade (e.g., Enter keyup in a TextField re-runs the first useEffect,
    // which would re-extract OLD values from the DOM and overwrite the pending
    // sync effect that was about to apply the new value).
    const lastExtractedTarget = $<HTMLElement | null>(null)
    const disposeEffects: (() => void)[] = []

    // Helper: extract properties from the current target based on selection type
    const extractFromTarget = (element: HTMLElement, type: SelectionType) => {
        switch (type) {
            case 'image':
                return extractImageProperties(element as HTMLImageElement)
            case 'text':
                return extractTextProperties(element)
            case 'custom':
                return extractCustomElementProperties(element)
            default:
                return null
        }
    }

    // When panel opens or target changes, extract properties
    // CRITICAL: Use propertyTarget/selectionType set by InfoButton,
    // NOT detectSelectionType() which fails because focus has shifted
    useEffect(() => {
        const isOpen = $$(panelOpen)
        if (!isOpen) {
            console.log('[PropertyPanel] first effect: panel closed, clearing propsObj')
            propsObj(null)
            lastExtractedTarget(null)
            return
        }

        const target = $$(propertyTarget)
        const type = $$(selectionType)

        if (!target) {
            console.log('[PropertyPanel] first effect: no target, clearing propsObj')
            propsObj(null)
            lastExtractedTarget(null)
            return
        }

        // CRITICAL: Skip re-extraction if we already extracted from this same element.
        // This prevents the race condition where the Enter keyup triggers a reactive
        // cascade that re-runs this effect, re-extracting OLD values from the DOM
        // and overwriting the pending sync effect that was about to apply the new value.
        const prev = $$(lastExtractedTarget)
        if (prev && target.isSameNode(prev)) {
            console.log('[PropertyPanel] first effect: same target, skipping re-extraction')
            return
        }
        lastExtractedTarget(target)

        const extracted = extractFromTarget(target, type)
        console.log('[PropertyPanel] extractFromTarget', type, 'keys:', Object.keys(extracted || {}), 'width:', extracted?.width ? $$(extracted.width) : 'MISSING')
        propsObj(extracted)
    })

    // Bidirectional sync: when propsObj values change, apply to DOM
    // CRITICAL: Individual effects per property — Woby's useEffect only tracks
    // top-level observable reads. Reading $(obs) inside .forEach() after the
    // outer $(propsObj) unwrap does NOT register inner observables as dependencies.
    // By creating a separate effect() for each property, each observable is
    // properly tracked and changes propagate to the DOM element automatically.
    useEffect(() => {
        const obj = $$(propsObj)
        const target = $$(propertyTarget)
        if (!obj || !target) {
            // Dispose any lingering inner effects when propsObj/target is cleared
            disposeEffects.forEach(fn => fn())
            disposeEffects.length = 0
            return
        }

        const type = $$(selectionType)

        // Dispose previous inner effects — propsObj or target changed, so old
        // subscriptions are stale.
        disposeEffects.forEach(fn => fn())
        disposeEffects.length = 0

        // Create one effect per property observable. Each effect auto-tracks
        // its own observable via $(obs) and applies changes to the DOM element.
        Object.entries(obj).forEach(([key, obs]) => {
            const dispose = useEffect(() => {
                try {
                    const val = $$(obs)
                    if (val === undefined || val === null) return

                    switch (type) {
                        case 'image':
                            applyImageProperty(target as HTMLImageElement, key, val)
                            break
                        case 'text':
                            applyTextProperty(target, key, val)
                            break
                        case 'custom':
                            applyCustomElementProperty(target, key, val)
                            break
                    }
                } catch (e) {
                    console.error(`[PropertyPanel] per-property effect error for ${key}:`, e)
                }
            })
            disposeEffects.push(dispose)
        })
    })

    // Track whether focus is inside the property panel.
    // CRITICAL: This is more reliable than checking shadow.activeElement in the
    // selectionchange handler, because shadow.activeElement is null after Enter keyup
    // (the browser clears activeElement when the Enter key event is processed).
    // focusin/focusout events fire before selectionchange, so the flag is always
    // set correctly when the handler runs.
    const panelFocused = $(false)

    // Listen for focus entering/leaving the panel
    // CRITICAL: Use focusin/focusout (bubble) instead of focus/blur (don't bubble).
    // In shadow DOM, focusin/focusout compose correctly across shadow boundaries.
    useEffect(() => {
        if (!$$(panelOpen)) return

        // Support both shadow DOM and light DOM modes
        const host = document.querySelector('wui-editor') as HTMLElement | null
        const shadow = host?.shadowRoot
        const root = shadow ?? document
        const panel = root.querySelector('[data-property-panel]')
        if (!panel) {
            console.log('[PropertyPanel] focus tracking: panel element not found')
            return
        }

        const handleFocusIn = (e: FocusEvent) => {
            const path = e.composedPath()
            if (path.includes(panel)) {
                console.log('[PropertyPanel] focusin detected INSIDE panel, setting panelFocused=true')
                panelFocused(true)
            } else {
                console.log('[PropertyPanel] focusin detected OUTSIDE panel, path:', path.map(p => p.tagName || p.nodeName).join(' > '))
            }
        }

        const handleFocusOut = (e: FocusEvent) => {
            const path = e.composedPath()
            if (!path.includes(panel)) {
                console.log('[PropertyPanel] focusout detected, focus LEFT panel, setting panelFocused=false')
                panelFocused(false)
            } else {
                // focus moved within the panel — keep panelFocused=true
            }
        }

        panel.addEventListener('focusin', handleFocusIn)
        panel.addEventListener('focusout', handleFocusOut)
        return () => {
            panel.removeEventListener('focusin', handleFocusIn)
            panel.removeEventListener('focusout', handleFocusOut)
        }
    })

    // Listen for selection changes — auto-open and update panel when element is selected.
    // Guard: only update when detectSelectionType() returns a real element.
    // When focus leaves the editor (e.g., clicking toolbar/panel), detectSelectionType()
    // returns 'none' — we must NOT clear the target in that case, because the user
    // didn't intentionally deselect; they just shifted focus temporarily.
    useEffect(() => {
        // CRITICAL: Track the last pointerdown target to detect image clicks.
        // pointerdown fires BEFORE selectionchange, so we can catch image clicks
        // before the browser clears the text selection and before ImageResizer's
        // mousedown handler has a chance to show the overlay.
        // This fixes the text→image transition bug where clicking an image after
        // selecting text fails to update the property panel.
        let lastPointerTarget: HTMLElement | null = null
        let imageCheckTimer: ReturnType<typeof setTimeout> | null = null

        const handlePointerDown = (e: PointerEvent) => {
            lastPointerTarget = e.composedPath()[0] as HTMLElement

            // CRITICAL: Schedule a deferred check for image selection.
            // In shadow DOM mode, ImageResizer's mousedown handler calls
            // preventDefault() + stopPropagation() on the mousedown event, which
            // prevents the browser from clearing the text selection and firing
            // selectionchange. This means the selectionchange handler below never
            // runs when clicking an image after selecting text.
            //
            // The setTimeout(0) fires AFTER the mousedown event has been fully
            // processed (including ImageResizer's handler), so we can detect the
            // image selection even when selectionchange doesn't fire.
            if (imageCheckTimer) clearTimeout(imageCheckTimer)
            imageCheckTimer = setTimeout(() => {
                imageCheckTimer = null
                const target = lastPointerTarget
                if (!target) return
                const img = target.closest('img') as HTMLImageElement | null
                if (!img) return
                // Verify the image is inside the editor (support both shadow and light DOM)
                const editorHost = document.querySelector('wui-editor') as HTMLElement | null
                const shadow = editorHost?.shadowRoot
                const editorRoot = shadow?.querySelector('[data-editor-root]') ?? document.querySelector('[data-editor-root]')
                if (!editorRoot?.contains(img)) return

                const currentTarget = $$(propertyTarget)
                if (currentTarget && img.isSameNode(currentTarget)) return

                console.log('[PropertyPanel] pointerdown timeout: image detected, updating panel target')
                selectionType('image')
                propertyTarget(img)
                propsObj(extractImageProperties(img))
                lastExtractedTarget(img)
                // NOTE: Panel is NOT auto-opened here — the user must click the InfoButton
                // to open the panel. This prevents the panel from popping up unexpectedly
                // when clicking an image.
            }, 0)
        }
        document.addEventListener('pointerdown', handlePointerDown, true)

        const handler = () => {
            // CRITICAL: Skip re-extraction if focus is inside the property panel.
            // When the user types in an input field inside the panel and presses Enter, the
            // focus change triggers a selectionchange event. detectSelectionType() finds the
            // same image via the overlay check but returns a FRESH element reference, and
            // even with isSameNode(), the re-extraction reads the OLD values from the DOM
            // (because the per-property sync effect hasn't run yet), creating new observables
            // with old values and disposing the pending sync effects that were about to apply
            // the new value from the user's edit.
            // CRITICAL: Use panelFocused flag instead of shadow.activeElement because
            // shadow.activeElement is null after Enter keyup (the browser clears it).
            const pf = $$(panelFocused)
            // CRITICAL: Query shadow root here instead of referencing outer-scope `shadow`
            // which is not defined in this effect. In light DOM mode, use document.activeElement.
            const host = document.querySelector('wui-editor') as HTMLElement | null
            const activeEl = host?.shadowRoot?.activeElement ?? document.activeElement
            console.log('[PropertyPanel] selectionchange handler, panelFocused:', pf, 'activeElement:', activeEl?.tagName || 'null')
            if (pf) return

            let { type, element } = detectSelectionType()

            // ── Image fallback via pointerdown target ──
            // CRITICAL: When clicking an image after selecting text, the browser fires
            // selectionchange BEFORE ImageResizer's mousedown handler has a chance to
            // show the overlay and set __activeImage. This means detectSelectionType()
            // returns 'text' (collapsed cursor in the old text selection) instead of
            // 'image'. We use the pointerdown target (which fired before selectionchange)
            // to detect the actual image click.
            if (type !== 'image' && lastPointerTarget) {
                const img = lastPointerTarget.closest('img') as HTMLImageElement | null
                if (img) {
                    // Verify the image is inside the editor (support both shadow and light DOM)
                    const editorHost = document.querySelector('wui-editor') as HTMLElement | null
                    const shadow = editorHost?.shadowRoot
                    const editorRoot = shadow?.querySelector('[data-editor-root]') ?? document.querySelector('[data-editor-root]')
                    if (editorRoot?.contains(img)) {
                        console.log('[PropertyPanel] selectionchange: image detected via pointerdown fallback')
                        type = 'image'
                        element = img
                    }
                }
            }

            const currentTarget = $$(propertyTarget)
            // Only update if a new element is selected (not null/none)
            // CRITICAL: Use isSameNode() instead of !== because detectSelectionType()
            // returns a FRESH element reference each time via elementsFromPoint(),
            // so !== would always be true even for the same image element.
            // isSameNode() checks node identity regardless of reference equality.
            if (element && (!currentTarget || !element.isSameNode(currentTarget))) {
                // CRITICAL: Don't auto-open for the editor root element itself
                // (happens when clicking on empty space in the editor in light DOM mode)
                const isEditorRoot = element.hasAttribute?.('data-editor-root')
                if (isEditorRoot) return

                console.log('[PropertyPanel] selectionchange: new element detected, updating panel target for', type)
                selectionType(type)
                propertyTarget(element)
                propsObj(extractFromTarget(element, type))
                lastExtractedTarget(element)
                // NOTE: Panel is NOT auto-opened here — the user must click the InfoButton
                // to open the panel. This prevents the panel from popping up unexpectedly
                // when selecting/clicking text in the editor.
            }
        }

        document.addEventListener('selectionchange', handler)
        return () => {
            document.removeEventListener('selectionchange', handler)
            document.removeEventListener('pointerdown', handlePointerDown, true)
            if (imageCheckTimer) clearTimeout(imageCheckTimer)
        }
    })

    // Check if target element was removed from DOM — close panel if so.
    // CRITICAL: Must use the editor's shadow root for contains() check,
    // because document.contains() does NOT traverse shadow boundaries.
    useEffect(() => {
        if (!$$(panelOpen)) return

        const check = () => {
            const target = $$(propertyTarget)
            if (target) {
                // Check if element is still connected to any root (shadow or document)
                // isConnected works across shadow DOM boundaries
                if (!target.isConnected) {
                    panelOpen(false)
                    propertyTarget(null)
                    propsObj(null)
                }
            }
        }

        const interval = setInterval(check, 500)
        return () => clearInterval(interval)
    })

    return (
        <div
            data-property-panel
            class={() => [
                "absolute right-0 top-0 w-[300px] h-full overflow-auto z-50",
                "bg-white border-l border-gray-200 shadow-[-2px_0_8px_rgba(0,0,0,0.1)]",
                $$(panelOpen) ? '' : 'hidden'
            ]}
            onMouseDown={(e) => {
                // CRITICAL: preventDefault here blocks focus + caret placement in <input>
                // fields (and <button> activation). Only intercept mousedown on the panel
                // background itself — never on interactive elements inside the panel.
                // CRITICAL: Must use composedPath()[0] — in shadow DOM, e.target is
                // retargeted to the shadow host (panel div), so target.closest('input')
                // would never find the input. composedPath()[0] gives the actual element.
                const target = e.composedPath()[0] as HTMLElement
                const isInteractive = target.closest('input, textarea, button, select, [contenteditable="true"]')
                if (isInteractive) return
                e.preventDefault()
                e.stopPropagation()
            }}
        >
            {/* Header */}
            <div class="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h3 class="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    {() => {
                        const t = $$(selectionType)
                        return t === 'image' ? 'Image Properties'
                            : t === 'text' ? 'Text Properties'
                            : t === 'custom' ? 'Element Properties'
                            : 'No Selection'
                    }}
                </h3>
                <button
                    ref={(el) => { if (el) el.onclick = () => { panelOpen(false) } }}
                    class="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer w-6 h-6 flex items-center justify-center"
                >×</button>
            </div>

            {/* Property Form — use JSX component directly (not custom element) for proper observable prop passing */}
            {() => {
                const obj = $$(propsObj)
                return obj ? (
                    <PropertyForm obj={obj} class="m-0" />
                ) : (
                    <div class="p-4 text-sm text-gray-400">Select an element to view properties</div>
                )
            }}
        </div>
    )
}

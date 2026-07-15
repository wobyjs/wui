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
            propsObj(null)
            return
        }

        const target = $$(propertyTarget)
        const type = $$(selectionType)

        if (!target) {
            propsObj(null)
            return
        }

        propsObj(extractFromTarget(target, type))
    })

    // Bidirectional sync: when propsObj values change, apply to DOM
    useEffect(() => {
        const obj = $$(propsObj)
        const target = $$(propertyTarget)
        if (!obj || !target) return

        const type = $$(selectionType)

        // Set up watchers for each property
        Object.entries(obj).forEach(([key, obs]) => {
            useEffect(() => {
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
            })
        })
    })

    // Listen for selection changes while panel is open — re-extract if target changed.
    // Guard: only update when detectSelectionType() returns a real element.
    // When focus leaves the editor (e.g., clicking toolbar/panel), detectSelectionType()
    // returns 'none' — we must NOT clear the target in that case, because the user
    // didn't intentionally deselect; they just shifted focus temporarily.
    useEffect(() => {
        if (!$$(panelOpen)) return

        const handler = () => {
            const { type, element } = detectSelectionType()
            const currentTarget = $$(propertyTarget)
            // Only update if a new element is selected (not null/none)
            if (element && element !== currentTarget) {
                selectionType(type)
                propertyTarget(element)
                propsObj(extractFromTarget(element, type))
            }
        }

        document.addEventListener('selectionchange', handler)
        return () => document.removeEventListener('selectionchange', handler)
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
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
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

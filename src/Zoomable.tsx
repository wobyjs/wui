import { useEventListener } from "@woby/use"
import { createContext, customElement, defaults, ElementAttributes, HtmlClass, HtmlNumber, HtmlString, Observable, useContext, useEffect, useMemo, type ObservableMaybe } from "woby"
import { $, $$ } from "woby"


const wrapperStyles = "absolute top-0 left-0 w-full h-full origin-top-left will-change-transform"

const zoomableStyles = {
    default: "relative overflow-hidden touch-none border border-gray-300 rounded-lg"
}


const imgStyles = {
    default: "absolute w-full h-full object-contain origin-top-left cursor-grab select-none pointer-events-none rounded-lg"
}

const def = () => ({
    class: $('', HtmlClass) as JSX.Class | undefined,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    children: $(null),
    minScale: $(1, HtmlNumber) as ObservableMaybe<number>,
    maxScale: $(5, HtmlNumber) as ObservableMaybe<number>,
    type: $("default", HtmlString) as ObservableMaybe<string>,
    height: $(400, HtmlNumber) as ObservableMaybe<number>,
    width: $(400, HtmlNumber) as ObservableMaybe<number>,

    scale: $(1, HtmlNumber) as Observable<number>,
    x: $(0, HtmlNumber) as Observable<number>,
    y: $(0, HtmlNumber) as Observable<number>,
})

const defImg = () => ({
    class: $('', HtmlClass) as JSX.Class | undefined,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    children: $(null),
    type: $("default", HtmlString) as ObservableMaybe<string>,
    alt: $("Image", HtmlString) as ObservableMaybe<string>,
    src: $("", HtmlString) as ObservableMaybe<string>,
})

const ZoomableContext = createContext<{ style: JSX.Style, ref: Observable<HTMLImageElement>, translateX: Observable<number>, translateY: Observable<number>, scale: Observable<number> }>()
export const useZoomable = () => useContext(ZoomableContext)


const Zoomable = defaults(def, (props) => {

    const { class: cn, cls, children, minScale, maxScale, type, height, width, scale, x: translateX, y: translateY, ...otherProps } = props

    const containerRef = $<HTMLDivElement>(null)
    const wrapperRef = $<HTMLDivElement>(null) // NEW: Ref for the inner wrapper


    const getSize = (v: number | string) => typeof v === 'number' ? `${v}px` : v

    // State variables
    // const scale = $(1)
    // const translateX = $(0)
    // const translateY = $(0)

    const isDown = $(false)
    const startX = $(0)
    const startY = $(0)
    const lastX = $(0)
    const lastY = $(0)
    const pointers = $([] as PointerEvent[])

    // NEW: Track the pointer type (mouse, touch, or pen)
    const pointerType = $<string>('')

    // Utility functions
    const clamp = (value: number) => Math.max($$(minScale), Math.min($$(maxScale), value))

    const calculateDistance = (p1: PointerEvent, p2: PointerEvent) => Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY)

    // Define the function that receives a PointerEvent (mouse, touch, or pen)
    // #region Event Handlers
    const handlePointerDown = (e: PointerEvent) => {

        // Stop the browser's default behavior.
        // This prevents text selection, native scrolling, or zooming while trying to drag.
        e.preventDefault()

        // NEW: Capture the type of pointer
        pointerType(e.pointerType) // returns 'mouse', 'touch', or 'pen'

        // Create a new array of active pointers. 
        // It takes the existing pointers ($$(pointers)), spreads them into a new array, 
        // and adds the new event 'e' to the end. This is used to track multi-touch.
        const updatedPointers = [...$$(pointers), e]

        // Set a state flag indicating the user is currently pressing down/interacting.
        isDown(true)

        // Record the initial X and Y screen coordinates where the click/touch happened.
        // Used as the "anchor" point to calculate total distance moved later.
        startX(e.clientX)
        startY(e.clientY)

        // Record the current X and Y coordinates as the "last known" position.
        // Used to calculate frame-by-frame movement (deltas).
        lastX(e.clientX)
        lastY(e.clientY)

        // Update the state with the new list of active pointers created above.
        pointers(updatedPointers)
    }

    const handlePointerUp = (e: PointerEvent) => {
        // Create a new list of pointers by keeping all existing ones 
        // EXCEPT the specific one that just ended (matched by unique pointerId).
        const remainingPointers = $$(pointers).filter(p => p.pointerId !== e.pointerId)

        // Check if there are any fingers/buttons still holding down.
        // If the array is empty, isDown becomes false (interaction over).
        // If items remain (e.g., 1 finger left of 2), isDown stays true.
        isDown(remainingPointers.length > 0)

        // Reset the "anchor" starting points to 0. 
        // This usually signifies that the specific gesture (like a specific drag) has ended/reset.
        startX(0)
        startY(0)

        // Update the "last known position".
        // If pointers remain: Transfer tracking to the first remaining finger (to prevent jumping).
        // If no pointers remain: Reset coordinate to 0.
        lastX(remainingPointers.length > 0 ? remainingPointers[0].clientX : 0)
        lastY(remainingPointers.length > 0 ? remainingPointers[0].clientY : 0)

        // Save the filtered list back to the state.
        pointers(remainingPointers)
    }

    const handleWheel = (e: WheelEvent) => {
        // Stop the actual webpage from scrolling up/down when you scroll inside this area.
        e.preventDefault()

        // Set type to mouse on wheel (usually implies mouse)
        pointerType('mouse')

        // Get the size and position of the container element relative to the viewport.
        const rect = $$(containerRef)?.getBoundingClientRect()

        // Safety check: stop if the container element isn't found.
        if (!rect) return

        // Calculate mouse coordinates relative to the TOP-LEFT of the container.
        // e.clientX is the global mouse X; rect.left is the container's distance from the edge.
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        // Determine direction:
        // If deltaY < 0 (scrolling up), grow by 10% (1.1).
        // If deltaY > 0 (scrolling down), shrink to 90% (0.9).
        const delta = e.deltaY < 0 ? 1.1 : 0.9

        // Calculate the new zoom level, keeping it within min/max limits (clamp).
        const newScale = clamp($$(scale) * delta)

        // Calculate how much the size changed relative to the previous frame.
        // e.g., if going from 1.0 to 1.1, the ratio is 1.1.
        const scaleRatio = newScale / $$(scale)

        // Update the state with the new zoom level.
        scale(newScale)

        // ADJUST POSITION (The complex part):
        // To zoom "towards the mouse", we must shift the image (translate) 
        // to compensate for the change in size.
        //
        // Formula logic: "Keep the point under the mouse stationary."
        // 1. (mouseX - translateX) gets the distance from the image's origin to the mouse.
        // 2. We multiply that distance by the scaleRatio to find where that point WILL be after zoom.
        // 3. We subtract that result from the mouseX to find the new origin point.
        translateX(mouseX - (mouseX - $$(translateX)) * scaleRatio)
        translateY(mouseY - (mouseY - $$(translateY)) * scaleRatio)
    }

    const handlePointerMove = (e: PointerEvent) => {
        // CASE 1: MULTI-TOUCH (Pinch-to-Zoom)
        // Checks if there are 2+ fingers active on the screen.
        if ($$(pointers).length > 1) {
            // Get container position to calculate offsets correctly.
            const rect = $$(containerRef)?.getBoundingClientRect()
            if (!rect) return

            // Update the specific pointer that just moved within our list of pointers.
            // We keep the other finger's data the same, but update the moving finger's data with 'e'.
            const currentPointers = $$(pointers).map((p) =>
                p.pointerId === e.pointerId ? e : p
            )

            // Calculate distance between fingers NOW vs PREVIOUS frame.
            // If distance increases, user is spreading fingers (zoom in).
            // If distance decreases, user is pinching (zoom out).
            const currentDistance = calculateDistance(currentPointers[0], currentPointers[1])
            const initialDistance = calculateDistance($$(pointers)[0], $$(pointers)[1])

            // Find the midpoint (X, Y) exactly between the two fingers.
            // This becomes the "Pivot Point" we want to zoom into.
            const centerX = (currentPointers[0].clientX + currentPointers[1].clientX) / 2 - rect.left
            const centerY = (currentPointers[0].clientY + currentPointers[1].clientY) / 2 - rect.top

            // Calculate the new scale based on the ratio of change in finger distance.
            const newScale = clamp($$(scale) * (currentDistance / initialDistance))

            // ADJUST POSITION:
            // Move the image so that the "Center Point" between the fingers stays 
            // in the same spot visually while the image scales up/down.
            translateX(centerX - (centerX - $$(translateX)) * (newScale / $$(scale)))
            translateY(centerY - (centerY - $$(translateY)) * (newScale / $$(scale)))

            // Commit the new scale.
            scale(newScale)

            // Update the pointers state so the next frame compares against these new positions.
            pointers(currentPointers)

            // CASE 2: SINGLE TOUCH / MOUSE DRAG (Panning)
        } else if ($$(isDown) && $$(pointers).length === 1) {

            // Calculate how far the mouse/finger moved since the last frame (Delta).
            // e.g., Current 500px - Last 490px = moved 10px.
            const deltaX = e.clientX - $$(lastX)
            const deltaY = e.clientY - $$(lastY)

            // Add that movement to the current image position (Pan).
            translateX($$(translateX) + deltaX)
            translateY($$(translateY) + deltaY)

            // Update the "Last" position to be the current one, 
            // preparing for the next movement frame.
            lastX(e.clientX)
            lastY(e.clientY)
        }
    }
    // #endregion

    // This is a Closure / IIFE. 
    // It runs immediately once to define 'previousRect', and returns the inner function.
    // This allows 'previousRect' to persist between function calls without being a global variable.
    const adjustTransformOnResize = (() => {
        // Private variable: Remembers the container size from the LAST time this function ran.
        let previousRect: DOMRect | null = null

        // This is the actual function that gets called on resize events.
        return () => {
            const container = $$(containerRef)
            if (!container) return

            // Measure the CURRENT size of the container.
            // Setup Check: If this is the very first time running, just save the size and exit.
            // We can't calculate a difference yet.
            const currentRect = container.getBoundingClientRect()
            if (!previousRect) {
                previousRect = currentRect
                return
            }

            // Calculate the scale ratios to adjust the translation correctly
            // e.g., If width went from 500px to 1000px, the ratio is 2.
            // e.g., If width went from 1000px to 500px, the ratio is 0.5.
            const scaleRatioX = currentRect.width / previousRect.width
            const scaleRatioY = currentRect.height / previousRect.height

            // Update translations to keep the center at the same position
            // Why? If the container doubles in size, we must double the X/Y coordinates 
            // to keep the image visually centered in the same relative spot.
            translateX($$(translateX) * scaleRatioX)
            translateY($$(translateY) * scaleRatioY)

            // const w = +window.getComputedStyle($$(ref)).width.replace('px', '')
            // if ($$($$(translateX) * scaleRatioX) > w)
            // console.log($$(translateX) * scaleRatioX, scaleRatioX, currentRect.width, w)

            // Save the current size, so it acts as the "Previous Size" for the NEXT resize event.
            previousRect = currentRect
        }
    })()


    const transformStyle = useMemo(() => {
        return `translate(${$$(translateX)}px, ${$$(translateY)}px) scale(${$$(scale)})`
    })

    useEventListener(window, 'resize', adjustTransformOnResize)

    return (
        <div ref={containerRef}
            class={[
                () => zoomableStyles[$$(type)],
                () => $$(isDown) ? "is-dragging cursor-grabbing" : "cursor-grab",
                () => $$(pointerType) ? `pointer-${$$(pointerType)}` : "",
                () => $$(cn) ? $$(cn) : "",
                cls
            ]}
            style={{
                width: () => getSize($$(width)),
                height: () => getSize($$(height))
            }}
            {...otherProps}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
        >
            <div
                ref={wrapperRef}
                class={wrapperStyles}
                style={{
                    transform: () => `translate(${$$(translateX)}px, ${$$(translateY)}px) scale(${$$(scale)})`
                }}
            >
                {children}
            </div>
        </div >
    )
}) as typeof Zoomable

const Img = defaults(defImg, (props) => {
    // We just render the image. 
    // The Parent (Zoomable) handles the 'transform' via the wrapper div.
    const { class: cn, cls, type, alt, src, ...otherProps } = props

    return (
        <>
            <img
                class={[() => imgStyles[$$(type)], () => $$(cn) ? $$(cn) : "", cls]}
                alt={alt}
                src={src}
                {...otherProps as any}
            />
        </>
    )
}) as typeof Img

// const Img = defaults(defImg, (props) => {
//     // We rename 'ref' to 'externalRef' to avoid confusion.
//     const { cls, ref: externalRef, type, alt, ...otherProps } = props as any

//     // Get the internal ref from the parent ZoomableContext
//     const { style, ref: internalRef } = useZoomable()

//     // Sync styles
//     useEffect(() => {
//         if (!$$(internalRef)) return
//         $$(internalRef)!.style.transform = $$((style as any as CSSStyleDeclaration).transform)
//     })

//     // We create a function that sets the internal ref (for logic) and the external ref (passed by user).
//     const handleRef = (el: HTMLImageElement) => {
//         // 1. Set the internal signal for Zoomable logic
//         internalRef(el)

//         // 2. Set the external ref if it exists
//         if (externalRef) {
//             if (typeof externalRef === 'function') {
//                 externalRef(el)
//             } else {
//                 // Assuming externalRef is a signal/observable
//                 externalRef(el)
//             }
//         }
//     }

//     return (
//         <img
//             // Use the merged ref handler
//             ref={handleRef}
//             // Combine styles
//             class={[() => imgStyles[$$(type)], cls]}
//             alt={alt}
//             // Spread other standard props (src, alt, etc)
//             {...otherProps}
//         />
//     )
// }) as typeof Img


export { Zoomable, Img }

customElement("wui-zoomable", Zoomable)
customElement("wui-zoomable-img", Img)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-zoomable': ElementAttributes<typeof Zoomable>
            'wui-zoomable-img': ElementAttributes<typeof Img>
        }
    }
}


export default Zoomable

import { useEventListener } from "use-woby"
import { createContext, Observable, setStyle, useContext, useEffect, useMemo, type ObservableMaybe } from "woby"
import { $, $$ } from "woby"

const ZoomableContext = createContext<{ style: JSX.Style, ref: Observable<HTMLImageElement>, translateX: Observable<number>, translateY: Observable<number>, scale: Observable<number> }>()
export const useZoomable = () => useContext(ZoomableContext)

export const Zoomable = ({ minScale = 1, maxScale = 5, class: cls = 'relative w-full h-[400px] overflow-hidden touch-none', children, ...props }: JSX.HTMLAttributes<HTMLDivElement> & { minScale?: ObservableMaybe<number>, maxScale?: ObservableMaybe<number> }) => {
    const containerRef = $<HTMLDivElement>(null)
    const ref = $<HTMLImageElement>(null)

    // State variables
    const scale = $(1)
    const translateX = $(0)
    const translateY = $(0)

    const isDown = $(false)
    const startX = $(0)
    const startY = $(0)
    const lastX = $(0)
    const lastY = $(0)
    const pointers = $([] as PointerEvent[])

    // Utility functions
    const clamp = (value: number) => Math.max($$(minScale), Math.min($$(maxScale), value))

    const calculateDistance = (p1: PointerEvent, p2: PointerEvent) => Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY)

    const handlePointerDown = (e: PointerEvent) => {
        e.preventDefault()

        // Add current pointer to the list
        const updatedPointers = [...$$(pointers), e]
        isDown(true)
        startX(e.clientX)
        startY(e.clientY)
        lastX(e.clientX)
        lastY(e.clientY)
        pointers(updatedPointers)
    }

    const handlePointerUp = (e: PointerEvent) => {
        // Remove the pointer that was lifted
        const remainingPointers = $$(pointers).filter(p => p.pointerId !== e.pointerId)

        isDown(remainingPointers.length > 0)
        startX(0)
        startY(0)
        lastX(remainingPointers.length > 0 ? remainingPointers[0].clientX : 0)
        lastY(remainingPointers.length > 0 ? remainingPointers[0].clientY : 0)
        pointers(remainingPointers)
    }

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault()

        // Get mouse position relative to container
        const rect = $$(containerRef)?.getBoundingClientRect()
        if (!rect) return

        const mouseX = e.clientX - rect.left // Adjust for container's position
        const mouseY = e.clientY - rect.top

        // Calculate zoom
        const delta = e.deltaY < 0 ? 1.1 : 0.9
        const newScale = clamp($$(scale) * delta)

        // Calculate new translation to zoom around mouse point
        const scaleRatio = newScale / $$(scale)

        scale(newScale)
        translateX(mouseX - (mouseX - $$(translateX)) * scaleRatio)
        translateY(mouseY - (mouseY - $$(translateY)) * scaleRatio)
    }

    const handlePointerMove = (e: PointerEvent) => {
        // Multi-touch zoom
        if ($$(pointers).length > 1) {
            const rect = $$(containerRef)?.getBoundingClientRect()
            if (!rect) return

            const currentPointers = $$(pointers).map((p) =>
                p.pointerId === e.pointerId ? e : p
            )

            // Calculate current distance between pointers
            const currentDistance = calculateDistance(currentPointers[0], currentPointers[1])
            const initialDistance = calculateDistance($$(pointers)[0], $$(pointers)[1])

            // Calculate center point
            const centerX = (currentPointers[0].clientX + currentPointers[1].clientX) / 2 - rect.left
            const centerY = (currentPointers[0].clientY + currentPointers[1].clientY) / 2 - rect.top

            // New scale calculation
            const newScale = clamp($$(scale) * (currentDistance / initialDistance))

            // Update transform
            translateX(centerX - (centerX - $$(translateX)) * (newScale / $$(scale)))
            translateY(centerY - (centerY - $$(translateY)) * (newScale / $$(scale)))
            scale(newScale)

            // Update pointers
            pointers(currentPointers)
        } else if ($$(isDown) && $$(pointers).length === 1) {
            const deltaX = e.clientX - $$(lastX)
            const deltaY = e.clientY - $$(lastY)

            translateX($$(translateX) + deltaX)
            translateY($$(translateY) + deltaY)

            lastX(e.clientX)
            lastY(e.clientY)
        }
    }

    const adjustTransformOnResize = (() => {
        let previousRect: DOMRect | null = null;

        return () => {
            const container = $$(containerRef);
            if (!container) return;

            const currentRect = container.getBoundingClientRect();
            if (!previousRect) {
                previousRect = currentRect;
                return;
            }

            // Calculate the scale ratios to adjust the translation correctly
            const scaleRatioX = currentRect.width / previousRect.width;
            const scaleRatioY = currentRect.height / previousRect.height;

            // Update translations to keep the center at the same position
            translateX($$(translateX) * scaleRatioX);
            translateY($$(translateY) * scaleRatioY);

            // const w = +window.getComputedStyle($$(ref)).width.replace('px', '')
            // if ($$($$(translateX) * scaleRatioX) > w)
            // console.log($$(translateX) * scaleRatioX, scaleRatioX, currentRect.width, w)

            previousRect = currentRect;
        };
    })();

    useEventListener(window, 'resize', adjustTransformOnResize)

    return <div ref={containerRef} class={cls}
        {...props}

        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
    >
        <ZoomableContext.Provider value={{ style: { transform: useMemo(() => `translate(${$$(translateX)}px, ${$$(translateY)}px) scale(${$$(scale)})`) }, ref, translateX, translateY, scale }} >
            {children}
        </ZoomableContext.Provider>
    </div>
}

export const Img = ({ style: s, ref: r, class: cls = 'absolute w-full h-full object-contain origin-top-left cursor-grab select-none pointer-events-none', ...props }: JSX.HTMLAttributes<HTMLImageElement>) => {
    const { style, ref } = useZoomable()
    // const ref = $<HTMLImageElement>()

    useEffect(() => {
        if (!$$(ref)) return

        $$(ref).style.transform = $$((style as any as CSSStyleDeclaration).transform)
    })
    return <img ref={[ref, r]} class={cls} {...props as any} />
}
import { Zoomable, Img } from "../src/Zoomable"
import { $, $$ } from "woby"

const BasicZoomable = () => {
    return (
        <Zoomable>
            <Img src="https://picsum.photos/200/300" />
        </Zoomable>
    )
}

const ZoomableWithCustomScale = () => {
    return (
        <Zoomable minScale={0.5} maxScale={10}>
            <Img src="https://picsum.photos/300/200" />
        </Zoomable>
    )
}

const ZoomableWithCustomSize = () => {
    return (
        <Zoomable width={500} height={400}>
            <Img src="https://picsum.photos/400/300" />
        </Zoomable>
    )
}


const StyledZoomable = () => {
    return (
        <Zoomable cls="border-2 border-blue-500 rounded-xl shadow-lg">
            <Img
                src="https://picsum.photos/250/250"
                cls="rounded-lg"
            />
        </Zoomable>
    )
}

const ControlledZoomable = () => {
    // This signal now controls the component AND reads from it
    const scale = $(1)

    return (
        <div>
            <div class="mb-4">
                <p>Current scale: {scale}</p> {/* This will update even if you use Mouse Wheel! */}

                <button
                    class="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                    // This updates the signal -> which updates the Zoomable component
                    onClick={() => scale(Math.min(5, $$(scale) + 0.5))}
                >
                    Zoom In
                </button>

                <button
                    class="bg-green-500 text-white px-3 py-1 rounded"
                    onClick={() => scale(Math.max(1, $$(scale) - 0.5))}
                >
                    Zoom Out
                </button>
            </div>

            {/* PASS THE PROP HERE */}
            <Zoomable scale={scale}>
                <Img src="https://picsum.photos/300/300" />
            </Zoomable>
        </div>
    )
}
export {
    BasicZoomable,
    ZoomableWithCustomScale,
    ZoomableWithCustomSize,
    StyledZoomable,
    ControlledZoomable
}
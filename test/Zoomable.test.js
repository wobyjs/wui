import { jsx as _jsx, jsxs as _jsxs } from "woby/jsx-runtime";
import { Zoomable, Img } from "../src/Zoomable";
import { $, $$ } from "woby";
const BasicZoomable = () => {
    return (_jsx(Zoomable, { children: _jsx(Img, { src: "https://picsum.photos/200/300" }) }));
};
const ZoomableWithCustomScale = () => {
    return (_jsx(Zoomable, { minScale: 0.5, maxScale: 10, children: _jsx(Img, { src: "https://picsum.photos/300/200" }) }));
};
const ZoomableWithCustomSize = () => {
    return (_jsx(Zoomable, { width: 500, height: 400, children: _jsx(Img, { src: "https://picsum.photos/400/300" }) }));
};
const StyledZoomable = () => {
    return (_jsx(Zoomable, { cls: "border-2 border-blue-500 rounded-xl shadow-lg", children: _jsx(Img, { src: "https://picsum.photos/250/250", cls: "rounded-lg" }) }));
};
const ControlledZoomable = () => {
    // This signal now controls the component AND reads from it
    const scale = $(1);
    return (_jsxs("div", { children: [_jsxs("div", { class: "mb-4", children: [_jsxs("p", { children: ["Current scale: ", scale] }), " ", _jsx("button", { class: "bg-blue-500 text-white px-3 py-1 rounded mr-2", 
                        // This updates the signal -> which updates the Zoomable component
                        onClick: () => scale(Math.min(5, $$(scale) + 0.5)), children: "Zoom In" }), _jsx("button", { class: "bg-green-500 text-white px-3 py-1 rounded", onClick: () => scale(Math.max(1, $$(scale) - 0.5)), children: "Zoom Out" })] }), _jsx(Zoomable, { scale: scale, children: _jsx(Img, { src: "https://picsum.photos/300/300" }) })] }));
};
export { BasicZoomable, ZoomableWithCustomScale, ZoomableWithCustomSize, StyledZoomable, ControlledZoomable };

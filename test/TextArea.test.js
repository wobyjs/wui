import { jsx as _jsx, jsxs as _jsxs } from "woby/jsx-runtime";
import { $ } from "woby";
import { TextArea } from "../src/TextArea";
const BorderEffectTextArea = () => {
    const resize = $("none");
    return (_jsxs("div", { class: "space-y-2", children: [_jsx("h3", { class: "font-bold text-gray-500 uppercase", children: "Border Effect" }), _jsxs("div", { class: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-6", children: [_jsx(TextArea, { resize: resize, effect: "effect1", placeholder: "Effect 1 TextArea..." }), _jsx(TextArea, { resize: resize, effect: "effect2", placeholder: "Effect 2 TextArea..." }), _jsx(TextArea, { resize: resize, effect: "effect3", placeholder: "Effect 3 TextArea..." }), _jsx(TextArea, { resize: resize, effect: "effect4", placeholder: "Effect 4 TextArea..." }), _jsx(TextArea, { resize: resize, effect: "effect5", placeholder: "Effect 5 TextArea..." }), _jsx(TextArea, { resize: resize, effect: "effect6", placeholder: "Effect 6 TextArea..." }), _jsx(TextArea, { resize: resize, effect: "effect7", placeholder: "Effect 7 TextArea..." }), _jsx(TextArea, { resize: resize, effect: "effect8", placeholder: "Effect 8 TextArea..." }), _jsx(TextArea, { resize: resize, effect: "effect9", placeholder: "Effect 9 TextArea..." })] })] }));
};
const FillEffects = () => {
    const resize = $("none");
    return (_jsxs("div", { class: "space-y-2", children: [_jsx("h3", { class: "font-bold text-gray-500 uppercase", children: "Fill Effect" }), _jsxs("div", { class: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-6", children: [_jsx(TextArea, { resize: resize, effect: "effect10", placeholder: "Effect 10 TextArea..." }), _jsx(TextArea, { resize: resize, effect: "effect11", placeholder: "Effect 11 TextArea..." }), _jsx(TextArea, { resize: resize, effect: "effect12", placeholder: "Effect 12 TextArea..." }), _jsx(TextArea, { resize: resize, effect: "effect13", placeholder: "Effect 13 TextArea..." }), _jsx(TextArea, { resize: resize, effect: "effect14", placeholder: "Effect 14 TextArea..." }), _jsx(TextArea, { resize: resize, effect: "effect15", placeholder: "Effect 15 TextArea..." })] })] }));
};
const LabelEffects = () => {
    const resize = $("none");
    return (_jsxs("div", { class: "space-y-2", children: [_jsx("h3", { class: "font-bold text-gray-500 uppercase", children: "Label Effect" }), _jsxs("div", { class: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-6", children: [_jsx(TextArea, { resize: resize, effect: "effect16", label: "Effect 16" }), _jsx(TextArea, { resize: resize, effect: "effect17", label: "Effect 17" }), _jsx(TextArea, { resize: resize, effect: "effect18", label: "Effect 18" }), _jsx(TextArea, { resize: resize, effect: "effect19", label: "Effect 19" }), _jsx(TextArea, { resize: resize, effect: "effect20", label: "Effect 20" }), _jsx(TextArea, { resize: resize, effect: "effect21", label: "Effect 21" }), _jsx(TextArea, { resize: resize, effect: "effect22", label: "Effect 22" }), _jsx(TextArea, { resize: resize, effect: "effect23", label: "Effect 23" }), _jsx(TextArea, { resize: resize, effect: "effect24", label: "Effect 24" })] })] }));
};
const AlternativeEffects = () => {
    const resize = $("none");
    return (_jsxs("div", { class: "space-y-2", children: [_jsx("h3", { class: "font-bold text-gray-500 uppercase", children: "Label Effect" }), _jsxs("div", { class: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-6", children: [_jsx(TextArea, { resize: resize, effect: "effect19a", label: "Effect 19a" }), _jsx(TextArea, { resize: resize, effect: "effect20a", label: "Effect 20a" }), _jsx(TextArea, { resize: resize, effect: "effect21a", label: "Effect 21a" })] })] }));
};
const ResizeableBorderEffects = () => {
    const resize = $("both");
    return (_jsxs("div", { class: "space-y-2", children: [_jsx("h3", { class: "font-bold text-gray-500 uppercase", children: "Underline Effect Resizeable TextArea (Effect 1 - 3)" }), _jsx(TextArea, { cls: "w-[300px] h-[100px]", resize: resize, effect: "effect1", placeholder: "Underline Effect Textarea..." }), _jsx("hr", { class: "mx-auto my-2 border-gray-300 border-1" }), _jsx("h3", { class: "font-bold text-gray-500 uppercase", children: "Box Effect Resizeable TextArea (Effect 4 - 6)" }), _jsx(TextArea, { cls: "w-[300px] h-[100px]", resize: resize, effect: "effect4", placeholder: "Box Effect Textarea..." }), _jsx("hr", { class: "mx-auto my-2 border-gray-300 border-1" }), _jsx("h3", { class: "font-bold text-gray-500 uppercase", children: "Outline Effect Resizeable TextArea (Effect 7 - 9)" }), _jsx(TextArea, { cls: "w-[300px] h-[100px]", resize: resize, effect: "effect7", placeholder: "Outline Effect Textarea..." })] }));
};
const ResizeableFillEffects = () => {
    const resize = $("both");
    return (_jsxs("div", { class: "space-y-2", children: [_jsx("h3", { class: "font-bold text-gray-500 uppercase", children: "Fill Effect Resizeable TextArea (Effect 10 - 15)" }), _jsx(TextArea, { cls: "w-[300px] h-[100px]", resize: resize, effect: "effect10", placeholder: "Fill Effect Textarea..." })] }));
};
const ResizeableLabelEffects = () => {
    const resize = $("both");
    return (_jsxs("div", { class: "space-y-2", children: [_jsx("h3", { class: "font-bold text-gray-500 uppercase", children: "With Label Effect Resizeable TextArea (Effect 16 - 18)" }), _jsx(TextArea, { cls: "w-[300px] h-[100px]", resize: resize, effect: "effect16", label: "Underline Effect Textarea..." }), _jsx("hr", { class: "mx-auto my-2 border-gray-300 border-1" }), _jsx("h3", { class: "font-bold text-gray-500 uppercase", children: "With Label Effect Resizeable TextArea (Effect 19 - 21)" }), _jsx(TextArea, { cls: "w-[300px] h-[100px]", resize: resize, effect: "effect19", label: "Box Effect Textarea..." }), _jsx("hr", { class: "mx-auto my-2 border-gray-300 border-1" }), _jsx("h3", { class: "font-bold text-gray-500 uppercase", children: "With Label Effect Resizeable TextArea (Effect 22 - 24)" }), _jsx(TextArea, { cls: "w-[300px] h-[100px]", resize: resize, effect: "effect22", label: "Fill Effect Textarea..." })] }));
};
export { BorderEffectTextArea, FillEffects, LabelEffects, AlternativeEffects, ResizeableBorderEffects, ResizeableFillEffects, ResizeableLabelEffects };

import { jsx as _jsx, jsxs as _jsxs } from "woby/jsx-runtime";
import { EndAdornment, StartAdornment, TextField } from '../src/TextField';
const BorderEffects = () => {
    return (_jsxs("div", { class: "space-y-8 mt-4", children: [_jsx("h3", { class: "font-bold text-gray-500 uppercase italic", children: "Border Effects" }), _jsxs("div", { class: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-6", children: [_jsx(TextField, { effect: "effect1", placeholder: "Effect 1" }), _jsx(TextField, { effect: "effect2", placeholder: "Effect 2" }), _jsx(TextField, { effect: "effect3", placeholder: "Effect 3" }), _jsx(TextField, { effect: "effect4", placeholder: "Effect 4" }), _jsx(TextField, { effect: "effect5", placeholder: "Effect 5" }), _jsx(TextField, { effect: "effect6", placeholder: "Effect 6" }), _jsx(TextField, { effect: "effect7", placeholder: "Effect 7" }), _jsx(TextField, { effect: "effect8", placeholder: "Effect 8" }), _jsx(TextField, { effect: "effect9", placeholder: "Effect 9" })] })] }));
};
const BackgroundEffects = () => {
    return (_jsxs("div", { class: "space-y-8 mt-4", children: [_jsx("h3", { class: "font-bold text-gray-500 uppercase", children: "Background Effects" }), _jsxs("div", { class: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-6", children: [_jsx(TextField, { effect: "effect10", placeholder: "Effect 10" }), _jsx(TextField, { effect: "effect11", placeholder: "Effect 11" }), _jsx(TextField, { effect: "effect12", placeholder: "Effect 12" }), _jsx(TextField, { effect: "effect13", placeholder: "Effect 13" }), _jsx(TextField, { effect: "effect14", placeholder: "Effect 14" }), _jsx(TextField, { effect: "effect15", placeholder: "Effect 15" })] })] }));
};
const InputWithLabelEffects = () => {
    return (_jsxs("div", { class: "space-y-8 mt-4", children: [_jsx("h3", { class: "font-bold text-gray-500 uppercase", children: "Input with Label Effects" }), _jsxs("div", { class: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-6", children: [_jsx(TextField, { effect: "effect16", label: "Effect 16" }), _jsx(TextField, { effect: "effect17", label: "Effect 17" }), _jsx(TextField, { effect: "effect18", label: "Effect 18" }), _jsx(TextField, { effect: "effect19", label: "Effect 19" }), _jsx(TextField, { effect: "effect20", label: "Effect 20" }), _jsx(TextField, { effect: "effect21", label: "Effect 21" }), _jsx(TextField, { effect: "effect22", label: "Effect 22" }), _jsx(TextField, { effect: "effect23", label: "Effect 23" }), _jsx(TextField, { effect: "effect24", label: "Effect 24" })] })] }));
};
const AlternativeLabelEffects = () => {
    return (_jsxs("div", { class: "space-y-8 mt-4", children: [_jsx("h3", { class: "font-bold text-gray-500 uppercase", children: "Alternative Label Effects" }), _jsxs("div", { class: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-6", children: [_jsx(TextField, { effect: "effect19a", label: "Effect 19a" }), _jsx(TextField, { effect: "effect20a", label: "Effect 20a" }), _jsx(TextField, { effect: "effect21a", label: "Effect 21a" })] })] }));
};
const AdornmentEffects = () => {
    return (_jsxs("div", { class: "space-y-8 mt-4", children: [_jsx("h3", { class: "font-bold text-gray-500 uppercase", children: "TextField With Adornment Effects" }), _jsxs("div", { class: "grid grid-cols-2 md:grid-cols-3 gap-4 mb-6", children: [_jsx(TextField, { effect: "effect19a", label: "Effect 19a", children: _jsx(StartAdornment, { children: _jsx("span", { children: "@" }) }) }), _jsx(TextField, { effect: "effect20a", label: "Effect 20a", children: _jsx(EndAdornment, { children: _jsx("span", { children: "@" }) }) }), _jsx(TextField, { effect: "effect21a", label: "Effect 21a" })] })] }));
};
export { BorderEffects, BackgroundEffects, InputWithLabelEffects, AlternativeLabelEffects, AdornmentEffects,
// UnderlineEffects,
// BoxEffects,
// OutlineEffects,
// FillEffects,
// FloatingLabelsUnderlineEffects,
// FloatingLabelsBoxEffects,
// FloatingLabelsFillEffects,
// AlternativeBoxEffects,
 };

import { jsx as _jsx, jsxs as _jsxs } from "woby/jsx-runtime";
/** @jsxImportSource woby */
import { $ } from 'woby';
import { EditorContext } from '../../src/Editor/undoredo';
import TextStyleButton from '../../src/Editor/TextStyleButton';
const TextStylesDemo = () => {
    const editorRef = $({});
    return (_jsx(EditorContext.Provider, { value: editorRef, children: _jsxs("div", { class: "mb-4", children: [_jsxs("div", { class: "flex gap-4 items-center my-2 border border-gray-300 rounded p-4", children: [_jsx(TextStyleButton, { class: "text-black", type: "bold" }), _jsx(TextStyleButton, { class: "text-black", type: "italic" }), _jsx(TextStyleButton, { class: "text-black", type: "underline" })] }), _jsxs("div", { contentEditable: true, class: "border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("p", { children: "Select this text and try the style buttons above!" }), _jsxs("p", { children: ["You can make text ", _jsx("strong", { children: "bold" }), ", ", _jsx("em", { children: "italic" }), ", or ", _jsx("u", { children: "underlined" }), "."] }), _jsx("br", {}), _jsx("p", { children: "Try selecting different parts of this text to test all formatting options." })] })] }) }));
};
export { TextStylesDemo, };

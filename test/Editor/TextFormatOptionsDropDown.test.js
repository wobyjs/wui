import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "woby/jsx-runtime";
/** @jsxImportSource woby */
import { $ } from 'woby';
import { TextFormatOptionsDropDown } from '../../src/Editor/TextFormatOptionsDropDown';
import { EditorContext } from '../../src/Editor/undoredo';
const TextFormatOptionsDropDownDemo = () => {
    // const editorRef = $({} as HTMLDivElement)
    const editorRef = $(null);
    return _jsx(_Fragment, { children: _jsx(EditorContext.Provider, { value: editorRef, children: _jsxs("div", { class: "mb-4", children: [_jsx("div", { class: "flex gap-4 items-center my-2 border border-gray-300 rounded p-4", children: _jsx(TextFormatOptionsDropDown, {}) }), _jsxs("div", { contentEditable: true, class: "border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("p", { children: "Try selecting this text and experiment with the text format options dropdown above!" }), _jsx("p", { children: "You can apply various formatting styles including different fonts, sizes, and colors to your selected text." }), _jsx("p", { children: "This interactive editor allows you to customize your content with ease." })] })] }) }) });
};
export { TextFormatOptionsDropDownDemo, };

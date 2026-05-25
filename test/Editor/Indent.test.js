import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "woby/jsx-runtime";
/** @jsxImportSource woby */
import { $ } from 'woby';
import { Indent } from '../../src/Editor/Indent';
import { EditorContext } from '../../src/Editor/undoredo';
const IndentDemo = () => {
    const editorRef = $(null);
    return _jsx(_Fragment, { children: _jsx(EditorContext.Provider, { value: editorRef, children: _jsxs("div", { class: "mb-4", children: [_jsxs("div", { class: "flex gap-4 items-center my-2 border border-gray-300 rounded p-4", children: [_jsx(Indent, { mode: "decrease", class: "text-black" }), _jsx(Indent, { mode: "increase", class: "text-black" })] }), _jsxs("div", { contentEditable: true, class: "border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("p", { children: "Select this text and try the Indent Buttons above!" }), _jsx("p", { children: "You can increase or decrease indentation." }), _jsx("p", { children: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos." })] })] }) }) });
};
export { IndentDemo, };

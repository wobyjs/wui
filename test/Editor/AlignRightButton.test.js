import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "woby/jsx-runtime";
/** @jsxImportSource woby */
import { $ } from 'woby';
import { AlignRightButton } from '../../src/Editor/AlignRightButton';
import { EditorContext } from '../../src/Editor/undoredo';
const AlignRightButtonDemo = () => {
    // const editorRef = $({} as HTMLDivElement)
    const editorRef = $(null);
    return _jsx(_Fragment, { children: _jsx(EditorContext.Provider, { value: editorRef, children: _jsxs("div", { class: "mb-4", children: [_jsx("div", { class: "flex gap-4 items-center my-2 border border-gray-300 rounded p-4", children: _jsx(AlignRightButton, { class: "text-black" }) }), _jsxs("div", { contentEditable: true, class: "border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left", children: [_jsx("p", { children: "Select this text and try the Align Right Button!" }), _jsx("p", { children: "You can make text right or not." }), _jsx("br", {}), _jsx("p", { children: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos." })] })] }) }) });
};
export { AlignRightButtonDemo, };

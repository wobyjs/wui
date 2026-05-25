import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "woby/jsx-runtime";
/** @jsxImportSource woby */
import { $ } from 'woby';
import { EditorContext } from '../../src/Editor/undoredo';
import { TextColorPicker } from '../../src/Editor/TextColorPicker';
const Demo = () => {
    // const editorRef = $({} as HTMLDivElement)
    const editorRef = $(null);
    return _jsx(_Fragment, { children: _jsx(EditorContext.Provider, { value: editorRef, children: _jsxs("div", { class: "mb-4", children: [_jsx("div", { class: "flex gap-4 items-center my-2 border border-gray-300 rounded p-4", children: _jsx(TextColorPicker, {}) }), _jsxs("div", { contentEditable: true, class: "border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("p", { children: "Select this text and try the Text Color Picker!" }), _jsx("p", { children: "You can change the color of your text." }), _jsx("br", {}), _jsx("p", { children: "Try different colors and see how they look!" })] })] }) }) });
};
export { Demo };

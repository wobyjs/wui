import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "woby/jsx-runtime";
/** @jsxImportSource woby */
import { $ } from 'woby';
import { TextFormatDropDown } from '../../src/Editor/TextFormatDropDown';
import { EditorContext } from '../../src/Editor/undoredo';
const TextFormatOptionsDropDownDemo = () => {
    const editorRef = $({});
    // const editorRef = $(null as HTMLDivElement | null)
    return _jsx(_Fragment, { children: _jsx(EditorContext.Provider, { value: editorRef, children: _jsxs("div", { class: "mb-4", children: [_jsx("div", { class: "flex gap-4 items-center my-2 border border-gray-300 rounded p-4", children: _jsx(TextFormatDropDown, {}) }), _jsxs("div", { contentEditable: true, class: "border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("p", { children: "Select this text to explore the text formatting options in the dropdown menu above!" }), _jsx("p", { children: "Experience various text format for your selected content." }), _jsx("br", {}), _jsx("p", { children: "This powerful editor provides flexible formatting capabilities to enhance your text." })] })] }) }) });
};
export { TextFormatOptionsDropDownDemo, };

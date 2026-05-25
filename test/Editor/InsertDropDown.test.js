import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "woby/jsx-runtime";
/** @jsxImportSource woby */
import { $ } from 'woby';
import { InsertDropDown } from '../../src/Editor/InsertDropDown';
import { EditorContext, UndoRedo } from '../../src/Editor/undoredo';
const InsertDropDownDemo = () => {
    const editorRef = $({});
    return _jsx(_Fragment, { children: _jsx(EditorContext.Provider, { value: editorRef, children: _jsx(UndoRedo, { children: _jsxs("div", { class: "mb-4", children: [_jsx("div", { class: "flex gap-4 items-center my-2 border border-gray-300 rounded p-4", children: _jsx(InsertDropDown, {}) }), _jsxs("div", { ref: editorRef, contentEditable: true, class: "border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("p", { children: "Click the Insert Dropdown above to add content!" }), _jsx("p", { children: "You can insert various elements like tables, images, or other components." }), _jsx("p", { children: "Try selecting text and using the dropdown to enhance your content." })] })] }) }) }) });
};
export { InsertDropDownDemo, };

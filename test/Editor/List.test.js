import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "woby/jsx-runtime";
/** @jsxImportSource woby */
import { $ } from 'woby';
import { List } from '../../src/Editor/List';
import { EditorContext } from '../../src/Editor/undoredo';
const ListButtonDemo = () => {
    // const editorRef = $({} as HTMLDivElement)
    const editorRef = $(null);
    return _jsx(_Fragment, { children: _jsx(EditorContext.Provider, { value: editorRef, children: _jsxs("div", { class: "mb-4", children: [_jsxs("div", { class: "flex gap-4 items-center my-2 border border-gray-300 rounded p-4", children: [_jsx(List, { mode: "bullet", class: "text-black" }), _jsx(List, { mode: "number", class: "text-black" })] }), _jsxs("div", { contentEditable: true, class: "border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("p", { children: "Try selecting this text and click the List Buttons above!" }), _jsx("p", { children: "You can transform text into bullet lists or numbered lists." }), _jsx("p", { children: "Test the functionality by highlighting any paragraph and clicking either button." })] })] }) }) });
};
export { ListButtonDemo, };

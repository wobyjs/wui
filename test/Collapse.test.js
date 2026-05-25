import { jsx as _jsx, jsxs as _jsxs } from "woby/jsx-runtime";
// export * from '../src/custom-elements'
// export * from '../src/Chip'
import { Collapse } from '../src/Collapse';
import { Button } from '../src/Button';
import { $, $$ } from 'woby';
// ============================================
// BASIC TESTS
// ============================================
const DefaultCollapse = () => {
    return (_jsx(Collapse, { children: _jsxs("div", { class: "p-4 bg-gray-100", children: [_jsx("p", { children: "This is the content inside the collapse component." }), _jsx("p", { children: "It should be visible by default." })] }) }));
};
// ============================================
// OPEN STATE TESTS
// ============================================
const OpenCollapse = () => {
    return (_jsx(Collapse, { open: true, children: _jsxs("div", { class: "p-4 bg-blue-100", children: [_jsx("p", { children: "This collapse is explicitly set to open." }), _jsx("p", { children: "The content should be visible." })] }) }));
};
const ClosedCollapse = () => {
    return (_jsx(Collapse, { open: false, children: _jsxs("div", { class: "p-4 bg-red-100", children: [_jsx("p", { children: "This collapse is explicitly set to closed." }), _jsx("p", { children: "The content should be hidden." })] }) }));
};
// ============================================
// BACKGROUND TESTS
// ============================================
const CollapseWithBackground = () => {
    return (_jsx(Collapse, { background: true, children: _jsxs("div", { class: "p-4", children: [_jsx("p", { children: "This collapse has a background (default behavior)." }), _jsx("p", { children: "You should see a gray background." })] }) }));
};
const CollapseWithoutBackground = () => {
    return (_jsx(Collapse, { background: false, children: _jsxs("div", { class: "p-4", children: [_jsx("p", { children: "This collapse has no background." }), _jsx("p", { children: "There should be no gray background." })] }) }));
};
// ============================================
// INTERACTIVE TESTS
// ============================================
const ToggleableCollapse = () => {
    const isOpen = $(true);
    return (_jsxs("div", { class: "space-y-4", children: [_jsxs(Button, { onClick: () => isOpen(!$$(isOpen)), cls: "px-4 py-2 bg-blue-500 text-white rounded", children: ["Toggle Collapse (Currently: ", () => $$(isOpen) ? 'Open' : 'Closed', ")"] }), _jsx(Collapse, { open: isOpen, children: _jsxs("div", { class: "p-4 bg-green-100", children: [_jsx("p", { children: "This collapse can be toggled open/closed." }), _jsx("p", { children: "Click the button above to toggle visibility." })] }) })] }));
};
const ToggleableCollapseWithoutBackground = () => {
    const isOpen = $(false);
    return (_jsxs("div", { class: "space-y-4", children: [_jsxs(Button, { onClick: () => isOpen(!$$(isOpen)), cls: "px-4 py-2 bg-purple-500 text-white rounded", children: ["Toggle Collapse (Currently: ", () => $$(isOpen) ? 'Open' : 'Closed', ")"] }), _jsx(Collapse, { open: isOpen, background: false, children: _jsxs("div", { class: "p-4 border border-gray-300", children: [_jsx("p", { children: "This collapse can be toggled open/closed and has no background." }), _jsx("p", { children: "Click the button above to toggle visibility." })] }) })] }));
};
// ============================================
// COMBINED TESTS
// ============================================
const OpenCollapseWithoutBackground = () => {
    return (_jsx(Collapse, { open: true, background: false, children: _jsxs("div", { class: "p-4 border border-gray-300", children: [_jsx("p", { children: "This collapse is open and has no background." }), _jsx("p", { children: "Content should be visible with just a border." })] }) }));
};
const ClosedCollapseWithBackground = () => {
    return (_jsx(Collapse, { open: false, background: true, children: _jsxs("div", { class: "p-4", children: [_jsx("p", { children: "This collapse is closed but has a background." }), _jsx("p", { children: "Content should be hidden but container may still exist." })] }) }));
};
// ============================================
// STYLING TESTS
// ============================================
const CustomStyledCollapse = () => {
    return (_jsx(Collapse, { cls: "!bg-yellow-100 !border-2 !border-purple-500", open: true, children: _jsxs("div", { class: "p-4", children: [_jsx("p", { children: "This collapse has custom styling." }), _jsx("p", { children: "It should have a yellow background and purple border." })] }) }));
};
// ============================================
// CONTENT TESTS
// ============================================
const CollapseWithComplexContent = () => {
    return (_jsx(Collapse, { open: true, children: _jsxs("div", { class: "p-4 bg-green-100", children: [_jsx("h4", { class: "font-bold", children: "Complex Content Header" }), _jsx("p", { children: "This collapse contains more complex content:" }), _jsxs("ul", { class: "list-disc pl-5", children: [_jsx("li", { children: "Unordered list item 1" }), _jsx("li", { children: "Unordered list item 2" })] }), _jsx("p", { class: "mt-2", children: "And some more text content to test height calculations." })] }) }));
};
// ============================================
// MULTIPLE COLLAPSES
// ============================================
const MultipleCollapses = () => {
    const isOpen1 = $(true);
    const isOpen2 = $(false);
    const isOpen3 = $(true);
    return (_jsxs("div", { class: "space-y-4", children: [_jsxs("div", { class: "space-y-2", children: [_jsxs(Button, { onClick: () => isOpen1(!$$(isOpen1)), cls: "px-3 py-1 bg-blue-500 text-white rounded", children: ["Toggle Collapse 1 (", () => $$(isOpen1) ? 'Open' : 'Closed', ")"] }), _jsx(Collapse, { open: isOpen1, children: _jsx("div", { class: "p-4 bg-blue-100", children: _jsx("p", { children: "First collapse content" }) }) })] }), _jsxs("div", { class: "space-y-2", children: [_jsxs(Button, { onClick: () => isOpen2(!$$(isOpen2)), cls: "px-3 py-1 bg-green-500 text-white rounded", children: ["Toggle Collapse 2 (", () => $$(isOpen2) ? 'Open' : 'Closed', ")"] }), _jsx(Collapse, { open: isOpen2, children: _jsx("div", { class: "p-4 bg-green-100", children: _jsx("p", { children: "Second collapse content" }) }) })] }), _jsxs("div", { class: "space-y-2", children: [_jsxs(Button, { onClick: () => isOpen3(!$$(isOpen3)), cls: "px-3 py-1 bg-purple-500 text-white rounded", children: ["Toggle Collapse 3 (", () => $$(isOpen3) ? 'Open' : 'Closed', ")"] }), _jsx(Collapse, { open: isOpen3, background: false, children: _jsx("div", { class: "p-4 border border-gray-300", children: _jsx("p", { children: "Third collapse content (no background)" }) }) })] })] }));
};
// ============================================
// COMPREHENSIVE COMBINATION TEST
// ============================================
const ComprehensiveCollapseTest = () => {
    const isOpen1 = $(true);
    const isOpen2 = $(false);
    const hasBackground = $(true);
    return (_jsx("div", { class: "space-y-6 p-4", children: _jsxs("div", { class: "space-y-4", children: [_jsx("h3", { class: "font-bold text-lg", children: "Collapse Component Test Suite" }), _jsxs("div", { class: "flex gap-2 flex-wrap", children: [_jsxs(Button, { onClick: () => isOpen1(!$$(isOpen1)), cls: "px-3 py-1 bg-blue-500 text-white rounded", children: ["Toggle First (", () => $$(isOpen1) ? 'Open' : 'Closed', ")"] }), _jsxs(Button, { onClick: () => isOpen2(!$$(isOpen2)), cls: "px-3 py-1 bg-green-500 text-white rounded", children: ["Toggle Second (", () => $$(isOpen2) ? 'Open' : 'Closed', ")"] }), _jsxs(Button, { onClick: () => hasBackground(!$$(hasBackground)), cls: "px-3 py-1 bg-purple-500 text-white rounded", children: ["Toggle Background (", () => $$(hasBackground) ? 'On' : 'Off', ")"] })] }), _jsxs("div", { class: "space-y-4", children: [_jsx(Collapse, { open: isOpen1, children: _jsx("div", { class: "p-4 bg-gray-100", children: _jsx("p", { children: "Default collapse that can be toggled" }) }) }), _jsx(Collapse, { open: isOpen2, background: hasBackground, children: _jsx("div", { class: "p-4 border border-gray-300", children: _jsx("p", { children: "Collapse with toggleable background" }) }) }), _jsx(Collapse, { cls: "!bg-yellow-100 !border-2 !border-purple-500", open: true, children: _jsx("div", { class: "p-4", children: _jsx("p", { children: "Custom styled collapse" }) }) })] })] }) }));
};
export { 
// Basic
DefaultCollapse, 
// Open state
OpenCollapse, ClosedCollapse, 
// Background
CollapseWithBackground, CollapseWithoutBackground, 
// Interactive
ToggleableCollapse, ToggleableCollapseWithoutBackground, 
// Combined
OpenCollapseWithoutBackground, ClosedCollapseWithBackground, 
// Styling
CustomStyledCollapse, 
// Content
CollapseWithComplexContent, 
// Multiple
MultipleCollapses, 
// Comprehensive
ComprehensiveCollapseTest, };

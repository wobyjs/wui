import { jsx as _jsx, jsxs as _jsxs } from "woby/jsx-runtime";
/* @jsxImportSource woby */
import { $ } from 'woby';
import { SideBar, MenuItem, MenuText } from '../src/SideBar'; // Adjust path to your SideBar component
import { Button } from '../src/Button'; // Assuming Button component is available
/**
 * A simple SVG icon for menu items.
 */
// const HomeIcon = () => (
//     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
//     </svg>
// )
//#region Basic Sidebar
/**
 * The main interactive demo for the SideBar.
 * Demonstrates opening, closing, pushing content, and using MenuItems.
 */
const BasicSidebar = () => {
    const open = $(false);
    const contentRef = $(); // Ref for the main content area
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Basic Interactive Sidebar" }), _jsx("p", { class: "text-sm text-gray-600 mb-4", children: "Click the button to open the sidebar. The main content will be pushed to the right. Click the dark overlay to close it." }), _jsx(SideBar, { open: open, contentRef: contentRef, cls: 'bg-gray-800 text-white', children: _jsxs("div", { class: "p-4", children: [_jsx("h2", { class: "text-xl font-bold mb-4", children: "Menu" }), _jsxs("nav", { children: [_jsxs(MenuItem, { href: "#", cls: 'hover:bg-gray-700 ', children: [_jsx("svg", { class: "w-6 h-6 text-white fill-current stroke-current", viewBox: "0 0 24 24", children: _jsx("use", { href: "/svg/home-icon.svg#icon" }) }), _jsx(MenuText, { children: "Dashboard" })] }), _jsx(MenuItem, { href: "#", cls: 'hover:bg-gray-700 ', children: _jsx(MenuText, { children: "Profile" }) }), _jsx(MenuItem, { href: "#", cls: 'hover:bg-gray-700 ', children: _jsx(MenuText, { children: "Settings" }) })] })] }) }), _jsxs("div", { ref: contentRef, id: "main-content", children: [_jsx(Button, { onClick: () => open(true), children: "Open Sidebar" }), _jsxs("div", { class: "mt-4 p-4 border rounded-lg bg-gray-50", children: [_jsx("h4", { class: "font-semibold", children: "Main Content Area" }), _jsx("p", { class: "mt-2 text-sm", children: "This is the main content of your page. When the sidebar opens, this entire section will slide to the right." })] })] })] }));
};
//#endregion
//#region Custom Width Sidebar
/**
 * Demonstrates a sidebar with a custom width.
 */
const CustomWidthSidebar = () => {
    const open = $(false);
    const contentRef = $();
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Custom Width Sidebar" }), _jsx("p", { class: "text-sm text-gray-600 mb-4", children: "This sidebar is set to have a width of \"400px\"." }), _jsx(SideBar, { open: open, contentRef: contentRef, width: "400px", children: _jsx("div", { class: "p-4", children: _jsx("h2", { class: "text-xl font-bold", children: "Wide Menu" }) }) }), _jsxs("div", { ref: contentRef, children: [_jsx(Button, { onClick: () => open(true), children: "Open Wide Sidebar" }), _jsx("div", { class: "mt-4 p-4 border rounded-lg bg-gray-50", children: _jsx("p", { class: "text-sm", children: "This content will be pushed by 400px." }) })] })] }));
};
//#endregion
//#region No Overlay Sidebar
/**
 * Demonstrates a sidebar without the background overlay.
 */
const NoOverlaySidebar = () => {
    const open = $(false);
    const contentRef = $();
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Sidebar Without Overlay" }), _jsxs("p", { class: "text-sm text-gray-600 mb-4", children: ["Using `mask=", false, "`. You must use a button to close it."] }), _jsx(SideBar, { open: open, contentRef: contentRef, mask: false, children: _jsxs("div", { class: "p-4", children: [_jsx("h2", { class: "text-xl font-bold mb-2", children: "No Overlay" }), _jsx(Button, { onClick: () => open(false), children: "Close Me" })] }) }), _jsxs("div", { ref: contentRef, children: [_jsx(Button, { onClick: () => open(true), children: "Open Sidebar (No Overlay)" }), _jsx("div", { class: "mt-4 p-4 border rounded-lg bg-gray-50", children: _jsx("p", { class: "text-sm", children: "The content is still pushed, but no dark overlay appears." }) })] })] }));
};
//#endregion
//#region Custom Styled Sidebar
/**
 * Demonstrates a sidebar with custom styling.
 */
const CustomStyledSidebar = () => {
    const open = $(false);
    const contentRef = $();
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Custom Styled Sidebar" }), _jsx("p", { class: "text-sm text-gray-600 mb-4", children: "Using the `cls` prop to change the background and add a border." }), _jsx(SideBar, { open: open, contentRef: contentRef, cls: "!bg-indigo-900 border-r-4 border-indigo-500", children: _jsx("div", { class: "p-4", children: _jsx("h2", { class: "text-xl font-bold text-indigo-200", children: "Indigo Sidebar" }) }) }), _jsxs("div", { ref: contentRef, children: [_jsx(Button, { onClick: () => open(true), children: "Open Custom Sidebar" }), _jsx("div", { class: "mt-4 p-4 border rounded-lg bg-gray-50", children: _jsx("p", { class: "text-sm", children: "Main content area." }) })] })] }));
};
//#endregion
export { BasicSidebar, CustomWidthSidebar, NoOverlaySidebar, CustomStyledSidebar, };

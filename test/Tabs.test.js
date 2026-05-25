import { jsx as _jsx, jsxs as _jsxs } from "woby/jsx-runtime";
import { Tabs, Tab } from '../src/Tabs';
import { $, $$ } from 'woby';
// Basic Tabs Example
const BasicTabsExample = () => {
    return (_jsxs("div", { class: "p-6", children: [_jsx("h2", { class: "text-2xl font-bold mb-4", children: "Basic Tabs" }), _jsxs(Tabs, { children: [_jsx(Tab, { title: "Home", children: _jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "text-xl font-semibold mb-2", children: "Welcome Home" }), _jsx("p", { children: "This is the home tab content." })] }) }), _jsx(Tab, { title: "Profile", children: _jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "text-xl font-semibold mb-2", children: "User Profile" }), _jsx("p", { children: "This is the profile tab content." })] }) }), _jsx(Tab, { title: "Settings", children: _jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "text-xl font-semibold mb-2", children: "Settings" }), _jsx("p", { children: "This is the settings tab content." })] }) })] })] }));
};
// Tabs with Observable Active Tab
const ObservableTabsExample = () => {
    const activeTab = $("Home");
    return (_jsxs("div", { class: "p-6", children: [_jsx("h2", { class: "text-2xl font-bold mb-4", children: "Tabs with Observable Active Tab" }), _jsxs("div", { class: "mb-4", children: [_jsxs("p", { class: "mb-2", children: ["Current active tab: ", _jsx("strong", { children: activeTab })] }), _jsx("button", { class: "bg-blue-500 text-white px-4 py-2 rounded mr-2", onClick: () => activeTab("Profile"), children: "Go to Profile" }), _jsx("button", { class: "bg-green-500 text-white px-4 py-2 rounded", onClick: () => activeTab("Settings"), children: "Go to Settings" })] }), _jsxs(Tabs, { activeTag: activeTab, children: [_jsx(Tab, { title: "Home", children: _jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "text-xl font-semibold mb-2", children: "Home Content" }), _jsx("p", { children: "You can control this tab programmatically using the buttons above." })] }) }), _jsx(Tab, { title: "Profile", children: _jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "text-xl font-semibold mb-2", children: "Profile Content" }), _jsx("p", { children: "This tab can be activated via the observable." })] }) }), _jsx(Tab, { title: "Settings", children: _jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "text-xl font-semibold mb-2", children: "Settings Content" }), _jsx("p", { children: "Settings tab content goes here." })] }) })] })] }));
};
// Styled Tabs Example
const StyledTabsExample = () => {
    return (_jsxs("div", { class: "p-6", children: [_jsx("h2", { class: "text-2xl font-bold mb-4", children: "Styled Tabs" }), _jsxs(Tabs, { cls: "max-w-2xl mx-auto bg-white rounded-lg", children: [_jsx(Tab, { cls: "!bg-red-100 rounded-lg shadow-lg", title: "Dashboard", children: _jsxs("div", { class: "p-6", children: [_jsx("h3", { class: "text-2xl font-bold mb-4 text-gray-800", children: "Dashboard" }), _jsxs("div", { class: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { class: "bg-blue-100 p-4 rounded-lg", children: [_jsx("h4", { class: "font-semibold", children: "Statistics" }), _jsx("p", { children: "View your analytics and metrics" })] }), _jsxs("div", { class: "bg-green-100 p-4 rounded-lg", children: [_jsx("h4", { class: "font-semibold", children: "Reports" }), _jsx("p", { children: "Generate detailed reports" })] }), _jsxs("div", { class: "bg-purple-100 p-4 rounded-lg", children: [_jsx("h4", { class: "font-semibold", children: "Notifications" }), _jsx("p", { children: "Check your alerts and messages" })] })] })] }) }), _jsx(Tab, { cls: "!bg-red-100 rounded-lg shadow-lg", title: "Users", children: _jsxs("div", { class: "p-6", children: [_jsx("h3", { class: "text-2xl font-bold mb-4 text-gray-800", children: "User Management" }), _jsxs("table", { class: "min-w-full bg-white", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { class: "py-2 px-4 border-b", children: "Name" }), _jsx("th", { class: "py-2 px-4 border-b", children: "Email" }), _jsx("th", { class: "py-2 px-4 border-b", children: "Role" })] }) }), _jsxs("tbody", { children: [_jsxs("tr", { children: [_jsx("td", { class: "py-2 px-4 border-b", children: "John Doe" }), _jsx("td", { class: "py-2 px-4 border-b", children: "john@example.com" }), _jsx("td", { class: "py-2 px-4 border-b", children: "Admin" })] }), _jsxs("tr", { children: [_jsx("td", { class: "py-2 px-4 border-b", children: "Jane Smith" }), _jsx("td", { class: "py-2 px-4 border-b", children: "jane@example.com" }), _jsx("td", { class: "py-2 px-4 border-b", children: "User" })] })] })] })] }) }), _jsx(Tab, { cls: "!bg-red-100 rounded-lg shadow-lg", title: "Configuration", children: _jsxs("div", { class: "p-6", children: [_jsx("h3", { class: "text-2xl font-bold mb-4 text-gray-800", children: "System Configuration" }), _jsxs("div", { class: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { class: "block text-gray-700 mb-2", children: "Site Name" }), _jsx("input", { type: "text", class: "w-full p-2 border border-gray-300 rounded", value: "My Website" })] }), _jsxs("div", { children: [_jsx("label", { class: "block text-gray-700 mb-2", children: "Theme" }), _jsxs("select", { class: "w-full p-2 border border-gray-300 rounded", children: [_jsx("option", { children: "Light" }), _jsx("option", { children: "Dark" }), _jsx("option", { children: "Auto" })] })] }), _jsxs("div", { class: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "notifications", class: "mr-2" }), _jsx("label", { for: "notifications", class: "text-gray-700", children: "Enable Notifications" })] })] })] }) })] })] }));
};
// Dynamic Tabs Example
const DynamicTabsExample = () => {
    const tabs = $([
        { id: 1, title: "Tab 1", content: "Content for the first tab" },
        { id: 2, title: "Tab 2", content: "Content for the second tab" }
    ]);
    const addTab = () => {
        const newId = $$(tabs).length + 1;
        tabs([...$$(tabs), {
                id: newId,
                title: `Tab ${newId}`,
                content: `Content for tab ${newId}`
            }]);
    };
    const removeTab = (id) => {
        if ($$(tabs).length > 1) {
            tabs($$(tabs).filter(tab => tab.id !== id));
        }
    };
    return (_jsxs("div", { class: "p-6", children: [_jsx("h2", { class: "text-2xl font-bold mb-4", children: "Dynamic Tabs" }), _jsxs("div", { class: "mb-4", children: [_jsx("button", { class: "bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600", onClick: addTab, children: "Add Tab" }), _jsxs("span", { children: ["Number of tabs: ", () => $$(tabs).length] })] }), _jsx(Tabs, { children: () => $$(tabs).map(tab => (_jsx(Tab, { title: tab.title, children: _jsxs("div", { class: "p-4 flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h3", { class: "text-xl font-semibold mb-2", children: tab.title }), _jsx("p", { children: tab.content })] }), _jsx("button", { class: "bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600", onClick: () => removeTab(tab.id), children: "Remove" })] }) }, tab.id))) })] }));
};
export { BasicTabsExample, ObservableTabsExample, StyledTabsExample, DynamicTabsExample, };

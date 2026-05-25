import { jsx as _jsx, jsxs as _jsxs } from "woby/jsx-runtime";
/* @jsxImportSource woby */
import { $ } from 'woby';
import { Button } from '../../src/Button';
import { MultiWheeler } from '../../src/Wheeler/MultiWheeler';
// #region Reusable Data
// --- Reusable Data ---
const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew'];
const VEGETABLES = ['Carrot', 'Broccoli', 'Spinach', 'Tomato', 'Cucumber', 'Lettuce'];
const COLORS = ['Red', 'Green', 'Blue', 'Yellow', 'Purple', 'Orange'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const YEARS = Array.from({ length: 10 }, (_, i) => (2020 + i).toString());
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
// --- JSON Data ---
const DEPARTMENTS = [
    { "label": "Engineering", "value": "ENG" },
    { "label": "Marketing", "value": "MKT" },
    { "label": "Sales", "value": "SALES" },
    { "label": "Human Resources", "value": "HR" },
    { "label": "Finance", "value": "FIN" },
];
const POSITIONS = [
    { "label": "Manager", "value": "MGR" },
    { "label": "Senior", "value": "SR" },
    { "label": "Junior", "value": "JR" },
    { "label": "Intern", "value": "INTERN" },
];
const CITIES = [
    { "label": "New York", "value": "NY" },
    { "label": "Los Angeles", "value": "LA" },
    { "label": "Chicago", "value": "CHI" },
    { "label": "Houston", "value": "HOU" },
    { "label": "Phoenix", "value": "PHX" },
];
// #endregion
// #region Basic MultiWheeler Examples
/**
 * Demonstrates basic MultiWheeler with simple string arrays (2 wheels)
 */
const BasicMultiWheelerTwoColumns = () => {
    const selectedFruit = $('Apple');
    const selectedColor = $('Red');
    const visible = $(true);
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Basic MultiWheeler - Two Columns (Fruit + Color)" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "Two independent wheels with simple string arrays." }), _jsx(Button, { cls: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", onClick: () => visible(true), children: "Open Picker" }), _jsx("div", { class: "my-4 w-full", children: _jsx(MultiWheeler, { options: [FRUITS, COLORS], value: [selectedFruit, selectedColor], headers: [
                        () => _jsx("span", { class: "text-sm font-semibold", children: "Fruit" }),
                        () => _jsx("span", { class: "text-sm font-semibold", children: "Color" }),
                    ], visible: visible, bottom: false, mask: true, title: _jsx("span", { class: "font-bold", children: "Select Fruit & Color" }), cls: "w-full border border-gray-300 rounded-md overflow-auto" }) }), _jsxs("div", { class: "mt-4 p-3 bg-gray-50 rounded", children: [_jsxs("p", { children: ["Selected Fruit: ", _jsx("span", { class: "font-mono bg-white p-1 rounded border", children: selectedFruit })] }), _jsxs("p", { class: "mt-2", children: ["Selected Color: ", _jsx("span", { class: "font-mono bg-white p-1 rounded border", children: selectedColor })] })] })] }));
};
/**
 * Demonstrates MultiWheeler with three columns
 */
const BasicMultiWheelerThreeColumns = () => {
    const selectedFruit = $('Banana');
    const selectedVegetable = $('Carrot');
    const selectedSize = $('M');
    const visible = $(false);
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Basic MultiWheeler - Three Columns" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "Three independent wheels for fruit, vegetable, and size selection." }), _jsx(Button, { cls: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", onClick: () => visible(true), children: "Open Picker" }), _jsx(MultiWheeler, { options: [FRUITS, VEGETABLES, SIZES], value: [selectedFruit, selectedVegetable, selectedSize], headers: [
                    () => _jsx("span", { class: "text-sm font-semibold", children: "Fruit" }),
                    () => _jsx("span", { class: "text-sm font-semibold", children: "Vegetable" }),
                    () => _jsx("span", { class: "text-sm font-semibold", children: "Size" }),
                ], visible: visible, bottom: true, mask: true, divider: true, title: _jsx("span", { class: "font-bold", children: "Select Your Preferences" }) }), _jsxs("div", { class: "mt-4 p-3 bg-gray-50 rounded", children: [_jsxs("p", { children: ["Selected Fruit: ", _jsx("span", { class: "font-mono bg-white p-1 rounded border", children: () => selectedFruit() })] }), _jsxs("p", { class: "mt-2", children: ["Selected Vegetable: ", _jsx("span", { class: "font-mono bg-white p-1 rounded border", children: () => selectedVegetable() })] }), _jsxs("p", { class: "mt-2", children: ["Selected Size: ", _jsx("span", { class: "font-mono bg-white p-1 rounded border", children: () => selectedSize() })] })] })] }));
};
// #endregion
// #region MultiWheeler with JSON Object Arrays
const MultiWheelerWithJsonObjects = () => {
    const selectedDepartment = $('ENG');
    const selectedPosition = $('SR');
    const selectedCity = $('NY');
    const visible = $(true);
    // Helper to format display
    const formatValue = (value, options) => {
        const option = options.find(opt => opt.value === value);
        return option ? `${option.label} (${option.value})` : value;
    };
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "MultiWheeler with JSON Object Arrays" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "Three wheels using object arrays with label/value pairs." }), _jsx(Button, { cls: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", onClick: () => visible(true), children: "Open Employee Picker" }), _jsx("div", { class: "my-4 w-full", children: _jsx(MultiWheeler, { options: [DEPARTMENTS, POSITIONS, CITIES], value: [selectedDepartment, selectedPosition, selectedCity], headers: [
                        () => _jsx("span", { class: "text-sm font-semibold", children: "Department" }),
                        () => _jsx("span", { class: "text-sm font-semibold", children: "Position" }),
                        () => _jsx("span", { class: "text-sm font-semibold", children: "City" }),
                    ], visible: visible, bottom: false, mask: true, divider: true, title: _jsx("span", { class: "font-bold", children: "Employee Details" }), itemCount: 5, cls: "w-full border border-gray-300 rounded-md overflow-auto" }) }), _jsxs("div", { class: "mt-4 p-3 bg-gray-50 rounded", children: [_jsxs("p", { children: ["Department: ", _jsx("span", { class: "font-mono bg-white p-1 rounded border", children: () => formatValue(selectedDepartment(), DEPARTMENTS) })] }), _jsxs("p", { class: "mt-2", children: ["Position: ", _jsx("span", { class: "font-mono bg-white p-1 rounded border", children: () => formatValue(selectedPosition(), POSITIONS) })] }), _jsxs("p", { class: "mt-2", children: ["City: ", _jsx("span", { class: "font-mono bg-white p-1 rounded border", children: () => formatValue(selectedCity(), CITIES) })] })] })] }));
};
// #endregion
// #region Date Picker Example
const DatePickerMultiWheeler = () => {
    const selectedYear = $('2024');
    const selectedMonth = $('Jan');
    const selectedDay = $('15');
    const visible = $(true);
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Date Picker MultiWheeler" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "A date picker implementation using three wheels." }), _jsx(Button, { cls: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", onClick: () => visible(true), children: "Select Date" }), _jsx("div", { class: "my-4 w-full", children: _jsx(MultiWheeler, { options: [YEARS, MONTHS, DAYS], value: [selectedYear, selectedMonth, selectedDay], headers: [
                        () => _jsx("span", { class: "text-sm font-semibold", children: "Year" }),
                        () => _jsx("span", { class: "text-sm font-semibold", children: "Month" }),
                        () => _jsx("span", { class: "text-sm font-semibold", children: "Day" }),
                    ], visible: visible, bottom: false, mask: true, divider: true, title: _jsx("span", { class: "font-bold", children: "Select Date" }), itemCount: 5, cls: "w-full border border-gray-300 rounded-md overflow-auto" }) }), _jsx("div", { class: "mt-4 p-3 bg-gray-50 rounded", children: _jsxs("p", { class: "text-lg font-semibold", children: ["Selected Date: ", _jsx("span", { class: "font-mono bg-white p-2 rounded border", children: () => `${selectedMonth} ${selectedDay}, ${selectedYear}` })] }) })] }));
};
// #endregion
// #region MultiWheeler with Custom Item Count
const MultiWheelerCustomItemCount = () => {
    const selectedFruit = $('Date');
    const selectedColor = $('Orange');
    const visible = $(false);
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "MultiWheeler with Custom Item Count" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "Showing 7 visible items per wheel instead of default 5." }), _jsx(Button, { cls: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", onClick: () => visible(true), children: "Open Picker" }), _jsx("div", { class: "my-4 w-full", children: _jsx(MultiWheeler, { options: [FRUITS, COLORS], value: [selectedFruit, selectedColor], headers: [
                        () => _jsx("span", { class: "text-sm font-semibold", children: "Fruit" }),
                        () => _jsx("span", { class: "text-sm font-semibold", children: "Color" }),
                    ], visible: visible, bottom: true, mask: true, divider: true, title: _jsx("span", { class: "font-bold", children: "Large Picker" }), itemCount: 7 }) }), _jsxs("div", { class: "mt-4 p-3 bg-gray-50 rounded", children: [_jsxs("p", { children: ["Selected Fruit: ", _jsx("span", { class: "font-mono bg-white p-1 rounded border", children: () => selectedFruit() })] }), _jsxs("p", { class: "mt-2", children: ["Selected Color: ", _jsx("span", { class: "font-mono bg-white p-1 rounded border", children: () => selectedColor() })] })] })] }));
};
// #endregion
export { BasicMultiWheelerTwoColumns,
// BasicMultiWheelerThreeColumns,
// MultiWheelerWithJsonObjects,
// DatePickerMultiWheeler,
// MultiWheelerCustomItemCount
 };

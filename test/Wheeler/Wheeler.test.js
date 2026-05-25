import { jsx as _jsx, jsxs as _jsxs } from "woby/jsx-runtime";
import { $, $$, useMemo } from 'woby';
import { Wheeler } from '../../src/Wheeler/Wheeler';
import { useArrayOptions } from '../../src/Wheeler/WheelerType';
import countryOptions from '../../public/json/countries.json';
import Button from '../../src/Button';
// --- Reusable Data ---
const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew'];
const FLAVORS = ['Chocolate', 'Vanilla', 'Strawberry', 'Mint', 'Caramel', 'Coffee'];
const FRUITS_OPTION = useArrayOptions(FRUITS);
const FLAVORS_OPTION = useArrayOptions(FLAVORS);
// --- Data simulating a JSON import ---
const JSON_CAR_DATA = [
    { "label": "Toyota", "value": "TOYOTA" },
    { "label": "Honda", "value": "HONDA" },
    { "label": "Ford", "value": "FORD" },
    { "label": "Tesla", "value": "TESLA" },
    { "label": "Subaru", "value": "SUBARU" },
];
// #region Default Wheeler Examples
/**
 * Demonstrates using the Wheeler with an array of objects (like from a JSON file).
 * The options have distinct 'label' and 'value' properties.
 */
const WheelerWithJsonObjectArray = () => {
    const selectedCarId = $('FORD');
    const isVisible = $(true);
    // Create a reactive display value that updates automatically.
    const displayValue = useMemo(() => {
        return formatOptionDisplay($$(selectedCarId), JSON_CAR_DATA);
    });
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Wheeler with JSON Object Array" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "The `options` prop is populated from a JSON file containing objects with `label` and `value` keys." }), _jsx(Button, { onClick: () => (isVisible(true)), children: " Open Picker " }), _jsxs("p", { class: "my-4", children: ["Visible State: ", _jsx("span", { class: "bg-gray-100 p-1 rounded font-bold uppercase", children: () => isVisible.toString() })] }), () => isVisible() && (_jsx(Wheeler, { options: JSON_CAR_DATA, value: selectedCarId, bottom: true, visible: isVisible, cls: "border rounded-md shadow-sm w-64" })), _jsxs("p", { class: "mt-4", children: ["Current Selection: ", _jsx("span", { class: "font-mono bg-gray-100 p-1 rounded", children: displayValue })] })] }));
};
/**
 * Demonstrates using the Wheeler with a simple array of strings.
 * The component normalizes each string to have the same label and value.
 */
const WheelerWithSimpleArray = () => {
    const selectedFruit = $('Cherry');
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Wheeler with Simple String Array" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "The `options` prop is a plain array of strings." }), _jsx(Wheeler, { options: FRUITS, value: selectedFruit, cls: "border rounded-md shadow-sm w-64", bottom: false }), _jsxs("p", { class: "mt-4", children: ["Current Selection: ", _jsx("span", { class: "font-mono bg-gray-100 p-1 rounded", children: () => selectedFruit() })] })] }));
};
const WheelerWithCountryData = () => {
    const selectedCountryCode = $('JP');
    const displayValue = useMemo(() => {
        return formatOptionDisplay($$(selectedCountryCode), countryOptions);
    });
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Wheeler with Country Data (from JSON)" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "Demonstrates using a different set of JSON data." }), _jsx(Wheeler, { options: countryOptions, value: selectedCountryCode, bottom: false, cls: "border rounded-md shadow-sm w-64" }), _jsxs("p", { class: "mt-4", children: ["Current Selection: ", _jsx("span", { class: "font-mono bg-gray-100 p-1 rounded", children: displayValue })] })] }));
};
// #endregion
// #region Checkbox Wheeler
const CheckboxWheelerWithJsonObjectArray = () => {
    const selectedValue = $(['TOYOTA', 'SUBARU']);
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Multi-Select Wheeler (CAR)" }), _jsx(Wheeler, { options: JSON_CAR_DATA, value: selectedValue, all: "All Cars" // This prop enables multi-select mode
                , bottom: false, cls: "border rounded-md shadow-sm w-64 overflow-y-auto", itemCount: 4 }), _jsxs("p", { class: "mt-4", children: ["Selected Cars: ", _jsx("span", { class: "font-mono bg-gray-100 p-1 rounded", children: () => JSON.stringify($$(selectedValue)) })] })] }));
};
const CheckboxWheelerWithSimpleArrayFruit = () => {
    const selectedValue = $(['Banana', 'Cherry']);
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Multi-Select Wheeler (Fruits)" }), _jsx(Wheeler, { options: FRUITS, value: selectedValue, all: "All Fruits" // This prop enables multi-select mode
                , bottom: false, cls: "border rounded-md shadow-sm w-64 h-64 overflow-y-auto", itemCount: 7 }), _jsxs("p", { class: "mt-4", children: ["Selected Fruit(s): ", _jsx("span", { class: "font-mono bg-gray-100 p-1 rounded", children: () => JSON.stringify($$(selectedValue)) })] })] }));
};
const CheckboxWheelerWithSimpleArrayFlavors = () => {
    const selectedValue = $([]);
    const defaultValue = $(["Vanilla", "Strawberry"]);
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Multi-Select Wheeler (Flavors)" }), _jsxs("p", { class: "my-4", children: ["Default Flavor(s): ", _jsx("span", { class: "font-mono bg-gray-100 p-1 rounded", children: () => JSON.stringify($$(defaultValue)) })] }), _jsx(Wheeler, { options: FLAVORS, value: selectedValue, all: "All Flavors" // This prop enables multi-select mode
                , bottom: false, cls: "border rounded-md shadow-sm w-64 h-64 overflow-y-auto", itemCount: 7 }), _jsxs("p", { class: "mt-4", children: ["Selected Flavor(s): ", _jsx("span", { class: "font-mono bg-gray-100 p-1 rounded", children: () => JSON.stringify($$(selectedValue)) })] })] }));
};
const CheckboxWheelerWithCountryData = () => {
    const selectedValue = $(['JP']);
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Multi-Select Wheeler with Country Data (from JSON)" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "Demonstrates using a different set of JSON data." }), _jsx(Wheeler, { options: countryOptions, value: selectedValue, all: "All Countries" // This prop enables multi-select mode
                , bottom: false, cls: "border rounded-md shadow-sm w-64", itemCount: 5 }), _jsxs("p", { class: "mt-4", children: ["Selected Flavor(s): ", _jsx("span", { class: "font-mono bg-gray-100 p-1 rounded", children: () => JSON.stringify($$(selectedValue)) })] })] }));
};
// #endregion
// #region Controlled Wheeler
const ControlledWheelerWithJsonObjectArray = () => {
    const selectedValue = $('FORD');
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Controlled Wheeler - Json Object Array" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "Change the value programmatically." }), _jsx(Wheeler, { options: JSON_CAR_DATA, value: selectedValue, bottom: false, cls: "border rounded-md shadow-sm w-64" }), _jsxs("div", { class: "mt-4", children: [_jsxs("p", { children: ["Selected Fruit: ", _jsx("span", { class: "font-mono bg-gray-100 p-1 rounded", children: selectedValue })] }), _jsxs("div", { class: "mt-2 space-x-2", children: [_jsx("button", { class: "px-2 py-1 border rounded bg-gray-200", onClick: () => selectedValue('TOYOTA'), children: "Select TOYOTA" }), _jsx("button", { class: "px-2 py-1 border rounded bg-gray-200", onClick: () => selectedValue('SUBARU'), children: "Select SUBARU" })] })] })] }));
};
const ControlledWheelerWithSimpleArray = () => {
    const selectedFruit = $('Banana');
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Controlled Wheeler - Simple Array" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "Change the value programmatically." }), _jsx(Wheeler, { options: FRUITS, value: selectedFruit, bottom: false, cls: "border rounded-md shadow-sm w-64" }), _jsxs("div", { class: "mt-4", children: [_jsxs("p", { children: ["Selected Fruit: ", _jsx("span", { class: "font-mono bg-gray-100 p-1 rounded", children: () => selectedFruit() })] }), _jsxs("div", { class: "mt-2 space-x-2", children: [_jsx("button", { class: "px-2 py-1 border rounded bg-gray-200", onClick: () => selectedFruit('Fig'), children: "Select Fig" }), _jsx("button", { class: "px-2 py-1 border rounded bg-gray-200", onClick: () => selectedFruit('Apple'), children: "Select Apple" })] })] })] }));
};
const ControlledWheelerWithCountryData = () => {
    const selectedValue = $('JP');
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Controlled Single-Select" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "Change the value programmatically." }), _jsx(Wheeler, { options: countryOptions, value: selectedValue, bottom: false, cls: "border rounded-md shadow-sm w-64" }), _jsxs("div", { class: "mt-4", children: [_jsxs("p", { children: ["Selected Fruit: ", _jsx("span", { class: "font-mono bg-gray-100 p-1 rounded", children: selectedValue })] }), _jsxs("div", { class: "mt-2 space-x-2", children: [_jsx("button", { class: "px-2 py-1 border rounded bg-gray-200", onClick: () => selectedValue('US'), children: "Select United States" }), _jsx("button", { class: "px-2 py-1 border rounded bg-gray-200", onClick: () => selectedValue('CA'), children: "Select Canada" })] })] })] }));
};
// #endregion
// #region Header Wheeler
const HeaderWheelerWithJsonObjectArray = () => {
    const selectedCarId = $('FORD');
    // Create a reactive display value that updates automatically.
    const displayValue = useMemo(() => {
        return formatOptionDisplay($$(selectedCarId), JSON_CAR_DATA);
    });
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Wheeler with JSON Object Array" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "The `options` prop is populated from a JSON file containing objects with `label` and `value` keys." }), _jsx(Wheeler, { options: JSON_CAR_DATA, value: selectedCarId, header: () => 'Car Picker', searchable: false, bottom: false, cls: "border rounded-md shadow-sm w-64" }), _jsxs("p", { class: "mt-4", children: ["Current Selection: ", _jsx("span", { class: "font-mono bg-gray-100 p-1 rounded", children: displayValue })] })] }));
};
// #endregion
// #region Searchable Wheeler
const SearchWheelerWithJsonObjectArray = () => {
    const selectedCarId = $('FORD');
    // Create a reactive display value that updates automatically.
    const displayValue = useMemo(() => {
        return formatOptionDisplay($$(selectedCarId), JSON_CAR_DATA);
    });
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Wheeler with JSON Object Array" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "The `options` prop is populated from a JSON file containing objects with `label` and `value` keys." }), _jsx(Wheeler, { options: JSON_CAR_DATA, value: selectedCarId, bottom: false, cls: "border rounded-md shadow-sm w-64", searchable: true, header: () => 'Car Picker' }), _jsxs("p", { class: "mt-4", children: ["Current Selection: ", _jsx("span", { class: "font-mono bg-gray-100 p-1 rounded", children: displayValue })] })] }));
};
const SearchWheelerWithSimpleArray = () => {
    const selectedFruit = $('Cherry');
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Wheeler with Simple String Array" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "The `options` prop is a plain array of strings." }), _jsx(Wheeler, { options: FRUITS, value: selectedFruit, cls: "border rounded-md shadow-sm w-64", bottom: false, searchable: true, searchPlaceholder: "Search for a fruit", header: () => 'Fruit Picker' }), _jsxs("p", { class: "mt-4", children: ["Current Selection: ", _jsx("span", { class: "font-mono bg-gray-100 p-1 rounded", children: () => selectedFruit() })] })] }));
};
const SearchWheelerWithCountryData = () => {
    const selectedCountryCode = $('JP');
    const displayValue = useMemo(() => {
        return formatOptionDisplay($$(selectedCountryCode), countryOptions);
    });
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Wheeler with Country Data (from JSON)" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "Demonstrates using a different set of JSON data." }), _jsx(Wheeler, { options: countryOptions, value: selectedCountryCode, bottom: false, cls: "border rounded-md shadow-sm w-64", searchable: true }), _jsxs("p", { class: "mt-4", children: ["Current Selection: ", _jsx("span", { class: "font-mono bg-gray-100 p-1 rounded", children: displayValue })] })] }));
};
// #endregion
// #region Helper Function
/**
 * A helper to find an option in a JSON array and format it for display.
 * @param value The value to search for.
 * @param options The array of option objects to search within.
 * @returns A formatted string "Label (Value)" or the original value if not found.
 */
function formatOptionDisplay(value, options) {
    // Ensure options is an array before searching
    if (!Array.isArray(options))
        return String(value);
    const option = options.find(opt => opt.value === value);
    return option ? `${option.label} (${option.value})` : String(value);
}
function getOptionInfo(optionValue, jsonData) {
    const option = jsonData.find(opt => opt.value === optionValue);
    return option ? `${option.label} (${option.value})` : optionValue;
}
// #endregion
export { WheelerWithJsonObjectArray, WheelerWithSimpleArray, WheelerWithCountryData, CheckboxWheelerWithJsonObjectArray, CheckboxWheelerWithSimpleArrayFruit, CheckboxWheelerWithSimpleArrayFlavors, CheckboxWheelerWithCountryData, ControlledWheelerWithJsonObjectArray, ControlledWheelerWithSimpleArray, ControlledWheelerWithCountryData, HeaderWheelerWithJsonObjectArray, SearchWheelerWithJsonObjectArray, SearchWheelerWithSimpleArray, SearchWheelerWithCountryData, };

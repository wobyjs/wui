import { jsx as _jsx, jsxs as _jsxs } from "woby/jsx-runtime";
/* @jsxImportSource woby */
import { $, $$ } from 'woby';
import { Button } from '../../src/Button';
import { DateTimeWheeler } from '../../src/Wheeler/DateTimeWheeler';
// Helper functions to format date based on Wheeler type
const formatDateTime = (date) => {
    return date.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
};
const formatDateOnly = (date) => {
    return date.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};
const formatTimeOnly = (date) => {
    return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
};
// #region Reusable Data
// --- Reusable Data ---
const CURRENT_DATE = new Date();
const MIN_DATE = new Date(2020, 0, 1); // January 1, 2020
const MAX_DATE = new Date(2030, 11, 31); // December 31, 2030
// #endregion
// #region Basic DateTimeWheeler Examples
/**
 * Demonstrates basic DateTimeWheeler with default datetime mode
 */
const BasicDateTimeWheeler = () => {
    const selectedDate = $(new Date(2024, 5, 15, 14, 30, 45)); // June 15, 2024, 2:30:45 PM
    const visible = $(false);
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Basic DateTimeWheeler - DateTime Mode" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "Default DateTimeWheeler showing year, month, day, hour, minute, and second wheels." }), _jsx(Button, { cls: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", onClick: () => visible(true), children: "Open DateTime Picker" }), _jsx("div", { class: "my-4 w-full", children: _jsx(DateTimeWheeler, { value: selectedDate, visible: visible, bottom: false, title: (d) => "Select Date & Time", cls: "w-full border border-gray-300 rounded-md overflow-auto" }) }), _jsx("div", { class: "mt-4 p-3 bg-gray-50 rounded", children: _jsxs("p", { children: ["Selected Date: ", _jsx("span", { class: "font-mono bg-white p-1 rounded border", children: () => formatDateTime($$(selectedDate)) })] }) })] }));
};
/**
 * Demonstrates DateTimeWheeler with date mode (year, month, day only)
 */
const DateOnlyWheeler = () => {
    const selectedDate = $(new Date(2024, 11, 25)); // December 25, 2024
    const visible = $(false);
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "DateTimeWheeler - Date Mode" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "DateTimeWheeler showing only year, month, and day wheels." }), _jsx(Button, { cls: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", onClick: () => visible(true), children: "Open Date Picker" }), _jsx(DateTimeWheeler, { value: selectedDate, mode: "date", visible: visible, bottom: true, mask: true, divider: true, title: (d) => "Select Date" }), _jsx("div", { class: "mt-4 p-3 bg-gray-50 rounded", children: _jsxs("p", { children: ["Selected Date: ", _jsx("span", { class: "font-mono bg-white p-1 rounded border", children: () => formatDateOnly($$(selectedDate)) })] }) })] }));
};
/**
 * Demonstrates DateTimeWheeler with time mode (hour, minute, second only)
 */
const TimeOnlyWheeler = () => {
    const selectedTime = $(new Date(2024, 0, 1, 9, 30, 15)); // 9:30:15 AM
    const visible = $(false);
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "DateTimeWheeler - Time Mode" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "DateTimeWheeler showing only hour, minute, and second wheels." }), _jsx(Button, { cls: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", onClick: () => visible(true), children: "Open Time Picker" }), _jsx(DateTimeWheeler, { value: selectedTime, mode: "time", visible: visible, bottom: true, mask: true, divider: true, title: (d) => "Select Time" }), _jsx("div", { class: "mt-4 p-3 bg-gray-50 rounded", children: _jsxs("p", { children: ["Selected Time: ", _jsx("span", { class: "font-mono bg-white p-1 rounded border", children: () => formatTimeOnly($$(selectedTime)) })] }) })] }));
};
// #endregion
// #region DateTimeWheeler with Constraints
/**
 * Demonstrates DateTimeWheeler with minDate and maxDate constraints
 */
const ConstrainedDateTimeWheeler = () => {
    const selectedDate = $(new Date(2024, 5, 15)); // June 15, 2024
    const minDate = $(MIN_DATE);
    const maxDate = $(MAX_DATE);
    const visible = $(false);
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "Constrained DateTimeWheeler" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "DateTimeWheeler with minDate and maxDate constraints." }), _jsx(Button, { cls: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", onClick: () => visible(true), children: "Open Constrained Picker" }), _jsx("div", { class: "my-4 w-full", children: _jsx(DateTimeWheeler, { value: selectedDate, mode: "date", minDate: minDate, maxDate: maxDate, visible: visible, bottom: false, mask: true, divider: true, title: (d) => "Select Date (2020-2030)", cls: "w-full border border-gray-300 rounded-md overflow-auto" }) }), _jsxs("div", { class: "mt-4 p-3 bg-gray-50 rounded", children: [_jsxs("p", { children: ["Selected Date: ", _jsx("span", { class: "font-mono bg-white p-1 rounded border", children: () => formatDateOnly($$(selectedDate)) })] }), _jsxs("p", { class: "mt-2", children: ["Min Date: ", _jsx("span", { class: "font-mono bg-white p-1 rounded border", children: () => formatDateOnly($$(minDate)) })] }), _jsxs("p", { class: "mt-2", children: ["Max Date: ", _jsx("span", { class: "font-mono bg-white p-1 rounded border", children: () => formatDateOnly($$(maxDate)) })] })] })] }));
};
// #endregion
// #region DateTimeWheeler with Custom Year Range
/**
 * Demonstrates DateTimeWheeler with custom year range
 */
const CustomYearRangeWheeler = () => {
    const selectedDate = $(new Date(2025, 5, 15)); // June 15, 2025
    // const yearRange = $({ start: 2020, end: 2025 })
    const visible = $(false);
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "DateTimeWheeler - Custom Year Range" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "DateTimeWheeler with custom year range (2020-2025)." }), _jsx(Button, { cls: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", onClick: () => visible(true), children: "Open Custom Range Picker" }), _jsx("div", { class: "my-4 w-full", children: _jsx(DateTimeWheeler, { value: selectedDate, mode: "date", minDate: new Date(2020, 0, 1), maxDate: new Date(2025, 11, 31), visible: visible, bottom: false, mask: false, divider: true, title: (d) => "Select Date (2020-2025)", cls: "w-full border border-gray-300 rounded-md overflow-auto" }) }), _jsxs("div", { class: "mt-4 p-3 bg-gray-50 rounded", children: [_jsxs("p", { children: ["Selected Date: ", _jsx("span", { class: "font-mono bg-white p-1 rounded border", children: () => formatDateOnly($$(selectedDate)) })] }), _jsxs("p", { class: "mt-2", children: ["Year Range: ", _jsx("span", { class: "font-mono bg-white p-1 rounded border", children: "2020 - 2025" })] })] })] }));
};
// #endregion
// #region DateTimeWheeler with Custom Item Count
/**
 * Demonstrates DateTimeWheeler with custom item count
 */
const CustomItemCountWheeler = () => {
    const selectedDate = $(new Date(2024, 5, 15, 14, 30)); // June 15, 2024, 2:30 PM
    const visible = $(false);
    return (_jsxs("div", { class: "p-4", children: [_jsx("h3", { class: "font-bold mb-2", children: "DateTimeWheeler - Custom Item Count" }), _jsx("p", { class: "text-sm text-gray-600 mb-2", children: "DateTimeWheeler showing 7 visible items per wheel instead of default 5. Click button to toggle visibility." }), _jsx(Button, { cls: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", onClick: () => visible(!$$(visible)), children: "Open/Close Large Picker" }), _jsx("div", { class: "my-4 w-full", children: _jsx(DateTimeWheeler, { value: selectedDate, mode: "datetime", visible: visible, bottom: true, mask: true, divider: true, title: () => "Select Date & Time", itemCount: 7 }) }), _jsx("div", { class: "mt-4 p-3 bg-gray-50 rounded", children: _jsxs("p", { children: ["Selected Date: ", _jsx("span", { class: "font-mono bg-white p-1 rounded border", children: () => formatDateTime($$(selectedDate)) })] }) })] }));
};
// #endregion
export { BasicDateTimeWheeler, DateOnlyWheeler, TimeOnlyWheeler, ConstrainedDateTimeWheeler, CustomYearRangeWheeler, CustomItemCountWheeler };

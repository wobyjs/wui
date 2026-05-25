import { jsx as _jsx, jsxs as _jsxs } from "woby/jsx-runtime";
/* @jsxImportSource woby */
import { Paper } from '../src/Paper'; // Adjust this path to your Paper component
//#region Default Paper
/**
 * Renders the default Paper component.
 * It should default to elevation={1}.
 */
const DefaultPaper = () => {
    return (_jsxs(Paper, { cls: "p-4", children: [_jsx("h3", { class: "font-bold", children: "Default Paper" }), _jsx("p", { class: "text-sm", children: "This should have elevation 1 shadow." })] }));
};
//#endregion
//#region No Elevation Paper
/**
 * Renders a Paper component with no shadow.
 */
const NoElevationPaper = () => {
    return (_jsxs(Paper, { elevation: 0, cls: "p-4", children: [_jsxs("h3", { class: "font-bold", children: ["No Elevation (elevation=", 0, ")"] }), _jsx("p", { class: "text-sm", children: "This should have no shadow." })] }));
};
//#endregion
//#region High Elevation Paper
/**
 * Renders a Paper component with a high elevation level.
 */
const HighElevationPaper = () => {
    return (_jsxs(Paper, { elevation: 16, cls: "p-4", children: [_jsxs("h3", { class: "font-bold", children: ["High Elevation (elevation=", 16, ")"] }), _jsx("p", { class: "text-sm", children: "This should have a very prominent shadow." })] }));
};
//#endregion
//#region Custom Styled Paper
/**
 * Demonstrates how to add custom classes to the Paper component.
 * The custom classes should merge with the elevation style.
 */
const CustomStyledPaper = () => {
    return (_jsxs(Paper, { elevation: 4, cls: "p-6 !bg-yellow-50 !border-2 !border-yellow-200", children: [_jsx("h3", { class: "font-bold text-yellow-800", children: "Custom Styled Paper" }), _jsx("p", { class: "text-sm", children: "This has elevation 4 plus a custom background and border." })] }));
};
//#endregion
// Export all test components
export { DefaultPaper, NoElevationPaper, HighElevationPaper, CustomStyledPaper, };

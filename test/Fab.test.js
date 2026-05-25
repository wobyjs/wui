import { jsx as _jsx } from "woby/jsx-runtime";
/* @jsxImportSource woby */
import { Fab } from '../src/Fab'; // Adjust path to your Fab component
/**
 * Renders the default Fab component.
 * It should default to the 'pill' variant.
 */
const DefaultFab = () => {
    return _jsx(Fab, { children: "Default FAB" });
};
/**
 * Renders the circular variant of the Fab component.
 * This is typically used for a single icon.
 */
const CircularFab = () => {
    return _jsx(Fab, { type: "circular", children: "\u2764\uFE0F" });
};
/**
 * Renders the pill-shaped (extended) variant of the Fab component.
 * This is the default and is designed to hold both an icon and text.
 */
const PillFab = () => {
    return _jsx(Fab, { type: "pill", children: "\u2795 Add Item" });
};
/**
 * Renders a disabled Fab component.
 * It should not be clickable and may have a different visual appearance.
 */
const DisabledFab = () => {
    return _jsx(Fab, { disabled: true, children: "Disabled" });
};
/**
 * Demonstrates how to customize the Fab component using the `cls` prop.
 * This example overrides the background color and text color of a circular FAB.
 */
const CustomFab = () => {
    return (_jsx(Fab, { type: "circular", cls: "!bg-green-500 !text-white", children: "\uD83D\uDC4D" }));
};
/**
 * Demonstrates a more complex customization of the pill-shaped FAB.
 * This example changes padding, border, and hover effects.
 */
const CustomPillFab = () => {
    return (_jsx(Fab, { type: "pill", cls: "!px-8 !py-4 !bg-purple-600 !rounded-full !shadow-lg hover:!bg-purple-700", children: "Custom Pill" }));
};
/**
 * Renders a Fab with an onClick handler to test interactivity.
 */
const ClickableFab = () => {
    return (_jsx(Fab, { type: "circular", onClick: () => alert('FAB Clicked!'), children: "\uD83D\uDD14" }));
};
// Export all test components
export { DefaultFab, CircularFab, PillFab, DisabledFab, CustomFab, CustomPillFab, ClickableFab };

/**
 * Renders the default Fab component.
 * It should default to the 'pill' variant.
 */
declare const DefaultFab: () => import("woby").Child;
/**
 * Renders the circular variant of the Fab component.
 * This is typically used for a single icon.
 */
declare const CircularFab: () => import("woby").Child;
/**
 * Renders the pill-shaped (extended) variant of the Fab component.
 * This is the default and is designed to hold both an icon and text.
 */
declare const PillFab: () => import("woby").Child;
/**
 * Renders a disabled Fab component.
 * It should not be clickable and may have a different visual appearance.
 */
declare const DisabledFab: () => import("woby").Child;
/**
 * Demonstrates how to customize the Fab component using the `cls` prop.
 * This example overrides the background color and text color of a circular FAB.
 */
declare const CustomFab: () => import("woby").Child;
/**
 * Demonstrates a more complex customization of the pill-shaped FAB.
 * This example changes padding, border, and hover effects.
 */
declare const CustomPillFab: () => import("woby").Child;
/**
 * Renders a Fab with an onClick handler to test interactivity.
 */
declare const ClickableFab: () => import("woby").Child;
export { DefaultFab, CircularFab, PillFab, DisabledFab, CustomFab, CustomPillFab, ClickableFab };

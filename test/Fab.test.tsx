/* @jsxImportSource woby */
import { Fab } from '../src/Fab' // Adjust path to your Fab component

/**
 * Renders the default Fab component.
 * It should default to the 'pill' variant.
 */
const DefaultFab = () => {
    return <Fab>Default FAB</Fab>
}

/**
 * Renders the circular variant of the Fab component.
 * This is typically used for a single icon.
 */
const CircularFab = () => {
    return <Fab type="circular">❤️</Fab>
}

/**
 * Renders the pill-shaped (extended) variant of the Fab component.
 * This is the default and is designed to hold both an icon and text.
 */
const PillFab = () => {
    return <Fab type="pill">➕ Add Item</Fab>
}

/**
 * Renders a disabled Fab component.
 * It should not be clickable and may have a different visual appearance.
 */
const DisabledFab = () => {
    return <Fab disabled>Disabled</Fab>
}

/**
 * Demonstrates how to customize the Fab component using the `cls` prop.
 * This example overrides the background color and text color of a circular FAB.
 */
const CustomFab = () => {
    return (
        <Fab type="circular" cls="!bg-green-500 !text-white">
            👍
        </Fab>
    )
}

/**
 * Demonstrates a more complex customization of the pill-shaped FAB.
 * This example changes padding, border, and hover effects.
 */
const CustomPillFab = () => {
    return (
        <Fab
            type="pill"
            cls="!px-8 !py-4 !bg-purple-600 !rounded-full !shadow-lg hover:!bg-purple-700"
        >
            Custom Pill
        </Fab>
    )
}

/**
 * Renders a Fab with an onClick handler to test interactivity.
 */
const ClickableFab = () => {
    return (
        <Fab type="circular" onClick={() => alert('FAB Clicked!')}>
            🔔
        </Fab>
    )
}


// Export all test components
export {
    DefaultFab,
    CircularFab,
    PillFab,
    DisabledFab,
    CustomFab,
    CustomPillFab,
    ClickableFab
}
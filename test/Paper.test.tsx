/* @jsxImportSource woby */
import { Paper } from '../src/Paper' // Adjust this path to your Paper component


//#region Default Paper
/**
 * Renders the default Paper component.
 * It should default to elevation={1}.
 */
const DefaultPaper = () => {
    return (
        <Paper cls="p-4">
            <h3 class="font-bold">Default Paper</h3>
            <p class="text-sm">This should have elevation 1 shadow.</p>
        </Paper>
    )
}
//#endregion


//#region No Elevation Paper
/**
 * Renders a Paper component with no shadow.
 */
const NoElevationPaper = () => {
    return (
        <Paper elevation={0} cls="p-4">
            <h3 class="font-bold">No Elevation (elevation={0})</h3>
            <p class="text-sm">This should have no shadow.</p>
        </Paper>
    )
}
//#endregion


//#region High Elevation Paper
/**
 * Renders a Paper component with a high elevation level.
 */
const HighElevationPaper = () => {
    return (
        <Paper elevation={16} cls="p-4">
            <h3 class="font-bold">High Elevation (elevation={16})</h3>
            <p class="text-sm">This should have a very prominent shadow.</p>
        </Paper>
    )
}
//#endregion


//#region Custom Styled Paper
/**
 * Demonstrates how to add custom classes to the Paper component.
 * The custom classes should merge with the elevation style.
 */
const CustomStyledPaper = () => {
    return (
        <Paper elevation={4} cls="p-6 !bg-yellow-50 !border-2 !border-yellow-200">
            <h3 class="font-bold text-yellow-800">Custom Styled Paper</h3>
            <p class="text-sm">This has elevation 4 plus a custom background and border.</p>
        </Paper>
    )
}
//#endregion


// Export all test components
export {
    DefaultPaper,
    NoElevationPaper,
    HighElevationPaper,
    CustomStyledPaper,
}
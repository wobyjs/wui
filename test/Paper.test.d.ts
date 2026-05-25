/**
 * Renders the default Paper component.
 * It should default to elevation={1}.
 */
declare const DefaultPaper: () => import("woby").Child;
/**
 * Renders a Paper component with no shadow.
 */
declare const NoElevationPaper: () => import("woby").Child;
/**
 * Renders a Paper component with a high elevation level.
 */
declare const HighElevationPaper: () => import("woby").Child;
/**
 * Demonstrates how to add custom classes to the Paper component.
 * The custom classes should merge with the elevation style.
 */
declare const CustomStyledPaper: () => import("woby").Child;
export { DefaultPaper, NoElevationPaper, HighElevationPaper, CustomStyledPaper, };

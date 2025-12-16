/* @jsxImportSource woby */
import { $, $$ } from 'woby'
import { SideBar, MenuItem, MenuText } from '../src/SideBar' // Adjust path to your SideBar component
import { Button } from '../src/Button' // Assuming Button component is available


/**
 * A simple SVG icon for menu items.
 */
// const HomeIcon = () => (
//     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
//     </svg>
// )

//#region Basic Sidebar
/**
 * The main interactive demo for the SideBar.
 * Demonstrates opening, closing, pushing content, and using MenuItems.
 */
const BasicSidebar = () => {
    const open = $(false)
    const contentRef = $<HTMLDivElement>() // Ref for the main content area

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Basic Interactive Sidebar</h3>
            <p class="text-sm text-gray-600 mb-4">
                Click the button to open the sidebar. The main content will be pushed to the right.
                Click the dark overlay to close it.
            </p>

            {/* The SideBar component itself. It's a portal, so it renders outside this div. */}
            <SideBar open={open} contentRef={contentRef}>
                <div class="p-4">
                    <h2 class="text-xl font-bold mb-4">Menu</h2>
                    <nav>
                        <MenuItem href="#">
                            <svg class="w-6 h-6 text-white fill-current stroke-current" viewBox="0 0 24 24">
                                <use href="/svg/home-icon.svg#icon" />
                            </svg>
                            <MenuText>Dashboard</MenuText>
                        </MenuItem>
                        <MenuItem href="#">
                            <MenuText>Profile</MenuText>
                        </MenuItem>
                        <MenuItem href="#">
                            <MenuText>Settings</MenuText>
                        </MenuItem>
                    </nav>
                </div>
            </SideBar>

            {/* This is the main content area that will be pushed by the sidebar */}
            <div ref={contentRef} id="main-content">
                <Button onClick={() => open(true)}>
                    Open Sidebar
                </Button>
                <div class="mt-4 p-4 border rounded-lg bg-gray-50">
                    <h4 class="font-semibold">Main Content Area</h4>
                    <p class="mt-2 text-sm">This is the main content of your page. When the sidebar opens, this entire section will slide to the right.</p>
                </div>
            </div>
        </div>
    )
}
//#endregion


//#region Custom Width Sidebar
/**
 * Demonstrates a sidebar with a custom width.
 */
const CustomWidthSidebar = () => {
    const open = $(false)
    const contentRef = $<HTMLDivElement>()

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Custom Width Sidebar</h3>
            <p class="text-sm text-gray-600 mb-4">
                This sidebar is set to have a width of "400px".
            </p>

            <SideBar open={open} contentRef={contentRef} width="400px">
                <div class="p-4"><h2 class="text-xl font-bold">Wide Menu</h2></div>
            </SideBar>

            <div ref={contentRef}>
                <Button onClick={() => open(true)}>
                    Open Wide Sidebar
                </Button>
                <div class="mt-4 p-4 border rounded-lg bg-gray-50">
                    <p class="text-sm">This content will be pushed by 400px.</p>
                </div>
            </div>
        </div>
    )
}
//#endregion


//#region No Overlay Sidebar
/**
 * Demonstrates a sidebar without the background overlay.
 */
const NoOverlaySidebar = () => {
    const open = $(false)
    const contentRef = $<HTMLDivElement>()

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Sidebar Without Overlay</h3>
            <p class="text-sm text-gray-600 mb-4">
                Using `showOverlay={false}`. You must use a button to close it.
            </p>

            <SideBar open={open} contentRef={contentRef} showOverlay={false}>
                <div class="p-4">
                    <h2 class="text-xl font-bold mb-2">No Overlay</h2>
                    <Button onClick={() => open(false)}>Close Me</Button>
                </div>
            </SideBar>

            <div ref={contentRef}>
                <Button onClick={() => open(true)}>
                    Open Sidebar (No Overlay)
                </Button>
                <div class="mt-4 p-4 border rounded-lg bg-gray-50">
                    <p class="text-sm">The content is still pushed, but no dark overlay appears.</p>
                </div>
            </div>
        </div>
    )
}
//#endregion


//#region Custom Styled Sidebar
/**
 * Demonstrates a sidebar with custom styling.
 */
const CustomStyledSidebar = () => {
    const open = $(false)
    const contentRef = $<HTMLDivElement>()

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Custom Styled Sidebar</h3>
            <p class="text-sm text-gray-600 mb-4">
                Using the `cls` prop to change the background and add a border.
            </p>

            <SideBar open={open} contentRef={contentRef} cls="!bg-indigo-900 border-r-4 border-indigo-500">
                <div class="p-4">
                    <h2 class="text-xl font-bold text-indigo-200">Indigo Sidebar</h2>
                </div>
            </SideBar>

            <div ref={contentRef}>
                <Button onClick={() => open(true)}>
                    Open Custom Sidebar
                </Button>
                <div class="mt-4 p-4 border rounded-lg bg-gray-50">
                    <p class="text-sm">Main content area.</p>
                </div>
            </div>
        </div>
    )
}
//#endregion


export {
    BasicSidebar,
    CustomWidthSidebar,
    NoOverlaySidebar,
    CustomStyledSidebar,
}
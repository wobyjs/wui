import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlNumber, HtmlString, ObservableMaybe, Portal, useEffect, useMemo, isObservable } from "woby"


// #region Sidebar Component
const sideBarDef = () => ({
    /** Custom CSS classes to apply to the sidebar container. */
    cls: $(""),
    /** The content to be rendered inside the sidebar. */
    children: $(null) as ObservableMaybe<JSX.Element>,
    /** A boolean observable to control whether the sidebar is open or closed. */
    open: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
    /** An observable reference to the main content element that the sidebar will push aside. */
    contentRef: $(null as HTMLElement | null),
    /** The width of the sidebar when it is open (e.g., '250px' or 250). */
    width: $('250px', HtmlString) as ObservableMaybe<string | number>,
    /** When true, a dark overlay will appear over the main content, which closes the sidebar on click. */
    showOverlay: $(true, HtmlBoolean) as ObservableMaybe<boolean>,
})

const SideBar = defaults(sideBarDef, (props) => {
    const { cls, children, open, contentRef, width, showOverlay, ...otherProps } = props

    const BASE_CLASS = "fixed h-full top-0 left-0 z-[1000] overflow-x-hidden transition-all duration-500 ease-in-out"

    const sidebarWidth = useMemo(() => {
        if (!$$(open)) return '0px'

        const w = $$(width)

        return typeof w === 'number' ? `${w}px` : w
    })

    /**
     * This `useEffect` hook is responsible for creating the "content push" animation.
     * Its job is to synchronize the `margin-left` style of an external content element
     * with the current calculated width of the sidebar.
     * 
     * It runs after every render to ensure the layout is always in sync with the sidebar's state (open or closed).
     */
    // #region Content Push Animation
    useEffect(() => {

        // 1. Get the actual HTML element from the `contentRef` prop.
        // The user of the component provides this ref, pointing to their main page content.
        const contentEl = $$(contentRef)

        // 2. Guard Clause: If no content element is provided, we can't do anything.
        // This prevents errors if `contentRef` is null or hasn't been attached yet.
        if (!contentEl) return

        // 3. Apply the Sidebar's Width as a Margin.
        // `sidebarWidth` is a memoized value that reactively changes between '0px' (when closed)
        // and the full width (e.g., '250px') when open. By setting `marginLeft`, we "push"
        // the content element to the right to make space for the sidebar.
        contentEl.style.marginLeft = $$(sidebarWidth)

        // 4. Ensure a Smooth Animation.
        // This line applies a CSS transition to the `marginLeft` property.
        // It tells the browser to animate any changes to the margin over 0.5 seconds,
        // creating a smooth sliding effect instead of an instant jump.
        contentEl.style.transition = 'margin-left 0.5s ease'
    })
    // #endregion



    /**
     * WHY A PORTAL?
     * This `<div>` is the visual sidebar. By rendering it in a Portal mounted to `document.body`,
     * we "teleport" it out of its original place in the component tree and attach it as a
     * direct child of the `<body>`.
     *
     * BENEFITS:
     * 1. Stacking Context: It now lives at the top level of the DOM, which means its `z-index` 
     *    (z-[1000]) will reliably place it on top of *everything* else on the page. We don't have
     *    to worry about a parent `div` somewhere else having a weird `transform` or `z-index`
     *    that could hide our sidebar.
     * 2. Positioning: Its `position: fixed` works relative to the browser viewport, which is exactly
     *    what we want for a sidebar that sticks to the edge of the screen.
    */
    // #region Sidebar Component
    const SidebarComponent = () => {
        return (
            <div
                class={[BASE_CLASS, cls]}
                style={{ width: sidebarWidth }}
                {...otherProps}
            >
                <slot>{children}</slot>
            </div>
        )
    }

    const BackgroundOverlay = () => {
        {/*
            * WHY A SEPARATE PORTAL?
            * This `<div>` is the dark, semi-transparent overlay that covers the main content.
            * It also needs to be at the top level of the DOM for the same reasons as the sidebar.
            *
            * WHY NOT IN THE SAME PORTAL AS THE SIDEBAR?
            * Because they have different `z-index` values.
            *   - The Overlay has `z-[999]`.
            *   - The Sidebar has `z-[1000]`.
            * This ensures the sidebar menu (`z-1000`) always appears *on top of* the overlay (`z-999`).
            * If they were siblings inside the same parent `div`, managing their stacking order
            * would be more complex and less reliable. Using two separate Portals keeps their
            * stacking contexts clean and independent.
        */}
        return <>
            {/* <Portal mount={document.body}> */}
            {
                () => $$(showOverlay) && $$(open) && (
                    <div
                        class="fixed inset-0 bg-black/50 z-[999] transition-opacity duration-500"
                        onClick={() => isObservable(open) && open(false)}
                    />)
            }
            {/* </Portal> */}
        </>
    }
    // #endregion

    return <>
        {/* ===== PORTAL 1: The Sidebar Itself ===== */}
        <SidebarComponent />
        {/* ===== PORTAL 2: The Background Overlay ===== */}
        <BackgroundOverlay />
    </>
}) as typeof SideBar
// #endregion


// #region Menu Item Component
const menuItemDef = () => ({
    cls: $(""),
    children: $(null as JSX.Child),
})


const MenuItem = defaults(menuItemDef, (props) => {
    const { cls, children, ...otherProps } = props

    return (
        <a class={['flex items-center w-full h-12 px-4 mt-2 rounded cursor-pointer', cls]} {...otherProps}>
            {children}
        </a>
    )
}) as typeof MenuItem
// #endregion


// #region Menu Text Component
const menuTextDef = () => ({
    cls: $(""),
    children: $(null as JSX.Child),
})

const MenuText = defaults(menuTextDef, (props) => {
    const { cls, children, ...otherProps } = props

    return (
        <span class={['ml-3 text-sm font-medium', cls]} {...otherProps}>
            {children}
        </span>
    )
}) as typeof MenuText
// #endregion

export { SideBar, MenuItem, MenuText }

customElement("wui-sidebar", SideBar)
customElement("wui-menu-item", MenuItem)
customElement("wui-menu-text", MenuText)

// Add the custom element to the JSX namespace
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-sidebar': ElementAttributes<typeof SideBar>
            'wui-menu-item': ElementAttributes<typeof MenuItem>
            'wui-menu-text': ElementAttributes<typeof MenuText>
        }
    }
}

export default SideBar

// import { tw } from '@woby/styled'
// import { $, $$, Observable, useMemo, useEffect, ObservableMaybe, type JSX } from 'woby'

// //https://codepen.io/robstinson/pen/bGwpNMV
// //dark mode text-gray-400 bg-gray-900
// //purple mode text-indigo-300 bg-indigo-900


// export const SideBar = <T extends HTMLElement = HTMLDivElement>({ children, className, contentRef, width: w = $('300px'), disableBackground, open = $(false), class: cls, ...props }: JSX.HTMLAttributes<HTMLDivElement> & { contentRef?: Observable<T>, open: Observable<boolean>, disableBackground?: ObservableMaybe<boolean> }) => {
//     const width = useMemo(() => $$(open) ? $$(w) : 0)

//     useEffect(() => {
//         if (!$$(contentRef)) return

//         $$(contentRef).style.marginLeft = $$(width) + ''
//         $$(contentRef).style.transition = 'margin-left .5s'
//     })

//     return [<div class="h-full w-0 fixed overflow-x-hidden transition-[0.5s] left-0 top-0" style={{ width }}>
//         {children}
//     </div>,
//     <div class={['absolute h-full w-full z-[999] bg-[#000] opacity-50', () => $$(disableBackground) && $$(open) ? 'visible' : 'hidden']} onClick={() => open(p => !p)}
//         style={{ height: () => $$(contentRef)?.offsetHeight }}></div>
//     ]
// }

// export const MenuItem = tw('a')`flex items-center w-full h-12 px-3 mt-2 rounded hover:bg-gray-300 cursor-pointer`
// export const MenuText = tw('span')`ml-3 text-sm font-medium`


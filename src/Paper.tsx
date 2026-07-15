import { $, $$, customElement, defaults, ElementAttributes, HtmlClass, HtmlNumber, ObservableMaybe, useMemo } from "woby"

const baseClass = "bg-white transition-shadow duration-300 ease-in-out rounded-lg "

const preset = {
    0: `shadow-none `,
    1: `shadow-sm `,
    2: `shadow `,
    3: `shadow-md `,
    4: `shadow-lg `,
    6: `shadow-xl `,
    8: `shadow-2xl `,
    12: `shadow-2xl `,
    16: `shadow-2xl `,
    24: `shadow-2xl `
}


const def = () => ({
    /** 
     * Custom CSS classes to apply to the paper.
     * 
     * Class override mechanism:
     * - `cls` prop: Used as the primary class, if undefined the default classes are used
     * - `class` prop (aliased as `cn`): Additional classes that patch/extend the given classes
     * 
     * Usage:
     * - When `cls` is undefined, the default classes are used
     * - User can override the default class by providing a `cls` prop
     * - `class` can be used to add additional classes to the component
     */
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    children: $(null),
    elevation: $(1, HtmlNumber) as ObservableMaybe<number>,
})

const Paper = defaults(def, (props) => {
    const { class: cn, cls, children, elevation, ...otherProps } = props

    const elevationClass = useMemo(() => {
        const elev = $$(elevation)
        // Look up the class string from the preset.
        // If the user provides an invalid number (e.g., 5), it safely falls back to elevation 0 (no shadow).
        return preset[elev] ?? preset[0]
    })


    return (
        <div class={[() => $$(cls) ? $$(cls) : baseClass, elevationClass, cn]} {...otherProps}>
            {children}
        </div>
    )
}) as typeof Paper

export { Paper }

customElement("wui-paper", Paper)

// Add the custom element to the JSX namespace
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-paper': ElementAttributes<typeof Paper>
        }
    }
}

export default Paper
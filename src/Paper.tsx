import { $, $$, customElement, defaults, ElementAttributes, HtmlClass, HtmlNumber, ObservableMaybe, useMemo } from "woby"

// const preset = {
//     0: `bg-white transition-shadow duration-300 ease-in-out rounded-lg shadow-none`,
//     1: `bg-white transition-shadow duration-300 ease-in-out rounded-lg shadow-[rgba(0,0,0,0.2)_0px_2px_1px_-1px,rgba(0,0,0,0.14)_0px_1px_1px_0px,rgba(0,0,0,0.12)_0px_1px_3px_0px]`,
//     2: `bg-white transition-shadow duration-300 ease-in-out rounded-lg shadow-[rgba(0,0,0,0.2)_0px_3px_1px_-2px,rgba(0,0,0,0.14)_0px_2px_2px_0px,rgba(0,0,0,0.12)_0px_1px_5px_0px]`,
//     3: `bg-white transition-shadow duration-300 ease-in-out rounded-lg shadow-[rgba(0,0,0,0.2)_0px_3px_3px_-2px,rgba(0,0,0,0.14)_0px_3px_4px_0px,rgba(0,0,0,0.12)_0px_1px_8px_0px]`,
//     4: `bg-white transition-shadow duration-300 ease-in-out rounded-lg shadow-[rgba(0,0,0,0.2)_0px_2px_4px_-1px,rgba(0,0,0,0.14)_0px_4px_5px_0px,rgba(0,0,0,0.12)_0px_1px_10px_0px]`,
//     6: `bg-white transition-shadow duration-300 ease-in-out rounded-lg shadow-[rgba(0,0,0,0.2)_0px_3px_5px_-1px,rgba(0,0,0,0.14)_0px_6px_10px_0px,rgba(0,0,0,0.12)_0px_1px_18px_0px]`,
//     8: `bg-white transition-shadow duration-300 ease-in-out rounded-lg shadow-[rgba(0,0,0,0.2)_0px_5px_5px_-3px,rgba(0,0,0,0.14)_0px_8px_10px_1px,rgba(0,0,0,0.12)_0px_3px_14px_2px]`,
//     12: `bg-white transition-shadow duration-300 ease-in-out rounded-lg shadow-[rgba(0,0,0,0.2)_0px_7px_8px_-4px,rgba(0,0,0,0.14)_0px_12px_17px_2px,rgba(0,0,0,0.12)_0px_5px_22px_4px]`,
//     16: `bg-white transition-shadow duration-300 ease-in-out rounded-lg shadow-[rgba(0,0,0,0.2)_0px_8px_10px_-5px,rgba(0,0,0,0.14)_0px_16px_24px_2px,rgba(0,0,0,0.12)_0px_6px_30px_5px]`,
//     24: `bg-white transition-shadow duration-300 ease-in-out rounded-lg shadow-[rgba(0,0,0,0.2)_0px_11px_15px_-7px,rgba(0,0,0,0.14)_0px_24px_38px_3px,rgba(0,0,0,0.12)_0px_9px_46px_8px]`
// }

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
     * - `class` prop (aliased as `cn`): Used as the primary class, if undefined the default classes are used
     * - `cls` prop: Additional classes that patch/extend the given classes
     * 
     * Usage:
     * - When `class` is undefined, the default classes are used
     * - User can override the default class by providing a `class` prop
     * - `cls` can be used to add additional classes to the component
     */
    class: $('', HtmlClass) as JSX.Class | undefined,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    children: $(null),
    elevation: $(1, HtmlNumber) as ObservableMaybe<number>,
})

const Paper = defaults(def, (props) => {
    const { cls, class: cn, children, elevation, ...otherProps } = props

    const elevationClass = useMemo(() => {
        const elev = $$(elevation)
        // Look up the class string from the preset.
        // If the user provides an invalid number (e.g., 5), it safely falls back to elevation 0 (no shadow).
        return preset[elev] ?? preset[0]
    })


    return (
        <div class={[() => $$(cn) ? $$(cn) : baseClass, elevationClass, cls]} {...otherProps}>
            {children}
            {/* <pre class="border border-gray-300 px-2 py-4 rounded my-2 justify-center items-center">
                <p>Elevation: {elevation}</p>
                <p class="break-all">Class: {elevationClass}</p>
            </pre> */}
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

// import { tw } from '@woby/styled'
// //@ts-ignore
// import { Observable, ObservableMaybe, type JSX } from 'woby'

// // ,type JSX } from 'woby'

// // const preset = {
// //     0: `bg-white transition-shadow duration-300 ease-in-out delay-[0ms] rounded shadow-none`,
// //     1: `bg-white transition-shadow duration-300 ease-in-out delay-[0ms] rounded shadow-[rgba(0,0,0,0.2)_0px_2px_1px_-1px,rgba(0,0,0,0.14)_0px_1px_1px_0px,rgba(0,0,0,0.12)_0px_1px_3px_0px]`,
// //     2: `bg-white transition-shadow duration-300 ease-in-out delay-[0ms] rounded shadow-[rgba(0,0,0,0.2)_0px_3px_1px_-2px,rgba(0,0,0,0.14)_0px_2px_2px_0px,rgba(0,0,0,0.12)_0px_1px_5px_0px]`,
// //     3: `bg-white transition-shadow duration-300 ease-in-out delay-[0ms] rounded shadow-[rgba(0,0,0,0.2)_0px_3px_3px_-2px,rgba(0,0,0,0.14)_0px_3px_4px_0px,rgba(0,0,0,0.12)_0px_1px_8px_0px]`,
// //     4: `bg-white transition-shadow duration-300 ease-in-out delay-[0ms] rounded shadow-[rgba(0,0,0,0.2)_0px_2px_4px_-1px,rgba(0,0,0,0.14)_0px_4px_5px_0px,rgba(0,0,0,0.12)_0px_1px_10px_0px]`,
// //     6: `bg-white transition-shadow duration-300 ease-in-out delay-[0ms] rounded shadow-[rgba(0,0,0,0.2)_0px_3px_5px_-1px,rgba(0,0,0,0.14)_0px_6px_10px_0px,rgba(0,0,0,0.12)_0px_1px_18px_0px]`,
// //     8: `bg-white transition-shadow duration-300 ease-in-out delay-[0ms] rounded shadow-[rgba(0,0,0,0.2)_0px_5px_5px_-3px,rgba(0,0,0,0.14)_0px_8px_10px_1px,rgba(0,0,0,0.12)_0px_3px_14px_2px]`,
// //     12: `bg-white transition-shadow duration-300 ease-in-out delay-[0ms] rounded shadow-[rgba(0,0,0,0.2)_0px_7px_8px_-4px,rgba(0,0,0,0.14)_0px_12px_17px_2px,rgba(0,0,0,0.12)_0px_5px_22px_4px]`,
// //     16: `bg-white transition-shadow duration-300 ease-in-out delay-[0ms] rounded shadow-[rgba(0,0,0,0.2)_0px_8px_10px_-5px,rgba(0,0,0,0.14)_0px_16px_24px_2px,rgba(0,0,0,0.12)_0px_6px_30px_5px]`,
// //     24: `bg-white transition-shadow duration-300 ease-in-out delay-[0ms] rounded shadow-[rgba(0,0,0,0.2)_0px_11px_15px_-7px,rgba(0,0,0,0.14)_0px_24px_38px_3px,rgba(0,0,0,0.12)_0px_9px_46px_8px]`
// // }

// // export const getElevation = (number: number) => `bg-white transition-shadow duration-300 ease-in-out delay-[0ms] rounded drop-shadow-[rgba(0,0,0,0.2)_0px_${number}px_${number / 2}px-${number / -2}px,rgba(0,0,0,0.14)_0px_${number * 2}px_${number * 2 + 1}px_${number - 1}px,rgba(0,0,0,0.12)_0px_${number / 4}px_${number * 2 + 2}px-${number * 2}px]`


// // export const Paper = ({ children, className, elevation = 3, ...props }: JSX.HTMLAttributes<HTMLDivElement> & { elevation?: number }): JSX.Element => {
// //     // const s = `box-shadow: rgba(0, 0, 0, 0.2) 0px 7px 8px -4px, rgba(0, 0, 0, 0.14) 0px 12px 17px 2px, rgba(0, 0, 0, 0.12) 0px 5px 22px 4px`
// //     const { class: cls, ...ps } = props
// //     const s = styled`box-shadow: rgba(0,0,0,0.2) 0px ${elevation}px ${elevation / 2}px ${elevation / -2}px,
// //     rgba(0,0,0,0.14) 0px ${elevation * 2}px ${elevation * 2 + 1}px ${elevation - 1}px,
// //     rgba(0,0,0,0.12) 0px ${elevation / 4}px ${elevation * 2 + 2}px ${elevation * 2}px`
// //     return <div class={['bg-white transition-shadow duration-300 ease-in-out delay-[0ms] rounded ', s, className ?? cls]} {...ps}>
// //         {children}
// //     </div>
// // }


// // export const Paper = ()=><div></div>

// export const Paper = tw('div')`elevation-3`
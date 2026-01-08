//@ts-ignore
import { $, $$, defaults, type JSX, isObservable, customElement, type ElementAttributes, type Observable, type CustomElementChildren, type StyleEncapsulationProps, useEffect, HtmlBoolean, ObservableMaybe, HtmlClass, HtmlString } from "woby"
import '@woby/chk'
import './input.css'


export type ButtonStyles = "text" | "contained" | "outlined" | "icon" | "custom";
export type ButtonFunction = "button" | "submit" | "reset";

const variant = {
    text: [
        "inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle no-underline",
        "font-medium text-sm leading-[1.75] tracking-[0.02857em] uppercase rounded text-[#1976d2]",
        "rounded-[4px] border-0 outline-0 font-sans px-4 py-2",
        "[transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]",
        // hover
        "hover:no-underline",
        "hover:bg-[rgba(25,118,210,0.04)]",
        // disabled
        "disabled:text-[rgba(0,0,0,0.26)]",
        "disabled:pointer-events-none",
        "disabled:cursor-default",
    ].join(" "),

    contained: [
        "inline-flex items-center justify-center relative box-border cursor-pointer select-none align-middle no-underline",
        "font-medium text-sm leading-[1.75] tracking-[0.02857em] uppercase rounded text-white bg-[#1976d2]",
        "rounded-[4px] border-0 outline-0 font-sans px-4 py-2",
        "shadow-[0px_3px_1px_-2px_rgba(0,0,0,0.2),0px_2px_2px_0px_rgba(0,0,0,0.14),0px_1px_5px_0px_rgba(0,0,0,0.12)]",
        "[transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]",
        // hover
        "hover:no-underline",
        "hover:bg-[#1565c0]",
        "hover:shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.2),0px_4px_5px_0px_rgba(0,0,0,0.14),0px_1px_10px_0px_rgba(0,0,0,0.12)]",
        // active
        "active:shadow-[0px_5px_5px_-3px_rgba(0,0,0,0.2),0px_8px_10px_1px_rgba(0,0,0,0.14),0px_3px_14px_2px_rgba(0,0,0,0.12)]",
        // disabled
        "disabled:text-[rgba(0,0,0,0.26)]",
        "disabled:shadow-none",
        "disabled:bg-[rgba(0,0,0,0.12)]",
        "disabled:pointer-events-none",
        "disabled:cursor-default",
    ].join(" "),

    outlined: [
        "inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle no-underline font-medium",
        "text-sm leading-[1.75] tracking-[0.02857em] uppercase rounded border text-[#1976d2] rounded-[4px]",
        "border-solid font-sans px-4 py-2",
        "[transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]",

        // hover
        "hover:no-underline",
        "hover:bg-[rgba(25,118,210,0.04)]",
        "hover:border",
        "hover:border-solid",
        "hover:border-[#1976d2]",
        // disabled
        "disabled:text-[rgba(0,0,0,0.26)]",
        "disabled:border",
        "disabled:border-solid",
        "disabled:border-[rgba(0,0,0,0.12)]",
        "disabled:pointer-events-none",
        "disabled:cursor-default",
    ].join(" "),

    icon: [
        "inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle no-underline text-center",
        "flex-[0_0_auto] text-2xl overflow-visible text-[rgba(0,0,0,0.54)] transition-[background-color] duration ease-in-out delay-[0ms] rounded-none",
        "rounded-[50%] border-0",
        "hover:bg-[rgba(0,0,0,0.04)]",
    ].join(" "),
}

const def = () => ({
    type: $("contained", HtmlString) as ObservableMaybe<string>,
    buttonFunction: $("button", HtmlString) as ObservableMaybe<ButtonFunction>,
    children: $("Button"),
    checked: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
    disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
    /** 
     * Custom CSS classes to apply to the button.
     * 
     * Class override mechanism:
     * - `cls` prop: Used as the primary class, if undefined the default variant class is used
     * - `class` prop (aliased as `cn`): Additional classes that patch/extend the given class
     * 
     * Usage:
     * - When `cls` is undefined, the default variant class is used
     * - User can override the default class by providing a `cls` prop
     * - `class` can be used to add additional classes to the component
     */
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    onClick: undefined,
})

const Button = defaults(def, (props) => {
    const { children, cls, class: cn, type: buttonType, buttonFunction, checked, disabled, onClick, ...otherProps } = props    // Create reactive displayText observable with proper type
    const displayText = $<string>('')

    // Handle both slot elements (HTML custom elements) and regular children (TSX)
    useEffect(() => {
        const childValue = $$(children)

        if (childValue instanceof HTMLSlotElement) {
            // For HTML custom elements: extract text from slot
            const slot = childValue as HTMLSlotElement

            const updateText = () => {
                const assignedNodes = slot.assignedNodes()
                const textContent = assignedNodes.map(node => node.textContent).join('')
                displayText(textContent)
            }

            // Listen for slot changes
            slot.addEventListener('slotchange', updateText)

            // Get initial content
            updateText()

            // Cleanup
            return () => slot.removeEventListener('slotchange', updateText)
        } else {
            // For TSX: children is already the text content (or observable)
            displayText(String(childValue || ''))
        }
    })

    return (
        <button
            type={() => $$(buttonFunction) as ButtonFunction}
            onClick={(e) => {
                // Call the provided onClick handler if it exists
                if (onClick) {
                    onClick(e)
                }
                // Handle the checked state toggle
                e.stopImmediatePropagation()
                if (isObservable(checked)) {
                    checked(!$$(checked))
                }
            }}
            disabled={disabled}
            class={() => [
                () => $$(cls) ? $$(cls) : variant[$$(buttonType)], cn
            ]}
            {...otherProps}
        >
            {children}
        </button>
        // <pre class="border border-black-500 rounded-[4px] p-3 m-2">
        //     <p style={"margin-bottom: 10px; color: black;"}>Button Type: <span style={"font-weight: bold; color: blue;"}>{buttonType}</span></p>
        //     <p style={"margin-bottom: 10px; color: black;"}>Button Function: <span style={"font-weight: bold; color: blue;"}>{buttonFunction}</span></p>
        //     <p style={"margin-bottom: 10px; color: black;"}>Class: <span style={"font-weight: bold; color: blue;"}>{className}</span></p>
        //     <p style={"margin-bottom: 10px; color: black;"}>Display Text: <span style={"font-weight: bold; color: blue;"}>{() => $$(displayText)}</span></p>
        //     <p style={"margin-bottom: 10px; color: black;"}>Disabled: <span style={"font-weight: bold; color: blue;"}>{String(disabled)}</span></p>
        // </pre>
    )
}) as typeof Button & StyleEncapsulationProps


export { Button }

// NOTE: Register the custom element
customElement('wui-button', Button)

// NOTE: Add the custom element to the JSX namespace
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-button': ElementAttributes<typeof Button>
        }
    }
}

export default Button

// #region Original Button Source Code
// const variant = {
//     text: `inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle no-underline
//             font-medium text-sm leading-[1.75] tracking-[0.02857em] uppercase rounded text-[#1976d2]
//             rounded-none border-0 outline-0 font-sans
//             [transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]
//             hover:no-underline hover:bg-[rgba(25,118,210,0.04)]
//             disabled:text-[rgba(0,0,0,0.26)] disabled:pointer-events-none disabled:cursor-default`,
//     contained: `inline-flex items-center justify-center relative box-border cursor-pointer select-none align-middle no-underline
//             font-medium text-sm leading-[1.75] tracking-[0.02857em] uppercase rounded text-white bg-[#1976d2]
//             shadow-[0px_3px_1px_-2px_rgba(0,0,0,0.2),0px_2px_2px_0px_rgba(0,0,0,0.14),0px_1px_5px_0px_rgba(0,0,0,0.12)]
//             rounded-none border-0 outline-0 font-sans
//             [transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]
//             hover:no-underline hover:bg-[#1565c0] hover:shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.2),0px_4px_5px_0px_rgba(0,0,0,0.14),0px_1px_10px_0px_rgba(0,0,0,0.12)]
//             active:shadow-[0px_5px_5px_-3px_rgba(0,0,0,0.2),0px_8px_10px_1px_rgba(0,0,0,0.14),0px_3px_14px_2px_rgba(0,0,0,0.12)]
//             disabled:text-[rgba(0,0,0,0.26)] disabled:shadow-none disabled:bg-[rgba(0,0,0,0.12)] disabled:pointer-events-none disabled:cursor-default`,
//     outlined: `inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle no-underline font-medium
//             text-sm leading-[1.75] tracking-[0.02857em] uppercase rounded border text-[#1976d2] rounded-none
//             border-solid border-[rgba(25,118,210,0.5)] font-sans
//             [transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]
//             hover:no-underline hover:bg-[rgba(25,118,210,0.04)] hover:border hover:border-solid hover:border-[#1976d2]
//             disabled:text-[rgba(0,0,0,0.26)] disabled:border disabled:border-solid disabled:border-[rgba(0,0,0,0.12)] disabled:pointer-events-none disabled:cursor-default`,
//     icon: `inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle no-underline text-center
//      flex-[0_0_auto] text-2xl overflow-visible text-[rgba(0,0,0,0.54)] transition-[background-color] duration ease-in-out delay-[0ms] rounded-none
//      rounded-[50%] border-0
//      hover:bg-[rgba(0,0,0,0.04)]`,
// }

// type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
//     buttonType?: "text" | "contained" | "outlined" | "icon"
// }

// export const Button = (props: ButtonProps) => {
//     const { children, class: cls, buttonType = "contained", checked = $(false), disabled, ...otherProps } = props

//     return (
//         <button
//             onClick={(e) => {
//             e.stopImmediatePropagation()
//                 if (isObservable(checked)) {
//                     checked(!$$(checked))
//                 }
//             }}
//             disabled={disabled}
//             class={[variant[buttonType], cls]}
//             {...otherProps}
//         >
//             {children}
//         </button>
//     )
// }
// #endregion


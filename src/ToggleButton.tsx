import { $, $$, isObservable, defaults, customElement, type ElementAttributes, HtmlBoolean, type JSX, ObservableMaybe } from "woby"

// 1. Define Base Styles (Common to both states)
// const baseStyles = "inline-flex items-center justify-center relative box-border cursor-pointer select-none align-middle font-medium text-sm px-5 py-2.5 rounded transition-colors duration-200 border"

const def = () => ({
    children: $("" as JSX.Child),
    // 2. Updated Default Colors (Material UI / Tailwind style)
    onClass: $("text-[#1976d2] bg-[#1976d2]/10 border-[#1976d2]/50 hover:bg-[#1976d2]/20"),
    offClass: $("text-gray-600 bg-transparent border-transparent hover:bg-gray-100"),

    checked: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
    cls: $(""),
    onClick: undefined as ((e: any) => void) | undefined,
    disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
})


const ToggleButton = defaults(def, (props) => {
    const {
        children,
        onClass,
        offClass,
        checked,
        cls,
        onClick,
        ...otherProps
    } = props


    // const baseStyles = "inline-flex items-center justify-center relative box-border cursor-pointer select-none align-middle leading-[1.75] tracking-[0.02857em] border m-0 border-[rgba(0,0,0,0.12)] px-3 py-1 rounded"
    const baseStyles = "inline-flex items-center justify-center px-2 py-1 rounded text-sm cursor-pointer select-none transition-colors duration-150 border border-transparent"

    const handleClick = (e: MouseEvent) => {
        // let parent listeners still run, just stop React/Woby double-handling if needed
        // e.stopPropagation()

        // user handler first
        onClick?.(e)

        // then toggle internal state (only if it's an observable)
        if (isObservable(checked)) {
            checked((c) => !c)
        }
    }



    return (
        <button
            type="button"
            onClick={handleClick}
            aria-pressed={() => ($$(checked) ? "true" : "false")}
            class={[
                baseStyles,
                // ON / OFF styles
                () => ($$(checked) ? $$(onClass) : $$(offClass)),

                // user-provided overrides
                cls,
            ]}
            {...otherProps}
        >
            {children}
        </button >
    )
}) as typeof ToggleButton & JSX.IntrinsicElements["button"]

export { ToggleButton }

// Register as custom element
customElement('wui-toggle-button', ToggleButton)

// Add the custom element to the JSX namespace
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-toggle-button': ElementAttributes<typeof ToggleButton>
        }
    }
}

export default ToggleButton
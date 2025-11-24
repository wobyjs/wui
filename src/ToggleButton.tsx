import { $, $$, isObservable, defaults, customElement, type ElementAttributes, HtmlBoolean, type JSX } from "woby"

const def = () => ({
    children: $("" as JSX.Child),
    onClass: $("text-[#1976d2] bg-[rgba(25,118,210,0.08)] hover:bg-[rgba(25,118,210,0.12)]"),
    offClass: $("text-[rgba(0,0,0,0.54)] hover:no-underline hover:bg-[rgba(0,0,0,0.04)]"),
    checked: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
    cls: $(""),
    onClick: undefined as ((e: any) => void) | undefined,
})

const ToggleButton = defaults(def, ({
    children,
    onClass,
    offClass,
    checked,
    cls,
    onClick,
    ...props
}) => (
    <button
        onClick={(e) => {
            // Call the provided onClick handler if it exists
            if (onClick) {
                onClick(e)
            }
            // Handle the checked state toggle
            e.stopImmediatePropagation()
            if (isObservable(checked)) {
                checked((c) => !c)
            }
        }}
        class={[
            `rounded-tr-none rounded-br-none`,
            `inline-flex items-center justify-center relative box-border cursor-pointer select-none align-middle leading-[1.75] tracking-[0.02857em] uppercase border m-0 border-[rgba(0,0,0,0.12)]`,
            `[outline:0]`,
            () => ($$(checked) ? onClass : offClass),
            cls,
        ]}
        {...props}
    >
        {children}
    </button>
)) as typeof ToggleButton & JSX.IntrinsicElements['button']

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
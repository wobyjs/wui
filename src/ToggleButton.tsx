import { type CustomElementChildren, $, $$, isObservable, defaults, customElement, type ElementAttributes, HtmlBoolean, type JSX, ObservableMaybe, HtmlClass } from "woby"
import { registerBaseCls } from './helper/baseCls'

// 1. Define Base Styles (Common to both states)
// const baseStyles = "inline-flex items-center justify-center relative box-border cursor-pointer select-none align-middle font-medium text-sm px-5 py-2.5 rounded transition-colors duration-200 border"

/**
 * The class slot `cls` replaces: the shape of the button, in either state.
 *
 * Module scope rather than a local, so the render below and the
 * registerBaseCls() call at the bottom read the one string -- the editor shows
 * the panel exactly what an override would displace. The on/off colours are not
 * part of it: they change with `checked`, so an override that swallowed them
 * would freeze the button in whichever state it was rendered.
 */
const BASE_CLASS = "inline-flex items-center justify-center px-2 py-1 rounded text-sm cursor-pointer select-none transition-colors duration-150 border border-transparent"

const def = () => ({
    children: $("" as JSX.Child) as CustomElementChildren,
    // 2. Updated Default Colors (Material UI / Tailwind style)
    onClass: $("text-[#1976d2] bg-[#1976d2]/10 border-[#1976d2]/50 hover:bg-[#1976d2]/20"),
    offClass: $("text-gray-600 bg-transparent border-transparent hover:bg-gray-100"),

    checked: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
    cls: $('', HtmlClass) as JSX.Class,
    class: $('', HtmlClass) as JSX.Class,
    onClick: undefined as ((e: any) => void) | undefined,
    disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
})


const ToggleButton: Defaulted<typeof def> = defaults(def, (props) => {
    const {
        children,
        onClass,
        offClass,
        checked,
        cls,
        class: cn,
        onClick,
        ...otherProps
    } = props


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
                // user override, else the base shape
                () => $$(cls) ? $$(cls) : BASE_CLASS,
                // ON / OFF styles -- outside the slot, so an override keeps them
                () => ($$(checked) ? $$(onClass) : $$(offClass)),
                cn,
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
// Publish the slot `cls` replaces, so the editor can show and edit it.
registerBaseCls('wui-toggle-button', BASE_CLASS)

// Add the custom element to the JSX namespace
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-toggle-button': ElementAttributes<typeof ToggleButton>
        }
    }
}

export default ToggleButton
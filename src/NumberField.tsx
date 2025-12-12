import { $, $$, useEffect, isObservable, useTimeout, useInterval, Observable, ObservableMaybe, type JSX, defaults, customElement, type ElementAttributes, HtmlBoolean, useMemo, HtmlNumber, HtmlClass } from 'woby'
import { Button } from './Button'

const btnCls = `
bg-transparent items-center justify-center cursor-pointer relative m-0 border-[none] [outline:none] [-webkit-appearance:none]
disabled:bg-[#d9dbda]
`

const def = () => ({
    /** Child elements to be rendered inside the number field */
    children: $(null as JSX.Child),
    /** When true, the value will be updated immediately on user input rather than on blur */
    reactive: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
    /** When true, disables min/max constraints validation */
    noMinMax: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
    /** When true, prevents automatic value correction when outside min/max range */
    noFix: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
    /** When true, prevents value wrapping when reaching min/max limits */
    noRotate: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
    /** The current value of the number field */
    value: $(0, HtmlNumber) as ObservableMaybe<number> | undefined,
    /** The minimum allowed value */
    min: $(0, HtmlNumber) as ObservableMaybe<number> | undefined,
    /** The maximum allowed value */
    max: $(100, HtmlNumber) as ObservableMaybe<number> | undefined,
    /** The step increment for the number field */
    step: $(1, HtmlNumber) as ObservableMaybe<number> | undefined,
    /** When true, disables the number field */
    disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
    /** 
     * Custom CSS classes to apply to the number field.
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
    /** Callback function triggered when the value changes */
    onChange: undefined as ((e: any) => void) | undefined,
    /** Callback function triggered when a key is released */
    onKeyUp: undefined as ((e: any) => void) | undefined,
})

const NumberField = defaults(def, (props) => {
    const { cls, class: cn, children, reactive, noMinMax, noFix, noRotate, value, min, max, step, disabled, onChange, onKeyUp, ...otherProps } = props

    const inputRef = $<HTMLInputElement>()

    const error = useMemo(() => (+$$(value) < +$$(min) || +$$(value) > +$$(max)))

    // Fix the disabled button logic to properly handle disabled state
    const cantMin = () => $$(disabled) || ($$(value) <= $$(min) && $$(noRotate))
    const cantMax = () => $$(disabled) || ($$(value) >= $$(max) && $$(noRotate))

    let pvalue: number
    const updated = () => {
        // Don't update if disabled
        if ($$(disabled)) return

        if (pvalue === +$$(value)) return
        // Fix: if noFix is true, don't fix the value regardless of noRotate
        if ($$(noFix)) return

        if (+$$(value) < +$$(min))
            isObservable(value) && value($$(noRotate) ? +$$(min) : +$$(max))

        if (+$$(value) > +$$(max))
            isObservable(value) && value($$(noRotate) ? +$$(max) : +$$(min))

        pvalue = +$$(value)
    }

    useEffect(updated)

    const dec = () => {
        // Don't allow decrement if disabled
        if ($$(disabled)) return

        // When reactive is true, update the value directly
        // When reactive is false, update the value through the input
        if ($$(reactive) && isObservable(value)) {
            (value as Observable)?.(+$$((value)) - +$$(step))
        } else if (!$$(reactive) && isObservable(value)) {
            (value as Observable)?.((+$$(inputRef).valueAsNumber as any) - +$$(step))
        }
        updated()
    }

    const inc = () => {
        // Don't allow increment if disabled
        if ($$(disabled)) return

        // When reactive is true, update the value directly
        // When reactive is false, update the value through the input
        if ($$(reactive) && isObservable(value)) {
            (value as Observable)?.(+$$((value)) + +$$(step))
        } else if (!$$(reactive) && isObservable(value)) {
            (value as Observable)?.((+$$(inputRef).valueAsNumber as any) + +$$(step))
        }
        updated()
    }

    let interval: ReturnType<typeof useInterval>
    let timeout: ReturnType<typeof useTimeout>

    function startContinuousUpdate(isIncrement: boolean) {
        // Don't allow continuous update if disabled
        if ($$(disabled)) return

        // Update immediately on press
        isIncrement ? inc() : dec()

        // Start interval to continue updating while pressed
        timeout = useTimeout(() => {
            interval = useInterval(() => {
                isIncrement ? inc() : dec()
            }, 100)
        }, 200)
    }

    function stopUpdate() {
        timeout?.()
        interval?.()
    }

    // return <div class={["number-input inline-flex border-2 border-solid border-[#ddd] box-border [&_*]:box-border", cls]}>
    return <div class={[
        "number-input inline-flex items-center bg-white border border-gray-300 rounded-lg transition-all duration-200",
        "focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500", // Nice focus state
        "divide-x divide-gray-200", // Subtle dividers between elements
        { "bg-gray-100 opacity-70": disabled }, // Style for disabled state
        () => $$(cn) ? $$(cn) : "",
        cls
    ]}>
        <Button
            // class={btnCls}
            type="icon" cls="!rounded-none !rounded-l-md !w-10 !h-10"
            buttonFunction="button"
            onPointerDown={() => startContinuousUpdate(false)}
            onPointerUp={stopUpdate}
            onPointerLeave={stopUpdate}
            disabled={cantMin}>
            <span class="py-4 px-2 text-lg font-semibold">-</span>
        </Button>
        <input
            ref={inputRef}
            //     class={[`quantity  [-webkit-appearance:textfield] [-moz-appearance:textfield] [appearance:textfield]
            // [&::-webkit-inner-spin-button]:[-webkit-appearance:none] [&::-webkit-outer-spin-button]:[-webkit-appearance:none]
            // text-center p-2 border-solid border-[0_2px]
            // `, { "text-[red]": error }]}
            class={[
                // Remove old borders and make input transparent and clean
                "w-16 text-center border-none bg-transparent focus:outline-none focus:ring-0 text-lg font-semibold text-gray-700",
                "[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden",
                { "text-red-500": error }
            ]}
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={e => {
                // Don't allow change if disabled
                if ($$(disabled)) return

                !$$(reactive) && isObservable(value) ? ((value as Observable)?.(e.target.valueAsNumber), onChange?.(e))
                    : undefined
                updated()
            }}
            onWheel={e => {
                // Don't allow wheel if disabled
                if ($$(disabled)) {
                    e.preventDefault()
                    return
                }

                e.preventDefault()
                Math.sign(e.deltaY) > 0 ? dec() : inc()
            }}
            {...otherProps}
            disabled={disabled}
        />
        <Button
            // class={[btnCls, "plus"]}
            // cls="plus"
            type="icon" cls="!rounded-none !rounded-r-md !w-10 !h-10"
            onPointerDown={() => startContinuousUpdate(true)}
            onPointerUp={stopUpdate}
            onPointerLeave={stopUpdate}
            disabled={cantMax}>
            <span class="py-4 px-2 text-lg font-semibold">+</span>
        </Button>
        {children}
    </div>
}) as typeof NumberField & JSX.IntrinsicElements['div']

export { NumberField }

// Register as custom element
customElement('wui-number-field', NumberField)

// Add the custom element to the JSX namespace
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-number-field': ElementAttributes<typeof NumberField>
        }
    }
}

export default NumberField
import { $, $$, useEffect, isObservable, Observable, ObservableMaybe, type JSX, defaults, customElement, type ElementAttributes, HtmlBoolean, useMemo, HtmlNumber, HtmlClass } from 'woby'
import { Button } from './Button'

const btnCls = `bg-transparent items-center justify-center cursor-pointer relative m-0 border-[none] [outline:none] [-webkit-appearance:none] disabled:bg-[#d9dbda]`

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
    /** Callback function triggered when the value changes */
    onChange: undefined as ((e: any) => void) | undefined,
    /** Callback function triggered when a key is released */
    onKeyUp: undefined as ((e: any) => void) | undefined,
})

const NumberField = defaults(def, (props) => {
    const { class: cn, cls, children, reactive, noMinMax, noFix, noRotate, value, min, max, step, disabled, onChange, onKeyUp, ...otherProps } = props

    const inputRef = $<HTMLInputElement>()

    const error = useMemo(() => {
        if ($$(noMinMax)) return false
        return +$$(value) < +$$(min) || +$$(value) > +$$(max)
    })

    // Fix the disabled button logic to properly handle disabled state
    const cantMin = () => $$(disabled) || (!$$(noMinMax) && $$(value) <= $$(min) && $$(noRotate))
    const cantMax = () => $$(disabled) || (!$$(noMinMax) && $$(value) >= $$(max) && $$(noRotate))

    let pvalue: number
    const updated = () => {
        // Don't update if disabled
        if ($$(disabled)) return

        if (pvalue === +$$(value)) return
        // If noFix OR noMinMax is true, don't perform automatic clamping/rotation
        if ($$(noFix) || $$(noMinMax)) return

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
            const newValue = +$$((value)) - +$$(step)
                ; (value as Observable)?.(newValue)
            // console.log("Decreased to:", newValue)
        } else if (!$$(reactive) && isObservable(value)) {
            const newValue = (+$$(inputRef).valueAsNumber as any) - +$$(step)
                ; (value as Observable)?.(newValue)
            // console.log("Decreased to:", newValue)
        }
        updated()
    }

    const inc = () => {
        // Don't allow increment if disabled
        if ($$(disabled)) return

        // When reactive is true, update the value directly
        // When reactive is false, update the value through the input
        if ($$(reactive) && isObservable(value)) {
            const newValue = +$$((value)) + +$$(step)
                ; (value as Observable)?.(newValue)
            // console.log("Increased to:", newValue)
        } else if (!$$(reactive) && isObservable(value)) {
            const newValue = (+$$(inputRef).valueAsNumber as any) + +$$(step)
                ; (value as Observable)?.(newValue)
            // console.log("Increased to:", newValue)
        }
        updated()
    }

    // Use plain variables instead of observables to store timer IDs
    // Storing in observables was causing reactivity issues that triggered re-renders
    let intervalId: number | null = null
    let timeoutId: number | null = null

    function startContinuousUpdate(isIncrement: boolean) {
        // console.log("Start: Continuous Update");

        // Don't allow continuous update if disabled
        if ($$(disabled)) return

        // Clear any existing timers first
        stopUpdate()

        // Update immediately on press
        isIncrement ? inc() : dec()

        // Start interval to continue updating while pressed
        // Use native setTimeout/setInterval to avoid reactive hook issues
        timeoutId = setTimeout(() => {
            // console.log("Timeout fired - starting interval");
            intervalId = setInterval(() => {
                // console.log("Interval tick - before update");
                isIncrement ? inc() : dec()
                // console.log("Interval tick - after update");
            }, 100)
            // console.log("Interval created with ID:", intervalId);
        }, 200)
        // console.log("Timeout created with ID:", timeoutId);
    }

    function stopUpdate() {
        // console.log("Stop: Continuous Update");
        // console.log("Stopping - timeout ID:", timeoutId, "interval ID:", intervalId);

        if (timeoutId !== null) {
            // console.log("Clearing timeout:", timeoutId);
            clearTimeout(timeoutId)
            timeoutId = null
        }
        if (intervalId !== null) {
            // console.log("Clearing interval:", intervalId);
            clearInterval(intervalId)
            intervalId = null
        }
        // console.log("Stop complete");
    }

    // Add global pointerup listener as a safety net
    useEffect(() => {
        const handleGlobalPointerUp = () => {
            if (intervalId !== null || timeoutId !== null) {
                // console.log("Global PointerUp: Stopping update");
                stopUpdate()
            }
        }

        document.addEventListener('pointerup', handleGlobalPointerUp)
        document.addEventListener('pointercancel', handleGlobalPointerUp)

        return () => {
            document.removeEventListener('pointerup', handleGlobalPointerUp)
            document.removeEventListener('pointercancel', handleGlobalPointerUp)
            // Clean up any remaining timers when component unmounts
            stopUpdate()
        }
    })

    // return <div class={["number-input inline-flex border-2 border-solid border-[#ddd] box-border [&_*]:box-border", cls]}>
    return (
        <div class={[
            "number-input inline-flex items-center bg-white border border-gray-300 rounded-lg transition-all duration-200",
            "focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500", // Nice focus state
            "divide-x divide-gray-200", // Subtle dividers between elements
            { "bg-gray-100 opacity-70": disabled }, // Style for disabled state
            () => $$(cls) ? $$(cls) : "",
            cn
        ]}>
            <Button
                // class={btnCls}
                type="icon" cls="!rounded-none !rounded-l-md !w-10 !h-10 !border-r !border-gray-200 !bg-transparent"
                buttonFunction="button"
                onPointerDown={() => { startContinuousUpdate(false); }}
                onPointerUp={stopUpdate}
                onPointerLeave={stopUpdate}
                disabled={cantMin}>
                <span class="py-4 px-2 text-lg font-semibold">-</span>
            </Button>
            <input
                ref={inputRef}
                class={[
                    "w-16 text-center border-none bg-transparent focus:outline-none focus:ring-0 text-lg font-semibold text-gray-700",
                    "[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden",
                    { "text-red-500": error }
                ]}
                type="number"
                value={value}
                min={() => $$(noMinMax) ? undefined : $$(min)} // min={min}
                max={() => $$(noMinMax) ? undefined : $$(max)}// max={max}
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
                type="icon" cls="!rounded-none !rounded-r-md !w-10 !h-10 !border-l !border-gray-200 !bg-transparent"
                onPointerDown={() => { startContinuousUpdate(true); }}
                onPointerUp={stopUpdate}
                onPointerLeave={stopUpdate}
                disabled={cantMax} >
                <span class="py-4 px-2 text-lg font-semibold">+</span>
            </Button >
            {children}
        </div >
    )
}) as typeof NumberField & JSX.IntrinsicElements['div']

export { NumberField }

customElement('wui-number-field', NumberField)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-number-field': ElementAttributes<typeof NumberField>
        }
    }
}

export default NumberField
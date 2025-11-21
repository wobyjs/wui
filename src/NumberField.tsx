import { $, $$, useEffect, isObservable, useTimeout, useInterval, Observable, ObservableMaybe, type JSX, defaults, customElement, type ElementAttributes, HtmlBoolean, useMemo } from 'woby'

const btn = `
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
    value: $(0),
    /** The minimum allowed value */
    min: $(0),
    /** The maximum allowed value */
    max: $(100),
    /** The step increment for the number field */
    step: $(1),
    /** When true, disables the number field */
    disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
    /** Additional CSS classes to apply to the number field */
    cls: $(""),
    /** Callback function triggered when the value changes */
    onChange: undefined as ((e: any) => void) | undefined,
    /** Callback function triggered when a key is released */
    onKeyUp: undefined as ((e: any) => void) | undefined,
})

const NumberField = defaults(def, (props) => {
    const { children, reactive, noMinMax, noFix, noRotate, value, min, max, step, disabled, cls, onChange, onKeyUp, ...otherProps } = props
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

    return <div class={["number-input inline-flex border-2 border-solid border-[#ddd] box-border [&_*]:box-border", cls]}>
        <button
            class={btn}
            onPointerDown={() => startContinuousUpdate(false)}
            onPointerUp={stopUpdate}
            onPointerLeave={stopUpdate}
            disabled={cantMin}>
            -
        </button>
        <input
            ref={inputRef}
            class={[`quantity  [-webkit-appearance:textfield] [-moz-appearance:textfield] [appearance:textfield]
        [&::-webkit-inner-spin-button]:[-webkit-appearance:none] [&::-webkit-outer-spin-button]:[-webkit-appearance:none]
        text-center p-2 border-solid border-[0_2px]
        `, { "text-[red]": error }]}
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
        <button
            class={[btn, "plus"]}
            onPointerDown={() => startContinuousUpdate(true)}
            onPointerUp={stopUpdate}
            onPointerLeave={stopUpdate}
            disabled={cantMax}>
            +
        </button>
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
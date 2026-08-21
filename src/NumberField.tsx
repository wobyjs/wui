import { type CustomElementChildren, $, $$, useEffect, isObservable, Observable, ObservableMaybe, type JSX, defaults, customElement, type ElementAttributes, HtmlBoolean, useMemo, HtmlNumber, HtmlClass } from 'woby'
import { Button } from './Button'
import { registerBaseCls } from './helper/baseCls'

/**
 * The class slot `cls` replaces: the box around the field and its buttons.
 *
 * The disabled styling stays outside the slot -- it follows the `disabled`
 * attribute, so an override that swallowed it would leave a disabled field
 * looking live. Module scope so the render and the registerBaseCls() call at the
 * bottom agree on one string.
 */
const BASE_CLASS = [
    "number-input inline-flex items-center bg-white border border-gray-300 rounded-lg transition-all duration-200",
    "focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500", // Nice focus state
    "divide-x divide-gray-200", // Subtle dividers between elements
].join(' ')

const btnCls = `bg-transparent items-center justify-center cursor-pointer relative m-0 border-[none] [outline:none] [-webkit-appearance:none] disabled:bg-[#d9dbda]`

const def = () => ({
    /** Child elements to be rendered inside the number field */
    children: $(null as JSX.Child) as CustomElementChildren,
    /** When true, the value will be updated immediately on user input rather than on blur */
    reactive: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
    /** When true, disables min/max constraints validation */
    noMinMax: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
    /** When true, prevents automatic value correction when outside min/max range */
    noFix: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
    /** When true, prevents value wrapping when reaching min/max limits */
    noRotate: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
    /** The current value of the number field */
    value: $(0, HtmlNumber) as ObservableMaybe<number>,
    /** The minimum allowed value */
    min: $(0, HtmlNumber) as ObservableMaybe<number>,
    /** The maximum allowed value */
    max: $(100, HtmlNumber) as ObservableMaybe<number>,
    /** The step increment for the number field */
    step: $(1, HtmlNumber) as ObservableMaybe<number>,
    /** When true, disables the number field */
    disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
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
    cls: $('', HtmlClass) as JSX.Class,
    class: $('', HtmlClass) as JSX.Class,
    /** Callback function triggered when the value changes */
    onChange: undefined as ((e: any) => void) | undefined,
    /** Callback function triggered when a key is released */
    onKeyUp: undefined as ((e: any) => void) | undefined,
})

const NumberField: Defaulted<typeof def> = defaults(def, (props) => {
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
        } else if (!$$(reactive) && isObservable(value)) {
            const newValue = (+$$(inputRef)?.valueAsNumber! as any) - +$$(step)
                ; (value as Observable)?.(newValue)
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
        } else if (!$$(reactive) && isObservable(value)) {
            const newValue = (+$$(inputRef)?.valueAsNumber! as any) + +$$(step)
                ; (value as Observable)?.(newValue)
        }
        updated()
    }

    // Use plain variables instead of observables to store timer IDs
    // Storing in observables was causing reactivity issues that triggered re-renders
    let intervalId: number | null = null
    let timeoutId: number | null = null

    function startContinuousUpdate(isIncrement: boolean) {
        // Don't allow continuous update if disabled
        if ($$(disabled)) return

        // Clear any existing timers first
        stopUpdate()

        // Update immediately on press
        isIncrement ? inc() : dec()

        // Start interval to continue updating while pressed
        // Use native setTimeout/setInterval to avoid reactive hook issues
        timeoutId = setTimeout(() => {
            intervalId = setInterval(() => {
                isIncrement ? inc() : dec()
            }, 100)
        }, 200)
    }

    function stopUpdate() {
        if (timeoutId !== null) {
            clearTimeout(timeoutId)
            timeoutId = null
        }
        if (intervalId !== null) {
            clearInterval(intervalId)
            intervalId = null
        }
    }

    // Add global pointerup listener as a safety net
    useEffect(() => {
        const handleGlobalPointerUp = () => {
            if (intervalId !== null || timeoutId !== null) {
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
            () => $$(cls) ? $$(cls) : BASE_CLASS,
            // `bg-gray-100` alone never won: it sits at the same specificity as the
            // `bg-white` above and Tailwind emits bg-white later, so a disabled field
            // stayed pure white and only `opacity-70` showed. Force it.
            () => $$(disabled) ? "!bg-gray-100 opacity-70 cursor-not-allowed" : "", // Style for disabled state
            cn
        ]}>
            <Button
                // class={btnCls}
                // `!bg-transparent` outranks Button's own `disabled:bg-...`, so a disabled
                // step button was indistinguishable from a live one. The `disabled:` variant
                // adds a pseudo-class, so at equal !important it wins over the flat rule.
                type="icon" cls="!rounded-none !rounded-l-md !w-10 !h-10 !border-r !border-gray-200 !bg-transparent disabled:!bg-[#d9dbda] disabled:!text-[#00000061] disabled:!cursor-not-allowed"
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
                    "disabled:text-[#00000061] disabled:cursor-not-allowed",
                    "[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden",
                    () => $$(error) ? "text-red-500" : ""
                ]}
                type="number"
                value={value}
                min={() => $$(noMinMax) ? undefined : $$(min)} // min={min}
                max={() => $$(noMinMax) ? undefined : $$(max)}// max={max}
                step={step}
                onChange={(e: any) => {
                    // Don't allow change if disabled
                    if ($$(disabled)) return

                    isObservable(value) ? ((value as Observable)?.(e.target.valueAsNumber), onChange?.(e))
                        : undefined
                    updated()
                }}
                onWheel={(e: any) => {
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
                type="icon" cls="!rounded-none !rounded-r-md !w-10 !h-10 !border-l !border-gray-200 !bg-transparent disabled:!bg-[#d9dbda] disabled:!text-[#00000061] disabled:!cursor-not-allowed"
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
// Publish the slot `cls` replaces, so the editor can show and edit it.
registerBaseCls('wui-number-field', BASE_CLASS)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-number-field': ElementAttributes<typeof NumberField>
        }
    }
}

export default NumberField
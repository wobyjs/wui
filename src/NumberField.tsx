import { $, $$, useMemo, useEffect, isObservable } from 'woby'
//@ts-ignore
import { Observable, ObservableMaybe, type JSX } from 'woby'


const btn = `
bg-transparent items-center justify-center cursor-pointer relative m-0 border-[none] [outline:none] [-webkit-appearance:none]
disabled:bg-[#d9dbda]
`
//w-12 h-12 
// before:inline-block before:absolute before:content-[''] before:w-4 h-0.5 before:bg-[#212121] before:-translate-x-2/4 before:-translate-y-2/4
// after:inline-block after:absolute after:content-[''] after:w-4 h-0.5 after:bg-[#212121] after:-translate-x-2/4 after:-translate-y-2/4

export const NumberField = ({ className, class: cls, children, onChange, noFix, onKeyUp, reactive, ...props }: JSX.InputHTMLAttributes<HTMLInputElement> & { children?: JSX.Child, reactive?: ObservableMaybe<boolean>, noFix?: ObservableMaybe<boolean> }): JSX.Element => {
    const inputRef = $<HTMLInputElement>()
    const { min, max, value, step, } = props
    const error = () => $$(value) < $$(min) || $$(value) > $$(max)
    const cantMin = () => $$(value) <= $$(min)
    const cantMax = () => $$(value) >= $$(max)

    useEffect(() => {
        if ($$(noFix)) return

        if ($$(value) < $$(min))
            isObservable(value) && value($$(min))

        if ($$(value) > $$(max))
            isObservable(value) && value($$(max))
    })


    return <div class={["number-input inline-flex border-2 border-solid border-[#ddd] box-border [&_*]:box-border", className, cls]}>
        <button class={btn} onClick={() => { $$(inputRef).stepDown(); isObservable(value) && value?.($$(inputRef).value) }} disabled={cantMin}>-</button>
        <input ref={inputRef} class={[`quantity  [-webkit-appearance:textfield] [-moz-appearance:textfield] [appearance:textfield]
        [&::-webkit-inner-spin-button]:[-webkit-appearance:none] [&::-webkit-outer-spin-button]:[-webkit-appearance:none]
        text-center p-2 border-solid border-[0_2px]
        `,
            () => $$(error) ? 'text-[red]' : ''
        ]} type="number" {...props}
            onChange={e => !$$(reactive) && isObservable(value) ? (value?.(e.target.value), onChange?.(e)) : undefined}
            onKeyUp={e => !$$(reactive) && isObservable(value) ? (value?.(e.target.value), onKeyUp?.(e)) : undefined}
            onWheel={e => { e.preventDefault(); !$$(reactive) && isObservable(value) ? (value?.(Math.sign(e.deltaY) > 0 ? ++e.target.value : --e.target.value)) : undefined }}

        />
        <button class={[btn, "plus"]} onClick={() => { $$(inputRef).stepUp(); isObservable(value) && value?.($$(inputRef).value) }} disabled={cantMax}>+</button>
    </div>
}
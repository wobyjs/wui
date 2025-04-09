import { nanoid } from 'nanoid'
import { ObservableMaybe, useEffect, $, $$, isObservable, Observable, type JSX, FunctionMaybe } from 'woby'
// https://codepen.io/alvarotrigo/pen/oNoJePo



/**
 * Override
 * 
 * background color
 * 
 * [&>div]:before:bg-[#03a9f4] 
 * [&>div]:after:bg-[#f44336]
 * 
 * [&>input:checked~span]:bg-[#fcebeb]
 *
 * 
 * Some special case may need to see the output html tree node and modify classes as needed
 */
export const Switch = ({ off = 'OFF', on = 'ON', checked, ...props }: JSX.VoidHTMLAttributes<HTMLDivElement> & { id?: string, on?: string, off?: string, checked?: FunctionMaybe<boolean> }) => {
    const id = props.id ?? nanoid(8)

    return <>
        <div {...props}>
            <input id={id} type="checkbox" checked={checked} /* onChange={v => checked(v.target.checked)} */ onChange={v => isObservable(checked) && checked(v.target.checked)} />
            <div data-tg-on={on} data-tg-off={off}><span data-tg-on={on} data-tg-off={off}></span></div>
            <span></span>
            <label for={id} data-tg-on={on} data-tg-off={off}></label>
        </div>
    </>
}


export const useEnumSwitch = <T,>(e: Observable<T>, t: ObservableMaybe<T>, f: ObservableMaybe<T>) => {
    const v = $($$(e) === t)

    useEffect(() => { v($$(e) !== $$(f)) })
    useEffect(() => {
        if ($$(v)) e($$(t))
        else e($$(f))
    })

    return v
}
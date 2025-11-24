//@ts-ignore
import { nanoid } from 'nanoid'
import { ObservableMaybe, useEffect, $, $$, isObservable, Observable, type JSX, FunctionMaybe, defaults, customElement, type ElementAttributes, HtmlBoolean } from 'woby'
// https://codepen.io/alvarotrigo/pen/oNoJePo

const def = () => ({
    off: $("OFF"),
    on: $("ON"),
    checked: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
    id: $(undefined as string | undefined),
    cls: $(""),
    children: $(null as JSX.Child),
})

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
const Switch = defaults(def, (props) => {
    const { off, on, checked, id: idProp, cls, children, ...otherProps } = props

    // Generate ID if not provided
    const generatedId = $(nanoid(8))
    const id = idProp ?? generatedId

    return (
        <>
            <div {...otherProps} class={cls}>
                <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    /* onChange={v => checked(v.target.checked)} */
                    onChange={v => isObservable(checked) && checked(v.target.checked)}
                />
                <div data-tg-on={on} data-tg-off={off}>
                    <span data-tg-on={on} data-tg-off={off}></span>
                </div>
                <span></span>
                <label for={id} data-tg-on={on} data-tg-off={off}></label>
            </div>
        </>
    )
})

export { Switch }

// Register as custom element
customElement('wui-switch', Switch)

// Add the custom element to the JSX namespace
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-switch': ElementAttributes<typeof Switch>
        }
    }
}

export default Switch

export const useEnumSwitch = <T,>(e: Observable<T>, t: ObservableMaybe<T>, f: ObservableMaybe<T>) => {
    const v = $($$(e) === t)

    useEffect(() => { v($$(e) !== $$(f)) })
    useEffect(() => {
        if ($$(v)) e($$(t))
        else e($$(f))
    })

    return v
}
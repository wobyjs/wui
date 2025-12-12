//@ts-ignore
import { nanoid } from 'nanoid'
import { ObservableMaybe, useEffect, $, $$, isObservable, Observable, type JSX, FunctionMaybe, defaults, customElement, type ElementAttributes, HtmlBoolean, HtmlString, useMemo, HtmlClass } from 'woby'
import {
    effect1, effect2, effect3,
    effect4, effect5, effect6,
    effect7, effect8, effect9,
    effect10, effect11, effect12,
    effect13, effect14, effect15,
    effect16, effect17, effect18,
    ios, flat, skewed, flip, light
} from './Switch.effect'

// https://codepen.io/alvarotrigo/pen/oNoJePo

// const def = () => ({
//     off: $("OFF"),
//     on: $("ON"),
//     checked: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
//     id: $(undefined as string | undefined),
//     cls: $('', HtmlClass) as ObservableMaybe<JSX.Class>|undefined,
//     children: $(null as JSX.Child),
// })

// 1. Create a lookup map for all your effects
const styleMap: Record<string, string> = {
    // Common Styles
    ios, flat, skewed, flip, light,
    // Numbered Effects
    effect1, effect2, effect3,
    effect4, effect5, effect6,
    effect7, effect8, effect9,
    effect10, effect11, effect12,
    effect13, effect14, effect15,
    effect16, effect17, effect18
}


const def = () => {
    const generatedId = nanoid(8)
    return ({
        off: $("OFF"),
        on: $("ON"),
        checked: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
        id: $(generatedId as string | undefined),
        class: $('', HtmlClass) as JSX.Class | undefined,
        cls: $('', HtmlClass) as JSX.Class | undefined,
        children: $(null as JSX.Child),
        effect: $("", HtmlString) as ObservableMaybe<string> | undefined,
    })
}

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
    const { off, on, checked, id, class: cn, cls, children, effect, ...otherProps } = props

    const activeStyle = useMemo(() => {
        const effectName = $$(effect) // Unwrap the observable
        return styleMap[effectName] || "" // Return the CSS string or empty if not found
    })

    return (
        <div {...otherProps} class={[activeStyle, () => $$(cn) ? $$(cn) : "", cls]}>
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
    )
}) as typeof Switch

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
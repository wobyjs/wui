import { nanoid } from 'nanoid'
import { type CustomElementChildren, ObservableMaybe, useEffect, $, $$, isObservable, Observable, type JSX, FunctionMaybe, defaults, customElement, type ElementAttributes, HtmlBoolean, HtmlString, useMemo, HtmlClass } from 'woby'
import {
    effect1, effect2, effect3,
    effect4, effect5, effect6,
    effect7, effect8, effect9,
    effect10, effect11, effect12,
    effect13, effect14, effect15,
    effect16, effect17, effect18,
    ios, flat, skewed, flip, light
} from './Switch.effect'
import { registerBaseCls } from './helper/baseCls'

// https://codepen.io/alvarotrigo/pen/oNoJePo

// const def = () => ({
//     off: $("OFF"),
//     on: $("ON"),
//     checked: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
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
        checked: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
        id: $(generatedId as string | undefined),
        cls: $('', HtmlClass) as JSX.Class,
        class: $('', HtmlClass) as JSX.Class,
        children: $(null as JSX.Child) as CustomElementChildren,
        effect: $("", HtmlString) as ObservableMaybe<string>,
    })
}

/**
 * The class slot `cls` replaces: the whole effect stylesheet for this switch.
 *
 * Unlike a component with a fixed base, a switch *is* its effect -- there is no
 * shape underneath the `effect` variant to keep, so the variant is the slot.
 * Named rather than inlined so the render and the registerBaseCls() call at the
 * bottom cannot drift apart.
 */
const baseCls = (effect: string | null | undefined) => styleMap[effect || ''] || ''

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
const Switch: Defaulted<typeof def> = defaults(def, (props) => {
    const { off, on, checked, id, cls, class: cn, children, effect, ...otherProps } = props

    const activeStyle = useMemo(() => baseCls($$(effect)))

    return (
        <div {...otherProps} class={[() => $$(cls) ? $$(cls) : $$(activeStyle), cn]}>
            <input
                id={id}
                type="checkbox"
                checked={checked}
                /* onChange={v => checked(v.target.checked)} */
                onChange={(v: any) => isObservable(checked) && checked(v.target.checked)}
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
// Publish the slot `cls` replaces, so the editor can show and edit it.
registerBaseCls('wui-switch', el => baseCls(el.getAttribute('effect')))

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
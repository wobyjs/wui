import { $, $$, customElement, defaults, ElementAttributes, HtmlClass, HtmlString, ObservableMaybe, type JSX } from "woby"

const def = () => ({
    class: $('', HtmlClass) as JSX.Class | undefined,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    children: $(null),
    type: $("default", HtmlString) as ObservableMaybe<string>
})

const variantStyle = {
    default: "relative flex items-center px-4 h-full"
}

const Toolbar = defaults(def, (props) => {
    const { class: cn, cls, children, type, ...otherProps } = props

    return (
        <div class={() => [variantStyle[$$(type)], () => $$(cn) ? $$(cn) : "", cls]}
            {...otherProps}>
            {children}
        </div>
    )
}) as typeof Toolbar

export { Toolbar }

customElement("wui-toolbar", Toolbar)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-toolbar': ElementAttributes<typeof Toolbar>
        }
    }
}

export default Toolbar

// import { tw } from '@woby/styled'
// //@ts-ignore
// import { Observable, ObservableMaybe, type JSX } from 'woby'

// // export const Toolbar = tw('div')`[@media(min-width:600px)]:relative [@media(min-width:600px)]:flex [@media(min-width:600px)]:items-center [@media(min-width:600px)]:px-4 h-full`
// export const Toolbar = tw('div')`relative flex items-center px-4 h-full`

// // `[@media(min-width:600px)]:h-min-[64px]
// // [@media(min-width:0px)]:h-min-[48px]
// // [@media(orientation:landscape)]:h-min-[48px]
// // [@media(min-width:600px)]:relative [@media(min-width:600px)]:flex [@media(min-width:600px)]:items-center [@media(min-width:600px)]:min-h-[56px] [@media(min-width:600px)]:px-6
// // `

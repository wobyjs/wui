import { $, $$, customElement, defaults, ElementAttributes, HtmlClass, HtmlString, ObservableMaybe, type JSX } from "woby"

const def = () => ({
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    children: $(null),
    type: $("default", HtmlString) as ObservableMaybe<string>
})

const variantStyle = {
    default: "relative flex items-center px-4 h-full"
}

const Toolbar = defaults(def, (props) => {
    const { cls, class: cn, children, type, ...otherProps } = props

    return (
        <div class={() => [variantStyle[$$(type)], () => $$(cls) ? $$(cls) : "", cn]}
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

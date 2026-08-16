import { type CustomElementChildren, $, $$, customElement, defaults, ElementAttributes, HtmlClass, HtmlString, ObservableMaybe, type JSX } from "woby"

const def = () => ({
    cls: $('', HtmlClass) as JSX.Class,
    class: $('', HtmlClass) as JSX.Class,
    children: $(null) as CustomElementChildren,
    type: $("default", HtmlString) as ObservableMaybe<string>
})

// Indexed by the `type`/`variant`/`size` prop, which is a free-form string on the custom
// element (attributes carry no enum), so the table needs a string index signature.
const variantStyle: Record<string, string> = {
    default: "relative flex items-center px-4 h-full"
}

const Toolbar: Defaulted<typeof def> = defaults(def, (props) => {
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

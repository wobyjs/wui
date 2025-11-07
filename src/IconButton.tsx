import { tw } from '@woby/styled'
//@ts-ignore
import { $, $$, isObservable, type JSX, defaults, customElement, ElementAttributes, HtmlBoolean } from 'woby'

/** color: [&_svg]:fill-current */
const IconButtonComponent = tw('button')`inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle appearance-none no-underline text-center flex-[0_0_auto] text-2xl overflow-visible text-[rgba(0,0,0,0.54)] transition-[background-color] duration ease-in-out delay-[0ms] m-0 p-2 rounded-[50%] border-0
[outline:0px] 
duration-[0.3s] hover:bg-[#dde0dd] 
[&_svg]:w-[1em] [&_svg]:h-[1em] [&_svg]:fill-current
disabled:bg-transparent disabled:text-[rgba(0,0,0,0.26)] disabled:[&_svg]:fill-[rgba(0,0,0,0.26)] disabled:pointer-events-none disabled:cursor-default
`

export const IconButton = defaults(() => ({
    disabled: $(false, HtmlBoolean)
}), (props: any) => {
    const { children, class: cls, disabled, ...otherProps } = props

    return (
        <IconButtonComponent
            disabled={disabled}
            class={cls}
            {...otherProps}
        >
            {children}
        </IconButtonComponent>
    )
})

// Register as a custom element
customElement('wui-icon-button', IconButton)

// Augment JSX intrinsic elements for better TypeScript support
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            /**
             * Woby Icon Button custom element
             * 
             * An icon button component that can be used as a custom element in HTML or JSX.
             * Designed for icon-only buttons with circular styling.
             * 
             * The ElementAttributes<typeof IconButton> type automatically includes:
             * - All HTML attributes
             * - Component-specific props
             * - Style properties via the style-* pattern (style$font-size in HTML, style-font-size in JSX)
             */
            'wui-icon-button': ElementAttributes<typeof IconButton>
        }
    }
}
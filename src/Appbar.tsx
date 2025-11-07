import { tw } from '@woby/styled'
//@ts-ignore
import { $, $$, Observable, ObservableMaybe, type JSX, defaults, customElement, ElementAttributes, HtmlBoolean } from 'woby'

const AppbarComponent = tw('header')`shadow-[rgba(0,0,0,0.2)_0px_2px_4px_-1px,rgba(0,0,0,0.14)_0px_4px_5px_0px,rgba(0,0,0,0.12)_0px_1px_10px_0px] [@media_screen]:flex [@media_screen]:flex-col w-full box-border shrink-0 fixed z-[1100] bg-[rgb(25,118,210)] text-white left-auto top-0
    [transition:box-shadow_300ms_cubic-bezier(0.4,0,0.2,1)0ms]`

const Appbar = defaults(() => ({}), (props: any) => {
    const { children, ...restProps } = props
    return <AppbarComponent {...restProps}>{children}</AppbarComponent>
})

// Register as a custom element
customElement('wui-appbar', Appbar)

// Augment JSX intrinsic elements for better TypeScript support
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            /**
             * Woby Appbar custom element
             * 
             * An app bar component that can be used as a custom element in HTML or JSX.
             * Typically used as a top navigation bar in applications.
             * 
             * The ElementAttributes<typeof Appbar> type automatically includes:
             * - All HTML attributes
             * - Component-specific props
             * - Style properties via the style-* pattern (style$font-size in HTML, style-font-size in JSX)
             */
            'wui-appbar': ElementAttributes<typeof Appbar>
        }
    }
}

export { Appbar }
import { tw } from '@woby/styled'
//@ts-ignore
import { $, $$, Observable, ObservableMaybe, type JSX, defaults, customElement, ElementAttributes } from 'woby'

const CardBase = tw('div')`bg-white text-[rgba(0,0,0,0.87)] transition-shadow duration-300 ease-in-out delay-[0ms] rounded shadow-[rgba(0,0,0,0.2)_0px_2px_1px_-1px,rgba(0,0,0,0.14)_0px_1px_1px_0px,rgba(0,0,0,0.12)_0px_1px_3px_0px] overflow-hidden`

const CardComponent = defaults(() => ({}), (props: any) => {
    const { children, ...restProps } = props
    return <CardBase {...restProps}>{children}</CardBase>
})

const CardMediaBase = (props: JSX.DOMAttributes<HTMLDivElement>) => <div class="block bg-cover bg-no-repeat bg-[center_center] h-[140px]" role="img" title="green iguana" style="background-image: url(/static/images/cards/contemplative-reptile.jpg)" {...props}>
</div>

const CardMediaComponent = defaults(() => ({}), (props: any) => {
    const { children, ...restProps } = props
    return <CardMediaBase {...restProps}>{children}</CardMediaBase>
})

const CardContentBase = tw('div')`p-[16px]`

const CardContentComponent = defaults(() => ({}), (props: any) => {
    const { children, ...restProps } = props
    return <CardContentBase {...restProps}>{children}</CardContentBase>
})

const CardActionsBase = tw('div')`flex items-center p-2`

const CardActionsComponent = defaults(() => ({}), (props: any) => {
    const { children, ...restProps } = props
    return <CardActionsBase {...restProps}>{children}</CardActionsBase>
})

// Register as custom elements
customElement('wui-card', CardComponent)
customElement('wui-card-media', CardMediaComponent)
customElement('wui-card-content', CardContentComponent)
customElement('wui-card-actions', CardActionsComponent)

// Augment JSX intrinsic elements for better TypeScript support
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            /**
             * Woby Card custom element
             * 
             * A card component that can be used as a custom element in HTML or JSX.
             * Provides a container for displaying content and actions about a single subject.
             * 
             * The ElementAttributes<typeof CardComponent> type automatically includes:
             * - All HTML attributes
             * - Component-specific props
             * - Style properties via the style-* pattern (style$font-size in HTML, style-font-size in JSX)
             */
            'wui-card': ElementAttributes<typeof CardComponent>
            
            /**
             * Woby Card Media custom element
             * 
             * A card media component that can be used as a custom element in HTML or JSX.
             * Displays media content in a card.
             * 
             * The ElementAttributes<typeof CardMediaComponent> type automatically includes:
             * - All HTML attributes
             * - Component-specific props
             * - Style properties via the style-* pattern (style$font-size in HTML, style-font-size in JSX)
             */
            'wui-card-media': ElementAttributes<typeof CardMediaComponent>
            
            /**
             * Woby Card Content custom element
             * 
             * A card content component that can be used as a custom element in HTML or JSX.
             * Displays the main content of a card.
             * 
             * The ElementAttributes<typeof CardContentComponent> type automatically includes:
             * - All HTML attributes
             * - Component-specific props
             * - Style properties via the style-* pattern (style$font-size in HTML, style-font-size in JSX)
             */
            'wui-card-content': ElementAttributes<typeof CardContentComponent>
            
            /**
             * Woby Card Actions custom element
             * 
             * A card actions component that can be used as a custom element in HTML or JSX.
             * Displays actions related to the card content.
             * 
             * The ElementAttributes<typeof CardActionsComponent> type automatically includes:
             * - All HTML attributes
             * - Component-specific props
             * - Style properties via the style-* pattern (style$font-size in HTML, style-font-size in JSX)
             */
            'wui-card-actions': ElementAttributes<typeof CardActionsComponent>
        }
    }
}

export { CardComponent as Card, CardMediaComponent as CardMedia, CardContentComponent as CardContent, CardActionsComponent as CardActions }
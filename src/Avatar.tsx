import { $, $$, useMemo, defaults, customElement, ElementAttributes, JSX } from 'woby'

function def() {
    return {
        className: $('w-10 h-10 bg-[rgb(189,189,189)]'),
        src: $(''),
        alt: $('')
    }
}

const AvatarComponent = defaults(def, ({ className = 'w-10 h-10 bg-[rgb(189,189,189)]', src, alt, children, ...props }: any): JSX.Child => {
    // const { className, ...p } = props
    const cls = props.class
    delete props.class

    const child = useMemo(() => $$(src) ? <img alt={alt} src={src} /> : children)

    return <div class={["relative flex items-center justify-center shrink-0  text-xl leading-none overflow-hidden select-none text-white m-0 rounded-[50%]", cls ?? className]}>{child}</div>
})

// Register as a custom element
customElement('wui-avatar', AvatarComponent)

// Augment JSX intrinsic elements for better TypeScript support
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            /**
             * Woby Avatar custom element
             * 
             * An avatar component that can be used as a custom element in HTML or JSX.
             * Displays either an image or text content in a circular container.
             * 
             * The ElementAttributes<typeof AvatarComponent> type automatically includes:
             * - All HTML attributes
             * - Component-specific props from AvatarProps
             * - Style properties via the style-* pattern (style$font-size in HTML, style-font-size in JSX)
             */
            'wui-avatar': ElementAttributes<typeof AvatarComponent>
        }
    }
}

export { AvatarComponent as Avatar }
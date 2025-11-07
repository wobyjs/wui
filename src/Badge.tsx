import { $, $$, Observable, ObservableMaybe, isObservable, useEffect, useMemo, type JSX, defaults, customElement, ElementAttributes, HtmlBoolean } from 'woby'

function def() {
    return {
        badgeContent: $('', { type: 'string' }) as ObservableMaybe<string> | undefined,
        vertical: $('top'),
        horizontal: $('right'),
        badgeClass: $('bg-[rgb(156,39,176)]')
    }
}

const BadgeComponent = defaults(def, (props: any): JSX.Element => {
    const { className, children, badgeContent, vertical = 'top', horizontal = 'right', badgeClass = `bg-[rgb(156,39,176)]`, open: op, ...restProps } = props
    const { class: cls, ...ps } = restProps
    const empty = useMemo(() => $$(badgeContent) ? 'min-w-[20px] h-5 rounded-[10px] px-1' : 'hidden' /* min-w-[8px] h-2 rounded px-0  */)

    const pos = useMemo(() => {
        const [v, h] = [$$(vertical), $$(horizontal)]
        return v === 'top' ? (h === 'right' ? `translate-x-2/4 -translate-y-2/4 origin-[100%_0%]` : `-translate-x-2/4 -translate-y-2/4 origin-[0%_0%]`) :
            (h === 'right' ? `translate-x-2/4 translate-y-2/4 origin-[100%_100%]` : `-translate-x-2/4 translate-y-2/4 origin-[0%_100%]`)
    })

    return <span class="relative inline-flex align-middle shrink-0 m-4">
        {children}
        <span class={[`flex place-content-center items-center absolute box-border font-medium text-xs leading-none z-[1] text-white scale-100 right-0 top-0 [flex-flow:wrap]
        [transition:transform_225ms_cubic-bezier(0.4,0,0.2,1)0ms`, empty, pos, badgeClass]}>{badgeContent}</span>
    </span>
})

// Register as a custom element
customElement('wui-badge', BadgeComponent)

// Augment JSX intrinsic elements for better TypeScript support
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            /**
             * Woby Badge custom element
             * 
             * A badge component that can be used as a custom element in HTML or JSX.
             * Displays a small badge with content, typically used to indicate status or counts.
             * 
             * The ElementAttributes<typeof BadgeComponent> type automatically includes:
             * - All HTML attributes
             * - Component-specific props from BadgeProps
             * - Style properties via the style-* pattern (style$font-size in HTML, style-font-size in JSX)
             */
            'wui-badge': ElementAttributes<typeof BadgeComponent>
        }
    }
}

export { BadgeComponent as Badge }
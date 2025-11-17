import { $, $$, defaults, type JSX, customElement, type ElementAttributes, type ObservableMaybe, type CustomElementChildren, isObservable, StyleEncapsulationProps } from "woby"
import '@woby/chk'
import './input.css'

// Define types for better type safety
type VerticalPosition = 'top' | 'bottom'
type HorizontalPosition = 'left' | 'right'

// Define the Badge props type
type BadgeProps = {
    className?: ObservableMaybe<string>;
    children?: ObservableMaybe<JSX.Child> & CustomElementChildren;
    badgeContent?: ObservableMaybe<JSX.Child>;
    badgeClass?: ObservableMaybe<JSX.Class>;
    vertical?: ObservableMaybe<VerticalPosition>;
    horizontal?: ObservableMaybe<HorizontalPosition>;
}

// Default props with explicit typing
const def = () => ({
    cls: $(''),
    children: $(null as JSX.Child),
    badgeContent: $('' as JSX.Child),
    badgeClass: $("bg-[rgb(156,39,176)]" as JSX.Class),
    // vertical: $<'top' | 'bottom'>('top'),
    // horizontal: $<'left' | 'right'>('right'),
    vertical: $('top' as 'top' | 'bottom'),
    horizontal: $('right' as HorizontalPosition),
})

const Badge = defaults(def, (props) => {
    const { cls, children, badgeContent, badgeClass, vertical, horizontal, ...otherProps } = props

    const isEmpty = () => !($$(badgeContent))

    // Badge visibility class
    const visibilityClass = () => isEmpty() ? 'hidden' : 'min-w-[20px] h-5 rounded-[10px] px-1'

    // Transform origin based on position
    const transformOriginClass = () => {
        if (vertical() === 'top') {
            return horizontal() === 'right'
                ? 'translate-x-2/4 -translate-y-2/4 origin-[100%_0%]'
                : '-translate-x-2/4 -translate-y-2/4 origin-[0%_0%]'
        }

        // bottom
        return horizontal() === 'right'
            ? 'translate-x-2/4 translate-y-2/4 origin-[100%_100%]'
            : '-translate-x-2/4 translate-y-2/4 origin-[0%_100%]'
    }

    // Absolute positioning classes
    const positionClasses = () => {
        return `${vertical() === 'top' ? 'top-0' : 'bottom-0'} ${horizontal() === 'right' ? 'right-0' : 'left-0'}`
    }

    return (
        <div>
            {/* <p className="m-2 p-2">Badge Content: <span className="text-blue-500 font-bold">{content()}</span></p>{() => $$(displayText)} */}
            {/* <p className="m-2 p-2">Badge Content: <span className="text-blue-500 font-bold">{badgeContent}</span></p> */}
            {/* <p className="m-2 p-2">Badge Anchor: <span className="text-blue-500 font-bold">{vertical} - {horizontal}</span></p> */}
            {/* <p className="m-2 p-2">Class Name <span className="text-blue-500 font-bold">{className}</span></p> */}
            <span class={() => `relative inline-flex align-middle shrink-0 m-4 ${(cls)}`} {...otherProps}>
                {(children)}
                <span
                    class={() => [
                        // Core badge styling
                        'flex place-content-center items-center absolute box-border font-medium text-xs leading-none z-[1] text-white scale-100 [flex-flow:wrap] [transition:transform_225ms_cubic-bezier(0.4,0,0.2,1)0ms]',
                        visibilityClass(),
                        transformOriginClass(),
                        positionClasses(),
                        (badgeClass),
                    ].join(' ')}
                >
                    {(badgeContent)}
                </span>
            </span>
        </div>

    )
}) as typeof Badge & StyleEncapsulationProps

export { Badge }

// Register the custom element
customElement('wui-badge', Badge)

// Add the custom element to the JSX namespace
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-badge': ElementAttributes<typeof Badge>
        }
    }
}

export default Badge

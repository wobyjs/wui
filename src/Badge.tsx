import { $, $$, defaults, type JSX, customElement, type ElementAttributes, type ObservableMaybe, type CustomElementChildren, isObservable, StyleEncapsulationProps, useEffect, HtmlClass, HtmlString } from "woby"
import '@woby/chk'
import './input.css'

// Define types for better type safety
type VerticalPosition = 'top' | 'bottom'
type HorizontalPosition = 'left' | 'right'

// Define the Badge props type
type BadgeProps = {
    className?: ObservableMaybe<string>
    children?: ObservableMaybe<JSX.Child> & CustomElementChildren
    badgeContent?: ObservableMaybe<JSX.Child>
    badgeClass?: ObservableMaybe<JSX.Class>
    vertical?: ObservableMaybe<VerticalPosition>
    horizontal?: ObservableMaybe<HorizontalPosition>
    class?: ObservableMaybe<JSX.Class>
}

// Default props with explicit typing
const def = () => ({
    /** 
     * Custom CSS classes to apply to the badge.
     * 
     * Class override mechanism:
     * - `cls` prop: Used as the primary class, if undefined the default classes are used
     * - `class` prop (aliased as `cn`): Additional classes that patch/extend the given classes
     * 
     * Usage:
     * - When `cls` is undefined, the default classes are used
     * - User can override the default class by providing a `cls` prop
     * - `class` can be used to add additional classes to the component
     */
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    children: $(null as JSX.Child),
    badgeContent: $(null as JSX.Child),
    badgeClass: $("bg-[rgb(156,39,176)]", HtmlClass) as JSX.Class | undefined, //$("bg-[rgb(156,39,176)]" as JSX.Class),
    vertical: $('top', HtmlString) as ObservableMaybe<VerticalPosition>,
    horizontal: $('right', HtmlString) as ObservableMaybe<HorizontalPosition>,
})

const Badge = defaults(def, (props) => {
    // console.log('Badge: props received:', props)
    const { class: cn, cls, children, badgeContent, badgeClass, vertical, horizontal, ...otherProps } = props
    // console.log('Badge: destructured props - badgeContent:', badgeContent, 'otherProps:', otherProps)

    // Handle attribute and prop values
    useEffect(() => {
        // console.log('Badge: useEffect running')
        // First check if badgeContent is provided as a prop
        const contentValue = $$(badgeContent)
        if (contentValue) {
            // console.log('Badge: Using prop content value:', contentValue)
            return
        }

        // If no prop value, check for the badge-content attribute from otherProps
        // For custom elements, attributes are passed in otherProps
        // HTML attributes with hyphens are converted to camelCase
        // console.log('Badge: Checking otherProps for badge content...')
        // console.log('Badge: otherProps keys:', Object.keys(otherProps))

        if (otherProps['badgeContent']) {
            badgeContent(otherProps['badgeContent'])
            // console.log('Badge: Using badgeContent attribute:', otherProps['badgeContent'])
        } else if (otherProps['badge-content']) {
            badgeContent(otherProps['badge-content'])
            // console.log('Badge: Using badge-content attribute:', otherProps['badge-content'])
        } else if (otherProps['children']) {
            // For HTML custom elements, content might be passed as children
            badgeContent(otherProps['children'])
            // console.log('Badge: Using children attribute:', otherProps['children'])
        } else {
            // For custom elements, we might need to access the attribute directly from the element
            // This is a fallback for when the attribute isn't properly passed through otherProps
            // console.log('Badge: No content found in props, otherProps:', otherProps)
            // Try to access the attribute directly from the element
            // This is a workaround for cases where the attribute conversion is not working
            // console.log('Badge: Trying to access attribute directly from element')
        }
    })

    const isEmpty = () => {
        const empty = !($$(badgeContent))
        // console.log('Badge: isEmpty check, badgeContent:', $$(badgeContent), 'result:', empty)
        return empty
    }

    // Badge visibility class
    const visibilityClass = () => {
        const empty = isEmpty()
        const visClass = empty ? 'hidden' : 'min-w-[20px] h-5 rounded-[10px] px-1'
        // console.log('Badge: visibilityClass, isEmpty:', empty, 'class:', visClass)
        return visClass
    }

    // Transform origin based on position
    const transformOriginClass = () => {
        if (vertical === 'top') {
            return horizontal === 'right'
                ? 'translate-x-2/4 -translate-y-2/4 origin-[100%_0%]'
                : '-translate-x-2/4 -translate-y-2/4 origin-[0%_0%]'
        }

        // bottom
        return horizontal === 'right'
            ? 'translate-x-2/4 translate-y-2/4 origin-[100%_100%]'
            : '-translate-x-2/4 translate-y-2/4 origin-[0%_100%]'
    }

    // Absolute positioning classes
    const positionClasses = () => {
        const posClass = `${vertical === 'top' ? 'top-0' : 'bottom-0'} ${horizontal === 'right' ? 'right-0' : 'left-0'}`
        // console.log('Badge: positionClasses:', posClass)
        return posClass
    }

    return (
        <div>
            <span class={[() => $$(cls) ? $$(cls) : `relative inline-flex align-middle shrink-0 m-4`, cn]} {...otherProps}>
                <span
                    class={() => {
                        const classes = [
                            // Core badge styling
                            'flex place-content-center items-center absolute box-border font-medium text-xs leading-none z-[1] text-white scale-100 [flex-flow:wrap] [transition:transform_225ms_cubic-bezier(0.4,0,0.2,1)0ms]',
                            visibilityClass(),
                            transformOriginClass(),
                            positionClasses(),
                            (badgeClass),
                        ].join(' ')
                        // console.log('Badge: span classes:', classes)
                        return classes
                    }}
                >
                    {() => {
                        const content = $$(badgeContent)
                        // console.log('Badge: rendering content:', content)
                        return content
                    }}
                </span>
                {children}
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
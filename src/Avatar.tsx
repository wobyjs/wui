import { $, $$, defaults, type JSX, isObservable, customElement, type ElementAttributes, type Observable, type ObservableMaybe, type CustomElementChildren, type StyleEncapsulationProps, useEffect, useMemo, HtmlClass } from "woby"
import '@woby/chk'
import './input.css'

type Size = "xs" | "sm" | "md" | "lg"
type Variant = "circular" | "rounded" | "square" | "custom"

// Define the Avatar props type
type AvatarProps = {
    src?: ObservableMaybe<string | null>
    alt?: ObservableMaybe<string>
    children?: ObservableMaybe<JSX.Child> & CustomElementChildren
    class?: ObservableMaybe<string>
    size?: ObservableMaybe<Size>
    variant?: ObservableMaybe<Variant>
}

// Default props
const def = () => ({
    /** 
     * Custom CSS classes to apply to the avatar.
     * 
     * Class override mechanism:
     * - `class` prop (aliased as `cn`): Used as the primary class, if undefined the default variant classes are used
     * - `cls` prop: Additional classes that patch/extend the given classes
     * 
     * Usage:
     * - When `class` is undefined, the default variant classes are used
     * - User can override the default class by providing a `class` prop
     * - `cls` can be used to add additional classes to the component
     */
    class: $('', HtmlClass) as JSX.Class | undefined,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    src: $(null as string | null),
    alt: $("Avatar"),
    children: $(null as JSX.Child),
    size: $("md" as Size),                 // xs | sm | md | lg
    type: $("circular"),
})

const BASE_CLASS =
    "relative flex items-center justify-center align-middle select-none leading-none overflow-hidden shrink-0 text-white m-0 bg-[rgb(189,189,189)]"

const variantStyle = {
    circular: [BASE_CLASS, "rounded-full"].join(" ").trim(),
    rounded: [BASE_CLASS, "rounded-xl"].join(" ").trim(),
    square: [BASE_CLASS, "rounded-md"].join(" ").trim(),
}

const sizeStyle = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
}

const Avatar = defaults(def, (props) => {
    const { cls, class: cn, src: src, alt: alt, children, size, type: variant, ...otherProps } = props

    // normalise src / alt into observables
    const srcObs = isObservable(src) ? (src as ObservableMaybe<string | null>) : $(src as string | null)
    const altObs = isObservable(alt) ? (alt as ObservableMaybe<string>) : $(alt as string)

    // what to render inside
    const child = useMemo(() => {
        const s = $$(srcObs)
        const a = $$(altObs)
        if (s) {
            return <img src={s} alt={a} class="w-full h-full object-cover" />
        }
        // initials / custom children
        return children ?? (a ? a[0] : "")
    })

    return (
        <div
            class={[() => $$(cn) ? $$(cn) : variantStyle[$$(variant)], cls]}
            {...otherProps}
        >
            {child}
            {/* <pre>
                <p>Class: <span>{className}</span></p>
            </pre> */}
        </div>
    )
}) as typeof Avatar

// NOTE: Register the custom element
customElement('wui-avatar', Avatar)

// NOTE: Add the custom element to the JSX namespace
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-avatar': ElementAttributes<typeof Avatar>
        }
    }
}

export { Avatar }
export default Avatar


// #region Orginal Avatar
// import { $, $$, useMemo } from 'woby'
// //@ts-ignore
// import { Observable, ObservableMaybe, type JSX } from 'woby'


// export const Avatar = ({ className = 'w-10 h-10 bg-[rgb(189,189,189)]', src, alt, children, ...props }: JSX.HTMLAttributes<HTMLDivElement> & JSX.ImgHTMLAttributes<HTMLImageElement>): JSX.Child => {
//     // const { className, ...p } = props
//     const cls = props.class
//     delete props.class

//     const child = useMemo(() => $$(src) ? <img alt={alt} src={src} /> : children)

//     return <div class={["relative flex items-center justify-center shrink-0  text-xl leading-none overflow-hidden select-none text-white m-0 rounded-[50%]", cls ?? className]}>{child}</div>
// }
// #endregion
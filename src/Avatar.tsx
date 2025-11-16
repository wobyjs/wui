import { $, $$, defaults, type JSX, isObservable, customElement, type ElementAttributes, type Observable, type ObservableMaybe, type CustomElementChildren, type StyleEncapsulationProps, useEffect, useMemo } from "woby"
import '@woby/chk'
import './input.css'

type Size = "xs" | "sm" | "md" | "lg"
type Variant = "circular" | "rounded" | "square"

// Define the Avatar props type
type AvatarProps = {
    src?: ObservableMaybe<string | null>;
    alt?: ObservableMaybe<string>;
    children?: ObservableMaybe<JSX.Child> & CustomElementChildren;
    class?: ObservableMaybe<string>;
    size?: ObservableMaybe<Size>;
    variant?: ObservableMaybe<Variant>;
}

// Default props
const def = () => ({
    // class: $("w-10 h-10 bg-[rgb(189,189,189)]"),
    cls: $(""),
    src: $(null as string | null),
    alt: $("Avatar"),
    children: $(null as JSX.Child),
    size: $("md" as Size),                 // xs | sm | md | lg
    variant: $("circular" as Variant),
})

const Avatar = defaults(def, (props) => {
    const { cls, src: src, alt: alt, children, size, variant, ...otherProps } = props

    // Size variants
    const sizeClass = () => {
        switch ($$(size)) {
            case "xs":
                return "w-6 h-6 text-xs"
            case "sm":
                return "w-8 h-8 text-sm"
            case "lg":
                return "w-12 h-12 text-lg"
            case "md":
            default:
                return "w-10 h-10 text-base"
        }
    }

    // Shape variants
    const variantClass = () => {
        switch ($$(variant)) {
            case "rounded":
                return "rounded-xl"
            case "square":
                return "rounded-md"
            case "circular":
            default:
                return "rounded-full"
        }
    }

    // Convert plain values to observables if needed
    // const srcObs = isObservable(src) ? src : $(src);
    // const altObs = isObservable(alt) ? alt : $(alt);

    // const child = useMemo(() => $$(srcObs) ? <img alt={$$(altObs)} src={$$(srcObs)} /> : children)
    // const child = useMemo(() => $$(srcObs) ? <img class="w-full h-full object-cover" alt={$$(altObs)} src={$$(srcObs)} /> : children) // MODIFIED: Added classes to the img tag to ensure it fills the avatar container, making it fully rounded.

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


    // const baseClass = "relative flex items-center justify-center shrink-0 leading-none overflow-hidden select-none text-white"
    // const baseClass =
    //     "relative flex items-center justify-center align-middle select-none leading-none " +
    //     "overflow-hidden shrink-0 text-white m-0 bg-[rgb(189,189,189)]"

    const baseClass =
        "relative flex items-center justify-center align-middle " +
        "select-none leading-none overflow-hidden shrink-0 text-white m-0 bg-[rgb(189,189,189)]"

    return (
        <div
            class={() => [baseClass, sizeClass(), variantClass(), $$(cls)].join(" ")}
            {...otherProps}
        >
            {child}
            {/* <pre>
                <p>Class: <span>{className}</span></p>
            </pre> */}
        </div>


        // <div
        //     class={() =>
        //         [
        //             baseClass,
        //             sizeClass(),
        //             variantClass(),
        //             $$(className), // user overrides go last
        //         ]
        //             .join(" ")
        //     }
        //     {...otherProps}
        // >
        //     {/* If src is set, render an image. Otherwise use children/initials */}
        //     {() =>
        //         src()
        //             ? (
        //                 <img
        //                     src={src()}
        //                     alt={alt()}
        //                     class="w-full h-full object-cover"
        //                 />
        //             )
        //             : (
        //                 <span class="leading-none">
        //                     {children ?? (alt() ? alt()[0] : "")}
        //                 </span>
        //             )
        //     }
        // </div>

        // <div class={
        //     ["relative flex items-center justify-center shrink-0 text-xl leading-none overflow-hidden select-none text-white m-0 rounded-[50%]", className]
        //     } {...otherProps}>
        //     {child}
        // </div>


        // <div>
        //     <div class={["relative flex items-center justify-center shrink-0 text-xl leading-none overflow-hidden select-none text-white m-0 rounded-[50%]", cls ?? className]} {...otherProps}>
        //         {child}
        //     </div>
        //     <pre>
        //         <p>Class: <span>{className}</span></p>
        //     </pre>
        // </div>
    )
}) as typeof Avatar & StyleEncapsulationProps

// NOTE: Register the custom element
customElement('wui-avatar', Avatar);

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
import { $, $$, defaults, type JSX, isObservable, customElement, type ElementAttributes, type Observable, type ObservableMaybe, type CustomElementChildren, type StyleEncapsulationProps, useEffect, useMemo } from "woby"
import '@woby/chk'
import './input.css'

// Define the Avatar props type
type AvatarProps = {
    src?: ObservableMaybe<string | null>;
    alt?: ObservableMaybe<string>;
    children?: ObservableMaybe<JSX.Child> & CustomElementChildren;
    class?: ObservableMaybe<string>;
}

// Default props
const def = () => ({
    class: $("w-10 h-10 bg-[rgb(189,189,189)]"),
    src: $(null as string | null),
    alt: $("Avatar"),
    children: $(null as JSX.Child),
})

const Avatar = defaults<AvatarProps>(def, (props: AvatarProps) => {
    const { class: className, src, alt, children, class: cls, ...otherProps } = props

    // Convert plain values to observables if needed
    const srcObs = isObservable(src) ? src : $(src);
    const altObs = isObservable(alt) ? alt : $(alt);

    const child = useMemo(() => $$(srcObs) ? <img alt={$$(altObs)} src={$$(srcObs)} /> : children)

    return (
        <div class={["relative flex items-center justify-center shrink-0 text-xl leading-none overflow-hidden select-none text-white m-0 rounded-[50%]", cls ?? className]} {...otherProps}>
            {child}
        </div>
        // <div>
        //     <div class={["relative flex items-center justify-center shrink-0 text-xl leading-none overflow-hidden select-none text-white m-0 rounded-[50%]", cls ?? className]} {...otherProps}>
        //         {child}
        //     </div>
        //     <pre>
        //         <p>Class: <span>{className}</span></p>
        //     </pre>
        // </div>
    )
})

export { Avatar }


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
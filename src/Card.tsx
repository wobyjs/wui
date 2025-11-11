
import { $, $$, defaults, type JSX, customElement, type ElementAttributes, type ObservableMaybe, useEffect, StyleEncapsulationProps, HtmlBoolean } from "woby"
import "@woby/chk"
import "./input.css"


/* ========= Types ========= */
type Elevation = 0 | 1 | 2 | 3 | 4
type Variant = "elevated" | "outlined" | "filled"
type Justify = "start" | "end" | "between" | "center"

/* ========= Card ========= */
type CardProps = JSX.HTMLAttributes<HTMLDivElement> & {
    class?: ObservableMaybe<JSX.Class>
    children?: ObservableMaybe<JSX.Child>

    /** Shadow style or border (default: elevated) */
    variant?: ObservableMaybe<Variant>
    /** Elevation 0–4 (default: 1) */
    elevation?: ObservableMaybe<Elevation>
    /** Raise on hover (default: false) */
    interactive?: ObservableMaybe<boolean>
}

/* ========= CardMedia ========= */
type CardMediaProps = JSX.HTMLAttributes<HTMLDivElement> & {
    /** Image URL (background cover) */
    src?: ObservableMaybe<string>
    /** Alt/title text */
    alt?: ObservableMaybe<string>
    /** Height (e.g., '140px', '12rem') */
    height?: ObservableMaybe<string>
    /** CSS background-position (e.g., 'center', 'top', '50% 50%') */
    position?: ObservableMaybe<string>
    /** object-fit style; for bg-cover it’s typically 'cover' */
    fit?: ObservableMaybe<"cover" | "contain" | "fill" | "none" | "scale-down">
    class?: ObservableMaybe<JSX.Class>
}

/* ========= CardContent ========= */
type CardContentProps = JSX.HTMLAttributes<HTMLDivElement> & {
    class?: ObservableMaybe<JSX.Class>
    children?: ObservableMaybe<JSX.Child>
    /** Padding utility (default 'p-4') */
    padding?: ObservableMaybe<JSX.Class>
}
/* ========= CardAction ========= */
type CardActionsProps = JSX.HTMLAttributes<HTMLDivElement> & {
    class?: ObservableMaybe<JSX.Class>
    children?: ObservableMaybe<JSX.Child>
    /** Horizontal alignment (default: start) */
    align?: ObservableMaybe<Justify>
    /** Padding utility (default: p-2) */
    padding?: ObservableMaybe<JSX.Class>
}

const defCard = () => ({
    cls: $(""),
    children: $(null as JSX.Child),
    variant: $("elevated" as Variant),
    elevation: $(1 as Elevation, { type: 'number' } as const),
    // interactive: $(false, { type: 'boolean' } as const),
    interactive: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
})

const defCardMedia = () => ({
    src: $("" as string),
    alt: $("" as string),
    height: $("140px"),
    position: $("center center"),
    fit: $("cover" as "cover" | "contain" | "fill" | "none" | "scale-down"),
    cls: $(""),
})

const defCardContent = () => ({
    cls: $(""),
    children: $(null as JSX.Child),
    padding: $("p-4" as JSX.Class),
})

const defCardAction = () => ({
    cls: $(""),
    children: $(null as JSX.Child),
    align: $("start" as Justify),
    padding: $("p-2" as JSX.Class),
})

/* ========= Helpers ========= */
const elevationCls = (e: Elevation) => {
    switch (e) {
        case 0:
            return "shadow-none" // No shadow
        case 1:
            return "shadow-md"   // A clear, medium shadow
        case 2:
            return "shadow-lg"   // A larger, more obvious shadow
        case 3:
            return "shadow-xl"   // An even larger shadow
        case 4:
            return "shadow-2xl"  // The largest, most prominent shadow
    }
}
// const elevationCls = (e: Elevation) => {
//     switch (e) {
//         case 0:
//             return "shadow-none"
//         case 1:
//             return "shadow-[rgba(0,0,0,0.2)_0px_2px_1px_-1px,rgba(0,0,0,0.14)_0px_1px_1px_0px,rgba(0,0,0,0.12)_0px_1px_3px_0px]"
//         case 2:
//             return "shadow-[rgba(0,0,0,0.2)_0px_3px_1px_-2px,rgba(0,0,0,0.14)_0px_2px_2px_0px,rgba(0,0,0,0.12)_0px_1px_5px_0px]"
//         case 3:
//             return "shadow-[rgba(0,0,0,0.2)_0px_3px_3px_-2px,rgba(0,0,0,0.14)_0px_3px_4px_0px,rgba(0,0,0,0.12)_0px_1px_8px_0px]"
//         case 4:
//             return "shadow-[rgba(0,0,0,0.2)_0px_4px_5px_-2px,rgba(0,0,0,0.14)_0px_7px_10px_1px,rgba(0,0,0,0.12)_0px_2px_16px_1px]"
//     }
// }

const Card = defaults(defCard, (props) => {

    const { cls, children, variant, elevation, interactive, ...otherProps } = props

    // const v = () => ((variant) ?? "elevated") as Variant
    // const e = () => ((elevation) ?? 1) as Elevation
    // const interactive = () => (_i) ?? false
    // const extra = () => className ?? ""
    // const kids = () => children

    // const base = "bg-white text-[rgba(0,0,0,0.87)] transition-shadow duration-300 ease-in-out  rounded overflow-hidden [transition-delay:0ms]"
    const base = "bg-white text-[rgba(0,0,0,0.87)] rounded overflow-hidden transition-[box-shadow,transform] duration-300 ease-in-out [transition-delay:0ms]"

    const variantCls = () =>
        variant() === "outlined"
            ? "border border-[rgba(0,0,0,0.12)] shadow-none" : variant() === "filled"
                ? "!bg-gray-50 " + elevationCls(elevation() as Elevation) : elevationCls(elevation() as Elevation)

    const interactiveCls = () =>
        interactive == true ? "cursor-pointer hover:shadow-[rgba(0,0,0,0.2)_0px_4px_5px_-2px,rgba(0,0,0,0.14)_0px_7px_10px_1px,rgba(0,0,0,0.12)_0px_2px_16px_1px]" : ""
    // interactive() ? "cursor-pointer hover:-translate-y-1 hover:shadow-[rgba(0,0,0,0.2)_0px_8px_10px_-5px,rgba(0,0,0,0.14)_0px_16px_24px_2px,rgba(0,0,0,0.12)_0px_6px_30px_5px]" : ""
    // interactive() ? "cursor-pointer hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgb(0,0,0,0.4)]" : ""

    const compileClass = () => [base, variantCls(), interactiveCls(), cls()].join(" ")

    return (
        <div
            class={() => [base, variantCls(), interactiveCls(), cls()].join(" ")}
            {...otherProps}
        >
            {/* <p>Attribute</p>
            <pre class="whitespace-pre-wrap justify m-2 p-2 border border-black overflow-auto">
                Variant: {() => variant()}<br />
                Elevation: {() => elevation()}<br />
                Interactive: {() => String(interactive)} <br />
                Interactive Cls: {interactiveCls()}
            </pre>
            <p>Compile Class</p>
            <pre class="whitespace-pre-wrap justify m-2 p-2 border border-black overflow-auto">
                {() => compileClass()}
            </pre> */}
            {children}
        </div >
    )
}) as typeof Card

const CardMedia = defaults(defCardMedia, (props) => {
    const { cls, src, alt, height, position, fit, ...otherProps } = props

    // const src = () => _src ?? ""
    // const alt = () => _alt ?? ""
    // const height = () => _height ?? "140px"
    // const pos = () => position ?? "center center"
    // const fit = () => _fit ?? "cover"
    // const extra = () => className ?? ""

    // console.log("CardMedia src: ", src());
    // console.log("CardMedia alt: ", alt());
    // console.log("CardMedia height: ", height());
    // console.log("CardMedia position: ", position());
    // console.log("CardMedia fit: ", fit());

    return (
        <div
            role="img"
            title={alt()}
            aria-label={alt()}
            class={() => ["block bg-no-repeat", $$(cls)].join(" ")}
            style={() => ({
                height: height(),
                backgroundImage: src() ? `url(${src()})` : "",
                backgroundPosition: position(),
                backgroundSize: fit(),
            })}
            {...otherProps}
        />
    )
}) as typeof CardMedia & StyleEncapsulationProps

const CardContent = defaults(defCardContent, (props) => {
    const { cls, children, padding, ...otherProps } = props

    // const pad = () => (padding) ?? "p-4"
    // const extra = () => (className) ?? ""
    // const kids = () => (children)

    // console.log("CardContent Padding: ", padding());
    // console.log("CardContent Class: ", className());
    // console.log("CardContent children: ", children());

    return (
        <div class={() => [padding(), cls()].join(" ")} {...otherProps}>
            {children()}
        </div>
    )
}) as typeof CardContent & StyleEncapsulationProps

const CardActions = defaults(defCardAction, (props) => {

    const { cls, children, align, padding, ...otherProps } = props

    // const align = () => ((_align) ?? "start") as Justify
    // const pad = () => (padding) ?? "p-2"
    // const extra = () => (className) ?? ""
    // const kids = () => (children)

    const justify = () => align() == "end" ? "justify-end" : align() == "between" ? "justify-between" : align() == "center" ? "justify-center" : "justify-start"

    // console.log("CardActions Align: ", align());
    // console.log("CardActions Padding: ", padding());
    // console.log("CardActions ClassName: ", className());
    // console.log("CardActions Justify: ", justify());

    return (
        <div
            class={() => ["flex items-center", justify(), padding(), cls()].join(" ")}
            {...otherProps}
        >
            {children()}
        </div>
    )
}) as typeof CardActions & StyleEncapsulationProps

export { Card, CardMedia, CardContent, CardActions }

customElement("wui-card", Card)
customElement("wui-card-media", CardMedia)
customElement("wui-card-content", CardContent)
customElement("wui-card-actions", CardActions)

declare module "woby" {
    namespace JSX {
        interface IntrinsicElements {
            "wui-card": ElementAttributes<typeof Card>
            "wui-card-media": ElementAttributes<typeof CardMedia>
            "wui-card-content": ElementAttributes<typeof CardContent>
            "wui-card-actions": ElementAttributes<typeof CardActions>
        }
    }
}

export default Card

// #region Original Card, CardMedia, CardContent, CardAction
// import { tw } from '@woby/styled'
// //@ts-ignore
// import { Observable, ObservableMaybe, type JSX } from 'woby'

// export const Card = tw('div')`bg-white text-[rgba(0,0,0,0.87)] transition-shadow duration-300 ease-in-out delay-[0ms] rounded shadow-[rgba(0,0,0,0.2)_0px_2px_1px_-1px,rgba(0,0,0,0.14)_0px_1px_1px_0px,rgba(0,0,0,0.12)_0px_1px_3px_0px] overflow-hidden`

// export const CardMedia = (props: JSX.DOMAttributes<HTMLDivElement>) => <div class="block bg-cover bg-no-repeat bg-[center_center] h-[140px]" role="img" title="green iguana" style="background-image: url(/static/images/cards/contemplative-reptile.jpg)" {...props}>
// </div>

// export const CardContent = tw('div')`p-[16px]`

// export const CardActions = tw('div')`flex items-center p-2`
// #endregion
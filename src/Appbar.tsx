// #region JenSien Appbar
// import { $, $$, defaults, type JSX, customElement, type ElementAttributes, type ObservableMaybe, useEffect } from "woby"
// import "@woby/chk"
// import "./input.css"

// type Color = "primary" | "surface" | "transparent" | "custom"
// type Position = "fixed" | "sticky" | "static"
// type Edge = "top" | "bottom"

// type AppbarProps = JSX.HTMLAttributes<HTMLElement> & {
//     cls?: ObservableMaybe<JSX.Class>
//     children?: ObservableMaybe<JSX.Child>

//     /** Color preset (default: primary) */
//     color?: ObservableMaybe<Color>
//     /** When color='custom', background class (e.g. 'bg-black/80') */
//     bgClass?: ObservableMaybe<JSX.Class>
//     /** Optional text class override (e.g. 'text-white') */
//     textClass?: ObservableMaybe<JSX.Class>

//     /** Elevation 0–4 (default: 2) */
//     elevation?: ObservableMaybe<0 | 1 | 2 | 3 | 4>

//     /** fixed|sticky|static (default: fixed) */
//     position?: ObservableMaybe<Position>
//     /** top|bottom (default: top) */
//     edge?: ObservableMaybe<Edge>

//     /** Dense height (default: false) */
//     dense?: ObservableMaybe<boolean>

//     /** z-index (default: 1100) */
//     z?: ObservableMaybe<number>
// }

// const def = () => ({
//     cls: $('', HtmlClass) as ObservableMaybe<JSX.Class>|undefined,
//     children: $("" as JSX.Child),
//     color: $("primary" as Color),
//     bgclass: $('', HtmlClass) as ObservableMaybe<JSX.Class>|undefined,
//     textclass: $('', HtmlClass) as ObservableMaybe<JSX.Class>|undefined,
//     elevation: $(2 as 0 | 1 | 2 | 3 | 4),
//     position: $("fixed" as Position),
//     edge: $("top" as Edge),
//     dense: $(false),
//     z: $(1100),
//     offset: $(true as boolean),
// })


// const Appbar = defaults(def, (props) => {

//     const { cls, children, color, bgClass, textClass, elevation, position, edge, dense, z, offset, ...otherProps } = props

//     // unwrap helpers with read-time defaults
//     // const color = () => ($$(props.color) ?? "primary") as Color
//     // const bgCustom = () => $$(props.bgClass) ?? ""
//     // const textCls = () => $$(props.textClass) ?? ""
//     // const elevation = () => ($$(props.elevation) ?? 2) as 0 | 1 | 2 | 3 | 4
//     // const position = () => ($$(props.position) ?? "fixed") as Position
//     // const edge = () => ($$(props.edge) ?? "top") as Edge
//     // const dense = () => $$(props.dense) ?? false
//     // const z = () => $$(props.z) ?? 1100
//     // const extra = () => $$(props.className) ?? ""
//     // const kids = () => $$(props.children)

//     const colorCls = () => {
//         switch (color()) {
//             case "surface":
//                 return "bg-white text-gray-900"
//             case "transparent":
//                 return "bg-transparent text-inherit"
//             case "custom":
//                 return `${bgClass()} ${textClass()}`.trim()
//             case "primary":
//             default:
//                 return "bg-[rgb(25,118,210)] text-white"
//         }
//     }

//     const elevationCls = () => {
//         switch (elevation()) {
//             case 0:
//                 return "shadow-none"
//             case 1:
//                 return "shadow-[rgba(0,0,0,0.2)_0px_2px_1px_-1px,rgba(0,0,0,0.14)_0px_1px_1px_0px,rgba(0,0,0,0.12)_0px_1px_3px_0px]"
//             case 2:
//                 return "shadow-[rgba(0,0,0,0.2)_0px_3px_1px_-2px,rgba(0,0,0,0.14)_0px_2px_2px_0px,rgba(0,0,0,0.12)_0px_1px_5px_0px]"
//             case 3:
//                 return "shadow-[rgba(0,0,0,0.2)_0px_3px_3px_-2px,rgba(0,0,0,0.14)_0px_3px_4px_0px,rgba(0,0,0,0.12)_0px_1px_8px_0px]"
//             case 4:
//                 return "shadow-[rgba(0,0,0,0.2)_0px_4px_5px_-2px,rgba(0,0,0,0.14)_0px_7px_10px_1px,rgba(0,0,0,0.12)_0px_2px_16px_1px]"
//             default:
//                 return ""
//         }
//     }

//     const posCls = () => {
//         const p = position()
//         const e = edge()
//         const base = p === "fixed" ? "fixed" : p === "sticky" ? "sticky" : "static"
//         const where = base !== "static" ? (e === "top" ? "top-0" : "bottom-0") : ""
//         return `${base} ${where}`.trim()
//     }

//     const heightCls = () => (dense() ? "py-1" : "py-2")
//     const zCls = () => `z-[${z()}]`

//     // strip internal props from spreading onto DOM
//     // const {
//     //     className,
//     //     children,
//     //     color: _c,
//     //     bgClass: _bg,
//     //     textClass: _tx,
//     //     elevation: _elev,
//     //     position: _pos,
//     //     edge: _edge,
//     //     dense: _d,
//     //     z: _z,
//     //     ...other
//     // } = props

//     let el: HTMLElement | null = null;

//     /* 3) effect: measure & pad container when fixed */
//     // useEffect(() => {
//     //     if (!el) return;

//     //     const parent = el.parentElement;                   // test box scroll container
//     //     if (!parent) return;

//     //     const isFixed = () => position() === "fixed";
//     //     const doOffset = () => !!offset() && isFixed();

//     //     const apply = () => {
//     //         if (!doOffset()) {
//     //             parent.style.paddingTop = "";
//     //             parent.style.paddingBottom = "";
//     //             return;
//     //         }
//     //         const h = el!.offsetHeight || 0;
//     //         if (edge() === "top") {
//     //             parent.style.paddingTop = `${h}px`;
//     //             parent.style.paddingBottom = "";
//     //         } else {
//     //             parent.style.paddingBottom = `${h}px`;
//     //             parent.style.paddingTop = "";
//     //         }
//     //     };

//     //     // initial + on resize
//     //     const ro = new ResizeObserver(apply);
//     //     ro.observe(el);

//     //     // re-apply when these change
//     //     apply();

//     //     return () => {
//     //         ro.disconnect();
//     //         // cleanup padding
//     //         if (parent) {
//     //             parent.style.paddingTop = "";
//     //             parent.style.paddingBottom = "";
//     //         }
//     //     };
//     // });
//     useEffect(() => {
//         if (!el) return;

//         /* In TSX (no Shadow DOM): header -> parentElement (the scroll container) */
//         /* In custom element: header -> ShadowRoot (no parentElement). We need the host's parent. */
//         const root = el.getRootNode() as any;           // Document | ShadowRoot
//         const host: HTMLElement | null = root?.host ?? null; // present only in Shadow DOM
//         const container: HTMLElement | null =
//             host?.parentElement ?? el.parentElement;      // prefer host's parent, else normal parent

//         if (!container) return;

//         const isFixed = () => position() === "fixed";
//         const doOffset = () => !!offset() && isFixed();

//         const apply = () => {
//             if (!doOffset()) {
//                 container.style.paddingTop = "";
//                 container.style.paddingBottom = "";
//                 return;
//             }
//             const h = el!.offsetHeight || 0;
//             if (edge() === "top") {
//                 container.style.paddingTop = `${h}px`;
//                 container.style.paddingBottom = "";
//             } else {
//                 container.style.paddingBottom = `${h}px`;
//                 container.style.paddingTop = "";
//             }
//         };

//         const ro = new ResizeObserver(apply);
//         ro.observe(el);
//         apply();

//         return () => {
//             ro.disconnect();
//             container.style.paddingTop = "";
//             container.style.paddingBottom = "";
//         };
//     });


//     return (
//         <header
//             ref={(e: any) => (el = e)}
//             class={
//                 () => [
//                     "w-full box-border shrink-0 left-auto",
//                     posCls(),
//                     zCls(),
//                     colorCls(),
//                     elevationCls(),
//                     heightCls(),
//                     "[transition:box-shadow_300ms_cubic-bezier(0.4,0,0.2,1)0ms]",
//                     $$(cls)
//                 ].join(" ")
//             }
//             {...otherProps}
//         >
//             {children}
//         </header>
//     )
// }) as typeof Appbar & JSX.IntrinsicElements['header']

// export { Appbar }

// /* Register as custom element */
// customElement("wui-appbar", Appbar)

// /* TSX typing for <wui-appbar> */
// declare module "woby" {
//     namespace JSX {
//         interface IntrinsicElements {
//             "wui-appbar": ElementAttributes<typeof Appbar>
//         }
//     }
// }

// export default Appbar
// #endregion

// #region Using tw Appbar
import { $, $$, defaults, type JSX, customElement, type ElementAttributes, type ObservableMaybe, useEffect, HtmlBoolean, HtmlClass } from "woby"
import "@woby/chk"
import "./input.css"

type Position = "fixed" | "sticky" | "static"
type Edge = "top" | "bottom"

const def = () => ({
    /** 
     * Custom CSS classes to apply to the appbar.
     * 
     * Class override mechanism:
     * - `cls` prop: Used as the primary class, if undefined the default variant classes are used
     * - `class` prop (aliased as `cn`): Additional classes that patch/extend the given classes
     * 
     * Usage:
     * - When `cls` is undefined, the default variant classes are used
     * - User can override the default class by providing a `cls` prop
     * - `class` can be used to add additional classes to the component
     */
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $("", HtmlClass) as JSX.Class | undefined,
    children: $(""),
    type: $("default"),
    position: $("fixed" as Position),
    edge: $("top" as Edge),
})

const variantStyle = {
    default: "shadow-[rgba(0,0,0,0.2)_0px_2px_4px_-1px,rgba(0,0,0,0.14)_0px_4px_5px_0px,rgba(0,0,0,0.12)_0px_1px_10px_0px] [@media_screen]:flex [@media_screen]:flex-col w-full box-border shrink-0 z-[1100] bg-[rgb(25,118,210)] text-white left-auto [transition:box-shadow_300ms_cubic-bezier(0.4,0,0.2,1)0ms] ",
}

const Appbar = defaults(def, (props) => {
    const { class: cn, cls, type: variant, position, edge, children, ...otherProps } = props


    const getPositionClass = () => {
        const pos = position()
        const edgePos = edge()

        // Base position class
        let positionClass = ""
        switch (pos) {
            case "fixed":
                positionClass = "fixed"
                break
            case "sticky":
                positionClass = "sticky"
                break
            case "static":
                positionClass = "static"
                break
            default:
                positionClass = "fixed"
        }

        // Add edge positioning for fixed and sticky only
        if (pos !== "static") {
            const edgeClass = edgePos === "top" ? "top-0" : "bottom-0"
            return `${positionClass} ${edgeClass}`
        }

        return `${positionClass}`
    }

    // let el: HTMLElement | null = null;
    // useEffect(() => {
    //     if (!el) return;

    //     /* In TSX (no Shadow DOM): header -> parentElement (the scroll container) */
    //     /* In custom element: header -> ShadowRoot (no parentElement). We need the host's parent. */
    //     const root = el.getRootNode() as any;           // Document | ShadowRoot
    //     const host: HTMLElement | null = root?.host ?? null; // present only in Shadow DOM
    //     const container: HTMLElement | null =
    //         host?.parentElement ?? el.parentElement;      // prefer host's parent, else normal parent

    //     if (!container) return;

    //     const isFixed = () => position() === "fixed";
    //     const doOffset = () => isFixed();

    //     const apply = () => {
    //         if (!doOffset()) {
    //             container.style.paddingTop = "";
    //             container.style.paddingBottom = "";
    //             return;
    //         }
    //         const h = el!.offsetHeight || 0;
    //         if (edge() === "top") {
    //             container.style.paddingTop = `${h}px`;
    //             container.style.paddingBottom = "";
    //         } else {
    //             container.style.paddingBottom = `${h}px`;
    //             container.style.paddingTop = "";
    //         }
    //     };

    //     const ro = new ResizeObserver(apply);
    //     ro.observe(el);
    //     apply();

    //     return () => {
    //         ro.disconnect();
    //         container.style.paddingTop = "";
    //         container.style.paddingBottom = "";
    //     };
    // });

    return (
        <header
            // ref={(e: any) => (el = e)}
            class={[() => $$(cls) ? $$(cls) : variantStyle[$$(variant)], () => getPositionClass(), cn]}
            {...otherProps}
        >
            {/* <pre>
                <p>Appbar Props</p>
                <p>Position: {position()}</p>
                <p>Edge: {edge()}</p>
                <p>Custom: {isCustom() ? "true" : "false"}</p>
            </pre> */}
            {children}
        </header>
    )
}) as typeof Appbar

export { Appbar }

/* Register as custom element */
customElement("wui-appbar", Appbar)

/* TSX typing for <wui-appbar> */
declare module "woby" {
    namespace JSX {
        interface IntrinsicElements {
            "wui-appbar": ElementAttributes<typeof Appbar>
        }
    }
}

export default Appbar
// #endregion

// #region Original Appbar
// import { tw } from '@woby/styled'
// //@ts-ignore
// import { Observable, ObservableMaybe, type JSX } from 'woby'

// export const Appbar = tw('header')`shadow-[rgba(0,0,0,0.2)_0px_2px_4px_-1px,rgba(0,0,0,0.14)_0px_4px_5px_0px,rgba(0,0,0,0.12)_0px_1px_10px_0px] [@media_screen]:flex [@media_screen]:flex-col w-full box-border shrink-0 fixed z-[1100] bg-[rgb(25,118,210)] text-white left-auto top-0
//     [transition:box-shadow_300ms_cubic-bezier(0.4,0,0.2,1)0ms]`
// #endregion

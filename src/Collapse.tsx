import { $, $$, defaults, type JSX, customElement, type ElementAttributes, type ObservableMaybe, StyleEncapsulationProps, isObservable, HtmlBoolean } from "woby"
import "@woby/chk"
import "./input.css"

type CollapseProps = JSX.VoidHTMLAttributes<HTMLDivElement> & {
	children?: ObservableMaybe<JSX.Child>
	open?: ObservableMaybe<boolean>
	background?: ObservableMaybe<boolean>
	class?: ObservableMaybe<string>
}

const def = () => ({
	children: $(null as JSX.Child),
	open: $(true, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
	background: $(true, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
	cls: $(""),
})

const Collapse = defaults(def, (props) => {
	const { children, open, background, cls, ...otherProps } = props
	// Create internal open state if not provided as observable
	const internalOpen = isObservable(open) ? open : $(open ?? true)

	const baseClass = "overflow-hidden transition-height duration-200 ease-in-out "

	const isBackground = () => {
		return $$(background) === true ? "bg-[#ccc]" : ""
	}

	function renderCollapse() {
		return (
			<div
				class={() => [
					baseClass, isBackground, cls]
				}
				{...otherProps}
			>
				<div class="h-fit">
					{children}
					{/* <pre class="border border-black-500 rounded-[4px] justify-center align-center items-center overflow-auto w-[90%] mx-auto my-2 p-2">
						<p class="underline">Collapse Props</p>
						<p class="mt-2 font-bold text-black">Children: <span class="text-blue-500">{children()}</span></p>
						<p class="mt-2 font-bold text-black">Class: <span class="text-blue-500">{cls}</span></p>
						<p class="mt-2 font-bold text-black">Open: <span class="text-blue-500">{() => internalOpen.toString()}</span></p>
						<p class="mt-2 font-bold text-black">Background: <span class="text-blue-500">{() => background.toString()}</span></p>
					</pre> */}
				</div>
			</div>
		)
	}

	// Wrap in a function to make it reactive for toggling
	return () => {
		// Only call renderCollapse when open is true
		return $$(internalOpen) === false ? null : renderCollapse()
	}

}) as typeof Collapse & StyleEncapsulationProps

export { Collapse }

customElement("wui-collapse", Collapse)

declare module "woby" {
	namespace JSX {
		interface IntrinsicElements {
			"wui-collapse": ElementAttributes<typeof Collapse>
		}
	}
}

export default Collapse

// NOTE: use hidden the element still exist, Goal: Collapse (element no need render)

// #region: Original Collapse
// import { $, $$, ObservableMaybe, isObservable, useEffect, useMemo, type JSX } from "woby"

// type CollapseProps = JSX.VoidHTMLAttributes<HTMLDivElement> & {
// 	children?: JSX.Child
// 	open?: ObservableMaybe<boolean>
// 	background?: boolean
// }
// export const Collapse = (props: CollapseProps): JSX.Element => {
// 	const { className, background = true, children, open: op, class: cls } = props
// 	const open = isObservable(op) ? op : $(op)
// 	const ref = $<HTMLDivElement>()
// 	const containerRef = $<HTMLDivElement>()

// 	const opened = useMemo(() => ($$(open) ? { height: "auto" } : { height: 0 }))

// 	return (
// 		<div
// 			class={[
// 				"overflow-hidden transition-height duration-200 ease-in-out",
// 				() => (background ? "bg-[#ccc]" : ""),
// 				cls ?? className,
// 			]}
// 			style={opened}
// 			ref={containerRef}
// 			{...props}
// 		>
// 			<div
// 				class={"h-fit"}
// 				ref={ref}
// 			>
// 				{children}
// 			</div>
// 		</div>
// 	)
// }
// #endregion
import { $, $$, ObservableMaybe, isObservable, useEffect, useMemo, type JSX, defaults, customElement, ElementAttributes, HtmlBoolean } from "woby"

type CollapseProps = JSX.VoidHTMLAttributes<HTMLDivElement> & {
	children?: JSX.Child
	open?: ObservableMaybe<boolean>
	background?: boolean
}

const def = () => ({
	open: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
	background: $(true, HtmlBoolean) as ObservableMaybe<boolean>
})

const CollapseComponent = defaults(def, (props: any): JSX.Element => {
	const { className, background = true, children, open: op, class: cls } = props
	const open = isObservable(op) ? op : $(op)
	const ref = $<HTMLDivElement>()
	const containerRef = $<HTMLDivElement>()

	const opened = useMemo(() => ($$(open) ? { height: "auto" } : { height: 0 }))

	return (
		<div
			class={[
				"overflow-hidden transition-height duration-200 ease-in-out",
				() => (background ? "bg-[#ccc]" : ""),
				cls ?? className,
			]}
			style={opened}
			ref={containerRef}
			{...props}
		>
			<div
				class={"h-fit"}
				ref={ref}
			>
				{children}
			</div>
		</div>
	)
})

// Register as a custom element
customElement('wui-collapse', CollapseComponent)

// Augment JSX intrinsic elements for better TypeScript support
declare module 'woby' {
	namespace JSX {
		interface IntrinsicElements {
			/**
			 * Woby Collapse custom element
			 * 
			 * A collapse component that can be used as a custom element in HTML or JSX.
			 * Provides an expandable container that can show or hide content.
			 * 
			 * The ElementAttributes<typeof CollapseComponent> type automatically includes:
			 * - All HTML attributes
			 * - Component-specific props from CollapseProps
			 * - Style properties via the style-* pattern (style$font-size in HTML, style-font-size in JSX)
			 */
			'wui-collapse': ElementAttributes<typeof CollapseComponent>
		}
	}
}

export { CollapseComponent as Collapse }
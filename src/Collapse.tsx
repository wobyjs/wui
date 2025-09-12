import { $, $$, ObservableMaybe, isObservable, useMemo, type JSX } from "woby"

type CollapseProps = JSX.VoidHTMLAttributes<HTMLDivElement> & {
	children?: JSX.Child
	open?: ObservableMaybe<boolean>
	background?: boolean
}
export const Collapse = (props: CollapseProps): JSX.Element => {
	const { className, background = true, children, open: op, class: cls } = props
	const open = isObservable(op) ? op : $(op)
	const ref = $<HTMLDivElement>()

	const opened = useMemo(() => ($$(open) && $$(ref) ? { height: $$(ref).clientHeight + "px" } : { height: 0 }))

	return (
		<div
			class={[
				"overflow-hidden transition-height duration-200 ease-in-out",
				() => (background ? "bg-[#ccc]" : ""),
				cls ?? className,
			]}
			style={opened}
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
}

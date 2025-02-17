import { $, $$, ObservableMaybe, isObservable, useEffect, useMemo, type JSX } from "woby"

type CollapseProps = JSX.VoidHTMLAttributes<HTMLDivElement> & {
	children?: JSX.Child
	open?: ObservableMaybe<boolean>
	background?: boolean
}
export const Collapse = (props: CollapseProps): JSX.Element => {
	const { className, background = true, children, open: op, class: cls } = props
	const open = isObservable(op) ? op : $(op)
	const ref = $<HTMLDivElement>()

	const opened = useMemo(() => ($$(open) ? { height: "fit-content" } : { height: 0 }))

	return (
		<div
			class={[
				"overflow-hidden [transition:height_200ms]",
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

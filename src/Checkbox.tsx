import { nanoid } from "nanoid"
import { ObservableMaybe, $$, useMemo, type JSX } from "woby"

type LabelPosition = "left" | "right" | "bottom" | "top"

type CheckboxProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
	children?: JSX.Children
	labelPosition?: ObservableMaybe<LabelPosition>
}
export const Checkbox = (props: CheckboxProps): JSX.Child => {
	const { type, labelPosition = "left", children, className, ...otherProps } = props
	const id = nanoid(8)
	const before = useMemo(() =>
		$$(labelPosition) === "left" || $$(labelPosition) === "top" ? (
			<label
				class="select-none"
				for={id}
			>
				{children}
			</label>
		) : null
	)
	const after = useMemo(() =>
		$$(labelPosition) === "right" || $$(labelPosition) === "bottom" ? (
			<label
				class="select-none"
				for={id}
			>
				{children}
			</label>
		) : null
	)
	const line = useMemo(() =>
		$$(labelPosition) === "top" || $$(labelPosition) === "bottom" ? <br /> : null
	)

	return (
		<>
			<div className={className}>
				{before}
				{line}
				<input
					type="checkbox"
					{...otherProps}
				/>
				{line}
				{after}
			</div>
		</>
	)
}

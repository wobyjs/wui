import { $, $$, defaults, type JSX, customElement, type ElementAttributes, type ObservableMaybe, useEffect, StyleEncapsulationProps } from "woby"
import "@woby/chk"
import "./input.css"

type LabelPosition = "left" | "right" | "bottom" | "top"

type CheckboxProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
	children?: ObservableMaybe<JSX.Child>
	labelPosition?: ObservableMaybe<LabelPosition>
	class?: ObservableMaybe<string>
}

const def = () => ({
	children: $(null as JSX.Child),
	labelPosition: $("left" as LabelPosition),
	class: $(""),
	checked: $(false as boolean),
	disabled: $(false as boolean),
	id: $(`checkbox-${Math.random().toString(36).substr(2, 9)}`),
})

const Checkbox = defaults(def, (props) => {
	const { children, labelPosition, class: className, checked, disabled, id, ...otherProps } = props

	// Convert disabled to boolean if it's a string (from HTML attributes)
	const isDisabled = () => {
		const disabledValue = $$(disabled)
		if (typeof disabledValue === 'string') {
			return disabledValue === 'true' || disabledValue === ''
		}
		return Boolean(disabledValue)
	}

	const before = () =>
		$$(labelPosition) === "left" || $$(labelPosition) === "top" ?
			(<label class="pr-1.5 select-none" for={() => $$(id)}> {children} </label>) : null

	const after = () =>
		$$(labelPosition) === "right" || $$(labelPosition) === "bottom" ?
			(<label class="pl-1.5 select-none" for={() => $$(id)}> {children} </label>) : null

	const line = () => ($$(labelPosition) === "top" || $$(labelPosition) === "bottom" ? <br /> : null)

	return (
		<div class={() => [(className)].join(" ")}>
			{before}
			{line}
			<input id={id} type="checkbox" checked={checked} disabled={isDisabled} {...otherProps} />
			{line}
			{after}

			<pre class="border border-black-500 p-4 mt-2">
				<p class="underline mb-2">Check Box Props</p>
				<p>Id: {id}</p>
				<p>Checked: {() => checked().toString()}</p>
				<p>Disabled: {() => disabled().toString()}</p>
			</pre>
		</div>
	)
}) as typeof Checkbox & StyleEncapsulationProps

export { Checkbox }

customElement("wui-checkbox", Checkbox)

declare module "woby" {
	namespace JSX {
		interface IntrinsicElements {
			"wui-checkbox": ElementAttributes<typeof Checkbox>
		}
	}
}

export default Checkbox

// #region Original CheckBox
// import { nanoid } from "nanoid"
// import { ObservableMaybe, $$, useMemo, type JSX } from "woby"

// type LabelPosition = "left" | "right" | "bottom" | "top"

// type CheckboxProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
// 	children?: JSX.Children
// 	labelPosition?: ObservableMaybe<LabelPosition>
// }
// export const Checkbox = (props: CheckboxProps): JSX.Child => {
// 	const { type, labelPosition = "left", children, className, ...otherProps } = props
// 	const id = nanoid(8)
// 	const before = useMemo(() =>
// 		$$(labelPosition) === "left" || $$(labelPosition) === "top" ? (
// 			<label
// 				className="pr-1.5 select-none "
// 				for={id}
// 			>
// 				{children}
// 			</label>
// 		) : null
// 	)
// 	const after = useMemo(() =>
// 		$$(labelPosition) === "right" || $$(labelPosition) === "bottom" ? (
// 			<label
// 				className="select-none"
// 				for={id}
// 			>
// 				{children}
// 			</label>
// 		) : null
// 	)
// 	const line = useMemo(() => ($$(labelPosition) === "top" || $$(labelPosition) === "bottom" ? <br /> : null))

// 	return (
// 		<>
// 			<div className={className}>
// 				{before}
// 				{line}
// 				<input
// 					type="checkbox"
// 					{...otherProps}
// 				/>
// 				{line}
// 				{after}
// 			</div>
// 		</>
// 	)
// }
// #endregion

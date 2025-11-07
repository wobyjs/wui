import { nanoid } from "nanoid"
import { $, $$, useMemo, type JSX, defaults, customElement, ElementAttributes, HtmlBoolean, HtmlString, ObservableMaybe, HtmlFunction } from "woby"

type LabelPosition = "left" | "right" | "bottom" | "top"

function def() {
	return {
		labelPosition: $('left' as LabelPosition, HtmlString) as ObservableMaybe<string> | undefined,
		checked: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
		disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
		onChange: $(undefined, HtmlFunction) as ObservableMaybe<Function> | undefined,
	}
}

const CheckboxComponent = defaults(def, (props: any) => {
	const { type, labelPosition = "left", children, className, ...otherProps } = props
	const id = nanoid(8)
	const before = useMemo(() =>
		$$(labelPosition) === "left" || $$(labelPosition) === "top" ? (
			<label
				className="pr-1.5 select-none "
				for={id}
			>
				{children}
			</label>
		) : null
	)
	const after = useMemo(() =>
		$$(labelPosition) === "right" || $$(labelPosition) === "bottom" ? (
			<label
				className="select-none"
				for={id}
			>
				{children}
			</label>
		) : null
	)
	const line = useMemo(() => ($$(labelPosition) === "top" || $$(labelPosition) === "bottom" ? <br /> : null))

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
})

// Register as a custom element
customElement('wui-checkbox', CheckboxComponent)

// Augment JSX intrinsic elements for better TypeScript support
declare module 'woby' {
	namespace JSX {
		interface IntrinsicElements {
			/**
			 * Woby Checkbox custom element
			 * 
			 * A checkbox component that can be used as a custom element in HTML or JSX.
			 * Allows users to select one or more items from a set of options.
			 * 
			 * The ElementAttributes<typeof CheckboxComponent> type automatically includes:
			 * - All HTML attributes
			 * - Component-specific props from CheckboxProps
			 * - Style properties via the style-* pattern (style$font-size in HTML, style-font-size in JSX)
			 */
			'wui-checkbox': ElementAttributes<typeof CheckboxComponent>
		}
	}
}

export { CheckboxComponent as Checkbox }
import { type CustomElementChildren, $, $$, defaults, isObservable, type Observable, type JSX, customElement, type ElementAttributes, type ObservableMaybe, useEffect, useMemo, StyleEncapsulationProps, HtmlBoolean, HtmlClass, HtmlString } from "woby"
import "@woby/chk"
import "./input.css"
import { registerBaseCls } from './helper/baseCls'

type LabelPosition = "left" | "right" | "bottom" | "top"

/**
 * The class slot `cls` replaces: the wrapper's own layout.
 *
 * The flex *direction* is not part of it -- that follows `labelPosition`, and an
 * override that swallowed it would put the label back on the wrong side.
 */
const BASE_CLASS = "inline-flex"

type CheckboxProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
	children?: ObservableMaybe<JSX.Child>
	labelPosition?: ObservableMaybe<LabelPosition>
	class?: ObservableMaybe<string>
}

const def = () => ({
	children: $(null as JSX.Child) as CustomElementChildren,
	labelPosition: $("left" as LabelPosition),
	/** 
	 * Custom CSS classes to apply to the checkbox.
	 * 
	 * Class override mechanism:
	 * - `cls` prop: Used as the primary class, if undefined the default classes are used
	 * - `class` prop (aliased as `cn`): Additional classes that patch/extend the given classes
	 * 
	 * Usage:
	 * - When `cls` is undefined, the default classes are used
	 * - User can override the default class by providing a `cls` prop
	 * - `class` can be used to add additional classes to the component
	 */
	cls: $('', HtmlClass) as JSX.Class,
	class: $('', HtmlClass) as JSX.Class,
	// checked: $(false as boolean),
	// disabled: $(false as boolean),
	checked: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
	disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
	id: $(`checkbox-${Math.random().toString(36).substr(2, 9)}`),
})

const Checkbox: Defaulted<typeof def> = defaults(def, (props) => {
	const { class: cn, cls, children, labelPosition, checked, disabled, id, ...otherProps } = props

	// Placement is flex ordering on the wrapper, NOT two conditional <label>s.
	//
	// The old code rendered a `before` label for left/top and an `after` label for
	// right/bottom. A custom element upgrades with its defaults first (labelPosition
	// "left", a freshly random id) and only then receives its attributes, so a
	// <wui-checkbox label-position="right"> rendered the left label, and when the
	// attribute landed the label was left behind — orphaned, still carrying the
	// pre-attribute `for` id, adding phantom pr-1.5 padding next to the real label.
	// One label that never unmounts cannot be orphaned.
	const dirClass = useMemo(() => {
		switch ($$(labelPosition)) {
			case "left": return "flex-row-reverse items-center"
			case "top": return "flex-col-reverse items-start"
			case "bottom": return "flex-col items-start"
			case "right":
			default: return "flex-row items-center"
		}
	})

	const padClass = useMemo(() => {
		switch ($$(labelPosition)) {
			case "left": return "pr-1.5"
			case "top": return "pb-1.5"
			case "bottom": return "pt-1.5"
			case "right":
			default: return "pl-1.5"
		}
	})

	return (
		<div class={[() => $$(cls) ? $$(cls) : BASE_CLASS, dirClass, cn]}>
			<input
				id={id}
				type="checkbox"
				checked={checked}
				disabled={disabled}
				// `checked` bound one way only would leave the observable stuck at its
				// initial value: the browser flips the input's own checkedness and nothing
				// reports it back, so every reader -- a consumer's $(), the editor's
				// property panel -- keeps seeing the state the checkbox started in. Same
				// write-back Switch already does.
				onChange={(v: any) => isObservable(checked) && (checked as Observable<boolean>)(v.target.checked)}
				{...otherProps}
			/>
			<label class={["select-none", padClass]} for={() => $$(id)}>{children}</label>
		</div>
	)
}) as typeof Checkbox

export { Checkbox }

customElement("wui-checkbox", Checkbox)
// Publish the slot `cls` replaces, so the editor can show and edit it.
registerBaseCls("wui-checkbox", BASE_CLASS)

declare module "woby" {
	namespace JSX {
		interface IntrinsicElements {
			"wui-checkbox": ElementAttributes<typeof Checkbox>
		}
	}
}

export default Checkbox

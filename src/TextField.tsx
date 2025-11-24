import { effect19a } from './TextField.effect'
import { tw } from '@woby/styled'
import { ObservableMaybe, $$, $, type JSX, isObservable, Observable, defaults, customElement, type ElementAttributes, HtmlBoolean } from 'woby'

//https://codepen.io/maheshambure21/pen/EozKKy

const def = () => ({
	children: $(null as JSX.Child),
	effect: $(effect19a),
	assignOnEnter: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
	value: $(""),
	type: $("text"),
	placeholder: $("Placeholder Text"),
	cls: $(""),
	disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
	onChange: undefined as ((e: any) => void) | undefined,
	onKeyUp: undefined as ((e: any) => void) | undefined,
})

/**
 * @param reactive On = commit on enter, off(default) = commit on key up
 *
 *
 *
 * To change Line color, patch the following class into effect
 *
 * top line: [&~span]:before:bg-[#4caf50]
 *
 * bottom line: [&~span]:after:bg-[#4caf50]
 *
 * left line: [&~span_i]:before:bg-[#4caf50]
 *
 * right line: [&~span_i]:after:bg-[#4caf50]
 *
 * Placeholder text: text-[color] text-*
 *
 * With content text: [&:not(:placeholder-shown)]:text-[red]
 *
 * box: border-[#ccc]
 *
 * Fill color: [&~span]:bg-[#ededed]
 *
 * Fill color (focused) : [&:focus~span]:bg-[#ededed]
 *
 * label text: [&~label]:text-[red] [&:focus~label]:text-[red] [&:not(:placeholder-shown)~label]:text-[red]
 */
const TextField = defaults(def, (props) => {
	const { cls, children, effect, assignOnEnter, value, type, placeholder, disabled, onChange, onKeyUp, ...otherProps } = props

	return (
		<div class={["m-[20px]", "relative", cls]}>
			<input
				class={effect}
				value={value}
				disabled={disabled}
				{...{ ...otherProps, type: () => $$(type) as "text" | "password" | "email" | "number" | "tel" | "url" | "search" | "date" | "datetime-local" | "month" | "week" | "time" | "color", placeholder: () => $$(placeholder) }}
				onChange={(e) => {
					!$$(assignOnEnter) && isObservable(value) ? (value?.(e.target.value), onChange?.(e)) : undefined
				}}
				onKeyUp={(e) => {
					!$$(assignOnEnter) && isObservable(value) ? (value?.(e.target.value), onKeyUp?.(e)) : (e.key === "Enter" && isObservable(value) && value(e.target.value), onKeyUp?.(e))
				}}
			/>
			{children}
		</div>
	)
}) as typeof TextField & JSX.IntrinsicElements['div']

export { TextField }

// Register as custom element
customElement('wui-text-field', TextField)

// Add the custom element to the JSX namespace
declare module 'woby' {
	namespace JSX {
		interface IntrinsicElements {
			'wui-text-field': ElementAttributes<typeof TextField>
		}
	}
}

export default TextField

export const StartAdornment = tw("div")`flex h-[0.01em] max-h-[2em] items-center whitespace-nowrap text-[rgba(0,0,0,0.54)] mr-2`
export const EndAdornment = tw("div")`flex h-[0.01em] max-h-[2em] items-center whitespace-nowrap text-[rgba(0,0,0,0.54)] ml-2`
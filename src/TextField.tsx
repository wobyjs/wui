import {
	effect1, effect2, effect3,
	effect4, effect5, effect6,
	effect7, effect8, effect9,
	effect10, effect11, effect12, effect13, effect14, effect15,
	effect16, effect17, effect18,
	effect19, effect20, effect21,
	effect22, effect23, effect24,
	effect19a, effect20a, effect21a,
} from './TextField.effect'
import { ObservableMaybe, $$, $, type JSX, isObservable, Observable, defaults, customElement, type ElementAttributes, HtmlBoolean, HtmlString, useMemo, HtmlClass } from 'woby'

//https://codepen.io/maheshambure21/pen/EozKKy

type INPUT_TYPE = "text" | "password" | "email" | "number" | "tel" | "url" | "search" | "date" | "datetime-local" | "month" | "week" | "time" | "color"

const effectMap: Record<string, string> = {
	// Underline Effects
	effect1,   // Center-out underline
	effect2,   // Left-to-right underline
	effect3,   // Split center-out underline

	// Box Effects
	effect4,   // Bottom-up fill border
	effect5,   // Left-to-right fill border
	effect6,   // Right-to-left fill border

	// Outline Effects
	effect7,   // Center-out split outline
	effect8,   // Corner-to-corner outline
	effect9,   // Snake/Chasing outline

	// Fill Effects
	effect10, // Fade in fill
	effect11, // Left-to-right fill
	effect12, // Center-out fill
	effect13, // Split center-out fill
	effect14, // Diagonal split fill
	effect15, // Center diamond fill

	// Labeled Underline Effects (Requires 'label' prop)
	effect16, // Center-out underline w/ floating label
	effect17, // Center-out (from left) w/ floating label
	effect18, // Split center-out w/ floating label

	// Labeled Box Effects (Requires 'label' prop)
	effect19, // Split top/bottom border w/ floating label
	effect20, // Clockwise border w/ floating label
	effect21, // Snake border w/ floating label

	// Labeled Fill Effects (Requires 'label' prop)
	effect22, // Fade in fill w/ floating label
	effect23, // Split fill w/ floating label
	effect24, // Diagonal fill w/ floating label

	// Alternative Labeled Box Effects (Label moves to border)
	effect19a, // Split border, label cuts line
	effect20a, // Clockwise border, label cuts line
	effect21a, // Snake border, label cuts line
}

const def = () => ({
	class: $('', HtmlClass) as JSX.Class | undefined,
	cls: $('', HtmlClass) as JSX.Class | undefined,
	children: $(null),
	effect: $("effect19a", HtmlString) as ObservableMaybe<string> | undefined,
	assignOnEnter: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
	value: $("", HtmlString) as ObservableMaybe<string> | undefined,
	inputType: $("text", HtmlString) as ObservableMaybe<INPUT_TYPE> | undefined,
	placeholder: $("", HtmlString) as ObservableMaybe<string> | undefined,
	disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean> | undefined,
	onChange: undefined as ((e: any) => void) | undefined,
	onKeyUp: undefined as ((e: any) => void) | undefined,

	label: $("", HtmlString) as ObservableMaybe<string> | undefined,
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

	const { class: cn, cls, children, effect, assignOnEnter, value, inputType, placeholder, disabled, onChange, onKeyUp, label, ...otherProps } = props

	const baseClass = "m-[20px] relative z-0"



	// write me logic to check adnorment is exists or not
	// const child = useMemo(() => {
	// 	// Flatten children to handle arrays/fragments
	// 	const kids = [].concat($$(children) as any).flat().filter(Boolean);

	// 	const start = kids.filter((k: any) => k.props?.['data-adornment'] === 'start');
	// 	const end = kids.filter((k: any) => k.props?.['data-adornment'] === 'end');

	// 	// Everything else (that isn't an adornment)
	// 	const others = kids.filter((k: any) =>
	// 		k.props?.['data-adornment'] !== 'start' &&
	// 		k.props?.['data-adornment'] !== 'end'
	// 	);

	// 	return { start, end, others };
	// })

	const effectStyle = useMemo(() => {
		const effectName = $$(effect)
		return effectMap[effectName] || ""
	})

	return (
		<div class={[baseClass, () => $$(cn) ? $$(cn) : "", cls]}>


			{/* if data-adnorment= start is exists render here */}
			{/* {() => child().start} */}

			<input
				class={effectStyle}
				value={value}
				disabled={disabled}
				type={inputType}
				placeholder={placeholder}

				{...otherProps}

				onChange={(e) => {
					!$$(assignOnEnter) && isObservable(value) ? (value?.(e.target.value), onChange?.(e)) : undefined
				}}
				onKeyUp={(e) => {
					!$$(assignOnEnter) && isObservable(value) ? (value?.(e.target.value), onKeyUp?.(e)) : (e.key === "Enter" && isObservable(value) && value(e.target.value), onKeyUp?.(e))
				}}
			/>

			<span class="focus-border focus-bg pointer-events-none"><i></i></span>

			{() => $$(label) ? <label class="pointer-events-none">{label}</label> : null}

			{/* if data-adnorment= end is exists render here */}
			{/* {() => child().end} */}
			{/* {() => child().others} */}
			{children}
		</div>
	)
}) as typeof TextField


const defAdornment = () => ({
	cls: $('', HtmlClass) as JSX.Class | undefined,
	children: $(null),
})

const StartAdornment = defaults(defAdornment, (props) => {
	const { cls, children, ...otherProps } = props

	const baseClass = "flex h-[0.01em] max-h-[2em] items-center whitespace-nowrap text-[rgba(0,0,0,0.54)] mr-2"

	return (
		<div class={[baseClass, cls]} data-adnorment="start" {...otherProps}>
			{children}
		</div>
	)
}) as typeof StartAdornment

const defEndAdnorment = () => ({
	cls: $('', HtmlClass) as JSX.Class | undefined,
	children: $(null),
})

const EndAdornment = defaults(defAdornment, (props) => {
	const { cls, children, ...otherProps } = props

	const baseClass = "flex h-[0.01em] max-h-[2em] items-center whitespace-nowrap text-[rgba(0,0,0,0.54)] ml-2"

	return (
		<div class={[baseClass, cls]} data-adnorment="end" {...otherProps}>
			{children}
		</div>
	)
}) as typeof EndAdornment


export { TextField, StartAdornment, EndAdornment }

// Register as custom element
customElement('wui-text-field', TextField)
customElement('wui-start-adornment', StartAdornment)
customElement('wui-end-adornment', EndAdornment)

// Add the custom element to the JSX namespace
declare module 'woby' {
	namespace JSX {
		interface IntrinsicElements {
			'wui-text-field': ElementAttributes<typeof TextField>,
			'wui-start-adornment': ElementAttributes<typeof StartAdornment>,
			'wui-end-adornment': ElementAttributes<typeof EndAdornment>,
		}
	}
}

export default TextField

// export const StartAdornment = tw("div")`flex h-[0.01em] max-h-[2em] items-center whitespace-nowrap text-[rgba(0,0,0,0.54)] mr-2`
// export const EndAdornment = tw("div")`flex h-[0.01em] max-h-[2em] items-center whitespace-nowrap text-[rgba(0,0,0,0.54)] ml-2`
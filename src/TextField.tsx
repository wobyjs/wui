import { tw } from '@woby/styled'
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
import { type CustomElementChildren, ObservableMaybe, $$, $, type JSX, isObservable, Observable, defaults, customElement, type ElementAttributes, HtmlBoolean, HtmlString, useMemo, HtmlClass, useEffect } from 'woby'

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
	class: $('', HtmlClass) as JSX.Class,
	cls: $('', HtmlClass) as JSX.Class,
	children: $(null as JSX.Child) as CustomElementChildren,
	effect: $("", HtmlString) as ObservableMaybe<string>,
	assignOnEnter: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
	value: $("", HtmlString) as ObservableMaybe<string>,
	inputType: $("text", HtmlString) as ObservableMaybe<INPUT_TYPE>,
	placeholder: $("", HtmlString) as ObservableMaybe<string>,
	disabled: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
	onChange: undefined as ((e: any) => void) | undefined,
	onKeyUp: undefined as ((e: any) => void) | undefined,

	label: $("", HtmlString) as ObservableMaybe<string>,
	ref: undefined as ((el: HTMLInputElement) => void) | undefined,
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
const TextField: Defaulted<typeof def> = defaults(def, (props) => {

	const { cls, class: cn, children, effect, assignOnEnter, value, inputType, placeholder, disabled, onChange, onKeyUp, label, ref, ...otherProps } = props

	const baseClass = "relative z-0 flex items-center"
	const defaultStyle = "block w-full py-1.5 px-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 sm:text-sm/6 truncate"

	const inputRef = $<HTMLInputElement | null>(null)

	useEffect(() => {
		if (ref && $$(inputRef)) {
			ref($$(inputRef)!)
		}
	})

	// Native event handlers for shadow DOM compatibility.
	// Woby's JSX event delegation doesn't handle composed events
	// from shadow DOM correctly (keyup reaches the document but Woby's
	// handler throws), so we attach native handlers directly on the
	// input element as a fallback.
	useEffect(() => {
		const input = $$(inputRef)
		if (!input) return

		const handleKeyUp = (e: KeyboardEvent) => {
			if (!isObservable(value)) return
			const targetVal = (e.target as HTMLInputElement).value

			if ($$(assignOnEnter)) {
				if (e.key === "Enter") {
					value(targetVal)
					onKeyUp?.(e as any)
				}
			} else {
				value(targetVal)
				onKeyUp?.(e as any)
			}
		}

		const handleInput = (e: Event) => {
			if (!$$(assignOnEnter) && isObservable(value)) {
				value((e.target as HTMLInputElement).value)
				onChange?.(e as any)
			}
		}

		// `assignOnEnter` used to write the observable on Enter and NOWHERE else, so
		// typing a value and then clicking away — including clicking the property
		// editor's "Commit Changes" button — silently threw the edit away. Leaving the
		// field is a commit too; Escape-to-discard was never implemented here anyway.
		const handleBlur = (e: FocusEvent) => {
			if (!$$(assignOnEnter) || !isObservable(value)) return
			value((e.target as HTMLInputElement).value)
		}

		input.addEventListener('keyup', handleKeyUp)
		input.addEventListener('input', handleInput)
		input.addEventListener('blur', handleBlur)
		return () => {
			input.removeEventListener('keyup', handleKeyUp)
			input.removeEventListener('input', handleInput)
			input.removeEventListener('blur', handleBlur)
		}
	})

	const effectStyle = useMemo(() => {
		const effectName = $$(effect)
		if (effectMap[effectName]) return effectMap[effectName]
		// `defaultStyle` styles the input alone and says nothing about where a
		// label goes, so <wui-text-field label="Name"> with no effect rendered
		// the label *below* the box. Only the labeled effects position it, so
		// fall back to one whenever a label is present (same default TextArea
		// already uses).
		return $$(label) ? effect19a : defaultStyle
	})

	// ── Floating-label / placeholder reconciliation ──
	// The labeled effects park the label over the field and float it up via
	// `:not(:placeholder-shown)`. That selector only behaves when a *non-empty*
	// placeholder exists, and any visible placeholder text sits exactly under the
	// resting label. So when a label is present:
	//   - substitute a single space when the caller gave no placeholder, otherwise
	//     `:placeholder-shown` never matches and the label floats up permanently;
	//   - hide the placeholder text until focus, so the two don't overprint.
	const placeholderValue = useMemo(() => {
		const p = $$(placeholder)
		if (!$$(label)) return p
		return p ? p : ' '
	})
	const labelPlaceholderClass = useMemo(() =>
		$$(label) ? "placeholder:text-transparent focus:placeholder:text-gray-400" : "")

	// `disabled` only reached the DOM attribute — text, border and cursor were
	// unchanged, so a disabled field looked identical to an editable one. Match
	// the greys Button already uses for its disabled state.
	const disabledClass = "disabled:cursor-not-allowed disabled:text-[#00000061] disabled:border-[#0000001f] disabled:bg-[#0000000a] [&:disabled~label]:text-[#00000061]"

	const handleFocus = () => {
		if (inputRef()) {
			inputRef()!.focus()
		}
	}

	const splitChildren = useMemo(() => {
		const unwrapped = $$(children)
		const allChildren = [].concat(unwrapped as any).flat().filter(Boolean)

		const getAdornmentType = (child: any) => {
			if (!child) return null

			// 1. Direct check if the child is the function itself
			if (child.adornmentType) return child.adornmentType

			// 2. Check common Woby VNode locations for the component function
			const fn = child.fn || child.component || (typeof child === 'function' ? child : null)
			if (fn?.adornmentType) return fn.adornmentType

			// 3. Reach into Symbols (This matches your screenshot perfectly)
			// Your screenshot shows Symbol(CloneElement) -> Component -> adornmentType
			const symbols = Object.getOwnPropertySymbols(child)
			for (const sym of symbols) {
				const internalData = child[sym]
				if (internalData?.Component?.adornmentType) {
					return internalData.Component.adornmentType
				}
			}

			// 4. Fallback to props check
			const p = child.props || (typeof child === 'function' ? child.props : null)
			const typeFromProps = $$(p?.['data-adnorment'])
			if (typeFromProps) return typeFromProps

			return null
		}

		// Filter based on the resolved type
		const start = allChildren.filter(c => getAdornmentType(c) === 'start')
		const end = allChildren.filter(c => getAdornmentType(c) === 'end')
		const others = allChildren.filter(c => {
			const type = getAdornmentType(c)
			return type !== 'start' && type !== 'end'
		})

		return { start, end, others }
	})

	return (
		<div
			class={[baseClass, () => $$(cls) ? $$(cls) : "", cn]}
			tabIndex={-1}
			onFocus={handleFocus}
		>

			{/* Render Text Input Field */}
			<div class="relative flex-1">
				<div class="relative flex items-center w-full gap-2">
					{
						() => splitChildren().start.length ? (
							<div class="shrink-0 whitespace-nowrap text-[rgba(0,0,0,0.54)]">
								{splitChildren().start}
							</div>
						) : null
					}

					<div class="relative flex-1 min-w-0">
						<input
							ref={inputRef}
							class={() => [
								effectStyle,
								labelPlaceholderClass,
								disabledClass,
							]}
							value={value}
							disabled={disabled}
							type={inputType}
							placeholder={placeholderValue}

							{...otherProps}

							onChange={(e: any) => {
								// NOTE: Native handler (attached via addEventListener in useEffect) handles all value-setting.
								// JSX handler's value() call would use retargeted e.target (shadow host), causing value(undefined).
								onChange?.(e)
							}}
							onKeyUp={(e: any) => {
								console.log('[TextField onKeyUp]', { key: e.key, targetTag: e.target?.tagName, targetVal: e.target?.value, assignOnEnter: $$(assignOnEnter), isObs: isObservable(value), val: value })
								// NOTE: Native handler (attached via addEventListener in useEffect) handles all value-setting.
								// JSX handler's value() call would use retargeted e.target (shadow host), causing value(undefined).
								// Only invoke the callback here — native handler already set the observable.
								onKeyUp?.(e)
							}}
						/>
						<span class="focus-border focus-bg pointer-events-none"><i></i></span>

						{() => $$(label) ? <label class="cursor-text">{label}</label> : null}
					</div>



					{() => splitChildren().end.length ? (
						<div class="shrink-0 whitespace-nowrap text-[rgba(0,0,0,0.54)]">
							{splitChildren().end}
						</div>
					) : null}
				</div>
			</div>
		</div>
	)
}) as typeof TextField


const defStartAdornment = () => ({
	cls: $('', HtmlClass) as JSX.Class,
	children: $(null) as CustomElementChildren,
	'data-adnorment': 'start'
})

const defEndAdnorment = () => ({
	cls: $('', HtmlClass) as JSX.Class,
	children: $(null) as CustomElementChildren,
	'data-adnorment': 'end'
})

/**
 * An adornment component carries a static `adornmentType` marker that `TextField` reads off the
 * child function (see `getAdornmentType` above) to decide which side of the input it renders on.
 */
type Adornment<D extends () => Record<string, any>> = Defaulted<D> & { adornmentType?: 'start' | 'end' }

const StartAdornment: Adornment<typeof defStartAdornment> = defaults(defStartAdornment, (props) => {
	// `data-adnorment` is pulled out of the spread: it is part of `def` (so it reflects as an
	// attribute on the custom element) but this component always renders the `start` marker, and
	// leaving it in `otherProps` would overwrite the literal below.
	const { cls, children, 'data-adnorment': _side, ...otherProps } = props

	// const baseClass = "flex h-[0.01em] max-h-[2em] items-center whitespace-nowrap text-[rgba(0,0,0,0.54)] mr-2"
	const baseClass = "flex h-[0.01em] max-h-[2em] items-center whitespace-nowrap text-[rgba(0,0,0,0.54)]"

	return (
		<div class={[baseClass, cls]} data-adnorment="start" {...otherProps}>
			{children}
		</div>
	)
}) as typeof StartAdornment
StartAdornment.adornmentType = 'start'// as typeof StartAdornment

const EndAdornment: Adornment<typeof defEndAdnorment> = defaults(defEndAdnorment, (props) => {
	// See StartAdornment: the `data-adnorment` default is dropped so the literal `end` wins.
	const { cls, children, 'data-adnorment': _side, ...otherProps } = props

	// const baseClass = "flex h-[0.01em] max-h-[2em] items-center whitespace-nowrap text-[rgba(0,0,0,0.54)] ml-2"
	const baseClass = "flex h-[0.01em] max-h-[2em] items-center whitespace-nowrap text-[rgba(0,0,0,0.54)]"

	return (
		<div class={[baseClass, cls]} data-adnorment="end" {...otherProps}>
			{children}
		</div>
	)
}) as typeof EndAdornment
EndAdornment.adornmentType = 'end'

export {
	TextField,
	StartAdornment,
	EndAdornment
}

// Register as custom element
customElement('wui-text-field', TextField)
customElement('wui-start-adornment', StartAdornment)
customElement('wui-end-adornment', EndAdornment)

// Add the custom element to the JSX namespace
declare module 'woby' {
	namespace JSX {
		interface IntrinsicElements {
			'wui-text-field': ElementAttributes<typeof TextField> & { focus?: () => void },
			'wui-start-adornment': ElementAttributes<typeof StartAdornment>,
			'wui-end-adornment': ElementAttributes<typeof EndAdornment>,
		}
	}
}

export default TextField

// export const StartAdornment = tw("div")`flex h-[0.01em] max-h-[2em] items-center whitespace-nowrap text-[rgba(0,0,0,0.54)] mr-2`
// export const EndAdornment = tw("div")`flex h-[0.01em] max-h-[2em] items-center whitespace-nowrap text-[rgba(0,0,0,0.54)] ml-2`
import { $, $$, useEffect, isObservable, useTimeout, useInterval, ObservableMaybe, type JSX } from 'woby'


const btn = `
bg-transparent items-center justify-center cursor-pointer relative m-0 border-[none] [outline:none] [-webkit-appearance:none]
disabled:bg-[#d9dbda]
`
//w-12 h-12
// before:inline-block before:absolute before:content-[''] before:w-4 h-0.5 before:bg-[#212121] before:-translate-x-2/4 before:-translate-y-2/4
// after:inline-block after:absolute after:content-[''] after:w-4 h-0.5 after:bg-[#212121] after:-translate-x-2/4 after:-translate-y-2/4

type NumberFieldProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
	children?: JSX.Child
	reactive?: ObservableMaybe<boolean>
	noMinMax?: ObservableMaybe<boolean>
	noFix?: ObservableMaybe<boolean>
	noRotate?: ObservableMaybe<boolean>
}

export const NumberField = (props: NumberFieldProps): JSX.Element => {
	const { className, class: cls, children, onChange, noMinMax, onKeyUp, reactive, noRotate = false, noFix, ...otherProps } = props
	const { min, max, value, step, disabled } = otherProps
	const inputRef = $<HTMLInputElement>()
	const error = () => $$(value) < $$(min) || $$(value) > $$(max)
	const cantMin = () => $$(value) <= $$(min) && $$(noRotate)
	const cantMax = () => $$(value) >= $$(max) && $$(noRotate)

	let pvalue: number
	const updated = () => {
		if (pvalue === +$$(value)) return
		if ($$(noFix) && $$(noRotate)) return

		if (+$$(value) < +$$(min))
			isObservable(value) && value($$(noRotate) ? +$$(min) : +$$(max))

		if (+$$(value) > +$$(max))
			isObservable(value) && value($$(noRotate) ? +$$(max) : +$$(min))

		pvalue = +$$(value)
	}

	useEffect(updated)

	const dec = () => { !$$(reactive) && isObservable(value) ? value?.((+$$(inputRef).value as any) - +$$(step)) : undefined; updated() }
	const inc = () => { !$$(reactive) && isObservable(value) ? value?.((+$$(inputRef).value as any) + +$$(step)) : undefined; updated() }

	let interval: ReturnType<typeof useInterval>
	let timeout: ReturnType<typeof useTimeout>

	function startContinuousUpdate(isIncrement: boolean) {
		// Update immediately on press
		isIncrement ? inc() : dec()

		// Start interval to continue updating while pressed
		timeout = useTimeout(() => interval = useInterval(() => isIncrement ? inc() : dec(), 100), 200)
	}

	function stopUpdate() {
		timeout?.()
		interval?.()
	}

	return <div class={["number-input inline-flex border-2 border-solid border-[#ddd] box-border [&_*]:box-border", className, cls]}>
		<button
			class={btn}
			onPointerDown={() => startContinuousUpdate(false)}
			onPointerUp={stopUpdate}
			onPointerLeave={stopUpdate}
			disabled={cantMin}>
			-
		</button>
		<input
			ref={inputRef}
			class={[`quantity  [-webkit-appearance:textfield] [-moz-appearance:textfield] [appearance:textfield]
        [&::-webkit-inner-spin-button]:[-webkit-appearance:none] [&::-webkit-outer-spin-button]:[-webkit-appearance:none]
        text-center p-2 border-solid border-[0_2px]
        `, () => ($$(error) ? "text-[red]" : "")]}
			type="number"
			value={value}
			onChange={e => { !$$(reactive) && isObservable(value) ? (value?.(e.target.value), onChange?.(e)) : undefined; updated() }}
			onKeyUp={e => { !$$(reactive) && isObservable(value) ? (value?.(e.target.value), onKeyUp?.(e)) : undefined; updated() }}
			onWheel={e => { e.preventDefault(); Math.sign(e.deltaY) > 0 ? dec() : inc() }}
			{...otherProps}
			disabled={disabled}
		/>
		<button
			class={[btn, "plus"]}
			onPointerDown={() => startContinuousUpdate(true)}
			onPointerUp={stopUpdate}
			onPointerLeave={stopUpdate}
			disabled={cantMax}>
			+
		</button>
	</div>
}

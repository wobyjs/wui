import { NumberField } from "../NumberField"
import { TextField } from "../TextField"
import { Checkbox } from "../Checkbox"
import { $, $$, ObservableMaybe, isObservable, useEffect } from "woby"

type EditorProps = {
	reactive: ObservableMaybe<boolean>
	value: ObservableMaybe<any>
	key: string
	onChange: (e) => void
}

export const StringEditor = (props: EditorProps) => {
	const { value } = props

	return (
		<TextField
			className={""}
			value={value}
			disabled={!isObservable(value)}
		></TextField>
	)
}

export const NumberEditor = (props: EditorProps) => {
	const { value } = props

	return (
		<NumberField
			noMinMax
			value={value}
			class="[&_input]:w-full [&_button]:w-[2rem] [&_button]:text-[130%] [&_button]:leading-[0] [&_button]:font-bold h-[2rem]"
			disabled={!isObservable(value)}
		></NumberField>
	)
}

export const ColorEditor = (props: EditorProps) => {
	const { value, reactive, onChange } = props

	return (
		<input
			type="color"
			value={value}
			disabled={!isObservable(value)}
			onChange={(e) => {
				!$$(reactive) && isObservable(value)
					? (value?.(e.target.value), onChange?.(e))
					: undefined
			}}
		></input>
	)
}

export const BooleanEditor = (props: EditorProps) => {
	const { value, onChange } = props
	const originalValue = $($$(value))

	return (
		<Checkbox
			checked={$$(value)}
			disabled={!isObservable(value)}
			onChange={(e) => {
				originalValue((e.target as HTMLInputElement).value)
				onChange?.(e)
			}}
		/>
	)
}

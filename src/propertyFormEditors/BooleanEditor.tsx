import { Checkbox } from "../Checkbox"
import { $, $$, isObservable } from "woby"
import { EditorProps } from "./EditorProps"

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

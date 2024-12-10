import { isObservable, $$ } from "woby"
import { EditorProps } from "./EditorProps"

export const ColorEditor = (props: EditorProps) => {
	const { value, reactive, onChange } = props

	return (
		<input
			type="color"
			value={value}
			disabled={!isObservable(value)}
			onChange={(e) => {
				!$$(reactive) && isObservable(value) ? (value?.(e.target.value), onChange?.(e)) : undefined
			}}
		></input>
	)
}

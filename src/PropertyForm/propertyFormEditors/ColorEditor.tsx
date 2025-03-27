import { isObservable, $$ } from "woby"
import { EditorProps } from "./EditorProps"

export const ColorEditor = (props: EditorProps) => {
	const { value, reactive, onChange, editorName } = props

	const hasAlpha = $$(value).length == 9
	const colorVal = $$(value).length == 9 ? $$(value).slice(0, -2) : $$(value)
	const alphaVal = hasAlpha ? parseInt($$(value).slice(-2), 16) / 255 : undefined

	return (
		<>
			<input
				type="color"
				value={colorVal}
				disabled={!isObservable(value)}
				onChange={(e) => {
					!$$(reactive) && isObservable(value) ? (value?.(e.target.value), onChange?.(e)) : undefined
				}}
			></input>
			{hasAlpha && <input
				type="range"
				id="alpha"
				onChange={(e) => {
					const value = e.target.value
					console.log("alpha", value)
				}}
				min={"0"}
				max={"1"}
				step={"0.1"}
				value={alphaVal}
			>
			</input>}
		</>
	)
}

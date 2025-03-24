import { NumberField } from "../../NumberField"
import { isObservable } from "woby"
import { EditorProps } from "./EditorProps"

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

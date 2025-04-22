/** @jsxImportSource woby */

import { $$, ObservableMaybe, isObservable } from "woby"
import { Editors, UIProps } from "./PropertyForm"
import { NumberField } from "../NumberField"
import { EditorProps } from "./EditorProps"

export const NumberEditor = () => {
	const renderCondition = (value: ObservableMaybe<string>) => {
		const isNumber = isObservable(value) ? typeof $$(value) == "number" : typeof value == "number"

		return isNumber
	}

	const UI = (props: UIProps<number>) => {
		const { value } = props

		return <NumEditor value={value} />
	}

	const NumEditor = (props: EditorProps) => {
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

	return {
		UI,
		renderCondition,
		type: "NumberEditor",
	}
}

Editors([...$$(Editors) as any, NumberEditor])

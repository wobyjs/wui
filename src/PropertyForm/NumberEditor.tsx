/** @jsxImportSource woby */

import { $$, ObservableMaybe, isObservable, useEffect } from "woby"
import { Editors, TableRow, UIProps, skippedProperties } from "./PropertyForm"
import { NumberField } from "../NumberField"
import { EditorProps } from "./EditorProps"

export const NumberEditor = () => {
	const renderCondition = (value: ObservableMaybe<string>) => {
		const isNumber = isObservable(value) ? typeof $$(value) == "number" : typeof value == "number"

		return isNumber
	}

	const UI = (props: UIProps<number>) => {
		const { value, editorName } = props
		const optionName = editorName.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, function (str) {
			return str.toUpperCase()
		})

		return skippedProperties.includes(editorName) ? null : (
			<TableRow optionName={optionName}>
				<NumEditor
					value={value}
					editorName={editorName}
				/>
			</TableRow>
		)
	}

	const NumEditor = (props: EditorProps) => {
		const { value, editorName } = props

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

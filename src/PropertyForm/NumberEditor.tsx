/** @jsxImportSource woby */
import { $$, ObservableMaybe, isObservable, useEffect, useMemo } from "woby"
import { Editors, TableRow, UIProps, skippedProperties } from "./PropertyForm"
import { NumberField } from "../NumberField"
import { EditorProps } from "./EditorProps"

export const NumberEditor = () => {
	const renderCondition = (value: ObservableMaybe<string>) => {
		// const isNumber = isObservable(value) ? typeof $$(value) == "number" : typeof value == "number"
		return isObservable(value) ? typeof $$(value) == "number" : typeof value == "number"
	}

	const UI = (props: UIProps<number>) => {
		const { value, editorName, indentLvl } = props
		const optionName = editorName.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (str) => str.toUpperCase())

		return skippedProperties.includes(editorName) ? null : (
			<TableRow
				optionName={optionName}
				indentLvl={indentLvl}
			>
				<NumEditor value={value} editorName={editorName} />
			</TableRow>
		)
	}

	const NumEditor = (props: EditorProps) => {
		const { value, editorName } = props

		return (
			<NumberField
				noMinMax={true}
				reactive={true}
				value={value}
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

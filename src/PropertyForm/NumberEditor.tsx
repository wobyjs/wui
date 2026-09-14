/** @jsxImportSource woby */
import { $$, ObservableMaybe, isObservable, useEffect, useMemo } from "woby"
import { Editors, UIProps, skippedProperties, rowLabel, isLocked } from "./Editors"
import { TableRow } from "./PropertyForm"
import { NumberField } from "../NumberField"
import { EditorProps } from "./EditorProps"

export const NumberEditor = () => {
	const renderCondition = (value: ObservableMaybe<string>) => {
		// const isNumber = isObservable(value) ? typeof $$(value) == "number" : typeof value == "number"
		return isObservable(value) ? typeof $$(value) == "number" : typeof value == "number"
	}

	const UI = (props: UIProps<number>) => {
		const { value, editorName, indentLvl } = props

		return skippedProperties.includes(editorName) ? null : (
			<TableRow
				optionName={() => rowLabel(editorName)}
				indentLvl={indentLvl}
				prop={editorName}
				action={(value as any)?.action}
				hint={(value as any)?.hint}
			>
				<NumEditor value={value} editorName={editorName} />
			</TableRow>
		)
	}

	const NumEditor = (props: EditorProps) => {
		const { value, editorName } = props

		return (
			// See StringEditor: w-full so the field tracks the dialog width instead of
			// sizing to its content.
			<NumberField
				class="w-full"
				noMinMax={true}
				reactive={true}
				value={value}
				disabled={isLocked(value)}
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

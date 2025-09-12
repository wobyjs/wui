/** @jsxImportSource woby */

import { $, $$, ObservableMaybe, isObservable, useEffect } from "woby"
import { Editors, TableRow, UIProps, skippedProperties } from "./PropertyForm"
import { Checkbox } from "../Checkbox"
import { EditorProps } from "./EditorProps"

export const BooleanEditor = () => {
	const renderCondition = (value: ObservableMaybe<string>) => {
		const isBoolean = isObservable(value) ? typeof $$(value) == "boolean" : typeof value == "boolean"

		return isBoolean
	}

	const UI = (props: UIProps<boolean>) => {
		const { value, reactive, editorName } = props
		const optionName = editorName.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, function (str) {
			return str.toUpperCase()
		})

		return skippedProperties.includes(editorName) ? null : (
			<TableRow optionName={optionName}>
				<BoolEditor
					value={value}
					reactive={reactive}
					editorName={editorName}
				/>
			</TableRow>
		)
	}

	const BoolEditor = (props: EditorProps) => {
		const { value, onChange, editorName } = props

		return (
			<Checkbox
				checked={$$(value)}
				disabled={!isObservable(value)}
				onChange={(e) => {
					value((e.target as HTMLInputElement).checked)
					onChange?.(e)
				}}
			/>
		)
	}

	return {
		UI,
		renderCondition,
		type: "BooleanEditor",
	}
}

Editors([...$$(Editors) as any, BooleanEditor])

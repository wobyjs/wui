/** @jsxImportSource woby */

import { $$, isObservable, ObservableMaybe } from "woby"
import { Editors, UIProps, skippedProperties, rowLabel, isLocked } from "./Editors"
import { TableRow } from "./PropertyForm"
import { TextField } from "../TextField"
import { EditorProps } from "./EditorProps"

export const StringEditor = () => {

	const renderCondition = (value: ObservableMaybe<string>, key?: string) => {
		if ($$(value) == undefined) return false
		// Enum values (carrying .options) are handled by EnumEditor — exclude them here
		if (Array.isArray((value as any)?.options)) return false
		// A date attribute is a string on the wire, so the typeof test below matches it
		// too. Whoever registers the date picker owns the row; without this both render.
		if ((value as any)?.propType === 'date') return false
		const hexColorReg = /^#[0-9A-F]{6}$/i
		const isColor = $$(value).length == 9 ? hexColorReg.test($$(value).slice(0, -2)) : hexColorReg.test($$(value))
		const isString = isObservable(value) ? typeof $$(value) == "string" : typeof value == "string"

		return isString && !isColor && !Array.isArray($$(value))
	}

	const UI = (props: UIProps<ObservableMaybe<string>>) => {
		const { value, editorName, indentLvl } = props

		return skippedProperties.includes(editorName) ? null : (
			<TableRow
				optionName={() => rowLabel(editorName)}
				indentLvl={indentLvl}
				action={(value as any)?.action}
				hint={(value as any)?.hint}
			>
				<StringEditor value={value} />
			</TableRow>
		)
	}

	const StringEditor = (props: EditorProps) => {
		const { value } = props

		return (
			// w-full, not the field's shrink-to-fit default: the row's value cell
			// already stretches with the dialog, but a flex item sizes to its content,
			// so without this the input stayed at the <input> intrinsic width while
			// the cell around it grew.
			<TextField
				class="w-full"
				value={value}
				assignOnEnter
				disabled={isLocked(value)}
			></TextField>
		)
	}

	return {
		UI,
		renderCondition,
		type: "StringEditor",
	}
}

Editors([...$$(Editors) as any, StringEditor])

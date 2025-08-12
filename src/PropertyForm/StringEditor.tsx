/** @jsxImportSource woby */

import { $$, isObservable, ObservableMaybe } from "woby"
import { Editors, UIProps, skippedProperties } from "./PropertyForm"
import { TextField } from "../TextField"
import { EditorProps } from "./EditorProps"
import * as test from '../TextField.effect'

export const StringEditor = () => {
	const renderCondition = (value: ObservableMaybe<string>, key) => {
		if ($$(value) == undefined) return false
		const hexColorReg = /^#[0-9A-F]{6}$/i
		const isColor = $$(value).length == 9 ? hexColorReg.test($$(value).slice(0, -2)) : hexColorReg.test($$(value))
		const isString = isObservable(value) ? typeof $$(value) == "string" : typeof value == "string"

		return isString && !isColor && !Array.isArray($$(value))
	}

	const UI = (props: UIProps<ObservableMaybe<string>>) => {
		const { value, editorName, data } = props
		const optionName = editorName.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, function (str) {
			return str.toUpperCase()
		})

		return skippedProperties.includes(editorName) ? null : (
			<tr className="flex h-fit items-center">
				<th className={`w-[150px] text-right`}>{optionName}</th>
				<td className="w-full">
					<StringEditor value={value} />
				</td>
			</tr>
		)
	}

	const StringEditor = (props: EditorProps) => {
		const { value } = props

		return (
			<TextField
				// className={test.effect20}
				effect={test.effect21}
				value={value}
				assignOnEnter
				disabled={!isObservable(value)}
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

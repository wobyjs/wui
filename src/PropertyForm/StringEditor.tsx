/** @jsxImportSource woby */

import { $$, isObservable, ObservableMaybe } from "woby"
import { Editors, UIProps } from "./PropertyForm"
import { TextField } from "../TextField"
import { EditorProps } from "./EditorProps"

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

		return (
			//@ts-ignore
			<StringEditor value={value} />
		)
	}

	const StringEditor = (props: EditorProps) => {
		const { value } = props

		return (
			<TextField
				className={""}
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

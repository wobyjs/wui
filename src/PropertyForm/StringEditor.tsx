/** @jsxImportSource woby */

import { $$, isObservable, ObservableMaybe } from "woby"
import { StringEditor as StrEditor } from "./propertyFormEditors/StringEditor"
import { Editors, UIProps } from "./PropertyForm"

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
			<StrEditor value={value} />
		)
	}

	return {
		UI,
		renderCondition,
		type: "StringEditor",
	}
}

Editors([...$$(Editors) as any, StringEditor])

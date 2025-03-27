/** @jsxImportSource woby */

import { $$, ObservableMaybe, isObservable } from "woby"
import { Editors, UIProps } from "./PropertyForm"
import { ColorEditor as ClrEditor } from "./propertyFormEditors/ColorEditor"

export const ColorEditor = () => {
	const renderCondition = (value: ObservableMaybe<string>, key) => {
		if ($$(value) == undefined) return false
		const colorVal = $$(value).length == 9 ? $$(value).slice(0, -2) : $$(value)
		const hexColorReg = /^#[0-9A-F]{6}$/i
		const isColor = isObservable(value) ? hexColorReg.test(colorVal) : hexColorReg.test(colorVal)
		const isString = isObservable(value) ? typeof $$(value) == "string" : typeof value == "string"

		return isString && isColor
	}

	const UI = (props: UIProps<string>) => {
		const { value,editorName } = props

		return (
			//@ts-ignore
			<ClrEditor
				value={value}
				editorName={editorName}
			/>
		)
	}

	return {
		UI,
		renderCondition,
		type: "ColorEditor",
	}
}

Editors([...$$(Editors), ColorEditor])

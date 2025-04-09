/** @jsxImportSource woby */

import { $$, ObservableMaybe, isObservable } from "woby"
import { NumberEditor as NumEditor } from "./propertyFormEditors/NumberEditor"
import { Editors, UIProps } from "./PropertyForm"

export const NumberEditor = () => {
	const renderCondition = (value: ObservableMaybe<string>) => {
		const isNumber = isObservable(value) ? typeof $$(value) == "number" : typeof value == "number"

		return isNumber
	}

	const UI = (props: UIProps<number>) => {
		const { value } = props

		return <NumEditor value={value} />
	}

	return {
		UI,
		renderCondition,
		type: "NumberEditor",
	}
}

Editors([...$$(Editors) as any, NumberEditor])

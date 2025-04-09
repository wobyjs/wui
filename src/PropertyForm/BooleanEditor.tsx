/** @jsxImportSource woby */

import { $$, ObservableMaybe, isObservable } from "woby"
import { Editors, UIProps } from "./PropertyForm"
import { BooleanEditor as BoolEditor } from "./propertyFormEditors/BooleanEditor"

export const BooleanEditor = () => {
	const renderCondition = (value: ObservableMaybe<string>) => {
		const isBoolean = isObservable(value) ? typeof $$(value) == "boolean" : typeof value == "boolean"

		return isBoolean
	}

	const UI = (props: UIProps<boolean>) => {
		const { value, reactive } = props

		return (
			//@ts-ignore
			<BoolEditor
				value={value}
				reactive={reactive}
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

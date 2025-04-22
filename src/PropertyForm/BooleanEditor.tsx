/** @jsxImportSource woby */

import { $, $$, ObservableMaybe, isObservable } from "woby"
import { Editors, UIProps } from "./PropertyForm"
import { Checkbox } from "../Checkbox"
import { EditorProps } from "./EditorProps"

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

	const BoolEditor = (props: EditorProps) => {
		const { value, onChange } = props
		const originalValue = $($$(value))
	
		return (
			<Checkbox
				checked={$$(value)}
				disabled={!isObservable(value)}
				onChange={(e) => {
					originalValue((e.target as HTMLInputElement).value)
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

/** @jsxImportSource woby */

import { $, $$, ObservableMaybe, isObservable, useEffect } from "woby"
import { Editors, UIProps } from "./PropertyForm"
import { Checkbox } from "../Checkbox"
import { EditorProps } from "./EditorProps"

export const BooleanEditor = () => {
	const renderCondition = (value: ObservableMaybe<string>) => {
		const isBoolean = isObservable(value) ? typeof $$(value) == "boolean" : typeof value == "boolean"

		return isBoolean
	}

	const UI = (props: UIProps<boolean>) => {
		const { value, reactive, editorName } = props

		return (
			//@ts-ignore
			<BoolEditor
				value={value}
				reactive={reactive}
				editorName={editorName}
			/>
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

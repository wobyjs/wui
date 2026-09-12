/** @jsxImportSource woby */

import { $, $$, ObservableMaybe, isObservable, useEffect } from "woby"
import { Editors, UIProps, skippedProperties, rowLabel } from "./Editors"
import { TableRow } from "./PropertyForm"
import { Checkbox } from "../Checkbox"
import { EditorProps } from "./EditorProps"

export const BooleanEditor = () => {
	const renderCondition = (value: ObservableMaybe<string>) => {
		const isBoolean = isObservable(value) ? typeof $$(value) == "boolean" : typeof value == "boolean"

		return isBoolean
	}

	const UI = (props: UIProps<boolean>) => {
		const { value, reactive, editorName } = props

		return skippedProperties.includes(editorName) ? null : (
			<TableRow optionName={() => rowLabel(editorName)} action={(value as any)?.action} hint={(value as any)?.hint}>
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
				// Pass the observable, not `$$(value)`. Unwrapping here made the binding
				// one-way — the box rendered the value at construction time and then never
				// tracked it, so undo/redo (or any programmatic write) left the checkbox
				// stale while string rows updated fine. woby's setProperty only writes
				// observable → DOM, so the onChange below still owns the other direction.
				checked={value}
				disabled={!isObservable(value)}
				onChange={(e: any) => {
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

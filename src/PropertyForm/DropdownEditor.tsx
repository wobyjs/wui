/** @jsxImportSource woby */

import { $, $$, ObservableMaybe } from "woby"
import { DropDownEditor as DDEditor } from "./propertyFormEditors/DropDownEditor"
import { Editors, UIProps } from "./PropertyForm"

export const DropDownEditor = () => {
	const renderCondition = (value: ObservableMaybe<string>) => {
		return Array.isArray($$(value))
	}

	const UI = (props: UIProps<ObservableMaybe<[]>>) => {
		const { value, data, editorName } = props
		
		return (
			<>
				<DDEditor
					value={value}
					obj={data}
					editorName={editorName}
					changeValueOnClickOnly={editorName == "labels" || editorName == "thematicColumns" ? true : false}
				/>
			</>
		)
	}

	return {
		UI,
		renderCondition,
		type: "DropDownEditor",
	}
}

Editors([...$$(Editors), DropDownEditor])

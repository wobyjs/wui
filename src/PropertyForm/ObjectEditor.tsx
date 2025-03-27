/** @jsxImportSource woby */

import { $$, ObservableMaybe, isObservable } from "woby"
import { Editors, PropertyForm, UIProps } from "./PropertyForm"


export const ObjectEditor = () => {
	const renderCondition = (value: ObservableMaybe<any>, key) => {
		const isObject = isObservable(value) ? typeof $$(value) == "object" : typeof value == "object"
		const isArray = isObservable(value) ? Array.isArray($$(value)) : Array.isArray(value)

		return isObject && !isArray && key != "thematic"
	}

	const UI = (props: UIProps<any>) => {
		const { value } = props

		return (
			<>
				<PropertyForm
					obj={value}
					className={"h-fit"}
				/>
			</>
		)
	}

	return {
		UI,
		renderCondition,
		type: "ObjectEditor",
	}
}

Editors([...$$(Editors), ObjectEditor])

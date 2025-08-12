/** @jsxImportSource woby */

import { $, $$, ObservableMaybe, isObservable } from "woby"
import { Editors, PropertyForm, UIProps, skippedProperties } from "./PropertyForm"
import { Collapse } from "../Collapse"

export const ObjectEditor = () => {
	const renderCondition = (value: ObservableMaybe<any>, key) => {
		const isObject = isObservable(value) ? typeof $$(value) == "object" : typeof value == "object"
		const isArray = isObservable(value) ? Array.isArray($$(value)) : Array.isArray(value)

		return isObject && !isArray
	}

	const UI = (props: UIProps<any>) => {
		const { value, editorName } = props
		const optionName = editorName.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, function (str) {
			return str.toUpperCase()
		})
		const open = $(false)

		return skippedProperties.includes(editorName) ? null : (
			<tr className="flex h-fit items-center">
				<th className={`w-[150px] text-right`}>{optionName}</th>
				<td className="w-full">
					<div
						className="flex m-3 items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded-lg shadow-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						onClick={() =>
							open(!$$(open))
						}>
						{() => $$(open) ? <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clip-rule="evenodd" />
						</svg> :
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
							</svg>
						}
						<span>{`Show ${optionName}`}</span>
					</div>
					<Collapse open={open}>
						<PropertyForm
							obj={$$(value)}
							className={"h-fit bg-white"}
						/>
					</Collapse>
				</td>
			</tr>
		)
	}

	return {
		UI,
		renderCondition,
		type: "ObjectEditor",
	}
}

Editors([...$$(Editors) as any, ObjectEditor])

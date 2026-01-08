/** @jsxImportSource woby */
import { $, $$, ObservableMaybe, isObservable, useEffect } from "woby"
import { Editors, UIProps, indent, skippedProperties } from "./PropertyForm"
import { Collapse } from "../Collapse"
import { PropertyRows } from "./PropertyRows"

export const ObjectEditor = () => {
	const renderCondition = (value: ObservableMaybe<any>, key) => {
		const isObject = isObservable(value) ? typeof $$(value) == "object" : typeof value == "object"
		const isArray = isObservable(value) ? Array.isArray($$(value)) : Array.isArray(value)

		return isObject && !isArray
	}

	const UI = (props: UIProps<any>) => {
		const { value, editorName, indentLvl = -1, button } = props
		let optionName = $(editorName.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, function (str) {
			return str.toUpperCase()
		}))
		const open = props.open ?? $(false)

		if (parseInt(editorName) && value["column"] || parseInt(editorName) == 0) {
			optionName(`(${$$(value["column"])}) +  (${$$(value["name"])})`)
		}

		useEffect(() => {
			if (parseInt(editorName) && value["column"] || parseInt(editorName) == 0) {
				optionName(`(${$$(value["column"])}) +  (${$$(value["name"])})`)
			}
		})

		return skippedProperties.includes(editorName) ? null : (
			<>
				<tr className={"flex h-fit items-stretch"}>
					<th className={`flex items-center whitespace-nowrap`}>{
						<button
							class={"w-5 h-5 cursor-pointer"}
							onClick={() =>
								open(!$$(open))
							}
						>
							{() => $$(open) ? <svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full text-gray-500" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clip-rule="evenodd" />
							</svg> :
								<svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full text-gray-500" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
								</svg>}
						</button>}
					</th>
					<th className={["w-full flex items-center justify-between outline-1 whitespace-nowrap text-left"]}>
						<span className={() => ["whitespace-nowrap px-2 py-1", `${indent[indentLvl]}`]}>
							{() => $$(optionName)}
						</span>
						{button}
					</th>
				</tr>
				<Collapse
					open={open}
					background={false}
				>
					<PropertyRows
						obj={$$(value)}
						className={["h-fit bg-white"]}
						indentLvl={indentLvl + 1}
					/>
				</Collapse >
			</>
		)
	}

	return {
		UI,
		renderCondition,
		type: "ObjectEditor",
	}
}

Editors([...$$(Editors) as any, ObjectEditor])

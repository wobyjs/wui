/** @jsxImportSource woby */

import { $, $$, isObservable, ObservableMaybe, useEffect } from "woby"
import { Editors, TableRow, UIProps, skippedProperties } from "./PropertyForm"
import { EditorProps } from "./EditorProps"
import { MultiWheeler } from "../Wheeler/MultiWheeler"
import projAsia from "./proj/projAsia.json"

export const DropDownEditor = () => {
	const renderCondition = (value: ObservableMaybe<string>) => {
		return Array.isArray($$(value))
	}

	const UI = (props: UIProps<ObservableMaybe<[]>>) => {
		const { value, data, editorName } = props
		const optionName = editorName.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, function (str) {
			return str.toUpperCase()
		})

		return skippedProperties.includes(editorName) ? null : (
			<TableRow optionName={optionName}>
				<DropDown
					value={value}
					obj={data}
					editorName={editorName}
					changeValueOnClickOnly={editorName == "labels" || editorName == "thematicColumns" ? true : false}
				/>
			</TableRow>
		)
	}

	const DropDown = (props: EditorProps) => {
		const { editorName, obj, changeValueOnClickOnly } = props
		const open = $(false)
		const functions = [
			{ value: "", label: "None" },
			{ value: "Abs", label: "Abs" },
			{ value: "Area", label: "Area" },
			{ value: "Centroid", label: "Centroid" },
			{ value: "Cos", label: "Cos" },
			{ value: "Distance", label: "Distance" },
			{ value: "Exp", label: "Exp" },
			{ value: "Floor", label: "Floor" },
			{ value: "Ln", label: "Ln" },
			{ value: "Log", label: "Log" },
			{ value: "Pow", label: "Pow" },
			{ value: "Sin", label: "Sin" },
			{ value: "Sqrt", label: "Sqrt" },
			{ value: "Tan", label: "Tan" },
			{ value: "Trim", label: "Trim" },
			{ value: "LTrim", label: "LTrim" },
			{ value: "RTrim", label: "RTrim" },
			{ value: "Substr", label: "Substr" },
			{ value: "Length", label: "Length" },
			{ value: "Concat", label: "Concat" },
			{ value: "Replace", label: "Replace" },
			{ value: "Area", label: "Area" },
			{ value: "Distance", label: "Distance" },
			{ value: "Or", label: "Or" },
			{ value: "X", label: "X" },
			{ value: "Y", label: "Y" },
		]
		const operators = [
			{ value: "", label: "None" },
			{ value: "+", label: "+" },
			{ value: "-", label: "-" },
			{ value: "*", label: "*" },
			{ value: "/", label: "/" },
			{ value: "%", label: "%" },
			{ value: "=", label: "=" },
			{ value: ">", label: ">" },
			{ value: "<", label: "<" },
			{ value: ">=", label: ">=" },
			{ value: "<=", label: "<=" },
			{ value: "<>", label: "<>" },
			{ value: "||", label: "||" },
		]
		let defaultValue
		let data
		let headers

		switch (editorName) {
			case "labels":
				const val = $$(obj["colLabel"])
				defaultValue = [$(val), $(operators[0].value), $(functions[0].value)]
				data = [$$(props.value), operators, functions]
				headers = [v => "Labels", v => "Operators", v => "Functions"]
				break
			case "thematicColumns":
				const value = $$(obj["thematicColumn"])
				defaultValue = [$(value), $(operators[0].value), $(functions[0].value)]
				data = [$$(props.value), operators, functions]
				headers = [v => "Labels", v => "Operators", v => "Functions"]
				break
			case "projectionName":
				data = [Object.keys(projAsia)]
				const projectionCode = $$(obj).projection
				const projectionName = Object.keys(projAsia).filter(key => key.includes(projectionCode));
				defaultValue = [$(projectionName[0])]
				headers = [v => "Projection Name"]
				break
			default:
				defaultValue = [$($$(props.value)[0])]
				data = [$$(props.value)]
				headers = [v => editorName]
		}

		const inputValue = $($$(defaultValue[0]))
		const originalVal = $$(defaultValue[0])
		const outerInputRef = $<HTMLInputElement>()
		const innerInputRef = $<HTMLInputElement>()

		useEffect(() => {
			if (!$$(innerInputRef)) return

			let innerInputValue = $$(innerInputRef).value
			let outerInputValue = $$(outerInputRef).value

			if (innerInputValue == originalVal) {
				innerInputValue = $$(defaultValue[0])
				outerInputValue = $$(defaultValue[0])
				inputValue(innerInputValue)
			}
			else {
				innerInputValue = $$(defaultValue[0])
				outerInputValue = $$(defaultValue[0])
				inputValue(innerInputValue)
			}
		})

		useEffect(() => {
			if (!$$(innerInputRef)) return

			let innerInputValue = $$(innerInputRef).value
			let outerInputValue = $$(outerInputRef).value

			if ($$(defaultValue[1]) != "" && $$(defaultValue[1]) != undefined) {
				innerInputValue += " " + $$(defaultValue[1])
				outerInputValue += " " + $$(defaultValue[1])
				inputValue(innerInputValue)
			}
		})

		useEffect(() => {
			if (!$$(innerInputRef)) return

			let innerInputValue = $$(innerInputRef).value
			let outerInputValue = $$(outerInputRef).value

			if ($$(defaultValue[1]) != "" && $$(defaultValue[1]) != undefined) {
				innerInputValue += " " + $$(defaultValue[2])
				outerInputValue += " " + $$(defaultValue[2])
				inputValue(innerInputValue)
			}
		})

		useEffect(() => {
			if (editorName == "labels") {
				isObservable(obj["colLabel"]) ? obj["colLabel"]($$(inputValue)) : obj["colLabel"] = $$(inputValue)
			}
		})

		useEffect(() => {
			if (editorName == "thematicColumns") {
				isObservable(obj["thematicColumn"]) ? obj["thematicColumn"]($$(inputValue)) : (obj["thematicColumn"] = $$(inputValue))
			}
		})

		useEffect(() => {
			if (editorName == "thematicType") {
				//sort array to make inputValue first
				const thematicType = $$(obj["thematicType"]).sort((x, y) => { return x == $$(inputValue) ? -1 : y == $$(inputValue) ? 1 : 0; });
				isObservable(obj["thematicType"]) ? obj["thematicType"](thematicType) : (obj["thematicType"] = thematicType)
			}
		})

		// useEffect(() => {
		// 	if (editorName == "projectionName") {
		// 		isObservable(obj["projectionName"]) ? obj["projectionName"]($$(inputValue)) : (obj["projectionName"] = $$(inputValue))
		// 	}
		// })

		return (
			<>
				<input
					className="m-0"
					// size={50}
					ref={outerInputRef}
					value={inputValue}
					onClick={() => {
						open(!$$(open))
					}}
				></input>
				<MultiWheeler
					title={
						<input
							className="border m-5"
							type="text"
							ref={innerInputRef}
							value={inputValue}
							onChange={(e) => {
								if (editorName == "labels") {
									debugger
									const value = e.target.value
									inputValue(value)
									isObservable(obj["colLabel"]) ? obj["colLabel"](value) : (obj["colLabel"] = value)
								}
								if (editorName == "thematicColumns") {
									const value = e.target.value
									inputValue(value)
									isObservable(obj["thematicColumn"]) ? obj["thematicColumn"](value) : (obj["thematicColumn"] = value)
								}
							}}
							size={40}
						/>
					}
					headers={headers}
					visible={open}
					options={data}
					value={defaultValue}
					bottom
					mask
					ok
					changeValueOnClickOnly
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

Editors([...$$(Editors) as any, DropDownEditor])

/** @jsxImportSource woby */

import { $, $$, isObservable, ObservableMaybe, untrack, useEffect } from "woby"
import { Editors, TableRow, UIProps, skippedProperties } from "./PropertyForm"
import { EditorProps } from "./EditorProps"
import { MultiWheeler } from "../Wheeler/MultiWheeler"
import { use } from "@woby/use"
// import projAsia from "./proj/projAsia.json"
const projAsia = {}

export const DropDownEditor = () => {
	const renderCondition = (value: ObservableMaybe<any>, key) => {
		return Array.isArray($$(value)) && key != "thematic"
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
		const { editorName, obj, value: arrayObservable, changeValueOnClickOnly } = props
		const open = $(false)

		// #region init selectedValue 
		/**
		 * Ensures the array observable has a reactive 'selectedValue' property.
		 * This transforms a basic array into a 'Selectable List' data structure.
		 */
		if (isObservable(arrayObservable)) {
			// Check if the developer has already defined a custom selection observable.
			// We cast to 'any' because we are dynamically augmenting the observable function.
			if (!(arrayObservable as any).selectedValue) {

				// Grab the first item from the array to act as the initial default.
				const firstValue = $$(arrayObservable)[0];

				// Create a new Woby observable and attach it to the array.
				// This allows other parts of the app to access the selection via: 
				// myObservable.selectedValue()
				(arrayObservable as any).selectedValue = $(firstValue);
			}
		}

		/**
		 * Create a local reference to the selection observable.
		 * This 'selectionStore' is used by the UI (Wheeler/Input) to read/write 
		 * the current user choice.
		 */
		const selectionStore = (arrayObservable as any).selectedValue;
		// #endregion


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
				//@ts-expect-error
				const projectionCode = $$(obj).projection
				const projectionName = Object.keys(projAsia).filter(key => key.includes(projectionCode))
				defaultValue = [$(projectionName[0])]
				headers = [v => "Projection Name"]
				break
			default:
				// Use the selectionStore we just ensured exists
				defaultValue = [$(selectionStore ? $$(selectionStore) : $$(props.value)[0])]
				data = [$$(props.value)]
				headers = [v => editorName]
			// defaultValue = [$($$(props.value)[0])]
			// data = [$$(props.value)]
			// headers = [v => editorName]
		}

		const inputValue = use(defaultValue)
		const originalVal = $$(defaultValue[0])
		const outerInputRef = $<HTMLInputElement>()
		const innerInputRef = $<HTMLInputElement>()


		// #region MultiWheeler Synchronization Effects
		/**
		 * Input Synchronization Effect
		 * 
		 * This effect maintains consistency between the reactive state of the MultiWheeler 
		 * and the physical DOM input elements. It ensures that any selection change 
		 * made on the first wheel is immediately reflected in the text display.
		 * 
		 * Reactivity:
		 * This effect automatically re-runs whenever the primary wheel selection 
		 * (defaultValue[0]) changes.
		 */
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

		/**
		 * Operator Concatenation Effect
		 * 
		 * This effect handles the "Secondary Column" logic for columns like 'labels' or 'thematicColumns'.
		 * It monitors the second wheel of the MultiWheeler (Operators) and appends its value 
		 * to the current input text.
		 * 
		 * Functionality:
		 * If a user selects an operator (e.g., '+', '-', '*'), this code adds a space and the 
		 * operator character to the end of the existing selection from the first column.
		 * 
		 * Reactivity:
		 * Automatically triggers whenever the second wheel selection (defaultValue[1]) changes.
		 */
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

		/**
		 * Function Concatenation Effect
		 * 
		 * This effect manages the logic for the third column in the MultiWheeler (Functions).
		 * It appends a selected function name (e.g., 'Abs', 'Cos', 'Sin') to the current input string.
		 * 
		 * Logic:
		 * It monitors the "Operator" column (index 1). If an operator is selected, it 
		 * then takes the value from the "Functions" column (index 2) and appends it to the 
		 * end of the display string with a space.
		 * 
		 * Reactivity:
		 * This effect re-runs whenever the second column (defaultValue[1]) or 
		 * the third column (defaultValue[2]) selection changes.
		 */
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

		/**
		 * Selection Propagation Effect
		 * 
		 * This is the final step in the synchronization pipeline. It commits the 
		 * current 'inputValue' (the final string built by the wheel selections 
		 * or manual typing) back to the global 'selectionStore'.
		 * 
		 * Reactivity:
		 * This effect triggers whenever 'inputValue' changes, ensuring that the 
		 * data model is always in sync with the visual state of the dropdown.
		 */
		useEffect(() => {
			if (selectionStore && isObservable(selectionStore)) {
				selectionStore($$(inputValue))
			}
		})
		// #endregion


		// #region Data Persistence Effects
		/**
		 * Label Persistence Effect
		 * 
		 * Specifically handles properties with the name "labels".
		 * It maps the internal 'inputValue' string back to the object's 'colLabel' property.
		 * 
		 * Logic:
		 * Checks if the target property is an observable. If so, it updates it via 
		 * a function call; otherwise, it performs a direct assignment.
		 */
		useEffect(() => {
			if (editorName == "labels") {
				isObservable(obj["colLabel"]) ? obj["colLabel"]($$(inputValue)) : obj["colLabel"] = $$(inputValue)
			}
		})

		/**
		 * Thematic Column Persistence Effect
		 * 
		 * Specifically handles properties with the name "thematicColumns".
		 * It maps the internal 'inputValue' string back to the object's 'thematicColumn' property.
		 * 
		 * Logic:
		 * Ensures that selections made via the MultiWheeler are committed to the 
		 * underlying data model for thematic mapping.
		 */
		useEffect(() => {
			if (editorName == "thematicColumns") {
				isObservable(obj["thematicColumn"]) ? obj["thematicColumn"]($$(inputValue)) : (obj["thematicColumn"] = $$(inputValue))
			}
		})

		/**
		 * Thematic Type Reordering Effect
		 * 
		 * This effect manages the "thematicType" array. Instead of just setting a value, 
		 * it reorders the existing array to prioritize the current selection.
		 * 
		 * Logic:
		 * 1. Takes the existing array from obj["thematicType"].
		 * 2. Sorts the array so that the item matching 'inputValue' is moved to index 0.
		 * 3. Saves the newly sorted array back to the object.
		 * 
		 * Reactivity:
		 * Re-runs whenever the user changes the selection in the 'thematicType' dropdown.
		 */
		useEffect(() => {
			if (editorName == "thematicType") {
				//sort array to make inputValue first
				const thematicType = $$(obj["thematicType"]).sort((x, y) => { return x == $$(inputValue) ? -1 : y == $$(inputValue) ? 1 : 0 })
				isObservable(obj["thematicType"]) ? obj["thematicType"](thematicType) : (obj["thematicType"] = thematicType)
			}
		})

		// useEffect(() => {
		// 	if (editorName == "projectionName") {
		// 		isObservable(obj["projectionName"]) ? obj["projectionName"]($$(inputValue)) : (obj["projectionName"] = $$(inputValue))
		// 	}
		// })
		// #endregion

		return (
			<>
				<input
					class="m-0 w-full p-2"
					ref={outerInputRef}
					value={inputValue}
					onClick={() => {
						open(!$$(open))
					}}
				></input>
				<MultiWheeler
					// title={
					// 	<input
					// 		class="border m-5"
					// 		type="text"
					// 		ref={innerInputRef}
					// 		value={inputValue}
					// 		onChange={(e) => {
					// 			if (editorName == "labels") {
					// 				debugger
					// 				const value = e.target.value
					// 				inputValue(value)
					// 				isObservable(obj["colLabel"]) ? obj["colLabel"](value) : (obj["colLabel"] = value)
					// 			}
					// 			if (editorName == "thematicColumns") {
					// 				const value = e.target.value
					// 				inputValue(value)
					// 				isObservable(obj["thematicColumn"]) ? obj["thematicColumn"](value) : (obj["thematicColumn"] = value)
					// 			}
					// 		}}
					// 		size={40}
					// 	/>
					// }
					headers={headers}
					visible={open}
					options={data}
					value={inputValue}
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

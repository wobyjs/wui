import { $, $$, useEffect, isObservable, Portal } from "woby"
import { Wheeler } from "woby-wheeler"
import { EditorProps } from "./EditorProps"
import "woby-wheeler/dist/output.css"

export const DropDownEditor = (props: EditorProps) => {
	const { editorName, obj, changeValueOnClickOnly } = props
	const open = $(false)
	const functions = [
		undefined,
		"Abs",
		"Area",
		"Centroid",
		"Cos",
		"Distance",
		"Exp",
		"Floor",
		"Ln",
		"Log",
		"Pow",
		"Sin",
		"Sqrt",
		"Tan",
		"Trim",
		"LTrim",
		"RTrim",
		"Substr",
		"Length",
		"Concat",
		"Replace",
		"Area",
		"Distance",
		"Or",
		"X",
		"Y",
	]

	const operators = [undefined, "+", "-", "*", "/", "%", "=", ">", "<", ">=", "<=", "<>", "||"]
	let defaultValue
	let data

	switch (editorName) {
		case "labels":
			const val = $$(obj["colLabel"])
			defaultValue = [$(val), $(operators[0]), $(functions[0])]
			data = [$$(props.value), operators, functions]
			break
		case "thematicColumns":
			const value = $$(obj["thematicColumn"])
			defaultValue = [$(value), $(operators[0]), $(functions[0])]
			data = [$$(props.value), operators, functions]
			break
		default:
			defaultValue = [$($$(props.value)[0])]
			data = [$$(props.value)]
	}

	const inputValue = $($$(defaultValue[0]))
	const originalVal = $$(defaultValue[0])
	const outerInputRef = $<HTMLInputElement>()
	const innerInputRef = $<HTMLInputElement>()
	const inputClicked = $(false)

	useEffect(() => {
		if (!$$(innerInputRef)) return

		if ($$(innerInputRef).value == originalVal) {
			$$(innerInputRef).value = $$(defaultValue[0])
			$$(outerInputRef).value = $$(defaultValue[0])
			inputValue($$(innerInputRef).value)
		}
		else {
			if ($$(inputClicked)) {
				return
			}
			else if ($$(defaultValue[0]) == originalVal) {
				$$(innerInputRef).value = $$(defaultValue[0])
				$$(outerInputRef).value = $$(defaultValue[0])
				inputValue($$(innerInputRef).value)
			}
			else if (!$$(inputClicked)  && typeof $$(defaultValue[0]) !== "undefined") {
				$$(innerInputRef).value += " " + $$(defaultValue[0])
				$$(outerInputRef).value += " " + $$(defaultValue[0])
				defaultValue[0](undefined)
				inputValue($$(innerInputRef).value)
			}
		}
	})

	useEffect(() => {
		if (!$$(innerInputRef)) return

		if ($$(inputClicked)) {
			return
		}
		else if (!$$(inputClicked) && typeof $$(defaultValue[1]) !== "undefined") {
			$$(innerInputRef).value += " " + $$(defaultValue[1])
			$$(outerInputRef).value += " " + $$(defaultValue[1])
			defaultValue[1](undefined)
			inputValue($$(innerInputRef).value)
		}
	})

	useEffect(() => {
		if (!$$(innerInputRef)) return

		if ($$(inputClicked)) {
			return
		}
		else if (!$$(inputClicked) && typeof $$(defaultValue[2]) !== "undefined") {
			$$(innerInputRef).value += " " + $$(defaultValue[2])
			$$(outerInputRef).value += " " + $$(defaultValue[2])
			defaultValue[2](undefined)
			inputValue($$(innerInputRef).value)
		}
	})

	useEffect(() => {
		if (editorName == "labels") {
			isObservable(obj["colLabel"]) ? obj["colLabel"]($$(inputValue)) : (obj["colLabel"] = $$(inputValue))
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

	useEffect(() => {
		if (editorName == "projectionName") {
			isObservable(obj["projection"]) ? obj["projection"]($$(inputValue)) : (obj["projection"] = $$(inputValue))
		}
	})

	return (
		<>
			<input
				className="border m-5"
				size={40}
				ref={outerInputRef}
				value={inputValue}
				onClick={() => {
					open(true)
					inputClicked(true)
				}}
			></input>
			<Portal mount={document.body}>
				<Wheeler
					title={
						<input
							className="border m-5"
							type="text"
							ref={innerInputRef}
							value={inputValue}
							onChange={(e) => {
								if (editorName == "labels") {
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
					data={data}
					value={defaultValue}
					open={open}
					toolbar
					hideOnBlur
					commitOnBlur
					changeValueOnClickOnly={changeValueOnClickOnly}
					inputClicked={inputClicked}
				/>
			</Portal>
		</>
	)
}

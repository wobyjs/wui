import { $, $$, useEffect, isObservable } from "woby"
import { Wheeler } from "woby-wheeler"
import { EditorProps } from "./EditorProps"
import "woby-wheeler/dist/output.css"

export const DropDownEditor = (props: EditorProps) => {
	const { value, editorName, obj } = props
	const sshown = $(false)
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
	const defaultValue = editorName == "labels" || editorName == "thematicColumns" ? [$($$(value)[0]), $(operators[0]), $(functions[0])] : [$($$(value)[0])]
	const data = editorName == "labels" || editorName == "thematicColumns" ? [$$(value), operators, functions] : [$$(value)]
	const inputValue = $($$(defaultValue[0]))
	console.log("dropdown")
	const getInputValue = () => {
		const textFieldVal = defaultValue
			.map((v) => {
				if (!$$(v)) return
				return $$(v)
			})
			.filter((v) => v)
			.join(" ")

		return textFieldVal != $$(inputValue) ? $$(inputValue) : textFieldVal
	}

	useEffect(() => {
		if (editorName == "labels") {
			const labelValue = defaultValue
				.map((v) => {
					if (!$$(v)) return
					return $$(v)
				})
				.filter((v) => v)
				.join(" ")
			inputValue(labelValue)
			isObservable(obj["colLabel"]) ? obj["colLabel"](labelValue) : (obj["colLabel"] = labelValue)
		}

		// if (editorName == "thematicColumns") {
		// 	const labelValue = defaultValue
		// 		.map((v) => {
		// 			if (!$$(v)) return
		// 			return $$(v)
		// 		})
		// 		.filter((v) => v)
		// 		.join(" ")
		// 	inputValue(labelValue)
		// 	isObservable(obj["thematicColumn"]) ? obj["thematicColumn"](labelValue) : (obj["thematicColumn"] = labelValue)
		// }

		if (editorName == "projectionName") {
			inputValue($$(defaultValue[0]))
			isObservable(obj["projection"]) ? obj["projection"]($$(defaultValue[0])) : (obj["projection"] = $$(defaultValue[0]))
		}
	})

	return (
		<>
			<input
				className="border m-5"
				size={40}
				value={getInputValue}
				onClick={() => sshown(true)}
			></input>
			<Wheeler
				title={
					<input
						className="border m-5"
						type="text"
						value={getInputValue}
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
				open={sshown}
				toolbar
				hideOnBlur
				commitOnBlur
			/>
		</>
	)
}

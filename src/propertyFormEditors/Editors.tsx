import { NumberField } from "../NumberField"
import { TextField } from "../TextField"
import { Checkbox } from "../Checkbox"
import { $, $$, ObservableMaybe, isObservable, useEffect } from "woby"
import { Wheeler } from "woby-wheeler"
import "woby-wheeler/dist/output.css"

type EditorProps = {
	reactive: ObservableMaybe<boolean>
	value: ObservableMaybe<any>
	onChange?: (e) => void
	name?: string
	obj?: ObservableMaybe<{}>
	editorName?: string
}

export const StringEditor = (props: EditorProps) => {
	const { value } = props

	return (
		<TextField
			className={""}
			value={value}
			assignOnEnter
			disabled={!isObservable(value)}
		></TextField>
	)
}

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
	const defaultValue = editorName == "labels" ? [$($$(value)[0]), $(operators[0]), $(functions[0])] : [$($$(value)[0])]
	const data = editorName == "labels" ? [$$(value), operators, functions] : [$$(value)]

	useEffect(() => {
		if (editorName == "labels") {
			const labelValue = defaultValue
				.map((v) => {
					if (!$$(v)) return
					return $$(v)
				})
				.filter((v) => v)
				.join(" ")
			isObservable(obj["colLabel"]) ? obj["colLabel"](labelValue) : (obj["colLabel"] = labelValue)
		}
		if (editorName == "projectionName") {
			isObservable(obj["projection"]) ? obj["projection"]($$(defaultValue[0])) : (obj["projection"] = $$(defaultValue[0]))
		}
	})

	return (
		<>
			<input
				className="border m-5"
				size={40}
				value={() => {
					const labelValue = defaultValue
						.map((v) => {
							if (!$$(v)) return
							return $$(v)
						})
						.filter((v) => v)
						.join(" ")
					return labelValue
				}}
				onClick={() => sshown(true)}
			></input>
			<Wheeler
				title={
					<input
						className="border m-5"
						type="text"
						value={() => {
							const labelValue = defaultValue
								.map((v) => {
									if (!$$(v)) return
									return $$(v)
								})
								.filter((v) => v)
								.join(" ")
							return labelValue
						}}
						onChange={(e) => {
							if (editorName == "labels") {
								const value = e.target.value
								isObservable(obj["colLabel"]) ? obj["colLabel"](value) : (obj["colLabel"] = value)
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

export const NumberEditor = (props: EditorProps) => {
	const { value } = props

	return (
		<NumberField
			noMinMax
			value={value}
			class="[&_input]:w-full [&_button]:w-[2rem] [&_button]:text-[130%] [&_button]:leading-[0] [&_button]:font-bold h-[2rem]"
			disabled={!isObservable(value)}
		></NumberField>
	)
}

export const ColorEditor = (props: EditorProps) => {
	const { value, reactive, onChange } = props

	return (
		<input
			type="color"
			value={value}
			disabled={!isObservable(value)}
			onChange={(e) => {
				!$$(reactive) && isObservable(value) ? (value?.(e.target.value), onChange?.(e)) : undefined
			}}
		></input>
	)
}

export const BooleanEditor = (props: EditorProps) => {
	const { value, onChange } = props
	const originalValue = $($$(value))

	return (
		<Checkbox
			checked={$$(value)}
			disabled={!isObservable(value)}
			onChange={(e) => {
				originalValue((e.target as HTMLInputElement).value)
				onChange?.(e)
			}}
		/>
	)
}

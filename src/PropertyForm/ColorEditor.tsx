/** @jsxImportSource woby */

import { $$, ObservableMaybe, isObservable, useEffect } from "woby"
import { Editors, UIProps } from "./PropertyForm"
import { EditorProps } from "./EditorProps"

export const ColorEditor = () => {
	const renderCondition = (value: ObservableMaybe<string>, key) => {
		if ($$(value) == undefined) return false
		const colorVal = $$(value).length == 9 ? $$(value).slice(0, -2) : $$(value)
		const hexColorReg = /^#[0-9A-F]{6}$/i
		const isColor = isObservable(value) ? hexColorReg.test(colorVal) : hexColorReg.test(colorVal)
		const isString = isObservable(value) ? typeof $$(value) == "string" : typeof value == "string"

		return isString && isColor
	}

	const UI = (props: UIProps<string>) => {
		const { value, editorName } = props
		const skippedProperties = ["partial", "primitiveType", "restdb", "verticalOrigin", "horizontalOrigin", "labelProps", "labelShow", "Altitude", "url", "distanceDisplayCondition", "eyeOffset", "ids", "id", "columnsDecoder", "style", "priority"]
		const optionName = editorName.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, function (str) {
			return str.toUpperCase()
		})

		return skippedProperties.includes(editorName) ? null : (
			<tr className="flex h-fit items-center">
				<th className={`w-[150px] text-right`}>{optionName}</th>
				<td className="w-full">
					<ClrEditor
						value={value}
						editorName={editorName}
					/>
				</td>
			</tr>
		)
	}

	const ClrEditor = (props: EditorProps) => {
		const { value, reactive, onChange, editorName } = props

		const hasAlpha = $$(value).length == 9
		const colorVal = $$(value).length == 9 ? $$(value).slice(0, -2) : $$(value)
		const alphaVal = hasAlpha ? parseInt($$(value).slice(-2), 16) / 255 : undefined

		return (
			<>
				<input
					type="color"
					value={colorVal}
					disabled={!isObservable(value)}
					onChange={(e) => {
						!$$(reactive) && isObservable(value) ? (value?.(e.target.value), onChange?.(e)) : undefined
					}}
				></input>
				{hasAlpha && <input
					type="range"
					id="alpha"
					onChange={(e) => {
						const value = e.target.value
						console.log("alpha", value)
					}}
					min={"0"}
					max={"1"}
					step={"0.1"}
					value={alphaVal}
				>
				</input>}
			</>
		)
	}

	return {
		UI,
		renderCondition,
		type: "ColorEditor",
	}
}

Editors([...$$(Editors) as any, ColorEditor])

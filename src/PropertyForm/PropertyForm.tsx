/** @jsxImportSource woby */

import { $, $$, ObservableMaybe, type JSX } from "woby"
import { Button } from "../Button"

type PropertyFormProps = {
	obj: any
	order?: string[]
	className?: JSX.Class
	onCommit?: () => void
}

export type UIProps<T> = {
	value: ObservableMaybe<T>
	reactive: ObservableMaybe<boolean>
	data: ObservableMaybe<any>
	editorName: string
	onChange: (e) => void
	changeValueOnClickOnly?: ObservableMaybe<boolean>
}


const dashMatchReg = /^-([a-zA-Z].*)-$/
const frontDashReg = /^-[a-zA-Z].*$/

/**
 * Used to filter properties based on whether the Object key has -, and changes their enumerable property
 * @param json object
 * @param filterUndefined boolean
 * @returns
 */
export function changeEnumerable(json: object) {
	Object.keys(json).forEach((v) => {
		if (dashMatchReg.test(v) || frontDashReg.test(v)) {
			let key = dashMatchReg.test(v) ? v.match(dashMatchReg)[1] : v.match(frontDashReg)[1]
			delete json[v]

			if (json[key] == undefined) {
				Object.defineProperties(json, {
					[key]: {
						enumerable: false,
					},
				})
			}
		}
	})

	const sorted = Object.keys(json)
		.sort()
		.reduce(
			(acc, key) => ({
				...acc,
				[key]: json[key],
			}),
			{}
		)
	return sorted
}


export const Editors = $<
	(() => {
		UI: (props: { data, editorName: string, value: any }) => JSX.Element,
		renderCondition: (values: ObservableMaybe<any>, key?: string) => boolean
	})[]
>([])

export const PropertyForm = (props: PropertyFormProps) => {
	changeEnumerable(props.obj)
	const { obj, order, className } = props
	const formUI = $$(Editors).map((e) => e())
	const dashMatchReg = /^-([a-zA-Z].*)-$/

	const renderForm = (propertyData: object, title?: string, order?: string[]) => {
		const sortedKeys = Object.keys(propertyData).sort((a, b) => order?.indexOf(a) - order?.indexOf(b))
		if (sortedKeys.indexOf("colLabel") != -1) {
			sortedKeys.splice(sortedKeys.indexOf("colLabel"), 1)
		}

		const skippedProperties = ["primitiveType", "restdb", "labelProps", "labelShow", "Altitude", "url", "distanceDisplayCondition", "eyeOffset", "id", "columnsDecoder", "style", "priority"]
		const form = sortedKeys.map((key) => {
			if (dashMatchReg.test(key)) {
				return
			}

			if (key.includes("Obj") || key.startsWith("$")) {
				return
			}

			if (skippedProperties.includes(key)) {
				return
			}

			const value = propertyData[key]
			const optionName = Array.isArray(propertyData)
				? null
				: key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, function (str) {
					return str.toUpperCase()
				})

			return [
				() =>
					title ? (
						<tr>
							<td>{title}</td>
						</tr>
					) : null,
				<>
					{() =>
						($$(value) && !(value instanceof HTMLElement)) || $$(value) === 0 ? (
							<tr className="flex h-fit items-center">
								<th className="w-[40%] text-right">{optionName}</th>
								<td className="w-full">
									{formUI.map((formFields) => {
										const { UI, renderCondition } = formFields
										const renderCon = renderCondition(value, key)

										return (
											renderCon && (
												<UI
													data={propertyData}
													editorName={key}
													value={value}
												/>
											)
										)
									})}
								</td>
							</tr>
						) : undefined
					}
				</>,
			]
		})

		return form
	}

	return (
		//@ts-ignore
		<div>
			<div class={["overflow-auto table-striped", () => (className ? className : "h-[300px]")] as JSX.Class}>
				<table class="w-100 table-striped table-bordered table-sm">
					<tbody>{renderForm(obj, undefined, order)}</tbody>
				</table>
			</div>
			<div>
				{() =>
					props.onCommit ? (
						<Button
							onClick={(e) => {
								e.stopImmediatePropagation()
								props.onCommit?.()
							}}
						>
							Commit Changes
						</Button>
					) : null
				}
			</div>
		</div>
	)
}

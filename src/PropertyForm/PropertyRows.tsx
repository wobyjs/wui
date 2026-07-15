/** @jsxImportSource woby */

import { $, $$, type JSX, defaults, customElement, type ElementAttributes } from "woby"
import { Button } from "../Button"
import { changeEnumerable } from "./PropertyForm"
import { Editors } from "./Editors"

type PropertyRowProps = {
	obj: any
	order?: string[]
	className?: JSX.Class
	indentLvl?: number
	onCommit?: () => void
}

export const PropertyRows = defaults(() => ({
	obj: $(null as any),
	order: $([]),
	className: $(''),
	indentLvl: $(0),
	onCommit: null as (() => void) | null,
}), (props: PropertyRowProps) => {
	const { obj, order, indentLvl } = props
	const getFormUI = () => $$(Editors).map((e) => e())
	const dashMatchReg = /^-([a-zA-Z].*)-$/

	const renderForm = (propertyData: object, title?: string, order?: string[]) => {
		changeEnumerable(propertyData)
		const sortedKeys = Object.keys(propertyData).sort((a, b) => order?.indexOf(a) - order?.indexOf(b))
		if (sortedKeys.indexOf("colLabel") != -1) {
			sortedKeys.splice(sortedKeys.indexOf("colLabel"), 1)
		}

		const form = sortedKeys.map((key) => {
			if (dashMatchReg.test(key)) {
				return
			}

			if (key.includes("Obj") || key.startsWith("$")) {
				return
			}

			const value = propertyData[key]

			return (
				<>
					{() =>
						title ? (
							<tr>
								<td>{title}</td>
							</tr>
						) : null}
					{() =>
						($$(value) && !(value instanceof HTMLElement)) || $$(value) === 0 || $$(value) === false ? (
							<>
								{getFormUI().map((formFields) => {
									const { UI, renderCondition } = formFields
									const renderCon = renderCondition(value, key)

									return (
										renderCon && (
											<UI
												data={propertyData}
												editorName={key}
												value={value}
												indentLvl={indentLvl}
											/>
										)
									)
								})}
							</>
						) : undefined
					}
				</>
			)
		})

		return form
	}

	return (
		<>
			{() => { $$(Editors); const data = $$(obj); return data ? renderForm(data, undefined, $$(order)) : null }}
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
		</>
	)
})

// NOTE: Register the custom element
customElement('wui-property-rows', PropertyRows)

// NOTE: Add the custom element to the JSX namespace
declare module 'woby' {
	namespace JSX {
		interface IntrinsicElements {
			'wui-property-rows': ElementAttributes<typeof PropertyRows>
		}
	}
}

export default PropertyRows

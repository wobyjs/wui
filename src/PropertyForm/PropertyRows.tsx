/** @jsxImportSource woby */

import { $$, type JSX } from "woby"
import { Button } from "../Button"
import { changeEnumerable, Editors } from "./PropertyForm"

type PropertyRowProps = {
	obj: any
	order?: string[]
	className?: JSX.Class
	textAlign?: string
	onCommit?: () => void
}

export const PropertyRows = (props: PropertyRowProps) => {
	changeEnumerable(props.obj)
	const { obj, order, className, textAlign } = props
	const formUI = $$(Editors).map((e) => e())
	const dashMatchReg = /^-([a-zA-Z].*)-$/

	const renderForm = (propertyData: object, title?: string, order?: string[]) => {
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
		
			return [
				() =>
					title ? (
						<tr>
							<td>{title}</td>
						</tr>
					) : null,
				<>
					{() =>
						($$(value) && !(value instanceof HTMLElement)) || $$(value) === 0 || $$(value) === false ? (
							<>
								{formUI.map((formFields) => {
									const { UI, renderCondition } = formFields
									const renderCon = renderCondition(value, key)

									return (
										renderCon && (
											<UI
												data={propertyData}
												editorName={key}
												value={value}
												textAlign={textAlign}
											/>
										)
									)
								})}
							</>
						) : undefined
					}
				</>,
			]
		})

		return form
	}

	return (
		<>
			{renderForm(obj, undefined, order)}
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
}

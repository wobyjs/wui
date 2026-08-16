/** @jsxImportSource woby */

import { $, $$, type JSX, type ObservableMaybe, defaults, customElement, type ElementAttributes } from "woby"
import { Button } from "../Button"
import { changeEnumerable } from "./PropertyForm"
import { Editors } from "./Editors"

type PropertyRowProps = {
	obj: any
	order?: ObservableMaybe<string[]>
	className?: JSX.Class
	indentLvl?: number
	/** `defaults()` supplies `null` when no caller passes one — see the unwrap note below. */
	onCommit?: (() => void) | null
}

export const PropertyRows = defaults(() => ({
	obj: $(null as any),
	order: $([] as string[]),
	className: $(''),
	// Plain `0`, not `$(0)`: `defaults()` wraps a non-observable into `observable(0)` anyway, so
	// the runtime value is identical — but the inferred prop type stays `number`, which is what
	// callers actually pass (`indentLvl={indentLvl + 1}` from ObjectEditor).
	indentLvl: 0,
	onCommit: null as (() => void) | null,
}), (props: PropertyRowProps) => {
	const { obj, order, indentLvl } = props
	const getFormUI = () => $$(Editors).map((e) => e())
	const dashMatchReg = /^-([a-zA-Z].*)-$/

	const renderForm = (propertyData: Record<string, any>, title?: string, order?: string[]) => {
		changeEnumerable(propertyData)
		const sortedKeys = Object.keys(propertyData).sort((a, b) => (order?.indexOf(a) ?? -1) - (order?.indexOf(b) ?? -1))
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
						($$(value) !== null && $$(value) !== undefined && !(value instanceof HTMLElement)) ? (
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
				{() => {
					// See PropertyForm: `defaults()` wraps the `null` default into
					// observable(null), which is itself a function — so the guard always
					// passed and the call only read the observable. Unwrap with
					// `getFunction: false`, or $$ would CALL a real callback here.
					const commit = $$(props.onCommit, false)
					if (typeof commit !== 'function') return null
					return (
						<Button
							onClick={(e: Event) => {
								e.stopImmediatePropagation()
								commit()
							}}
						>
							Commit Changes
						</Button>
					)
				}}
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

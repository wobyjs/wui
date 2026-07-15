/** @jsxImportSource woby */

import { $, $$, ObservableMaybe, Observable, type JSX, defaults, customElement, type ElementAttributes } from "woby"
import { Button } from "../Button"
import { Editors, UIProps, skippedProperties, indent } from "./Editors"

type PropertyFormProps = {
	obj: any
	order?: string[]
	class?: JSX.Class
	textAlign?: string
	onCommit?: () => void
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
	if (!json) return
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

export const TableRow = (props) => {
	const { optionName, children, indentLvl } = props

	return (
		<tr class="flex w-full items-stretch border-x border-b border-gray-200 bg-white first:border-t transition-colors hover:bg-gray-50/30">
			<th class="flex w-[150px] shrink-0 items-center px-4 py-2 bg-gray-50/50 border-r border-gray-200 select-none">
				<span class={[
					indent[indentLvl] ?? '',
					"text-[10px] uppercase tracking-wider font-bold text-slate-500",
					"truncate pointer-events-none"
				]}>
					{optionName}
				</span>
			</th>

			<td class="flex flex-1 items-center px-4 py-1.5 min-h-[38px] text-sm text-slate-700">
				<div class="w-full h-full flex items-center">
					{children}
				</div>
			</td>
		</tr>
	)
}
export const PropertyForm = defaults(() => ({
	obj: $(null as any),
	order: $([]),
	class: $(''),
	textAlign: $(''),
	onCommit: null as (() => void) | null,
}), (props: PropertyFormProps) => {
	const { obj, order, class: className, textAlign } = props
	const dashMatchReg = /^-([a-zA-Z].*)-$/

	const renderRows = () => {
		const data = $$(obj) // unwrap observable to get the actual object
		const editorsLen = $$(Editors).length
		if (!data) return null
		if (editorsLen === 0) return null

		changeEnumerable(data)
		const sortedKeys = Object.keys(data).sort((a, b) => $$(order)?.indexOf(a) - $$(order)?.indexOf(b))
		if (sortedKeys.indexOf("colLabel") != -1) {
			sortedKeys.splice(sortedKeys.indexOf("colLabel"), 1)
		}

		const formUI = $$(Editors).map((e) => e())

		return sortedKeys
			.filter((key) => !dashMatchReg.test(key) && !key.includes("Obj") && !key.startsWith("$"))
			.map((key) => {
				const value = data[key]
				const actualValue = $$(value)

				const isRenderable = actualValue !== undefined && (
					!(actualValue instanceof HTMLElement) || key === 'children'
				)

				if (!isRenderable) return null

				return formUI.map((formFields) => {
					const { UI, renderCondition } = formFields
					if (renderCondition(value, key)) {
						return <UI data={data} editorName={key} value={value} />
					}
				})
			})
	}

	return (
		<div class="flex flex-col h-full">
			<div
				onclick={e => e.stopPropagation()}
				class={() => [
					"rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white",
					($$(className) || "m-3")
				]}
			>
				<div class="px-4 py-2 bg-gray-50 border-b border-gray-200">
					<h3 class="text-[11px] font-bold uppercase tracking-widest text-slate-400">
						Component Properties
					</h3>
				</div>

				<table class="w-full border-collapse table-sm">
					<tbody class="flex flex-col">{renderRows}</tbody>
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
})

// NOTE: Register the custom element
customElement('wui-property-form', PropertyForm)

// NOTE: Add the custom element to the JSX namespace
declare module 'woby' {
	namespace JSX {
		interface IntrinsicElements {
			'wui-property-form': ElementAttributes<typeof PropertyForm>
		}
	}
}

export default PropertyForm

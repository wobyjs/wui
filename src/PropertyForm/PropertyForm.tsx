/** @jsxImportSource woby */

import { $, $$, ObservableMaybe, Observable, type JSX } from "woby"
import { Button } from "../Button"

type PropertyFormProps = {
	obj: any
	order?: string[]
	class?: JSX.Class
	textAlign?: string
	onCommit?: () => void
}

export type UIProps<T> = {
	value: ObservableMaybe<T>
	reactive: ObservableMaybe<boolean>
	data: ObservableMaybe<any>
	editorName: string
	textAlign?: string
	indentLvl?: number
	open?: Observable<boolean>
	button?: JSX.Element
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
		UI: (props: { data, editorName: string, value: any, indentLvl?: number, textAlign?: string }) => JSX.Element,
		renderCondition: (values: ObservableMaybe<any>, key?: string) => boolean
	})[]
>([])

export const skippedProperties = ["autoDistance", "rotated", "tolerance", "isCached", "snap", "zIndex", "show", "label", "isWall", "outline", "partial", "projection", "primitiveType", "restdb", "verticalOrigin", "horizontalOrigin", "labelProps", "labelShow", "Altitude", "url", "distanceDisplayCondition", "eyeoffset", "ids", "id", "columnsDecoder", "style", "priority"]
export const indent = ["pl-4", "pl-8", "pl-12", "pl-16"]

export const TableRow = (props) => {
	const { optionName, children, indentLvl } = props

	return (
		<tr class="flex w-full items-stretch border-x border-b border-gray-200 bg-white first:border-t transition-colors hover:bg-gray-50/30">
			<th class="flex w-[150px] shrink-0 items-center px-4 py-2 bg-gray-50/50 border-r border-gray-200 select-none">
				<span class={`
					${indent[indentLvl]} 
					text-[10px] uppercase tracking-wider font-bold text-slate-500 
					truncate pointer-events-none
				`}>
					{optionName.replace(/([A-Z])/g, ' $1')}
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
export const PropertyForm = (props: PropertyFormProps) => {
	changeEnumerable(props.obj)
	const { obj, order, class: className, textAlign } = props
	const formUI = $$(Editors).map((e) => e())
	const dashMatchReg = /^-([a-zA-Z].*)-$/

	const renderForm = (propertyData: object, title?: string, order?: string[]) => {
		const sortedKeys = Object.keys(propertyData).sort((a, b) => order?.indexOf(a) - order?.indexOf(b))
		if (sortedKeys.indexOf("colLabel") != -1) {
			sortedKeys.splice(sortedKeys.indexOf("colLabel"), 1)
		}

		const form_ = sortedKeys.map((key) => {
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

		const form = sortedKeys.map((key) => {
			if (dashMatchReg.test(key) || key.includes("Obj") || key.startsWith("$")) return

			const value = propertyData[key]

			return (
				<>
					{title && <tr><td>{title}</td></tr>}

					{/* 
						{() => {
							const actualValue = $$(value)
							const isRenderable = actualValue !== undefined && !(actualValue instanceof HTMLElement)

							return isRenderable ? (
								<>
									{formUI.map((formFields) => {
										const { UI, renderCondition } = formFields
										if (renderCondition(value, key)) {
											return (
												<UI
													data={propertyData}
													editorName={key}
													value={value}
													textAlign={textAlign}
												/>
											)
										}
									})}
								</>
							) : null
						}}
					*/}
					{() => {
						const actualValue = $$(value)

						// ALLOW if it's not an HTMLElement OR if the property name is 'children'
						const isRenderable = actualValue !== undefined && (
							!(actualValue instanceof HTMLElement) || key === 'children'
						)

						if (!isRenderable) return null

						return (
							<>
								{formUI.map((formFields) => {
									const { UI, renderCondition } = formFields
									// Pass 'key' so the editor knows which property it is looking at
									if (renderCondition(value, key)) {
										return <UI data={propertyData} editorName={key} value={value} />
									}
								})}
							</>
						)
					}}
				</>
			)
		})

		return form
	}

	return (
		//@ts-ignore
		<div class="flex flex-col h-full">
			<div
				onClick={e => e.stopPropagation()}
				class={() => [
					"rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white",
					(className ? className : "m-3")
				]}
			>
				<div class="px-4 py-2 bg-gray-50 border-b border-gray-200">
					<h3 class="text-[11px] font-bold uppercase tracking-widest text-slate-400">
						Component Properties
					</h3>
				</div>

				<table class="w-full border-collapse table-sm">
					<tbody class="flex flex-col">{renderForm(obj, undefined, order)}</tbody>
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

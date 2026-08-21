/** @jsxImportSource woby */

import { $, $$, ObservableMaybe, Observable, type JSX, defaults, customElement, type ElementAttributes } from "woby"
import { Button } from "../Button"
import { Editors, UIProps, skippedProperties, indent } from "./Editors"

type PropertyFormProps = {
	obj: any
	order?: ObservableMaybe<string[]>
	class?: JSX.Class
	/** Heading above the rows. Empty string renders no heading bar. */
	heading?: ObservableMaybe<string>
	textAlign?: ObservableMaybe<string>
	/** `defaults()` supplies `null` when no caller passes one — see the unwrap note below. */
	onCommit?: (() => void) | null
}

const dashMatchReg = /^-([a-zA-Z].*)-$/
const frontDashReg = /^-[a-zA-Z].*$/

/**
 * Used to filter properties based on whether the Object key has -, and changes their enumerable property
 * @param json object
 * @param filterUndefined boolean
 * @returns
 */
export function changeEnumerable(json: Record<string, any>) {
	if (!json) return
	Object.keys(json).forEach((v) => {
		if (dashMatchReg.test(v) || frontDashReg.test(v)) {
			let key = (dashMatchReg.test(v) ? v.match(dashMatchReg) : v.match(frontDashReg))![1]
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

export const TableRow = (props: { optionName?: JSX.Child, children?: JSX.Child, indentLvl?: number }) => {
	const { optionName, children, indentLvl } = props

	return (
		<tr class="flex w-full items-stretch border-x border-b border-gray-200 bg-white first:border-t transition-colors hover:bg-gray-50/30">
			<th class="flex w-[150px] shrink-0 items-center px-4 py-2 bg-gray-50/50 border-r border-gray-200 select-none">
				<span class={[
					indent[indentLvl!] ?? '',
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
// The def values are cast to the caller-facing prop types rather than left as the concrete
// `Observable<T>` they are initialised with: `defaults()` exposes `Partial<ReturnType<def>>` to
// callers, and `Observable<T>` is invariant, so an uncast def would reject `class="m-0"` or a plain
// object for `obj` — the ordinary way this component is used from JSX.
const def = () => ({
	obj: $(null as any) as any,
	order: $([] as string[]) as ObservableMaybe<string[]>,
	class: $('') as JSX.Class,
	// Heading shown above the rows. Defaults to the historical text so the standalone
	// <wui-property-form> is unchanged; pass an empty string to drop the bar entirely,
	// which is what PropertyPanel does -- its own dialog header already names the
	// target, and two stacked uppercase grey bars said the same thing twice.
	heading: $('Component Properties') as ObservableMaybe<string>,
	textAlign: $('') as ObservableMaybe<string>,
	onCommit: null as (() => void) | null,
})

export const PropertyForm: Defaulted<typeof def> = defaults(def, (props: PropertyFormProps) => {
	const { obj, order, class: className, textAlign } = props
	const dashMatchReg = /^-([a-zA-Z].*)-$/

	const renderRows = () => {
		const data = $$(obj) // unwrap observable to get the actual object
		const editorsLen = $$(Editors).length
		if (!data) return null
		if (editorsLen === 0) return null

		// DEBUG: Log raw object keys before any mutation
		console.log('[PropertyForm] raw keys before changeEnumerable:', JSON.stringify(Object.keys(data)))

		changeEnumerable(data)

		// DEBUG: Log keys after changeEnumerable mutation
		const keysAfter = Object.keys(data)
		console.log('[PropertyForm] keys after changeEnumerable:', JSON.stringify(keysAfter), 'width?', keysAfter.includes('width'))

		const sortedKeys = keysAfter.sort((a, b) => ($$(order)?.indexOf(a) ?? -1) - ($$(order)?.indexOf(b) ?? -1))
		if (sortedKeys.indexOf("colLabel") != -1) {
			sortedKeys.splice(sortedKeys.indexOf("colLabel"), 1)
		}

		console.log('[PropertyForm] keys after sort:', JSON.stringify(sortedKeys), 'width?', sortedKeys.includes('width'))

		const formUI = $$(Editors).map((e) => e())

		const filtered = sortedKeys
			.filter((key) => !dashMatchReg.test(key) && !key.includes("Obj") && !key.startsWith("$"))

		console.log('[PropertyForm] keys after filter:', JSON.stringify(filtered), 'width?', filtered.includes('width'))

		return filtered
			.map((key) => {
				const value = data[key]
				const actualValue = $$(value)

				const isRenderable = actualValue !== null && actualValue !== undefined && (
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
				onClick={(e: Event) => e.stopPropagation()}
				class={() => [
					"rounded-lg border border-gray-200 overflow-hidden shadow-sm bg-white",
					($$(className) || "m-3")
				]}
			>
				{() => {
					const t = $$(props.heading)
					if (!t) return null
					return (
						<div class="px-4 py-2 bg-gray-50 border-b border-gray-200">
							<h3 class="text-[11px] font-bold uppercase tracking-widest text-slate-400">
								{t}
							</h3>
						</div>
					)
				}}

				<table class="w-full border-collapse table-sm">
					<tbody class="flex flex-col">{renderRows}</tbody>
				</table>
			</div>
			<div>
				{() => {
					// `defaults()` turns the plain `onCommit: null` default into
					// observable(null), and an observable IS a function — so a bare
					// `props.onCommit` was always truthy (button rendered even when no
					// caller supplied a callback) and `props.onCommit?.()` merely READ
					// the observable, making every click a no-op. Unwrap first — with
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

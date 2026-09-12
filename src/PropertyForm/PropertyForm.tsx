/** @jsxImportSource woby */

import { $, $$, ObservableMaybe, Observable, type JSX, defaults, customElement, type ElementAttributes } from "woby"
import { Button } from "../Button"
import { Editors, UIProps, skippedProperties, indent } from "./Editors"
import { tx } from "../i18n"

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

/**
 * A button a row may carry to the right of its editor.
 *
 * Structural on purpose: `TableRow` is shared by the standalone
 * `<wui-property-form>` and by the editor's property panel, so it must not import
 * the editor's plugin types. `run` arrives already bound to whatever it acts on --
 * the row has no idea what that is.
 */
export type RowAction = {
	/** Caption. A single glyph is the usual case, which is why {@link title} matters. */
	label?: JSX.Child
	/** Tooltip. */
	title?: string
	/** Optional leading icon. */
	icon?: () => JSX.Child
	run: () => void
}

export const TableRow = (props: { optionName?: JSX.Child, children?: JSX.Child, indentLvl?: number, action?: RowAction, hint?: string }) => {
	const { optionName, children, indentLvl, action, hint } = props

	// Read once into a thunk so both the tooltip and the cursor affordance see the same
	// value, and so `tx` -- which reads the `locale` observable -- is only ever called
	// from inside a reaction. Hints are plugin-authored English, which is what the text
	// catalogue is keyed by.
	const hintText = () => {
		const h = $$(hint, false) as string | undefined
		return h ? tx(h) : undefined
	}

	return (
		<tr class="flex w-full items-stretch border-x border-b border-gray-200 bg-white first:border-t transition-colors hover:bg-gray-50/30">
			{/*
			  * `title` sits on the cell, not on the <span> inside it: that span carries
			  * `pointer-events-none`, and an element the pointer cannot reach never shows a
			  * native tooltip. `cursor-help` is the whole affordance -- at 150px wide and 44
			  * hints deep, visible helper text under every row would double the panel.
			  */}
			<th
				title={hintText}
				class={[
					"flex w-[150px] shrink-0 items-center px-4 py-2 bg-gray-50/50 border-r border-gray-200 select-none",
					() => hintText() ? "cursor-help" : "",
				]}>
				<span class={[
					indent[indentLvl!] ?? '',
					"text-[10px] uppercase tracking-wider font-bold text-slate-500",
					"truncate pointer-events-none"
				]}>
					{optionName}
				</span>
			</th>

			<td class="flex flex-1 items-center px-4 py-1.5 min-h-[38px] text-sm text-slate-700">
				<div class="w-full h-full flex items-center gap-1.5">
					{children}
					{() => {
						// `defaults()` is not in play here, but the caller may still pass an
						// observable, and a bare truthiness test on one is always true.
						const a = $$(action, false) as RowAction | undefined
						if (!a || typeof a.run !== 'function') return null
						return (
							<button
								// onclick via ref rather than onClick: this form is rendered
								// inside <wui-editor>'s shadow root, where woby's delegated
								// synthetic click never arrives. An onClick here would compile,
								// read correctly, and silently do nothing.
								ref={(b: HTMLButtonElement | null) => { if (b) b.onclick = () => a.run() }}
								// Thunks, not bare calls: `tx` reads the `locale` observable, and a
								// row action's caption and tooltip are plugin-authored English, which
								// is exactly what the text catalogue is keyed by. A non-string label
								// (an icon element, say) passes straight through -- nothing to look up.
								title={() => a.title ? tx(a.title) : undefined}
								// shrink-0 so the field keeps the space: the editor beside it is
								// w-full, and without this the button is the one that collapses.
								class="shrink-0 flex items-center gap-1 px-2 py-1 rounded border border-gray-300 bg-white text-xs text-gray-700 cursor-pointer hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100"
							>
								{a.icon ? a.icon() : null}
								{() => typeof a.label === 'string' ? tx(a.label) : a.label}
							</button>
						)
					}}
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

		changeEnumerable(data)

		const keysAfter = Object.keys(data)
		const sortedKeys = keysAfter.sort((a, b) => ($$(order)?.indexOf(a) ?? -1) - ($$(order)?.indexOf(b) ?? -1))
		if (sortedKeys.indexOf("colLabel") != -1) {
			sortedKeys.splice(sortedKeys.indexOf("colLabel"), 1)
		}

		const formUI = $$(Editors).map((e) => e())

		const filtered = sortedKeys
			.filter((key) => !dashMatchReg.test(key) && !key.includes("Obj") && !key.startsWith("$"))

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

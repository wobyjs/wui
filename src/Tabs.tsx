import { $, $$, ElementAttributes, HtmlClass, HtmlString, Observable, ObservableMaybe, customElement, defaults, isObservable, useEffect, type JSX } from "woby"
import { Button } from "./Button"

const defTabs = () => ({
	class: $('', HtmlClass) as JSX.Class | undefined,
	cls: $('', HtmlClass) as JSX.Class | undefined,
	activeTag: $("", HtmlString) as ObservableMaybe<string>,
	children: $(null) as JSX.Child
})

const defTab = () => ({
	class: $('', HtmlClass) as JSX.Class | undefined,
	cls: $('', HtmlClass) as JSX.Class | undefined,
	title: $("", HtmlString) as ObservableMaybe<string>,
	children: $(null) as JSX.Child
})

const Tabs = defaults(defTabs, (props) => {
	const { class: cn, cls, activeTag, children, ...otherProps } = props

	// 1. State
	const currentTab = (isObservable(activeTag) ? activeTag : $(activeTag || "")) as Observable<string>
	const titles = $<string[]>([])

	// Refs
	const mainRef = $<HTMLElement>(null!)
	const contentRef = $<HTMLElement>(null!)

	// 2. Logic: DOM Controller
	useEffect(() => {
		const mainDiv = $$(mainRef)
		const contentDiv = $$(contentRef)
		if (!mainDiv || !contentDiv) return

		const rootNode = mainDiv.getRootNode()
		const isShadow = rootNode instanceof ShadowRoot

		// --- A. HTML Mode Fix: Move Light DOM children into Shadow DOM ---
		// If we are a Custom Element (Shadow DOM), we must grab the <wui-tab> children
		// from the host and physically move them inside our contentDiv so they render.
		if (isShadow) {
			const host = (rootNode as ShadowRoot).host as HTMLElement
			// Get immediate children of the host (the <wui-tab> elements)
			const lightChildren = Array.from(host.children)

			lightChildren.forEach(node => {
				// Check if it's a tab (by tag name)
				if (node.tagName.toLowerCase() === 'wui-tab') {
					// Moving the node appends it to the new parent and removes it from the old one
					contentDiv.appendChild(node)
				}
			})
		}

		// --- B. Scan Content Container ---
		// Now 'contentDiv' contains the tabs (either from JSX render or moved HTML nodes)
		const nodes = Array.from(contentDiv.children) as HTMLElement[]

		const foundTitles: string[] = []
		const tabNodes: HTMLElement[] = []

		nodes.forEach(node => {
			// In JSX, Tab renders a div with data-tab-title
			// In HTML, we have <wui-tab title="...">
			const t = node.getAttribute('data-tab-title') || node.getAttribute('title')

			if (t) {
				foundTitles.push(t)
				tabNodes.push(node)
			}
		})

		// --- C. Update State ---
		const currentT = $$(titles)
		if (JSON.stringify(currentT) !== JSON.stringify(foundTitles)) {
			titles(foundTitles)
		}

		const active = $$(currentTab)
		if (foundTitles.length > 0) {
			if (!active || !foundTitles.includes(active)) {
				currentTab(foundTitles[0])
			}
		}

		// --- D. Toggle Visibility ---
		const finalActive = $$(currentTab)

		tabNodes.forEach(node => {
			const t = node.getAttribute('data-tab-title') || node.getAttribute('title')

			if (t === finalActive) {
				node.style.display = 'block'
				node.removeAttribute('hidden')
			} else {
				node.style.display = 'none'
				node.setAttribute('hidden', '')
			}
		})
	})

	return (
		<div
			class={[() => $$(cn) ? $$(cn) : "", cls]}
			{...otherProps}
			ref={mainRef}
		>
			{/* Navigation Buttons */}
			<div class="flex justify-center flex-wrap gap-2 my-4 border-2 border-gray-200 py-2 rounded-lg">
				{() =>
					$$(titles).map(t => {
						const isActive = $$(currentTab) === t
						return (
							<Button
								type="custom"
								buttonFunction="button"
								cls={[
									"px-4 py-2 rounded-lg font-bold transition-colors duration-200 cursor-pointer select-none",
									isActive
										? "bg-black text-white"
										: "bg-gray-100 text-gray-600 hover:bg-gray-200"
								]}
								onClick={(e: MouseEvent) => {
									e.preventDefault()
									e.stopPropagation()
									currentTab(t)
								}}
							>
								{t}
							</Button>
						)
					})
				}
			</div>

			{/* Content Container */}
			<div
				ref={contentRef}
				class="p-4 border border-gray-200 rounded-b-lg shadow-sm bg-white min-h-[50px]"
			>
				{children}
			</div>
		</div>
	)
}) as typeof Tabs

const Tab = defaults(defTab, (props) => {
	const { title, children, class: cn, cls, ...otherProps } = props

	return (
		<div
			class={[() => $$(cn) ? $$(cn) : "", cls]}
			{...otherProps}
			data-tab-title={$$(title)}
			title={$$(title)}
		// Note: Removed style={{ display: 'none' }}.
		// We let the Parent toggle our visibility.
		// If we hide ourselves here, the HTML inner content will be double-hidden
		// (once by parent wrapper, once by this inner div).
		>
			{children}
		</div>
	)
}) as typeof Tab

export { Tab, Tabs }

customElement("wui-tab", Tab)
customElement("wui-tabs", Tabs)

declare module 'woby' {
	namespace JSX {
		interface IntrinsicElements {
			'wui-tab': ElementAttributes<typeof Tab>
			'wui-tabs': ElementAttributes<typeof Tabs>
		}
	}
}

export default { Tab, Tabs }
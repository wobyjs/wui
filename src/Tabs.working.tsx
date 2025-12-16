import { $, $$, ElementAttributes, HtmlString, Observable, ObservableMaybe, createContext, customElement, defaults, isObservable, useContext, useEffect, type JSX } from "woby"


// 1. Create a Context to pass the 'activeTag' from Parent to Child
const TabContext = createContext({
	activeTab: $("") as Observable<string>,
	titles: $([]) as Observable<string[]>,
})
const defTabs = () => ({
	cls: $(""),
	activeTag: $("", HtmlString) as ObservableMaybe<string>,
	children: $(null)
})


const defTab = () => ({
	cls: $(""),
	title: $("", HtmlString) as ObservableMaybe<string>,
	children: $(null)
})

const Tabs = defaults(defTabs, (props) => {
	const { cls, activeTag, children, ...otherProps } = props

	// 1. Setup State
	// If the user passed an Observable for activeTag, use it. Otherwise create a new one.
	// This allows the buttons to update the state.
	const currentTab = (isObservable(activeTag) ? activeTag : $(activeTag || "")) as Observable<string>
	const titles = $<string[]>([])

	// 2. Auto-Select First Tab Logic
	useEffect(() => {
		// If no tab is selected, and we have titles, select the first one
		if (!$$(currentTab) && $$(titles).length > 0) {
			currentTab($$(titles)[0])
		}
	})

	return (
		<TabContext.Provider value={{ activeTab: currentTab, titles }}>
			<div class={cls} {...otherProps}>
				<div class="flex justify-center flex-wrap gap-2 mb-4 border-2 border-gray-200 py-2 rounded-lg">
					{() =>
						$$(titles).map(t => {
							// Check if this specific button is active
							const isActive = $$(currentTab) === t

							return (
								<button
									class={[
										"px-4 py-2 rounded-t-lg font-bold transition-colors duration-200",
										isActive
											? "bg-black text-white"  // Active Style
											: "bg-gray-100 text-gray-600 hover:bg-gray-200" // Inactive Style
									]}
									onClick={() => currentTab(t)}
								>
									{t}
								</button>
							)
						})
					}
				</div>

				<div class="p-4 border border-gray-200 rounded-b-lg shadow-sm">
					{children}
				</div>
			</div>
		</TabContext.Provider>
	)
}) as typeof Tabs

const Tab = defaults(defTab, (props) => {
	const { title, children, cls, ...otherProps } = props
	const { activeTab, titles } = useContext(TabContext)

	// 1. Registration Effect
	// When this component mounts, add its title to the parent's list
	useEffect(() => {
		const t = $$(title)
		const list = $$(titles)

		// Prevent duplicates
		if (!list.includes(t)) {
			titles([...list, t])
		}
	})

	// 2. Render
	return (
		<div
			class={cls}
			{...otherProps}
			// Toggle Visibility based on context
			style={{
				display: () => {
					const active = $$(activeTab)
					const myTitle = $$(title)
					// If active tag matches my title, show me (block), else hide (none)
					return active === myTitle ? "block" : "none"
				},
				animation: "fade-in 0.2s ease-in-out"
			}}
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

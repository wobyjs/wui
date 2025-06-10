import { $, $$, ObservableMaybe, createContext, useContext, useEffect, type JSX } from "woby"
import * as React from "woby"

type TabsProps = {
	children: JSX.Child[] //| { key: string; label: JSX.Element; children: JSX.Element }
	tabChanged?: (name: ObservableMaybe<JSX.Element>) => void
	activeTag?: (name: ObservableMaybe<JSX.Element>) => JSX.Element
	inactiveTag?: (name: ObservableMaybe<JSX.Element>) => JSX.Element
}

type TabProps = {
	title?: ObservableMaybe<JSX.Element>
	children?: JSX.Child
}

const TabContext = createContext({
	activeTab: $<[ObservableMaybe<string>]>([] as any),
	tabTitles: $([]),
})

export const Tabs = (props: TabsProps) => {
	const { activeTag = (n) => n, inactiveTag = (n) => n, children } = props
	const activeTab = $<[ObservableMaybe<string>]>([] as any)
	const tabTitles = $([])

	useEffect(() => {
		props.tabChanged?.(activeTab()[0])
	})

	useEffect(() => {
		if (!activeTab().length) activeTab([tabTitles()[0]])
	})

	return (
		<>
			<TabContext.Provider
				value={{ activeTab, tabTitles }}
			// children={undefined}
			>
				<div
					className={
						"flex justify-center cursor-pointer p-8 rounded-tr-[100%] rounded-tl-[100%] border-solid border-2 border-black text-center text-[2rem]"
					}
				>
					{() =>
						tabTitles().map((item) => {
							return (
								<div
									class={"border-solid border-black border-2 m-2"}
									onClick={(e) => {
										e.stopImmediatePropagation()
										activeTab([item])
									}}
								>
									{() =>
										activeTab()[0] === item
											? activeTag(item)
											: inactiveTag(item)
									}
								</div>
							)
						})
					}
				</div>
				{children}
			</TabContext.Provider>
		</>
	)
}

export const Tab = (props: TabProps) => {
	const { title, children } = props
	const { tabTitles, activeTab } = useContext(TabContext)

	tabTitles([...$$(tabTitles), title])

	return (
		<div
			class={[
				() => (activeTab()[0] === title ? "flex" : "hidden"),
				"flex-col text-[2rem] rounded-[2rem] p-4 shadow-inner gap-8",
			]}
		>
			<div class="border-2 border-var(--text-color) flex justify-between flex-col items-center gap-16 bg-white rounded-2rem">
				{children}
			</div>
		</div>
	)
}

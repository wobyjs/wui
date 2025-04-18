import { TextField } from "../src/TextField"
import { TextArea } from "../src/TextArea"
import * as preset from "../src/TextField.effect"
import { IconButton } from "../src/IconButton"
import { Chip } from "../src/Chip"
import { Switch, useEnumSwitch } from "../src/Switch"
import { Avatar } from "../src/Avatar"
import { Badge } from "../src/Badge"
import { Appbar } from "../src/Appbar"
import { Toolbar } from "../src/Toolbar"
import { Button, variant } from "../src/Button"
import { Fab } from "../src/Fab"
import * as spreset from "../src/Switch.effect"

import * as React from 'woby'
import { render, $, $$, useEffect, type JSX } from "woby"
import "../dist/woby-wui.css"
import './input.css'
import { Collapse } from "../src/Collapse"
import { Checkbox } from "../src/Checkbox"
import { SideBar, MenuText, MenuItem } from "../src/SideBar"
import { NumberField } from "../src/NumberField"
import { Zoomable, Img } from "../src/Zoomable"
import { ToggleButton } from "../src/ToggleButton"
import { Tab, Tabs } from "../src/Tabs"
import { Wodal } from 'woby-modal'
import { useViewportSize } from 'use-woby'
import { Wheeler } from '../src/Wheeler/Wheeler'
import { MultiWheeler } from '../src/Wheeler/MultiWheeler'
import { DateTimeWheeler, DateTimeWheelerType } from '../src/Wheeler/DateTimeWheeler'

const FaceIcon = (
	<svg
		class="text-[rgb(97,97,97)] select-none w-[1em] h-[1em] inline-block fill-current shrink-0 transition-[fill] duration-200 ease-in-out delay-[0ms] text-2xl ml-[5px] -mr-1.5"
		focusable="false"
		aria-hidden="true"
		viewBox="0 0 24 24"
		data-testid="FaceIcon"
	>
		<path d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-.29.02-.58.05-.86 2.36-1.05 4.23-2.98 5.21-5.37C11.07 8.33 14.05 10 17.42 10c.78 0 1.53-.09 2.25-.26.21.71.33 1.47.33 2.26 0 4.41-3.59 8-8 8z"></path>
	</svg>
)

const row = `mr-[-15px] ml-[-15px]`

const button_ = `relative w-[74px] h-9 overflow-hidden -mt-5 mb-0 mx-auto top-2/4
[&>span]:absolute [&>span]:inset-0
[&>div]:absolute [&>div]:inset-0 [&>div]:z-[2]
[&>input]:relative [&>input]:w-full [&>input]:h-full [&>input]:opacity-0 [&>input]:cursor-pointer [&>input]:z-[3] [&>input]:m-0 [&>input]:p-0

`
const buttonr = button_ + " rounded-[100px] [&>span]:rounded-[100px]"
const buttonb2 = button_ + " rounded-sm"
const main = $<HTMLDivElement>()
const open = $(false)
const menu = $(true)

const AppIcon = (props: JSX.SVGAttributes<SVGElement>) => (
	<svg
		class="w-8 h-8 fill-current"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 20 20"
		fill="currentColor"
		{...props}
	>
		<path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
	</svg>
)
const DashboardIcon = (props: JSX.SVGAttributes<SVGElement>) => (
	<svg
		class="w-6 h-6 stroke-current"
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		{...props}
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
		/>
	</svg>
)
const SearchIcon = (props: JSX.SVGAttributes<SVGElement>) => (
	<svg
		class="w-6 h-6 stroke-current"
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		{...props}
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
		/>
	</svg>
)
const InsightsIcon = (props: JSX.SVGAttributes<SVGElement>) => (
	<svg
		class="w-6 h-6 stroke-current"
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		{...props}
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
		/>
	</svg>
)
const DocsIcon = (props: JSX.SVGAttributes<SVGElement>) => (
	<svg
		class="w-6 h-6 stroke-current"
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		{...props}
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
		/>
	</svg>
)
const ProductsIcon = (props: JSX.SVGAttributes<SVGElement>) => (
	<svg
		class="w-6 h-6 stroke-current"
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		{...props}
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
		/>
	</svg>
)
const SettingsIcon = (props: JSX.SVGAttributes<SVGElement>) => (
	<svg
		class="w-6 h-6 stroke-current"
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		{...props}
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
		/>
	</svg>
)
const MessagesIcon = (props: JSX.SVGAttributes<SVGElement>) => (
	<svg
		class="w-6 h-6 stroke-current"
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
		/>
	</svg>
)

const number = $(0)
const text1 = $("abc")
const text2 = $("change on enter")

useEffect(() => {
	console.log($$(number))
})

useEffect(() => {
	console.log($$(text1))
})
useEffect(() => {
	console.log($$(text2))
})

enum A {
	a,
	b,
}

const aa = $(A.a)

useEffect(() => {
	console.log("useEnumSwitch", $$(aa), A[$$(aa)])
})
const previousTab = $([])
const activeTab = $(["first tab", "second tab"])
const activeTab2 = $([<div>next instance tab</div>, <div>next second tab</div>])

const { height: vh, width: vw, offsetLeft: ol, offsetTop: ot, pageTop: pt, pageLeft: pl } = useViewportSize()

const options = [ /* ... options ... */
	{ value: 'apple', label: '🍎 Apple' }, { value: 'banana', label: '🍌 Banana' }, { value: 'orange', label: '🍊 Orange' }, { value: 'grape', label: '🍇 Grape' }, { value: 'strawberry', label: '🍓 Strawberry' }, { value: 'blueberry', label: '🫐 Blueberry' }, { value: 'mango', label: '🥭 Mango' }, { value: 'pineapple', label: '🍍 Pineapple' }, { value: 'kiwi', label: '🥝 Kiwi' }, { value: 'watermelon', label: '🍉 Watermelon' }, { value: 'peach', label: '🍑 Peach' }, { value: 'cherry', label: '🍒 Cherry' }
]

const visibleItemCount = $(5)
const value = $('orange')


const pickerType = $<DateTimeWheelerType>('datetime')
const selectedDate = $<Date>(new Date()) // Observable state for the date
const ok = $(false)
const dateOk = $(false)

useEffect(() => console.log('selectedDate', $$(selectedDate).toString()))
useEffect(() => console.log('value', $$(value)))

const App = () => (
	<>
		<SideBar
			class=""
			open={menu}
			width="10rem"
			disableBackground
			contentRef={main}
		>
			{/* <a href="#" class='no-underline text-[25px] text-[#818181] block transition-[0.3s] pl-8 pr-2 py-2 hover:text-[#f1f1f1] '>About</a>
        <a href="#" class='no-underline text-[25px] text-[#818181] block transition-[0.3s] pl-8 pr-2 py-2 hover:text-[#f1f1f1] '>Services</a>
        <a href="#" class='no-underline text-[25px] text-[#818181] block transition-[0.3s] pl-8 pr-2 py-2 hover:text-[#f1f1f1] '>Clients</a>
        <a href="#" class='no-underline text-[25px] text-[#818181] block transition-[0.3s] pl-8 pr-2 py-2 hover:text-[#f1f1f1] '>Contact</a> */}

			<div class="flex flex-col items-center w-40 h-full overflow-hidden text-gray-700 bg-gray-100 rounded">
				<a
					class="flex items-center w-full px-3 mt-3"
					href="#"
				>
					<AppIcon class="w-7 h-7 fill-current" />
					<MenuText>The App</MenuText>
				</a>
				<div class="w-full px-1">
					<div class="flex flex-col items-center w-full mt-3 border-t border-gray-300">
						<MenuItem>
							<DashboardIcon class="w-6 h-6 stroke-current" />
							<MenuText>Dasboard</MenuText>
						</MenuItem>
						<MenuItem>
							<SearchIcon class="w-6 h-6 stroke-current" />
							<MenuText>Search</MenuText>
						</MenuItem>
						<MenuItem>
							<InsightsIcon class="w-6 h-6 stroke-current" />
							<MenuText>Insights</MenuText>
						</MenuItem>

						<MenuItem class="ml-5 h-fit">
							<InsightsIcon class="w-6 h-6 stroke-current" />
							<MenuText>Child</MenuText>
						</MenuItem>

						<MenuItem>
							<DocsIcon class="w-6 h-6 stroke-current" />
							<MenuText>Docs</MenuText>
						</MenuItem>
					</div>
					<div class="flex flex-col items-center w-full mt-2 border-t border-gray-300">
						<MenuItem>
							<ProductsIcon class="w-6 h-6 stroke-current" />
							<MenuText>Products</MenuText>
						</MenuItem>
						<MenuItem>
							<SettingsIcon class="w-6 h-6 stroke-current" />
							<MenuText>Settings</MenuText>
						</MenuItem>
						<MenuItem class="relative">
							<MessagesIcon class="w-6 h-6 stroke-current" />
							<MenuText>Messages</MenuText>
							<span class="absolute top-0 left-0 w-2 h-2 mt-2 ml-3 bg-indigo-500 rounded-full"></span>
						</MenuItem>
					</div>
				</div>
				<a
					class="flex items-center justify-center w-full h-16 mt-auto bg-gray-200 hover:bg-gray-300"
					href="#"
				>
					<svg
						class="w-6 h-6 stroke-current"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<MenuText>Account</MenuText>
				</a>
			</div>
		</SideBar>

		<div ref={main}>
			<Appbar>
				<Toolbar>
					<IconButton
						class="text-white"
						onClick={() => menu((p) => !p)}
					>
						<svg
							class="select-none w-[1em] h-[1em] inline-block shrink-0 text-2xl [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms] "
							focusable="false"
							aria-hidden="true"
							viewBox="0 0 24 24"
						>
							<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
						</svg>
					</IconButton>

					<div class="font-medium text-xl leading-[1.6] tracking-[0.0075em] grow m-0">
						News
					</div>
					<Button>Login</Button>
				</Toolbar>
			</Appbar>



			<div class="pt-[60px]">
				{/* <Wodal visible>
					<Tabs
						activeTag={(name) => (
							<div
								class={() =>
									`"bg-white text-black font-semibold list-none border-solid p-4`
								}
							>
								{name}
							</div>
						)}
						inactiveTag={(name) => (
							<div
								class={() => `"bg-white text-black list-none border-solid p-4`}
							>
								{name}
							</div>
						)}
					>
						<Tab title={activeTab()[0]}>
							<table class={"table table-control"}>
								<tbody>
									<tr>
										<td>
											<span>span child</span>
										</td>
									</tr>
									<tr>
										<td>
											<input type={"color"} />
										</td>
									</tr>
								</tbody>
							</table>
						</Tab>
						<Tab title={activeTab()[1]}>
							<div>second tab,1 child</div>
						</Tab>
					</Tabs>
				</Wodal>
				<Tabs
					activeTag={(name) => (
						<div
							class={() =>
								`"bg-white text-red-500 font-semibold list-none border-solid p-4`
							}
						>
							{name}
						</div>
					)}
					inactiveTag={(name) => (
						<div class={() => `"bg-white text-red-500 list-none border-solid p-4`}>
							{name}
						</div>
					)}
				>
					<Tab title={activeTab2()[0]}>
						<div>2nd instance of Tab</div>
					</Tab>
					<Tab title={activeTab2()[1]}>
						<div>second instance tab,1 child</div>
					</Tab>
				</Tabs> */}

				<table class='relative top-[200]'><tbody><tr><td>
				</td>
					<Wheeler {...{
						options,
						value,
						visibleItemCount, // Initial count
						multiple: true,
						// ok,
					}} class='w-[200px] border bg-white shadow-[0_4px_8px_rgba(0,0,0,0.1)] mb-2.5 rounded-lg border-solid border-[#ccc]' />
					<td class='pl-10'>
						<div class="controls">
							<span>Visible Items: </span>
							<Button class='w-[3rem] border-2' type="button" onClick={() => visibleItemCount($$(visibleItemCount) + 2)}>++</Button>&nbsp;
							<Button class='w-[3rem] border-2' type="button" onClick={() => visibleItemCount($$(visibleItemCount) - 2)}>--</Button>
						</div >

						<Button id="setKiwiButton" type="button" onClick={() => value('kiwi')}>Set to Kiwi</Button>
						<p>Selected Value: <strong>{() => $$(value)?.join?.(' ')}</strong></p>
						<Button onClick={() => ok(true)}>OK</Button>
					</td></tr>
				</tbody>
				</table>

				{/* <DateTimeWheeler
					title={d => <div class='text-center'>{() => d.toString()}</div>}
					value={selectedDate}      // Pass date observable
					// onChange removed
					mode={pickerType}
					ok={dateOk}
				/> */}
				<MultiWheeler
					options={[["a","b"], [1,2,3], [0,5,87,8,9]]}
					title={<div>test</div>}
					value={[$("a"), $(1), $(0)]}      // Pass date observable
					headers={["col1","col2","col3"]}
					// onChange removed
					ok={dateOk}
				/>


				<div class="[@media(min-width:768px)]:w-[750px] mx-auto px-[15px]">
					<Fab class="w-18 h-18" style={{ top: () => $$(pt) + $$(vh) - (80), left: () => $$(pl) }}>
						<svg
							class="select-none w-[1em] h-[1em] inline-block fill-[black] shrink-0 text-2xl [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms]"
							focusable="false"
							aria-hidden="true"
							viewBox="0 0 24 24"
							data-testid="AddIcon"
						>
							<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
						</svg>
					</Fab>
					<Fab class="w-18 h-18" style={{ top: () => $$(pt) + (80), right: pl }}>
						☰
						{/* <svg
							class="select-none w-[1em] h-[1em] inline-block fill-[black] shrink-0 text-2xl [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms]"
							focusable="false"
							aria-hidden="true"
							viewBox="0 0 24 24"
							data-testid="AddIcon"
						>
							<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
						</svg> */}
					</Fab>

					<Badge>
						<svg
							class="select-none w-[1em] h-[1em] inline-block fill-current shrink-0 text-2xl [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms]"
							focusable="false"
							aria-hidden="true"
							viewBox="0 0 24 24"
						>
							<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"></path>
						</svg>
					</Badge>

					<Badge badgeContent="9+">
						<svg
							class="select-none w-[1em] h-[1em] inline-block fill-current shrink-0 text-2xl [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms]"
							focusable="false"
							aria-hidden="true"
							viewBox="0 0 24 24"
						>
							<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"></path>
						</svg>
					</Badge>

					<Badge badgeContent="99+">
						<svg
							class="select-none w-[1em] h-[1em] inline-block fill-current shrink-0 text-2xl [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms]"
							focusable="false"
							aria-hidden="true"
							viewBox="0 0 24 24"
						>
							<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"></path>
						</svg>
					</Badge>

					<Badge
						badgeContent="99+"
						anchorOrigin={{ vertical: "bottom" }}
					>
						<svg
							class="select-none w-[1em] h-[1em] inline-block fill-current shrink-0 text-2xl [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms]"
							focusable="false"
							aria-hidden="true"
							viewBox="0 0 24 24"
							data-testid="MailIcon"
						>
							<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"></path>
						</svg>
					</Badge>

					<Badge
						badgeContent="99+"
						anchorOrigin={{ horizontal: "left" }}
					>
						<svg
							class="select-none w-[1em] h-[1em] inline-block fill-current shrink-0 text-2xl [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms]"
							focusable="false"
							aria-hidden="true"
							viewBox="0 0 24 24"
							data-testid="MailIcon"
						>
							<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"></path>
						</svg>
					</Badge>

					<Badge
						badgeContent="99+"
						anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
					>
						<svg
							class="select-none w-[1em] h-[1em] inline-block fill-current shrink-0 text-2xl [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms]"
							focusable="false"
							aria-hidden="true"
							viewBox="0 0 24 24"
							data-testid="MailIcon"
						>
							<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"></path>
						</svg>
					</Badge>
				</div>

				<div class="[@media(min-width:768px)]:w-[750px] mx-auto px-[15px]">
					<div class="w-full relative flex justify-center bg-white border m-auto p-6 rounded-[12px_12px_0_0] border-l-0 border-r border-solid border-[#E5EAF2] [outline:0]">
						<Avatar>H</Avatar>
						<Avatar class="w-10 h-10 bg-orange-400">N</Avatar>
						<Avatar class="w-10 h-10 bg-purple-600">OP</Avatar>
					</div>

					<div class="w-full relative flex justify-center bg-white border m-auto p-6 rounded-[12px_12px_0_0] border-l-0 border-r border-solid border-[#E5EAF2] [outline:0]">
						<Avatar
							alt="Remy Sharp"
							src="https://mui.com/static/images/avatar/1.jpg"
						/>
						<Avatar
							alt="Travis Howard"
							src="https://mui.com/static/images/avatar/2.jpg"
						/>
						<Avatar
							alt="Cindy Baker"
							src="https://mui.com/static/images/avatar/3.jpg"
						/>
					</div>

					<div class="w-full relative flex justify-center bg-white border m-auto p-6 rounded-[12px_12px_0_0] border-l-0 border-r border-solid border-[#E5EAF2] [outline:0]">
						<Avatar>KD</Avatar>
						<Avatar class="w-10 h-10 bg-orange-400">JW</Avatar>
						<Avatar class="w-10 h-10 bg-purple-600">TN</Avatar>
					</div>

					<div class="w-full relative flex justify-center bg-white border m-auto p-6 rounded-[12px_12px_0_0] border-l-0 border-r border-solid border-[#E5EAF2] [outline:0]">
						<Avatar
							class="w-[24px] h-[24px]"
							alt="Remy Sharp"
							src="https://mui.com/static/images/avatar/3.jpg"
						/>
						<Avatar
							alt="Travis Howard"
							src="https://mui.com/static/images/avatar/3.jpg"
						/>
						<Avatar
							class="w-[56px] h-[56px]"
							alt="Cindy Baker"
							src="https://mui.com/static/images/avatar/3.jpg"
						/>
					</div>

					<br />
					<NumberField
						min={1}
						max={9}
						value={number}
						class="[&_input]:w-[5rem] [&_button]:w-[2rem] [&_button]:text-[130%] [&_button]:leading-[0] [&_button]:font-bold h-[2rem]"
					/>
					<br />

					<Checkbox>
						<h1 class="inline-block">h1 check</h1>
					</Checkbox>
					<br />

					<Chip
						avatar={FaceIcon}
						onDelete={() => alert("delete")}
					>
						Chip
					</Chip>
					<Chip
						class={"hover:bg-[gray]"}
						onClick={() => alert("chip clicked")}
						onDelete={() => alert("delete")}
					>
						Chip 2
					</Chip>
					<Chip class={"hover:bg-[gray]"}>Chip 3</Chip>

					<br />


					<button
						class="p-2 elevation-3 hover:bg-[gray] z-[10]"
						onClick={() => {
							open(!$$(open))
						}}
					>
						Toggle Expand/Collapse
					</button>
					<div onClick={e => console.log('aaaa')}>aaaaa</div>
					<Collapse open={open}>
						<ul>
							<li>Item</li>
							<li>Item</li>
							<li>Item</li>
							<li>Item</li>
						</ul>
						<ul>
							<li>Item</li>
							<li>Item</li>
							<li>Item</li>
							<li>Item</li>
						</ul>
					</Collapse>
					<br />

					<div class={row}>
						<h2>
							<i>Border effects</i>
						</h2>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect1, "w-full"]}
							placeholder={"effect1"}
							value={text1}
						/>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect2, "w-full"]}
							placeholder={"effect2"}
							value={text2}
							reactive
						/>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect3, "w-full"]}
							placeholder={"effect3"}
						/>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect4, "w-full"]}
							placeholder={"effect4"}
						/>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect5, "w-full"]}
							placeholder={"effect5"}
						/>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect6, "w-full"]}
							placeholder={"effect6"}
						/>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect7, "w-full"]}
							placeholder={"effect7"}
						/>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect8, "w-full"]}
							placeholder={"effect8"}
						/>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect9, "w-full"]}
							placeholder={"effect9"}
						/>
					</div>
					<div class={row}>
						<h2>
							<i>Background Effects</i>
						</h2>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[
								preset.effect10,
								"w-full",
								"[&~span]:opacity-[unset] [&:focus~span]:bg-[#000] [&~span]:bg-[#e7a8a8]",
							]}
							placeholder={"effect10"}
						/>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect11, "w-full", "border-[#F00]"]}
							placeholder={"effect11"}
						/>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect12, "w-full"]}
							placeholder={"effect12"}
						/>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect13, "w-full"]}
							placeholder={"effect13"}
						/>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect14, "w-full"]}
							placeholder={"effect14"}
						/>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect15, "w-full"]}
							placeholder={"effect15"}
						/>
					</div>
					<div class={row}>
						<h2>
							<i>Input with Label Effects</i>
						</h2>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[
								preset.effect16,
								"w-full",
								"[&~label]:text-[red] [&:focus~label]:text-[red] [&:not(:placeholder-shown)~label]:text-[red]",
							]}
							placeholder={""}
						>
							<label>effect16</label>
						</TextField>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect17, "w-full"]}
							placeholder={""}
						>
							<label>effect17</label>
						</TextField>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect18, "w-full"]}
							placeholder={""}
						>
							<label>effect18</label>
						</TextField>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect19, "w-full"]}
							placeholder={""}
						>
							<label>effect19</label>
						</TextField>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[
								preset.effect20,
								"w-full",
								"[&~span]:before:bg-[red] [&~span]:after:bg-[red] [&~span_i]:before:bg-[red] [&~span_i]:after:bg-[red]",
							]}
							placeholder={""}
						>
							<label>effect20</label>
						</TextField>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect21, "w-full"]}
							placeholder={""}
						>
							<label>effect21</label>
						</TextField>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect22, "w-full"]}
							placeholder={""}
						>
							<label>effect22</label>
						</TextField>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect23, "w-full"]}
							placeholder={""}
						>
							<label>effect23</label>
						</TextField>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect24, "w-full"]}
							placeholder={""}
						>
							<label>effect24</label>
						</TextField>

						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect19a, "w-full"]}
							placeholder={""}
						>
							<label>effect19a</label>
						</TextField>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect20a, "w-full"]}
							placeholder={""}
						>
							<label>effect20a</label>
						</TextField>
						<TextField
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect21a, "w-full"]}
							placeholder={""}
						>
							<label>effect21a</label>
						</TextField>
					</div>

					<br />
					<br />
					<br />
					<h1>TextArea</h1>
					<div class={row}>
						<h2>
							<i>Border effects</i>
						</h2>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect1, "w-full"]}
							placeholder={"effect1"}
							value={text1}
						/>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect2, "w-full"]}
							placeholder={"effect2"}
							value={text2}
							reactive
						/>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect3, "w-full"]}
							placeholder={"effect3"}
						/>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect4, "w-full"]}
							placeholder={"effect4"}
						/>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect5, "w-full"]}
							placeholder={"effect5"}
						/>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect6, "w-full"]}
							placeholder={"effect6"}
						/>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect7, "w-full "]}
							placeholder={"effect7"}
						/>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect8, "w-full"]}
							placeholder={"effect8"}
						/>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect9, "w-full"]}
							placeholder={"effect9"}
						/>
					</div>
					<div class={row}>
						<h2>
							<i>Background Effects</i>
						</h2>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[
								preset.effect10,
								"w-full",
								"[&~span]:opacity-[unset] [&:focus~span]:bg-[#000] [&~span]:bg-[#e7a8a8]",
							]}
							placeholder={"effect10"}
						/>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect11, "w-full", "border-[#F00]"]}
							placeholder={"effect11"}
						/>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect12, "w-full"]}
							placeholder={"effect12"}
						/>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect13, "w-full"]}
							placeholder={"effect13"}
						/>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect14, "w-full"]}
							placeholder={"effect14"}
						/>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect15, "w-full"]}
							placeholder={"effect15"}
						/>
					</div>
					<div class={row}>
						<h2>
							<i>Input with Label Effects</i>
						</h2>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[
								preset.effect16,
								"w-full",
								"[&~label]:text-[red] [&:focus~label]:text-[red] [&:not(:placeholder-shown)~label]:text-[red]",
							]}
							placeholder={""}
						>
							<label>effect16</label>
						</TextArea>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect17, "w-full"]}
							placeholder={""}
						>
							<label>effect17</label>
						</TextArea>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect18, "w-full"]}
							placeholder={""}
						>
							<label>effect18</label>
						</TextArea>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect19, "w-full"]}
							placeholder={""}
						>
							<label>effect19</label>
						</TextArea>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[
								preset.effect20,
								"w-full",
								"[&~span]:before:bg-[red] [&~span]:after:bg-[red] [&~span_i]:before:bg-[red] [&~span_i]:after:bg-[red]",
							]}
							placeholder={""}
						>
							<label>effect20</label>
						</TextArea>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect21, "w-full"]}
							placeholder={""}
						>
							<label>effect21</label>
						</TextArea>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect22, "w-full"]}
							placeholder={""}
						>
							<label>effect22</label>
						</TextArea>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect23, "w-full"]}
							placeholder={""}
						>
							<label>effect23</label>
						</TextArea>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect24, "w-full"]}
							placeholder={""}
						>
							<label>effect24</label>
						</TextArea>

						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect19a, "w-full"]}
							placeholder={""}
						>
							<label>effect19a</label>
						</TextArea>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect20a, "w-full"]}
							placeholder={""}
						>
							<label>effect20a</label>
						</TextArea>
						<TextArea
							class="inline-block w-[27.33%] mt-[20px] mr-3"
							effect={[preset.effect21a, "w-full"]}
							placeholder={""}
						>
							<label>effect21a</label>
						</TextArea>
					</div>

					<h1>Paper</h1>
					<div>
						<div class="inline-block w-[27.33%] mt-[30px] mr-3 elevation-1">
							elevation=1
						</div>
						<div class="inline-block w-[27.33%] mt-[30px] mr-3 elevation-2">
							elevation=2
						</div>
						<div class="inline-block w-[27.33%] mt-[30px] mr-3 elevation-3">
							elevation=3
						</div>
						<div class="inline-block w-[27.33%] mt-[30px] mr-3 elevation-4">
							elevation=4
						</div>
						<div class="inline-block w-[27.33%] mt-[30px] mr-3 elevation-5">
							elevation=5
						</div>
						<div class="inline-block w-[27.33%] mt-[30px] mr-3 elevation-6">
							elevation=6
						</div>
						<div class="inline-block w-[27.33%] mt-[30px] mr-3 elevation-7">
							elevation=7
						</div>
						<div class="inline-block w-[27.33%] mt-[30px] mr-3 elevation-8">
							elevation=8
						</div>
						<div class="inline-block w-[27.33%] mt-[30px] mr-3 elevation-9">
							elevation=9
						</div>
						<div class="inline-block w-[27.33%] mt-[30px] mr-3 elevation-10">
							elevation=10
						</div>
						<div class="inline-block w-[27.33%] mt-[30px] mr-3 elevation-20">
							elevation=20
						</div>
						<div class="inline-block w-[27.33%] mt-[30px] mr-3 elevation-24">
							elevation=24
						</div>
					</div>

					<br />
					<br />
					<div class="block">
						<Button class={variant.outlined}>Outlined</Button>
						<Button class={variant.contained}>contained</Button>
						<Button class={variant.text}>text</Button>
						<Button class={variant.icon}>
							<svg
								focusable="false"
								viewBox="0 0 24 24"
								width="1.5rem"
								height="1.5rem"
							>
								<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
							</svg>
						</Button>
					</div>
					<h1>IconButton</h1>
					<div>
						<IconButton onClick={() => alert("clicked")}>
							<svg
								focusable="false"
								viewBox="0 0 24 24"
							>
								<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
							</svg>
						</IconButton>
						<IconButton disabled>
							<svg
								focusable="false"
								viewBox="0 0 24 24"
							>
								<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
							</svg>
						</IconButton>
						<IconButton class="[&_svg]:!fill-[#9C27B0]">
							<svg
								focusable="false"
								viewBox="0 0 24 24"
							>
								<path d="m22 5.72-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39 6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>
							</svg>
						</IconButton>
						<IconButton class="[&_svg]:!fill-[#1976D2]">
							<svg
								focusable="false"
								viewBox="0 0 24 24"
							>
								<path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"></path>
							</svg>
						</IconButton>
					</div>
					<h1>ToggleButton</h1>
					<div>
						<ToggleButton class="px-3 font-bold">Web</ToggleButton>
						<ToggleButton class="px-3 font-bold">Android</ToggleButton>
						<ToggleButton class="px-3 font-bold">IOS</ToggleButton>
					</div>
					<div>
						<ToggleButton class="h-7 w-7">
							<svg
								focusable="false"
								viewBox="0 0 24 24"
							>
								<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
							</svg>
						</ToggleButton>
						<ToggleButton class="h-7 w-7">
							<svg
								focusable="false"
								viewBox="0 0 24 24"
							>
								<path d="m22 5.72-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39 6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8zM12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>
							</svg>
						</ToggleButton>
						<ToggleButton class="h-7 w-7">
							<svg
								focusable="false"
								viewBox="0 0 24 24"
							>
								<path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"></path>
							</svg>
						</ToggleButton>
					</div>
					<div id="app-cover">
						<Switch
							class={[buttonr, spreset.effect2]}
							checked={useEnumSwitch(aa, A.a, A.b)}
						/>

						<div class="table-row">
							<div class="table-cell relative w-[200px] h-[50px] box-border">
								<Switch title='effect1'
									class={[buttonr, spreset.effect1,
										`
                 [&>div]:before:content-['OK']
[&>div]:after:bg-[#82ec90]
[&>input:checked+div]:before:bg-[#46f436]
[&>input:checked~div]:bg-[#f9fceb]
[&>input:checked+div]:before:content-['KO']
`,
									]}
									checked={$(false)}
								/>
							</div>
							<div class="table-cell relative w-[200px] h-[50px] box-border">
								<Switch title='effect2'
									class={[buttonr, spreset.effect2]}
									checked={$(false)}
								/>
							</div>
							<div class="table-cell relative w-[200px] h-[50px] box-border">
								<Switch title='effect3'
									class={[buttonr, spreset.effect3]}
									checked={$(false)}
								/>
							</div>
						</div>
						<div class="table-row">
							<div class="table-cell relative w-[200px] h-[50px] box-border">
								<Switch
									class={[buttonr, spreset.effect4]}
									checked={$(false)}
								/>
							</div>
							<div class="table-cell relative w-[200px] h-[50px] box-border">
								<Switch
									class={[buttonr, spreset.effect5]}
									checked={$(false)}
								/>
							</div>
							<div class="table-cell relative w-[200px] h-[50px] box-border">
								<Switch
									class={[buttonr, spreset.effect6]}
									checked={$(false)}
								/>
							</div>
						</div>
						<div class="table-row">
							<div class="table-cell relative w-[200px] h-[50px] box-border">
								<Switch
									class={[buttonr, spreset.effect7]}
									checked={$(false)}
								/>
							</div>
							<div class="table-cell relative w-[200px] h-[50px] box-border">
								<Switch
									class={[buttonr, spreset.effect8]}
									checked={$(false)}
								/>
							</div>
							<div class="table-cell relative w-[200px] h-[50px] box-border">
								<Switch
									class={[buttonr, spreset.effect9]}
									checked={$(false)}
								/>
							</div>
						</div>
						<div class="table-row">
							<div class="table-cell relative w-[200px] h-[50px] box-border">
								<Switch
									class={[button_, buttonb2, spreset.effect10]}
									checked={$(false)}
								/>
							</div>
							<div class="table-cell relative w-[200px] h-[50px] box-border">
								<Switch
									class={[button_, buttonb2, spreset.effect11]}
									checked={$(false)}
								/>
							</div>
							<div class="table-cell relative w-[200px] h-[50px] box-border">
								<Switch
									class={[button_, buttonb2, spreset.effect12]}
									checked={$(false)}
								/>
							</div>
						</div>
						<div class="table-row">
							<div class="table-cell relative w-[200px] h-[50px] box-border">
								<Switch
									class={[button_, buttonb2, spreset.effect13]}
									checked={$(false)}
								/>
							</div>
							<div class="table-cell relative w-[200px] h-[50px] box-border">
								<Switch
									class={[button_, buttonb2, spreset.effect14]}
									checked={$(false)}
								/>
							</div>
							<div class="table-cell relative w-[200px] h-[50px] box-border">
								<Switch
									class={[button_, buttonb2, spreset.effect15]}
									checked={$(false)}
								/>
							</div>
						</div>
						<div class="table-row">
							<div class="table-cell relative w-[200px] h-[50px] box-border">
								<Switch
									class={[button_, buttonb2, spreset.effect16]}
									checked={$(false)}
								/>
							</div>
							<div class="table-cell relative w-[200px] h-[50px] box-border">
								<Switch
									class={[button_, buttonb2, spreset.effect17]}
									checked={$(false)}
								/>
							</div>
							<div class="table-cell relative w-[200px] h-[50px] box-border">
								<Switch
									class={[button_, buttonb2, spreset.effect18]}
									checked={$(false)}
								/>
							</div>
						</div>
					</div>

					<div class="table-row">
						<h4>Light</h4>
						<Switch
							class={[spreset.light, "inline-block"]}
							on="Y"
							off="N"
						/>
						<Switch class={[spreset.light, "inline-block"]} />
						<Switch
							class={[spreset.light, "inline-block"]}
							on=""
							off=""
						/>
						<h4>iOS</h4>
						<Switch
							class={[spreset.ios, "inline-block"]}
							on="Y"
							off="N"
						/>
						<Switch class={[spreset.ios, "inline-block"]} />
						<Switch
							class={[spreset.ios, "inline-block"]}
							on=""
							off=""
						/>
						<Switch
							class={[spreset.ios, "inline-block"]}
							on="☑"
							off="☒"
						/>

						<h4>Skewed</h4>
						<Switch
							class={[spreset.skewed, "inline-block"]}
							on="ON"
							off="OFF"
						/>
						<Switch
							class={[spreset.skewed, "inline-block"]}
							on="☑"
							off="☒"
						/>

						<h4>Flat</h4>
						<Switch
							class={[spreset.flat, "inline-block"]}
							on="ON"
							off="OFF"
						/>
						<Switch
							class={[spreset.flat, "inline-block"]}
							on="☑"
							off="☒"
						/>
						<Switch
							class={[spreset.flat, "inline-block"]}
							on=""
							off=""
						/>

						<h4>Flip</h4>
						<Switch
							class={[spreset.flip, "inline-block"]}
							on="Yeah!"
							off="Nope"
						/>
						<Switch
							class={[spreset.flip, "inline-block"]}
							on="☑"
							off="☒"
						/>
					</div>
				</div>
				<Zoomable class='relative  border border-black w-[90%] h-[500px] overflow-hidden touch-none mx-auto'>
					<Img src="https://picsum.photos/2560/1440?random" />
				</Zoomable>
			</div>
		</div>
	</>
)

render(<App />, document.getElementById("app"))

/// <reference types="vite/client" />

import { DEBUGGER, $, $$ } from 'woby'
import { Button } from './Button'
import { Badge } from './Badge'
import { Avatar } from './Avatar'
import { AlignButton } from './Editor/AlignButton'
import { EditorContext, UndoRedo } from './Editor/undoredo'
import { Card, CardMedia, CardContent, CardActions } from './Card'
import { Checkbox } from './Checkbox'
import { Chip } from './Chip'
import { Collapse } from './Collapse'

const isDev = typeof import.meta.env !== 'undefined' && import.meta.env.DEV

if (isDev) {
    DEBUGGER.test = true
}

export function App() {
    const editorRef = $(null as HTMLDivElement | null)
    const toggleIsOpen = $(true)
    const toggleBackground = $(true)

    return (
        <div class="p-8">
            <h1 class="text-3xl font-bold mb-6">@woby/wui Component Library</h1>

            <p class="mb-4">
                Real page - Click <a href="/test" class="text-blue-600 hover:underline font-semibold">here</a> to load the test runner
            </p>

            {/* Table of Contents Navigation */}
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8 shadow-sm">
                <h2 class="text-xl font-bold mb-4 text-gray-800">📑 Quick Navigation</h2>
                <div class="flex flex-wrap gap-2">
                    <a href="#appbar" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        AppBar
                    </a>
                    <a href="#avatar" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Avatar
                    </a>
                    <a href="#badge" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Badge
                    </a>
                    <a href="#button" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Button
                    </a>
                    <a href="#alignbutton" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        AlignButton
                    </a>
                    <a href="#card" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Card
                    </a>
                    <a href="#checkbox" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Checkbox
                    </a>
                    <a href="#chip" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Chip
                    </a>
                    <a href="#collapse" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Collapse
                    </a>
                    <a href="/test.html" target="_blank" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Test Runner
                    </a>
                    <a href="/html-demo.html" target="_blank" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        HTML Components Demo
                    </a>
                </div>
            </div>

            <div class="space-y-4">
                {/* Region: Appbar Examples */}
                <h2 id="appbar" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Appbar Examples</h2>
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {/* Default Appbar */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-sm font-semibold mb-2">Default (TSX)</h3>
                            <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarDefaultTsxDemo.html"></iframe>
                        </div>

                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-sm font-semibold mb-2">Default (HTML)</h3>
                            <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarDefaultHtmlDemo.html"></iframe>
                        </div>

                        {/* Fixed Appbar */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-sm font-semibold mb-2">Fixed (TSX)</h3>
                            <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarFixedTsxDemo.html"></iframe>
                        </div>

                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-sm font-semibold mb-2">Fixed (HTML)</h3>
                            <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarFixedHtmlDemo.html"></iframe>
                        </div>

                        {/* Sticky Appbar */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-sm font-semibold mb-2">Sticky (TSX)</h3>
                            <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarStickyTsxDemo.html"></iframe>
                        </div>

                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-sm font-semibold mb-2">Sticky (HTML)</h3>
                            <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarStickyHtmlDemo.html"></iframe>
                        </div>

                        {/* Static Appbar */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-sm font-semibold mb-2">Static (TSX)</h3>
                            <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarStaticTsxDemo.html"></iframe>
                        </div>

                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-sm font-semibold mb-2">Static (HTML)</h3>
                            <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarStaticHtmlDemo.html"></iframe>
                        </div>

                        {/* Custom Appbar */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-sm font-semibold mb-2">Custom (TSX)</h3>
                            <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarCustomTsxDemo.html"></iframe>
                        </div>

                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-sm font-semibold mb-2">Custom (HTML)</h3>
                            <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarCustomHtmlDemo.html"></iframe>
                        </div>
                    </div>
                </div>

                {/* Region: Avatar Examples */}
                <h2 id="avatar" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Avatar Examples</h2>
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="border border-gray-300 rounded-lg p-4 flex items-center justify-center min-h-[120px]">
                            <Avatar />
                        </div>
                        <div class="border border-gray-300 rounded-lg p-4 flex items-center justify-center min-h-[120px]">
                            <Avatar src="/sample-avatar.png" alt="Sample avatar" />
                        </div>
                        <div class="border border-gray-300 rounded-lg p-4 flex items-center justify-center min-h-[120px]">
                            <Avatar cls="w-16 h-16 ring-2 ring-blue-500" src="/sample-avatar.png" />
                        </div>
                        <div class="border border-gray-300 rounded-lg p-4 flex items-center justify-center min-h-[120px]">
                            <Avatar cls="w-12 h-12 bg-purple-500">JL</Avatar>
                        </div>
                    </div>
                </div>

                {/* Region: Badge Examples */}
                <h2 id="badge" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Badge Examples</h2>
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div class="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
                            <Badge>
                                <div class="w-10 h-10 bg-gray-400 rounded-full"></div>
                            </Badge>
                        </div>
                        <div class="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
                            <Badge badgeContent="5" vertical="top" horizontal="right">
                                <div class="w-10 h-10 bg-blue-500 rounded-full"></div>
                            </Badge>
                        </div>
                        <div class="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
                            <Badge badgeContent="!" vertical="bottom" horizontal="left" badgeClass="bg-red-600">
                                <div class="w-10 h-10 bg-gray-400 rounded-full"></div>
                            </Badge>
                        </div>
                        <div class="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
                            <Badge badgeContent="✓" badgeClass="bg-green-600" vertical="top" horizontal="left">
                                <div class="w-10 h-10 bg-gray-400 rounded-full"></div>
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Region: Button Examples */}
                <h2 id="button" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Button Examples</h2>
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div class="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
                            <Button buttonType="text">Text Button</Button>
                        </div>
                        <div class="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
                            <Button buttonType="contained">Contained Button</Button>
                        </div>
                        <div class="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
                            <Button buttonType="outlined">Outlined Button</Button>
                        </div>
                        <div class="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
                            <Button buttonType="icon">🔔</Button>
                        </div>
                        <div class="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
                            <Button buttonType="contained" onClick={() => alert('Button clicked!')}>Click Me </Button>
                        </div>
                        <div class="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
                            <Button buttonType="outlined" disabled>Disabled</Button>
                        </div>
                        <div class="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
                            <Button buttonType="contained" cls="m-2 p-2 !rounded-[5px] !text-red-500 !bg-green-200" onClick={() => alert('Button clicked!')}>Custom Style</Button>
                        </div>
                    </div>
                </div>

                {/* Region: AlignButton Demo */}
                <h2 id="alignbutton" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">AlignButton Demo</h2>
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <EditorContext.Provider value={editorRef}>
                        <UndoRedo>
                            <div class="mb-4">
                                <div class="flex gap-4 items-center my-2">
                                    <div class="border rounded-[4px] m-2 p-4"><AlignButton contentAlign="start" /></div>
                                    <div class="border rounded-[4px] m-2 p-4"><AlignButton contentAlign="center" /></div>
                                    <div class="border rounded-[4px] m-2 p-4"><AlignButton contentAlign="end" /></div>
                                </div>
                                <div ref={editorRef} contentEditable class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <p>Select this text and try the alignment buttons below!</p>
                                    <p>You can align start, center, or end.</p>
                                </div>

                            </div>
                        </UndoRedo>
                    </EditorContext.Provider>
                </div>

                {/* Region: Card Demo */}
                <h2 id="card" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Card Demo</h2>
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Variant Card Example */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Variant Card Example</h3>
                            <Card cls="max-w-sm m-2" variant="elevated" elevation={2} interactive={true}>
                                <CardContent>
                                    <h3 class="text-lg font-semibold">VariantCardExample</h3>
                                    <p class="text-sm text-gray-600">elevation=2, interactive hover shadow</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Other Card Examples */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Outlined Card Example</h3>
                            <Card cls="max-w-sm m-2" variant="outlined" elevation={0}>
                                <CardContent>
                                    <h3 class="text-lg font-semibold">Outlined Card</h3>
                                    <p class="text-sm text-gray-600">Border only, no elevation</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filled Card Example */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Filled Card Example</h3>
                            <Card cls="max-w-sm m-2" variant="filled" elevation={0} interactive>
                                <CardContent>
                                    <h3 class="text-lg font-semibold">Filled Card</h3>
                                    <p class="text-sm text-gray-600">Subtle filled bg + strong shadow</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Actions Aligned Card Example */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Actions Aligned Card Example</h3>
                            <Card cls="max-w-md m-2">
                                <CardContent padding="p-6">
                                    <h3 class="text-lg font-semibold">Actions Alignment</h3>
                                    <p class="text-sm text-gray-600">Try different horizontal justifications</p>
                                </CardContent>

                                <CardActions align="start" padding="px-4 py-2">
                                    <span class="text-xs uppercase text-gray-500">Start</span>
                                </CardActions>

                                <CardActions align="center" padding="px-4 py-2">
                                    <span class="text-xs uppercase text-gray-500">Center</span>
                                </CardActions>

                                <CardActions align="between" padding="px-4 py-2">
                                    <span class="text-xs uppercase text-gray-500">Between (left)</span>
                                    <span class="text-xs uppercase text-gray-500">Between (right)</span>
                                </CardActions>

                                <CardActions align="end" padding="px-4 py-2">
                                    <span class="text-xs uppercase text-gray-500">End</span>
                                </CardActions>
                            </Card>
                        </div>

                        {/* Content Padding Card Example */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Content Padding Card Example</h3>
                            <Card cls="max-w-sm m-2" elevation={1} interactive>
                                <CardContent padding="p-6">
                                    <h3 class="text-lg font-semibold">Custom Padding</h3>
                                    <p class="text-sm text-gray-600">Using CardContent padding="p-6"</p>
                                    <p class="text-xs text-gray-500 mt-2">Hover to see subtle elevation change.</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Media Banner Card Example */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Media Banner Card Example</h3>
                            <Card cls="max-w-md m-2" elevation={2}>
                                <CardMedia src="contemplative-reptile.jpg" alt="Banner image" height="160px" position="center center" fit="cover" cls="w-full" />
                                <CardContent>
                                    <h3 class="text-lg font-semibold">Banner Card</h3>
                                    <p class="text-sm text-gray-600">Media header with content below.</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Media Centered Card Example */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Media Centered Card Example</h3>
                            <Card cls="max-w-sm m-2">
                                <CardMedia src="/sample-avatar.png" alt="Avatar" cls="w-24 h-24 rounded-full mx-auto bg-center bg-cover mt-4" position="center center" fit="cover" />
                                <CardContent cls="px-5 pb-4">
                                    <h3 class="text-lg font-semibold text-center">Taylor</h3>
                                    <p class="text-sm text-gray-600 mt-1 text-justify">Front-end engineer focused on fast, accessible components and delightful UX.</p>
                                </CardContent>
                                <CardActions align="center" padding="p-3">
                                    <Button cls="px-4 py-2 !rounded-[4px]" onClick={() => alert("Hi Taylor!")}> Say Hi </Button>
                                </CardActions>
                            </Card>
                        </div>

                        {/* Name Card Example */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Name Card Example</h3>
                            <Card cls="max-w-sm m-2">
                                <CardMedia src="/sample-avatar.png" alt="Sample avatar" cls="w-24 h-24 rounded-full mx-auto bg-center bg-cover mt-4" position="center center" fit="cover" />
                                <CardContent cls="px-5 pb-4">
                                    <h3 class="text-lg font-semibold text-center">Alex</h3>
                                    <p class="text-sm text-gray-600 mt-1 text-justify">Product-minded developer who enjoys building cohesive UI systems and great DX.</p>
                                </CardContent>
                                <CardActions align="center" padding="p-3">
                                    <Button buttonType="contained" cls="px-4 py-2 !rounded-[4px]" onClick={() => alert("Hello Alex!")}>Connect</Button>
                                </CardActions>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Region: Checkbox Demo */}
                <h2 id="checkbox" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Checkbox Demo</h2>
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Default Checkbox */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Default Checkbox</h3>
                            <Checkbox id="default-checkbox">Default Checkbox</Checkbox>
                        </div>

                        {/* Left Label Checkbox */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Left Label Checkbox</h3>
                            <Checkbox id="left-label-checkbox" labelPosition="left">Left Label</Checkbox>
                        </div>

                        {/* Right Label Checkbox */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Right Label Checkbox</h3>
                            <Checkbox id="right-label-checkbox" labelPosition="right">Right Label</Checkbox>
                        </div>

                        {/* Top Label Checkbox */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Top Label Checkbox</h3>
                            <Checkbox id="top-label-checkbox" labelPosition="top">Top Label</Checkbox>
                        </div>

                        {/* Bottom Label Checkbox */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Bottom Label Checkbox</h3>
                            <Checkbox id="bottom-label-checkbox" labelPosition="bottom">Bottom Label</Checkbox>
                        </div>

                        {/* Checked Checkbox */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Checked Checkbox</h3>
                            <Checkbox id="checked-checkbox" checked>Checked by default</Checkbox>
                        </div>

                        {/* Disabled Checkbox */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Disabled Checkbox</h3>
                            <Checkbox id="disabled-checkbox" disabled>Disabled Checkbox</Checkbox>
                        </div>

                        {/* Disabled & Checked Checkbox */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Disabled & Checked Checkbox</h3>
                            <Checkbox id="disabled-checked-checkbox" checked disabled>Disabled & Checked</Checkbox>
                        </div>

                        {/* Custom Class Checkbox */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Custom Class Checkbox</h3>
                            <Checkbox id="custom-class-checkbox" labelPosition="right" cls="!text-blue-500 !font-bold" onChange={(e) => {
                                const span = document.getElementById('custom-class-checkbox-log')
                                if (span) span.textContent = `Checkbox changed: ${e.currentTarget.checked}`
                            }}>
                                Custom styled checkbox
                            </Checkbox>
                            <pre class="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                                <span id="custom-class-checkbox-log"></span>
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Region: Chip Demo */}
                <h2 id="chip" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Chip Demo</h2>
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                        {/* Default Chip */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Default Chip</h3>
                            <Chip>Default Chip</Chip>
                        </div>
                        {/* Custom Chip */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Custom Chip</h3>
                            <div class="flex gap-2 items-center">
                                <Chip cls="!bg-green-100 !text-green-800">Success</Chip>
                                <Chip cls="!bg-red-100 !text-red-800">Error</Chip>
                                <Chip cls="!bg-yellow-100 !text-yellow-800">Warning</Chip>
                                <Chip cls="!bg-blue-100 !text-blue-800">Info</Chip>
                            </div>
                        </div>
                        {/* Deletable Chip */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Deletable Chip</h3>
                            <div class="flex gap-2 items-center">
                                <Chip cls="!bg-green-100 !text-green-800" deletable>Success</Chip>
                                <Chip cls="!bg-red-100 !text-red-800" deletable>Error</Chip>
                                <Chip cls="!bg-yellow-100 !text-yellow-800" deletable>Warning</Chip>
                                <Chip cls="!bg-blue-100 !text-blue-800" deletable>Info</Chip>
                            </div>
                        </div>

                        {/* Visible Chip */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            {/* <h3 class="text-lg font-semibold mb-2">Visible Chip</h3> */}
                            <div class="flex gap-2">
                                <div class="border border-black-500 rounded-[4px] p-3">
                                    <h3 class="text-lg font-semibold mb-2">Visible Chip - true</h3>
                                    <Chip visible={true}>Visible</Chip>
                                </div>
                                <div class="border border-black-500 rounded-[4px] p-3">
                                    <h3 class="text-lg font-semibold mb-2">Visible Chip - false</h3>
                                    <Chip visible={false}>Non Visible</Chip>
                                </div>
                            </div>
                        </div>

                        {/* Avatar Chip */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Avatar Chip</h3>
                            <div class="flex gap-2 items-center">
                                <Chip cls="h-auto w-auto mx-2 bg-purple-500 text-white font-bold">
                                    <Avatar src="/sample-avatar.png" alt="Sample avatar" /> <span class="ml-2">Sample Avatar</span>
                                </Chip>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Region: Collapse Demo */}
                <h2 id="collapse" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Collapse Demo</h2>
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {/* Default Collapse */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Default Collapse</h3>
                            <Collapse class="rounded-[4px] border border-gray-300">
                                <div class="p-4 bg-gray-100">
                                    <p>This is the content inside the collapse component.</p>
                                    <p>It should be visible by default.</p>
                                </div>
                            </Collapse>
                        </div>

                        {/* Custom Collapse */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Custom Collapse</h3>
                            <Collapse class="rounded-[4px] border-2 border-purple-300 ">
                                <div class="p-4 bg-yellow-100">
                                    <p>This is the content inside the collapse component.</p>
                                    <p>It should be visible by default.</p>
                                </div>
                            </Collapse>
                        </div>

                        {/* Toggle Collapse */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Toggle Collapse</h3>
                            <div class="space-y-4">
                                <Button buttonType="contained" onClick={() => toggleIsOpen(!$$(toggleIsOpen))} class="text-xm text-white-500 px-4 py-2 bg-blue-500 border border-blue-300 rounded-[4px]">
                                    Toggle Collapse ({() => $$(toggleIsOpen) ? 'Open' : 'Closed'})
                                </Button>
                                <Collapse class="rounded-[4px] border border-green-300" open={toggleIsOpen}>
                                    <div class="p-4 bg-green-100">
                                        <p>This collapse can be toggled open/closed.</p>
                                        <p>Click the button above to toggle visibility.</p>
                                    </div>
                                </Collapse>
                            </div>
                        </div>

                        {/* Toggle Background Collapse */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Toggle Background Collapse</h3>
                            <div class="space-y-4">
                                <Button buttonType="contained" onClick={() => toggleBackground(!$$(toggleBackground))} class="text-xm text-white-500 px-4 py-2 bg-blue-500 border border-blue-300 rounded-[4px]">
                                    Toggle Background ({() => $$(toggleBackground) ? 'Open' : 'Closed'})
                                </Button>
                                <Collapse class="rounded-[4px] border border-gray-100" background={toggleBackground}>
                                    <div class="p-4 border border-gray-300 rounded-[4px]">
                                        <p>This collapse can be toggled open/closed. The background visibility changes with the toggle state.</p>
                                        <p>Click the "Toggle Background" button above to switch between states.</p>
                                    </div>
                                </Collapse>
                            </div>
                        </div>

                        {/* Open Collapse */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Open Collapse</h3>
                            <Collapse class="rounded-[4px] border border-blue-300" open>
                                <div class="p-4 bg-blue-100">
                                    <p>This collapse is explicitly set to open.</p>
                                    <p>The content should be visible.</p>
                                </div>
                            </Collapse>
                        </div>

                        {/* Close Collapse */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Close Collapse</h3>
                            <Collapse class="rounded-[4px] border border-red-300" open={false}>
                                <div class="p-4 bg-red-100">
                                    <p>This collapse is explicitly set to closed.</p>
                                    <p>The content should be hidden.</p>
                                </div>
                            </Collapse>
                        </div>

                        {/* Background: True Collapse */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Background Collapse</h3>
                            <Collapse class="rounded-[4px] border border-gray-100" background={true}>
                                <div class="p-4">
                                    <p>This collapse has a background (default behavior).</p>
                                    <p>You should see a gray background.</p>
                                </div>
                            </Collapse>
                        </div>

                        {/* Background: False Collapse */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-2">Background Collapse</h3>
                            <Collapse class="rounded-[4px] border border-gray-100" background={false}>
                                <div class="p-4">
                                    <p>This collapse has no background.</p>
                                    <p>There should be no gray background.</p>
                                </div>
                            </Collapse>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-8 p-4 bg-gray-100 rounded">
                <p class="text-sm text-gray-600">
                    💡 This is the main application view. The test runner at <code class="bg-gray-200 px-1 rounded">/test</code> will show snapshot tests for all components.
                </p>
            </div>
        </div>
    )
}

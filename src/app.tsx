/// <reference types="vite/client" />

import { DEBUGGER, $, $$, useMemo, Observable, ObservableMaybe } from 'woby'
import { Button } from './Button'
import { Badge } from './Badge'
import { Avatar } from './Avatar'
import { AlignButton } from './Editor/AlignButton'
import { EditorContext, UndoRedo } from './Editor/undoredo'
import { Card, CardMedia, CardContent, CardActions } from './Card'
import { Checkbox } from './Checkbox'
import { Chip } from './Chip'
import { Collapse } from './Collapse'
import { IconButton } from './IconButton'
import { useArrayOptions } from './Wheeler/WheelerType'
import Wheeler from './Wheeler/Wheeler'
import MultiWheeler from './Wheeler/MultiWheeler'
import DateTimeWheeler, { DateTimeWheelerType } from './Wheeler/DateTimeWheeler'


const isDev = typeof import.meta.env !== 'undefined' && import.meta.env.DEV

if (isDev) {
    DEBUGGER.test = true
}

export function App() {
    const editorRef = $(null as HTMLDivElement | null)


    // #region Table Of Contents
    const tableOfContents = () => {
        return <>
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
                    <a href="#icon-button" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Icon Button
                    </a>
                    <a href="#wheeler" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Wheeler
                    </a>
                    <a href="#multi-wheeler" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Multi Wheeler
                    </a>
                    <a href="#datetime-wheeler" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        DateTime Wheeler
                    </a>
                    <a href="/html-demo.html" target="_blank" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        HTML Components Demo
                    </a>
                </div>
            </div>
        </>
    }
    // #endregion


    // #region AppBar Demo
    const appbarDemo = () => {
        return <>
            <h2 id="appbar" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Appbar Examples</h2>
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
                    {/* Default Appbar */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="text-sm font-semibold mb-2">Default (TSX)</h3>
                        <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarDefaultTsxDemo.html"></iframe>
                    </div>

                    {/* <div class="border border-gray-300 rounded-lg p-4">
                    <h3 class="text-sm font-semibold mb-2">Default (HTML)</h3>
                    <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarDefaultHtmlDemo.html"></iframe>
                </div> */}

                    {/* Fixed Appbar */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="text-sm font-semibold mb-2">Fixed (TSX)</h3>
                        <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarFixedTsxDemo.html"></iframe>
                    </div>

                    {/* <div class="border border-gray-300 rounded-lg p-4">
                    <h3 class="text-sm font-semibold mb-2">Fixed (HTML)</h3>
                    <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarFixedHtmlDemo.html"></iframe>
                </div> */}

                    {/* Sticky Appbar */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="text-sm font-semibold mb-2">Sticky (TSX)</h3>
                        <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarStickyTsxDemo.html"></iframe>
                    </div>

                    {/* <div class="border border-gray-300 rounded-lg p-4">
                    <h3 class="text-sm font-semibold mb-2">Sticky (HTML)</h3>
                    <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarStickyHtmlDemo.html"></iframe>
                </div> */}

                    {/* Static Appbar */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="text-sm font-semibold mb-2">Static (TSX)</h3>
                        <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarStaticTsxDemo.html"></iframe>
                    </div>

                    {/* <div class="border border-gray-300 rounded-lg p-4">
                    <h3 class="text-sm font-semibold mb-2">Static (HTML)</h3>
                    <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarStaticHtmlDemo.html"></iframe>
                </div> */}

                    {/* Custom Appbar */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="text-sm font-semibold mb-2">Custom (TSX)</h3>
                        <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarCustomTsxDemo.html"></iframe>
                    </div>

                    {/* <div class="border border-gray-300 rounded-lg p-4">
                    <h3 class="text-sm font-semibold mb-2">Custom (HTML)</h3>
                    <iframe class="w-full h-[300px] border rounded-lg shadow-sm" src="/AppBarDemo/AppBarCustomHtmlDemo.html"></iframe>
                </div> */}
                </div>
            </div>
        </>

    }
    // #endregion


    // #region Avatar Demo
    const avatarDemo = () => {
        return <>
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
        </>

    }
    // #endregion


    // #region Badge Demo
    const badgeDemo = () => {
        return <>
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
        </>

    }
    // #endregion


    // #region Button Demo
    const buttonDemo = () => {
        return <>
            <h2 id="button" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Button Examples</h2>
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div class="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
                        <Button type="text">Text Button</Button>
                    </div>
                    <div class="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
                        <Button type="contained">Contained Button</Button>
                    </div>
                    <div class="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
                        <Button type="outlined">Outlined Button</Button>
                    </div>
                    <div class="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
                        <Button type="icon">🔔</Button>
                    </div>
                    <div class="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
                        <Button type="contained" onClick={() => alert('Button clicked!')}>Click Me </Button>
                    </div>
                    <div class="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
                        <Button type="outlined" disabled>Disabled</Button>
                    </div>
                    <div class="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[120px]">
                        <Button type="contained" cls="m-2 p-2 !rounded-[5px] !text-red-500 !bg-green-200" onClick={() => alert('Button clicked!')}>Custom Style</Button>
                    </div>
                </div>
            </div>
        </>
    }
    // #endregion


    // #region AlignButton Demo
    const alignButtonDemo = () => {
        return <>
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
        </>
    }
    // #endregion


    // #region Card Demo
    const cardDemo = () => {
        return <>
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
                                <Button type="contained" cls="px-4 py-2 !rounded-[4px]" onClick={() => alert("Hello Alex!")}>Connect</Button>
                            </CardActions>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    }
    // #endregion


    // #region Checkbox Demo
    const checkboxDemo = () => {
        return <>
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
        </>
    }
    // #endregion


    // #region Chip Demo
    const chipDemo = () => {
        return <>
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
        </>
    }
    // #endregion


    // #region Collapse Demo
    const collapseDemo = () => {
        const toggleIsOpen = $(true)
        const toggleBackground = $(true)

        return <>
            <h2 id="collapse" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Collapse Demo</h2>
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {/* Default Collapse */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="text-lg font-semibold mb-2">Default Collapse</h3>
                        <Collapse cls="rounded-[4px] border border-gray-300">
                            <div class="p-4 bg-gray-100">
                                <p>This is the content inside the collapse component.</p>
                                <p>It should be visible by default.</p>
                            </div>
                        </Collapse>
                    </div>

                    {/* Custom Collapse */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="text-lg font-semibold mb-2">Custom Collapse</h3>
                        <Collapse cls="rounded-[4px] border-2 border-purple-300 ">
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
                            <Button type="contained" onClick={() => toggleIsOpen(!$$(toggleIsOpen))} cls="text-xm text-white-500 px-4 py-2 bg-blue-500 border border-blue-300 rounded-[4px]">
                                Toggle Collapse ({() => $$(toggleIsOpen) ? 'Open' : 'Closed'})
                            </Button>
                            <Collapse cls="rounded-[4px] border border-green-300" open={toggleIsOpen}>
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
                            <Button type="contained" onClick={() => toggleBackground(!$$(toggleBackground))} cls="text-xm text-white-500 px-4 py-2 bg-blue-500 border border-blue-300 rounded-[4px]">
                                Toggle Background ({() => $$(toggleBackground) ? 'Open' : 'Closed'})
                            </Button>
                            <Collapse cls="rounded-[4px] border border-gray-100" background={toggleBackground}>
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
                        <Collapse cls="rounded-[4px] border border-blue-300" open>
                            <div class="p-4 bg-blue-100">
                                <p>This collapse is explicitly set to open.</p>
                                <p>The content should be visible.</p>
                            </div>
                        </Collapse>
                    </div>

                    {/* Close Collapse */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="text-lg font-semibold mb-2">Close Collapse</h3>
                        <Collapse cls="rounded-[4px] border border-red-300" open={false}>
                            <div class="p-4 bg-red-100">
                                <p>This collapse is explicitly set to closed.</p>
                                <p>The content should be hidden.</p>
                            </div>
                        </Collapse>
                    </div>

                    {/* Background: True Collapse */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="text-lg font-semibold mb-2">Background Collapse</h3>
                        <Collapse cls="rounded-[4px] border border-gray-100" background={true}>
                            <div class="p-4">
                                <p>This collapse has a background (default behavior).</p>
                                <p>You should see a gray background.</p>
                            </div>
                        </Collapse>
                    </div>

                    {/* Background: False Collapse */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="text-lg font-semibold mb-2">Background Collapse</h3>
                        <Collapse cls="rounded-[4px] border border-gray-100" background={false}>
                            <div class="p-4">
                                <p>This collapse has no background.</p>
                                <p>There should be no gray background.</p>
                            </div>
                        </Collapse>
                    </div>
                </div>
            </div>
        </>
    }
    // #endregion


    // #region Icon Button Demo
    const iconButtonDemo = () => {
        return <>
            <h2 id="icon-button" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Icon Button Demo</h2>
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="text-lg font-semibold mb-2">Default Icon Button - svg</h3>
                        <IconButton>
                            <svg focusable="false" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path>
                            </svg>
                        </IconButton>
                    </div>

                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="text-lg font-semibold mb-2">Default Icon Button - img </h3>
                        <IconButton>
                            <img src="/svg/info-icon.svg" alt="Information Icon" width="24" height="24"></img>
                        </IconButton>
                    </div>

                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="text-lg font-semibold mb-2">Disable Icon Button - svg </h3>
                        <IconButton disabled>
                            <svg focusable="false" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path>
                            </svg>
                        </IconButton>
                    </div>

                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="text-lg font-semibold mb-2">Disable Icon Button - img </h3>
                        <IconButton disabled>
                            <img src="/svg/info-icon.svg" alt="Information Icon" width="24" height="24"></img>
                        </IconButton>
                    </div>

                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="text-lg font-semibold mb-2">OnClick Icon Button - svg </h3>
                        <IconButton onClick={() => alert('SVG Button Clicked!')}>
                            <svg focusable="false" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path>
                            </svg>
                        </IconButton>
                    </div>

                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="text-lg font-semibold mb-2">OnClick Icon Button - img </h3>
                        <IconButton onClick={() => alert('Image Button Clicked!')}>
                            <img src="/svg/info-icon.svg" alt="Information Icon" width="24" height="24"></img>
                        </IconButton>
                    </div>
                </div>
            </div>
        </>
    }
    // #endregion


    // #region Wheeler Demo
    const wheelerDemo = () => {
        // --- Reusable Data ---
        const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew']
        const FLAVORS = ['Chocolate', 'Vanilla', 'Strawberry', 'Mint', 'Caramel', 'Coffee']
        const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

        // --- Data simulating a JSON import ---
        const JSON_CAR_DATA = [
            { "label": "Toyota", "value": "TOYOTA" },
            { "label": "Honda", "value": "HONDA" },
            { "label": "Ford", "value": "FORD" },
            { "label": "Tesla", "value": "TESLA" },
            { "label": "Subaru", "value": "SUBARU" },
        ];

        // State for different examples
        const selectedCarId = $('FORD');
        const selectedFruit = $('Cherry');
        const selectedNumber = $(5);
        const selectedFlavor = $('Vanilla');
        const selectedMultipleFruits = $(['Apple', 'Cherry']);
        const selectedFruitWithHeader = $('Date');
        const selectedFruitWithSearch = $('Elderberry');

        const displayValue = useMemo(() => {
            return formatOptionDisplay($$(selectedCarId), JSON_CAR_DATA);
        });

        function formatOptionDisplay(value: string | number, options: { label: string, value: any }[]) {
            // Ensure options is an array before searching
            if (!Array.isArray(options)) return String(value);

            const option = options.find(opt => opt.value === value);
            return option ? `${option.label} (${option.value})` : String(value);
        }

        return <>
            <h2 id="wheeler" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Wheeler Demo</h2>
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Basic String Array */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="font-bold mb-2">Basic String Array</h3>
                        <p class="text-sm text-gray-600 mb-2">
                            Simple string array with default settings
                        </p>
                        <Wheeler
                            options={FRUITS}
                            value={selectedFruit}
                            bottom={false}
                            cls="border rounded-md shadow-sm w-full"
                        />
                        <p class="mt-4 text-sm">
                            Selected: <span class="font-mono bg-gray-100 p-1 rounded">{selectedFruit}</span>
                        </p>
                    </div>

                    {/* Number Array */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="font-bold mb-2">Number Array</h3>
                        <p class="text-sm text-gray-600 mb-2">
                            Wheeler with numeric values
                        </p>
                        <Wheeler
                            options={NUMBERS}
                            value={selectedNumber}
                            bottom={false}
                            cls="border rounded-md shadow-sm w-full"
                        />
                        <p class="mt-4 text-sm">
                            Selected: <span class="font-mono bg-gray-100 p-1 rounded">{selectedNumber}</span>
                        </p>
                    </div>

                    {/* JSON Object Array */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="font-bold mb-2">JSON Object Array</h3>
                        <p class="text-sm text-gray-600 mb-2">
                            Objects with `label` and `value` keys
                        </p>
                        <Wheeler
                            options={JSON_CAR_DATA}
                            value={selectedCarId}
                            bottom={false}
                            cls="border rounded-md shadow-sm w-full"
                        />
                        <p class="mt-4 text-sm">
                            Selected: <span class="font-mono bg-gray-100 p-1 rounded">{displayValue}</span>
                        </p>
                    </div>

                    {/* Custom Item Height */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="font-bold mb-2">Custom Item Height</h3>
                        <p class="text-sm text-gray-600 mb-2">
                            Wheeler with itemHeight=48px
                        </p>
                        <Wheeler
                            options={FLAVORS}
                            value={selectedFlavor}
                            itemHeight={48}
                            bottom={false}
                            cls="border rounded-md shadow-sm w-full"
                        />
                        <p class="mt-4 text-sm">
                            Selected: <span class="font-mono bg-gray-100 p-1 rounded">{selectedFlavor}</span>
                        </p>
                    </div>

                    {/* Custom Item Count */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="font-bold mb-2">Custom Item Count</h3>
                        <p class="text-sm text-gray-600 mb-2">
                            Wheeler with itemCount=7 visible items
                        </p>
                        <Wheeler
                            options={FRUITS}
                            value={selectedFruit}
                            itemCount={7}
                            bottom={false}
                            cls="border rounded-md shadow-sm w-full"
                        />
                        <p class="mt-4 text-sm">
                            Selected: <span class="font-mono bg-gray-100 p-1 rounded">{selectedFruit}</span>
                        </p>
                    </div>

                    {/* Custom Styling */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="font-bold mb-2">Custom Styling</h3>
                        <p class="text-sm text-gray-600 mb-2">
                            Wheeler with custom border and colors
                        </p>
                        <Wheeler
                            options={FLAVORS}
                            value={selectedFlavor}
                            bottom={false}
                            cls="border-2 border-blue-400 rounded-lg shadow-lg w-full bg-blue-50"
                        />
                        <p class="mt-4 text-sm">
                            Selected: <span class="font-mono bg-blue-100 p-1 rounded text-blue-800">{selectedFlavor}</span>
                        </p>
                    </div>

                    {/* Wheeler with Search */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="font-bold mb-2">Wheeler with Search</h3>
                        <p class="text-sm text-gray-600 mb-2">
                            Searchable wheeler with custom placeholder
                        </p>
                        <Wheeler
                            options={FRUITS}
                            value={selectedFruitWithSearch}
                            searchable={true}
                            searchPlaceholder="This is sample placeholder"
                            bottom={false}
                            cls="border rounded-md shadow-sm w-full"
                        />
                        <p class="mt-4 text-sm">
                            Selected: <span class="font-mono bg-gray-100 p-1 rounded">{selectedFruitWithSearch}</span>
                        </p>
                    </div>

                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="font-bold mb-2">Wheeler with Search</h3>
                        <p class="text-sm text-gray-600 mb-2">
                            Searchable wheeler with header content
                        </p>
                        <Wheeler
                            options={FRUITS}
                            value={selectedFruitWithSearch}
                            searchable={true}
                            header={() => "Pick a Fruit"}
                            bottom={false}
                            cls="border rounded-md shadow-sm w-full"
                        />
                        <p class="mt-4 text-sm">
                            Selected: <span class="font-mono bg-gray-100 p-1 rounded">{selectedFruitWithSearch}</span>
                        </p>
                    </div>

                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="font-bold mb-2">Wheeler with Search</h3>
                        <p class="text-sm text-gray-600 mb-2">
                            Searchable wheeler with placeholder using default content
                        </p>
                        <Wheeler
                            options={FRUITS}
                            value={selectedFruitWithSearch}
                            searchable={true}
                            bottom={false}
                            cls="border rounded-md shadow-sm w-full"
                        />
                        <p class="mt-4 text-sm">
                            Selected: <span class="font-mono bg-gray-100 p-1 rounded">{selectedFruitWithSearch}</span>
                        </p>
                    </div>

                    {/* Wheeler Bottom Popup Demo */}
                    <div class="border border-gray-300 rounded-lg p-4 md:col-span-2 lg:col-span-3">
                        <div class="flex items-center justify-between mb-3">
                            <div>
                                <h3 class="font-bold text-lg">Wheeler Bottom Popup Demo</h3>
                                <p class="text-sm text-gray-600 mt-1">
                                    Interactive demo showing Wheeler with <code class="bg-gray-100 px-2 py-1 rounded text-xs">bottom={true}</code> - opens from bottom with mask overlay
                                </p>
                            </div>
                            <a
                                href="/WheelerDemo/WheelerDefaultDemo.html"
                                target="_blank"
                                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap"
                            >
                                Open Full Demo ↗
                            </a>
                        </div>
                        <iframe class="w-full h-[400px] border-2 border-gray-200 rounded-lg shadow-sm" src="/WheelerDemo/WheelerDefaultDemo.html"></iframe>
                    </div>

                    {/* Wheeler with Header */}
                    <div class="border border-gray-300 rounded-lg p-4 md:col-span-2 lg:col-span-3">
                        <h3 class="font-bold mb-2">Wheeler with Header</h3>
                        <p class="text-sm text-gray-600 mb-2">
                            Custom header displaying the current selection
                        </p>
                        <Wheeler
                            options={FRUITS}
                            value={selectedFruitWithHeader}
                            header={(v) => (
                                <div class="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-t-md">
                                    <p class="text-xs font-semibold uppercase tracking-wide">Your Selection</p>
                                    <p class="text-lg font-bold mt-1">{() => $$(v) || 'None'}</p>
                                </div>
                            )}
                            bottom={false}
                            cls="border rounded-md shadow-sm w-full"
                        />
                        <p class="mt-4 text-sm">
                            Selected: <span class="font-mono bg-gray-100 p-1 rounded">{selectedFruitWithHeader}</span>
                        </p>
                    </div>

                    {/* Multiple Selection Mode */}
                    <div class="border border-gray-300 rounded-lg p-4 md:col-span-2 lg:col-span-3">
                        <h3 class="font-bold mb-2">Multiple Selection Mode</h3>
                        <p class="text-sm text-gray-600 mb-2">
                            Wheeler with checkboxes for multi-select. Uses the `all` prop to enable "Select All" functionality.
                        </p>
                        <div class="flex flex-col md:flex-row gap-4">
                            <Wheeler
                                options={FRUITS}
                                value={selectedMultipleFruits}
                                all="Select All Fruits"
                                bottom={false}
                                cls="border rounded-md shadow-sm w-full md:w-64" />
                            <div class="flex-1">
                                <p class="text-sm font-semibold mb-2">Selected Fruits:</p>
                                <div class="bg-gray-100 p-3 rounded-md">
                                    {() => {
                                        const selected = $$(selectedMultipleFruits);
                                        if (Array.isArray(selected) && selected.length > 0) {
                                            return (
                                                <ul class="list-disc list-inside space-y-1">
                                                    {selected.map(fruit => (
                                                        <li class="font-mono text-sm">{fruit}</li>
                                                    ))}
                                                </ul>
                                            );
                                        }
                                        return <span class="text-gray-500 italic">No fruits selected</span>;
                                    }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    }
    // #endregion


    // #region Multi Wheeler Demo
    const multiWheelerDemo = () => {
        // --- Sample Data ---
        const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
        const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
        const SECONDS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
        const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
        const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const YEARS = Array.from({ length: 50 }, (_, i) => 2000 + i);

        const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Purple', 'Orange'];
        const BRANDS = ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance', 'Under Armour'];

        // --- State Variables ---
        // Time Picker
        const selectedHour = $('12');
        const selectedMinute = $('30');
        const selectedSecond = $('00');
        const timePickerVisible = $(false);
        const timePickerOk = $(false);

        // Date Picker
        const selectedDay = $(15);
        const selectedMonth = $('Jun');
        const selectedYear = $(2024);
        const datePickerVisible = $(false);
        const datePickerOk = $(false);

        // Product Selector
        const selectedSize = $('M');
        const selectedColor = $('Blue');
        const selectedBrand = $('Nike');
        const productSelectorVisible = $(false);
        const productSelectorOk = $(false);

        // Date-Time Picker with Search
        const selectedDaySearch = $(1);
        const selectedMonthSearch = $('Jan');
        const selectedYearSearch = $(2024);
        const selectedHourSearch = $('00');
        const selectedMinuteSearch = $('00');
        const dateTimeSearchVisible = $(false);
        const dateTimeSearchOk = $(false);

        // Custom Headers Example
        const selectedHourHeader = $('09');
        const selectedMinuteHeader = $('15');
        const selectedSecondHeader = $('45');
        const customHeaderVisible = $(false);
        const customHeaderOk = $(false);

        return (
            <>
                <h2 id="multi-wheeler" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Multi Wheeler Demo</h2>
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Time Picker */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="font-bold mb-2">Time Picker (Bottom Popup)</h3>
                            <p class="text-sm text-gray-600 mb-3">
                                Three wheels for Hours, Minutes, and Seconds with popup from bottom
                            </p>
                            <Button
                                type="contained"
                                onClick={() => timePickerVisible(true)}
                                cls="w-full mb-2"
                            >
                                Select Time
                            </Button>
                            <div class="bg-gray-100 p-3 rounded-md">
                                <p class="text-sm font-semibold mb-1">Selected Time:</p>
                                <p class="font-mono text-lg">
                                    {() => `${$$(selectedHour)}:${$$(selectedMinute)}:${$$(selectedSecond)}`}
                                </p>
                                <p class="text-xs text-gray-600 mt-2">
                                    OK clicked: {() => $$(timePickerOk) ? 'Yes' : 'No'}
                                </p>
                            </div>

                            <MultiWheeler
                                options={[HOURS, MINUTES, SECONDS]}
                                value={[selectedHour, selectedMinute, selectedSecond]}
                                headers={[
                                    (v) => <span class="text-xs text-gray-600">Hour</span>,
                                    (v) => <span class="text-xs text-gray-600">Min</span>,
                                    (v) => <span class="text-xs text-gray-600">Sec</span>
                                ]}
                                title="Select Time"
                                divider={true}
                                bottom={true}
                                mask={true}
                                visible={timePickerVisible}
                                ok={timePickerOk}
                                cancelOnBlur={true}
                                itemHeight={40}
                                itemCount={5}
                            />
                        </div>

                        {/* Date Picker */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="font-bold mb-2">Date Picker (Bottom Popup)</h3>
                            <p class="text-sm text-gray-600 mb-3">
                                Three wheels for Day, Month, and Year
                            </p>
                            <Button
                                type="contained"
                                onClick={() => datePickerVisible(true)}
                                cls="w-full mb-2"
                            >
                                Select Date
                            </Button>
                            <div class="bg-gray-100 p-3 rounded-md">
                                <p class="text-sm font-semibold mb-1">Selected Date:</p>
                                <p class="font-mono text-lg">
                                    {() => `${$$(selectedMonth)} ${$$(selectedDay)}, ${$$(selectedYear)}`}
                                </p>
                                <p class="text-xs text-gray-600 mt-2">
                                    OK clicked: {() => $$(datePickerOk) ? 'Yes' : 'No'}
                                </p>
                            </div>

                            <MultiWheeler
                                options={[DAYS, MONTHS, YEARS]}
                                value={[selectedDay, selectedMonth, selectedYear]}
                                headers={[
                                    (v) => <span class="text-xs text-gray-600">Day</span>,
                                    (v) => <span class="text-xs text-gray-600">Month</span>,
                                    (v) => <span class="text-xs text-gray-600">Year</span>
                                ]}
                                title="Select Date"
                                divider={true}
                                bottom={true}
                                mask={true}
                                visible={datePickerVisible}
                                ok={datePickerOk}
                                cancelOnBlur={true}
                                itemHeight={40}
                                itemCount={5}
                            />
                        </div>

                        {/* Product Selector */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="font-bold mb-2">Product Selector (Inline)</h3>
                            <p class="text-sm text-gray-600 mb-3">
                                Inline MultiWheeler for Size, Color, and Brand selection
                            </p>
                            <div class="bg-gray-100 p-3 rounded-md mb-3">
                                <p class="text-sm font-semibold mb-1">Selected:</p>
                                <p class="text-sm">
                                    Size: <span class="font-mono">{selectedSize}</span>,
                                    Color: <span class="font-mono">{selectedColor}</span>,
                                    Brand: <span class="font-mono">{selectedBrand}</span>
                                </p>
                            </div>

                            <MultiWheeler
                                options={[SIZES, COLORS, BRANDS]}
                                value={[selectedSize, selectedColor, selectedBrand]}
                                headers={[
                                    (v) => <span class="text-xs font-semibold text-purple-600">Size</span>,
                                    (v) => <span class="text-xs font-semibold text-blue-600">Color</span>,
                                    (v) => <span class="text-xs font-semibold text-green-600">Brand</span>
                                ]}
                                title="Choose Product"
                                divider={false}
                                bottom={false}
                                visible={true}
                                itemHeight={36}
                                itemCount={5}
                                cls="border-2 border-gray-300 rounded-lg shadow-sm w-[80%] overflow-auto"
                            />
                        </div>

                        {/* Date-Time with Search */}
                        <div class="border border-gray-300 rounded-lg p-4">
                            <h3 class="font-bold mb-2">Date-Time Picker with Search</h3>
                            <p class="text-sm text-gray-600 mb-3">
                                MultiWheeler with searchable wheels (Month, Hour, Minute)
                            </p>
                            <Button
                                type="contained"
                                onClick={() => dateTimeSearchVisible(true)}
                                cls="w-full mb-2"
                            >
                                Select Date & Time
                            </Button>
                            <div class="bg-gray-100 p-3 rounded-md">
                                <p class="text-sm font-semibold mb-1">Selected:</p>
                                <p class="font-mono text-sm">
                                    {() => `${$$(selectedMonthSearch)} ${$$(selectedDaySearch)}, ${$$(selectedYearSearch)} at ${$$(selectedHourSearch)}:${$$(selectedMinuteSearch)}`}
                                </p>
                                <p class="text-xs text-gray-600 mt-2">
                                    OK clicked: {() => $$(dateTimeSearchOk) ? 'Yes' : 'No'}
                                </p>
                            </div>

                            <MultiWheeler
                                options={[DAYS, MONTHS, YEARS, HOURS, MINUTES]}
                                value={[selectedDaySearch, selectedMonthSearch, selectedYearSearch, selectedHourSearch, selectedMinuteSearch]}
                                headers={[
                                    (v) => <span class="text-xs text-gray-600">Day</span>,
                                    (v) => <span class="text-xs text-gray-600">Month</span>,
                                    (v) => <span class="text-xs text-gray-600">Year</span>,
                                    (v) => <span class="text-xs text-gray-600">Hour</span>,
                                    (v) => <span class="text-xs text-gray-600">Min</span>
                                ]}
                                title="Select Date & Time"
                                divider={true}
                                bottom={true}
                                mask={true}
                                visible={dateTimeSearchVisible}
                                ok={dateTimeSearchOk}
                                cancelOnBlur={true}
                                itemHeight={40}
                                itemCount={5}
                                searchable={[false, true, true, true, true]}
                                searchPlaceholder={['', 'Search month...', 'Search year...', 'Search hour...', 'Search minute...']}
                            />
                        </div>

                        {/* Custom Headers Example */}
                        <div class="border border-gray-300 rounded-lg p-4 md:col-span-2">
                            <h3 class="font-bold mb-2">Custom Headers with Dynamic Display</h3>
                            <p class="text-sm text-gray-600 mb-3">
                                Headers that display the current selected value with custom styling
                            </p>
                            <Button
                                type="contained"
                                onClick={() => customHeaderVisible(true)}
                                cls="w-full mb-2"
                            >
                                Select Time with Custom Headers
                            </Button>
                            <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-md">
                                <p class="text-sm font-semibold mb-2">Selected Time:</p>
                                <p class="font-mono text-2xl font-bold text-blue-600">
                                    {() => `${$$(selectedHourHeader)}:${$$(selectedMinuteHeader)}:${$$(selectedSecondHeader)}`}
                                </p>
                                <p class="text-xs text-gray-600 mt-2">
                                    OK clicked: {() => $$(customHeaderOk) ? 'Yes ✓' : 'No'}
                                </p>
                            </div>

                            <MultiWheeler
                                options={[HOURS, MINUTES, SECONDS]}
                                value={[selectedHourHeader, selectedMinuteHeader, selectedSecondHeader]}
                                headers={[
                                    (v) => <div class="bg-blue-100 text-blue-800 font-bold py-1 px-2 rounded text-center"><div class="text-xs">Hour</div><div class="text-lg">{() => $$(v)}</div></div>,
                                    (v) => <div class="bg-green-100 text-green-800 font-bold py-1 px-2 rounded text-center"><div class="text-xs">Minute</div><div class="text-lg">{() => $$(v)}</div></div>,
                                    (v) => <div class="bg-purple-100 text-purple-800 font-bold py-1 px-2 rounded text-center"><div class="text-xs">Second</div><div class="text-lg">{() => $$(v)}</div></div>
                                ]}
                                title="Time Picker with Custom Headers"
                                divider={true}
                                bottom={true}
                                mask={true}
                                visible={customHeaderVisible}
                                ok={customHeaderOk}
                                cancelOnBlur={true}
                                itemHeight={44}
                                itemCount={5}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    }
    // #endregion

    // #region DateTime Wheeler Demo
    const datetimeWheelerDemo = () => {
        const selectedDate = $(new Date(2024, 5, 15, 14, 30, 45)) // June 15, 2024, 2:30:45 PM
        const visible = $(false)
        const mode: Observable<DateTimeWheelerType> = $("datetime" as DateTimeWheelerType)
        const itemCount = $(5)
        const showMask = $(true)
        const showDivider = $(true)
        const bottom = $(true) // New bottom flag

        // Format date for display
        const formatDate = (date: Date) => {
            return date.toLocaleString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            })
        }

        return <>
            <h2 id="datetime-wheeler" class="text-2xl font-bold mb-6 text-gray-800">DateTime Wheeler Demo</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Control Panel */}
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold mb-4 text-gray-700">Configuration</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                            <select
                                class="w-full p-2 border border-gray-300 rounded-md"
                                onChange={(e) => mode(e.target.value as DateTimeWheelerType)}
                                value={() => $$(mode)}
                            >
                                <option value="datetime">DateTime</option>
                                <option value="date">Date Only</option>
                                <option value="time">Time Only</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Item Count: {() => $$(itemCount)}
                            </label>
                            <input
                                type="range"
                                min="3"
                                max="9"
                                value={() => $$(itemCount)}
                                onInput={(e) => itemCount(parseInt(e.target.value))}
                                class="w-full"
                            />
                        </div>
                        <div class="items-center mr-2">
                            <Checkbox id="mask" labelPosition="right" checked={() => $$(showMask)} onChange={(e) => showMask(e.target.checked)}>Show Mask</Checkbox>
                            <Checkbox id="divider" labelPosition="right" checked={() => $$(showDivider)} onChange={(e) => showDivider(e.target.checked)}>Show Divider</Checkbox>
                            <Checkbox id="bottom" labelPosition="right" checked={() => $$(bottom)} onChange={(e) => bottom(e.target.checked)}>Popup Mode (Bottom)</Checkbox>
                        </div>

                        <Button
                            cls="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            onClick={() => visible(true)}
                        >
                            Open DateTime Picker
                        </Button>
                    </div>
                </div>

                {/* Preview Panel */}
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold mb-4 text-gray-700">Selected Value</h3>
                    <div class="p-4 bg-gray-50 rounded-md">
                        <p class="text-lg font-mono">
                            {() => formatDate($$(selectedDate))}
                        </p>
                        <p class="text-sm text-gray-500 mt-2">
                            Mode: {() => $$(mode).toUpperCase()}
                        </p>
                    </div>

                    <div class="mt-4">
                        <h4 class="font-medium text-gray-700 mb-2">Try These Examples:</h4>
                        <div class="grid grid-cols-2 gap-2">
                            <Button
                                onClick={() => {
                                    mode("datetime" as DateTimeWheelerType)
                                    selectedDate(new Date(2024, 0, 1, 12, 0, 0))
                                }}
                            >
                                New Year
                            </Button>
                            <Button
                                onClick={() => {
                                    mode("date" as DateTimeWheelerType)
                                    selectedDate(new Date(2024, 11, 25))
                                }}
                            >
                                Christmas
                            </Button>
                            <Button
                                onClick={() => {
                                    mode("time" as DateTimeWheelerType)
                                    selectedDate(new Date(2024, 0, 1, 18, 30, 0))
                                }}
                            >
                                Evening
                            </Button>
                            <Button
                                onClick={() => {
                                    mode("datetime" as DateTimeWheelerType)
                                    selectedDate(new Date())
                                }}
                            >
                                Now
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* DateTimeWheeler Component */}
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold mb-4 text-gray-700">DateTime Wheeler</h3>
                <div class="border border-gray-200 rounded-md p-4 min-h-[300px]">
                    <p class="text-sm text-gray-600 mb-3">
                        This component provides an interactive date and time picker with customizable display modes.
                        Adjust the settings above to see different configurations in action.
                    </p>
                    <DateTimeWheeler
                        value={selectedDate}
                        mode={mode}
                        visible={visible}
                        bottom={bottom} // Use the bottom flag here
                        mask={showMask}
                        divider={showDivider}
                        itemCount={itemCount}
                        title={(d) => `Select ${$$(mode) === 'time' ? 'Time' : $$(mode) === 'date' ? 'Date' : 'Date & Time'}`}
                    />
                </div>
            </div>

            {/* Information Panel */}
            <div class="mt-6 bg-blue-50 rounded-lg p-4">
                <h3 class="font-semibold text-blue-800 mb-2">About DateTime Wheeler</h3>
                <p class="text-sm text-blue-700">
                    The DateTime Wheeler component allows users to select dates and times using an intuitive wheel-based interface.
                    It supports different modes (datetime, date-only, time-only), customizable item counts, and various styling options.
                </p>
            </div>
        </>
    }
    // #endregion


    // #region Render
    return (
        <div class="p-8">
            <h1 class="text-3xl font-bold mb-6">@woby/wui Component Library</h1>

            <p class="mb-4">
                Real page - Click <a href="/test" class="text-blue-600 hover:underline font-semibold">here</a> to load the test runner
            </p>

            {/* Table of Contents Navigation */}
            {tableOfContents()}

            <div class="space-y-4">
                {appbarDemo()}
                {avatarDemo()}
                {badgeDemo()}
                {buttonDemo()}
                {alignButtonDemo()}
                {cardDemo()}
                {checkboxDemo()}
                {chipDemo()}
                {collapseDemo()}
                {iconButtonDemo()}
                {wheelerDemo()}
                {multiWheelerDemo()}
                {datetimeWheelerDemo()}
            </div>

            <div class="mt-8 p-4 bg-gray-100 rounded">
                <p class="text-sm text-gray-600">💡 This is the main application view. The test runner at <code class="bg-gray-200 px-1 rounded">/test</code> will show snapshot tests for all components.</p>
            </div>
        </div >
    )
    // #endregion
}

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
import Fab from './Fab'
import NumberField from './NumberField'
import Paper from './Paper'
import { SideBar, MenuItem, MenuText } from './SideBar'
import { Switch } from './Switch'
import { Tabs, Tab } from './Tabs'
import { Toolbar } from './Toolbar'
import { Zoomable, Img } from './Zoomable'
import TextField from './TextField'
import { TextArea } from './TextArea'
import { ToggleButton } from './ToggleButton'

import { BoldButton } from './Editor/BoldButton'
import { ItalicButton } from './Editor/ItalicButton'
import { UnderlineButton } from './Editor/UnderlineButton'
import { TextStyleButton } from './Editor/TextStyleButton'


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
                    <a href="#boldbutton" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        BoldButton
                    </a>
                    <a href="#italicbutton" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        ItalicButton
                    </a>
                    <a href="#underlinebutton" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        UnderlineButton
                    </a>
                    <a href="#textstylebutton" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        TextStyleButton
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
                    <a href="#fab" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Fab
                    </a>
                    <a href="#number-field" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Number Field
                    </a>
                    <a href="#paper" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Paper
                    </a>
                    <a href="#sidebar" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Sidebar
                    </a>
                    <a href="#switch" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Switch
                    </a>
                    <a href="#tabs" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Tabs
                    </a>
                    <a href="#textarea" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Text Area
                    </a>
                    <a href="#textfield" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Text Field
                    </a>
                    <a href="#toggle-button" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Toggle Button
                    </a>
                    <a href="#toolbar" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Toolbar
                    </a>
                    <a href="#zoomable" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
                        Zoomable
                    </a>
                    <a href="/html-demo.html" class="px-4 py-2 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200">
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


    // #region Editor

    // #region AlignButton Demo
    const alignButtonDemo = () => {
        return <>
            <h2 id="alignbutton" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">AlignButton Demo</h2>
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <EditorContext.Provider value={editorRef}>
                    <UndoRedo>
                        <div class="mb-4">
                            <div class="flex gap-4 items-center my-2">
                                <AlignButton contentAlign="start" />
                                <AlignButton contentAlign="center" />
                                <AlignButton contentAlign="end" />
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


    // #region Bold Button Demo
    const boldButtonDemo = () => {
        return <>
            <h2 id="boldbutton" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Bold Button Demo</h2>
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <EditorContext.Provider value={editorRef}>
                    <UndoRedo>
                        <div class="mb-4">
                            <div class="flex gap-4 items-center my-2">
                                <BoldButton cls="text-black" />
                            </div>
                            <div ref={editorRef} contentEditable class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <p>Select this text and try the Bold Buttons below!</p>
                                <p>You can make text bold.</p>
                            </div>
                        </div>
                    </UndoRedo>
                </EditorContext.Provider>
            </div>
        </>
    }
    // #endregion


    // #region Italic Button Demo
    const italicButtonDemo = () => {
        return <>
            <h2 id="italicbutton" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Italic Button Demo</h2>
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <EditorContext.Provider value={editorRef}>
                    <UndoRedo>
                        <div class="mb-4">
                            <div class="flex gap-4 items-center my-2">
                                <ItalicButton cls="text-black" />
                            </div>
                            <div ref={editorRef} contentEditable class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <p>Select this text and try the Italic Buttons below!</p>
                                <p>You can make text italic.</p>
                            </div>
                        </div>
                    </UndoRedo>
                </EditorContext.Provider>
            </div>
        </>
    }
    // #endregion


    // #region Underline Button Demo
    const underlineButtonDemo = () => {
        return <>
            <h2 id="underlinebutton" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Underline Button Demo</h2>
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <EditorContext.Provider value={editorRef}>
                    <UndoRedo>
                        <div class="mb-4">
                            <div class="flex gap-4 items-center my-2">
                                <UnderlineButton cls="text-black" />
                            </div>
                            <div ref={editorRef} contentEditable class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <p>Select this text and try the Underline Buttons below!</p>
                                <p>You can make text underline.</p>
                            </div>
                        </div>
                    </UndoRedo>
                </EditorContext.Provider>
            </div>
        </>
    }
    // #endregion


    // #region Text Style Button Demo
    const textStyleButtonDemo = () => {
        return <>
            <h2 id="boldbutton" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Text Style Button Demo</h2>
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <EditorContext.Provider value={editorRef}>
                    <UndoRedo>
                        <div class="mb-4">
                            <div class="flex gap-4 items-center my-2">
                                <TextStyleButton cls="text-black" type="bold" />
                                <TextStyleButton cls="text-black" type="italic" />
                                <TextStyleButton cls="text-black" type="underline" />
                            </div>
                            <div ref={editorRef} contentEditable class="border border-gray-300 rounded p-4 min-h-[200px] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <p>Select this text and try the text style buttons above!</p>
                                <p>You can apply bold, italic, or underline formatting.</p>
                            </div>
                        </div>
                    </UndoRedo>
                </EditorContext.Provider>
            </div>
        </>
    }
    // #endregion


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
        const selectedFruitWithCustomItem = $('Cherry');
        const selectedFlavorWithCustomStyle = $('Vanilla');
        const selectedMultipleFruits = $(['Apple', 'Cherry']);
        const selectedFruitWithHeader = $('Date');
        const selectedFruitWithSearch_1 = $('Elderberry');
        const selectedFruitWithSearch_2 = $('Elderberry');
        const selectedFruitWithSearch_3 = $('Elderberry');

        const visibleFruit = $(true);
        const visibleNumber = $(true);
        const visibleCarId = $(true);
        const visibleFlavor = $(true);
        const visibleFruitWithCustomItem = $(true);
        const visibleFlavorWithCustomStyle = $(true);
        const visibleFruitWithSearch_1 = $(true);
        const visibleFruitWithSearch_2 = $(true);
        const visibleFruitWithSearch_3 = $(true);
        const visibleFruitWithHeader = $(true);
        const visibleMultipleFruits = $(true);

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
                        <Button
                            type="contained"
                            onClick={() => { visibleFruit(true) }}
                            cls="my-2"
                        >
                            Open Wheeler
                        </Button>
                        <Wheeler
                            options={FRUITS}
                            value={selectedFruit}
                            visible={visibleFruit}
                            bottom={false}
                            cls="border rounded-md shadow-sm w-full" />
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
                        <Button
                            type="contained"
                            onClick={() => { visibleNumber(true) }}
                            cls="my-2"
                        >
                            Open Wheeler
                        </Button>
                        <Wheeler
                            options={NUMBERS}
                            value={selectedNumber}
                            visible={visibleNumber}
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
                        <Button
                            type="contained"
                            onClick={() => { visibleCarId(true) }}
                            cls="my-2"
                        >
                            Open Wheeler
                        </Button>
                        <Wheeler
                            options={JSON_CAR_DATA}
                            value={selectedCarId}
                            visible={visibleCarId}
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
                        <Button
                            type="contained"
                            onClick={() => { visibleFlavor(true) }}
                            cls="my-2"
                        >
                            Open Wheeler
                        </Button>
                        <Wheeler
                            options={FLAVORS}
                            value={selectedFlavor}
                            visible={visibleFlavor}
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
                        <Button
                            type="contained"
                            onClick={() => { visibleFruitWithCustomItem(true) }}
                            cls="my-2"
                        >
                            Open Wheeler
                        </Button>
                        <Wheeler
                            options={FRUITS}
                            value={selectedFruitWithCustomItem}
                            visible={visibleFruitWithCustomItem}
                            itemCount={7}
                            bottom={false}
                            cls="border rounded-md shadow-sm w-full"
                        />
                        <p class="mt-4 text-sm">
                            Selected: <span class="font-mono bg-gray-100 p-1 rounded">{selectedFruitWithCustomItem}</span>
                        </p>
                    </div>

                    {/* Custom Styling */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="font-bold mb-2">Custom Styling</h3>
                        <p class="text-sm text-gray-600 mb-2">
                            Wheeler with custom border and colors
                        </p>
                        <Button
                            type="contained"
                            onClick={() => { visibleFlavorWithCustomStyle(true) }}
                            cls="my-2"
                        >
                            Open Wheeler
                        </Button>

                        <Wheeler
                            options={FLAVORS}
                            value={selectedFlavorWithCustomStyle}
                            visible={visibleFlavorWithCustomStyle}
                            bottom={false}
                            cls="border-2 border-blue-400 rounded-lg shadow-lg w-full bg-blue-50"
                        />
                        <p class="mt-4 text-sm">
                            Selected: <span class="font-mono bg-blue-100 p-1 rounded text-blue-800">{selectedFlavorWithCustomStyle}</span>
                        </p>
                    </div>

                    {/* Wheeler with Search */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="font-bold mb-2">Wheeler with Search</h3>
                        <p class="text-sm text-gray-600 mb-2">
                            Searchable wheeler with custom placeholder
                        </p>
                        <Button
                            type="contained"
                            onClick={() => { visibleFruitWithSearch_1(true) }}
                            cls="my-2"
                        >
                            Open Wheeler
                        </Button>
                        <Wheeler
                            options={FRUITS}
                            value={selectedFruitWithSearch_1}
                            visible={visibleFruitWithSearch_1}
                            searchable={true}
                            searchPlaceholder="This is sample placeholder"
                            bottom={false}
                            cls="border rounded-md shadow-sm w-full"
                        />
                        <p class="mt-4 text-sm">
                            Selected: <span class="font-mono bg-gray-100 p-1 rounded">{selectedFruitWithSearch_1}</span>
                        </p>
                    </div>

                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="font-bold mb-2">Wheeler with Search</h3>
                        <p class="text-sm text-gray-600 mb-2">
                            Searchable wheeler with header content
                        </p>
                        <Button
                            type="contained"
                            onClick={() => { visibleFruitWithSearch_2(true) }}
                            cls="my-2"
                        >
                            Open Wheeler
                        </Button>
                        <Wheeler
                            options={FRUITS}
                            value={selectedFruitWithSearch_2}
                            visible={visibleFruitWithSearch_2}
                            searchable={true}
                            header={() => "Pick a Fruit"}
                            bottom={false}
                            cls="border rounded-md shadow-sm w-full"
                        />
                        <p class="mt-4 text-sm">
                            Selected: <span class="font-mono bg-gray-100 p-1 rounded">{selectedFruitWithSearch_2}</span>
                        </p>
                    </div>

                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="font-bold mb-2">Wheeler with Search</h3>
                        <p class="text-sm text-gray-600 mb-2">
                            Searchable wheeler with placeholder using default content
                        </p>
                        <Button
                            type="contained"
                            onClick={() => { visibleFruitWithSearch_3(true) }}
                            cls="my-2"
                        >
                            Open Wheeler
                        </Button>
                        <Wheeler
                            options={FRUITS}
                            value={selectedFruitWithSearch_3}
                            visible={visibleFruitWithSearch_3}
                            searchable={true}
                            bottom={false}
                            cls="border rounded-md shadow-sm w-full"
                        />
                        <p class="mt-4 text-sm">
                            Selected: <span class="font-mono bg-gray-100 p-1 rounded">{selectedFruitWithSearch_3}</span>
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
                        <Button
                            type="contained"
                            onClick={() => { visibleFruitWithHeader(true) }}
                            cls="my-2"
                        >
                            Open Wheeler
                        </Button>
                        <Wheeler
                            options={FRUITS}
                            value={selectedFruitWithHeader}
                            visible={visibleFruitWithHeader}
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
                        <Button
                            type="contained"
                            onClick={() => { visibleMultipleFruits(true) }}
                            cls="my-2"
                        >
                            Open Wheeler
                        </Button>
                        <div class="flex flex-col md:flex-row gap-4">
                            <Wheeler
                                options={FRUITS}
                                value={selectedMultipleFruits}
                                visible={visibleMultipleFruits}
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


    // #region Fab Demo
    const fabDemo = () => {
        const showFab = $(true)
        const extendedFab = $(false)
        const fabPosition = $('bottom-right' as 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left')

        return <>
            <h2 id="fab" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Fab (Floating Action Button) Demo</h2>
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Default Fab */}
                    <div class="border border-gray-300 rounded-lg p-4 relative min-h-[200px]">
                        <h3 class="text-lg font-semibold mb-2">Default Fab</h3>
                        <p class="text-sm text-gray-600 mb-2">Basic floating action button with icon</p>
                        <div class="relative h-32 bg-gray-50 rounded-md flex items-center justify-center">
                            <Fab onClick={() => alert('Fab clicked!')}>
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                                </svg>
                            </Fab>
                        </div>
                    </div>

                    {/* Extended Fab */}
                    <div class="border border-gray-300 rounded-lg p-4 relative min-h-[200px]">
                        <h3 class="text-lg font-semibold mb-2">Extended Fab</h3>
                        <p class="text-sm text-gray-600 mb-2">Fab with icon and text label</p>
                        <div class="relative h-32 bg-gray-50 rounded-md flex items-center justify-center">
                            <Fab extended onClick={() => alert('Extended Fab clicked!')}>
                                <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                                </svg>
                                <span>Add User</span>
                            </Fab>
                        </div>
                    </div>

                    {/* Custom Color Fab */}
                    <div class="border border-gray-300 rounded-lg p-4 relative min-h-[200px]">
                        <h3 class="text-lg font-semibold mb-2">Custom Color Fab</h3>
                        <p class="text-sm text-gray-600 mb-2">Fab with custom background color</p>
                        <div class="relative h-32 bg-gray-50 rounded-md flex items-center justify-center">
                            <Fab cls="!bg-green-500 hover:!bg-green-600" onClick={() => alert('Success!')}>
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                </svg>
                            </Fab>
                        </div>
                    </div>

                    {/* Position Control Demo */}
                    <div class="border border-gray-300 rounded-lg p-4 md:col-span-2 lg:col-span-3">
                        <h3 class="text-lg font-semibold mb-2">Position Control</h3>
                        <p class="text-sm text-gray-600 mb-4">Control the Fab position and visibility</p>

                        <div class="flex gap-4 mb-4 flex-wrap">
                            <div class="flex items-center gap-2">
                                <label class="text-sm font-medium">Position:</label>
                                <select
                                    class="border rounded px-2 py-1"
                                    onChange={(e) => fabPosition(e.target.value as any)}
                                    value={() => $$(fabPosition)}
                                >
                                    <option value="bottom-right">Bottom Right</option>
                                    <option value="bottom-left">Bottom Left</option>
                                    <option value="top-right">Top Right</option>
                                    <option value="top-left">Top Left</option>
                                </select>
                            </div>

                            <Checkbox id="show-fab" checked={() => $$(showFab)} onChange={(e) => showFab(e.target.checked)}>
                                Show Fab
                            </Checkbox>

                            <Checkbox id="extended-fab" checked={() => $$(extendedFab)} onChange={(e) => extendedFab(e.target.checked)}>
                                Extended
                            </Checkbox>
                        </div>

                        <div class="relative h-64 bg-gray-50 rounded-md border-2 border-dashed border-gray-300">
                            <div class="absolute inset-0 flex items-center justify-center text-gray-400">
                                Fab will appear in the selected position
                            </div>
                            {
                                () => {
                                    const positionClasses = {
                                        'bottom-right': 'bottom-4 right-4',
                                        'bottom-left': 'bottom-4 left-4',
                                        'top-right': 'top-4 right-4',
                                        'top-left': 'top-4 left-4',
                                    };

                                    return $$(showFab) && (
                                        <Fab
                                            // position={() => $$(fabPosition)}
                                            // type={() => $$(extendedFab) ? 'pill' : 'circular'}
                                            cls={() => positionClasses[$$(fabPosition)]}
                                            extended={() => $$(extendedFab)}
                                            onClick={() => alert(`Fab clicked at ${$$(fabPosition)}`)}
                                        >
                                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                                            </svg>
                                            {() => $$(extendedFab) && <span class="ml-2">Create</span>}
                                        </Fab>
                                    )
                                }
                            }
                        </div>
                    </div>

                    {/* Different Icons Demo */}
                    <div class="border border-gray-300 rounded-lg p-4 md:col-span-4 lg:col-span-4">
                        <h3 class="text-lg font-semibold mb-2">Different Actions</h3>
                        <p class="text-sm text-gray-600 mb-4">Various Fab examples with different icons and actions</p>

                        <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
                            <div class="relative h-32 bg-gray-50 rounded-md border flex items-center justify-center">
                                <p class="absolute top-2 left-2 text-xs text-gray-600">Edit</p>
                                <Fab cls="!bg-blue-500 hover:!bg-blue-600">
                                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </Fab>
                            </div>

                            <div class="relative h-32 bg-gray-50 rounded-md border flex items-center justify-center">
                                <p class="absolute top-2 left-2 text-xs text-gray-600">Delete</p>
                                <Fab cls="!bg-red-500 hover:!bg-red-600">
                                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                    </svg>
                                </Fab>
                            </div>

                            <div class="relative h-32 bg-gray-50 rounded-md border flex items-center justify-center">
                                <p class="absolute top-2 left-2 text-xs text-gray-600">Share</p>
                                <Fab cls="!bg-purple-500 hover:!bg-purple-600">
                                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                    </svg>
                                </Fab>
                            </div>

                            <div class="relative h-32 bg-gray-50 rounded-md border flex items-center justify-center">
                                <p class="absolute top-2 left-2 text-xs text-gray-600">Download</p>
                                <Fab cls="!bg-indigo-500 hover:!bg-indigo-600">
                                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                                    </svg>
                                </Fab>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    }
    // #endregion


    // #region NumberField Demo
    const numberFieldDemo = () => {
        const value1 = $(0)
        const value2 = $(50)
        const value3 = $(10)
        const value4 = $(5)
        const value5 = $(0)
        const value6 = $(25)

        return <>
            <h2 id="number-field" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Number Field Demo</h2>
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Default NumberField */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="font-bold mb-2">Default NumberField</h3>
                        <p class="text-sm text-gray-600 mb-2">Min: 0, Max: 100, Step: 1</p>
                        <NumberField value={value1} />
                        <p class="mt-2 text-sm">Value: <span class="font-mono bg-gray-100 p-1 rounded">{value1}</span></p>
                    </div>

                    {/* With Initial Value */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="font-bold mb-2">With Initial Value</h3>
                        <p class="text-sm text-gray-600 mb-2">Starts at 50</p>
                        <NumberField value={value2} />
                        <p class="mt-2 text-sm">Value: <span class="font-mono bg-gray-100 p-1 rounded">{value2}</span></p>
                    </div>

                    {/* Custom Step */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="font-bold mb-2">Custom Step</h3>
                        <p class="text-sm text-gray-600 mb-2">Increments by 10</p>
                        <NumberField value={value3} step={10} />
                        <p class="mt-2 text-sm">Value: <span class="font-mono bg-gray-100 p-1 rounded">{value3}</span></p>
                    </div>

                    {/* Min/Max Constraints & Error State */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="font-bold mb-2">Min/Max Constraints</h3>
                        <p class="text-sm text-gray-600 mb-2">Range: 0 to 10. Try going below 0.</p>
                        <NumberField value={value4} min={0} max={10} />
                        <p class="mt-2 text-sm">Value: <span class="font-mono bg-gray-100 p-1 rounded">{value4}</span></p>
                    </div>

                    {/* Disabled State */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="font-bold mb-2">Disabled State</h3>
                        <p class="text-sm text-gray-600 mb-2">Component is non-interactive</p>
                        <NumberField value={value5} disabled={true} />
                        <p class="mt-2 text-sm">Value: <span class="font-mono bg-gray-100 p-1 rounded">{value5}</span></p>
                    </div>

                    {/* Reactive Mode */}
                    <div class="border border-gray-300 rounded-lg p-4">
                        <h3 class="font-bold mb-2">Reactive Mode</h3>
                        <p class="text-sm text-gray-600 mb-2">Updates value on every click/change</p>
                        <NumberField value={value6} min={0} max={50} reactive={true} />
                        <p class="mt-2 text-sm">Value: <span class="font-mono bg-gray-100 p-1 rounded">{value6}</span></p>
                    </div>

                </div>
            </div>
        </>
    }
    // #endregion


    // #region Paper Demo
    const paperDemo = () => {
        return <>
            <h2 id="paper" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Paper Demo</h2>
            <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Default Paper */}
                    <div class="border border-gray-300 rounded-lg p-4 bg-gray-100">
                        <h3 class="font-bold mb-2">Default Paper</h3>
                        <p class="text-sm text-gray-600 mb-2">This should have the default elevation of 1.</p>
                        <Paper cls="p-4">
                            <p>This content is inside a Paper component.</p>
                        </Paper>
                    </div>

                    {/* No Elevation */}
                    <div class="border border-gray-300 rounded-lg p-4 bg-gray-100">
                        <h3 class="font-bold mb-2">No Elevation</h3>
                        <p class="text-sm text-gray-600 mb-2">Using `elevation={0}` for a flat appearance.</p>
                        <Paper elevation={0} cls="p-4">
                            <p>This Paper component has no shadow.</p>
                        </Paper>
                    </div>

                    {/* High Elevation */}
                    <div class="border border-gray-300 rounded-lg p-4 bg-gray-100">
                        <h3 class="font-bold mb-2">High Elevation</h3>
                        <p class="text-sm text-gray-600 mb-2">Using `elevation={16}` for a prominent shadow.</p>
                        <Paper elevation={16} cls="p-4">
                            <p>This Paper is floating high above the page.</p>
                        </Paper>
                    </div>

                    {/* Custom Styled Paper */}
                    <div class="border border-gray-300 rounded-lg p-4 bg-gray-100">
                        <h3 class="font-bold mb-2">Custom Styled Paper</h3>
                        <p class="text-sm text-gray-600 mb-2">Merging custom classes with elevation styles.</p>
                        <Paper elevation={4} cls="p-6 bg-yellow-50 border-2 border-yellow-200">
                            <p class="text-yellow-800">Custom background, border, and padding.</p>
                        </Paper>
                    </div>

                    {/* Paper as a Card */}
                    <div class="border border-gray-300 rounded-lg p-4 md:col-span-2 bg-gray-100">
                        <h3 class="font-bold mb-2">Paper as a Profile Card</h3>
                        <p class="text-sm text-gray-600 mb-2">A practical example using Paper as a container.</p>
                        <Paper cls="p-6 flex items-center gap-4" elevation={8}>
                            <Avatar src="/sample-avatar.png" size="lg" />
                            <div class="flex-1">
                                <p class="font-bold text-lg">Alex Doe</p>
                                <p class="text-sm text-gray-600">Frontend Developer</p>
                            </div>
                            <Button type="outlined">Follow</Button>
                        </Paper>
                    </div>

                </div>
            </div>
        </>
    }
    // #endregion


    // #region Sidebar Demo
    const sidebarDemo = () => {
        // 1. Core State
        const isOpen = $(false)
        const contentRef = $(null as HTMLElement | null)

        // 2. Configuration State (Observables to change props dynamically)
        const sidebarWidth = $(280)
        const showOverlay = $(true)
        const demoTitle = $("Default Configuration")

        // 3. Helper functions to switch modes
        const setMode = (mode: 'default' | 'no-overlay' | 'wide' | 'narrow') => {
            // Reset to closed first for smooth transition effect, or keep open if preferred
            // isOpen(false) 

            setTimeout(() => {
                switch (mode) {
                    case 'default':
                        sidebarWidth(280)
                        showOverlay(true)
                        demoTitle("Default Configuration")
                        break;
                    case 'no-overlay':
                        sidebarWidth(280)
                        showOverlay(false)
                        demoTitle("No Overlay (Click Toggle to Close)")
                        break;
                    case 'wide':
                        sidebarWidth(450)
                        showOverlay(true)
                        demoTitle("Wide Sidebar (450px)")
                        break;
                    case 'narrow':
                        sidebarWidth(80)
                        showOverlay(true)
                        demoTitle("Narrow / Icon Mode (80px)")
                        break;
                }
                isOpen(true)
            }, 50)
        }

        return <>
            <h2 id="sidebar" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Sidebar Demo</h2>

            {/* Control Panel Buttons */}
            <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
                <p class="text-sm font-semibold mb-3 text-gray-700">Select a Sidebar Mode:</p>
                <div class="flex flex-wrap gap-2">
                    <Button type="outlined" onClick={() => setMode('default')}>Default</Button>
                    <Button type="outlined" onClick={() => setMode('no-overlay')}>No Overlay</Button>
                    <Button type="outlined" onClick={() => setMode('wide')}>Wide</Button>
                    <Button type="outlined" onClick={() => setMode('narrow')}>Narrow</Button>
                </div>
            </div>

            {/* 
                DEMO CONTAINER 
                Note: style="transform: scale(1)" creates a new stacking context. 
                This forces the 'fixed' sidebar to be contained within this div 
                instead of the entire browser window.
            */}
            <div class="relative w-full h-[600px] border border-gray-300 rounded-lg overflow-hidden bg-gray-50 shadow-inner" style={{ transform: 'scale(1)' }}>

                {/* --- The Sidebar Component --- */}
                <SideBar
                    open={isOpen}
                    contentRef={contentRef}
                    width={sidebarWidth}
                    showOverlay={showOverlay}
                >
                    <div class="flex flex-col h-full">
                        {/* Sidebar Header */}
                        <div class="h-16 flex items-center justify-center border-b border-gray-700 bg-gray-900">
                            {/* Logic to hide text if narrow */}
                            {() => $$(sidebarWidth) > 100
                                ? <h2 class="text-xl font-bold text-white tracking-wider">WOBY UI</h2>
                                : <span class="text-xl font-bold text-white">W</span>
                            }
                        </div>

                        {/* Sidebar Menu */}
                        <div class="flex-1 py-4 overflow-y-auto">
                            <MenuItem>
                                <span class="text-xl min-w-[24px] text-center">🏠</span>
                                {() => $$(sidebarWidth) > 100 && <MenuText>Dashboard</MenuText>}
                            </MenuItem>

                            <MenuItem>
                                <span class="text-xl min-w-[24px] text-center">👥</span>
                                {() => $$(sidebarWidth) > 100 && <MenuText>Users</MenuText>}
                            </MenuItem>

                            <MenuItem>
                                <span class="text-xl min-w-[24px] text-center">📈</span>
                                {() => $$(sidebarWidth) > 100 && <MenuText>Analytics</MenuText>}
                            </MenuItem>

                            <div class="my-4 border-t border-gray-700"></div>

                            <MenuItem>
                                <span class="text-xl min-w-[24px] text-center">⚙️</span>
                                {() => $$(sidebarWidth) > 100 && <MenuText>Settings</MenuText>}
                            </MenuItem>
                        </div>

                        {/* Sidebar Footer */}
                        <div class="p-4 bg-gray-900">
                            <MenuItem onClick={() => isOpen(false)}>
                                <span class="text-xl min-w-[24px] text-center">🔙</span>
                                {() => $$(sidebarWidth) > 100 && <MenuText>Close Menu</MenuText>}
                            </MenuItem>
                        </div>
                    </div>
                </SideBar>


                {/* --- The Main Content Area --- */}
                <div
                    ref={contentRef}
                    class="w-full h-full overflow-y-auto bg-white transition-all duration-300"
                >
                    {/* Header Bar within content */}
                    <div class="sticky top-0 z-10 bg-white border-b px-8 py-4 flex items-center gap-4 shadow-sm">
                        <button
                            class="p-2 rounded-md hover:bg-gray-100 text-gray-600 focus:outline-none"
                            onClick={() => isOpen(!$$(isOpen))}
                        >
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <h1 class="text-xl font-bold text-gray-800">{demoTitle}</h1>
                    </div>

                    {/* Body Content */}
                    <div class="p-8">
                        <div class="max-w-3xl">
                            <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                                <h3 class="font-bold text-blue-800 mb-2">How it works</h3>
                                <p class="text-blue-700 text-sm mb-2">
                                    The <code>SideBar</code> component takes a <code>contentRef</code> prop.
                                    When opened, it calculates its width and applies a <code>margin-left</code> style
                                    to the referenced content element.
                                </p>
                                <p class="text-blue-700 text-sm">
                                    <strong>Current settings:</strong><br />
                                    Width: {sidebarWidth}px<br />
                                    Overlay: {() => $$(showOverlay) ? 'Enabled' : 'Disabled'}
                                </p>
                            </div>

                            <p class="mb-4 text-gray-600 leading-relaxed">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div class="h-40 bg-gray-100 rounded-lg animate-pulse"></div>
                                <div class="h-40 bg-gray-100 rounded-lg animate-pulse"></div>
                            </div>

                            <p class="mb-4 text-gray-600 leading-relaxed">
                                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                            </p>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div class="h-24 bg-gray-100 rounded-lg"></div>
                                <div class="h-24 bg-gray-100 rounded-lg"></div>
                                <div class="h-24 bg-gray-100 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    }
    // #endregion


    // #region Switch Demo
    const switchDemo = () => {
        const toggleState = $(true)

        // Individual states for each switch in the Styles & Custom Labels section
        const iosSwitchState = $(false)
        const flatSwitchState = $(false)
        const lightSwitchState = $(false)
        const skewedSwitchState = $(false)
        const customTextSwitchState = $(false)
        const flipSwitchState = $(false)

        const toggleAllCustomLabelState = $(false)
        const toggleAllEffectsState = $(false)

        // State for the effect selector form
        const selectedEffect = $("ios")
        const switchState = $(false)

        // Defined with descriptive names matching the CSS effects
        const effectsList = [
            { effect: "effect1", name: "Basic Slide", state: $(false) },
            { effect: "effect2", name: "Dual Knob", state: $(false) },
            { effect: "effect3", name: "Elastic", state: $(false) },
            { effect: "effect4", name: "Vertical Flip", state: $(false) },
            { effect: "effect5", name: "3D Rotate", state: $(false) },
            { effect: "effect6", name: "Spin", state: $(false) },
            { effect: "effect7", name: "Fade Scale", state: $(false) },
            { effect: "effect8", name: "Ripple", state: $(false) },
            { effect: "effect9", name: "Bounce", state: $(false) },
            { effect: "effect10", name: "Square Text", state: $(false) },
            { effect: "effect11", name: "Perspective", state: $(false) },
            { effect: "effect12", name: "Multi-Layer", state: $(false) },
            { effect: "effect13", name: "Reverse", state: $(false) },
            { effect: "effect14", name: "Vert. Bounce", state: $(false) },
            { effect: "effect15", name: "Zoom Fade", state: $(false) },
            { effect: "effect16", name: "Stretch", state: $(false) },
            { effect: "effect17", name: "Dual Slide", state: $(false) },
            { effect: "effect18", name: "Interactive", state: $(false) },
        ]

        const toggleAllCustomLabel = () => {
            const newState = !$$(toggleAllCustomLabelState);
            toggleAllCustomLabelState(newState);
            iosSwitchState(newState);
            flatSwitchState(newState);
            lightSwitchState(newState);
            skewedSwitchState(newState);
            customTextSwitchState(newState);
            flipSwitchState(newState);
        }

        const toggleAllEffects = () => {
            const newState = !$$(toggleAllEffectsState);
            toggleAllEffectsState(newState);
            effectsList.forEach(effect => effect.state(newState));
        }

        // Effect options for the selector
        const effectOptions = [
            { value: "ios", label: "iOS Style" },
            { value: "flat", label: "Flat Style" },
            { value: "light", label: "Light Style" },
            { value: "skewed", label: "Skewed Style" },
            { value: "flip", label: "3D Flip" },
            { value: "effect1", label: "Basic Slide" },
            { value: "effect2", label: "Dual Knob" },
            { value: "effect3", label: "Elastic" },
            { value: "effect4", label: "Vertical Flip" },
            { value: "effect5", label: "3D Rotate" },
            { value: "effect6", label: "Spin" },
            { value: "effect7", label: "Fade Scale" },
            { value: "effect8", label: "Ripple" },
            { value: "effect9", label: "Bounce" },
            { value: "effect10", label: "Square Text" },
            { value: "effect11", label: "Perspective" },
            { value: "effect12", label: "Multi-Layer" },
            { value: "effect13", label: "Reverse" },
            { value: "effect14", label: "Vert. Bounce" },
            { value: "effect15", label: "Zoom Fade" },
            { value: "effect16", label: "Stretch" },
            { value: "effect17", label: "Dual Slide" },
            { value: "effect18", label: "Interactive" },
        ]

        return <>
            <h2 id="switch" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Switch Demo</h2>

            <div class="space-y-6">

                {/* Interactive State */}
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 class="text-lg font-semibold mb-4">Interactive State</h3>
                    <div class="flex flex-col md:flex-row gap-8 items-center">
                        <div class="flex flex-col items-center gap-2">
                            <span class="text-sm text-gray-500 font-mono">Control</span>
                            <Switch checked={toggleState} effect="ios" />
                        </div>

                        <div
                            class={[
                                "flex-1 w-full p-6 rounded-lg border border-gray-200 transition-colors duration-300 flex items-center justify-center gap-3",
                                () => $$(toggleState) ? "bg-green-50 border-green-200" : "bg-gray-50"]}
                        >
                            <div class="text-center">
                                <p class="font-bold text-gray-700 mb-1">Current State</p>
                                <span class={[
                                    "px-3 py-1 rounded-full text-xs font-bold transition-all",
                                    () => $$(toggleState) ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                                ]}>
                                    {() => $$(toggleState) ? "ACTIVE" : "INACTIVE"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Effect Selector Form */}
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 class="text-lg font-semibold mb-4">Effect Selector Form</h3>
                    <p class="text-sm text-gray-600 mb-4">Select a switch effect from the dropdown to see it in action</p>

                    <div class="flex flex-col md:flex-row gap-6 items-center">
                        <div class="flex-1">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Select Switch Effect</label>
                            <select
                                class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={() => $$(selectedEffect)}
                                onChange={(e) => selectedEffect(e.target.value)}
                            >
                                {effectOptions.map(option => (
                                    <option value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>


                        <div class="flex-1 bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
                            <div class="text-center mb-4">
                                <p class="text-xs text-gray-500 uppercase tracking-wider mb-3">Live Preview</p>
                            </div>

                            <div class="bg-white rounded-lg shadow-sm p-6 space-y-4">
                                <p class="text-gray-700 leading-relaxed">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                    Use the switch below to toggle this content.
                                </p>

                                {/* <div class="flex items-center justify-center py-4"> */}
                                <div class="relative w-full h-24 flex items-center justify-center bg-white z-0 overflow-hidden">
                                    <Switch
                                        effect={() => $$(selectedEffect)}
                                        checked={switchState}
                                        on="ON"
                                        off="OFF"
                                    />
                                </div>

                                <p class="text-sm text-gray-600">
                                    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                    The switch state affects the behavior of this component.
                                </p>

                                <div class="text-center pt-2 border-t border-gray-200">
                                    <p class="text-xs text-gray-600">
                                        Effect: <span class="font-mono font-semibold">{() => $$(selectedEffect)}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4 flex items-center gap-4">
                        <Button
                            onClick={() => switchState(!$$(switchState))}
                            type="contained"
                        >
                            Toggle Switch
                        </Button>
                        <span class="text-sm">
                            Current State: <span class="font-mono">{() => $$(switchState) ? "ON" : "OFF"}</span>
                        </span>
                    </div>
                </div>

                {/* Styles & Custom Label  */}
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div class="flex justify-between items-center border-b mb-4 pb-4 mb-6 mt-12">
                        <h3 class="text-lg font-semibold mb-6">Styles & Custom Labels</h3>
                        <Button onClick={toggleAllCustomLabel}>
                            Toggle All ({() => $$(toggleAllCustomLabelState) ? 'ON' : 'OFF'})
                        </Button>
                    </div>

                    <div class="flex flex-wrap gap-8 justify-center">

                        <div class="flex flex-col items-center gap-3">
                            <span class="text-xs font-semibold text-gray-400 uppercase">iOS Style</span>
                            <Switch effect="ios" checked={iosSwitchState} />
                        </div>

                        <div class="flex flex-col items-center gap-3">
                            <span class="text-xs font-semibold text-gray-400 uppercase">Flat Style</span>
                            <Switch effect="flat" checked={flatSwitchState} />
                        </div>

                        <div class="flex flex-col items-center gap-3">
                            <span class="text-xs font-semibold text-gray-400 uppercase">Material Light</span>
                            <Switch effect="light" checked={lightSwitchState} />
                        </div>

                        <div class="flex flex-col items-center gap-3">
                            <span class="text-xs font-semibold text-gray-400 uppercase">Skewed</span>
                            <Switch effect="skewed" on="ON" off="OFF" checked={skewedSwitchState} />
                        </div>

                        <div class="flex flex-col items-center gap-3">
                            <span class="text-xs font-semibold text-gray-400 uppercase">Custom Text</span>
                            <Switch effect="flat" on="YES" off="NO" checked={customTextSwitchState} />
                        </div>

                        <div class="flex flex-col items-center gap-3">
                            <span class="text-xs font-semibold text-gray-400 uppercase">3D Flip</span>
                            <Switch effect="flip" checked={flipSwitchState} />
                        </div>
                    </div>
                </div>

                {/* CSS Effects Library Grid */}
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-lg font-semibold">CSS Effects Library</h3>
                        {/* <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">18 Variants</span> */}
                        <span class="text-lg font-semibold px-2 py-1 rounded">18 Variants</span>
                        <Button onClick={toggleAllEffects}>
                            Toggle All ({() => $$(toggleAllEffectsState) ? 'ON' : 'OFF'})
                        </Button>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
                        {effectsList.map((item) => (
                            <div class="flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                                {/* Header */}
                                <div class="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.effect}</span>
                                    <span class="text-xs font-semibold text-gray-700 truncate ml-2" title={item.name}>{item.name}</span>
                                </div>

                                {/* Switch Area */}
                                <div class="relative w-full h-24 flex items-center justify-center bg-white z-0 overflow-hidden">
                                    <Switch effect={item.effect} checked={item.state} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    }
    // #endregion


    // #region Tabs Demo
    const tabsDemo = () => {
        // --- State for Observable Example ---
        const activeTab = $("Home")

        // --- State for Dynamic Example ---
        const dynamicTabs = $([
            { id: 1, title: "Tab 1", content: "Content for the first tab" },
            { id: 2, title: "Tab 2", content: "Content for the second tab" }
        ])

        const addDynamicTab = () => {
            const newId = Date.now()
            const count = $$(dynamicTabs).length + 1
            dynamicTabs([...$$(dynamicTabs), {
                id: newId,
                title: `Tab ${count}`,
                content: `This is dynamically added content for Tab ${count}.`
            }])
        }

        const removeDynamicTab = (id: number) => {
            dynamicTabs($$(dynamicTabs).filter(tab => tab.id !== id))
        }

        return <>
            <h2 id="tabs" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Tabs Demo</h2>

            <div class="space-y-6">

                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 class="text-lg font-semibold mb-4">1. Basic Static Tabs</h3>
                    <div class="border border-gray-100 rounded-lg bg-gray-50 p-4">
                        <Tabs>
                            <Tab title="Home">
                                <div class="p-6 bg-white rounded-lg shadow-sm">
                                    <h3 class="text-xl font-bold mb-2">Welcome Home</h3>
                                    <p class="text-gray-600">This is the default view. The content area adjusts to the height of the content.</p>
                                </div>
                            </Tab>
                            <Tab title="Profile">
                                <div class="p-6 bg-white rounded-lg shadow-sm">
                                    <h3 class="text-xl font-bold mb-2">User Profile</h3>
                                    <div class="flex items-center gap-4 mt-4">
                                        <Avatar src="/sample-avatar.png" />
                                        <div>
                                            <p class="font-bold">John Doe</p>
                                            <p class="text-sm text-gray-500">Software Engineer</p>
                                        </div>
                                    </div>
                                </div>
                            </Tab>
                            <Tab title="Settings">
                                <div class="p-6 bg-white rounded-lg shadow-sm">
                                    <h3 class="text-xl font-bold mb-2">Settings</h3>
                                    <p class="text-gray-600">Preferences and configuration options go here.</p>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </div>

                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 class="text-lg font-semibold mb-4">2. Observable (Controlled) State</h3>
                    <div class="flex gap-2 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div class="flex items-center mr-4">
                            <span class="text-sm font-bold text-blue-800">Current Signal: </span>
                            <span class="ml-2 font-mono bg-white px-2 py-1 rounded text-blue-600 border border-blue-200">{activeTab}</span>
                        </div>
                        <Button type="outlined" onClick={() => activeTab("Home")}>Set Home</Button>
                        <Button type="outlined" onClick={() => activeTab("Profile")}>Set Profile</Button>
                        <Button type="outlined" onClick={() => activeTab("Messages")}>Set Messages</Button>
                    </div>

                    <div class="border border-gray-100 rounded-lg bg-gray-50 p-4">
                        <Tabs activeTag={activeTab}>
                            <Tab title="Home">
                                <div class="p-10 text-center bg-white rounded-lg">
                                    <span class="text-4xl">🏠</span>
                                    <h3 class="text-xl font-bold mt-2">Home Dashboard</h3>
                                </div>
                            </Tab>
                            <Tab title="Profile">
                                <div class="p-10 text-center bg-white rounded-lg">
                                    <span class="text-4xl">👤</span>
                                    <h3 class="text-xl font-bold mt-2">User Profile</h3>
                                </div>
                            </Tab>
                            <Tab title="Messages">
                                <div class="p-10 text-center bg-white rounded-lg">
                                    <span class="text-4xl">📬</span>
                                    <h3 class="text-xl font-bold mt-2">Inbox</h3>
                                    <p>You have 3 new messages.</p>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </div>

                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 class="text-lg font-semibold mb-4">3. Styled & Rich Content</h3>
                    <Tabs cls="bg-gray-50 rounded-xl border border-gray-200">
                        <Tab title="Statistics">
                            <div class="p-6">
                                <h4 class="font-bold text-gray-700 mb-4">Overview</h4>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                        <p class="text-xs text-gray-500 uppercase">Users</p>
                                        <p class="text-2xl font-black text-blue-600">1,234</p>
                                    </div>
                                    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                        <p class="text-xs text-gray-500 uppercase">Revenue</p>
                                        <p class="text-2xl font-black text-green-600">$45k</p>
                                    </div>
                                    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                        <p class="text-xs text-gray-500 uppercase">Growth</p>
                                        <p class="text-2xl font-black text-purple-600">+12%</p>
                                    </div>
                                </div>
                            </div>
                        </Tab>
                        <Tab title="Users List">
                            <div class="p-6">
                                <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <table class="min-w-full text-sm">
                                        <thead class="bg-gray-50">
                                            <tr>
                                                <th class="px-4 py-2 text-left font-medium text-gray-500">Name</th>
                                                <th class="px-4 py-2 text-left font-medium text-gray-500">Role</th>
                                                <th class="px-4 py-2 text-left font-medium text-gray-500">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-100">
                                            <tr>
                                                <td class="px-4 py-2">Alice Smith</td>
                                                <td class="px-4 py-2">Admin</td>
                                                <td class="px-4 py-2"><Chip cls="!bg-green-100 !text-green-800 scale-75 origin-left">Active</Chip></td>
                                            </tr>
                                            <tr>
                                                <td class="px-4 py-2">Bob Jones</td>
                                                <td class="px-4 py-2">Editor</td>
                                                <td class="px-4 py-2"><Chip cls="!bg-yellow-100 !text-yellow-800 scale-75 origin-left">Away</Chip></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Tab>
                    </Tabs>
                </div>

                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 class="text-lg font-semibold mb-4">4. Dynamic Add/Remove</h3>
                    <div class="flex items-center gap-4 mb-4">
                        <Button type="contained" onClick={addDynamicTab}>
                            + Add New Tab
                        </Button>
                        <span class="text-sm text-gray-500">Count: {() => $$(dynamicTabs).length}</span>
                    </div>

                    <div class="border border-gray-200 rounded-lg">
                        <Tabs>
                            {() => $$(dynamicTabs).map(tab => (
                                <Tab key={tab.id} title={tab.title}>
                                    <div class="p-8 flex flex-col items-center justify-center text-center bg-gray-50 rounded-b-lg min-h-[200px]">
                                        <h4 class="text-xl font-bold mb-2">{tab.title}</h4>
                                        <p class="text-gray-600 mb-6">{tab.content}</p>
                                        <Button
                                            cls="!bg-red-50 !text-red-600 hover:!bg-red-100 border border-red-200"
                                            onClick={() => removeDynamicTab(tab.id)}
                                        >
                                            Remove This Tab
                                        </Button>
                                    </div>
                                </Tab>
                            ))}
                        </Tabs>
                    </div>
                </div>

                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 class="text-lg font-semibold mb-4">5. Icons & Emojis</h3>
                    <p class="text-sm text-gray-600 mb-4">Tabs accept any string, including emojis or unicode icons.</p>

                    <div class="border border-gray-200 rounded-lg bg-gray-50 p-4">
                        <Tabs>
                            <Tab title="🎵 Music">
                                <div class="p-6 bg-white rounded-lg shadow-sm flex items-center justify-center min-h-[150px]">
                                    <div class="text-center">
                                        <div class="text-4xl mb-2">🎧</div>
                                        <p class="font-bold">Now Playing</p>
                                        <p class="text-xs text-gray-400">Lo-Fi Beats</p>
                                    </div>
                                </div>
                            </Tab>
                            <Tab title="📷 Photos">
                                <div class="p-6 bg-white rounded-lg shadow-sm flex items-center justify-center min-h-[150px]">
                                    <div class="grid grid-cols-3 gap-2">
                                        <div class="w-16 h-16 bg-gray-200 rounded"></div>
                                        <div class="w-16 h-16 bg-gray-200 rounded"></div>
                                        <div class="w-16 h-16 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            </Tab>
                            <Tab title="🎥 Video">
                                <div class="p-6 bg-white rounded-lg shadow-sm flex items-center justify-center min-h-[150px]">
                                    <div class="w-full max-w-xs h-32 bg-black rounded flex items-center justify-center text-white">
                                        ▶ Play
                                    </div>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </div>

                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 class="text-lg font-semibold mb-4">6. Nested Tabs</h3>
                    <p class="text-sm text-gray-600 mb-4">Tabs can be nested inside other tabs without conflict.</p>

                    <div class="border border-gray-200 rounded-lg">
                        <Tabs>
                            <Tab title="Account">
                                <div class="p-6 bg-gray-50 rounded-b-lg">
                                    <p class="mb-4 font-bold text-gray-700">Account Settings</p>
                                    {/* Inner Tabs */}
                                    <div class="bg-white p-4 rounded-lg border border-gray-200">
                                        <Tabs>
                                            <Tab title="General">
                                                <div class="p-4 bg-gray-50 rounded border border-gray-100 mt-2">
                                                    General account information inputs...
                                                </div>
                                            </Tab>
                                            <Tab title="Security">
                                                <div class="p-4 bg-gray-50 rounded border border-gray-100 mt-2">
                                                    Password change form...
                                                </div>
                                            </Tab>
                                        </Tabs>
                                    </div>
                                </div>
                            </Tab>
                            <Tab title="Notifications">
                                <div class="p-6 bg-gray-50 rounded-b-lg">
                                    <p class="font-bold text-gray-700">Notification Preferences</p>
                                    <p class="text-sm text-gray-500 mt-2">Email, SMS, and Push settings.</p>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </div>

                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 class="text-lg font-semibold mb-4">7. State Preservation</h3>
                    <p class="text-sm text-gray-600 mb-4">
                        Because tabs hide/show rather than unmount, form inputs keep their values when you switch tabs.
                    </p>

                    <div class="border border-gray-200 rounded-lg p-4 bg-yellow-50">
                        <Tabs>
                            <Tab title="Step 1: Info">
                                <div class="p-6 bg-white rounded-lg border border-yellow-100">
                                    <label class="block text-sm font-bold mb-2">Type something here:</label>
                                    <input type="text" class="border p-2 w-full rounded" placeholder="e.g., Hello World" />
                                    <p class="text-xs text-gray-500 mt-2">Now switch to "Step 2" and come back. Your text will still be here.</p>
                                </div>
                            </Tab>
                            <Tab title="Step 2: Review">
                                <div class="p-6 bg-white rounded-lg border border-yellow-100">
                                    <p class="font-bold">Review Section</p>
                                    <p class="text-sm text-gray-600">This simulates a different view in a multi-step form.</p>
                                    <Button type="contained" cls="mt-4">Submit</Button>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                </div>

            </div>
        </>
    }
    // #endregion


    // #region TextArea Demo
    const textareaDemo = () => {
        const controlTextArea = () => {
            // 1. State Definitions
            const resize = $("both") // Default to both to see resize effect immediately
            const effect = $("effect1")

            // Toggles
            const showLabel = $(true)
            const showPlaceholder = $(true)

            // Text Content
            const labelTxt = $("My Label")
            const placeholderTxt = $("Type something here...")

            // 2. Computed Props for the Component
            // We pass these functions to the component so it updates reactively
            const activeLabel = () => $$(showLabel) ? $$(labelTxt) : undefined
            const activePlaceholder = () => $$(showPlaceholder) ? $$(placeholderTxt) : undefined

            // 3. Lists for Dropdowns
            const resizeOptions = ["none", "horizontal", "vertical", "both"]

            // Grouping effects for easier selection
            const effectGroups = {
                "Underline": ["effect1", "effect2", "effect3"],
                "Box": ["effect4", "effect5", "effect6"],
                "Outline": ["effect7", "effect8", "effect9"],
                "Fill": ["effect10", "effect11", "effect12", "effect13", "effect14", "effect15"],
                "With Label (Float)": ["effect16", "effect17", "effect18", "effect19", "effect20", "effect21", "effect22", "effect23", "effect24"],
                "With Label (Cut)": ["effect19a", "effect20a", "effect21a"],
            }

            return (
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm w-full">
                    <h3 class="text-lg font-bold mb-6 uppercase border-b pb-2">Control Textarea</h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* LEFT COLUMN: Controls */}
                        <div class="space-y-4">
                            {/* Resize Control */}
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Resize Mode</label>
                                <select
                                    value={resize}
                                    onChange={(e: any) => resize(e.target.value)}
                                    class="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {resizeOptions.map(opt => <option value={opt}>{opt}</option>)}
                                </select>
                            </div>

                            {/* Effect Control */}
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Visual Effect</label>
                                <select
                                    value={effect}
                                    onChange={(e: any) => effect(e.target.value)}
                                    class="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {Object.entries(effectGroups).map(([group, effects]) => (
                                        <optgroup label={group}>
                                            {effects.map(eff => <option value={eff}>{eff}</option>)}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            {/* Label Control */}
                            <div class="p-3 bg-gray-50 rounded-md border border-gray-100">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-sm font-medium text-gray-700">Show Label?</span>
                                    <input
                                        type="checkbox"
                                        checked={showLabel}
                                        onChange={(e: any) => showLabel(e.target.checked)}
                                        class="w-4 h-4 text-blue-600 rounded"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={labelTxt}
                                    onChange={(e: any) => labelTxt(e.target.value)}
                                    disabled={() => !$$(showLabel)}
                                    class="w-full border border-gray-300 rounded-md p-2 text-sm disabled:opacity-50"
                                    placeholder="Enter label text"
                                />
                            </div>

                            {/* Placeholder Control */}
                            <div class="p-3 bg-gray-50 rounded-md border border-gray-100">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-sm font-medium text-gray-700">Show Placeholder?</span>
                                    <input
                                        type="checkbox"
                                        checked={showPlaceholder}
                                        onChange={(e: any) => showPlaceholder(e.target.checked)}
                                        class="w-4 h-4 text-blue-600 rounded"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={placeholderTxt}
                                    onChange={(e: any) => placeholderTxt(e.target.value)}
                                    disabled={() => !$$(showPlaceholder)}
                                    class="w-full border border-gray-300 rounded-md p-2 text-sm disabled:opacity-50"
                                    placeholder="Enter placeholder text"
                                />
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Preview & Debug */}
                        <div class="flex flex-col gap-6">

                            {/* Live Preview Area */}
                            <div class="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 relative">
                                <div class="absolute top-2 left-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Preview
                                </div>

                                {/* Constraining box for the resizable TextArea */}
                                <div class="w-full h-[260px] max-w-full overflow-hidden flex items-center justify-center">
                                    <TextArea
                                        cls="min-w-[280px] min-h-[120px] max-size-full box-border"
                                        resize={resize}
                                        effect={effect}
                                        label={activeLabel}
                                        placeholder={activePlaceholder}
                                    />
                                </div>
                            </div>


                            {/* Debug Info (Fixed your snippet) */}
                            <div class="text-xs">
                                <h4 class="font-bold text-gray-500 mb-2 uppercase">Current State</h4>
                                <pre class="bg-gray-800 text-gray-100 rounded-md p-4 font-mono overflow-auto">
                                    {() => `
Resize:      ${$$(resize)}
Effect:      ${$$(effect)}
Label:       ${$$(showLabel)} ("${$$(labelTxt)}")
Placeholder: ${$$(showPlaceholder)} ("${$$(placeholderTxt)}")
`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }


        const displayTextArea = () => {
            return <>
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 class="text-lg font-semibold mb-4 uppercase">Border Effect</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <TextArea resize="none" effect="effect1" placeholder="Effect 1" />
                        <TextArea resize="none" effect="effect2" placeholder="Effect 2" />
                        <TextArea resize="none" effect="effect3" placeholder="Effect 3" />

                        <TextArea resize="none" effect="effect4" placeholder="Effect 4" />
                        <TextArea resize="none" effect="effect5" placeholder="Effect 5" />
                        <TextArea resize="none" effect="effect6" placeholder="Effect 6" />

                        <TextArea resize="none" effect="effect7" placeholder="Effect 7" />
                        <TextArea resize="none" effect="effect8" placeholder="Effect 8" />
                        <TextArea resize="none" effect="effect9" placeholder="Effect 9" />
                    </div>

                    <h3 class="text-lg font-semibold mb-4 uppercase">Background Effect</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <TextArea resize="none" effect="effect10" placeholder="Effect 10" />
                        <TextArea resize="none" effect="effect11" placeholder="Effect 11" />
                        <TextArea resize="none" effect="effect12" placeholder="Effect 12" />

                        <TextArea resize="none" effect="effect13" placeholder="Effect 13" />
                        <TextArea resize="none" effect="effect14" placeholder="Effect 14" />
                        <TextArea resize="none" effect="effect15" placeholder="Effect 15" />
                    </div>

                    <h3 class="text-lg font-semibold mb-4 uppercase">Input With Label Effect</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <TextArea resize="none" effect="effect16" label="Effect 16" />
                        <TextArea resize="none" effect="effect17" label="Effect 17" />
                        <TextArea resize="none" effect="effect18" label="Effect 18" />

                        <TextArea resize="none" effect="effect19" label="Effect 19" />
                        <TextArea resize="none" effect="effect20" label="Effect 20" />
                        <TextArea resize="none" effect="effect21" label="Effect 21" />

                        <TextArea resize="none" effect="effect22" label="Effect 22" />
                        <TextArea resize="none" effect="effect23" label="Effect 23" />
                        <TextArea resize="none" effect="effect24" label="Effect 24" />
                    </div>

                    <h3 class="text-lg font-semibold mb-4 uppercase">Alternative Label Effects</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <TextArea resize="none" effect="effect19a" label="Effect 19a" />
                        <TextArea resize="none" effect="effect20a" label="Effect 20a" />
                        <TextArea resize="none" effect="effect21a" label="Effect 21a" />

                    </div>
                </div>
            </>
        }

        return <>
            <h2 id="textarea" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Text Area Demo</h2>
            <div class="space-y-6">
                {displayTextArea}
                {controlTextArea}
            </div>
        </>
    }
    // #endregion


    // #region Text Field Demo
    const textFieldDemo = () => {
        return <>
            <h2 id="textfield" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Text Field Demo</h2>
            <div class="space-y-6">
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 class="text-lg font-semibold mb-4 uppercase">Border Effect</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <TextField effect="effect1" placeholder="Effect 1" />
                        <TextField effect="effect2" placeholder="Effect 2" />
                        <TextField effect="effect3" placeholder="Effect 3" />

                        <TextField effect="effect4" placeholder="Effect 4" />
                        <TextField effect="effect5" placeholder="Effect 5" />
                        <TextField effect="effect6" placeholder="Effect 6" />

                        <TextField effect="effect7" placeholder="Effect 7" />
                        <TextField effect="effect8" placeholder="Effect 8" />
                        <TextField effect="effect9" placeholder="Effect 9" />
                    </div>

                    <h3 class="text-lg font-semibold mb-4 uppercase">Background Effect</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <TextField effect="effect10" placeholder="Effect 10" />
                        <TextField effect="effect11" placeholder="Effect 11" />
                        <TextField effect="effect12" placeholder="Effect 12" />

                        <TextField effect="effect13" placeholder="Effect 13" />
                        <TextField effect="effect14" placeholder="Effect 14" />
                        <TextField effect="effect15" placeholder="Effect 15" />
                    </div>

                    <h3 class="text-lg font-semibold mb-4 uppercase">Input With Label Effect</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <TextField effect="effect16" label="Effect 16" />
                        <TextField effect="effect17" label="Effect 17" />
                        <TextField effect="effect18" label="Effect 18" />

                        <TextField effect="effect19" label="Effect 19" />
                        <TextField effect="effect20" label="Effect 20" />
                        <TextField effect="effect21" label="Effect 21" />

                        <TextField effect="effect22" label="Effect 22" />
                        <TextField effect="effect23" label="Effect 23" />
                        <TextField effect="effect24" label="Effect 24" />
                    </div>

                    <h3 class="text-lg font-semibold mb-4 uppercase">Alternative Label Effects</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <TextField effect="effect19a" label="Effect 19a" />
                        <TextField effect="effect20a" label="Effect 20a" />
                        <TextField effect="effect21a" label="Effect 21a" />

                    </div>
                </div>
            </div>
        </>
    }
    // #endregion


    // #region Toggle Button Demo
    const toggleButtonDemo = () => {
        // Alignment state (single-select group)
        const align = $("left")

        // Text style states (multi-select toggles)
        const isBold = $(false)
        const isItalic = $(false)
        const isUnderline = $(false)

        const previewClass = () => [
            "inline-block rounded-md px-4 py-2 border border-gray-300 bg-white w-full max-size-full",
            $$(align) === "left" && "text-left",
            $$(align) === "center" && "text-center",
            $$(align) === "right" && "text-right",
            $$(isBold) && "font-semibold",
            $$(isItalic) && "italic",
            $$(isUnderline) && "underline underline-offset-2",
        ]

        return (
            <>
                <h2
                    id="toggle-button"
                    class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4"
                >
                    Toggle Button Demo
                </h2>

                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] gap-6">
                        {/* LEFT: Controls */}
                        <div class="space-y-6">
                            {/* Alignment Group */}
                            <div>
                                <h3 class="text-sm font-semibold mb-2 text-gray-800 uppercase tracking-wide">
                                    Alignment
                                </h3>
                                <p class="text-xs text-gray-500 mb-3">
                                    Single-select group using <code>ToggleButton</code> for text alignment.
                                </p>
                                <div class="inline-flex gap-2 bg-gray-50 border border-gray-200 rounded-full px-2 py-1">
                                    <ToggleButton
                                        checked={() => $$(align) === "left"}
                                        onClick={() => align("left")}
                                        cls="min-w-[64px]"
                                    >
                                        Left
                                    </ToggleButton>
                                    <ToggleButton
                                        checked={() => $$(align) === "center"}
                                        onClick={() => align("center")}
                                        cls="min-w-[64px]"
                                    >
                                        Center
                                    </ToggleButton>
                                    <ToggleButton
                                        checked={() => $$(align) === "right"}
                                        onClick={() => align("right")}
                                        cls="min-w-[64px]"
                                    >
                                        Right
                                    </ToggleButton>
                                </div>
                            </div>

                            {/* Text Style Group */}
                            <div>
                                <h3 class="text-sm font-semibold mb-2 text-gray-800 uppercase tracking-wide">
                                    Text Style
                                </h3>
                                <p class="text-xs text-gray-500 mb-3">
                                    Multi-select toggles controlling bold, italic and underline.
                                </p>
                                <div class="inline-flex gap-2 bg-gray-50 border border-gray-200 rounded-full px-2 py-1">
                                    <ToggleButton
                                        checked={isBold}
                                        cls="w-9 h-9 font-semibold"
                                    >
                                        B
                                    </ToggleButton>
                                    <ToggleButton
                                        checked={isItalic}
                                        cls="w-9 h-9 italic"
                                    >
                                        I
                                    </ToggleButton>
                                    <ToggleButton
                                        checked={isUnderline}
                                        cls="w-9 h-9 underline underline-offset-2"
                                    >
                                        U
                                    </ToggleButton>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Preview + Debug */}
                        <div class="flex flex-col gap-6">
                            {/* Preview */}
                            <div class="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-4">
                                <p class="text-xs font-semibold text-gray-500 tracking-wide uppercase mb-2">
                                    Preview
                                </p>
                                <div class={previewClass}>
                                    This is a sample text controlled by Toggle Buttons.
                                </div>
                            </div>

                            {/* Debug info */}
                            <div class="text-xs">
                                <h4 class="font-bold text-gray-500 mb-2 uppercase tracking-wide">
                                    Current State
                                </h4>
                                <pre class="bg-gray-900 text-gray-100 rounded-md p-3 font-mono text-[11px] overflow-auto">
                                    {() => `align:      ${$$(align)}
bold:       ${$$(isBold)}
italic:     ${$$(isItalic)}
underline:  ${$$(isUnderline)}`}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
    // #endregion



    // #region Toolbar Demo
    const toolbarDemo = () => {
        return <>
            <h2 id="toolbar" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Toolbar Demo</h2>

            <div class="space-y-6">

                {/* Basic Application Bar */}
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 class="text-lg font-semibold mb-4">1. Basic Application Bar</h3>
                    <p class="text-sm text-gray-600 mb-4">Toolbar used as a primary navigation container with a logo, spacer, and action button.</p>

                    {/* Container simulating an AppBar */}
                    <div class="bg-blue-600 text-white rounded-lg shadow-md h-16 overflow-hidden">
                        <Toolbar>
                            <IconButton cls="text-white mr-2">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
                            </IconButton>
                            <h3 class="text-lg font-bold">My App</h3>
                            {/* Flex Spacer */}
                            <div class="flex-1"></div>
                            <Button type="text" cls="text-white hover:bg-blue-700">Login</Button>
                        </Toolbar>
                    </div>
                </div>

                {/* Editor Tools (Dense) */}
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 class="text-lg font-semibold mb-4">2. Editor Tools (Dense)</h3>
                    <p class="text-sm text-gray-600 mb-4">Used for grouping small action buttons (like a text editor).</p>

                    <div class="border border-gray-300 rounded-lg bg-gray-50 h-12 overflow-hidden">
                        <Toolbar cls="!px-2 gap-1"> {/* Override padding for dense look */}
                            <IconButton cls="hover:bg-gray-200 rounded p-1 w-8 h-8"><span class="font-bold">B</span></IconButton>
                            <IconButton cls="hover:bg-gray-200 rounded p-1 w-8 h-8"><span class="italic">I</span></IconButton>
                            <IconButton cls="hover:bg-gray-200 rounded p-1 w-8 h-8"><span class="underline">U</span></IconButton>

                            <div class="w-[1px] h-6 bg-gray-300 mx-2"></div> {/* Separator */}

                            <IconButton cls="hover:bg-gray-200 rounded p-1 w-8 h-8">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" /></svg>
                            </IconButton>
                            <IconButton cls="hover:bg-gray-200 rounded p-1 w-8 h-8">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 18h5v-6h-5v6zm-6 0h5V5H4v13zm12 0h5v-6h-5v6zM10 5v6h11V5H10z" /></svg>
                            </IconButton>
                        </Toolbar>
                    </div>
                </div>

                {/* Search & Filter */}
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 class="text-lg font-semibold mb-4">3. Search & Filter</h3>
                    <p class="text-sm text-gray-600 mb-4">A toolbar containing input fields.</p>

                    <div class="bg-white border border-gray-200 rounded-full shadow-sm h-14 overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 transition-shadow">
                        <Toolbar>
                            <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            <input type="text" placeholder="Search..." class="outline-none text-gray-700 flex-1 bg-transparent h-full" />

                            <div class="w-[1px] h-8 bg-gray-200 mx-2"></div>

                            <Button type="text" cls="text-gray-500 hover:text-blue-600 font-normal">Filters</Button>
                            <IconButton cls="text-white bg-blue-600 hover:bg-blue-700 rounded-full p-2 ml-2 w-10 h-10 flex items-center justify-center">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </IconButton>
                        </Toolbar>
                    </div>
                </div>

                {/* Complex Dashboard Header */}
                <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 class="text-lg font-semibold mb-4">4. Complex Layout</h3>
                    <p class="text-sm text-gray-600 mb-4">Using nested flexbox logic within the Toolbar.</p>

                    <div class="bg-gray-900 text-white rounded-lg shadow-lg h-20 overflow-hidden">
                        <Toolbar>
                            {/* Left: Branding */}
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-gradient-to-tr from-pink-500 to-orange-500 rounded-lg shadow-inner"></div>
                                <div>
                                    <p class="font-bold leading-none">Dashboard</p>
                                    <p class="text-xs text-gray-400">v2.0.1</p>
                                </div>
                            </div>

                            {/* Center: Navigation Links */}
                            <div class="flex-1 flex justify-center">
                                <div class="md:flex gap-6 text-sm font-medium text-gray-400">
                                    <a class="hover:text-white transition-colors">Overview</a>
                                    <a class="text-white border-b-2 border-orange-500 pb-1">Reports</a>
                                    <a class="hover:text-white transition-colors">Settings</a>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div class="flex items-center gap-3">
                                <IconButton cls="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                                    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                                    </svg>
                                </IconButton>
                                <div class="w-[1px] h-6 bg-gray-700"></div>
                                <Avatar src="/sample-avatar.png" cls="w-9 h-9 ring-2 ring-gray-700 cursor-pointer" />
                            </div>
                        </Toolbar>
                    </div>
                </div>
            </div>
        </>
    }
    // #endregion

    // #region Zoomable Demo
    const zoomableDemo = () => {

        // 1. Define State Signals
        const scale = $(1)
        const minScale = $(1)
        const maxScale = $(5)

        // Dimensions (defaulting to 400px)
        const width = $(400)
        const height = $(400)

        const x = $(0)
        const y = $(0)

        // 2. Button Logic
        const handleZoomIn = () => {
            const next = $$(scale) + 0.5
            scale(Math.min($$(maxScale), next))
        }

        const handleZoomOut = () => {
            const next = $$(scale) - 0.5
            scale(Math.max($$(minScale), next))
        }

        // NEW: Reset Logic
        const handleReset = () => {
            scale(1) // Reset to original size
            x(0)
            y(0)
        }

        return <>
            <h2 id="zoomable" class="text-2xl font-semibold mt-8 mb-4 scroll-mt-4">Zoomable Demo</h2>

            <div class="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
                {/* --- LEFT COLUMN: CONTROLS --- */}
                <div class="flex flex-col gap-6">

                    {/* Size Controls */}
                    <div class="space-y-3">
                        <h3 class="font-semibold text-gray-600 text-sm uppercase tracking-wider">Dimensions (px)</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="flex flex-col">
                                <label class="text-xs text-gray-500 mb-1">Width</label>
                                <input
                                    type="number"
                                    value={width}
                                    onInput={(e) => width(parseInt((e.target as HTMLInputElement).value))}
                                    class="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div class="flex flex-col">
                                <label class="text-xs text-gray-500 mb-1">Height</label>
                                <input
                                    type="number"
                                    value={height}
                                    onInput={(e) => height(parseInt((e.target as HTMLInputElement).value))}
                                    class="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <hr />

                    {/* Scale Limits */}
                    <div class="space-y-3">
                        <h3 class="font-semibold text-gray-600 text-sm uppercase tracking-wider">Limits</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="flex flex-col">
                                <label class="text-xs text-gray-500 mb-1">Min Scale</label>
                                <input
                                    type="number"
                                    value={minScale}
                                    onInput={(e) => minScale(parseFloat((e.target as HTMLInputElement).value))}
                                    class="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div class="flex flex-col">
                                <label class="text-xs text-gray-500 mb-1">Max Scale</label>
                                <input
                                    type="number"
                                    value={maxScale}
                                    onInput={(e) => maxScale(parseFloat((e.target as HTMLInputElement).value))}
                                    class="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <hr />

                    {/* Actions */}
                    <div class="space-y-3">
                        <h3 class="font-semibold text-gray-600 text-sm uppercase tracking-wider">
                            Actions (Current: {$$(scale).toFixed(1)}x)
                        </h3>
                        <div class="grid grid-cols-2 gap-2">
                            <button
                                onClick={handleZoomOut}
                                class="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded transition-colors active:scale-95"
                            >
                                Zoom Out
                            </button>
                            <button
                                onClick={handleZoomIn}
                                class="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors active:scale-95"
                            >
                                Zoom In
                            </button>

                            {/* NEW: Reset Button */}
                            <button
                                onClick={handleReset}
                                class="cursor-pointer col-span-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded transition-colors active:scale-95"
                            >
                                Reset
                            </button>
                        </div>
                        <p class="text-xs text-gray-400 italic mt-2">
                            * You can also use Mouse Wheel or Pinch to zoom.
                        </p>
                    </div>
                </div>


                {/* --- RIGHT COLUMN: PREVIEW --- */}
                <div class="bg-gray-50 rounded-lg p-4 flex items-center justify-center border border-dashed border-gray-300">

                    {/* The Component Instance */}
                    <Zoomable
                        scale={scale}          // Two-way binding
                        minScale={minScale}    // Configuration
                        maxScale={maxScale}    // Configuration
                        width={width}          // Configuration
                        height={height}        // Configuration
                        x={x}
                        y={y}
                        cls="bg-white shadow-lg border border-gray-200"
                    >
                        <Img
                            src="https://picsum.photos/800/800"
                            alt="Demo Image"
                        />
                    </Zoomable>

                </div>
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

                {/* Editor */}
                {alignButtonDemo()}
                {boldButtonDemo()}
                {italicButtonDemo()}
                {underlineButtonDemo}
                {textStyleButtonDemo()}

                {cardDemo()}
                {checkboxDemo()}
                {chipDemo()}
                {collapseDemo()}
                {iconButtonDemo()}
                {wheelerDemo()}
                {multiWheelerDemo()}
                {datetimeWheelerDemo()}
                {fabDemo()}
                {numberFieldDemo()}
                {paperDemo()}
                {sidebarDemo()}
                {switchDemo()}
                {tabsDemo()}
                {textareaDemo()}
                {textFieldDemo()}
                {toggleButtonDemo()}
                {toolbarDemo()}
                {zoomableDemo()}
            </div>

            <div class="mt-8 p-4 bg-gray-100 rounded">
                <p class="text-sm text-gray-600">💡 This is the main application view. The test runner at <code class="bg-gray-200 px-1 rounded">/test</code> will show snapshot tests for all components.</p>
            </div>

            <div class="mt-8">
                <a href="/html-demo.html"
                    class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    HTML Demo
                </a>
            </div>
        </div >
    )
    // #endregion
}

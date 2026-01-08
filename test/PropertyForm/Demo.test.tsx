/** @jsxImportSource woby */
import { PropertyForm } from "../../src/PropertyForm/PropertyForm"
import { PropertyRows } from "../../src/PropertyForm/PropertyRows"

// import { Avatar, def as AvatarProps } from "../../src/Avatar"
// import { Button, def as ButtonProps } from "../../src/Button"
// import { Badge, def as BadgeProps } from "../../src/Badge"
// import { Chip, def as ChipProps } from "../../src/Chip"

// Wheeler
import countries from '../../public/json/countries.json'
import { Wheeler } from "../../src/Wheeler/Wheeler"
import { MultiWheeler } from "../../src/Wheeler/MultiWheeler"

// IMPORTANT: import editors at least once so they register into Editors[]
import "../../src/PropertyForm/BooleanEditor" // true or false
import "../../src/PropertyForm/StringEditor" // text input
import "../../src/PropertyForm/NumberEditor" // number input
import "../../src/PropertyForm/DropdownEditor" // dropdown select
import "../../src/PropertyForm/ColorEditor" // color picker
import "../../src/PropertyForm/ObjectEditor" // object editor
import { $, $$, isObservable, useEffect, useMemo } from "woby"

const SampleProps = () => ({
    // 1. StringEditor (String)
    username: $("JohnDoe_99"),

    // 2. NumberEditor (Number)
    accountBalance: $(125),

    // 3. BooleanEditor (Boolean)
    isVerified: $(true),

    // 4. ColorEditor (Hex String)
    brandColor: $("#1976d2"),

    // 5. DropdownEditor (Array)
    userRoles: $(["Admin", "Editor", "Viewer", "Guest"]),

    // 6. ObjectEditor (Nested Object)
    settings: $({
        notifications: $(true),
        darkMode: $(false),
        fontSize: $(14),
    }),
})

const SampleEditorDemo = () => {
    const props = SampleProps()

    // Helper to extract the nested boolean: settings (observable) -> darkMode (observable)
    const isDark = () => $$($$(props.settings).darkMode)

    return (
        <div class="flex flex-col gap-6 p-10 bg-slate-50 min-h-screen">
            <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                Editor Type Gallery
            </h1>

            <div class="flex flex-col lg:flex-row gap-8">

                {/* --- LIVE COMPONENT PREVIEW (Dark Mode Applied Here) --- */}
                <div class={() => [
                    "flex-1 p-8 rounded-3xl border transition-all duration-500 shadow-sm space-y-6",
                    $$(isDark)
                        ? "bg-slate-900 border-slate-800 shadow-2xl shadow-blue-900/20"
                        : "bg-white border-slate-200 shadow-sm"
                ]}>
                    <h2 class={() => [
                        "text-xs font-bold uppercase tracking-widest transition-colors",
                        $$(isDark) ? "text-slate-500" : "text-slate-400"
                    ]}>
                        Live Component Preview
                    </h2>

                    <div class="space-y-4">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-transform hover:scale-105"
                                style={() => `background-color: ${$$(props.brandColor)}`}
                            >
                                {() => $$(props.username).charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div class={() => [
                                    "text-xl font-bold flex items-center gap-2 transition-colors",
                                    isDark() ? "text-white" : "text-slate-800"
                                ]}>
                                    {props.username}
                                    {() => $$(props.isVerified) && (
                                        <span class="text-blue-500 text-sm">✔</span>
                                    )}
                                </div>
                                <div class="text-sm font-mono text-slate-500">
                                    Balance: <span class={isDark() ? "text-slate-300" : ""}>{props.accountBalance}</span>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-2">
                            <span class={() => [
                                "px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors",
                                isDark() ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"
                            ]}>
                                Role: {() => {
                                    const store = (props.userRoles as any).selectedValue
                                    return store ? $$(store) : props.userRoles[0]
                                }}
                            </span>
                        </div>

                        {/* Nested Settings Preview Box */}
                        <div class={() => [
                            "p-4 rounded-xl border transition-all duration-500",
                            isDark() ? "bg-slate-950/50 border-slate-800" : "bg-slate-50 border-slate-100"
                        ]}>
                            <p class="text-[10px] font-bold text-slate-400 mb-2 uppercase">Sub-Object Status</p>
                            <div class="grid grid-cols-2 gap-2 text-xs">
                                <div class="flex gap-2">
                                    <span class="text-slate-500">Notifications:</span>
                                    <span class={() => $$(isDark) ? "text-blue-400 font-bold" : "text-blue-600 font-bold"}>
                                        {() => $$($$(props.settings).notifications).toString()}
                                    </span>
                                </div>
                                <div class="flex gap-2">
                                    <span class="text-slate-500">Font Size:</span>
                                    <span class={() => $$(isDark) ? "text-blue-400 font-bold" : "text-blue-600 font-bold"}>
                                        {() => $$($$(props.settings).fontSize)}px
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: PROPERTY INSPECTOR (Stays Light) --- */}
                <div class="w-full lg:w-[450px]">
                    <PropertyForm
                        obj={props}
                        class="m-0 shadow-2xl bg-white"
                    />
                </div>
            </div>

            {/* --- BOTTOM: JSON DEBUGGER (Stays Dark/Default) --- */}
            <div class="bg-slate-900 rounded-2xl p-6 shadow-xl">
                <p class="text-blue-400 font-mono text-xs mb-4 font-bold tracking-widest uppercase">
                    Reactive Observable Bridge
                </p>
                <pre class="text-emerald-400 font-mono text-[12px] overflow-auto max-h-[300px]">
                    {() => {
                        const unwrap = (obj) => {
                            const out = {}
                            Object.keys(obj).forEach(k => {
                                const val = $$(obj[k])
                                if (val && typeof val === 'object' && !Array.isArray(val)) {
                                    out[k] = unwrap(val)
                                } else {
                                    out[k] = val
                                }
                            })
                            return out
                        }
                        return JSON.stringify(unwrap(props), null, 2)
                    }}
                </pre>
            </div>
        </div>
    )
}

const SampleEditorDemo_ = () => {
    // Instantiate all editors data
    const props = SampleProps()

    return (
        <div class="flex flex-col gap-6 p-10 bg-slate-50">
            <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                Editor Type Gallery
            </h1>

            <div class="flex flex-col lg:flex-row gap-8">

                {/* LEFT: PREVIEW OF VALUES */}
                <div class="flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Component Preview</h2>

                    <div class="space-y-4">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                                style={() => `background-color: ${$$(props.brandColor)}`}
                            >
                                {() => $$(props.username).charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div class="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    {props.username}
                                    {() => $$(props.isVerified) && (
                                        <span class="text-blue-500 text-sm">✔</span>
                                    )}
                                </div>
                                <div class="text-sm text-slate-500 font-mono">
                                    Balance: {props.accountBalance}
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-2">
                            <span class="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase">
                                Role: {() => {
                                    const store = (props.userRoles as any).selectedValue
                                    return store ? $$(store) : props.userRoles[0]
                                }}
                            </span>
                        </div>

                        <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p class="text-[10px] font-bold text-slate-400 mb-2 uppercase">Sub-Object Status (Settings)</p>
                            <div class="grid grid-cols-2 gap-2 text-xs">
                                <div class="text-slate-500">Notifications: {() => String($$(props.settings).notifications)}</div>
                                <div class="text-slate-500">Font Size: {() => $$(props.settings).fontSize}px</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: PROPERTY INSPECTOR */}
                <div class="w-full lg:w-[450px]">
                    <PropertyForm
                        obj={props}
                        class="m-0 shadow-2xl"
                    />
                </div>
            </div>

            {/* BOTTOM: JSON DEBUGGER */}
            <div class="bg-slate-900 rounded-2xl p-6 shadow-xl">
                <p class="text-blue-400 font-mono text-xs mb-4 font-bold tracking-widest uppercase">
                    Reactive Observable Bridge
                </p>
                <pre class="text-emerald-400 font-mono text-[12px] overflow-auto max-h-[300px]">
                    {() => {
                        // Function to unwrap nested observables for display
                        const unwrap = (obj) => {
                            const out = {}
                            Object.keys(obj).forEach(k => {
                                const val = $$(obj[k])
                                if (val && typeof val === 'object' && !Array.isArray(val)) {
                                    out[k] = unwrap(val)
                                } else {
                                    out[k] = val
                                }
                            })
                            return out
                        }
                        return JSON.stringify(unwrap(props), null, 2)
                    }}
                </pre>
            </div>
        </div>
    )
}

// #region Individual Editor Demo
// BooleanEditor
const BooleanEditorDemo = () => {
    const bool = $(true)
    const props = { bool }

    return (
        <div class="flex flex-col gap-6 p-10 bg-slate-50">
            <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                Boolean Editor Demo
            </h1>
            <div class="flex flex-col lg:flex-row gap-8">

                {/* LEFT: PREVIEW OF VALUES */}
                <div class="flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Component Preview</h2>

                    <div class="space-y-4">
                        <div class="flex items-center gap-4">
                            <pre>Current Value: <span class="border border-gray-200 rounded-md bg-gray-300 px-1 py-2">{() => props.bool.toString()}</span></pre>
                        </div>
                    </div>
                </div>

                {/* RIGHT: PROPERTY INSPECTOR */}
                <div class="w-full lg:w-[450px]">
                    <PropertyForm
                        obj={props}
                        class="m-0 shadow-2xl"
                    />
                </div>
            </div>

            {/* BOTTOM: JSON DEBUGGER */}
            <div class="bg-slate-900 rounded-2xl p-6 shadow-xl">
                <p class="text-blue-400 font-mono text-xs mb-4 font-bold tracking-widest uppercase">
                    Reactive Observable Bridge
                </p>
                <pre class="text-emerald-400 font-mono text-[12px] overflow-auto max-h-[300px]">
                    {() => {
                        // Function to unwrap nested observables for display
                        const unwrap = (obj) => {
                            const out = {}
                            Object.keys(obj).forEach(k => {
                                const val = $$(obj[k])
                                if (val && typeof val === 'object' && !Array.isArray(val)) {
                                    out[k] = unwrap(val)
                                } else {
                                    out[k] = val
                                }
                            })
                            return out
                        }
                        return JSON.stringify(unwrap(props), null, 2)
                    }}
                </pre>
            </div>
        </div>
    )
}

// ColorEditor
const ColorEditorDemo = () => {
    const color = $("#1976d2")
    const props = { color }

    return (
        <div class="flex flex-col gap-6 p-10 bg-slate-50">
            <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                Color Editor Demo
            </h1>
            <div class="flex flex-col lg:flex-row gap-8">

                {/* LEFT: PREVIEW OF VALUES */}
                <div class="flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Component Preview</h2>

                    <div class="space-y-4">
                        <div class="flex items-center gap-4">
                            <pre>Current Value: <span class="border border-gray-200 rounded-md bg-gray-300 px-1 py-2">{props.color}</span></pre>
                        </div>
                    </div>
                </div>

                {/* RIGHT: PROPERTY INSPECTOR */}
                <div class="w-full lg:w-[450px]">
                    <PropertyForm
                        obj={props}
                        class="m-0 shadow-2xl"
                    />
                </div>
            </div>

            {/* BOTTOM: JSON DEBUGGER */}
            <div class="bg-slate-900 rounded-2xl p-6 shadow-xl">
                <p class="text-blue-400 font-mono text-xs mb-4 font-bold tracking-widest uppercase">
                    Reactive Observable Bridge
                </p>
                <pre class="text-emerald-400 font-mono text-[12px] overflow-auto max-h-[300px]">
                    {() => {
                        // Function to unwrap nested observables for display
                        const unwrap = (obj) => {
                            const out = {}
                            Object.keys(obj).forEach(k => {
                                const val = $$(obj[k])
                                if (val && typeof val === 'object' && !Array.isArray(val)) {
                                    out[k] = unwrap(val)
                                } else {
                                    out[k] = val
                                }
                            })
                            return out
                        }
                        return JSON.stringify(unwrap(props), null, 2)
                    }}
                </pre>
            </div>
        </div>
    )
}

// DropDownEditor
const DropdownEditorDemo = () => {
    const dropdown = $(["Admin", "Editor", "Viewer", "Guest"])  // Array triggers DropdownEditor
    //@ts-ignore
    // dropdown.selectedValue = $("Viewer")
    const props = { dropdown }

    return (
        <div class="flex flex-col gap-6 p-10 bg-slate-50">
            <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                Dropdown Editor Demo
            </h1>
            <div class="flex flex-col lg:flex-row gap-8">

                {/* LEFT: PREVIEW OF VALUES */}
                <div class="flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Component Preview</h2>

                    <div class="space-y-4">
                        <div class="flex items-center gap-4">
                            <pre>
                                <p>
                                    Current Value:
                                    <span class="border border-gray-200 rounded-md bg-gray-300 px-1 py-2">
                                        {() => {
                                            const store = (props.dropdown as any).selectedValue
                                            return store ? $$(store) : dropdown[0]
                                        }}
                                    </span>
                                </p>
                            </pre>
                        </div>
                    </div>
                </div>

                {/* RIGHT: PROPERTY INSPECTOR */}
                <div class="w-full lg:w-[450px]">
                    <PropertyForm
                        obj={props}
                        class="m-0 shadow-2xl"
                    />
                </div>
            </div>

            {/* BOTTOM: JSON DEBUGGER */}
            <div class="bg-slate-900 rounded-2xl p-6 shadow-xl">
                <p class="text-blue-400 font-mono text-xs mb-4 font-bold tracking-widest uppercase">
                    Reactive Observable Bridge
                </p>
                <pre class="text-emerald-400 font-mono text-[12px] overflow-auto max-h-[300px]">
                    {() => {
                        // Function to unwrap nested observables for display
                        const unwrap = (obj) => {
                            const out = {}
                            Object.keys(obj).forEach(k => {
                                const val = $$(obj[k])
                                if (val && typeof val === 'object' && !Array.isArray(val)) {
                                    out[k] = unwrap(val)
                                } else {
                                    out[k] = val
                                }
                            })
                            return out
                        }
                        return JSON.stringify(unwrap(props), null, 2)
                    }}
                </pre>
            </div>
        </div>
    )
}

// NumberEditor
const NumberEditorDemo = () => {
    const number = $(1)
    const props = { number }

    return (
        <div class="flex flex-col gap-6 p-10 bg-slate-50">
            <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                Number Editor Demo
            </h1>
            <div class="flex flex-col lg:flex-row gap-8">

                {/* LEFT: PREVIEW OF VALUES */}
                <div class="flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Component Preview</h2>

                    <div class="space-y-4">
                        <div class="flex items-center gap-4">
                            <pre>Current Value: <span class="border border-gray-200 rounded-md bg-gray-300 px-1 py-2">{props.number}</span></pre>
                        </div>
                    </div>
                </div>

                {/* RIGHT: PROPERTY INSPECTOR */}
                <div class="w-full lg:w-[450px]">
                    <PropertyForm
                        obj={props}
                        class="m-0 shadow-2xl"
                    />
                </div>
            </div>

            {/* BOTTOM: JSON DEBUGGER */}
            <div class="bg-slate-900 rounded-2xl p-6 shadow-xl">
                <p class="text-blue-400 font-mono text-xs mb-4 font-bold tracking-widest uppercase">
                    Reactive Observable Bridge
                </p>
                <pre class="text-emerald-400 font-mono text-[12px] overflow-auto max-h-[300px]">
                    {() => {
                        // Function to unwrap nested observables for display
                        const unwrap = (obj) => {
                            const out = {}
                            Object.keys(obj).forEach(k => {
                                const val = $$(obj[k])
                                if (val && typeof val === 'object' && !Array.isArray(val)) {
                                    out[k] = unwrap(val)
                                } else {
                                    out[k] = val
                                }
                            })
                            return out
                        }
                        return JSON.stringify(unwrap(props), null, 2)
                    }}
                </pre>
            </div>
        </div>
    )
}

//ObjectEditor
// const ObjectEditorDemo = () => {
//     const settings = $({ notifications: $(true), darkMode: $(false), fontSize: $(14) })
//     const props = { settings }

//     return (
//         <div class="flex flex-col gap-6 p-10 bg-slate-50">
//             <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tighter">
//                 Number Editor Demo
//             </h1>
//             <div class="flex flex-col lg:flex-row gap-8">

//                 {/* LEFT: PREVIEW OF VALUES */}
//                 <div class="flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
//                     <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Component Preview</h2>

//                     <div class="space-y-4">
//                         <div class="flex items-center gap-4">
//                             <pre>Current Value: <span class="border border-gray-200 rounded-md bg-gray-300 px-1 py-2">{props.settings}</span></pre>
//                         </div>
//                     </div>
//                 </div>

//                 {/* RIGHT: PROPERTY INSPECTOR */}
//                 <div class="w-full lg:w-[450px]">
//                     <PropertyForm
//                         obj={props}
//                         class="m-0 shadow-2xl"
//                     />
//                 </div>
//             </div>

//             {/* BOTTOM: JSON DEBUGGER */}
//             <div class="bg-slate-900 rounded-2xl p-6 shadow-xl">
//                 <p class="text-blue-400 font-mono text-xs mb-4 font-bold tracking-widest uppercase">
//                     Reactive Observable Bridge
//                 </p>
//                 <pre class="text-emerald-400 font-mono text-[12px] overflow-auto max-h-[300px]">
//                     {() => {
//                         // Function to unwrap nested observables for display
//                         const unwrap = (obj) => {
//                             const out = {}
//                             Object.keys(obj).forEach(k => {
//                                 const val = $$(obj[k])
//                                 if (val && typeof val === 'object' && !Array.isArray(val)) {
//                                     out[k] = unwrap(val)
//                                 } else {
//                                     out[k] = val
//                                 }
//                             })
//                             return out
//                         }
//                         return JSON.stringify(unwrap(props), null, 2)
//                     }}
//                 </pre>
//             </div>
//         </div>
//     )
// }

// StringEditor
const StringEditorDemo = () => {
    const string = $("Hello, World!")
    const props = { string }

    return (
        <div class="flex flex-col gap-6 p-10 bg-slate-50">
            <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                String Editor Demo
            </h1>
            <div class="flex flex-col lg:flex-row gap-8">

                {/* LEFT: PREVIEW OF VALUES */}
                <div class="flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Component Preview</h2>

                    <div class="space-y-4">
                        <div class="flex items-center gap-4">
                            <pre>Current Value: <span class="border border-gray-200 rounded-md bg-gray-300 px-1 py-2">{props.string}</span></pre>
                        </div>
                    </div>
                </div>

                {/* RIGHT: PROPERTY INSPECTOR */}
                <div class="w-full lg:w-[450px]">
                    <PropertyForm
                        obj={props}
                        class="m-0 shadow-2xl"
                    />
                </div>
            </div>

            {/* BOTTOM: JSON DEBUGGER */}
            <div class="bg-slate-900 rounded-2xl p-6 shadow-xl">
                <p class="text-blue-400 font-mono text-xs mb-4 font-bold tracking-widest uppercase">
                    Reactive Observable Bridge
                </p>
                <pre class="text-emerald-400 font-mono text-[12px] overflow-auto max-h-[300px]">
                    {() => {
                        // Function to unwrap nested observables for display
                        const unwrap = (obj) => {
                            const out = {}
                            Object.keys(obj).forEach(k => {
                                const val = $$(obj[k])
                                if (val && typeof val === 'object' && !Array.isArray(val)) {
                                    out[k] = unwrap(val)
                                } else {
                                    out[k] = val
                                }
                            })
                            return out
                        }
                        return JSON.stringify(unwrap(props), null, 2)
                    }}
                </pre>
            </div>
        </div>
    )
}
// #endregion

// EditorDemo
const EditorDemo = () => {

    const bool = $(true)
    const color = $("#1976d2")
    const dropdown = $(["Admin", "Editor", "Viewer", "Guest"])
    const number = $(123)
    const settings = $({ boolean: $(true), str: $("Hello World!"), num: $(14), selection: $(["Admin", "Editor", "Viewer", "Guest"]) })
    const string = $("Hello, World!")

    const props = { bool, color, dropdown, number, settings, string }


    return (
        <div class="flex flex-col gap-6 p-10 bg-slate-50">
            <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                Editor Demo
            </h1>
            <div class="flex flex-col lg:flex-row gap-8">

                {/* LEFT: PREVIEW OF VALUES */}
                <div class="flex-1 bg-gradient-to-br from-white to-slate-50 p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6">
                    <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Live Component Preview</h2>

                    <div class="space-y-3">
                        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                            <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                Current Values
                            </p>
                            <div class="space-y-3">
                                {/* Boolean Editor */}
                                <div class="flex items-center justify-between bg-white/60 backdrop-blur-sm px-4 py-3 rounded-lg hover:shadow-md transition-all">
                                    <span class="text-sm font-semibold text-slate-700">Bool</span>
                                    <span class="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg font-mono text-sm font-medium">{() => props.bool.toString()}</span>
                                </div>

                                {/* Color Editor */}
                                <div class="flex items-center justify-between bg-white/60 backdrop-blur-sm px-4 py-3 rounded-lg hover:shadow-md transition-all">
                                    <span class="text-sm font-semibold text-slate-700">Color</span>
                                    <div class="flex items-center gap-2">
                                        <div class="w-6 h-6 rounded-md border-2 border-white shadow-sm" style={() => `background-color: ${$$(props.color)}`}></div>
                                        <span class="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg font-mono text-sm font-medium">{props.color}</span>
                                    </div>
                                </div>

                                {/* Dropdown Editor */}
                                <div class="flex items-center justify-between bg-white/60 backdrop-blur-sm px-4 py-3 rounded-lg hover:shadow-md transition-all">
                                    <span class="text-sm font-semibold text-slate-700">Dropdown</span>
                                    <span class="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg font-mono text-sm font-medium">
                                        {() => {
                                            const store = (props.dropdown as any).selectedValue
                                            return store ? $$(store) : props.dropdown[0]
                                        }}
                                    </span>
                                </div>

                                {/* Number Editor */}
                                <div class="flex items-center justify-between bg-white/60 backdrop-blur-sm px-4 py-3 rounded-lg hover:shadow-md transition-all">
                                    <span class="text-sm font-semibold text-slate-700">Number</span>
                                    <span class="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg font-mono text-sm font-medium">{props.number}</span>
                                </div>

                                {/* Settings Group Editor */}
                                <div class="flex flex-col bg-white/60 backdrop-blur-sm p-4 rounded-lg hover:shadow-md transition-all">
                                    <div class="flex items-center justify-between mb-3">
                                        <span class="text-sm font-semibold text-slate-700">Settings Group</span>
                                        <span class="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full font-bold uppercase tracking-tighter">Object</span>
                                    </div>

                                    <div class="grid grid-cols-1 gap-2 border-l-2 border-slate-200 ml-1 pl-4">
                                        {() => {
                                            const s = $$(props.settings);
                                            return (
                                                <>
                                                    {/* Nested Boolean */}
                                                    <div class="flex justify-between items-center">
                                                        <span class="text-xs text-slate-500 font-medium italic">boolean:</span>
                                                        <span class={`text-[11px] font-bold ${$$(s.boolean) ? 'text-blue-600' : 'text-slate-400'}`}>
                                                            {$$(s.boolean).toString().toUpperCase()}
                                                        </span>
                                                    </div>

                                                    {/* Nested String */}
                                                    <div class="flex justify-between items-center">
                                                        <span class="text-xs text-slate-500 font-medium italic">str:</span>
                                                        <span class="text-[11px] font-mono text-teal-600 bg-teal-50 px-1.5 rounded">
                                                            "{$$(s.str)}"
                                                        </span>
                                                    </div>

                                                    {/* Nested Number */}
                                                    <div class="flex justify-between items-center">
                                                        <span class="text-xs text-slate-500 font-medium italic">num:</span>
                                                        <span class="text-[11px] font-mono text-amber-600">
                                                            {$$(s.num)}
                                                        </span>
                                                    </div>

                                                    {/* Nested Selection (Array) */}
                                                    <div class="flex justify-between items-center">
                                                        <span class="text-xs text-slate-500 font-medium italic">selection:</span>
                                                        <span class="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">
                                                            {() => {
                                                                const list = $$(s.selection);
                                                                const store = (list as any).selectedValue;
                                                                return store ? $$(store) : list[0];
                                                            }}
                                                        </span>
                                                    </div>
                                                </>
                                            )
                                        }}
                                    </div>
                                </div>

                                {/* String Editor */}
                                <div class="flex items-center justify-between bg-white/60 backdrop-blur-sm px-4 py-3 rounded-lg hover:shadow-md transition-all">
                                    <span class="text-sm font-semibold text-slate-700">String</span>
                                    <span class="px-3 py-1.5 bg-teal-100 text-teal-800 rounded-lg font-mono text-sm font-medium">{props.string}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: PROPERTY INSPECTOR */}
                <div class="w-full lg:w-[450px]">
                    <PropertyForm obj={props} class="m-0 shadow-2xl" />
                </div>
            </div>

            {/* BOTTOM: JSON DEBUGGER */}
            <div class="bg-slate-900 rounded-2xl p-6 shadow-xl">
                <p class="text-blue-400 font-mono text-xs mb-4 font-bold tracking-widest uppercase">
                    Reactive Observable Bridge
                </p>
                <pre class="text-emerald-400 font-mono text-[12px] overflow-auto max-h-[300px]">
                    {() => {
                        // Function to unwrap nested observables for display
                        const unwrap = (obj) => {
                            const out = {}
                            Object.keys(obj).forEach(k => {
                                const val = $$(obj[k])
                                if (val && typeof val === 'object' && !Array.isArray(val)) {
                                    out[k] = unwrap(val)
                                } else {
                                    out[k] = val
                                }
                            })
                            return out
                        }
                        return JSON.stringify(unwrap(props), null, 2)
                    }}
                </pre>
            </div>
        </div>
    )
}

export {
    // Demo,
    // DynamicDemo,
    // DynamicTestDemo,
    SampleEditorDemo,

    // BooleanEditorDemo,
    // ColorEditorDemo,
    // DropdownEditorDemo,
    // NumberEditorDemo,
    // ObjectEditorDemo,
    // StringEditorDemo,

    // EditorDemo,

    // WheelerDemo,
    // MultiWheelerDemo,

}
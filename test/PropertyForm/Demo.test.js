import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "woby/jsx-runtime";
/** @jsxImportSource woby */
import { PropertyForm } from "../../src/PropertyForm/PropertyForm";
// IMPORTANT: import editors at least once so they register into Editors[]
import "../../src/PropertyForm/BooleanEditor"; // true or false
import "../../src/PropertyForm/StringEditor"; // text input
import "../../src/PropertyForm/NumberEditor"; // number input
import "../../src/PropertyForm/DropdownEditor"; // dropdown select
import "../../src/PropertyForm/ColorEditor"; // color picker
import "../../src/PropertyForm/ObjectEditor"; // object editor
import { $, $$ } from "woby";
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
});
const SampleEditorDemo = () => {
    const props = SampleProps();
    // Helper to extract the nested boolean: settings (observable) -> darkMode (observable)
    const isDark = () => $$($$(props.settings).darkMode);
    return (_jsxs("div", { class: "flex flex-col gap-6 p-10 bg-slate-50 min-h-screen", children: [_jsx("h1", { class: "text-2xl font-black text-slate-800 uppercase tracking-tighter", children: "Editor Type Gallery" }), _jsxs("div", { class: "flex flex-col lg:flex-row gap-8", children: [_jsxs("div", { class: () => [
                            "flex-1 p-8 rounded-3xl border transition-all duration-500 shadow-sm space-y-6",
                            $$(isDark)
                                ? "bg-slate-900 border-slate-800 shadow-2xl shadow-blue-900/20"
                                : "bg-white border-slate-200 shadow-sm"
                        ], children: [_jsx("h2", { class: () => [
                                    "text-xs font-bold uppercase tracking-widest transition-colors",
                                    $$(isDark) ? "text-slate-500" : "text-slate-400"
                                ], children: "Live Component Preview" }), _jsxs("div", { class: "space-y-4", children: [_jsxs("div", { class: "flex items-center gap-4", children: [_jsx("div", { class: "w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-transform hover:scale-105", style: () => `background-color: ${$$(props.brandColor)}`, children: () => $$(props.username).charAt(0).toUpperCase() }), _jsxs("div", { children: [_jsxs("div", { class: () => [
                                                            "text-xl font-bold flex items-center gap-2 transition-colors",
                                                            isDark() ? "text-white" : "text-slate-800"
                                                        ], children: [props.username, () => $$(props.isVerified) && (_jsx("span", { class: "text-blue-500 text-sm", children: "\u2714" }))] }), _jsxs("div", { class: "text-sm font-mono text-slate-500", children: ["Balance: ", _jsx("span", { class: isDark() ? "text-slate-300" : "", children: props.accountBalance })] })] })] }), _jsx("div", { class: "flex gap-2", children: _jsxs("span", { class: () => [
                                                "px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors",
                                                isDark() ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"
                                            ], children: ["Role: ", () => {
                                                    const store = props.userRoles.selectedValue;
                                                    return store ? $$(store) : props.userRoles[0];
                                                }] }) }), _jsxs("div", { class: () => [
                                            "p-4 rounded-xl border transition-all duration-500",
                                            isDark() ? "bg-slate-950/50 border-slate-800" : "bg-slate-50 border-slate-100"
                                        ], children: [_jsx("p", { class: "text-[10px] font-bold text-slate-400 mb-2 uppercase", children: "Sub-Object Status" }), _jsxs("div", { class: "grid grid-cols-2 gap-2 text-xs", children: [_jsxs("div", { class: "flex gap-2", children: [_jsx("span", { class: "text-slate-500", children: "Notifications:" }), _jsx("span", { class: () => $$(isDark) ? "text-blue-400 font-bold" : "text-blue-600 font-bold", children: () => $$($$(props.settings).notifications).toString() })] }), _jsxs("div", { class: "flex gap-2", children: [_jsx("span", { class: "text-slate-500", children: "Font Size:" }), _jsxs("span", { class: () => $$(isDark) ? "text-blue-400 font-bold" : "text-blue-600 font-bold", children: [() => $$($$(props.settings).fontSize), "px"] })] })] })] })] })] }), _jsx("div", { class: "w-full lg:w-[450px]", children: _jsx(PropertyForm, { obj: props, class: "m-0 shadow-2xl bg-white" }) })] }), _jsxs("div", { class: "bg-slate-900 rounded-2xl p-6 shadow-xl", children: [_jsx("p", { class: "text-blue-400 font-mono text-xs mb-4 font-bold tracking-widest uppercase", children: "Reactive Observable Bridge" }), _jsx("pre", { class: "text-emerald-400 font-mono text-[12px] overflow-auto max-h-[300px]", children: () => {
                            const unwrap = (obj) => {
                                const out = {};
                                Object.keys(obj).forEach(k => {
                                    const val = $$(obj[k]);
                                    if (val && typeof val === 'object' && !Array.isArray(val)) {
                                        out[k] = unwrap(val);
                                    }
                                    else {
                                        out[k] = val;
                                    }
                                });
                                return out;
                            };
                            return JSON.stringify(unwrap(props), null, 2);
                        } })] })] }));
};
const SampleEditorDemo_ = () => {
    // Instantiate all editors data
    const props = SampleProps();
    return (_jsxs("div", { class: "flex flex-col gap-6 p-10 bg-slate-50", children: [_jsx("h1", { class: "text-2xl font-black text-slate-800 uppercase tracking-tighter", children: "Editor Type Gallery" }), _jsxs("div", { class: "flex flex-col lg:flex-row gap-8", children: [_jsxs("div", { class: "flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6", children: [_jsx("h2", { class: "text-xs font-bold text-slate-400 uppercase tracking-widest", children: "Live Component Preview" }), _jsxs("div", { class: "space-y-4", children: [_jsxs("div", { class: "flex items-center gap-4", children: [_jsx("div", { class: "w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg", style: () => `background-color: ${$$(props.brandColor)}`, children: () => $$(props.username).charAt(0).toUpperCase() }), _jsxs("div", { children: [_jsxs("div", { class: "text-xl font-bold text-slate-800 flex items-center gap-2", children: [props.username, () => $$(props.isVerified) && (_jsx("span", { class: "text-blue-500 text-sm", children: "\u2714" }))] }), _jsxs("div", { class: "text-sm text-slate-500 font-mono", children: ["Balance: ", props.accountBalance] })] })] }), _jsx("div", { class: "flex gap-2", children: _jsxs("span", { class: "px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 uppercase", children: ["Role: ", () => {
                                                    const store = props.userRoles.selectedValue;
                                                    return store ? $$(store) : props.userRoles[0];
                                                }] }) }), _jsxs("div", { class: "p-4 bg-slate-50 rounded-xl border border-slate-100", children: [_jsx("p", { class: "text-[10px] font-bold text-slate-400 mb-2 uppercase", children: "Sub-Object Status (Settings)" }), _jsxs("div", { class: "grid grid-cols-2 gap-2 text-xs", children: [_jsxs("div", { class: "text-slate-500", children: ["Notifications: ", () => String($$(props.settings).notifications)] }), _jsxs("div", { class: "text-slate-500", children: ["Font Size: ", () => $$(props.settings).fontSize, "px"] })] })] })] })] }), _jsx("div", { class: "w-full lg:w-[450px]", children: _jsx(PropertyForm, { obj: props, class: "m-0 shadow-2xl" }) })] }), _jsxs("div", { class: "bg-slate-900 rounded-2xl p-6 shadow-xl", children: [_jsx("p", { class: "text-blue-400 font-mono text-xs mb-4 font-bold tracking-widest uppercase", children: "Reactive Observable Bridge" }), _jsx("pre", { class: "text-emerald-400 font-mono text-[12px] overflow-auto max-h-[300px]", children: () => {
                            // Function to unwrap nested observables for display
                            const unwrap = (obj) => {
                                const out = {};
                                Object.keys(obj).forEach(k => {
                                    const val = $$(obj[k]);
                                    if (val && typeof val === 'object' && !Array.isArray(val)) {
                                        out[k] = unwrap(val);
                                    }
                                    else {
                                        out[k] = val;
                                    }
                                });
                                return out;
                            };
                            return JSON.stringify(unwrap(props), null, 2);
                        } })] })] }));
};
// #region Individual Editor Demo
// BooleanEditor
const BooleanEditorDemo = () => {
    const bool = $(true);
    const props = { bool };
    return (_jsxs("div", { class: "flex flex-col gap-6 p-10 bg-slate-50", children: [_jsx("h1", { class: "text-2xl font-black text-slate-800 uppercase tracking-tighter", children: "Boolean Editor Demo" }), _jsxs("div", { class: "flex flex-col lg:flex-row gap-8", children: [_jsxs("div", { class: "flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6", children: [_jsx("h2", { class: "text-xs font-bold text-slate-400 uppercase tracking-widest", children: "Live Component Preview" }), _jsx("div", { class: "space-y-4", children: _jsx("div", { class: "flex items-center gap-4", children: _jsxs("pre", { children: ["Current Value: ", _jsx("span", { class: "border border-gray-200 rounded-md bg-gray-300 px-1 py-2", children: () => props.bool.toString() })] }) }) })] }), _jsx("div", { class: "w-full lg:w-[450px]", children: _jsx(PropertyForm, { obj: props, class: "m-0 shadow-2xl" }) })] }), _jsxs("div", { class: "bg-slate-900 rounded-2xl p-6 shadow-xl", children: [_jsx("p", { class: "text-blue-400 font-mono text-xs mb-4 font-bold tracking-widest uppercase", children: "Reactive Observable Bridge" }), _jsx("pre", { class: "text-emerald-400 font-mono text-[12px] overflow-auto max-h-[300px]", children: () => {
                            // Function to unwrap nested observables for display
                            const unwrap = (obj) => {
                                const out = {};
                                Object.keys(obj).forEach(k => {
                                    const val = $$(obj[k]);
                                    if (val && typeof val === 'object' && !Array.isArray(val)) {
                                        out[k] = unwrap(val);
                                    }
                                    else {
                                        out[k] = val;
                                    }
                                });
                                return out;
                            };
                            return JSON.stringify(unwrap(props), null, 2);
                        } })] })] }));
};
// ColorEditor
const ColorEditorDemo = () => {
    const color = $("#1976d2");
    const props = { color };
    return (_jsxs("div", { class: "flex flex-col gap-6 p-10 bg-slate-50", children: [_jsx("h1", { class: "text-2xl font-black text-slate-800 uppercase tracking-tighter", children: "Color Editor Demo" }), _jsxs("div", { class: "flex flex-col lg:flex-row gap-8", children: [_jsxs("div", { class: "flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6", children: [_jsx("h2", { class: "text-xs font-bold text-slate-400 uppercase tracking-widest", children: "Live Component Preview" }), _jsx("div", { class: "space-y-4", children: _jsx("div", { class: "flex items-center gap-4", children: _jsxs("pre", { children: ["Current Value: ", _jsx("span", { class: "border border-gray-200 rounded-md bg-gray-300 px-1 py-2", children: props.color })] }) }) })] }), _jsx("div", { class: "w-full lg:w-[450px]", children: _jsx(PropertyForm, { obj: props, class: "m-0 shadow-2xl" }) })] }), _jsxs("div", { class: "bg-slate-900 rounded-2xl p-6 shadow-xl", children: [_jsx("p", { class: "text-blue-400 font-mono text-xs mb-4 font-bold tracking-widest uppercase", children: "Reactive Observable Bridge" }), _jsx("pre", { class: "text-emerald-400 font-mono text-[12px] overflow-auto max-h-[300px]", children: () => {
                            // Function to unwrap nested observables for display
                            const unwrap = (obj) => {
                                const out = {};
                                Object.keys(obj).forEach(k => {
                                    const val = $$(obj[k]);
                                    if (val && typeof val === 'object' && !Array.isArray(val)) {
                                        out[k] = unwrap(val);
                                    }
                                    else {
                                        out[k] = val;
                                    }
                                });
                                return out;
                            };
                            return JSON.stringify(unwrap(props), null, 2);
                        } })] })] }));
};
// DropDownEditor
const DropdownEditorDemo = () => {
    const dropdown = $(["Admin", "Editor", "Viewer", "Guest"]); // Array triggers DropdownEditor
    //@ts-ignore
    // dropdown.selectedValue = $("Viewer")
    const props = { dropdown };
    return (_jsxs("div", { class: "flex flex-col gap-6 p-10 bg-slate-50", children: [_jsx("h1", { class: "text-2xl font-black text-slate-800 uppercase tracking-tighter", children: "Dropdown Editor Demo" }), _jsxs("div", { class: "flex flex-col lg:flex-row gap-8", children: [_jsxs("div", { class: "flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6", children: [_jsx("h2", { class: "text-xs font-bold text-slate-400 uppercase tracking-widest", children: "Live Component Preview" }), _jsx("div", { class: "space-y-4", children: _jsx("div", { class: "flex items-center gap-4", children: _jsx("pre", { children: _jsxs("p", { children: ["Current Value:", _jsx("span", { class: "border border-gray-200 rounded-md bg-gray-300 px-1 py-2", children: () => {
                                                        const store = props.dropdown.selectedValue;
                                                        return store ? $$(store) : dropdown[0];
                                                    } })] }) }) }) })] }), _jsx("div", { class: "w-full lg:w-[450px]", children: _jsx(PropertyForm, { obj: props, class: "m-0 shadow-2xl" }) })] }), _jsxs("div", { class: "bg-slate-900 rounded-2xl p-6 shadow-xl", children: [_jsx("p", { class: "text-blue-400 font-mono text-xs mb-4 font-bold tracking-widest uppercase", children: "Reactive Observable Bridge" }), _jsx("pre", { class: "text-emerald-400 font-mono text-[12px] overflow-auto max-h-[300px]", children: () => {
                            // Function to unwrap nested observables for display
                            const unwrap = (obj) => {
                                const out = {};
                                Object.keys(obj).forEach(k => {
                                    const val = $$(obj[k]);
                                    if (val && typeof val === 'object' && !Array.isArray(val)) {
                                        out[k] = unwrap(val);
                                    }
                                    else {
                                        out[k] = val;
                                    }
                                });
                                return out;
                            };
                            return JSON.stringify(unwrap(props), null, 2);
                        } })] })] }));
};
// NumberEditor
const NumberEditorDemo = () => {
    const number = $(1);
    const props = { number };
    return (_jsxs("div", { class: "flex flex-col gap-6 p-10 bg-slate-50", children: [_jsx("h1", { class: "text-2xl font-black text-slate-800 uppercase tracking-tighter", children: "Number Editor Demo" }), _jsxs("div", { class: "flex flex-col lg:flex-row gap-8", children: [_jsxs("div", { class: "flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6", children: [_jsx("h2", { class: "text-xs font-bold text-slate-400 uppercase tracking-widest", children: "Live Component Preview" }), _jsx("div", { class: "space-y-4", children: _jsx("div", { class: "flex items-center gap-4", children: _jsxs("pre", { children: ["Current Value: ", _jsx("span", { class: "border border-gray-200 rounded-md bg-gray-300 px-1 py-2", children: props.number })] }) }) })] }), _jsx("div", { class: "w-full lg:w-[450px]", children: _jsx(PropertyForm, { obj: props, class: "m-0 shadow-2xl" }) })] }), _jsxs("div", { class: "bg-slate-900 rounded-2xl p-6 shadow-xl", children: [_jsx("p", { class: "text-blue-400 font-mono text-xs mb-4 font-bold tracking-widest uppercase", children: "Reactive Observable Bridge" }), _jsx("pre", { class: "text-emerald-400 font-mono text-[12px] overflow-auto max-h-[300px]", children: () => {
                            // Function to unwrap nested observables for display
                            const unwrap = (obj) => {
                                const out = {};
                                Object.keys(obj).forEach(k => {
                                    const val = $$(obj[k]);
                                    if (val && typeof val === 'object' && !Array.isArray(val)) {
                                        out[k] = unwrap(val);
                                    }
                                    else {
                                        out[k] = val;
                                    }
                                });
                                return out;
                            };
                            return JSON.stringify(unwrap(props), null, 2);
                        } })] })] }));
};
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
    const string = $("Hello, World!");
    const props = { string };
    return (_jsxs("div", { class: "flex flex-col gap-6 p-10 bg-slate-50", children: [_jsx("h1", { class: "text-2xl font-black text-slate-800 uppercase tracking-tighter", children: "String Editor Demo" }), _jsxs("div", { class: "flex flex-col lg:flex-row gap-8", children: [_jsxs("div", { class: "flex-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6", children: [_jsx("h2", { class: "text-xs font-bold text-slate-400 uppercase tracking-widest", children: "Live Component Preview" }), _jsx("div", { class: "space-y-4", children: _jsx("div", { class: "flex items-center gap-4", children: _jsxs("pre", { children: ["Current Value: ", _jsx("span", { class: "border border-gray-200 rounded-md bg-gray-300 px-1 py-2", children: props.string })] }) }) })] }), _jsx("div", { class: "w-full lg:w-[450px]", children: _jsx(PropertyForm, { obj: props, class: "m-0 shadow-2xl" }) })] }), _jsxs("div", { class: "bg-slate-900 rounded-2xl p-6 shadow-xl", children: [_jsx("p", { class: "text-blue-400 font-mono text-xs mb-4 font-bold tracking-widest uppercase", children: "Reactive Observable Bridge" }), _jsx("pre", { class: "text-emerald-400 font-mono text-[12px] overflow-auto max-h-[300px]", children: () => {
                            // Function to unwrap nested observables for display
                            const unwrap = (obj) => {
                                const out = {};
                                Object.keys(obj).forEach(k => {
                                    const val = $$(obj[k]);
                                    if (val && typeof val === 'object' && !Array.isArray(val)) {
                                        out[k] = unwrap(val);
                                    }
                                    else {
                                        out[k] = val;
                                    }
                                });
                                return out;
                            };
                            return JSON.stringify(unwrap(props), null, 2);
                        } })] })] }));
};
// #endregion
// EditorDemo
const EditorDemo = () => {
    const bool = $(true);
    const color = $("#1976d2");
    const dropdown = $(["Admin", "Editor", "Viewer", "Guest"]);
    const number = $(123);
    const settings = $({ boolean: $(true), str: $("Hello World!"), num: $(14), selection: $(["Admin", "Editor", "Viewer", "Guest"]) });
    const string = $("Hello, World!");
    const props = { bool, color, dropdown, number, settings, string };
    return (_jsxs("div", { class: "flex flex-col gap-6 p-10 bg-slate-50", children: [_jsx("h1", { class: "text-2xl font-black text-slate-800 uppercase tracking-tighter", children: "Editor Demo" }), _jsxs("div", { class: "flex flex-col lg:flex-row gap-8", children: [_jsxs("div", { class: "flex-1 bg-gradient-to-br from-white to-slate-50 p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6", children: [_jsx("h2", { class: "text-xs font-bold text-slate-400 uppercase tracking-widest mb-4", children: "Live Component Preview" }), _jsx("div", { class: "space-y-3", children: _jsxs("div", { class: "bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100", children: [_jsxs("p", { class: "text-xs font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2", children: [_jsx("span", { class: "w-1.5 h-1.5 bg-blue-500 rounded-full" }), "Current Values"] }), _jsxs("div", { class: "space-y-3", children: [_jsxs("div", { class: "flex items-center justify-between bg-white/60 backdrop-blur-sm px-4 py-3 rounded-lg hover:shadow-md transition-all", children: [_jsx("span", { class: "text-sm font-semibold text-slate-700", children: "Bool" }), _jsx("span", { class: "px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg font-mono text-sm font-medium", children: () => props.bool.toString() })] }), _jsxs("div", { class: "flex items-center justify-between bg-white/60 backdrop-blur-sm px-4 py-3 rounded-lg hover:shadow-md transition-all", children: [_jsx("span", { class: "text-sm font-semibold text-slate-700", children: "Color" }), _jsxs("div", { class: "flex items-center gap-2", children: [_jsx("div", { class: "w-6 h-6 rounded-md border-2 border-white shadow-sm", style: () => `background-color: ${$$(props.color)}` }), _jsx("span", { class: "px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg font-mono text-sm font-medium", children: props.color })] })] }), _jsxs("div", { class: "flex items-center justify-between bg-white/60 backdrop-blur-sm px-4 py-3 rounded-lg hover:shadow-md transition-all", children: [_jsx("span", { class: "text-sm font-semibold text-slate-700", children: "Dropdown" }), _jsx("span", { class: "px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg font-mono text-sm font-medium", children: () => {
                                                                const store = props.dropdown.selectedValue;
                                                                return store ? $$(store) : props.dropdown[0];
                                                            } })] }), _jsxs("div", { class: "flex items-center justify-between bg-white/60 backdrop-blur-sm px-4 py-3 rounded-lg hover:shadow-md transition-all", children: [_jsx("span", { class: "text-sm font-semibold text-slate-700", children: "Number" }), _jsx("span", { class: "px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg font-mono text-sm font-medium", children: props.number })] }), _jsxs("div", { class: "flex flex-col bg-white/60 backdrop-blur-sm p-4 rounded-lg hover:shadow-md transition-all", children: [_jsxs("div", { class: "flex items-center justify-between mb-3", children: [_jsx("span", { class: "text-sm font-semibold text-slate-700", children: "Settings Group" }), _jsx("span", { class: "text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full font-bold uppercase tracking-tighter", children: "Object" })] }), _jsx("div", { class: "grid grid-cols-1 gap-2 border-l-2 border-slate-200 ml-1 pl-4", children: () => {
                                                                const s = $$(props.settings);
                                                                return (_jsxs(_Fragment, { children: [_jsxs("div", { class: "flex justify-between items-center", children: [_jsx("span", { class: "text-xs text-slate-500 font-medium italic", children: "boolean:" }), _jsx("span", { class: `text-[11px] font-bold ${$$(s.boolean) ? 'text-blue-600' : 'text-slate-400'}`, children: $$(s.boolean).toString().toUpperCase() })] }), _jsxs("div", { class: "flex justify-between items-center", children: [_jsx("span", { class: "text-xs text-slate-500 font-medium italic", children: "str:" }), _jsxs("span", { class: "text-[11px] font-mono text-teal-600 bg-teal-50 px-1.5 rounded", children: ["\"", $$(s.str), "\""] })] }), _jsxs("div", { class: "flex justify-between items-center", children: [_jsx("span", { class: "text-xs text-slate-500 font-medium italic", children: "num:" }), _jsx("span", { class: "text-[11px] font-mono text-amber-600", children: $$(s.num) })] }), _jsxs("div", { class: "flex justify-between items-center", children: [_jsx("span", { class: "text-xs text-slate-500 font-medium italic", children: "selection:" }), _jsx("span", { class: "text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded", children: () => {
                                                                                        const list = $$(s.selection);
                                                                                        const store = list.selectedValue;
                                                                                        return store ? $$(store) : list[0];
                                                                                    } })] })] }));
                                                            } })] }), _jsxs("div", { class: "flex items-center justify-between bg-white/60 backdrop-blur-sm px-4 py-3 rounded-lg hover:shadow-md transition-all", children: [_jsx("span", { class: "text-sm font-semibold text-slate-700", children: "String" }), _jsx("span", { class: "px-3 py-1.5 bg-teal-100 text-teal-800 rounded-lg font-mono text-sm font-medium", children: props.string })] })] })] }) })] }), _jsx("div", { class: "w-full lg:w-[450px]", children: _jsx(PropertyForm, { obj: props, class: "m-0 shadow-2xl" }) })] }), _jsxs("div", { class: "bg-slate-900 rounded-2xl p-6 shadow-xl", children: [_jsx("p", { class: "text-blue-400 font-mono text-xs mb-4 font-bold tracking-widest uppercase", children: "Reactive Observable Bridge" }), _jsx("pre", { class: "text-emerald-400 font-mono text-[12px] overflow-auto max-h-[300px]", children: () => {
                            // Function to unwrap nested observables for display
                            const unwrap = (obj) => {
                                const out = {};
                                Object.keys(obj).forEach(k => {
                                    const val = $$(obj[k]);
                                    if (val && typeof val === 'object' && !Array.isArray(val)) {
                                        out[k] = unwrap(val);
                                    }
                                    else {
                                        out[k] = val;
                                    }
                                });
                                return out;
                            };
                            return JSON.stringify(unwrap(props), null, 2);
                        } })] })] }));
};
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
 };

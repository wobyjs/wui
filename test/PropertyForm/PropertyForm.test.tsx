/** @jsxImportSource woby */

import { $ } from "woby"

// Import editors so they register into the global Editors array
import "../src/PropertyForm/BooleanEditor"
import "../src/PropertyForm/StringEditor"
import "../src/PropertyForm/NumberEditor"
import "../src/PropertyForm/DropdownEditor"
import "../src/PropertyForm/ColorEditor"
import "../src/PropertyForm/ObjectEditor"

// Import the component (registers custom element too)
import { PropertyForm } from "../src/PropertyForm/PropertyForm"

const SampleProps = () => ({
    username: $("JohnDoe_99"),
    accountBalance: $(125),
    isVerified: $(true),
    brandColor: $("#1976d2"),
    userRoles: $(["Admin", "Editor", "Viewer", "Guest"]),
    settings: $({
        notifications: $(true),
        darkMode: $(false),
        fontSize: $(14),
    }),
})

// TSX usage — renders as JSX component
const PropertyFormDemo = () => {
    const props = SampleProps()

    return (
        <div class="flex flex-col gap-6 p-10 bg-slate-50 min-h-screen">
            <h1 class="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                PropertyForm Custom Element Test
            </h1>

            {/* TSX (JSX) Component Test */}
            <div class="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
                <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    TSX Component
                </h2>
                <PropertyForm obj={props} />
            </div>

            {/* Custom Element Test — obj assigned via JS */}
            <div class="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
                <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Custom Element (wui-property-form)
                </h2>
                <wui-property-form id="custom-el-test"></wui-property-form>
            </div>

            {/* Dynamic reactivity test */}
            <div class="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
                <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Dynamic Update Test
                </h2>
                <wui-property-form id="dynamic-test"></wui-property-form>
                <div class="flex gap-4 mt-4">
                    <button
                        id="change-username-btn"
                        class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors"
                    >
                        Change Username
                    </button>
                    <button
                        id="toggle-verified-btn"
                        class="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 transition-colors"
                    >
                        Toggle Verified
                    </button>
                </div>
            </div>

            {/* PropertyRows Custom Element Test */}
            <div class="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
                <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    PropertyRows Custom Element (wui-property-rows)
                </h2>
                <wui-property-rows id="rows-test"></wui-property-rows>
            </div>
        </div>
    )
}

// Script to assign obj to custom elements (since obj can't be an HTML attribute)
const initCustomElements = () => {
    const props = SampleProps()

    // Assign obj to the custom element
    const customEl = document.getElementById('custom-el-test') as any
    if (customEl) {
        customEl.obj = props
    }

    // Dynamic test: assign obj + set up reactive mutation buttons
    const dynamicEl = document.getElementById('dynamic-test') as any
    if (dynamicEl) {
        dynamicEl.obj = props
    }

    // Set up mutation buttons
    const usernameBtn = document.getElementById('change-username-btn')
    if (usernameBtn) {
        usernameBtn.addEventListener('click', () => {
            props.username('JaneDoe_' + Math.floor(Math.random() * 100))
        })
    }

    const toggleBtn = document.getElementById('toggle-verified-btn')
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            props.isVerified(!props.isVerified())
        })
    }

    // PropertyRows test
    const rowsEl = document.getElementById('rows-test') as any
    if (rowsEl) {
        const rowsProps = {
            username: $("RowUser"),
            score: $(42),
            active: $(false),
        }
        rowsEl.obj = rowsProps
    }
}

// Run after DOM is ready
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCustomElements)
    } else {
        initCustomElements()
    }
}

export { PropertyFormDemo }
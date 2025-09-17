import { $, $$, JSX, Observable } from 'woby'
import { Button } from '../Button'
import { EditorContext, useUndoRedo } from './undoredo'
import { useOnClickOutside } from '@woby/use'

// Icons - placeholders, replace with actual SVGs or components
const AlignLeftIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-4h18V3H3v2z"></path></svg>
const AlignCenterIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 21h10v-2H7v2zm-4-4h18v-2H3v2zm4-4h10v-2H7v2zm-4-4h18V7H3v2zm4-4h10V3H7v2z"></path></svg>
const AlignRightIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-4h18V3H3v2z" transform="scale(-1, 1) translate(-24, 0)"></path></svg> // Flipped
const AlignJustifyIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-4h18V3H3v2z"></path></svg> // Same as left for placeholder
const OutdentIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-4h18V3H3v2zM11 7H3V3h8v4zm0 14H3v-4h8v4z"></path></svg> // Simplified
const IndentIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-4h18V3H3v2zm8 0v4h10V3H11zm0 14v4h10v-4H11z"></path></svg> // Simplified


const applyAlignment = (command: string) => {
    document.execCommand(command, false)
}

interface AlignmentOptionItem {
    label: string
    hotkey: string
    action: () => void
    icon: () => JSX.Element
    type?: undefined // Ensure type is not 'divider'
}

interface DividerOptionItem {
    type: 'divider'
    // Ensure other properties are not present or are optional and undefined
    label?: undefined
    hotkey?: undefined
    action?: undefined
    icon?: undefined
}

type AlignmentOption = AlignmentOptionItem | DividerOptionItem

// Note: 'Start Align' and 'End Align' are context-dependent (LTR/RTL).
// For simplicity, mapping to Left/Right.
const alignmentOptions: AlignmentOption[] = [
    { label: 'Left Align', hotkey: 'Ctrl+Shift+L', action: () => applyAlignment('justifyLeft'), icon: AlignLeftIcon },
    { label: 'Center Align', hotkey: 'Ctrl+Shift+E', action: () => applyAlignment('justifyCenter'), icon: AlignCenterIcon },
    { label: 'Right Align', hotkey: 'Ctrl+Shift+R', action: () => applyAlignment('justifyRight'), icon: AlignRightIcon },
    { label: 'Justify Align', hotkey: 'Ctrl+Shift+J', action: () => applyAlignment('justifyFull'), icon: AlignJustifyIcon },
    { type: 'divider' },
    // { label: 'Start Align', action: () => applyAlignment('justifyLeft'), icon: AlignLeftIcon }, // Assuming LTR
    // { label: 'End Align', action: () => applyAlignment('justifyRight'), icon: AlignRightIcon },   // Assuming LTR
    // { type: 'divider' as const }, // Keep as const if needed for other logic, or remove if AlignmentOption handles it
    { label: 'Outdent', hotkey: 'Ctrl+[', action: () => applyAlignment('outdent'), icon: OutdentIcon },
    { label: 'Indent', hotkey: 'Ctrl+]', action: () => applyAlignment('indent'), icon: IndentIcon },
]

export const TextAlignDropDown = () => {
    const editor = $(EditorContext)
    const { undos, saveDo } = useUndoRedo()
    const isOpen = $(false)
    const dropdownRef = $<HTMLDivElement>(null)
    // const currentAlignment = $('Left Align') // TODO: Detect current alignment

    useOnClickOutside(dropdownRef, () => isOpen(false))

    const toggleDropdown = () => isOpen(!isOpen())

    const handleSelectOption = (action: () => void) => {
        if ($$(editor)) {
            saveDo()
            action()
            // $$(editor)?.focus()
        }
        isOpen(false)
    }

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div>
                <Button
                    buttonType='outlined'
                    class={["p-2"]}
                    onClick={toggleDropdown}
                    title="Text alignment"
                >
                    {/* Default icon, or icon of current alignment */}
                    <AlignLeftIcon />
                    <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Button>
            </div>

            {() => $$(isOpen) && (
                <div
                    className="origin-top-left absolute left-0 mt-2 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="alignment-menu-button"
                >
                    <div className="py-1" role="none">
                        {alignmentOptions.map((opt, index) => {
                            if (opt.type === 'divider') {
                                return <div key={`divider-${index}`} className="border-t border-gray-200 my-1 mx-2" />
                            }
                            // TypeScript should infer opt as AlignmentOptionItem here due to the check above
                            const item = opt as AlignmentOptionItem
                            return (
                                <a
                                    key={item.label}
                                    href="#"
                                    className="text-gray-700 group flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900"
                                    role="menuitem"
                                    onClick={(e) => { e.preventDefault(); handleSelectOption(item.action) }}
                                    title={item.hotkey}
                                >
                                    <item.icon />
                                    <span className="ml-3">{item.label}</span>
                                    {item.hotkey && <span className="ml-auto text-xs text-gray-500">{item.hotkey}</span>}
                                </a>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

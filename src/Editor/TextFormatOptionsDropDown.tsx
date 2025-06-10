import { $, $$, JSX, Observable } from 'woby'
import { Button, variant } from '../Button'
import { EditorContext, useUndoRedo } from './undoredo'
import { useOnClickOutside } from 'use-woby'
import { range, getSelectedText, replaceSelectedText } from './utils' // Assuming these utils exist or will be created

// Icons (placeholders, replace with actual icons)
const StrikethroughIcon = () => <span className="font-bold">S</span>
const SubscriptIcon = () => <span className="font-bold">X<sub>2</sub></span>
const SuperscriptIcon = () => <span className="font-bold">X<sup>2</sup></span>
const HighlightIcon = () => <span className="font-bold" style={{ background: 'yellow' }}>H</span>
const ClearFormattingIcon = () => <span className="font-bold">Tx</span>
const CaseTransformIcon = () => <span className="font-bold">Aa</span>


const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
}

const transformCase = (transformType: 'lowercase' | 'uppercase' | 'capitalize') => {
    const selectedText = getSelectedText($$(range))
    if (!selectedText) return

    let transformedText = ''
    switch (transformType) {
        case 'lowercase':
            transformedText = selectedText.toLowerCase()
            break
        case 'uppercase':
            transformedText = selectedText.toUpperCase()
            break
        case 'capitalize':
            transformedText = selectedText.replace(/\b\w/g, char => char.toUpperCase())
            break
    }
    replaceSelectedText($$(range), transformedText)
}


const formatOptions = [
    { label: 'Strikethrough', hotkey: 'Ctrl+Shift+S', action: () => applyFormat('strikeThrough'), icon: StrikethroughIcon },
    { label: 'Subscript', hotkey: 'Ctrl+,', action: () => applyFormat('subscript'), icon: SubscriptIcon },
    { label: 'Superscript', hotkey: 'Ctrl+.', action: () => applyFormat('superscript'), icon: SuperscriptIcon },
    { label: 'Highlight', hotkey: '', action: () => applyFormat('hiliteColor', 'yellow'), icon: HighlightIcon }, // Default yellow highlight
    { label: 'Clear Formatting', hotkey: 'Ctrl+\\', action: () => applyFormat('removeFormat'), icon: ClearFormattingIcon },
    { label: 'Lowercase', hotkey: 'Ctrl+Shift+1', action: () => transformCase('lowercase'), icon: CaseTransformIcon },
    { label: 'Uppercase', hotkey: 'Ctrl+Shift+2', action: () => transformCase('uppercase'), icon: CaseTransformIcon },
    { label: 'Capitalize', hotkey: 'Ctrl+Shift+3', action: () => transformCase('capitalize'), icon: CaseTransformIcon },
]

export const TextFormatOptionsDropDown = () => {
    const editor = $(EditorContext)
    const { undos, saveDo } = useUndoRedo()
    const isOpen = $(false)
    const dropdownRef = $<HTMLDivElement>(null)

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
                    class={[variant.outlined, "p-2"]}
                    onClick={toggleDropdown}
                    title="More text formats"
                >
                    <CaseTransformIcon /> {/* Main button icon */}
                    <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Button>
            </div>

            {() => $$(isOpen) && (
                <div
                    className="origin-top-left absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="format-options-menu-button"
                >
                    <div className="py-1" role="none">
                        {formatOptions.map(opt => (
                            <a
                                href="#"
                                className="text-gray-700 group flex items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900"
                                role="menuitem"
                                onClick={(e) => { e.preventDefault(); handleSelectOption(opt.action) }}
                                title={opt.hotkey}
                            >
                                <opt.icon />
                                <span className="ml-3">{opt.label}</span>
                                {opt.hotkey && <span className="ml-auto text-xs text-gray-500">{opt.hotkey}</span>}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

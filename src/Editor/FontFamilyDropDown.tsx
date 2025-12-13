import { $, $$, JSX, useEffect } from 'woby'
import { Button } from '../Button'
import { EditorContext } from './undoredo'
import { useOnClickOutside } from '@woby/use'
import { range, getCurrentRange } from './utils' // Import getCurrentRange

const applyFontFamily = (fontName: string) => {
    document.execCommand('fontName', false, fontName)
}

const fontFamilies = [
    { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { label: 'Courier New', value: "'Courier New', Courier, monospace" },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
    { label: 'Trebuchet MS', value: "'Trebuchet MS', Helvetica, sans-serif" },
    { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
]

export const FontFamilyDropDown = () => {
    const editor = $(EditorContext)
    const isOpen = $(false)
    const selectedFont = $(fontFamilies[0].label) // Default to Arial
    const dropdownRef = $<HTMLDivElement>(null)

    useOnClickOutside(dropdownRef, () => isOpen(false))

    // Update selected font based on the shared range observable
    useEffect(() => {
        const currentRange = getCurrentRange()

        if (currentRange) {
            let nodeToCheck: Node | null = currentRange.startContainer
            // If it's a text node, get its parent element
            if (nodeToCheck.nodeType === Node.TEXT_NODE) {
                nodeToCheck = nodeToCheck.parentElement
            }

            if (nodeToCheck instanceof HTMLElement) {
                const computedStyle = window.getComputedStyle(nodeToCheck)
                const currentFontFamily = computedStyle.fontFamily

                if (currentFontFamily) {
                    // Normalize: remove quotes, take first font, lowercase
                    const normalizedFont = currentFontFamily.split(',')[0].replace(/['"]/g, '').trim().toLowerCase()

                    const foundFont = fontFamilies.find(font =>
                        font.value.split(',')[0].replace(/['"]/g, '').trim().toLowerCase() === normalizedFont
                        || font.label.toLowerCase() === normalizedFont // Fallback check against label
                    )
                    selectedFont(foundFont ? foundFont.label : 'Font') // Update or use placeholder
                } else {
                    selectedFont(fontFamilies[0].label) // Default if style is missing
                }
            } else {
                selectedFont(fontFamilies[0].label) // Default if node is not an element
            }
        } else {
            selectedFont(fontFamilies[0].label) // Default if no range or startContainer
        }
    }) // Woby automatically tracks $$(range)

    const toggleDropdown = () => isOpen(!isOpen())

    const handleSelectFont = (fontValue: string, fontLabel: string) => {
        if ($$(editor)) {
            applyFontFamily(fontValue)
            selectedFont(fontLabel)
            // $$(editor)?.focus()
        }
        isOpen(false)
    }

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div>
                <Button
                    buttonType='outlined'
                    cls={["h-8 inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"]}
                    onClick={toggleDropdown}
                    title="Font family"
                >
                    {() => $$(selectedFont)}
                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </Button>
            </div>

            {() => $$(isOpen) && (
                <div
                    className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                >
                    <div className="py-1" role="none">
                        {fontFamilies.map(font => (
                            <a
                                href="#"
                                className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900"
                                role="menuitem"
                                onClick={(e) => { e.preventDefault(); handleSelectFont(font.value, font.label) }}
                                style={{ fontFamily: font.value }}
                            >
                                {font.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

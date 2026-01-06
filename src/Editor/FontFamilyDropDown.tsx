import { $, $$, customElement, defaults, ElementAttributes, HtmlClass, HtmlNumber, JSX, ObservableMaybe, useEffect } from 'woby'
import { Button } from '../Button'
import { EditorContext } from './undoredo'
import { useOnClickOutside } from '@woby/use'
import { range, getCurrentRange } from './utils' // Import getCurrentRange
import KeyboardDownArrow from '../icons/keyboard_down_arrow'

const applyFontFamily = (fontName: string) => {
    document.execCommand('fontName', false, fontName)
}

const FONT_FAMILY = [
    { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { label: 'Courier New', value: "'Courier New', Courier, monospace" },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
    { label: 'Trebuchet MS', value: "'Trebuchet MS', Helvetica, sans-serif" },
    { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
]


const def = () => ({
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    defaultIndex: $(0, HtmlNumber) as ObservableMaybe<number>,
})


const FontFamilyDropDown = defaults(def, (props) => {

    const { class: cn, cls, defaultIndex, ...otherProps } = props

    const BASE_BTN = "size-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 cursor-pointer"

    const editor = $(EditorContext)
    const isOpen = $(false)
    const selectedFont = $(FONT_FAMILY[$$(defaultIndex)].label) // Default to Arial
    const dropdownRef = $<HTMLDivElement>(null)


    useOnClickOutside(dropdownRef, () => isOpen(false))

    // Update selected font based on the shared range observable
    // Woby's useEffect runs this function automatically when dependent observables change
    // (or potentially on every render/update depending on Woby's specific tracking of getCurrentRange)
    useEffect(() => {
        // 1. Get the user's current text selection range from the editor
        const currentRange = getCurrentRange()

        // 2. CHECK: Is there actually a selection inside the editor?
        if (currentRange) {

            // 3. IDENTIFY THE ELEMENT:
            // 'startContainer' is the DOM node where the selection begins.
            let nodeToCheck: Node | null = currentRange.startContainer

            // If the selection starts inside a pure text node (e.g., the word "Hello"), 
            // we can't check styles on text directly. We need its PARENT element (e.g., <p> or <span>).
            if (nodeToCheck.nodeType === Node.TEXT_NODE) {
                nodeToCheck = nodeToCheck.parentElement
            }

            // 4. CHECK STYLE: Ensure we have a valid HTML Element to check CSS on
            if (nodeToCheck instanceof HTMLElement) {

                // Get the final calculated CSS styles for this element (handles inheritance, classes, inline styles)
                const computedStyle = window.getComputedStyle(nodeToCheck)
                const currentFontFamily = computedStyle.fontFamily

                if (currentFontFamily) {
                    // 5. NORMALIZE: Clean up the CSS string for comparison.
                    // Example Input: " 'Courier New', Courier, monospace "
                    // a. split(',')[0]      -> Takes only the first font: " 'Courier New'"
                    // b. replace(/['"]/g,'')-> Removes quotes: " Courier New"
                    // c. trim()             -> Removes edge spaces: "Courier New"
                    // d. toLowerCase()      -> Makes it case-insensitive: "courier new"
                    const normalizedFont = currentFontFamily.split(',')[0].replace(/['"]/g, '').trim().toLowerCase()

                    // 6. MATCH: Look through our list of supported fonts (FONT_FAMILY array)
                    const foundFont = FONT_FAMILY.find(font =>
                        // Check if the definition's value matches (e.g., "arial")
                        font.value.split(',')[0].replace(/['"]/g, '').trim().toLowerCase() === normalizedFont
                        // OR check if the Label matches (fallback for some browsers)
                        || font.label.toLowerCase() === normalizedFont
                    )

                    // 7. UPDATE UI: If found, show that label (e.g., "Arial"). 
                    // If not found (e.g., a custom font not in our list), show generic "Font".
                    selectedFont(foundFont ? foundFont.label : 'Font')
                } else {
                    // If the element has no font-family set, revert to the default index (usually Arial)
                    selectedFont(FONT_FAMILY[$$(defaultIndex)].label)
                }
            } else {
                // If the selection isn't inside an HTML element, revert to default
                selectedFont(FONT_FAMILY[$$(defaultIndex)].label)
            }
        } else {
            // 8. FALLBACK: If user clicks outside or has no selection, show the default font label
            selectedFont(FONT_FAMILY[$$(defaultIndex)].label)
        }
    }) // Woby automatically tracks $$(range)

    const toggleDropdown = () => isOpen(!isOpen())

    const handleSelectFont = (fontValue: string, fontLabel: string) => {
        if (editor) {
            applyFontFamily(fontValue)
            selectedFont(fontLabel)
        }
        isOpen(false)
    }

    const DropDownMenu = () => {
        return (
            <div
                class="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="menu-button"

                onMouseDown={(e) => {
                    e.stopPropagation() // Prevents the menu from closing immediately
                    e.preventDefault()  // Prevents the editor from losing focus
                }}
            >
                <div class="py-1" role="none">
                    {FONT_FAMILY.map(font => (
                        <Button
                            type="outlined"
                            cls="w-full text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                            role="menuitem"
                            onClick={(e) => { e.preventDefault(); handleSelectFont(font.value, font.label) }}
                            style={{ fontFamily: font.value }}
                        >
                            {font.label}
                        </Button>
                    ))}
                </div>
            </div>
        )
    }

    const handleApplyCurrent = (e: MouseEvent) => {
        e.preventDefault()

        const currentLabel = $$(selectedFont)
        const font = FONT_FAMILY.find(f => f.label === currentLabel)

        if (editor) {
            applyFontFamily(font.value)
        }
    }


    return (
        <div
            class={() => [
                () => $$(cls) ? $$(cls) : "relative inline-block text-left", cn,
            ]} ref={dropdownRef}>
            <div>
                <Button
                    type='outlined'
                    cls={() => [
                        BASE_BTN
                    ]}
                    onClick={handleApplyCurrent}
                    title="Font family"
                    {...otherProps}
                >
                    <span class="text-center truncate">
                        {() => $$(selectedFont)}
                    </span>
                    <span class="flex justify-end">
                        <KeyboardDownArrow class="-mr-1 ml-2 h-5 w-5" onClick={toggleDropdown} />
                    </span>
                </Button>
            </div>

            {() => $$(isOpen) && (<DropDownMenu />)}
        </div>
    )
})

export { FontFamilyDropDown }

customElement('wui-font-family-drop-down', FontFamilyDropDown)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-font-family-drop-down': ElementAttributes<typeof FontFamilyDropDown>
        }
    }
}

export default FontFamilyDropDown

// #region Font Family Drop Down Original Code
const FontFamilyDropDown_ = () => {
    const editor = $(EditorContext)
    const isOpen = $(false)
    const selectedFont = $(FONT_FAMILY[0].label) // Default to Arial
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

                    const foundFont = FONT_FAMILY.find(font =>
                        font.value.split(',')[0].replace(/['"]/g, '').trim().toLowerCase() === normalizedFont
                        || font.label.toLowerCase() === normalizedFont // Fallback check against label
                    )
                    selectedFont(foundFont ? foundFont.label : 'Font') // Update or use placeholder
                } else {
                    selectedFont(FONT_FAMILY[0].label) // Default if style is missing
                }
            } else {
                selectedFont(FONT_FAMILY[0].label) // Default if node is not an element
            }
        } else {
            selectedFont(FONT_FAMILY[0].label) // Default if no range or startContainer
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
                        {FONT_FAMILY.map(font => (
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
// #endregion



import { $, $$, JSX, useEffect } from 'woby'
import { Button, variant } from '../Button'
import { EditorContext, useEditor } from './undoredo' // This context provides the contentEditable div ref
import { convertToSemanticElement, range as reactiveRange } from './utils' // Import reactive range
import { useOnClickOutside } from 'use-woby'

// Helper to get current block element info before modification
const getCurrentBlockInfo = (editorDiv: HTMLElement | null, currentRange: Range | null): { tagName: string; element: HTMLElement } | null => {
    if (!editorDiv || !currentRange) return null
    // const selection = $$(reactiveRange) // Removed: Use passed currentRange
    // if (!selection || selection.rangeCount === 0) return null // Removed
    const range = currentRange // Use the passed-in reactive range
    let node = range.commonAncestorContainer

    // Ascend to find the nearest block-level parent or the element itself if it's a block
    // and ensure it's within the editorDiv
    while (node && node !== editorDiv.parentNode) { // Stop if we reach parent of editorDiv
        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement
            if (editorDiv.contains(el) || el === editorDiv) { // Check if element is within or is the editor
                const displayStyle = window.getComputedStyle(el).display
                if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'li', 'div', 'article', 'section', 'aside', 'header', 'footer', 'main', 'blockquote'].includes(el.tagName.toLowerCase()) || displayStyle === 'block') {
                    if (el.isContentEditable && el !== editorDiv && !editorDiv.contains(el.parentElement)) {
                        // If el is contentEditable but not the main editor, and its parent is not in editor, skip (e.g. nested editor)
                    } else if (el === editorDiv && range.commonAncestorContainer === editorDiv && range.startOffset === 0 && range.endOffset === editorDiv.childNodes.length) {
                        // If the entire editor content is selected, and editor itself is a block, this might be it.
                        // However, usually we want a child block. If editor has only one block child, prefer that.
                        if (editorDiv.children.length === 1 && editorDiv.children[0].nodeType === Node.ELEMENT_NODE) {
                            const singleChild = editorDiv.children[0] as HTMLElement
                            const childDisplayStyle = window.getComputedStyle(singleChild).display
                            if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'li', 'div', 'article', 'section', 'aside', 'header', 'footer', 'main', 'blockquote'].includes(singleChild.tagName.toLowerCase()) || childDisplayStyle === 'block') {
                                return { tagName: singleChild.tagName.toLowerCase(), element: singleChild }
                            }
                        }
                    }
                    return { tagName: el.tagName.toLowerCase(), element: el }
                }
            }
        }
        if (node === editorDiv) break // Don't go above the editor itself if node becomes editor
        node = node.parentNode
    }
    // If no specific block found but selection is in editor, consider editor's direct children or a default P if empty
    const currentSelectionFallback = window.getSelection() // Re-introduce selection for fallback logic, renamed variable
    if (!currentSelectionFallback) return null // Guard against null selection

    if (editorDiv && currentSelectionFallback.containsNode(editorDiv, true) && editorDiv.children.length > 0) {
        // Try to find a block among children at selection point
        let selectedNode = range.startContainer
        while (selectedNode && selectedNode.parentNode !== editorDiv) {
            selectedNode = selectedNode.parentNode
        }
        if (selectedNode && selectedNode.nodeType === Node.ELEMENT_NODE && ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'blockquote'].includes((selectedNode as HTMLElement).tagName.toLowerCase())) {
            return { tagName: (selectedNode as HTMLElement).tagName.toLowerCase(), element: selectedNode as HTMLElement }
        }
    } else if (editorDiv && editorDiv.children.length === 0 && editorDiv.isContentEditable) {
        // If editor is empty, create and return a P tag
        const p = document.createElement('p')
        editorDiv.appendChild(p)
        // Place caret inside
        const newRange = document.createRange()
        newRange.setStart(p, 0)
        newRange.collapse(true)
        // Need selection again here for manipulating ranges
        const currentSelectionForRange = window.getSelection() // Renamed variable
        if (!currentSelectionForRange) return null // Guard clause
        currentSelectionForRange.removeAllRanges()
        currentSelectionForRange.addRange(newRange)
        return { tagName: 'p', element: p }
    }

    return null
}

// Helper to manually apply block formatting
const applyFormatBlock = (editorDiv: HTMLDivElement | null, targetTag: string, cls: string | undefined) => {
    if (!editorDiv) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    // Clone the range as operations below might modify it or the selection.
    const range = selection.getRangeAt(0).cloneRange()

    // Get current block info for potential use in blockquote wrapping
    // const originalBlockInfoSnapshot = getCurrentBlockInfo(editorDiv) // Keep if needed for complex scenarios

    // Find the block element(s) to change.
    let blockToTransform: HTMLElement | null = null
    let container = range.commonAncestorContainer

    while (container && container !== editorDiv.parentNode) {
        if (container.nodeType === Node.ELEMENT_NODE && editorDiv.contains(container)) {
            const el = container as HTMLElement
            const displayStyle = window.getComputedStyle(el).display
            if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'blockquote', 'li', 'div', 'article', 'section', 'aside', 'header', 'footer', 'main'].includes(el.tagName.toLowerCase()) || displayStyle === 'block') {
                if (el.parentNode === editorDiv || (el.parentNode !== editorDiv && editorDiv.contains(el.parentNode))) {
                    blockToTransform = el
                    break
                } else if (el === editorDiv && !blockToTransform) {
                    blockToTransform = el
                }
            }
        }
        if (container === editorDiv) break
        container = container.parentNode
    }

    if (!blockToTransform && editorDiv.children.length === 0) {
        blockToTransform = document.createElement('p')
        editorDiv.appendChild(blockToTransform)
        const tempRange = document.createRange()
        tempRange.selectNodeContents(blockToTransform)
        selection.removeAllRanges()
        selection.addRange(tempRange)
    } else if (!blockToTransform && editorDiv.children.length > 0 && range.commonAncestorContainer === editorDiv) {
        const wrapper = document.createElement('p')
        while (editorDiv.firstChild) {
            wrapper.appendChild(editorDiv.firstChild)
        }
        editorDiv.appendChild(wrapper)
        blockToTransform = wrapper
        const tempRange = document.createRange()
        tempRange.selectNodeContents(wrapper)
        selection.removeAllRanges()
        selection.addRange(tempRange)
    }

    if (!blockToTransform) {
        // Pass the cloned range to getCurrentBlockInfo here as well
        // Need to get the current selection again if we reached this fallback
        const fallbackSelection = window.getSelection()
        const fallbackRange = fallbackSelection && fallbackSelection.rangeCount > 0 ? fallbackSelection.getRangeAt(0) : null
        const currentInfo = getCurrentBlockInfo(editorDiv, fallbackRange) // Pass range from fallback selection
        if (currentInfo) blockToTransform = currentInfo.element
    }

    if (!blockToTransform) return

    let elementToProcess = blockToTransform
    if (blockToTransform === editorDiv) {
        const newBlock = document.createElement(blockToTransform.tagName || 'div')
        while (blockToTransform.firstChild) {
            newBlock.appendChild(blockToTransform.firstChild)
        }
        blockToTransform.appendChild(newBlock)
        elementToProcess = newBlock
    }

    // If the selected element is a UL or OL, apply the format to its LI children that are within the selection
    if (elementToProcess.tagName.toLowerCase() === 'ul' || elementToProcess.tagName.toLowerCase() === 'ol') {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
            const currentRange = selection.getRangeAt(0)
            // Filter LI children that actually intersect with the current selection range
            const selectedListItems = Array.from(elementToProcess.children).filter(child =>
                child.tagName.toLowerCase() === 'li' && currentRange.intersectsNode(child)
            ) as HTMLElement[]

            if (selectedListItems.length > 0) {
                selectedListItems.forEach(item => {
                    convertToSemanticElement(item, targetTag, editorDiv, formatOptions)
                })
            }
            // If no LIs were selected within the UL/OL, no action is taken on the LIs.
            // The UL/OL itself is not converted by this block.
        }
        editorDiv.focus() // Or perhaps focus only if changes were made
        return
    }

    // For single elements or non-list block elements, call convertToSemanticElement
    // Pass the specific elementToProcess, targetTag, editorDiv, and formatOptions
    convertToSemanticElement(elementToProcess, targetTag, editorDiv, formatOptions)
    editorDiv.focus()

    // Trigger onChange or other updates if necessary
    // This might need to be handled within convertToSemanticElement or after it,
    // depending on how state updates/event emissions are structured.
}


// Dropdown items
export const formatOptions = [
    { label: 'Normal', tag: 'p', hotkey: 'Ctrl+Alt+0', class: '' },
    { label: 'Heading 1', tag: 'h1', hotkey: 'Ctrl+Alt+1', class: 'text-3xl font-bold' },
    { label: 'Heading 2', tag: 'h2', hotkey: 'Ctrl+Alt+2', class: 'text-2xl font-semibold' },
    { label: 'Heading 3', tag: 'h3', hotkey: 'Ctrl+Alt+3', class: 'text-xl font-medium' },
    { label: 'Quote', tag: 'blockquote', hotkey: 'Ctrl+Alt+Q', class: 'text-[15px] text-[#65676b] ml-10 mr-0 mt-0 mb-2.5 pl-2 border-l-[#ced0d4] border-l-4 [border-left-style:solid] inline-block' },
    { label: 'Code Block', tag: 'pre', hotkey: 'Ctrl+Alt+C', class: 'inline-block' },
]

export const TextFormatDropDown = () => {
    const editorRefCtxObservable = useEditor() // This is Observable<Observable<HTMLDivElement | null>>
    const editorRefObs = $$(editorRefCtxObservable)      // This is Observable<HTMLDivElement | null>

    const isOpen = $(false)
    const selectedFormat = $('Normal')
    const dropdownRef = $<HTMLDivElement>(null) // This is Observable<HTMLDivElement | null>

    useOnClickOutside(dropdownRef, () => isOpen(false)) // Pass HTMLDivElement to useOnClickOutside

    const toggleDropdown = () => isOpen(!isOpen())

    const handleSelectFormat = (tag: string, label: string, cls: string | undefined) => {
        const editorDiv = $$(editorRefObs) // Get HTMLDivElement | null
        if (editorDiv) {
            applyFormatBlock(editorDiv, tag, cls)
            selectedFormat(label)
            editorDiv.focus() // Ensure editor is focused after operation
        }
        isOpen(false)
    }

    useEffect(() => {
        const editorDiv = $$(editorRefObs) // Get HTMLDivElement | null
        if (!editorDiv) return

        const handleKeyDown = (event: KeyboardEvent) => {
            for (const opt of formatOptions) {
                if (!opt.hotkey) continue
                const parts = opt.hotkey.split('+')
                const key = parts.pop()?.toUpperCase()
                const ctrl = parts.includes('Ctrl')
                const alt = parts.includes('Alt')
                const shift = parts.includes('Shift')

                if (
                    key && event.key.toUpperCase() === key &&
                    event.ctrlKey === ctrl && event.altKey === alt && event.shiftKey === shift
                ) {
                    const target = event.target as HTMLElement
                    const currentDropdownEl = $$(dropdownRef) // Get HTMLDivElement | null
                    // Check if event is from within the editor or its toolbar/dropdowns
                    if (editorDiv.contains(target) || target === editorDiv || currentDropdownEl?.contains(target)) {
                        event.preventDefault()
                        applyFormatBlock(editorDiv, opt.tag, opt.class)
                        selectedFormat(opt.label)
                        isOpen(false)
                        editorDiv.focus()
                        break
                    }
                }
            }
        }
        // Listen on document to catch events even if editor isn't directly focused but is active context
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    })

    // Update selectedFormat reactively based on selection changes
    useEffect(() => {
        const editorDiv = $$(editorRefObs) // Get HTMLDivElement | null
        if (!editorDiv) return

        const handleSelectionChange = () => {
            const currentRangeValue = $$(reactiveRange) // Read the reactive range observable
            if (currentRangeValue && editorDiv.contains(currentRangeValue.commonAncestorContainer)) { // Check if selection is within editor
                const currentBlock = getCurrentBlockInfo(editorDiv, currentRangeValue) // Pass reactive range value
                if (currentBlock) {
                    const matchedFormat = formatOptions.find(opt => opt.tag.toLowerCase() === currentBlock.tagName.toLowerCase())
                    if (matchedFormat) {
                        selectedFormat(matchedFormat.label)
                    } else {
                        const normalFormat = formatOptions.find(opt => opt.tag === 'p')
                        selectedFormat(normalFormat ? normalFormat.label : 'Normal')
                    }
                } else {
                    const normalFormat = formatOptions.find(opt => opt.tag === 'p')
                    selectedFormat(normalFormat ? normalFormat.label : 'Normal')
                }
            } else {
                // Handle cases where selection might be null or outside the editor
                const normalFormat = formatOptions.find(opt => opt.tag === 'p')
                selectedFormat(normalFormat ? normalFormat.label : 'Normal')
            }
        }

        handleSelectionChange() // Call initially and whenever range changes
    })

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div>
                <Button
                    class={[variant.outlined, "h-8 inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"]}
                    onClick={toggleDropdown}
                    title="Text format"
                >
                    {() => $$(selectedFormat)}
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
                        {formatOptions.map(opt => (
                            <a
                                href="#"
                                className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900"
                                role="menuitem"
                                onClick={(e) => { e.preventDefault(); handleSelectFormat(opt.tag, opt.label, opt.class) }}
                                title={opt.hotkey}
                            >
                                {opt.label} <span className="text-xs text-gray-500 ml-2">{opt.hotkey}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

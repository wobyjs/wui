import { normalizeDOM } from './DOMNormalizer'
import { safeGetSelection, safeGetRange } from './BrowserCompat'

/** Derive shadow root from any node in the editor tree. */
function getEditorShadowRoot(node?: Node | null): ShadowRoot | undefined {
    const root = node?.getRootNode?.()
    return root instanceof ShadowRoot ? root : undefined
}

export type StyleProperty =
    | 'fontWeight'
    | 'fontStyle'
    | 'textDecoration'
    | 'textDecorationLine'
    | 'color'
    | 'backgroundColor'
    | 'fontFamily'
    | 'fontSize'

/**
 * Get computed styles from a node, including UA stylesheet and inherited values.
 * D-02: window.getComputedStyle resolves <strong>, <em>, <b>, <i> correctly.
 * node.style only returned inline styles — semantic elements were invisible.
 */
function getComputedStyles(node: Node): CSSStyleDeclaration {
    if (node instanceof HTMLElement) {
        return window.getComputedStyle(node)
    }
    if (node instanceof Text && node.parentElement) {
        return window.getComputedStyle(node.parentElement)
    }
    return {} as CSSStyleDeclaration
}

/**
 * Normalize color value to rgb format for comparison
 */
function normalizeColor(value: string): string {
    // If it's a hex color, convert to rgb
    if (value.startsWith('#')) {
        const hex = value.substring(1)
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        return `rgb(${r}, ${g}, ${b})`
    }
    return value
}

/**
 * Normalize font-weight values for comparison
 * Maps 'bold' -> '700', 'normal' -> '400', etc.
 */
function normalizeFontWeight(value: string): string {
    const weightMap: Record<string, string> = {
        'normal': '400',
        'bold': '700',
        'bolder': '700',
        'lighter': '300',
        '100': '100',
        '200': '200',
        '300': '300',
        '400': '400',
        '500': '500',
        '600': '600',
        '700': '700',
        '800': '800',
        '900': '900',
    }
    return weightMap[value.toLowerCase()] || value
}

/**
 * Check if a node has a specific style property with a value
 */
function hasStyle(node: Node, prop: string, value: string): boolean {
    const styles = getComputedStyles(node)
    // Convert camelCase to CSS property name (e.g., 'fontWeight' -> 'font-weight')
    const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase()

    // Normalize color values for comparison
    if (cssProp === 'color' || cssProp === 'background-color') {
        const normalizedValue = normalizeColor(value)
        const currentValue = styles.getPropertyValue(cssProp)
        return currentValue === normalizedValue
    }

    // Normalize fontWeight values for comparison
    // 'bold' and '700' are equivalent
    if (cssProp === 'font-weight') {
        const currentValue = styles.getPropertyValue(cssProp)
        // Normalize both values to numeric for comparison
        const normalizedValue = normalizeFontWeight(value)
        const normalizedCurrent = normalizeFontWeight(currentValue)
        return normalizedValue === normalizedCurrent
    }

    return styles.getPropertyValue(cssProp) === value
}

/**
 * Normalize style value for comparison and storage
 * Handles equivalent values like 'bold'/'700' for font-weight
 */
function normalizeStyleValue(prop: string, value: string): string {
    // Normalize font-weight values
    if (prop === 'fontWeight' || prop === 'font-weight') {
        const weightMap: Record<string, string> = {
            'bold': 'bold', // Keep 'bold' as-is for inline style readability
            'normal': 'normal',
        }
        return weightMap[value] || value
    }
    return value
}

/**
 * Find the block parent of a node
 */
function getBlockParent(node: Node): HTMLElement | null {
    let current: Node | null = node
    const blockTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'PRE', 'DIV']

    while (current) {
        if (current instanceof HTMLElement && blockTags.includes(current.tagName)) {
            return current
        }
        current = current.parentNode
    }
    return null
}

/**
 * Check if all nodes in a range have a specific style
 */
function hasStyleInRange(range: Range, prop: string, value: string): boolean {
    // For collapsed range, check if cursor is in styled text
    if (range.collapsed) {
        return hasStyle(range.startContainer, prop, value)
    }

    // For non-collapsed range, check if ALL text nodes have the style
    // IMPORTANT: TreeWalker only walks CHILDREN of the root node
    // If commonAncestorContainer is a TEXT node, we need to use its parent
    let container = range.commonAncestorContainer
    if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentNode || container
    }

    const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        null
    )

    let node: Node | null
    let hasAnyText = false
    while ((node = walker.nextNode())) {
        if (range.intersectsNode(node)) {
            hasAnyText = true
            if (!hasStyle(node, prop, value)) {
                return false
            }
        }
    }

    // If no text nodes found, return false
    return hasAnyText
}

/**
 * Save selection as offsets from a stable anchor (parent block)
 * This allows restoration even when text nodes are replaced
 */
function saveSelectionAsOffsets(range: Range): {
    block: HTMLElement | null
    startOffset: number
    endOffset: number
} {
    const block = getBlockParent(range.commonAncestorContainer)
    if (!block) {
        return { block: null, startOffset: 0, endOffset: 0 }
    }

    // Calculate text offsets from block start
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, null)
    let currentOffset = 0
    let startOffset = -1
    let endOffset = -1

    let node: Node | null
    while ((node = walker.nextNode())) {
        const textNode = node as Text
        const nodeLength = textNode.textContent?.length || 0

        if (node === range.startContainer) {
            startOffset = currentOffset + range.startOffset
        }
        if (node === range.endContainer) {
            endOffset = currentOffset + range.endOffset
        }

        currentOffset += nodeLength
    }

    return { block, startOffset, endOffset }
}

/**
 * Restore selection from saved offsets
 */
function restoreSelectionFromOffsets(
    block: HTMLElement,
    startOffset: number,
    endOffset: number
): void {
    const sel = safeGetSelection()
    if (!sel) return

    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, null)
    let currentOffset = 0
    let startNode: Text | null = null
    let startNodeOffset = 0
    let endNode: Text | null = null
    let endNodeOffset = 0

    let node: Node | null
    while ((node = walker.nextNode())) {
        const textNode = node as Text
        const nodeLength = textNode.textContent?.length || 0

        // Find start position
        // Special handling for boundary cases:
        // - If startOffset is exactly at the END of this node (startOffset == currentOffset + nodeLength),
        //   we should use the NEXT text node with offset 0
        // - But we can't look ahead in TreeWalker, so we remember this and fix it after the loop
        if (startNode === null && startOffset >= currentOffset && startOffset < currentOffset + nodeLength) {
            startNode = textNode
            startNodeOffset = startOffset - currentOffset
        }

        // Find end position (endOffset is exclusive)
        // If endOffset equals exactly currentOffset + nodeLength, it's AT the end of this node
        // For exclusive end, we want this node with offset = nodeLength
        if (endNode === null && endOffset > currentOffset && endOffset <= currentOffset + nodeLength) {
            endNode = textNode
            endNodeOffset = endOffset - currentOffset
        }

        currentOffset += nodeLength
    }

    // Fix boundary case: if startOffset was at exact end of a node but we didn't find it
    // This means startOffset == currentOffset after loop (at start of virtual next node)
    // In this case, use endNode with offset 0 if available, or create a range at end of last node
    if (startNode === null && endNode !== null) {
        // startOffset was at boundary - use the same node as endNode with offset 0
        // This handles cases like: select "word" where start=5 (end of "Test ") and end=9 (end of "word")
        startNode = endNode
        startNodeOffset = 0
        console.log('[restoreSelectionFromOffsets] Fixed boundary: startNode set to endNode with offset 0')
    }

    if (startNode && endNode) {
        const newRange = document.createRange()
        newRange.setStart(startNode, startNodeOffset)
        newRange.setEnd(endNode, endNodeOffset)

        sel.removeAllRanges()
        sel.addRange(newRange)
        console.log('[restoreSelectionFromOffsets] Restored selection:', {
            startNode: startNode.textContent,
            startOffset: startNodeOffset,
            endNode: endNode.textContent,
            endOffset: endNodeOffset
        })
    } else {
        console.log('[restoreSelectionFromOffsets] FAILED to restore selection:', {
            startNodeFound: !!startNode,
            endNodeFound: !!endNode,
            startOffset,
            endOffset
        })
    }
}

/**
 * Apply a style to the current selection using DOM manipulation
 * Implements toggle logic: if style already exists, remove it
 * Replaces execCommand('bold') etc.
 */
export function applyStyle(prop: string, value: string): void {
    // D-01: derive shadow root from active selection focus node to enable getComposedRanges path
    const focusSr = getEditorShadowRoot(window.getSelection()?.focusNode)
    const range = safeGetRange(focusSr)
    if (!range) return

    const sel = safeGetSelection()
    if (!sel) return

    // Save original selection as offsets BEFORE any DOM operations
    const savedSelection = saveSelectionAsOffsets(range)

    // Check if style already exists on selection (toggle check)
    const styleAlreadyApplied = hasStyleInRange(range, prop, value)

    if (styleAlreadyApplied) {
        // Toggle OFF: Remove the style
        removeStyle(prop, savedSelection)
        return
    }

    // Toggle ON: Apply the style
    let wrapper: HTMLElement | null = null

    if (range.collapsed) {
        // Expand to word if cursor is in middle of word
        const wordRange = expandToWord(range)
        if (!wordRange || wordRange.collapsed) {
            // Insert styled empty span at cursor for typing
            insertStyledEmptySpan(prop, value)
            return
        }
        wrapper = applyStyleToRange(wordRange, prop, value)
    } else {
        wrapper = applyStyleToRange(range, prop, value)
    }

    // Normalize after operation
    const block = getBlockParent(range.commonAncestorContainer)
    if (block) {
        normalizeDOM(block)
    }

    // Restore selection from saved offsets
    if (savedSelection.block && savedSelection.startOffset >= 0 && savedSelection.endOffset >= 0) {
        restoreSelectionFromOffsets(
            savedSelection.block,
            savedSelection.startOffset,
            savedSelection.endOffset
        )
    }
}

/**
 * Expand a collapsed range to the word under cursor
 */
function expandToWord(range: Range): Range | null {
    const container = range.startContainer
    if (container.nodeType !== Node.TEXT_NODE) return null

    const text = container.textContent || ''
    const offset = range.startOffset

    // Find word boundaries
    let start = offset
    let end = offset

    // Expand left to word boundary
    while (start > 0 && /\w/.test(text[start - 1])) {
        start--
    }

    // Expand right to word boundary
    while (end < text.length && /\w/.test(text[end])) {
        end++
    }

    if (start === end) return null

    const newRange = document.createRange()
    newRange.setStart(container, start)
    newRange.setEnd(container, end)
    return newRange
}

/**
 * Apply style to a specific range
 * Handles partial selections by properly splitting existing styled spans
 * Returns the wrapper element created (or null if multiple elements were created)
 */
function applyStyleToRange(range: Range, prop: string, value: string): HTMLElement | null {
    // Get the common ancestor
    let commonAncestor = range.commonAncestorContainer

    // If common ancestor is a text node, we need to handle it specially
    // TreeWalker doesn't walk into the starting node itself
    const textNodes: Text[] = []

    if (commonAncestor.nodeType === Node.TEXT_NODE) {
        // Check if this text node intersects with the range
        const nodeRange = document.createRange()
        nodeRange.selectNode(commonAncestor)

        // Check intersection
        if (range.compareBoundaryPoints(Range.START_TO_END, nodeRange) <= 0 ||
            range.compareBoundaryPoints(Range.END_TO_START, nodeRange) >= 0) {
            // Text node is outside the range - nothing to do
            return null
        }

        // The text node is within the range - process it
        const textNode = commonAncestor as Text
        const parent = textNode.parentNode
        if (!parent) return null

        // Check if parent is a plain wrapper span (no styles) that we should replace
        const isPlainWrapper = parent instanceof HTMLSpanElement &&
            !parent.hasAttribute('style') &&
            !parent.className &&
            !parent.id

        const text = textNode.textContent || ''
        const startOffset = range.startOffset
        const endOffset = range.endOffset
        const before = text.substring(0, startOffset)
        const selected = text.substring(startOffset, endOffset)
        const after = text.substring(endOffset)

        const wrapper = document.createElement('span')
        wrapper.style[prop as any] = value
        wrapper.textContent = selected

        if (isPlainWrapper) {
            // Replace the plain wrapper with styled wrapper
            parent.replaceWith(wrapper)
        } else {
            // Insert in order: before text, styled span, after text
            if (before) {
                parent.insertBefore(document.createTextNode(before), textNode)
            }
            parent.insertBefore(wrapper, textNode)
            if (after) {
                parent.insertBefore(document.createTextNode(after), textNode)
            }
            // Remove original text node
            parent.removeChild(textNode)
        }
        return wrapper
    }

    // Normal case: common ancestor is an element, use TreeWalker
    const walker = document.createTreeWalker(
        commonAncestor,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                // Check if this text node intersects with the range
                const nodeRange = document.createRange()
                nodeRange.selectNode(node)
                if (range.compareBoundaryPoints(Range.START_TO_END, nodeRange) <= 0) {
                    return NodeFilter.FILTER_REJECT // Node is after range
                }
                if (range.compareBoundaryPoints(Range.END_TO_START, nodeRange) >= 0) {
                    return NodeFilter.FILTER_REJECT // Node is before range
                }
                return NodeFilter.FILTER_ACCEPT
            }
        }
    )

    let node: Node | null
    let firstWrapper: HTMLElement | null = null
    while ((node = walker.nextNode())) {
        textNodes.push(node as Text)
    }

    // Process each text node
    textNodes.forEach((textNode, index) => {
        const nodeRange = document.createRange()
        nodeRange.selectNode(textNode)

        // Calculate intersection of range with this text node
        const startOffset = range.compareBoundaryPoints(Range.START_TO_START, nodeRange) > 0
            ? range.startOffset
            : 0
        const endOffset = range.compareBoundaryPoints(Range.END_TO_END, nodeRange) < 0
            ? range.endOffset
            : (textNode.textContent?.length || 0)

        if (startOffset >= endOffset) return

        // Create a new styled span for this text segment
        const wrapper = document.createElement('span')
        wrapper.style[prop as any] = value

        // Track first wrapper for selection restoration
        if (!firstWrapper) {
            firstWrapper = wrapper
        }

        // Split the text node at the boundaries
        const parent = textNode.parentNode
        if (!parent) return

        const text = textNode.textContent || ''
        const before = text.substring(0, startOffset)
        const selected = text.substring(startOffset, endOffset)
        const after = text.substring(endOffset)

        // Insert the styled span with selected text
        wrapper.textContent = selected

        // Insert in CORRECT order: before text, styled span, after text
        if (before) {
            parent.insertBefore(document.createTextNode(before), textNode)
        }
        parent.insertBefore(wrapper, textNode)
        if (after) {
            parent.insertBefore(document.createTextNode(after), textNode)
        }

        // Remove original text node
        parent.removeChild(textNode)
    })

    return firstWrapper
}

/**
 * Insert an empty styled span at cursor position
 * Used for typing with active style
 */
function insertStyledEmptySpan(prop: string, value: string): void {
    const sel = safeGetSelection()
    if (!sel || sel.rangeCount === 0) return

    const range = sel.getRangeAt(0)

    const span = document.createElement('span')
    span.style.setProperty(prop, value)
    span.appendChild(document.createTextNode('﻿')) // ZWNBSP

    range.insertNode(span)

    // Select the ZWNBSP so typing replaces it
    const newRange = document.createRange()
    newRange.selectNodeContents(span)
    newRange.collapse(false)

    sel.removeAllRanges()
    sel.addRange(newRange)
}

/**
 * Remove a style property from the current selection
 * Properly unwraps styled spans and restores selection
 */
export function removeStyle(prop: string, savedSelection?: { block: HTMLElement | null, startOffset: number, endOffset: number }): void {
    // D-01: derive shadow root from active selection focus node to enable getComposedRanges path
    const focusSr = getEditorShadowRoot(window.getSelection()?.focusNode)
    const range = safeGetRange(focusSr)
    if (!range) return

    const sel = safeGetSelection()
    if (!sel) return

    // Save original selection if not provided
    if (!savedSelection) {
        savedSelection = saveSelectionAsOffsets(range)
    }

    if (range.collapsed) {
        // For collapsed selection: find current style at cursor and unwrap
        const container = range.startContainer
        if (hasStyle(container, prop, '')) {
            // Find the styled span containing the cursor
            let node: Node | null = container
            while (node && node.parentElement) {
                const el = node.parentElement
                if (el instanceof HTMLElement && el.tagName === 'SPAN') {
                    el.style.removeProperty(prop)
                    if (!el.getAttribute('style')) {
                        el.removeAttribute('style')
                    }
                    // Unwrap if no style attributes remain
                    if (!el.hasAttribute('style')) {
                        const parent = el.parentNode
                        if (parent) {
                            while (el.firstChild) {
                                parent.insertBefore(el.firstChild, el)
                            }
                            parent.removeChild(el)
                        }
                    }
                    break
                }
                node = node.parentElement
            }
        }
        return
    }

    console.log('[removeStyle] Processing non-collapsed selection')
    console.log('[removeStyle] prop:', prop, 'range:', range.toString())

    // For non-collapsed selection: split spans at selection boundaries
    // then remove style only from the selected portion

    // Find all styled spans that intersect with the selection
    const spansToProcess: { span: HTMLSpanElement, cssProp: string }[] = []

    let searchContainer = range.commonAncestorContainer
    console.log('[removeStyle] commonAncestorContainer:', searchContainer.nodeName, searchContainer.nodeType)

    if (searchContainer.nodeType === Node.TEXT_NODE && searchContainer.parentElement) {
        searchContainer = searchContainer.parentElement
        console.log('[removeStyle] Using parent element:', searchContainer.nodeName)
    }

    // Collect all spans with the target style
    const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase()
    console.log('[removeStyle] Looking for cssProp:', cssProp)

    if (searchContainer instanceof HTMLElement) {
        console.log('[removeStyle] Walking element tree...')

        // Check if the searchContainer itself is a span with the target style
        if (searchContainer instanceof HTMLSpanElement) {
            const styleValue = searchContainer.style.getPropertyValue(cssProp)
            console.log('[removeStyle] searchContainer is span:', searchContainer.textContent?.substring(0, 20),
                       'styleValue:', styleValue)
            if (styleValue && range.intersectsNode(searchContainer)) {
                console.log('[removeStyle] Adding searchContainer itself to process list')
                spansToProcess.push({ span: searchContainer, cssProp })
            }
        }

        const walker = document.createTreeWalker(
            searchContainer,
            NodeFilter.SHOW_ELEMENT,
            {
                acceptNode: (node) => {
                    if (node instanceof HTMLSpanElement) {
                        const styleValue = node.style.getPropertyValue(cssProp)
                        console.log('[removeStyle] Checking span:', node.textContent?.substring(0, 20),
                                   'styleValue:', styleValue, 'intersects:', range.intersectsNode(node))
                        if (styleValue && range.intersectsNode(node)) {
                            return NodeFilter.FILTER_ACCEPT
                        }
                    }
                    return NodeFilter.FILTER_SKIP
                }
            }
        )

        let node: Node | null
        while ((node = walker.nextNode())) {
            if (node instanceof HTMLSpanElement) {
                console.log('[removeStyle] Found span to process:', node.textContent?.substring(0, 20))
                spansToProcess.push({ span: node, cssProp })
            }
        }
    }

    console.log('[removeStyle] Total spans to process:', spansToProcess.length)

    // Process each span: split at selection boundaries and remove style from middle
    spansToProcess.forEach(({ span, cssProp }) => {
        console.log('[removeStyle] Processing span:', span.textContent?.substring(0, 20))

        // Get the text node inside the span
        const textNode = span.firstChild
        if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
            console.log('[removeStyle] ERROR: No text node in span')
            span.style.removeProperty(cssProp)
            return
        }

        // Create a range for the span's text content (character-level)
        const spanRange = document.createRange()
        spanRange.selectNodeContents(textNode)

        console.log('[removeStyle] spanRange (text node):', {
            startContainer: spanRange.startContainer.textContent?.substring(0, 10),
            startOffset: spanRange.startOffset,
            endContainer: spanRange.endContainer.textContent?.substring(0, 10),
            endOffset: spanRange.endOffset
        })

        console.log('[removeStyle] range:', {
            startContainer: range.startContainer.textContent?.substring(0, 10),
            startOffset: range.startOffset,
            endContainer: range.endContainer.textContent?.substring(0, 10),
            endOffset: range.endOffset
        })

        // Compare boundary points
        const startToStart = range.compareBoundaryPoints(Range.START_TO_START, spanRange)
        const startToEnd = range.compareBoundaryPoints(Range.START_TO_END, spanRange)
        const endToStart = range.compareBoundaryPoints(Range.END_TO_START, spanRange)
        const endToEnd = range.compareBoundaryPoints(Range.END_TO_END, spanRange)

        console.log('[removeStyle] Boundary comparisons:', {
            startToStart,
            startToEnd,
            endToStart,
            endToEnd
        })

        // Check if selection starts inside this span (at character level)
        // NOTE: Browser has inverted comparison results for START_TO_END and END_TO_START
        // For selection [3,7] inside span [0,10]:
        //   START_TO_START: 1 (3 vs 0) - correct, selection starts after span
        //   START_TO_END: 1 (3 vs 10) - inverted! Should be -1
        //   END_TO_START: -1 (7 vs 0) - inverted! Should be 1
        //   END_TO_END: -1 (7 vs 10) - correct, selection ends before span
        // So for "starts inside": startToStart > 0 && startToEnd > 0 (both positive means selection is after span start but comparison is inverted for end)
        // And for "ends inside": endToStart < 0 && endToEnd < 0 (endToStart inverted to negative)
        const startsInside = startToStart > 0 && startToEnd > 0  // selection starts inside span
        const endsInside = endToStart < 0 && endToEnd < 0       // selection ends inside span

        console.log('[removeStyle] startsInside:', startsInside, 'endsInside:', endsInside)

        // If selection fully contains the span, just remove the style
        if (range.compareBoundaryPoints(Range.START_TO_START, spanRange) <= 0 &&
            range.compareBoundaryPoints(Range.END_TO_END, spanRange) >= 0) {
            console.log('[removeStyle] Selection fully contains span - removing entire style')

            // Entire span is selected - remove style
            span.style.removeProperty(cssProp)
            if (!span.getAttribute('style')) {
                span.removeAttribute('style')
            }
            // Unwrap if no attributes remain
            if (!span.hasAttribute('style') && !span.className && !span.id) {
                const parent = span.parentNode
                if (parent) {
                    while (span.firstChild) {
                        parent.insertBefore(span.firstChild, span)
                    }
                    parent.removeChild(span)
                }
            }
        } else if (startsInside || endsInside) {
            console.log('[removeStyle] Partial selection - splitting span')

            // Partial selection - need to split the span
            const textNode = span.firstChild
            if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
                console.log('[removeStyle] ERROR: No text node in span')
                return
            }

            const text = textNode.textContent || ''
            const spanStart = 0
            const spanEnd = text.length

            console.log('[removeStyle] Text:', text, 'length:', text.length)

            // Calculate which parts are selected
            const rangeRelStart = range.compareBoundaryPoints(Range.START_TO_START, spanRange) > 0
                ? range.startOffset
                : 0
            const rangeRelEnd = range.compareBoundaryPoints(Range.END_TO_END, spanRange) < 0
                ? range.endOffset
                : text.length

            console.log('[removeStyle] rangeRelStart:', rangeRelStart, 'rangeRelEnd:', rangeRelEnd)

            // Clamp values
            const selStart = Math.max(0, Math.min(rangeRelStart, text.length))
            const selEnd = Math.max(0, Math.min(rangeRelEnd, text.length))

            console.log('[removeStyle] selStart:', selStart, 'selEnd:', selEnd)

            if (selStart >= selEnd) {
                console.log('[removeStyle] ERROR: Invalid selection range')
                return
            }

            const parent = span.parentNode
            if (!parent) {
                console.log('[removeStyle] ERROR: No parent')
                return
            }

            // Split into up to 3 parts: before, selected, after
            const beforeText = text.substring(0, selStart)
            const selectedText = text.substring(selStart, selEnd)
            const afterText = text.substring(selEnd)

            console.log('[removeStyle] Splitting:', {
                before: beforeText,
                selected: selectedText,
                after: afterText
            })

            // Create fragments - ALWAYS wrap all parts in spans to prevent merge issues
            // The normalizeDOM/mergeAdjacentSpans only merges adjacent SPANS, not text nodes
            // So text adjacent to a span with same style will NOT be absorbed
            const fragment = document.createDocumentFragment()

            if (beforeText) {
                const beforeSpan = span.cloneNode() as HTMLSpanElement
                beforeSpan.removeAttribute('id') // Don't clone IDs
                beforeSpan.textContent = beforeText
                fragment.appendChild(beforeSpan)
                console.log('[removeStyle] Added before span:', beforeText)
            }

            if (selectedText) {
                // Selected portion - always wrap in a span to prevent text absorption
                // Even without styles, the span prevents mergeAdjacentSpans from absorbing it
                const selectedSpan = document.createElement('span')
                selectedSpan.textContent = selectedText
                fragment.appendChild(selectedSpan)
                console.log('[removeStyle] Added selected span:', selectedText)
            }

            if (afterText) {
                const afterSpan = span.cloneNode() as HTMLSpanElement
                afterSpan.removeAttribute('id') // Don't clone IDs
                afterSpan.textContent = afterText
                fragment.appendChild(afterSpan)
                console.log('[removeStyle] Added after span:', afterText)
            }

            console.log('[removeStyle] Fragment children:', fragment.childNodes.length)

            // Replace original span with fragment
            parent.replaceChild(fragment, span)
            console.log('[removeStyle] Replaced original span')
        } else {
            console.log('[removeStyle] WARNING: Span intersects but not inside?')
            // Selection doesn't intersect this span properly - shouldn't happen
            span.style.removeProperty(cssProp)
        }
    })

    const block = getBlockParent(range.commonAncestorContainer)
    if (block) {
        console.log('[removeStyle] Before normalizeDOM:', block.innerHTML)
        normalizeDOM(block)
        console.log('[removeStyle] After normalizeDOM:', block.innerHTML)
    }

    // Restore selection from saved offsets
    if (savedSelection.block && savedSelection.startOffset >= 0 && savedSelection.endOffset >= 0) {
        restoreSelectionFromOffsets(
            savedSelection.block,
            savedSelection.startOffset,
            savedSelection.endOffset
        )
    }
}

/**
 * Get default style value for a property
 */
function getDefaultStyleValue(prop: string): string {
    const defaults: Record<string, string> = {
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        textDecorationLine: 'none',
        color: 'inherit',
        backgroundColor: 'transparent',
    }
    return defaults[prop] || ''
}

/**
 * Toggle a style on/off based on current selection state
 */
export function toggleStyle(prop: string, value: string): void {
    // D-01: derive shadow root from active selection focus node to enable getComposedRanges path
    const focusSr = getEditorShadowRoot(window.getSelection()?.focusNode)
    const range = safeGetRange(focusSr)
    if (!range) return

    // Save selection before any operations
    const savedSelection = saveSelectionAsOffsets(range)

    if (range.collapsed) {
        // Check if cursor is already in text with this style
        const container = range.startContainer
        if (hasStyle(container, prop, value)) {
            removeStyle(prop, savedSelection)
        } else {
            applyStyle(prop, value)
        }
        return
    }

    // For non-collapsed selection, check if ALL selected content has the style
    let allStyled = true
    const walker = document.createTreeWalker(
        range.commonAncestorContainer,
        NodeFilter.SHOW_TEXT,
        null
    )

    let node: Node | null
    while ((node = walker.nextNode())) {
        if (range.intersectsNode(node)) {
            if (!hasStyle(node, prop, value)) {
                allStyled = false
                break
            }
        }
    }

    if (allStyled) {
        removeStyle(prop, savedSelection)
    } else {
        applyStyle(prop, value)
    }
}

/**
 * Apply font-weight bold
 */
export function applyBold(): void {
    applyStyle('fontWeight', 'bold')
}

/**
 * Apply font-style italic
 */
export function applyItalic(): void {
    applyStyle('fontStyle', 'italic')
}

/**
 * Apply text-decoration underline
 */
export function applyUnderline(): void {
    applyStyle('textDecorationLine', 'underline')
}

/**
 * Apply text-decoration strikethrough
 */
export function applyStrikethrough(): void {
    applyStyle('textDecorationLine', 'line-through')
}

/**
 * Apply text color
 */
export function applyTextColor(color: string): void {
    applyStyle('color', color)
}

/**
 * Apply background color
 */
export function applyBackgroundColor(color: string): void {
    applyStyle('backgroundColor', color)
}

/**
 * Apply font family
 */
export function applyFontFamily(font: string): void {
    applyStyle('fontFamily', font)
}

/**
 * Apply font size
 */
export function applyFontSize(size: string): void {
    applyStyle('fontSize', size)
}

/**
 * Apply text-align
 */
export function applyTextAlign(align: string): void {
    // D-01: derive shadow root from active selection focus node to enable getComposedRanges path
    const focusSr = getEditorShadowRoot(window.getSelection()?.focusNode)
    const range = safeGetRange(focusSr)
    if (!range) return

    const sel = safeGetSelection()
    if (!sel) return

    // Save selection before any DOM operations
    const savedSelection = saveSelectionAsOffsets(range)

    // For text-align, we need to apply to block elements, not inline text
    const block = getBlockParent(range.commonAncestorContainer)
    if (!block) return

    // Apply text-align to the block
    block.style.textAlign = align

    // Normalize after operation
    normalizeDOM(block)

    // Restore selection from saved offsets
    if (savedSelection.block && savedSelection.startOffset >= 0 && savedSelection.endOffset >= 0) {
        restoreSelectionFromOffsets(
            savedSelection.block,
            savedSelection.startOffset,
            savedSelection.endOffset
        )
    }
}

/**
 * Apply block-level formatting (Normal, Heading 1-3, Quote, Code Block)
 * This wraps the selection in the specified block element with optional class
 */
export function applyFormatBlock(tag: string, className?: string): void {
    const range = safeGetRange()
    if (!range) return

    const sel = safeGetSelection()
    if (!sel) return

    // Find block parent
    let block = getBlockParent(range.commonAncestorContainer)

    // If no block found, use the editor root
    if (!block) {
        const editor = document.querySelector('[data-editor-root]') as HTMLElement
        if (editor) block = editor
    }

    if (!block) return

    // Check if selection is collapsed
    if (range.collapsed) {
        // For collapsed selection, just change the current block's tag/class
        const currentBlock = getBlockParent(range.startContainer)
        if (currentBlock) {
            const newEl = document.createElement(tag)
            newEl.className = className || ''

            // Move all children
            while (currentBlock.firstChild) {
                newEl.appendChild(currentBlock.firstChild)
            }

            // If no content, add a <br>
            if (newEl.childNodes.length === 0) {
                newEl.appendChild(document.createElement('br'))
            }

            currentBlock.parentNode?.replaceChild(newEl, currentBlock)

            // Restore selection inside new block
            const newRange = document.createRange()
            newRange.selectNodeContents(newEl)
            newRange.collapse(true)
            sel.removeAllRanges()
            sel.addRange(newRange)
        }
    } else {
        // Non-collapsed selection - wrap in block element
        const contents = range.extractContents()

        // Create new block element
        const newBlock = document.createElement(tag)
        newBlock.className = className || ''
        newBlock.appendChild(contents)

        // Insert at range position
        range.insertNode(newBlock)

        // Select the new block
        const newRange = document.createRange()
        newRange.selectNode(newBlock)
        sel.removeAllRanges()
        sel.addRange(newRange)
    }

    // Normalize the block
    if (block) {
        normalizeDOM(block)
    }
}

/**
 * Remove all inline formatting from the current selection
 * This removes all span elements with inline styles within the selection
 */
export function removeFormat(): void {
    const range = safeGetRange()
    if (!range) return

    const sel = safeGetSelection()
    if (!sel) return

    if (range.collapsed) {
        // For collapsed selection: find all styled spans at cursor and unwrap them
        const container = range.startContainer
        let node: Node | null = container

        // Find all parent spans with styles
        while (node && node.parentElement) {
            const el = node.parentElement
            if (el instanceof HTMLElement && el.tagName === 'SPAN' && el.hasAttribute('style')) {
                const parent = el.parentNode
                if (parent) {
                    while (el.firstChild) {
                        parent.insertBefore(el.firstChild, el)
                    }
                    parent.removeChild(el)
                }
            }
            node = node.parentElement
        }
    } else {
        // For non-collapsed selection: unwrap all styled spans within the range
        const fragment = range.extractContents()
        const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_ELEMENT)

        const spansToRemove: HTMLSpanElement[] = []
        let currentNode: Node | null = walker.currentNode as Node

        while (currentNode) {
            if (currentNode instanceof HTMLSpanElement && currentNode.hasAttribute('style')) {
                spansToRemove.push(currentNode)
            }
            currentNode = walker.nextNode()
        }

        // Unwrap each span
        spansToRemove.forEach(span => {
            const parent = span.parentNode
            if (parent) {
                while (span.firstChild) {
                    parent.insertBefore(span.firstChild, span)
                }
                parent.removeChild(span)
            }
        })

        range.insertNode(fragment)
    }
}

/**
 * Apply indent to selected blocks
 * Increases or decreases text-indent property
 */
export function applyIndent(isDecrease: boolean, amount: number = 20): void {
    // D-01: derive shadow root from active selection focus node to enable getComposedRanges path
    const focusSr = getEditorShadowRoot(window.getSelection()?.focusNode)
    const range = safeGetRange(focusSr)
    if (!range) return

    const sel = safeGetSelection()
    if (!sel) return

    // Save selection before any DOM operations
    const savedSelection = saveSelectionAsOffsets(range)

    // Get selected block elements
    const block = getBlockParent(range.commonAncestorContainer)
    if (!block) return

    const walker = document.createTreeWalker(
        block,
        NodeFilter.SHOW_ELEMENT,
        {
            acceptNode: (node) => {
                if (node instanceof HTMLElement) {
                    const tag = node.tagName.toUpperCase()
                    // Apply to block elements but not lists
                    if (BLOCK_TAGS.includes(tag) && !['UL', 'OL', 'LI'].includes(tag)) {
                        return NodeFilter.FILTER_ACCEPT
                    }
                }
                return NodeFilter.FILTER_SKIP
            }
        }
    )

    const blocksToIndent: HTMLElement[] = []
    let node: Node | null

    // For collapsed selection, just indent the current block
    if (range.collapsed) {
        const currentBlock = getBlockParent(range.startContainer)
        if (currentBlock && !['UL', 'OL', 'LI'].includes(currentBlock.tagName.toUpperCase())) {
            blocksToIndent.push(currentBlock)
        }
    } else {
        // For non-collapsed selection, find all blocks in range
        while ((node = walker.nextNode())) {
            if (range.intersectsNode(node)) {
                blocksToIndent.push(node as HTMLElement)
            }
        }
    }

    // Apply indent to each block
    blocksToIndent.forEach((blockElement, index) => {
        const currentValue = blockElement.style.textIndent ? parseInt(blockElement.style.textIndent) : 0
        const newValue = currentValue + (isDecrease ? -amount : amount)
        blockElement.style.textIndent = newValue < 0 ? '0px' : `${newValue}px`
        console.log(`[Indent] Block ${index + 1}: ${currentValue}px -> ${newValue}px`)
    })

    // Normalize after operation
    normalizeDOM(block)

    // Restore selection from saved offsets
    if (savedSelection.block && savedSelection.startOffset >= 0 && savedSelection.endOffset >= 0) {
        restoreSelectionFromOffsets(
            savedSelection.block,
            savedSelection.startOffset,
            savedSelection.endOffset
        )
    }
}

const BLOCK_TAGS = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'PRE', 'DIV']

/**
 * Apply list formatting (bullet, number, or checkbox)
 * Converts selected blocks to list items or toggles existing lists
 */
export function applyList(mode: 'bullet' | 'number' | 'checkbox'): void {
    // D-01: derive shadow root from active selection focus node to enable getComposedRanges path
    const focusSr = getEditorShadowRoot(window.getSelection()?.focusNode)
    const range = safeGetRange(focusSr)
    if (!range) return

    const sel = safeGetSelection()
    if (!sel) return

    // Save selection before any DOM operations
    const savedSelection = saveSelectionAsOffsets(range)

    // This function will handle:
    // 1. Creating new lists from paragraphs
    // 2. Toggling existing lists off
    // 3. Switching between list types

    // Note: Full implementation would be quite complex
    // For now, this is a placeholder that can be expanded

    console.log(`[applyList] Mode: ${mode}, Range: ${range.toString()}`)

    // Restore selection from saved offsets
    if (savedSelection.block && savedSelection.startOffset >= 0 && savedSelection.endOffset >= 0) {
        restoreSelectionFromOffsets(
            savedSelection.block,
            savedSelection.startOffset,
            savedSelection.endOffset
        )
    }
}
import { normalizeDOM } from './DOMNormalizer'
import { safeGetSelection, safeGetRange } from './BrowserCompat'

/** Derive shadow root from any node in the editor tree. */
function getEditorShadowRoot(node?: Node | null): ShadowRoot | undefined {
    const root = node?.getRootNode?.()
    return root instanceof ShadowRoot ? root : undefined
}

/**
 * Find the WUI Editor shadow root by querying for the editor element.
 * This is more reliable than deriving from window.getSelection().focusNode
 * because the focusNode may be outside the shadow DOM when selection is set
 * programmatically or in certain browser states.
 */
function findEditorShadowRoot(): ShadowRoot | undefined {
    // Try to find the wui-editor element
    const editor = document.querySelector('wui-editor')
    if (editor?.shadowRoot) {
        return editor.shadowRoot
    }
    // Fallback: try to derive from selection focus node
    const focusNode = window.getSelection()?.focusNode
    return getEditorShadowRoot(focusNode)
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
 * Get the style property associated with a semantic element
 * Returns the CSS property name that this semantic element represents
 */
function getSemanticElementStyle(tagName: string): string | null {
    const semanticMap: Record<string, string> = {
        'strong': 'font-weight',
        'b': 'font-weight',
        'em': 'font-style',
        'i': 'font-style',
        'u': 'text-decoration-line',
    }
    return semanticMap[tagName.toLowerCase()] || null
}

/**
 * Convert a semantic element (<strong>, <em>, <u>) to a <span> with inline style
 * Preserves any existing inline styles and moves children to the span
 */
function convertSemanticElementToSpan(element: HTMLElement): HTMLSpanElement {
    const span = document.createElement('span')
    const tagName = element.tagName.toLowerCase()

    // Copy any existing inline styles
    if (element.style.cssText) {
        span.style.cssText = element.style.cssText
    }

    // Add the semantic style as inline style
    if (tagName === 'strong' || tagName === 'b') {
        span.style.fontWeight = 'bold'
    } else if (tagName === 'em' || tagName === 'i') {
        span.style.fontStyle = 'italic'
    } else if (tagName === 'u') {
        span.style.textDecorationLine = 'underline'
    }

    // Move all children to the span
    while (element.firstChild) {
        span.appendChild(element.firstChild)
    }

    // Replace the semantic element with the span
    element.parentNode?.replaceChild(span, element)

    return span
}

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
    // For text-decoration-line, we need to check the entire ancestor chain
    // because text-decoration is NOT inherited in CSS
    const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase()

    if (cssProp === 'text-decoration' || cssProp === 'text-decoration-line') {
        // Walk up the tree to find if any ancestor has the text-decoration
        let current: Node | null = node;
        while (current) {
            if (current instanceof HTMLElement) {
                const el = current as HTMLElement;
                const styleValue = el.style.getPropertyValue('text-decoration-line') ||
                                   el.style.getPropertyValue('text-decoration');
                if (!value || styleValue.includes(value)) {
                    return true;
                }
            }
            current = current.parentNode;
        }
        // Also check computed style from immediate parent
        const styles = getComputedStyles(node);
        const currentValue = styles.getPropertyValue('text-decoration-line') ||
                            styles.getPropertyValue('text-decoration');
        if (!value) return currentValue !== 'none' && !!currentValue
        return currentValue.includes(value);
    }

    const styles = getComputedStyles(node)

    // Empty value means "check if the property has any non-default value"
    if (!value) {
        const currentValue = styles.getPropertyValue(cssProp)
        // Check if property is set to something other than default/normal
        if (cssProp === 'font-weight') {
            return normalizeFontWeight(currentValue) !== '400'
        }
        if (cssProp === 'font-style') {
            return currentValue !== 'normal'
        }
        if (cssProp === 'text-decoration' || cssProp === 'text-decoration-line') {
            return currentValue !== 'none' && !!currentValue
        }
        return !!currentValue
    }

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
    const blockTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'PRE', 'TD', 'TH']

    while (current) {
        if (current instanceof HTMLElement) {
            // Stop at the editor root — never indent the contenteditable container itself
            if ('editorRoot' in (current as HTMLElement).dataset) return null
            if (blockTags.includes(current.tagName)) return current
        }
        current = current.parentNode
    }
    return null
}

/**
 * Walk up to the [data-editor-root] element.
 * D-04: used as stable anchor for global character offset calculations.
 */
export function findEditorRoot(node: Node): HTMLElement | null {
    let current: Node | null = node
    while (current) {
        if (current instanceof HTMLElement && current.dataset && 'editorRoot' in current.dataset) {
            return current
        }
        current = current.parentNode
    }
    return null
}

/**
 * Check style state in a range (tri-state for button UI)
 * Returns: 'all' | 'nonemixed'
 */
export function getStyleStateInRange(range: Range, prop: string, value: string): 'all' | 'none' | 'mixed' {
    // For collapsed range, check if cursor is in styled text
    if (range.collapsed) {
        return hasStyle(range.startContainer, prop, value) ? 'all' : 'none'
    }

    // For non-collapsed range, check all text nodes
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
    let hasStyled = false
    let hasUnstyled = false

    while ((node = walker.nextNode())) {
        if (range.intersectsNode(node)) {
            if (hasStyle(node, prop, value)) {
                hasStyled = true
            } else {
                hasUnstyled = true
            }

            // Early exit if we find both
            if (hasStyled && hasUnstyled) {
                return 'mixed'
            }
        }
    }

    // No text nodes found
    if (!hasStyled && !hasUnstyled) {
        return 'none'
    }

    return hasStyled ? 'all' : 'none'
}

/**
 * Check if all nodes in a range have a specific style (legacy boolean version)
 */
export function hasStyleInRange(range: Range, prop: string, value: string): boolean {
    const state = getStyleStateInRange(range, prop, value)
    return state === 'all'
}

/**
 * Check if the text immediately before or after a non-collapsed selection
 * has the target style. Used to determine if a toggle-off was intended
 * even when the selected text itself doesn't have the style (e.g., after
 * a previous removeStyle operation created an unstyled middle span).
 */
function hasStyleInSurroundingContext(range: Range, prop: string, value: string): boolean {
    // Check text node just before selection start
    const startNode = range.startContainer
    if (startNode.nodeType === Node.TEXT_NODE && range.startOffset > 0) {
        // There's text before the selection in the same text node
        // Check the character just before the selection
        const beforeText = startNode.textContent?.charAt(range.startOffset - 1) || ''
        if (beforeText.trim()) {
            // Text exists before — check if the parent span has the style
            let el: HTMLElement | null = startNode.parentElement
            while (el) {
                if (el instanceof HTMLSpanElement && el.style.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase())) {
                    return true
                }
                el = el.parentElement
            }
        }
    } else {
        // Check sibling text nodes before selection for styled spans
        let node: Node | null = range.startContainer
        // Walk to previous sibling
        while (node && node !== range.commonAncestorContainer) {
            const prev = node.previousSibling
            if (prev && prev.textContent && prev.textContent.trim()) {
                // Found text before — check its parent for the style
                const parent = prev.parentElement
                if (parent instanceof HTMLSpanElement) {
                    const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase()
                    if (parent.style.getPropertyValue(cssProp)) return true
                }
                break
            }
            node = node.parentNode
        }
    }

    // Check text node just after selection end
    const endNode = range.endContainer
    if (endNode.nodeType === Node.TEXT_NODE && range.endOffset < (endNode.textContent?.length || 0)) {
        // There's text after the selection in the same text node
        const afterText = endNode.textContent?.charAt(range.endOffset) || ''
        if (afterText.trim()) {
            let el: HTMLElement | null = endNode.parentElement
            while (el) {
                if (el instanceof HTMLSpanElement && el.style.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase())) {
                    return true
                }
                el = el.parentElement
            }
        }
    } else {
        // Check sibling text nodes after selection for styled spans
        let node: Node | null = range.endContainer
        while (node && node !== range.commonAncestorContainer) {
            const next = node.nextSibling
            if (next && next.textContent && next.textContent.trim()) {
                const parent = next.parentElement
                if (parent instanceof HTMLSpanElement) {
                    const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase()
                    if (parent.style.getPropertyValue(cssProp)) return true
                }
                break
            }
            node = node.parentNode
        }
    }

    return false
}

/**
 * Save selection as global character offsets from the editor root.
 * D-04: editor-root-relative offsets survive cross-block selections and span wrapping.
 * Returns { editorRoot: null } if editor root cannot be found.
 */
export function saveSelectionAsOffsets(range: Range): {
    editorRoot: HTMLElement | null
    startOffset: number
    endOffset: number
} {
    const editorRoot = findEditorRoot(range.commonAncestorContainer)
    if (!editorRoot) return { editorRoot: null, startOffset: 0, endOffset: 0 }

    const walker = document.createTreeWalker(editorRoot, NodeFilter.SHOW_TEXT, null)
    let currentOffset = 0
    let startOffset = -1
    let endOffset = -1
    let node: Node | null

    while ((node = walker.nextNode())) {
        const textNode = node as Text
        const len = textNode.textContent?.length ?? 0

        if (startOffset === -1 && node === range.startContainer) {
            startOffset = currentOffset + range.startOffset
        }
        if (endOffset === -1 && node === range.endContainer) {
            endOffset = currentOffset + range.endOffset
        }

        currentOffset += len
        if (startOffset !== -1 && endOffset !== -1) break
    }

    if (startOffset === -1) startOffset = 0
    if (endOffset === -1) endOffset = startOffset

    return { editorRoot, startOffset, endOffset }
}

/**
 * Restore selection from global character offsets saved by saveSelectionAsOffsets.
 * D-04: walks from the editor root, not from a block parent.
 */
export function restoreSelectionFromOffsets(
    editorRoot: HTMLElement,
    startOffset: number,
    endOffset: number
): void {
    const sel = safeGetSelection()
    if (!sel) return

    const walker = document.createTreeWalker(editorRoot, NodeFilter.SHOW_TEXT, null)
    let currentOffset = 0
    let startNode: Text | null = null
    let startNodeOffset = 0
    let endNode: Text | null = null
    let endNodeOffset = 0
    let lastNode: Text | null = null
    let lastNodeLen = 0
    let node: Node | null

    while ((node = walker.nextNode())) {
        const textNode = node as Text
        const len = textNode.textContent?.length ?? 0

        if (startNode === null && startOffset >= currentOffset && startOffset < currentOffset + len) {
            startNode = textNode
            startNodeOffset = startOffset - currentOffset
        }
        if (endNode === null && endOffset >= currentOffset && endOffset <= currentOffset + len) {
            // When endOffset falls exactly at the boundary after this node,
            // prefer this node's end over the next node's start.
            // This prevents the restored range from extending into the next sibling.
            if (endOffset === currentOffset + len && len > 0) {
                endNode = textNode
                endNodeOffset = len
            } else if (endOffset < currentOffset + len) {
                endNode = textNode
                endNodeOffset = endOffset - currentOffset
            }
        }

        currentOffset += len
        lastNode = textNode
        lastNodeLen = len
        if (startNode !== null && endNode !== null) break
    }

    // Handle boundary offsets that landed exactly at the end of the last node
    if (!startNode && startOffset === currentOffset && lastNode) {
        startNode = lastNode
        startNodeOffset = lastNodeLen
    }
    if (!endNode && endOffset === currentOffset && lastNode) {
        endNode = lastNode
        endNodeOffset = lastNodeLen
    }

    if (startNode && endNode) {
        try {
            const newRange = document.createRange()
            newRange.setStart(startNode, startNodeOffset)
            newRange.setEnd(endNode, endNodeOffset)
            sel.removeAllRanges()
            sel.addRange(newRange)
        } catch (e) {
            console.warn('[restoreSelectionFromOffsets] Failed to restore selection:', e)
        }
    } else {
        console.warn('[restoreSelectionFromOffsets] Could not find nodes for offsets:', { startOffset, endOffset, startNodeFound: !!startNode, endNodeFound: !!endNode })
    }
}

/**
 * Apply a style to the current selection using DOM manipulation
 * Implements toggle logic: if style already exists, remove it
 * Replaces execCommand('bold') etc.
 */
export function applyStyle(prop: string, value: string): void {
    // D-01: Find editor shadow root directly (more reliable than focusNode derivation)
    const focusSr = findEditorShadowRoot()
    const range = safeGetRange(focusSr)
    if (!range) {
        console.warn('[applyStyle] No range found - returning early')
        return
    }

    const sel = safeGetSelection()
    if (!sel) return

    // D-08: capture selection text before DOM mutation for post-restoration verification
    const selectionTextBefore = sel.toString()

    // Save original selection as offsets BEFORE any DOM operations
    // D-17: For collapsed ranges, save BEFORE expandToWord so we can restore the
    // original caret position after formatting. expandToWord may expand to word,
    // but we want caret to stay at original position, not the expanded range.
    let savedSelection = saveSelectionAsOffsets(range)

    // Check if style already exists on selection (toggle check)
    const styleAlreadyApplied = hasStyleInRange(range, prop, value)
    // Also check surrounding context: if selection is between styled text,
    // the user likely wants to remove the style (toggle off).
    // This handles the case where removeStyle splits a multi-style span
    // and the middle portion loses all inline styles — subsequent un-style
    // clicks should still remove rather than re-apply the style.
    const surroundingHasStyle = !styleAlreadyApplied && !range.collapsed &&
        hasStyleInSurroundingContext(range, prop, value)

    if (styleAlreadyApplied || surroundingHasStyle) {
        // Toggle OFF: Remove the style
        removeStyle(prop, savedSelection)
        return
    }

    // Toggle ON: Apply the style
    let wrapper: HTMLElement | null = null
    let isCollapsedCaret = false

    if (range.collapsed) {
        // Expand to word if cursor is on a word, otherwise insert empty styled span
        const wordRange = expandToWord(range)
        if (wordRange && !wordRange.collapsed) {
            wrapper = applyStyleToRange(wordRange, prop, value)
            isCollapsedCaret = true
        } else {
            insertStyledEmptySpan(prop, value, focusSr)
            return
        }
    } else {
        wrapper = applyStyleToRange(range, prop, value)
    }

    // Normalize after operation
    const normalizeTarget = getBlockParent(range.commonAncestorContainer) ?? findEditorRoot(range.commonAncestorContainer)
    if (normalizeTarget) {
        normalizeDOM(normalizeTarget)
    }

    // D-08: Restore selection after DOM normalization
    if (isCollapsedCaret) {
        // D-17: After expand-to-word formatting, restore to ORIGINAL caret position
        // (not the expanded word range). The original offsets were saved before expansion.
        if (savedSelection.editorRoot && savedSelection.startOffset >= 0) {
            restoreSelectionFromOffsets(
                savedSelection.editorRoot,
                savedSelection.startOffset,
                savedSelection.endOffset
            )
        }
    } else if (selectionTextBefore && selectionTextBefore.trim() !== '') {
        // Non-collapsed selection: use text-based restoration with offset hint
        // The hint helps find the correct occurrence when text appears multiple times
        const offsetHint = savedSelection.startOffset >= 0 ? savedSelection.startOffset : undefined
        const found = findAndSelectText(savedSelection.editorRoot, selectionTextBefore, offsetHint)
        if (!found) {
            console.warn('[applyStyle] Text-based restoration failed for:', JSON.stringify(selectionTextBefore))
            // Fall back to offset-based restoration for cross-paragraph selections
            if (savedSelection.editorRoot && savedSelection.startOffset >= 0 && savedSelection.endOffset >= 0) {
                restoreSelectionFromOffsets(
                    savedSelection.editorRoot,
                    savedSelection.startOffset,
                    savedSelection.endOffset
                )
            }
        }
    } else if (savedSelection.editorRoot && savedSelection.startOffset >= 0 && savedSelection.endOffset >= 0) {
        // Collapsed selection (caret only): use offset-based restoration
        // Safe because caret position doesn't depend on surrounding structure
        restoreSelectionFromOffsets(
            savedSelection.editorRoot,
            savedSelection.startOffset,
            savedSelection.endOffset
        )
    } else if (!savedSelection.editorRoot) {
        console.warn('[applyStyle] Could not find editor root for selection restoration — cursor may be lost')
    }
}

/**
 * Find and select text content in editor after DOM normalization
 * Uses approximate offset hint to disambiguate multiple occurrences
 * Returns true if found and selected, false otherwise
 */
function findAndSelectText(
    editorRoot: HTMLElement,
    textToFind: string,
    approximateOffsetHint?: number
): boolean {
    if (!textToFind) return false

    const walker = document.createTreeWalker(editorRoot, NodeFilter.SHOW_TEXT, null)
    let node: Node | null
    let currentOffset = 0
    let closestMatch: { node: Text; index: number; offset: number } | null = null

    while ((node = walker.nextNode())) {
        const textNode = node as Text
        const text = textNode.textContent || ''
        const len = text.length
        let searchStart = 0

        // Find all occurrences in this text node
        while (searchStart < text.length) {
            const index = text.indexOf(textToFind, searchStart)
            if (index === -1) break

            const occurrenceOffset = currentOffset + index

            // If we have an offset hint, find the closest match
            if (approximateOffsetHint !== undefined && approximateOffsetHint >= 0) {
                if (closestMatch === null) {
                    closestMatch = { node: textNode, index, offset: occurrenceOffset }
                } else {
                    // Keep the match closest to the hint
                    const currentDistance = Math.abs(closestMatch.offset - approximateOffsetHint)
                    const newDistance = Math.abs(occurrenceOffset - approximateOffsetHint)
                    if (newDistance < currentDistance) {
                        closestMatch = { node: textNode, index, offset: occurrenceOffset }
                    }
                }
            } else {
                // No offset hint - select first occurrence (old behavior)
                const sel = safeGetSelection()
                if (!sel) return false

                try {
                    const newRange = document.createRange()
                    newRange.setStart(textNode, index)
                    newRange.setEnd(textNode, index + textToFind.length)
                    sel.removeAllRanges()
                    sel.addRange(newRange)
                    return true
                } catch (e) {
                    console.warn('[findAndSelectText] Failed to select text:', e)
                    return false
                }
            }

            searchStart = index + 1
        }

        currentOffset += len
    }

    // If we have a closest match (from offset hint), select it
    if (closestMatch) {
        const sel = safeGetSelection()
        if (!sel) return false

        try {
            const newRange = document.createRange()
            newRange.setStart(closestMatch.node, closestMatch.index)
            newRange.setEnd(closestMatch.node, closestMatch.index + textToFind.length)
            sel.removeAllRanges()
            sel.addRange(newRange)
            return true
        } catch (e) {
            console.warn('[findAndSelectText] Failed to select text:', e)
            return false
        }
    }

    return false
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
 * D-14: Must use shadowRoot.getSelection() for shadow DOM editors
 */
function insertStyledEmptySpan(prop: string, value: string, shadowRoot?: ShadowRoot): void {
    // D-14: For shadow DOM, use shadowRoot.getSelection() which correctly
    // returns the selection inside the shadow tree
    let sel: Selection | null = null
    if (shadowRoot) {
        sel = shadowRoot.getSelection()
    }
    if (!sel) {
        sel = safeGetSelection()
    }

    if (!sel || sel.rangeCount === 0) return

    const range = sel.getRangeAt(0)

    const span = document.createElement('span')
    // D-15: Use direct style property assignment for better compatibility
    // setProperty works but requires the CSS property name (font-weight vs fontWeight)
    // Using direct assignment is more reliable for camelCase JS property names
    if (prop === 'fontWeight') {
        span.style.fontWeight = value
    } else if (prop === 'fontStyle') {
        span.style.fontStyle = value
    } else if (prop === 'textDecoration') {
        span.style.textDecoration = value
    } else {
        span.style.setProperty(prop, value)
    }
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
export function removeStyle(prop: string, savedSelection?: { editorRoot: HTMLElement | null, startOffset: number, endOffset: number }): void {
    // D-01: Find editor shadow root directly (more reliable than focusNode derivation)
    const focusSr = findEditorShadowRoot()
    const range = safeGetRange(focusSr)
    if (!range) return

    const sel = safeGetSelection()
    if (!sel) return

    // D-08: capture for post-restore verification
    const selectionTextBefore = sel.toString()

    // Save original selection if not provided
    if (!savedSelection) {
        savedSelection = saveSelectionAsOffsets(range)
    }

    if (range.collapsed) {
        // For collapsed selection: find current style at cursor and unwrap
        const container = range.startContainer
        if (hasStyle(container, prop, '')) {
            // Save caret position as text offset before unwrapping
            const savedSel = saveSelectionAsOffsets(range)
            const editorRoot = savedSel.editorRoot

            // Find the styled span containing the cursor
            let node: Node | null = container
            while (node && node.parentElement) {
                const el = node.parentElement
                if (el instanceof HTMLElement && el.tagName === 'SPAN') {
                    // CSSStyleDeclaration.removeProperty expects kebab-case CSS property name
                    const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase()
                    el.style.removeProperty(cssProp)
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

            // Restore caret position after DOM unwrap
            if (editorRoot && savedSel.startOffset >= 0) {
                restoreSelectionFromOffsets(editorRoot, savedSel.startOffset, savedSel.endOffset)
            }
        }
        return
    }


    // For non-collapsed selection: split spans at selection boundaries
    // then remove style only from the selected portion

    // Find all styled spans that intersect with the selection
    const spansToProcess: { span: HTMLSpanElement, cssProp: string }[] = []

    let searchContainer = range.commonAncestorContainer

    if (searchContainer.nodeType === Node.TEXT_NODE && searchContainer.parentElement) {
        searchContainer = searchContainer.parentElement
    }

    // Collect all spans with the target style
    const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase()

    if (searchContainer instanceof HTMLElement) {

        // Check if the searchContainer itself is a span with the target style
        if (searchContainer instanceof HTMLSpanElement) {
            const styleValue = searchContainer.style.getPropertyValue(cssProp)
            if (styleValue && range.intersectsNode(searchContainer)) {
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
                spansToProcess.push({ span: node, cssProp })
            }
        }
    }

    // If no spans found by walking DOWN, the style may come from an ancestor span OR semantic element.
    // This handles nested structures like:
    // - <span style="font-weight:bold"><span style="font-style:italic">text</span></span>
    // - <strong><span style="font-style:italic">text</span></strong>
    // where removeStyle is called on a selection whose immediate parent has no inline bold.
    if (spansToProcess.length === 0) {
        let ancestor: Node | null = range.commonAncestorContainer
        if (ancestor.nodeType === Node.TEXT_NODE) ancestor = ancestor.parentNode
        const editorRootForAncestor = findEditorRoot(range.commonAncestorContainer)

        while (ancestor && ancestor !== editorRootForAncestor) {
            // Check for semantic elements (strong, em, u) that need conversion to spans
            if (ancestor instanceof HTMLElement) {
                const tagName = ancestor.tagName.toLowerCase()
                const semanticStyle = getSemanticElementStyle(tagName)

                if (semanticStyle) {

                    // Check if this semantic element has the style we're removing
                    const computedStyle = window.getComputedStyle(ancestor)
                    const computedValue = computedStyle.getPropertyValue(cssProp)

                    // For font-weight: strong/b have fontWeight='700' (bold)
                    // For font-style: em/i have fontStyle='italic'
                    // For text-decoration: u has textDecoration='underline'
                    if (computedValue && computedValue !== 'normal' && computedValue !== 'none') {
                        // Convert semantic element to span with inline style
                        const span = convertSemanticElementToSpan(ancestor as HTMLElement)
                        spansToProcess.push({ span, cssProp })
                        break
                    }
                } else if (ancestor instanceof HTMLSpanElement) {
                    // Regular span with inline style
                    const styleValue = ancestor.style.getPropertyValue(cssProp)
                    if (styleValue) {
                        spansToProcess.push({ span: ancestor, cssProp })
                        break
                    }
                }
            }
            ancestor = ancestor.parentNode
        }
    }

    // Also check for semantic elements that intersect with the selection range
    // This handles cases like <strong>full tool<span>bar demo</span></strong>
    // where "bar demo" is selected but "full tool" is not
    if (searchContainer instanceof HTMLElement) {
        const semanticElements = searchContainer.querySelectorAll('strong, b, em, i, u')
        for (const el of semanticElements) {
            if (!range.intersectsNode(el)) continue

            const tagName = el.tagName.toLowerCase()
            const semanticStyle = getSemanticElementStyle(tagName)

            if (semanticStyle === cssProp) {
                // This semantic element contributes to the style we're removing
                // Check if it's already in our list (was converted from ancestor walk)
                const alreadyProcessed = spansToProcess.some(s => s.span === el)
                if (!alreadyProcessed) {
                    // Convert to span and add to process list
                    const span = convertSemanticElementToSpan(el as HTMLElement)
                    spansToProcess.push({ span, cssProp })
                }
            }
        }
    }


    // Process each span: split at selection boundaries and remove style from middle
    spansToProcess.forEach(({ span, cssProp }) => {

        // CRITICAL: After semantic element conversion, the span may have nested elements
        // We need to check if the span has ONLY a single text child

        // Get the text node inside the span
        const textNode = span.firstChild

        // Check if the span has ONLY a single text child (simple case)
        const hasOnlySingleTextChild = textNode &&
            textNode.nodeType === Node.TEXT_NODE &&
            span.childNodes.length === 1

        if (!hasOnlySingleTextChild) {
            // The span contains nested elements or multiple children
            // This happens when a semantic element like <strong> contains mixed content
            // e.g., <strong>text <em>selected</em> more text</strong>
            // We need to find the selected portion within the nested structure

            // For now, we need to handle the case where selection is inside nested spans
            // The selection is inside one of the child elements
            // We should split the outer span while preserving inner styling

            // Find which child contains the selection (including deeply nested elements)
            // CRITICAL: Use the LIVE range, not the saved selectionStartContainer.
            // The saved container may point to a node that was wrapped/replaced during
            // previous style operations. The browser maintains the live range correctly.
            const liveRangeForNested = range.cloneRange()
            const selectionAnchor = liveRangeForNested.startContainer
            let selectedChild: Node | null = null

            for (const child of Array.from(span.childNodes)) {
                // Check if this child or any of its descendants contains the selection anchor
                // We need to handle deeply nested structures like: span > italic-span > underline-span > text
                if (child.contains(selectionAnchor)) {
                    selectedChild = child
                    break
                }
            }

            if (selectedChild) {

                // Determine which children are before, selected, and after
                const children = Array.from(span.childNodes)
                const selectedIdx = children.indexOf(selectedChild)

                // Build the new structure:
                // - before: children before selected, wrapped in span with current style
                // - selected: the selected child WITHOUT the current style (unwrap if needed)
                // - after: children after selected, wrapped in span with current style

                const parent = span.parentNode
                if (!parent) return

                const fragment = document.createDocumentFragment()

                // Add "before" children
                if (selectedIdx > 0) {
                    const beforeSpan = span.cloneNode(false) as HTMLSpanElement
                    beforeSpan.removeAttribute('id')
                    for (let i = 0; i < selectedIdx; i++) {
                        beforeSpan.appendChild(children[i].cloneNode(true))
                    }
                    if (beforeSpan.childNodes.length > 0) {
                        fragment.appendChild(beforeSpan)
                    }
                }

                // Check if selection only partially covers the selected child's text.
                // If so, we need to split the selected child at the text level so only
                // the actually-selected portion loses the outer style.
                // This handles: bold > italic > underline > "New York" where "ew Yo" is selected.
                const selText = range.toString()
                const childFullText = selectedChild.textContent || ''
                const isPartialSelection = selText.length < childFullText.length &&
                    selectedChild.nodeType === Node.ELEMENT_NODE &&
                    (selectedChild as HTMLElement).childNodes.length > 0

                if (isPartialSelection) {
                    // We need to recursively split the selected child to extract
                    // before/selected/after at the deepest text level.
                    // Strategy: temporarily remove the target style from the span,
                    // then call removeStyle recursively on the selected child to do
                    // the actual text-level split (which preserves the inner styles),
                    // then re-wrap before/after with the original style.

                    // Save current span's style
                    const savedStyleValue = span.style.getPropertyValue(cssProp)
                    span.style.removeProperty(cssProp)
                    if (!span.getAttribute('style')) span.removeAttribute('style')

                    // Now the span has no target style. Call removeStyle on the
                    // selected child (which still has the target style from its
                    // parent's perspective — actually no, the parent lost it).
                    // We need a different approach: directly split the selectedChild
                    // at text level, then wrap before/after in the original style.

                    // Clone the selected child and operate on the clone
                    const childClone = selectedChild.cloneNode(true) as HTMLElement

                    // Find the deepest text node and split it at selection boundaries
                    const selLiveRange = range.cloneRange()
                    const selStartContainer = selLiveRange.startContainer
                    const selEndContainer = selLiveRange.endContainer

                    // Walk down to find text nodes within childClone that correspond
                    // to the selection boundaries
                    const childWalker = document.createTreeWalker(childClone, NodeFilter.SHOW_TEXT)
                    let textNodesInChild: Text[] = []
                    let tn: Text | null
                    while ((tn = childWalker.nextNode() as Text | null)) {
                        textNodesInChild.push(tn)
                    }

                    // Find which text nodes contain the selection boundaries
                    // by comparing with the original child's text nodes
                    const origWalker = document.createTreeWalker(selectedChild, NodeFilter.SHOW_TEXT)
                    let origTextNodes: Text[] = []
                    let otn: Text | null
                    while ((otn = origWalker.nextNode() as Text | null)) {
                        origTextNodes.push(otn)
                    }

                    // Map selection to text nodes in childClone
                    let selStartTextIdx = -1, selEndTextIdx = -1
                    let selStartOff = 0, selEndOff = 0

                    for (let i = 0; i < origTextNodes.length; i++) {
                        if (origTextNodes[i] === selStartContainer || origTextNodes[i].contains(selStartContainer)) {
                            selStartTextIdx = i
                            selStartOff = selStartContainer === origTextNodes[i] ? selLiveRange.startOffset : 0
                        }
                        if (origTextNodes[i] === selEndContainer || origTextNodes[i].contains(selEndContainer)) {
                            selEndTextIdx = i
                            selEndOff = selEndContainer === origTextNodes[i] ? selLiveRange.endOffset : origTextNodes[i].textContent?.length || 0
                        }
                    }

                    if (selStartTextIdx >= 0 && selEndTextIdx >= 0 && textNodesInChild.length === origTextNodes.length) {
                        // Build before/selected/after fragments from the clone
                        const childFragment = document.createDocumentFragment()

                        // When start and end are in the same text node, the end offset
                        // is relative to the original text. After trimming the start,
                        // we need to adjust: substring(selStartOff) then substring(0, selEndOff - selStartOff)
                        const sameTextNode = selStartTextIdx === selEndTextIdx

                        // Before: text nodes 0 to selStartTextIdx-1 + partial text of selStartTextIdx
                        if (selStartTextIdx > 0 || selStartOff > 0) {
                            const beforeClone = childClone.cloneNode(true) as HTMLElement
                            const bw = document.createTreeWalker(beforeClone, NodeFilter.SHOW_TEXT)
                            let bTextNodes: Text[] = []
                            let btn: Text | null
                            while ((btn = bw.nextNode() as Text | null)) bTextNodes.push(btn)

                            // Trim: keep only text up to selStartTextIdx-1 full, plus selStartTextIdx partial
                            for (let i = bTextNodes.length - 1; i > selStartTextIdx; i--) {
                                // Remove later text nodes' content
                                bTextNodes[i].textContent = ''
                            }
                            if (selStartOff > 0 && selStartTextIdx < bTextNodes.length) {
                                bTextNodes[selStartTextIdx].textContent = bTextNodes[selStartTextIdx].textContent?.substring(0, selStartOff) || ''
                            }
                            // Remove any empty ancestor elements
                            // Wrap in original style span
                            const styledBefore = span.cloneNode(false) as HTMLSpanElement
                            styledBefore.removeAttribute('id')
                            styledBefore.style.setProperty(cssProp, savedStyleValue)
                            styledBefore.appendChild(beforeClone)
                            childFragment.appendChild(styledBefore)
                        }

                        // Selected: partial text from selStartTextIdx to selEndTextIdx
                        {
                            const selectedClone = childClone.cloneNode(true) as HTMLElement
                            const sw = document.createTreeWalker(selectedClone, NodeFilter.SHOW_TEXT)
                            let sTextNodes: Text[] = []
                            let stn: Text | null
                            while ((stn = sw.nextNode() as Text | null)) sTextNodes.push(stn)

                            // Trim before
                            for (let i = 0; i < selStartTextIdx; i++) {
                                sTextNodes[i].textContent = ''
                            }
                            if (selStartTextIdx < sTextNodes.length) {
                                sTextNodes[selStartTextIdx].textContent = sTextNodes[selStartTextIdx].textContent?.substring(selStartOff) || ''
                            }
                            // Trim after
                            for (let i = selEndTextIdx + 1; i < sTextNodes.length; i++) {
                                sTextNodes[i].textContent = ''
                            }
                            if (selEndTextIdx < sTextNodes.length && selEndOff < (sTextNodes[selEndTextIdx].textContent?.length || 0)) {
                                const adjustedEndOff = sameTextNode ? selEndOff - selStartOff : selEndOff
                                sTextNodes[selEndTextIdx].textContent = sTextNodes[selEndTextIdx].textContent?.substring(0, adjustedEndOff) || ''
                            }
                            // No style wrapper - this is the selected portion losing the style
                            childFragment.appendChild(selectedClone)
                        }

                        // After: partial text of selEndTextIdx + text nodes after selEndTextIdx
                        if (selEndTextIdx < textNodesInChild.length - 1 || selEndOff < (textNodesInChild[selEndTextIdx]?.textContent?.length || 0)) {
                            const afterClone = childClone.cloneNode(true) as HTMLElement
                            const aw = document.createTreeWalker(afterClone, NodeFilter.SHOW_TEXT)
                            let aTextNodes: Text[] = []
                            let atn: Text | null
                            while ((atn = aw.nextNode() as Text | null)) aTextNodes.push(atn)

                            // Trim before
                            for (let i = 0; i < selEndTextIdx; i++) {
                                aTextNodes[i].textContent = ''
                            }
                            if (selEndTextIdx < aTextNodes.length) {
                                aTextNodes[selEndTextIdx].textContent = aTextNodes[selEndTextIdx].textContent?.substring(selEndOff) || ''
                            }
                            const styledAfter = span.cloneNode(false) as HTMLSpanElement
                            styledAfter.removeAttribute('id')
                            styledAfter.style.setProperty(cssProp, savedStyleValue)
                            styledAfter.appendChild(afterClone)
                            childFragment.appendChild(styledAfter)
                        }

                        // Clean up empty elements in the fragment
                        // Remove empty text nodes and empty elements
                        const cleanupWalker = document.createTreeWalker(childFragment, NodeFilter.SHOW_ELEMENT)
                        let el: HTMLElement | null
                        const emptyEls: HTMLElement[] = []
                        while ((el = cleanupWalker.nextNode() as HTMLElement | null)) {
                            if (!el.textContent?.trim() && el.childNodes.length === 0) {
                                emptyEls.push(el)
                            }
                        }
                        for (const empty of emptyEls) {
                            empty.parentNode?.removeChild(empty)
                        }

                        fragment.appendChild(childFragment)
                    } else {
                        // Fallback: couldn't map selection to text nodes, unwrap entire child
                        const selectedClone = selectedChild.cloneNode(true)
                        fragment.appendChild(selectedClone)
                    }
                } else {
                    // Add "selected" child - UNWRAPPED from the bold style
                    // This is the key: we're removing the font-weight from this portion
                    const selectedClone = selectedChild.cloneNode(true)
                    fragment.appendChild(selectedClone)
                }

                // Add "after" children
                if (selectedIdx < children.length - 1) {
                    const afterSpan = span.cloneNode(false) as HTMLSpanElement
                    afterSpan.removeAttribute('id')
                    for (let i = selectedIdx + 1; i < children.length; i++) {
                        afterSpan.appendChild(children[i].cloneNode(true))
                    }
                    if (afterSpan.childNodes.length > 0) {
                        fragment.appendChild(afterSpan)
                    }
                }

                // Replace original span with fragment
                parent.replaceChild(fragment, span)

                // Normalize to merge adjacent text nodes
                normalizeDOM(parent as HTMLElement)
            } else {
                // selectedChild is null — the browser re-anchored the range to an ancestor
                // after DOM mutation (e.g., convertSemanticElementToSpan replaced <strong>).
                // Use savedSelection (global offsets relative to editor root, captured BEFORE
                // DOM mutation) to find which text nodes in the span intersect with the selection.

                if (!savedSelection || !savedSelection.editorRoot) {
                    // Fallback: no saved selection, remove style from entire span
                    span.style.removeProperty(cssProp)
                    if (!span.getAttribute('style')) span.removeAttribute('style')
                    if (!span.hasAttribute('style') && !span.className && !span.id) {
                        const parent = span.parentNode
                        if (parent) {
                            while (span.firstChild) parent.insertBefore(span.firstChild, span)
                            parent.removeChild(span)
                        }
                    }
                    return
                }

                const { editorRoot, startOffset: globalSelStart, endOffset: globalSelEnd } = savedSelection

                // Walk all text nodes from editor root, accumulating global offsets.
                // Collect only those text nodes that are descendants of the span.
                const editorWalker = document.createTreeWalker(editorRoot, NodeFilter.SHOW_TEXT)
                const textNodes: { node: Text; globalStart: number; globalEnd: number }[] = []
                let globalOffset = 0
                let etn: Text | null
                while ((etn = editorWalker.nextNode() as Text | null)) {
                    const len = etn.textContent?.length || 0
                    // Check if this text node is inside the span
                    if (span.contains(etn)) {
                        textNodes.push({ node: etn, globalStart: globalOffset, globalEnd: globalOffset + len })
                    }
                    globalOffset += len
                }

                // Find which text nodes intersect with [globalSelStart, globalSelEnd]
                const intersecting = textNodes.filter(
                    tn => tn.globalStart < globalSelEnd && tn.globalEnd > globalSelStart
                )

                if (intersecting.length > 0) {

                    // Map intersecting text nodes to their topmost child of span
                    const selectedChildren = new Set<Node>()
                    for (const { node: n } of intersecting) {
                        let child: Node | null = n
                        while (child && child.parentNode !== span) {
                            child = child.parentNode
                        }
                        if (child) selectedChildren.add(child)
                    }

                    const selectedChildrenArr = Array.from(selectedChildren)
                    const children = Array.from(span.childNodes)
                    const selectedIndices = selectedChildrenArr.map(c => children.indexOf(c)).filter(i => i >= 0).sort((a, b) => a - b)

                    if (selectedIndices.length > 0) {
                        const firstIdx = selectedIndices[0]
                        const lastIdx = selectedIndices[selectedIndices.length - 1]

                        const parent = span.parentNode
                        if (!parent) return

                        const fragment = document.createDocumentFragment()

                        // Add "before" children (wrapped in styled span)
                        if (firstIdx > 0) {
                            const beforeSpan = span.cloneNode(false) as HTMLSpanElement
                            beforeSpan.removeAttribute('id')
                            for (let i = 0; i < firstIdx; i++) {
                                beforeSpan.appendChild(children[i].cloneNode(true))
                            }
                            if (beforeSpan.childNodes.length > 0) {
                                fragment.appendChild(beforeSpan)
                            }
                        }

                        // Add "selected" children - UNWRAPPED (no bold style)
                        for (let i = firstIdx; i <= lastIdx; i++) {
                            fragment.appendChild(children[i].cloneNode(true))
                        }

                        // Add "after" children (wrapped in styled span)
                        if (lastIdx < children.length - 1) {
                            const afterSpan = span.cloneNode(false) as HTMLSpanElement
                            afterSpan.removeAttribute('id')
                            for (let i = lastIdx + 1; i < children.length; i++) {
                                afterSpan.appendChild(children[i].cloneNode(true))
                            }
                            if (afterSpan.childNodes.length > 0) {
                                fragment.appendChild(afterSpan)
                            }
                        }

                        parent.replaceChild(fragment, span)
                        normalizeDOM(parent as HTMLElement)
                    } else {
                        span.style.removeProperty(cssProp)
                        if (!span.getAttribute('style')) span.removeAttribute('style')
                        if (!span.hasAttribute('style') && !span.className && !span.id) {
                            const parent = span.parentNode
                            if (parent) {
                                while (span.firstChild) parent.insertBefore(span.firstChild, span)
                                parent.removeChild(span)
                            }
                        }
                    }
                } else {
                    // Fallback: no intersecting text nodes found via saved offsets
                    span.style.removeProperty(cssProp)
                    if (!span.getAttribute('style')) span.removeAttribute('style')
                    if (!span.hasAttribute('style') && !span.className && !span.id) {
                        const parent = span.parentNode
                        if (parent) {
                            while (span.firstChild) parent.insertBefore(span.firstChild, span)
                            parent.removeChild(span)
                        }
                    }
                }
            }
            return
        }

        // CRITICAL: Use the CURRENT live range, not saved offsets
        // After DOM manipulation (italic, underline applied), the saved offsets
        // are relative to the ORIGINAL text nodes which no longer exist in the same form.
        // The browser maintains the live range correctly across DOM changes.
        const liveRange = range.cloneRange()

        // Get the text content of the text node
        const text = textNode.textContent || ''

        // Create a range for the span's text content
        const spanRange = document.createRange()
        spanRange.selectNodeContents(textNode)

        // Check intersection using the live range
        // intersectsNode checks if the range intersects with the node at all
        if (!liveRange.intersectsNode(span)) {
            return
        }

        // Calculate the intersection between live range and span range
        // We need to determine: what portion of THIS span is selected?

        const startToStart = liveRange.compareBoundaryPoints(Range.START_TO_START, spanRange)
        const startToEnd = liveRange.compareBoundaryPoints(Range.START_TO_END, spanRange)
        const endToStart = liveRange.compareBoundaryPoints(Range.END_TO_START, spanRange)
        const endToEnd = liveRange.compareBoundaryPoints(Range.END_TO_END, spanRange)

        // Determine the selected portion within THIS span:
        // - If liveRange starts before span: selection starts at 0
        // - If liveRange starts inside span: selection starts at the offset
        // - If liveRange ends after span: selection ends at text.length
        // - If liveRange ends inside span: selection ends at the offset

        let selStart: number, selEnd: number

        if (startToStart <= 0) {
            // Selection starts before or at the start of this span
            selStart = 0
        } else {
            // Selection starts inside this span
            // We need to find the offset within THIS text node
            // The liveRange.startContainer might be a different text node
            if (liveRange.startContainer === textNode) {
                selStart = liveRange.startOffset
            } else {
                // Selection starts in a different text node that intersects this span
                // This can happen when the selection spans multiple text nodes
                // In this case, the selection fully contains this text node
                selStart = 0
            }
        }

        if (endToEnd >= 0) {
            // Selection ends after or at the end of this span
            selEnd = text.length
        } else {
            // Selection ends inside this span
            if (liveRange.endContainer === textNode) {
                selEnd = liveRange.endOffset
            } else {
                // Selection ends in a different text node
                selEnd = text.length
            }
        }

        // Check if selection fully contains the span
        const selectionFullyContainsSpan = selStart === 0 && selEnd === text.length

        if (selectionFullyContainsSpan) {
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
        } else if (selStart < selEnd) {
            // Partial selection - need to split the span
            const firstChild = span.firstChild
            if (!firstChild || firstChild.nodeType !== Node.TEXT_NODE) {
                // When span contains nested elements, we need to find the selected child element(s)
                // and remove the style only from those, preserving it on the rest

                // Get all direct children of the span
                const children = Array.from(span.childNodes)

                // Find which children intersect with the selection
                // For simplicity, if ANY child is selected, we split around it
                // A more precise implementation would check each child's position relative to the selection

                // Create three parts: before selected child(ren), selected child(ren), after selected child(ren)
                const parent = span.parentNode
                if (!parent) return

                const fragment = document.createDocumentFragment()

                // Clone span for "before" part (keep style)
                const beforeSpan = span.cloneNode(false) as HTMLSpanElement
                beforeSpan.removeAttribute('id')

                // Selected part - remove the style property
                const selectedSpan = span.cloneNode(false) as HTMLSpanElement
                selectedSpan.removeAttribute('id')
                selectedSpan.style.removeProperty(cssProp)
                if (!selectedSpan.getAttribute('style')) {
                    selectedSpan.removeAttribute('style')
                }

                // Clone span for "after" part (keep style)
                const afterSpan = span.cloneNode(false) as HTMLSpanElement
                afterSpan.removeAttribute('id')

                // Distribute children based on selection
                // For nested case like <span bold>full <u><em>toolbar</em></u> demo</span>
                // When removing bold from "toolbar":
                // - beforeSpan gets "full " text node
                // - selectedSpan gets <u><em>toolbar</em></u> element
                // - afterSpan gets " demo" text node

                let foundSelectionStart = false
                let foundSelectionEnd = false

                for (const child of children) {
                    // Check if this child contains or is part of the selection
                    const childText = child.textContent || ''
                    const isInsideSelection = childText.includes(selectionTextContent)

                    if (!foundSelectionStart && isInsideSelection) {
                        foundSelectionStart = true
                        // This child (or its descendant) is selected
                        if (selectedSpan) {
                            selectedSpan.appendChild(child.cloneNode(true))
                        }
                    } else if (foundSelectionStart && !foundSelectionEnd) {
                        // Check if selection continues in this child
                        if (isInsideSelection || (selectionTextContent && childText.includes(selectionTextContent.substring(0, 10)))) {
                            selectedSpan.appendChild(child.cloneNode(true))
                        } else {
                            foundSelectionEnd = true
                            afterSpan.appendChild(child.cloneNode(true))
                        }
                    } else if (!foundSelectionStart) {
                        // Before selection
                        beforeSpan.appendChild(child.cloneNode(true))
                    } else {
                        // After selection
                        afterSpan.appendChild(child.cloneNode(true))
                    }
                }

                // Add parts to fragment (only if they have content)
                if (beforeSpan.childNodes.length > 0) {
                    fragment.appendChild(beforeSpan)
                }

                // Unwrap selected span if it has no style/attributes
                if (selectedSpan.childNodes.length > 0) {
                    if (!selectedSpan.hasAttribute('style') && !selectedSpan.className && !selectedSpan.id) {
                        // Move children directly to fragment
                        while (selectedSpan.firstChild) {
                            fragment.appendChild(selectedSpan.firstChild)
                        }
                    } else {
                        fragment.appendChild(selectedSpan)
                    }
                }

                if (afterSpan.childNodes.length > 0) {
                    fragment.appendChild(afterSpan)
                }

                // Replace original span with fragment
                parent.replaceChild(fragment, span)
                return
            }

            // Split into up to 3 parts: before, selected, after
            // Use selStart and selEnd calculated from live range above
            const beforeText = text.substring(0, selStart)
            const selectedText = text.substring(selStart, selEnd)
            const afterText = text.substring(selEnd)

            const parent = span.parentNode
            if (!parent) {
                return
            }

            // Create fragments - ALWAYS wrap all parts in spans to prevent merge issues
            const fragment = document.createDocumentFragment()

            if (beforeText) {
                const beforeSpan = span.cloneNode() as HTMLSpanElement
                beforeSpan.removeAttribute('id')
                beforeSpan.textContent = beforeText
                fragment.appendChild(beforeSpan)
            }

            if (selectedText) {
                // Selected portion - remove the style
                const selectedSpan = document.createElement('span')
                selectedSpan.textContent = selectedText
                fragment.appendChild(selectedSpan)
            }

            if (afterText) {
                const afterSpan = span.cloneNode() as HTMLSpanElement
                afterSpan.removeAttribute('id')
                afterSpan.textContent = afterText
                fragment.appendChild(afterSpan)
            }

            // Replace original span with fragment
            parent.replaceChild(fragment, span)
        } else {
            // WARNING: Invalid selection range in span
        }
    })

    const normalizeTarget = getBlockParent(range.commonAncestorContainer) ?? findEditorRoot(range.commonAncestorContainer)
    if (normalizeTarget) {
        normalizeDOM(normalizeTarget)
    }

    // D-08: Restore selection after DOM normalization
    // HYBRID APPROACH: Use offset hint + text search to disambiguate multiple occurrences
    if (selectionTextBefore && selectionTextBefore.trim() !== '') {
        // Non-collapsed selection: use text-based restoration with offset hint
        // The hint helps find the correct occurrence when text appears multiple times
        const offsetHint = savedSelection.startOffset >= 0 ? savedSelection.startOffset : undefined
        const found = findAndSelectText(savedSelection.editorRoot, selectionTextBefore, offsetHint)
        if (!found) {
            console.warn('[removeStyle] Text-based restoration failed for:', JSON.stringify(selectionTextBefore))
            // Fall back to offset-based restoration for cross-paragraph selections
            if (savedSelection.editorRoot && savedSelection.startOffset >= 0 && savedSelection.endOffset >= 0) {
                restoreSelectionFromOffsets(
                    savedSelection.editorRoot,
                    savedSelection.startOffset,
                    savedSelection.endOffset
                )
            }
        }
    } else if (savedSelection.editorRoot && savedSelection.startOffset >= 0 && savedSelection.endOffset >= 0) {
        // Collapsed selection (caret only): use offset-based restoration
        // Safe because caret position doesn't depend on surrounding structure
        restoreSelectionFromOffsets(
            savedSelection.editorRoot,
            savedSelection.startOffset,
            savedSelection.endOffset
        )
    } else if (!savedSelection.editorRoot) {
        console.warn('[removeStyle] Could not find editor root for selection restoration — cursor may be lost')
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
    // D-01: Find editor shadow root directly (more reliable than focusNode derivation)
    const focusSr = findEditorShadowRoot()
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
    // D-01: Find editor shadow root directly (more reliable than focusNode derivation)
    const focusSr = findEditorShadowRoot()
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
    if (savedSelection.editorRoot && savedSelection.startOffset >= 0 && savedSelection.endOffset >= 0) {
        restoreSelectionFromOffsets(
            savedSelection.editorRoot,
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
    const focusSr = findEditorShadowRoot()
    const range = safeGetRange(focusSr)
    if (!range) return

    const sel = focusSr ? focusSr.getSelection() : safeGetSelection()
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
    const focusSr = findEditorShadowRoot()
    const range = safeGetRange(focusSr)
    if (!range) return

    const sel = focusSr ? focusSr.getSelection() : safeGetSelection()
    if (!sel) return

    if (range.collapsed) {
        // For collapsed selection: find all styled spans at cursor and unwrap them
        let node: Node | null = range.startContainer

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
                    // node is now under parent (the grandparent), continue checking parent chain
                    node = parent
                    continue
                }
            }
            // Also check for semantic elements (B, STRONG, EM, I, U, etc.)
            if (el instanceof HTMLElement
                && !el.hasAttribute('style')
                && ['B', 'STRONG', 'I', 'EM', 'U', 'INS', 'S', 'DEL', 'STRIKE', 'SUB', 'SUP', 'SPAN'].includes(el.tagName)) {
                const parent = el.parentNode
                if (parent) {
                    while (el.firstChild) {
                        parent.insertBefore(el.firstChild, el)
                    }
                    parent.removeChild(el)
                    node = parent
                    continue
                }
            }
            node = el
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
 * Tailwind margin-left class management
 * Maps ml-0 through ml-96 (Tailwind scale: 0, 1=4px, 2=8px, 3=12px, 4=16px, 5=20px, 6=24px, 8=32px, 10=40px, 12=48px, ...)
 */
const ML_CLASS_PATTERN = /^ml-\d+$/

function getMlClass(px: number): string {
    // Map px to nearest Tailwind ml-* class
    const twScale: Record<number, string> = {
        0: 'ml-0', 4: 'ml-1', 8: 'ml-2', 12: 'ml-3', 16: 'ml-4',
        20: 'ml-5', 24: 'ml-6', 28: 'ml-7', 32: 'ml-8', 36: 'ml-9',
        40: 'ml-10', 48: 'ml-12', 56: 'ml-14', 64: 'ml-16', 80: 'ml-20', 96: 'ml-24'
    }
    if (twScale[px]) return twScale[px]
    // Fallback: use closest
    const keys = Object.keys(twScale).map(Number).sort((a, b) => a - b)
    const closest = keys.reduce((prev, curr) => Math.abs(curr - px) < Math.abs(prev - px) ? curr : prev)
    return twScale[closest]
}

function getMlPx(el: HTMLElement): number {
    // Extract current ml-* class px value
    for (const cls of el.classList) {
        const m = cls.match(/^ml-(\d+)$/)
        if (m) {
            const n = parseInt(m[1])
            // Tailwind ml-* to px: 1=4px, 2=8px, etc.
            const twToPx: Record<number, number> = {
                0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 28,
                8: 32, 9: 36, 10: 40, 12: 48, 14: 56, 16: 64, 20: 80, 24: 96
            }
            return twToPx[n] ?? n * 4
        }
    }
    return 0
}

function setMlClass(el: HTMLElement, px: number): void {
    // Remove existing ml-* classes
    const toRemove: string[] = []
    for (const cls of el.classList) {
        if (ML_CLASS_PATTERN.test(cls)) toRemove.push(cls)
    }
    toRemove.forEach(c => el.classList.remove(c))
    // Also clear inline marginLeft if any
    el.style.marginLeft = ''

    if (px > 0) {
        el.classList.add(getMlClass(px))
    }
}

/**
 * Apply indent to selected blocks using Tailwind ml-* classes
 * For non-list blocks (P, H1-H6, DIV, etc.)
 */
export function applyIndent(isDecrease: boolean, amount: number = 20): void {
    const focusSr = findEditorShadowRoot()
    const range = safeGetRange(focusSr)
    if (!range) return

    const sel = safeGetSelection()
    if (!sel) return

    const savedSelection = saveSelectionAsOffsets(range)

    const block = getBlockParent(range.commonAncestorContainer)
    const editorRoot = findEditorRoot(range.commonAncestorContainer)
    const walkerRoot = block || editorRoot
    if (!walkerRoot) return

    const walker = document.createTreeWalker(
        walkerRoot,
        NodeFilter.SHOW_ELEMENT,
        {
            acceptNode: (node) => {
                if (node instanceof HTMLElement) {
                    const tag = node.tagName.toUpperCase()
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

    if (range.collapsed) {
        const currentBlock = getBlockParent(range.startContainer)
        if (currentBlock && !['UL', 'OL', 'LI'].includes(currentBlock.tagName.toUpperCase())) {
            blocksToIndent.push(currentBlock)
        }
    } else {
        // If we have a single block parent, add it if it intersects
        if (block && range.intersectsNode(block) && !['UL', 'OL', 'LI'].includes(block.tagName.toUpperCase())) {
            blocksToIndent.push(block)
        }
        // Walk children for all intersecting blocks
        while ((node = walker.nextNode())) {
            if (range.intersectsNode(node)) {
                blocksToIndent.push(node as HTMLElement)
            }
        }
    }

    const processedLIs = new Set<HTMLElement>()

    blocksToIndent.forEach((blockElement, index) => {
        let targetElement = blockElement
        const checkboxWrapper = blockElement.closest('.checklist-item-wrapper')
        if (checkboxWrapper) {
            const li = blockElement.closest('li')
            if (li) {
                targetElement = li as HTMLElement
                if (processedLIs.has(li as HTMLElement)) return
                processedLIs.add(li as HTMLElement)
            }
        }

        const currentPx = getMlPx(targetElement)
        const newPx = currentPx + (isDecrease ? -amount : amount)
        setMlClass(targetElement, newPx < 0 ? 0 : newPx)
    })

    if (savedSelection.editorRoot && savedSelection.startOffset >= 0 && savedSelection.endOffset >= 0) {
        restoreSelectionFromOffsets(
            savedSelection.editorRoot,
            savedSelection.startOffset,
            savedSelection.endOffset
        )
    }
}

/**
 * Apply indent/outdent to list items using Tailwind ml-* classes
 * Replaces document.execCommand('indent'/'outdent') for lists.
 * Increases/decreases margin-left on selected LI elements.
 */
export function applyListIndent(isDecrease: boolean, amount: number = 20): void {
    const focusSr = findEditorShadowRoot()
    const range = safeGetRange(focusSr)
    if (!range) return

    const savedSelection = saveSelectionAsOffsets(range)

    // Find all LIs that intersect with the selection
    const editorRoot = findEditorRoot(range.commonAncestorContainer)
    if (!editorRoot) return

    const lis = editorRoot.querySelectorAll('li')
    const selectedLIs: HTMLLIElement[] = []

    for (const li of lis) {
        // Use intersectsNode instead of compareBoundaryPoints with document.createRange()
        // because document.createRange().selectNode() doesn't work correctly with
        // shadow DOM nodes — the range boundaries end up outside the shadow tree.
        if (range.intersectsNode(li)) {
            selectedLIs.push(li as HTMLLIElement)
        }
    }

    // If no LIs found via intersection, try ancestor-based detection
    if (selectedLIs.length === 0) {
        let node: Node | null = range.commonAncestorContainer
        while (node && node !== editorRoot) {
            if (node instanceof HTMLElement && node.tagName === 'LI') {
                selectedLIs.push(node as HTMLLIElement)
                break
            }
            node = node.parentNode
        }
    }

    selectedLIs.forEach((li) => {
        const currentPx = getMlPx(li)
        const newPx = currentPx + (isDecrease ? -amount : amount)
        setMlClass(li, newPx < 0 ? 0 : newPx)
    })

    if (savedSelection.editorRoot && savedSelection.startOffset >= 0 && savedSelection.endOffset >= 0) {
        restoreSelectionFromOffsets(
            savedSelection.editorRoot,
            savedSelection.startOffset,
            savedSelection.endOffset
        )
    }
}

const BLOCK_TAGS = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'PRE', 'DIV', 'TD', 'TH']

/**
 * Apply list formatting (bullet, number, or checkbox)
 * Converts selected blocks to list items or toggles existing lists
 */
export function applyList(mode: 'bullet' | 'number' | 'checkbox'): void {
    // D-01: Find editor shadow root directly (more reliable than focusNode derivation)
    const focusSr = findEditorShadowRoot()
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

    // Restore selection from saved offsets
    if (savedSelection.editorRoot && savedSelection.startOffset >= 0 && savedSelection.endOffset >= 0) {
        restoreSelectionFromOffsets(
            savedSelection.editorRoot,
            savedSelection.startOffset,
            savedSelection.endOffset
        )
    }
}
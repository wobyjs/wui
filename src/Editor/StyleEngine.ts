import { normalizeDOM } from './DOMNormalizer'
import { safeGetSelection, safeGetRange } from './BrowserCompat'

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
 * Get all computed styles from a node
 */
function getComputedStyles(node: Node): CSSStyleDeclaration {
    if (node instanceof HTMLElement) {
        return node.style
    }
    if (node instanceof Text && node.parentElement) {
        return node.parentElement.style
    }
    return {} as CSSStyleDeclaration
}

/**
 * Check if a node has a specific style property with a value
 */
function hasStyle(node: Node, prop: string, value: string): boolean {
    const styles = getComputedStyles(node)
    return styles.getPropertyValue(prop) === value
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
 * Apply a style to the current selection using DOM manipulation
 * Replaces execCommand('bold') etc.
 */
export function applyStyle(prop: string, value: string): void {
    const range = safeGetRange()
    if (!range) return

    const sel = safeGetSelection()
    if (!sel) return

    if (range.collapsed) {
        // Expand to word if cursor is in middle of word
        const wordRange = expandToWord(range)
        if (!wordRange || wordRange.collapsed) {
            // Insert styled empty span at cursor for typing
            insertStyledEmptySpan(prop, value)
            return
        }
        applyStyleToRange(wordRange, prop, value)
    } else {
        applyStyleToRange(range, prop, value)
    }

    // Normalize after operation
    const block = getBlockParent(range.commonAncestorContainer)
    if (block) {
        normalizeDOM(block)
    }

    // Restore selection after normalization
    restoreSelection(range, sel)
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
 */
function applyStyleToRange(range: Range, prop: string, value: string): void {
    const span = document.createElement('span')
    // Use direct style property assignment instead of setProperty for compatibility
    // Convert camelCase prop to kebab-case for CSS property
    const cssProp = prop.replace(/[A-Z]/g, m => '-' + m.toLowerCase())
    span.style[prop as any] = value

    try {
        range.surroundContents(span)
    } catch (e) {
        const contents = range.extractContents()
        span.appendChild(contents)
        range.insertNode(span)
    }
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
 * Restore selection after DOM operations
 */
function restoreSelection(range: Range, sel: Selection): void {
    // Re-clone the range since DOM may have changed
    const newRange = document.createRange()
    newRange.setStart(range.startContainer, range.startOffset)
    newRange.setEnd(range.endContainer, range.endOffset)

    sel.removeAllRanges()
    sel.addRange(newRange)
}

/**
 * Remove a style property from the current selection
 */
export function removeStyle(prop: string): void {
    const range = safeGetRange()
    if (!range) return

    const sel = safeGetSelection()
    if (!sel) return

    if (range.collapsed) {
        // Find current style at cursor and remove it
        const container = range.startContainer
        const styles = getComputedStyles(container)
        if (styles.getPropertyValue(prop)) {
            // Toggle off by setting to default
            const defaultValue = getDefaultStyleValue(prop)
            applyStyle(prop, defaultValue)
        }
        return
    }

    // For selection: find styled spans and unwrap style
    const contents = range.extractContents()

    // Walk the extracted contents and remove style from spans
    const walker = document.createTreeWalker(
        contents,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
        null
    )

    const toProcess: Node[] = []
    let node: Node | null
    while ((node = walker.nextNode())) {
        toProcess.push(node)
    }

    toProcess.forEach(node => {
        if (node instanceof HTMLElement && node.tagName === 'SPAN') {
            node.style.removeProperty(prop)
            if (node.style.cssText === '' || !node.getAttribute('style')) {
                // Remove empty style attribute
                node.removeAttribute('style')
            }
            if (!node.hasAttribute('style') && node.textContent?.trim() === '') {
                // Unwrap empty span
                const parent = node.parentNode
                if (parent) {
                    while (node.firstChild) {
                        parent.insertBefore(node.firstChild, node)
                    }
                    parent.removeChild(node)
                }
            }
        }
    })

    range.insertNode(contents)

    const block = getBlockParent(range.commonAncestorContainer)
    if (block) {
        normalizeDOM(block)
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
    const range = safeGetRange()
    if (!range) return

    if (range.collapsed) {
        // Check if cursor is already in text with this style
        const container = range.startContainer
        if (hasStyle(container, prop, value)) {
            removeStyle(prop)
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
        removeStyle(prop)
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
    applyStyle('textDecoration', 'underline')
}

/**
 * Apply text-decoration strikethrough
 */
export function applyStrikethrough(): void {
    applyStyle('textDecoration', 'line-through')
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
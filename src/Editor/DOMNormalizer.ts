/**
 * DOM Normalization utilities for rich text editor
 *
 * MUST be called after EVERY DOM operation to prevent:
 * - Nested identical styles (bold within bold)
 * - Empty style spans
 * - Partial selections breaking spans incorrectly
 * - Spans spanning multiple block elements
 */

/**
 * Merge adjacent text nodes into single nodes
 */
export function mergeTextNodes(container: HTMLElement): void {
    const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        null
    )

    const toMerge: Text[] = []

    let node: Node | null
    let prevNode: Text | null = null

    while ((node = walker.nextNode())) {
        const textNode = node as Text
        if (prevNode &&
            prevNode.parentNode === textNode.parentNode &&
            prevNode.nextSibling === textNode) {
            toMerge.push(textNode)
        } else {
            prevNode = textNode
        }
    }

    // Merge nodes (reverse order to maintain indices)
    for (let i = toMerge.length - 1; i >= 0; i--) {
        const nodeToMerge = toMerge[i]
        if (prevNode && prevNode.parentNode === nodeToMerge.parentNode) {
            prevNode.textContent += nodeToMerge.textContent
            nodeToMerge.remove()
        }
    }
}

/**
 * Remove empty spans and style elements
 * Empty = no content AND no styles
 */
export function removeEmptySpans(container: HTMLElement): void {
    const selector = 'span, strong, em, b, i, u, s, code'
    const elements = container.querySelectorAll(selector)

    elements.forEach(el => {
        const htmlEl = el as HTMLElement

        // Skip if has meaningful attributes
        if (htmlEl.attributes.length > 0) {
            // Check if has only style attribute with no actual style
            if (htmlEl.hasAttribute('style')) {
                const style = htmlEl.style
                const hasStyles = style.cssText && style.cssText.trim() !== ''
                if (!hasStyles && htmlEl.textContent?.trim() === '') {
                    // No style AND no content - remove
                    replaceWithChildren(htmlEl)
                }
            } else if (htmlEl.textContent?.trim() === '') {
                // No style AND no content - remove
                replaceWithChildren(htmlEl)
            }
        } else if (htmlEl.textContent?.trim() === '') {
            // No attributes AND no content - remove
            replaceWithChildren(htmlEl)
        }
    })
}

/**
 * Replace element with its children (unwrap)
 */
function replaceWithChildren(el: HTMLElement): void {
    const parent = el.parentNode
    if (!parent) return

    const fragment = document.createDocumentFragment()
    while (el.firstChild) {
        fragment.appendChild(el.firstChild)
    }
    parent.replaceChild(fragment, el)
}

/**
 * Unwrap redundant nested spans
 * Example: <span style="bold"><span style="bold">text</span></span>
 * Should become: <span style="bold">text</span>
 */
export function unwrapRedundantSpans(container: HTMLElement): void {
    const selector = 'span[style], strong, em, b, i, u, s'
    let changed = true

    // Keep unwrapping until no more changes
    while (changed) {
        changed = false
        const elements = container.querySelectorAll(selector)

        elements.forEach(el => {
            const htmlEl = el as HTMLElement
            const parent = htmlEl.parentElement

            if (!parent) return

            // Check if parent has same style
            if (parent.tagName === htmlEl.tagName ||
                (parent.hasAttribute('style') && hasIdenticalStyles(parent as HTMLElement, htmlEl))) {
                replaceWithChildren(htmlEl)
                changed = true
            }
        })
    }
}

/**
 * Check if two elements have identical inline styles
 */
function hasIdenticalStyles(el1: HTMLElement, el2: HTMLElement): boolean {
    const style1 = el1.style
    const style2 = el2.style

    // Quick check: same length
    if (style1.length !== style2.length) return false

    // Compare each style property
    for (let i = 0; i < style1.length; i++) {
        const prop = style1[i]
        if (style1.getPropertyValue(prop) !== style2.getPropertyValue(prop)) {
            return false
        }
    }

    return true
}

/**
 * Merge adjacent spans with identical styles
 * Example: <span style="bold">hel</span><span style="bold">lo</span>
 * Should become: <span style="bold">hello</span>
 */
export function mergeAdjacentSpans(container: HTMLElement): void {
    let changed = true

    // Keep merging until no more changes
    while (changed) {
        changed = false
        const spans = container.querySelectorAll('span[style]')

        spans.forEach(span => {
            const next = span.nextElementSibling as HTMLElement | null

            if (!next) return
            if (next.tagName !== 'SPAN') return
            if (!next.hasAttribute('style')) return

            // Check if styles match
            if (hasIdenticalStyles(span as HTMLElement, next)) {
                // Move children from next to current
                while (next.firstChild) {
                    span.appendChild(next.firstChild)
                }
                next.remove()
                changed = true
            }
        })
    }
}

/**
 * Clean up spans that span multiple block elements
 * Spans should be contained within single blocks
 */
export function normalizeBlockBoundaries(container: HTMLElement): void {
    const blockTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'PRE']
    const blocks = container.querySelectorAll(blockTags.join(','))

    blocks.forEach(block => {
        const blockEl = block as HTMLElement

        // Check direct child spans
        const childSpans = Array.from(blockEl.children).filter(
            el => el.tagName === 'SPAN'
        )

        childSpans.forEach(span => {
            // If span has block-level children, unwrap it
            const spanEl = span as HTMLElement
            const hasBlockChild = Array.from(spanEl.children).some(
                child => blockTags.includes(child.tagName)
            )

            if (hasBlockChild) {
                replaceWithChildren(spanEl)
            }
        })
    })
}

/**
 * Main normalization function - call after EVERY DOM operation
 * Operates on a specific container (not entire document) for performance
 */
export function normalizeDOM(container: HTMLElement): void {
    // 1. Merge adjacent text nodes
    mergeTextNodes(container)

    // 2. Remove empty spans
    removeEmptySpans(container)

    // 3. Unwrap redundant nested spans
    unwrapRedundantSpans(container)

    // 4. Merge adjacent spans with identical styles
    mergeAdjacentSpans(container)

    // 5. Clean up block boundaries
    normalizeBlockBoundaries(container)

    // 6. Final text node merge (cleanup after unwrapping)
    mergeTextNodes(container)
}
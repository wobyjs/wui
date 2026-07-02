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

    // Collect all consecutive text node sequences
    const sequences: Text[][] = []
    let currentSequence: Text[] = []
    let lastNode: Text | null = null

    let node: Node | null
    while ((node = walker.nextNode())) {
        const textNode = node as Text

        if (lastNode &&
            lastNode.parentNode === textNode.parentNode &&
            lastNode.nextSibling === textNode) {
            // Continue current sequence
            currentSequence.push(textNode)
        } else {
            // Start new sequence
            if (currentSequence.length > 0) {
                sequences.push(currentSequence)
            }
            currentSequence = [textNode]
        }
        lastNode = textNode
    }

    // Don't forget the last sequence
    if (currentSequence.length > 1) {
        sequences.push(currentSequence)
    }

    // Merge each sequence from end to start
    sequences.forEach(sequence => {
        // Merge all into the first node
        const firstNode = sequence[0]
        for (let i = 1; i < sequence.length; i++) {
            firstNode.textContent += sequence[i].textContent
            sequence[i].remove()
        }
    })
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
 * BUT: <span style="bold"><span style="italic">text</span></span> should NOT be unwrapped
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

            // Check if parent has same style - only unwrap if styles are identical
            // This handles: <b><b>text</b></b> → <b>text</b>
            // But NOT: <span style="bold"><span style="italic">text</span></span>
            if (parent.hasAttribute('style') && hasIdenticalStyles(parent as HTMLElement, htmlEl)) {
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

            // Don't merge if there's non-empty text between the spans
            // (nextElementSibling skips text nodes, so we need to check manually)
            let node: Node | null = span.nextSibling
            while (node && node !== next) {
                if (node.nodeType === Node.TEXT_NODE && (node.textContent?.trim() || '').length > 0) {
                    return
                }
                node = node.nextSibling
            }

            // Check if styles match
            if (hasIdenticalStyles(span as HTMLElement, next)) {
                // Don't merge if there's a space at the boundary (preserves word separation)
                const spanEnds = span.textContent?.endsWith(' ') ?? false
                const nextStarts = next.textContent?.startsWith(' ') ?? false
                if (spanEnds || nextStarts) return

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
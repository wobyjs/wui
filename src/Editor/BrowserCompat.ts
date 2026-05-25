/**
 * Browser compatibility layer for Range/Selection API differences
 *
 * Key differences handled:
 * - Safari: anchorNode/headNode order differs from Chrome
 * - Firefox: rangeCount can be 0 after certain operations
 * - Chrome: IME composition can create extra ranges
 */

export const BrowserInfo = {
    isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    isFirefox: navigator.userAgent.toLowerCase().includes('firefox'),
    isChrome: navigator.userAgent.toLowerCase().includes('chrome'),
    isEdge: navigator.userAgent.toLowerCase().includes('edg'),
}

/**
 * Check if IME composition is in progress (critical for CJK input)
 * Chrome: IME composition can create extra ranges
 */
let _isComposing = false
export const isComposing = () => _isComposing
export const setComposing = (value: boolean) => { _isComposing = value }

if (typeof document !== 'undefined') {
    document.addEventListener('compositionstart', () => { _isComposing = true })
    document.addEventListener('compositionend', () => { _isComposing = false })
}

/**
 * Safe selection retrieval that handles Firefox rangeCount=0 issue
 */
export function safeGetSelection(): Selection | null {
    const sel = window.getSelection()
    if (!sel) return null

    // Firefox: rangeCount can be 0 even when selection exists
    // Check both conditions
    if (sel.rangeCount === 0 || !sel.focusNode) {
        return null
    }

    return sel
}

/**
 * Get the first range from selection with safe fallback
 */
export function safeGetRange(): Range | null {
    const sel = safeGetSelection()
    if (!sel || sel.rangeCount === 0) return null
    return sel.getRangeAt(0)
}

/**
 * Normalize range handling Safari anchor/head mismatch
 * Safari: anchorNode appears before headNode even when backwards
 */
export function normalizeRange(range: Range): Range {
    const normalized = range.cloneRange()

    // Handle collapsed ranges
    if (normalized.collapsed) {
        return normalized
    }

    // Safari anchor/head fix: compare DOM positions
    const sel = window.getSelection()
    if (sel && BrowserInfo.isSafari) {
        const anchor = sel.anchorNode
        const focus = sel.focusNode

        if (anchor && focus && anchor !== focus) {
            const position = anchor.compareDocumentPosition(focus)
            // If anchor comes after focus, selection is backwards
            if (position & Node.DOCUMENT_POSITION_PRECEDING) {
                // Selection is backward in Safari - normalize by ensuring
                // startContainer is actually the earlier node
                const startNode = range.startContainer
                const endNode = range.endContainer

                if (startNode !== endNode) {
                    const startPos = startNode.compareDocumentPosition(endNode)
                    if (startPos & Node.DOCUMENT_POSITION_PRECEDING) {
                        // Swap start and end
                        normalized.setStart(endNode, range.endOffset)
                        normalized.setEnd(startNode, range.startOffset)
                    }
                }
            }
        }
    }

    return normalized
}

/**
 * Get selection direction (forward/backward)
 * Works consistently across all browsers
 */
export function getDirection(
    root: HTMLElement
): 'forward' | 'backward' | 'none' {
    const sel = safeGetSelection()
    if (!sel || sel.rangeCount === 0) return 'none'

    const anchor = sel.anchorNode
    const focus = sel.focusNode

    if (!anchor || !focus) return 'none'
    if (!root.contains(anchor) || !root.contains(focus)) return 'none'

    // Same node - check offsets
    if (anchor === focus) {
        return sel.anchorOffset <= sel.focusOffset ? 'forward' : 'backward'
    }

    // Different nodes - compare DOM positions
    const position = anchor.compareDocumentPosition(focus)
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 'backward'
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return 'forward'

    return 'forward'
}

/**
 * Get comprehensive selection info for toolbar state updates
 */
export function getSelectionInfo(root: HTMLElement): {
    collapsed: boolean
    direction: 'forward' | 'backward' | 'none'
    startContainer: Node | null
    endContainer: Node | null
    startOffset: number
    endOffset: number
    hasSelection: boolean
} {
    const sel = safeGetSelection()

    if (!sel || sel.rangeCount === 0) {
        return {
            collapsed: true,
            direction: 'none' as const,
            startContainer: null,
            endContainer: null,
            startOffset: 0,
            endOffset: 0,
            hasSelection: false
        }
    }

    const range = sel.getRangeAt(0)

    return {
        collapsed: range.collapsed,
        direction: getDirection(root),
        startContainer: range.startContainer,
        endContainer: range.endContainer,
        startOffset: range.startOffset,
        endOffset: range.endOffset,
        hasSelection: true
    }
}
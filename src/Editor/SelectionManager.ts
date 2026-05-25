import { useEditor } from './undoredo'

export type SelectionState = {
    startContainerPath: number[]
    startOffset: number
    endContainerPath: number[]
    endOffset: number
    isCollapsed: boolean
    direction: 'forward' | 'backward' | 'none'
}

type Path = number[]

function getNodePath(node: Node, root: Node): Path {
    const path: Path = []
    while (node && node !== root) {
        const parent = node.parentNode
        if (!parent) break
        const index = Array.prototype.indexOf.call(parent.childNodes, node)
        path.unshift(index)
        node = parent
    }
    return path
}

function getNodeFromPath(path: Path, root: Node): Node | null {
    let node: Node | null = root
    for (const index of path) {
        if (!node || !node.childNodes || !node.childNodes[index]) return null
        node = node.childNodes[index]
    }
    return node
}

export class SelectionManager {
    private root: HTMLElement
    private lastState: SelectionState | null = null

    constructor(root: HTMLElement) {
        this.root = root
    }

    /**
     * Safe selection retrieval that handles browser differences:
     * - Firefox: rangeCount can be 0 even when selection exists
     * - Safari: anchorNode/headNode order differs from Chrome
     */
    private getSafeSelection(): Selection | null {
        const sel = window.getSelection()
        if (!sel) return null

        // Firefox compatibility: rangeCount check alone is insufficient
        if (sel.rangeCount === 0 || !sel.focusNode) {
            return null
        }
        return sel
    }

    /**
     * Check if selection is collapsed (cursor, no range)
     */
    isCollapsed(): boolean {
        const sel = this.getSafeSelection()
        if (!sel || sel.rangeCount === 0) return true
        return sel.getRangeAt(0).collapsed
    }

    /**
     * Get selection direction for cross-browser compatibility
     */
    getDirection(): 'forward' | 'backward' | 'none' {
        const sel = this.getSafeSelection()
        if (!sel || sel.rangeCount === 0) return 'none'

        const range = sel.getRangeAt(0)
        // Safari anchor/head mismatch: compare DOM positions
        const anchorNode = sel.anchorNode
        const focusNode = sel.focusNode

        if (!anchorNode || !focusNode) return 'none'

        // Compare positions using TreeWalker
        const walker = document.createTreeWalker(this.root, NodeFilter.SHOW_ALL)
        let anchorFound = false
        let focusFound = false
        let current: Node | null = walker.currentNode

        while (current) {
            if (current === anchorNode) anchorFound = true
            if (current === focusNode) focusFound = true
            if (anchorFound && focusFound) break
            current = walker.nextNode()
        }

        if (!anchorFound || !focusFound) return 'none'

        // Compare DOM order
        const position = anchorNode.compareDocumentPosition(focusNode)
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 'backward'
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return 'forward'
        return 'forward' // Same node - check offsets
    }

    /**
     * Check if current selection is valid within the editor
     */
    isValidSelection(): boolean {
        const sel = this.getSafeSelection()
        if (!sel || sel.rangeCount === 0) return false

        const range = sel.getRangeAt(0)
        const startContainer = range.startContainer
        const endContainer = range.endContainer

        // Check if containers are within editor root
        return this.root.contains(startContainer) && this.root.contains(endContainer)
    }

    /**
     * Normalize a range using three-phase normalization:
     * 1. Validate containers (within editor)
     * 2. Clamp offsets to valid ranges
     * 3. Clean up invalid DOM positions
     */
    normalize(range: Range): Range {
        const validated = range.cloneRange()

        // Phase 1: Validate containers
        if (!this.root.contains(validated.startContainer) ||
            !this.root.contains(validated.endContainer)) {
            // Clamp to root
            validated.setStart(this.root, Math.min(validated.startOffset, this.root.childNodes.length))
            validated.setEnd(this.root, Math.min(validated.endOffset, this.root.childNodes.length))
        }

        // Phase 2: Clamp offsets
        const startContainer = validated.startContainer
        const endContainer = validated.endContainer

        if (startContainer.nodeType === Node.TEXT_NODE) {
            const maxStart = startContainer.textContent?.length ?? 0
            validated.setStart(startContainer, Math.min(validated.startOffset, maxStart))
        }

        if (endContainer.nodeType === Node.TEXT_NODE) {
            const maxEnd = endContainer.textContent?.length ?? 0
            validated.setEnd(endContainer, Math.min(validated.endOffset, maxEnd))
        }

        return validated
    }

    /**
     * Save current selection state using path-based tracking
     * Paths survive DOM restructures better than node references
     */
    save(): SelectionState | null {
        const sel = this.getSafeSelection()
        if (!sel || sel.rangeCount === 0) return null

        const range = sel.getRangeAt(0)
        const normalized = this.normalize(range)

        const state: SelectionState = {
            startContainerPath: getNodePath(normalized.startContainer, this.root),
            startOffset: normalized.startOffset,
            endContainerPath: getNodePath(normalized.endContainer, this.root),
            endOffset: normalized.endOffset,
            isCollapsed: normalized.collapsed,
            direction: this.getDirection()
        }

        this.lastState = state
        return state
    }

    /**
     * Restore selection from a previously saved state
     */
    restore(state: SelectionState): boolean {
        if (!state) return false

        const startNode = getNodeFromPath(state.startContainerPath, this.root)
        const endNode = getNodeFromPath(state.endContainerPath, this.root)

        if (!startNode || !endNode) {
            console.warn('[SelectionManager] Failed to resolve node paths')
            return false
        }

        const range = document.createRange()

        // Clamp offsets for safety
        const startMax = startNode.nodeType === Node.TEXT_NODE
            ? (startNode.textContent?.length ?? 0)
            : startNode.childNodes.length
        const endMax = endNode.nodeType === Node.TEXT_NODE
            ? (endNode.textContent?.length ?? 0)
            : endNode.childNodes.length

        try {
            range.setStart(startNode, Math.min(state.startOffset, startMax))
            range.setEnd(endNode, Math.min(state.endOffset, endMax))

            if (state.isCollapsed) {
                range.collapse(true)
            }

            const sel = window.getSelection()
            if (sel) {
                sel.removeAllRanges()
                sel.addRange(range)
                return true
            }
        } catch (e) {
            console.error('[SelectionManager] Failed to restore selection:', e)
        }

        return false
    }

    /**
     * Get last saved state (for blur/focus handling)
     */
    getLastState(): SelectionState | null {
        return this.lastState
    }
}
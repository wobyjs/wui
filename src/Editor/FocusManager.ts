import { $ } from 'woby'
import { safeGetRange } from './BrowserCompat'

/**
 * FocusManager prevents toolbar button clicks from stealing focus
 * from the contentEditable editor, which would clear the Selection.
 *
 * Strategy (3-pronged):
 * 1. Capture-phase mousedown listener on toolbar container — calls preventDefault
 *    to stop the browser from moving focus to the clicked button.
 * 2. Selection caching — saves the current Selection before any potential focus shift.
 * 3. Focus restoration — refocuses the editor and restores cached selection after
 *    a command executes.
 *
 * Why capture-phase addEventListener instead of Woby's onMouseDown?
 * Woby uses delegated events (single listener on document, dispatches via composedPath).
 * preventDefault() in that delegation context does NOT prevent the browser's default
 * focus behavior. A capture-phase listener attached directly to the element does.
 */

export class FocusManager {
    private editorElement: HTMLElement | null = null
    private toolbarElement: HTMLElement | null = null
    private cachedSelection: { startOffsets: number[], endOffsets: number[] } | null = null
    private captureHandler: ((e: MouseEvent) => void) | null = null
    private blurHandler: ((e: FocusEvent) => void) | null = null
    private isEditorFocused = $(false)
    private suppressBlur = false

    /** Bind the FocusManager to the editor and toolbar DOM elements */
    attach(editorEl: HTMLElement, toolbarEl: HTMLElement): void {
        this.editorElement = editorEl
        this.toolbarElement = toolbarEl

        // Capture-phase mousedown on toolbar prevents focus shift to buttons.
        // This is the PRIMARY fix — without it, clicking toolbar buttons moves
        // focus away from contentEditable, clearing the Selection.
        this.captureHandler = (e: MouseEvent) => {
            // Only prevent default for mouse buttons (not touch/pen)
            if (e.button === 0) {
                e.preventDefault()
                e.stopPropagation()
                this.cacheSelection()
            }
        }
        toolbarEl.addEventListener('mousedown', this.captureHandler, { capture: true })

        // Track editor focus state
        this.blurHandler = (e: FocusEvent) => {
            if (this.suppressBlur) {
                e.preventDefault()
                e.stopPropagation()
                return
            }
            // Check if focus is moving to toolbar (relatedTarget)
            const related = e.relatedTarget as HTMLElement | null
            if (related && toolbarEl.contains(related)) {
                // Focus is moving to a toolbar button — suppress and restore
                e.preventDefault()
                this.restoreFocus()
                return
            }
            this.isEditorFocused(false)
        }
        editorEl.addEventListener('blur', this.blurHandler, { capture: true })

        // Track focus
        editorEl.addEventListener('focus', () => { this.isEditorFocused(true) })
    }

    /** Detach all listeners */
    detach(): void {
        if (this.captureHandler && this.toolbarElement) {
            this.toolbarElement.removeEventListener('mousedown', this.captureHandler, { capture: true })
        }
        if (this.blurHandler && this.editorElement) {
            this.editorElement.removeEventListener('blur', this.blurHandler, { capture: true })
        }
        this.captureHandler = null
        this.blurHandler = null
        this.editorElement = null
        this.toolbarElement = null
        this.cachedSelection = null
    }

    /** Cache the current selection as offset arrays */
    cacheSelection(): void {
        const sel = this.getSelection()
        if (!sel || sel.rangeCount === 0) {
            this.cachedSelection = null
            return
        }

        const editorEl = this.editorElement
        if (!editorEl) return
        const shadowRoot = editorEl.getRootNode()
        const range = safeGetRange(shadowRoot instanceof ShadowRoot ? shadowRoot : undefined)
        if (!range) {
            this.cachedSelection = null
            return
        }

        const startOffsets = this.getOffsets(range.startContainer, range.startOffset, editorEl)
        const endOffsets = this.getOffsets(range.endContainer, range.endOffset, editorEl)

        if (startOffsets && endOffsets) {
            this.cachedSelection = { startOffsets, endOffsets }
        }
    }

    /** Restore the cached selection, refocusing the editor if needed */
    restoreSelection(): boolean {
        if (!this.cachedSelection || !this.editorElement) return false

        // Ensure editor has focus
        if (!this.isEditorFocused()) {
            this.editorElement.focus()
        }

        return this.restoreSelectionFromOffsets(
            this.cachedSelection.startOffsets,
            this.cachedSelection.endOffsets
        )
    }

    /** Check if editor currently has focus */
    get isFocused(): boolean {
        return this.isEditorFocused()
    }

    /** Suppress blur events temporarily (used during toolbar command execution) */
    beginCommand(): void {
        this.cacheSelection()
        this.suppressBlur = true
    }

    /** End command suppression and restore selection */
    endCommand(): void {
        this.suppressBlur = false
        this.restoreSelection()
    }

    // --- Private helpers ---

    private getSelection(): Selection | null {
        const doc = this.editorElement?.ownerDocument
        if (!doc) return null
        return doc.defaultView?.getSelection() ?? null
    }

    /**
     * Compute offset path from editor root to a given node+offset.
     * Returns an array of [childIndex, childIndex, ...] + textOffset
     * that can be used to reconstruct the position.
     */
    private getOffsets(node: Node, offset: number, root: HTMLElement): number[] | null {
        const path: number[] = []
        let current = node
        while (current && current !== root) {
            const parent = current.parentNode
            if (!parent) return null
            const index = Array.from(parent.childNodes).indexOf(current as ChildNode)
            path.unshift(index)
            current = parent
        }
        if (current !== root) return null
        path.push(offset)
        return path
    }

    /**
     * Restore selection from offset arrays produced by getOffsets.
     */
    private restoreSelectionFromOffsets(startOffsets: number[], endOffsets: number[]): boolean {
        const root = this.editorElement
        if (!root) return false

        const sel = this.getSelection()
        if (!sel) return false

        const startResult = this.resolveOffsets(root, startOffsets)
        const endResult = this.resolveOffsets(root, endOffsets)
        if (!startResult || !endResult) return false

        try {
            const range = root.ownerDocument!.createRange()
            range.setStart(startResult.node, startResult.offset)
            range.setEnd(endResult.node, endResult.offset)
            sel.removeAllRanges()
            sel.addRange(range)
            return true
        } catch {
            return false
        }
    }

    private resolveOffsets(root: HTMLElement, offsets: number[]): { node: Node, offset: number } | null {
        if (offsets.length < 2) return null

        const textOffset = offsets[offsets.length - 1]
        let current: Node = root

        for (let i = 0; i < offsets.length - 1; i++) {
            const childIndex = offsets[i]
            if (childIndex >= current.childNodes.length) return null
            current = current.childNodes[childIndex]
        }

        return { node: current, offset: textOffset }
    }

    /** Force-refocus the editor element */
    private restoreFocus(): void {
        if (this.editorElement) {
            this.suppressBlur = false
            this.editorElement.focus()
            this.restoreSelection()
        }
    }
}

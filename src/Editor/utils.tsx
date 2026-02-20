import { useOnClickOutside, useSelection } from '@woby/use'
import { $, $$, useEffect, JSX, useMemo, Observable, createContext, useContext, ObservableMaybe } from 'woby'
import { useEditor } from './undoredo'

/**
 * Normalizes the editor's DOM structure to ensure consistent block-level wrapping.
 * 
 * @param editor - An Observable or raw HTMLDivElement representing the editor surface.
 */
export const useBlockEnforcer = (editor: Observable<HTMLDivElement | undefined> | HTMLDivElement | undefined) => {
    const el = $$(editor);
    if (!el) return;

    // 1. Force DIVs on Enter
    document.execCommand('defaultParagraphSeparator', false, 'p');

    const ensureStructure = () => {
        // CASE 1: Editor is totally empty
        if (el.innerHTML.trim() === "" || el.innerHTML === "<br>") {
            el.innerHTML = "<p><br></p>";
            const range = document.createRange();
            const sel = window.getSelection();
            if (sel && el.firstChild) {
                range.setStart(el.firstChild, 0);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
            return;
        }

        // CASE 2: Loose text (The "I just typed 'a'" case)
        // Check if the first child is a raw text node
        if (el.firstChild && el.firstChild.nodeType === Node.TEXT_NODE) {
            const sel = window.getSelection();
            if (!sel) return;

            // We don't use innerHTML here. 
            // Instead, we tell the browser to wrap the current line in a div.
            // This is "Native" and keeps the cursor exactly where it is.
            document.execCommand('formatBlock', false, 'p');

            // Chrome might add an ID or extra styles to the div, 
            // we clean those up if necessary
            if (el.firstChild instanceof HTMLElement) {
                el.firstChild.removeAttribute('id');
                el.firstChild.style.textAlign = ''; // Reset if it inherited something weird
            }
        }
    };

    ensureStructure();
    el.addEventListener('input', ensureStructure);

    return () => el.removeEventListener('input', ensureStructure);
}

/**
 * Finds the actual editable <div> the user is typing in.
 * 
 * @returns The editable element or undefined.
 */
export const getCurrentEditor = () => {
    // Priority 1: User-marked custom div or your component root
    let editorEl = document.querySelector('[data-editor-root]') as HTMLDivElement

    // Priority 2: Shadow DOM piercing (if user put it inside a Web Component)
    if (!editorEl) {
        // Convert the NodeList to an Array so it is iterable
        const allWCs = Array.from(document.querySelectorAll('*'));
        for (const wc of allWCs) {
            if (wc.shadowRoot) {
                const found = wc.shadowRoot.querySelector('[data-editor-root]');
                if (found) {
                    editorEl = found as HTMLDivElement;
                    break;
                }
            }
        }
    }

    // Priority 3: Fallback to the first active contenteditable
    if (!editorEl) {
        editorEl = document.querySelector('[contenteditable="true"]') as HTMLDivElement
    }

    return $(editorEl)
}

/**
 * Retrieves the active Selection object, correctly handling Shadow DOM encapsulation.
 * 
 * Standard `window.getSelection()` is "retargeted" by the browser when focus is inside 
 * a Shadow DOM. This means it only reports the host element (e.g., <wui-editor>) 
 * rather than the internal text nodes. 
 * 
 * This function identifies if the editor is inside a ShadowRoot and uses the 
 * ShadowRoot-specific `getSelection()` method to "pierce" the boundary and 
 * access the actual selection nodes.
 * 
 * @param editorEl - The element currently being edited.
 * @returns The Selection object (shadow-aware) or null.
 */
export const getActiveSelection = (editorEl: HTMLElement) => {
    // 1. Determine if the element is inside a ShadowRoot
    const root = editorEl.getRootNode();

    // 2. Get selection from ShadowRoot if applicable, otherwise window
    const selection = (root instanceof ShadowRoot)
        ? (root as any).getSelection() // Use the fix from the previous answer
        : window.getSelection();

    return selection;
};

export type SelectionState = {
    startContainerPath: number[]
    startOffset: number
    endContainerPath: number[]
    endOffset: number
    isCollapsed: boolean
}

/**
 * Get selection state relative to a root node (default: document.body).
 */
export function getSelection(root?: Node): SelectionState | null {
    root = root ?? $$(useEditor())
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return null

    const range = selection.getRangeAt(0)

    return {
        startContainerPath: getNodePath(range.startContainer, root),
        startOffset: range.startOffset,
        endContainerPath: getNodePath(range.endContainer, root),
        endOffset: range.endOffset,
        isCollapsed: range.collapsed,
    }
}

/**
 * Restore a previously saved selection state.
 */
export function restoreSelection(state: SelectionState, root?: Node): void {
    root = root ?? $$(useEditor())
    const range = document.createRange()

    console.log('[restoreSelection] Attempting to restore state:', JSON.stringify(state))
    console.log('[restoreSelection] Root node:', root)

    const startNode = getNodeFromPath(state.startContainerPath, root)
    const endNode = getNodeFromPath(state.endContainerPath, root)

    console.log('[restoreSelection] Resolved startNode:', startNode, 'from path:', state.startContainerPath)
    console.log('[restoreSelection] Resolved endNode:', endNode, 'from path:', state.endContainerPath)

    if (!startNode || !endNode) {
        console.error('[restoreSelection] Failed to resolve startNode or endNode. Aborting restoration.')
        return
    }

    // Clamp offsets to be within the node's bounds, respecting node type
    let clampedStartOffset = state.startOffset
    if (startNode.nodeType === Node.TEXT_NODE) {
        clampedStartOffset = Math.min(state.startOffset, startNode.textContent?.length ?? 0)
    } else if (startNode.nodeType === Node.ELEMENT_NODE) {
        clampedStartOffset = Math.min(state.startOffset, startNode.childNodes.length)
    }

    let clampedEndOffset = state.endOffset
    if (endNode.nodeType === Node.TEXT_NODE) {
        clampedEndOffset = Math.min(state.endOffset, endNode.textContent?.length ?? 0)
    } else if (endNode.nodeType === Node.ELEMENT_NODE) {
        clampedEndOffset = Math.min(state.endOffset, endNode.childNodes.length)
    }

    try {
        console.log(`[restoreSelection] Setting start: Node=`, startNode, `Offset=`, clampedStartOffset, `(Original: ${state.startOffset}, Type: ${startNode.nodeType}, Node text/childNodes: "${startNode.nodeType === Node.TEXT_NODE ? startNode.textContent?.substring(0, 20) : startNode.childNodes.length}")`)
        range.setStart(startNode, clampedStartOffset)
        console.log(`[restoreSelection] Setting end: Node=`, endNode, `Offset=`, clampedEndOffset, `(Original: ${state.endOffset}, Type: ${endNode.nodeType}, Node text/childNodes: "${endNode.nodeType === Node.TEXT_NODE ? endNode.textContent?.substring(0, 20) : endNode.childNodes.length}")`)
        range.setEnd(endNode, clampedEndOffset)
    } catch (e) {
        console.error('[restoreSelection] Error setting range start/end:', e, {
            startNode,
            startOffset: clampedStartOffset,
            endNode,
            endOffset: clampedEndOffset,
        })
        return
    }
    // range.setEnd(endNode, endOffset); // Already set in the try block

    const selection = window.getSelection()
    if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
        console.log('[restoreSelection] Selection restored successfully.')
    } else {
        console.error('[restoreSelection] window.getSelection() returned null. Cannot restore selection.')
    }
}

/**
 * Generate a path of child indexes from a node up to the root.
 */
function getNodePath(node: Node, root: Node): number[] {
    const path: number[] = []
    while (node && node !== root) {
        const parent = node.parentNode
        if (!parent) break
        const index = Array.prototype.indexOf.call(parent.childNodes, node)
        path.unshift(index)
        node = parent
    }
    return path
}

/**
 * Resolve a node by its child index path from the root.
 */
function getNodeFromPath(path: number[], root: Node): Node | null {
    let node: Node | null = root
    for (const index of path) {
        if (!node || !node.childNodes || !node.childNodes[index]) return null
        node = node.childNodes[index]
    }
    return node
}



// Helper function to get the first Range object from the selection
export const getCurrentRange = (): Range | null => {
    const selection = $$(range)
    return selection?.ranges?.[0] ?? null
}

export const range = useMemo(() => {
    const editor = useEditor()
    return $$(useSelection(editor))
})

// export const range = useSelection()


export function cloneAttributes(target: HTMLElement, source: HTMLElement) {
    [...source.attributes as any].forEach(attr => { target.setAttribute(attr.nodeName, attr.nodeValue) })
}


export const expandRange = (): Range | null => {
    const r = getCurrentRange()
    if (!r) return null

    if (r.collapsed) {
        // Expand to word under or beside the cursor
        const wordRange = document.createRange()
        const { startContainer, startOffset } = r

        if (!startContainer) return r // Return original if no container

        if (startContainer.nodeType === Node.TEXT_NODE) {
            const text = startContainer.textContent || ""
            let start = startOffset, end = startOffset

            // Expand left
            while (start > 0 && /\w/.test(text[start - 1])) start--
            // Expand right
            while (end < text.length && /\w/.test(text[end])) end++

            if (start !== end) {
                wordRange.setStart(startContainer, start)
                wordRange.setEnd(startContainer, end)
                return wordRange // Return new expanded range
            }
        } else if (startContainer.nodeType === Node.ELEMENT_NODE && startOffset > 0 && startContainer.childNodes[startOffset - 1]?.nodeType === Node.TEXT_NODE) {
            // If cursor is just before a word, move inside the text node
            // This part of original expandRange was a bit complex, simplifying for revert
            // The original code modified 'r' in place here.
            // For now, this revert won't handle this specific sub-case of element node expansion.
        }
    }
    return r // Return original range
}

export const sanitizeElement = (element: HTMLElement) => {
    const textNodes: ChildNode[] = []
    const tail: ChildNode[] = []

    let haveNonText = false

    element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && !haveNonText) {
            // Sanitize text node: remove redundant quotes and trim spaces
            textNodes.push(node)
        } else {
            haveNonText = true
            tail.push(node)
        }
    })

    textNodes.forEach(e => element.removeChild(e))
    element.prepend(textNodes.map(n => n.textContent!.trim()).join(' '), ...tail)
}

export const selectText = (element: HTMLElement, range: Range, t: string) => {
    const textNode = element.firstChild // Get the text node inside <p>

    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const text = textNode.textContent
        const startIndex = text.indexOf(t)
        const endIndex = startIndex + t.length

        if (startIndex !== -1) {
            range.setStart(textNode, startIndex)
            range.setEnd(textNode, endIndex)

            const selection = window.getSelection()
            selection.removeAllRanges()
            selection.addRange(range)
        }
    }
}

// Complex applyStyle function to be restored
export const applyStyle = (styleSetter: (element: HTMLElement) => void) => {
    console.groupCollapsed('[applyStyle] Applying styles...')
    const editor = $$(useEditor()) ?? $$(getCurrentEditor())
    const currentWindowSelection = window.getSelection()

    if (!currentWindowSelection || currentWindowSelection.rangeCount === 0) {
        console.warn('[applyStyle] No selection or range count is zero.')
        return
    }

    const initialGlobalRange = currentWindowSelection.getRangeAt(0).cloneRange()
    const initialSelectionState = getSelection(editor) // Snapshot before any changes

    if (!initialSelectionState) {
        console.warn('[applyStyle] Could not get initial selection state.')
        return
    }

    console.log('[applyStyle] Initial SelectionState:', initialSelectionState)
    console.log('[applyStyle] Initial GlobalRange:', initialGlobalRange)

    if (initialSelectionState.isCollapsed) {
        console.log('[applyStyle] Case: Initial selection is collapsed.')
        // Try to determine if the cursor is within a word
        const container = initialGlobalRange.startContainer
        const offset = initialGlobalRange.startOffset
        let wordRange: Range | null = null
        let originalCursorOffsetInWord = -1

        if (container.nodeType === Node.TEXT_NODE) {
            const text = container.textContent || ""
            let start = offset
            let end = offset
            // Expand left
            while (start > 0 && /\w/.test(text[start - 1])) {
                start--
            }
            // Expand right
            while (end < text.length && /\w/.test(text[end])) {
                end++
            }

            if (start !== end) { // Cursor is within a word
                wordRange = document.createRange()
                wordRange.setStart(container, start)
                wordRange.setEnd(container, end)
                originalCursorOffsetInWord = offset - start
                console.log(`[applyStyle] Collapsed cursor in word: "${text.substring(start, end)}", original offset in word: ${originalCursorOffsetInWord}`)
            }
        }
        // TODO: Add similar logic for ELEMENT_NODE if cursor is at boundary of elements that form a word

        if (wordRange) {
            // Scenario A: Cursor within a word (e.g., wo|rd)
            console.log('[applyStyle] Scenario A: Styling word based on cursor.', wordRange.toString())
            const spanElement = document.createElement('span')
            try {
                wordRange.surroundContents(spanElement) // Modifies DOM, may invalidate initialGlobalRange's container/offset for the original node
                styleSetter(spanElement)

                if (spanElement.getAttribute('style') === '' && !styleSetter.toString().includes('text-decoration')) {
                    const parent = spanElement.parentNode
                    if (parent) {
                        while (spanElement.firstChild) {
                            parent.insertBefore(spanElement.firstChild, spanElement)
                        }
                        parent.removeChild(spanElement)
                    }
                    console.log('[applyStyle] Word styled span was empty, unwrapped. Restoring original selection.')
                    if (initialSelectionState) restoreSelection(initialSelectionState, editor)
                } else {
                    // Restore cursor to its original relative position within the styled word
                    const textNodeInsideSpan = spanElement.firstChild
                    if (textNodeInsideSpan && textNodeInsideSpan.nodeType === Node.TEXT_NODE && originalCursorOffsetInWord !== -1) {
                        const newCursorOffset = Math.max(0, Math.min(originalCursorOffsetInWord, textNodeInsideSpan.textContent?.length ?? 0))
                        const newRangeToRestore = document.createRange()
                        newRangeToRestore.setStart(textNodeInsideSpan, newCursorOffset)
                        newRangeToRestore.collapse(true)
                        currentWindowSelection.removeAllRanges()
                        currentWindowSelection.addRange(newRangeToRestore)
                        console.log('[applyStyle] Restored cursor inside styled word at offset:', newCursorOffset)
                    } else {
                        console.warn('[applyStyle] Could not restore cursor precisely in word, falling back to initial state restoration.')
                        if (initialSelectionState) restoreSelection(initialSelectionState, editor)
                    }
                }
            } catch (e) {
                console.error('[applyStyle] Error using surroundContents for word styling:', e, 'Falling back to extract/insert.')
                // Fallback: More disruptive, use original range (which is collapsed)
                const fallbackSpan = document.createElement('span')
                const tempTextForStyle = document.createTextNode(wordRange.toString()) // Get the word text
                fallbackSpan.appendChild(tempTextForStyle) // Apply style to a span with the word
                styleSetter(fallbackSpan)

                if (fallbackSpan.getAttribute('style') === '' && !styleSetter.toString().includes('text-decoration')) {
                    if (initialSelectionState) restoreSelection(initialSelectionState, editor) // No style, just restore
                } else {
                    wordRange.deleteContents() // Delete the original word text
                    wordRange.insertNode(fallbackSpan) // Insert the new styled span

                    // Try to place cursor inside this new span
                    const textNodeInFallbackSpan = fallbackSpan.firstChild
                    if (textNodeInFallbackSpan && textNodeInFallbackSpan.nodeType === Node.TEXT_NODE && originalCursorOffsetInWord !== -1) {
                        const newCursorOffset = Math.max(0, Math.min(originalCursorOffsetInWord, textNodeInFallbackSpan.textContent?.length ?? 0))
                        const newRangeToRestore = document.createRange()
                        newRangeToRestore.setStart(textNodeInFallbackSpan, newCursorOffset)
                        newRangeToRestore.collapse(true)
                        currentWindowSelection.removeAllRanges()
                        currentWindowSelection.addRange(newRangeToRestore)
                    } else {
                        if (initialSelectionState) restoreSelection(initialSelectionState, editor) // Fallback
                    }
                }
            }
        } else {
            // Scenario B: Cursor in whitespace, or between words
            console.log('[applyStyle] Scenario B: Inserting new styled span for typing.')
            const spanElement = document.createElement('span')
            styleSetter(spanElement)

            // Only insert if a style was actually applied or it's a non-attribute style like underline
            if (spanElement.getAttribute('style') === '' && !styleSetter.toString().includes('text-decoration')) {
                console.log('[applyStyle] No style effectively applied, not inserting empty span. Restoring original cursor.')
                if (initialSelectionState) restoreSelection(initialSelectionState, editor)
            } else {
                spanElement.appendChild(document.createTextNode('\uFEFF')) // ZWNBSP
                initialGlobalRange.insertNode(spanElement) // initialGlobalRange is collapsed here

                const newCursorRange = document.createRange()
                // Ensure spanElement.firstChild exists (the ZWNBSP text node)
                const zwspNode = spanElement.firstChild
                if (zwspNode && zwspNode.nodeType === Node.TEXT_NODE) {
                    // Select the ZWNBSP node itself, so typing replaces it.
                    newCursorRange.selectNode(zwspNode)
                    // After replacement, the cursor is usually placed after the typed content by the browser.
                    currentWindowSelection.removeAllRanges()
                    currentWindowSelection.addRange(newCursorRange)
                    console.log('[applyStyle] Inserted new styled span, ZWNBSP selected.')
                } else {
                    console.error('[applyStyle] Failed to find ZWNBSP node in new span. Restoring original selection.')
                    if (initialSelectionState) restoreSelection(initialSelectionState, editor)
                }
            }
        }
    } else {
        // Case: Initial selection is not collapsed (user selected a range)
        console.log('[applyStyle] Case: Non-collapsed selection.')
        const spanElement = document.createElement('span')
        try {
            initialGlobalRange.surroundContents(spanElement) // Use the original range
            styleSetter(spanElement)
            if (spanElement.getAttribute('style') === '' && !styleSetter.toString().includes('text-decoration')) {
                const parent = spanElement.parentNode
                if (parent) {
                    while (spanElement.firstChild) {
                        parent.insertBefore(spanElement.firstChild, spanElement)
                    }
                    parent.removeChild(spanElement)
                }
            }
        } catch (e) {
            console.warn("[applyStyle] surroundContents failed for non-collapsed selection, falling back to extract/insert.", e)
            // Fallback to extractContents and insertNode
            const extractedContents = initialGlobalRange.extractContents() // Modifies initialGlobalRange
            spanElement.appendChild(extractedContents)
            initialGlobalRange.insertNode(spanElement) // Inserts span at the start of where initialGlobalRange was
            styleSetter(spanElement)
            if (spanElement.getAttribute('style') === '' && !styleSetter.toString().includes('text-decoration')) {
                // Unwrap the span by replacing it with its children
                const parent = spanElement.parentNode
                if (parent) {
                    while (spanElement.firstChild) {
                        parent.insertBefore(spanElement.firstChild, spanElement)
                    }
                    parent.removeChild(spanElement)
                }
            }
        }
        // Restore the original selection boundaries
        if (initialSelectionState) {
            restoreSelection(initialSelectionState, editor)
            console.log('[applyStyle] Restored original non-collapsed selection state.')
        }
    }
    // Ensure editor focus if needed, though selection changes should handle it.
    // $$(useEditor())?.focus()
    console.groupEnd()
}

// #region apply style original
export const applyStyleOriginal = (styleSetter: (element: HTMLElement) => void) => {
    console.groupCollapsed('[applyStyle] Applying styles...')
    const editor = $$(useEditor()) ?? $$(getCurrentEditor())
    const currentWindowSelection = window.getSelection()

    if (!currentWindowSelection || currentWindowSelection.rangeCount === 0) {
        console.warn('[applyStyle] No selection or range count is zero.')
        return
    }

    const initialGlobalRange = currentWindowSelection.getRangeAt(0).cloneRange()
    const initialSelectionState = getSelection(editor) // Snapshot before any changes

    if (!initialSelectionState) {
        console.warn('[applyStyle] Could not get initial selection state.')
        return
    }

    console.log('[applyStyle] Initial SelectionState:', initialSelectionState)
    console.log('[applyStyle] Initial GlobalRange:', initialGlobalRange)

    if (initialSelectionState.isCollapsed) {
        console.log('[applyStyle] Case: Initial selection is collapsed.')
        // Try to determine if the cursor is within a word
        const container = initialGlobalRange.startContainer
        const offset = initialGlobalRange.startOffset
        let wordRange: Range | null = null
        let originalCursorOffsetInWord = -1

        if (container.nodeType === Node.TEXT_NODE) {
            const text = container.textContent || ""
            let start = offset
            let end = offset
            // Expand left
            while (start > 0 && /\w/.test(text[start - 1])) {
                start--
            }
            // Expand right
            while (end < text.length && /\w/.test(text[end])) {
                end++
            }

            if (start !== end) { // Cursor is within a word
                wordRange = document.createRange()
                wordRange.setStart(container, start)
                wordRange.setEnd(container, end)
                originalCursorOffsetInWord = offset - start
                console.log(`[applyStyle] Collapsed cursor in word: "${text.substring(start, end)}", original offset in word: ${originalCursorOffsetInWord}`)
            }
        }
        // TODO: Add similar logic for ELEMENT_NODE if cursor is at boundary of elements that form a word

        if (wordRange) {
            // Scenario A: Cursor within a word (e.g., wo|rd)
            console.log('[applyStyle] Scenario A: Styling word based on cursor.', wordRange.toString())
            const spanElement = document.createElement('span')
            try {
                wordRange.surroundContents(spanElement) // Modifies DOM, may invalidate initialGlobalRange's container/offset for the original node
                styleSetter(spanElement)

                if (spanElement.getAttribute('style') === '' && !styleSetter.toString().includes('text-decoration')) {
                    const parent = spanElement.parentNode
                    if (parent) {
                        while (spanElement.firstChild) {
                            parent.insertBefore(spanElement.firstChild, spanElement)
                        }
                        parent.removeChild(spanElement)
                    }
                    console.log('[applyStyle] Word styled span was empty, unwrapped. Restoring original selection.')
                    if (initialSelectionState) restoreSelection(initialSelectionState, editor)
                } else {
                    // Restore cursor to its original relative position within the styled word
                    const textNodeInsideSpan = spanElement.firstChild
                    if (textNodeInsideSpan && textNodeInsideSpan.nodeType === Node.TEXT_NODE && originalCursorOffsetInWord !== -1) {
                        const newCursorOffset = Math.max(0, Math.min(originalCursorOffsetInWord, textNodeInsideSpan.textContent?.length ?? 0))
                        const newRangeToRestore = document.createRange()
                        newRangeToRestore.setStart(textNodeInsideSpan, newCursorOffset)
                        newRangeToRestore.collapse(true)
                        currentWindowSelection.removeAllRanges()
                        currentWindowSelection.addRange(newRangeToRestore)
                        console.log('[applyStyle] Restored cursor inside styled word at offset:', newCursorOffset)
                    } else {
                        console.warn('[applyStyle] Could not restore cursor precisely in word, falling back to initial state restoration.')
                        if (initialSelectionState) restoreSelection(initialSelectionState, editor)
                    }
                }
            } catch (e) {
                console.error('[applyStyle] Error using surroundContents for word styling:', e, 'Falling back to extract/insert.')
                // Fallback: More disruptive, use original range (which is collapsed)
                const fallbackSpan = document.createElement('span')
                const tempTextForStyle = document.createTextNode(wordRange.toString()) // Get the word text
                fallbackSpan.appendChild(tempTextForStyle) // Apply style to a span with the word
                styleSetter(fallbackSpan)

                if (fallbackSpan.getAttribute('style') === '' && !styleSetter.toString().includes('text-decoration')) {
                    if (initialSelectionState) restoreSelection(initialSelectionState, editor) // No style, just restore
                } else {
                    wordRange.deleteContents() // Delete the original word text
                    wordRange.insertNode(fallbackSpan) // Insert the new styled span

                    // Try to place cursor inside this new span
                    const textNodeInFallbackSpan = fallbackSpan.firstChild
                    if (textNodeInFallbackSpan && textNodeInFallbackSpan.nodeType === Node.TEXT_NODE && originalCursorOffsetInWord !== -1) {
                        const newCursorOffset = Math.max(0, Math.min(originalCursorOffsetInWord, textNodeInFallbackSpan.textContent?.length ?? 0))
                        const newRangeToRestore = document.createRange()
                        newRangeToRestore.setStart(textNodeInFallbackSpan, newCursorOffset)
                        newRangeToRestore.collapse(true)
                        currentWindowSelection.removeAllRanges()
                        currentWindowSelection.addRange(newRangeToRestore)
                    } else {
                        if (initialSelectionState) restoreSelection(initialSelectionState, editor) // Fallback
                    }
                }
            }
        } else {
            // Scenario B: Cursor in whitespace, or between words
            console.log('[applyStyle] Scenario B: Inserting new styled span for typing.')
            const spanElement = document.createElement('span')
            styleSetter(spanElement)

            // Only insert if a style was actually applied or it's a non-attribute style like underline
            if (spanElement.getAttribute('style') === '' && !styleSetter.toString().includes('text-decoration')) {
                console.log('[applyStyle] No style effectively applied, not inserting empty span. Restoring original cursor.')
                if (initialSelectionState) restoreSelection(initialSelectionState, editor)
            } else {
                spanElement.appendChild(document.createTextNode('\uFEFF')) // ZWNBSP
                initialGlobalRange.insertNode(spanElement) // initialGlobalRange is collapsed here

                const newCursorRange = document.createRange()
                // Ensure spanElement.firstChild exists (the ZWNBSP text node)
                const zwspNode = spanElement.firstChild
                if (zwspNode && zwspNode.nodeType === Node.TEXT_NODE) {
                    // Select the ZWNBSP node itself, so typing replaces it.
                    newCursorRange.selectNode(zwspNode)
                    // After replacement, the cursor is usually placed after the typed content by the browser.
                    currentWindowSelection.removeAllRanges()
                    currentWindowSelection.addRange(newCursorRange)
                    console.log('[applyStyle] Inserted new styled span, ZWNBSP selected.')
                } else {
                    console.error('[applyStyle] Failed to find ZWNBSP node in new span. Restoring original selection.')
                    if (initialSelectionState) restoreSelection(initialSelectionState, editor)
                }
            }
        }
    } else {
        // Case: Initial selection is not collapsed (user selected a range)
        console.log('[applyStyle] Case: Non-collapsed selection.')
        const spanElement = document.createElement('span')
        try {
            initialGlobalRange.surroundContents(spanElement) // Use the original range
            styleSetter(spanElement)
            if (spanElement.getAttribute('style') === '' && !styleSetter.toString().includes('text-decoration')) {
                const parent = spanElement.parentNode
                if (parent) {
                    while (spanElement.firstChild) {
                        parent.insertBefore(spanElement.firstChild, spanElement)
                    }
                    parent.removeChild(spanElement)
                }
            }
        } catch (e) {
            console.warn("[applyStyle] surroundContents failed for non-collapsed selection, falling back to extract/insert.", e)
            // Fallback to extractContents and insertNode
            const extractedContents = initialGlobalRange.extractContents() // Modifies initialGlobalRange
            spanElement.appendChild(extractedContents)
            initialGlobalRange.insertNode(spanElement) // Inserts span at the start of where initialGlobalRange was
            styleSetter(spanElement)
            if (spanElement.getAttribute('style') === '' && !styleSetter.toString().includes('text-decoration')) {
                // Unwrap the span by replacing it with its children
                const parent = spanElement.parentNode
                if (parent) {
                    while (spanElement.firstChild) {
                        parent.insertBefore(spanElement.firstChild, spanElement)
                    }
                    parent.removeChild(spanElement)
                }
            }
        }
        // Restore the original selection boundaries
        if (initialSelectionState) {
            restoreSelection(initialSelectionState, editor)
            console.log('[applyStyle] Restored original non-collapsed selection state.')
        }
    }
    // Ensure editor focus if needed, though selection changes should handle it.
    // $$(useEditor())?.focus()
    console.groupEnd()
}
// #endregion


export const isTags = (node: HTMLElement, ...args: string[]) => args.some(t => node.nodeName === t)

const BLOCK_WRAPPER_TAGS = [
    'P', 'DIV', 'UL', 'OL', 'TABLE', 'TBODY', 'THEAD', 'TFOOT',
    'TR', 'TD', 'BLOCKQUOTE', 'IMG', 'FIGURE', 'ASIDE', 'SECTION', 'NAV',
    'HEADER', 'FOOTER', 'ARTICLE', 'MAIN', 'FORM', 'FIELDSET'
]

export const getSelectedText = (currentRange: Range | undefined | null): string | null => {
    if (currentRange) {
        return currentRange.toString()
    }
    return null
}

export const replaceSelectedText = (currentRange: Range | undefined | null, newText: string) => {
    if (currentRange) {
        currentRange.deleteContents()
        currentRange.insertNode(document.createTextNode(newText))
    }
}

export const getElementsInRange = (
    range: Range,
    container: ObservableMaybe<HTMLDivElement>
): HTMLElement[] => {
    const root = $$(container)!
    const results: HTMLElement[] = []
    const seen = new Set<HTMLElement>()

    const getListAncestor = (node: Node | null): HTMLElement | null => {
        while (node && node !== root) {
            if (node instanceof HTMLElement && (node.tagName === 'UL' || node.tagName === 'OL')) {
                return node
            }
            node = node.parentNode
        }
        return null
    }

    const startList = getListAncestor(range.startContainer)
    const endList = getListAncestor(range.endContainer)
    const isWithinOneList = startList && startList === endList

    if (isWithinOneList) {
        // Return selected <li>s only
        return Array.from(startList!.querySelectorAll('li')).filter(li =>
            range.intersectsNode(li)
        )
    }

    // Otherwise return top-level semantic/block elements in the selection
    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT,
        {
            acceptNode: (node: Node) => {
                if (!(node instanceof HTMLElement)) return NodeFilter.FILTER_SKIP
                if (!range.intersectsNode(node)) return NodeFilter.FILTER_SKIP

                const tag = node.tagName
                if (BLOCK_WRAPPER_TAGS.includes(tag)) {
                    // If an ancestor is already in results, skip child
                    for (const seenNode of seen) {
                        if (seenNode.contains(node)) return NodeFilter.FILTER_SKIP
                    }

                    seen.add(node)
                    return NodeFilter.FILTER_ACCEPT
                }

                return NodeFilter.FILTER_SKIP
            }
        }
    )

    let node: Node | null
    while ((node = walker.nextNode())) {
        results.push(node as HTMLElement)
    }

    return results
}

/**
 * Retrieves an array of HTML table cell elements (td/th) that intersect with the given range.
 * 
 * @param range - The current browser selection range.
 * @param container - The Woby observable containing the editor root element.
 * @returns An array of selected HTMLTableCellElement objects.
 */
export const getSelectedTableCells = (
    range: Range,
    container: Observable<HTMLDivElement>
): HTMLTableCellElement[] => {
    const root = $$(container)!
    const selectedCells: HTMLTableCellElement[] = []

    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT,
        {
            acceptNode: (node: Node) => {
                if (!(node instanceof HTMLTableCellElement)) return NodeFilter.FILTER_SKIP
                return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
            }
        }
    )

    let node: Node | null
    while ((node = walker.nextNode())) {
        selectedCells.push(node as HTMLTableCellElement)
    }

    return selectedCells
}

/**
 * Moves the selection focus to the adjacent table cell.
 * 
 * @param reverse - If true, moves to the previous cell (Shift+Tab behavior). 
 *                  If false, moves to the next cell (Tab behavior).
 */
export function focusNextTableCell(reverse: boolean = false) {
    const selection = document.getSelection()
    if (!selection || !selection.focusNode) return

    // Find the current <td>
    let currentTd = selection.focusNode as HTMLElement | null
    while (currentTd && currentTd.tagName !== 'TD' && currentTd.tagName !== 'TH') {
        currentTd = currentTd.parentElement
    }

    if (!currentTd) return

    const allCells = Array.from(
        currentTd.closest('table')!.querySelectorAll('td, th')
    ) as HTMLElement[]

    const currentIndex = allCells.indexOf(currentTd)
    const nextIndex = reverse ? currentIndex - 1 : currentIndex + 1

    if (nextIndex >= 0 && nextIndex < allCells.length) {
        const nextCell = allCells[nextIndex]
        // placeCaretAtStart(nextCell)
        selectAllInElement(nextCell)
    }
}

function placeCaretAtStart(el: HTMLElement) {
    const range = document.createRange()
    const sel = window.getSelection()
    range.selectNodeContents(el)
    range.collapse(true)
    sel?.removeAllRanges()
    sel?.addRange(range)
}

function selectAllInElement(el: HTMLElement) {
    const range = document.createRange()
    range.selectNodeContents(el)

    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
}


export const findBlockParent = (element: HTMLElement, editor: Observable<HTMLDivElement>): HTMLElement | null => {
    let currentElement: HTMLElement | null = element
    while (currentElement && currentElement !== $$(editor)) {
        const displayStyle = getComputedStyle(currentElement).display
        if (displayStyle === 'block' || displayStyle === 'flex' || displayStyle === 'grid' || displayStyle === 'flow-root')
            return currentElement

        currentElement = currentElement.parentElement
    }
    return null
}

// Define a local type for format options to avoid direct import if complex
// This should mirror the structure of formatOptions in TextFormatDropDown.tsx
type FormatOptionType = {
    label: string
    tag: string
    hotkey?: string
    class?: string
}

export const convertToSemanticElement = (
    elementToConvert: HTMLElement,
    targetTag: string,
    editorRoot: HTMLDivElement,
    formatOptionsArray: FormatOptionType[]
) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
        editorRoot.focus() // Ensure focus if no selection
        return
    }

    const currentRange = selection.getRangeAt(0).cloneRange()
    if (!currentRange) {
        editorRoot.focus()
        return
    }

    let newElement: HTMLElement | null = null
    const originalTagLower = elementToConvert.tagName.toLowerCase()
    const targetTagLower = targetTag.toLowerCase()

    if (originalTagLower === 'li') {
        const liElement = elementToConvert as HTMLLIElement
        const firstChild = liElement.firstElementChild

        if (firstChild && firstChild.tagName.toLowerCase() === targetTagLower) {
            // Case: LI contains targetTag -> Unwrap to plain LI content
            const fragment = document.createDocumentFragment()
            while (firstChild.firstChild) {
                fragment.appendChild(firstChild.firstChild)
            }
            liElement.innerHTML = '' // Clear the LI
            liElement.appendChild(fragment) // Add unwrapped content
            newElement = liElement
        } else if (firstChild && firstChild.nodeType === Node.ELEMENT_NODE) {
            // Case: LI contains a different block element -> Change inner block
            const innerBlock = document.createElement(targetTag)
            while (firstChild.firstChild) {
                innerBlock.appendChild(firstChild.firstChild)
            }
            liElement.replaceChild(innerBlock, firstChild)
            newElement = innerBlock
        } else {
            // Case: LI has no block child (or no child at all) -> Wrap LI content
            const wrapper = document.createElement(targetTag)
            while (liElement.firstChild) {
                wrapper.appendChild(liElement.firstChild)
            }
            if (wrapper.childNodes.length === 0 && wrapper.tagName.toLowerCase() !== 'br') {
                wrapper.appendChild(document.createElement('br'))
            }
            liElement.appendChild(wrapper)
            newElement = wrapper
        }
    } else { // Not an LI element (e.g., P, H1, DIV)
        if (originalTagLower === targetTagLower && targetTagLower !== 'p') {
            // Case: Element is already targetTag (and not P) -> Convert to P (toggle)
            newElement = document.createElement('p')
        } else if (originalTagLower === targetTagLower && targetTagLower === 'p') {
            // Case: P + P -> ensure it's a clean P (attributes handled by class logic)
            newElement = elementToConvert // No structural change, but will re-apply class
        } else {
            // Case: Different tag or P to H1 etc. -> Replace element
            newElement = document.createElement(targetTag)
        }

        if (newElement !== elementToConvert) {
            while (elementToConvert.firstChild) {
                newElement.appendChild(elementToConvert.firstChild)
            }
            if (newElement.childNodes.length === 0 && newElement.tagName.toLowerCase() !== 'br') {
                newElement.appendChild(document.createElement('br'))
            }
            elementToConvert.parentNode?.replaceChild(newElement, elementToConvert)
        }
    }

    // Apply class styling
    if (newElement) {
        const formatOption = formatOptionsArray.find(opt => opt.tag.toLowerCase() === newElement!.tagName.toLowerCase())
        if (formatOption) {
            if (formatOption.class && formatOption.class.trim() !== '') {
                newElement.className = formatOption.class
            } else {
                newElement.removeAttribute('class')
            }
        } else if (newElement.tagName.toLowerCase() === 'p') { // Default P styling
            newElement.removeAttribute('class')
        }

        // Restore selection to the new or modified element
        try {
            currentRange.selectNodeContents(newElement)
            currentRange.collapse(false) // Collapse to the end
            selection.removeAllRanges()
            selection.addRange(currentRange)
        } catch (e) {
            console.error("Error restoring selection in convertToSemanticElement:", e)
            // Fallback: select the editor div or do nothing further with selection
            editorRoot.focus()
        }
    } else {
        // If newElement is null (should not happen with current logic but as a safeguard)
        editorRoot.focus()
    }
    // editorRoot.focus(); // Already handled or implicitly handled by selection
}

function findCommonAncestor(node1: Node, node2: Node): HTMLElement {
    let path1: HTMLElement[] = []
    let path2: HTMLElement[] = []
    let current: HTMLElement | null = node1 as HTMLElement

    while (current) {
        path1.push(current)
        current = current.parentElement
    }

    current = node2 as HTMLElement
    while (current) {
        path2.push(current)
        current = current.parentElement
    }

    let commonAncestor: HTMLElement | undefined
    while (path1.length > 0 && path2.length > 0 && path1[path1.length - 1] === path2[path2.length - 1]) {
        commonAncestor = path1.pop()
        path2.pop()
    }

    return commonAncestor!
}

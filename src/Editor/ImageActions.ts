/**
 * ImageActions: helpers to apply alignment and indent to an <img>
 * inside the editor. Alignment is applied by setting display:block +
 * margin (center) or float (left/right). Indent is applied by setting
 * margin-left (or wrapping in a span with padding-left for outdent
 * support).
 */

/**
 * Wrap an <img> in a <p> if it isn't already in a block element.
 * Returns the parent that the alignment was applied to.
 */
function ensureBlockParent(img: HTMLImageElement): HTMLElement {
    const parent = img.parentElement
    // Exclude the editor root div — it's not a content block
    if (parent && !parent.hasAttribute('data-editor-root') &&
        (parent.tagName === 'P' || parent.tagName === 'DIV' || parent.tagName === 'FIGURE' || parent.tagName === 'LI')) {
        return parent
    }
    // Wrap in a <p>
    const p = document.createElement('p')
    if (parent) {
        parent.insertBefore(p, img)
        p.appendChild(img)
    }
    return p
}

/**
 * Apply left/center/right alignment to an image.
 * - center: img gets display:block, margin:0 auto
 * - left: img gets float:left
 * - right: img gets float:right
 * Also clears the parent <p>'s text-align to avoid conflicts.
 */
export function applyImageAlignment(img: HTMLImageElement, align: 'left' | 'center' | 'right'): void {
    // Reset existing alignment
    img.style.float = ''
    img.style.display = ''
    img.style.marginLeft = ''
    img.style.marginRight = ''

    // If image is inside a list item, apply alignment via text-align on the LI
    // instead of display:block+margin (which conflicts with inline list layout)
    const li = img.closest('li')
    if (li) {
        const listParent = li.parentElement
        // Reset text-align on the list
        if (listParent) listParent.style.textAlign = ''
        li.style.textAlign = ''

        switch (align) {
            case 'center':
                li.style.textAlign = 'center'
                break
            case 'left':
                li.style.textAlign = 'left'
                break
            case 'right':
                li.style.textAlign = 'right'
                break
        }
        return
    }

    const block = ensureBlockParent(img)
    // Clear text-align on the block (only matters for inline children)
    block.style.textAlign = ''

    switch (align) {
        case 'center':
            img.style.display = 'block'
            img.style.marginLeft = 'auto'
            img.style.marginRight = 'auto'
            break
        case 'left':
            img.style.float = 'left'
            img.style.marginRight = '1em'
            img.style.marginBottom = '0.5em'
            break
        case 'right':
            img.style.float = 'right'
            img.style.marginLeft = '1em'
            img.style.marginBottom = '0.5em'
            break
    }
}

/**
 * Apply indent/outdent to an image.
 * - Indent: adds padding-left (20px per step) to the parent block
 * - Outdent: reduces padding-left, never below 0
 *
 * For left/right aligned (floated) images, indent moves the
 * left margin instead, so the floated image shifts right.
 */
export function applyImageIndent(img: HTMLImageElement, outdent: boolean, step: number = 20): void {
    const block = ensureBlockParent(img)
    const isFloated = img.style.float === 'left' || img.style.float === 'right'

    if (isFloated) {
        // For floated images, adjust the margin on the side opposite to the float
        const key = img.style.float === 'left' ? 'marginLeft' : 'marginRight'
        const current = parseInt(img.style[key] || '0', 10) || 0
        const next = outdent ? Math.max(0, current - step) : current + step
        img.style[key] = `${next}px`
        // Also add a small base margin
        if (next === 0 && img.style.float === 'left') img.style.marginRight = '1em'
        if (next === 0 && img.style.float === 'right') img.style.marginLeft = '1em'
    } else {
        // Centered / inline images: indent via parent block padding
        const current = parseInt(block.style.paddingLeft || '0', 10) || 0
        const next = outdent ? Math.max(0, current - step) : current + step
        block.style.paddingLeft = `${next}px`
    }
}

/**
 * Read the current alignment of an image. Used by the ImageResizer
 * mini-toolbar to highlight the active alignment button.
 */
export function getImageAlignment(img: HTMLImageElement): 'left' | 'center' | 'right' | null {
    if (img.style.float === 'left') return 'left'
    if (img.style.float === 'right') return 'right'
    if (img.style.display === 'block' && img.style.marginLeft === 'auto' && img.style.marginRight === 'auto') return 'center'
    return null
}

/**
 * Find the currently selected image in the editor, if any.
 * Checks multiple sources in order of reliability:
 * 1. Visible ImageResizer overlay (strongest signal)
 * 2. Shadow root expando set by ImageResizer
 * 3. Selection anchor inside/near an <img>
 */
export function getSelectedImage(editorEl?: HTMLElement | null): HTMLImageElement | null {
    const host = document.querySelector('wui-editor') as HTMLElement | null
    const shadow = host?.shadowRoot
    if (!shadow) return null

    // 1. Check for visible ImageResizer overlay - if it's visible, find the corresponding image
    // The overlay is positioned directly over the selected image
    const overlay = shadow.querySelector('[data-image-overlay]') as HTMLElement | null
    if (overlay && overlay.style.display !== 'none') {
        // Find image at overlay position
        const editorSurface = shadow.querySelector('[data-editor-root]') as HTMLElement | null
        if (editorSurface && overlay.offsetWidth > 0) {
            const rect = overlay.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            const elAtPoint = shadow.elementFromPoint(centerX, centerY)
            if (elAtPoint && elAtPoint.tagName === 'IMG') {
                return elAtPoint as HTMLImageElement
            }
            // Check if we're inside an image
            const img = elAtPoint?.closest('img')
            if (img) return img
        }
    }

    // 2. Check for the expando set by ImageResizer
    const activeImg = (shadow as any).__activeImage as HTMLImageElement | undefined
    if (activeImg && activeImg.tagName === 'IMG' && shadow.contains(activeImg)) {
        return activeImg
    }

    // 3. Fallback: check if selection anchor is an <img> or inside one
    const sel = shadow.getSelection()
    if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0)
        const sc = range.startContainer
        if (sc.nodeType === Node.ELEMENT_NODE && (sc as Element).tagName === 'IMG') {
            return sc as HTMLImageElement
        }
        // Check parent chain for image using closest()
        if (sc.nodeType === Node.ELEMENT_NODE) {
            const img = (sc as Element).closest('img')
            if (img) return img
        }
        // Also check parent chain manually for text nodes
        let node: Node | null = sc
        while (node && node !== shadow) {
            if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'IMG') {
                return node as HTMLImageElement
            }
            node = node.parentNode
        }
    }

    return null
}

/**
 * Apply a block-level command to the selected image.
 * Routes alignment/indent/list commands to image-specific handlers.
 * Returns true if the image was handled, false if the caller should proceed with text block handling.
 */
export function applyBlockCommandToSelectedImage(
    command: 'align-left' | 'align-center' | 'align-right' | 'align-justify' | 'indent' | 'outdent' | 'list',
    listType?: 'bullet' | 'number' | 'checkbox'
): boolean {
    const img = getSelectedImage()
    if (!img) return false

    switch (command) {
        case 'align-left':
            applyImageAlignment(img, 'left')
            return true
        case 'align-center':
            applyImageAlignment(img, 'center')
            return true
        case 'align-right':
            applyImageAlignment(img, 'right')
            return true
        case 'align-justify':
            // Justify doesn't apply to images - center instead
            applyImageAlignment(img, 'center')
            return true
        case 'indent':
            applyImageIndent(img, false)
            return true
        case 'outdent':
            applyImageIndent(img, true)
            return true
        case 'list': {
            // For list insertion, unwrap the image from any parent block (P/DIV/FIGURE)
            // so the image goes directly into the LI. This avoids block-level
            // elements stacking vertically above the list marker.
            let block = ensureBlockParent(img)
            // If img's direct parent is a P created by ensureBlockParent, extract img directly
            if (block.tagName === 'P' && img.parentElement === block) {
                block.parentNode?.insertBefore(img, block)
                block.remove()
                block = img
            }
            // If block is LI (image already in a list), use the LI directly
            let blockIsLi = block.tagName === 'LI'
            let currentParent = block.parentElement
            if (currentParent) {
                const listTag = listType === 'number' ? 'ol' : 'ul'
                const listId = listType === 'number' ? 'number-wrapper' : listType === 'checkbox' ? 'checkbox-wrapper' : 'bullet-wrapper'
                const listClasses = listType === 'number' ? 'list-inside list-decimal ml-6' : listType === 'checkbox' ? 'list-inside list-none ml-6' : 'list-inside list-disc ml-6'

                // Reset inline style from previous checkbox mode
                if (listType !== 'checkbox') {
                    const styleTarget = blockIsLi ? img : block
                    styleTarget.style.display = ''
                    styleTarget.style.verticalAlign = ''
                }

                // Save alignment before entering list (so we can restore on toggle-off)
                const savedAlign = img.style.textAlign || ''
                const savedDisplay = img.getAttribute('data-saved-display') || ''
                const savedMarginL = img.getAttribute('data-saved-ml') || ''
                const savedMarginR = img.getAttribute('data-saved-mr') || ''
                const savedFloat = img.getAttribute('data-saved-float') || ''

                // Check if image is already in a list of the same type — toggle off
                const existingList = currentParent.closest(`${listTag}[id="${listId}"]`) as HTMLElement | null
                if (existingList) {
                    const existingLi = blockIsLi ? block : block.closest('li')
                    if (existingLi && existingLi.parentElement === existingList) {
                        // Remove checkbox wrapper if present
                        const checkboxWrapper = existingLi.querySelector('.checklist-item-wrapper')
                        if (checkboxWrapper) {
                            checkboxWrapper.remove()
                            img.style.display = ''
                            img.style.verticalAlign = ''
                        }
                        // Restore saved alignment on img (not on LI)
                        const restoreTarget = blockIsLi ? img : block
                        if (savedDisplay) restoreTarget.style.display = savedDisplay
                        if (savedMarginL) restoreTarget.style.marginLeft = savedMarginL
                        if (savedMarginR) restoreTarget.style.marginRight = savedMarginR
                        if (savedFloat) restoreTarget.style.float = savedFloat
                        img.removeAttribute('data-saved-display')
                        img.removeAttribute('data-saved-ml')
                        img.removeAttribute('data-saved-mr')
                        img.removeAttribute('data-saved-float')

                        // Move img (not block) out of the list before removing LI
                        const moveNode = blockIsLi ? img : block
                        existingList.parentNode?.insertBefore(moveNode, existingList)
                        existingLi.remove()
                        if (existingList.children.length === 0) {
                            existingList.remove()
                        }
                        // After toggle-off, ensure image is wrapped in a proper content block
                        // (not the editor root div, which would cause subsequent list operations
                        // to wrap the entire editor)
                        if (moveNode.tagName === 'IMG') {
                            const postParent = moveNode.parentElement
                            if (postParent && postParent.hasAttribute('data-editor-root')) {
                                const newP = document.createElement('p')
                                postParent.insertBefore(newP, moveNode)
                                newP.appendChild(moveNode)
                            }
                        }
                        const host = document.querySelector('wui-editor')
                        host?.dispatchEvent(new CustomEvent('editor-change', { bubbles: true }))
                        return true
                    }
                }

                // If image is in a different list type, extract it from the old list first
                const oldList = currentParent.closest('ul, ol') as HTMLElement | null
                if (oldList) {
                    const oldLi = blockIsLi ? block : block.closest('li')
                    if (oldLi) {
                        // Remove checkbox wrapper if present
                        const checkboxWrapper = oldLi.querySelector('.checklist-item-wrapper')
                        if (checkboxWrapper) {
                            checkboxWrapper.remove()
                            const oldStyleTarget = blockIsLi ? img : block
                            oldStyleTarget.style.display = ''
                            oldStyleTarget.style.verticalAlign = ''
                        }
                        const moveNode = blockIsLi ? img : block
                        oldList.parentNode?.insertBefore(moveNode, oldList)
                        oldLi.remove()
                        if (oldList.children.length === 0) {
                            oldList.remove()
                        }
                        currentParent = moveNode.parentElement
                        block = moveNode
                        blockIsLi = false
                    }
                }

                // Save alignment state to img data attributes so we can restore on toggle-off
                if (block.style.display) img.setAttribute('data-saved-display', block.style.display)
                if (block.style.marginLeft) img.setAttribute('data-saved-ml', block.style.marginLeft)
                if (block.style.marginRight) img.setAttribute('data-saved-mr', block.style.marginRight)
                if (block.style.float) img.setAttribute('data-saved-float', block.style.float)

                // If block is LI, we need to extract img from LI before creating a new list
                const nodeToWrap = blockIsLi ? img : block

                let list = currentParent?.closest(listTag) as HTMLElement | null
                if (!list && currentParent) {
                    list = document.createElement(listTag)
                    list.id = listId
                    list.className = listClasses
                    currentParent.insertBefore(list, nodeToWrap)
                }
                if (list) {
                    const li = document.createElement('li')
                    list.appendChild(li)
                    li.appendChild(nodeToWrap)
                    // Make image inline so it sits beside the list marker (not above it)
                    if (nodeToWrap.tagName === 'IMG') {
                        nodeToWrap.style.display = 'inline'
                        nodeToWrap.style.verticalAlign = 'top'
                    }
                    if (listType === 'checkbox') {
                        nodeToWrap.style.display = 'inline'
                        nodeToWrap.style.verticalAlign = 'baseline'

                        // Create checkbox wrapper matching injectCheckbox in List.tsx
                        const wrapper = document.createElement('span')
                        wrapper.className = 'checklist-item-wrapper inline-block align-baseline mr-2'
                        wrapper.contentEditable = 'false'
                        wrapper.style.userSelect = 'none'
                        wrapper.innerHTML = '<div contenteditable="false"><input type="checkbox"></div>'
                        li.prepend(wrapper)
                    }
                }
            }
            const host = document.querySelector('wui-editor')
            host?.dispatchEvent(new CustomEvent('editor-change', { bubbles: true }))
            return true
        }
        default:
            return false
    }
}

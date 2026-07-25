import { $, $$, Observable } from 'woby'
import { getEditorPlugins } from './EditorPlugin'

/**
 * PropertyExtractor: Utility for detecting the current selection type
 * and extracting element properties into observable objects for PropertyForm.
 */

export type SelectionType = 'image' | 'text' | 'custom' | 'none'

export interface SelectionInfo {
    type: SelectionType
    element: HTMLElement | null
}

/**
 * Detect what is currently selected in the editor.
 * Priority: image > custom element > text > none
 *
 * Works in two modes:
 * 1. Shadow DOM mode: when the editor is rendered as a <wui-editor> custom element
 * 2. Light DOM mode: when the editor is rendered as a TSX component directly
 */
export function detectSelectionType(): SelectionInfo {
    const host = document.querySelector('wui-editor') as HTMLElement | null
    const shadow = host?.shadowRoot

    // ── Shadow DOM mode ──
    if (shadow) {
        // 1. Check for visible ImageResizer overlay (most reliable — the overlay is a DOM element
        //    that's always visible when an image is selected, unlike __activeImage expando which
        //    can be cleared by event propagation quirks).
        const overlay = shadow.querySelector('[data-image-overlay]') as HTMLElement | null
        if (overlay && overlay.style.display !== 'none' && overlay.offsetWidth > 0) {
            const editorSurface = shadow.querySelector('[data-editor-root]') as HTMLElement | null
            if (editorSurface) {
                const rect = overlay.getBoundingClientRect()
                const centerX = rect.left + rect.width / 2
                const centerY = rect.top + rect.height / 2
                // Use elementsFromPoint() instead of elementFromPoint() — the overlay DIV
                // sits on top of the IMG with z-index 5, so elementFromPoint() returns the
                // overlay DIV, not the IMG. elementsFromPoint() returns ALL elements at the
                // point, listed in paint order (topmost first). We iterate through to find
                // the first IMG element underneath the overlay.
                const allEls = shadow.elementsFromPoint(centerX, centerY)
                for (const el of allEls) {
                    if (el.tagName === 'IMG') {
                        return { type: 'image', element: el as HTMLImageElement }
                    }
                    const img = (el as HTMLElement).closest('img')
                    if (img) return { type: 'image', element: img as HTMLImageElement }
                }
            }
        }

        // 2. Check for active image (ImageResizer sets this expando — fallback if overlay check
        //    fails for any reason)
        const activeImg = (shadow as any).__activeImage as HTMLImageElement | undefined
        if (activeImg && activeImg.tagName === 'IMG' && shadow.contains(activeImg)) {
            return { type: 'image', element: activeImg }
        }

        // 3. Check selection for custom element or text
        const sel = shadow.getSelection()
        if (!sel || sel.rangeCount === 0) return { type: 'none', element: null }

        const range = sel.getRangeAt(0)
        let node: Node | null = range.commonAncestorContainer

        // Get registered plugin tag names for custom element detection
        const pluginTagNames = new Set($$(getEditorPlugins()).map(p => p.tagName.toUpperCase()))

        // Walk up from selection to find a custom element or the editor root
        while (node && node !== shadow) {
            if (node instanceof HTMLElement) {
                const tag = node.tagName.toLowerCase()
                // Custom elements have hyphens in tag name
                if (tag.includes('-') && !tag.startsWith('wui-')) {
                    return { type: 'custom', element: node }
                }
                // Also check registered plugins
                if (pluginTagNames.has(node.tagName.toUpperCase())) {
                    return { type: 'custom', element: node }
                }
            }
            node = node.parentNode
        }

        // 4. Text selection (non-collapsed or collapsed cursor in text)
        if (!range.collapsed) {
            let el = range.startContainer instanceof HTMLElement
                ? range.startContainer
                : range.startContainer.parentElement
            if (el) return { type: 'text', element: el }
        }

        // Collapsed cursor in text node
        if (range.collapsed && range.startContainer.nodeType === Node.TEXT_NODE) {
            const el = range.startContainer.parentElement
            if (el) return { type: 'text', element: el }
        }

        return { type: 'none', element: null }
    }

    // ── Light DOM mode (no <wui-editor> custom element) ──
    // The editor is rendered as a TSX component with [data-editor-root] on a contenteditable div
    const editorRoots = document.querySelectorAll('[data-editor-root]') as NodeListOf<HTMLElement>
    if (!editorRoots.length) return { type: 'none', element: null }

    // 1. Check for selected image inside the editor
    const sel = document.getSelection()
    if (!sel || sel.rangeCount === 0) {
        // No active selection — check if an image resizer is visible
        const activeImg = document.querySelector('[data-editor-root] img[data-active-image]') as HTMLImageElement | null
        if (activeImg) return { type: 'image', element: activeImg }
        return { type: 'none', element: null }
    }

    const range = sel.getRangeAt(0)

    // Find which editor root contains the selection (there may be multiple editors on the page)
    let editorRoot: HTMLElement | null = null
    for (const root of editorRoots) {
        if (root.contains(range.commonAncestorContainer)) {
            editorRoot = root
            break
        }
    }
    if (!editorRoot) return { type: 'none', element: null }

    // Check for image selection (img node or inside img)
    let node: Node | null = range.commonAncestorContainer
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement
    while (node && node !== editorRoot) {
        if (node instanceof HTMLElement && node.tagName === 'IMG') {
            return { type: 'image', element: node }
        }
        node = node.parentNode
    }

    // Check for text selection (non-collapsed)
    if (!range.collapsed) {
        let el = range.startContainer instanceof HTMLElement
            ? range.startContainer
            : range.startContainer.parentElement
        if (el) return { type: 'text', element: el }
    }

    // Collapsed cursor in text node
    if (range.collapsed && range.startContainer.nodeType === Node.TEXT_NODE) {
        const el = range.startContainer.parentElement
        if (el) return { type: 'text', element: el }
    }

    // If cursor is inside the editor but not in a text node, treat as text
    if (range.collapsed && editorRoot.contains(range.startContainer)) {
        return { type: 'text', element: editorRoot }
    }

    return { type: 'none', element: null }
}

/**
 * Extract image properties into observables for PropertyForm.
 * Each property is an observable that PropertyForm editors can read/write.
 */
export function extractImageProperties(img: HTMLImageElement): Record<string, Observable<any>> {
    return {
        src: $(img.getAttribute('src') || ''),
        alt: $(img.alt || ''),
        width: $(img.style.width || `${img.offsetWidth}px`),
        height: $(img.style.height || `${img.offsetHeight}px`),
        float: $(img.style.float || 'none'),
        display: $(img.style.display || 'inline'),
        marginLeft: $(img.style.marginLeft || '0'),
        marginRight: $(img.style.marginRight || '0'),
        maxWidth: $(img.style.maxWidth || '100%'),
    }
}

/**
 * Apply image property changes back to the DOM element.
 */
export function applyImageProperty(img: HTMLImageElement, key: string, value: any): void {
    console.log('[applyImageProperty] called with', key, '=', value, 'img.style.width before:', img.style.width)
    switch (key) {
        case 'src':
            img.setAttribute('src', value)
            break
        case 'alt':
            img.alt = value
            break
        case 'width':
        case 'height':
        case 'float':
        case 'display':
        case 'marginLeft':
        case 'marginRight':
        case 'maxWidth':
            img.style[key as any] = value
            break
    }
}

/**
 * Extract text/computed style properties into observables for PropertyForm.
 */
export function extractTextProperties(element: HTMLElement): Record<string, Observable<any>> {
    const computed = window.getComputedStyle(element)
    return {
        tagName: element.tagName.toLowerCase() as any, // Read-only: shows p, li, pre, code, etc.
        fontWeight: $(computed.fontWeight),
        fontStyle: $(computed.fontStyle),
        fontSize: $(computed.fontSize),
        fontFamily: $(computed.fontFamily),
        color: $(computed.color),
        backgroundColor: $(computed.backgroundColor),
        textAlign: $(computed.textAlign),
    }
}

/**
 * Apply text property changes back to the DOM element.
 */
export function applyTextProperty(element: HTMLElement, key: string, value: any): void {
    // For text, apply inline style changes
    const styleMap: Record<string, string> = {
        fontWeight: 'fontWeight',
        fontStyle: 'fontStyle',
        fontSize: 'fontSize',
        fontFamily: 'fontFamily',
        color: 'color',
        backgroundColor: 'backgroundColor',
        textAlign: 'textAlign',
    }
    if (styleMap[key]) {
        element.style[styleMap[key] as any] = value
    }
}

/**
 * Extract custom element attributes into observables for PropertyForm.
 * Skips style, class, and data-* attributes.
 */
export function extractCustomElementProperties(el: HTMLElement): Record<string, Observable<any>> {
    const props: Record<string, Observable<any>> = {}

    // Read-only tagName field
    props.tagName = el.tagName.toLowerCase() as any

    for (const attr of Array.from(el.attributes)) {
        // Skip internal attributes
        if (attr.name === 'style' || attr.name === 'class' || attr.name.startsWith('data-')) continue
        props[attr.name] = $(attr.value)
    }

    return props
}

/**
 * Apply custom element property changes back to the DOM element.
 */
export function applyCustomElementProperty(el: HTMLElement, key: string, value: any): void {
    el.setAttribute(key, String(value))
}

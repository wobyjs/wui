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
 */
export function detectSelectionType(): SelectionInfo {
    const host = document.querySelector('wui-editor') as HTMLElement | null
    const shadow = host?.shadowRoot
    if (!shadow) return { type: 'none', element: null }

    // 1. Check for active image (ImageResizer sets this expando)
    const activeImg = (shadow as any).__activeImage as HTMLImageElement | undefined
    if (activeImg && activeImg.tagName === 'IMG' && shadow.contains(activeImg)) {
        return { type: 'image', element: activeImg }
    }

    // 2. Check selection for custom element or text
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

    // 3. Text selection (non-collapsed or collapsed cursor in text)
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

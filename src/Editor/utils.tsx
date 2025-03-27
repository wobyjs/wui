import { useOnClickOutside, useSelection } from 'use-woby'
import { $, $$, useEffect, JSX, useMemo, Observable, createContext, useContext } from 'woby'
export const range = useSelection()



export function cloneAttributes(target: HTMLElement, source: HTMLElement) {
    [...source.attributes as any].forEach(attr => { target.setAttribute(attr.nodeName, attr.nodeValue) })
}


export const expandRange = () => {
    let r = $$(range)
    if (r.collapsed) {
        // Expand to word under or beside the cursor
        const wordRange = document.createRange()
        const { startContainer, startOffset } = r

        if (!startContainer) return

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
                r = wordRange
            }
        } else if (startContainer.nodeType === Node.ELEMENT_NODE && startContainer.childNodes[startOffset - 1]?.nodeType === Node.TEXT_NODE) {
            // If cursor is just before a word, move inside the text node
            const prevTextNode = startContainer.childNodes[startOffset - 1] as Text
            if (/\w/.test(prevTextNode.textContent?.slice(-1) || "")) {
                r.setStart(prevTextNode, prevTextNode.textContent?.length || 0)
                r.setEnd(prevTextNode, prevTextNode.textContent?.length || 0)
            }
        }
    }
    return r
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


export const applyStyle = (styleSetter: (element: HTMLElement) => void) => {
    let selection = window.getSelection()

    let r = expandRange()

    const selectedText = r.toString().trim()
    const parentElement = r.startContainer.nodeType === Node.ELEMENT_NODE
        ? r.startContainer as HTMLElement
        : r.startContainer.parentElement

    let newRange = document.createRange()

    if (parentElement.textContent?.trim() === selectedText) {
        styleSetter(parentElement)
        if (parentElement.getAttribute('style') === '') {
            const p = parentElement.parentElement
            parentElement.replaceWith(parentElement.textContent)
            sanitizeElement(p)
            selectText(p, newRange, parentElement.textContent)
        }
        else
            newRange.selectNodeContents(r.startContainer)
    } else {
        const spanElement = document.createElement('span') as HTMLSpanElement
        const extractedContents = r.extractContents()
        spanElement.appendChild(extractedContents)
        r.deleteContents()
        r.insertNode(spanElement)
        styleSetter(spanElement)

        if (spanElement.getAttribute('style') === '') {
            //@ts-ignore
            spanElement.replaceWith(...spanElement.childNodes) // Remove span if style is empty
        }
        newRange.selectNodeContents(spanElement)
    }

    selection?.removeAllRanges()
    selection?.addRange(newRange)
}

export const isTags = (node: HTMLElement, ...args: string[]) => args.some(t => node.nodeName === t)


// Helper function to get all paragraph nodes within a range
export const getParagraphsInRange = (range: Range, editor: Observable<HTMLDivElement>, ...tags: string[]): HTMLParagraphElement[] => {
    const paragraphs: HTMLParagraphElement[] = []
    let treeWalker = document.createTreeWalker(
        $$(editor)!, // Start from the editor element
        NodeFilter.SHOW_ELEMENT,
        {
            acceptNode: (node) => {
                if (isTags(node as HTMLElement, ...tags) && range.intersectsNode(node)) {
                    return NodeFilter.FILTER_ACCEPT
                }
                return NodeFilter.FILTER_SKIP
            }
        }
    )

    let node
    while ((node = treeWalker.nextNode())) {
        paragraphs.push(node as HTMLParagraphElement)
    }
    return paragraphs
}


const findParagraphParent = (node: Node | null, editor: Observable<HTMLDivElement>): HTMLParagraphElement | null => {
    if (!node) return null
    let current = node as HTMLElement
    while (current && current !== $$(editor)) {
        if (current.nodeType === Node.ELEMENT_NODE && (current as HTMLElement).nodeName === 'P') {
            return current as HTMLParagraphElement
        }
        current = current.parentNode as HTMLElement
    }
    return null
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


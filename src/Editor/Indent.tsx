import { $, $$, defaults, type JSX, customElement, type ElementAttributes, type Observable, ObservableMaybe, HtmlString, HtmlNumber, HtmlClass, HtmlBoolean, useEffect } from "woby"
import { Button, ButtonStyles } from '../Button'
import { useEditor } from './undoredo'
import IndentIcon from '../icons/indent'
import OutdentIcon from '../icons/outdent'
import { getActiveSelection, getCurrentEditor } from "./utils"

type IndentMode = "increase" | "decrease"

// Default props definition matching your other components
const def = () => ({
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    title: $("", HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    mode: $("increase", HtmlString) as ObservableMaybe<IndentMode>,
    step: $(1, HtmlNumber) as ObservableMaybe<number>,
    disabled: $(false, HtmlBoolean) as Observable<boolean>,
    identPx: $(8, HtmlNumber) as ObservableMaybe<number>,
})

const Indent = defaults(def, (props) => {
    const { buttonType, title, cls, class: cn, mode, step, disabled, identPx, ...otherProps } = props

    const editor = useEditor()
    const isDecrease = () => {
        return $$(mode) == 'decrease'
    }

    // Determine Icon and Title based on mode
    const displayIcon = () => $$(isDecrease) ? <IndentIcon class="size-5" /> : <OutdentIcon class="size-5" />

    const displayTitle = () => {
        const t = $$(title)
        if (t) return t
        return $$(isDecrease) ? "Decrease Indent" : "Increase Indent"
    }

    const handleClick = (e: any) => {
        const stepVal = $$(step)
        const pxVal = $$(identPx)

        const el = editor ?? getCurrentEditor()

        console.log("[Indent] handleClick - ", {
            "editor": { "el": $$(el), "type": typeof $$(el) },
            "mode": $$(mode),
            "isDecrease": $$(isDecrease),
            "step": stepVal,
            "identPx": pxVal,
        })

        // Call the helper logic
        applyIndent($$(el), $$(isDecrease), stepVal, pxVal)
    }

    return (
        <Button
            type={buttonType}
            title={displayTitle}
            class={() => [
                () => $$(cls) ? $$(cls) : cn
            ]}
            disabled={disabled}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
            onClick={handleClick}
            {...otherProps}
        >
            {displayIcon}
        </Button>
    )
}) as typeof Indent

export { Indent }

// Register Custom Element
customElement('wui-indent', Indent)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-indent': ElementAttributes<typeof Indent>
        }
    }
}

export default Indent

// #region Indent Logic

const BLOCK_TAGS = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'LI', 'PRE']

const getBlockParent = (node: Node | null, root: HTMLElement | null): HTMLElement | null => {
    while (node) {
        // Stop if we hit the editor root
        if (root && node === root) break

        // Stop if we hit the document body (safety check)
        if (node === document.body) break

        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement
            // Check if it's a block tag OR has display: block
            if (BLOCK_TAGS.includes(el.tagName)) {
                return el
            }
            // Fallback for generic divs that act as blocks
            const style = window.getComputedStyle(el)
            if (style.display === 'block') {
                return el
            }
        }
        node = node.parentNode
    }
    return null
}

export const applyIndent = (editor: HTMLElement, isDecrease: boolean, stepMultiplier: number, indentAmount: number) => {

    console.groupCollapsed(`[Indent] ${isDecrease ? 'Decrease' : 'Increase'} indent by ${indentAmount * stepMultiplier}px`)
    console.log("[Indent] Input:", { editor: editor?.tagName, isDecrease, stepMultiplier, indentAmount })

    // const selection = window.getSelection()
    const selection = getActiveSelection(editor)

    if (!selection || selection.rangeCount === 0) {
        console.log('[Indent] No selection or range, aborting')
        console.groupEnd()
        return
    }

    const range = selection.getRangeAt(0)
    console.log('[Indent] Range:', {
        collapsed: range.collapsed,
        startContainer: range.startContainer.nodeName,
        endContainer: range.endContainer.nodeName
    })

    // 1. RESOLVE ROOT: If 'editor' context is null (Custom Element issue), try to find it from selection
    let root = editor
    // if (!root) {
    //     console.log('[Indent] No editor provided, searching from selection...')
    //     let node = range.commonAncestorContainer
    //     if (node.nodeType === Node.TEXT_NODE) node = node.parentNode!
    //     root = (node as HTMLElement).closest('[contenteditable="true"]') as HTMLElement
    //     console.log('[Indent] Found editor:', root?.tagName)
    // }


    // 2. IDENTIFY TARGET BLOCKS
    const blocks = new Set<HTMLElement>()

    // Add block at start of selection
    const startBlock = getBlockParent(range.startContainer, root)
    if (startBlock) {
        blocks.add(startBlock)
        console.log("[Indent] ℹ️ Start block:", { "tag": startBlock.tagName, "text": startBlock.textContent?.substring(0, 30) })
    }

    // Add block at end of selection
    const endBlock = getBlockParent(range.endContainer, root)
    if (endBlock) {
        blocks.add(endBlock)
        console.log("[Indent] ℹ️ End block:", { "tag": endBlock.tagName, "text": endBlock.textContent?.substring(0, 30) })
    }

    // If selection spans multiple nodes, find intermediate blocks
    if (!range.collapsed) {
        console.log('[Indent] Multi-line selection detected, finding intermediate blocks...')
        let ancestor = range.commonAncestorContainer
        if (ancestor.nodeType === Node.TEXT_NODE) ancestor = ancestor.parentNode!

        const walker = document.createTreeWalker(
            ancestor,
            NodeFilter.SHOW_ELEMENT,
            {
                acceptNode: (node) => {
                    const el = node as HTMLElement
                    if (BLOCK_TAGS.includes(el.tagName) && range.intersectsNode(el)) {
                        return NodeFilter.FILTER_ACCEPT
                    }
                    return NodeFilter.FILTER_SKIP
                }
            }
        )

        let currentNode = walker.nextNode()
        while (currentNode) {
            blocks.add(currentNode as HTMLElement)
            console.log('[Indent] Intermediate block:', (currentNode as HTMLElement).tagName)
            currentNode = walker.nextNode()
        }
    }

    // Convert Set to Array
    const targets = Array.from(blocks)
    console.log(`[Indent] Total blocks to modify: ${targets.length}`)

    if (targets.length === 0) {
        console.log('[Indent] No blocks found, using fallback execCommand')
        document.execCommand(isDecrease ? 'outdent' : 'indent', false)
        console.groupEnd()
        return
    }

    // 3. APPLY LOGIC
    // Check if any target is a List Item. Native indentation is required for lists to handle UL/OL nesting.
    const hasListItems = targets.some(el => el.tagName === 'LI')
    console.log('[Indent] Contains list items:', hasListItems)

    // if (hasListItems) {
    //     console.log('[Indent] Using native execCommand for list items')
    //     document.execCommand(isDecrease ? 'outdent' : 'indent', false)
    // }

    console.log('[Indent] Using manual margin manipulation')
    // Manual Margin Manipulation for standard blocks
    // const INDENT_PX = 40
    const amount = indentAmount * stepMultiplier

    targets.forEach((el, index) => {
        const computed = window.getComputedStyle(el)
        const currentMargin = parseInt(computed.marginLeft || '0', 10)

        let newMargin: number
        if (isDecrease) {
            newMargin = Math.max(0, currentMargin - amount)
        } else {
            newMargin = currentMargin + amount
        }

        console.log(`[Indent] Block ${index + 1}/${targets.length} (${el.tagName}): ${currentMargin}px → ${newMargin}px`)
        el.style.marginLeft = newMargin === 0 ? '' : `${newMargin}px`
    })
    // Ensure focus remains on editor
    if (root) {
        root.focus()
        console.log('[Indent] Focus restored to editor')
    }

    console.groupEnd()
}
// #endregion
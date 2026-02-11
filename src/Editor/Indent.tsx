import { $, $$, defaults, type JSX, customElement, type ElementAttributes, type Observable, ObservableMaybe, HtmlString, HtmlNumber, HtmlClass, HtmlBoolean } from "woby"
import { Button, ButtonStyles } from '../Button'
import { useEditor } from './undoredo'
import IndentIcon from '../icons/indent'
import OutdentIcon from '../icons/outdent'

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
    identPx: $(20, HtmlNumber) as ObservableMaybe<number>,
})

const Indent = defaults(def, (props) => {
    const { buttonType, title, cls, class: cn, mode, step, disabled, identPx, ...otherProps } = props

    const editor = useEditor()
    const isDecrease = $($$(mode) === 'decrease')

    // Determine Icon and Title based on mode
    const displayIcon = () => $$(isDecrease) ? <IndentIcon class="size-5" /> : <OutdentIcon class="size-5" />

    const displayTitle = () => {
        const t = $$(title)
        if (t) return t
        return $$(isDecrease) ? "Decrease Indent" : "Increase Indent"
    }

    const handleClick = (e: any) => {
        e.preventDefault();
        const stepVal = $$(step) || 1
        const pxVal = $$(identPx) || 40


        console.log("[Indent] handleClick - ", {
            "editor": { "el": $$(editor), "type": typeof $$(editor) },
            "isDecrease": $$(isDecrease),
            "step": stepVal,
            "identPx": pxVal,
        })

        let editorDiv = $$(editor)

        if (typeof editorDiv == "string") {
            console.warn("[Indent] editor is a string");
            const selection = window.getSelection()
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                let node = range.startContainer;
                let targetElement = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
                let root = (targetElement as HTMLElement).closest('[contenteditable]');


                console.groupCollapsed("[dev] ✨ before");
                console.log("node - ", node);
                console.log("target - ", {
                    "target el": targetElement,
                    "parent el": targetElement.parentElement,
                    "has contenteditable": (targetElement as HTMLElement).hasAttribute("contenteditable"),
                });
                console.log("root - ", {
                    "root": root,
                    "has contenteditable": root.hasAttribute("contenteditable"),
                });
                console.groupEnd();

                if (!(targetElement as HTMLElement).hasAttribute("contenteditable")) {
                    while (targetElement && targetElement.parentElement !== root && targetElement.parentElement !== document.body) {
                        targetElement = targetElement.parentElement;
                    }
                }


                console.groupCollapsed("[dev] ✨ after");
                console.log("node - ", node);
                console.log("target - ", {
                    "target el": targetElement,
                    "parent el": targetElement.parentElement,
                    "has contenteditable": (targetElement as HTMLElement).hasAttribute("contenteditable"),
                });
                console.log("root - ", {
                    "root": root,
                    "has contenteditable": root.hasAttribute("contenteditable"),
                });
                console.groupEnd();


                const editorHost = (targetElement as HTMLElement).querySelector("wui-editor")
                editorDiv = editorHost != undefined ? editorHost.shadowRoot.querySelector('[contenteditable]') as HTMLDivElement : targetElement as HTMLDivElement
            }
        }

        console.log("[Indent] editor div - ", {
            "editor": editorDiv,
            "type": typeof editorDiv,
        })

        // Call the helper logic
        applyIndent(editorDiv, $$(isDecrease), stepVal, pxVal)
        // applyIndent($$(editor), isDecrease(), stepVal)
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

const applyIndent = (editor: HTMLElement | null, isDecrease: boolean, stepMultiplier: number, indentAmount: number) => {

    console.log("[Indent] applyIndent - ", { editor, isDecrease, stepMultiplier, indentAmount })

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)

    // 1. RESOLVE ROOT: If 'editor' context is null (Custom Element issue), try to find it from selection
    let root = editor
    if (!root) {
        let node = range.commonAncestorContainer
        if (node.nodeType === Node.TEXT_NODE) node = node.parentNode!
        root = (node as HTMLElement).closest('[contenteditable="true"]') as HTMLElement
    }


    // 2. IDENTIFY TARGET BLOCKS
    const blocks = new Set<HTMLElement>()

    // Add block at start of selection
    const startBlock = getBlockParent(range.startContainer, root)
    if (startBlock) blocks.add(startBlock)

    // Add block at end of selection
    const endBlock = getBlockParent(range.endContainer, root)
    if (endBlock) blocks.add(endBlock)

    // If selection spans multiple nodes, find intermediate blocks
    if (!range.collapsed) {
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
            currentNode = walker.nextNode()
        }
    }

    // Convert Set to Array
    const targets = Array.from(blocks)

    if (targets.length === 0) {
        // Fallback: Just execute command if we couldn't find specific blocks
        document.execCommand(isDecrease ? 'outdent' : 'indent', false)
        return
    }

    // 3. APPLY LOGIC
    // Check if any target is a List Item. Native indentation is required for lists to handle UL/OL nesting.
    const hasListItems = targets.some(el => el.tagName === 'LI')

    if (hasListItems) {
        document.execCommand(isDecrease ? 'outdent' : 'indent', false)
    } else {
        // Manual Margin Manipulation for standard blocks
        // const INDENT_PX = 40
        const amount = indentAmount * stepMultiplier

        targets.forEach(el => {
            const computed = window.getComputedStyle(el)
            const currentMargin = parseInt(computed.marginLeft || '0', 10)

            let newMargin: number
            if (isDecrease) {
                newMargin = Math.max(0, currentMargin - amount)
            } else {
                newMargin = currentMargin + amount
            }

            el.style.marginLeft = newMargin === 0 ? '' : `${newMargin}px`
        })
    }

    // Ensure focus remains on editor
    if (root) root.focus()
}
// #endregion
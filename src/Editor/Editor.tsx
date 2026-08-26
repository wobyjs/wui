import { useOnClickOutside } from '@woby/use'
import { $, $$, type CustomElementChildren, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlString, JSX, Observable, ObservableMaybe, untrack, useContext, useEffect, useMemo } from 'woby' // Added useEffect
import { Button } from '../Button'
import UndoIcon from '../icons/undo'
import RedoIcon from '../icons/redo'
import { getCurrentRange, expandRange, getElementsInRange, getSelectedTableCells, focusNextTableCell, convertToSemanticElement, findBlockParent, getCurrentEditor, useBlockEnforcer } from './utils'
import { BoldButton } from './BoldButton'
import { ItalicButton } from './ItalicButton'
import { UnderlineButton } from './UnderlineButton' // Added UnderlineButton
import { EditorContext, UndoRedo, useEditor, useUndoRedo, FocusManagerContext, ReadonlyContext, useReadonly } from './undoredo'
import { FontSize } from './FontSize' // import { FontSizeInput } from './FontSizeCopy' // Changed from Increase/Decrease
import { List } from './List'
import { Indent } from './Indent' // Will be part of TextAlignDropDown
import { applyIndent as applyIndentStyle, applyListIndent } from './StyleEngine' // Import applyIndent from StyleEngine instead
import { Blockquote } from './Blockquote'
import { FocusManager } from './FocusManager'

// New Imports
import { TextFormatDropDown, FORMAT_OPTIONS as editorFormatOptions } from './TextFormatDropDown' // Import formatOptions
import { FontFamilyDropDown } from './FontFamilyDropDown'
import { TextColorPicker } from './TextColorPicker'
import { TextBackgroundColorPicker } from './TextBackgroundColorPicker' // Added TextBackgroundColorPicker
import { TextFormatOptionsDropDown } from './TextFormatOptionsDropDown'
import { InsertDropDown } from './InsertDropDown'
import { TextAlignDropDown } from './TextAlignDropDown'
import { UndoRedoButton } from './UndoRedoButton'
import { ImageResizer } from './ImageResizer' // Image resize handles + align/indent mini-toolbar
import { NodeMover } from './NodeMover' // Drag handle that repositions the node selection
import { TablePopupMenu } from './TablePopupMenu' // Table cell popup menu
import { ImageDialog, INSERT_IMAGE_EVENT, type InsertImageDetail } from './ImageDialog' // Insert-image modal (URL / file / drop / paste)
import { InfoButton } from './InfoButton' // Info button for property panel
import { PropertyPanel, PropertyPanelContext } from './PropertyPanel' // Property panel for selected element
import { SelectionType, deleteSelectedElement, deleteRefusalReason } from './PropertyExtractor' // Selection type enum + node-selection delete + its guard
import { getEditorPlugins } from './EditorPlugin' // For plugin tag name detection

// StyleEngine imports for keyboard shortcuts
import { applyBold, applyItalic, applyUnderline } from './StyleEngine'


interface EditorProps {
    onChange?: (content: string) => void
    children?: JSX.Element | string | (JSX.Element | string)[]
}



// The image and table inserters that used to live here were dead: the toolbar's
// insert menu has always gone through `InsertDropDown`, and nothing referenced these.
// Images now go through `ImageDialog` (see `INSERT_IMAGE_EVENT` below).

const def = () => ({
    children: $(null) as CustomElementChildren,
    cls: $(null, HtmlClass) as ObservableMaybe<JSX.Class>,
    class: $(null, HtmlClass) as ObservableMaybe<JSX.Class>,
    enableToolbar: $(true, HtmlBoolean) as ObservableMaybe<boolean>,
    externalPropertyPanel: $(null) as ObservableMaybe<{ panelOpen: Observable<boolean>; propertyTarget: Observable<HTMLElement | null>; selectionType: Observable<SelectionType> } | null>,
    readonly: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
    // Scroll box for the editable surface. `maxHeight` is the ceiling the surface
    // grows to before it starts scrolling its own content instead of stretching the
    // host page; `height` pins it to a fixed box regardless of how little is in it.
    // Set either to '' to opt out and let the surface grow without limit again.
    height: $('', HtmlString) as ObservableMaybe<string>,
    maxHeight: $('60vh', HtmlString) as ObservableMaybe<string>,
})


/**
 * Whether a keystroke should drop the editor out of node-selection mode.
 *
 * "Node selection" is the state where `data-element-selected` marks an embedded
 * component and the property panel is pointing at it. It is entered by clicking the
 * component (or climbing to it with the panel's up arrow) and it has to end as soon as
 * the user does anything else, or the mark outlives the gesture that set it and a
 * Backspace several keystrokes later removes a component nobody was thinking about.
 *
 * Clicking elsewhere already ends it -- the capture-phase pointerdown handler clears
 * the previous mark unconditionally. This is the keyboard half: anything that types a
 * character or moves the caret counts. Modified keystrokes deliberately do not, so
 * Ctrl+B on a selected component keeps it selected.
 */
const exitsNodeSelection = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return false
    if (e.key.length === 1) return true // any printable character
    return e.key.startsWith('Arrow')
        || e.key === 'Enter' || e.key === 'Tab' || e.key === 'Escape'
        || e.key === 'Home' || e.key === 'End'
        || e.key === 'PageUp' || e.key === 'PageDown'
}

// #region Editor Surface
/**
* EditorSurface: The interactive "canvas" of the editor.
* This component manages the editable area, monitors HTML changes for history, 
* and handles keyboard shortcuts for navigation and formatting.
*/
const EditorSurface = ({ isEditing, handleEditorClick, handleBlur, height, maxHeight, children }: {
    isEditing: Observable<boolean>
    handleEditorClick: (e: any) => void
    handleBlur: (e: any) => void
    height?: ObservableMaybe<string>
    maxHeight?: ObservableMaybe<string>
    children?: JSX.Children
}) => {
    // Guard like every other consumer (BoldButton, FontFamilyDropDown, ...): when
    // no UndoRedo provider is mounted these are undefined, and saveDo() is called
    // from a MutationObserver on every mutation — an unguarded destructure throws
    // "saveDo is not a function" on each one.
    const undoRedoContext = useUndoRedo()
    const saveDo = undoRedoContext?.saveDo ?? (() => { })
    const undo = undoRedoContext?.undo ?? (() => { })
    const redo = undoRedoContext?.redo ?? (() => { })
    const activeEditor = useEditor()
    const isReadonly = useReadonly()
    // Optional: the surface is rendered inside PropertyPanelContext by <Editor>, but the
    // withToolbar/withoutToolbar variants below mount it without one -- hence no `!` and a
    // guarded read below. Only used to drop a target that has just been deleted out from
    // under the panel.
    //
    // $$ because woby's useContext returns an observable wrapping the context value; without
    // it every property reads as undefined. Same unwrap PropertyPanel does.
    const panelCtx = $$(useContext(PropertyPanelContext))

    useEffect(() => {
        useBlockEnforcer($$(activeEditor) ?? $$(getCurrentEditor))
    });

    /**
     * Effect: Automatically focuses the editor element when editing mode is enabled.
     * This ensures the cursor is placed in the editor when the user clicks to start editing.
     */
    // #region Auto-focus Effect
    useEffect(() => {
        if ($$(isEditing)) {
            const el = $$(activeEditor);

            if (el && document.activeElement !== el) { el.focus(); }
        }
    })
    // #endregion

    /**
     * Effect: Clones light DOM content into shadow DOM for contentEditable compatibility.
     * contentEditable only works on content in the same DOM tree, so slotted light DOM
     * content cannot be edited. This effect clones the light DOM children into shadow DOM.
     */
    // #region Light DOM to Shadow DOM Sync
    useEffect(() => {
        const el = $$(activeEditor)
        if (!el || !(el instanceof HTMLElement)) {
            console.warn("[EditorSurface] Light DOM sync skipped: el is not a valid HTMLElement", el)
            return
        }

        // Get the host element (light DOM parent)
        const host = (el.getRootNode() as ShadowRoot).host as HTMLElement | null
        if (!host) {
            // Non-shadow-DOM mode: children are already rendered by the JSX tree,
            // so no reactive re-render is needed. A reactive render(children, el)
            // would create a new soby root, triggering Portal useRenderEffect →
            // Effect.update recursion (stack overflow).
            //
            // Use a data attribute flag to mark initialization complete.
            el.setAttribute('data-editor-content-initialized', 'true')
            return
        }

        // Clone light DOM children into shadow DOM div
        // This is necessary because contentEditable only works on content in the same DOM tree

        // D-07: re-entrancy guard prevents MutationObserver feedback cycle.
        // MUST be inside useEffect closure (not component scope) — each effect instance owns its flag.
        let isSyncing = false

        // Custom-element upgrade watchdog: tracks tags whose definitions weren't
        // loaded yet when we cloned them (document.createElement() fell back to
        // HTMLUnknownElement). After a sync pass we wait for those definitions
        // and re-sync, so the shadow clones end up as real upgraded elements.
        const failedCustomTags = new Set<string>()

        // untrack: deepClone() below calls document.createElement() on woby custom
        // elements, which upgrades them synchronously and runs their render effects
        // inline. Without untrack those components' signal reads are captured as
        // dependencies of THIS effect, so their own initialization writes re-trigger
        // the sync, which clones again, which upgrades again — an unbounded
        // synchronous Effect.update → run → refresh → wrap recursion that overflows
        // the stack (pure soby frames, no app frames, hence very hard to read).
        // The sync builds DOM; it must never subscribe to what that DOM reads.
        const syncChildren = () => untrack(() => {
            // D-07: prevent re-entrant sync from MutationObserver feedback loops
            if (isSyncing) return
            isSyncing = true
            try {
            // Save current selection before clearing content
            const sel = window.getSelection()
            let savedRange: Range | null = null
            let savedAnchorPath: string | null = null
            let savedFocusPath: string | null = null
            let savedAnchorOffset: number = 0
            let savedFocusOffset: number = 0

            if (sel && sel.rangeCount > 0) {
                savedRange = sel.getRangeAt(0)

                // Get path to anchor and focus nodes for restoration after clone
                const getPathToNode = (node: Node, root: Element): string => {
                    const path: number[] = []
                    let current = node
                    while (current && current !== root) {
                        const parent = current.parentNode
                        if (!parent) break
                        const index = Array.from(parent.childNodes).indexOf(current as ChildNode)
                        path.unshift(index)
                        current = parent
                    }
                    return path.join('/')
                }

                savedAnchorPath = getPathToNode(savedRange.startContainer, el)
                savedFocusPath = getPathToNode(savedRange.endContainer, el)
                savedAnchorOffset = savedRange.startOffset
                savedFocusOffset = savedRange.endOffset
            }

            // Remove slot element if it exists
            const slot = el.querySelector('slot')
            if (slot) slot.remove()

            // Clear existing content in shadow DOM div (except already processed content)
            // We'll rebuild it from light DOM
            while (el.firstChild) {
                el.removeChild(el.firstChild)
            }

            // Clone light DOM children into shadow DOM
            // NOTE: cloneNode(true) does NOT preserve shadow roots on custom elements.
            // Use a recursive deep-clone helper that re-creates custom elements via
            // document.createElement() so the browser upgrades them and attaches shadow roots.
            const deepClone = (node: Node): Node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    return document.createTextNode(node.textContent ?? '')
                }
                if (node.nodeType !== Node.ELEMENT_NODE) {
                    return node.cloneNode(false)
                }
                const el = node as Element
                const tag = el.tagName.toLowerCase()
                const isCustom = tag.includes('-')
                const fresh = isCustom ? document.createElement(tag) : document.createElementNS(el.namespaceURI ?? '', tag)
                // If the custom element wasn't upgraded yet, note it for retry.
                // NOTE: do NOT test for HTMLUnknownElement here — a *hyphenated*
                // undefined tag is a plain HTMLElement, not HTMLUnknownElement, so
                // that check never matched and the retry below was dead code.
                if (isCustom && !customElements.get(tag)) {
                    failedCustomTags.add(tag)
                }
                for (const attr of Array.from(el.attributes)) {
                    fresh.setAttribute(attr.name, attr.value)
                }
                for (const child of Array.from(el.childNodes)) {
                    fresh.appendChild(deepClone(child))
                }
                return fresh
            }

            const lightChildren = Array.from(host.children)
            lightChildren.forEach(child => {
                // Don't clone script tags or style tags
                if (child.tagName === 'SCRIPT' || child.tagName === 'STYLE') return
                el.appendChild(deepClone(child))
            })

            // Restore selection after content sync
            if (savedAnchorPath && savedFocusPath && sel) {
                const getNodeFromPath = (path: string, root: Element): Node | null => {
                    const indices = path.split('/').map(Number)
                    let current: Node = root
                    for (const index of indices) {
                        if (!current.childNodes || index >= current.childNodes.length) {
                            return null
                        }
                        current = current.childNodes[index]
                    }
                    return current
                }

                const anchorNode = getNodeFromPath(savedAnchorPath, el)
                const focusNode = getNodeFromPath(savedFocusPath, el)

                if (anchorNode && focusNode) {
                    try {
                        const newRange = document.createRange()
                        newRange.setStart(anchorNode, Math.min(savedAnchorOffset, anchorNode.textContent?.length || 0))
                        newRange.setEnd(focusNode, Math.min(savedFocusOffset, focusNode.textContent?.length || 0))
                        sel.removeAllRanges()
                        sel.addRange(newRange)
                    } catch (e) {
                        // Range restoration failed - this is okay, selection may have been invalid
                        console.warn('[Editor] Could not restore selection after sync:', e)
                    }
                }
            }
            } finally {
                isSyncing = false
            }
        })

        // Initial sync
        syncChildren()

        // Retry: if any custom elements weren't upgraded yet, wait for their
        // definitions and re-sync so the shadow clones become real upgraded elements.
        if (failedCustomTags.size > 0) {
            const tags = Array.from(failedCustomTags)
            failedCustomTags.clear()
            Promise.all(tags.map(t => customElements.whenDefined(t))).then(() => {
                syncChildren()
            })
        }

        // Watch light DOM for changes and sync to shadow DOM
        const observer = new MutationObserver(() => {
            syncChildren()
        })

        observer.observe(host, {
            childList: true,
            subtree: true,
            characterData: true,
        })

        return () => observer.disconnect()
    })
    // #endregion

    /**
     * Effect: Click-to-select, the only thing that puts a node selection on screen.
     *
     * A plain click marks embedded custom elements, because those are the ones a caret
     * cannot reach: the element owns a shadow root, which absorbs the click and leaves
     * no selection range pointing at the host, so without this the property panel would
     * have no target. Ordinary content is left to the caret -- clicking a paragraph has
     * to keep meaning "put the cursor here".
     *
     * **Alt+click marks whatever box is under the cursor**, component or not. That is
     * the way to select a plain <div>: a container is exactly the thing a caret can
     * never land on, since every click inside one lands in the text it wraps. Before
     * this, the only route to a container was clicking a component inside it and walking
     * up with the property panel's parent arrow, which meant containers holding no
     * component were unreachable, and empty ones doubly so. Alt is the conventional
     * "select the box, not the text" modifier, and it is free here -- alt+click does
     * nothing in a contenteditable otherwise.
     *
     * Innermost-first: composedPath runs from the target outwards, so alt+click selects
     * the tightest box around the cursor and the parent arrow climbs from there, rather
     * than guessing at which ancestor was meant. {@link deleteRefusalReason} filters the
     * walk to boxes that can actually be acted on, so the mark never lands on the content
     * root, on table structure, or inside a component's own shadow tree.
     *
     * Either way the mark is cleared first: it means "this box is selected *right now*",
     * and NodeMover, the panel and the Backspace path all read it that way.
     */
    useEffect(() => {
        const el = $$(activeEditor)
        if (!el) return

        // Read plugin tags at setup time; re-registration happens rarely and
        // re-running this effect would churn the listener.
        const plugins = $$(getEditorPlugins())
        const pluginTags = new Set(plugins.map(p => p.tagName.toUpperCase()))

        const handler = (e: PointerEvent) => {
            // Clear previous mark
            const prev = el.querySelector('[data-element-selected]') as HTMLElement | null
            if (prev) prev.removeAttribute('data-element-selected')

            const path = e.composedPath()

            // Alt: select the box itself rather than the text inside it.
            if (e.altKey) {
                for (const entry of path) {
                    if (!(entry instanceof HTMLElement)) continue
                    // Stops the walk from leaving the editable content, and skips the
                    // nodes inside an embedded component's shadow tree so the press lands
                    // on the host -- the same reason the plugin walk below tests this.
                    if (!el.contains(entry)) continue
                    if (deleteRefusalReason(entry, el)) continue
                    entry.setAttribute('data-element-selected', '')
                    return
                }
                return
            }

            // Walk composedPath to find a plugin element or hyphenated non-wui tag
            for (const entry of path) {
                if (!(entry instanceof HTMLElement)) continue
                if (!el.contains(entry)) continue
                const tag = entry.tagName.toLowerCase()
                if (pluginTags.has(entry.tagName.toUpperCase()) || (tag.includes('-') && !tag.startsWith('wui-'))) {
                    entry.setAttribute('data-element-selected', '')
                    return
                }
            }
        }

        el.addEventListener('pointerdown', handler, true)
        return () => el.removeEventListener('pointerdown', handler, true)
    })

    // Inject the selected-element outline style.
    //
    // Outline only -- the anchor indicator that used to be drawn here as a `::before`
    // glyph is now <NodeMover>'s drag grip, which is both the marker and the thing you
    // grab to reposition the selection. Moving it out of the content also retired a
    // layout hazard this rule had to work around: generated content on a table-structural
    // box gets wrapped in an ANONYMOUS TABLE CELL, so marking a <tr> grew the row an extra
    // leading column and pushed the last real cell outside the table. That needed a
    // :not(tr):not(tbody)... chain on both the glyph and the `position: relative` it
    // needed as a containing block. An absolutely-positioned sibling of the surface cannot
    // disturb the content's layout at all, so none of that applies to the grip.
    //
    // `outline` (not `border`) for the same reason: it is drawn outside the box and takes
    // up no space, so marking an element never reflows the document around it.
    useEffect(() => {
        const id = 'wui-editor-selected-style'
        if (document.getElementById(id)) return
        const style = document.createElement('style')
        style.id = id
        style.textContent = `
            [data-element-selected] {
                outline: 2px solid #3b82f6;
                outline-offset: 2px;
            }
        `
        document.head.appendChild(style)
        return () => { const s = document.getElementById(id); if (s) s.remove() }
    })

    /**
     * Effect: Sets up a MutationObserver to monitor all changes in the editor content.
     * This captures typing, formatting changes, node insertions/deletions, and attribute modifications
     * to ensure every edit is properly tracked in the undo/redo history.
     */
    // #region Mutation Observer Effect
    useEffect(() => {
        const el = $$(activeEditor)

        // Validate that we have a valid DOM element before setting up observer
        if (!el || !(el instanceof HTMLElement)) {
            console.warn("[EditorSurface] Observer skipped: el is not a valid HTMLElement", el)
            return
        }

        // Watch shadow DOM element for content changes (content is now cloned into shadow DOM)
        const observer = new MutationObserver((mutations) => {
            // Debounce saveDo to prevent saving on every keystroke
            saveDo()
        })

        // Watch the shadow DOM element for changes
        observer.observe(el, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true,
        })

        // Cleanup function to disconnect observer when component unmounts
        return () => { observer.disconnect() }
    }) // Auto-tracks $$(activeEditor) - runs when activeEditor reference changes
    // #endregion

    /**
     * Pasted and dropped images.
     *
     * Both open `ImageDialog` with the file already chosen rather than inserting straight
     * away, so a dropped photo gets the same crop-and-embed pass as one picked from the
     * dialog -- otherwise the two routes would disagree about size, which is the whole
     * thing the A4 cap exists to prevent.
     *
     * Attached imperatively here rather than as `onPaste`/`onDrop` JSX props: these fire
     * inside the shadow root, where woby's synthetic delegation is unreliable, and the
     * drop handler needs `preventDefault` to beat the browser's own default of navigating
     * to the dropped file.
     */
    // #region Paste / drop images
    useEffect(() => {
        const el = $$(activeEditor)
        if (!el || !(el instanceof HTMLElement)) return

        const editorHost = () => {
            const root = el.getRootNode()
            return root instanceof ShadowRoot ? root.host as HTMLElement : document.querySelector('wui-editor') as HTMLElement | null
        }

        /**
         * The image in a clipboard or drag payload. `files` covers a real file; `items`
         * covers a screenshot pasted straight from the OS, which never appears in `files`
         * during `dragover` and sometimes not at all.
         */
        const imageIn = (dt: DataTransfer | null): File | null => {
            if (!dt) return null
            const direct = Array.from(dt.files ?? []).find(f => f.type.startsWith('image/'))
            if (direct) return direct
            const item = Array.from(dt.items ?? []).find(i => i.kind === 'file' && i.type.startsWith('image/'))
            return item?.getAsFile() ?? null
        }

        const openWith = (file: File, range: Range | null) => {
            editorHost()?.dispatchEvent(new CustomEvent<InsertImageDetail>(INSERT_IMAGE_EVENT, {
                detail: { range: range ?? undefined, file },
            }))
        }

        /**
         * Where a drop landed, so the image goes under the pointer instead of wherever the
         * caret happened to be. Both APIs are non-standard in different directions --
         * `caretRangeFromPoint` is Blink/WebKit, `caretPositionFromPoint` is the standard
         * Firefox implements -- and neither is guaranteed to see into a shadow root, hence
         * the fall back to the caret.
         */
        const rangeAtPoint = (x: number, y: number): Range | null => {
            const root = el.getRootNode() as ShadowRoot | Document
            const fromPoint = (root as any).caretRangeFromPoint ?? (document as any).caretRangeFromPoint
            if (typeof fromPoint === 'function') {
                const r = fromPoint.call(root, x, y) as Range | null
                if (r && el.contains(r.startContainer)) return r
            }
            const pos = (document as any).caretPositionFromPoint?.(x, y)
            if (pos && el.contains(pos.offsetNode)) {
                const r = document.createRange()
                r.setStart(pos.offsetNode, pos.offset)
                r.collapse(true)
                return r
            }
            return null
        }

        const onPaste = (e: ClipboardEvent) => {
            const file = imageIn(e.clipboardData)
            // No image in the payload means an ordinary text or HTML paste: leave it alone.
            if (!file) return
            e.preventDefault()
            openWith(file, getCurrentRange())
        }

        const onDragOver = (e: DragEvent) => {
            if (!imageIn(e.dataTransfer)) return
            e.preventDefault()
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
        }

        const onDrop = (e: DragEvent) => {
            const file = imageIn(e.dataTransfer)
            if (!file) return
            e.preventDefault()
            openWith(file, rangeAtPoint(e.clientX, e.clientY) ?? getCurrentRange())
        }

        el.addEventListener('paste', onPaste)
        el.addEventListener('dragover', onDragOver)
        el.addEventListener('drop', onDrop)

        return () => {
            el.removeEventListener('paste', onPaste)
            el.removeEventListener('dragover', onDragOver)
            el.removeEventListener('drop', onDrop)
        }
    })
    // #endregion

    /**
    * handleKeyDown: Intercepts keyboard events to provide custom behavior.
    * - Tab: Navigates table cells OR indents paragraphs.
    * - Ctrl+Z / Ctrl+Y: Triggers custom Undo/Redo logic.
    * - Ctrl+B / Ctrl+I / Ctrl+U: Bold, Italic, Underline via StyleEngine.
    * - Backspace/Delete: Ensure native deletion works (especially for mobile/double-tap).
    */
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
            e.preventDefault(); e.stopPropagation();
            const editorEl = $$(activeEditor)
            const shadow = editorEl?.getRootNode() as ShadowRoot | null
            const isInTable = isCaretInTableCell(shadow)
            if (isInTable) {
                focusNextTableCell(e.shiftKey, shadow) // In table: Tab next cell, Shift+Tab previous
            } else {
                // Check if inside a list - use applyListIndent for LI elements
                const sel = (shadow as any)?.getSelection?.() ?? document.getSelection()
                const range = sel?.getRangeAt(0)
                if (range) {
                    let node: Node | null = range.commonAncestorContainer
                    while (node && (!shadow || node.getRootNode() === shadow)) {
                        if (node instanceof HTMLElement) {
                            const tag = node.tagName.toUpperCase()
                            if (tag === 'LI' || tag === 'UL' || tag === 'OL') {
                                applyListIndent(e.shiftKey, 20)
                                saveDo()
                                return
                            }
                        }
                        node = node.parentNode
                    }
                }
                applyIndentStyle(e.shiftKey, 20) // Normal text: Tab=indent, Shift+Tab=outdent
                saveDo()
            }
        }

        // Node-selection delete: Backspace/Delete removes whatever is *explicitly*
        // selected as a node, rather than editing text at a caret.
        //
        // This has to be driven by hand because native editing cannot do it. Chrome's
        // editing engine treats a shadow host as a boundary it refuses to cross, so
        // Backspace over a <wui-button> is a silent no-op -- execCommand('delete') even
        // reports success while removing nothing. An image selected by ImageResizer has
        // no DOM Selection at all (the resizer clears it on mousedown so the old text
        // highlight does not linger), so there is nothing for the browser to delete
        // either. See deleteSelectedElement() for the measurements.
        //
        // Two sources of an explicit node selection, in priority order:
        //
        //  - `data-element-selected`, set by the capture-phase pointerdown handler above
        //    when a click lands on an embedded component, and moved up the tree by the
        //    property panel's parent-select arrow. It is never set by a caret, and
        //    exitsNodeSelection() below drops it the moment the user types or moves the
        //    caret, so it always means "this box is selected right now" -- which is why
        //    a plain container climbed to with the arrow is deletable here too.
        //  - `__activeImage` on the shadow root, ImageResizer's own state, the thing that
        //    puts the resize handles on screen. Read rather than the panel's target so
        //    this works with the panel closed: if the handles are visible, the image is
        //    selected, and Backspace is expected to remove it.
        //
        // A refused target (the document root, table structure, component internals) falls
        // through untouched so native editing still gets its turn.
        if (e.key === 'Backspace' || e.key === 'Delete') {
            const rootEl = $$(activeEditor)
            // Two queries: querySelector only sees descendants, and the parent walk can
            // park the mark on the content root itself.
            const marked = (rootEl?.hasAttribute('data-element-selected')
                ? rootEl
                : rootEl?.querySelector('[data-element-selected]')) as HTMLElement | null
            const activeImage = (rootEl?.getRootNode() as any)?.__activeImage as HTMLElement | null
            // The mark wins: if something is outlined, that is what the user sees selected,
            // even when an image elsewhere still has handles on it.
            const target = marked ?? (activeImage?.isConnected ? activeImage : null)
            if (target) {
                if (deleteSelectedElement(target, rootEl).ok) {
                    // preventDefault matters even though the browser would do nothing to
                    // the element itself: with the caret restored next to the gap, Delete
                    // just before an element was measured to *insert* a stray node.
                    e.preventDefault()
                    // The panel is still aimed at a node that no longer exists. ImageResizer
                    // needs no such call -- its MutationObserver drops the overlay when the
                    // image leaves the DOM.
                    panelCtx?.propertyTarget(null)
                    panelCtx?.selectionType('none')
                    saveDo()
                    return
                }
            }
        } else if (exitsNodeSelection(e)) {
            // Typing or moving the caret leaves node-selection mode, the same way clicking
            // elsewhere does (the pointerdown handler clears the mark unconditionally).
            // Without this the mark outlives the gesture that set it, and a Backspace
            // several keystrokes later would delete a component nobody was aiming at.
            const marked = $$(activeEditor)?.querySelector('[data-element-selected]') as HTMLElement | null
            if (marked) marked.removeAttribute('data-element-selected')
        }

        // Handle Backspace/Delete to ensure they work after double-tap/double-click
        // The browser should handle this natively, but we ensure selection exists
        if (e.key === 'Backspace' || e.key === 'Delete') {
            // Let browser handle natively, but ensure we have a valid selection
            const sel = window.getSelection()
            if (!sel || sel.rangeCount === 0) {
                // No selection - browser might be confused after double-tap
                // Try to get focus node and create a range
                if (sel && sel.focusNode) {
                    try {
                        const range = document.createRange()
                        range.setStart(sel.focusNode, sel.focusOffset)
                        range.collapse(true)
                        sel.removeAllRanges()
                        sel.addRange(range)
                    } catch (err) {
                        console.warn('[Editor] Failed to fix selection for backspace:', err)
                    }
                }
            }
            // Don't preventDefault - let browser handle the deletion natively
        }

        if (e.ctrlKey) {
            // e.preventDefault(); e.stopPropagation();
            switch (e.key.toLowerCase()) {
                case 'z': undo(); break;
                case 'y': redo(); break;
                case 'b':
                    e.preventDefault();
                    applyBold();
                    saveDo();
                    break;
                case 'i':
                    e.preventDefault();
                    applyItalic();
                    saveDo();
                    break;
                case 'u':
                    e.preventDefault();
                    applyUnderline();
                    saveDo();
                    break;
                // case 'a': break;
            }
        }
    }

    /**
    * isCaretInTableCell: A contextual helper that checks if the user's cursor
    * is currently located inside a <td> or <th> element.
    */
    const isCaretInTableCell = (shadow?: ShadowRoot | null) => {
        const sel = shadow ? shadow.getSelection() : document.getSelection()
        if (!sel?.focusNode) return false

        let el: HTMLElement | null = sel.focusNode.nodeType === Node.ELEMENT_NODE ? (sel.focusNode as HTMLElement) : (sel.focusNode.parentElement)

        while (el) {
            if (el.tagName === 'TD' || el.tagName === 'TH') return true
            el = el.parentElement
        }
        return false
    }

    return (
        <div class="relative">
            <div
                ref={activeEditor}
                data-editor-root
                contentEditable={() => $$(isReadonly) ? false : true}
                onClick={handleEditorClick}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                class={() => [
                    'border-blue-500 ring-2',
                    "p-6 my-4 rounded-xl border min-h-[250px] shadow-sm"
                ]}
                style={() => ({
                    outline: 'none',
                    caretColor: 'auto',
                    // Bounded box + overflow-y:auto is what puts the scrollbar on the
                    // surface itself; without it a long document just stretches the host
                    // page. A fixed `height` wins over `maxHeight` when both are set, and
                    // an empty value leaves the property off so the box grows freely.
                    height: $$(height) || undefined,
                    maxHeight: $$(height) ? undefined : ($$(maxHeight) || undefined),
                    overflowY: 'auto',
                    // Hitting the end of the editor's scroll must not hand the gesture to
                    // the page behind it.
                    overscrollBehavior: 'contain',
                    // Reserve the gutter so text does not reflow the moment the document
                    // grows past the ceiling and the scrollbar appears.
                    scrollbarGutter: 'stable',
                    scrollbarWidth: 'thin'
                })}
            >
                {/* Children are cloned from light DOM into shadow DOM via the sync effect */}
            </div>
            <ImageResizer />
            <NodeMover />
            <TablePopupMenu />
            <PropertyPanel />
            <ImageDialog />
        </div>
    )
}
// #endregion

/**
* EditorToolbar: A sticky control hub that organizes text formatting, 
* layout tools, and history management into logical functional groups. 
* It interfaces with the UndoRedo system and ensures toolbar interactions 
* do not disrupt the user's text selection.
*/
// #region Editor Toolbar
// `toolbarRef` starts out empty (`$<HTMLDivElement>(null as any)`) and is only filled once the
// toolbar element mounts, so the observable's value type includes `undefined`.
const EditorToolbar = ({ toolbarRef }: { toolbarRef: Observable<HTMLDivElement | undefined> }) => {
    const { redo, undo } = useUndoRedo()

    // Helper for vertical dividers
    const Divider = () => <div class="w-[1px] h-6 bg-gray-200 mx-1" />

    const BASE_CLASS = "sticky top-0 z-10 bg-white border border-gray-200 rounded-t-lg p-1.5 flex items-center flex-wrap gap-1 shadow-sm mb-0"

    const handleToolbarKeyDown = (e: KeyboardEvent) => {
        e.preventDefault(); e.stopPropagation();

        if (e.ctrlKey)
            switch (e.key) {
                case 'z': undo(); break
                case 'y': redo(); break
            }
        else
            switch (e.key) {
                case 'Tab':
                    // Tab in toolbar - delegate to editor's indent logic
                    {
                        // Editor surface lives inside wui-editor's shadow DOM
                        const editor = document.querySelector('wui-editor') as HTMLElement | null
                        const editorEl = editor?.shadowRoot?.querySelector('[data-editor-root]') as HTMLElement | null
                        const shadow = editorEl?.getRootNode() as ShadowRoot | null
                        const sel = (shadow as any)?.getSelection?.() ?? document.getSelection()
                        const range = sel?.getRangeAt(0)
                        if (range) {
                            let node: Node | null = range.commonAncestorContainer
                            while (node && (!shadow || node.getRootNode() === shadow)) {
                                if (node instanceof HTMLElement) {
                                    const tag = node.tagName.toUpperCase()
                                    if (tag === 'LI' || tag === 'UL' || tag === 'OL') {
                                        applyListIndent(e.shiftKey, 20)
                                        return true
                                    }
                                }
                                node = node.parentNode
                            }
                        }
                        applyIndentStyle(e.shiftKey, 20)
                    }
                    return true
            }
    }

    const FullToolbar = () => {
        return <>
            {/* Group 1: History */}
            <div class="flex items-center gap-0.5">
                <UndoRedoButton mode="undo" />
                <UndoRedoButton mode="redo" />
            </div>

            <Divider />

            {/* Group 2: Text Structure */}
            <div class="flex items-center gap-1">
                <TextFormatDropDown />
                <FontFamilyDropDown />
                <FontSize />
            </div>

            <Divider />

            {/* Group 3: Inline Styles */}
            <div class="flex items-center gap-0.5">
                <BoldButton />
                <ItalicButton />
                <UnderlineButton />
            </div>

            <Divider />

            {/* Group 4: Colors */}
            <div class="flex items-center gap-1">
                <TextColorPicker />
                <TextBackgroundColorPicker />
                <TextFormatOptionsDropDown />
            </div>

            <Divider />

            {/* Group 5: Lists & Alignment */}
            <div class="flex items-center gap-0.5">
                <List mode="bullet" />
                <List mode="number" />
                <List mode="checkbox" />
                <TextAlignDropDown />
                <Indent mode="decrease" />
                <Indent mode="increase" />
            </div>

            <Divider />

            {/* Group 6: Advanced Inserts */}
            <div class="flex items-center gap-1">
                <InsertDropDown />
                <Blockquote />
                <InfoButton />
            </div>
        </>
    }


    const DebugToolbar = () => {
        return <>
            <div class="flex items-center gap-0.5">
                <List mode="bullet" />
                <List mode="number" />
                <List mode="checkbox" />
            </div>
        </>
    }

    return (
        <div class={() => [BASE_CLASS, "editor-toolbar"]} ref={toolbarRef} onKeyDown={(e: any) => { handleToolbarKeyDown(e) }}>
            {FullToolbar}
            {/* {DebugToolbar} */}
        </div>
    )
}
// #endregion


// #region Editor
const Editor = defaults(def, (props) => {

    const { children, cls, class: cn, enableToolbar, readonly: _readonly, height, maxHeight, ...otherProps } = props

    const isEditing = $(false)
    const isReadonly = $($$(_readonly) ?? false)
    useEffect(() => { isReadonly($$(_readonly) ?? false) })
    const container = $<HTMLDivElement>(null as any)
    const toolbarRef = $<HTMLDivElement>(null as any)
    const focusManager = new FocusManager()

    // PropertyPanel shared state — use external props if provided, otherwise create internal state
    const externalCtx = $$(props.externalPropertyPanel)
    const propertyPanelOpen = externalCtx?.panelOpen ?? $(false)
    const propertyTarget = externalCtx?.propertyTarget ?? $<HTMLElement | null>(null)
    const propertySelectionType = externalCtx?.selectionType ?? $<SelectionType>('none')

    const _editor = $<HTMLDivElement>(null as any)
    const editor = ((...args: [HTMLDivElement?]) => {
        if (args.length === 0) {
            return _editor()
        }
        const val = args[0]
        if (val instanceof HTMLElement) {
            return _editor(val)
        }
        return _editor()
    }) as Observable<HTMLDivElement>

    // Attach FocusManager once both editor and toolbar elements exist
    useEffect(() => {
        const editorEl = $$(editor)
        const toolbarEl = $$(toolbarRef)
        if (editorEl && toolbarEl) {
            focusManager.attach(editorEl, toolbarEl)
            return () => focusManager.detach()
        }
    })

    const handleBlur = (e?: FocusEvent) => {
        // FocusManager handles blur via capture-phase listener.
        // This handler only sets isEditing=false when focus truly leaves the component.
        if (focusManager.isFocused) return // Focus is still in editor/toolbar

        setTimeout(() => {
            const nextFocusedElement = e?.relatedTarget as Node
            const containerEl = $$(container)
            const isFocusStillInside =
                (containerEl && containerEl.contains(document.activeElement)) ||
                (containerEl && containerEl.contains(nextFocusedElement))

            if (!isFocusStillInside) {
                isEditing(false)
            }
        }, 50)
    }


    // useOnClickOutside(container, () => handleBlur(null),)

    const handleEditorClick = () => {
        if ($$(isReadonly)) return
        isEditing(true)
    }

    const withoutToolbar = () => {
        return (
            <ReadonlyContext.Provider value={isReadonly}>
                <EditorContext.Provider value={editor}>
                    <UndoRedo>
                        <EditorSurface
                            isEditing={isEditing}
                            handleEditorClick={handleEditorClick}
                            handleBlur={handleBlur}
                            height={height}
                            maxHeight={maxHeight}
                            children={children}
                        >
                        </EditorSurface>
                    </UndoRedo>
                </EditorContext.Provider>
            </ReadonlyContext.Provider>
        )
    }

    const withToolbar = () => {
        return (
            <ReadonlyContext.Provider value={isReadonly}>
                <EditorContext.Provider value={editor}>
                    <UndoRedo>
                        {() => !$$(isReadonly) && $$(isEditing) && $$(enableToolbar) && <EditorToolbar toolbarRef={toolbarRef} />}
                        <EditorSurface
                            isEditing={isEditing}
                            handleEditorClick={handleEditorClick}
                            handleBlur={handleBlur}
                            height={height}
                            maxHeight={maxHeight}
                            children={children}
                        >
                        </EditorSurface>
                    </UndoRedo>
                </EditorContext.Provider>
            </ReadonlyContext.Provider>
        )
    }

    return (
        <div ref={container}>
            <PropertyPanelContext.Provider value={{ panelOpen: propertyPanelOpen, propertyTarget, selectionType: propertySelectionType }}>
                <FocusManagerContext.Provider value={focusManager}>
                    <ReadonlyContext.Provider value={isReadonly}>
                        <EditorContext.Provider value={editor}>
                            <UndoRedo>
                                {() => !$$(isReadonly) && $$(enableToolbar) && <EditorToolbar toolbarRef={toolbarRef} />}
                                <EditorSurface
                                    isEditing={isEditing}
                                    handleEditorClick={handleEditorClick}
                                    handleBlur={handleBlur}
                                    height={height}
                                    maxHeight={maxHeight}
                                    children={children}
                                >
                                </EditorSurface>
                            </UndoRedo>
                        </EditorContext.Provider>
                        {/* FAB toggle button for readonly mode */}
                        <button
                            class={() => [
                                'fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95',
                                $$(isReadonly) ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'
                            ]}
                            onClick={() => {
                                const newVal = !$$(isReadonly)
                                isReadonly(newVal)
                                // If switching to readonly, blur the editor
                                if (newVal) {
                                    isEditing(false)
                                    const el = $$(editor)
                                    if (el) el.blur()
                                }
                            }}
                            title={() => $$(isReadonly) ? 'Switch to Edit mode' : 'Switch to Read-only mode'}
                        >
                            {/* Edit icon (pencil) when readonly, eye icon when editing */}
                            {() => $$(isReadonly) ? (
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </ReadonlyContext.Provider>
                </FocusManagerContext.Provider>
            </PropertyPanelContext.Provider>
        </div >
    )
})
// #endregion

export { Editor }

customElement('wui-editor', Editor)

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-editor': ElementAttributes<typeof Editor>
        }
    }
}

export default Editor

// #region original Editor
// export const Editor = ({ onChange, children }: EditorProps) => {
//     // const content = $(initialContent)
//     const isEditing = $(false)
//     const container = $<HTMLDivElement>(null as any)
//     const editor = $<HTMLDivElement>(null as any)
//     const toolbarRef = $<HTMLDivElement>(null as any)

//     const handleBlur = (e: JSX.FocusEventHandler<HTMLDivElement>) => {
//         setTimeout(() => {
//             if ($$(toolbarRef) && !$$(toolbarRef).contains(document.activeElement)) {
//                 isEditing(false)
//             }
//         }, 0)
//     }

//     useOnClickOutside(container, () => handleBlur(null),)

//     const handleEditorClick = () => { isEditing(true) }

//     const EditorToolbar = () => {
//         const { redo, redos, undo, undos } = useUndoRedo()

//         // Helper for vertical dividers
//         const Divider = () => <div class="w-[1px] h-6 bg-gray-200 mx-1" />

//         const BASE_CLASS = "sticky top-0 z-10 bg-white border border-gray-200 rounded-t-lg p-1.5 flex items-center flex-wrap gap-1 shadow-sm mb-0"

//         const handleToolbarKeyDown = (e: KeyboardEvent) => {

//             if (e.ctrlKey)
//                 switch (e.key) {
//                     case 'z': undo(); break
//                     case 'y': redo(); break
//                     // case 89: redo(); break
//                 }
//             else
//                 switch (e.key) {
//                     // Tab key in toolbar itself, e.g. if a button is focused
//                     case 'Tab':
//                         e.preventDefault()
//                         e.stopPropagation()
//                         // This context (toolbar) might not be appropriate for indent/outdent commands
//                         // Or, if it is, it should probably focus the editor first.
//                         // For now, let's assume it's intended to act on the editor content:
//                         document.execCommand(e.shiftKey ? 'outdent' : 'indent')
//                         return true
//                     // case 89: redo(); break
//                 }
//         }

//         return (
//             <div class={() => [BASE_CLASS, "editor-toolbar"]} ref={toolbarRef} onKeyDown={(e) => { handleToolbarKeyDown(e) }}>
//                 {/* #region Group 1: History */}
//                 <div class="flex items-center gap-0.5">
//                     <Button
//                         type='outlined'
//                         cls="border-none hover:bg-gray-100 p-1.5"
//                         onMouseDown={(e) => e.preventDefault()}
//                         onClick={() => {
//                             undo();
//                         }}
//                         title="Undo"
//                         disabled={(() => $$(undos).length === 1)}
//                     >
//                         <UndoIcon class="size-5" />
//                     </Button>
//                     <Button
//                         type='outlined'
//                         cls="border-none hover:bg-gray-100 p-1.5"
//                         onMouseDown={(e) => e.preventDefault()}
//                         onClick={() => {
//                             redo();
//                         }}
//                         title="Redo"
//                         disabled={(() => $$(redos).length === 0)}
//                     >
//                         <RedoIcon class="size-5" />
//                     </Button>
//                 </div>

//                 <Divider />

//                 {/* #region Group 2: Text Structure */}
//                 <div class="flex items-center gap-1">
//                     <TextFormatDropDown />
//                     <FontFamilyDropDown />
//                     <FontSize />
//                 </div>

//                 <Divider />

//                 {/* #region Group 3: Inline Styles */}
//                 <div class="flex items-center gap-0.5">
//                     <BoldButton />
//                     <ItalicButton />
//                     <UnderlineButton />
//                 </div>

//                 <Divider />

//                 {/* #region Group 4: Colors */}
//                 <div class="flex items-center gap-1">
//                     <TextColorPicker />
//                     <TextBackgroundColorPicker />
//                     <TextFormatOptionsDropDown />
//                 </div>

//                 <Divider />

//                 {/* #region Group 5: Lists & Alignment */}
//                 <div class="flex items-center gap-0.5">
//                     <List mode="bullet" />
//                     <List mode="number" />
//                     <TextAlignDropDown />
//                     <Indent mode="decrease" />
//                     <Indent mode="increase" />
//                 </div>

//                 <Divider />

//                 {/* #region Group 6: Advanced Inserts */}
//                 <div class="flex items-center gap-1">
//                     <InsertDropDown />
//                     <Blockquote />
//                 </div>
//             </div>
//         )
//     }

//     /**
//     * EditorSurface: The interactive "canvas" of the editor.
//     * This component manages the editable area, monitors HTML changes for history,
//     * and handles keyboard shortcuts for navigation and formatting.
//     */
//     const EditorSurface = () => {
//         const { undo, undos, saveDo, redo } = useUndoRedo()

//         /**
//         * Effect: Monitors the DOM for any changes (typing, style changes, or node insertions).
//         * It uses a MutationObserver to ensure every change is captured in the undo history.
//         */
//         useEffect(() => {
//             const editorNode = $$(editor)
//             if (!editorNode) return

//             // We might want to be more specific here, but for now, any observed mutation triggers saveDo.
//             // saveDo itself has a check to prevent saving if content hasn't changed.
//             const observer = new MutationObserver((mutationsList, observer) => {

//                 // if (editorNode.innerHTML.trim() === "") {
//                 //     editorNode.innerHTML = '<p><br></p>';
//                 //     // Move cursor inside the new p
//                 //     const range = document.createRange();
//                 //     const sel = window.getSelection();
//                 //     range.setStart(editorNode.childNodes[0], 0);
//                 //     range.collapse(true);
//                 //     sel.removeAllRanges();
//                 //     sel.addRange(range);
//                 // }

//                 saveDo()
//             })

//             // Configuration: Watch for attribute changes, child elements, and text content
//             observer.observe(editorNode, {
//                 attributes: true, // Observe attributes changes (e.g. style)
//                 childList: true,  // Observe direct children changes (add/remove nodes)
//                 subtree: true,    // Observe all descendants
//                 characterData: true // Observe text content changes
//             })

//             // Cleanup: Disconnect the observer when the component unmounts
//             return () => { observer.disconnect() }
//         }) // Reverting to no dependency array, relying on Woby's auto-tracking


//         useEffect(() => {
//             const el = $$(editor)
//             if (el && el.innerHTML.trim() === "") {
//                 // Seed the editor with a paragraph so it's never empty/naked
//                 el.innerHTML = '<p><br></p>'
//             }
//         })

//         /**
//         * isCaretInTableCell: A contextual helper that checks if the user's cursor
//         * is currently located inside a <td> or <th> element.
//         */
//         const isCaretInTableCell = () => {
//             const sel = document.getSelection()
//             if (!sel?.focusNode) return false

//             let el: HTMLElement | null =
//                 sel.focusNode.nodeType === Node.ELEMENT_NODE
//                     ? (sel.focusNode as HTMLElement)
//                     : (sel.focusNode.parentElement)

//             while (el) {
//                 if (el.tagName === 'TD' || el.tagName === 'TH') return true
//                 el = el.parentElement
//             }
//             return false
//         }


//         /**
//         * handleKeyDown: Intercepts keyboard events to provide custom behavior.
//         * - Tab: Navigates table cells OR indents paragraphs.
//         * - Ctrl+Z / Ctrl+Y: Triggers custom Undo/Redo logic.
//         */
//         const handleKeyDown = (e: KeyboardEvent) => {

//             if (e.key === 'Tab') {
//                 e.preventDefault()
//                 e.stopPropagation()

//                 if (isCaretInTableCell()) {
//                     focusNextTableCell(e.shiftKey) // In table: Tab next cell, Shift+Tab previous
//                 } else {
//                     document.execCommand(e.shiftKey ? 'outdent' : 'indent') // Normal text: indent/outdent
//                     saveDo()
//                 }
//             }

//             if (e.ctrlKey) {
//                 switch (e.key.toLowerCase()) {
//                     case 'z':
//                         undo()
//                         e.preventDefault();
//                         break
//                     case 'y':
//                         redo()
//                         e.preventDefault()
//                         break
//                 }
//             }
//         }

//         return (
//             <div
//                 ref={editor}
//                 class={[
//                     () => isEditing() ? 'border border-gray-300' : '',
//                     'blinking-cursor',
//                     'p-4 my-2',
//                     'rounded',
//                     'whitespace-pre-wrap break-words overflow-wrap-anywhere',
//                 ]}
//                 contentEditable={isEditing}
//                 onClick={handleEditorClick}
//                 onBlur={() => { handleBlur(null); }}
//                 onInput={() => { saveDo(); }}
//                 onKeyDown={(e) => handleKeyDown(e)}
//             >
//                 {children}
//             </div >
//         )
//     }

//     return (
//         <div ref={container}>
//             <EditorContext.Provider value={editor}>
//                 <UndoRedo>
//                     {() => $$(isEditing) && <EditorToolbar />}
//                     {() => <EditorSurface />}
//                 </UndoRedo>
//             </EditorContext.Provider>
//         </div >
//     )
// }
// #endregion
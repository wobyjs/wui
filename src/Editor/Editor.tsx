import { useOnClickOutside } from '@woby/use'
import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, JSX, Observable, ObservableMaybe, useEffect, useMemo } from 'woby' // Added useEffect
import { Button } from '../Button'
import UndoIcon from '../icons/undo'
import RedoIcon from '../icons/redo'
import { getCurrentRange, expandRange, getElementsInRange, getSelectedTableCells, focusNextTableCell, convertToSemanticElement, findBlockParent, getCurrentEditor, useBlockEnforcer } from './utils'
import { BoldButton } from './BoldButton'
import { ItalicButton } from './ItalicButton'
import { UnderlineButton } from './UnderlineButton' // Added UnderlineButton
import { EditorContext, UndoRedo, useEditor, useUndoRedo } from './undoredo'
import { FontSize } from './FontSize' // import { FontSizeInput } from './FontSizeCopy' // Changed from Increase/Decrease
import { List } from './List' // import { BulletListButton, NumberedListButton } from './List'
import { Indent } from './Indent' // Will be part of TextAlignDropDown
import { Blockquote } from './Blockquote'

// New Imports
import { TextFormatDropDown, FORMAT_OPTIONS as editorFormatOptions } from './TextFormatDropDown' // Import formatOptions
import { FontFamilyDropDown } from './FontFamilyDropDown'
import { TextColorPicker } from './TextColorPicker'
import { TextBackgroundColorPicker } from './TextBackgroundColorPicker' // Added TextBackgroundColorPicker
import { TextFormatOptionsDropDown } from './TextFormatOptionsDropDown'
import { InsertDropDown } from './InsertDropDown'
import { TextAlignDropDown } from './TextAlignDropDown'
import { UndoRedoButton } from './UndoRedoButton'


interface EditorProps {
    onChange?: (content: string) => void
    children?: JSX.Element | string | (JSX.Element | string)[]
}


const insertImage = (imageUrl?: string) => {
    const r = getCurrentRange()
    if (!r) return

    const imgUrl = imageUrl || prompt('Enter image URL:')
    if (!imgUrl) return

    const imgElement = document.createElement('img')
    imgElement.src = imgUrl
    imgElement.style.maxWidth = '100%'
    r.deleteContents()
    r.insertNode(imgElement)
}

const insertTable = (rowsIn?: number, colsIn?: number) => {
    const r = getCurrentRange()
    if (!r) return

    const rows = rowsIn ?? parseInt(prompt('Enter number of rows:', '2'), 10)
    if (isNaN(rows)) return
    const cols = colsIn ?? parseInt(prompt('Enter number of columns:', '3'), 10)

    if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) return

    let tableHTML = '<table class="border-1 border-collapse"><tbody>'
    for (let i = 0; i < rows; i++) {
        tableHTML += '<tr>'
        for (let j = 0; j < cols; j++) {
            tableHTML += '<td class="p-2">Cell</td>'
        }
        tableHTML += '</tr>'
    }
    tableHTML += '</tbody></table>'

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = tableHTML
    const tableNode = tempDiv.firstChild as Node

    r.deleteContents()
    r.insertNode(tableNode)
}


const def = () => ({
    children: $(null) as JSX.Element | string | (JSX.Element | string)[],
    cls: $(null, HtmlClass) as ObservableMaybe<JSX.Class>,
    class: $(null, HtmlClass) as ObservableMaybe<JSX.Class>,
    enableToolbar: $(true, HtmlBoolean) as ObservableMaybe<boolean>,
})


// #region Editor Surface
/**
* EditorSurface: The interactive "canvas" of the editor.
* This component manages the editable area, monitors HTML changes for history, 
* and handles keyboard shortcuts for navigation and formatting.
*/
const EditorSurface = ({ isEditing, handleEditorClick, handleBlur, children }) => {
    const { saveDo, undo, redo } = useUndoRedo()
    const activeEditor = useEditor()

    useEffect(() => {
        useBlockEnforcer($$(activeEditor) ?? $$(getCurrentEditor))
    });


    // #region Auto-focus Effect
    /**
     * Effect: Automatically focuses the editor element when editing mode is enabled.
     * This ensures the cursor is placed in the editor when the user clicks to start editing.
     */
    useEffect(() => {
        if ($$(isEditing)) {
            const el = $$(activeEditor);

            if (el && document.activeElement !== el) { el.focus(); }
        }
    })
    // #endregion

    // #region Mutation Observer Effect
    /**
     * Effect: Sets up a MutationObserver to monitor all changes in the editor content.
     * This captures typing, formatting changes, node insertions/deletions, and attribute modifications
     * to ensure every edit is properly tracked in the undo/redo history.
     */
    useEffect(() => {
        const el = $$(activeEditor)

        // Validate that we have a valid DOM element before setting up observer
        if (!el || !(el instanceof HTMLElement)) {
            console.warn("[EditorSurface] Observer skipped: el is not a valid HTMLElement", el)
            return
        }

        // Create observer to watch for all types of content changes
        const observer = new MutationObserver((mutations) => {
            // Save the current state to undo/redo history
            saveDo()
        })

        // Configure observer to catch all relevant changes
        observer.observe(el, {
            attributes: true,      // Watch for attribute changes (style, class, etc.)
            childList: true,       // Watch for direct child node additions/removals
            subtree: true,         // Watch for changes in all descendant nodes
            characterData: true,   // Watch for text content changes
        })

        // Cleanup function to disconnect observer when component unmounts
        return () => { observer.disconnect() }
    }) // Auto-tracks $$(activeEditor) - runs when activeEditor reference changes
    // #endregion

    /**
    * handleKeyDown: Intercepts keyboard events to provide custom behavior.
    * - Tab: Navigates table cells OR indents paragraphs.
    * - Ctrl+Z / Ctrl+Y: Triggers custom Undo/Redo logic.
    */
    const handleKeyDown = (e: KeyboardEvent) => {
        // console.debug("[Editor Surface] keydown: ", { "ctrl": e.ctrlKey, "shift": e.shiftKey, "alt": e.altKey, "key": e.key });

        if (e.key === 'Tab') {
            e.preventDefault()
            e.stopPropagation()

            if (isCaretInTableCell()) {
                focusNextTableCell(e.shiftKey) // In table: Tab next cell, Shift+Tab previous
            } else {
                document.execCommand(e.shiftKey ? 'outdent' : 'indent') // Normal text: indent/outdent
                saveDo()
            }
        }

        if (e.ctrlKey) {
            switch (e.key.toLowerCase()) {
                case 'z':
                    undo()
                    e.preventDefault();
                    break
                case 'y':
                    redo()
                    e.preventDefault()
                    break
            }
        }
    }

    /**
    * isCaretInTableCell: A contextual helper that checks if the user's cursor
    * is currently located inside a <td> or <th> element.
    */
    const isCaretInTableCell = () => {
        const sel = document.getSelection()
        if (!sel?.focusNode) return false

        let el: HTMLElement | null =
            sel.focusNode.nodeType === Node.ELEMENT_NODE
                ? (sel.focusNode as HTMLElement)
                : (sel.focusNode.parentElement)

        while (el) {
            if (el.tagName === 'TD' || el.tagName === 'TH') return true
            el = el.parentElement
        }
        return false
    }

    return (
        <div
            ref={activeEditor}
            data-editor-root
            contentEditable={() => $$(isEditing) ? true : false}
            onClick={handleEditorClick}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            class={() => [
                $$(isEditing) ? 'border-blue-500 ring-2' : 'border-gray-200',
                "p-6 my-4 rounded-xl border min-h-[250px] outline-none shadow-sm"
            ]}
        >
            {children}
        </div>
    )
}
// #endregion


// #region Editor Toolbar
/**
* EditorToolbar: A sticky control hub that organizes text formatting, 
* layout tools, and history management into logical functional groups. 
* It interfaces with the UndoRedo system and ensures toolbar interactions 
* do not disrupt the user's text selection.
*/
const EditorToolbar = ({ toolbarRef }) => {
    const { redo, redos, undo, undos } = useUndoRedo()

    // Helper for vertical dividers
    const Divider = () => <div class="w-[1px] h-6 bg-gray-200 mx-1" />

    const BASE_CLASS = "sticky top-0 z-10 bg-white border border-gray-200 rounded-t-lg p-1.5 flex items-center flex-wrap gap-1 shadow-sm mb-0"

    const handleToolbarKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey)
            switch (e.key) {
                case 'z': undo(); break
                case 'y': redo(); break
                // case 89: redo(); break
            }
        else
            switch (e.key) {
                // Tab key in toolbar itself, e.g. if a button is focused
                case 'Tab':
                    e.preventDefault()
                    e.stopPropagation()
                    // This context (toolbar) might not be appropriate for indent/outdent commands
                    // Or, if it is, it should probably focus the editor first.
                    // For now, let's assume it's intended to act on the editor content:
                    document.execCommand(e.shiftKey ? 'outdent' : 'indent')
                    return true
                // case 89: redo(); break
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
        <div class={() => [BASE_CLASS, "editor-toolbar"]} ref={toolbarRef} onKeyDown={(e) => { handleToolbarKeyDown(e) }}>
            {FullToolbar}
            {/* {DebugToolbar} */}
        </div>
    )
}
// #endregion


// #region Editor
const Editor = defaults(def, (props) => {

    const { children, cls, class: cn, enableToolbar, ...otherProps } = props

    const isEditing = $(false)
    const container = $<HTMLDivElement>(null)
    const toolbarRef = $<HTMLDivElement>(null)

    const _editor = $<HTMLDivElement>(null)
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

    // const handleBlur = (e: JSX.FocusEventHandler<HTMLDivElement>) => {
    //     setTimeout(() => {
    //         if ($$(toolbarRef) && !$$(toolbarRef).contains(document.activeElement)) {
    //             isEditing(false)
    //         }
    //     }, 0)
    // }

    const handleBlur = (e?: FocusEvent) => {
        // We use a small timeout to let the browser update the focus state
        setTimeout(() => {
            // 1. Get the element that is NOW focused
            // We check 'relatedTarget' (where focus went) 
            // and 'document.activeElement' (the host)
            const nextFocusedElement = e?.relatedTarget as Node;
            const containerEl = $$(container);

            /**
             * ✅ THE FIX:
             * In a Custom Element, we need to know if the focus is still 
             * inside our 'container' div, even if it's in the Shadow DOM.
             */
            const isFocusStillInside =
                (containerEl && containerEl.contains(document.activeElement)) ||
                (containerEl && containerEl.contains(nextFocusedElement));

            if (!isFocusStillInside) {
                console.log("[Editor] Focus actually left the component. Closing toolbar.");
                isEditing(false);
            }
        }, 50);
    };


    // useOnClickOutside(container, () => handleBlur(null),)

    const handleEditorClick = () => { isEditing(true) }

    return (
        <div ref={container}>
            <EditorContext.Provider value={editor}>
                <UndoRedo>
                    {() => $$(isEditing) && $$(enableToolbar) && <EditorToolbar toolbarRef={toolbarRef} />}
                    <EditorSurface
                        isEditing={isEditing}
                        handleEditorClick={handleEditorClick}
                        handleBlur={handleBlur}
                        children={children}
                    >
                    </EditorSurface>
                </UndoRedo>
            </EditorContext.Provider>
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
//     const container = $<HTMLDivElement>(null)
//     const editor = $<HTMLDivElement>(null)
//     const toolbarRef = $<HTMLDivElement>(null)

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
//             console.log("[Editor Toolbar] keydown: ", { "ctrl": e.ctrlKey, "shift": e.shiftKey, "alt": e.altKey, "key": e.key })

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
//             console.log("[Editor Surface] keydown: ", { "ctrl": e.ctrlKey, "shift": e.shiftKey, "alt": e.altKey, "key": e.key });

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
//                         console.log("[Editor Surface] undo action")
//                         undo()
//                         e.preventDefault();
//                         break
//                     case 'y':
//                         console.log("[Editor Surface] red action")
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
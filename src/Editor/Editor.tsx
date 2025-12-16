import { useOnClickOutside } from '@woby/use'
import { $, $$, JSX, useEffect } from 'woby' // Added useEffect
import { Button } from '../Button'
import UndoIcon from '../icons/undo'
import RedoIcon from '../icons/redo'
import { getCurrentRange, expandRange, getElementsInRange, getSelectedTableCells, focusNextTableCell, convertToSemanticElement, findBlockParent } from './utils'
import { BoldButton } from './BoldButton'
import { ItalicButton } from './ItalicButton'
import { UnderlineButton } from './UnderlineButton' // Added UnderlineButton
import { EditorContext, UndoRedo, useUndoRedo } from './undoredo'
import { FontSizeInput } from './FontSizeCopy' // Changed from Increase/Decrease
import { BulletListButton, NumberedListButton } from './List'
// import { Indent, Outdent } from './Indent' // Will be part of TextAlignDropDown

// New Imports
import { TextFormatDropDown, formatOptions as editorFormatOptions } from './TextFormatDropDown' // Import formatOptions
import { FontFamilyDropDown } from './FontFamilyDropDown'
import { TextColorPicker } from './TextColorPicker'
import { TextBackgroundColorPicker } from './TextBackgroundColorPicker' // Added TextBackgroundColorPicker
import { TextFormatOptionsDropDown } from './TextFormatOptionsDropDown'
import { InsertDropDown } from './InsertDropDown'
import { TextAlignDropDown } from './TextAlignDropDown'


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




export const Editor = ({ onChange, children }: EditorProps) => {
    // const content = $(initialContent)
    const isEditing = $(false)
    const container = $<HTMLDivElement>(null)
    const editor = $<HTMLDivElement>(null)
    const toolbarRef = $<HTMLDivElement>(null)

    const handleBlur = (e: JSX.FocusEventHandler<HTMLDivElement>) => {
        console.log('handle editor')
        setTimeout(() => {
            if ($$(toolbarRef) && !$$(toolbarRef).contains(document.activeElement)) {
                isEditing(false)
            }
        }, 0)
    }

    useOnClickOutside(container, () => handleBlur(null),)

    const handleEditorClick = () => {
        isEditing(true)
    }

    return (
        <div ref={container}>
            <EditorContext.Provider value={editor}>
                <UndoRedo>
                    {() => {
                        const { redo, redos, undo, undos } = useUndoRedo()

                        return $$(isEditing) && (
                            <div className="editor-toolbar" ref={toolbarRef}
                                onKeyDown={e => {
                                    console.log('toolbar keydown', e.ctrlKey, e.key)

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
                                }}
                            >
                                {() => {
                                    const l = useUndoRedo
                                    return <>
                                        {/* Group 1: Block Format, Font Family, Font Size */}
                                        <TextFormatDropDown />
                                        <FontFamilyDropDown />
                                        <FontSizeInput />

                                        {/* Group 2: Basic inline styles */}
                                        <BoldButton />
                                        <ItalicButton />
                                        <UnderlineButton />

                                        {/* Group 3: Color, More formats */}
                                        <TextColorPicker />
                                        <TextBackgroundColorPicker /> {/* Added TextBackgroundColorPicker */}
                                        <TextFormatOptionsDropDown /> {/* Contains Strikethrough, Sub/Super, Highlight, Clear, Case */}

                                        {/* Group 4: Insert, Align, Lists */}
                                        <InsertDropDown /> {/* Contains HR, Image, Table etc. */}
                                        <TextAlignDropDown /> {/* Contains L/C/R/J Align, Indent/Outdent */}

                                        {/* Group 5: Lists (if not in TextFormatDropDown) & Undo/Redo */}
                                        <BulletListButton />
                                        <NumberedListButton />
                                        {/* CheckListButton would go here */}

                                        <Button type='outlined' onClick={() => undo()} title="Undo" disabled={(() => $$(undos).length === 0)}><UndoIcon /></Button>
                                        <Button type='outlined' onClick={() => redo()} title="Redo" disabled={(() => $$(redos).length === 0)}><RedoIcon /></Button>
                                        <Button type='outlined' onClick={() => {
                                            const editorNode = $$(editor)
                                            if (!editorNode) return

                                            const currentDocSelection = window.getSelection()
                                            if (!currentDocSelection || currentDocSelection.rangeCount === 0) return

                                            let elementToConvert: HTMLElement | null = null
                                            const currentSelectionRange = currentDocSelection.getRangeAt(0)
                                            let container = currentSelectionRange.commonAncestorContainer

                                            // Simplified logic to find the block element to convert
                                            // Similar to getCurrentBlockInfo or initial part of applyFormatBlock
                                            while (container && container !== editorNode.parentNode) {
                                                if (container.nodeType === Node.ELEMENT_NODE && editorNode.contains(container)) {
                                                    const el = container as HTMLElement
                                                    const displayStyle = window.getComputedStyle(el).display
                                                    if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'blockquote', 'li', 'div'].includes(el.tagName.toLowerCase()) || displayStyle === 'block') {
                                                        if (el.parentNode === editorNode || (el.parentNode !== editorNode && editorNode.contains(el.parentNode))) {
                                                            elementToConvert = el
                                                            break
                                                        } else if (el === editorNode && !elementToConvert) {
                                                            // Fallback to editor itself if no other block found, though less ideal
                                                            // convertToSemanticElement should handle if editorNode's content needs wrapping
                                                            elementToConvert = el
                                                        }
                                                    }
                                                }
                                                if (container === editorNode) break // Stop if we reach the editor itself
                                                container = container.parentNode
                                            }

                                            // If no specific block element is found (e.g. editor is empty or selection is weird)
                                            // and editorNode itself is contenteditable, we might want to operate on it or a default P.
                                            // For simplicity, if nothing specific, try to use editorNode or a new P if empty.
                                            if (!elementToConvert && editorNode.children.length === 0) {
                                                const p = document.createElement('p')
                                                editorNode.appendChild(p)
                                                elementToConvert = p
                                                // Select the new P to give context to convertToSemanticElement
                                                const newRange = document.createRange()
                                                newRange.selectNodeContents(p)
                                                currentDocSelection.removeAllRanges()
                                                currentDocSelection.addRange(newRange)

                                            } else if (!elementToConvert) {
                                                // Fallback to the editor node if no specific block is identified.
                                                // This might occur if the selection is directly within the editor root
                                                // without a clear block child, or if the editor has multiple top-level non-block nodes.
                                                // convertToSemanticElement will need to be robust enough to handle this,
                                                // potentially by wrapping editor's direct children if it's not a block itself.
                                                elementToConvert = findBlockParent(currentSelectionRange.commonAncestorContainer as HTMLElement, editor) ?? editorNode
                                            }


                                            if (elementToConvert) {
                                                convertToSemanticElement(elementToConvert, 'blockquote', editorNode, editorFormatOptions)
                                                editorNode.focus()
                                            }
                                        }} title="Convert to Blockquote">Blockquote</Button>
                                    </>
                                }}
                            </div>
                        )
                    }}
                    {() => {
                        const urc = useUndoRedo()
                        const { undo, undos, saveDo, redo } = urc

                        useEffect(() => {
                            const editorNode = $$(editor)
                            if (!editorNode) return

                            const observer = new MutationObserver((mutationsList, observer) => {
                                // We might want to be more specific here, but for now, any observed mutation triggers saveDo.
                                // saveDo itself has a check to prevent saving if content hasn't changed.
                                saveDo()
                            })

                            observer.observe(editorNode, {
                                attributes: true, // Observe attributes changes (e.g. style)
                                childList: true,  // Observe direct children changes (add/remove nodes)
                                subtree: true,    // Observe all descendants
                                characterData: true // Observe text content changes
                            })

                            return () => {
                                observer.disconnect()
                            }
                        }) // Reverting to no dependency array, relying on Woby's auto-tracking

                        return <div ref={editor}
                            class={[
                                () => isEditing() ? 'border border-black' : '',
                                'blinking-cursor',
                                'p-2',
                                'rounded'
                            ]}
                            contentEditable={isEditing}
                            onClick={handleEditorClick}
                            onBlur={() => handleBlur(null)}
                            onInput={() => {
                                saveDo()
                            }}
                            onKeyDown={e => {
                                console.log('keydown', e.ctrlKey, e.shiftKey, e.key)

                                const currentRange = getCurrentRange()
                                if (!currentRange) return

                                const r = getElementsInRange(currentRange, editor)
                                const c = getSelectedTableCells(currentRange, editor)
                                console.log('keydown', r, c)

                                if (e.ctrlKey) {
                                    switch (e.key) {
                                        case 'z':
                                            undo()
                                            e.preventDefault()
                                            break
                                        case 'y':
                                            redo()
                                            e.preventDefault()
                                            break
                                    }
                                } else {
                                    switch (e.key) {
                                        case 'Tab': {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            const currentCells = getSelectedTableCells(currentRange, editor)
                                            if (currentCells.length) {
                                                focusNextTableCell(e.shiftKey)
                                            } else {
                                                document.execCommand(e.shiftKey ? 'outdent' : 'indent')
                                                saveDo() // Save state after indent/outdent
                                            }
                                            break
                                        }
                                    }
                                }
                            }}
                        >{children}</div>
                    }
                    }
                </UndoRedo>
            </EditorContext.Provider>
        </div >
    )
}

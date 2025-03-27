import { useOnClickOutside } from 'use-woby'
import { $, $$, JSX, } from 'woby'
import { Button, variant } from '../Button'
import UndoIcon from '../icons/undo'
import RedoIcon from '../icons/redo'
import { range, expandRange } from './utils'
import { BoldButton } from './BoldButton'
import { ItalicButton } from './ItalicButton'
import { EditorContext, UndoRedo, useUndoRedo } from './undoredo'
import { IncreaseFontSize, DecreaseFontSize } from './FontSize'
import { AlignLeftButton } from './AlignLeftButton'
import { AlignRightButton } from './AlignRightButton'
import { AlignCenterButton } from './AlignCenterButton'
import { BulletListButton, NumberedListButton } from './List'
import { Indent, Outdent } from './Indent'

interface EditorProps {
    onChange?: (content: string) => void
    children?: JSX.Element | string | (JSX.Element | string)[]
}


const insertImage = (imageUrl?: string) => {
    const r = $$(range)

    const imgUrl = imageUrl || prompt('Enter image URL:')
    if (!imgUrl) return

    const imgElement = document.createElement('img')
    imgElement.src = imgUrl
    imgElement.style.maxWidth = '100%'
    r.deleteContents()
    r.insertNode(imgElement)
}

const insertTable = (rowsIn?: number, colsIn?: number) => {
    const r = $$(range)

    const rows = rowsIn ?? parseInt(prompt('Enter number of rows:', '2') || '2', 10)
    const cols = colsIn ?? parseInt(prompt('Enter number of columns:', '3') || '3', 10)

    if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) return

    let tableHTML = '<table class="border-1 border-collapse"><tbody>'
    for (let i = 0; i < rows; i++) {
        tableHTML += '<tr>'
        for (let j = 0; j < cols; j++) {
            tableHTML += '<td>Cell</td>'
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
                                            case 'y': undo(); break
                                            // case 89: redo(); break
                                        }
                                    else
                                        switch (e.key) {
                                            case 'Tab': e.preventDefault(); e.stopPropagation(); Indent(); return true
                                            // case 89: redo(); break
                                        }
                                }}
                            >
                                {() => {
                                    const l = useUndoRedo
                                    return <>
                                        <Button class={variant.outlined} onClick={() => undo()} title="Undo" disabled={(() => $$(undos).length === 0)}><UndoIcon /></Button>
                                        <Button class={variant.outlined} onClick={() => redo()} title="Redo" disabled={(() => $$(redos).length === 0)}><RedoIcon /></Button>
                                        <BoldButton />
                                        <ItalicButton />
                                        <DecreaseFontSize />
                                        <IncreaseFontSize />
                                        <AlignLeftButton />
                                        <AlignRightButton />
                                        <AlignCenterButton />
                                        <BulletListButton />
                                        <NumberedListButton />
                                        <Button class={variant.outlined} onClick={() => insertImage()} title="Insert Image">Image</Button>
                                        <Button class={variant.outlined} onClick={() => insertTable()} title="Insert Table">Table</Button>
                                        <Indent />
                                        <Outdent />
                                    </>
                                }}
                            </div>
                        )
                    }}
                    {() => {
                        const { undo, undos, saveDo } = useUndoRedo()

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
                            onKeyDown={e => {
                                console.log('keydown', e.ctrlKey, e.key)

                                saveDo(undos)

                                // if (!e.shiftKey)
                                if (e.ctrlKey)
                                    switch (e.key) {
                                        case 'z': undo(); break
                                        case 'y': undo(); break
                                        // case 89: redo(); break
                                    }
                                else
                                    switch (e.key) {
                                        case 'Tab': e.preventDefault(); e.stopPropagation(); Indent(); return true
                                        // case 89: redo(); break
                                    }


                            }}
                        >{children}</div>
                    }
                    }
                </UndoRedo>
            </EditorContext.Provider>
        </div>
    )
}

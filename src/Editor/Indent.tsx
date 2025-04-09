import { $$, Observable } from 'woby'
import { Button, variant } from '../Button'
import IndentIcon from '../icons/indent'
import OutdentIcon from '../icons/outdent'
import { useEditor, useUndoRedo } from './undoredo'
import { applyStyle, expandRange, getParagraphsInRange, isTags, range } from './utils'

export const getIndentSize = (element: HTMLElement) => {
    // let textIndent = '0px'
    if (element && element.nodeType === Node.ELEMENT_NODE) {
        const computedStyle = window.getComputedStyle(element)
        return computedStyle.textIndent //|| textIndent
    } else {
        const computedStyle = window.getComputedStyle(element.parentElement)
        return computedStyle.textIndent //|| textIndent
    }
    // return textIndent
}


export const applyIndent = (editor: Observable<HTMLDivElement>, out = false) => {
    const r = expandRange()
    if (!r) return

    const elements = getParagraphsInRange(r, editor, 'P', 'LI')

    elements.forEach(element => {
        // const before = window.getComputedStyle(element)

        const currentIndent = getIndentSize(element)
        const textIndent = parseFloat(currentIndent) + ((out ? -1 : 1) * 12) + 'px'

        // if (before.textIndent === textIndent)
        //     return
        element.style.textIndent = textIndent
        const after = window.getComputedStyle(element)
        if (after.textIndent === '0px')
            element.style.textIndent = ''
    })
}



export const Indent = () => {
    const { undos, saveDo } = useUndoRedo()
    const editor = useEditor()

    return <Button class={variant.outlined} onClick={() => {
        saveDo(undos)

        applyIndent(editor)

    }} title="Indent"><IndentIcon /></Button>
}

export const Outdent = () => {
    const { undos, saveDo } = useUndoRedo()
    const editor = useEditor()

    return <Button class={variant.outlined} onClick={() => {
        saveDo(undos)

        applyIndent(editor, true)

    }} title="Outdent"><OutdentIcon /></Button>
}

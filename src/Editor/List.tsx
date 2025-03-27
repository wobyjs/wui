import { $$, Observable, } from 'woby'
import { Button, variant } from '../Button'
import ListBulleted from '../icons/list_bulleted'
import ListNumbered from '../icons/list_numbered'
import { expandRange, cloneAttributes, isTags, getParagraphsInRange } from './utils'
import { useEditor, useUndoRedo } from './undoredo'



const insertList = (editor: Observable<HTMLDivElement>, tag: 'ol' | 'ul' = 'ul', className = 'list-inside') => {
    const r = expandRange()
    if (!r) return

    const paragraphs = getParagraphsInRange(r, editor, 'P')
    if (paragraphs.length > 0) {
        const ul = document.createElement(tag)
        ul.className = className
        paragraphs.forEach(p => {
            const li = document.createElement('li')
            li.append(...p.childNodes as any)

            cloneAttributes(li, p)
            p.remove()

            ul.appendChild(li)
        })
        r.deleteContents()
        r.insertNode(ul)
        return
    } else {
        // Fallback to text based list if no paragraphs selected
        const selectedText = r.toString()
        const lines = selectedText.trim().split('\n').filter(line => line.trim() !== '')
        if (lines.length > 0) {
            const ul = document.createElement('ul')
            lines.forEach(line => {
                const li = document.createElement('li')
                li.textContent = line
                ul.appendChild(li)
            })
            r.deleteContents()
            r.insertNode(ul)
            return
        }
    }
}

export const BulletListButton = () => {
    const { undos, saveDo } = useUndoRedo()
    const editor = useEditor()

    return <Button class={variant.outlined} onClick={() => {
        saveDo(undos)

        insertList(editor)
    }} title="Bulleted List"><ListBulleted /></Button>
}

export const NumberedListButton = () => {
    const { undos, saveDo } = useUndoRedo()
    const editor = useEditor()

    return <Button class={variant.outlined} onClick={() => {
        saveDo(undos)

        insertList(editor, 'ol', 'list-inside list-decimal')
    }} title="Numbered List"><ListNumbered /></Button>
}
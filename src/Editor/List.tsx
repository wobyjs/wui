import { $$, Observable, } from 'woby'
import { Button } from '../Button'
import ListBulleted from '../icons/list_bulleted'
import ListNumbered from '../icons/list_numbered'
import { expandRange, cloneAttributes, isTags, getElementsInRange } from './utils'
import { useEditor } from './undoredo' // Removed useUndoRedo

const semanticTags = ['TABLE', 'TBODY', 'THEAD', 'TFOOT', 'TR', 'TD', 'IMG', 'BLOCKQUOTE',
    'ARTICLE', 'ASIDE', 'DETAILS', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'HEADER', 'MAIN', 'MARK', 'NAV', 'SECTION', 'SUMMARY', 'TIME',
]

const insertList = (
    editor: Observable<HTMLDivElement>,
    tag: 'ol' | 'ul' = 'ul',
    className = 'list-inside',
    liClass = 'list-disc'
) => {
    const r = expandRange()
    if (!r) return

    const selectedBlocks = getElementsInRange(r, editor)
    if (selectedBlocks.length === 0) return

    const liClassList = liClass.split(' ')
    const newList = document.createElement(tag)
    newList.className = className

    const parentList = selectedBlocks[0].closest?.('ul,ol')
    const selectedLis = selectedBlocks.filter(el => el.tagName === 'LI' && el.closest('ul,ol') === parentList)

    // Case 1: Selection within one list
    if (selectedLis.length > 0 && parentList) {
        const isSameType = parentList.tagName.toLowerCase() === tag

        if (isSameType) {
            // Just toggle class
            selectedLis.forEach(li => {
                li.classList.remove('list-disc', 'list-decimal')
                li.classList.add(...liClassList)
            })
        } else {
            // Nest a new list with cloned selected <li>s
            const nestedList = document.createElement(tag)
            nestedList.className = className

            selectedLis.forEach(li => {
                const cloned = li.cloneNode(true) as HTMLElement
                cloned.classList.remove('list-disc', 'list-decimal')
                cloned.classList.add(...liClassList)
                nestedList.appendChild(cloned)
            })

            const wrapperLi = document.createElement('li')
            wrapperLi.appendChild(nestedList)

            // Insert before first selected <li>
            parentList.insertBefore(wrapperLi, selectedLis[0])

            // Remove selected <li>s after insertion
            selectedLis.forEach(li => li.remove())
        }
        return
    }

    // Case 2: Generic block wrapping
    for (const block of selectedBlocks) {
        if (block.tagName === 'TABLE' || block.closest('table')) {
            const li = document.createElement('li')
            li.classList.add(...liClassList)
            li.appendChild(block.cloneNode(true))
            cloneAttributes(li, block)
            newList.appendChild(li)
            block.remove()
        } else {
            const li = document.createElement('li')
            li.classList.add(...liClassList)
            li.append(...Array.from(block.childNodes)) // move children
            cloneAttributes(li, block)
            newList.appendChild(li)
            block.remove()
        }
    }

    r.deleteContents()
    r.insertNode(newList)
}



export const BulletListButton = () => {
    // const { undos, saveDo } = useUndoRedo() // Removed
    const editor = useEditor()

    return <Button buttonType='outlined' onClick={() => {
        // saveDo(undos) // Removed: MutationObserver in Editor.tsx should now handle this
        insertList(editor, 'ul', 'list-inside list-disc')
    }} title="Bulleted List"><ListBulleted /></Button>
}

export const NumberedListButton = () => {
    // const { undos, saveDo } = useUndoRedo() // Removed
    const editor = useEditor()

    return <Button buttonType='outlined' onClick={() => {
        // saveDo(undos) // Removed: MutationObserver in Editor.tsx should now handle this
        insertList(editor, 'ol', 'list-inside', 'list-decimal')
    }} title="Numbered List"><ListNumbered /></Button>
}

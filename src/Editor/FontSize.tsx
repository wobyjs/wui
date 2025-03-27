import { $$, Observable } from 'woby'
import { Button, variant } from '../Button'
import TextIncrease from '../icons/text_increase'
import TextDecrease from '../icons/text_decrease'
import { useUndoRedo } from './undoredo'
import { applyStyle, range } from './utils'

export const getFontSize = () => {
    let fontSize = '12px'
    if ($$(range)) {
        const parentElement = $$(range).commonAncestorContainer as HTMLElement
        if (parentElement && parentElement.nodeType === Node.ELEMENT_NODE) {
            const computedStyle = window.getComputedStyle(parentElement)
            fontSize = computedStyle.fontSize || fontSize
        } else {
            const computedStyle = window.getComputedStyle(parentElement.parentElement)
            fontSize = computedStyle.fontSize || fontSize
        }
    } else //if ($$(editor)) 
        debugger
    // const computedStyle = window.getComputedStyle($$(editor))
    // fontSize = computedStyle.fontSize || fontSize
    return fontSize
}


export const applyFontSize = (fontSize: string) => {
    applyStyle((element) => {
        const p = window.getComputedStyle(element?.parentElement)
        const before = window.getComputedStyle(element)
        if (before.fontSize === fontSize)
            return
        element.style.fontSize = fontSize
        const after = window.getComputedStyle(element)
        if (p.fontSize === after.fontSize)
            element.style.fontSize = ''
    })
}


export const IncreaseFontSize = () => {
    const { undos, saveDo } = useUndoRedo()

    return <Button class={variant.outlined} onClick={() => {
        saveDo(undos)

        const currentFontSize = getFontSize()
        const newFontSize = parseFloat(currentFontSize) + 2
        applyFontSize(newFontSize + 'px')
    }} title="Increase Font Size"><TextIncrease /></Button>
}


export const DecreaseFontSize = () => {
    const { undos, saveDo } = useUndoRedo()

    return <Button class={variant.outlined} onClick={() => {
        saveDo(undos)

        const currentFontSize = getFontSize()
        const newFontSize = parseFloat(currentFontSize) - 2
        applyFontSize(newFontSize + 'px')
    }} title="Decrease Font Size"><TextDecrease /></Button>
}

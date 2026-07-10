// Test Font Size functionality with dv
const test = async () => {
    console.log('=== Font Size Test ===')

    // Get the editor
    const editor = document.querySelector('wui-editor')
    if (!editor) {
        console.error('Editor not found')
        return
    }

    const shadowRoot = editor.shadowRoot
    if (!shadowRoot) {
        console.error('No shadow root')
        return
    }

    // Get the contenteditable div inside shadow DOM
    const editableDiv = shadowRoot.querySelector('[contenteditable="true"]')
    if (!editableDiv) {
        console.error('No contenteditable div found')
        return
    }

    console.log('Editor found, shadowRoot:', shadowRoot)
    console.log('Editable div:', editableDiv)

    // Find some text to select
    const textNode = editableDiv.firstChild
    if (!textNode) {
        console.error('No text node found')
        return
    }

    // Select some text
    const range = document.createRange()
    range.setStart(textNode, 0)
    range.setEnd(textNode, 10)

    const sel = shadowRoot.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)

    console.log('Selection:', sel.toString())
    console.log('Range:', range.toString())

    // Get initial font size from the selected element
    const parentElement = textNode.parentElement
    const initialSize = window.getComputedStyle(parentElement).fontSize
    console.log('Initial font size:', initialSize)

    // Find the A+ button (font size increase)
    const fontSizeComponent = shadowRoot.querySelector('wui-font-size')
    if (!fontSizeComponent) {
        console.error('Font size component not found')
        return
    }

    const increaseBtn = fontSizeComponent.shadowRoot?.querySelector('button:last-child')
    const decreaseBtn = fontSizeComponent.shadowRoot?.querySelector('button:first-child')

    console.log('Font size component:', fontSizeComponent)
    console.log('Increase button:', increaseBtn)
    console.log('Decrease button:', decreaseBtn)

    if (increaseBtn) {
        console.log('Clicking A+ button...')
        increaseBtn.click()

        // Wait and check new font size
        await new Promise(r => setTimeout(r, 500))

        const newSize = window.getComputedStyle(parentElement).fontSize
        console.log('Font size after A+ click:', newSize)

        if (newSize !== initialSize) {
            console.log('SUCCESS: Font size changed from', initialSize, 'to', newSize)
        } else {
            console.log('FAIL: Font size did not change')
        }
    }
}

test()

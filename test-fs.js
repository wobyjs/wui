// Get editor and shadow root
const editor = document.querySelector('wui-editor')
const shadow = editor.shadowRoot
const editable = shadow.querySelector('[contenteditable="true"]')

// Select text "olbar demo" from the editor
const walker = document.createTreeWalker(editable, NodeFilter.SHOW_TEXT, null)
let node
while (node = walker.nextNode()) {
    if (node.textContent.includes('toolbar demo')) {
        const range = document.createRange()
        const idx = node.textContent.indexOf('toolbar demo')
        range.setStart(node, idx)
        range.setEnd(node, idx + 'toolbar demo'.length)
        
        const sel = shadow.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)
        
        console.log('Selected:', sel.toString())
        break
    }
}

// Get initial font size
const initialSize = window.getComputedStyle(editable.querySelector('p') || editable).fontSize
console.log('Initial font size:', initialSize)

// Return state for dv
({
    editorFound: !!editor,
    shadowFound: !!shadow,
    editableFound: !!editable,
    selection: shadow.getSelection().toString(),
    initialFontSize: initialSize
})

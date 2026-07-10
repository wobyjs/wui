// Comprehensive formatting test: caret, partial, full, cross selection with multi-format
// Run 20 iterations using dv eval

const tests = [];

// Test helper functions (to be injected into page)
const testHelpers = `
(function() {
    // Get editor elements
    const getEditor = () => {
        const editor = document.querySelector('wui-editor');
        const shadow = editor.shadowRoot;
        const ce = shadow.querySelector('[contenteditable]');
        return { editor, shadow, ce };
    };

    // Create caret selection at specific position
    const createCaretSelection = (textMarker, offset = 0) => {
        const { shadow, ce } = getEditor();
        const textNodes = [];
        const walker = document.createTreeWalker(ce, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) textNodes.push(walker.currentNode);

        for (const node of textNodes) {
            const idx = node.textContent.indexOf(textMarker);
            if (idx !== -1) {
                const sel = shadow.getSelection();
                const range = document.createRange();
                range.setStart(node, idx + offset);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                return { success: true, text: node.textContent.substring(idx, idx + 20) };
            }
        }
        return { error: 'Marker not found: ' + textMarker };
    };

    // Create partial word selection
    const createPartialWordSelection = (textMarker, startOffset, length) => {
        const { shadow, ce } = getEditor();
        const textNodes = [];
        const walker = document.createTreeWalker(ce, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) textNodes.push(walker.currentNode);

        for (const node of textNodes) {
            const idx = node.textContent.indexOf(textMarker);
            if (idx !== -1) {
                const sel = shadow.getSelection();
                const range = document.createRange();
                range.setStart(node, idx + startOffset);
                range.setEnd(node, idx + startOffset + length);
                sel.removeAllRanges();
                sel.addRange(range);
                return { success: true, selected: sel.toString() };
            }
        }
        return { error: 'Marker not found: ' + textMarker };
    };

    // Create full word/paragraph selection
    const createFullSelection = (startMarker, endMarker) => {
        const { shadow, ce } = getEditor();
        const textNodes = [];
        const walker = document.createTreeWalker(ce, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) textNodes.push(walker.currentNode);

        let startNode = null, startOffset = 0;
        let endNode = null, endOffset = 0;

        for (const node of textNodes) {
            const idx = node.textContent.indexOf(startMarker);
            if (idx !== -1) { startNode = node; startOffset = idx; }
            const endIdx = node.textContent.indexOf(endMarker);
            if (endIdx !== -1) { endNode = node; endOffset = endIdx + endMarker.length; }
        }

        if (!startNode || !endNode) return { error: 'Markers not found' };

        const sel = shadow.getSelection();
        const range = document.createRange();
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
        sel.removeAllRanges();
        sel.addRange(range);
        return { success: true, selected: sel.toString().substring(0, 50), length: sel.toString().length };
    };

    // Create cross-paragraph selection
    const createCrossParagraphSelection = () => {
        const { shadow, ce } = getEditor();
        const paragraphs = ce.querySelectorAll('p');
        if (paragraphs.length < 2) return { error: 'Not enough paragraphs' };

        const sel = shadow.getSelection();
        const range = document.createRange();
        range.setStart(paragraphs[0], 0);
        range.setEnd(paragraphs[paragraphs.length - 1], paragraphs[paragraphs.length - 1].childNodes.length);
        sel.removeAllRanges();
        sel.addRange(range);
        return { success: true, pCount: paragraphs.length, length: sel.toString().length };
    };

    // Click format button
    const clickButton = (type) => {
        const { shadow } = getEditor();
        const buttons = shadow.querySelectorAll('button');
        const typeLower = type.toLowerCase();

        for (const btn of buttons) {
            const title = (btn.getAttribute('title') || '').toLowerCase();
            if (typeLower === 'bold' && title.includes('bold')) { btn.click(); return { clicked: 'bold' }; }
            if (typeLower === 'italic' && title.includes('italic')) { btn.click(); return { clicked: 'italic' }; }
            if (typeLower === 'underline' && title.includes('underline')) { btn.click(); return { clicked: 'underline' }; }
            if (typeLower === 'bullet' && title.includes('bullet')) { btn.click(); return { clicked: 'bullet' }; }
            if (typeLower === 'number' && title.includes('number')) { btn.click(); return { clicked: 'number' }; }
        }
        return { error: 'Button not found: ' + type };
    };

    // Get HTML state
    const getHTMLState = () => {
        const { shadow, ce } = getEditor();
        return {
            html: ce.innerHTML,
            strongCount: shadow.querySelectorAll('strong').length,
            emCount: shadow.querySelectorAll('em').length,
            uCount: shadow.querySelectorAll('u').length,
            ulCount: shadow.querySelectorAll('ul').length,
            olCount: shadow.querySelectorAll('ol').length,
            liCount: shadow.querySelectorAll('li').length
        };
    };

    // Check formatting at selection
    const checkFormatting = () => {
        const { shadow } = getEditor();
        const sel = shadow.getSelection();
        if (!sel.rangeCount) return { error: 'No selection' };

        const range = sel.getRangeAt(0);
        let node = range.startContainer;

        // Walk up to find formatting
        const formatting = { bold: false, italic: false, underline: false };
        while (node && node !== shadow) {
            if (node instanceof HTMLElement) {
                const tag = node.tagName.toLowerCase();
                if (tag === 'strong' || tag === 'b') formatting.bold = true;
                if (tag === 'em' || tag === 'i') formatting.italic = true;
                if (tag === 'u') formatting.underline = true;
                const style = node.style;
                if (style.fontWeight === 'bold' || style.fontWeight === '700') formatting.bold = true;
                if (style.fontStyle === 'italic') formatting.italic = true;
                if (style.textDecoration.includes('underline')) formatting.underline = true;
            }
            node = node.parentNode;
        }
        return formatting;
    };

    // Expose helpers globally
    window.testHelpers = {
        getEditor,
        createCaretSelection,
        createPartialWordSelection,
        createFullSelection,
        createCrossParagraphSelection,
        clickButton,
        getHTMLState,
        checkFormatting
    };
    return 'Helpers installed';
})()
`;

console.log('=== Installing test helpers ===');
console.log(testHelpers);
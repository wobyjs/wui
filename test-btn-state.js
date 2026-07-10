(function() {
    const editor = document.querySelector('wui-editor');
    const shadow = editor.shadowRoot;
    const contentEditable = shadow.querySelector('[contenteditable="true"]');
    const sel = shadow.getSelection();

    // First, select some text and apply italic
    const text = contentEditable.textContent;
    const idx = text.indexOf('full toolbar demo');

    const walker = document.createTreeWalker(contentEditable, NodeFilter.SHOW_TEXT, null);
    let currentOffset = 0;
    let startNode = null, startNodeOffset = 0;
    let endNode = null, endNodeOffset = 0;
    let node;

    const targetStart = idx + 5; // "toolbar"
    const targetEnd = idx + 5 + 7; // "toolbar" = 7 chars

    while ((node = walker.nextNode())) {
        const len = node.textContent?.length ?? 0;
        if (!startNode && targetStart >= currentOffset && targetStart <= currentOffset + len) {
            startNode = node;
            startNodeOffset = targetStart - currentOffset;
        }
        if (!endNode && targetEnd >= currentOffset && targetEnd <= currentOffset + len) {
            endNode = node;
            endNodeOffset = targetEnd - currentOffset;
        }
        currentOffset += len;
        if (startNode && endNode) break;
    }

    // Select "toolbar"
    const newRange = document.createRange();
    newRange.setStart(startNode, startNodeOffset);
    newRange.setEnd(endNode, endNodeOffset);
    sel.removeAllRanges();
    sel.addRange(newRange);

    // Check initial state
    const range = sel.getRangeAt(0);
    const initialItalicState = window.getStyleStateInRange ? window.getStyleStateInRange(range, 'fontStyle', 'italic') : 'N/A';
    const initialBoldState = window.getStyleStateInRange ? window.getStyleStateInRange(range, 'fontWeight', 'bold') : 'N/A';

    // Apply italic
    window.applyItalic();

    // After applying italic, check state
    const afterItalicRange = sel.getRangeAt(0);
    const afterItalicItalicState = window.getStyleStateInRange ? window.getStyleStateInRange(afterItalicRange, 'fontStyle', 'italic') : 'N/A';
    const afterItalicBoldState = window.getStyleStateInRange ? window.getStyleStateInRange(afterItalicRange, 'fontWeight', 'bold') : 'N/A';

    // Now select a different portion that has italic applied
    // Select the entire "toolbar" text again
    const sel2 = shadow.getSelection();
    const range2 = sel2.getRangeAt(0);
    const html = contentEditable.innerHTML;

    return {
        selectedText: sel2.toString(),
        initialItalicState,
        initialBoldState,
        afterItalicItalicState,
        afterItalicBoldState,
        html: html.substring(0, 300)
    };
})()
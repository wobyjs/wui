// Test caret toggle OFF (unformat)
// When caret is inside a styled span, clicking Bold should remove the style

(function() {
    var editor = document.querySelector('#editor-root');
    var shadow = editor.shadowRoot;
    var content = shadow.querySelector('[contenteditable]');

    // Setup content with existing bold text using DOM methods
    while (content.firstChild) {
        content.removeChild(content.firstChild);
    }
    var p1 = document.createElement('p');

    // Create text nodes and styled span
    var textBefore = document.createTextNode('Hello ');
    var boldSpan = document.createElement('span');
    boldSpan.style.fontWeight = 'bold';
    boldSpan.textContent = 'World';
    var textAfter = document.createTextNode(' test.');

    p1.appendChild(textBefore);
    p1.appendChild(boldSpan);
    p1.appendChild(textAfter);
    content.appendChild(p1);

    // Place caret inside the bold span (at position 2 of the span's text node)
    var sel = shadow.getSelection();
    var range = document.createRange();
    range.setStart(boldSpan.firstChild, 2);  // Caret inside "World"
    range.setEnd(boldSpan.firstChild, 2);    // Collapsed
    sel.removeAllRanges();
    sel.addRange(range);

    console.log('=== CARET TOGGLE OFF TEST ===');
    console.log('HTML before:', content.innerHTML);
    console.log('Caret position: inside bold span at offset 2');

    // Click Bold (should toggle off since caret is inside bold)
    var boldBtn = shadow.querySelector('button[title="Bold"]');
    boldBtn.click();

    var htmlAfter = content.innerHTML;
    console.log('HTML after Bold click:', htmlAfter);

    // Check if bold was removed
    var hasBoldSpan = htmlAfter.includes('font-weight: bold') || htmlAfter.includes('<b>') || htmlAfter.includes('<strong>');

    return {
        initialHTML: 'Hello <span style="font-weight: bold;">World</span> test.',
        htmlAfterToggle: htmlAfter,
        boldRemoved: !hasBoldSpan,
        testPassed: !hasBoldSpan
    };
})();
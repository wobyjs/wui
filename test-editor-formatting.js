// Comprehensive Editor Formatting Tests
// Run via: dv eval --profile profile-2 --file test-editor-formatting.js

const editor = document.querySelector('#editor-demo');
const shadow = editor.shadowRoot;
const content = shadow.querySelector('.editor-content');

// Helper to get button state
function getButtonState(label) {
    const btn = shadow.querySelector('[aria-label="' + label + '"]');
    return btn ? btn.getAttribute('aria-pressed') : null;
}

// Helper to click button
function clickButton(label) {
    const btn = shadow.querySelector('[aria-label="' + label + '"]');
    if (btn) {
        btn.click();
        return true;
    }
    return false;
}

// Helper to set selection
function setSelection(startOffset, endOffset, paragraphIndex) {
    paragraphIndex = paragraphIndex || 0;
    const para = content.querySelectorAll('p')[paragraphIndex];
    if (!para || !para.firstChild) return null;
    const textNode = para.firstChild;

    const sel = shadow.getSelection();
    const range = document.createRange();

    range.setStart(textNode, startOffset);
    range.setEnd(textNode, endOffset);

    sel.removeAllRanges();
    sel.addRange(range);

    return range.toString();
}

// Test results
var results = [];

console.log('=== Starting Comprehensive Editor Tests ===');

// Setup fresh content - using DOM methods
while (content.firstChild) {
    content.removeChild(content.firstChild);
}
var p1 = document.createElement('p');
p1.textContent = 'Hello World. This is a test paragraph.';
content.appendChild(p1);
var p2 = document.createElement('p');
p2.textContent = 'Second paragraph for cross-paragraph testing.';
content.appendChild(p2);
console.log('Content set');

// Test 1: CARET selection - Bold toggle ON
console.log('Test 1: Caret + Bold ON');
setSelection(0, 0);
var beforeBold = getButtonState('Bold');
clickButton('Bold');
var afterBold = getButtonState('Bold');
results.push({test: '1_Caret_Bold_ON', before: beforeBold, after: afterBold});

// Test 2: Toggle OFF - type some text
console.log('Test 2: Toggle Bold OFF then check state');
setSelection(0, 0);
clickButton('Bold');
var state2 = getButtonState('Bold');
results.push({test: '2_Caret_Bold_OFF', state: state2});

// Reset content
while (content.firstChild) {
    content.removeChild(content.firstChild);
}
p1 = document.createElement('p');
p1.textContent = 'Hello World. Test paragraph.';
content.appendChild(p1);

// Test 3: PARTIAL selection - Bold on "Hello"
console.log('Test 3: Partial selection Bold on Hello');
var selText = setSelection(0, 5); // "Hello"
console.log('Selected:', selText);
clickButton('Bold');
var state3 = getButtonState('Bold');
var html3 = content.innerHTML;
results.push({test: '3_Partial_Bold_Hello', buttonState: state3, html: html3});

// Test 4: Toggle off - Bold again on same selection
console.log('Test 4: Toggle Bold OFF');
setSelection(0, 5);
clickButton('Bold');
var state4 = getButtonState('Bold');
var html4 = content.innerHTML;
results.push({test: '4_Partial_Bold_toggle_off', buttonState: state4, html: html4});

// Test 5: FULL word Italic
console.log('Test 5: Full word Italic on World');
setSelection(6, 11); // "World"
clickButton('Italic');
var state5 = getButtonState('Italic');
var html5 = content.innerHTML;
results.push({test: '5_Full_word_Italic', buttonState: state5, html: html5});

// Test 6: Toggle Italic off
console.log('Test 6: Toggle Italic OFF');
setSelection(6, 11);
clickButton('Italic');
var state6 = getButtonState('Italic');
var html6 = content.innerHTML;
results.push({test: '6_Italic_toggle_off', buttonState: state6, html: html6});

// Test 7: Underline on partial
console.log('Test 7: Partial Underline');
setSelection(12, 17); // "Test"
clickButton('Underline');
var state7 = getButtonState('Underline');
var html7 = content.innerHTML;
results.push({test: '7_Partial_Underline', buttonState: state7, html: html7});

// Test 8: Font size A+ test
console.log('Test 8: Font Size Increase');
// Reset content
while (content.firstChild) {
    content.removeChild(content.firstChild);
}
p1 = document.createElement('p');
p1.textContent = 'Font test paragraph.';
content.appendChild(p1);
setSelection(0, 4); // "Font"
clickButton('Increase font size');
var html8 = content.innerHTML;
results.push({test: '8_Font_Increase', html: html8});

// Test 9: Font size A- test
console.log('Test 9: Font Size Decrease on same selection');
setSelection(0, 4);
clickButton('Decrease font size');
var html9 = content.innerHTML;
results.push({test: '9_Font_Decrease', html: html9});

// Test 10: Multiple toggle cycles - Bold x3
console.log('Test 10: Bold toggle cycle x3');
while (content.firstChild) {
    content.removeChild(content.firstChild);
}
p1 = document.createElement('p');
p1.textContent = 'Cycle test word.';
content.appendChild(p1);
setSelection(0, 6); // "Cycle"
// Toggle ON
clickButton('Bold');
var html10a = content.innerHTML;
var state10a = getButtonState('Bold');
// Toggle OFF
clickButton('Bold');
var html10b = content.innerHTML;
var state10b = getButtonState('Bold');
// Toggle ON again
clickButton('Bold');
var html10c = content.innerHTML;
var state10c = getButtonState('Bold');
results.push({test: '10_Bold_cycle_x3', states: [state10a, state10b, state10c], htmls: [html10a, html10b, html10c]});

// Test 11: Cross-paragraph selection
console.log('Test 11: Cross-paragraph Bold');
while (content.firstChild) {
    content.removeChild(content.firstChild);
}
p1 = document.createElement('p');
p1.textContent = 'First paragraph text here.';
content.appendChild(p1);
p2 = document.createElement('p');
p2.textContent = 'Second paragraph content.';
content.appendChild(p2);

// Create cross-paragraph range
var sel = shadow.getSelection();
var range = document.createRange();
range.setStart(p1.firstChild, 6); // Start at "paragraph"
range.setEnd(p2.firstChild, 6); // End at "Second"
sel.removeAllRanges();
sel.addRange(range);
console.log('Cross-para selection:', range.toString());
clickButton('Bold');
var html11 = content.innerHTML;
results.push({test: '11_Cross_para_Bold', selection: range.toString(), html: html11});

// Print summary
console.log('=== TEST RESULTS ===');
results.forEach(function(r, i) {
    console.log('Result ' + (i+1) + ':', JSON.stringify(r));
});

console.log('=== FINAL HTML ===');
console.log(content.innerHTML);

results;
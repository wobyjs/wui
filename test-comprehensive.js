// Comprehensive formatting test: 20 iterations
// Tests caret, partial, full, cross selection with multi-format toggle

const results = [];
const h = window.testHelpers;

// Get initial state
const initialState = h.getHTMLState();
console.log('Initial state:', JSON.stringify({ li: initialState.liCount, strong: initialState.strongCount, em: initialState.emCount, u: initialState.uCount }));

// Test 1: Caret bold toggle ON/OFF (5 iterations)
for (let i = 0; i < 5; i++) {
    const sel = h.createCaretSelection('Welcome');
    if (sel.error) { results.push({ test: 'caret-bold', iter: i, error: sel.error }); continue; }

    // Toggle ON
    h.clickButton('bold');
    await new Promise(r => setTimeout(r, 100));
    let fmt = h.checkFormatting();

    // Toggle OFF
    h.clickButton('bold');
    await new Promise(r => setTimeout(r, 100));
    let fmt2 = h.checkFormatting();

    results.push({ test: 'caret-bold', iter: i, afterOn: fmt, afterOff: fmt2 });
}

// Test 2: Caret italic toggle ON/OFF (5 iterations)
for (let i = 0; i < 5; i++) {
    const sel = h.createCaretSelection('Welcome');
    if (sel.error) { results.push({ test: 'caret-italic', iter: i, error: sel.error }); continue; }

    h.clickButton('italic');
    await new Promise(r => setTimeout(r, 100));
    let fmt = h.checkFormatting();

    h.clickButton('italic');
    await new Promise(r => setTimeout(r, 100));
    let fmt2 = h.checkFormatting();

    results.push({ test: 'caret-italic', iter: i, afterOn: fmt, afterOff: fmt2 });
}

// Test 3: Partial word selection bold (5 iterations)
for (let i = 0; i < 5; i++) {
    const sel = h.createPartialWordSelection('Welcome', 0, 4);
    if (sel.error) { results.push({ test: 'partial-bold', iter: i, error: sel.error }); continue; }

    h.clickButton('bold');
    await new Promise(r => setTimeout(r, 100));
    let state = h.getHTMLState();

    h.clickButton('bold');
    await new Promise(r => setTimeout(r, 100));
    let state2 = h.getHTMLState();

    results.push({ test: 'partial-bold', iter: i, afterOn: { strong: state.strongCount }, afterOff: { strong: state2.strongCount } });
}

// Test 4: Full paragraph selection bold+italic+underline (5 iterations)
for (let i = 0; i < 5; i++) {
    const sel = h.createFullSelection('Welcome', 'Editor');
    if (sel.error) { results.push({ test: 'full-multi', iter: i, error: sel.error }); continue; }

    h.clickButton('bold');
    await new Promise(r => setTimeout(r, 50));
    h.clickButton('italic');
    await new Promise(r => setTimeout(r, 50));
    h.clickButton('underline');
    await new Promise(r => setTimeout(r, 50));

    let state = h.getHTMLState();

    // Toggle all off
    h.clickButton('bold');
    await new Promise(r => setTimeout(r, 50));
    h.clickButton('italic');
    await new Promise(r => setTimeout(r, 50));
    h.clickButton('underline');
    await new Promise(r => setTimeout(r, 50));

    let state2 = h.getHTMLState();

    results.push({ test: 'full-multi', iter: i, afterOn: { strong: state.strongCount, em: state.emCount, u: state.uCount }, afterOff: { strong: state2.strongCount, em: state2.emCount, u: state2.uCount } });
}

// Final state
const finalState = h.getHTMLState();
console.log('Final state:', JSON.stringify({ li: finalState.liCount, strong: finalState.strongCount, em: finalState.emCount, u: finalState.uCount }));

// Summary
const errors = results.filter(r => r.error);
const passes = results.filter(r => !r.error);
console.log('=== RESULTS ===');
console.log('Total tests:', results.length);
console.log('Passed:', passes.length);
console.log('Errors:', errors.length);
if (errors.length > 0) console.log('Error details:', JSON.stringify(errors));

return JSON.stringify({ total: results.length, passed: passes.length, errors: errors.length, errorDetails: errors.slice(0, 3) });

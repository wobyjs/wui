// Run this script in the browser console at http://localhost:5174/test-blur-behavior.html

(async () => {
    console.log('=== HUMAN-LIKE BLUR BEHAVIOR TEST ===\n');

    // Get editor
    const editor = document.getElementById('test-editor');

    // Wait for shadow DOM
    await new Promise(resolve => {
        const check = () => {
            if (editor?.shadowRoot?.querySelector('[data-editor-root]')) {
                resolve();
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });

    const shadowRoot = editor.shadowRoot;
    const editableRoot = shadowRoot.querySelector('[data-editor-root]');
    const toolbar = shadowRoot.querySelector('.editor-toolbar');

    console.log('Editor ready ✓\n');

    // Set up event monitoring
    const eventLog = [];

    ['blur', 'focus', 'focusin', 'focusout', 'mousedown', 'mouseup', 'click'].forEach(eventType => {
        editableRoot.addEventListener(eventType, (e) => {
            const sel = window.getSelection();
            const entry = {
                time: new Date().toISOString().substr(11, 12),
                event: eventType.toUpperCase(),
                location: 'editable-root',
                selection: sel.toString() || 'none',
                activeElement: document.activeElement.tagName
            };
            eventLog.push(entry);
            console.log(`[${entry.time}] ${entry.event} @ editable-root | Sel: "${entry.selection}" | Active: ${entry.activeElement}`);
        }, true);
    });

    // Test 1: Create selection
    console.log('--- TEST 1: Create Selection ---');
    const firstP = editableRoot.querySelector('p');
    const range = document.createRange();
    range.setStart(firstP.firstChild, 0);
    range.setEnd(firstP.firstChild, 7);

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    console.log(`Selection: "${sel.toString()}" ✓\n`);

    await new Promise(r => setTimeout(r, 100));

    // Test 2: Click bold button
    console.log('--- TEST 2: Click Bold Button ---');
    const buttons = toolbar.querySelectorAll('button');
    const boldButton = Array.from(buttons).find(btn => btn.getAttribute('title')?.includes('Bold'));

    console.log(`Found bold button: "${boldButton.getAttribute('title')}"\n`);

    // Human-like click
    console.log('Step 1: mousedown');
    boldButton.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
    }));

    console.log(`  Selection after mousedown: "${sel.toString()}"`);
    console.log(`  Active element: ${document.activeElement.tagName}\n`);

    await new Promise(r => setTimeout(r, 50));

    console.log('Step 2: click');
    boldButton.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    }));

    console.log(`  Selection after click: "${sel.toString()}"`);
    console.log(`  Active element: ${document.activeElement.tagName}\n`);

    await new Promise(r => setTimeout(r, 100));

    // Test 3: Verify results
    console.log('--- TEST 3: Results ---');
    console.log(`Selection preserved: ${sel.toString() === 'Welcome' ? 'YES ✓' : 'NO ✗'}`);
    console.log(`Final selection: "${sel.toString()}"`);
    console.log(`Final active: ${document.activeElement.tagName}\n`);

    // Check for blur events
    const blurEvents = eventLog.filter(e => e.event === 'BLUR');
    if (blurEvents.length > 0) {
        console.log('⚠️ BLUR EVENTS DETECTED:');
        blurEvents.forEach(e => {
            console.log(`  [${e.time}] Selection was: "${e.selection}"`);
        });
    } else {
        console.log('✓ NO BLUR EVENTS - Selection preserved correctly!\n');
    }

    // Check HTML
    console.log('HTML after bold:');
    console.log(firstP.innerHTML.substr(0, 100) + '...\n');

    return {
        selectionPreserved: sel.toString() === 'Welcome',
        eventLog,
        html: firstP.innerHTML
    };
})();

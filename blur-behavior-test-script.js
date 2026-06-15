// Human-like iteration test for blur behavior investigation
// This script monitors events in real-time and simulates user interactions

const testBlurBehavior = async () => {
    console.log('=== BLUR BEHAVIOR INVESTIGATION TEST ===\n');

    // Wait for editor to initialize
    const editor = document.getElementById('test-editor');
    if (!editor) {
        console.error('Editor not found!');
        return;
    }

    await new Promise(resolve => {
        const check = () => {
            if (editor.shadowRoot) {
                const editableRoot = editor.shadowRoot.querySelector('[data-editor-root]');
                if (editableRoot) {
                    resolve(editableRoot);
                    return;
                }
            }
            setTimeout(check, 100);
        };
        check();
    });

    console.log('Editor initialized ✓\n');

    // Get shadow DOM elements
    const shadowRoot = editor.shadowRoot;
    const editableRoot = shadowRoot.querySelector('[data-editor-root]');
    const toolbar = shadowRoot.querySelector('.editor-toolbar');

    if (!editableRoot || !toolbar) {
        console.error('Could not find editable root or toolbar!');
        return;
    }

    console.log('Shadow DOM structure verified ✓\n');

    // Set up comprehensive event monitoring
    const eventsToMonitor = [
        'blur', 'focus', 'focusin', 'focusout',
        'mousedown', 'mouseup', 'click',
        'selectionchange'
    ];

    const eventLog = [];

    const logEvent = (event, location, details = '') => {
        const timestamp = new Date().toISOString().substr(11, 12);
        const sel = window.getSelection();
        const selectionInfo = sel && sel.rangeCount > 0 ? `"${sel.toString()}"` : 'none';

        const logEntry = {
            timestamp,
            event,
            location,
            selection: selectionInfo,
            details,
            activeElement: document.activeElement?.tagName || 'unknown'
        };

        eventLog.push(logEntry);
        console.log(`[${timestamp}] ${event.toUpperCase()} at ${location} | Selection: ${selectionInfo} | Active: ${logEntry.activeElement} ${details}`);
    };

    // Monitor editable root
    eventsToMonitor.forEach(eventType => {
        editableRoot.addEventListener(eventType, (e) => {
            logEvent(eventType, 'editable-root', `target: ${e.target.tagName}`);
        }, true);
    });

    // Monitor toolbar
    eventsToMonitor.forEach(eventType => {
        toolbar.addEventListener(eventType, (e) => {
            const buttonTitle = e.target.getAttribute('title') || e.target.tagName;
            logEvent(eventType, 'toolbar', `target: ${buttonTitle}`);
        }, true);
    });

    // Monitor document selectionchange
    document.addEventListener('selectionchange', () => {
        const sel = window.getSelection();
        logEvent('selectionchange', 'document', sel.toString() ? `text: "${sel.toString()}"` : 'cursor only');
    });

    console.log('Event monitors attached ✓\n');
    console.log('--- TEST 1: Create Selection ---\n');

    // Test 1: Create selection
    const firstP = editableRoot.querySelector('p');
    if (firstP && firstP.firstChild) {
        const range = document.createRange();
        range.setStart(firstP.firstChild, 0);
        range.setEnd(firstP.firstChild, 7); // "Welcome"

        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        console.log('Selection created: "Welcome" ✓');
        console.log(`Selection range count: ${sel.rangeCount}`);
        console.log(`Selection text: "${sel.toString()}"`);
        console.log(`Focus node: ${sel.focusNode?.textContent?.substr(0, 20)}...`);
        console.log(`Active element: ${document.activeElement?.tagName}\n`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('--- TEST 2: Simulate Toolbar Click (Bold Button) ---\n');

    // Find Bold button
    const buttons = toolbar.querySelectorAll('button');
    const boldButton = Array.from(buttons).find(btn =>
        btn.getAttribute('title')?.includes('Bold')
    );

    if (!boldButton) {
        console.error('Bold button not found!');
        return;
    }

    console.log(`Bold button found: "${boldButton.getAttribute('title')}" ✓\n`);

    // Check if button has mousedown preventDefault
    console.log('Checking button attributes...');
    console.log(`Button has onMouseDown handler: ${boldButton.hasAttribute('onmousedown') ? 'yes' : 'no'}`);
    console.log(`Button type: ${boldButton.getAttribute('type') || 'not set'}`);

    // Simulate human-like click sequence
    console.log('\nSimulating click sequence:');

    // Step 1: mousedown (prevents focus loss)
    console.log('1. Dispatching mousedown...');
    const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window,
        button: 0,
        buttons: 1
    });

    const mousedownPrevented = !boldButton.dispatchEvent(mousedownEvent);
    console.log(`   Mousedown prevented: ${mousedownPrevented}`);
    console.log(`   Selection after mousedown: "${window.getSelection().toString()}"`);
    console.log(`   Active element after mousedown: ${document.activeElement?.tagName}\n`);

    await new Promise(resolve => setTimeout(resolve, 50));

    // Step 2: focus prevention (check if focus moves)
    console.log('2. Checking focus state...');
    console.log(`   Focus moved to button: ${document.activeElement === boldButton}`);
    console.log(`   Selection still exists: ${window.getSelection().rangeCount > 0}`);
    console.log(`   Selection text: "${window.getSelection().toString()}"\n`);

    await new Promise(resolve => setTimeout(resolve, 50));

    // Step 3: click
    console.log('3. Dispatching click...');
    const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        button: 0,
        buttons: 0
    });

    boldButton.dispatchEvent(clickEvent);
    console.log(`   Click dispatched ✓`);
    console.log(`   Selection after click: "${window.getSelection().toString()}"`);
    console.log(`   Active element after click: ${document.activeElement?.tagName}\n`);

    await new Promise(resolve => setTimeout(resolve, 100));

    // Step 4: Check final state
    console.log('--- TEST 3: Final State Verification ---\n');

    const finalSel = window.getSelection();
    console.log(`Final selection range count: ${finalSel.rangeCount}`);
    console.log(`Final selection text: "${finalSel.toString()}"`);
    console.log(`Final selection preserved: ${finalSel.toString() === 'Welcome' ? 'YES ✓' : 'NO ✗'}`);
    console.log(`Final active element: ${document.activeElement?.tagName}`);
    console.log(`Focus still in editable area: ${editableRoot.contains(document.activeElement) ? 'yes' : 'no'}\n`);

    // Check HTML structure
    console.log('--- TEST 4: HTML Structure ---\n');

    const firstPAfter = editableRoot.querySelector('p');
    console.log(`First paragraph HTML: ${firstPAfter?.innerHTML?.substr(0, 100)}...`);
    console.log(`Has bold span: ${firstPAfter?.innerHTML?.includes('font-weight: bold') ? 'yes ✓' : 'no ✗'}\n`);

    // Print event log summary
    console.log('--- EVENT LOG SUMMARY ---\n');
    console.log('Total events captured:', eventLog.length);
    console.log('\nEvents timeline:');

    eventLog.forEach((entry, index) => {
        console.log(`${index + 1}. [${entry.timestamp}] ${entry.event.toUpperCase()} @ ${entry.location}`);
        console.log(`   Selection: ${entry.selection}`);
        console.log(`   Active element: ${entry.activeElement}`);
        if (entry.details) console.log(`   Details: ${entry.details}`);
        console.log('');
    });

    // Check for blur events
    const blurEvents = eventLog.filter(e => e.event === 'blur');
    if (blurEvents.length > 0) {
        console.log('⚠️ BLUR EVENTS DETECTED ⚠️\n');
        blurEvents.forEach(e => {
            console.log(`Blur at: ${e.timestamp}`);
            console.log(`Location: ${e.location}`);
            console.log(`Selection before blur: ${e.selection}`);
            console.log(`Active element: ${e.activeElement}\n`);
        });
    } else {
        console.log('✓ NO BLUR EVENTS - Selection preserved correctly!\n');
    }

    // Return results for inspection
    return {
        eventLog,
        selectionPreserved: window.getSelection().toString() === 'Welcome',
        hadBlurEvents: blurEvents.length > 0,
        finalHTML: firstPAfter?.innerHTML
    };
};

// Run the test
testBlurBehavior().then(results => {
    console.log('\n=== TEST COMPLETE ===');
    console.log('Results available in returned object:', results);
    window.testResults = results;
}).catch(err => {
    console.error('Test failed:', err);
});
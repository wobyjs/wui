// ========================================
// BLUR BEHAVIOR TEST - COPY/PASTE INTO BROWSER CONSOLE
// ========================================
// Open http://localhost:5175/editor-demo.html
// Open browser DevTools (F12)
// Paste this entire script into Console and press Enter
// ========================================

(async () => {
    console.log('\n=== BLUR BEHAVIOR INVESTIGATION TEST ===\n');

    // Wait for editor
    const editor = document.querySelector('wui-editor');
    if (!editor) {
        console.error('❌ Editor not found! Make sure you\'re on editor-demo.html');
        return;
    }

    // Wait for shadow DOM
    console.log('Waiting for editor initialization...');
    await new Promise(resolve => {
        const check = () => {
            if (editor.shadowRoot?.querySelector('[data-editor-root]')) {
                console.log('✓ Editor shadow DOM ready\n');
                resolve();
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });

    const shadow = editor.shadowRoot;
    const editable = shadow.querySelector('[data-editor-root]');
    const toolbar = shadow.querySelector('.editor-toolbar');

    if (!editable || !toolbar) {
        console.error('❌ Could not find editable area or toolbar');
        return;
    }

    // Set up event monitoring
    const events = [];
    let testId = 0;

    const logEvent = (event, location, details = '') => {
        const sel = window.getSelection();
        const entry = {
            id: ++testId,
            time: new Date().toISOString().substr(11, 12),
            event: event.toUpperCase(),
            location,
            selection: sel.toString() || '(none)',
            activeElement: document.activeElement.tagName,
            details
        };
        events.push(entry);

        const color = event === 'blur' ? 'color: #f44; font-weight: bold' :
                      event === 'focus' ? 'color: #4f4' :
                      event === 'selectionchange' ? 'color: #44f' :
                      'color: #888';

        console.log(`%c[${entry.time}] ${entry.event.padEnd(15)} @ ${location.padEnd(12)} | Sel: "${entry.selection.padEnd(10)}" | Active: ${entry.activeElement} ${details}`, color);
    };

    // Monitor editable root
    ['blur', 'focus', 'focusin', 'focusout', 'mousedown', 'mouseup', 'click'].forEach(eventType => {
        editable.addEventListener(eventType, (e) => {
            logEvent(eventType, 'editable-root', `target: ${e.target.tagName}`);
        }, true);
    });

    // Monitor toolbar
    ['mousedown', 'click'].forEach(eventType => {
        toolbar.addEventListener(eventType, (e) => {
            const btn = e.target.closest('button');
            const name = btn?.getAttribute('title') || e.target.tagName;
            logEvent(eventType, 'toolbar', `target: ${name}`);
        }, true);
    });

    // Monitor selection changes
    document.addEventListener('selectionchange', () => {
        const sel = window.getSelection();
        if (sel.toString()) {
            logEvent('selectionchange', 'document', `text: "${sel.toString()}"`);
        }
    });

    console.log('✓ Event monitors attached\n');
    console.log('--- TEST 1: Create Selection ---\n');

    // Create test selection
    const firstP = editable.querySelector('p');
    if (firstP?.firstChild) {
        const range = document.createRange();
        range.setStart(firstP.firstChild, 0);
        range.setEnd(firstP.firstChild, 7);

        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        console.log(`✓ Selection created: "${sel.toString()}"\n`);
    }

    await new Promise(r => setTimeout(r, 200));

    console.log('--- TEST 2: Find and Click Bold Button ---\n');

    // Find bold button
    const buttons = toolbar.querySelectorAll('button');
    const boldBtn = Array.from(buttons).find(btn => btn.getAttribute('title')?.includes('Bold'));

    if (!boldBtn) {
        console.error('❌ Bold button not found');
        return;
    }

    console.log(`✓ Found bold button: "${boldBtn.getAttribute('title')}"`);
    console.log(`  Button has onMouseDown preventDefault: ${boldBtn.hasAttribute('onmousedown') ? 'yes' : 'no (in React/Woby)'}\n`);

    // Simulate human-like click
    console.log('Step 1: Dispatching mousedown...');
    boldBtn.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
    }));

    const selAfterMouseDown = window.getSelection();
    console.log(`  Selection after mousedown: "${selAfterMouseDown.toString()}"`);
    console.log(`  Active element: ${document.activeElement.tagName}\n`);

    await new Promise(r => setTimeout(r, 50));

    console.log('Step 2: Dispatching click...');
    boldBtn.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    }));

    const selAfterClick = window.getSelection();
    console.log(`  Selection after click: "${selAfterClick.toString()}"`);
    console.log(`  Active element: ${document.activeElement.tagName}\n`);

    await new Promise(r => setTimeout(r, 200));

    // Check results
    console.log('--- TEST 3: Results ---\n');

    const finalSel = window.getSelection();
    const preserved = finalSel.toString() === 'Welcome';

    console.log(`Selection preserved: ${preserved ? '✅ YES' : '❌ NO'}`);
    console.log(`Final selection: "${finalSel.toString()}"`);
    console.log(`Final active element: ${document.activeElement.tagName}\n`);

    // Check for blur events
    const blurEvents = events.filter(e => e.event === 'BLUR');
    if (blurEvents.length > 0) {
        console.log('%c⚠️ BLUR EVENTS DETECTED! ⚠️', 'color: #f44; font-weight: bold; font-size: 14px');
        console.log('This is the problem causing selection loss:\n');
        blurEvents.forEach(e => {
            console.log(`  [${e.time}] BLUR @ ${e.location}`);
            console.log(`    Selection before blur: "${e.selection}"`);
            console.log(`    Active element: ${e.activeElement}\n`);
        });
    } else {
        console.log('%c✅ NO BLUR EVENTS - Selection preserved correctly!', 'color: #4f4; font-weight: bold');
    }

    // Check HTML structure
    console.log('\n--- TEST 4: HTML Structure ---\n');
    const firstPAfter = editable.querySelector('p');
    console.log(`HTML after bold: ${firstPAfter?.innerHTML?.substr(0, 80)}...`);
    console.log(`Has bold styling: ${firstPAfter?.innerHTML?.includes('font-weight: bold') ? '✅ yes' : '❌ no'}\n`);

    // Summary
    console.log('=== SUMMARY ===\n');
    console.log(`Total events captured: ${events.length}`);
    console.log(`Blur events: ${blurEvents.length}`);
    console.log(`Selection preserved: ${preserved ? 'YES ✅' : 'NO ❌'}`);
    console.log(`\nFull event log saved to: window.blurTestEvents`);
    window.blurTestEvents = events;

    return {
        success: preserved && blurEvents.length === 0,
        selectionPreserved: preserved,
        hadBlurEvents: blurEvents.length > 0,
        events
    };
})();

// BLUR BEHAVIOR TEST - Run in agent-browser

(async () => {
    console.log('\n=== BLUR BEHAVIOR TEST ===\n');

    const editor = document.querySelector('wui-editor');
    if (!editor) {
        return { error: 'Editor not found' };
    }

    // Wait for shadow DOM
    await new Promise(resolve => {
        const check = () => {
            if (editor.shadowRoot?.querySelector('[data-editor-root]')) {
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
        return { error: 'Shadow DOM not ready' };
    }

    console.log('✓ Editor ready');

    // Monitor events
    const events = [];
    const logEvent = (event, location, details = '') => {
        const sel = window.getSelection();
        const entry = {
            time: new Date().toISOString().substr(11, 12),
            event: event.toUpperCase(),
            location,
            selection: sel.toString() || '(none)',
            active: document.activeElement.tagName,
            details
        };
        events.push(entry);
        console.log(`[${entry.time}] ${entry.event} @ ${location} | Sel: "${entry.selection}" | Active: ${entry.active}`);
    };

    // Monitor editable root
    ['blur', 'focus', 'mousedown', 'click'].forEach(eventType => {
        editable.addEventListener(eventType, (e) => {
            logEvent(eventType, 'editable', e.target.tagName);
        }, true);
    });

    // Monitor toolbar
    ['mousedown', 'click'].forEach(eventType => {
        toolbar.addEventListener(eventType, (e) => {
            logEvent(eventType, 'toolbar', e.target.tagName);
        }, true);
    });

    // Create selection
    console.log('\n--- Creating Selection ---');
    const firstP = editable.querySelector('p');
    if (firstP?.firstChild) {
        const range = document.createRange();
        range.setStart(firstP.firstChild, 0);
        range.setEnd(firstP.firstChild, 7);

        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        console.log(`Selection: "${sel.toString()}"`);
    }

    await new Promise(r => setTimeout(r, 200));

    // Click bold button
    console.log('\n--- Clicking Bold Button ---');
    const buttons = toolbar.querySelectorAll('button');
    const boldBtn = Array.from(buttons).find(btn => btn.getAttribute('title')?.includes('Bold'));

    if (!boldBtn) {
        return { error: 'Bold button not found' };
    }

    console.log(`Found: "${boldBtn.getAttribute('title')}"`);

    // Mousedown
    boldBtn.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
    }));

    console.log(`After mousedown: "${window.getSelection().toString()}"`);

    await new Promise(r => setTimeout(r, 50));

    // Click
    boldBtn.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    }));

    console.log(`After click: "${window.getSelection().toString()}"`);

    await new Promise(r => setTimeout(r, 200));

    // Results
    console.log('\n--- RESULTS ---');

    const finalSel = window.getSelection();
    const preserved = finalSel.toString() === 'Welcome';

    console.log(`Selection preserved: ${preserved ? 'YES' : 'NO'}`);
    console.log(`Final selection: "${finalSel.toString()}"`);

    const blurEvents = events.filter(e => e.event === 'BLUR');
    if (blurEvents.length > 0) {
        console.log('⚠️ BLUR EVENTS DETECTED!');
        blurEvents.forEach(e => {
            console.log(`  [${e.time}] BLUR | Selection: "${e.selection}" | Active: ${e.active}`);
        });
    } else {
        console.log('✅ NO BLUR EVENTS');
    }

    return {
        preserved,
        hadBlur: blurEvents.length > 0,
        blurCount: blurEvents.length,
        eventCount: events.length,
        events
    };
})();
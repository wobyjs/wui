# Blur Behavior Test Instructions

## Quick Test (Copy-Paste into Browser Console)

1. Open your browser to the editor demo page (whatever port your dev server is on)
2. Open DevTools (F12) → Console tab
3. Copy and paste this entire script:

```javascript
(async () => {
    console.log('\n=== BLUR BEHAVIOR TEST ===\n');

    const editor = document.querySelector('wui-editor');
    if (!editor) {
        console.error('❌ Editor not found!');
        return;
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

    console.log('✓ Editor ready\n');

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

        const color = event === 'blur' ? 'color: #f44; font-weight: bold' :
                      event === 'focus' ? 'color: #4f4' : 'color: #888';

        console.log(`%c[${entry.time}] ${entry.event.padEnd(15)} | Sel: "${entry.selection.padEnd(10)}" | Active: ${entry.active}`, color);
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

    // Test selection
    console.log('--- Creating Selection ---');
    const firstP = editable.querySelector('p');
    if (firstP?.firstChild) {
        const range = document.createRange();
        range.setStart(firstP.firstChild, 0);
        range.setEnd(firstP.firstChild, 7);

        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        console.log(`Selection: "${sel.toString()}"\n`);
    }

    await new Promise(r => setTimeout(r, 200));

    // Click bold button
    console.log('--- Clicking Bold Button ---');
    const buttons = toolbar.querySelectorAll('button');
    const boldBtn = Array.from(buttons).find(btn => btn.getAttribute('title')?.includes('Bold'));

    if (!boldBtn) {
        console.error('❌ Bold button not found');
        return;
    }

    console.log(`Found: "${boldBtn.getAttribute('title')}"\n`);

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

    console.log(`After click: "${window.getSelection().toString()}"\n`);

    await new Promise(r => setTimeout(r, 200));

    // Results
    console.log('--- RESULTS ---\n');

    const finalSel = window.getSelection();
    const preserved = finalSel.toString() === 'Welcome';

    console.log(`Selection preserved: ${preserved ? '✅ YES' : '❌ NO'}`);
    console.log(`Final selection: "${finalSel.toString()}"\n`);

    const blurEvents = events.filter(e => e.event === 'BLUR');
    if (blurEvents.length > 0) {
        console.log('%c⚠️ BLUR EVENTS DETECTED!', 'color: #f44; font-weight: bold; font-size: 14px');
        console.log('This is causing selection loss:\n');
        blurEvents.forEach(e => {
            console.log(`  [${e.time}] BLUR | Selection: "${e.selection}" | Active: ${e.active}`);
        });
    } else {
        console.log('%c✅ NO BLUR EVENTS - Working correctly!', 'color: #4f4; font-weight: bold');
    }

    window.blurTestEvents = events;
    return { preserved, hadBlur: blurEvents.length > 0, events };
})();
```

## What to Look For

### ✅ SUCCESS:
```
✅ NO BLUR EVENTS - Working correctly!
Selection preserved: YES ✅
```

### ❌ PROBLEM:
```
⚠️ BLUR EVENTS DETECTED!
This is causing selection loss:

[timestamp] BLUR | Selection: "Welcome" | Active: BUTTON
```

## Code Analysis Summary

I've verified the code:

1. ✅ **handleBlur is DISABLED** (Editor.tsx:513 has early return)
2. ✅ **All buttons have mousedown preventDefault** (prevents focus loss)
3. ✅ **Selection save/restore implemented** (Editor.tsx:138-218)

So theoretically, blur events should NOT happen.

## Next Step

**Run the test script above and tell me what you see.** This will definitively show if blur events are happening in your environment.

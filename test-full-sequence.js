#!/usr/bin/env node
/**
 * Test: Full sequence as described by user
 * 1. caret in "Welcome", click bullet
 * 2. caret in "toolbar", click number
 * 3. caret in "Select", click checkbox
 * 4. partial/cross select "me to the WUI...Select t"
 * 5. click bullet, then bullet again, then click indent
 * 6. Verify bullet is NOT missing
 */

const WebSocket = require('ws');

const PAGE_ID = 'E2CC471D328E5E70CC022C00FF5A6655';
const WS_URL = `ws://localhost:9231/devtools/page/${PAGE_ID}`;

let messageId = 1;

function sendCommand(ws, method, params = {}) {
    return new Promise((resolve, reject) => {
        const id = messageId++;
        ws.send(JSON.stringify({ id, method, params }));

        const handler = (data) => {
            try {
                const msg = JSON.parse(data.toString());
                if (msg.id === id) {
                    ws.off('message', handler);
                    if (msg.error) reject(msg.error);
                    else resolve(msg.result);
                }
            } catch (e) {}
        };
        ws.on('message', handler);
        setTimeout(() => { ws.off('message', handler); reject(new Error('Timeout')); }, 15000);
    });
}

async function runTest() {
    const ws = new WebSocket(WS_URL);

    ws.on('open', async () => {
        console.log('Connected to Chrome DevTools');
        await sendCommand(ws, 'Runtime.enable');
        await sendCommand(ws, 'Page.enable');

        // Setup console listener
        ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data.toString());
                if (msg.method === 'Runtime.consoleAPICalled') {
                    const args = msg.params.args.map(a => a.value || a.description || '').join(' ');
                    console.log(`[BROWSER] ${args}`);
                }
            } catch (e) {}
        });

        // Reload page
        console.log('\n=== Reloading page ===');
        await sendCommand(ws, 'Page.reload');
        await new Promise(r => setTimeout(r, 3000));

        // Step 1: caret in "Welcome", click bullet
        console.log('\n=== Step 1: caret in "Welcome", click bullet ===');
        await setCaretInText(ws, 'Welcome');
        await clickButton(ws, 'bullet');
        await new Promise(r => setTimeout(r, 500));
        let html = await getHTML(ws);
        console.log('After step 1:', html.substring(0, 200));

        // Step 2: caret in "toolbar", click number
        console.log('\n=== Step 2: caret in "toolbar", click number ===');
        await setCaretInText(ws, 'toolbar');
        await clickButton(ws, 'number');
        await new Promise(r => setTimeout(r, 500));
        html = await getHTML(ws);
        console.log('After step 2:', html.substring(0, 200));

        // Step 3: caret in "Select", click checkbox
        console.log('\n=== Step 3: caret in "Select", click checkbox ===');
        await setCaretInText(ws, 'Select');
        await clickButton(ws, 'checkbox');
        await new Promise(r => setTimeout(r, 500));
        html = await getHTML(ws);
        console.log('After step 3:', html.substring(0, 300));

        // Step 4: partial/cross select specific text
        console.log('\n=== Step 4: partial/cross select text ===');
        await createSpecificSelection(ws);
        html = await getHTML(ws);
        console.log('Before bullet clicks:', html.substring(0, 200));

        // Step 5a: click bullet (first time)
        console.log('\n=== Step 5a: click bullet (first time) ===');
        await clickButton(ws, 'bullet');
        await new Promise(r => setTimeout(r, 500));
        html = await getHTML(ws);
        console.log('After bullet 1:', html.substring(0, 300));

        // Step 5b: click bullet again (second time)
        console.log('\n=== Step 5b: click bullet again (second time) ===');
        await createSpecificSelection(ws);
        await clickButton(ws, 'bullet');
        await new Promise(r => setTimeout(r, 500));
        html = await getHTML(ws);
        console.log('After bullet 2:', html.substring(0, 300));

        // Step 5c: click indent
        console.log('\n=== Step 5c: click indent ===');
        await createSpecificSelection(ws);
        await clickIndent(ws);
        await new Promise(r => setTimeout(r, 500));
        html = await getHTML(ws);
        console.log('After indent:', html.substring(0, 400));

        // Verify bullet markers are NOT missing
        const checkResult = await sendCommand(ws, 'Runtime.evaluate', {
            expression: `
            (function() {
                const editor = document.querySelector('wui-editor');
                const shadow = editor.shadowRoot;
                const contentEditable = shadow.querySelector('[contenteditable]');

                const uls = shadow.querySelectorAll('ul');
                const ols = shadow.querySelectorAll('ol');
                const lis = shadow.querySelectorAll('li');
                const bulletMarkers = shadow.querySelectorAll('ul.list-disc, ul.list-inside');

                // Check if any UL has list-disc class
                let hasBulletClass = false;
                uls.forEach(ul => {
                    if (ul.classList.contains('list-disc')) hasBulletClass = true;
                });

                return {
                    ulCount: uls.length,
                    olCount: ols.length,
                    liCount: lis.length,
                    hasBulletClass: hasBulletClass,
                    fullHTML: contentEditable.innerHTML
                };
            })()
            `,
            returnByValue: true
        });

        console.log('\n=== FINAL VERIFICATION ===');
        console.log('UL count:', checkResult.result.value.ulCount);
        console.log('OL count:', checkResult.result.value.olCount);
        console.log('LI count:', checkResult.result.value.liCount);
        console.log('Has bullet class:', checkResult.result.value.hasBulletClass);
        console.log('\nFull HTML:');
        console.log(checkResult.result.value.fullHTML);

        if (!checkResult.result.value.hasBulletClass && checkResult.result.value.ulCount > 0) {
            console.log('\n❌ FAIL: Bullet markers missing!');
        } else {
            console.log('\n✅ PASS: Bullet markers present');
        }

        ws.close();
        process.exit(0);
    });
}

async function getHTML(ws) {
    const result = await sendCommand(ws, 'Runtime.evaluate', {
        expression: `
        (function() {
            const editor = document.querySelector('wui-editor');
            const shadow = editor.shadowRoot;
            const contentEditable = shadow.querySelector('[contenteditable]');
            return contentEditable.innerHTML;
        })()
        `,
        returnByValue: true
    });
    return result.result.value;
}

async function setCaretInText(ws, searchText) {
    const result = await sendCommand(ws, 'Runtime.evaluate', {
        expression: `
        (function() {
            const editor = document.querySelector('wui-editor');
            const shadow = editor.shadowRoot;
            const contentEditable = shadow.querySelector('[contenteditable]');

            const textNodes = [];
            const walker = document.createTreeWalker(contentEditable, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                textNodes.push(walker.currentNode);
            }

            for (const node of textNodes) {
                const text = node.textContent;
                const idx = text.indexOf('${searchText}');
                if (idx !== -1) {
                    const sel = shadow.getSelection();
                    const range = document.createRange();
                    range.setStart(node, idx + Math.floor('${searchText}'.length / 2));
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    return { found: true, caretAt: '${searchText}' };
                }
            }
            return { found: false };
        })()
        `,
        returnByValue: true
    });
    console.log('Caret result:', result.result.value);
}

async function createSpecificSelection(ws) {
    // Select "me to the WUI Rich Text Editor!\nThis is a full toolbar demo for testing Phase 18 fixes.\nSelect t"
    const result = await sendCommand(ws, 'Runtime.evaluate', {
        expression: `
        (function() {
            const editor = document.querySelector('wui-editor');
            const shadow = editor.shadowRoot;
            const contentEditable = shadow.querySelector('[contenteditable]');

            const textNodes = [];
            const walker = document.createTreeWalker(contentEditable, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                textNodes.push(walker.currentNode);
            }

            let startNode = null, startOffset = 0;
            let endNode = null, endOffset = 0;

            // Find "me to the WUI" for start
            for (const node of textNodes) {
                const text = node.textContent;
                const idx = text.indexOf('me to the WUI');
                if (idx !== -1) {
                    startNode = node;
                    startOffset = idx;
                    break;
                }
            }

            // Find "Select t" for end
            for (const node of textNodes) {
                const text = node.textContent;
                const idx = text.indexOf('Select t');
                if (idx !== -1) {
                    endNode = node;
                    endOffset = idx + 'Select t'.length;
                    break;
                }
            }

            if (!startNode || !endNode) {
                return { error: 'Markers not found' };
            }

            const sel = shadow.getSelection();
            const range = document.createRange();
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);
            sel.removeAllRanges();
            sel.addRange(range);

            return { selected: sel.toString() };
        })()
        `,
        returnByValue: true
    });
    console.log('Selection:', result.result.value.selected?.substring(0, 50));
}

async function clickButton(ws, listType) {
    await sendCommand(ws, 'Runtime.evaluate', {
        expression: `
        (function() {
            const editor = document.querySelector('wui-editor');
            const shadow = editor.shadowRoot;

            const buttons = shadow.querySelectorAll('button');
            let targetBtn = null;
            const listTypeLower = '${listType}'.toLowerCase();

            for (const btn of buttons) {
                const title = (btn.getAttribute('title') || '').toLowerCase();
                if (listTypeLower === 'bullet' && title.includes('bullet')) { targetBtn = btn; break; }
                if (listTypeLower === 'number' && (title.includes('number') || title.includes('ordered'))) { targetBtn = btn; break; }
                if (listTypeLower === 'checkbox' && title.includes('check')) { targetBtn = btn; break; }
            }

            if (!targetBtn) return { error: 'Button not found' };

            targetBtn.click();
            return { clicked: true, title: targetBtn.getAttribute('title') };
        })()
        `,
        returnByValue: true
    });
}

async function clickIndent(ws) {
    const result = await sendCommand(ws, 'Runtime.evaluate', {
        expression: `
        (function() {
            const editor = document.querySelector('wui-editor');
            const shadow = editor.shadowRoot;

            const buttons = shadow.querySelectorAll('button');
            let targetBtn = null;

            for (const btn of buttons) {
                const title = (btn.getAttribute('title') || '').toLowerCase();
                if ((title.includes('indent') || title.includes('indentation')) &&
                    !title.includes('decrease') && !title.includes('outdent')) {
                    targetBtn = btn;
                    break;
                }
            }

            if (!targetBtn) return { error: 'Indent button not found' };

            targetBtn.click();
            return { clicked: true, title: targetBtn.getAttribute('title') };
        })()
        `,
        returnByValue: true
    });
    console.log('Indent result:', result.result.value);
}

runTest().catch(console.error);
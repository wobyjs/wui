#!/usr/bin/env node
/**
 * Test: Cross select -> bullet -> number -> checkbox -> indent
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
        setTimeout(() => { ws.off('message', handler); reject(new Error('Timeout')); }, 10000);
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

        // Step 1: Create cross-selection
        console.log('\n=== Step 1: Create cross-selection ===');
        await createCrossSelection(ws);

        // Step 2: Click bullet
        console.log('\n=== Step 2: Click bullet ===');
        await clickButton(ws, 'bullet');
        await new Promise(r => setTimeout(r, 800));
        let html = await getHTML(ws);
        console.log('After bullet:', html.substring(0, 200));

        // Step 3: Click number
        console.log('\n=== Step 3: Click number ===');
        await createCrossSelection(ws);
        await clickButton(ws, 'number');
        await new Promise(r => setTimeout(r, 800));
        html = await getHTML(ws);
        console.log('After number:', html.substring(0, 200));

        // Step 4: Click checkbox
        console.log('\n=== Step 4: Click checkbox ===');
        await createCrossSelection(ws);
        await clickButton(ws, 'checkbox');
        await new Promise(r => setTimeout(r, 800));
        html = await getHTML(ws);
        console.log('After checkbox:', html.substring(0, 300));

        // Step 5: Click indent
        console.log('\n=== Step 5: Click indent ===');
        await createCrossSelection(ws);
        await clickIndent(ws);
        await new Promise(r => setTimeout(r, 800));
        html = await getHTML(ws);
        console.log('After indent:', html.substring(0, 400));

        // Check for checkbox inputs after indent
        const checkResult = await sendCommand(ws, 'Runtime.evaluate', {
            expression: `
            (function() {
                const editor = document.querySelector('wui-editor');
                const shadow = editor.shadowRoot;

                const checkboxes = shadow.querySelectorAll('input[type="checkbox"]');
                const checkboxWrappers = shadow.querySelectorAll('.checklist-item-wrapper');
                const nestedLists = shadow.querySelectorAll('ul ul, ol ul, ul ol, ol ol');

                return {
                    checkboxCount: checkboxes.length,
                    wrapperCount: checkboxWrappers.length,
                    nestedListCount: nestedLists.length,
                    fullHTML: shadow.querySelector('[contenteditable]').innerHTML
                };
            })()
            `,
            returnByValue: true
        });

        console.log('\n=== INDENT VERIFICATION ===');
        console.log('checkboxCount:', checkResult.result.value.checkboxCount);
        console.log('wrapperCount:', checkResult.result.value.wrapperCount);
        console.log('nestedListCount:', checkResult.result.value.nestedListCount);
        console.log('\nFull HTML:');
        console.log(checkResult.result.value.fullHTML);

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

async function createCrossSelection(ws) {
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

            for (const node of textNodes) {
                const text = node.textContent;
                const idx = text.indexOf('ome to the WUI');
                if (idx !== -1) { startNode = node; startOffset = idx; break; }
            }

            for (const node of textNodes) {
                const text = node.textContent;
                const idx = text.indexOf('Sele');
                if (idx !== -1) { endNode = node; endOffset = idx + 'Sele'.length; break; }
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

    console.log('Selection:', result.result.value.selected);
}

async function clickButton(ws, listType) {
    const result = await sendCommand(ws, 'Runtime.evaluate', {
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
            return { clicked: true };
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

            // Find "Increase Indent" button (not "Decrease Indent")
            for (const btn of buttons) {
                const title = (btn.getAttribute('title') || '').toLowerCase();
                // Match "Increase Indent" or just "Indent" but not "Decrease" or "Outdent"
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
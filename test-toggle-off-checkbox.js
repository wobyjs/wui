#!/usr/bin/env node
/**
 * Test: Toggle off checkbox - verify checkbox wrapper is removed
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

        // Step 1: Create checkbox list first
        console.log('\n=== Step 1: Create checkbox list ===');
        await createCrossSelection(ws);
        await clickButton(ws, 'checkbox');
        await new Promise(r => setTimeout(r, 800));
        let html = await getHTML(ws);
        console.log('After checkbox creation:', html.substring(0, 200));

        // Step 2: Toggle OFF checkbox
        console.log('\n=== Step 2: Toggle OFF checkbox ===');
        await createCrossSelection(ws);
        await clickButton(ws, 'checkbox');
        await new Promise(r => setTimeout(r, 800));
        html = await getHTML(ws);
        console.log('After toggle OFF:', html.substring(0, 200));

        // Check for checkbox inputs
        const checkResult = await sendCommand(ws, 'Runtime.evaluate', {
            expression: `
            (function() {
                const editor = document.querySelector('wui-editor');
                const shadow = editor.shadowRoot;

                const checkboxes = shadow.querySelectorAll('input[type="checkbox"]');
                const checkboxWrappers = shadow.querySelectorAll('.checklist-item-wrapper');
                const paragraphs = shadow.querySelectorAll('p');

                return {
                    checkboxCount: checkboxes.length,
                    wrapperCount: checkboxWrappers.length,
                    paragraphCount: paragraphs.length,
                    firstPHTML: paragraphs[0]?.outerHTML?.substring(0, 150) || 'not found'
                };
            })()
            `,
            returnByValue: true
        });

        console.log('\n=== TOGGLE OFF VERIFICATION ===');
        console.log(JSON.stringify(checkResult.result.value, null, 2));

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

runTest().catch(console.error);
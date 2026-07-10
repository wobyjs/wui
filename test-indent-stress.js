#!/usr/bin/env node
/**
 * Test: Apply indent and outdent 10 times each to verify formatting
 */

const WebSocket = require('ws');

const PAGE_ID = '788F76495623B0CBC7921D904073A463';
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

        // Helper to create selection
        const createSelection = async () => {
            const result = await sendCommand(ws, 'Runtime.evaluate', {
                expression: `
                (function() {
                    const editor = document.querySelector('wui-editor');
                    const shadow = editor.shadowRoot;
                    const contentEditable = shadow.querySelector('[contenteditable]');
                    const textNodes = [];
                    const walker = document.createTreeWalker(contentEditable, NodeFilter.SHOW_TEXT);
                    while (walker.nextNode()) textNodes.push(walker.currentNode);

                    let startNode = null, startOffset = 0;
                    let endNode = null, endOffset = 0;

                    for (const node of textNodes) {
                        const idx = node.textContent.indexOf('come to the WUI');
                        if (idx !== -1) { startNode = node; startOffset = idx; break; }
                    }

                    for (const node of textNodes) {
                        const idx = node.textContent.indexOf('Select te');
                        if (idx !== -1) { endNode = node; endOffset = idx + 9; break; }
                    }

                    if (!startNode || !endNode) return { error: 'Markers not found' };

                    const sel = shadow.getSelection();
                    const range = document.createRange();
                    range.setStart(startNode, startOffset);
                    range.setEnd(endNode, endOffset);
                    sel.removeAllRanges();
                    sel.addRange(range);

                    return { ok: true };
                })()
                `,
                returnByValue: true
            });
            return result.result.value;
        };

        // Helper to click button
        const clickButton = async (type) => {
            const result = await sendCommand(ws, 'Runtime.evaluate', {
                expression: `
                (function() {
                    const editor = document.querySelector('wui-editor');
                    const shadow = editor.shadowRoot;
                    const buttons = shadow.querySelectorAll('button');
                    const typeLower = '${type}'.toLowerCase();

                    for (const btn of buttons) {
                        const title = (btn.getAttribute('title') || '').toLowerCase();
                        if (typeLower === 'indent' &&
                            (title.includes('indent') || title.includes('indentation')) &&
                            !title.includes('decrease') && !title.includes('outdent')) {
                            btn.click();
                            return { clicked: 'indent' };
                        }
                        if (typeLower === 'outdent' &&
                            (title.includes('decrease') || title.includes('outdent'))) {
                            btn.click();
                            return { clicked: 'outdent' };
                        }
                    }
                    return { error: 'Button not found' };
                })()
                `,
                returnByValue: true
            });
            return result.result.value;
        };

        // Helper to get LI styles
        const getLIStyles = async () => {
            const result = await sendCommand(ws, 'Runtime.evaluate', {
                expression: `
                (function() {
                    const editor = document.querySelector('wui-editor');
                    const shadow = editor.shadowRoot;
                    const lis = shadow.querySelectorAll('li');

                    const results = [];
                    lis.forEach((li, i) => {
                        results.push({
                            index: i,
                            marginLeft: li.style.marginLeft || '0px',
                            text: li.textContent.substring(0, 30)
                        });
                    });

                    return {
                        liCount: lis.length,
                        styles: results
                    };
                })()
                `,
                returnByValue: true
            });
            return result.result.value;
        };

        // Initial state
        console.log('\n=== Initial State ===');
        let state = await getLIStyles();
        console.log('LI count:', state.liCount);
        console.log('Styles:', JSON.stringify(state.styles, null, 2));

        // Apply indent 10 times
        console.log('\n=== Applying INDENT 10 times ===');
        for (let i = 1; i <= 10; i++) {
            await createSelection();
            await clickButton('indent');
            await new Promise(r => setTimeout(r, 100));
        }

        state = await getLIStyles();
        console.log('After 10 indents:');
        console.log(JSON.stringify(state.styles, null, 2));

        // Apply outdent 10 times
        console.log('\n=== Applying OUTDENT 10 times ===');
        for (let i = 1; i <= 10; i++) {
            await createSelection();
            await clickButton('outdent');
            await new Promise(r => setTimeout(r, 100));
        }

        state = await getLIStyles();
        console.log('After 10 outdents:');
        console.log(JSON.stringify(state.styles, null, 2));

        // Apply indent/outdent alternating 5 times each
        console.log('\n=== Alternating INDENT/OUTDENT 5 times each ===');
        for (let i = 1; i <= 5; i++) {
            await createSelection();
            await clickButton('indent');
            await new Promise(r => setTimeout(r, 100));

            await createSelection();
            await clickButton('outdent');
            await new Promise(r => setTimeout(r, 100));

            state = await getLIStyles();
            console.log(`Cycle ${i}:`, state.styles.map(s => s.marginLeft).join(', '));
        }

        // Final state
        console.log('\n=== Final State ===');
        state = await getLIStyles();
        console.log('LI count:', state.liCount);
        console.log('Styles:', JSON.stringify(state.styles, null, 2));

        // Check checkboxes still exist
        const checkboxCheck = await sendCommand(ws, 'Runtime.evaluate', {
            expression: `
            (function() {
                const editor = document.querySelector('wui-editor');
                const shadow = editor.shadowRoot;
                return {
                    checkboxes: shadow.querySelectorAll('input[type="checkbox"]').length,
                    wrappers: shadow.querySelectorAll('.checklist-item-wrapper').length
                };
            })()
            `,
            returnByValue: true
        });
        console.log('Checkboxes:', checkboxCheck.result.value.checkboxes);
        console.log('Wrappers:', checkboxCheck.result.value.wrappers);

        ws.close();
        process.exit(0);
    });
}

runTest().catch(console.error);

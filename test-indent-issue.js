#!/usr/bin/env node
/**
 * Test: Cross-select then click bullet -> number -> checkbox -> bullet -> number -> checkbox -> indent
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

        // Step 0: Create initial selection
        console.log('\n=== Step 0: Create cross-selection ===');
        await createSelection(ws);

        // Step 1: Click bullet
        console.log('\n=== Step 1: Click bullet ===');
        await clickButton(ws, 'bullet');
        await new Promise(r => setTimeout(r, 500));
        let html = await getHTML(ws);
        console.log('After bullet:', html.substring(0, 200));

        // Step 2: Click number
        console.log('\n=== Step 2: Click number ===');
        await createSelection(ws);
        await clickButton(ws, 'number');
        await new Promise(r => setTimeout(r, 500));
        html = await getHTML(ws);
        console.log('After number:', html.substring(0, 200));

        // Step 3: Click checkbox
        console.log('\n=== Step 3: Click checkbox ===');
        await createSelection(ws);
        await clickButton(ws, 'checkbox');
        await new Promise(r => setTimeout(r, 500));
        html = await getHTML(ws);
        console.log('After checkbox:', html.substring(0, 200));

        // Step 4: Click bullet
        console.log('\n=== Step 4: Click bullet ===');
        await createSelection(ws);
        await clickButton(ws, 'bullet');
        await new Promise(r => setTimeout(r, 500));
        html = await getHTML(ws);
        console.log('After bullet:', html.substring(0, 200));

        // Step 5: Click number
        console.log('\n=== Step 5: Click number ===');
        await createSelection(ws);
        await clickButton(ws, 'number');
        await new Promise(r => setTimeout(r, 500));
        html = await getHTML(ws);
        console.log('After number:', html.substring(0, 200));

        // Step 6: Click checkbox
        console.log('\n=== Step 6: Click checkbox ===');
        await createSelection(ws);
        await clickButton(ws, 'checkbox');
        await new Promise(r => setTimeout(r, 500));
        html = await getHTML(ws);
        console.log('After checkbox:', html.substring(0, 200));

        // Step 7: Click indent
        console.log('\n=== Step 7: Click indent ===');
        await createSelection(ws);
        await clickIndent(ws);
        await new Promise(r => setTimeout(r, 500));
        html = await getHTML(ws);
        console.log('After indent:', html.substring(0, 400));

        // Verify final state
        const checkResult = await sendCommand(ws, 'Runtime.evaluate', {
            expression: `
            (function() {
                const editor = document.querySelector('wui-editor');
                const shadow = editor.shadowRoot;
                const contentEditable = shadow.querySelector('[contenteditable]');

                const uls = shadow.querySelectorAll('ul');
                const ols = shadow.querySelectorAll('ol');
                const lis = shadow.querySelectorAll('li');
                const checkboxes = shadow.querySelectorAll('input[type="checkbox"]');

                // Check list classes
                let listInfo = [];
                uls.forEach(ul => {
                    listInfo.push({
                        tag: 'UL',
                        id: ul.id,
                        classes: ul.className,
                        liCount: ul.querySelectorAll('li').length
                    });
                });
                ols.forEach(ol => {
                    listInfo.push({
                        tag: 'OL',
                        id: ol.id,
                        classes: ol.className,
                        liCount: ol.querySelectorAll('li').length
                    });
                });

                return {
                    ulCount: uls.length,
                    olCount: ols.length,
                    liCount: lis.length,
                    checkboxCount: checkboxes.length,
                    lists: listInfo,
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
        console.log('Checkbox count:', checkResult.result.value.checkboxCount);
        console.log('Lists:', JSON.stringify(checkResult.result.value.lists, null, 2));
        console.log('\nFull HTML:');
        console.log(checkResult.result.value.fullHTML);

        // Check if indent worked
        const hasIndent = checkResult.result.value.fullHTML.includes('margin-left') ||
                          checkResult.result.value.fullHTML.includes('margin-20');
        console.log('\nIndent applied:', hasIndent ? 'YES' : 'NO');

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

async function createSelection(ws) {
    // Select "come to the WUI Rich Text Editor!\nThis is a full toolbar demo for testing Phase 18 fixes.\nSelect te"
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

            // Find "come to the WUI" for start
            for (const node of textNodes) {
                const text = node.textContent;
                const idx = text.indexOf('come to the WUI');
                if (idx !== -1) {
                    startNode = node;
                    startOffset = idx;
                    break;
                }
            }

            // Find "Select te" for end
            for (const node of textNodes) {
                const text = node.textContent;
                const idx = text.indexOf('Select te');
                if (idx !== -1) {
                    endNode = node;
                    endOffset = idx + 'Select te'.length;
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
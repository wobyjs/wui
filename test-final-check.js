#!/usr/bin/env node
/**
 * Test: Full sequence then check final HTML in detail
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

        // Setup console listener - show ALL logs
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

        // Create selection
        console.log('\n=== Create initial selection ===');
        await createSelection(ws);

        // Click bullet -> number -> checkbox -> bullet -> number -> checkbox
        const sequence = ['bullet', 'number', 'checkbox', 'bullet', 'number', 'checkbox'];
        for (let i = 0; i < sequence.length; i++) {
            console.log(`\n=== Step ${i + 1}: Click ${sequence[i]} ===`);
            await createSelection(ws);
            await clickButton(ws, sequence[i]);
            await new Promise(r => setTimeout(r, 500));
        }

        // Check state before indent
        console.log('\n=== Before indent ===');
        let html = await getHTML(ws);
        console.log('HTML (first 500 chars):', html.substring(0, 500));

        // Create selection for indent
        console.log('\n=== Creating selection for indent ===');
        await createSelection(ws);

        // Click indent
        console.log('\n=== Click indent ===');
        await clickIndent(ws);
        await new Promise(r => setTimeout(r, 500));

        // Check result
        html = await getHTML(ws);
        console.log('\n=== After indent - Full HTML ===');
        console.log(html);

        // Check specific LI styles
        const liStyles = await sendCommand(ws, 'Runtime.evaluate', {
            expression: `
            (function() {
                const editor = document.querySelector('wui-editor');
                const shadow = editor.shadowRoot;
                const lis = shadow.querySelectorAll('li');

                const results = [];
                lis.forEach((li, i) => {
                    results.push({
                        index: i,
                        marginLeft: li.style.marginLeft,
                        fullStyle: li.style.cssText,
                        text: li.textContent.substring(0, 30)
                    });
                });

                return results;
            })()
            `,
            returnByValue: true
        });

        console.log('\n=== LI Styles After Indent ===');
        console.log(JSON.stringify(liStyles.result.value, null, 2));

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
                return { error: 'Markers not found', startNode: !!startNode, endNode: !!endNode };
            }

            const sel = shadow.getSelection();
            const range = document.createRange();
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);
            sel.removeAllRanges();
            sel.addRange(range);

            return {
                selected: sel.toString(),
                selectedLength: sel.toString().length
            };
        })()
        `,
        returnByValue: true
    });
    console.log('Selection result:', JSON.stringify(result.result.value, null, 2));
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
    console.log('Indent click result:', JSON.stringify(result.result.value, null, 2));
}

runTest().catch(console.error);

#!/usr/bin/env node
/**
 * Stress test: Full sequence then indent/outdent cycles
 */

const WebSocket = require('ws');

// Get current page ID from dv status
const WS_URL = 'ws://localhost:9231/devtools/page/788F76495623B0CBC7921D904073A463';

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
        await sendCommand(ws, 'Runtime.enable');

        const createSel = async () => {
            await sendCommand(ws, 'Runtime.evaluate', {
                expression: `
                (function() {
                    const editor = document.querySelector('wui-editor');
                    const shadow = editor.shadowRoot;
                    const ce = shadow.querySelector('[contenteditable]');
                    const textNodes = [];
                    const walker = document.createTreeWalker(ce, NodeFilter.SHOW_TEXT);
                    while (walker.nextNode()) textNodes.push(walker.currentNode);

                    let sNode = null, sOff = 0, eNode = null, eOff = 0;
                    for (const n of textNodes) {
                        const i = n.textContent.indexOf('come to the WUI');
                        if (i !== -1) { sNode = n; sOff = i; break; }
                    }
                    for (const n of textNodes) {
                        const i = n.textContent.indexOf('Select te');
                        if (i !== -1) { eNode = n; eOff = i + 9; break; }
                    }
                    if (!sNode || !eNode) return { error: 'not found' };

                    const sel = shadow.getSelection();
                    const range = document.createRange();
                    range.setStart(sNode, sOff);
                    range.setEnd(eNode, eOff);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    return { ok: true };
                })()`,
                returnByValue: true
            });
        };

        const clickBtn = async (type) => {
            await sendCommand(ws, 'Runtime.evaluate', {
                expression: `
                (function() {
                    const editor = document.querySelector('wui-editor');
                    const shadow = editor.shadowRoot;
                    const buttons = shadow.querySelectorAll('button');
                    const t = '${type}'.toLowerCase();
                    for (const b of buttons) {
                        const title = (b.getAttribute('title') || '');
                        const titleLower = title.toLowerCase();
                        if (t === 'bullet' && titleLower.includes('bullet')) { b.click(); return 1; }
                        if (t === 'number' && titleLower.includes('number')) { b.click(); return 1; }
                        if (t === 'checkbox' && titleLower.includes('check')) { b.click(); return 1; }
                        if (t === 'indent' && title === 'Increase Indent') { b.click(); return 1; }
                        if (t === 'outdent' && title === 'Decrease Indent') { b.click(); return 1; }
                    }
                    return 0;
                })()`,
                returnByValue: true
            });
        };

        const getState = async () => {
            const result = await sendCommand(ws, 'Runtime.evaluate', {
                expression: `
                (function() {
                    const editor = document.querySelector('wui-editor');
                    const shadow = editor.shadowRoot;
                    const lis = shadow.querySelectorAll('li');
                    const cbs = shadow.querySelectorAll('input[type="checkbox"]');
                    return {
                        liCount: lis.length,
                        cbCount: cbs.length,
                        margins: Array.from(lis).map(li => ({
                            margin: li.style.marginLeft || 'none',
                            text: li.textContent.substring(0, 25)
                        }))
                    };
                })()`,
                returnByValue: true
            });
            return result.result.value;
        };

        console.log('=== Step 1: Create checkbox list ===');
        const seq = ['bullet', 'number', 'checkbox', 'bullet', 'number', 'checkbox'];
        for (const type of seq) {
            await createSel();
            await clickBtn(type);
            await new Promise(r => setTimeout(r, 200));
        }

        let state = await getState();
        console.log('After sequence:', JSON.stringify(state, null, 2));

        console.log('\n=== Step 2: Apply 10 INDENT operations ===');
        for (let i = 1; i <= 10; i++) {
            await createSel();
            await clickBtn('indent');
            await new Promise(r => setTimeout(r, 100));
        }

        state = await getState();
        console.log('After 10 indents:', JSON.stringify(state, null, 2));

        console.log('\n=== Step 3: Apply 10 OUTDENT operations ===');
        for (let i = 1; i <= 10; i++) {
            await createSel();
            await clickBtn('outdent');
            await new Promise(r => setTimeout(r, 100));
        }

        state = await getState();
        console.log('After 10 outdents:', JSON.stringify(state, null, 2));

        console.log('\n=== Step 4: Alternating indent/outdent 5 cycles ===');
        for (let i = 1; i <= 5; i++) {
            await createSel();
            await clickBtn('indent');
            await new Promise(r => setTimeout(r, 100));
            await createSel();
            await clickBtn('indent');
            await new Promise(r => setTimeout(r, 100));
            await createSel();
            await clickBtn('outdent');
            await new Promise(r => setTimeout(r, 100));
            await createSel();
            await clickBtn('outdent');
            await new Promise(r => setTimeout(r, 100));

            state = await getState();
            console.log(`Cycle ${i}: margins = [${state.margins.map(m => m.margin).join(', ')}]`);
        }

        console.log('\n=== Final State ===');
        state = await getState();
        console.log('LIs:', state.liCount);
        console.log('Checkboxes:', state.cbCount);
        console.log('Margins:', JSON.stringify(state.margins, null, 2));

        // Verify structure
        const htmlResult = await sendCommand(ws, 'Runtime.evaluate', {
            expression: `
            (function() {
                const editor = document.querySelector('wui-editor');
                const shadow = editor.shadowRoot;
                const ce = shadow.querySelector('[contenteditable]');

                // Check each LI has proper structure
                const lis = shadow.querySelectorAll('li');
                const issues = [];
                for (let i = 0; i < lis.length; i++) {
                    const li = lis[i];
                    const wrapper = li.querySelector('.checklist-item-wrapper');
                    const input = li.querySelector('input[type="checkbox"]');
                    if (!wrapper) issues.push('LI ' + i + ': missing wrapper');
                    if (!input) issues.push('LI ' + i + ': missing checkbox input');
                }

                return {
                    issues: issues,
                    htmlPreview: ce.innerHTML.substring(0, 300)
                };
            })()`,
            returnByValue: true
        });
        console.log('Structure issues:', htmlResult.result.value.issues.length ? htmlResult.result.value.issues : 'None');

        ws.close();
        process.exit(0);
    });
}

runTest().catch(console.error);

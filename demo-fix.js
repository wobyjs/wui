// Quick demo of the nested elements fix
const WebSocket = require('ws');

const TEST_PORT = 9223; // Using the existing Chrome on port 9223
const SERVER_PORT = 5180;

async function demo() {
    console.log('=== DEMONSTRATING THE FIX ===\n');

    // Connect to Chrome
    const pageResponse = await fetch(`http://localhost:${TEST_PORT}/json/new?http://localhost:${SERVER_PORT}/editor-demo.html`, {
        method: 'PUT'
    });
    const pageData = await pageResponse.json();
    const pageId = pageData.id;

    console.log('1. Opened editor demo page\n');

    await new Promise(resolve => setTimeout(resolve, 3000));

    const ws = new WebSocket(`ws://localhost:${TEST_PORT}/devtools/page/${pageId}`);

    ws.on('open', async () => {
        console.log('2. Connected to page\n');

        // Activate editor
        await sendCommand(ws, 1, `
            const editor = document.querySelector('wui-editor');
            const shadowRoot = editor.shadowRoot;
            const content = shadowRoot.querySelector('[contenteditable]');
            content.focus();
            content.click();
        `);

        console.log('3. Activated editor\n');

        // Select "toolbar" in the strong tag
        await sendCommand(ws, 2, `
            const editor = document.querySelector('wui-editor');
            const shadowRoot = editor.shadowRoot;
            const content = shadowRoot.querySelector('[contenteditable]');
            const strong = content.querySelectorAll('p')[1].querySelector('strong');
            const textNode = strong.firstChild;
            const range = document.createRange();
            range.setStart(textNode, 5);
            range.setEnd(textNode, 12);
            const sel = shadowRoot.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        `);

        console.log('4. Selected "toolbar"\n');

        // Click italic
        await sendCommand(ws, 3, `
            document.querySelector('wui-editor').shadowRoot.querySelector('wui-italic-button').click();
        `);

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('5. Applied italic to "toolbar"\n');

        // Click underline
        await sendCommand(ws, 4, `
            document.querySelector('wui-editor').shadowRoot.querySelector('wui-underline-button').click();
        `);

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('6. Applied underline to "toolbar"\n');

        // Click bold (to unbold)
        await sendCommand(ws, 5, `
            document.querySelector('wui-editor').shadowRoot.querySelector('wui-bold-button').click();
        `);

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('7. Clicked bold to unbold "toolbar"\n');

        // Check the result
        const result = await sendCommand(ws, 6, `
            JSON.stringify((() => {
                const editor = document.querySelector('wui-editor');
                const shadowRoot = editor.shadowRoot;
                const content = shadowRoot.querySelector('[contenteditable]');
                const paragraphs = Array.from(content.querySelectorAll('p'));
                const p1 = paragraphs[1];

                return {
                    text: p1.textContent,
                    html: p1.innerHTML,
                    hasToolbar: p1.textContent.includes('toolbar'),
                    hasDemo: p1.textContent.includes('demo'),
                    hasFull: p1.textContent.includes('full'),
                    textLength: p1.textContent.length
                };
            })())
        `);

        console.log('8. RESULT:\n');
        console.log('   Text:', result.text);
        console.log('   HTML:', result.html);
        console.log('\n');

        if (result.hasToolbar && result.hasDemo && result.hasFull && result.textLength > 40) {
            console.log('✅ SUCCESS! Text preserved after nested formatting operations!');
            console.log('✅ The bug is FIXED - no text loss occurred!\n');
        } else {
            console.log('❌ FAILED! Text was lost or corrupted!\n');
        }

        console.log('=== END DEMO ===\n');

        ws.close();
        process.exit(0);
    });
}

function sendCommand(ws, id, expression) {
    return new Promise((resolve) => {
        ws.send(JSON.stringify({
            id,
            method: 'Runtime.evaluate',
            params: { expression }
        }));

        const handler = (data) => {
            const response = JSON.parse(data.toString());
            if (response.id === id) {
                ws.removeListener('message', handler);
                if (response.result && response.result.result && response.result.result.value) {
                    try {
                        resolve(JSON.parse(response.result.result.value));
                    } catch {
                        resolve(response.result.result.value);
                    }
                } else {
                    resolve({});
                }
            }
        };

        ws.on('message', handler);
    });
}

demo().catch(err => {
    console.error('Demo error:', err);
    process.exit(1);
});
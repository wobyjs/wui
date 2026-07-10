try {
    var host = document.querySelector('wui-editor');
    if (!host) throw new Error('no host');
    var root = host.shadowRoot;
    if (!root) throw new Error('no shadowRoot');
    var img = root.querySelector('img');
    if (!img) throw new Error('no img');
    var r = img.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;
    img.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true, clientX: cx, clientY: cy, button: 0 }));
    'dispatched at ' + Math.round(cx) + ',' + Math.round(cy)
} catch(e) {
    'EXACT_ERROR: ' + e.message + ' | ' + e.stack
}

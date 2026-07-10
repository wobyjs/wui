const editor = document.querySelector("wui-editor");
const shadow = editor.shadowRoot;
const ce = shadow.querySelector("[contenteditable]");
ce.innerHTML = "<p><span style=\"font-weight:bold\">cross-paragraph selection testing.</span></p>";
const textNode = ce.querySelector("span").firstChild;
const sel = shadow.getSelection();
const range = document.createRange();
range.setStart(textNode, 6);
range.setEnd(textNode, 15);
sel.removeAllRanges();
sel.addRange(range);

const italicBtn = shadow.querySelector("wui-italic-button") || document.querySelector("wui-italic-button");
const btn = italicBtn.shadowRoot.querySelector("button");
btn.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, composed: true }));
btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, composed: true }));

JSON.stringify({ html: ce.innerHTML, selection: shadow.getSelection()?.toString() })

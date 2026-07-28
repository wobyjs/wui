// Minimal browser DOM shim for Node.js SSR probe execution.
// woby/chk normally sets globalThis.window = globalThis (Deno polyfill),
// which causes woby's customElement() to call createBrowserCustomElement
// (extends HTMLElement) instead of createSSRCustomElement.
// We provide HTMLElement + friends so the class definition doesn't crash,
// but we deliberately do NOT set globalThis.window, so that:
// 1. @woby/chk will NOT set it either (its guard `typeof window > 'u'` fails)
// 2. woby uses createSSRCustomElement (correct for SSR rendering)
// 3. TestXxx files use `typeof globalThis.__isSSRTest__ !== 'undefined'` for SSR detection

// Minimal Event stub
class Event {
    constructor(type, opts) { this.type = type; this.bubbles = opts?.bubbles ?? false; }
    preventDefault() {}
    stopPropagation() {}
    stopImmediatePropagation() {}
}

// Minimal Node stub
class Node {
    constructor() { this.childNodes = []; this.parentNode = null; }
    appendChild(child) { this.childNodes.push(child); child.parentNode = this; return child; }
    removeChild(child) { const i = this.childNodes.indexOf(child); if (i >= 0) this.childNodes.splice(i, 1); return child; }
    insertBefore(newChild, refChild) { /* no-op */ return newChild; }
    addEventListener() {}
    removeEventListener() {}
    get firstChild() { return this.childNodes[0] ?? null; }
    get lastChild() { return this.childNodes[this.childNodes.length - 1] ?? null; }
}

// Minimal Element stub
class Element extends Node {
    constructor() { super(); this.attributes = {}; this.classList = new Set(); this.style = {}; }
    setAttribute(name, value) { this.attributes[name] = value; }
    getAttribute(name) { return this.attributes[name] ?? null; }
    hasAttribute(name) { return name in this.attributes; }
    removeAttribute(name) { delete this.attributes[name]; }
    get tagName() { return this.constructor.name?.toUpperCase() ?? 'DIV'; }
    attachShadow() { return this; }
    dispatchEvent() { return true; }
    closest() { return null; }
    querySelector() { return null; }
    querySelectorAll() { return []; }
    get innerHTML() { return ''; }
    set innerHTML(v) {}
    get outerHTML() { return ''; }
    get textContent() { return ''; }
    set textContent(v) {}
    get children() { return []; }
    get firstElementChild() { return null; }
    matches() { return false; }
}

// Minimal HTMLElement stub — enough for createBrowserCustomElement to define its class
class HTMLElement extends Element {
    constructor() { super(); this._shadowRoot = null; this.dataset = {}; }
    get shadowRoot() { return this._shadowRoot; }
    attachShadow() { this._shadowRoot = this; return this._shadowRoot; }
    getAttribute(name) { return this.attributes[name] ?? null; }
    setAttribute(name, value) { this.attributes[name] = value; }
    click() {}
    focus() {}
    blur() {}
}

// Minimal HTMLInputElement stub
class HTMLInputElement extends HTMLElement {
    constructor() { super(); this.value = ''; this.checked = false; this.type = 'text'; }
}

// Minimal HTMLSlotElement stub
class HTMLSlotElement extends HTMLElement {
    constructor() { super(); this.assignedNodes = () => []; }
}

// Minimal ShadowRoot stub
class ShadowRoot extends Element {
    constructor() { super(); this.mode = 'open'; this.host = null; }
}

// Additional globals that might be needed
class CustomEvent extends Event {
    constructor(type, opts) { super(type, opts); this.detail = opts?.detail ?? null; }
}

class MutationObserver {
    constructor(callback) { this.callback = callback; }
    observe() {}
    disconnect() {}
    takeRecords() { return []; }
}

class ResizeObserver {
    constructor(callback) { this.callback = callback; }
    observe() {}
    unobserve() {}
    disconnect() {}
}

// Minimal document stub
const document = {
    createElement: (tag) => new HTMLElement(),
    createTextNode: (text) => ({}),
    createDocumentFragment: () => ({ appendChild: () => {}, childNodes: [] }),
    body: new HTMLElement(),
    documentElement: new HTMLElement(),
    head: new HTMLElement(),
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    createComment: () => ({}),
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    fonts: { ready: Promise.resolve() },
    visibilityState: 'visible',
    hidden: false,
    cookie: '',
    location: { href: 'http://localhost', origin: 'http://localhost' },
};

// Only set if not already defined (esbuild --inject prepends, so this runs first)
// NOTE: We deliberately do NOT set globalThis.window here.
// @woby/chk will set it (globalThis.window = globalThis), which makes woby use
// createBrowserCustomElement — that's fine because we provide HTMLElement above.
// But the TestXxx files' SSR blocks use `typeof window === 'undefined'` to detect
// Node.js, which fails when window is polyfilled. So we also provide a companion
// flag `globalThis.__isSSRTest__` that the SSR blocks can check.
if (!globalThis.HTMLElement) globalThis.HTMLElement = HTMLElement;
if (!globalThis.HTMLInputElement) globalThis.HTMLInputElement = HTMLInputElement;
if (!globalThis.Element) globalThis.Element = Element;
if (!globalThis.Node) globalThis.Node = Node;
if (!globalThis.Event) globalThis.Event = Event;
if (!globalThis.CustomEvent) globalThis.CustomEvent = CustomEvent;
if (!globalThis.HTMLSlotElement) globalThis.HTMLSlotElement = HTMLSlotElement;
if (!globalThis.ShadowRoot) globalThis.ShadowRoot = ShadowRoot;
if (!globalThis.MutationObserver) globalThis.MutationObserver = MutationObserver;
if (!globalThis.ResizeObserver) globalThis.ResizeObserver = ResizeObserver;
if (!globalThis.document) globalThis.document = document;
if (!globalThis.Document) globalThis.Document = function Document() {};
if (!globalThis.navigator) globalThis.navigator = { userAgent: 'node-ssr' };
if (!globalThis.location) globalThis.location = { href: 'http://localhost', origin: 'http://localhost', pathname: '/', search: '', hash: '', host: 'localhost', hostname: 'localhost', port: '', protocol: 'http:' };
if (!globalThis.self) globalThis.self = globalThis;
if (!globalThis.top) globalThis.top = globalThis;
if (!globalThis.parent) globalThis.parent = globalThis;
// woby/chk sets globalThis.window = globalThis, so window-level DOM APIs
// must exist on globalThis. Add stubs for common ones that effects may call.
if (!globalThis.addEventListener) globalThis.addEventListener = () => {};
if (!globalThis.removeEventListener) globalThis.removeEventListener = () => {};
if (!globalThis.history) globalThis.history = { pushState: () => {}, replaceState: () => {}, back: () => {}, forward: () => {}, go: () => {}, length: 0, state: null, scrollRestoration: 'auto' };
if (!globalThis.screen) globalThis.screen = { width: 1024, height: 768, availWidth: 1024, availHeight: 768, colorDepth: 24, orientation: { angle: 0, type: 'landscape-primary' } };
if (!globalThis.getSelection) globalThis.getSelection = () => ({
	anchorNode: null, anchorOffset: 0, focusNode: null, focusOffset: 0,
	isCollapsed: true, rangeCount: 0, type: 'None',
	getRangeAt: () => null, removeAllRanges: () => {}, addRange: () => {},
	collapse: () => {}, selectAllChildren: () => {},
	extend: () => {}, setBaseAndExtent: () => {},
	toString: () => '',
	collapseToStart: () => {}, collapseToEnd: () => {},
	deleteFromDocument: () => {}, containsNode: () => false,
	empty: () => {},
});
globalThis.__isSSRTest__ = true;
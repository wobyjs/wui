/**
 * Example: Counter Custom Element Plugin for wui-editor.
 *
 * This demonstrates how 3rd party developers can register a custom element
 * that appears in the editor's insert menu and renders inline.
 *
 * Usage:
 *   import { registerEditorPlugin } from '@woby/wui'
 *   import './CounterPlugin' // registers the plugin as a side-effect
 *
 * Or call registerEditorPlugin directly with a plugin descriptor.
 */

import { registerEditorPlugin } from '../Editor/EditorPlugin'

// Define the custom element
class MyCounter extends HTMLElement {
    private _count = 0
    private _display: HTMLSpanElement | null = null

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }

    connectedCallback() {
        this._count = parseInt(this.getAttribute('count') || '0', 10)
        this.render()
    }

    private render() {
        if (!this.shadowRoot) return
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 4px 12px;
                    border: 2px dashed #3b82f6;
                    border-radius: 6px;
                    background: #eff6ff;
                    font-family: monospace;
                    cursor: default;
                    user-select: none;
                }
                span {
                    font-size: 16px;
                    font-weight: bold;
                    color: #1e40af;
                    min-width: 24px;
                    text-align: center;
                }
                button {
                    width: 24px;
                    height: 24px;
                    border: 1px solid #93c5fd;
                    border-radius: 4px;
                    background: white;
                    cursor: pointer;
                    font-size: 14px;
                    line-height: 1;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: #1e40af;
                    user-select: none;
                }
                button:hover {
                    background: #dbeafe;
                }
            </style>
            <button part="decrement" data-action="dec">−</button>
            <span part="display">${this._count}</span>
            <button part="increment" data-action="inc">+</button>
        `

        this._display = this.shadowRoot.querySelector('span')

        this.shadowRoot.querySelector('[data-action="dec"]')?.addEventListener('click', () => {
            this._count--
            this.updateDisplay()
        })

        this.shadowRoot.querySelector('[data-action="inc"]')?.addEventListener('click', () => {
            this._count++
            this.updateDisplay()
        })
    }

    private updateDisplay() {
        if (this._display) {
            this._display.textContent = String(this._count)
        }
        this.setAttribute('count', String(this._count))
    }
}

// Register the custom element if not already registered
if (!customElements.get('my-counter')) {
    customElements.define('my-counter', MyCounter)
}

// Register with wui editor
registerEditorPlugin({
    name: 'counter',
    label: 'Counter',
    tagName: 'my-counter',
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '±'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('my-counter')
        el.setAttribute('count', '0')
        range.deleteContents()
        range.insertNode(el)
        // Place cursor after the inserted element
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const sel = (editorRoot.getRootNode() instanceof ShadowRoot)
            ? (editorRoot.getRootNode() as ShadowRoot).getSelection()
            : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

export default MyCounter

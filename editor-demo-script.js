// Document-centric components only. We deliberately do NOT import the barrel
// './src/index.tsx' here — it re-exports the Wheeler family (Wheeler,
// WheelerType, DateTimeWheeler, MultiWheeler), which are Portal-based overlay
// widgets, not document-centric content. Pulling them into the editor bundle
// instantiates Portal at load and blows the stack via
// Portal -> useRenderEffect -> Effect.update recursion.
import './src/input.css'
import './src/Editor/Editor'
import './src/Editor/EditorPlugin'

// Doc-based components embeddable in editor content
import './src/Button'
import './src/ToggleButton'
import './src/Checkbox'
import './src/Switch'
import './src/TextField'
import './src/TextArea'
import './src/NumberField'
import './src/IconButton'
import './src/Badge'
import './src/Fab'
import './src/Avatar'
import './src/Banner'

import './src/Editor/CounterPlugin.ts'
import './src/Editor/WuiPlugins.ts'
import './src/Editor/PageBlockPlugins.ts'

// Wait for custom element to be defined
await customElements.whenDefined('wui-editor')

// Compile Tailwind utilities in the browser so classes typed into the property
// panel at runtime actually resolve — including the arbitrary values
// that no build-time `@source inline(...)` list can enumerate. Started here rather
// than imported by the editor because it pulls in the ~280 KB Tailwind compiler;
// it is an authoring-surface tool, not part of the shipped bundle. Exposed on
// `window` so the demo (and dv4) can inspect what it has compiled.
const { startRuntimeTailwind } = await import('./src/RuntimeTailwind.ts')
window.__runtimeTailwind = await startRuntimeTailwind()

const editor = document.querySelector('#editor-root')
const consoleOutput = document.getElementById('console-output')

// Intercept console methods for debug display
const originalLog = console.log
const originalWarn = console.warn
const originalError = console.error

function logToUI(type, args) {
    const div = document.createElement('div')
    div.style.color = type === 'error' ? '#d32f2f' : type === 'warn' ? '#f57c00' : '#333'
    div.textContent = `[${new Date().toLocaleTimeString()}] ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}`
    consoleOutput.appendChild(div)
    consoleOutput.scrollTop = consoleOutput.scrollHeight
}

console.log = (...args) => { originalLog(...args); logToUI('log', args) }
console.warn = (...args) => { originalWarn(...args); logToUI('warn', args) }
console.error = (...args) => { originalError(...args); logToUI('error', args) }

// Check Phase 1 infrastructure
setTimeout(async () => {
    const phase1Status = document.getElementById('phase1-status')
    const selectionManagerStatus = document.getElementById('selection-manager-status')
    const domNormalizerStatus = document.getElementById('dom-normalizer-status')
    const styleEngineStatus = document.getElementById('style-engine-status')

    try {
        // Check if modules are available
        const editorModule = await import('./src/Editor/index.ts')

        const hasSelectionManager = typeof editorModule.SelectionManager === 'function'
        const hasDOMNormalizer = typeof editorModule.normalizeDOM === 'function'
        const hasStyleEngine = typeof editorModule.applyBold === 'function'

        // Expose StyleEngine functions globally for testing
        window.applyBold = editorModule.applyBold
        window.applyItalic = editorModule.applyItalic
        window.applyUnderline = editorModule.applyUnderline
        window.applyStyle = editorModule.applyStyle
        window.removeStyle = editorModule.removeStyle
        window.toggleStyle = editorModule.toggleStyle
        window.applyTextAlign = editorModule.applyTextAlign
        window.applyIndent = editorModule.applyIndent

        phase1Status.textContent = '✓ Phase 1 Complete'
        phase1Status.style.color = '#4caf50'

        selectionManagerStatus.textContent = hasSelectionManager ? '✓ Available' : '✗ Missing'
        selectionManagerStatus.style.color = hasSelectionManager ? '#4caf50' : '#d32f2f'

        domNormalizerStatus.textContent = hasDOMNormalizer ? '✓ Available' : '✗ Missing'
        domNormalizerStatus.style.color = hasDOMNormalizer ? '#4caf50' : '#d32f2f'

        styleEngineStatus.textContent = hasStyleEngine ? '✓ Available' : '✗ Missing'
        styleEngineStatus.style.color = hasStyleEngine ? '#4caf50' : '#d32f2f'

        console.log('[Editor Demo] Phase 1 infrastructure check complete:', {
            SelectionManager: hasSelectionManager,
            DOMNormalizer: hasDOMNormalizer,
            StyleEngine: hasStyleEngine
        })
    } catch (err) {
        phase1Status.textContent = '✗ Error loading modules'
        phase1Status.style.color = '#d32f2f'
        console.error('[Editor Demo] Failed to check Phase 1:', err)
    }
}, 1000)

// Monitor editor interactions
if (editor) {
    editor.addEventListener('focus', () => console.log('[Editor] Focus event'))
    editor.addEventListener('blur', () => console.log('[Editor] Blur event'))
    editor.addEventListener('input', () => console.log('[Editor] Input event'))
    editor.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.key === 'Tab') {
            console.log('[Editor] Keydown:', e.key, 'Ctrl:', e.ctrlKey, 'Shift:', e.shiftKey)
        }
    })

    console.log('[Editor Demo] Full toolbar editor initialized')
}
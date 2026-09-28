import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
    registerEditorPlugin,
    unregisterEditorPlugin,
    resolveResizable,
    ResizableSpec,
} from '../../src/Editor/EditorPlugin'

describe('resolveResizable with dragHandle option', () => {
    const customTag = 'test-interactive-embed'

    beforeEach(() => {
        unregisterEditorPlugin('test-interactive')
        unregisterEditorPlugin('test-standard')
    })

    afterEach(() => {
        unregisterEditorPlugin('test-interactive')
        unregisterEditorPlugin('test-standard')
    })

    it('defaults dragHandle to undefined for HTMLImageElement (matching default true behavior)', () => {
        const img = document.createElement('img')
        const spec = resolveResizable(img)
        expect(spec).not.toBeNull()
        expect(spec?.dragHandle).toBeUndefined()
        expect(spec?.dragHandle !== false).toBe(true)
    })

    it('defaults dragHandle to undefined when resizable is true', () => {
        registerEditorPlugin({
            name: 'test-standard',
            label: 'Standard',
            tagName: 'test-standard-embed',
            onInsert: () => {},
            resizable: true,
        })
        const el = document.createElement('test-standard-embed')
        const spec = resolveResizable(el)
        expect(spec).not.toBeNull()
        expect(spec?.dragHandle).toBeUndefined()
        expect(spec?.dragHandle !== false).toBe(true)
    })

    it('preserves dragHandle: false when specified in ResizableSpec', () => {
        registerEditorPlugin({
            name: 'test-interactive',
            label: 'Interactive',
            tagName: customTag,
            onInsert: () => {},
            resizable: {
                aspect: 'free',
                dragHandle: false,
            },
        })
        const el = document.createElement(customTag)
        const spec = resolveResizable(el)
        expect(spec).not.toBeNull()
        expect(spec?.dragHandle).toBe(false)
        expect(spec?.dragHandle !== false).toBe(false)
    })

    it('preserves dragHandle: true when explicitly enabled in ResizableSpec', () => {
        registerEditorPlugin({
            name: 'test-interactive',
            label: 'Interactive',
            tagName: customTag,
            onInsert: () => {},
            resizable: {
                dragHandle: true,
            },
        })
        const el = document.createElement(customTag)
        const spec = resolveResizable(el)
        expect(spec).not.toBeNull()
        expect(spec?.dragHandle).toBe(true)
        expect(spec?.dragHandle !== false).toBe(true)
    })

    describe('Regression: expectation matching for drag handle vs resize handles', () => {
        it('expects drag handle to be attached for standard img', () => {
            const img = document.createElement('img')
            const spec = resolveResizable(img)
            const expectsDragHandle = spec?.dragHandle !== false
            expect(expectsDragHandle).toBe(true)
        })

        it('expects drag handle to be attached when resizable is default boolean true', () => {
            registerEditorPlugin({
                name: 'test-standard',
                label: 'Standard',
                tagName: 'test-standard-embed',
                onInsert: () => {},
                resizable: true,
            })
            const el = document.createElement('test-standard-embed')
            const spec = resolveResizable(el)
            const expectsDragHandle = spec?.dragHandle !== false
            expect(expectsDragHandle).toBe(true)
        })

        it('does not expect drag handle when dragHandle is explicitly false, avoiding polling deadlock in attachDragHandlers', () => {
            registerEditorPlugin({
                name: 'test-interactive',
                label: 'Interactive',
                tagName: customTag,
                onInsert: () => {},
                resizable: {
                    aspect: 'free',
                    dragHandle: false,
                },
            })
            const el = document.createElement(customTag)
            const spec = resolveResizable(el)
            const expectsDragHandle = spec?.dragHandle !== false
            expect(expectsDragHandle).toBe(false)
        })
    })
})

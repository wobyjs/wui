/* IMPORT */

import type { JSX, Observable } from 'woby'
import { useEffect, $, $$, } from 'woby'

// Count every console.log so the full-suite log volume can be verified past
// the devtools 1000-message buffer cap, via `dv eval` reading
// globalThis.__consoleLogCount. Guarded so HMR re-imports don't double-wrap.
if (!(globalThis as any).__consoleLogPatched) {
    ; (globalThis as any).__consoleLogPatched = true;
    ; (globalThis as any).__consoleLogCount = 0;
    ; (globalThis as any).__passLogCount = 0;
    const origLog = console.log.bind(console)
    console.log = (...args: any[]) => {
        (globalThis as any).__consoleLogCount++
        if (String(args[0]).includes('✅')) (globalThis as any).__passLogCount++
        origLog(...args)
    }
}

/* TYPE */

type Constructor<T, Args extends unknown[] = unknown[]> = new (...args: Args) => T

/* HELPERS */

export const TEST_INTERVAL = 500

export const assert = (result: boolean, message?: string): void => {
    console.assert(result, message)
    const g = globalThis as any
    if (!g.__testFailures) g.__testFailures = []
    if (!g.__testPassCount) g.__testPassCount = 0
    if (result) g.__testPassCount++
    else g.__testFailures.push(message || 'assertion failed')
}

// Global test observables registry
export const testObservables: Record<string, Observable<any> | JSX.Child> = {}

// Expose testObservables globally for testing
if (typeof window !== 'undefined') {
    (window as any).testObservables = testObservables
}

export const registerTestObservable = (name: string, observable: Observable<any> | JSX.Child) => {
    if (name in testObservables) {
        throw new Error(`[registerTestObservable]: Duplicate name "${name}" already registered.`)
    }
    testObservables[name] = observable
}

/**
 * Serializes an element to HTML string, recursively handling shadow DOM.
 * For custom elements with shadowRoot: wraps shadow content in <template shadowrootmode="open">,
 * then appends only light DOM children that are NOT assigned to any slot (hidden from output).
 * Falls back to element.innerHTML for elements without shadow DOM.
 */
export function getInnerHTML(element: Element): string {
    if (!element) return ''
    return _serializeChildren(element)
}

export function minimiseHtml(html: string): string {
    return html.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim()
}

function _serializeElement(el: Element): string {
    const shadowRoot = (el as any).shadowRoot as ShadowRoot | null

    if (shadowRoot) {
        const tag = el.tagName.toLowerCase()
        let attrs = ''
        for (let i = 0; i < el.attributes.length; i++) {
            const a = el.attributes[i]
            attrs += ` ${a.name}="${a.value}"`
        }

        let inner = `<template shadowrootmode="open" shadowrootserializable="">`
        inner += _serializeShadowRoot(shadowRoot)
        inner += `</template>`

        return `<${tag}${attrs}>${inner}</${tag}>`
    }

    const tag = el.tagName.toLowerCase()
    let attrs = ''
    for (let i = 0; i < el.attributes.length; i++) {
        const a = el.attributes[i]
        attrs += ` ${a.name}="${a.value}"`
    }
    return `<${tag}${attrs}>${_serializeChildren(el)}</${tag}>`
}

function _serializeShadowRoot(shadowRoot: ShadowRoot): string {
    let html = ''
    shadowRoot.childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element
            if (el.tagName === 'SLOT') {
                let slotContent = ''
                const assigned = (el as HTMLSlotElement).assignedNodes({ flatten: true })
                assigned.forEach((assignedNode) => {
                    if (assignedNode.nodeType === Node.ELEMENT_NODE) {
                        slotContent += _serializeElement(assignedNode as Element)
                    } else if (assignedNode.nodeType === Node.TEXT_NODE) {
                        slotContent += (assignedNode as Text).textContent || ''
                    }
                })
                html += `<slot>${slotContent}</slot>`
            } else {
                html += _serializeElementWithSlot(el, shadowRoot)
            }
        } else if (node.nodeType === Node.TEXT_NODE) {
            html += (node as Text).textContent || ''
        } else if (node.nodeType === Node.COMMENT_NODE) {
            // Skip comment nodes (woby inserts <!-- --> for reactive markers)
        }
    })
    return html
}

function _serializeChildren(element: Element, slotContext?: ShadowRoot): string {
    let html = ''
    element.childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element
            if (el.tagName === 'SLOT' && slotContext) {
                let slotContent = ''
                const assigned = (el as HTMLSlotElement).assignedNodes({ flatten: true })
                assigned.forEach((assignedNode) => {
                    if (assignedNode.nodeType === Node.ELEMENT_NODE) {
                        slotContent += _serializeElement(assignedNode as Element)
                    } else if (assignedNode.nodeType === Node.TEXT_NODE) {
                        slotContent += (assignedNode as Text).textContent || ''
                    }
                })
                html += `<slot>${slotContent}</slot>`
            } else if (el.tagName !== 'SLOT') {
                html += _serializeElementWithSlot(el, slotContext)
            }
        } else if (node.nodeType === Node.TEXT_NODE) {
            html += (node as Text).textContent || ''
        } else if (node.nodeType === Node.COMMENT_NODE) {
            // Skip comment nodes (woby inserts <!-- --> for reactive markers)
        }
    })
    return html
}

function _serializeElementWithSlot(el: Element, slotContext?: ShadowRoot): string {
    const shadowRoot = (el as any).shadowRoot as ShadowRoot | null
    if (shadowRoot) return _serializeElement(el)
    const tag = el.tagName.toLowerCase()
    let attrs = ''
    for (let i = 0; i < el.attributes.length; i++) {
        const a = el.attributes[i]
        attrs += ` ${a.name}="${a.value}"`
    }

    const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']
    if (voidElements.includes(tag)) {
        return `<${tag}${attrs}>`
    }

    return `<${tag}${attrs}>${_serializeChildren(el, slotContext)}</${tag}>`
}

// Custom useInterval that runs 4 times then stops to prevent spam
export const useInterval = (callback: () => void, delay: number) => {
    let count = 0
    const id = setInterval(() => {
        callback()
        count++

        if (count > 4)
            clearInterval(id)
    }, delay)
}

// Custom useTimeout that runs once with limit support
export const useTimeout = (callback: () => void, delay: number) => {
    if (!delay) return

    const timeoutId = setTimeout(() => {
        callback()
    }, delay)

    return () => clearTimeout(timeoutId)
}

let staticIndex = 0

/* ON-PAGE RESULT REGISTRY */

// Every TestSnapshots instance publishes its latest actual/expected pair here so the
// landing page can show the same information the console prints. The console remains
// the source of truth for the Node runner; this is the browser-visible mirror.
export type TestResult = {
    index: number
    name: string
    status: Observable<'pending' | 'pass' | 'fail'>
    actual: Observable<string>
    expected: Observable<string>
    checks: Observable<number>
    fails: Observable<number>
}

export const testResults = $<TestResult[]>([])

const registerTestResult = (index: number, name: string): TestResult => {
    const result: TestResult = {
        index, name,
        status: $<'pending' | 'pass' | 'fail'>('pending'),
        actual: $(''),
        expected: $(''),
        checks: $(0),
        fails: $(0),
    }
    testResults(prev => [...prev, result])
    return result
}

/** Aggregate pass/fail banner for the whole browser suite. */
export const TestSummary = (): JSX.Element => {
    const modules = () => $$(testResults)
    const passed = () => modules().filter(r => $$(r.status) === 'pass').length
    const failed = () => modules().filter(r => $$(r.status) === 'fail').length
    const pending = () => modules().filter(r => $$(r.status) === 'pending').length
    const checks = () => modules().reduce((n, r) => n + $$(r.checks), 0)
    const allPassed = () => failed() === 0 && pending() === 0 && modules().length > 0

    return (
        <div class={() => `rounded border p-3 font-mono text-sm ${allPassed() ? 'border-green-500 bg-green-50 dark:bg-green-950' : failed() > 0 ? 'border-red-500 bg-red-50 dark:bg-red-950' : 'border-gray-400 bg-gray-50 dark:bg-gray-900'}`}>
            <div class="font-bold">📊 Browser Snapshot Summary</div>
            <div>Modules: {() => modules().length} &nbsp; ✅ {passed} &nbsp; ❌ {failed} &nbsp; ⏳ {pending}</div>
            <div>Assertions run: {checks}</div>
            <div class="font-bold">{() => allPassed() ? '✅ ALL PASSED' : failed() > 0 ? '❌ SOME FAILED' : '⏳ running…'}</div>
        </div>
    )
}

export const TestSnapshots = ({ Component, props }: { Component: (JSX.Component | Constructor<any>) & { test: { static?: boolean, enable?: () => boolean, wrap?: boolean, snapshots?: string[], compareActualValues?: boolean, expect?: () => string | string[] }, name?: string }, props?: Record<any, any> }): JSX.Element => {
    const ref = $<HTMLDivElement>()
    const index = staticIndex++
    const result = registerTestResult(index, Component.name ?? `Test #${index}`)
    let htmlPrev = ''
    let ticks = 0
    let done = false
    // Publishes the same actual/expected pair the console logs, so the page shows it too.
    const record = (passed: boolean, actual: string, expected: string | string[]): boolean => {
        result.actual(actual)
        result.expected(Array.isArray(expected) ? expected.join('\n  or ') : expected)
        result.checks(n => n + 1)
        if (passed) {
            // A module that has failed once stays failed — a later matching tick doesn't clear it.
            if ($$(result.status) !== 'fail') result.status('pass')
        } else {
            result.fails(n => n + 1)
            result.status('fail')
        }
        return passed
    }
    const getHTML = (): string => {
        const element = ref()
        if (!element) return ''
        return minimiseHtml(getInnerHTML(element))
    }
    const tick = (): void => {
        if (done) return
        const indexPrev = index
        ticks += 1

        // Use microtask to ensure DOM is updated before assertion
        queueMicrotask(() => {

            // New format: component uses compareActualValues without snapshots, or has an expect function
            const actualHTMLForNewFormat = getHTML()
            const actualSnapshot = actualHTMLForNewFormat ? minimiseHtml(actualHTMLForNewFormat.replace(/<h3>[^<]*<\/h3>/, '')) : ''

            if (!Component.test.enable || Component.test.enable())
                // If the component has an expect function (like our new format), use that for comparison
                if (Component.test.expect && typeof Component.test.expect === 'function') {
                    // The expect function is being executed - this is the key verification
                    const expectedValue = Component.test.expect()

                    // Normalize expected value to array for uniform handling
                    const expectedValues = Array.isArray(expectedValue) ? expectedValue : [expectedValue]

                    // For static components, verify exact match
                    if (Component.test.static) {
                        // For static tests, DO NOT convert actual values to placeholders
                        // Compare actual literal values directly with expected values
                        const actualForComparison = actualSnapshot

                        // Check if actual matches any of the expected values
                        const matches = expectedValues.some(expected => actualForComparison === expected)
                        record(matches, actualForComparison, expectedValues)

                        if (matches) {
                            //temp hide for assertion only
                            console.log(`✅ Expect function test passed for ${Component.name}`, ' expect: ', actualSnapshot)
                        } else {
                            assert(false, `[${Component.name}]: Expected actual \n'${actualForComparison}' to match one of the expected values \n'${expectedValues.join(' or \n')}'`)
                        }
                    } else {
                        // For dynamic components with compareActualValues, use the expect function result directly
                        // without placeholder conversion
                        if (Component.test.compareActualValues) {
                            const matches = expectedValues.some(expected => actualSnapshot === expected)
                            record(matches, actualSnapshot, expectedValues)

                            if (matches) {
                                //temp hide for assertion only
                                console.log(`✅ Expect function test passed for ${Component.name}`, ' expect: ', actualSnapshot)
                            } else {
                                assert(false, `[${Component.name}]: Expected '${actualSnapshot}' to match one of the expected values '${expectedValues.join(' or \n')}'`)
                            }
                        } else {
                            // For dynamic components with registered observables, compare actual values directly
                            // Components must use registerTestObservable and return concrete values in expect function
                            const nonEmptyExpected = expectedValues.filter(expected => expected && expected.trim() !== '')

                            if (nonEmptyExpected.length > 0) {
                                const matches = nonEmptyExpected.some(expected => actualSnapshot === expected)
                                record(matches, actualSnapshot, nonEmptyExpected)

                                if (matches) {
                                    // temp hide for assertion only
                                    console.log(`✅ Expect function test passed for ${Component.name}`, ' expect: ', actualSnapshot)
                                } else {
                                    assert(false, `[${Component.name}]: Expected actual '${actualSnapshot}' to match one of the expected values '${JSON.stringify(nonEmptyExpected)}'`)
                                }
                            } else {
                                record(false, actualSnapshot, '(expect function returned an empty result)')
                                assert(false, `[${Component.name}]: Expect function returned empty result: '${expectedValues.join(' or \n')}'`)
                            }
                        }
                    }
                } else if (Component.test.compareActualValues) {
                    // For compareActualValues without expect function, do basic validation
                    assert(actualSnapshot.includes('<p>') && actualSnapshot.includes('<\/p>'), `[${Component.name}]: Expected to render a paragraph element`)
                }

            htmlPrev = actualHTMLForNewFormat
        }) // Close queueMicrotask
    }
    const noUpdate = (): void => {
        assert(false, `[${Component.name}]: Expected no updates to ever happen`)
    }
    const yesUpdate = (): void => {
        if (Component.test.static) return
        if (ticks > 1) return
        assert(false, `[${Component.name}]: Expected at least one update`)
    }
    useEffect(() => {
        const root = ref()
        if (!root) return
        tick()
        const timeoutId = setTimeout(yesUpdate, 3000)
        const onMutation = Component.test.static ? noUpdate : () => {
            // Call tick immediately to see if this works
            tick()
        }
        // Check if MutationObserver exists (browser environment)
        let observer: MutationObserver | null = null
        if (typeof MutationObserver !== 'undefined' && root instanceof Node) {
            observer = new MutationObserver(onMutation)
            const options = { attributes: true, childList: true, characterData: true, subtree: true }
            observer.observe(root, options)
        }
        return () => {
            clearTimeout(timeoutId)
            if (observer) {
                observer.disconnect()
            }
        }
    })
    // The parameter is typed as a component *or* a constructor, and that union carries no single
    // call/construct signature for TSX to pick; the runtime value is always renderable.
    const Renderable = Component as any

    const badge = () => ({ pass: '✅ PASS', fail: '❌ FAIL', pending: '⏳ …' })[$$(result.status)]
    const badgeClass = () => ({
        pass: 'text-green-700 dark:text-green-400',
        fail: 'text-red-700 dark:text-red-400',
        pending: 'text-gray-500',
    })[$$(result.status)]
    // `pre` + break-all: snapshot strings are long single lines; wrapping keeps the
    // grid cell from scrolling horizontally while staying character-exact.
    const logClass = 'whitespace-pre-wrap break-all font-mono text-[11px] leading-snug m-0'

    return (
        <div>
            <span class={() => `font-bold ${badgeClass()}`}>Test #{index} — {result.name} {badge}</span>
            <div ref={ref}>
                <Renderable {...props} />
            </div>
            <details class="mt-2 border-t pt-1 text-xs" open={() => $$(result.status) === 'fail'}>
                <summary class="cursor-pointer select-none opacity-70">
                    actual / expect ({() => $$(result.checks)} checks, {() => $$(result.fails)} failed)
                </summary>
                <div class="mt-1">
                    <div class="opacity-60">actual:</div>
                    <pre class={logClass}>{() => $$(result.actual) || '(not rendered yet)'}</pre>
                    <div class="mt-1 opacity-60">expect:</div>
                    <pre class={logClass}>{() => $$(result.expected) || '(not evaluated yet)'}</pre>
                </div>
            </details>
        </div>
    )
}
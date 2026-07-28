import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { Collapse } from '../Collapse'

const name = 'TestCollapse'
const TestCollapse = (): JSX.Element => {
    const states = [
        { open: true as const, background: true as const, children: 'Content' },
        { open: false as const, background: true as const, children: 'Content' },
        { open: true as const, background: true as const, children: 'Content' },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        return (
            <>
                <h3>Collapse</h3>
                <Collapse open={s.open}>{s.children}</Collapse>
            </>
        )
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

const COLLAPSE_BASE = "overflow-hidden transition-height duration-200 ease-in-out bg-[#ccc]"

// SSR test (Node.js)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestCollapse()

    const fullElements = [
        `<h3>Collapse</h3><div class="${COLLAPSE_BASE}"><div class="h-fit">Content</div></div>`,
        `<h3>Collapse</h3>`,
        `<h3>Collapse</h3><div class="${COLLAPSE_BASE}"><div class="h-fit">Content</div></div>`,
    ]

    console.log(`\n📝 Test: ${name}`)
    let allPassed = true
    for (let i = 0; i < fullElements.length; i++) {
        ; (testObservables[name] as any)(i)
        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)
        const expectedFull = fullElements[i]
        const passed = ssrResult === expectedFull
        if (!passed) allPassed = false
        console.log(`   State ${i}: ${ssrResult} ${passed ? '✅' : `❌ (expected: ${expectedFull})`}`)
    }
    console.log(`   Result: ${allPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}\n`)

    if (!allPassed) {
        console.error(`❌ [${name}] SSR test failed`)
        process.exit(1)
    }
}

TestCollapse.test = {
    static: false,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        const inner = idx === 1 ? '' : `<div class="${COLLAPSE_BASE}"><div class="h-fit">Content</div></div>`
        const expected = idx === 1 ? '' : `<div class="${COLLAPSE_BASE}"><div class="h-fit">Content</div></div>`

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const fullElements = [
            `<h3>Collapse</h3><div class="${COLLAPSE_BASE}"><div class="h-fit">Content</div></div>`,
            `<h3>Collapse</h3>`,
            `<h3>Collapse</h3><div class="${COLLAPSE_BASE}"><div class="h-fit">Content</div></div>`,
        ]
        const expectedFull = fullElements[idx]
        if (ssrResult !== expectedFull) {
            assert(false, `[${name}] SSR mismatch: got \n${ssrResult}, expected \n${expectedFull}`)
        } else {
            console.log(`✅ [${name}] SSR test passed: ${ssrResult}`)
        }

        return expected
    }
}

export default () => <TestSnapshots Component={TestCollapse} />
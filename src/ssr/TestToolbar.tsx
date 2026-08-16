import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { Toolbar } from '../Toolbar'

const name = 'TestToolbar'
const TestToolbar = (): JSX.Element => {
    const states = [
        { children: 'Item' },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        return (
            <>
                <h3>Toolbar</h3>
                <Toolbar>{s.children}</Toolbar>
            </>
        )
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

const TOOLBAR = "relative flex items-center px-4 h-full"

// SSR test (Node.js)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestToolbar()

    const fullElements = [
        `<h3>Toolbar</h3><div class="${TOOLBAR}">Item</div>`,
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
        // Recorded rather than `process.exit(1)`: the runner imports every TestXxx module, so an
        // immediate exit here would hide the actual/expected output of every module after this one.
        // `ssr-test-runner.tsx` reads this list and exits non-zero once the whole suite has run.
        const g = globalThis as any
        ;(g.__ssrFailures ??= []).push(name)
    }
}

TestToolbar.test = {
    static: true,
    stateCount: 1,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        const expected = `<div class="${TOOLBAR}">Item</div>`

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const expectedFull = `<h3>Toolbar</h3><div class="${TOOLBAR}">Item</div>`
        if (ssrResult !== expectedFull) {
            assert(false, `[${name}] SSR mismatch: got \n${ssrResult}, expected \n${expectedFull}`)
        } else {
            // Counted, not just logged: the runner summary reports assertion passes, and a
            // silently-passing branch made a fully green suite still report zero passes.
            assert(true, `[${name}] SSR match`)
            console.log(`✅ [${name}] SSR test passed: ${ssrResult}`)
        }

        return expected
    }
}

export { TestToolbar }
export default () => <TestSnapshots Component={TestToolbar} />
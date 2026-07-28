import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { Zoomable } from '../Zoomable'

const name = 'TestZoomable'
const TestZoomable = (): JSX.Element => {
    const states = [
        { children: 'Zoomable Content' },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        return (
            <>
                <h3>Zoomable</h3>
                <Zoomable>{s.children}</Zoomable>
            </>
        )
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

const ZOOMABLE = "relative overflow-hidden touch-none border border-gray-300 rounded-lg"
const WRAPPER = "absolute top-0 left-0 w-full h-full origin-top-left will-change-transform"

// SSR test (Node.js)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestZoomable()

    const fullElements = [
        `<h3>Zoomable</h3><div class="${ZOOMABLE} cursor-grab" style="width: 400px; height: 400px;"><div class="${WRAPPER}" style="transform: translate(0px, 0px) scale(1);">Zoomable Content</div></div>`,
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

TestZoomable.test = {
    static: true,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        const expected = `<div class="${ZOOMABLE} cursor-grab" style="width: 400px; height: 400px;"><div class="${WRAPPER}" style="transform: translate(0px, 0px) scale(1);">Zoomable Content</div></div>`

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const expectedFull = `<h3>Zoomable</h3><div class="${ZOOMABLE} cursor-grab" style="width: 400px; height: 400px;"><div class="${WRAPPER}" style="transform: translate(0px, 0px) scale(1);">Zoomable Content</div></div>`
        if (ssrResult !== expectedFull) {
            assert(false, `[${name}] SSR mismatch: got \n${ssrResult}, expected \n${expectedFull}`)
        } else {
            console.log(`✅ [${name}] SSR test passed: ${ssrResult}`)
        }

        return expected
    }
}

export default () => <TestSnapshots Component={TestZoomable} />
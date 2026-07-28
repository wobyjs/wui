import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { Appbar } from '../Appbar'

const name = 'TestAppbar'
const TestAppbar = (): JSX.Element => {
    const states = [
        { children: 'App Bar' },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        return (
            <>
                <h3>Appbar</h3>
                <Appbar>{s.children}</Appbar>
            </>
        )
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

const VARIANT = "shadow-[rgba(0,0,0,0.2)_0px_2px_4px_-1px,rgba(0,0,0,0.14)_0px_4px_5px_0px,rgba(0,0,0,0.12)_0px_1px_10px_0px] [@media_screen]:flex [@media_screen]:flex-col w-full box-border shrink-0 z-[1100] bg-[rgb(25,118,210)] text-white left-auto [transition:box-shadow_300ms_cubic-bezier(0.4,0,0.2,1)0ms]"

// SSR test (Node.js)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestAppbar()

    const fullElements = [
        `<h3>Appbar</h3><header class="${VARIANT} fixed top-0">App Bar</header>`,
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

TestAppbar.test = {
    static: false,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        const expected = `<header class="${VARIANT} fixed top-0">App Bar</header>`

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const expectedFull = `<h3>Appbar</h3><header class="${VARIANT} fixed top-0">App Bar</header>`
        if (ssrResult !== expectedFull) {
            assert(false, `[${name}] SSR mismatch: got \n${ssrResult}, expected \n${expectedFull}`)
        } else {
            console.log(`✅ [${name}] SSR test passed: ${ssrResult}`)
        }

        return expected
    }
}

export default () => <TestSnapshots Component={TestAppbar} />
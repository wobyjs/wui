import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { Switch } from '../Switch'

const name = 'TestSwitch'
const TestSwitch = (): JSX.Element => {
    const states = [
        { checked: false },
        { checked: true },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        return (
            <>
                <h3>Switch</h3>
                <Switch id="test-switch" checked={s.checked}>{s.children}</Switch>
            </>
        )
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

// SSR test (Node.js)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestSwitch()

    const fullElements = [
        `<h3>Switch</h3><div><input id="test-switch" type="checkbox" /><div data-tg-on="ON" data-tg-off="OFF"><span data-tg-on="ON" data-tg-off="OFF"></span></div><span></span><label for="test-switch" data-tg-on="ON" data-tg-off="OFF"></label></div>`,
        `<h3>Switch</h3><div><input id="test-switch" type="checkbox" checked="" /><div data-tg-on="ON" data-tg-off="OFF"><span data-tg-on="ON" data-tg-off="OFF"></span></div><span></span><label for="test-switch" data-tg-on="ON" data-tg-off="OFF"></label></div>`,
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

TestSwitch.test = {
    static: false,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        const expected = `<div><input id="test-switch" type="checkbox"><div data-tg-on="ON" data-tg-off="OFF"><span data-tg-on="ON" data-tg-off="OFF"></span></div><span></span><label for="test-switch" data-tg-on="ON" data-tg-off="OFF"></label></div>`

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const fullChecked = idx === 1 ? ' checked=""' : ''
        const expectedFull = `<h3>Switch</h3><div><input id="test-switch" type="checkbox"${fullChecked} /><div data-tg-on="ON" data-tg-off="OFF"><span data-tg-on="ON" data-tg-off="OFF"></span></div><span></span><label for="test-switch" data-tg-on="ON" data-tg-off="OFF"></label></div>`
        if (ssrResult !== expectedFull) {
            assert(false, `[${name}] SSR mismatch: got \n${ssrResult}, expected \n${expectedFull}`)
        } else {
            console.log(`✅ [${name}] SSR test passed: ${ssrResult}`)
        }

        return expected
    }
}

export default () => <TestSnapshots Component={TestSwitch} />
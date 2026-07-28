import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { TextField } from '../TextField'

const name = 'TestTextField'
const TestTextField = (): JSX.Element => {
    const states = [
        { value: '', placeholder: 'Enter text' },
        { value: 'Hello', placeholder: 'Enter text' },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        return (
            <>
                <h3>TextField</h3>
                <TextField value={s.value} placeholder={s.placeholder} />
            </>
        )
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

const DEFAULT_STYLE = "block w-full py-1.5 px-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 sm:text-sm/6 truncate"
const BASE_CLASS = "relative z-0 flex items-center"

// SSR test (Node.js)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestTextField()

    const fullElements = [
        `<h3>TextField</h3><div class="${BASE_CLASS}" tabindex="-1"><div class="relative flex-1"><div class="relative flex items-center w-full gap-2"><div class="relative flex-1 min-w-0"><input class="${DEFAULT_STYLE}" value="" type="text" placeholder="Enter text" /><span class="focus-border focus-bg pointer-events-none"><i></i></span></div></div></div></div>`,
        `<h3>TextField</h3><div class="${BASE_CLASS}" tabindex="-1"><div class="relative flex-1"><div class="relative flex items-center w-full gap-2"><div class="relative flex-1 min-w-0"><input class="${DEFAULT_STYLE}" value="Hello" type="text" placeholder="Enter text" /><span class="focus-border focus-bg pointer-events-none"><i></i></span></div></div></div></div>`,
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

TestTextField.test = {
    static: false,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        const value = ['', 'Hello'][idx]
        const expected = `<div class="${BASE_CLASS}" tabindex="-1"><div class="relative flex-1"><div class="relative flex items-center w-full gap-2"><div class="relative flex-1 min-w-0"><input class="${DEFAULT_STYLE}" type="text" placeholder="Enter text"><span class="focus-border focus-bg pointer-events-none"><i></i></span></div></div></div></div>`

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const fullValue = ['', 'Hello'][idx]
        const expectedFull = `<h3>TextField</h3><div class="${BASE_CLASS}" tabindex="-1"><div class="relative flex-1"><div class="relative flex items-center w-full gap-2"><div class="relative flex-1 min-w-0"><input class="${DEFAULT_STYLE}" value="${fullValue}" type="text" placeholder="Enter text" /><span class="focus-border focus-bg pointer-events-none"><i></i></span></div></div></div></div>`
        if (ssrResult !== expectedFull) {
            assert(false, `[${name}] SSR mismatch: got \n${ssrResult}, expected \n${expectedFull}`)
        } else {
            console.log(`✅ [${name}] SSR test passed: ${ssrResult}`)
        }

        return expected
    }
}

export default () => <TestSnapshots Component={TestTextField} />
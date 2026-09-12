import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { NumberField } from '../NumberField'

const name = 'TestNumberField'
const TestNumberField = (): JSX.Element => {
    const states = [
        { value: 0 },
        { value: 50 },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        return (
            <>
                <h3>NumberField</h3>
                <NumberField value={s.value} />
            </>
        )
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

const NUM_INPUT = "number-input inline-flex items-center bg-white border border-gray-300 rounded-lg transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 divide-x divide-gray-200"
const INPUT_CLS = "w-16 flex-auto min-w-0 text-center border-none bg-transparent focus:outline-none focus:ring-0 text-base font-semibold text-gray-700 disabled:text-[#00000061] disabled:cursor-not-allowed [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
const BTN_DEC_CLS = "!rounded-none !rounded-l-md !w-8 !h-9 !border-r !border-gray-200 !bg-transparent disabled:!bg-[#d9dbda] disabled:!text-[#00000061] disabled:!cursor-not-allowed"
const BTN_INC_CLS = "!rounded-none !rounded-r-md !w-8 !h-9 !border-l !border-gray-200 !bg-transparent disabled:!bg-[#d9dbda] disabled:!text-[#00000061] disabled:!cursor-not-allowed"
const SPAN_CLS = "text-base leading-none font-semibold select-none"

// SSR test (Node.js)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestNumberField()

    const fullElements = [
        `<h3>NumberField</h3><div class="${NUM_INPUT}"><button type="button" class="${BTN_DEC_CLS}"><span class="${SPAN_CLS}">-</span></button><input class="${INPUT_CLS}" type="number" value="0" min="0" max="100" step="1" /><button type="button" class="${BTN_INC_CLS}"><span class="${SPAN_CLS}">+</span></button></div>`,
        `<h3>NumberField</h3><div class="${NUM_INPUT}"><button type="button" class="${BTN_DEC_CLS}"><span class="${SPAN_CLS}">-</span></button><input class="${INPUT_CLS}" type="number" value="50" min="0" max="100" step="1" /><button type="button" class="${BTN_INC_CLS}"><span class="${SPAN_CLS}">+</span></button></div>`,
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

TestNumberField.test = {
    static: false,
    stateCount: 2,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        const value = [0, 50][idx]
        const expected = `<div class="${NUM_INPUT}"><button type="button" class="${BTN_DEC_CLS}"><span class="${SPAN_CLS}">-</span></button><input class="${INPUT_CLS}" type="number" min="0" max="100" step="1"><button type="button" class="${BTN_INC_CLS}"><span class="${SPAN_CLS}">+</span></button></div>`

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const fullValue = [0, 50][idx]
        const expectedFull = `<h3>NumberField</h3><div class="${NUM_INPUT}"><button type="button" class="${BTN_DEC_CLS}"><span class="${SPAN_CLS}">-</span></button><input class="${INPUT_CLS}" type="number" value="${fullValue}" min="0" max="100" step="1" /><button type="button" class="${BTN_INC_CLS}"><span class="${SPAN_CLS}">+</span></button></div>`
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

export { TestNumberField }
export default () => <TestSnapshots Component={TestNumberField} />
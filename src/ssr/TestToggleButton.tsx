import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { ToggleButton } from '../ToggleButton'

const name = 'TestToggleButton'
const TestToggleButton = (): JSX.Element => {
    const states = [
        { checked: false, children: 'Bold' },
        { checked: true, children: 'Bold' },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        return (
            <>
                <h3>ToggleButton</h3>
                <ToggleButton checked={s.checked}>{s.children}</ToggleButton>
            </>
        )
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

const BASE = "inline-flex items-center justify-center px-2 py-1 rounded text-sm cursor-pointer select-none transition-colors duration-150 border border-transparent"
const OFF = "text-gray-600 bg-transparent hover:bg-gray-100"
const ON = "text-[#1976d2] bg-[#1976d2]/10 border-[#1976d2]/50 hover:bg-[#1976d2]/20"

// SSR test (Node.js)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestToggleButton()

    const fullElements = [
        `<h3>ToggleButton</h3><button type="button" aria-pressed="false" class="${BASE} ${OFF}">Bold</button>`,
        `<h3>ToggleButton</h3><button type="button" aria-pressed="true" class="${BASE} ${ON}">Bold</button>`,
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

TestToggleButton.test = {
    static: false,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        const variants = [OFF, ON]
        const pressed = idx === 1 ? 'true' : 'false'
        const expected = `<button type="button" aria-pressed="${pressed}" class="${BASE} ${variants[idx]}">Bold</button>`

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const expectedFull = `<h3>ToggleButton</h3><button type="button" aria-pressed="${pressed}" class="${BASE} ${variants[idx]}">Bold</button>`
        if (ssrResult !== expectedFull) {
            assert(false, `[${name}] SSR mismatch: got \n${ssrResult}, expected \n${expectedFull}`)
        } else {
            console.log(`✅ [${name}] SSR test passed: ${ssrResult}`)
        }

        return expected
    }
}

export default () => <TestSnapshots Component={TestToggleButton} />
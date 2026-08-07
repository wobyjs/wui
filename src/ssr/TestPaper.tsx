import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { Paper } from '../Paper'

const name = 'TestPaper'
const TestPaper = (): JSX.Element => {
    const states = [
        { elevation: 0 as const, content: 'Content' },
        { elevation: 1 as const, content: 'Content' },
        { elevation: 3 as const, content: 'Content' },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        return (
            <>
                <h3>Paper</h3>
                <Paper elevation={s.elevation}>{s.content}</Paper>
            </>
        )
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

const BASE = "bg-white transition-shadow duration-300 ease-in-out rounded-lg"
const SHADOWS = ['shadow-none', 'shadow-sm', 'shadow-md']

// SSR test (Node.js)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestPaper()

    const fullElements = SHADOWS.map(s => `<h3>Paper</h3><div class="${BASE} ${s}">Content</div>`)

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

TestPaper.test = {
    static: false,
    stateCount: 3,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        const expected = `<div class="${BASE} ${SHADOWS[idx]}">Content</div>`

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const expectedFull = `<h3>Paper</h3><div class="${BASE} ${SHADOWS[idx]}">Content</div>`
        if (ssrResult !== expectedFull) {
            assert(false, `[${name}] SSR mismatch: got \n${ssrResult}, expected \n${expectedFull}`)
        } else {
            console.log(`✅ [${name}] SSR test passed: ${ssrResult}`)
        }

        return expected
    }
}

export { TestPaper }
export default () => <TestSnapshots Component={TestPaper} />

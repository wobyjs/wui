import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { Checkbox } from '../Checkbox'

const name = 'TestCheckbox'

// Fixed IDs for deterministic SSR output
const IDS = ['test-cb-0', 'test-cb-1', 'test-cb-2']

const TestCheckbox = (): JSX.Element => {
    const states = [
        { labelPosition: 'left' as const, children: 'Remember', checked: false, id: IDS[0] },
        { labelPosition: 'right' as const, children: 'Agree', checked: false, id: IDS[1] },
        { labelPosition: 'top' as const, children: 'On', checked: true, id: IDS[2] },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        return (
            <>
                <h3>Checkbox</h3>
                <Checkbox labelPosition={s.labelPosition} checked={s.checked} id={s.id}>{s.children}</Checkbox>
            </>
        )
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

// Markup order is fixed — input first, then label — with placement expressed as flex direction on
// the wrapper (see the comment in `src/Checkbox.tsx`). The old expectations assumed two
// conditionally-rendered labels and `<br>` separators, which the component no longer emits.
const WRAP = ['inline-flex flex-row-reverse items-center', 'inline-flex flex-row items-center', 'inline-flex flex-col-reverse items-start']
const PAD = ['select-none pr-1.5', 'select-none pl-1.5', 'select-none pb-1.5']
const TEXT = ['Remember', 'Agree', 'On']
// State 2 is the only checked state; `renderToString` reflects it as an empty attribute.
const CHECKED = ['', '', ' checked=""']

const ssrElement = (i: number) =>
    `<h3>Checkbox</h3><div class="${WRAP[i]}"><input id="${IDS[i]}" type="checkbox"${CHECKED[i]} /><label class="${PAD[i]}" for="${IDS[i]}">${TEXT[i]}</label></div>`

// SSR test (Node.js)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestCheckbox()

    const fullElements = [ssrElement(0), ssrElement(1), ssrElement(2)]

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

TestCheckbox.test = {
    static: false,
    stateCount: 3,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        // Browser (live-DOM) form: void elements are serialized without the trailing slash, and
        // `checked` is set as a property so it never appears as an attribute.
        const expected = `<div class="${WRAP[idx]}"><input id="${IDS[idx]}" type="checkbox"><label class="${PAD[idx]}" for="${IDS[idx]}">${TEXT[idx]}</label></div>`

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const expectedFull = ssrElement(idx)
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

export { TestCheckbox }
export default () => <TestSnapshots Component={TestCheckbox} />
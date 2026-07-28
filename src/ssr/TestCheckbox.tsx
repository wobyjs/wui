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

// SSR test (Node.js)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestCheckbox()

    const fullElements = [
        `<h3>Checkbox</h3><div><label class="pr-1.5 select-none" for="${IDS[0]}"> Remember </label><input id="${IDS[0]}" type="checkbox" /></div>`,
        `<h3>Checkbox</h3><div><input id="${IDS[1]}" type="checkbox" /><label class="pl-1.5 select-none" for="${IDS[1]}"> Agree </label></div>`,
        `<h3>Checkbox</h3><div><label class="pr-1.5 select-none" for="${IDS[2]}"> On </label><br /><input id="${IDS[2]}" type="checkbox" checked="" /><br /></div>`,
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

TestCheckbox.test = {
    static: false,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        const elements = [
            `<div><label class="pr-1.5 select-none" for="${IDS[0]}"> Remember </label><input id="${IDS[0]}" type="checkbox"></div>`,
            `<div><input id="${IDS[1]}" type="checkbox"><label class="pl-1.5 select-none" for="${IDS[1]}"> Agree </label></div>`,
            `<div><label class="pr-1.5 select-none" for="${IDS[2]}"> On </label><br><input id="${IDS[2]}" type="checkbox"><br></div>`,
        ]
        const expected = elements[idx]

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const fullElements = [
            `<h3>Checkbox</h3><div><label class="pr-1.5 select-none" for="${IDS[0]}"> Remember </label><input id="${IDS[0]}" type="checkbox" /></div>`,
            `<h3>Checkbox</h3><div><input id="${IDS[1]}" type="checkbox" /><label class="pl-1.5 select-none" for="${IDS[1]}"> Agree </label></div>`,
            `<h3>Checkbox</h3><div><label class="pr-1.5 select-none" for="${IDS[2]}"> On </label><br /><input id="${IDS[2]}" type="checkbox" checked="" /><br /></div>`,
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

export default () => <TestSnapshots Component={TestCheckbox} />
import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { SideBar } from '../SideBar'

const name = 'TestSideBar'
const TestSideBar = (): JSX.Element => {
    const states = [
        { open: false, children: 'Sidebar' },
        { open: true, children: 'Sidebar' },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        return (
            <>
                <h3>SideBar</h3>
                <SideBar open={s.open} top={56}>{s.children}</SideBar>
            </>
        )
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

const BASE_CLASS = "fixed h-full left-0 overflow-x-hidden transition-all duration-500 ease-in-out flex items-start z-[10]"

// SSR test (Node.js)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestSideBar()

    const fullElements = [
        `<h3>SideBar</h3><div class="${BASE_CLASS}" style="width: 0px; top: 56px;"><slot><div class="w-full h-full flex flex-col justify-end">Sidebar</div></slot></div>`,
        `<h3>SideBar</h3><div class="${BASE_CLASS}" style="width: 250px; top: 56px;"><slot><div class="w-full h-full flex flex-col justify-end">Sidebar</div></slot></div>`,
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

TestSideBar.test = {
    static: false,
    stateCount: 2,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        const fullWidth = idx === 1 ? '250px' : '0px'
        const expected = `<div class="${BASE_CLASS}" style="width: ${fullWidth}; top: 56px;"></div>`

        // Run SSR assertion internally
        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const fullElements = [
            `<h3>SideBar</h3><div class="${BASE_CLASS}" style="width: 0px; top: 56px;"><slot><div class="w-full h-full flex flex-col justify-end">Sidebar</div></slot></div>`,
            `<h3>SideBar</h3><div class="${BASE_CLASS}" style="width: 250px; top: 56px;"><slot><div class="w-full h-full flex flex-col justify-end">Sidebar</div></slot></div>`,
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

export { TestSideBar }
export default () => <TestSnapshots Component={TestSideBar} />
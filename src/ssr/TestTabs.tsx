import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { Tabs, Tab } from '../Tabs'

const name = 'TestTabs'
const TestTabs = (): JSX.Element => {
    const states = [
        { children: [<Tab title="Tab 1">Content 1</Tab>, <Tab title="Tab 2">Content 2</Tab>] },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        return (
            <>
                <h3>Tabs</h3>
                <Tabs>{s.children}</Tabs>
            </>
        )
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

const BTN_CLS = "px-4 py-2 rounded-lg font-bold transition-colors duration-200 cursor-pointer select-none bg-black text-white"

// SSR test (Node.js)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestTabs()

    // Note: Tabs uses useEffect to discover tab titles from children DOM.
    // In SSR, useEffect runs after initial render, so titles are empty
    // and navigation buttons are not rendered. This is expected SSR behavior.
    const fullElements = [
        `<h3>Tabs</h3><div><div class="flex justify-center flex-wrap gap-2 my-4 border-2 border-gray-200 py-2 rounded-lg"></div><div class="p-4 border border-gray-200 rounded-b-lg shadow-sm bg-white min-h-[50px]"><div data-tab-title="Tab 1" title="Tab 1">Content 1</div><div data-tab-title="Tab 2" title="Tab 2">Content 2</div></div></div>`,
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

TestTabs.test = {
    static: false,
    stateCount: 1,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        // Note: In browser DOM mode, useEffect runs, so tabs ARE rendered there.
        // This expect() verifies the browser renderToString which also runs SSR path.
        const expected = `<div><div class="flex justify-center flex-wrap gap-2 my-4 border-2 border-gray-200 py-2 rounded-lg"><button type="button" class="px-4 py-2 rounded-lg font-bold transition-colors duration-200 cursor-pointer select-none bg-black text-white">Tab 1</button><button type="button" class="px-4 py-2 rounded-lg font-bold transition-colors duration-200 cursor-pointer select-none bg-gray-100 text-gray-600 hover:bg-gray-200">Tab 2</button></div><div class="p-4 border border-gray-200 rounded-b-lg shadow-sm bg-white min-h-[50px]"><div data-tab-title="Tab 1" title="Tab 1" style="display: block;">Content 1</div><div data-tab-title="Tab 2" title="Tab 2" hidden="" style="display: none;">Content 2</div></div></div>`

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const expectedFull = `<h3>Tabs</h3><div><div class="flex justify-center flex-wrap gap-2 my-4 border-2 border-gray-200 py-2 rounded-lg"></div><div class="p-4 border border-gray-200 rounded-b-lg shadow-sm bg-white min-h-[50px]"><div data-tab-title="Tab 1" title="Tab 1">Content 1</div><div data-tab-title="Tab 2" title="Tab 2">Content 2</div></div></div>`
        if (ssrResult !== expectedFull) {
            assert(false, `[${name}] SSR mismatch: got \n${ssrResult}, expected \n${expectedFull}`)
        } else {
            console.log(`✅ [${name}] SSR test passed: ${ssrResult}`)
        }

        return expected
    }
}

export { TestTabs }
export default () => <TestSnapshots Component={TestTabs} />
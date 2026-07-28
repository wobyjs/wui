import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { Fab } from '../Fab'

const name = 'TestFab'
const TestFab = (): JSX.Element => {
    const states = [
        { type: 'pill' as const, children: '+' },
        { type: 'circular' as const, children: '★' },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        return (
            <>
                <h3>Fab</h3>
                <Fab type={s.type}>{s.children}</Fab>
            </>
        )
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

const PILL = "absolute bg-[rgb(25,118,210)] text-[white] text-4xl font-black cursor-pointer shadow-[0px_4px_8px_rgba(0,0,0,0.3)] transition-[background-color] duration-[0.3s] px-5 py-[15px] rounded-[50px] border-[none] [transition:top_0.3s_ease,left_0.3s_ease] z-[1050]"
const CIRCULAR = "inline-flex items-center justify-center relative box-border cursor-pointer select-none align-middle appearance-none no-underline font-medium text-lg z-[1050] shadow-[rgba(0,0,0,0.2)_0px_3px_5px_-1px,rgba(0,0,0,0.14)_0px_6px_10px_0px,rgba(0,0,0,0.12)_0px_1px_18px_0px] text-white m-2 p-0 rounded-[50%] border-0 [transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms] outline-none w-14 h-14 bg-[rgb(25,118,210)] hover:bg-[rgb(21,101,192)]"

// SSR test (Node.js)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestFab()

    const fullElements = [
        `<h3>Fab</h3><button class="${PILL}"><div class="flex items-center">+</div></button>`,
        `<h3>Fab</h3><button class="${CIRCULAR}"><div class="flex items-center">★</div></button>`,
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

TestFab.test = {
    static: false,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        const variants = [PILL, CIRCULAR]
        const expected = `<button class="${variants[idx]}"><div class="flex items-center">${['+', '★'][idx]}</div></button>`

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const fullElements = [
            `<h3>Fab</h3><button class="${PILL}"><div class="flex items-center">+</div></button>`,
            `<h3>Fab</h3><button class="${CIRCULAR}"><div class="flex items-center">★</div></button>`,
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

export default () => <TestSnapshots Component={TestFab} />
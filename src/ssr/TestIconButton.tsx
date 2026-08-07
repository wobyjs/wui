import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { IconButton } from '../IconButton'

const name = 'TestIconButton'
const TestIconButton = (): JSX.Element => {
    const states = [
        { disabled: false, children: '★' },
        { disabled: true, children: 'X' },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        return (
            <>
                <h3>IconButton</h3>
                <IconButton disabled={s.disabled}>{s.children}</IconButton>
            </>
        )
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

const BASE = "inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle appearance-none no-underline text-center flex-[0_0_auto] text-2xl overflow-visible text-[rgba(0,0,0,0.54)] transition-[background-color] duration ease-in-out delay-[0ms] m-0 p-2 rounded-[50%] border-0 [outline:0px] duration-[0.3s] hover:bg-[#dde0dd] [&_svg]:w-[1em] [&_svg]:h-[1em] [&_svg]:fill-current [&_img]:w-[1em] [&_img]:h-[1em] disabled:bg-transparent disabled:text-[rgba(0,0,0,0.26)] disabled:pointer-events-none disabled:cursor-default disabled:[&_svg]:fill-[rgba(0,0,0,0.26)]"

// SSR test (Node.js)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestIconButton()

    const fullElements = [
        `<h3>IconButton</h3><button class="${BASE}">★</button>`,
        `<h3>IconButton</h3><button disabled="" class="${BASE}">X</button>`,
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

TestIconButton.test = {
    static: false,
    stateCount: 2,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        const disabled = idx === 1 ? ' disabled=""' : ''
        const expected = `<button${disabled} class="${BASE}">${['★', 'X'][idx]}</button>`

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const fullElements = [
            `<h3>IconButton</h3><button class="${BASE}">★</button>`,
            `<h3>IconButton</h3><button disabled="" class="${BASE}">X</button>`,
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

export { TestIconButton }
export default () => <TestSnapshots Component={TestIconButton} />
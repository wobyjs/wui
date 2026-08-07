import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { Button } from '../Button'

const name = 'TestButton'
const TestButton = (): JSX.Element => {
    const states = [
        { type: 'contained' as const, children: 'Contained', disabled: false },
        { type: 'outlined' as const, children: 'Outlined', disabled: false },
        { type: 'text' as const, children: 'Text', disabled: false },
        { type: 'contained' as const, children: 'Disabled', disabled: true },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        return (
            <>
                <h3>Button</h3>
                <Button type={s.type} disabled={s.disabled}>{s.children}</Button>
            </>
        )
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

// Variant class strings (copied from Button.tsx for SSR matching)
const CONTAINED = [
    "inline-flex items-center justify-center relative box-border cursor-pointer select-none align-middle no-underline",
    "font-medium text-sm leading-[1.75] tracking-[0.02857em] uppercase rounded text-white bg-[#1976d2]",
    "rounded-[4px] border-0 outline-0 font-sans px-4 py-2",
    "shadow-[0px_3px_1px_-2px_rgba(0,0,0,0.2),0px_2px_2px_0px_rgba(0,0,0,0.14),0px_1px_5px_0px_rgba(0,0,0,0.12)]",
    "[transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]",
    "hover:no-underline",
    "hover:bg-[#1565c0]",
    "hover:shadow-[0px_2px_4px_-1px_rgba(0,0,0,0.2),0px_4px_5px_0px_rgba(0,0,0,0.14),0px_1px_10px_0px_rgba(0,0,0,0.12)]",
    "active:shadow-[0px_5px_5px_-3px_rgba(0,0,0,0.2),0px_8px_10px_1px_rgba(0,0,0,0.14),0px_3px_14px_2px_rgba(0,0,0,0.12)]",
    "disabled:text-[rgba(0,0,0,0.26)]",
    "disabled:shadow-none",
    "disabled:bg-[rgba(0,0,0,0.12)]",
    "disabled:pointer-events-none",
    "disabled:cursor-default",
].join(" ")

const OUTLINED = [
    "inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle no-underline font-medium",
    "text-sm leading-[1.75] tracking-[0.02857em] uppercase rounded border text-[#1976d2] rounded-[4px]",
    "border-solid font-sans px-4 py-2",
    "[transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]",
    "hover:no-underline",
    "hover:bg-[rgba(25,118,210,0.04)]",
    "hover:border",
    "hover:border-solid",
    "hover:border-[#1976d2]",
    "disabled:text-[rgba(0,0,0,0.26)]",
    "disabled:border",
    "disabled:border-solid",
    "disabled:border-[rgba(0,0,0,0.12)]",
    "disabled:pointer-events-none",
    "disabled:cursor-default",
].join(" ")

const TEXT = [
    "inline-flex items-center justify-center relative box-border bg-transparent cursor-pointer select-none align-middle no-underline",
    "font-medium text-sm leading-[1.75] tracking-[0.02857em] uppercase rounded text-[#1976d2]",
    "rounded-[4px] border-0 outline-0 font-sans px-4 py-2",
    "[transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_250ms_cubic-bezier(0.4,0,0.2,1)0ms,border-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms,color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]",
    "hover:no-underline",
    "hover:bg-[rgba(25,118,210,0.04)]",
    "disabled:text-[rgba(0,0,0,0.26)]",
    "disabled:pointer-events-none",
    "disabled:cursor-default",
].join(" ")

// SSR test (Node.js)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestButton()

    const fullElements = [
        `<h3>Button</h3><button type="button" class="${CONTAINED}">Contained</button>`,
        `<h3>Button</h3><button type="button" class="${OUTLINED}">Outlined</button>`,
        `<h3>Button</h3><button type="button" class="${TEXT}">Text</button>`,
        `<h3>Button</h3><button type="button" disabled="" class="${CONTAINED}">Disabled</button>`,
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

TestButton.test = {
    static: false,
    stateCount: 4,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        const variants = [CONTAINED, OUTLINED, TEXT, CONTAINED]
        const disabled = idx === 3 ? ' disabled=""' : ''
        const expected = `<button type="button"${disabled} class="${variants[idx]}">${['Contained', 'Outlined', 'Text', 'Disabled'][idx]}</button>`

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const fullVariants = [CONTAINED, OUTLINED, TEXT, CONTAINED]
        const fullDisabled = idx === 3 ? ' disabled=""' : ''
        const expectedFull = `<h3>Button</h3><button type="button"${fullDisabled} class="${fullVariants[idx]}">${['Contained', 'Outlined', 'Text', 'Disabled'][idx]}</button>`
        if (ssrResult !== expectedFull) {
            assert(false, `[${name}] SSR mismatch: got \n${ssrResult}, expected \n${expectedFull}`)
        } else {
            console.log(`✅ [${name}] SSR test passed: ${ssrResult}`)
        }

        return expected
    }
}

export { TestButton }
export default () => <TestSnapshots Component={TestButton} />
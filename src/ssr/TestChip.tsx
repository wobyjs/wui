import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { Chip } from '../Chip'

const name = 'TestChip'
const TestChip = (): JSX.Element => {
    const states = [
        { deletable: false, children: 'Label' },
        { deletable: true, children: 'Label' },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        return (
            <>
                <h3>Chip</h3>
                <Chip deletable={s.deletable}>{s.children}</Chip>
            </>
        )
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

const CHIP_BASE = "relative cursor-pointer select-none appearance-none max-w-full text-[0.8125rem] inline-flex items-center justify-center h-8 text-[rgba(0,0,0,0.87)] bg-[rgba(0,0,0,0.08)] no-underline align-middle box-border m-0 p-0 rounded-2xl border-0 [transition:background-color_300ms_cubic-bezier(0.4,0,0.2,1)0ms,box-shadow_300ms_cubic-bezier(0.4,0,0.2,1)0ms] [outline:0px]"
const CHIP_INNER = `<span class="overflow-hidden text-ellipsis whitespace-nowrap px-3 py-1 inline-flex items-center gap-1">Label</span>`
const CHIP_DELETE_ICON = `<div class="chip-delete-icon cursor-pointer"><svg class="text-[rgba(0,0,0,0.26)] text-[22px] cursor-pointer select-none w-[1em] h-[1em] inline-block fill-current shrink-0 text-2xl -ml-1.5 mr-[5px] my-0 [transition:fill_200ms_cubic-bezier(0.4,0,0.2,1)0ms] hover:text-[rgba(0,0,0,0.4)]" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="CancelIcon"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path></svg></div>`

// SSR test (Node.js)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestChip()

    const fullElements = [
        `<h3>Chip</h3><div class="${CHIP_BASE}" tabindex="0" role="button">${CHIP_INNER}</div>`,
        `<h3>Chip</h3><div class="${CHIP_BASE}" tabindex="0" role="button">${CHIP_INNER}${CHIP_DELETE_ICON}</div>`,
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

TestChip.test = {
    static: false,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        const deleteIcon = idx === 1 ? CHIP_DELETE_ICON : ''
        const expected = `<div class="${CHIP_BASE}" tabindex="0" role="button">${CHIP_INNER}${deleteIcon}</div>`

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const fullElements = [
            `<h3>Chip</h3><div class="${CHIP_BASE}" tabindex="0" role="button">${CHIP_INNER}</div>`,
            `<h3>Chip</h3><div class="${CHIP_BASE}" tabindex="0" role="button">${CHIP_INNER}${CHIP_DELETE_ICON}</div>`,
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

export default () => <TestSnapshots Component={TestChip} />
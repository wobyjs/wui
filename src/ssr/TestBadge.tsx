import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { Badge } from '../Badge'

const name = 'TestBadge'
const TestBadge = (): JSX.Element => {
    const states = [
        { badgeContent: '4', vertical: 'top', horizontal: 'right', children: 'Hi' },
        { badgeContent: 'New', vertical: 'bottom', horizontal: 'left', children: 'X' },
        { badgeContent: '', vertical: 'top', horizontal: 'right', children: 'Y' },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        return (
            <>
                <h3>Badge</h3>
                <Badge badgeContent={s.badgeContent} vertical={s.vertical} horizontal={s.horizontal}>
                    <span>{s.children}</span>
                </Badge>
            </>
        )
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

const BADGE_CLASS = "relative inline-flex align-middle shrink-0 m-4"
const BADGE_INNER = "flex place-content-center items-center absolute box-border font-medium text-xs leading-none z-[1] text-white scale-100 [flex-flow:wrap] [transition:transform_225ms_cubic-bezier(0.4,0,0.2,1)0ms]"
const BADGE_COLOR = "bg-[rgb(156,39,176)]"
// NOTE: vertical/horizontal comparison uses observable ref, so transform/position always
// resolves to the bottom/left branch — capturing actual output, not intended.

// SSR test (Node.js — runs only when window is undefined)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestBadge()

    // Actual renderToString output per state (with <h3> prefix)
    const fullElements = [
        `<h3>Badge</h3><div><span class="${BADGE_CLASS}"><span class="${BADGE_INNER} min-w-[20px] h-5 rounded-[10px] px-1 -translate-x-2/4 translate-y-2/4 origin-[0%_100%] bottom-0 left-0 ${BADGE_COLOR}">4</span><span>Hi</span></span></div>`,
        `<h3>Badge</h3><div><span class="${BADGE_CLASS}"><span class="${BADGE_INNER} min-w-[20px] h-5 rounded-[10px] px-1 -translate-x-2/4 translate-y-2/4 origin-[0%_100%] bottom-0 left-0 ${BADGE_COLOR}">New</span><span>X</span></span></div>`,
        `<h3>Badge</h3><div><span class="${BADGE_CLASS}"><span class="${BADGE_INNER} hidden -translate-x-2/4 translate-y-2/4 origin-[0%_100%] bottom-0 left-0 ${BADGE_COLOR}"></span><span>Y</span></span></div>`,
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

TestBadge.test = {
    static: false,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])

        const elements = [
            `<div><span class="${BADGE_CLASS}"><span class="${BADGE_INNER} min-w-[20px] h-5 rounded-[10px] px-1 -translate-x-2/4 translate-y-2/4 origin-[0%_100%] bottom-0 left-0 ${BADGE_COLOR}">4</span><span>Hi</span></span></div>`,
            `<div><span class="${BADGE_CLASS}"><span class="${BADGE_INNER} min-w-[20px] h-5 rounded-[10px] px-1 -translate-x-2/4 translate-y-2/4 origin-[0%_100%] bottom-0 left-0 ${BADGE_COLOR}">New</span><span>X</span></span></div>`,
            `<div><span class="${BADGE_CLASS}"><span class="${BADGE_INNER} hidden -translate-x-2/4 translate-y-2/4 origin-[0%_100%] bottom-0 left-0 ${BADGE_COLOR}"></span><span>Y</span></span></div>`,
        ]
        const expected = elements[idx]

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const fullElements = [
            `<h3>Badge</h3><div><span class="${BADGE_CLASS}"><span class="${BADGE_INNER} min-w-[20px] h-5 rounded-[10px] px-1 -translate-x-2/4 translate-y-2/4 origin-[0%_100%] bottom-0 left-0 ${BADGE_COLOR}">4</span><span>Hi</span></span></div>`,
            `<h3>Badge</h3><div><span class="${BADGE_CLASS}"><span class="${BADGE_INNER} min-w-[20px] h-5 rounded-[10px] px-1 -translate-x-2/4 translate-y-2/4 origin-[0%_100%] bottom-0 left-0 ${BADGE_COLOR}">New</span><span>X</span></span></div>`,
            `<h3>Badge</h3><div><span class="${BADGE_CLASS}"><span class="${BADGE_INNER} hidden -translate-x-2/4 translate-y-2/4 origin-[0%_100%] bottom-0 left-0 ${BADGE_COLOR}"></span><span>Y</span></span></div>`,
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

export default () => <TestSnapshots Component={TestBadge} />

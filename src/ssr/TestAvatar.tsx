import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { Avatar } from '../Avatar'

const name = 'TestAvatar'
const TestAvatar = (): JSX.Element => {
    const states = [
        { size: 'xs' as const, type: 'circular' as const, src: '', alt: 'A' },
        { size: 'sm' as const, type: 'rounded' as const, src: 'x.png', alt: 'Avatar' },
        { size: 'md' as const, type: 'square' as const, src: '', alt: 'B' },
        { size: 'lg' as const, type: 'circular' as const, src: 'y.png', alt: 'User' },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        return (
            <>
                <h3>Avatar</h3>
                <Avatar size={s.size} type={s.type} src={s.src} alt={s.alt} />
            </>
        )
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

// Conditional: SSR tests (Node.js environment - tsx mode)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestAvatar()

    const BASE_CLASS = "relative flex items-center justify-center align-middle select-none leading-none overflow-hidden shrink-0 m-0 bg-[rgb(189,189,189)] text-white"

    const fullElements = [
        `<h3>Avatar</h3><div class="rounded-full w-6 h-6 text-xs ${BASE_CLASS}"></div>`,
        `<h3>Avatar</h3><div class="rounded-xl w-8 h-8 text-sm ${BASE_CLASS}"><img src="x.png" alt="Avatar" class="w-full h-full object-cover" /></div>`,
        `<h3>Avatar</h3><div class="rounded-md w-10 h-10 text-base ${BASE_CLASS}"></div>`,
        `<h3>Avatar</h3><div class="rounded-full w-12 h-12 text-lg ${BASE_CLASS}"><img src="y.png" alt="User" class="w-full h-full object-cover" /></div>`,
    ]

    console.log(`\n📝 Test: ${name}`)
    let allPassed = true
    for (let i = 0; i < 4; i++) {
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

TestAvatar.test = {
    static: false,
    stateCount: 4,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        const BASE_CLASS = "relative flex items-center justify-center align-middle select-none leading-none overflow-hidden shrink-0 m-0 bg-[rgb(189,189,189)] text-white"
        const elements: (string | string[])[] = [
            `<div class="rounded-full w-6 h-6 text-xs ${BASE_CLASS}"></div>`,
            [
                `<div class="rounded-xl w-8 h-8 text-sm ${BASE_CLASS}"><img src="x.png" alt="Avatar" class="w-full h-full object-cover"></div>`,
                `<div class="rounded-xl w-8 h-8 text-sm ${BASE_CLASS}"><img src="x.png" alt="Avatar" class="w-full h-full object-cover" style="display: none;"></div>`,
            ],
            `<div class="rounded-md w-10 h-10 text-base ${BASE_CLASS}"></div>`,
            [
                `<div class="rounded-full w-12 h-12 text-lg ${BASE_CLASS}"><img src="y.png" alt="User" class="w-full h-full object-cover"></div>`,
                `<div class="rounded-full w-12 h-12 text-lg ${BASE_CLASS}"><img src="y.png" alt="User" class="w-full h-full object-cover" style="display: none;"></div>`,
            ],
        ]
        const expected = elements[idx]

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const fullElements = [
            `<h3>Avatar</h3><div class="rounded-full w-6 h-6 text-xs ${BASE_CLASS}"></div>`,
            `<h3>Avatar</h3><div class="rounded-xl w-8 h-8 text-sm ${BASE_CLASS}"><img src="x.png" alt="Avatar" class="w-full h-full object-cover" /></div>`,
            `<h3>Avatar</h3><div class="rounded-md w-10 h-10 text-base ${BASE_CLASS}"></div>`,
            `<h3>Avatar</h3><div class="rounded-full w-12 h-12 text-lg ${BASE_CLASS}"><img src="y.png" alt="User" class="w-full h-full object-cover" /></div>`,
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

export { TestAvatar }
export default () => <TestSnapshots Component={TestAvatar} />
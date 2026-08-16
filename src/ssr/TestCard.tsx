import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { Card, CardMedia, CardContent, CardActions } from '../Card'

const name = 'TestCard'
const TestCard = (): JSX.Element => {
    const states = [
        { variant: 'elevated' as const, elevation: 1, content: 'Body' },
        { variant: 'outlined' as const, elevation: 0, content: 'Act' },
        { variant: 'filled' as const, elevation: 2, content: '' },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        if (s.variant === 'elevated') {
            return (
                <>
                    <h3>Card</h3>
                    <Card variant="elevated" elevation={1}><CardContent padding="p-4">Body</CardContent></Card>
                </>
            )
        } else if (s.variant === 'outlined') {
            return (
                <>
                    <h3>Card</h3>
                    <Card variant="outlined"><CardActions align="end" padding="p-2">Act</CardActions></Card>
                </>
            )
        } else {
            return (
                <>
                    <h3>Card</h3>
                    <Card variant="filled" elevation={2}><CardMedia src="i.png" alt="Img" height="100px" /></Card>
                </>
            )
        }
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

const CARD_BASE = "bg-white text-[rgba(0,0,0,0.87)] rounded overflow-hidden transition-[box-shadow,transform] duration-300 ease-in-out [transition-delay:0ms]"

// SSR test (Node.js)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestCard()

    const fullElements = [
        `<h3>Card</h3><div class="${CARD_BASE} shadow-md "><div class="p-4">Body</div></div>`,
        `<h3>Card</h3><div class="${CARD_BASE} border border-[rgba(0,0,0,0.12)] shadow-none "><div class="flex items-center justify-end p-2">Act</div></div>`,
        `<h3>Card</h3><div class="${CARD_BASE} !bg-gray-50 shadow-lg "><div role="img" title="Img" aria-label="Img" class="block bg-no-repeat" style="height: 100px; background-image: url(i.png); background-position: center center; background-size: cover;"></div></div>`,
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
        // Recorded rather than `process.exit(1)`: the runner imports every TestXxx module, so an
        // immediate exit here would hide the actual/expected output of every module after this one.
        // `ssr-test-runner.tsx` reads this list and exits non-zero once the whole suite has run.
        const g = globalThis as any
        ;(g.__ssrFailures ??= []).push(name)
    }
}

TestCard.test = {
    static: false,
    stateCount: 3,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        const variants = [
            `${CARD_BASE} shadow-md`,
            `${CARD_BASE} border border-[rgba(0,0,0,0.12)] shadow-none`,
            `${CARD_BASE} !bg-gray-50 shadow-lg`,
        ]
        const inners = [
            `<div class="p-4">Body</div>`,
            `<div class="flex items-center justify-end p-2">Act</div>`,
            `<div role="img" title="Img" aria-label="Img" class="block bg-no-repeat" style="height: 100px; background-image: url("i.png"); background-position: center center; background-size: cover;"></div>`,
        ]
        const expected = `<div class="${variants[idx]}">${inners[idx]}</div>`

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const fullElements = [
            `<h3>Card</h3><div class="${CARD_BASE} shadow-md "><div class="p-4">Body</div></div>`,
            `<h3>Card</h3><div class="${CARD_BASE} border border-[rgba(0,0,0,0.12)] shadow-none "><div class="flex items-center justify-end p-2">Act</div></div>`,
            `<h3>Card</h3><div class="${CARD_BASE} !bg-gray-50 shadow-lg "><div role="img" title="Img" aria-label="Img" class="block bg-no-repeat" style="height: 100px; background-image: url(i.png); background-position: center center; background-size: cover;"></div></div>`,
        ]
        const expectedFull = fullElements[idx]
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

export { TestCard }
export default () => <TestSnapshots Component={TestCard} />
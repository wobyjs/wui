import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { TextArea } from '../TextArea'

const name = 'TestTextArea'
const TestTextArea = (): JSX.Element => {
    const states = [
        { value: '', placeholder: 'Enter text' },
        { value: 'Hello', placeholder: 'Enter text' },
    ]
    const index = $(0)
    registerTestObservable(name, index)
    const increment = () => index(prev => (prev + 1) % states.length)
    useInterval(increment, TEST_INTERVAL)

    const getCurrentElement = () => {
        const s = states[index()]
        return (
            <>
                <h3>TextArea</h3>
                <TextArea value={s.value} placeholder={s.placeholder} />
            </>
        )
    }

    const ret: JSX.Element = () => getCurrentElement()

    registerTestObservable(`${name}_ssr`, ret)

    return ret
}

const TEXTAREA_CLS = "focus:[outline:none] border border-solid border-[#ccc] px-3.5 py-2 duration-[0.4s] bg-transparent z-10 w-full [&~label]:absolute [&~label]:w-full [&~label]:text-[#aaa] [&~label]:duration-[0.3s] [&~label]:z-0 [&~label]:tracking-[0.5px] [&~label]:left-3.5 [&~label]:top-2.5 [&:focus~label]:top-[-12px] [&:focus~label]:text-xs [&:focus~label]:text-[#4caf50] [&:focus~label]:duration-[0.3s] [&:focus~label]:left-[7px] [&:focus~label]:bg-[white] [&:focus~label]:w-fit [&:focus~label]:z-10 [&:focus~label]:py-1 [&:focus~label]:px-1 [&:not(:placeholder-shown)~label]:top-[-12px] [&:not(:placeholder-shown)~label]:text-xs [&:not(:placeholder-shown)~label]:text-[#4caf50] [&:not(:placeholder-shown)~label]:duration-[0.3s] [&:not(:placeholder-shown)~label]:left-[7px] [&:not(:placeholder-shown)~label]:bg-[white] [&:not(:placeholder-shown)~label]:w-fit [&:not(:placeholder-shown)~label]:z-10 [&:not(:placeholder-shown)~label]:py-1 [&:not(:placeholder-shown)~label]:px-1 [&~span]:before:content-[''] [&~span]:before:absolute [&~span]:before:-top-px [&~span]:before:left-2/4 [&~span]:before:w-0 [&~span]:before:h-0.5 [&~span]:before:bg-[#4caf50] [&~span]:before:duration-[0.4s] [&~span]:after:content-[''] [&~span]:after:absolute [&~span]:after:-top-px [&~span]:after:left-2/4 [&~span]:after:w-0 [&~span]:after:h-0.5 [&~span]:after:bg-[#4caf50] [&~span]:after:duration-[0.4s] [&~span]:after:top-auto [&~span]:after:bottom-0 [&~span_i]:before:content-[''] [&~span_i]:before:absolute [&~span_i]:before:top-2/4 [&~span_i]:before:left-0 [&~span_i]:before:w-0.5 [&~span_i]:before:h-0 [&~span_i]:before:bg-[#4caf50] [&~span_i]:before:duration-[0.6s] [&~span_i]:after:content-[''] [&~span_i]:after:absolute [&~span_i]:after:top-2/4 [&~span_i]:after:left-0 [&~span_i]:after:w-0.5 [&~span_i]:after:h-0 [&~span_i]:after:bg-[#4caf50] [&~span_i]:after:duration-[0.6s] [&~span_i]:after:left-auto [&~span_i]:after:right-0 [&:focus~span]:before:left-0 [&:focus~span]:before:w-full [&:focus~span]:before:duration-[0.4s] [&:focus~span]:after:left-0 [&:focus~span]:after:w-full [&:focus~span]:after:duration-[0.4s] [&:not(:placeholder-shown)~span]:before:left-0 [&:not(:placeholder-shown)~span]:before:w-full [&:not(:placeholder-shown)~span]:before:duration-[0.4s] [&:not(:placeholder-shown)~span]:after:left-0 [&:not(:placeholder-shown)~span]:after:w-full [&:not(:placeholder-shown)~span]:after:duration-[0.4s] [&:focus~span_i]:before:-top-px [&:focus~span_i]:before:h-full [&:focus~span_i]:before:duration-[0.6s] [&:focus~span_i]:after:-top-px [&:focus~span_i]:after:h-full [&:focus~span_i]:after:duration-[0.6s] [&:not(:placeholder-shown)~span_i]:before:-top-px [&:not(:placeholder-shown)~span_i]:before:h-full [&:not(:placeholder-shown)~span_i]:before:duration-[0.6s] [&:not(:placeholder-shown)~span_i]:after:-top-px [&:not(:placeholder-shown)~span_i]:after:h-full [&:not(:placeholder-shown)~span_i]:after:duration-[0.6s] resize-none block size-full"

// SSR test (Node.js)
if (typeof globalThis.__isSSRTest__ !== 'undefined') {
    TestTextArea()

    const fullElements = [
        `<h3>TextArea</h3><div class="relative size-fit"><textarea style="resize: none;" class="${TEXTAREA_CLS}" placeholder="Enter text" value=""></textarea><span class="focus-border focus-bg pointer-events-none"><i></i></span></div>`,
        `<h3>TextArea</h3><div class="relative size-fit"><textarea style="resize: none;" class="${TEXTAREA_CLS}" placeholder="Enter text" value="Hello"></textarea><span class="focus-border focus-bg pointer-events-none"><i></i></span></div>`,
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

TestTextArea.test = {
    static: false,
    compareActualValues: true,
    expect: () => {
        const idx = $$(testObservables[name])
        const value = ['', 'Hello'][idx]
        const expected = `<div class="relative size-fit"><textarea class="${TEXTAREA_CLS}" placeholder="Enter text" style="resize: none;"></textarea><span class="focus-border focus-bg pointer-events-none"><i></i></span></div>`

        const ssrComponent = testObservables[`${name}_ssr`]
        const ssrResult = renderToString(ssrComponent)

        const fullValue = ['', 'Hello'][idx]
        const expectedFull = `<h3>TextArea</h3><div class="relative size-fit"><textarea style="resize: none;" class="${TEXTAREA_CLS}" placeholder="Enter text" value="${fullValue}"></textarea><span class="focus-border focus-bg pointer-events-none"><i></i></span></div>`
        if (ssrResult !== expectedFull) {
            assert(false, `[${name}] SSR mismatch: got \n${ssrResult}, expected \n${expectedFull}`)
        } else {
            console.log(`✅ [${name}] SSR test passed: ${ssrResult}`)
        }

        return expected
    }
}

export default () => <TestSnapshots Component={TestTextArea} />
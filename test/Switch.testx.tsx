import { $, $$ } from 'woby'
import { Switch } from '../src/Switch'
import {
    effect1, effect2, // effect3,
    // effect4, effect5, effect6,
    // effect7, effect8, effect9,
    // effect10, effect11, effect12,
    // effect13, effect14, effect15,
    // effect16, effect17, effect18,
    // ios, flat, skewed, flip, light
} from '../src/Switch.effect'
import { Button } from '../src/Button'


const EffectSwitch = () => {
    const s1 = $(false);
    const s2 = $(false);
    const s3 = $(false);
    const s4 = $(false);
    const s5 = $(false);
    const s6 = $(false);
    const s7 = $(false);
    const s8 = $(false);
    const s9 = $(false);
    const s10 = $(false);
    const s11 = $(false);
    const s12 = $(false);
    const s13 = $(false);
    const s14 = $(false);
    const s15 = $(false);
    const s16 = $(false);
    const s17 = $(false);
    const s18 = $(false);

    const globalState = $(false);

    // Helper to toggle all
    const toggleAll = () => {
        const next = !$$(globalState);
        s1(next); s2(next); s3(next);
        s4(next); s5(next); s6(next);
        s7(next); s8(next); s9(next);
        s10(next); s11(next); s12(next);
        s13(next); s14(next); s15(next);
        s16(next); s17(next); s18(next);
        globalState(next);
    };

    return <>
        <div class="flex justify-between items-center border-b pb-4 mb-4">
            <h1 class="text-2xl font-bold text-gray-800">Effect Switches</h1>
            <Button onClick={toggleAll}>
                Toggle All ({() => $$(globalState) ? 'ON' : 'OFF'})
            </Button>
        </div>
        <div class="flex flex-wrap items-center justify-center grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-8 bg-gray-50 border border-gray-200 rounded-lg">
            {/* Effect 1 - 3 */}
            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">Effect 1</span>
                <Switch effect="effect1" checked={s1} on="I" off="O" />
            </div>

            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">Effect 2</span>
                <Switch effect="effect2" checked={s2} />
            </div>

            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">Effect 3</span>
                <Switch effect="effect3" checked={s3} />
            </div>

            {/* Effect 4 - 6 */}
            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">Effect 4</span>
                <Switch effect="effect4" checked={s4} />
            </div>

            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">Effect 5</span>
                <Switch effect="effect5" checked={s5} />
            </div>

            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">Effect 6</span>
                <Switch effect="effect6" checked={s6} />
            </div>

            {/* Effect 7 - 9 */}
            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">Effect 7</span>
                <Switch effect="effect7" checked={s7} />
            </div>

            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">Effect 8</span>
                <Switch effect="effect8" checked={s8} />
            </div>

            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">Effect 9</span>
                <Switch effect="effect9" checked={s9} />
            </div>

            {/* Effect 10 - 12 */}
            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">Effect 10</span>
                <Switch effect="effect10" checked={s10} />
            </div>

            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">Effect 11</span>
                <Switch effect="effect11" checked={s11} />
            </div>

            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">Effect 12</span>
                <Switch effect="effect12" checked={s12} />
            </div>

            {/* Effect 13 - 15 */}
            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">Effect 13</span>
                <Switch effect="effect13" checked={s13} />
            </div>

            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">Effect 14</span>
                <Switch effect="effect14" checked={s14} />
            </div>

            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">Effect 15</span>
                <Switch effect="effect15" checked={s15} />
            </div>

            {/* Effect 16 - 18 */}
            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">Effect 16</span>
                <Switch effect="effect16" checked={s16} />
            </div>

            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">Effect 17</span>
                <Switch effect="effect17" checked={s17} />
            </div>

            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">Effect 18</span>
                <Switch effect="effect18" checked={s18} />
            </div>
        </div>
    </>
}


const StylesSwitch = () => {
    const light = $(false);
    const ios = $(false);
    const flat = $(false);
    const skewed = $(false);
    const flip = $(false)

    const globalState = $(false)

    const toggleAll = () => {
        const next = !$$(globalState);
        light(next); ios(next); flat(next); skewed(next); flip(next);
        globalState(next);
    };

    return <>
        <div class="flex justify-between items-center border-b pb-4 mb-4">
            <h1 class="text-2xl font-bold text-gray-800">Styles Switches</h1>
            <Button onClick={toggleAll}>
                Toggle All ({() => $$(globalState) ? 'ON' : 'OFF'})
            </Button>
        </div>

        <div class="flex flex-wrap items-center justify-center grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-8 bg-gray-50 border border-gray-200 rounded-lg">


            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">Light</span>
                <Switch effect="light" checked={light} on="I" off="O" />
            </div>

            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">ios</span>
                <Switch effect="ios" checked={ios} on="I" off="O" />
            </div>

            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">skewed</span>
                <Switch effect="skewed" checked={skewed} on="I" off="O" />
            </div>

            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">flat</span>
                <Switch effect="flat" checked={flat} on="I" off="O" />
            </div>

            <div class="flex flex-col items-center">
                <span class="text-sm font-mono text-gray-500">flip</span>
                <Switch effect="flip" checked={flip} on="I" off="O" />
            </div>
        </div>

    </>

}

export {
    EffectSwitch,
    StylesSwitch,
}
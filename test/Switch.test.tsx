import { $, $$ } from 'woby'
import { Switch } from '../src/Switch'
import {
    effect1, effect2, effect3, effect4, effect5,
    effect6, effect7, effect8, effect9, effect10,
    effect11, effect12, effect13, effect14, effect15,
    effect16, effect17, effect18,
    ios, flat, skewed, flip, light
} from '../src/Switch.effect'
import { Button } from '../src/Button'


const StylesSwitch = () => {
    const defaultState = $(false);
    const iosState = $(false);
    const flatState = $(false);
    const lightState = $(false);
    const skewedState = $(false);
    const flipState = $(false);

    const globalState = $(false);

    const toogleAll = () => {
        const newState = !$$(globalState);
        globalState(newState);
        defaultState(newState);
        iosState(newState);
        flatState(newState);
        lightState(newState);
        skewedState(newState);
        flipState(newState);
    }

    return <>
        <div class="flex justify-between items-center border-b pb-4 mb-4">
            <h1 class="text-2xl font-bold text-gray-800">Switch Styles & Effects</h1>
            <Button onClick={toogleAll}>
                Toggle All ({() => $$(globalState) ? 'ON' : 'OFF'})
            </Button>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-12 p-8 bg-gray-50 border border-gray-200 rounded-lg">
            <div class="flex flex-col items-center gap-4">
                <span class="text-sm font-mono text-gray-500">Default</span>
                <Switch checked={defaultState} effect="default" />
            </div>

            <div class="flex flex-col items-center gap-4">
                <span class="text-sm font-mono text-gray-500">iOS</span>
                <Switch checked={iosState} effect="ios" />
            </div>

            <div class="flex flex-col items-center gap-4">
                <span class="text-sm font-mono text-gray-500">Flat</span>
                <Switch checked={flatState} effect="flat" />
            </div>

            <div class="flex flex-col items-center gap-4">
                <span class="text-sm font-mono text-gray-500">Light</span>
                <Switch checked={lightState} effect="light" />
            </div>

            <div class="flex flex-col items-center gap-4">
                <span class="text-sm font-mono text-gray-500">Skewed</span>
                <Switch checked={skewedState} effect="skewed" />
            </div>

            <div class="flex flex-col items-center gap-4">
                <span class="text-sm font-mono text-gray-500">Flip 3D</span>
                <Switch checked={flipState} effect="flip" />
            </div>
        </div>
    </>
}

const TextLabelSwitch = () => {

    const effect1State = $(false);
    const skewedState = $(false);
    const flatState = $(false);

    const globalState = $(false);

    const toogleAll = () => {
        const newState = !$$(globalState);
        globalState(newState);
        effect1State(newState);
        skewedState(newState);
        flatState(newState);
    }

    return <>
        <div class="flex justify-between items-center border-b pb-4 mb-4">
            <h1 class="text-2xl font-bold text-gray-800">Switch Styles & Effects</h1>
            <Button onClick={toogleAll}>
                Toggle All ({() => $$(globalState) ? 'ON' : 'OFF'})
            </Button>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-12 p-8 bg-gray-50 border border-gray-200 rounded-lg">
            <div class="flex flex-col items-center gap-4">
                <span class="text-sm font-mono text-gray-500">Effect 1 (YES/NO)</span>
                <Switch effect="effect1" on="YES" off="NO" checked={effect1State} />
            </div>

            <div class="flex flex-col items-center gap-4">
                <span class="text-sm font-mono text-gray-500">Skewed (High/Low)</span>
                <Switch effect="skewed" on="High" off="Low" checked={skewedState} />
            </div>

            <div class="flex flex-col items-center gap-4">
                <span class="text-sm font-mono text-gray-500">Flat (I/O)</span>
                <Switch effect="flat" on="I" off="O" checked={flatState} />
            </div>
        </div>
    </>
}

const EffectSwitch = () => {
    const globalState = $(false);

    // Define data structure for all effects
    const effects = [
        { id: 1, name: "Basic Slide", effect: "effect1", state: $(false) },
        { id: 2, name: "Dual Knob", effect: "effect2", state: $(false) },
        { id: 3, name: "Elastic", effect: "effect3", state: $(false) },
        { id: 4, name: "Vertical Flip", effect: "effect4", state: $(false) },
        { id: 5, name: "3D Rotate", effect: "effect5", state: $(false) },
        { id: 6, name: "Spin", effect: "effect6", state: $(false) },
        { id: 7, name: "Fade Scale", effect: "effect7", state: $(false) },
        { id: 8, name: "Ripple", effect: "effect8", state: $(false) },
        { id: 9, name: "Bounce", effect: "effect9", state: $(false) },
        { id: 10, name: "Square Text", effect: "effect10", state: $(false) },
        { id: 11, name: "Perspective", effect: "effect11", state: $(false) },
        { id: 12, name: "Multi-Layer", effect: "effect12", state: $(false) },
        { id: 13, name: "Reverse", effect: "effect13", state: $(false) },
        { id: 14, name: "Vert. Bounce", effect: "effect14", state: $(false) },
        { id: 15, name: "Zoom Fade", effect: "effect15", state: $(false) },
        { id: 16, name: "Stretch", effect: "effect16", state: $(false) },
        { id: 17, name: "Dual Slide", effect: "effect17", state: $(false) },
        { id: 18, name: "Interactive", effect: "effect18", state: $(false) },
    ];

    const toggleAll = () => {
        const newState = !$$(globalState);
        globalState(newState);
        effects.forEach(e => e.state(newState));
    }

    return <>
        <div class="flex justify-between items-center border-b mb-4 pb-4 mb-6 mt-12">
            <h1 class="text-2xl font-bold text-gray-800">CSS Effects Library</h1>
            <Button onClick={toggleAll}>
                Toggle All ({() => $$(globalState) ? 'ON' : 'OFF'})
            </Button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {effects.map((item) => (
                // CONTAINER CARD
                // min-h-[180px]: Ensures the card has enough height even if switch is small
                // min-w-[240px]: Ensures the card isn't crushed on small screens
                // overflow-hidden: Clips any switch animations that go out of bounds
                <div class="flex flex-col bg-white border border-gray-300 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
                    {/* Header Section */}
                    <div class="px-5 py-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Effect {item.id}</span>
                        <span class="text-sm font-semibold text-gray-800">{item.name}</span>
                    </div>

                    {/* Switch Display Area */}
                    {/* flex-1 ensures it fills the remaining height of the min-h */}
                    <div class="flex-1 flex items-center justify-center bg-white p-6 relative">
                        <Switch
                            effect={item.effect}
                            checked={item.state}
                        />
                    </div>
                </div>
            ))}
        </div>
    </>
}

export {
    StylesSwitch,
    // TextLabelSwitch,
    // EffectSwitch,
}
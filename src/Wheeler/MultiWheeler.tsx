import { $, $$, Observable, ObservableMaybe, useEffect, useMemo, untrack, type JSX, isObservable, ArrayMaybe, HtmlBoolean, defaults, customElement, ElementAttributes } from 'woby'
import { use, useViewportSize } from '@woby/use'
import { Wheeler, def as wheelerDef } from './Wheeler' // Adjust path
import { Button } from '../Button'
import { pick } from '../helper/helper'
import { WheelerItem, WheelerProps } from './WheelerType'

// --- Utilities (unchanged) ---
const parseDate = (dateInput: Date | string | null | undefined): Date | null => {
    if (!dateInput) return null
    if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput
    try {
        const p = new Date(dateInput)
        return isNaN(p.getTime()) ? null : p
    } catch (e) { return null }
}

const def = () => {
    // 1. Get the full object of default values from the single Wheeler
    const baseDefaults = wheelerDef();

    // 2. Define the exact keys for props that are inherited and behave the same
    const inheritedKeys = [
        'cls', 'bottom', 'commitOnBlur', 'mask', 'cancelOnBlur', 'itemHeight', 'itemCount', 'changeValueOnClickOnly', 'ok'
    ] as const;

    // 3. Pick those default values from the base Wheeler definition
    const inheritedDefaults = pick(baseDefaults, inheritedKeys);

    // 4. Return the final, combined defaults object
    return {
        // --- MultiWheeler's Specific Defaults ---

        // `options`, `value`, and `headers` should default to PLAIN arrays,
        // because the prop type is `Array<...>`, not `Observable<Array<...>>`.
        // options: [] as Array<ObservableMaybe<any[]>>,
        // value: [] as Array<Observable<any>>,
        options: $([], { toHtml: o => JSON.stringify(o), fromHtml: o => JSON.parse(o) }) as ObservableMaybe<any[][]>,
        value: $([], { toHtml: o => JSON.stringify(o), fromHtml: o => JSON.parse(o) }) as ObservableMaybe<any[]>,
        headers: [] as Array<((v: ObservableMaybe<any>) => JSX.Element) | undefined>,

        // Search props - arrays to match the number of wheels
        searchable: [] as Array<ObservableMaybe<boolean>>,
        searchPlaceholder: [] as Array<ObservableMaybe<string>>,

        // These are correctly defined as observables
        title: $(null) as JSX.Element | null,
        divider: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
        visible: $(false, HtmlBoolean) as ObservableMaybe<boolean>,

        // Spread in the inherited defaults
        ...inheritedDefaults
    };
};


const MultiWheeler = defaults(def, (props) => {
    const { options, value, itemHeight = $(36), itemCount = $(5), headers, divider, bottom, title, mask, visible: visibleProp, changeValueOnClickOnly, ok, cancelOnBlur, commitOnBlur, cls, searchable = [], searchPlaceholder = [], ...otherProps } = props

    // --- Internal Selection State ---
    const modDate = options
    const stateArr = value

    const { height: vh, width: vw, offsetLeft: ol, offsetTop: ot, pageTop: pt, pageLeft: pl } = useViewportSize()

    // Internal visibility management — same pattern as DateTimeWheeler.
    // use() creates a proper reactive binding that automatically updates.
    const isVisible = use(visibleProp, true)

    // Sync from parent's visibleProp to internal isVisible
    // useEffect(() => {
    //     const propValue = $$(visibleProp)
    //     if (propValue !== undefined && propValue !== $$(isVisible)) {
    //         isVisible(propValue)
    //     }
    // })

    const hide = () => {
        isVisible(false)
        if (isObservable(visibleProp)) {
            visibleProp(false)
        }
    };

    // --- Render (unchanged) ---
    const dateTimeWheelerCls = 'multi-Wheeler flex w-full bg-white p-1 border justify-center border-gray-300 rounded-md shadow-sm '
    const wheelWrapperCls = 'wheel-wrapper flex-1'

    const br = useMemo(() => $$(divider) ? 'border-l border-gray-300 dark:border-gray-600' : null)

    const ref = $<HTMLDivElement>()

    // #region Multi Wheeler Component
    const WheelerContent = () => (
        <div class="multi-wheeler-content flex flex-col w-full bg-white">
            {/* Header with Title and Buttons */}
            <div class="flex items-center justify-between px-4 py-2 border-b">
                <div class="w-[80px] flex justify-start">
                    <Button type='contained' cls={['px-2']} onClick={hide}>
                        Cancel
                    </Button>
                </div>
                <div class="flex-1 text-center font-semibold px-2">
                    <span class="inline-block break-words">{() => $$(title)}</span>
                </div>
                <div class="w-[80px] flex justify-end">
                    <Button type='contained' cls={['px-2']} onClick={() => {
                        if (isObservable(ok)) ok(true);
                        hide();
                    }}>
                        OK
                    </Button>
                </div>
            </div>

            {/* Container for the actual wheels */}
            {/* <div class="flex w-full p-1 justify-center"> */}
            <div class="flex flex-row w-full p-1 justify-center">
                {() => {
                    const optionsArray = $$(options);
                    const headersArray = $$(headers);
                    const valuesArray = $$(value);

                    return optionsArray.map((opts, index) => {
                        const headerFunc = headersArray[index];
                        const valueObs = valuesArray[index];
                        // Get searchable prop for this specific wheel
                        const searchableArray = $$(searchable);
                        const searchableProp = Array.isArray(searchableArray) ? searchableArray[index] : undefined;

                        // Get searchPlaceholder prop for this specific wheel
                        const searchPlaceholderArray = $$(searchPlaceholder);
                        const searchPlaceholderProp = Array.isArray(searchPlaceholderArray) ? searchPlaceholderArray[index] : undefined;

                        return <Wheeler
                            header={headerFunc ? (v => headerFunc(v)) : undefined}
                            options={opts}
                            value={valueObs}
                            itemHeight={itemHeight}
                            itemCount={itemCount}
                            cls={wheelWrapperCls}
                            changeValueOnClickOnly={changeValueOnClickOnly}
                            bottom={false}
                            visible={true}
                            {...(searchableProp !== undefined ? { searchable: searchableProp } : {})}
                            {...(searchPlaceholderProp !== undefined ? { searchPlaceholder: searchPlaceholderProp } : {})}
                        />
                    });
                }}
            </div>
        </div>
    );
    // #endregion

    const renderAsPopup = () => {
        // Portal in this woby version has a dual-rendering bug: it renders
        // children both inside its `useRenderEffect`-mounted portal element
        // (correctly placed in `document.body`) AND inline at the parent
        // component's position (incorrect). So we cannot simply use Portal
        // directly — its children appear twice.
        //
        // Fix: Render the popup inline as a fixed-positioned overlay ourselves,
        // gated behind a reactive `display: none` style. The fixed positioning
        // means it visually appears at the bottom of the viewport regardless
        // of where the MultiWheeler is in the DOM tree. We still wrap with
        // Portal for proper mount semantics (escape parent overflow contexts).
        // To prevent double-rendering, we use a single wrapper that Portal
        // recognizes and not duplicate its content.
        return (
            <div style={() => $$(isVisible) ? null : { display: 'none' }}>
                {$$(mask) ? (
                    <div
                        class="fixed inset-0 bg-black/50 z-50"
                        onClick={() => $$(cancelOnBlur) && hide()}
                    />
                ) : null}
                <div
                    class="fixed inset-x-0 bottom-0 z-[100] flex justify-center items-end p-4 pointer-events-none"
                    {...otherProps}
                >
                    <div class={["bg-white rounded-lg overflow-hidden shadow-xl w-full pointer-events-auto", $$(cls)].join(" ").trim()}>
                        <WheelerContent />
                    </div>
                </div>
            </div>
        );
    };

    const renderAsInline = () => (
        <div class={["inline-block", $$(cls)].join(" ")} {...otherProps} style={() => $$(isVisible) ? null : { display: 'none' }}>
            <WheelerContent />
        </div>
    );

    return $$(bottom) ? renderAsPopup() : renderAsInline();
})

export { MultiWheeler }

// NOTE: Register the custom element
customElement('wui-multi-wheeler', MultiWheeler);

// NOTE: Add the custom element to the JSX namespace
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-multi-wheeler': ElementAttributes<typeof MultiWheeler>
        }
    }
}

export default MultiWheeler
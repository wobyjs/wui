import { $, $$, Observable, ObservableMaybe, useEffect, useMemo, untrack, Portal, type JSX, isObservable, ArrayMaybe, HtmlBoolean, defaults, customElement, ElementAttributes } from 'woby'
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
        'cls', 'bottom', 'commitOnBlur', 'ok', 'visible', 'mask', 'cancelOnBlur', 'itemHeight', 'itemCount', 'changeValueOnClickOnly'
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

        // This is inherited and correct
        changeValueOnClickOnly: $(false, HtmlBoolean) as ObservableMaybe<boolean>,

        // Spread in the inherited defaults
        ...inheritedDefaults
    };
};


const MultiWheeler = defaults(def, (props) => {
    const { options, value, itemHeight = $(36), itemCount = $(5), headers, divider, bottom, title, mask, visible: visibleProp, changeValueOnClickOnly, ok, cancelOnBlur, cls, searchable = [], searchPlaceholder = [], ...otherProps } = props

    // --- Internal Selection State ---
    const modDate = options
    const stateArr = value
    const isVisible = $($$(visibleProp));

    const { height: vh, width: vw, offsetLeft: ol, offsetTop: ot, pageTop: pt, pageLeft: pl } = useViewportSize()


    useEffect(() => {
        const propValue = $$(visibleProp);
        if (propValue !== $$(isVisible)) {
            isVisible(propValue);
        }
    });

    const hide = () => {
        // Update our internal state to immediately hide the component.
        isVisible(false);

        // If the parent passed a writable observable for `visible`, update it too.
        if (isObservable(visibleProp)) {
            visibleProp(false);
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

    const renderAsPopup = () => (
        <Portal mount={document.body}>
            {$$(mask) && (
                <div
                    class="fixed inset-0 bg-black/50 z-50"
                    onClick={() => $$(cancelOnBlur) && hide()}
                />
            )}
            <div
                class="fixed inset-x-0 bottom-0 z-[100] flex justify-center items-end p-4 pointer-events-none"
                {...otherProps}
            >
                <div class={["bg-white rounded-lg overflow-hidden shadow-xl w-full pointer-events-auto", $$(cls)].join(" ").trim()}>
                    <WheelerContent />
                </div>
            </div>
        </Portal>
    );

    const renderAsInline = () => (
        <div class={["inline-block", $$(cls)].join(" ")} {...otherProps}>
            <WheelerContent />
        </div>
    );

    return () => {
        // If not visible, render nothing.
        if (!$$(isVisible)) {
            return null;
        }

        // If visible, check the `bottom` prop to decide which render function to use.
        return $$(bottom) ? renderAsPopup() : renderAsInline();
    };
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
import { $, $$, customElement, defaults, ElementAttributes, HtmlBoolean, HtmlClass, HtmlNumber, HtmlString, isObservable, Observable, ObservableMaybe, Portal, useEffect, useMemo } from 'woby'
import { use, useClickAway } from '@woby/use'
import { WheelerProps, WheelerItem } from './WheelerType'

export const ActiveWheelers = $([])

export const def = () => ({
    // options: $(null) as ObservableMaybe<WheelerItem<any>[]>,
    options: $([], { toHtml: o => JSON.stringify(o), fromHtml: o => JSON.parse(o) }) as ObservableMaybe<(string | number | WheelerItem<any>)[]>,
    itemHeight: $(36, HtmlNumber) as ObservableMaybe<number>,
    itemCount: $(5, HtmlNumber) as ObservableMaybe<number>,
    value: $(null) as ObservableMaybe<any>,
    cls: $("", HtmlClass) as ObservableMaybe<JSX.Class>,
    header: undefined as ((v: ObservableMaybe<any | any[]>) => JSX.Element) | undefined,
    /** implicit for multiple */
    all: $(null, HtmlString) as ObservableMaybe<string>,
    ok: $(null, HtmlBoolean) as ObservableMaybe<boolean>,
    visible: $(true, HtmlBoolean) as ObservableMaybe<boolean>,

    bottom: $(true, HtmlBoolean) as ObservableMaybe<boolean>,
    cancelOnBlur: $(true, HtmlBoolean) as ObservableMaybe<boolean>,
    commitOnBlur: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
    mask: $(true, HtmlBoolean) as ObservableMaybe<boolean>,
    changeValueOnClickOnly: $(false, HtmlBoolean) as ObservableMaybe<boolean>,

    searchable: $(false, HtmlBoolean) as ObservableMaybe<boolean>,
    searchPlaceholder: $(undefined, HtmlString) as ObservableMaybe<string>,
});

const Wheeler = defaults(def, (props) => {
    const { options, itemHeight: ih, itemCount: vic, value: oriValue, cls, header, ok, visible: visibleProp, mask, bottom = $$(mask), all, cancelOnBlur, commitOnBlur, searchable, searchPlaceholder, changeValueOnClickOnly, ...otherProps } = props

    const itemHeight = use(ih, 36)
    const itemCount = use(vic, 5)
    const value = oriValue
    const isVisible = $($$(visibleProp));

    // This handles the "top-down" data flow.
    useEffect(() => {
        const propValue = $$(visibleProp);
        if (propValue !== $$(isVisible)) {
            isVisible(propValue);
        }
    });

    const hide = () => {
        isVisible(false);
        if (isObservable(visibleProp)) {
            visibleProp(false);
        }
    };

    const CLICK_THRESHOLD_PX = 5

    const checkboxes = $<Record<string, Observable<boolean>>>({})

    const paddingItemCount = $(0)
    let minTranslateY = 0
    let maxTranslateY = 0

    // --- State variables ---
    let currentY = 0
    let startY = 0
    let startTranslateY = 0
    let startTime = 0
    let isDragging = false
    let hasMoved = false
    const rafId = $(0)
    let velocity = 0
    let lastMoveTime = 0
    let lastMoveY = 0
    let wheelSnapTimeoutId = $(0)

    const viewport = $<HTMLDivElement>()
    const list = $<HTMLUListElement>()
    const eventType = $<string>()
    const multiple = all

    // Initialize selectedIndex based on the initial value prop
    const initialIndex = !$$(multiple)
        ? $$(options).findIndex(opt => {
            const optValue = typeof opt === 'object' && opt !== null && 'value' in opt ? opt.value : opt;
            return optValue === $$(value);
        })
        : -1;
    const selectedIndex = $(initialIndex)

    let preOptions, preFormattedOptions

    /**
     * `formattedOptions` is a memoized, derived state that transforms the raw `options` prop
     * into a standardized, render-ready array of `WheelerItem` objects.
     *
     * This is the data processing engine of the component. It performs several key tasks:
     * 1.  **Normalization:** Ensures every item in the `options` array is a consistent object
     *     with `value` and `label` properties.
     * 2.  **Mode Handling:** Detects if the component is in single-select or multi-select mode
     *     (based on the `multiple` prop).
     * 3.  **State Initialization:** For multi-select mode, it sets up the initial state for all
     *     the checkboxes based on the incoming `value` prop.
     * 4.  **Renderer Injection:** It dynamically assigns a `component` property to each item,
     *     which is a function that returns the correct JSX for rendering (either a simple `<li>`
     *     or an `<li>` with a checkbox).
     * 5.  **Performance:** `useMemo` ensures this expensive transformation only re-runs when the
     *     `options` prop actually changes.
     */
    const formattedOptions = useMemo(() => {
        // --- Performance Optimization ---
        // If the `options` array instance hasn't changed since the last run,
        // skip all processing and return the previously computed result.
        if (preOptions === $$(options)) return preFormattedOptions

        // --- Step 1: Normalize the input `options` ---
        // This ensures that whether the user provides an array of strings, numbers, or objects,
        // we end up with a consistent array of `WheelerItem` objects.
        const base = $$(options).map(opt => {
            // If `opt` is already an object with `value` and `label`, use it.
            const o = typeof opt === 'object' && opt !== null && 'value' in opt
                ? { ...opt } as WheelerItem
                : { value: opt, label: String(opt) } as WheelerItem;

            // Check if a custom component was already provided for this item.
            if (!('hasComponent' in o)) {
                o.hasComponent = !!o.component;
            }
            return o;
        });

        // --- Step 2: Handle Multi-Select vs. Single-Select Modes ---

        if ($$(multiple)) {
            // --- Multi-Select Mode Logic (checkboxes) ---

            // Add the "Select All" option to the beginning of the list.
            base.unshift({ value: $$(multiple), label: $$(multiple), hasComponent: false });

            // Create a map to hold the reactive state (true/false) for each checkbox.
            const r = {} as Record<string, Observable<boolean>>;
            base.forEach(opt => r[opt.label] = $(false)); // Initialize all to false.

            // Sync the initial state of the checkboxes with the incoming `value` prop.
            const vs = Array.isArray($$(value)) ? $$(value) : [$$(value)].flat(); // Get the current selected values as a flat array.
            let allInitiallyChecked = true;
            base.forEach(opt => {
                const isSelected = vs.some(sv => sv === opt.value);
                r[opt.label](isSelected); // Set the checkbox state.

                // Track if all individual items are checked to set the "All" checkbox state.
                if (opt.label !== $$(multiple) && !isSelected) {
                    allInitiallyChecked = false;
                }
            });

            // Set the final state of the "All" checkbox.
            if (r[$$(multiple)]) { // Ensure "All" checkbox exists.
                // It's checked if all other items are checked AND there's more than just the "All" option.
                r[$$(multiple)](allInitiallyChecked && base.length > 1);
            }

            // Update the component's main `checkboxes` state with our newly created map.
            checkboxes(r);

            // --- Inject the Checkbox Renderer ---
            // Assign a `component` function to each option that will render an `<li>` with a checkbox.
            base.forEach((o, index) => o.component = o.hasComponent ? o.component as any : (props: { itemHeight: number, value: WheelerItem, index: number }) =>
                <li class={['wheeler-item', 'text-black']} data-index={index} data-value={o.value}
                    style={{ height: () => `${$$(itemHeight)}px` }}>
                    {() => {
                        // This component will reactively read the checked state for its label.
                        // const isChecked = checkboxes()[o.label];
                        const isChecked = r[o.label];
                        return (
                            <label class="flex items-center gap-2 px-2 w-full h-full">
                                <input
                                    class='pl-2'
                                    type="checkbox"
                                    checked={$$(isChecked)}
                                    // When clicked, toggle the state and notify the parent component.
                                    onClick={e => { isChecked(!$$(isChecked)); chk2value(o.label) }}
                                    readonly // Use readonly and onClick to control state manually.
                                />
                                <span class={['pl-5 w-full']}>{o.label}</span>
                            </label>
                        );
                    }}
                </li>
            );

        } else {
            // --- Single-Select Mode Logic (spinning wheel) ---

            // --- Inject the Simple Text Renderer ---
            // Assign a `component` function to each option that renders a simple text `<li>`.
            // The `pickerItemCls` contains styles to make non-selected items appear faded and smaller.
            base.forEach((o, index) => o.component = o.hasComponent ? o.component as any : (() =>
                <li class={['wheeler-item', pickerItemCls, 'text-[#555] opacity-60']} data-index={index} data-value={o.value}
                    style={{ height: () => `${$$(itemHeight)}px` }}>
                    {o.label}
                </li>
            ));
        }

        // --- Step 3: Cache and Return the Result ---
        // Store the current options and the result for the next optimization check.
        preOptions = $$(options);
        return preFormattedOptions = base;
    })


    /**
     * `chkValues` is a utility function that calculates the "diff" (difference) between
     * the component's internal checkbox state and the external `value` prop.
     *
     * It's essential for bi-directional data binding in multi-select mode. It answers two key questions:
     * 1.  Which items are newly checked in the UI but not yet present in the external `value` array?
     * 2.  Which items are present in the external `value` array but have since been unchecked in the UI?
     *
     * This function doesn't change any state; it only reads the current state and returns an
     * object describing the differences, which other functions (`value2chk` and `chk2value`) then use
     * to perform the actual state updates.
     *
     * @returns {{ onlyInCheckbox: any[], onlyInValue: any[] }} An object containing two arrays:
     * - `onlyInCheckbox`: Values for items that are checked in the UI but not in the `value` prop.
     * - `onlyInValue`: Values from the `value` prop for items that are now unchecked in the UI.
     */
    const chkValues = () => {
        // --- Step 1: Gather all current state information ---

        // `vs` (Value Set): The set of currently selected values from the external `value` prop.
        // Using a Set provides fast `has()` lookups for performance.
        const vs = new Set([$$(value)].flat());

        // `os` (Options Set): The full, normalized list of all available options.
        const os = $$(formattedOptions);

        // `cb` (Checkbox State): The map of all checkbox observables, e.g., { 'Apple': $(true), 'Banana': $(false) }.
        const cb = $$(checkboxes);

        // `cbv` (Checkbox Value Set): The set of LABELS for all checkboxes that are currently checked.
        // This is created by filtering the `cb` map.
        const cbv = new Set(
            Object.entries(cb)
                .filter(([_, active]) => $$(active)) // Keep only the checked ones.
                .map(([label]) => label)             // Extract just the label.
        );

        // --- Step 2: Calculate the differences ---

        // Find items that are checked in the UI (`cb`) but are NOT in the external value (`vs`).
        // These are items that the user has just selected.
        const onlyInCheckbox = os
            // Filter to items that...
            .filter(opt =>
                $$(cb[opt.label]) &&    // 1. Are currently checked in our internal state.
                !vs.has(opt.value) &&   // 2. Are NOT present in the external `value` Set.
                opt.label !== $$(multiple) // 3. Are not the "Select All" checkbox itself.
            )
            // Extract the actual `value` (not the label) of these items.
            .map(opt => opt.value);

        // Find items that are in the external value (`vs`) but are NOT checked in the UI (`cbv`).
        // These are items that the user has just deselected, or that were removed from the `value` prop externally.
        const onlyInValue = [...vs].filter(val => {
            // For each value in the external `value` Set...
            // Find the corresponding option object to get its label.
            const opt = os.find(o => o.value === val);
            // If an option is found, check if its label is MISSING from our set of checked labels (`cbv`).
            // If the option is not found (e.g., a value was passed in that doesn't exist in `options`),
            // it's also considered "only in value".
            return opt ? !cbv.has(opt.label) : true;
        });

        // --- Step 3: Return the calculated differences ---
        return { onlyInCheckbox, onlyInValue };
    }


    // #region useEffect to handle value synchronization
    /**
     * This `useEffect` hook acts as a listener for a "commit" action,
     * typically triggered by an external "OK" button.
     *
     * It runs whenever the `ok` prop (which is an observable) changes.
     * When `ok` is set to `true`, this effect finalizes the selection and
     * closes the Wheeler component.
     */
    useEffect(() => {
        // --- Guard Clause 1: Check if the `ok` prop was provided ---
        // If the `ok` prop is not provided (it's null or undefined), this effect
        // has no trigger, so we exit immediately.
        if (!ok) return;

        // --- Guard Clause 2: Check the VALUE of the `ok` observable ---
        // We only want to proceed if the `ok` signal is actually `true`.
        // If it's `false` or has just been reset, we do nothing and exit.
        if (!$$(ok)) return;

        // --- Action 1: Update the Parent's State ---
        // This is the core "commit" action. It takes the Wheeler's internal,
        // potentially modified `value`, and pushes it up to the original `oriValue`
        // observable that was passed in from the parent component.
        if (isObservable(oriValue)) {
            oriValue($$(value));
        }

        // --- Action 2: Reset the Trigger ---
        // After committing the value, we immediately reset the `ok` signal back to `false`.
        // This is crucial to prevent the effect from running in an infinite loop.
        // It makes the `ok` signal a one-time "event" rather than a persistent state.
        if (isObservable(ok)) {
            ok(false);
        }

        // --- Action 3: Close the Component ---
        // Finally, we hide the Wheeler component by setting the `visible` observable to `false`.
        if (isObservable(isVisible)) {
            isVisible(false);
        }
    });
    // #endregion


    // #region values to chk
    /**
     * `value2chk` (Value to Checkboxes) is a crucial synchronization function that handles
     * "top-down" data flow for the multi-select mode.
     *
     * Its primary responsibility is to read the external `value` prop and update the
     * internal state of the `checkboxes` to match it. This ensures that if the parent
     * component programmatically changes the selected values, the UI reflects those changes.
     *
     * This function is designed to be idempotent and is called in a `useEffect` hook,
     * running on mount and whenever the component re-renders to catch potential changes.
     */
    let preValue: any; // A local cache of the last synced value to prevent unnecessary re-renders.
    const value2chk = () => {
        // --- Guard Clause 1: Mode Check ---
        // This entire logic is only for multi-select mode. If not in that mode, do nothing.
        if (!$$(multiple)) return;

        // --- Guard Clause 2: Performance Optimization ---
        // If the component is visible and the internal `value` is identical to the last value we synced (`preValue`),
        // it means no external change has occurred that requires a UI update. So, we can skip the expensive work.
        if ($$(visibleProp) && preValue === $$(value)) {
            return;
        }

        // --- Step 1: Calculate the difference ---
        // Use the `chkValues` helper to determine which items need to be checked and which need to be unchecked.
        const { onlyInCheckbox, onlyInValue } = chkValues();

        // Gather current state for manipulation.
        const os = $$(formattedOptions); // All options.
        const c = $$(checkboxes);        // The map of checkbox observables.
        const allLabel = $$(multiple);   // The label for the "Select All" checkbox.

        let changed = false; // A flag to track if any state was actually modified.

        // --- Step 2: Sync the `value` prop TO the checkboxes ---

        // Part A: Check items that are in the `value` prop but are currently unchecked in the UI.
        // `onlyInValue` contains values that should be selected but aren't.
        for (const valFromProp of onlyInValue) {
            const opt = os.find(o => o.value === valFromProp);
            // Ensure the option exists, it's not the "All" option, and it has a checkbox.
            if (opt && opt.label !== allLabel && c[opt.label]) {
                if (!$$(c[opt.label])) { // Check if it's not already checked.
                    c[opt.label](true); // Tick the checkbox.
                    changed = true;
                }
            }
        }

        // Part B: Uncheck items that are checked in the UI but are NOT in the `value` prop.
        // `onlyInCheckbox` contains values that are selected in the UI but shouldn't be.
        for (const valFromCheckbox of onlyInCheckbox) {
            const opt = os.find(o => o.value === valFromCheckbox);
            // Ensure the option exists, it's not the "All" option, and it has a checkbox.
            if (opt && opt.label !== allLabel && c[opt.label]) {
                if ($$(c[opt.label])) { // Check if it is currently checked.
                    c[opt.label](false); // Un-tick the checkbox.
                    changed = true;
                }
            }
        }

        // --- Step 3: Update the "Select All" Checkbox State ---
        // After syncing all individual items, the state of the "Select All" checkbox
        // needs to be re-evaluated to see if it should be checked or unchecked.
        if (allLabel && c[allLabel]) {
            // Get all checkboxes *except* the "All" one.
            const individualItemCheckboxes = Object.entries(c).filter(([key, _]) => key !== allLabel);

            // Determine if all of them are now checked.
            const allIndividualsAreChecked = individualItemCheckboxes.length > 0 &&
                individualItemCheckboxes.every(([_, obs]) => $$(obs as Observable<boolean>));

            // If the current state of the "All" checkbox doesn't match this derived state, update it.
            if ($$(c[allLabel]) !== allIndividualsAreChecked) {
                c[allLabel](allIndividualsAreChecked);
                changed = true;
            }
        }

        // --- Step 4: Finalize and Cache ---

        if (changed) {
            // If any checkbox state was changed, we need to trigger reactivity for the `checkboxes`
            // observable itself. The easiest way is to set it to a new object with the same content.
            checkboxes({ ...c });
        }

        // Update the cached `preValue` to the current value, so the optimization check at the
        // top of the function works correctly on the next run.
        preValue = $$(value);
    }
    // #endregion


    // --- Initial Synchronization on Mount ---
    // This direct call to `value2chk()` executes *during the component's initial render*.
    // Its purpose is to perform the first, immediate synchronization between the initial
    // `value` prop and the checkbox states. This ensures that when the component first
    // appears, the correct checkboxes are already ticked.
    // value2chk();


    // --- Continuous Synchronization on Re-renders ---

    // --- Continuous Synchronization on Re-renders ---
    // This `useEffect` hook schedules `value2chk` to run *after* every render of the component.
    //
    // WHY IS IT WRITTEN THIS WAY?
    // Because there is no dependency array (e.g., `useEffect(..., [dependency])`), this effect
    // will trigger after every single render. This is a "catch-all" strategy to ensure that
    // any change to props or state that might affect the checkbox sync is handled.
    //
    // ISN'T THIS INEFFICIENT?
    // It would be, except for the performance guard at the top of the `value2chk` function:
    // `if ($$(visible) && preValue === $$(value)) { return; }`
    // This check ensures that even though the `useEffect` fires frequently, the expensive
    // synchronization logic inside `value2chk` only runs if the `value` has actually changed
    // since the last sync.
    //
    // This pattern effectively makes the `useEffect` behave as if its dependency was `value`,
    // but without needing to explicitly list it.
    useEffect(value2chk);


    // #region chk2value （Checkbox to Value)
    /**
     * `chk2value` (Checkboxes to Value) is the "bottom-up" synchronization function.
     * It is called directly from the `onClick` handler of a checkbox in the UI.
     *
     * Its primary responsibility is to:
     * 1.  Update the internal state of ALL checkboxes to be consistent with the user's click.
     *     (e.g., if the user clicks "All", it checks/unchecks everything else).
     * 2.  Calculate the new array of selected values based on the updated checkbox states.
     * 3.  Update the external `value` prop (`oriValue`) to notify the parent component of the change.
     *
     * @param clickedLabel The label of the specific checkbox that the user clicked.
     */
    const chk2value = (clickedLabel: string | number) => {
        // --- Guard Clause: Mode Check ---
        // This logic is only for multi-select mode.
        if (!$$(multiple)) return;

        const checkboxesMap = $$(checkboxes);
        const allLabel = $$(multiple);

        // --- Step 1: Ensure Checkbox State is Internally Consistent ---
        // The onClick handler has already flipped the state of the *one* checkbox that was clicked.
        // This section handles the cascading logic for the "Select All" checkbox.

        if (clickedLabel === allLabel) {
            // Case A: The "All" checkbox itself was clicked.
            const isAllCheckedNow = $$(checkboxesMap[allLabel]);
            // Propagate this new state to all other checkboxes.
            Object.values(checkboxesMap).forEach(obs => obs(isAllCheckedNow));
        } else {
            // Case B: An individual item's checkbox was clicked.
            if (checkboxesMap[allLabel]) { // Only proceed if "All" functionality is active.
                // Check if the "All" checkbox's state needs to be updated.
                if ($$(checkboxesMap[clickedLabel])) {
                    // If the item was just checked, we need to see if *all* other items are now also checked.
                    const allIndividualsAreChecked = Object.entries(checkboxesMap)
                        .filter(([key, _]) => key !== allLabel)
                        .every(([_, obs]) => $$(obs));
                    if (allIndividualsAreChecked) {
                        checkboxesMap[allLabel](true); // If so, tick the "All" checkbox.
                    }
                } else {
                    // If the item was just unchecked, the "All" checkbox must also be unchecked.
                    checkboxesMap[allLabel](false);
                }
            }
        }
        // At this point, the `checkboxesMap` object holds the complete and correct state for the UI.


        // --- Step 2: Calculate the New Value Array ---
        // This section has two paths for calculating the new value. The first is a direct, but potentially
        // less efficient approach. The second uses the "diff" from `chkValues` for an incremental update.
        // The code seems to try the diff-based approach first and falls back to the direct approach.

        // Use the helper to find the difference between our new UI state and the (still old) external `value`.
        const { onlyInCheckbox, onlyInValue } = chkValues();

        // This block handles a tricky edge case. If the diff is empty, it might mean the selection
        // didn't *effectively* change, but we still need to build the final value array to be sure.
        if (onlyInCheckbox.length === 0 && onlyInValue.length === 0) {
            // The direct approach: build the new value array from scratch based on the current checkbox states.
            const newSelectedValues = new Set<any>();
            const currentFormattedOptions = $$(formattedOptions);
            Object.entries(checkboxesMap).forEach(([label, isCheckedObservable]) => {
                // If a checkbox is checked and it's not the "All" checkbox...
                if (label !== allLabel && $$(isCheckedObservable)) {
                    // ...find its corresponding option and add its value to our set.
                    const opt = currentFormattedOptions.find(o => o.label === label);
                    if (opt) {
                        newSelectedValues.add(opt.value);
                    }
                }
            });

            const finalNewValueArray = [...newSelectedValues];

            // Compare the new value array with the old one to see if an update is needed.
            // Using JSON.stringify is a common (though not perfectly robust) way to deep-compare arrays.
            if (JSON.stringify($$(value)) !== JSON.stringify(finalNewValueArray)) {
                value(finalNewValueArray); // Update internal value.
                // If there's no "OK" button flow, update the parent's `oriValue` immediately.
                if (!ok && isObservable(oriValue)) {
                    oriValue($$(value));
                }
            }
            return; // Exit the function.
        }

        // --- Step 3: Update the Value Incrementally (The main path) ---
        // This path is taken if the `chkValues` diff was not empty.

        // Get the current external value as a Set for efficient modification.
        const currentVal = $$(value);
        const currentValueFlat = Array.isArray(currentVal) ? currentVal : [currentVal];
        const currentValueAsSet = new Set<any>(currentValueFlat as any[]);

        // Remove values that were unchecked.
        for (const v of onlyInValue) {
            currentValueAsSet.delete(v as any);
        }
        // Add values that were newly checked.
        for (const v of onlyInCheckbox) {
            currentValueAsSet.add(v as any);
        }

        // Convert the modified Set back to an array.
        const finalNewValueArray = [...currentValueAsSet];
        value(finalNewValueArray as any); // Update the internal value.

        // If there's no "OK" button flow, update the parent's `oriValue` immediately.
        if (!ok) {
            if (isObservable(oriValue)) {
                (oriValue as Observable<any[]>)(finalNewValueArray as any);
            }
        }
    }
    // #endregion


    // #region "All" Handling
    /**
     * `isAllSelected` is a memoized, reactive boolean that determines if all individual
     * items (excluding the "All" option itself) are currently checked.
     *
     * This is useful for UI elements like a "Toggle All" button to know whether its
     * next action should be to select all or deselect all.
     *
     * It works by:
     * 1.  Getting the current map of checkbox observables.
     * 2.  Filtering out the "Select All" checkbox itself.
     * 3.  Using `every()` to check if the value of every remaining observable is `true`.
     *
     * This calculation is wrapped in `useMemo` so it only re-runs when the `checkboxes`
     * state actually changes.
     */
    const isAllSelected = useMemo(() => {
        // Get the current map of all checkbox observables.
        const allCheckboxes = $$(checkboxes);

        // Get the label for the "Select All" option, if it exists.
        const allLabel = $$(multiple);

        // Get an array of all the checkbox observables, EXCLUDING the "All" checkbox.
        const individualItemCheckboxes = Object.entries(allCheckboxes)
            .filter(([label, _]) => label !== allLabel) // Filter out the "All" option by its label.
            .map(([_, observable]) => observable);    // Get just the observable from the [key, value] pair.

        // If there are no individual items to check, then we can't say "all" are selected.
        if (individualItemCheckboxes.length === 0) {
            return false;
        }

        // Use `every()` to check if the unwrapped value of every single individual checkbox
        // observable is currently `true`.
        return individualItemCheckboxes.every(obs => $$(obs));
    });
    // #endregion


    // #region Original Toggle All
    /**
     * `toggleAll` is the event handler for a "Select All / Deselect All" action.
     *
     * It determines the desired new state (checked or unchecked) based on whether all
     * items are currently selected, applies this new state to all checkboxes, and then
     * reconstructs the `value` array to notify the parent component of the change.
     */
    function toggleAll() {
        // --- Step 1: Determine the new state for all checkboxes ---
        // The new state should be the logical opposite of the current `isAllSelected` state.
        // If all are currently selected (true), the new state will be false (deselect all).
        // If not all are selected (false), the new state will be true (select all).
        const newState = !$$(isAllSelected);

        // Get the map of checkbox observables to modify it.
        const checkboxesMap = $$(checkboxes);

        // --- Step 2: Apply the new state to all checkboxes ---
        // Iterate over all checkbox observables and set them to the `newState`.
        // This will cause the UI to visually update (all boxes become checked or unchecked).
        Object.values(checkboxesMap).forEach(obs => obs(newState));

        // --- Step 3: Construct the new value array based on the new state ---
        let finalNewValueArray: any[] = [];

        if (newState === true) {
            // If the new state is "checked", the new value array should contain the `value`
            // of every option, excluding the "Select All" option itself.
            finalNewValueArray = $$(formattedOptions)
                .filter(opt => opt.label !== $$(multiple)) // Exclude the 'All' controller
                .map(opt => opt.value);
        }
        // If the new state is `false`, the `finalNewValueArray` will remain an empty array.

        // --- Step 4: Notify the parent component of the change ---
        // Update both the internal `value` and the external `oriValue` prop.
        value(finalNewValueArray as any);

        if (!ok && isObservable(oriValue)) {
            (oriValue as Observable<any[]>)(finalNewValueArray as any);
        }
    }
    // #endregion


    // #region Original Layout Effect
    /**
     * This is the main Layout & Geometry Synchronization Hook for the Wheeler.
     *
     * It runs after every render to ensure that the component's geometry is always
     * up-to-date with its props (`itemCount`) and data (`formattedOptions`).
     *
     * Its key responsibilities are:
     * 1.  Validating the `itemCount` prop to ensure it's a positive, odd number for
     *     symmetrical display.
     * 2.  Calculating the number of "padding" items needed to allow the first and last
     *     elements to be centered.
     * 3.  Recalculating the pixel boundaries (`minTranslateY`, `maxTranslateY`) for scrolling,
     *     which is essential when the number of options changes.
     * 4.  Re-snapping the wheel to the correct visual position if the layout has changed.
     *
     * NOTE: This hook intentionally has no dependency array, as it needs to re-evaluate
     * the layout whenever ANY prop or state change causes a re-render.
     */
    useEffect(() => {
        // --- Guard Clause ---
        // If the options haven't been processed yet, we can't do any calculations.
        if (!$$(formattedOptions)) return;

        // --- Step 1: Validate and Normalize `itemCount` ---

        // Ensure `itemCount` is a valid number, defaulting to 3 if not.
        if (typeof $$(itemCount) !== 'number' || $$(itemCount) <= 0) {
            itemCount(3);
        }

        // A wheeler needs an odd number of items for a clear visual center.
        // If the user provides an even number, we log a warning and increment it to make it odd.
        if ($$(itemCount) % 2 === 0) {
            console.warn(`itemCount (${$$(itemCount)}) should be odd for symmetry. Adjusting to ${$$(itemCount) + 1}.`);
            itemCount($$(itemCount) + 1);
        }

        // --- Step 2: Calculate Geometric Properties ---

        // Calculate how many invisible padding `<li>` elements are needed at the top and bottom
        // of the list. This allows the first and last real items to scroll to the center.
        // For example, with 5 items, we need floor(5/2) = 2 padding items on each end.
        paddingItemCount(Math.floor($$(itemCount) / 2));

        // Recalculate the absolute top and bottom scroll boundaries in pixels.
        // These are crucial for clamping the scroll position and creating the "rubber band" effect.
        // This must be re-run whenever `formattedOptions.length` changes.
        minTranslateY = _getTargetYForIndexUnbound($$(formattedOptions).length - 1); // The Y-position for the last item.
        maxTranslateY = _getTargetYForIndexUnbound(0); // The Y-position for the first item.

        // --- Step 3: Re-align the UI ---

        // After all calculations are updated, re-snap the wheeler to the current `selectedIndex`.
        // This ensures that if the list of options changes, the visual position of the
        // selected item remains correctly centered in the viewport.
        snapToIndex($$(selectedIndex));

        // Example debug log to see the results of the layout calculation.
        // console.log(`Layout Updated: count=${itemCount}, h=${viewportHeight}, pad=${paddingItemCount}, minY=${minTranslateY}, maxY=${maxTranslateY}`);
    });
    // #endregion


    // const viewportHeight = useMemo(() => $$(itemHeight) * $$(itemCount))
    // const indicatorTop = useMemo(() => ($$(viewportHeight) - $$(itemHeight)) / 2)

    /**
         * This section calculates the core dimensions for the Wheeler's UI. These values are
         * memoized with `useMemo` for performance, so they are only recalculated when their
         * dependencies (`itemHeight`, `itemCount`) change.
         */

    // --- 1. `viewportHeight` ---
    /**
     * Calculates the total pixel height of the visible scrolling area (the "viewport").
     *
     * It's a simple multiplication:
     * (Height of a single item) * (Number of items visible at once)
     *
     * Example: If `itemHeight` is 36px and `itemCount` is 5, the `viewportHeight` will be 180px.
     * This value is used to set the `height` style of the main scrolling container.
     */
    const viewportHeight = useMemo(() => $$(itemHeight) * $$(itemCount));


    // --- 2. `indicatorTop` ---
    /**
     * Calculates the `top` CSS offset required to perfectly vertically center the
     * selection indicator within the viewport.
     *
     * The formula `(viewportHeight - itemHeight) / 2` works like this:
     * 1.  `viewportHeight - itemHeight`: This calculates the total remaining vertical space
     *     in the viewport after accounting for the height of the indicator itself.
     * 2.  `/ 2`: This remaining space is split equally above and below the indicator.
     *     Dividing by two gives us the exact height of the space above the indicator.
     *
     * This value is used to set the `top` style of the indicator `<div>`.
     *
     * VISUAL REPRESENTATION:
     * +---------------------+  }
     * |                     |  }
     * |    (Space Above)    |  } <-- This space has a height equal to `indicatorTop`
     * |                     |  }
     * +---------------------+  <-- The indicator's top edge starts here.
     * |  Selection Indicator|  (This box has a height of `itemHeight`)
     * +---------------------+
     * |                     |
     * |    (Space Below)    |
     * |                     |
     * +---------------------+
     */
    const indicatorTop = useMemo(() => ($$(viewportHeight) - $$(itemHeight)) / 2);

    // #region Get Target Y

    /**
     * `_getTargetYForIndexUnbound` is an internal helper function for pure calculation.
     * Its name signifies two things:
     *   - `_` (underscore prefix): This is a private helper, not meant to be called from outside.
     *   - `Unbound`: It performs a raw calculation and does NOT clamp the input `index` to valid
     *     boundaries. This is intentional, as it's used to calculate the absolute min/max
     *     scroll positions by passing it the very first and very last indices.
     *
     * @param index The zero-based index of the target item in the `formattedOptions` array.
     * @returns The exact `translateY` pixel value needed to align the top of the
     *          item at `index` with the top of the selection indicator.
     */
    function _getTargetYForIndexUnbound(index: number) {
        // --- The Core Formula ---
        // The calculation is: `target_position - total_offset_of_items_above`

        // `$$`(indicatorTop): This is the "finish line". It's the pixel offset from the top of the
        // viewport where the selected item should start. Let's say it's 80px.

        // `($$(paddingItemCount))`: The number of invisible `<li>` elements at the top of the `<ul>`.
        // These are necessary to allow the first few real items to scroll down into the center.
        // For example, if `itemCount` is 5, `paddingItemCount` is 2.

        // `(index + $$`(paddingItemCount)): This calculates the item's true position in the DOM list,
        // including the padding. If you want the first *real* item (index 0), its actual
        // position in the `<ul>` is `0 + 2 = 2` (the 3rd element).

        // `* $$`(itemHeight): This multiplies the item's true position by the height of each item
        // to get the total pixel offset from the top of the `<ul>` to the top of our target item.

        // `$$`(indicatorTop) - (...): The final calculation. To move the item's top edge to the
        // `indicatorTop` line, we must apply a negative `translateY` to the entire `<ul>`. The value
        // of this translation is the difference between the target line and the item's natural offset.

        return $$(indicatorTop) - (index + $$(paddingItemCount)) * $$(itemHeight);
    }

    /**
     * `getTargetYForIndex` is the public-facing version of the Y-coordinate calculation.
     * It is used by functions like `snapToIndex` which operate on potentially user-provided
     * or gesture-calculated indices.
     *
     * While the internal formula is identical to `_getTargetYForIndexUnbound`, this function's
     * purpose is for active snapping and alignment within the component's lifecycle, whereas
     * the "unbound" version is used for pre-calculating static layout boundaries.
     *
     * It's a common pattern to have a public function and a private (`_`) helper, even if
     * their logic is the same, to signal different intentions and use cases. The calling
     * function (e.g., `snapToIndex`) is responsible for clamping the `index` before
     * passing it to this function.
     *
     * @param index The zero-based index of the target item. This should be a valid, clamped index.
     * @returns The exact `translateY` pixel value needed to align the item with the selection indicator.
     */
    function getTargetYForIndex(index: number) {
        // The formula is the same as the "unbound" version. It calculates the necessary
        // negative translation to move the item at `index` up to the `indicatorTop` line.
        // It relies on the memoized `indicatorTop`, `paddingItemCount`, and `itemHeight` to be up-to-date.
        return $$(indicatorTop) - (index + $$(paddingItemCount)) * $$(itemHeight);
    }
    // #endregion


    const pickerItemCls = 'apply h-9 flex items-center justify-center text-base box-border transition-opacity duration-[0.3s,transform] delay-[0.3s] select-none scale-90'

    // #region Populate List
    /**
     * `populateList` is a JavaScript "generator function" used to declaratively build the
     * full list of `<li>` elements for the wheeler's `<ul>`.
     *
     * WHAT IS A GENERATOR FUNCTION (`function*`)?
     * Instead of building an array in memory and returning it all at once, a generator
     * uses the `yield` keyword to produce a sequence of values one at a time, "on demand".
     * In this component, it's used to create the list of items in three distinct phases:
     *   1. The invisible padding items at the top.
     *   2. The actual, visible data items.
     *   3. The invisible padding items at the bottom.
     *
     * The result is then spread into an array in the JSX: `{() => [...populateList()]}`.
     */
    function* populateList() {
        // --- Phase 1: Render Top Padding Items ---
        // These are invisible `<li>` elements that occupy space above the actual content.
        // Their purpose is crucial: they provide the necessary scrollable area to allow
        // the *first* real item in the list to be moved down and centered in the viewport.
        for (let i = 0; i < $$(paddingItemCount); i++) {
            // `yield` is like a temporary `return`. It produces one `<li>` element and pauses,
            // waiting to be called again to produce the next one.
            yield <li class={['wheeler-item is-padding invisible', pickerItemCls]} style={{ height: () => `${$$(itemHeight)}px` }}></li>;
        }

        // --- Phase 2: Render the Actual Data Items ---
        // This loop iterates over the `formattedOptions` array, which contains the
        // normalized and processed data for the wheeler.
        if ($$(formattedOptions)) {
            for (const [index, option] of $$(formattedOptions).entries()) {
                // This is the key to the component's flexibility. Instead of deciding *how* to
                // render the item here, it calls the `component` function that was attached
                // to the `option` object back in the `formattedOptions` `useMemo` block.
                //
                // This function doesn't care if it's yielding a simple text `<li>` for single-select
                // mode or a complex `<li>` with a checkbox for multi-select mode. It just
                // executes the pre-assigned renderer.
                yield <option.component {...{ index, value: option, itemHeight }} />;
            }
        }

        // --- Phase 3: Render Bottom Padding Items ---
        // Similar to the top padding, these invisible `<li>` elements occupy space below
        // the actual content. They provide the necessary scrollable area to allow the
        // *last* real item in the list to be moved up and centered in the viewport.
        for (let i = 0; i < $$(paddingItemCount); i++) {
            yield <li class={['wheeler-item is-padding invisible', pickerItemCls]} style={{ height: `${$$(itemHeight)}px` }}></li>;
        }
    }
    // #endregion


    // #region Set Translate Y
    /**
     * `setTranslateY` is the component's core "rendering" function for movement. It is the
     * single, safe entry point for applying a vertical translation to the `<ul>` list.
     *
     * Its key responsibilities are:
     * 1.  **Guarding:** Ensures the list element actually exists in the DOM.
     * 2.  **Clamping:** Prevents the list from being moved beyond its calculated upper and
     *     lower boundaries (`minTranslateY` and `maxTranslateY`). This enforces the scroll
     *     limits.
     * 3.  **DOM Manipulation:** Applies the final, clamped Y-position to the `<ul>` element's
     *     CSS `transform` property, which visually moves the list.
     * 4.  **Style Updates:** Triggers `updateItemStyles()` to ensure the newly centered item
     *     is highlighted correctly after the movement.
     *
     * @param y The desired, but not-yet-clamped, vertical position in pixels.
     */
    function setTranslateY(y: number) {
        // --- Guard Clause ---
        // If the `list` element hasn't been rendered and attached to its ref yet,
        // we cannot manipulate its style. Exit early to prevent errors.
        if (!$$(list)) return;

        // --- Step 1: Clamp the position ---
        // This is the most critical logic in this function. It ensures the list
        // cannot be scrolled past its boundaries.
        // The pattern `Math.max(min, Math.min(max, value))` is a standard way to "clamp" a value.
        // - `Math.min(maxTranslateY, y)`: First, ensure `y` is not greater than the maximum allowed Y.
        // - `Math.max(minTranslateY, ...)`: Then, ensure the result is not less than the minimum allowed Y.
        currentY = Math.max(minTranslateY, Math.min(maxTranslateY, y));

        // --- Step 2: Apply the transform to the DOM element ---
        // This is what physically moves the list on the screen. Using `transform: translateY`
        // is highly performant for animations as it typically runs on the GPU and doesn't
        // trigger expensive layout recalculations.
        $$(list).style.transform = `translateY(${currentY}px)`;

        // --- Step 3: Update the visual styles of the items ---
        // After the list has moved, the item that is now in the center has changed.
        // This function call re-evaluates all the list items and applies the
        // 'is-near-center' styles (e.g., bold, colored, larger) to the correct one.
        updateItemStyles();
    }
    // #endregion


    // A variable to hold the timeout ID for the current snap operation.
    // Used to prevent race conditions if `snapToIndex` is called multiple times in quick succession.
    let snapToIndexTimeout = 0;

    // #region Snap To Index
    /**
     * `snapToIndex` is the core animation and state-settling function for the single-select wheeler.
     *
     * Its primary job is to move the `<ul>` list so that the item at a given `index` is
     * perfectly centered in the viewport's selection indicator. It handles both immediate
     * (e.g., on initial load) and animated (e.g., after a user fling) snapping.
     *
     * Crucially, it waits until the animation is complete before officially updating the
     * component's `selectedIndex` state.
     *
     * @param index The target item index to snap to.
     * @param immediate If true, the snap will be instant with no animation. Defaults to false.
     * @param eventType Optional event type, not used in this implementation but available for extension.
     */
    function snapToIndex(index: number, immediate = false, eventType?: Event) {
        // --- Guard Clauses ---
        // If the list element isn't in the DOM, or if we're in multi-select mode, do nothing.
        // The snapping animation is only for the single-select "wheel" UI.
        if (!$$(list)) return;
        if ($$(multiple)) return;

        // --- Step 1: Sanitize Input and Calculate Target Position ---

        // Clamp the incoming index to ensure it's within the valid bounds of the options array.
        // This prevents errors if a gesture calculation results in an out-of-bounds index.
        const clampedIndex = Math.max(0, Math.min(index, $$(formattedOptions).length - 1));

        // Calculate the exact target `translateY` pixel value needed to center this item.
        const targetY = getTargetYForIndex(clampedIndex);

        // --- Step 2: Set Up and Trigger the CSS Transition ---

        if (immediate) {
            // For an immediate snap, remove the CSS transition. The movement will be instant.
            // This is used for initial setup or programmatic changes.
            $$(list).style.transition = 'none';
        } else {
            // For a user-initiated snap, apply a smooth ease-out transition.
            $$(list).style.transition = 'transform 0.3s ease-out';
        }

        // Apply the calculated position. The browser will now either jump or animate the list
        // to this `targetY` based on the transition style we just set.
        setTranslateY(targetY);

        // --- Step 3: Handle Post-Animation State Updates using a Timeout ---
        // We use a `setTimeout` to execute code *after* the CSS animation has finished.

        const timeoutDuration = immediate ? 10 : 310; // A duration slightly longer than the 300ms transition.

        // Debouncing: If another snap was already in progress, cancel its pending timeout.
        // This ensures that only the *last* requested snap action will finalize the state.
        if (snapToIndexTimeout !== 0) {
            clearTimeout(snapToIndexTimeout);
        }

        snapToIndexTimeout = setTimeout(() => {
            // --- Post-Animation Cleanup and State Commit ---

            // If we did an immediate snap, the transition is 'none'. Restore it now so
            // the *next* interaction will be animated.
            if ($$(list).style.transition === 'none') {
                $$(list).style.transition = 'transform 0.3s ease-out';
            }

            // **This is the official state update.**
            // Only after the wheel has visually stopped moving do we update the reactive
            // `selectedIndex`. This prevents other parts of the app from reacting to a
            // value that is still visually in transit.
            if ($$(selectedIndex) !== clampedIndex) {
                selectedIndex(clampedIndex);
            }

            // Do a final style update to ensure the centered item is correctly highlighted.
            updateItemStyles();

            // Reset the timeout ID to indicate that no snap is currently in progress.
            snapToIndexTimeout = 0;
        }, timeoutDuration);
    }
    // #endregion

    
    // #region Update Item Styles
    /**
     * `updateItemStyles` is the visual feedback engine for the single-select wheeler.
     * Its sole purpose is to dynamically apply "selected" styles (e.g., bold, larger, different color)
     * to the list item that is currently in the visual center of the viewport, and remove
     * those styles from all other items.
     *
     * This function is called every time the list moves (`setTranslateY`) and after it settles
     * (`snapToIndex`) to ensure the visual state is always in sync with the list's position.
     */
    function updateItemStyles() {
        // --- Guard Clause ---
        // This visual effect is only for the single-select "wheel" UI. In multi-select mode,
        // selection is indicated by checkboxes, so we exit immediately.
        if ($$(multiple)) return;

        // --- Step 1: Define the "Target Zone" ---
        // Calculate the absolute vertical center of the viewport in pixels.
        // For example, if the viewport is 180px tall, this will be 90px. This is our target line.
        const centerViewportY = $$(viewportHeight) / 2;

        // --- Step 2: Get all the visible items ---
        // Get a live NodeList of all the *real* list items, excluding the invisible padding items
        // which are only there to provide scrolling space.
        const listItems = $$(list).querySelectorAll('.wheeler-item:not(.is-padding)');

        // --- Step 3: Iterate and Check Each Item's Position ---
        listItems.forEach(item => {
            // --- A. Measure Positions ---
            // getBoundingClientRect() gives the size and position of an element relative to the
            // browser's main viewport (the entire visible window).
            const itemRect = item.getBoundingClientRect();     // The item's position on the page.
            const viewportRect = $$(viewport).getBoundingClientRect(); // The wheeler's viewport position on the page.

            // --- B. Calculate the Item's Center Relative to Our Viewport ---
            // We need to know the item's position *inside* our scrolling container, not on the whole page.
            // 1. `(itemRect.top + itemRect.bottom) / 2`: Find the item's absolute vertical center on the page.
            // 2. `- viewportRect.top`: Subtract the starting position of our container.
            // This gives us the item's center coordinate relative to its scrolling parent.
            const itemCenterRelativeToViewport = (itemRect.top + itemRect.bottom) / 2 - viewportRect.top;

            // --- C. Calculate the Distance from the Ideal Center ---
            // Now we know how far this item's center is from the viewport's ideal center line.
            const distanceFromCenter = Math.abs(itemCenterRelativeToViewport - centerViewportY);

            // --- D. Apply or Remove Styles Based on Proximity ---
            // This is the condition that determines if an item is "selected".
            // It checks if the item's center is within a small tolerance zone (a little more than half
            // an item's height) around the viewport's center.
            if (distanceFromCenter < $$(itemHeight) * 0.6) {
                // If it's in the target zone, apply all the "selected" styles.
                item.classList.add('is-near-center', 'opacity-100', 'font-bold', 'text-[#007bff]', 'scale-100');
            } else {
                // If it's *not* in the target zone, ensure all "selected" styles are removed.
                // This is crucial for making sure only one item is highlighted at a time.
                item.classList.remove('is-near-center', 'opacity-100', 'font-bold', 'text-[#007bff]', 'scale-100');
            }
        });
    }
    // #endregion


    // #region Get Client Y
    /**
     * `getClientY` is a cross-device utility function that reliably extracts the
     * vertical (Y-axis) coordinate from a mouse (`PointerEvent`) or a touch (`TouchEvent`).
     *
     * The browser's event models for touch and mouse are different, and this function
     * abstracts away that complexity, providing a single, consistent way to get the
     * pointer's position.
     *
     * @param e The browser event, which could be from a mouse or a touch action.
     * @returns The `clientY` (vertical position relative to the browser's viewport) of the pointer.
     */
    function getClientY(e: PointerEvent & TouchEvent): number {

        // --- Case 1: Handling the END of a touch gesture ---
        // For 'touchend' and 'touchcancel' events, the primary `e.touches` array is empty
        // because there are no longer any fingers on the screen.
        // The browser helpfully provides the position of the finger(s) that were just
        // lifted in the `e.changedTouches` array.
        if (e.type === 'touchend' || e.type === 'touchcancel') {
            // We check if `changedTouches` exists and has at least one entry.
            // If so, we use the `clientY` from the first touch point in that array.
            // As a fallback (e.g., in a rare edge case), we return `startY`, which was
            // the last known position from the start of the drag.
            return e.changedTouches?.[0]?.clientY ?? startY;
        }

        // --- Case 2: Handling ACTIVE touch gestures or mouse events ---
        // This handles 'touchstart', 'touchmove', 'pointerdown', and 'pointermove'.

        // `e.touches`: This property ONLY exists on TouchEvents. If it's present and has
        // at least one finger on the screen, we use the `clientY` of the first finger.
        // This is the standard way to track a single-finger drag on a touch device.
        if (e.touches?.length > 0) {
            return e.touches[0].clientY;
        }

        // `e.clientY`: If `e.touches` does not exist, it means this is a mouse event
        // (specifically, a `PointerEvent`). For mouse events, the position is
        // available directly on the event object as `e.clientY`. This is the fallback.
        return e.clientY;
    }
    // #endregion


    // #region Handle Start
    /**
     * `handleStart` is the event handler for the `pointerdown` (mouse) and `touchstart` (touch) events.
     * It fires the moment a user presses their finger or mouse button on the wheeler.
     *
     * This function's main job is to "set the stage" for a drag/fling gesture by:
     * 1.  Stopping any in-progress animations (like from a scroll wheel snap).
     * 2.  Initializing state flags (`isDragging`, `hasMoved`).
     * 3.  Recording the initial pointer position, list position, and time as anchor points for
     *     all subsequent movement calculations.
     * 4.  Preparing the DOM for direct, frame-by-frame manipulation by removing CSS transitions.
     */
    function handleStart(e: PointerEvent & TouchEvent) {
        // --- 1. Interrupt Handling ---
        // If a snap animation from a previous scroll-wheel action is still pending,
        // we must cancel it immediately. This gives the user's new drag gesture
        // priority and prevents the UI from jumping unexpectedly.
        if ($$(wheelSnapTimeoutId)) {
            clearTimeout($$(wheelSnapTimeoutId));
            wheelSnapTimeoutId(null);
        }

        // --- 2. Prevent Default Browser Actions ---
        // For mouse events (`pointerdown`), we prevent default to stop the browser from
        // trying to do things like select text or drag an image.
        // For `touchstart`, we DON'T prevent default here. This allows the browser's native
        // scroll-vs-tap detection to work correctly. We will call `preventDefault` later
        // in `handleMove` once we're sure the user is dragging vertically.
        if (e.type !== 'touchstart') e.preventDefault();

        // --- 3. Initialize Gesture State ---
        isDragging = true;  // The user is now actively dragging.
        hasMoved = false;   // The user has not yet moved the pointer far enough to be a "drag".

        // --- 4. Record Initial Conditions (The "Anchor Points") ---
        // These values are the reference points for all calculations in `handleMove`.
        startY = getClientY(e);          // The starting Y-coordinate of the finger/mouse on the screen.
        startTranslateY = currentY;      // The starting `translateY` position of the `<ul>` list.
        startTime = Date.now();          // The timestamp of when the gesture began.

        // --- 5. Initialize Velocity Tracking Variables ---
        // These are used in `handleMove` to calculate the speed of the drag for the "fling" effect.
        lastMoveY = startY;
        lastMoveTime = startTime;
        velocity = 0;

        // Record what kind of event started this gesture (e.g., 'touchstart').
        eventType(e.type);

        // --- 6. Prepare the DOM for Direct Manipulation ---
        // We MUST disable CSS transitions on the list element. If we don't, the list's
        // movement will lag behind the user's finger, feeling sluggish and broken.
        // The transition is only re-enabled in `handleEnd` for the final snap animation.
        if ($$(list)) $$(list).style.transition = 'none';

        // Provide immediate visual feedback to the user by changing the cursor.
        if ($$(viewport)) $$(viewport).style.cursor = 'grabbing';

        // --- 7. Cleanup ---
        // Cancel any stray animation frames from a previous, uncompleted gesture.
        if ($$(rafId)) cancelAnimationFrame($$(rafId));
    }
    // #endregion


    // #region Handle Move
    /**
     * `handleMove` is the event handler for `pointermove` and `touchmove` events.
     * It is the workhorse of the drag gesture, firing continuously as the user's
     * pointer moves across the screen.
     *
     * Its primary responsibilities are:
     * 1.  Calculating the new position of the list based on the user's pointer movement.
     * 2.  Implementing a "rubber band" effect when the user drags past the boundaries.
     * 3.  Continuously calculating the pointer's velocity for the "fling" animation in `handleEnd`.
     * 4.  Using `requestAnimationFrame` to update the DOM smoothly and efficiently.
     */
    function handleMove(e: PointerEvent & TouchEvent) {
        // --- Guard Clause ---
        // If the `isDragging` flag is not set (i.e., `handleStart` was not called), do nothing.
        if (!isDragging) return;

        // --- Step 1: Calculate Total Movement ---
        // Get the current Y-coordinate of the pointer.
        const currentMoveY = getClientY(e);
        // Calculate the total distance moved since the start of the gesture.
        const deltaY = currentMoveY - startY;

        // --- Step 2: Distinguish Between a "Click" and a "Drag" ---
        // This logic determines if the user has moved their finger far enough to
        // officially be considered "dragging" rather than just a "tap".
        if (!hasMoved && Math.abs(deltaY) > CLICK_THRESHOLD_PX) {
            hasMoved = true;
        }

        // Once we've confirmed it's a drag (`hasMoved` is true), we prevent the default
        // browser action (like scrolling the whole page on a touch device).
        if (hasMoved && e.cancelable) {
            e.preventDefault();
        }

        // --- Step 3: Calculate the New List Position ---
        // The new position is the list's starting position plus the total distance moved.
        let newY = startTranslateY + deltaY;

        // --- Step 4: Apply the "Rubber Band" Effect ---
        // If the user has dragged past the top or bottom boundaries, we apply resistance
        // to the movement, making it feel like the list is stretching on an elastic band.
        if (hasMoved) {
            if (newY > maxTranslateY) {
                // If dragged past the top, the resistance is `(newY - maxTranslateY) * 0.3`.
                // We only apply 30% of the "overscroll" distance.
                newY = maxTranslateY + (newY - maxTranslateY) * 0.3;
            } else if (newY < minTranslateY) {
                // If dragged past the bottom, apply the same resistance logic.
                newY = minTranslateY + (newY - minTranslateY) * 0.3;
            }
        }

        // --- Step 5: Calculate Instantaneous Velocity ---
        // This is crucial for the "fling" effect in `handleEnd`. We calculate the speed
        // of the pointer (pixels per millisecond) over short time intervals.
        const now = Date.now();
        const timeDiff = now - lastMoveTime;

        // We only update the velocity every ~10ms to get a stable reading.
        if (timeDiff > 10) {
            velocity = (currentMoveY - lastMoveY) / timeDiff;
            // Update the last known time and position for the next calculation.
            lastMoveTime = now;
            lastMoveY = currentMoveY;
        }

        // --- Step 6: Efficiently Update the DOM with `requestAnimationFrame` ---
        // This is a critical performance optimization. Instead of directly manipulating
        // the DOM on every `move` event (which can fire hundreds of times per second),
        // we schedule the update to happen on the browser's next available animation frame.

        // First, cancel any previously scheduled frame to avoid redundant updates.
        if ($$(rafId)) {
            cancelAnimationFrame($$(rafId));
        }

        // Schedule the DOM update. This function will be executed just before the next repaint.
        rafId(requestAnimationFrame(() => {
            currentY = newY; // Update the component's internal position state.
            // Apply the new position to the list element.
            $$(list).style.transform = `translateY(${currentY}px)`;
            // Update the styles to highlight the newly centered item.
            updateItemStyles();
        }));
    }
    // #endregion


    // #region Handle End
    /**
     * `handleEnd` is the event handler for `pointerup` and `pointercancel` events.
     * It fires when the user releases their finger or mouse button, completing the gesture.
     *
     * This function's logic is divided into two main paths:
     * 1.  **If the gesture was a "tap" (no significant movement):** It determines which item
     *     was tapped and calls `snapToIndex` to center it.
     * 2.  **If the gesture was a "drag" or "fling":** It uses the final calculated velocity
     *     to predict where the list should coast to and calls `snapToIndex` to animate it
     *     to that final resting place.
     */
    function handleEnd(e: PointerEvent) {
        // --- Guard Clause ---
        // If no drag was in progress, there's nothing to do.
        if (!isDragging) {
            return;
        }

        // --- Step 1: Cleanup and Reset State ---
        isDragging = false; // The gesture is officially over.

        // Revert the cursor back to its default "grab" state.
        if ($$(viewport)) $$(viewport).style.cursor = 'grab';

        // Cancel any pending animation frame from the last `handleMove` event.
        if ($$(rafId)) {
            cancelAnimationFrame($$(rafId));
        }

        // --- Step 2: Determine if the Gesture was a Tap or a Drag ---
        // The `hasMoved` flag was set in `handleMove` if the user dragged more
        // than the `CLICK_THRESHOLD_PX`.

        if (!hasMoved) {
            // --- Path A: The gesture was a TAP/CLICK ---

            const targetElement = e.target as HTMLElement;
            // Find the closest parent `<li>` that is a wheeler item.
            const targetItem = targetElement.closest('.wheeler-item') as HTMLElement;

            // Check if we successfully found an item and it's not an invisible padding item.
            if (targetItem && !targetItem.classList.contains('is-padding')) {
                // Get the index of the clicked item from its `data-index` attribute.
                const clickedIndex = parseInt(targetItem.dataset.index, 10);
                // If the index is a valid number, snap to that item.
                if (!isNaN(clickedIndex) && clickedIndex >= 0 && clickedIndex < $$(formattedOptions).length) {
                    snapToIndex(clickedIndex);
                    return; // Done.
                }
            }

            // Fallback for a "missed" tap (e.g., user tapped between items).
            // We calculate which item is *currently* closest to the center and snap to it.
            const idealIndexMiss = Math.round(($$(indicatorTop) - currentY) / $$(itemHeight)) - $$(paddingItemCount);
            snapToIndex(idealIndexMiss);
            return; // Done.
        }

        // --- Path B: The gesture was a DRAG or FLING ---

        // Case 1: The user released the pointer while outside the scroll boundaries.
        // In this case, we don't apply inertia; we just snap back to the nearest boundary.
        if (currentY > maxTranslateY || currentY < minTranslateY) {
            const boundaryIndex = currentY > maxTranslateY ? 0 : $$(formattedOptions).length - 1;
            snapToIndex(boundaryIndex);
        } else {
            // Case 2: The user released inside the boundaries (a "fling").
            // Use the final velocity calculated in `handleMove` to simulate inertia.

            // Predict the "coasting" distance. The multiplier (120) is a magic number
            // that controls the "friction" of the fling. A higher number means less friction.
            const inertiaDist = velocity * 120;

            // Calculate the predicted final Y position after the fling.
            const predictedY = currentY + inertiaDist;

            // Convert that final Y position back into the closest item index.
            const idealIndex = Math.round(($$(indicatorTop) - predictedY) / $$(itemHeight)) - $$(paddingItemCount);

            // Call `snapToIndex` to animate the list to its final resting place.
            snapToIndex(idealIndex);
        }

        // Reset velocity for the next gesture.
        velocity = 0;
    }
    // #endregion


    // #region Handle Wheel
    /**
     * `handleWheel` is the event handler for the `onWheel` event, specifically for
     * mouse scroll wheels. It provides an alternative navigation method to touch/drag.
     *
     * The logic is designed to feel responsive and intuitive:
     * 1.  Each "tick" of the scroll wheel moves the list immediately and directly.
     * 2.  It uses a debouncing mechanism: After the user stops scrolling for a brief
     *     moment (150ms), it automatically triggers a `snapToIndex` to center the
     *     nearest item.
     */
    function handleWheel(event: WheelEvent) {
        // --- Guard Clause ---
        // If the user is already dragging with the mouse, we prioritize the drag
        // gesture and ignore the scroll wheel event to prevent conflicts.
        if (isDragging) return;

        // --- Step 1: Hijack the Scroll Event ---
        // This is crucial. It prevents the default browser action, which would be
        // to scroll the entire page. We want to capture all scroll input for our component.
        event.preventDefault();

        // --- Step 2: Debounce the Snap-Back Animation ---
        // If a timeout to snap the wheel is already scheduled from the *previous* scroll tick,
        // we cancel it. This is the core of the debouncing logic. It ensures that the final
        // snap only happens *after* the user has completely stopped scrolling.
        if ($$(wheelSnapTimeoutId)) {
            clearTimeout($$(wheelSnapTimeoutId));
        }

        // For the duration of the scroll, we want direct, instant movement.
        // We remove the CSS transition to make the list follow the wheel ticks precisely.
        if ($$(list)) $$(list).style.transition = 'none';

        // --- Step 3: Calculate and Apply the Movement ---
        // `event.deltaY` contains the vertical scroll amount from the browser.
        // We multiply it by a factor (0.5) to control the scroll "sensitivity".
        // A smaller number makes the wheel move less per scroll tick.
        const scrollAmount = event.deltaY * 0.5;

        // Calculate the new Y-position of the list. We subtract the scroll amount because
        // a positive deltaY (scrolling down) should move the list content up.
        const newY = currentY - scrollAmount;

        // Use our central function to apply the new position to the DOM, which also
        // handles clamping the position within the boundaries.
        setTranslateY(newY);

        // Record that the last interaction was a 'wheel' event.
        eventType(event.type);

        // --- Step 4: Schedule the Final Snap ---
        // After moving the list for the current tick, we schedule the snap-to-center
        // action to happen in 150 milliseconds. If another `wheel` event occurs
        // before this timeout completes, it will be cancelled and rescheduled.
        wheelSnapTimeoutId(setTimeout(() => {
            // This code only runs if the user has paused scrolling for 150ms.

            // Calculate which item index is currently closest to the center line.
            const idealIndex = Math.round(($$(indicatorTop) - currentY) / $$(itemHeight)) - $$(paddingItemCount);

            // Trigger the smooth animation to snap to that ideal index.
            snapToIndex(idealIndex);

            // Reset the timeout ID to indicate that no snap is pending.
            wheelSnapTimeoutId(null);
        }, 150));
    }
    // #endregion


    // #region Handle Pointer Events
    /**
     * This `useEffect` hook is responsible for managing the GLOBAL event listeners
     * for pointer (mouse/touch) movements and release actions.
     *
     * WHY ARE THESE LISTENERS ON THE `document` AND NOT THE `viewport` ELEMENT?
     * This is a crucial pattern for creating a robust drag-and-drop experience. If the
     * listeners were only on the `viewport` element, the drag would immediately stop
     * if the user's pointer accidentally moved outside the bounds of the component.
     * By attaching the `pointermove` and `pointerup` listeners to the entire document,
     * the component can continue to track the user's gesture seamlessly, no matter
     * where their pointer goes on the screen, until they finally release it.
     *
     * The `handleStart` event, however, remains on the `viewport` element itself, because
     * the drag must originate *from within* the component.
     *
     * NOTE: This hook has no dependency array, so it runs on every render. However,
     * `addEventListener` is idempotent (calling it multiple times with the same function
     * has no effect), so this is safe, though a version with an empty dependency array `[]`
     * would be slightly more performant.
     */
    useEffect(() => {
        // --- Setup Phase ---
        // This code runs when the component mounts (and after every re-render).

        // Attach the `handleMove` function to the `pointermove` event for the entire document.
        // Now, as long as the component is mounted, it will listen for pointer movements anywhere on the page.
        document.addEventListener('pointermove', handleMove as any);

        // Attach the `handleEnd` function to the `pointerup` event for the entire document.
        // This ensures that the gesture is correctly finalized and cleaned up, even if the user
        // releases their mouse button far outside the component's area.
        // The `e => handleEnd` syntax is used here to ensure a fresh reference to handleEnd if it were to change,
        // although in this specific component it is stable.
        document.addEventListener('pointerup', handleEnd);

        // --- Cleanup Phase ---
        // The function returned by `useEffect` is the "cleanup" function. It is called
        // when the component is about to unmount from the DOM.
        return () => {
            // It is critical to remove the global event listeners when the component is destroyed.
            // If we don't, we will create a "memory leak". The `handleMove` and `handleEnd`
            // functions would continue to exist and fire on user interactions even after the
            // component is gone, leading to errors and unpredictable behavior.
            document.removeEventListener('pointermove', handleMove as any);
            document.removeEventListener('pointerup', handleEnd);
        };
    });
    // #endregion


    // #region Handle Value Updates
    /**
     * This `useEffect` hook handles the "Top-Down" data synchronization for SINGLE-SELECT mode.
     *
     * Its primary responsibility is to listen for changes to the external `value` prop
     * (passed in as `oriValue` and aliased to the internal `value`) and update the
     * component's internal `selectedIndex` state to match.
     *
     * This ensures that if the parent component programmatically changes the selected value,
     * the wheeler will visually "spin" to the correct item.
     *
     * It runs after every render, but contains internal guards to prevent unnecessary work.
     */
    useEffect(() => {
        // --- Guard Clause 1: Mode Check ---
        // This logic is only for single-select mode. If the component is in multi-select
        // mode (`multiple` is true), we exit immediately.
        if ($$(multiple)) return;

        // --- Guard Clause 2: Performance Optimization ---
        // This is a crucial check to prevent infinite loops. `preValue` stores the value
        // from the last time this effect ran. If the current `value` is the same as the
        // last one we processed, it means no meaningful change has occurred, so we can
        // safely exit and avoid redundant calculations.
        if ($$(value) === preValue) return;

        // If the value *has* changed, we update `preValue` to the new value for the next run.
        preValue = $$(value);

        // --- Step 1: Find the Corresponding Index ---
        // We search through the `formattedOptions` array to find the index of the item
        // whose `value` property matches the new external `value`.
        const foundIndex = $$(formattedOptions).findIndex(opt => opt.value === $$(value));

        // `foundIndex` will be -1 if no matching item is found.

        // --- Step 2: Update Internal State ---
        // We only update the internal `selectedIndex` if the `foundIndex` is different
        // from the current `selectedIndex`. This is another optimization to prevent
        // unnecessary re-renders if the index is already correct.
        if ($$(selectedIndex) !== foundIndex) {
            selectedIndex(foundIndex);
        }
    });
    // #endregion


    // <<< Populate list *after* first layout calculation >>>
    // populateList()

    // A local state variable to track the last index that was processed by this effect,
    // used to prevent infinite loops.
    const oriIndex = $(-1)

    // Track if initial snap has been done
    const hasInitialSnapped = $(false)

    // #region Initial Snap on Mount or Visibility Change
    /**
     * This `useEffect` handles the initial snap to position when the Wheeler
     * first becomes visible. It ensures the correct item is centered without
     * running on every render.
     */
    useEffect(() => {
        // Only snap for single-select mode
        if ($$(multiple)) return;

        // Only snap when visible
        if (!$$(visibleProp)) {
            // Reset the flag when hidden so it will snap again when shown
            hasInitialSnapped(false);
            return;
        }

        // Only snap once per visibility cycle
        if ($$(hasInitialSnapped)) return;

        // Recalculate selectedIndex from the current value to ensure sync
        const currentValue = $$(value);
        const foundIndex = $$(formattedOptions).findIndex(opt => opt.value === currentValue);

        if (foundIndex !== -1 && foundIndex !== $$(selectedIndex)) {
            selectedIndex(foundIndex);
        }

        // Perform the initial snap with the correct index
        const indexToSnap = foundIndex !== -1 ? foundIndex : $$(selectedIndex);
        snapToIndex(indexToSnap, true);
        hasInitialSnapped(true);
    });
    // #endregion

    // #region Handle Index Updates
    /**
     * This `useEffect` hook handles the "Bottom-Up" data synchronization for SINGLE-SELECT mode.
     *
     * Its primary responsibility is to listen for changes to the internal `selectedIndex` state
     * (which is updated by user gestures like flinging or tapping) and then:
     * 1.  Update the external `value` prop (`oriValue`) to notify the parent component of the new selection.
     * 2.  Trigger the `snapToIndex` animation to visually center the newly selected item.
     *
     * This is the effect that connects the user's interaction to the component's output.
     */
    useEffect(() => {
        // --- Guard Clause 1: Mode Check ---
        // This logic is exclusively for single-select mode.
        if ($$(multiple)) return;

        // --- Guard Clause 2: Prevent Infinite Loops ---
        // `oriIndex` stores the last `selectedIndex` we processed. If the index hasn't changed,
        // we exit immediately. This is critical to stop the component from re-triggering this
        // effect over and over.
        if ($$(oriIndex) === $$(selectedIndex)) {
            return;
        }

        // If the index *has* changed, update our tracker for the next run.
        oriIndex($$(selectedIndex));

        // --- Step 1: Update the Parent's Value (Propagate Change Outwards) ---
        // This block checks if the external `value` is out of sync with our new internal `selectedIndex`.

        // First, a safety check to ensure the selected index is valid before trying to access the array.
        if ($$(selectedIndex) < 0 || $$(selectedIndex) >= $$(formattedOptions).length) {
            // Handle cases where the index is invalid (e.g., -1).
            console.warn(`Index "${$$(selectedIndex)}" out of bounds during value update.`);
        } else if ($$(value) !== $$(formattedOptions)[$$(selectedIndex)].value) {
            // The internal selection has changed and is different from the current external value.

            // This is a special condition: if the user changed the value via the scroll wheel
            // AND the `changeValueOnClickOnly` prop is true, we SKIP the value update.
            if ($$(eventType) === "wheel" && $$(changeValueOnClickOnly)) {
                // Do nothing. The parent's value will not be updated.
            } else {
                // // In all other cases (click, fling, or default behavior), we update the value.
                // value($$(formattedOptions)[$$(selectedIndex)].value); // Update internal value state.

                // // If not using an "OK" button flow, immediately update the parent's `oriValue` observable.
                // if (!ok && isObservable(oriValue)) {
                //     oriValue($$(value));
                // }

                // In all other cases (click, fling, or default behavior), we update the value.
                // This now DIRECTLY updates the parent's observable.
                value($$(formattedOptions)[$$(selectedIndex)].value);
            }
        }

        // --- Step 2: Update the UI (Trigger Visual Snap) ---
        // This block ensures the wheeler visually snaps to the correct position.

        if ($$(selectedIndex) >= 0 && $$(selectedIndex) < $$(formattedOptions).length) {
            // If the index is valid, command the UI to animate to that position.
            snapToIndex($$(selectedIndex));
        } else {
            // If the index is invalid (e.g., -1 means "no selection"), we log a warning.
            // A potential improvement here could be to snap to a default position like index 0.
            console.warn(`Index "${$$(selectedIndex)}" is out of bounds for snapping.`);
            // Optionally reset to a known safe state.
            // selectedIndex(-1); // This could be added if you want to enforce no selection on error.
        }
    });
    // #endregion

    const wheeler = $<HTMLDivElement>()

    // #region Visibility Management
    /**
     * This `useEffect` hook manages the component's lifecycle in relation to its `visible` state
     * and a global list of `ActiveWheelers`.
     *
     * It's responsible for three main tasks:
     * 1.  **Cleanup on Hide:** When the wheeler becomes hidden (`visible` is false), it resets
     *     internal state and removes itself from the global `ActiveWheelers` list.
     * 2.  **Registration on Show:** When the wheeler becomes visible, it registers itself in the
     *     global `ActiveWheelers` list. This is likely used by other parts of the application
     *     (like a global `useClickAway` manager) to know which wheelers are currently open.
     * 3.  **Data Resync on Show:** When the wheeler re-appears, it triggers a data synchronization
     *     (`value2chk`) to ensure its checkbox states are up-to-date with the latest `value` prop.
     *
     * This hook runs on every render to react to changes in the `visible` prop.
     */
    useEffect(() => {
        // --- Path 1: The component is being hidden ---
        if (!$$(visibleProp)) {
            // --- A. Reset Internal State ---
            // `preValue` is a cache used to optimize the `value2chk` sync function.
            // When the component is hidden, we must clear this cache. This ensures that
            // the next time it becomes visible, the sync function will run fresh,
            // even if the `value` prop hasn't changed in the interim.
            preValue = null;

            // --- B. Unregister from Global State ---
            // `ActiveWheelers` is a global observable array tracking all visible wheelers.
            // We check if this specific wheeler instance is currently in the array.
            if ($$(ActiveWheelers).some(w => w === wheeler)) {
                // If it is, we update the global array by filtering this instance out.
                // This correctly notifies the rest of the application that this wheeler is no longer active.
                ActiveWheelers($$(ActiveWheelers).filter(w => w !== wheeler));
            }

            // We're done with the "hide" logic, so we exit the effect.
            return;
        }

        // --- Path 2: The component is being shown (or is already visible) ---

        // --- A. Register in Global State ---
        // We check if this wheeler instance is *not* already in the `ActiveWheelers` array.
        // This prevents adding duplicates on subsequent re-renders while it remains visible.
        if ($$(ActiveWheelers).filter(w => w === wheeler).length === 0) {
            // If it's not present, we add it to the global list.
            ActiveWheelers([...$$(ActiveWheelers), wheeler]);
        }

        // --- B. Re-synchronize Data ---
        // When the wheeler becomes visible, the external `value` prop may have changed
        // while it was hidden. We call `value2chk()` to force a re-sync between the
        // `value` prop and the internal checkbox states, ensuring the UI is up-to-date.
        value2chk();

        // The original cleanup function was likely intended to unregister the wheeler
        // when the component is fully unmounted from the DOM. The logic inside the
        // `if (!$$(visible))` block now handles this more explicitly when visibility changes.
        // A `return () => { ... }` could still be useful for final cleanup on unmount,
        // but the current implementation covers the primary use case.
    });
    // #endregion

    // #region Click Away Logic
    /**
     * This hook implements the "click away" or "blur" functionality for the Wheeler.
     * It uses the `useClickAway` custom hook, which detects any clicks that occur
     * *outside* of the main wheeler element (`wheeler`).
     *
     * When an outside click is detected, the callback function is executed, which can
     * be configured to either "cancel" the selection or "commit" (save) it.
     *
     * @param {Observable<HTMLDivElement>} wheeler - A ref to the main `<div>` of the wheeler component.
     * @param {Function} callback - The function to run when a click outside `wheeler` occurs.
     */
    useClickAway(wheeler, () => {

        const hide = () => {
            isVisible(false); // Update internal state
            if (isObservable(visibleProp)) {
                visibleProp(false); // Also update the parent's state if it's an observable
            }
        };

        // --- Path 1: The "Cancel on Blur" Behavior ---
        // This block runs if the `cancelOnBlur` prop is true.
        if ($$(cancelOnBlur)) {
            // This action simply hides the component. It does NOT save the user's
            // current selection. The internal `value` is effectively discarded,
            // and the parent component's `oriValue` remains unchanged from before
            // the wheeler was opened.
            // visible(false); // Just hide, no save.
            hide();
        }


        // --- Path 2: The "Commit on Blur" Behavior ---
        // This block runs if the `commitOnBlur` prop is true. This is a "hide and save" action.
        if ($$(commitOnBlur)) {
            // This section contains two ways to commit the value, depending on how the
            // component is being used.

            // Method A: Using the "OK" flow.
            // If an `ok` observable was passed as a prop, we trigger it by setting it to `true`.
            // This delegates the responsibility of saving and closing to the `useEffect` hook
            // that is specifically listening for `ok` to become true. This keeps the commit
            // logic centralized.
            if (isObservable(ok)) {
                ok(true);
            }

            // Method B: Direct commit (when there's no "OK" flow).
            // This is a fallback for when the component is used in a simpler mode without
            // a separate "OK" button. It directly updates the parent's `oriValue` observable
            // with the wheeler's current internal `value`.
            // The original `// if (!ok)` comment suggests this is the intended fallback.
            else if (isObservable(oriValue)) {
                oriValue($$(value));
            }

            // After triggering the save (either directly or indirectly), we hide the component.
            // Note: If using the `ok(true)` method, the other `useEffect` will also call
            // `visible(false)`, but calling it here ensures the component always closes.
            // visible(false);
            hide();
        }

        // NOTE: The props `cancelOnBlur` and `commitOnBlur` are likely intended to be
        // used mutually exclusively. If both were true, `commitOnBlur` would run last
        // and take precedence.
    });
    // #endregion

    // #region Search Logic
    /**
     * The `search` function is an event handler for a text input, allowing users to
     * quickly find and select an item in the wheeler by typing.
     *
     * It performs a case-insensitive search on the `label` of each option. If a match
     * is found, it updates the component's value, which in turn causes the wheeler
     * to spin to that item.
     *
     * @param searchText The search string entered by the user.
     */
    const search = (searchText: string) => {
        // --- Guard Clause: Handle empty input ---
        // If the search text is empty, there's nothing to search for.
        if (!searchText) {
            return;
        }

        // Prepare the search text for case-insensitive comparison.
        const lowercasedSearchText = searchText.toLowerCase();

        // --- Step 1: Find the first matching option ---
        // Use the `.find()` method correctly to get the first matching element.
        // We search against the `label` property, which is guaranteed to be a string.
        const foundOption = $$(formattedOptions).find(option => {
            // Ensure the label is a string before calling .toLowerCase() for type safety.
            const label = String(option.label).toLowerCase();
            return label.includes(lowercasedSearchText);
        });

        // --- Step 2: Handle the result ---
        if (foundOption) {
            // If a matching option was found...
            const newValue = foundOption.value;

            // Update the internal `value` state of the component.
            value(newValue);

            // Update the external `oriValue` prop to notify the parent component.
            // This will trigger the `useEffect` that listens for value changes
            // and snaps the wheeler to the correct index.
            if (isObservable(oriValue)) {
                (oriValue as any)(newValue);
            }
        } else {
            // If no match was found, provide feedback to the user.
            // In a real application, this could be a more subtle UI message
            // instead of a blocking alert.
            console.warn(`Wheeler search: No results found for "${searchText}"`);
            // alert("No results found");
        }
    }
    // #endregion

    // #region Placeholder Text Logic
    const placeholderText = useMemo(() => {
        const customPlaceholder = $$(searchPlaceholder);

        // Priority 1: Use the user-provided `searchPlaceholder` if it exists.
        if (customPlaceholder) {
            return customPlaceholder;
        }

        // Priority 2: If no custom placeholder, try to derive one from the header.
        if (header) {
            const headerContent = header(value);
            if (typeof headerContent === 'string' && headerContent.length > 0) {
                return `Enter ${headerContent.toLowerCase()}`;
            }
        }

        // Priority 3: If all else fails, use the default fallback text.
        return "Search...";
    });
    // #endregion

    // #region Header With Search
    const HeaderWithSearch = () => {
        // If no header prop is provided, render nothing.
        if (!header) return null

        return (
            <div>
                <div class='font-bold text-center'>{() => header(value)}</div>

                {/* This conditional rendering is now correct with your `searchable` prop */}
                {() => $$(searchable) && (
                    <div class="relative flex flex-col flex-wrap items-center my-2">
                        <input
                            type="text"
                            placeholder={placeholderText} // This now uses our new logic
                            class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out w-64"
                            onInput={(e) => {
                                const value = e.target.value
                                search(value)
                            }}
                        />
                    </div>
                )}

                <div class="my-1 h-px w-full bg-gray-300 dark:bg-gray-600"></div>
            </div>
        )
    }
    // #endregion


    // #region Wheeler Content
    const WheelerContent = () => (
        <>
            <HeaderWithSearch />
            <div
                ref={viewport}
                onPointerDown={handleStart as any}
                onWheel={handleWheel}
                class="wheeler-viewport overflow-hidden relative touch-none cursor-grab overscroll-y-contain"
                style={{ height: () => `${$$(viewportHeight)}px` }}
            >
                <ul class='wheeler-list m-0 p-0 list-none' ref={list}>
                    {() => [...populateList()]}
                </ul>

                {/* The selection indicator is only shown for single-select mode */}
                {/* {!$$(multiple) &&
                    <div
                        class='wheeler-indicator absolute box-border pointer-events-none bg-[rgba(0,123,255,0.05)] border-y-[#007bff] border-t border-solid border-b inset-x-0'
                        style={{
                            height: () => `${$$(itemHeight)}px`,
                            top: () => `${$$(indicatorTop)}px`,
                        }}
                    />
                } */}
                {
                    () => $$(multiple) ? null
                        :
                        <div class='wheeler-indicator absolute h-9 box-border pointer-events-none bg-[rgba(0,123,255,0.05)] border-y-[#007bff] border-t border-solid border-b inset-x-0' style={{
                            height: () => `${$$(itemHeight)}px`,
                            top: () => `${$$(indicatorTop) + $$(itemHeight) / 2}px`, // Center line of indicator
                            transform: `translateY(-50%)`,
                        }}>
                        </div>
                }
            </div>
        </>
    );
    // #endregion


    // #region Render Logic

    const renderAsPopup = () => (
        <Portal mount={document.body}>
            {/* {$$(mask) && (
                <div
                    class="fixed inset-0 bg-black/50 z-50"
                    // This uses the `hide` function pattern from MultiWheeler for consistency
                    onClick={() => $$(cancelOnBlur) && hide()}
                />
            )} */}
            {
                () => $$(mask) ?
                    <>
                        <div class={['fixed inset-0 bg-black/50 h-full w-full z-[00] opacity-50']} />
                    </>
                    : null
            }
            {/* <div
                ref={wheeler}
                // Combines the base popup styles with any custom classes from the `cls` prop
                class={["wheeler-widget fixed inset-x-0 bottom-0 z-[100] w-full bg-white", $$(cls)]}
                {...otherProps}
            > */}
            <div ref={wheeler} class={() => ['wheeler-widget z-[100]', $$(cls), "fixed inset-x-0 bottom-0 w-full z-20 bg-white"]}>
                <WheelerContent />
            </div>
        </Portal>
    );

    const renderAsInline = () => (
        <div
            ref={wheeler}
            // Combines base inline styles with custom classes from the `cls` prop
            class={["wheeler-widget", $$(cls)]}
            {...otherProps}
        >
            <WheelerContent />
        </div>
    );

    // --- Main Return Logic ---
    return () => {
        // If not visible, render nothing.
        // if (!$$(isVisible)) {
        //     return null;
        // }
        // If visible, check the `bottom` prop to decide which render function to use.
        return $$(bottom) ? renderAsPopup() : renderAsInline();
    };
    // return <>
    //     {() => !$$(visibleProp) ? null :
    //         $$(bottom) ?
    //             <Portal mount={document.body}>
    //                 {
    //                     () => $$(mask) ?
    //                         <>
    //                             <div class={['fixed inset-0 bg-black/50 h-full w-full z-[00] opacity-50']} />
    //                         </>
    //                         : null
    //                 }
    //                 <div ref={wheeler} class={() => ['wheeler-widget z-[100]', $$(cls), "fixed inset-x-0 bottom-0 w-full z-20 bg-white"]}>
    //                     {/* {
    //                         () => header ?
    //                             <>
    //                                 <div>
    //                                     <div class='font-bold text-center'>{() => header(value)}</div>
    //                                     <div class="w-screen relative flex flex-col flex-wrap items-center">
    //                                         <input
    //                                             type="text"
    //                                             // placeholder={`Enter ${((header as any)() as any).toLowerCase()}`}
    //                                             placeholder={placeholderText}
    //                                             class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out w-64"
    //                                             onChange={(e) => {
    //                                                 const value = e.target.value
    //                                                 search(value)
    //                                             }}
    //                                         />
    //                                     </div>
    //                                     <div class="my-1 h-px w-full bg-gray-300 dark:bg-gray-600"></div>
    //                                 </div>
    //                             </>
    //                             : null
    //                     } */}
    //                     <HeaderWithSearch />
    //                     <div ref={viewport}
    //                         onPointerDown={handleStart as any}
    //                         onPointerMove={handleMove as any}     /* {passive: false } */
    //                         onPointerUp={handleEnd}
    //                         onPointerCancel={handleEnd}
    //                         onWheel={handleWheel} /* {passive: false } */
    //                         class={['wheeler-viewport overflow-hidden relative touch-none cursor-grab overscroll-y-contain transition-[height] duration-[0.3s] ease-[ease-out]']}
    //                         style={{ height: () => `${$$(viewportHeight)}px` }}
    //                     >
    //                         <ul class='wheeler-list transition-transform duration-[0.3s] ease-[ease-out] m-0 p-0 list-none' ref={list}>
    //                             {() => [...populateList()]}
    //                         </ul>
    //                         <div class='wheeler-indicator absolute h-9 box-border pointer-events-none bg-[rgba(0,123,255,0.05)] border-y-[#007bff] border-t border-solid border-b inset-x-0' style={{
    //                             height: () => `${$$(itemHeight)}px`,
    //                             top: () => `${$$(indicatorTop) + $$(itemHeight) / 2}px`, // Center line of indicator
    //                             transform: `translateY(-50%)`,
    //                         }}>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </Portal>
    //             :
    //             <div class={['wheeler-widget', $$(cls)]}>
    //                 {/* {
    //                     () => header ?
    //                         <>
    //                             <div class={'font-bold text-center'}>{() => header(value)}</div>
    //                             <div class="my-1 h-px w-full bg-gray-300 dark:bg-gray-600"></div>
    //                         </>
    //                         : null
    //                 } */}
    //                 <HeaderWithSearch />
    //                 <div ref={viewport}
    //                     onPointerDown={handleStart as any}
    //                     onPointerMove={handleMove as any}     /* {passive: false } */
    //                     onPointerUp={handleEnd}
    //                     onPointerCancel={handleEnd}
    //                     onWheel={handleWheel} /* {passive: false } */
    //                     class={['wheeler-viewport overflow-hidden relative touch-none cursor-grab overscroll-y-contain transition-[height] duration-[0.3s] ease-[ease-out]']}
    //                     style={{ height: () => `${$$(viewportHeight)}px` }}
    //                 >
    //                     <ul class='wheeler-list transition-transform duration-[0.3s] ease-[ease-out] m-0 p-0 list-none' ref={list}>
    //                         {() => [...populateList()]}
    //                     </ul>

    //                     {
    //                         () => $$(multiple) ? null
    //                             :
    //                             <div class='wheeler-indicator absolute h-9 box-border pointer-events-none bg-[rgba(0,123,255,0.05)] border-y-[#007bff] border-t border-solid border-b inset-x-0' style={{
    //                                 height: () => `${$$(itemHeight)}px`,
    //                                 top: () => `${$$(indicatorTop) + $$(itemHeight) / 2}px`, // Center line of indicator
    //                                 transform: `translateY(-50%)`,
    //                             }}>
    //                             </div>
    //                     }
    //                 </div>
    //             </div>
    //     }
    // </>
    // #endregion

})



export { Wheeler }

// NOTE: Register the custom element
customElement('wui-wheeler', Wheeler);

// NOTE: Add the custom element to the JSX namespace
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-wheeler': ElementAttributes<typeof Wheeler>
        }
    }
}

export default Wheeler

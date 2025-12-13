/* @jsxImportSource woby */
import { $, $$, Observable, ObservableMaybe, useEffect, useMemo, untrack, Portal, type JSX, isObservable, defaults, customElement, ElementAttributes } from 'woby'
import { use, useClickAway, useViewportSize } from '@woby/use'
import { Wheeler, def as wheelerDef } from './Wheeler' // Adjust path
import { Button } from '../Button'
import { pick } from '../helper/helper'
import { WheelerItem } from './WheelerType'

// --- Utilities (unchanged) ---
const padZero = (num: number): string => (num < 10 ? '0' : '') + num
const getDaysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate() // month is 0-indexed
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const parseDate = (dateInput: Date | string | null | undefined): Date | null => {
    if (!dateInput) return null
    if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput
    try {
        const p = new Date(dateInput)
        return isNaN(p.getTime()) ? null : p
    } catch (e) { return null }
}

export type DateTimeWheelerType = 'year' | 'month' | 'date' | 'time' | 'datetime' | 'hour'


const CURRENT_DATE = new Date()
const MIN_YEAR = 1900
const MAX_YEAR = CURRENT_DATE.getFullYear() + 20

const DATETIME_WHEELER_CLS = 'date-time-Wheeler flex w-full bg-white p-1 border border-gray-300 rounded-md shadow-sm '
const WHEELER_WRAPPER_CLS = 'wheel-wrapper flex-1'


const def = () => {

    // 1. Get the full object of default values from the single Wheeler
    const baseDefaults = wheelerDef()

    // 2. Define the exact keys for props that are inherited and behave the same
    const inheritedKeys = [
        'cls', 'bottom', 'commitOnBlur', 'ok', 'visible', 'mask', 'cancelOnBlur', 'itemHeight', 'itemCount', 'changeValueOnClickOnly'
    ] as const

    // 3. Pick those default values from the base Wheeler definition
    const inheritedDefaults = pick(baseDefaults, inheritedKeys)

    return {
        value: $(CURRENT_DATE) as ObservableMaybe<Date>,
        mode: $("datetime" as DateTimeWheelerType) as ObservableMaybe<DateTimeWheelerType>,
        minDate: $(new Date(1900, 0, 1)) as ObservableMaybe<Date | string>, // January 1, 1900
        maxDate: $(new Date(2100, 11, 31)) as ObservableMaybe<Date | string>, // December 31, 2100,
        yearRange: $({ start: MIN_YEAR, end: MAX_YEAR }) as ObservableMaybe<{ start: number, end: number }>,
        divider: $(true) as ObservableMaybe<boolean>,
        // title: (d: Date) => <div>{d.toISOString()}</div> as ObservableMaybe<(d: Date) => JSX.Element>,
        title: undefined as ((v: ObservableMaybe<any | any[]>) => JSX.Element) | undefined,
        visible: $(true) as ObservableMaybe<boolean>,
        ...inheritedDefaults
    }
}

const DateTimeWheeler = defaults(def, (props) => {
    const { value: oriDate, mode, minDate: minDateProp, maxDate: maxDateProp, yearRange: yearRangeProp, divider, title, cls, bottom: bottomProp, commitOnBlur, cancelOnBlur, ok, mask, itemHeight, itemCount, changeValueOnClickOnly, visible: visibleProp, ...otherProps } = props

    // #region Internal Selection State
    const type = use(mode)
    const yearRange = use(yearRangeProp, { start: MIN_YEAR, end: MAX_YEAR })
    const minDate = useMemo(() => parseDate($$(use(minDateProp))))
    const maxDate = useMemo(() => parseDate($$(use(maxDateProp))))

    const modDate = $($$(oriDate) ?? new Date()) //use(oriDate, new Date())
    const selectedYear = $($$(modDate).getFullYear())
    const selectedMonth = $($$(modDate).getMonth())
    const selectedDay = $($$(modDate).getDate())
    const selectedHour = $($$(modDate).getHours())
    const selectedMinute = $($$(modDate).getMinutes())
    const selectedSecond = $($$(modDate).getSeconds())
    // #endregion

    const isVisible = $($$(visibleProp) ?? true)

    // This handles the "top-down" data flow.
    useEffect(() => {
        const propValue = $$(visibleProp)
        if (propValue !== undefined && propValue !== $$(isVisible)) {
            isVisible(propValue)
        }
    })

    const hide = () => {
        isVisible(false)
        if (isObservable(visibleProp)) {
            visibleProp(false)
        }
    }


    // #region Sync `modDate` to Individual Wheel States
    /**
     * This `useEffect` hook acts as a 'one-way data flow' synchronizer.
     * Its primary responsibility is to ensure that whenever the central `modDate` state changes,
     * its new value is pushed down to all the individual `selected...` state observables
     * that control the UI wheels.
     *
     * It runs after every render (since it has no dependency array) to constantly enforce this consistency.
     */
    useEffect(() => {
        const val = $$(modDate)
        const parsed = parseDate(val)

        /**
        * The following blocks check if each individual wheel's state is out of sync with the central `modDate`.
        * If it is, it updates the wheel's state.
        */

        // --- Year Synchronization ---
        // Check if the `selectedYear` state is different from the `modDate`'s year.
        // `untrack()` is CRUCIAL here. It reads the observable's value *without* creating a dependency.
        // This prevents an infinite loop. Without it, updating `selectedYear` would cause this
        // effect to re-run, creating a cycle.
        if (parsed) {

            if (untrack(selectedYear) !== parsed.getFullYear())
                selectedYear(parsed.getFullYear())

            if (untrack(selectedMonth) !== parsed.getMonth())
                selectedMonth(parsed.getMonth())

            // Make sure day is valid for the NEW month/year before setting
            const daysInParsedMonth = getDaysInMonth(parsed.getFullYear(), parsed.getMonth())
            const dayToSet = Math.min(parsed.getDate(), daysInParsedMonth)
            if (untrack(selectedDay) !== dayToSet)
                selectedDay(dayToSet)

            if (untrack(selectedHour) !== parsed.getHours())
                selectedHour(parsed.getHours())

            if (untrack(selectedMinute) !== parsed.getMinutes())
                selectedMinute(parsed.getMinutes())

            if (untrack(selectedSecond) !== parsed.getSeconds())
                selectedSecond(parsed.getSeconds())
        }
    })
    // #endregion

    //#region Reconcile Wheel State and Update Main Date (Bottom-Up Sync)
    /**
     * This `useEffect` hook is the "bottom-up" data flow synchronizer.
     * Its primary responsibility is to listen for changes in any of the individual `selected...`
     * wheel states (which are changed by user interaction) and then:
     * 1. Validate the combined date (e.g., handle "February 30th").
     * 2. Apply min/max date constraints.
     * 3. Update the central `modDate` with the final, valid, and constrained date.
     * 4. Optionally, update the parent component's state (`oriDate`) immediately.
     *
     * It runs after every render to ensure the component's state is always valid.
     */
    useEffect(() => {
        const year = $$(selectedYear)
        const month = $$(selectedMonth)
        let day = $$(selectedDay) // Read current day selection
        const hour = $$(selectedHour)
        const minute = $$(selectedMinute)
        const second = $$(selectedSecond)

        // Guard: Don't run if essential parts aren't set
        if (year === undefined || month === undefined || day === undefined || hour === undefined || minute === undefined || second === undefined) return

        // --- >>> DAY CLAMPING LOGIC <<< ---
        const daysInCurrentMonth = getDaysInMonth(year, month)
        if (day > daysInCurrentMonth) {
            // console.log(`Clamping day from ${day} to ${daysInCurrentMonth} for ${year}-${month + 1}`)

            selectedDay(daysInCurrentMonth) // Update the day observable
            return // <<< EXIT EARLY: Effect will re-run with the correct day
        }
        // --- >>> END DAY CLAMPING <<< ---

        // --- Construct Date & Apply Min/Max Constraints ---
        let newDate = new Date(year, month, day, hour, minute, second) // Use potentially clamped 'day'
        let constrainedDate = newDate
        const min = $$(minDate)
        const max = $$(maxDate)
        let needsReclamp = false // Flag for min/max constraint changes

        if (min && newDate < min) {
            constrainedDate = min
            needsReclamp = true
        }

        if (max && newDate > max) {
            constrainedDate = max
            needsReclamp = true
        }

        // --- Update Internal State if Constraints Applied ---
        if (needsReclamp) {
            // Update internal state based on constraint clamping. Use untrack to avoid self-dependency.
            if (untrack(selectedYear) !== constrainedDate.getFullYear()) selectedYear(constrainedDate.getFullYear())
            if (untrack(selectedMonth) !== constrainedDate.getMonth()) selectedMonth(constrainedDate.getMonth())
            if (untrack(selectedDay) !== constrainedDate.getDate()) selectedDay(constrainedDate.getDate())
            if (untrack(selectedHour) !== constrainedDate.getHours()) selectedHour(constrainedDate.getHours())
            if (untrack(selectedMinute) !== constrainedDate.getMinutes()) selectedMinute(constrainedDate.getMinutes())
            if (untrack(selectedSecond) !== constrainedDate.getSeconds()) selectedSecond(constrainedDate.getSeconds())
            return // <<< EXIT EARLY: Effect will re-run with constraint-clamped values
        }

        // --- Update Main Controlled Value if Changed ---
        const currentPropValue = parseDate($$(modDate))
        // Check if controlledValue is an observable function before calling it
        if (typeof modDate === 'function' && (!currentPropValue || constrainedDate.getTime() !== currentPropValue.getTime())) {
            // console.log("DateTimeWheeler updating main value:", constrainedDate.toISOString())

            modDate(constrainedDate) // Update the external observable

            if (!$$(ok)) { if (isObservable(oriDate)) { oriDate($$(modDate)) } }

            if (!$$(ok)) { return }

            if (isObservable(oriDate)) { oriDate($$(modDate)) }

            if (isObservable(ok)) { ok(false) }
        }
    })
    // #endregion


    // #region General Options Memoization
    const yearOptions = useMemo(() => {
        const yearObject = $$(yearRange) // This might have undefined start/end
        const min = $$(minDate)
        const max = $$(maxDate)

        // 1. Establish the base range from the yearRange prop, providing safe fallbacks.
        const baseStart = yearObject?.start ?? 1900
        const baseEnd = yearObject?.end ?? new Date().getFullYear() + 20

        // 2. Determine the effective start and end years by applying min/max constraints.
        // The final starting year is the LATEST of the base start or the minDate year.
        const effectiveStart = min ? Math.max(baseStart, min.getFullYear()) : baseStart
        // The final ending year is the EARLIEST of the base end or the maxDate year.
        const effectiveEnd = max ? Math.min(baseEnd, max.getFullYear()) : baseEnd

        // 3. Generate the years array.
        const years = []
        // This loop is now safe because effectiveStart and effectiveEnd are guaranteed to be numbers.
        if (effectiveStart <= effectiveEnd) { // Final safety check
            for (let y = effectiveStart; y <= effectiveEnd; y++) {
                years.push({ value: y, label: y.toString() })
            }
        }

        return years
    })

    const monthOptions = useMemo(() => {
        const year = $$(selectedYear)
        const min = $$(minDate)
        const max = $$(maxDate)
        const options = []
        if (year === undefined) return []
        for (let m = 0; m < 12; m++) {
            let disabled = false
            if (min && year === min.getFullYear() && m < min.getMonth()) disabled = true
            if (max && year === max.getFullYear() && m > max.getMonth()) disabled = true
            if (!disabled) options.push({ value: m, label: MONTH_NAMES[m] })
        }
        return options
    })

    const dayOptions = useMemo(() => {
        const year = $$(selectedYear)
        const month = $$(selectedMonth)
        const min = $$(minDate)
        const max = $$(maxDate)
        const options = []
        if (year === undefined || month === undefined) return []
        const daysInMonth = getDaysInMonth(year, month) // Recalculates when year/month change
        for (let d = 1; d <= daysInMonth; d++) {
            let disabled = false
            if (min && year === min.getFullYear() && month === min.getMonth() && d < min.getDate()) disabled = true
            if (max && year === max.getFullYear() && month === max.getMonth() && d > max.getDate()) disabled = true
            if (!disabled) options.push({ value: d, label: d } as WheelerItem)
        }
        return options
    })

    const hourOptions = useMemo(() => {
        const options = Array.from({ length: 24 }, (_, h) => ({ value: h, label: padZero(h) }))
        return options
    })

    const minuteOptions = useMemo(() => {
        const options = Array.from({ length: 60 }, (_, m) => ({ value: m, label: padZero(m) }))
        return options
    })

    const secondOptions = useMemo(() => {
        const options = Array.from({ length: 60 }, (_, s) => ({ value: s, label: padZero(s) }))
        return options
    })
    // #endregion


    // --- Conditional Rendering Logic (unchanged) ---
    const showYear = () => ['year', 'date', 'datetime'].includes($$(type).toString())
    const showMonth = () => ['month', 'date', 'datetime'].includes($$(type).toString())
    const showDay = () => ['date', 'datetime'].includes($$(type).toString())
    const showHour = () => ['hour', 'time', 'datetime'].includes($$(type).toString())
    const showMinute = () => ['minute', 'time', 'datetime'].includes($$(type).toString())
    const showSecond = () => ['second', 'time', 'datetime'].includes($$(type).toString())

    const br = useMemo(() => $$(divider) ? 'border-l border-gray-300 dark:border-gray-600' : null)

    const { height: vh, width: vw, offsetLeft: ol, offsetTop: ot, pageTop: pt, pageLeft: pl } = useViewportSize()

    const ref = $<HTMLDivElement>()

    // Helper: Handle OK button click
    const handleOkClick = () => {
        if (isObservable(oriDate)) { oriDate($$(modDate)) }
        hide()
    }

    // // Helper: Calculate dynamic top position
    // const calculateTopPosition = () => {
    //     const elementRef = $$(bottomProp) ? cont : ref;
    //     const refHeight = $$(elementRef)?.clientHeight ?? 0
    //     return $$(vh) - refHeight + $$(pt)
    // }

    // Helper: Render header bar with Cancel/Title/OK
    const renderHeaderBar = () => (
        <div class="flex items-center justify-between px-4 py-2 h-auto relative">
            <div class="w-[80px] flex justify-start">
                <Button buttonType='contained' cls={['px-2']} onClick={hide} > Cancel </Button>
            </div>
            <div class="flex-1 text-center px-2">
                <span class="inline-block break-words">
                    {() => title($$(modDate))}
                </span>
            </div>
            <div class="w-[80px] flex justify-end">
                <Button buttonType='contained' cls={['px-2']} onClick={handleOkClick}> OK </Button>
            </div>
        </div>
    )

    // Configuration: Wheeler items with their properties
    const wheelerConfigs = useMemo(() => [
        {
            show: showYear,
            label: 'Year',
            options: yearOptions,
            value: selectedYear,
            hasBorder: false
        },
        {
            show: showMonth,
            label: 'Month',
            options: monthOptions,
            value: selectedMonth,
            hasBorder: true
        },
        {
            show: showDay,
            label: 'Day',
            options: dayOptions,
            value: selectedDay,
            hasBorder: true
        },
        {
            show: showHour,
            label: 'Hour',
            options: hourOptions,
            value: selectedHour,
            hasBorder: true
        },
        {
            show: showMinute,
            label: 'Minute',
            options: minuteOptions,
            value: selectedMinute,
            hasBorder: true
        },
        {
            show: showSecond,
            label: 'Second',
            options: secondOptions,
            value: selectedSecond,
            hasBorder: true
        }
    ])

    // Helper: Render individual wheeler columns
    const renderWheelers = () => (
        $$(wheelerConfigs).map(({ show, label, options, value, hasBorder }) =>
            () => $$(show) && (
                <Wheeler
                    header={v => label}
                    options={options}
                    value={value}
                    itemHeight={itemHeight}
                    itemCount={itemCount}
                    cls={[WHEELER_WRAPPER_CLS, hasBorder ? br : null]}
                    bottom={false}
                />
            )
        )
    )

    const component = useMemo(() => (
        <div
            ref={ref}
            class={[
                DATETIME_WHEELER_CLS,
                'flex-col w-full bg-white shadow-lg z-10 h-fit'
            ]}
        >
            {renderHeaderBar()}

            <div class={[DATETIME_WHEELER_CLS]}>
                {renderWheelers()}
            </div>
        </div>
    ))

    const cont = $<HTMLDivElement>()


    useClickAway(cont, () => {
        if ($$(cancelOnBlur))
            hide() //just hide, no save

        if ($$(commitOnBlur)) //hide & save
        {
            hide() //just hide, no save
            // if (!ok)
            if (isObservable(oriDate))
                oriDate($$(modDate))
        }
    })


    const renderAsPopup = () => {
        return (
            <Portal mount={document.body}>
                {
                    $$(mask) && (
                        <div
                            class={['fixed inset-0 bg-black/50 h-full w-full z-[10] opacity-50']}
                            onClick={() => $$(cancelOnBlur) && hide()}
                        />
                    )}

                <div
                    ref={cont}
                    class={[DATETIME_WHEELER_CLS, 'fixed inset-x-0 bottom-0 bg-white shadow-lg z-200']}
                >
                    {component}
                </div>
            </Portal>
        )
    }

    const renderAsInline = () => {
        return (
            <div class={[$$(cls)].join(" ")} {...otherProps}>
                {component}
            </div>
        )
    }

    return () => !$$(isVisible) ? null : $$(bottomProp) ? renderAsPopup() : renderAsInline()

    // return () => !$$(isVisible) ? null :

    //     $$(mask) ? <Portal mount={document.body}>
    //         <div
    //             class={['fixed inset-0 bg-black/50 h-full w-full z-[10] opacity-50']}
    //         />
    //         <div ref={cont} class={[DATETIME_WHEELER_CLS, 'fixed inset-x-0 bottom-0 bg-blue-600 shadow-lg z-200']}>
    //             {component}
    //         </div>
    //     </Portal>
    //         : <div class={[DATETIME_WHEELER_CLS]}>
    //             {component}
    //         </div>
})

export { DateTimeWheeler }

// NOTE: Register the custom element
customElement('wui-datetime-wheeler', DateTimeWheeler)

// NOTE: Add the custom element to the JSX namespace
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-datetime-wheeler': ElementAttributes<typeof DateTimeWheeler>
        }
    }
}

export default DateTimeWheeler
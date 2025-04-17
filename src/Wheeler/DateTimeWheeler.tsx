import { $, $$, Observable, ObservableMaybe, useEffect, useMemo, untrack, Portal, type JSX, isObservable } from 'woby'
import { use } from 'use-woby'
import { Wheeler } from './Wheeler' // Adjust path
import { Button, variant } from '../Button'

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
type DateTimeWheelerValue = ObservableMaybe<Date>

type DateTimeWheelerProps = {
    value: DateTimeWheelerValue
    mode?: ObservableMaybe<DateTimeWheelerType>
    minDate?: ObservableMaybe<Date | string>
    maxDate?: ObservableMaybe<Date | string>
    itemHeight?: ObservableMaybe<number>
    itemCount?: ObservableMaybe<number>
    yearRange?: ObservableMaybe<{ start: number, end: number }>
    divider?: ObservableMaybe<boolean>
    bottom?: ObservableMaybe<boolean>
    title?: (d: Date) => JSX.Element
    visible?: Observable<boolean>
    ok?: ObservableMaybe<boolean>
}

export const DateTimeWheeler = ({
    value: oriDate,
    mode: mode = 'datetime',
    minDate: minDateProp,
    maxDate: maxDateProp,
    itemHeight = 36,
    itemCount = 5,
    yearRange: yearRangeProp,
    divider, bottom, title,
    visible = $(true),
    ok
}: DateTimeWheelerProps): JSX.Element => {

    const type = use(mode)
    const yearRange = use(yearRangeProp, { start: 1970, end: new Date().getFullYear() + 20 })
    const minDate = useMemo(() => parseDate($$(use(minDateProp))))
    const maxDate = useMemo(() => parseDate($$(use(maxDateProp))))

    // --- Internal Selection State ---
    const modDate = $($$(oriDate) ?? new Date()) //use(oriDate, new Date())
    const selectedYear = $($$(modDate).getFullYear())
    const selectedMonth = $($$(modDate).getMonth())
    const selectedDay = $($$(modDate).getDate())
    const selectedHour = $($$(modDate).getHours())
    const selectedMinute = $($$(modDate).getMinutes())
    const selectedSecond = $($$(modDate).getSeconds())

    // --- Effect to Sync Incoming Controlled Value -> Internal State ---
    useEffect(() => {
        const val = $$(modDate)
        const parsed = parseDate(val)
        if (parsed) {
            // Update internal state only if different from parsed external value
            // Use untrack to prevent loop if internal update triggered this
            if (untrack(selectedYear) !== parsed.getFullYear()) selectedYear(parsed.getFullYear())
            if (untrack(selectedMonth) !== parsed.getMonth()) selectedMonth(parsed.getMonth())
            // Make sure day is valid for the NEW month/year before setting
            const daysInParsedMonth = getDaysInMonth(parsed.getFullYear(), parsed.getMonth())
            const dayToSet = Math.min(parsed.getDate(), daysInParsedMonth)
            if (untrack(selectedDay) !== dayToSet) selectedDay(dayToSet)

            if (untrack(selectedHour) !== parsed.getHours()) selectedHour(parsed.getHours())
            if (untrack(selectedMinute) !== parsed.getMinutes()) selectedMinute(parsed.getMinutes())
            if (untrack(selectedSecond) !== parsed.getSeconds()) selectedSecond(parsed.getSeconds())
        }
    })

    // --- Effect to Sync Internal State Changes -> Update MAIN controlledValue & Clamp Day ---
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

            if (!ok)
                if (isObservable(oriDate))
                    oriDate($$(modDate))

            if (!$$(ok)) return

            if (isObservable(oriDate))
                oriDate($$(modDate))

            if (isObservable(ok))
                ok(false)
        }
    })


    // --- Generate Options for Wheels (Memoized, unchanged logic) ---
    const yearOptions = useMemo(() => { /* ... unchanged ... */
        const { start, end } = $$(yearRange)
        const min = $$(minDate)
        const max = $$(maxDate)
        const minY = min ? min.getFullYear() : start
        const maxY = max ? max.getFullYear() : end
        const years = []
        for (let y = Math.max(start, minY);
            y <= Math.min(end, maxY); y++) years.push({ value: y, label: y }); return years
    })
    const monthOptions = useMemo(() => { /* ... unchanged ... */
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
        } return options
    })
    const dayOptions = useMemo(() => { /* ... unchanged ... */
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
            if (!disabled) options.push({ value: d, label: d })
        } return options
    })
    const hourOptions = useMemo(() => Array.from({ length: 24 }, (_, h) => ({ value: h, label: padZero(h) })))
    const minuteOptions = useMemo(() => Array.from({ length: 60 }, (_, m) => ({ value: m, label: padZero(m) })))
    const secondOptions = useMemo(() => Array.from({ length: 60 }, (_, s) => ({ value: s, label: padZero(s) })))


    // --- Conditional Rendering Logic (unchanged) ---
    const showYear = () => ['year', 'date', 'datetime'].includes($$(type))
    const showMonth = () => ['month', 'date', 'datetime'].includes($$(type))
    const showDay = () => ['date', 'datetime'].includes($$(type))
    const showHour = () => ['hour', 'time', 'datetime'].includes($$(type))
    const showMinute = () => ['minute', 'time', 'datetime'].includes($$(type))
    const showSecond = () => ['second', 'time', 'datetime'].includes($$(type))

    // --- Render (unchanged) ---
    const dateTimeWheelerCls = 'date-time-Wheeler flex w-full bg-white p-1 border border-gray-300 rounded-md shadow-sm '
    const wheelWrapperCls = 'wheel-wrapper flex-1'

    const br = useMemo(() => $$(divider) ? 'border-l border-gray-300 dark:border-gray-600' : null)

    const comp = useMemo(() => <>
        <div class={[dateTimeWheelerCls, 'flex-col fixed inset-x-0 bottom-0 bg-blue-600 shadow-lg z-10']}>
            <div class="flex items-center justify-between px-4 py-2 h-auto relative">
                <div class="w-[80px] flex justify-start">
                    <Button class={[variant.contained, 'px-2']} onClick={() => visible(false)}>Cancel</Button>
                </div>
                <div class="flex-1 text-center px-2">
                    <span class="inline-block break-words">
                        {() => title($$(modDate))}
                    </span>
                </div>
                <div class="w-[80px] flex justify-end">
                    <Button class={[variant.contained, 'px-2']} onClick={() => { if (isObservable(oriDate)) oriDate($$(modDate)); visible(false) }}>OK</Button></div>
            </div>
            <div class={[dateTimeWheelerCls, '']}>
                {() => $$(showYear) && <Wheeler header='Year' options={yearOptions} value={selectedYear} itemHeight={itemHeight} visibleItemCount={itemCount} class={[wheelWrapperCls,]} />}
                {() => $$(showMonth) && <Wheeler header='Month' options={monthOptions} value={selectedMonth} itemHeight={itemHeight} visibleItemCount={itemCount} class={[wheelWrapperCls, br]} />}
                {() => $$(showDay) && <Wheeler header='Day' options={dayOptions} value={selectedDay} itemHeight={itemHeight} visibleItemCount={itemCount} class={[wheelWrapperCls, br]} />}
                {() => $$(showHour) && <Wheeler header='Hour' options={hourOptions} value={selectedHour} itemHeight={itemHeight} visibleItemCount={itemCount} class={[wheelWrapperCls, br]} />}
                {() => $$(showMinute) && <Wheeler header='Minute' options={minuteOptions} value={selectedMinute} itemHeight={itemHeight} visibleItemCount={itemCount} class={[wheelWrapperCls, br]} />}
                {() => $$(showSecond) && <Wheeler header='Second' options={secondOptions} value={selectedSecond} itemHeight={itemHeight} visibleItemCount={itemCount} class={[wheelWrapperCls, br]} />}
            </div>
        </div >
    </>)
    return () => !$$(visible) ? null :
        $$(bottom) ? <Portal mount={document.body}>
            <div class={[dateTimeWheelerCls, 'fixed inset-x-0 bottom-0 bg-blue-600 shadow-lg z-10']}>
                {comp}
            </div>
        </Portal>
            : <div class={[dateTimeWheelerCls]}>
                {comp}
            </div>

}
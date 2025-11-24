/* @jsxImportSource woby */
import { $, $$, Observable } from 'woby'
import { Button } from '../../src/Button'
import { DateTimeWheeler } from '../../src/Wheeler/DateTimeWheeler'

// Helper functions to format date based on Wheeler type
const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

const formatDateOnly = (date: Date) => {
    return date.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

const formatTimeOnly = (date: Date) => {
    return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

// #region Reusable Data

// --- Reusable Data ---
const CURRENT_DATE = new Date();
const MIN_DATE = new Date(2020, 0, 1); // January 1, 2020
const MAX_DATE = new Date(2030, 11, 31); // December 31, 2030

// #endregion


// #region Basic DateTimeWheeler Examples

/**
 * Demonstrates basic DateTimeWheeler with default datetime mode
 */
const BasicDateTimeWheeler = () => {
    const selectedDate = $(new Date(2024, 5, 15, 14, 30, 45)) // June 15, 2024, 2:30:45 PM
    const visible = $(false)

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Basic DateTimeWheeler - DateTime Mode</h3>
            <p class="text-sm text-gray-600 mb-2">
                Default DateTimeWheeler showing year, month, day, hour, minute, and second wheels.
            </p>
            <Button
                cls="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => visible(true)}
            >
                Open DateTime Picker
            </Button>
            <div class="my-4 w-full">
                <DateTimeWheeler
                    value={selectedDate}
                    visible={visible}
                    bottom={false}
                    title={(d) => "Select Date & Time"}
                    cls="w-full border border-gray-300 rounded-md overflow-auto"
                />
            </div>

            <div class="mt-4 p-3 bg-gray-50 rounded">
                <p>Selected Date: <span class="font-mono bg-white p-1 rounded border">{() => formatDateTime($$(selectedDate))}</span></p>
            </div>
        </div>
    )
}

/**
 * Demonstrates DateTimeWheeler with date mode (year, month, day only)
 */
const DateOnlyWheeler = () => {
    const selectedDate = $(new Date(2024, 11, 25)) // December 25, 2024

    const visible = $(false)

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">DateTimeWheeler - Date Mode</h3>
            <p class="text-sm text-gray-600 mb-2">
                DateTimeWheeler showing only year, month, and day wheels.
            </p>

            <Button
                cls="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => visible(true)}
            >
                Open Date Picker
            </Button>

            <DateTimeWheeler
                value={selectedDate}
                mode={"date"}
                visible={visible}
                bottom={true}
                mask={true}
                divider={true}
                title={(d) => "Select Date"}
            />

            <div class="mt-4 p-3 bg-gray-50 rounded">
                <p>Selected Date: <span class="font-mono bg-white p-1 rounded border">{() => formatDateOnly($$(selectedDate))}</span></p>
            </div>
        </div>
    )
}

/**
 * Demonstrates DateTimeWheeler with time mode (hour, minute, second only)
 */
const TimeOnlyWheeler = () => {
    const selectedTime = $(new Date(2024, 0, 1, 9, 30, 15)) // 9:30:15 AM

    const visible = $(false)

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">DateTimeWheeler - Time Mode</h3>
            <p class="text-sm text-gray-600 mb-2">
                DateTimeWheeler showing only hour, minute, and second wheels.
            </p>

            <Button
                cls="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => visible(true)}
            >
                Open Time Picker
            </Button>

            <DateTimeWheeler
                value={selectedTime}
                mode={"time"}
                visible={visible}
                bottom={true}
                mask={true}
                divider={true}
                title={(d) => "Select Time"}
            />

            <div class="mt-4 p-3 bg-gray-50 rounded">
                <p>Selected Time: <span class="font-mono bg-white p-1 rounded border">{() => formatTimeOnly($$(selectedTime))}</span></p>
            </div>
        </div>
    )
}

// #endregion


// #region DateTimeWheeler with Constraints

/**
 * Demonstrates DateTimeWheeler with minDate and maxDate constraints
 */
const ConstrainedDateTimeWheeler = () => {
    const selectedDate = $(new Date(2024, 5, 15)) // June 15, 2024
    const minDate = $(MIN_DATE)
    const maxDate = $(MAX_DATE)

    const visible = $(false)

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Constrained DateTimeWheeler</h3>
            <p class="text-sm text-gray-600 mb-2">
                DateTimeWheeler with minDate and maxDate constraints.
            </p>

            <Button
                cls="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => visible(true)}
            >
                Open Constrained Picker
            </Button>

            <div class="my-4 w-full">
                <DateTimeWheeler
                    value={selectedDate}
                    mode={"date"}
                    minDate={minDate}
                    maxDate={maxDate}
                    visible={visible}
                    bottom={false}
                    mask={true}
                    divider={true}
                    title={(d) => "Select Date (2020-2030)"}
                    cls="w-full border border-gray-300 rounded-md overflow-auto"
                />
            </div>

            <div class="mt-4 p-3 bg-gray-50 rounded">
                <p>Selected Date: <span class="font-mono bg-white p-1 rounded border">{() => formatDateOnly($$(selectedDate))}</span></p>
                <p class="mt-2">Min Date: <span class="font-mono bg-white p-1 rounded border">{() => formatDateOnly($$(minDate))}</span></p>
                <p class="mt-2">Max Date: <span class="font-mono bg-white p-1 rounded border">{() => formatDateOnly($$(maxDate))}</span></p>
            </div>
        </div>
    )
}

// #endregion


// #region DateTimeWheeler with Custom Year Range

/**
 * Demonstrates DateTimeWheeler with custom year range
 */
const CustomYearRangeWheeler = () => {
    const selectedDate = $(new Date(2025, 5, 15)) // June 15, 2025
    // const yearRange = $({ start: 2020, end: 2025 })

    const visible = $(false)

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">DateTimeWheeler - Custom Year Range</h3>
            <p class="text-sm text-gray-600 mb-2">
                DateTimeWheeler with custom year range (2020-2025).
            </p>

            <Button
                cls="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => visible(true)}
            >
                Open Custom Range Picker
            </Button>

            <div class="my-4 w-full">
                <DateTimeWheeler
                    value={selectedDate}
                    mode={"date"}
                    minDate={new Date(2020, 0, 1)}
                    maxDate={new Date(2025, 11, 31)}
                    visible={visible}
                    bottom={false}
                    mask={false}
                    divider={true}
                    title={(d) => "Select Date (2020-2025)"}
                    cls="w-full border border-gray-300 rounded-md overflow-auto"
                />
            </div>

            <div class="mt-4 p-3 bg-gray-50 rounded">
                <p>Selected Date: <span class="font-mono bg-white p-1 rounded border">{() => formatDateOnly($$(selectedDate))}</span></p>
                <p class="mt-2">Year Range: <span class="font-mono bg-white p-1 rounded border">2020 - 2025</span></p>
            </div>
        </div>
    )
}

// #endregion


// #region DateTimeWheeler with Custom Item Count

/**
 * Demonstrates DateTimeWheeler with custom item count
 */
const CustomItemCountWheeler = () => {
    const selectedDate = $(new Date(2024, 5, 15, 14, 30)) // June 15, 2024, 2:30 PM

    const visible = $(false)

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">DateTimeWheeler - Custom Item Count</h3>
            <p class="text-sm text-gray-600 mb-2">
                DateTimeWheeler showing 7 visible items per wheel instead of default 5. Click button to toggle visibility.
            </p>

            <Button
                cls="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => visible(!$$(visible))}
            >
                Open/Close Large Picker
            </Button>

            <div class="my-4 w-full">
                <DateTimeWheeler
                    value={selectedDate}
                    mode={"datetime"}
                    visible={visible}
                    bottom={true}
                    mask={true}
                    divider={true}
                    title={() => "Select Date & Time"}
                    itemCount={7}
                />
            </div>

            <div class="mt-4 p-3 bg-gray-50 rounded">
                <p>Selected Date: <span class="font-mono bg-white p-1 rounded border">{() => formatDateTime($$(selectedDate))}</span></p>
            </div>
        </div>
    )
}

// #endregion

export {
    BasicDateTimeWheeler,
    DateOnlyWheeler,
    TimeOnlyWheeler,
    ConstrainedDateTimeWheeler,
    CustomYearRangeWheeler,
    CustomItemCountWheeler
}
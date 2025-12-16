/* @jsxImportSource woby */
import { $, $$, Observable } from 'woby'
import { Button } from '../../src/Button'
import { MultiWheeler } from '../../src/Wheeler/MultiWheeler'


// #region Reusable Data

// --- Reusable Data ---
const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew']
const VEGETABLES = ['Carrot', 'Broccoli', 'Spinach', 'Tomato', 'Cucumber', 'Lettuce']
const COLORS = ['Red', 'Green', 'Blue', 'Yellow', 'Purple', 'Orange']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const YEARS = Array.from({ length: 10 }, (_, i) => (2020 + i).toString())
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString())

// --- JSON Data ---
const DEPARTMENTS = [
    { "label": "Engineering", "value": "ENG" },
    { "label": "Marketing", "value": "MKT" },
    { "label": "Sales", "value": "SALES" },
    { "label": "Human Resources", "value": "HR" },
    { "label": "Finance", "value": "FIN" },
]

const POSITIONS = [
    { "label": "Manager", "value": "MGR" },
    { "label": "Senior", "value": "SR" },
    { "label": "Junior", "value": "JR" },
    { "label": "Intern", "value": "INTERN" },
]

const CITIES = [
    { "label": "New York", "value": "NY" },
    { "label": "Los Angeles", "value": "LA" },
    { "label": "Chicago", "value": "CHI" },
    { "label": "Houston", "value": "HOU" },
    { "label": "Phoenix", "value": "PHX" },
]

// #endregion


// #region Basic MultiWheeler Examples

/**
 * Demonstrates basic MultiWheeler with simple string arrays (2 wheels)
 */
const BasicMultiWheelerTwoColumns = () => {
    const selectedFruit = $('Apple')
    const selectedColor = $('Red')

    const visible = $(true)

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Basic MultiWheeler - Two Columns (Fruit + Color)</h3>
            <p class="text-sm text-gray-600 mb-2">
                Two independent wheels with simple string arrays.
            </p>
            <Button
                cls="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => visible(true)}
            >
                Open Picker
            </Button>
            <div class="my-4 w-full">
                <MultiWheeler
                    options={[FRUITS, COLORS]}
                    value={[selectedFruit, selectedColor]}
                    headers={[
                        () => <span class="text-sm font-semibold">Fruit</span>,
                        () => <span class="text-sm font-semibold">Color</span>,
                    ]}
                    visible={visible}
                    bottom={false}
                    mask={true}
                    title={<span class="font-bold">Select Fruit & Color</span>}
                    cls="w-full border border-gray-300 rounded-md overflow-auto"
                />
            </div>


            <div class="mt-4 p-3 bg-gray-50 rounded">
                <p>Selected Fruit: <span class="font-mono bg-white p-1 rounded border">{selectedFruit}</span></p>
                <p class="mt-2">Selected Color: <span class="font-mono bg-white p-1 rounded border">{selectedColor}</span></p>
            </div>
        </div>
    )
}

/**
 * Demonstrates MultiWheeler with three columns
 */
const BasicMultiWheelerThreeColumns = () => {
    const selectedFruit = $('Banana')
    const selectedVegetable = $('Carrot')
    const selectedSize = $('M')

    const visible = $(false)

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Basic MultiWheeler - Three Columns</h3>
            <p class="text-sm text-gray-600 mb-2">
                Three independent wheels for fruit, vegetable, and size selection.
            </p>

            <Button
                cls="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => visible(true)}
            >
                Open Picker
            </Button>

            <MultiWheeler
                options={[FRUITS, VEGETABLES, SIZES]}
                value={[selectedFruit, selectedVegetable, selectedSize]}
                headers={[
                    () => <span class="text-sm font-semibold">Fruit</span>,
                    () => <span class="text-sm font-semibold">Vegetable</span>,
                    () => <span class="text-sm font-semibold">Size</span>,
                ]}
                visible={visible}
                bottom={true}
                mask={true}
                divider={true}
                title={<span class="font-bold">Select Your Preferences</span>}
            />

            <div class="mt-4 p-3 bg-gray-50 rounded">
                <p>Selected Fruit: <span class="font-mono bg-white p-1 rounded border">{() => selectedFruit()}</span></p>
                <p class="mt-2">Selected Vegetable: <span class="font-mono bg-white p-1 rounded border">{() => selectedVegetable()}</span></p>
                <p class="mt-2">Selected Size: <span class="font-mono bg-white p-1 rounded border">{() => selectedSize()}</span></p>
            </div>
        </div>
    )
}

// #endregion


// #region MultiWheeler with JSON Object Arrays
const MultiWheelerWithJsonObjects = () => {
    const selectedDepartment = $('ENG')
    const selectedPosition = $('SR')
    const selectedCity = $('NY')

    const visible = $(true)

    // Helper to format display
    const formatValue = (value: string, options: any[]) => {
        const option = options.find(opt => opt.value === value)
        return option ? `${option.label} (${option.value})` : value
    }

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">MultiWheeler with JSON Object Arrays</h3>
            <p class="text-sm text-gray-600 mb-2">
                Three wheels using object arrays with label/value pairs.
            </p>

            <Button
                cls="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => visible(true)}
            >
                Open Employee Picker
            </Button>

            <div class="my-4 w-full">
                <MultiWheeler
                    options={[DEPARTMENTS, POSITIONS, CITIES]}
                    value={[selectedDepartment, selectedPosition, selectedCity]}
                    headers={[
                        () => <span class="text-sm font-semibold">Department</span>,
                        () => <span class="text-sm font-semibold">Position</span>,
                        () => <span class="text-sm font-semibold">City</span>,
                    ]}
                    visible={visible}
                    bottom={false}
                    mask={true}
                    divider={true}
                    title={<span class="font-bold">Employee Details</span>}
                    itemCount={5}
                    cls="w-full border border-gray-300 rounded-md overflow-auto"
                />
            </div>
            <div class="mt-4 p-3 bg-gray-50 rounded">
                <p>Department: <span class="font-mono bg-white p-1 rounded border">{() => formatValue(selectedDepartment(), DEPARTMENTS)}</span></p>
                <p class="mt-2">Position: <span class="font-mono bg-white p-1 rounded border">{() => formatValue(selectedPosition(), POSITIONS)}</span></p>
                <p class="mt-2">City: <span class="font-mono bg-white p-1 rounded border">{() => formatValue(selectedCity(), CITIES)}</span></p>
            </div>
        </div>
    )
}

// #endregion


// #region Date Picker Example
const DatePickerMultiWheeler = () => {
    const selectedYear = $('2024')
    const selectedMonth = $('Jan')
    const selectedDay = $('15')

    const visible = $(true)

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Date Picker MultiWheeler</h3>
            <p class="text-sm text-gray-600 mb-2">
                A date picker implementation using three wheels.
            </p>

            <Button
                cls="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => visible(true)}
            >
                Select Date
            </Button>

            <div class="my-4 w-full">
                <MultiWheeler
                    options={[YEARS, MONTHS, DAYS]}
                    value={[selectedYear, selectedMonth, selectedDay]}
                    headers={[
                        () => <span class="text-sm font-semibold">Year</span>,
                        () => <span class="text-sm font-semibold">Month</span>,
                        () => <span class="text-sm font-semibold">Day</span>,
                    ]}
                    visible={visible}
                    bottom={false}
                    mask={true}
                    divider={true}
                    title={<span class="font-bold">Select Date</span>}
                    itemCount={5}
                    cls="w-full border border-gray-300 rounded-md overflow-auto"
                />
            </div>
            <div class="mt-4 p-3 bg-gray-50 rounded">
                <p class="text-lg font-semibold">
                    Selected Date: <span class="font-mono bg-white p-2 rounded border">
                        {() => `${selectedMonth} ${selectedDay}, ${selectedYear}`}
                    </span>
                </p>
            </div>
        </div>
    )
}

// #endregion


// #region MultiWheeler with Custom Item Count
const MultiWheelerCustomItemCount = () => {
    const selectedFruit = $('Date')
    const selectedColor = $('Orange')

    const visible = $(false)

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">MultiWheeler with Custom Item Count</h3>
            <p class="text-sm text-gray-600 mb-2">
                Showing 7 visible items per wheel instead of default 5.
            </p>

            <Button
                cls="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => visible(true)}
            >
                Open Picker
            </Button>

            <div class="my-4 w-full">
                <MultiWheeler
                    options={[FRUITS, COLORS]}
                    value={[selectedFruit, selectedColor]}
                    headers={[
                        () => <span class="text-sm font-semibold">Fruit</span>,
                        () => <span class="text-sm font-semibold">Color</span>,
                    ]}
                    visible={visible}
                    bottom={true}
                    mask={true}
                    divider={true}
                    title={<span class="font-bold">Large Picker</span>}
                    itemCount={7}
                />
            </div>

            <div class="mt-4 p-3 bg-gray-50 rounded">
                <p>Selected Fruit: <span class="font-mono bg-white p-1 rounded border">{() => selectedFruit()}</span></p>
                <p class="mt-2">Selected Color: <span class="font-mono bg-white p-1 rounded border">{() => selectedColor()}</span></p>
            </div>
        </div>
    )
}

// #endregion

export {
    BasicMultiWheelerTwoColumns,
    // BasicMultiWheelerThreeColumns,
    // MultiWheelerWithJsonObjects,
    // DatePickerMultiWheeler,
    // MultiWheelerCustomItemCount
}
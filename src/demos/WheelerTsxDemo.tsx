/* @jsxImportSource woby */
import { render, $, $$ } from 'woby'
import Wheeler from '../Wheeler/Wheeler'
import { Button } from '../Button'

const App = () => {
    // Sample data
    const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew', 'Kiwi', 'Lemon']
    const CARS = [
        { label: 'Toyota', value: 'TOYOTA' },
        { label: 'Honda', value: 'HONDA' },
        { label: 'Ford', value: 'FORD' },
        { label: 'Tesla', value: 'TESLA' },
        { label: 'BMW', value: 'BMW' },
        { label: 'Mercedes', value: 'MERCEDES' },
        { label: 'Audi', value: 'AUDI' },
    ]

    // State for different examples
    const selectedFruit = $('Cherry')
    const visibleFruit = $(false)

    const selectedCar = $('TESLA')
    const visibleCar = $(false)

    const selectedMultipleFruits = $(['Apple', 'Cherry'])
    const visibleMultiple = $(false)

    const selectedFruitWithSearch = $('Date')
    const visibleSearch = $(false)

    const selectedFruitWithHeader = $('Elderberry')
    const visibleHeader = $(false)

    // OK button state
    const okFruit = $(false)
    const okCar = $(false)
    const okMultiple = $(false)
    const okSearch = $(false)
    const okHeader = $(false)

    return (
        <div class="min-h-screen bg-gray-50 p-8">
            <div class="max-w-4xl mx-auto">
                <h1 class="text-3xl font-bold mb-2 text-gray-800">Wheeler Bottom Popup Demo</h1>
                <p class="text-gray-600 mb-8">Click buttons to open Wheeler pickers from the bottom with mask overlay</p>

                <div class="space-y-6">
                    {/* Basic String Array with Bottom Popup */}
                    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h2 class="text-xl font-semibold mb-4 text-gray-700">1. Basic String Array (Bottom Popup)</h2>
                        <p class="text-sm text-gray-600 mb-4">
                            Click the button to open a bottom popup with fruit selection. Uses <code class="bg-gray-100 px-2 py-1 rounded">bottom={true}</code> and <code class="bg-gray-100 px-2 py-1 rounded">mask={true}</code>.
                        </p>

                        <Button
                            type="contained"
                            onClick={() => visibleFruit(true)}
                            cls="mb-4"
                        >
                            Select Fruit
                        </Button>

                        <div class="bg-blue-50 p-4 rounded-md">
                            <p class="text-sm font-semibold text-blue-900">Current Selection:</p>
                            <p class="text-lg font-mono text-blue-700 mt-1">{selectedFruit}</p>
                        </div>

                        <Wheeler
                            options={FRUITS}
                            value={selectedFruit}
                            visible={visibleFruit}
                            ok={okFruit}
                            bottom={true}
                            mask={true}
                        />
                    </div>

                    {/* JSON Object Array with Bottom Popup */}
                    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h2 class="text-xl font-semibold mb-4 text-gray-700">2. JSON Object Array (Bottom Popup)</h2>
                        <p class="text-sm text-gray-600 mb-4">
                            Bottom popup with label/value objects. Shows formatted display.
                        </p>

                        <Button
                            type="contained"
                            onClick={() => visibleCar(true)}
                            cls="mb-4 !bg-green-600 hover:!bg-green-700"
                        >
                            Select Car
                        </Button>

                        <div class="bg-green-50 p-4 rounded-md">
                            <p class="text-sm font-semibold text-green-900">Current Selection:</p>
                            <p class="text-lg font-mono text-green-700 mt-1">
                                {() => {
                                    const car = CARS.find(c => c.value === $$(selectedCar))
                                    return car ? `${car.label} (${car.value})` : $$(selectedCar)
                                }}
                            </p>
                        </div>

                        <Wheeler
                            options={CARS}
                            value={selectedCar}
                            visible={visibleCar}
                            ok={okCar}
                            bottom={true}
                            mask={true}
                            cls="w-full"
                        />
                    </div>

                    {/* Multiple Selection with Bottom Popup */}
                    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h2 class="text-xl font-semibold mb-4 text-gray-700">3. Multiple Selection (Bottom Popup)</h2>
                        <p class="text-sm text-gray-600 mb-4">
                            Bottom popup with checkboxes for multi-select. Includes "Select All" functionality.
                        </p>

                        <Button
                            type="contained"
                            onClick={() => visibleMultiple(true)}
                            cls="mb-4 !bg-purple-600 hover:!bg-purple-700"
                        >
                            Select Multiple Fruits
                        </Button>

                        <div class="bg-purple-50 p-4 rounded-md">
                            <p class="text-sm font-semibold text-purple-900 mb-2">Selected Fruits:</p>
                            <div class="flex flex-wrap gap-2">
                                {() => {
                                    const selected = $$(selectedMultipleFruits)
                                    if (Array.isArray(selected) && selected.length > 0) {
                                        return selected.map(fruit => (
                                            <span class="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                                {fruit}
                                            </span>
                                        ))
                                    }
                                    return <span class="text-purple-600 italic">No fruits selected</span>
                                }}
                            </div>
                        </div>

                        <Wheeler
                            options={FRUITS}
                            value={selectedMultipleFruits}
                            all="Select All Fruits"
                            visible={visibleMultiple}
                            ok={okMultiple}
                            bottom={true}
                            mask={true}
                            cls="w-full"
                        />
                    </div>

                    {/* With Search and Bottom Popup */}
                    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h2 class="text-xl font-semibold mb-4 text-gray-700">4. Searchable Wheeler (Bottom Popup)</h2>
                        <p class="text-sm text-gray-600 mb-4">
                            Bottom popup with search functionality for filtering options.
                        </p>

                        <Button
                            type="contained"
                            onClick={() => visibleSearch(true)}
                            cls="mb-4 !bg-orange-600 hover:!bg-orange-700"
                        >
                            Search Fruits
                        </Button>

                        <div class="bg-orange-50 p-4 rounded-md">
                            <p class="text-sm font-semibold text-orange-900">Current Selection:</p>
                            <p class="text-lg font-mono text-orange-700 mt-1">{selectedFruitWithSearch}</p>
                        </div>

                        <Wheeler
                            options={FRUITS}
                            value={selectedFruitWithSearch}
                            visible={visibleSearch}
                            ok={okSearch}
                            searchable={true}
                            searchPlaceholder="Type to search fruits..."
                            bottom={true}
                            mask={true}
                            cls="w-full"
                        />
                    </div>

                    {/* With Header and Bottom Popup */}
                    <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h2 class="text-xl font-semibold mb-4 text-gray-700">5. Wheeler with Header (Bottom Popup)</h2>
                        <p class="text-sm text-gray-600 mb-4">
                            Bottom popup with custom header displaying current selection.
                        </p>

                        <Button
                            type="contained"
                            onClick={() => visibleHeader(true)}
                            cls="mb-4 !bg-pink-600 hover:!bg-pink-700"
                        >
                            Select with Header
                        </Button>

                        <div class="bg-pink-50 p-4 rounded-md">
                            <p class="text-sm font-semibold text-pink-900">Current Selection:</p>
                            <p class="text-lg font-mono text-pink-700 mt-1">{selectedFruitWithHeader}</p>
                        </div>

                        <Wheeler
                            options={FRUITS}
                            value={selectedFruitWithHeader}
                            visible={visibleHeader}
                            ok={okHeader}
                            header={(v) => (
                                <div class="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4">
                                    <p class="text-xs font-semibold uppercase tracking-wide opacity-90">Your Selection</p>
                                    <p class="text-2xl font-bold mt-1">{() => $$(v) || 'None'}</p>
                                </div>
                            )}
                            bottom={true}
                            mask={true}
                            cls="w-full"
                        />
                    </div>
                </div>

                {/* Info Section */}
                <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-blue-900 mb-2">ℹ️ Bottom Popup Features</h3>
                    <ul class="list-disc list-inside space-y-1 text-sm text-blue-800">
                        <li><code class="bg-blue-100 px-2 py-1 rounded">bottom={true}</code> - Opens picker from bottom</li>
                        <li><code class="bg-blue-100 px-2 py-1 rounded">mask={true}</code> - Shows overlay backdrop</li>
                        <li><code class="bg-blue-100 px-2 py-1 rounded">visible</code> - Controls popup visibility</li>
                        <li><code class="bg-blue-100 px-2 py-1 rounded">ok</code> - Confirms selection and closes popup</li>
                        <li>Click outside or on mask to cancel (with <code class="bg-blue-100 px-2 py-1 rounded">cancelOnBlur</code>)</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

render(App, document.getElementById('root')!)

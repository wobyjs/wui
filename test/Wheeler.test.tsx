import { $, $$ } from 'woby'
import { Wheeler } from '../src/Wheeler/Wheeler'
import { useArrayOptions } from '../src/Wheeler/WheelerType'

// --- Reusable Data ---
const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew']
const FLAVORS = ['Chocolate', 'Vanilla', 'Strawberry', 'Mint', 'Caramel', 'Coffee']

const FRUITS_OPTION = useArrayOptions(FRUITS)
const FLAVORS_OPTION = useArrayOptions(FLAVORS)

// --- Data simulating a JSON import ---
const JSON_FRUIT_DATA = [
    { "label": "Apple (from JSON)", "value": "json_apple" },
    { "label": "Banana (from JSON)", "value": "json_banana" },
    { "label": "Cherry (from JSON)", "value": "json_cherry" },
    { "label": "Grape (from JSON)", "value": "json_grape" },
    { "label": "Mango (from JSON)", "value": "json_mango" }
];

// #region: Default Wheeler
const DefaultSingleSelectWheeler = () => {
    const selectedFruit = $('Cherry')

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Default Single-Select Wheeler</h3>
            <Wheeler
                options={FRUITS_OPTION}
                value={selectedFruit}
                cls="border rounded-md shadow-sm w-64"
                bottom={false}
            />
            <p class="mt-4">Selected Fruit: <span class="font-mono bg-gray-100 p-1 rounded">{selectedFruit}</span></p>
        </div>
    )
}
// #endregion

// #region: Controlled Wheeler
const ControlledSingleSelectWheeler = () => {
    const selectedFruit = $('Banana')

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Controlled Single-Select</h3>
            <p class="text-sm text-gray-600 mb-2">Change the value programmatically.</p>
            <Wheeler
                options={FRUITS_OPTION}
                value={selectedFruit}
                bottom={false}
                cls="border rounded-md shadow-sm w-64"
            />
            <div class="mt-4">
                <p>Selected Fruit: <span class="font-mono bg-gray-100 p-1 rounded">{() => selectedFruit()}</span></p>
                <div class="mt-2 space-x-2">
                    <button class="px-2 py-1 border rounded bg-gray-200" onClick={() => selectedFruit('Fig')}>Select Fig</button>
                    <button class="px-2 py-1 border rounded bg-gray-200" onClick={() => selectedFruit('Apple')}>Select Apple</button>
                </div>
            </div>
        </div>
    )
}
// #endregion

// #region: checkbox wheeler
const MultiSelectionWheeler = () => {
    const selectedFlavors = $<string[]>(['Vanilla', 'Strawberry'])

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Multi-Select Wheeler</h3>
            <Wheeler
                options={FLAVORS_OPTION}
                value={selectedFlavors}
                all="All Flavors" // This prop enables multi-select mode
                bottom={false}
                cls="border rounded-md shadow-sm w-64 h-64 overflow-y-auto"
                itemCount={7} // Defines the visible area height
            />
            <p class="mt-4">Selected Flavors: <span class="font-mono bg-gray-100 p-1 rounded">{() => JSON.stringify(selectedFlavors())}</span></p>
        </div>
    )
}
// #endregion

// #region: Header Wheeler
const HeaderWheeler = () => {
    const selectedFruit = $('Cherry')

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Header Wheeler</h3>
            <Wheeler
                options={FRUITS_OPTION}
                value={selectedFruit}
                header={() => 'Fruit Picker'}
                bottom={false}
                cls="border rounded-md shadow-sm w-64"
                searchable={false}
            />
            <p class="mt-4">Selected Fruit: <span class="font-mono bg-gray-100 p-2 rounded">{selectedFruit}</span></p>
        </div>
    )
}
// #endregion

// #region: Searchable Wheeler
const WheelerWithSearch = () => {
    const selectedFruit = $('Cherry')

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Wheeler with Search</h3>
            <p class="text-sm text-gray-600 mb-2">The header prop enables the search input.</p>
            <Wheeler
                options={FRUITS_OPTION}
                value={selectedFruit}
                header={() => 'Fruit Picker'}
                bottom={false}
                cls="border rounded-md shadow-sm w-64"
                searchable={true}
            />
            <p class="mt-4">Selected Fruit: <span class="font-mono bg-gray-100 p-1 rounded">{() => selectedFruit()}</span></p>
        </div>
    )
}

const CustomPlaceholderWheeler = () => {
    const selectedFruit = $('Cherry')

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Default Single-Select Wheeler</h3>
            <Wheeler
                options={FRUITS_OPTION}
                value={selectedFruit}
                cls="border rounded-md shadow-sm w-64"
                bottom={false}
                header={() => 'Fruit Picker'}
                searchable={true}
                searchPlaceholder={'Custom Placeholder'}
            />
            <p class="mt-4">Selected Fruit: <span class="font-mono bg-gray-100 p-1 rounded">{selectedFruit}</span></p>
        </div>
    )
}
// #endregion


// #region: default wheeler using json
const WheelerWithJsonOptions = () => {
    const selectedFruit = $('json_cherry');

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Wheeler with JSON Options</h3>
            <p class="text-sm text-gray-600 mb-2">
                The component accepts a JavaScript array directly as the `options` prop.
            </p>

            {/* Use the custom element tag `wui-wheeler` */}
            <wui-wheeler
                options={JSON_FRUIT_DATA} // Pass the array directly
                value={selectedFruit}
                bottom={false}
                class="border rounded-md shadow-sm w-64"
            />

            <p class="mt-4">
                Selected Fruit Value: <span class="font-mono bg-gray-100 p-1 rounded">{() => selectedFruit()}</span>
            </p>
        </div>
    );
};
// #endregion


export {
    WheelerWithJsonOptions,
    // DefaultSingleSelectWheeler,
    // ControlledSingleSelectWheeler,
    // MultiSelectionWheeler,
    // WheelerWithSearch,
    // CustomPlaceholderWheeler,
    // HeaderWheeler
}
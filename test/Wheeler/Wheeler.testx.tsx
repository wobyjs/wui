import { $, $$, useMemo } from 'woby'
import { Wheeler } from '../../src/Wheeler/Wheeler'
import { useArrayOptions } from '../../src/Wheeler/WheelerType'
import countryOptions from '../../public/json/countries.json'
import Button from '../../src/Button'

// --- Reusable Data ---
const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew']
const FLAVORS = ['Chocolate', 'Vanilla', 'Strawberry', 'Mint', 'Caramel', 'Coffee']

const FRUITS_OPTION = useArrayOptions(FRUITS)
const FLAVORS_OPTION = useArrayOptions(FLAVORS)

// --- Data simulating a JSON import ---
const JSON_CAR_DATA = [
    { "label": "Toyota", "value": "TOYOTA" },
    { "label": "Honda", "value": "HONDA" },
    { "label": "Ford", "value": "FORD" },
    { "label": "Tesla", "value": "TESLA" },
    { "label": "Subaru", "value": "SUBARU" },
];


// #region Default Wheeler Examples

/**
 * Demonstrates using the Wheeler with an array of objects (like from a JSON file).
 * The options have distinct 'label' and 'value' properties.
 */
const WheelerWithJsonObjectArray = () => {
    const selectedCarId = $('FORD');
    const isVisible = $(true);


    // Create a reactive display value that updates automatically.
    const displayValue = useMemo(() => {
        return formatOptionDisplay($$(selectedCarId), JSON_CAR_DATA);
    });

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Wheeler with JSON Object Array</h3>
            <p class="text-sm text-gray-600 mb-2">
                The `options` prop is populated from a JSON file containing objects with `label` and `value` keys.
            </p>
            <Button onClick={() => (isVisible(true))}> Open Picker </Button>
            <p class="my-4">Visible State: <span class="bg-gray-100 p-1 rounded font-bold uppercase">{() => isVisible.toString()}</span></p>
            {
                () => isVisible() && (
                    <Wheeler
                        options={JSON_CAR_DATA}
                        value={selectedCarId}
                        bottom={false}
                        visible={isVisible}
                        cls="border rounded-md shadow-sm w-64"
                    />
                )
            }


            <p class="mt-4">
                Current Selection: <span class="font-mono bg-gray-100 p-1 rounded">{displayValue}</span>
            </p>
        </div>
    );
};

/**
 * Demonstrates using the Wheeler with a simple array of strings.
 * The component normalizes each string to have the same label and value.
 */
const WheelerWithSimpleArray = () => {
    const selectedFruit = $('Cherry');

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Wheeler with Simple String Array</h3>
            <p class="text-sm text-gray-600 mb-2">
                The `options` prop is a plain array of strings.
            </p>
            <Wheeler
                options={FRUITS}
                value={selectedFruit}
                cls="border rounded-md shadow-sm w-64"
                bottom={false}
            />

            <p class="mt-4">
                Current Selection: <span class="font-mono bg-gray-100 p-1 rounded">{() => selectedFruit()}</span>
            </p>
        </div>
    )
}

const WheelerWithCountryData = () => {
    const selectedCountryCode = $('JP');

    const displayValue = useMemo(() => {
        return formatOptionDisplay($$(selectedCountryCode), countryOptions);
    });

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Wheeler with Country Data (from JSON)</h3>
            <p class="text-sm text-gray-600 mb-2">
                Demonstrates using a different set of JSON data.
            </p>
            <Wheeler
                options={countryOptions}
                value={selectedCountryCode}
                bottom={false}
                cls="border rounded-md shadow-sm w-64"
            />

            <p class="mt-4">
                Current Selection: <span class="font-mono bg-gray-100 p-1 rounded">{displayValue}</span>
            </p>
        </div>
    );
};
// #endregion


// #region Checkbox Wheeler

const CheckboxWheelerWithJsonObjectArray = () => {
    const selectedValue = $<string[]>(['TOYOTA', 'SUBARU'])

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Multi-Select Wheeler (CAR)</h3>
            <Wheeler
                options={JSON_CAR_DATA}
                value={selectedValue}
                all="All Cars" // This prop enables multi-select mode
                bottom={false}
                cls="border rounded-md shadow-sm w-64 overflow-y-auto"
                itemCount={4} // Defines the visible area height
            />
            <p class="mt-4">Selected Cars: <span class="font-mono bg-gray-100 p-1 rounded">{() => JSON.stringify($$(selectedValue))}</span></p>
        </div>
    )
};

const CheckboxWheelerWithSimpleArrayFruit = () => {

    const selectedValue = $<string[]>(['Banana', 'Cherry'])

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Multi-Select Wheeler (Fruits)</h3>
            <Wheeler
                options={FRUITS}
                value={selectedValue}
                all="All Fruits" // This prop enables multi-select mode
                bottom={false}
                cls="border rounded-md shadow-sm w-64 h-64 overflow-y-auto"
                itemCount={7} // Defines the visible area height
            />
            <p class="mt-4">Selected Fruit(s): <span class="font-mono bg-gray-100 p-1 rounded">{() => JSON.stringify($$(selectedValue))}</span></p>
        </div>
    )
};

const CheckboxWheelerWithSimpleArrayFlavors = () => {

    const selectedValue = $([])
    const defaultValue = $(["Vanilla", "Strawberry"])

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Multi-Select Wheeler (Flavors)</h3>
            <p class="my-4">Default Flavor(s): <span class="font-mono bg-gray-100 p-1 rounded">{() => JSON.stringify($$(defaultValue))}</span></p>
            <Wheeler
                options={FLAVORS}
                value={selectedValue}
                all="All Flavors" // This prop enables multi-select mode
                bottom={false}
                cls="border rounded-md shadow-sm w-64 h-64 overflow-y-auto"
                itemCount={7} // Defines the visible area height
            />
            <p class="mt-4">Selected Flavor(s): <span class="font-mono bg-gray-100 p-1 rounded">{() => JSON.stringify($$(selectedValue))}</span></p>
        </div>
    )
};

const CheckboxWheelerWithCountryData = () => {

    const selectedValue = $(['JP']);

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Multi-Select Wheeler with Country Data (from JSON)</h3>
            <p class="text-sm text-gray-600 mb-2">
                Demonstrates using a different set of JSON data.
            </p>
            <Wheeler
                options={countryOptions}
                value={selectedValue}
                all="All Countries" // This prop enables multi-select mode
                bottom={false}
                cls="border rounded-md shadow-sm w-64"
                itemCount={5} // Defines the visible area height
            />

            <p class="mt-4">Selected Flavor(s): <span class="font-mono bg-gray-100 p-1 rounded">{() => JSON.stringify($$(selectedValue))}</span></p>
        </div>
    );
};

// #endregion


// #region Controlled Wheeler

const ControlledWheelerWithJsonObjectArray = () => {
    const selectedValue = $('FORD')

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Controlled Wheeler - Json Object Array</h3>
            <p class="text-sm text-gray-600 mb-2">Change the value programmatically.</p>
            <Wheeler
                options={JSON_CAR_DATA}
                value={selectedValue}
                bottom={false}
                cls="border rounded-md shadow-sm w-64"
            />
            <div class="mt-4">
                <p>Selected Fruit: <span class="font-mono bg-gray-100 p-1 rounded">{selectedValue}</span></p>
                <div class="mt-2 space-x-2">
                    <button class="px-2 py-1 border rounded bg-gray-200" onClick={() => selectedValue('TOYOTA')}>Select TOYOTA</button>
                    <button class="px-2 py-1 border rounded bg-gray-200" onClick={() => selectedValue('SUBARU')}>Select SUBARU</button>
                </div>
            </div>
        </div>
    )
}

const ControlledWheelerWithSimpleArray = () => {
    const selectedFruit = $('Banana')

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Controlled Wheeler - Simple Array</h3>
            <p class="text-sm text-gray-600 mb-2">Change the value programmatically.</p>
            <Wheeler
                options={FRUITS}
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

const ControlledWheelerWithCountryData = () => {
    const selectedValue = $('JP')

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Controlled Single-Select</h3>
            <p class="text-sm text-gray-600 mb-2">Change the value programmatically.</p>
            <Wheeler
                options={countryOptions}
                value={selectedValue}
                bottom={false}
                cls="border rounded-md shadow-sm w-64"
            />
            <div class="mt-4">
                <p>Selected Fruit: <span class="font-mono bg-gray-100 p-1 rounded">{selectedValue}</span></p>
                <div class="mt-2 space-x-2">
                    <button class="px-2 py-1 border rounded bg-gray-200" onClick={() => selectedValue('US')}>Select United States</button>
                    <button class="px-2 py-1 border rounded bg-gray-200" onClick={() => selectedValue('CA')}>Select Canada</button>
                </div>
            </div>
        </div>
    )
}

// #endregion


// #region Header Wheeler
const HeaderWheelerWithJsonObjectArray = () => {
    const selectedCarId = $('FORD');

    // Create a reactive display value that updates automatically.
    const displayValue = useMemo(() => {
        return formatOptionDisplay($$(selectedCarId), JSON_CAR_DATA);
    });

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Wheeler with JSON Object Array</h3>
            <p class="text-sm text-gray-600 mb-2">
                The `options` prop is populated from a JSON file containing objects with `label` and `value` keys.
            </p>
            <Wheeler
                options={JSON_CAR_DATA}
                value={selectedCarId}
                header={() => 'Car Picker'}
                searchable={false}
                bottom={false}
                cls="border rounded-md shadow-sm w-64"
            />

            <p class="mt-4">
                Current Selection: <span class="font-mono bg-gray-100 p-1 rounded">{displayValue}</span>
            </p>
        </div>
    );
};
// #endregion


// #region Searchable Wheeler

const SearchWheelerWithJsonObjectArray = () => {
    const selectedCarId = $('FORD');

    // Create a reactive display value that updates automatically.
    const displayValue = useMemo(() => {
        return formatOptionDisplay($$(selectedCarId), JSON_CAR_DATA);
    });

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Wheeler with JSON Object Array</h3>
            <p class="text-sm text-gray-600 mb-2">
                The `options` prop is populated from a JSON file containing objects with `label` and `value` keys.
            </p>
            <Wheeler
                options={JSON_CAR_DATA}
                value={selectedCarId}
                bottom={false}
                cls="border rounded-md shadow-sm w-64"
                searchable={true}
                header={() => 'Car Picker'}
            />

            <p class="mt-4">
                Current Selection: <span class="font-mono bg-gray-100 p-1 rounded">{displayValue}</span>
            </p>
        </div>
    );
};


const SearchWheelerWithSimpleArray = () => {
    const selectedFruit = $('Cherry');

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Wheeler with Simple String Array</h3>
            <p class="text-sm text-gray-600 mb-2">
                The `options` prop is a plain array of strings.
            </p>
            <Wheeler
                options={FRUITS}
                value={selectedFruit}
                cls="border rounded-md shadow-sm w-64"
                bottom={false}
                searchable={true}
                searchPlaceholder={"Search for a fruit"}
                header={() => 'Fruit Picker'}
            />

            <p class="mt-4">
                Current Selection: <span class="font-mono bg-gray-100 p-1 rounded">{() => selectedFruit()}</span>
            </p>
        </div>
    )
}

const SearchWheelerWithCountryData = () => {
    const selectedCountryCode = $('JP');

    const displayValue = useMemo(() => {
        return formatOptionDisplay($$(selectedCountryCode), countryOptions);
    });

    return (
        <div class="p-4">
            <h3 class="font-bold mb-2">Wheeler with Country Data (from JSON)</h3>
            <p class="text-sm text-gray-600 mb-2">
                Demonstrates using a different set of JSON data.
            </p>
            <Wheeler
                options={countryOptions}
                value={selectedCountryCode}
                bottom={false}
                cls="border rounded-md shadow-sm w-64"
                searchable={true}
            />

            <p class="mt-4">
                Current Selection: <span class="font-mono bg-gray-100 p-1 rounded">{displayValue}</span>
            </p>
        </div>
    );
};
// #endregion


// #region Helper Function
/**
 * A helper to find an option in a JSON array and format it for display.
 * @param value The value to search for.
 * @param options The array of option objects to search within.
 * @returns A formatted string "Label (Value)" or the original value if not found.
 */
function formatOptionDisplay(value: string | number, options: { label: string, value: any }[]) {
    // Ensure options is an array before searching
    if (!Array.isArray(options)) return String(value);

    const option = options.find(opt => opt.value === value);
    return option ? `${option.label} (${option.value})` : String(value);
}

function getOptionInfo(optionValue: string, jsonData: any) {
    const option = jsonData.find(opt => opt.value === optionValue);
    return option ? `${option.label} (${option.value})` : optionValue;
}
// #endregion

export {
    WheelerWithJsonObjectArray,
    // WheelerWithSimpleArray,
    // WheelerWithCountryData,

    // CheckboxWheelerWithJsonObjectArray,
    // CheckboxWheelerWithSimpleArrayFruit,
    // CheckboxWheelerWithSimpleArrayFlavors,
    // CheckboxWheelerWithCountryData,

    // ControlledWheelerWithJsonObjectArray,
    // ControlledWheelerWithSimpleArray,
    // ControlledWheelerWithCountryData,

    // HeaderWheelerWithJsonObjectArray,

    // SearchWheelerWithJsonObjectArray,
    // SearchWheelerWithSimpleArray,
    // SearchWheelerWithCountryData,
}
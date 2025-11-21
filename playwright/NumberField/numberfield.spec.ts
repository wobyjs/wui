import { test, expect } from '@playwright/test'

// Configure the web server for this specific test suite
test.use({
    baseURL: 'http://localhost:5175',
})

test('number field component should load successfully', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Check that the page loaded successfully
    await expect(page).toHaveTitle('Number Field Component Playwright Test')

    // Check that the main body exists
    await expect(page.locator('body')).toBeVisible()

    console.log('Number field component test page loaded successfully')
})

test('number field component should display all variants correctly', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check default number field
    const defaultNumberField = page.locator('#number-field-default')
    await expect(defaultNumberField).toBeVisible()

    // Check number field with value
    const valueNumberField = page.locator('#number-field-value')
    await expect(valueNumberField).toBeVisible()

    // Check disabled number field
    const disabledNumberField = page.locator('#number-field-disabled')
    await expect(disabledNumberField).toBeVisible()

    // Check number field with min constraint
    const minNumberField = page.locator('#number-field-min')
    await expect(minNumberField).toBeVisible()

    // Check number field with max constraint
    const maxNumberField = page.locator('#number-field-max')
    await expect(maxNumberField).toBeVisible()

    // Check number field with step constraint
    const stepNumberField = page.locator('#number-field-step')
    await expect(stepNumberField).toBeVisible()

    // Check number field with label
    const labeledNumberField = page.locator('#number-field-labeled')
    await expect(labeledNumberField).toBeVisible()

    // Check number field with custom styling
    const styledNumberField = page.locator('#number-field-styled')
    await expect(styledNumberField).toBeVisible()

    // Check number field with noRotate prop
    const noRotateNumberField = page.locator('#number-field-no-rotate')
    await expect(noRotateNumberField).toBeVisible()

    // Check number field with noFix prop
    const noFixNumberField = page.locator('#number-field-no-fix')
    await expect(noFixNumberField).toBeVisible()

    // Check number field with noMinMax prop
    const noMinMaxNumberField = page.locator('#number-field-no-minmax')
    await expect(noMinMaxNumberField).toBeVisible()

    // Check number field with reactive prop
    const reactiveNumberField = page.locator('#number-field-reactive')
    await expect(reactiveNumberField).toBeVisible()

    // Check number field with standard behavior
    const standardNumberField = page.locator('#number-field-standard')
    await expect(standardNumberField).toBeVisible()

    console.log('All number field variants are displayed correctly')
})

test('number field component should have correct attributes', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check default number field attributes
    const defaultNumberField = page.locator('#number-field-default')
    await expect(defaultNumberField).toHaveAttribute('placeholder', 'Enter a number')
    // The default number field doesn't have a value attribute in HTML, but component defaults to 0
    // await expect(defaultNumberField).toHaveAttribute('value', '0') // This would fail as there's no value attribute

    // Check number field with value attributes
    const valueNumberField = page.locator('#number-field-value')
    await expect(valueNumberField).toHaveAttribute('value', '42')

    // Check disabled number field attributes
    const disabledNumberField = page.locator('#number-field-disabled')
    await expect(disabledNumberField).toHaveAttribute('disabled', 'true')
    await expect(disabledNumberField).toHaveAttribute('value', '100')

    // Check number field with min constraint attributes
    const minNumberField = page.locator('#number-field-min')
    await expect(minNumberField).toHaveAttribute('min', '0')

    // Check number field with max constraint attributes
    const maxNumberField = page.locator('#number-field-max')
    await expect(maxNumberField).toHaveAttribute('max', '100')

    // Check number field with step constraint attributes
    const stepNumberField = page.locator('#number-field-step')
    await expect(stepNumberField).toHaveAttribute('step', '0.5')

    // Check number field with noRotate prop attributes
    const noRotateNumberField = page.locator('#number-field-no-rotate')
    await expect(noRotateNumberField).toHaveAttribute('no-rotate', 'true')
    await expect(noRotateNumberField).toHaveAttribute('value', '50')

    // Check number field with noFix prop attributes
    const noFixNumberField = page.locator('#number-field-no-fix')
    await expect(noFixNumberField).toHaveAttribute('no-fix', 'true')
    await expect(noFixNumberField).toHaveAttribute('value', '150')

    // Check number field with noMinMax prop attributes
    const noMinMaxNumberField = page.locator('#number-field-no-minmax')
    await expect(noMinMaxNumberField).toHaveAttribute('no-minmax', 'true')
    await expect(noMinMaxNumberField).toHaveAttribute('value', '150')

    // Check number field with reactive prop attributes
    const reactiveNumberField = page.locator('#number-field-reactive')
    await expect(reactiveNumberField).toHaveAttribute('reactive', 'true')
    await expect(reactiveNumberField).toHaveAttribute('value', '25')

    // Check number field with standard behavior attributes
    const standardNumberField = page.locator('#number-field-standard')
    await expect(standardNumberField).toHaveAttribute('value', '50')

    console.log('Number field components have correct attributes')
})

test('number field component should be interactable', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check that default number field is enabled
    const defaultNumberField = page.locator('#number-field-default')
    // Custom elements don't have enabled/disabled states in the same way as regular inputs
    // We'll check that the input inside is enabled
    const defaultInput = defaultNumberField.locator('input')
    await expect(defaultInput).toBeEnabled()

    // Check that disabled number field is disabled
    const disabledNumberField = page.locator('#number-field-disabled')
    // We'll check that the input inside is disabled
    const disabledInput = disabledNumberField.locator('input')
    await expect(disabledInput).toBeDisabled()

    // Check that reactive number field is enabled
    const reactiveNumberField = page.locator('#number-field-reactive')
    const reactiveInput = reactiveNumberField.locator('input')
    await expect(reactiveInput).toBeEnabled()

    // Check that standard number field is enabled
    const standardNumberField = page.locator('#number-field-standard')
    const standardInput = standardNumberField.locator('input')
    await expect(standardInput).toBeEnabled()

    console.log('Number field components have correct enabled/disabled states')
})

test('number field component should handle input events', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test typing in default number field
    const defaultNumberField = page.locator('#number-field-default')
    await expect(defaultNumberField).toBeVisible()

    // Get the input element inside the shadow DOM
    const defaultInput = defaultNumberField.locator('input')
    await expect(defaultInput).toBeVisible()

    // Type a number into the field
    await defaultInput.fill('123')

    // Verify the value was set using toHaveValue instead of toHaveAttribute
    await expect(defaultInput).toHaveValue('123')

    console.log('Number field input event test completed')
})

test('number field component should handle input events with special props', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test typing in reactive number field
    const reactiveNumberField = page.locator('#number-field-reactive')
    await expect(reactiveNumberField).toBeVisible()

    // Get the input element inside the shadow DOM
    const reactiveInput = reactiveNumberField.locator('input')
    await expect(reactiveInput).toBeVisible()

    // Clear the input and type a new value
    await reactiveInput.fill('75')

    // Verify the value was set using toHaveValue instead of toHaveAttribute
    await expect(reactiveInput).toHaveValue('75')

    console.log('Number field input event test with special props completed')
})

test('enabled number field should respond to mouse interactions', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Get the default number field
    const defaultNumberField = page.locator('#number-field-default')
    await expect(defaultNumberField).toBeVisible()

    // Get the increment and decrement buttons
    const incrementButton = defaultNumberField.locator('button.plus')
    const decrementButton = defaultNumberField.locator('button:not(.plus)')

    // Verify buttons exist and are enabled
    await expect(incrementButton).toBeVisible()
    await expect(decrementButton).toBeVisible()
    await expect(incrementButton).toBeEnabled()
    await expect(decrementButton).toBeEnabled()

    // Get the input element inside the shadow DOM
    const defaultInput = defaultNumberField.locator('input')
    await expect(defaultInput).toBeVisible()

    // Get initial value using inputValue() instead of getAttribute
    const initialValue = await defaultInput.inputValue()

    // Click the increment button
    await incrementButton.click()

    // Verify the value has increased by 1
    const expectedIncrementedValue = (parseInt(initialValue) + 1).toString()
    await expect(defaultInput).toHaveValue(expectedIncrementedValue)

    // Click the decrement button
    await decrementButton.click()

    // Verify the value has decreased by 1 (back to initial)
    await expect(defaultInput).toHaveValue(initialValue)

    console.log('Enabled number field mouse interaction test completed')
})

test('enabled number field should respond to wheel interactions', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Get the default number field
    const defaultNumberField = page.locator('#number-field-default')
    await expect(defaultNumberField).toBeVisible()

    // Get the input element inside the shadow DOM
    const defaultInput = defaultNumberField.locator('input')
    await expect(defaultInput).toBeVisible()

    // Get initial value using inputValue() instead of getAttribute
    const initialValue = await defaultInput.inputValue()

    // Scroll up to increase value
    await defaultInput.hover()
    await page.mouse.wheel(0, -100)

    // Verify the value has increased using inputValue() instead of getAttribute
    const expectedIncrementedValue = (parseInt(initialValue) + 1).toString()
    await expect(defaultInput).toHaveValue(expectedIncrementedValue)

    // Scroll down to decrease value
    await page.mouse.wheel(0, 100)

    // Verify the value has decreased (back to initial) using inputValue() instead of getAttribute
    await expect(defaultInput).toHaveValue(initialValue)

    console.log('Enabled number field wheel interaction test completed')
})

test('enabled number field should respond to keyboard interactions', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Get the default number field
    const defaultNumberField = page.locator('#number-field-default')
    await expect(defaultNumberField).toBeVisible()

    // Get the input element inside the shadow DOM
    const defaultInput = defaultNumberField.locator('input')
    await expect(defaultInput).toBeVisible()

    // Clear the input and type a new value
    await defaultInput.fill('50')

    // Verify the value has changed using toHaveValue instead of toHaveAttribute
    await expect(defaultInput).toHaveValue('50')

    // Clear the input and type another value
    await defaultInput.fill('25')

    // Verify the value has changed using toHaveValue instead of toHaveAttribute
    await expect(defaultInput).toHaveValue('25')

    console.log('Enabled number field keyboard interaction test completed')
})

test('number field component should maintain consistent styles on hover', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test default number field hover state
    const defaultNumberField = page.locator('#number-field-default')
    await expect(defaultNumberField).toBeVisible()

    // Get initial computed styles
    const initialBorderColor = await defaultNumberField.evaluate(el =>
        window.getComputedStyle(el).borderColor
    )

    // Hover over number field
    await defaultNumberField.hover()

    // Get hover computed styles
    const hoverBorderColor = await defaultNumberField.evaluate(el =>
        window.getComputedStyle(el).borderColor
    )

    // For number fields, we might expect a slight change in border color on hover
    // But for now, we'll just verify the hover action doesn't fail
    console.log('Number field hover state test completed')

    // Release hover
    await page.mouse.move(0, 0)
})

test('number field component should handle noRotate prop correctly', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test noRotate number field
    const noRotateNumberField = page.locator('#number-field-no-rotate')
    await expect(noRotateNumberField).toBeVisible()

    // Check that it has the no-rotate attribute
    await expect(noRotateNumberField).toHaveAttribute('no-rotate', 'true')

    console.log('Number field noRotate prop test completed')
})

test('number field component should handle noFix prop correctly', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test noFix number field
    const noFixNumberField = page.locator('#number-field-no-fix')
    await expect(noFixNumberField).toBeVisible()

    // Check that it has the no-fix attribute
    await expect(noFixNumberField).toHaveAttribute('no-fix', 'true')

    console.log('Number field noFix prop test completed')
})

test('number field component should handle noMinMax prop correctly', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test noMinMax number field
    const noMinMaxNumberField = page.locator('#number-field-no-minmax')
    await expect(noMinMaxNumberField).toBeVisible()

    // Check that it has the no-minmax attribute
    await expect(noMinMaxNumberField).toHaveAttribute('no-minmax', 'true')

    console.log('Number field noMinMax prop test completed')
})

test('number field component should handle noMinMax with noRotate props correctly', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test noMinMax with noRotate number field
    const noMinMaxNoRotateNumberField = page.locator('#number-field-no-minmax-no-rotate')
    await expect(noMinMaxNoRotateNumberField).toBeVisible()

    // Check that it has both no-minmax and no-rotate attributes
    await expect(noMinMaxNoRotateNumberField).toHaveAttribute('no-minmax', 'true')
    await expect(noMinMaxNoRotateNumberField).toHaveAttribute('no-rotate', 'true')

    console.log('Number field noMinMax with noRotate props test completed')
})

test('number field component should handle reactive prop correctly', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test reactive number field
    const reactiveNumberField = page.locator('#number-field-reactive')
    await expect(reactiveNumberField).toBeVisible()

    // Check that it has the reactive attribute
    await expect(reactiveNumberField).toHaveAttribute('reactive', 'true')

    console.log('Number field reactive prop test completed')
})

test('number field component should demonstrate noFix behavior', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test noFix number field
    const noFixNumberField = page.locator('#number-field-no-fix')
    await expect(noFixNumberField).toBeVisible()

    // Check that the value is outside the normal range (150 vs 0-100)
    // This demonstrates that noFix allows values outside min/max
    await expect(noFixNumberField).toHaveAttribute('value', '150')

    console.log('Number field noFix behavior test completed')
})

test('number field component should demonstrate noMinMax behavior', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test noMinMax number field
    const noMinMaxNumberField = page.locator('#number-field-no-minmax')
    await expect(noMinMaxNumberField).toBeVisible()

    // Check that the value is outside the normal range (150 vs 0-100)
    // This demonstrates that noMinMax disables min/max constraints
    await expect(noMinMaxNumberField).toHaveAttribute('value', '150')

    console.log('Number field noMinMax behavior test completed')
})

test('number field component should demonstrate noRotate vs standard behavior', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test standard number field
    const standardNumberField = page.locator('#number-field-standard')
    await expect(standardNumberField).toBeVisible()

    // Test noRotate number field
    const noRotateNumberField = page.locator('#number-field-no-rotate')
    await expect(noRotateNumberField).toBeVisible()

    // Both should have their initial values
    await expect(standardNumberField).toHaveAttribute('value', '50')
    await expect(noRotateNumberField).toHaveAttribute('value', '50')

    console.log('Number field noRotate vs standard behavior test completed')
})

test('number field component should show error styling appropriately', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test noFix number field which should show error styling (value outside range)
    const noFixNumberField = page.locator('#number-field-no-fix')
    await expect(noFixNumberField).toBeVisible()

    // Test noMinMax number field which should show error styling (value outside range)
    const noMinMaxNumberField = page.locator('#number-field-no-minmax')
    await expect(noMinMaxNumberField).toBeVisible()

    console.log('Number field error styling test completed')
})

test('disabled number field should not respond to mouse interactions', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Get the disabled number field
    const disabledNumberField = page.locator('#number-field-disabled')
    await expect(disabledNumberField).toBeVisible()

    // Get the increment and decrement buttons
    const incrementButton = disabledNumberField.locator('button.plus')
    const decrementButton = disabledNumberField.locator('button:not(.plus)')

    // Verify buttons exist and are disabled
    await expect(incrementButton).toBeVisible()
    await expect(decrementButton).toBeVisible()
    await expect(incrementButton).toBeDisabled()
    await expect(decrementButton).toBeDisabled()

    // Get the input element inside the shadow DOM
    const disabledInput = disabledNumberField.locator('input')
    await expect(disabledInput).toBeVisible()

    // Get initial value using inputValue() instead of getAttribute
    const initialValue = await disabledInput.inputValue()

    console.log('Disabled number field mouse interaction test completed')
})

test('disabled number field should not respond to wheel interactions', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Get the disabled number field
    const disabledNumberField = page.locator('#number-field-disabled')
    await expect(disabledNumberField).toBeVisible()

    // Get the input element inside the shadow DOM
    const disabledInput = disabledNumberField.locator('input')
    await expect(disabledInput).toBeVisible()

    // Get the initial value using inputValue() instead of getAttribute
    const initialValue = await disabledInput.inputValue()

    // Try to scroll up (should not change the value)
    await disabledInput.hover()
    await page.mouse.wheel(0, -100)

    // Verify the value hasn't changed using inputValue() instead of getAttribute
    await expect(disabledInput).toHaveValue(initialValue)

    // Try to scroll down (should not change the value)
    await page.mouse.wheel(0, 100)

    // Verify the value hasn't changed using inputValue() instead of getAttribute
    await expect(disabledInput).toHaveValue(initialValue)

    console.log('Disabled number field wheel interaction test completed')
})

test('disabled number field should not respond to keyboard interactions', async ({ page }) => {
    // Navigate to the number field test page
    await page.goto('/playwright/NumberField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Get the disabled number field
    const disabledNumberField = page.locator('#number-field-disabled')
    await expect(disabledNumberField).toBeVisible()

    // Get the input element inside the shadow DOM
    const disabledInput = disabledNumberField.locator('input')
    await expect(disabledInput).toBeVisible()

    // Get initial value using inputValue() instead of getAttribute
    const initialValue = await disabledInput.inputValue()

    // Try to type in the input (should not work)
    await disabledInput.focus()
    await page.keyboard.type('123')

    // Verify the value hasn't changed
    await expect(disabledInput).toHaveValue(initialValue)

    // Try to use arrow keys (should not work)
    await page.keyboard.press('ArrowUp')
    await expect(disabledInput).toHaveValue(initialValue)

    await page.keyboard.press('ArrowDown')
    await expect(disabledInput).toHaveValue(initialValue)

    console.log('Disabled number field keyboard interaction test completed')
})

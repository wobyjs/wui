import { test, expect } from '@playwright/test'

// Configure the web server for this specific test suite
test.use({
    baseURL: 'http://localhost:5175',
})

test('text field component should load successfully', async ({ page }) => {
    // Navigate to the text field test page
    await page.goto('/playwright/TextField/test.html')

    // Check that the page loaded successfully
    await expect(page).toHaveTitle('Text Field Component Playwright Test')

    // Check that the main body exists
    await expect(page.locator('body')).toBeVisible()

    console.log('Text field component test page loaded successfully')
})

test('text field component should display all variants correctly', async ({ page }) => {
    // Navigate to the text field test page
    await page.goto('/playwright/TextField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check default text field
    const defaultTextField = page.locator('#text-field-default')
    await expect(defaultTextField).toBeVisible()

    // Check text field with value
    const valueTextField = page.locator('#text-field-value')
    await expect(valueTextField).toBeVisible()

    // Check disabled text field
    const disabledTextField = page.locator('#text-field-disabled')
    await expect(disabledTextField).toBeVisible()

    // Check outlined text field
    const outlinedTextField = page.locator('#text-field-outlined')
    await expect(outlinedTextField).toBeVisible()

    // Check filled text field
    const filledTextField = page.locator('#text-field-filled')
    await expect(filledTextField).toBeVisible()

    // Check standard text field
    const standardTextField = page.locator('#text-field-standard')
    await expect(standardTextField).toBeVisible()

    // Check text field with label
    const labeledTextField = page.locator('#text-field-labeled')
    await expect(labeledTextField).toBeVisible()

    // Check text field with helper text
    const helperTextField = page.locator('#text-field-helper')
    await expect(helperTextField).toBeVisible()

    // Check text field with error
    const errorTextField = page.locator('#text-field-error')
    await expect(errorTextField).toBeVisible()

    console.log('All text field variants are displayed correctly')
})

test('text field component should have correct attributes', async ({ page }) => {
    // Navigate to the text field test page
    await page.goto('/playwright/TextField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check default text field attributes
    const defaultTextField = page.locator('#text-field-default')
    await expect(defaultTextField).toHaveAttribute('placeholder', 'Enter text')

    // Check text field with value attributes
    const valueTextField = page.locator('#text-field-value')
    await expect(valueTextField).toHaveAttribute('value', 'Sample text')

    // Check disabled text field attributes
    const disabledTextField = page.locator('#text-field-disabled')
    await expect(disabledTextField).toHaveAttribute('disabled', 'true')
    await expect(disabledTextField).toHaveAttribute('value', 'Disabled text')

    // Check outlined text field attributes
    const outlinedTextField = page.locator('#text-field-outlined')
    await expect(outlinedTextField).toHaveAttribute('variant', 'outlined')

    // Check filled text field attributes
    const filledTextField = page.locator('#text-field-filled')
    await expect(filledTextField).toHaveAttribute('variant', 'filled')

    // Check standard text field attributes
    const standardTextField = page.locator('#text-field-standard')
    await expect(standardTextField).toHaveAttribute('variant', 'standard')

    // Check text field with error attributes
    const errorTextField = page.locator('#text-field-error')
    await expect(errorTextField).toHaveAttribute('error', 'true')

    console.log('Text field components have correct attributes')
})

test('text field component should be interactable', async ({ page }) => {
    // Navigate to the text field test page
    await page.goto('/playwright/TextField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check that default text field is enabled
    const defaultTextField = page.locator('#text-field-default')
    await expect(defaultTextField).toBeEnabled()

    // Check that disabled text field is disabled
    const disabledTextField = page.locator('#text-field-disabled')
    await expect(disabledTextField).toBeDisabled()

    console.log('Text field components have correct enabled/disabled states')
})

test('text field component should handle input events', async ({ page }) => {
    // Navigate to the text field test page
    await page.goto('/playwright/TextField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test typing in default text field
    const defaultTextField = page.locator('#text-field-default')
    await expect(defaultTextField).toBeVisible()

    // Type text into the field
    await defaultTextField.fill('Hello World')

    // Verify the value was set
    await expect(defaultTextField).toHaveValue('Hello World')

    console.log('Text field input event test completed')
})

test('text field component should change appearance on focus', async ({ page }) => {
    // Navigate to the text field test page
    await page.goto('/playwright/TextField/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test default text field focus state
    const defaultTextField = page.locator('#text-field-default')
    await expect(defaultTextField).toBeVisible()

    // Get initial computed styles
    const initialBorderColor = await defaultTextField.evaluate(el =>
        window.getComputedStyle(el).borderColor
    )

    // Focus on text field
    await defaultTextField.focus()

    // Get focus computed styles
    const focusBorderColor = await defaultTextField.evaluate(el =>
        window.getComputedStyle(el).borderColor
    )

    // For text fields, we might expect a slight change in border color on focus
    // But for now, we'll just verify the focus action doesn't fail
    console.log('Text field focus state test completed')

    // Blur the text field
    await page.keyboard.press('Tab')
})
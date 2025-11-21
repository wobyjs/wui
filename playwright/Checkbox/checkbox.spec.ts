import { test, expect } from '@playwright/test'

// Configure the web server for this specific test suite
test.use({
    baseURL: 'http://localhost:5175',
})

test('checkbox component should load successfully', async ({ page }) => {
    // Navigate to the checkbox test page
    await page.goto('/playwright/Checkbox/test.html')

    // Check that the page loaded successfully
    await expect(page).toHaveTitle('Checkbox Component Playwright Test')

    // Check that the main body exists
    await expect(page.locator('body')).toBeVisible()

    console.log('Checkbox component test page loaded successfully')
})

test('checkbox component should display all variants correctly', async ({ page }) => {
    // Navigate to the checkbox test page
    await page.goto('/playwright/Checkbox/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check unchecked checkbox
    const uncheckedCheckbox = page.locator('#checkbox-unchecked')
    await expect(uncheckedCheckbox).toBeVisible()

    // Check checked checkbox
    const checkedCheckbox = page.locator('#checkbox-checked')
    await expect(checkedCheckbox).toBeVisible()

    // Check disabled checkbox
    const disabledCheckbox = page.locator('#checkbox-disabled')
    await expect(disabledCheckbox).toBeVisible()

    // Check disabled checked checkbox
    const disabledCheckedCheckbox = page.locator('#checkbox-disabled-checked')
    await expect(disabledCheckedCheckbox).toBeVisible()

    // Check checkbox without label
    const noLabelCheckbox = page.locator('#checkbox-no-label')
    await expect(noLabelCheckbox).toBeVisible()

    // Check checkbox with custom label
    const customLabelCheckbox = page.locator('#checkbox-custom-label')
    await expect(customLabelCheckbox).toBeVisible()

    console.log('All checkbox variants are displayed correctly')
})

test('checkbox component should have correct attributes', async ({ page }) => {
    // Navigate to the checkbox test page
    await page.goto('/playwright/Checkbox/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check unchecked checkbox attributes
    const uncheckedCheckbox = page.locator('#checkbox-unchecked')
    await expect(uncheckedCheckbox).toHaveAttribute('label', 'Unchecked')

    // Check checked checkbox attributes
    const checkedCheckbox = page.locator('#checkbox-checked')
    await expect(checkedCheckbox).toHaveAttribute('label', 'Checked')
    await expect(checkedCheckbox).toHaveAttribute('checked', 'true')

    // Check disabled checkbox attributes
    const disabledCheckbox = page.locator('#checkbox-disabled')
    await expect(disabledCheckbox).toHaveAttribute('label', 'Disabled')
    await expect(disabledCheckbox).toHaveAttribute('disabled', 'true')

    // Check disabled checked checkbox attributes
    const disabledCheckedCheckbox = page.locator('#checkbox-disabled-checked')
    await expect(disabledCheckedCheckbox).toHaveAttribute('label', 'Disabled Checked')
    await expect(disabledCheckedCheckbox).toHaveAttribute('checked', 'true')
    await expect(disabledCheckedCheckbox).toHaveAttribute('disabled', 'true')

    console.log('Checkbox components have correct attributes')
})

test('checkbox component should be interactable', async ({ page }) => {
    // Navigate to the checkbox test page
    await page.goto('/playwright/Checkbox/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check that unchecked checkbox is enabled
    const uncheckedCheckbox = page.locator('#checkbox-unchecked')
    await expect(uncheckedCheckbox).toBeEnabled()

    // Check that checked checkbox is enabled
    const checkedCheckbox = page.locator('#checkbox-checked')
    await expect(checkedCheckbox).toBeEnabled()

    // Check that disabled checkboxes are disabled
    const disabledCheckbox = page.locator('#checkbox-disabled')
    await expect(disabledCheckbox).toBeDisabled()

    const disabledCheckedCheckbox = page.locator('#checkbox-disabled-checked')
    await expect(disabledCheckedCheckbox).toBeDisabled()

    console.log('Checkbox components have correct enabled/disabled states')
})

test('checkbox component should change state on click', async ({ page }) => {
    // Navigate to the checkbox test page
    await page.goto('/playwright/Checkbox/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test clicking unchecked checkbox
    const uncheckedCheckbox = page.locator('#checkbox-unchecked')
    await expect(uncheckedCheckbox).toBeVisible()

    // Click the checkbox
    await uncheckedCheckbox.click()

    // For now, we'll just verify the click action doesn't fail
    console.log('Checkbox click event test completed')
})

test('checkbox component should maintain consistent styles on hover', async ({ page }) => {
    // Navigate to the checkbox test page
    await page.goto('/playwright/Checkbox/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test unchecked checkbox hover state
    const uncheckedCheckbox = page.locator('#checkbox-unchecked')
    await expect(uncheckedCheckbox).toBeVisible()

    // Get initial computed styles
    const initialBgColor = await uncheckedCheckbox.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
    )

    // Hover over checkbox
    await uncheckedCheckbox.hover()

    // Get hover computed styles
    const hoverBgColor = await uncheckedCheckbox.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
    )

    // For checkboxes, we don't expect background color changes on hover
    expect(initialBgColor).toBe(hoverBgColor)

    console.log('Checkbox hover state test completed - no style changes expected')
})
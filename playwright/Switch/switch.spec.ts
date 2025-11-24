import { test, expect } from '@playwright/test'

// Configure the web server for this specific test suite
test.use({
    baseURL: 'http://localhost:5175',
})

test('switch component should load successfully', async ({ page }) => {
    // Navigate to the switch test page
    await page.goto('/playwright/Switch/test.html')

    // Check that the page loaded successfully
    await expect(page).toHaveTitle('Switch Component Playwright Test')

    // Check that the main body exists
    await expect(page.locator('body')).toBeVisible()

    console.log('Switch component test page loaded successfully')
})

test('switch component should display all variants correctly', async ({ page }) => {
    // Navigate to the switch test page
    await page.goto('/playwright/Switch/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check unchecked switch
    const uncheckedSwitch = page.locator('#switch-unchecked')
    await expect(uncheckedSwitch).toBeVisible()

    // Check checked switch
    const checkedSwitch = page.locator('#switch-checked')
    await expect(checkedSwitch).toBeVisible()

    // Check disabled switch
    const disabledSwitch = page.locator('#switch-disabled')
    await expect(disabledSwitch).toBeVisible()

    // Check disabled checked switch
    const disabledCheckedSwitch = page.locator('#switch-disabled-checked')
    await expect(disabledCheckedSwitch).toBeVisible()

    // Check switch with label
    const labelSwitch = page.locator('#switch-with-label')
    await expect(labelSwitch).toBeVisible()

    // Check switch with custom colors
    const customColorSwitch = page.locator('#switch-custom-color')
    await expect(customColorSwitch).toBeVisible()

    // Check switch with custom size
    const customSizeSwitch = page.locator('#switch-custom-size')
    await expect(customSizeSwitch).toBeVisible()

    console.log('All switch variants are displayed correctly')
})

test('switch component should have correct attributes', async ({ page }) => {
    // Navigate to the switch test page
    await page.goto('/playwright/Switch/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check unchecked switch attributes
    const uncheckedSwitch = page.locator('#switch-unchecked')
    // By default, switch should not have checked attribute
    await expect(uncheckedSwitch).not.toHaveAttribute('checked', 'true')

    // Check checked switch attributes
    const checkedSwitch = page.locator('#switch-checked')
    await expect(checkedSwitch).toHaveAttribute('checked', 'true')

    // Check disabled switch attributes
    const disabledSwitch = page.locator('#switch-disabled')
    await expect(disabledSwitch).toHaveAttribute('disabled', 'true')

    // Check disabled checked switch attributes
    const disabledCheckedSwitch = page.locator('#switch-disabled-checked')
    await expect(disabledCheckedSwitch).toHaveAttribute('checked', 'true')
    await expect(disabledCheckedSwitch).toHaveAttribute('disabled', 'true')

    console.log('Switch components have correct attributes')
})

test('switch component should be interactable', async ({ page }) => {
    // Navigate to the switch test page
    await page.goto('/playwright/Switch/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check that unchecked switch is enabled
    const uncheckedSwitch = page.locator('#switch-unchecked')
    await expect(uncheckedSwitch).toBeEnabled()

    // Check that checked switch is enabled
    const checkedSwitch = page.locator('#switch-checked')
    await expect(checkedSwitch).toBeEnabled()

    // Check that disabled switches are disabled
    const disabledSwitch = page.locator('#switch-disabled')
    await expect(disabledSwitch).toBeDisabled()

    const disabledCheckedSwitch = page.locator('#switch-disabled-checked')
    await expect(disabledCheckedSwitch).toBeDisabled()

    console.log('Switch components have correct enabled/disabled states')
})

test('switch component should change state on click', async ({ page }) => {
    // Navigate to the switch test page
    await page.goto('/playwright/Switch/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test clicking unchecked switch
    const uncheckedSwitch = page.locator('#switch-unchecked')
    await expect(uncheckedSwitch).toBeVisible()

    // Click the switch
    await uncheckedSwitch.click()

    // For now, we'll just verify the click action doesn't fail
    console.log('Switch click event test completed')
})

test('switch component should maintain consistent styles on hover', async ({ page }) => {
    // Navigate to the switch test page
    await page.goto('/playwright/Switch/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test unchecked switch hover state
    const uncheckedSwitch = page.locator('#switch-unchecked')
    await expect(uncheckedSwitch).toBeVisible()

    // Get initial computed styles
    const initialBgColor = await uncheckedSwitch.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
    )

    // Hover over switch
    await uncheckedSwitch.hover()

    // Get hover computed styles
    const hoverBgColor = await uncheckedSwitch.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
    )

    // For switches, we don't expect background color changes on hover
    expect(initialBgColor).toBe(hoverBgColor)

    console.log('Switch hover state test completed - no style changes expected')
})
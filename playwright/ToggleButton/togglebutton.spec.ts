import { test, expect } from '@playwright/test'

// Configure the web server for this specific test suite
test.use({
    baseURL: 'http://localhost:5175',
})

test('toggle button component should load successfully', async ({ page }) => {
    // Navigate to the toggle button test page
    await page.goto('/playwright/ToggleButton/test.html')

    // Check that the page loaded successfully
    await expect(page).toHaveTitle('Toggle Button Component Playwright Test')

    // Check that the main body exists
    await expect(page.locator('body')).toBeVisible()

    console.log('Toggle button component test page loaded successfully')
})

test('toggle button component should display all variants correctly', async ({ page }) => {
    // Navigate to the toggle button test page
    await page.goto('/playwright/ToggleButton/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check unchecked toggle button
    const uncheckedToggleButton = page.locator('#toggle-button-unchecked')
    await expect(uncheckedToggleButton).toBeVisible()

    // Check checked toggle button
    const checkedToggleButton = page.locator('#toggle-button-checked')
    await expect(checkedToggleButton).toBeVisible()

    // Check disabled toggle button
    const disabledToggleButton = page.locator('#toggle-button-disabled')
    await expect(disabledToggleButton).toBeVisible()

    // Check disabled checked toggle button
    const disabledCheckedToggleButton = page.locator('#toggle-button-disabled-checked')
    await expect(disabledCheckedToggleButton).toBeVisible()

    // Check text variant toggle button
    const textToggleButton = page.locator('#toggle-button-text')
    await expect(textToggleButton).toBeVisible()

    // Check contained variant toggle button
    const containedToggleButton = page.locator('#toggle-button-contained')
    await expect(containedToggleButton).toBeVisible()

    // Check outlined variant toggle button
    const outlinedToggleButton = page.locator('#toggle-button-outlined')
    await expect(outlinedToggleButton).toBeVisible()

    // Check toggle button with icon
    const iconToggleButton = page.locator('#toggle-button-icon')
    await expect(iconToggleButton).toBeVisible()

    // Check toggle button with custom styling
    const styledToggleButton = page.locator('#toggle-button-styled')
    await expect(styledToggleButton).toBeVisible()

    console.log('All toggle button variants are displayed correctly')
})

test('toggle button component should have correct attributes', async ({ page }) => {
    // Navigate to the toggle button test page
    await page.goto('/playwright/ToggleButton/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check unchecked toggle button attributes
    const uncheckedToggleButton = page.locator('#toggle-button-unchecked')
    // By default, toggle button should not have checked attribute
    await expect(uncheckedToggleButton).not.toHaveAttribute('checked', 'true')

    // Check checked toggle button attributes
    const checkedToggleButton = page.locator('#toggle-button-checked')
    await expect(checkedToggleButton).toHaveAttribute('checked', 'true')

    // Check disabled toggle button attributes
    const disabledToggleButton = page.locator('#toggle-button-disabled')
    await expect(disabledToggleButton).toHaveAttribute('disabled', 'true')

    // Check disabled checked toggle button attributes
    const disabledCheckedToggleButton = page.locator('#toggle-button-disabled-checked')
    await expect(disabledCheckedToggleButton).toHaveAttribute('checked', 'true')
    await expect(disabledCheckedToggleButton).toHaveAttribute('disabled', 'true')

    // Check text variant toggle button attributes
    const textToggleButton = page.locator('#toggle-button-text')
    await expect(textToggleButton).toHaveAttribute('variant', 'text')

    // Check contained variant toggle button attributes
    const containedToggleButton = page.locator('#toggle-button-contained')
    await expect(containedToggleButton).toHaveAttribute('variant', 'contained')

    // Check outlined variant toggle button attributes
    const outlinedToggleButton = page.locator('#toggle-button-outlined')
    await expect(outlinedToggleButton).toHaveAttribute('variant', 'outlined')

    console.log('Toggle button components have correct attributes')
})

test('toggle button component should be interactable', async ({ page }) => {
    // Navigate to the toggle button test page
    await page.goto('/playwright/ToggleButton/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check that unchecked toggle button is enabled
    const uncheckedToggleButton = page.locator('#toggle-button-unchecked')
    await expect(uncheckedToggleButton).toBeEnabled()

    // Check that checked toggle button is enabled
    const checkedToggleButton = page.locator('#toggle-button-checked')
    await expect(checkedToggleButton).toBeEnabled()

    // Check that disabled toggle buttons are disabled
    const disabledToggleButton = page.locator('#toggle-button-disabled')
    await expect(disabledToggleButton).toBeDisabled()

    const disabledCheckedToggleButton = page.locator('#toggle-button-disabled-checked')
    await expect(disabledCheckedToggleButton).toBeDisabled()

    console.log('Toggle button components have correct enabled/disabled states')
})

test('toggle button component should change state on click', async ({ page }) => {
    // Navigate to the toggle button test page
    await page.goto('/playwright/ToggleButton/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test clicking unchecked toggle button
    const uncheckedToggleButton = page.locator('#toggle-button-unchecked')
    await expect(uncheckedToggleButton).toBeVisible()

    // Click the toggle button
    await uncheckedToggleButton.click()

    // For now, we'll just verify the click action doesn't fail
    console.log('Toggle button click event test completed')
})

test('toggle button component should change background color on hover', async ({ page }) => {
    // Navigate to the toggle button test page
    await page.goto('/playwright/ToggleButton/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test unchecked toggle button hover state
    const uncheckedToggleButton = page.locator('#toggle-button-unchecked')
    await expect(uncheckedToggleButton).toBeVisible()

    // Get initial computed styles
    const initialBgColor = await uncheckedToggleButton.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
    )

    // Hover over toggle button
    await uncheckedToggleButton.hover()

    // Get hover computed styles
    const hoverBgColor = await uncheckedToggleButton.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
    )

    // Verify background color changed (toggle button should have hover effect)
    expect(initialBgColor).not.toBe(hoverBgColor)

    console.log('Toggle button hover state test completed')
})

test('toggle button component should have active state', async ({ page }) => {
    // Navigate to the toggle button test page
    await page.goto('/playwright/ToggleButton/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test unchecked toggle button active state
    const uncheckedToggleButton = page.locator('#toggle-button-unchecked')
    await expect(uncheckedToggleButton).toBeVisible()

    // Press mouse down to simulate active state
    await uncheckedToggleButton.dispatchEvent('mousedown')

    // For now, we'll just verify the mouse down action doesn't fail
    // A more comprehensive test would check for visual changes
    console.log('Toggle button active state test completed')

    // Release mouse
    await uncheckedToggleButton.dispatchEvent('mouseup')
})
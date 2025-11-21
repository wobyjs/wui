import { test, expect } from '@playwright/test'

// Configure the web server for this specific test suite
test.use({
    baseURL: 'http://localhost:5175',
})

test('icon button component should load successfully', async ({ page }) => {
    // Navigate to the icon button test page
    await page.goto('/playwright/IconButton/test.html')

    // Check that the page loaded successfully
    await expect(page).toHaveTitle('Icon Button Component Playwright Test')

    // Check that the main body exists
    await expect(page.locator('body')).toBeVisible()

    console.log('Icon button component test page loaded successfully')
})

test('icon button component should display all variants correctly', async ({ page }) => {
    // Navigate to the icon button test page
    await page.goto('/playwright/IconButton/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check default icon button
    const defaultIconButton = page.locator('#icon-button-default')
    await expect(defaultIconButton).toBeVisible()

    // Check disabled icon button
    const disabledIconButton = page.locator('#icon-button-disabled')
    await expect(disabledIconButton).toBeVisible()

    // Check icon button with custom icon
    const customIconButton = page.locator('#icon-button-custom')
    await expect(customIconButton).toBeVisible()

    // Check small icon button
    const smIconButton = page.locator('#icon-button-sm')
    await expect(smIconButton).toBeVisible()

    // Check medium icon button
    const mdIconButton = page.locator('#icon-button-md')
    await expect(mdIconButton).toBeVisible()

    // Check large icon button
    const lgIconButton = page.locator('#icon-button-lg')
    await expect(lgIconButton).toBeVisible()

    console.log('All icon button variants are displayed correctly')
})

test('icon button component should have correct attributes', async ({ page }) => {
    // Navigate to the icon button test page
    await page.goto('/playwright/IconButton/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check default icon button attributes
    const defaultIconButton = page.locator('#icon-button-default')
    await expect(defaultIconButton).toBeVisible()

    // Check disabled icon button attributes
    const disabledIconButton = page.locator('#icon-button-disabled')
    await expect(disabledIconButton).toHaveAttribute('disabled', 'true')

    // Check small icon button attributes
    const smIconButton = page.locator('#icon-button-sm')
    await expect(smIconButton).toHaveAttribute('size', 'sm')

    // Check medium icon button attributes
    const mdIconButton = page.locator('#icon-button-md')
    await expect(mdIconButton).toHaveAttribute('size', 'md')

    // Check large icon button attributes
    const lgIconButton = page.locator('#icon-button-lg')
    await expect(lgIconButton).toHaveAttribute('size', 'lg')

    console.log('Icon button components have correct attributes')
})

test('icon button component should be clickable', async ({ page }) => {
    // Navigate to the icon button test page
    await page.goto('/playwright/IconButton/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check that default icon button is enabled
    const defaultIconButton = page.locator('#icon-button-default')
    await expect(defaultIconButton).toBeEnabled()

    // Check that disabled icon button is disabled
    const disabledIconButton = page.locator('#icon-button-disabled')
    await expect(disabledIconButton).toBeDisabled()

    console.log('Icon button components have correct enabled/disabled states')
})

test('icon button component should handle click events', async ({ page }) => {
    // Navigate to the icon button test page
    await page.goto('/playwright/IconButton/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test clicking default icon button
    const defaultIconButton = page.locator('#icon-button-default')
    await expect(defaultIconButton).toBeVisible()

    // Click the icon button
    await defaultIconButton.click()

    // For now, we'll just verify the click action doesn't fail
    console.log('Icon button click event test completed')
})

test('icon button component should change background color on hover', async ({ page }) => {
    // Navigate to the icon button test page
    await page.goto('/playwright/IconButton/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test default icon button hover state
    const defaultIconButton = page.locator('#icon-button-default')
    await expect(defaultIconButton).toBeVisible()

    // Get initial computed styles
    const initialBgColor = await defaultIconButton.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
    )

    // Hover over icon button
    await defaultIconButton.hover()

    // Get hover computed styles
    const hoverBgColor = await defaultIconButton.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
    )

    // Verify background color changed (icon button should have hover effect)
    expect(initialBgColor).not.toBe(hoverBgColor)

    console.log('Icon button hover state test completed')
})

test('icon button component should have active state', async ({ page }) => {
    // Navigate to the icon button test page
    await page.goto('/playwright/IconButton/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test default icon button active state
    const defaultIconButton = page.locator('#icon-button-default')
    await expect(defaultIconButton).toBeVisible()

    // Press mouse down to simulate active state
    await defaultIconButton.dispatchEvent('mousedown')

    // For now, we'll just verify the mouse down action doesn't fail
    // A more comprehensive test would check for visual changes
    console.log('Icon button active state test completed')

    // Release mouse
    await defaultIconButton.dispatchEvent('mouseup')
})
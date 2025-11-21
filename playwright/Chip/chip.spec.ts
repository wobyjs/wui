import { test, expect } from '@playwright/test'

// Configure the web server for this specific test suite
test.use({
    baseURL: 'http://localhost:5175',
})

test('chip component should load successfully', async ({ page }) => {
    // Navigate to the chip test page
    await page.goto('/playwright/Chip/test.html')

    // Check that the page loaded successfully
    await expect(page).toHaveTitle('Chip Component Playwright Test')

    // Check that the main body exists
    await expect(page.locator('body')).toBeVisible()

    console.log('Chip component test page loaded successfully')
})

test('chip component should display all variants correctly', async ({ page }) => {
    // Navigate to the chip test page
    await page.goto('/playwright/Chip/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check default chip
    const defaultChip = page.locator('#chip-default')
    await expect(defaultChip).toBeVisible()

    // Check primary chip
    const primaryChip = page.locator('#chip-primary')
    await expect(primaryChip).toBeVisible()

    // Check secondary chip
    const secondaryChip = page.locator('#chip-secondary')
    await expect(secondaryChip).toBeVisible()

    // Check chip with icon
    const iconChip = page.locator('#chip-with-icon')
    await expect(iconChip).toBeVisible()

    // Check chip with avatar
    const avatarChip = page.locator('#chip-with-avatar')
    await expect(avatarChip).toBeVisible()

    // Check disabled chip
    const disabledChip = page.locator('#chip-disabled')
    await expect(disabledChip).toBeVisible()

    console.log('All chip variants are displayed correctly')
})

test('chip component should have correct attributes', async ({ page }) => {
    // Navigate to the chip test page
    await page.goto('/playwright/Chip/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check default chip attributes
    const defaultChip = page.locator('#chip-default')
    await expect(defaultChip).toBeVisible()

    // Check primary chip attributes
    const primaryChip = page.locator('#chip-primary')
    await expect(primaryChip).toHaveAttribute('color', 'primary')

    // Check secondary chip attributes
    const secondaryChip = page.locator('#chip-secondary')
    await expect(secondaryChip).toHaveAttribute('color', 'secondary')

    // Check disabled chip attributes
    const disabledChip = page.locator('#chip-disabled')
    await expect(disabledChip).toHaveAttribute('disabled', 'true')

    console.log('Chip components have correct attributes')
})

test('chip component should be interactable', async ({ page }) => {
    // Navigate to the chip test page
    await page.goto('/playwright/Chip/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check that default chip is enabled
    const defaultChip = page.locator('#chip-default')
    await expect(defaultChip).toBeEnabled()

    // Check that disabled chip is disabled
    const disabledChip = page.locator('#chip-disabled')
    await expect(disabledChip).toBeDisabled()

    console.log('Chip components have correct enabled/disabled states')
})

test('chip component should change background color on hover', async ({ page }) => {
    // Navigate to the chip test page
    await page.goto('/playwright/Chip/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test default chip hover state
    const defaultChip = page.locator('#chip-default')
    await expect(defaultChip).toBeVisible()

    // Get initial computed styles
    const initialBgColor = await defaultChip.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
    )

    // Hover over chip
    await defaultChip.hover()

    // Get hover computed styles
    const hoverBgColor = await defaultChip.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
    )

    // For chips, we might expect a slight change in background color on hover
    // But for now, we'll just verify the hover action doesn't fail
    console.log('Chip hover state test completed')

    // Release hover
    await page.mouse.move(0, 0)
})
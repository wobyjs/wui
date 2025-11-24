import { test, expect } from '@playwright/test'

// Configure the web server for this specific test suite
test.use({
    baseURL: 'http://localhost:5173',
})

test('appbar component should load successfully', async ({ page }) => {
    // Navigate to the appbar test page
    await page.goto('/playwright/test.html')

    // Check that the page loaded successfully
    await expect(page).toHaveTitle('WUI Playwright Test')

    // Check that the main body exists
    await expect(page.locator('body')).toBeVisible()

    console.log('Appbar component test page loaded successfully')
})

test('appbar component should display correctly', async ({ page }) => {
    // Navigate to the appbar test page
    await page.goto('/playwright/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check that appbar is visible
    const appbar = page.locator('#appbar')
    await expect(appbar).toBeVisible()

    console.log('Appbar component is displayed')
})

test('appbar component should maintain consistent styles on hover', async ({ page }) => {
    // Navigate to the appbar test page
    await page.goto('/playwright/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Get the appbar element
    const appbar = page.locator('#appbar')
    await expect(appbar).toBeVisible()

    // Get initial computed styles
    const initialBgColor = await appbar.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
    )
    const initialColor = await appbar.evaluate(el =>
        window.getComputedStyle(el).color
    )

    // Hover over appbar
    await appbar.hover()

    // Get computed styles after hover
    const hoverBgColor = await appbar.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
    )
    const hoverColor = await appbar.evaluate(el =>
        window.getComputedStyle(el).color
    )

    // Verify that the styles haven't changed (appbar should not have hover effects)
    expect(initialBgColor).toBe(hoverBgColor)
    expect(initialColor).toBe(hoverColor)

    console.log('Appbar hover state test completed - no style changes expected')
})
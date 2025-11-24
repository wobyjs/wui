import { test, expect } from '@playwright/test'

// Configure the web server for this specific test suite
test.use({
    baseURL: 'http://localhost:5173',
})

test('alignbutton component should load successfully', async ({ page }) => {
    // Navigate to the alignbutton test page
    await page.goto('/playwright/test.html')

    // Check that the page loaded successfully
    await expect(page).toHaveTitle('WUI Playwright Test')

    // Check that the main body exists
    await expect(page.locator('body')).toBeVisible()

    console.log('AlignButton component test page loaded successfully')
})

test('alignbutton component should display correctly', async ({ page }) => {
    // Navigate to the alignbutton test page
    await page.goto('/playwright/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check that alignbutton is visible
    const alignButton = page.locator('#align-button')
    await expect(alignButton).toBeVisible()

    console.log('AlignButton component is displayed')
})

test('alignbutton component should handle click events', async ({ page }) => {
    // Navigate to the alignbutton test page
    await page.goto('/playwright/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Get the alignbutton element
    const alignButton = page.locator('#align-button')
    await expect(alignButton).toBeVisible()

    // Click the alignbutton
    await alignButton.click()

    // For now, we'll just verify the click action doesn't fail
    console.log('AlignButton click event test completed')
})

test('alignbutton component should change background color on hover', async ({ page }) => {
    // Navigate to the alignbutton test page
    await page.goto('/playwright/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Get the alignbutton element
    const alignButton = page.locator('#align-button')
    await expect(alignButton).toBeVisible()

    // Get initial computed styles
    const initialBgColor = await alignButton.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
    )

    // Hover over alignbutton
    await alignButton.hover()

    // Get hover computed styles
    const hoverBgColor = await alignButton.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
    )

    // Verify background color changed (alignbutton should have hover effect)
    expect(initialBgColor).not.toBe(hoverBgColor)

    console.log('AlignButton hover state test completed')
})
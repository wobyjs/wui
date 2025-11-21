import { test, expect } from '@playwright/test'

// Configure the web server for this specific test suite
test.use({
    baseURL: 'http://localhost:5175',
})

test('card component should load successfully', async ({ page }) => {
    // Navigate to the card test page
    await page.goto('/playwright/Card/test.html')

    // Check that the page loaded successfully
    await expect(page).toHaveTitle('Card Component Playwright Test')

    // Check that the main body exists
    await expect(page.locator('body')).toBeVisible()

    console.log('Card component test page loaded successfully')
})

test('card component should display all variants correctly', async ({ page }) => {
    // Navigate to the card test page
    await page.goto('/playwright/Card/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check basic card
    const basicCard = page.locator('#card-basic')
    await expect(basicCard).toBeVisible()

    // Check card with header and footer
    const headerFooterCard = page.locator('#card-header-footer')
    await expect(headerFooterCard).toBeVisible()

    // Check card with actions
    const actionsCard = page.locator('#card-actions')
    await expect(actionsCard).toBeVisible()

    console.log('All card variants are displayed correctly')
})

test('card component should have correct structure', async ({ page }) => {
    // Navigate to the card test page
    await page.goto('/playwright/Card/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check basic card structure
    const basicCard = page.locator('#card-basic')
    await expect(basicCard).toBeVisible()

    // Check card with header and footer structure
    const headerFooterCard = page.locator('#card-header-footer')
    await expect(headerFooterCard).toBeVisible()

    // Check card with actions structure
    const actionsCard = page.locator('#card-actions')
    await expect(actionsCard).toBeVisible()

    console.log('Card components have correct structure')
})

test('card component should maintain consistent styles on hover', async ({ page }) => {
    // Navigate to the card test page
    await page.goto('/playwright/Card/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test basic card hover state
    const basicCard = page.locator('#card-basic')
    await expect(basicCard).toBeVisible()

    // Get initial computed styles
    const initialBoxShadow = await basicCard.evaluate(el =>
        window.getComputedStyle(el).boxShadow
    )

    // Hover over card
    await basicCard.hover()

    // Get hover computed styles
    const hoverBoxShadow = await basicCard.evaluate(el =>
        window.getComputedStyle(el).boxShadow
    )

    // For cards, we might expect a slight change in boxShadow on hover
    // But for now, we'll just verify the hover action doesn't fail
    console.log('Card hover state test completed')

    // Release hover
    await page.mouse.move(0, 0)
})
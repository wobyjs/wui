import { test, expect } from '@playwright/test'

// Configure the web server for this specific test suite
test.use({
    baseURL: 'http://localhost:5175',
})

test('collapse component should load successfully', async ({ page }) => {
    // Navigate to the collapse test page
    await page.goto('/playwright/Collapse/test.html')

    // Check that the page loaded successfully
    await expect(page).toHaveTitle('Collapse Component Playwright Test')

    // Check that the main body exists
    await expect(page.locator('body')).toBeVisible()

    console.log('Collapse component test page loaded successfully')
})

test('collapse component should display all variants correctly', async ({ page }) => {
    // Navigate to the collapse test page
    await page.goto('/playwright/Collapse/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check collapsed collapse
    const collapsedCollapse = page.locator('#collapse-collapsed')
    await expect(collapsedCollapse).toBeVisible()

    // Check expanded collapse
    const expandedCollapse = page.locator('#collapse-expanded')
    await expect(expandedCollapse).toBeVisible()

    // Check collapse with custom content
    const customCollapse = page.locator('#collapse-custom')
    await expect(customCollapse).toBeVisible()

    console.log('All collapse variants are displayed correctly')
})

test('collapse component should have correct attributes', async ({ page }) => {
    // Navigate to the collapse test page
    await page.goto('/playwright/Collapse/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check collapsed collapse attributes
    const collapsedCollapse = page.locator('#collapse-collapsed')
    // By default, collapse should not have expanded attribute
    await expect(collapsedCollapse).not.toHaveAttribute('expanded', 'true')

    // Check expanded collapse attributes
    const expandedCollapse = page.locator('#collapse-expanded')
    await expect(expandedCollapse).toHaveAttribute('expanded', 'true')

    console.log('Collapse components have correct attributes')
})

test('collapse component should be interactable', async ({ page }) => {
    // Navigate to the collapse test page
    await page.goto('/playwright/Collapse/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test clicking collapsed collapse to expand it
    const collapsedCollapse = page.locator('#collapse-collapsed')
    await expect(collapsedCollapse).toBeVisible()

    // Click the collapse to expand it
    await collapsedCollapse.click()

    // For now, we'll just verify the click action doesn't fail
    console.log('Collapse click event test completed')
})

test('collapse component should maintain consistent styles on hover', async ({ page }) => {
    // Navigate to the collapse test page
    await page.goto('/playwright/Collapse/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test collapsed collapse hover state
    const collapsedCollapse = page.locator('#collapse-collapsed')
    await expect(collapsedCollapse).toBeVisible()

    // Get initial computed styles
    const initialBgColor = await collapsedCollapse.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
    )

    // Hover over collapse
    await collapsedCollapse.hover()

    // Get hover computed styles
    const hoverBgColor = await collapsedCollapse.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
    )

    // For collapses, we don't expect background color changes on hover
    expect(initialBgColor).toBe(hoverBgColor)

    console.log('Collapse hover state test completed - no style changes expected')
})
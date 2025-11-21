import { test, expect } from '@playwright/test'

// Configure the web server for this specific test suite
test.use({
    baseURL: 'http://localhost:5175',
})

test('avatar component should load successfully', async ({ page }) => {
    // Navigate to the avatar test page
    await page.goto('/playwright/Avatar/test.html')

    // Check that the page loaded successfully
    await expect(page).toHaveTitle('Avatar Component Playwright Test')

    // Check that the main body exists
    await expect(page.locator('body')).toBeVisible()

    console.log('Avatar component test page loaded successfully')
})

test('avatar component should display all variants correctly', async ({ page }) => {
    // Navigate to the avatar test page
    await page.goto('/playwright/Avatar/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check circular avatar
    const circularAvatar = page.locator('#avatar-circular')
    await expect(circularAvatar).toBeVisible()

    // Check rounded avatar
    const roundedAvatar = page.locator('#avatar-rounded')
    await expect(roundedAvatar).toBeVisible()

    // Check square avatar
    const squareAvatar = page.locator('#avatar-square')
    await expect(squareAvatar).toBeVisible()

    // Check small avatar
    const smAvatar = page.locator('#avatar-sm')
    await expect(smAvatar).toBeVisible()

    // Check medium avatar
    const mdAvatar = page.locator('#avatar-md')
    await expect(mdAvatar).toBeVisible()

    // Check large avatar
    const lgAvatar = page.locator('#avatar-lg')
    await expect(lgAvatar).toBeVisible()

    // Check avatar with image
    const imageAvatar = page.locator('#avatar-image')
    await expect(imageAvatar).toBeVisible()

    console.log('All avatar variants are displayed correctly')
})

test('avatar component should have correct attributes', async ({ page }) => {
    // Navigate to the avatar test page
    await page.goto('/playwright/Avatar/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check circular avatar attributes
    const circularAvatar = page.locator('#avatar-circular')
    await expect(circularAvatar).toHaveAttribute('alt', 'Avatar')
    await expect(circularAvatar).toHaveAttribute('size', 'md')
    await expect(circularAvatar).toHaveAttribute('type', 'circular')

    // Check rounded avatar attributes
    const roundedAvatar = page.locator('#avatar-rounded')
    await expect(roundedAvatar).toHaveAttribute('type', 'rounded')

    // Check square avatar attributes
    const squareAvatar = page.locator('#avatar-square')
    await expect(squareAvatar).toHaveAttribute('type', 'square')

    // Check small avatar attributes
    const smAvatar = page.locator('#avatar-sm')
    await expect(smAvatar).toHaveAttribute('size', 'sm')

    // Check large avatar attributes
    const lgAvatar = page.locator('#avatar-lg')
    await expect(lgAvatar).toHaveAttribute('size', 'lg')

    console.log('Avatar components have correct attributes')
})

test('avatar component should maintain consistent styles on hover', async ({ page }) => {
    // Navigate to the avatar test page
    await page.goto('/playwright/Avatar/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test circular avatar hover state
    const circularAvatar = page.locator('#avatar-circular')
    await expect(circularAvatar).toBeVisible()

    // Get initial computed styles
    const initialBgColor = await circularAvatar.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
    )

    // Hover over avatar
    await circularAvatar.hover()

    // Get hover computed styles
    const hoverBgColor = await circularAvatar.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
    )

    // For avatars, we don't expect background color changes on hover
    expect(initialBgColor).toBe(hoverBgColor)

    console.log('Avatar hover state test completed - no style changes expected')
})
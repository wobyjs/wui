import { test, expect } from '@playwright/test'

// Configure the web server for this specific test suite
test.use({
    baseURL: 'http://localhost:5175',
})

test('badge component should load successfully', async ({ page }) => {
    // Navigate to the badge test page
    await page.goto('/playwright/Badge/test.html')

    // Check that the page loaded successfully
    await expect(page).toHaveTitle('Badge Component Playwright Test')

    // Check that the main body exists
    await expect(page.locator('body')).toBeVisible()

    console.log('Badge component test page loaded successfully')
})

test('badge component should display correctly', async ({ page }) => {
    // Navigate to the badge test page
    await page.goto('/playwright/Badge/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check the basic badge test
    const badge = page.locator('#badge')

    // Access the badge content through shadow DOM
    const elementHandle = await badge.evaluateHandle(el => {
        if (el.shadowRoot) {
            const div = el.shadowRoot.children[0] as HTMLElement
            if (div && div.children[0]) {
                const spanContainer = div.children[0] as HTMLElement
                if (spanContainer && spanContainer.children[0]) {
                    return spanContainer.children[0] as HTMLElement
                }
            }
        }
        return null
    })

    const badgeContent = await elementHandle.asElement()
    expect(badgeContent).not.toBeNull()

    if (badgeContent) {
        // Check that it has the correct text
        const text = await badgeContent.textContent()
        expect(text).toBe('5')
    }

    console.log('Badge component is displayed')
})

test('badge component should have correct attributes', async ({ page }) => {
    // Navigate to the badge test page
    await page.goto('/playwright/Badge/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check the basic badge test
    const badge = page.locator('#badge')

    // Check that the badge element has the correct attribute
    await expect(badge).toHaveAttribute('badge-content', '5')

    console.log('Badge components have correct attributes')
})

test('badge component should maintain consistent styles on hover', async ({ page }) => {
    // Navigate to the badge test page
    await page.goto('/playwright/Badge/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Check the basic badge test
    const badge = page.locator('#badge')

    // Access the badge content through shadow DOM
    const elementHandle = await badge.evaluateHandle(el => {
        if (el.shadowRoot) {
            const div = el.shadowRoot.children[0] as HTMLElement
            if (div && div.children[0]) {
                const spanContainer = div.children[0] as HTMLElement
                if (spanContainer && spanContainer.children[0]) {
                    return spanContainer.children[0] as HTMLElement
                }
            }
        }
        return null
    })

    const badgeContent = await elementHandle.asElement()
    expect(badgeContent).not.toBeNull()

    if (badgeContent) {
        // Check that it has the correct text
        const text = await badgeContent.textContent()
        expect(text).toBe('5')

        // Get initial computed styles of the badge content element
        const initialBgColor = await badgeContent.evaluate(el =>
            window.getComputedStyle(el).backgroundColor
        )
        const initialColor = await badgeContent.evaluate(el =>
            window.getComputedStyle(el).color
        )

        // Hover over badge
        await badge.hover()

        // Get computed styles after hover
        const hoverBgColor = await badgeContent.evaluate(el =>
            window.getComputedStyle(el).backgroundColor
        )
        const hoverColor = await badgeContent.evaluate(el =>
            window.getComputedStyle(el).color
        )

        // Verify that the styles haven't changed
        expect(initialBgColor).toBe(hoverBgColor)
        expect(initialColor).toBe(hoverColor)
    }

    console.log('Badge hover state test completed - no style changes expected')
})

// New tests for all variants

test('badge component position variants should display correctly', async ({ page }) => {
    // Navigate to the badge test page
    await page.goto('/playwright/Badge/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test Top Right badge
    const trBadge = page.locator('wui-badge[badge-content="TR"]')
    const trElementHandle = await trBadge.evaluateHandle(el => {
        if (el.shadowRoot) {
            const div = el.shadowRoot.children[0] as HTMLElement
            if (div && div.children[0]) {
                const spanContainer = div.children[0] as HTMLElement
                if (spanContainer && spanContainer.children[0]) {
                    return spanContainer.children[0] as HTMLElement
                }
            }
        }
        return null
    })
    const trBadgeContent = await trElementHandle.asElement()
    expect(trBadgeContent).not.toBeNull()
    if (trBadgeContent) {
        const text = await trBadgeContent.textContent()
        expect(text).toBe('TR')
    }

    // Test Top Left badge
    const tlBadge = page.locator('wui-badge[badge-content="TL"]')
    const tlElementHandle = await tlBadge.evaluateHandle(el => {
        if (el.shadowRoot) {
            const div = el.shadowRoot.children[0] as HTMLElement
            if (div && div.children[0]) {
                const spanContainer = div.children[0] as HTMLElement
                if (spanContainer && spanContainer.children[0]) {
                    return spanContainer.children[0] as HTMLElement
                }
            }
        }
        return null
    })
    const tlBadgeContent = await tlElementHandle.asElement()
    expect(tlBadgeContent).not.toBeNull()
    if (tlBadgeContent) {
        const text = await tlBadgeContent.textContent()
        expect(text).toBe('TL')
    }

    // Test Bottom Right badge
    const brBadge = page.locator('wui-badge[badge-content="BR"]')
    const brElementHandle = await brBadge.evaluateHandle(el => {
        if (el.shadowRoot) {
            const div = el.shadowRoot.children[0] as HTMLElement
            if (div && div.children[0]) {
                const spanContainer = div.children[0] as HTMLElement
                if (spanContainer && spanContainer.children[0]) {
                    return spanContainer.children[0] as HTMLElement
                }
            }
        }
        return null
    })
    const brBadgeContent = await brElementHandle.asElement()
    expect(brBadgeContent).not.toBeNull()
    if (brBadgeContent) {
        const text = await brBadgeContent.textContent()
        expect(text).toBe('BR')
    }

    // Test Bottom Left badge
    const blBadge = page.locator('wui-badge[badge-content="BL"]')
    const blElementHandle = await blBadge.evaluateHandle(el => {
        if (el.shadowRoot) {
            const div = el.shadowRoot.children[0] as HTMLElement
            if (div && div.children[0]) {
                const spanContainer = div.children[0] as HTMLElement
                if (spanContainer && spanContainer.children[0]) {
                    return spanContainer.children[0] as HTMLElement
                }
            }
        }
        return null
    })
    const blBadgeContent = await blElementHandle.asElement()
    expect(blBadgeContent).not.toBeNull()
    if (blBadgeContent) {
        const text = await blBadgeContent.textContent()
        expect(text).toBe('BL')
    }

    console.log('Badge position variants are displayed correctly')
})

test('badge component custom color variants should display correctly', async ({ page }) => {
    // Navigate to the badge test page
    await page.goto('/playwright/Badge/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test Red badge
    const redBadge = page.locator('wui-badge[badge-content="!"]')
    const redElementHandle = await redBadge.evaluateHandle(el => {
        if (el.shadowRoot) {
            const div = el.shadowRoot.children[0] as HTMLElement
            if (div && div.children[0]) {
                const spanContainer = div.children[0] as HTMLElement
                if (spanContainer && spanContainer.children[0]) {
                    return spanContainer.children[0] as HTMLElement
                }
            }
        }
        return null
    })
    const redBadgeContent = await redElementHandle.asElement()
    expect(redBadgeContent).not.toBeNull()
    if (redBadgeContent) {
        const text = await redBadgeContent.textContent()
        expect(text).toBe('!')
    }

    // Test Green badge - using a more specific selector
    const greenBadge = page.locator('p:text("Green Badge") + wui-badge')
    const greenElementHandle = await greenBadge.evaluateHandle(el => {
        if (el.shadowRoot) {
            const div = el.shadowRoot.children[0] as HTMLElement
            if (div && div.children[0]) {
                const spanContainer = div.children[0] as HTMLElement
                if (spanContainer && spanContainer.children[0]) {
                    return spanContainer.children[0] as HTMLElement
                }
            }
        }
        return null
    })
    const greenBadgeContent = await greenElementHandle.asElement()
    expect(greenBadgeContent).not.toBeNull()
    if (greenBadgeContent) {
        const text = await greenBadgeContent.textContent()
        // Using the correct character
        expect(text).toBe('✓')
    }

    // Test Yellow badge - using a more specific selector
    const yellowBadge = page.locator('p:text("Yellow Badge") + wui-badge')
    const yellowElementHandle = await yellowBadge.evaluateHandle(el => {
        if (el.shadowRoot) {
            const div = el.shadowRoot.children[0] as HTMLElement
            if (div && div.children[0]) {
                const spanContainer = div.children[0] as HTMLElement
                if (spanContainer && spanContainer.children[0]) {
                    return spanContainer.children[0] as HTMLElement
                }
            }
        }
        return null
    })
    const yellowBadgeContent = await yellowElementHandle.asElement()
    expect(yellowBadgeContent).not.toBeNull()
    if (yellowBadgeContent) {
        const text = await yellowBadgeContent.textContent()
        // Using the correct character
        expect(text).toBe('★')
    }

    console.log('Badge custom color variants are displayed correctly')
})

test('badge component large content should display correctly', async ({ page }) => {
    // Navigate to the badge test page
    await page.goto('/playwright/Badge/test.html')

    // Wait for content to load
    await page.waitForLoadState('networkidle')

    // Test Large Content badge
    const largeBadge = page.locator('wui-badge[badge-content="999+"]')
    const largeElementHandle = await largeBadge.evaluateHandle(el => {
        if (el.shadowRoot) {
            const div = el.shadowRoot.children[0] as HTMLElement
            if (div && div.children[0]) {
                const spanContainer = div.children[0] as HTMLElement
                if (spanContainer && spanContainer.children[0]) {
                    return spanContainer.children[0] as HTMLElement
                }
            }
        }
        return null
    })
    const largeBadgeContent = await largeElementHandle.asElement()
    expect(largeBadgeContent).not.toBeNull()
    if (largeBadgeContent) {
        const text = await largeBadgeContent.textContent()
        expect(text).toBe('999+')
    }

    console.log('Badge large content variant is displayed correctly')
})
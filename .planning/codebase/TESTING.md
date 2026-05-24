# Testing Patterns

**Analysis Date:** 2026-05-24

## Test Framework

**Vitest:**
- Version: 4.1.7
- Config: `vite.config.mts` (Vite plugin: `testPlugin`)
- Run commands:
  ```bash
  pnpm test          # Run all tests
  pnpm test:watch    # Watch mode
  ```

**Playwright:**
- Version: Not listed in package.json dependencies (likely via global install)
- Config: `playwright.config.ts`
- Test directory: `playwright/`
- Run commands:
  ```bash
  # Not explicitly defined in package.json scripts
  # Run via: npx playwright test
  ```

## Test Types

### 1. Component Demo Tests (`test/`)

**Purpose:**
- Visual demonstration and manual testing of components
- Co-located with component source for developer reference
- Not automated unit tests

**File Organization:**
```
test/
├── Button.test.tsx      # TSX demo component
├── Button.test.html     # HTML test page
├── Badge.test.tsx
├── Badge.test.html
├── Editor/
│   ├── List.test.tsx
│   ├── List.test.html
│   ├── AlignButton.test.tsx
│   └── ...
└── Wheeler/
    ├── Wheeler.test.tsx
    ├── Wheeler.test.html
    └── ...
```

**Naming Convention:**
- `<Component>.test.tsx` - Demo component file
- `<Component>.test.html` - HTML page that loads the component
- Paired files: `.tsx` exports demo components, `.html` displays them

### 2. Playwright E2E Tests (`playwright/`)

**Purpose:**
- Automated browser testing
- Visual regression testing
- Interaction testing

**File Organization:**
```
playwright/
├── Appbar/appbar.spec.ts
├── Badge/badge.spec.ts
├── Button/button.spec.ts
├── Checkbox/checkbox.spec.ts
├── TextField/textfield.spec.ts
└── ...
```

**Naming Convention:**
- `<Component>/<component>.spec.ts` - Playwright test file

## Test Structure

### Component Demo Test Pattern (`test/*.test.tsx`)

Demo files export multiple component variants:

```tsx
import { Button } from '../src/Button'

// Define variant components
const DefaultBtn = () => { return (<Button>Default Button</Button>) }
const TextBtn = () => { return (<Button type="text">Text Button</Button>) }
const ContainedBtn = () => { return (<Button type="contained">Contained Button</Button>) }

// Export for use in HTML test pages or other demos
export { DefaultBtn, TextBtn, ContainedBtn }
```

**Characteristics:**
- No `describe()`/`it()` blocks
- Exports component variants for manual testing
- Used in conjunction with `.test.html` files
- Imports from `../src/<Component>`

### HTML Test Page Pattern (`test/*.test.html`)

HTML files load and display demo components:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Button Component Test</title>
    <link href="/node_modules/@woby/chk/dist/index.css" rel="stylesheet">
    <script type="module" src="../src/Button.tsx"></script>
</head>
<body>
    <link href="../dist/wui.css" rel="stylesheet">
    <h2 class="text-[1.2em] pl-4">Button Component Test</h2>

    <woby-chk name="Text Button">
        <wui-button type="text" children="Text Button" snapshot-name="Text-Button" />
    </woby-chk>

    <woby-chk name="Contained Button">
        <wui-button type="contained" children="Contained Button" snapshot-name="Contained-Button" />
    </woby-chk>
</body>
</html>
```

**Characteristics:**
- Loads source component directly via `<script type="module">`
- Uses `<woby-chk>` custom element for test isolation
- `snapshot-name` attribute for snapshot testing
- Loads `wui.css` for styling
- Uses `@woby/chk` for test utilities

### Playwright Test Pattern (`playwright/*.spec.ts`)

```typescript
import { test, expect } from '@playwright/test'

test.use({ baseURL: 'http://localhost:5175' })

test('button component should load successfully', async ({ page }) => {
    await page.goto('/playwright/Button/test.html')
    await expect(page).toHaveTitle('Button Component Playwright Test')
    await expect(page.locator('body')).toBeVisible()
})

test('button component should display all button types', async ({ page }) => {
    await page.goto('/playwright/Button/test.html')
    await page.waitForLoadState('networkidle')

    const textButton = page.locator('#button-text')
    const containedButton = page.locator('#button-contained')

    await expect(textButton).toBeVisible()
    await expect(containedButton).toBeVisible()
})

test('button component should handle click events', async ({ page }) => {
    await page.goto('/playwright/Button/test.html')
    await page.waitForLoadState('networkidle')

    const textButton = page.locator('#button-text')
    await expect(textButton).toBeVisible()
    await textButton.click()
})
```

**Characteristics:**
- Uses Playwright's `test` and `expect` from `@playwright/test`
- Tests against local dev server at `http://localhost:5175`
- Tests load HTML test pages
- Tests visibility, attributes, interactions, and state changes
- Uses `waitForLoadState('networkidle')` for async rendering

## Playwright Configuration

**File:** `playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
    testDir: './playwright',
    timeout: 30000,
    expect: { timeout: 5000 },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html', { open: 'never' }],
        ['json', { outputFile: 'playwright-report/results.json' }],
        ['list']
    ],
    use: {
        baseURL: 'http://localhost:5175',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },
    webServer: {
        command: 'pnpm dev',
        url: 'http://localhost:5175',
        reuseExistingServer: !process.env.CI,
        stdout: 'ignore',
        stderr: 'pipe'
    }
})
```

**Key Settings:**
- Test directory: `./playwright`
- Timeout: 30s per test
- Runs against dev server (`pnpm dev`)
- Screenshots on failure
- Video retention on failure
- HTML + JSON reports

## Mocking

**No Mocking Framework:**
- No mock files or factories found in codebase
- Tests use real components and browser environment
- Playwright tests interact with actual DOM

## Test Data

**Inline Data:**
Test data defined directly in test files:

```tsx
const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry']
const FLAVORS = ['Chocolate', 'Vanilla', 'Strawberry', 'Mint', 'Caramel']

const JSON_CAR_DATA = [
    { "label": "Toyota", "value": "TOYOTA" },
    { "label": "Honda", "value": "HONDA" },
    { "label": "Ford", "value": "FORD" }
]
```

**External Data:**
- JSON files in `public/json/` (e.g., `countries.json`)
- Imported in test files: `import countryOptions from '../../public/json/countries.json'`

## Coverage

**Requirements:** No coverage enforcement detected

**Coverage Tool:** None configured (Vitest coverage not set up)

**How to add coverage:**
```bash
pnpm vitest run --coverage
```

## Test Commands

**Package.json scripts:**
```json
{
  "test": "vitest run",
  "test:watch": "vitest watch"
}
```

**Playwright (via CLI):**
```bash
npx playwright test                    # Run all Playwright tests
npx playwright test --ui               # UI mode
npx playwright test --headed           # Run with browser visible
npx playwright test <file.spec.ts>     # Run specific test file
```

## Testing Utilities

**`@woby/chk` Package:**
- Custom element `<woby-chk>` for test isolation
- Provides snapshot testing via `snapshot-name` attribute
- Imported in HTML test pages

**Vite Test Plugin:**
- Custom plugin: `vite-plugin-test` (local: `../vite-plugin-test/src/index.ts`)
- Loaded in `vite.config.mts`

**Vite Snapshot Plugin:**
- Custom plugin: `vite-plugin-snapshot`
- Provides snapshot testing functionality

## Where to Add New Tests

**New Component:**
- Demo test: `test/<Component>.test.tsx` + `test/<Component>.test.html`
- E2E test: `playwright/<Component>/<component>.spec.ts`

**Existing Component:**
- Add new variant to existing `test/<Component>.test.tsx`
- Add new test case to existing `playwright/<Component>/<component>.spec.ts`

**Utility/Hook:**
- Not currently tested (no test files found for utilities)

## Special Testing Patterns

**Editor Components:**
- Editor tests wrap components in `EditorContext.Provider`
- Tests demonstrate rich text editing functionality
- Example: `test/Editor/List.test.tsx`

**Wheeler Components:**
- Tests demonstrate single-select, multi-select, controlled, and searchable modes
- Example: `test/Wheeler/Wheeler.test.tsx`

**Snapshot Testing:**
- Uses `snapshot-name` attribute in HTML tests
- Handled by `vite-plugin-snapshot`
- Snapshots stored in `.snapshots/` directory

---

*Testing analysis: 2026-05-24*
> ## ⛔ PARKED
>
> This suite is **not maintained and does not run**. `@playwright/test` is not a
> dependency of this package, and the config has been renamed to
> `playwright.config.parked.ts` so nothing picks it up by accident.
>
> The two supported suites are:
>
> | Command | Suite |
> | ------- | ----- |
> | `pnpm dev` | Demo-cum-test page. Every component renders live; the **SSR Snapshot Tests** section shows each module's actual vs. expected markup and mirrors woby's SSR log to the console. |
> | `pnpm test` | Pure Node.js woby SSR. Bundles `src/ssr/ssr-test-runner.tsx` and compares `renderToString` output per state. |
>
> Both are driven by the same `src/ssr/TestXxx.tsx` modules, so a component is
> covered in a real browser and in Node from one set of expectations.
>
> To revive this directory: add `@playwright/test` to `devDependencies`, rename the
> config back to `playwright.config.ts`, and re-check the specs against the current
> markup — they were written before the snapshot suite existed.

# Playwright Tests for WUI Components

This directory contains Playwright tests for all WUI components. Each component has its own subdirectory with specific test files.

## Directory Structure

```
playwright/
├── Button/
│   └── button.spec.ts
├── Avatar/
│   └── avatar.spec.ts
├── Badge/
│   └── badge.spec.ts
├── Checkbox/
│   └── checkbox.spec.ts
├── Appbar/
│   └── appbar.spec.ts
├── Card/
│   └── card.spec.ts
├── Chip/
│   └── chip.spec.ts
├── Collapse/
│   └── collapse.spec.ts
├── IconButton/
│   └── iconbutton.spec.ts
├── NumberField/
│   └── numberfield.spec.ts
├── Switch/
│   └── switch.spec.ts
├── TextField/
│   └── textfield.spec.ts
├── ToggleButton/
│   └── togglebutton.spec.ts
├── AlignButton/
│   └── alignbutton.spec.ts
├── test.html
└── playwright.config.ts
```

## Running Tests

To run all Playwright tests:

```bash
pnpm test:playwright
```

To run tests in UI mode:

```bash
pnpm test:playwright:ui
```

To run tests for a specific component:

```bash
npx playwright test playwright/Button/button.spec.ts
```

## Test HTML File

The `test.html` file contains all components that are being tested. This file is served by the Vite development server and accessed by Playwright during testing.

## Configuration

The `playwright.config.ts` file contains the configuration for Playwright tests, including:
- Test directory
- Timeout settings
- Browser settings
- Reporter configuration
- Web server configuration

## Adding New Tests

To add tests for a new component:

1. Create a new directory for the component in the `playwright/` directory
2. Create a `.spec.ts` file with the tests
3. Add the component to the `test.html` file
4. Update the documentation if needed
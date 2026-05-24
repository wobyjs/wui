# External Integrations

**Analysis Date:** 2026-05-24

## APIs & External Services

**None detected** - This is a UI component library with no external API integrations. All functionality is client-side.

## Data Storage

**Databases:**
- None - No database connections or ORM usage

**File Storage:**
- Local filesystem only - Build artifacts output to `dist/` directory
- CSS output: `dist/wui.css`

**Caching:**
- None - No caching layer detected

## Authentication & Identity

**Auth Provider:**
- None - UI component library does not handle authentication

## Monitoring & Observability

**Error Tracking:**
- None detected in production code
- Playwright test failure artifacts (screenshots, videos, traces) in `playwright-report/`

**Logs:**
- Console-based logging during development
- Build process logs via Vite/TypeScript
- No structured logging framework

## CI/CD & Deployment

**Hosting:**
- npm registry - Package published as `@woby/wui`
- GitHub repository: `https://github.com/axe-me/wui`

**CI Pipeline:**
- None detected in repository files
- Playwright config has CI-specific settings (retries, workers, forbidOnly)

**Publishing:**
- Manual release process via npm scripts:
  - `pnpm run git` - Commit and push
  - `pnpm run bump` - Version bump
  - `pnpm run npmjs` - Publish to npm
  - `pnpm run release` - Combined release workflow

## Environment Configuration

**Required env vars:**
- None detected - No `.env` files or environment variable usage found

**Secrets location:**
- None - No secrets management required for this library

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Third-Party Libraries & Dependencies

**UI Framework:**
- woby ^1.58.40 - Reactive UI framework (core dependency)
  - Provides: observables, JSX runtime, component system, custom elements
  - Import pattern: `import { $, $$, useEffect, useMemo, ... } from 'woby'`
  - JSX runtime: `woby/jsx-runtime` and `woby/jsx-dev-runtime`

**Monorepo Workspace Packages:**
- @woby/use - Custom React-like hooks for Woby (workspace: `^`)
  - Used for: `useEventListener` and other lifecycle hooks
- @woby/chk - Component toolkit (aliased in Vite configs)
- @woby/styled - Styling solution (aliased in Vite configs)
- @woby/vite-plugin-test - Custom Vite plugin for testing

**Styling:**
- Tailwind CSS ^4.3.0 - Utility-first CSS framework
  - Integration: `@tailwindcss/vite` Vite plugin
  - Input: `src/input.css` with `@import "tailwindcss"`
  - Output: `dist/wui.css` (minified)
  - No custom Tailwind config file detected (using defaults)

**Testing Tools:**
- Vitest ^4.1.7 - Unit test runner
  - Config: Integrated via Vite plugins
  - Run: `pnpm test` or `pnpm test:watch`
- Playwright - E2E browser testing
  - Config: `playwright.config.ts`
  - Test directory: `playwright/`
  - Dev server: Auto-started on port 5175
- vite-plugin-snapshot - Snapshot testing integration

**Build Tools:**
- Vite - Modern build tool
  - Multiple configurations for different build targets
  - ES module output format
  - External dependencies: woby, oby, nanoid, @woby/* packages
- TypeScript 6.0.3 - Type system and declaration generation
  - Declaration files output to `dist/types/`
  - Build command: `tsc && npm run css`

**Utilities:**
- nanoid - Unique identifier generation (externalized in build)
- npm-run-all ^4.1.5 - npm script orchestration

## Browser APIs Used

**DOM APIs:**
- Custom Elements API - `customElement` function from woby
- Event listeners - via `useEventListener` from @woby/use
- Web Workers - TypeScript lib includes "WebWorker"

**Browser Features:**
- CSS encapsulation - via woby's `StyleEncapsulationProps`
- Observable-based reactivity - via woby's `$` and `$$` functions

## Integration Patterns

**Monorepo Structure:**
- Workspace dependencies use `workspace:^` protocol
- Development aliases resolve to local paths (e.g., `../../woby/src`)
- Production builds use published package names

**Build Outputs:**
- ES modules: `dist/index.es.js`
- Type declarations: `dist/types/index.d.ts`
- CSS bundle: `dist/wui.css`
- Source maps: Enabled for library build

---

*Integration audit: 2026-05-24*

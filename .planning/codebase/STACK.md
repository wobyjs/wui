# Technology Stack

**Analysis Date:** 2026-05-24

## Languages

**Primary:**
- TypeScript 6.0.3 - All source code, components, and tests

**Secondary:**
- JavaScript - Generated build output (ES modules)
- CSS - Styling via Tailwind CSS

## Runtime

**Environment:**
- Node.js (version not specified in config files)
- Browser (DOM environment for UI components)

**Package Manager:**
- pnpm (primary - indicated by `pnpm-lock.yaml` and scripts using `pnpm`)
- npm (secondary - `package-lock.json` also present, npm scripts in package.json)
- Lockfile: Both `pnpm-lock.yaml` and `package-lock.json` present

## Frameworks

**Core:**
- Woby ^1.58.40 - Reactive UI framework (primary framework, similar to SolidJS)
- JSX runtime via `woby/jsx-runtime` with `jsxImportSource: "woby"`

**Testing:**
- Vitest ^4.1.7 - Unit testing framework
- Playwright - E2E testing framework (config at `playwright.config.ts`)

**Build/Dev:**
- Vite - Build tool and dev server (multiple configs: `vite.config.mts`, `vite.config.web.mts`)
- TypeScript 6.0.3 - Type checking and declaration generation
- Tailwind CSS ^4.3.0 - Utility-first CSS framework with `@tailwindcss/vite` plugin

## Key Dependencies

**Critical:**
- woby ^1.58.40 - Core reactive framework providing observables, JSX, and component system
- @woby/use (workspace dependency) - Custom hooks library for Woby
- @woby/chk - Component library dependency (aliased in vite configs)
- @woby/styled - Styling library (aliased in vite configs)

**Infrastructure:**
- nanoid - Unique ID generation (external in rollup config)
- oby - Observable library (external dependency, related to woby)

**Development:**
- @types/node ^25.9.1 - Node.js type definitions
- npm-run-all ^4.1.5 - Script runner for parallel/sequential tasks
- vite-plugin-snapshot - Snapshot testing plugin
- @woby/vite-plugin-test - Custom Vite test plugin

## Configuration

**Environment:**
- No `.env` files detected (checked for existence only)
- Development mode controlled via CLI args (`--dev`, `--mode dev`)
- Custom aliases for monorepo workspace packages in Vite configs

**Build:**
- `tsconfig.json` - Main TypeScript config (ES2020 target, ESNext modules, bundler resolution)
- `tsconfig.web.json` - Web-specific config (extends main, no emit)
- `tsconfig.test.json` - Test-specific config (extends main, includes test files)
- `vite.config.mts` - Library build config (ES output, external dependencies)
- `vite.config.web.mts` - Web demo build config (HTML entry, dev server on port 5173)
- `playwright.config.ts` - E2E test config (dev server on port 5175)

**TypeScript Settings:**
- Target: ES2020
- Module: ESNext
- JSX: react-jsx with jsxImportSource "woby"
- Strict mode enabled (with some exceptions: strictNullChecks, noImplicitAny disabled)
- Declaration generation enabled for library build

## Platform Requirements

**Development:**
- Node.js runtime for build tools
- pnpm package manager (workspace support)
- Modern browser with ES2020 support for testing

**Production:**
- Browser environment (DOM, ES2020)
- No server-side runtime required (client-side library)
- CSS bundle required: `dist/wui.css` from Tailwind

---

*Stack analysis: 2026-05-24*

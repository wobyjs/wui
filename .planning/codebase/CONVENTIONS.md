# Coding Conventions

**Analysis Date:** 2026-05-24

## Project Configuration

**TypeScript:**
- Version: 6.x with `ignoreDeprecations: "6.0"` in `tsconfig.json`
- Strict mode enabled with `strict: true`
- `strictNullChecks: false` (relaxed null checking)
- `noUnusedLocals: false`, `noUnusedParameters: false`
- `noImplicitAny: false`, `noUncheckedIndexedAccess: false`
- `moduleResolution: "bundler"`, `module: "esnext"`
- `jsx: "react-jsx"`, `jsxImportSource: "woby"`
- `newLine: "lf"`
- Target: `es2020`

**Build Tools:**
- Vite is the primary build tool (`vite.config.mts`)
- Tailwind CSS v4 used for styling (`@tailwindcss/vite` plugin)
- Custom Vite plugins: `vite-plugin-snapshot` and `@woby/vite-plugin-test`

## Naming Conventions

**Files:**
- Components: PascalCase `.tsx` (e.g., `Button.tsx`, `TextField.tsx`)
- Utilities/types: PascalCase `.ts` (e.g., `colorUtils.ts`, `undoredo.ts`)
- Effect files: PascalCase `.tsx` (e.g., `TextField.effect.tsx`)
- Tests: `<Component>.test.tsx` or `<Component>.test.html`
- Playwright: lowercase `<component>.spec.ts` inside `playwright/<Component>/`

**Directories:**
- Components: PascalCase (e.g., `src/Editor/`, `src/Wheeler/`)
- Tests: PascalCase subdirectories (e.g., `test/Editor/`, `test/Wheeler/`)

**Code:**
- Components: PascalCase (e.g., `const Button = ...`, `const Badge = ...`)
- Props factory: `def = () => ({ ... })`
- Observable variables: lowercase with `$` suffix (e.g., `selectedValue`, `isVisible`)
- Observable creators: `$()` (woby) or `$<T>()` for typed
- Helper functions: camelCase (e.g., `formatOptionDisplay`, `getOptionInfo`)

## Component Pattern

All components follow this structure:

```tsx
import { $, $$, defaults, type JSX, customElement, type ElementAttributes, ... } from "woby"
import '@woby/chk'
import './input.css'

// Define prop types with defaults using `def`
const def = () => ({
    propName: $(defaultValue, HtmlString) as ObservableMaybe<string>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    children: $(null as JSX.Child),
    // ...
})

// Component using defaults(def, fn) pattern
const ComponentName = defaults(def, (props) => {
    const { propName, cls, class: cn, children, ...otherProps } = props

    return (
        <div class={[cls, cn]} {...otherProps}>
            {children}
        </div>
    )
}) as typeof ComponentName & StyleEncapsulationProps

// Register custom element
customElement('wui-component-name', ComponentName)

// Type augmentation for custom element JSX
declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-component-name': ElementAttributes<typeof ComponentName>
        }
    }
}

export { ComponentName }
export default ComponentName
```

## Import Organization

**Order (top to bottom):**
1. Side-effect import (e.g., `@woby/chk`, `./input.css`)
2. Framework/library imports (e.g., `import { $ } from 'woby'`)
3. Internal module imports from `woby` (e.g., `import { ..., type JSX } from 'woby'`)
4. Relative imports from project (e.g., `import { Button } from './Button'`)
5. External package imports (e.g., `import path from 'node:path'`)

**Example:**
```tsx
// Side-effect imports first
import '@woby/chk'
import './input.css'

// Framework imports
import { $, $$, defaults, type JSX, customElement, type ElementAttributes, type ObservableMaybe, useEffect, HtmlClass, HtmlString } from "woby"

// Local imports (grouped by path depth)
import { Button } from '../Button'
import { VariantMap } from './types'

// External packages
import path from 'node:path'
```

## Code Style

**Formatting:**
- No explicit formatter configured (no ESLint, Prettier, or Biome config found)
- TypeScript handles most style via strict mode
- No semicolons at end of statements in TSX files
- Spaces for indentation (not tabs)
- Trailing commas in multi-line objects/arrays

**Type Annotations:**
- Props use `ObservableMaybe<T>` for reactive props
- Class props use `JSX.Class | undefined`
- HTML attributes handled via spread `{...otherProps}`
- Custom element attributes use `HtmlBoolean`, `HtmlString`, `HtmlClass` type helpers

**Observable Usage:**
- `$()` creates observable state
- `$$()` unwraps observable values
- `useEffect()` for side effects
- `useMemo()` for computed values

## Styling Conventions

**Tailwind CSS v4:**
- Inline classes via `class` or `cls` props
- `class` prop used for additive classes
- `cls` prop used for class override/replacement
- Custom CSS variables via `[property:value]` syntax
- Example: `[transition:background-color_250ms_cubic-bezier(0.4,0,0.2,1)0ms]`

**Class Handling Pattern:**
```tsx
const { class: cn, cls, children, ...otherProps } = props
// cls: override class (if undefined, use default)
// cn (class): additive/override class
<span class={[() => $$(cls) ? $$(cls) : `default-class`, cn]} />
```

## Module Patterns

**Barrel Exports (`src/index.tsx`):**
```tsx
export * from './Button'
export * from './TextField'
export * from './Editor/Editor'
export { Button as NamedButton } from './Button'
export * as effectModule from './TextField.effect'
import './input.css'  // Side-effect import at bottom
```

**Custom Elements:**
- Components register themselves as custom elements with `wui-` prefix
- Example: `customElement('wui-button', Button)`
- JSX types augmented via `declare module 'woby'`

## Error Handling

- No try/catch blocks visible in component source code
- TypeScript errors handled via `//@ts-ignore` in some files
- Observable updates wrap values with `$$()` for unwrapping
- Default values provided via `defaults(def, fn)` pattern

## Comments

**Patterns observed:**
- Region markers: `// #region Name`, `// #endregion`
- Inline comments for complex logic: `// Description of what follows`
- JSDoc comments for functions:
  ```tsx
  /**
   * A helper to find an option in a JSON array and format it for display.
   * @param value The value to search for.
   * @param options The array of option objects to search within.
   * @returns A formatted string "Label (Value)" or the original value if not found.
   */
  ```

## File Patterns

**Source files (`src/`):**
- All `.tsx` files are components
- `.effect.tsx` files contain CSS effect strings
- `.ts` files for utilities, types, and entry points

**Test files (`test/`):**
- `.test.tsx` - Component demonstration files (export demo components)
- `.test.html` - HTML test pages that load components via `<script>` tags
- Same basename for paired `.tsx` and `.html` files

**Playwright tests (`playwright/`):**
- `playwright.config.ts` - Playwright configuration
- `<Component>/<component>.spec.ts` - E2E tests

---

*Convention analysis: 2026-05-24*
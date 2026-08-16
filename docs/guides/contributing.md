# Contributing to @woby/wui

We welcome contributions to @woby/wui! This guide will help you get started with contributing to the project.

## Code of Conduct

Be respectful and constructive in issues, pull requests, and reviews. Assume good
faith, keep feedback about the code, and give contributors room to learn.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/wui.git`
3. Create a new branch: `git checkout -b my-feature-branch`
4. Make your changes
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin my-feature-branch`
7. Submit a pull request

## Development Setup

### Prerequisites

- Node.js (version 14 or higher)
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/wobyjs/wui.git
cd wui

# Install dependencies
pnpm install

# Build the project
pnpm build
```

### Development Workflow

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Project Structure

```
@woby/wui/
├── src/                # Source code — components live flat at the top level
│   ├── Button.tsx      # One file per component (Button, Checkbox, TextField, …)
│   ├── Editor/         # Rich-text editor, property panel, and the plugin system
│   ├── PropertyForm/    # Typed property editors (string, number, boolean, colour, …)
│   ├── Wheeler/        # Portal-based pickers (Wheeler, MultiWheeler, DateTimeWheeler)
│   ├── ssr/            # TestXxx.tsx snapshot modules + ssr-test-runner.tsx
│   ├── icons/          # SVG icon components
│   ├── helper/         # Shared utilities
│   ├── index.tsx       # Package entry point
│   └── main.ts         # Dev-server entry (mounts src/app.tsx)
├── docs/
│   ├── api/            # Technical API reference, one file per component
│   ├── components/     # Example-driven component docs
│   └── guides/         # Tutorials and conceptual guides
├── test/               # Type-test declarations and .testx templates
├── public/             # Static assets served by the dev server
└── dist/               # Build output (dist/types holds the emitted .d.ts)
```

## Component Development

### Creating a New Component

1. Create a new file in the `src/` directory
2. Follow the existing component patterns
3. Export the component in `src/index.ts`
4. Add documentation in `docs/components/`

### Component Structure

```tsx
// ExampleComponent.tsx
import { $, $$, type JSX } from 'woby'

type ExampleComponentProps = JSX.HTMLAttributes<HTMLDivElement> & {
  // Custom props
  variant?: 'primary' | 'secondary'
}

export const ExampleComponent = (props: ExampleComponentProps): JSX.Element => {
  const { children, class: className, variant = 'primary', ...otherProps } = props
  
  return (
    <div 
      class={['base-class', `variant-${variant}`, className]}
      {...otherProps}
    >
      {children}
    </div>
  )
}
```

### Component Guidelines

1. **Props**: Use standard HTML attributes plus custom props
2. **Styling**: Use Tailwind CSS classes via the `class` prop
3. **Observables**: Work seamlessly with Woby observables
4. **Accessibility**: Ensure proper ARIA attributes and keyboard navigation
5. **TypeScript**: Provide proper type definitions

## Documentation

### Component Documentation

Each component should have documentation in `docs/components/`:

- Basic usage examples
- Props documentation
- Advanced usage patterns
- Styling options

### Guide Documentation

Add guides for new features or patterns in `docs/guides/`.

## Testing

There are **two** suites, and they share a single set of expectations — the
`src/ssr/TestXxx.tsx` modules. Run both:

| Command | Suite | Covers |
| ------- | ----- | ------ |
| `pnpm dev` | Demo cum test page | Every component renders live. The **SSR Snapshot Tests** section prints each module's actual vs. expected markup on the page *and* mirrors woby's SSR log to the console. |
| `pnpm test` | Pure Node.js woby SSR | `renderToString` markup per component state, compared against literal expected strings. Exits non-zero on any mismatch. |

Neither is wired into `pnpm build` — run them yourself.

The browser page shows what the console shows: a summary banner (modules /
passed / failed / assertions) followed by one card per module with an
`actual / expect` panel. Failing modules open their panel automatically, so a
drifted attribute is visible without opening devtools.

Parked, deliberately: the Playwright specs under `playwright/`. `@playwright/test`
is not a dependency and the config is renamed `playwright.config.parked.ts`, so
nothing runs it. See `playwright/README.md` before reviving it.

A small vitest suite also exists for editor internals
(`test/DOMNormalizer.test.ts`, `test/SelectionManager.test.ts`, run with
`pnpm exec vitest run`). It is not part of the two-suite story above. Note its
include pattern is `.ts` only — `test/*.test.tsx` files are never collected, so a
new unit test must be `.ts` or it silently doesn't run.

### Writing Snapshot Tests

Snapshot tests are **modules**, one per component, at `src/ssr/TestXxx.tsx`. Each
module is run by two harnesses from a single source of truth, so a component is
checked in Node and in a real browser without duplicating expectations.

A module has three parts:

```tsx
import { $, $$, renderToString, type JSX } from 'woby'
import { TestSnapshots, useInterval, TEST_INTERVAL, registerTestObservable, testObservables, assert } from '../test-util'
import { ExampleComponent } from '../ExampleComponent'

const name = 'TestExample'

// 1. The component under test, cycling through a fixed list of states.
const TestExample = (): JSX.Element => {
    const states = [{ variant: 'primary' }, { variant: 'secondary' }]
    const index = $(0)
    registerTestObservable(name, index)          // lets a runner drive the state
    useInterval(() => index(p => (p + 1) % states.length), TEST_INTERVAL)

    const ret: JSX.Element = () => <ExampleComponent {...states[index()]}>Test</ExampleComponent>
    registerTestObservable(`${name}_ssr`, ret)   // lets renderToString re-render it
    return ret
}

// 2. Node-only block: renderToString each state and compare to a literal string.
if (typeof globalThis.__isSSRTest__ !== 'undefined') { /* … log actual + expected, record failures … */ }

// 3. expect(): used by BOTH the Node runner and the browser's TestSnapshots harness.
TestExample.test = {
    static: false,
    stateCount: 2,
    compareActualValues: true,
    expect: () => `<div class="variant-${['primary', 'secondary'][$$(testObservables[name])]}">Test</div>`,
}

export { TestExample }
export default () => <TestSnapshots Component={TestExample} />
```

Then register it in two places — one line each:

- `src/ssr/ssr-test-runner.tsx` — import + the `components` array (Node suite).
- `src/ssr/tests.tsx` — import + the `tests` array (browser suite). `app.tsx`
  renders that array, so it needs no edit.

Three rules keep new modules from failing spuriously:

- **Fix every non-deterministic value.** Auto-generated ids must be pinned to
  constants, or SSR and the browser disagree on every run.
- **Expect the two serializers to differ.** `renderToString` emits self-closing
  void elements (`<input … />`) and reflects `checked` as `checked=""`; the
  browser serializer emits `<input …>` and keeps `checked` as a property, never
  an attribute. Write both expectations, don't reconcile them.
- **Record failures, don't `process.exit`.** The runner imports every module, so
  exiting on the spot hides the actual/expected output of every module after
  yours. Push onto `globalThis.__ssrFailures`; the runner exits non-zero once the
  whole suite has run.

### Running Tests

```bash
# Node SSR suite — bundles src/ssr/ssr-test-runner.tsx with esbuild, then runs it.
# Prints actual vs. expected markup per state and a pass/fail summary.
pnpm test          # alias for `pnpm ssr-test`

# Browser suite — open the dev server and scroll to "SSR Snapshot Tests".
# Each module re-asserts on every MutationObserver tick, and shows its own
# actual/expect pair on the page as well as in the console.
pnpm dev
```

`pnpm test` takes no file argument — it always runs the whole suite. To narrow it
down, comment the module out of the `components` array in
`src/ssr/ssr-test-runner.tsx`.

## Code Style

### TypeScript

- Use TypeScript for all new code
- Follow existing type patterns
- Provide proper type definitions for props and return values

### Formatting

- Use Prettier for code formatting
- Follow the existing code style
- Maintain consistency with the codebase

### Commits

- Use clear, descriptive commit messages
- Follow conventional commit format when possible
- Keep commits focused on a single change

## Pull Request Process

1. Ensure your code follows the guidelines above
2. Add or update documentation as needed
3. Add tests for new functionality
4. Update the README.md if necessary
5. Submit a pull request with a clear description of changes

### Pull Request Guidelines

- Keep PRs small and focused
- Include a clear description of the changes
- Reference any related issues
- Ensure all tests pass
- Update documentation as needed

## Reporting Issues

### Bug Reports

When reporting bugs, include:

1. A clear description of the issue
2. Steps to reproduce
3. Expected vs actual behavior
4. Environment details (browser, OS, etc.)
5. Code examples if possible

### Feature Requests

For feature requests, include:

1. A clear description of the proposed feature
2. Use cases for the feature
3. Any implementation ideas if you have them

## License

By contributing to @woby/wui, you agree that your contributions will be licensed under the MIT License.
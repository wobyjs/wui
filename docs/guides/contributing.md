# Contributing to woby-wui

We welcome contributions to woby-wui! This guide will help you get started with contributing to the project.

## Code of Conduct

Please read and follow our [Code of Conduct](../../CODE_OF_CONDUCT.md) before contributing.

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
git clone https://github.com/wongchichong/wui.git
cd woby-wui

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
woby-wui/
├── src/              # Source code
│   ├── components/   # Individual components
│   ├── hooks/        # Custom hooks
│   ├── utils/        # Utility functions
│   └── index.ts      # Main entry point
├── docs/             # Documentation
├── tests/            # Test files
├── examples/         # Example applications
├── dist/             # Built files
└── ...
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

### Writing Tests

Create test files with `.test.tsx` extension in the `tests/` directory:

```tsx
import { $ } from 'woby'
import { renderToString } from 'woby/test'
import { ExampleComponent } from '../src/ExampleComponent'

describe('ExampleComponent', () => {
  it('renders correctly', () => {
    const html = renderToString(<ExampleComponent>Test</ExampleComponent>)
    expect(html).toContain('Test')
  })
  
  it('handles variant prop', () => {
    const html = renderToString(<ExampleComponent variant="secondary">Test</ExampleComponent>)
    expect(html).toContain('variant-secondary')
  })
})
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test tests/ExampleComponent.test.tsx
```

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

By contributing to woby-wui, you agree that your contributions will be licensed under the MIT License.
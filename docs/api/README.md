# API Reference

This section provides detailed API documentation for all @woby/wui components.

## Component APIs

Each component's API documentation includes:

- **Props**: Detailed description of all available props
- **Events**: List of events the component can emit
- **Methods**: Public methods available on the component
- **CSS Classes**: Default styling and customization options
- **Type Definitions**: TypeScript type definitions for props and return values

## Common Patterns

### Prop Naming Conventions

- Boolean props use present tense (e.g., `disabled`, `checked`)
- Event handlers use `on` prefix (e.g., `onChange`, `onClick`)
- CSS classes use `class` prop (following Woby conventions)

### Observable Integration

Most components that accept value props can work with Woby observables:

```tsx
import { $ } from 'woby'
import { TextField } from '@woby/wui'

const value = $('initial value')
// Pass observable directly
<TextField value={value} />
```

### Styling

All components accept a `class` prop for custom styling:

```tsx
<Button class="bg-blue-500 hover:bg-blue-700 text-white">
  Click me
</Button>
```
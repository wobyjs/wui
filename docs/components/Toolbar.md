# Toolbar

## Import

```tsx
import { Toolbar } from '@woby/wui'
```

## Basic Usage

```tsx
import { Toolbar } from '@woby/wui'

const MyComponent = () => {
  return (
    <Toolbar>
      {/* Component content */}
    </Toolbar>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | `JSX.Child` | - | The content of the component |
| class | `string | string[] | { [key: string]: boolean }` | - | Additional CSS classes to apply |

## Examples

### Basic Example

```tsx
<Toolbar>
  Example content
</Toolbar>
```

## TypeScript Definitions

```tsx
type ToolbarProps = JSX.HTMLAttributes<HTMLDivElement>

export const Toolbar: (props: ToolbarProps) => JSX.Element
```

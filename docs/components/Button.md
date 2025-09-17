# Button

## Import

```tsx
import { Button } from '@woby/wui'
```

## Basic Usage

```tsx
import { Button } from '@woby/wui'

const MyComponent = () => {
  return (
    <Button>
      {/* Component content */}
    </Button>
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
<Button>
  Example content
</Button>
```

## TypeScript Definitions

```tsx
type ButtonProps = JSX.HTMLAttributes<HTMLDivElement>

export const Button: (props: ButtonProps) => JSX.Element
```

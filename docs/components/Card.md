# Card

## Import

```tsx
import { Card } from '@woby/wui'
```

## Basic Usage

```tsx
import { Card } from '@woby/wui'

const MyComponent = () => {
  return (
    <Card>
      {/* Component content */}
    </Card>
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
<Card>
  Example content
</Card>
```

## TypeScript Definitions

```tsx
type CardProps = JSX.HTMLAttributes<HTMLDivElement>

export const Card: (props: CardProps) => JSX.Element
```

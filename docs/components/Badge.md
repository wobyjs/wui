# Badge

## Import

```tsx
import { Badge } from '@woby/wui'
```

## Basic Usage

```tsx
import { Badge } from '@woby/wui'

const MyComponent = () => {
  return (
    <Badge>
      {/* Component content */}
    </Badge>
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
<Badge>
  Example content
</Badge>
```

## TypeScript Definitions

```tsx
type BadgeProps = JSX.HTMLAttributes<HTMLDivElement>

export const Badge: (props: BadgeProps) => JSX.Element
```

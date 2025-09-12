# Chip

## Import

```tsx
import { Chip } from '@woby/wui'
```

## Basic Usage

```tsx
import { Chip } from '@woby/wui'

const MyComponent = () => {
  return (
    <Chip>
      {/* Component content */}
    </Chip>
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
<Chip>
  Example content
</Chip>
```

## TypeScript Definitions

```tsx
type ChipProps = JSX.HTMLAttributes<HTMLDivElement>

export const Chip: (props: ChipProps) => JSX.Element
```

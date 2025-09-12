# IconButton

## Import

```tsx
import { IconButton } from '@woby/wui'
```

## Basic Usage

```tsx
import { IconButton } from '@woby/wui'

const MyComponent = () => {
  return (
    <IconButton>
      {/* Component content */}
    </IconButton>
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
<IconButton>
  Example content
</IconButton>
```

## TypeScript Definitions

```tsx
type IconButtonProps = JSX.HTMLAttributes<HTMLDivElement>

export const IconButton: (props: IconButtonProps) => JSX.Element
```

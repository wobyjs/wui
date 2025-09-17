# ToggleButton

## Import

```tsx
import { ToggleButton } from '@woby/wui'
```

## Basic Usage

```tsx
import { ToggleButton } from '@woby/wui'

const MyComponent = () => {
  return (
    <ToggleButton>
      {/* Component content */}
    </ToggleButton>
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
<ToggleButton>
  Example content
</ToggleButton>
```

## TypeScript Definitions

```tsx
type ToggleButtonProps = JSX.HTMLAttributes<HTMLDivElement>

export const ToggleButton: (props: ToggleButtonProps) => JSX.Element
```

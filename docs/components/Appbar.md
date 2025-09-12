# Appbar

## Import

```tsx
import { Appbar } from '@woby/wui'
```

## Basic Usage

```tsx
import { Appbar } from '@woby/wui'

const MyComponent = () => {
  return (
    <Appbar>
      {/* Component content */}
    </Appbar>
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
<Appbar>
  Example content
</Appbar>
```

## TypeScript Definitions

```tsx
type AppbarProps = JSX.HTMLAttributes<HTMLDivElement>

export const Appbar: (props: AppbarProps) => JSX.Element
```

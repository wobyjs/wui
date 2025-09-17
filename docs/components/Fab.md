# Fab

## Import

```tsx
import { Fab } from '@woby/wui'
```

## Basic Usage

```tsx
import { Fab } from '@woby/wui'

const MyComponent = () => {
  return (
    <Fab>
      {/* Component content */}
    </Fab>
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
<Fab>
  Example content
</Fab>
```

## TypeScript Definitions

```tsx
type FabProps = JSX.HTMLAttributes<HTMLDivElement>

export const Fab: (props: FabProps) => JSX.Element
```

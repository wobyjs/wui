# Paper

## Import

```tsx
import { Paper } from '@woby/wui'
```

## Basic Usage

```tsx
import { Paper } from '@woby/wui'

const MyComponent = () => {
  return (
    <Paper>
      {/* Component content */}
    </Paper>
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
<Paper>
  Example content
</Paper>
```

## TypeScript Definitions

```tsx
type PaperProps = JSX.HTMLAttributes<HTMLDivElement>

export const Paper: (props: PaperProps) => JSX.Element
```

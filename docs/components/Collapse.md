# Collapse

## Import

```tsx
import { Collapse } from '@woby/wui'
```

## Basic Usage

```tsx
import { Collapse } from '@woby/wui'

const MyComponent = () => {
  return (
    <Collapse>
      {/* Component content */}
    </Collapse>
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
<Collapse>
  Example content
</Collapse>
```

## TypeScript Definitions

```tsx
type CollapseProps = JSX.HTMLAttributes<HTMLDivElement>

export const Collapse: (props: CollapseProps) => JSX.Element
```

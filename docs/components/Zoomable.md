# Zoomable

## Import

```tsx
import { Zoomable } from '@woby/wui'
```

## Basic Usage

```tsx
import { Zoomable } from '@woby/wui'

const MyComponent = () => {
  return (
    <Zoomable>
      {/* Component content */}
    </Zoomable>
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
<Zoomable>
  Example content
</Zoomable>
```

## TypeScript Definitions

```tsx
type ZoomableProps = JSX.HTMLAttributes<HTMLDivElement>

export const Zoomable: (props: ZoomableProps) => JSX.Element
```

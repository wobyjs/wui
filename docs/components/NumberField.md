# NumberField

## Import

```tsx
import { NumberField } from '@woby/wui'
```

## Basic Usage

```tsx
import { NumberField } from '@woby/wui'

const MyComponent = () => {
  return (
    <NumberField>
      {/* Component content */}
    </NumberField>
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
<NumberField>
  Example content
</NumberField>
```

## TypeScript Definitions

```tsx
type NumberFieldProps = JSX.HTMLAttributes<HTMLDivElement>

export const NumberField: (props: NumberFieldProps) => JSX.Element
```

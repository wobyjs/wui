# Checkbox

## Import

```tsx
import { Checkbox } from '@woby/wui'
```

## Basic Usage

```tsx
import { Checkbox } from '@woby/wui'

const MyComponent = () => {
  return (
    <Checkbox>
      {/* Component content */}
    </Checkbox>
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
<Checkbox>
  Example content
</Checkbox>
```

## TypeScript Definitions

```tsx
type CheckboxProps = JSX.HTMLAttributes<HTMLDivElement>

export const Checkbox: (props: CheckboxProps) => JSX.Element
```

# TextField

## Import

```tsx
import { TextField } from '@woby/wui'
```

## Basic Usage

```tsx
import { TextField } from '@woby/wui'

const MyComponent = () => {
  return (
    <TextField>
      {/* Component content */}
    </TextField>
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
<TextField>
  Example content
</TextField>
```

## TypeScript Definitions

```tsx
type TextFieldProps = JSX.HTMLAttributes<HTMLDivElement>

export const TextField: (props: TextFieldProps) => JSX.Element
```

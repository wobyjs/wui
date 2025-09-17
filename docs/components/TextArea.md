# TextArea

## Import

```tsx
import { TextArea } from '@woby/wui'
```

## Basic Usage

```tsx
import { TextArea } from '@woby/wui'

const MyComponent = () => {
  return (
    <TextArea>
      {/* Component content */}
    </TextArea>
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
<TextArea>
  Example content
</TextArea>
```

## TypeScript Definitions

```tsx
type TextAreaProps = JSX.HTMLAttributes<HTMLDivElement>

export const TextArea: (props: TextAreaProps) => JSX.Element
```

# Avatar

## Import

```tsx
import { Avatar } from '@woby/wui'
```

## Basic Usage

```tsx
import { Avatar } from '@woby/wui'

const MyComponent = () => {
  return (
    <Avatar>
      {/* Component content */}
    </Avatar>
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
<Avatar>
  Example content
</Avatar>
```

## TypeScript Definitions

```tsx
type AvatarProps = JSX.HTMLAttributes<HTMLDivElement>

export const Avatar: (props: AvatarProps) => JSX.Element
```

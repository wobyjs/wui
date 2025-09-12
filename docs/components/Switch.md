# Switch

## Import

```tsx
import { Switch } from '@woby/wui'
```

## Basic Usage

```tsx
import { Switch } from '@woby/wui'

const MyComponent = () => {
  return (
    <Switch>
      {/* Component content */}
    </Switch>
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
<Switch>
  Example content
</Switch>
```

## TypeScript Definitions

```tsx
type SwitchProps = JSX.HTMLAttributes<HTMLDivElement>

export const Switch: (props: SwitchProps) => JSX.Element
```

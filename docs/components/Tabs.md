# Tabs

## Import

```tsx
import { Tabs } from '@woby/wui'
```

## Basic Usage

```tsx
import { Tabs } from '@woby/wui'

const MyComponent = () => {
  return (
    <Tabs>
      {/* Component content */}
    </Tabs>
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
<Tabs>
  Example content
</Tabs>
```

## TypeScript Definitions

```tsx
type TabsProps = JSX.HTMLAttributes<HTMLDivElement>

export const Tabs: (props: TabsProps) => JSX.Element
```

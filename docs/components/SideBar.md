# SideBar

## Import

```tsx
import { SideBar } from '@woby/wui'
```

## Basic Usage

```tsx
import { SideBar } from '@woby/wui'

const MyComponent = () => {
  return (
    <SideBar>
      {/* Component content */}
    </SideBar>
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
<SideBar>
  Example content
</SideBar>
```

## TypeScript Definitions

```tsx
type SideBarProps = JSX.HTMLAttributes<HTMLDivElement>

export const SideBar: (props: SideBarProps) => JSX.Element
```

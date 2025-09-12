# Switch API

## Import

```tsx
import { Switch } from '@woby/wui'
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| checked | `Observable<boolean> \| boolean` | `false` | If `true`, the switch will be checked |
| disabled | `boolean` | `false` | If `true`, the switch will be disabled |
| class | `string \| string[] \| { [key: string]: boolean }` | - | Additional CSS classes to apply |
| onChange | `EventHandler<HTMLInputElement>` | - | Callback fired when the switch state changes |
| ... | `JSX.InputHTMLAttributes<HTMLInputElement>` | - | All other standard input attributes |

## Hooks

### useEnumSwitch
```tsx
import { useEnumSwitch } from '@woby/wui'
```

Creates a switch component that toggles between two enum values.

```tsx
const useEnumSwitch: <T>(
  value: Observable<T>,
  onValue: T,
  offValue: T
) => [ComponentFunction, () => void]
```

## CSS Classes

The Switch component uses the following default CSS classes:
```css
relative inline-block w-12 h-6 rounded-full bg-gray-400 align-middle
cursor-pointer transition-colors duration-200 ease-in-out
checked:bg-blue-500
after:content-[''] after:absolute after:top-1 after:left-1
after:w-4 after:h-4 after:rounded-full after:bg-white
after:transition-transform after:duration-200 after:ease-in-out
checked:after:transform checked:after:translate-x-6
disabled:opacity-50 disabled:cursor-not-allowed
```

## TypeScript Definitions

```tsx
type SwitchProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  checked?: ObservableMaybe<boolean>
}

export const Switch: (props: SwitchProps) => JSX.Element

export const useEnumSwitch: <T>(
  value: Observable<T>,
  onValue: T,
  offValue: T
) => [ComponentFunction, () => void]
```

## Usage Examples

### Basic Usage
```tsx
import { $ } from 'woby'
import { Switch } from '@woby/wui'

const checked = $(false)

<Switch checked={checked} />
```

### Disabled Switch
```tsx
<Switch disabled checked={false} />
```

### Using useEnumSwitch Hook
```tsx
import { $ } from 'woby'
import { Switch, useEnumSwitch } from '@woby/wui'

const theme = $('light') // 'light' | 'dark'

const [ThemeSwitch] = useEnumSwitch(theme, 'dark', 'light')

<ThemeSwitch />
```

## Accessibility

The Switch component follows accessibility best practices:
- Proper ARIA attributes (role="switch", aria-checked)
- Keyboard navigation support (Space/Enter to toggle)
- Focus management with visible focus indicator
- Sufficient color contrast
- Proper labeling through adjacent text
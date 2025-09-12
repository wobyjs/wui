# TextField API

## Import

```tsx
import { TextField } from '@woby/wui'
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| value | `Observable<string> \| string` | - | The value of the input field |
| placeholder | `string` | `"Placeholder Text"` | Placeholder text to display when empty |
| type | `string` | `"text"` | The type of input (text, password, email, etc.) |
| disabled | `boolean` | `false` | If `true`, the input will be disabled |
| children | `JSX.Child` | - | Additional content to render inside the field |
| class | `string \| string[] \| { [key: string]: boolean }` | - | Additional CSS classes to apply to the container |
| assignOnEnter | `Observable<boolean> \| boolean` | - | If `true`, value is committed on Enter key press |
| effect | `string` | - | Custom CSS classes for styling effects |
| onChange | `EventHandler<HTMLInputElement>` | - | Callback fired when the input value changes |
| onKeyUp | `EventHandler<HTMLInputElement>` | - | Callback fired when a key is released |
| ... | `JSX.InputHTMLAttributes<HTMLInputElement>` | - | All other standard input attributes |

## Subcomponents

### StartAdornment
```tsx
import { StartAdornment } from '@woby/wui'
```

### EndAdornment
```tsx
import { EndAdornment } from '@woby/wui'
```

## CSS Classes

### Default Effect (effect19a)
The default styling effect uses the following CSS classes:
```css
/* Container */
relative

/* Input */
w-full pt-4 pb-1 px-0 text-base border-0 border-b-2 border-gray-300 
outline-0 bg-transparent transition-colors duration-200 ease-out
focus:border-blue-500
[&:not(:placeholder-shown)]:pt-5 [&:not(:placeholder-shown)]:pb-0
[&:not(:placeholder-shown)]:border-t-0

/* Label (generated via JS) */
absolute top-4 left-0 pointer-events-none 
text-gray-500 transition-all duration-200 ease-out
[.woby-wui-input:focus+span>&]:top-0 [.woby-wui-input:focus+span>&]:text-xs
[.woby-wui-input:not(:placeholder-shown)+span>&]:top-0 [.woby-wui-input:not(:placeholder-shown)+span>&]:text-xs
```

## TypeScript Definitions

```tsx
type TextFieldProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  children?: JSX.Child
  effect?: JSX.Class
  assignOnEnter?: ObservableMaybe<boolean>
}

export const TextField: (props: TextFieldProps) => JSX.Element

export const StartAdornment: ComponentFunction
export const EndAdornment: ComponentFunction
```

## Usage Examples

### Basic Usage
```tsx
import { $ } from 'woby'
import { TextField } from '@woby/wui'

const value = $('')

<TextField value={value} placeholder="Enter text" />
```

### Password Field
```tsx
import { $ } from 'woby'
import { TextField } from '@woby/wui'

const password = $('')

<TextField value={password} type="password" placeholder="Enter password" />
```

### TextField with Adornments
```tsx
import { $ } from 'woby'
import { TextField, StartAdornment, EndAdornment } from '@woby/wui'

const value = $('')

<TextField value={value} placeholder="Search...">
  <StartAdornment>
    <svg>...</svg>
  </StartAdornment>
  <EndAdornment>
    <button>Clear</button>
  </EndAdornment>
</TextField>
```

## Accessibility

The TextField component follows accessibility best practices:
- Proper labeling through placeholder text
- Keyboard navigation support
- Focus management
- ARIA attributes where appropriate
- Sufficient color contrast
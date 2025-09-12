# Styling Components

woby-wui components are styled using Tailwind CSS classes. This guide explains how to customize the appearance of components.

## Basic Styling

All components accept a `class` prop for adding custom styles:

```tsx
import { Button } from '@woby/wui'

// Add custom classes
<Button class="bg-red-500 hover:bg-red-700 text-white">
  Red Button
</Button>

// Multiple classes as array
<Button class={['bg-blue-500', 'text-white', 'rounded-lg']}>
  Blue Button
</Button>

// Conditional classes
<Button class={() => ['bg-blue-500', isActive() ? 'ring-2' : '']}>
  Conditional Button
</Button>
```

## Overriding Default Styles

Components come with default styling that can be overridden:

```tsx
import { TextField } from '@woby/wui'

// Override default styling
<TextField 
  class="border-2 border-green-500 rounded-lg"
  placeholder="Custom styled field"
/>
```

## Using Tailwind CSS Directives

You can use all Tailwind CSS utility classes with woby-wui components:

```tsx
import { Card } from '@woby/wui'

<Card class="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl">
  <h2 class="text-2xl font-bold mb-2">Gradient Card</h2>
  <p class="mb-4">This card uses gradient background and shadow.</p>
  <Button class="bg-white text-purple-500 hover:bg-gray-100">
    Get Started
  </Button>
</Card>
```

## Responsive Design

Use Tailwind's responsive prefixes to create responsive designs:

```tsx
import { Button } from '@woby/wui'

<Button class="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white">
  Responsive Button
</Button>
```

## Dark Mode

Tailwind CSS supports dark mode variants:

```tsx
import { Switch } from '@woby/wui'

<Switch class="dark:bg-gray-700 dark:checked:bg-blue-500" />
```

## Component-Specific Styling

### TextField Effects

TextField components can use different styling effects:

```tsx
import { TextField } from '@woby/wui'
import * as preset from '@woby/wui/TextField.effect'

// Use predefined effects
<TextField effect={preset.effect1} value={value} />

// Create custom effects
const customEffect = `
  border-2 border-indigo-500 rounded-lg px-4 py-2
  focus:outline-none focus:ring-2 focus:ring-indigo-300
  placeholder-indigo-300
`

<TextField effect={customEffect} value={value} />
```

### Switch Effects

Switch components also support different styling effects:

```tsx
import { Switch } from '@woby/wui'
import * as spreset from '@woby/wui/Switch.effect'

// Use predefined effects
<Switch class={spreset.switch1} checked={checked} />

// Create custom switch styling
const customSwitch = `
  w-12 h-6 bg-gray-300 rounded-full relative
  checked:bg-green-500 transition-colors
  [&::after]:content-[''] [&::after]:absolute [&::after]:top-1 [&::after]:left-1
  [&::after]:w-4 [&::after]:h-4 [&::after]:bg-white [&::after]:rounded-full
  [&:checked::after]:left-7 transition-all
`

<Switch class={customSwitch} checked={checked} />
```

## CSS Modules

If you're using CSS modules, you can still style components:

```tsx
import { Button } from '@woby/wui'
import styles from './MyComponent.module.css'

<Button class={styles.customButton}>
  Styled with CSS Modules
</Button>
```

## Custom CSS

For more complex styling, you can use custom CSS:

```css
/* MyComponent.css */
.custom-button {
  background: linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%);
  border: 0;
  border-radius: 3px;
  color: white;
  height: 48px;
  padding: 0 30px;
  box-shadow: 0 3px 5px 2px rgba(255, 105, 135, .3);
}
```

```tsx
import { Button } from '@woby/wui'
import './MyComponent.css'

<Button class="custom-button">
  Custom CSS Button
</Button>
```

## Best Practices

1. **Use Tailwind Utility Classes**: Prefer Tailwind classes over custom CSS when possible
2. **Leverage Component Defaults**: Use default styling as a starting point
3. **Maintain Consistency**: Keep styling consistent across your application
4. **Consider Responsiveness**: Use responsive classes for different screen sizes
5. **Test Dark Mode**: Ensure your custom styles work in dark mode if supported

## Advanced Styling Techniques

### Dynamic Classes with Observables

```tsx
import { Button } from '@woby/wui'

const isActive = $(false)

<Button 
  class={() => [
    'px-4 py-2 rounded',
    isActive() ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
  ]}
>
  Toggle Button
</Button>
```

### Using woby-styled

For more advanced styling, you can use the `tw` function from woby-styled:

```tsx
import { tw } from '@woby/styled'
import { Button } from '@woby/wui'

const StyledButton = tw(Button)`bg-purple-500 hover:bg-purple-700 text-white`

<StyledButton>Styled with woby-styled</StyledButton>
```

This approach creates a new component with the specified styles applied.
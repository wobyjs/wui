# Working with Observables

@woby/wui is designed to work seamlessly with Woby observables, providing reactive updates to your UI components.

## What are Observables?

Observables in Woby are reactive values that automatically update the UI when they change. They are created using the `$` function:

```tsx
import { $, $$ } from 'woby'

// Create an observable
const count = $(0)

// Read the value
console.log($$(count)) // 0

// Update the value
count(1)
console.log($$(count)) // 1
```

## Using Observables with Components

Most @woby/wui components that accept value props can work directly with observables:

### TextField with Observable

```tsx
import { $ } from 'woby'
import { TextField } from '@woby/wui'

const inputValue = $('')

// Pass observable directly
<TextField value={inputValue} placeholder="Enter text" />

// The component will automatically update when inputValue changes
```

### Switch with Observable

```tsx
import { $ } from 'woby'
import { Switch } from '@woby/wui'

const isChecked = $(false)

<Switch checked={isChecked} />

// Toggle the switch programmatically
isChecked(true) // Switch will automatically update
```

### Button with Observable Action

```tsx
import { $ } from 'woby'
import { Button } from '@woby/wui'

const count = $(0)

<Button onClick={() => count(count() + 1)}>
  Count: {count}
</Button>
```

## Reading Observable Values

Use the `$$` function to read the current value of an observable:

```tsx
import { $, $$ } from 'woby'

const name = $('John')

// Read the value
const currentName = $$(name) // 'John'

// Use in conditional rendering
const isVisible = $(true)

{isVisible() && <div>Hello, {$$(name)}!</div>}
```

## Observable Arrays

Working with arrays of observables:

```tsx
import { $, $$ } from 'woby'

const items = $([])

// Add items
const addItem = (item) => {
  items([...$$(items), item])
}

// Remove items
const removeItem = (index) => {
  const newItems = [...$$(items)]
  newItems.splice(index, 1)
  items(newItems)
}

// Render list
{() => $$(items).map((item, index) => (
  <div key={index}>
    {item}
    <button onClick={() => removeItem(index)}>Remove</button>
  </div>
))}
```

## Computed Observables

Create computed values based on other observables:

```tsx
import { $, $$ } from 'woby'

const firstName = $('John')
const lastName = $('Doe')

// Computed observable
const fullName = () => $$(firstName) + ' ' + $$(lastName)

// Use in component
<div>Hello, {fullName}!</div>
```

## useEffect with Observables

Use `useEffect` to perform side effects when observables change:

```tsx
import { $, useEffect } from 'woby'

const count = $(0)

// Effect runs when count changes
useEffect(() => {
  console.log('Count changed to:', $$(count))
})
```

## Observable Best Practices

### 1. Avoid Direct Mutation

```tsx
// ❌ Don't mutate arrays directly
const items = $([])
items().push('new item') // This won't trigger updates

// ✅ Create a new array
items([...$$(items), 'new item']) // This will trigger updates
```

### 2. Use Functions for Complex Updates

```tsx
const items = $([])

// Good: Function to update
const addItem = (item) => {
  items([...$$(items), item])
}

// Better: Function that returns a new value
const addItem = (item) => items((prev) => [...prev, item])
```

### 3. Clean Up Effects

```tsx
import { useEffect } from 'woby'

useEffect(() => {
  const timer = setInterval(() => {
    // Do something
  }, 1000)
  
  // Cleanup function
  return () => clearInterval(timer)
})
```

## Working with Forms

### Controlled Components

```tsx
import { $ } from 'woby'
import { TextField, Button } from '@woby/wui'

const FormExample = () => {
  const name = $('')
  const email = $('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({
      name: $$(name),
      email: $$(email)
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <TextField 
        value={name}
        placeholder="Name"
      />
      <TextField 
        value={email}
        type="email"
        placeholder="Email"
      />
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Validation with Observables

```tsx
import { $ } from 'woby'
import { TextField } from '@woby/wui'

const FormWithValidation = () => {
  const email = $('')
  
  // Computed validation
  const isValidEmail = () => {
    const value = $$(email)
    return value.includes('@') && value.includes('.')
  }
  
  return (
    <div>
      <TextField 
        value={email}
        placeholder="Email"
        class={() => [
          'border-2',
          isValidEmail() ? 'border-green-500' : 'border-red-500'
        ]}
      />
      {!isValidEmail() && (
        <p class="text-red-500 text-sm">Please enter a valid email</p>
      )}
    </div>
  )
}
```

## Performance Considerations

### Memoization

For expensive computations, consider memoizing:

```tsx
import { $, useMemo } from 'woby'

const items = $([])

// Memoized computation
const expensiveResult = useMemo(() => {
  // Expensive operation
  return $$(items).map(item => processItem(item))
}, [items])
```

### Conditional Rendering

Use observables for efficient conditional rendering:

```tsx
import { $ } from 'woby'

const isLoading = $(false)

{() => $$(isLoading) ? (
  <div>Loading...</div>
) : (
  <div>Content</div>
)}
```

## Debugging Observables

### Logging Changes

```tsx
import { $, useEffect } from 'woby'

const value = $('initial')

useEffect(() => {
  console.log('Value changed to:', $$(value))
})
```

### Using DevTools

Woby provides devtools for debugging observables in development mode.

## Common Patterns

### Toggle State

```tsx
import { $ } from 'woby'

const isOpen = $(false)

const toggle = () => isOpen(!$$(isOpen))
```

### Counter

```tsx
import { $ } from 'woby'

const count = $(0)

const increment = () => count($$(count) + 1)
const decrement = () => count($$(count) - 1)
const reset = () => count(0)
```

### Form State Management

```tsx
import { $ } from 'woby'

const formState = $({
  name: '',
  email: '',
  age: 0
})

const updateField = (field, value) => {
  formState(prev => ({
    ...prev,
    [field]: value
  }))
}
```

By understanding and leveraging observables effectively, you can create highly reactive and efficient user interfaces with @woby/wui.
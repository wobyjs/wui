# Getting Started

This guide will help you create your first application using @woby/wui components.

## Prerequisites

Make sure you have completed the [Installation](./installation.md) guide before proceeding.

## Creating Your First Component

Let's create a simple counter application using @woby/wui components:

```tsx
import { render, $ } from 'woby'
import { Button, Card, Typography } from '@woby/wui'

const App = () => {
  const count = $(0)
  
  return (
    <Card class="p-6 max-w-md mx-auto mt-10">
      <h1 class="text-2xl font-bold mb-4">Counter App</h1>
      <p class="text-lg mb-6">Count: {count}</p>
      <div class="flex gap-2">
        <Button onClick={() => count(count() + 1)}>
          Increment
        </Button>
        <Button onClick={() => count(count() - 1)}>
          Decrement
        </Button>
        <Button onClick={() => count(0)}>
          Reset
        </Button>
      </div>
    </Card>
  )
}

render(<App />, document.getElementById('app'))
```

## Understanding the Components

### Observables

@woby/wui works seamlessly with Woby observables. In the example above, `count` is an observable that automatically updates the UI when its value changes.

### Styling

All components accept a `class` prop for custom styling using Tailwind CSS classes:

```tsx
<Button class="bg-blue-500 hover:bg-blue-700 text-white">
  Styled Button
</Button>
```

## Building a Form Example

Let's create a simple form using various @woby/wui components:

```tsx
import { render, $ } from 'woby'
import { 
  TextField, 
  Button, 
  Switch, 
  Checkbox,
  Card 
} from '@woby/wui'

const FormExample = () => {
  const name = $('')
  const email = $('')
  const subscribe = $(false)
  const agreeToTerms = $(false)
  
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log({
      name: $$(name),
      email: $$(email),
      subscribe: $$(subscribe),
      agreeToTerms: $$(agreeToTerms)
    })
  }
  
  return (
    <Card class="p-6 max-w-md mx-auto mt-10">
      <h1 class="text-2xl font-bold mb-4">User Registration</h1>
      <form onSubmit={handleSubmit}>
        <TextField 
          value={name}
          placeholder="Full Name"
          class="mb-4"
        />
        
        <TextField 
          value={email}
          type="email"
          placeholder="Email Address"
          class="mb-4"
        />
        
        <div class="flex items-center mb-4">
          <Switch checked={subscribe} />
          <span class="ml-2">Subscribe to newsletter</span>
        </div>
        
        <div class="flex items-center mb-6">
          <Checkbox checked={agreeToTerms} />
          <span class="ml-2">I agree to the terms and conditions</span>
        </div>
        
        <Button type="submit" class="w-full">
          Register
        </Button>
      </form>
    </Card>
  )
}

render(<FormExample />, document.getElementById('app'))
```

## Component Composition

@woby/wui components are designed to work well together. You can easily compose complex UIs by combining different components:

```tsx
import { render, $ } from 'woby'
import { 
  Appbar,
  Toolbar,
  IconButton,
  Button,
  SideBar,
  MenuText,
  MenuItem
} from '@woby/wui'

const AppWithLayout = () => {
  const menuOpen = $(false)
  
  return (
    <div>
      <Appbar>
        <Toolbar>
          <IconButton onClick={() => menuOpen(!menuOpen())}>
            <svg>...</svg>
          </IconButton>
          <div class="flex-grow text-xl font-bold">My App</div>
          <Button>Login</Button>
        </Toolbar>
      </Appbar>
      
      <SideBar open={menuOpen} width="250px">
        <MenuItem>
          <svg>...</svg>
          <MenuText>Dashboard</MenuText>
        </MenuItem>
        <MenuItem>
          <svg>...</svg>
          <MenuText>Settings</MenuText>
        </MenuItem>
      </SideBar>
      
      <main class="pt-16 p-4">
        <p>Your content here...</p>
      </main>
    </div>
  )
}

render(<AppWithLayout />, document.getElementById('app'))
```

## Next Steps

- Explore the [Components](../components/README.md) documentation to learn about all available components
- Check out the [API Reference](../api/README.md) for detailed information about component props and methods
- Learn about [Styling Components](./styling.md) to customize the appearance of your UI
- Read about [Working with Observables](./observables.md) to understand how reactivity works in @woby/wui
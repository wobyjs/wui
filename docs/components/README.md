# Components

@woby/wui provides a comprehensive set of UI components built for the Woby framework. All components are designed to be lightweight, customizable, and easy to use.

## Available Components

### Form Components
- [TextField](./TextField.md) - Input field with floating label ([API](../api/TextField.md))
- [TextArea](./TextArea.md) - Multi-line text input
- [NumberField](./NumberField.md) - Numeric input field
- [Checkbox](./Checkbox.md) - Checkbox input
- [Switch](./Switch.md) - Toggle switch ([API](../api/Switch.md))
- [ToggleButton](./ToggleButton.md) - Toggle button

### Button Components
- [Button](./Button.md) - Versatile button component ([API](../api/Button.md))
- [IconButton](./IconButton.md) - Icon-only button
- [Fab](./Fab.md) - Floating action button

### Layout Components
- [Appbar](./Appbar.md) - Application bar
- [Toolbar](./Toolbar.md) - Toolbar container
- [Card](./Card.md) - Content container
- [Paper](./Paper.md) - Elevated surface
- [SideBar](./SideBar.md) - Navigation sidebar

### Data Display Components
- [Avatar](./Avatar.md) - User profile image
- [Badge](./Badge.md) - Status indicator
- [Chip](./Chip.md) - Compact element for actions or categories

### Navigation Components
- [Tabs](./Tabs.md) - Tabbed interface

### Utility Components
- [Collapse](./Collapse.md) - Collapsible content container
- [Zoomable](./Zoomable.md) - Zoomable image component

### Editor Components
- [Editor](./Editor.md) - Rich text editor

### Wheeler Components
- [Wheeler](./Wheeler.md) - Wheel selector component
- [DateTimeWheeler](./DateTimeWheeler.md) - Date/time wheel selector
- [MultiWheeler](./MultiWheeler.md) - Multi-wheel selector

## Component API Structure

All components follow a consistent API pattern:

1. **Props**: Each component accepts standard HTML attributes plus custom props
2. **Styling**: All components support Tailwind CSS classes via the `class` prop
3. **Observables**: Components work seamlessly with Woby observables for reactive updates
4. **Customization**: Components can be customized through props and CSS classes

For detailed API documentation, see the [API Reference](../api/README.md) section.
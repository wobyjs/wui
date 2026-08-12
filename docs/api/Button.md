# 🧩 Button API

The **Button API** describes all available props, behaviors, interactions, and internal logic for the `Button` component.  
This defines how the component works in both **TSX** and **Web Component (`<wui-button>`)** modes.

---

# 📦 Import

### TSX
```tsx
import { Button } from './Button'
```

### Web Component
```ts
import './Button'   // registers <wui-button>
```

---

# 🧭 Props Overview

Below is the complete list of supported props for both TSX and HTML usage.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **type** | `"text" \| "contained" \| "outlined" \| "icon" \| "custom"` | `"contained"` | Controls the visual variant |
| **buttonFunction** | `"button" \| "submit" \| "reset"` | `"button"` | Maps to the native HTML button `type` attribute |
| **checked** | `Observable<boolean> \| boolean` | `false` | Toggles automatically on click if observable |
| **disabled** | `Observable<boolean> \| boolean` | `false` | Disables the button and updates styling |
| **cls** | `JSX.Class` | `""` | **Overrides** the default `variant` class when non-empty |
| **class** | `JSX.Class` | `""` | **Appends** additional classes on top of the resolved class |
| **children** | `JSX.Child` | `"Button"` | Inner label or icon |
| **onClick** | `(e: MouseEvent) => void` | `undefined` | Runs before internal toggle behavior |
| **...otherProps** | `JSX.ButtonHTMLAttributes<HTMLButtonElement>` | — | Any native HTML `<button>` attributes |

> **Class override contract:** `cls` is the **primary class** — when non-empty it fully replaces the built-in variant class. `class` (aliased `cn` internally) **appends/pads** extra classes on top of whatever was resolved.

---

# ⚙️ Behavior & Internal Logic

## 🔄 Checked Toggle

If the `checked` prop is a Woby observable, the value toggles each time the button is clicked:

```ts
checked(!$$(checked))
```

This toggle happens **after** your custom `onClick` handler runs.

---

## 🛑 Event Propagation Control

The component calls:

```ts
e.stopImmediatePropagation()
```

This prevents duplicate click events—especially important inside nested interactive containers.

---

## 🧩 Children Resolution

The button supports:

- JSX children
- Web component text via `children="..."`
- Web component `<slot>` text

Web Component slot extraction:

```ts
slot.assignedNodes().map(n => n.textContent).join('')
```

---

# 🎨 Visual Variants

The button uses Tailwind-style utility classes for styling.

### **contained**
- Filled background  
- High emphasis  
- White text  
- Hover & active elevation  

### **text**
- Transparent background  
- Low emphasis  
- Subtle hover effect  

### **outlined**
- Border  
- Medium emphasis  
- Blue text & border  

### **icon**
- Circular  
- Icon-only  
- Hover background  

### **custom**
- No built-in styling  
- Developer controls all visuals using `cls`

---

# 🔤 TypeScript Definition

```ts
type ButtonStyles = "text" | "contained" | "outlined" | "icon" | "custom";
type ButtonFunction = "button" | "submit" | "reset";
```

Web Component registration:

```ts
customElement('wui-button', Button)
```

---

# 🧩 Render Structure

```tsx
<button
    ref={btnRef}
    type={() => $$(buttonFunction) as ButtonFunction}
    disabled={disabled}
    class={() => [
        () => $$(cls) ? $$(cls) : variant[$$(buttonType)], cn
    ]}
    {...otherProps}
>
    {children}
</button>
```

---

# 🧪 Usage Examples

## TSX
```tsx
<Button
    type="contained"
    cls="px-3 py-2"
    onClick={() => console.log('clicked')}
>
    Save
</Button>
```

## HTML
```html
<wui-button
    type="contained"
    cls="px-3 py-2"
    children="Save"
></wui-button>
```

---

# ♿ Accessibility

- Uses native `<button>` semantics  
- Keyboard activation supported (`Enter`, `Space`)  
- Proper disabled behavior across TSX + HTML  
- Slot content is handled correctly for screen readers  
- Good contrast in contained/outlined variants  

---

# 📝 Summary

The Button component is:

- **Consistent** — same API across TSX & HTML  
- **Reactive** — supports Woby observable props  
- **Customizable** — extend styles using `cls` / `class`  
- **Accessible** — fully keyboard-friendly  
- **Flexible** — supports text, outlined, contained, icon, and custom modes
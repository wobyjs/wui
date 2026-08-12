# ToggleButton API

The **ToggleButton API** describes the props, toggle logic, visual state management, and rendering rules for the binary toggle button component. It supports checked/unchecked states with customisable on/off colour classes, and works as either a controlled or uncontrolled component.

---

## Import

### TSX

```tsx
import { ToggleButton } from "./ToggleButton";
```

### Web Component

```ts
import "./ToggleButton"; // registers <wui-toggle-button>
```

---

## Props Overview

| Prop          | Type                       | Default | Description                                              |
| ------------- | -------------------------- | ------- | -------------------------------------------------------- |
| **children**  | `JSX.Child`                | `""`    | Content rendered inside the button                       |
| **checked**   | `boolean` (observable)     | `false` | Toggle state; observable for two-way binding             |
| **onClass**   | `string`                   | `"text-[#1976d2] bg-[#1976d2]/10 border-[#1976d2]/50 hover:bg-[#1976d2]/20"` | Classes applied when checked |
| **offClass**  | `string`                   | `"text-gray-600 bg-transparent border-transparent hover:bg-gray-100"` | Classes applied when unchecked |
| **disabled**  | `boolean` (observable)     | `false` | Disables interaction                                     |
| **cls**       | `string`                   | `""`    | Override default classes                                 |
| **class**     | `string`                   | `""`    | Additional classes appended to the default               |
| **onClick**   | `(e: MouseEvent) => void`  | —       | Custom click handler, fires before the internal toggle   |

---

## Internal Logic

### Toggle Mechanism

The `handleClick` function manages the toggle cycle:

1. The user-provided `onClick` handler fires first (if defined).
2. If `checked` is an observable, it is toggled: `checked((c) => !c)`.
3. If `checked` is a static boolean, no mutation occurs — the component is effectively controlled externally.

```ts
const handleClick = (e: MouseEvent) => {
    onClick?.(e)
    if (isObservable(checked)) {
        checked((c) => !c)
    }
}
```

### Visual State

The current `checked` value determines which class set is applied:

- **Checked**: `onClass` — a coloured style (default: blue text/background/border).
- **Unchecked**: `offClass` — a muted style (default: grey text, transparent background).

The class composition is:

```
[baseStyles, () => ($$(checked) ? $$(onClass) : $$(offClass)), () => $$(cls) ? $$(cls) : "", cn]
```

### Base Styles

```
inline-flex items-center justify-center px-2 py-1 rounded text-sm
cursor-pointer select-none transition-colors duration-150 border border-transparent
```

---

## Rendering Behavior

```tsx
<button
    type="button"
    onClick={handleClick}
    aria-pressed={() => ($$(checked) ? "true" : "false")}
    class={[
        baseStyles,
        () => ($$(checked) ? $$(onClass) : $$(offClass)),
        () => $$(cls) ? $$(cls) : "",
        cn,
    ]}
    {...otherProps}
>
    {children}
</button>
```

- **type="button"** prevents default form submission behaviour.
- **aria-pressed** is set reactively to `"true"` or `"false"` based on the `checked` state.
- **class** is composed from base styles, the on/off variant, optional `cls` override, and `class` append.
- **disabled** is not applied directly in the template; pass it via `...otherProps` for native button disabled behaviour.

---

## Event Handling

- **onClick**: Fires on every click. The user-provided handler fires first, then the internal toggle runs.
- **Internal toggle**: Only toggles the `checked` observable if it is a writable observable (checked via `isObservable`). Static boolean values are not mutated.
- **No stopPropagation**: The click event propagates normally, allowing parent listeners to react.

---

## Usage Examples

### TSX

```tsx
import { ToggleButton } from "./ToggleButton";
import { $ } from "woby";

const isSelected = $(false);

<ToggleButton checked={isSelected} onClick={() => console.log("toggled")}>
    Bold
</ToggleButton>
```

### Custom On/Off Colours

```tsx
<ToggleButton
    checked={isSelected}
    onClass="text-green-600 bg-green-100 border-green-300"
    offClass="text-gray-400 bg-white border-gray-200"
>
    Active
</ToggleButton>
```

### HTML (Web Component)

```html
<wui-toggle-button id="tog">Bold</wui-toggle-button>

<script>
    const tog = document.getElementById("tog");
    tog.props.checked = true;
    tog.props.onClass = "text-green-600 bg-green-100 border-green-300";
    tog.props.offClass = "text-gray-400 bg-transparent border-transparent";
</script>
```

---

## Accessibility

- Renders as a native `<button>` with `type="button"` — keyboard-focusable and screen-reader compatible.
- **aria-pressed** is set reactively to `"true"` or `"false"`, correctly communicating the toggle state to assistive technology.
- The `disabled` prop (passed via `...otherProps`) prevents focus and interaction natively.
- The `select-none` utility prevents text selection during rapid clicking.

---

## Summary

The ToggleButton component provides:

- Binary toggle state driven by an observable
- Customisable on/off colour classes via `onClass` and `offClass`
- Controlled or uncontrolled usage (static `checked` = external control only)
- User-provided `onClick` handler that fires before the internal toggle
- Proper `aria-pressed` accessibility attribute
- Full styling control via `cls` / `class`
- Works in TSX and Web Component usage
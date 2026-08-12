# TextArea API

The **TextArea API** describes the props, effect system, resize behavior, and rendering logic for the multi-line text input component. It shares the same 24 visual effects as `TextField` and supports both real-time and enter-to-commit value modes.

---

## Import

### TSX

```tsx
import { TextArea } from "./TextArea";
```

### Web Component

```ts
import "./TextArea"; // registers <wui-text-area>
```

---

## Props Overview

| Prop              | Type                       | Default       | Description                                          |
| ----------------- | -------------------------- | ------------- | ---------------------------------------------------- |
| **children**      | `JSX.Child`                | `null`        | Additional content rendered inside the wrapper       |
| **effect**        | `string` (observable)      | `"effect19a"` | Visual effect name from the TextField effect map     |
| **assignOnEnter** | `boolean` (observable)     | `false`       | `true` = commit value only on Enter; `false` = commit on every change |
| **value**         | `string` (observable)      | `""`          | Text value (primitive or observable)                 |
| **placeholder**   | `string` (observable)      | `""`          | Placeholder text (keep empty for floating-label effects) |
| **label**         | `string` (observable)      | `""`          | Optional floating label text (for label-based effects) |
| **resize**        | `"none" \| "horizontal" \| "vertical" \| "both"` | `"none"` | CSS resize direction for the `<textarea>` element |
| **cls**           | `string`                   | `""`          | Override default classes                             |
| **class**         | `string`                   | `""`          | Additional classes appended to the default           |
| **onChange**      | `(e: Event) => void`       | —             | Callback fired on change or commit                   |
| **onKeyUp**       | `(e: KeyboardEvent) => void` | —           | Callback fired on key up                             |

---

## Internal Logic

### Value Commit Strategy

The component supports two commit modes, controlled by `assignOnEnter`:

**Immediate mode** (`assignOnEnter = false`, default):

- On every `onChange` event, the current value is written to the observable.
- On every `onKeyUp` event, the current value is written to the observable.
- The `onChange` callback fires after the observable is updated.

**Enter mode** (`assignOnEnter = true`):

- `onChange` and `onKeyUp` do **not** write to the observable by default.
- When the `Enter` key is pressed (`e.key === "Enter"`), the value is committed to the observable and both `onChange` and `onKeyUp` fire.
- This mode is useful for search fields or inputs where intermediate values should not trigger reactive side effects.

### Commit Helper

```ts
const commitValue = (e: any) => {
    if (isObservable(value)) {
        (value as Observable<string>)(e.target.value)
    }
}
```

The observable is only written to when it is a true observable (not a static value).

### Effect Styles

The `effect` prop maps to a class string from the `effectMap` (shared with `TextField`). The effect is applied to the `<textarea>` element itself, while the adjacent `<span class="focus-border focus-bg">` provides the decorative underline/border elements.

### Resize

The `resize` prop is converted to both a CSS `resize` value and a Tailwind utility class:

| Prop Value    | CSS `resize`  | Tailwind Class   |
| ------------- | ------------- | ---------------- |
| `"none"`      | `none`        | `resize-none`    |
| `"horizontal"`| `horizontal`  | `resize-x`       |
| `"vertical"`  | `vertical`    | `resize-y`       |
| `"both"`      | `both`        | `resize`         |

---

## Rendering Behavior

```tsx
<div class={() => [baseClass, () => $$(cls) ? $$(cls) : "", cn]}>
    <textarea
        style={() => ({ resize: resizeValue })}
        class={() => [effectStyle, resizeStyle, "block bg-transparent size-full"]}
        placeholder={placeholder}
        value={value}
        onChange={...}
        onKeyUp={...}
    />
    <span class="focus-border focus-bg pointer-events-none">
        <i></i>
    </span>
    {() => $$(label) ? <label class="pointer-events-none">{label}</label> : null}
    {children}
</div>
```

- **Wrapper**: `relative size-fit` — positions the effect span/label, allows overflow for floating label.
- **Textarea**: `block bg-transparent size-full` — fills the wrapper, with effect classes applied for visual styling.
- **Effect span**: A `pointer-events-none` `<span>` with `<i></i>` child, styled by the effect CSS to render underline, border, or fill animations.
- **Label**: Conditionally rendered when `label` is truthy; floats above the textarea when combined with a label-based effect.
- **Children**: Rendered last, allowing additional elements (e.g. helper text, character counters) to be appended inside the wrapper.

---

## Effect Map

The following effects are available, shared with `TextField`. They are grouped by visual style:

### Underline Effects
| ID          | Description                      |
| ----------- | -------------------------------- |
| `effect1`   | Center-out underline             |
| `effect2`   | Left-to-right underline          |
| `effect3`   | Split center-out underline       |

### Box Effects
| ID          | Description                      |
| ----------- | -------------------------------- |
| `effect4`   | Bottom-up fill border            |
| `effect5`   | Left-to-right fill border        |
| `effect6`   | Right-to-left fill border        |

### Outline Effects
| ID          | Description                      |
| ----------- | -------------------------------- |
| `effect7`   | Center-out split outline         |
| `effect8`   | Corner-to-corner outline         |
| `effect9`   | Snake/chasing outline            |

### Fill Effects
| ID          | Description                      |
| ----------- | -------------------------------- |
| `effect10`  | Fade in fill                     |
| `effect11`  | Left-to-right fill               |
| `effect12`  | Center-out fill                  |
| `effect13`  | Split center-out fill            |
| `effect14`  | Diagonal split fill              |
| `effect15`  | Center diamond fill              |

### Labeled Underline Effects (requires `label` prop)
| ID          | Description                      |
| ----------- | -------------------------------- |
| `effect16`  | Center-out underline w/ floating label |
| `effect17`  | Center-out (from left) w/ floating label |
| `effect18`  | Split center-out w/ floating label |

### Labeled Box Effects (requires `label` prop)
| ID          | Description                      |
| ----------- | -------------------------------- |
| `effect19`  | Split top/bottom border w/ floating label |
| `effect20`  | Clockwise border w/ floating label |
| `effect21`  | Snake border w/ floating label   |

### Labeled Fill Effects (requires `label` prop)
| ID          | Description                      |
| ----------- | -------------------------------- |
| `effect22`  | Fade in fill w/ floating label   |
| `effect23`  | Split fill w/ floating label     |
| `effect24`  | Diagonal fill w/ floating label  |

### Alternative Labeled Box Effects (label cuts border line)
| ID           | Description                      |
| ------------ | -------------------------------- |
| `effect19a`  | Split border, label cuts line    |
| `effect20a`  | Clockwise border, label cuts line|
| `effect21a`  | Snake border, label cuts line    |

---

## Event Handling

- **onChange**: Fires after the observable value is updated (immediate mode) or on Enter (enter mode). Receives the native `Event`.
- **onKeyUp**: Fires after the observable value is updated on each key press (immediate mode) or on Enter (enter mode). Receives the native `KeyboardEvent`.
- **Observable writes**: Only occur when `value` is a true observable (checked via `isObservable`). Static string values are never written to.

---

## Usage Examples

### TSX

```tsx
import { TextArea } from "./TextArea";
import { $ } from "woby";

const text = $("");

<TextArea
    value={text}
    placeholder="Type something..."
    effect="effect7"
    resize="vertical"
    assignOnEnter={false}
    onChange={(e) => console.log("changed", e.target.value)}
/>
```

### HTML (Web Component)

```html
<wui-text-area id="ta"></wui-text-area>

<script>
    const ta = document.getElementById("ta");
    ta.props.value = "Hello";
    ta.props.placeholder = "Enter text...";
    ta.props.effect = "effect19a";
    ta.props.resize = "both";
</script>
```

---

## Customising Effect Colors

Effect colours can be overridden via Tailwind arbitrary selectors targeting the adjacent `<span>` and `<i>` elements:

| Element               | Selector                                    |
| --------------------- | ------------------------------------------- |
| Top line              | `[&\~span]:before:bg-[#4caf50]`             |
| Bottom line           | `[&\~span]:after:bg-[#4caf50]`              |
| Left line             | `[&\~span_i]:before:bg-[#4caf50]`           |
| Right line            | `[&\~span_i]:after:bg-[#4caf50]`            |
| Fill colour           | `[&\~span]:bg-[#ededed]`                    |
| Fill colour (focused) | `[&:focus\~span]:bg-[#ededed]`              |
| Label text            | `[&\~label]:text-[red]`                     |
| Label text (focused)  | `[&:focus\~label]:text-[red]`               |
| Label text (filled)   | `[&:not(:placeholder-shown)~label]:text-[red]` |

---

## Accessibility

- Renders using a native `<textarea>` element, which is keyboard-focusable and supports screen reader navigation.
- The `placeholder` attribute provides accessible hints.
- The `label` element is rendered with `pointer-events-none` and is associated with the textarea via the floating-label effect layout.
- The effect span and label are marked `pointer-events-none` to avoid interfering with textarea interaction.

---

## Summary

The TextArea component provides:

- Multi-line text input with the same 24 visual effects as TextField
- Immediate or enter-to-commit value modes
- Configurable resize direction (none, horizontal, vertical, both)
- Reactive observable value binding
- Floating label support for label-based effects
- Full styling control via `cls` / `class` and effect colour overrides
- Works in TSX and Web Component usage
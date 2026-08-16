# 🧩 TextField API

This API describes the internal logic, props, reactive behavior, DOM structure, and effect resolution of the TextField component.

---

# 📦 Import

### TSX
```tsx
import { TextField, StartAdornment, EndAdornment } from './TextField'
```

### Web Component
```ts
import './TextField'   // registers <wui-text-field>, <wui-start-adornment>, <wui-end-adornment>
```

---

# 🧭 Props Overview

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **value** | string or Observable | `""` | Input value (observable for two-way binding) |
| **inputType** | `INPUT_TYPE` | `"text"` | Input type attribute (`text`, `password`, `email`, `number`, `tel`, `url`, `search`, `date`, `datetime-local`, `month`, `week`, `time`, `color`) |
| **placeholder** | string | `""` | Placeholder text |
| **label** | string | `""` | Floating label text |
| **disabled** | boolean | `false` | Disables input interaction |
| **effect** | string | `""` | Effect name from the 27 supported effects |
| **assignOnEnter** | boolean | `false` | When `true`, value is committed only on Enter key |
| **children** | JSX.Child | `null` | Rendered inside the field; used for `StartAdornment` / `EndAdornment` |
| **ref** | `(el: HTMLInputElement) => void` | — | Callback ref for the input element |
| **onChange** | `(e: Event) => void` | — | Input change callback |
| **onKeyUp** | `(e: KeyboardEvent) => void` | — | Key-up callback |
| **cls** | string | `""` | Override/extra classes |
| **class** | string | `""` | Append classes |
| **...otherProps** | HTMLAttributes | — | Passed to `<input>` |

---

# 🧩 Adornment Components

TextField uses `StartAdornment` and `EndAdornment` children in place of the previous `startIcon`/`endIcon` props.

### StartAdornment

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **children** | JSX.Child | `null` | Content rendered as leading adornment |
| **cls** | `JSX.Class` | `""` | Additional classes |
| **data-adnorment** | `string` | `"start"` | Side marker reflected onto the wrapper `<div>`; see below |

### EndAdornment

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **children** | JSX.Child | `null` | Content rendered as trailing adornment |
| **cls** | `JSX.Class` | `""` | Additional classes |
| **data-adnorment** | `string` | `"end"` | Side marker reflected onto the wrapper `<div>`; see below |

Adornments are identified by an internal `adornmentType` property set to `'start'` or `'end'`. The TextField's `children` are split by adornment type; unrecognized children are rendered in the middle slot alongside the input.

`data-adnorment` is the custom-element form of that same marker: `<wui-start-adornment>` / `<wui-end-adornment>` reach TextField as generic elements with no static `adornmentType`, so the side is read off this attribute instead. It is declared on the component's defaults so it reflects as an attribute, but it is pulled out of the props spread before rendering — the literal `data-adnorment="start"` / `"end"` on the wrapper always wins, and passing your own value does not flip an adornment to the other side.

---

# ⚙️ Value Logic

If an observable is passed:

```ts
value() → currentValue
value(newValue) → update
```

If a primitive is passed:

- TextField becomes controlled internally
- Only parent re-render changes the value

### commit Strategy

- **`assignOnEnter = false` (default)**: Value is committed on every `keyup` and `input` event.
- **`assignOnEnter = true`**: Value is committed only when the Enter key is pressed.

Native event handlers (`addEventListener`) are used instead of JSX event delegation for `keyup` and `input` to avoid shadow DOM retargeting issues where `e.target` would point to the shadow host instead of the input element.

---

# 🎛 Focus & Label Logic

TextField tracks focus via `inputRef` and renders a floating label when `label` is non-empty. Clicking the wrapper div calls `inputRef.focus()`.

---

# 🎨 Effect Resolution

Effects are stored in a lookup object:

```ts
effectMap = {
    effect1,   // Center-out underline
    effect2,   // Left-to-right underline
    effect3,   // Split center-out underline
    effect4,   // Bottom-up fill border
    effect5,   // Left-to-right fill border
    effect6,   // Right-to-left fill border
    effect7,   // Center-out split outline
    effect8,   // Corner-to-corner outline
    effect9,   // Snake/Chasing outline
    effect10,  // Fade in fill
    effect11,  // Left-to-right fill
    effect12,  // Center-out fill
    effect13,  // Split center-out fill
    effect14,  // Diagonal split fill
    effect15,  // Center diamond fill
    effect16,  // Center-out underline w/ floating label
    effect17,  // Center-out (from left) w/ floating label
    effect18,  // Split center-out w/ floating label
    effect19,  // Split top/bottom border w/ floating label
    effect20,  // Clockwise border w/ floating label
    effect21,  // Snake border w/ floating label
    effect22,  // Fade in fill w/ floating label
    effect23,  // Split fill w/ floating label
    effect24,  // Diagonal fill w/ floating label
    effect19a, // Split border, label cuts line
    effect20a, // Clockwise border, label cuts line
    effect21a, // Snake border, label cuts line
}
```

Then selected via:

```ts
activeEffect = effectMap[effectName] || defaultStyle
```

When `effect` is empty or unrecognized, the default input style `defaultStyle` is used (no animation).

---

# 📐 Rendering Structure

TextField outputs:

```tsx
<div class={[baseClass, cls, class]} tabIndex={-1} onFocus={handleFocus}>
    <div class="relative flex-1">
        <div class="relative flex items-center w-full gap-2">

            {startAdornments && (
                <div class="shrink-0 whitespace-nowrap text-[rgba(0,0,0,0.54)]">
                    {startAdornments}
                </div>
            )}

            <div class="relative flex-1 min-w-0">
                <input ref={inputRef} class={effectStyle}
                    value={value} disabled={disabled}
                    type={inputType} placeholder={placeholder} />

                <span class="focus-border focus-bg pointer-events-none"><i></i></span>

                {label && <label class="cursor-text">{label}</label>}
            </div>

            {endAdornments && (
                <div class="shrink-0 whitespace-nowrap text-[rgba(0,0,0,0.54)]">
                    {endAdornments}
                </div>
            )}

        </div>
    </div>
</div>
```

Key behaviors:

- `cls` overrides, `class` appends
- `tabIndex={-1}` on the wrapper div enables focus forwarding to the input
- The `<span>` element with `focus-border` / `focus-bg` is the effect animation container
- The label is conditionally rendered when `label` is non-empty

---

# 🔄 Events

TextField fires native events:

- **onChange** — Called on input events (when `assignOnEnter` is false and value is observable)
- **onKeyUp** — Called on keyup events (always, value committed based on `assignOnEnter`)

Both are attached via native `addEventListener` for shadow DOM compatibility. The JSX `onChange`/`onKeyUp` handlers only invoke the callback -- value-setting is handled by the native listener.

---

# 🧪 Usage Examples

### Simple
```tsx
<TextField label="Name" />
```

### With adornments
```tsx
<TextField label="Search">
    <StartAdornment>🔍</StartAdornment>
    <EndAdornment>
        <button onClick={() => alert('clear')}>✕</button>
    </EndAdornment>
</TextField>
```

### With effect
```tsx
<TextField effect="effect10" label="Search" />
```

### Commit on Enter
```tsx
const name = $('')
<TextField assignOnEnter value={name} label="Name (Enter to commit)" />
```

### HTML Usage
```html
<wui-text-field label="Name" placeholder="Enter name"></wui-text-field>

<wui-text-field label="With icons">
    <wui-start-adornment>🔍</wui-start-adornment>
</wui-text-field>
```

---

# ♿ Accessibility

- Uses native `<input>` — full screen reader support
- Floating label is visually connected (clickable via `cursor-text`)
- Disabled state blocks interaction and reduces opacity
- The wrapper is focusable (`tabIndex={-1}`) to forward focus to the input

---

# 📝 Summary

TextField provides:

- 27 animated effect variants
- Adornment system via `StartAdornment` / `EndAdornment` children
- Floating label system
- Observable-friendly two-way value binding
- Commit-on-enter mode via `assignOnEnter`
- Full TSX + Web Component compatibility
- Shadow DOM-safe event handling
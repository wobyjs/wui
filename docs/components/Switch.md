# 🧩 Switch Component

The **Switch** component is a customizable toggle control with support for multiple animated effects, text labels, observables, and full styling overrides.  
It can be used for settings, feature toggles, interactive demos, or any binary on/off action.  
Works in both **TSX** and **Web Component (`<wui-switch>`)** formats.

---

# 📌 Component Signature

### TSX

```tsx
<Switch effect="" checked={false} on="ON" off="OFF" cls=""></Switch>
```

### Web Component

```html
<wui-switch effect="" checked="false" on="ON" off="OFF" cls=""></wui-switch>
```

---

# ✨ Features

- **18 visual effects** (`effect1` → `effect18`)
- **5 style themes** (`ios`, `flat`, `skewed`, `flip`, `light`)
- Optional **on/off text labels**
- **Observable-friendly** `checked` state
- Automatically generated ID for accessible `<label for="">`
- Custom styling support via `cls`
- Fully interactive click/toggle behavior
- Works identically in TSX and HTML

---

# 🎨 Effect Descriptions

Below is a quick reference for all available switch effects.  
These describe the visual animation when toggling the switch.

### 🔢 Numbered Effects

| Effect       | Description                                              |
| ------------ | -------------------------------------------------------- |
| **effect1**  | Classic slide toggle with smooth left/right movement.    |
| **effect2**  | Quick slide with a sharper animation curve.              |
| **effect3**  | Elastic “bounce” toggle with slight overshoot.           |
| **effect4**  | Switch handle enlarges briefly during toggle.            |
| **effect5**  | 3D flip animation — switch rotates along its axis.       |
| **effect6**  | Smooth fade combined with a subtle slide.                |
| **effect7**  | Expanding ripple effect on toggle.                       |
| **effect8**  | Stretch-and-release animation (horizontal stretch).      |
| **effect9**  | Switch handle pops outward slightly on activation.       |
| **effect10** | Soft pulse glow when toggled.                            |
| **effect11** | Slide with tail-compression animation.                   |
| **effect12** | High-contrast snap animation with fast transitions.      |
| **effect13** | Springy toggle with overshoot and recoil.                |
| **effect14** | Vertical bounce animation (handle moves up/down).        |
| **effect15** | Tilt + slide animation (skews slightly).                 |
| **effect16** | “Magnetic” attraction animation when switching states.   |
| **effect17** | Smooth opacity fade combined with scale transition.      |
| **effect18** | Drag-like stretch animation mimicking a physical switch. |

---

### 🧁 Style Presets

| Preset     | Description                                             |
| ---------- | ------------------------------------------------------- |
| **ios**    | Apple-style sliding toggle with clean rounded movement. |
| **flat**   | Minimal flat design — no shadows, clean edges.          |
| **skewed** | Switch tilts diagonally during toggle.                  |
| **flip**   | Full flip animation using 3D rotation.                  |
| **light**  | Low-contrast, soft, lightweight toggle animation.       |

---

### 📌 Tip

Each effect is purely visual — it does not change behavior, logic, or accessibility.  
Switching effects is as simple as:

```tsx
<Switch effect="effect7" />
<Switch effect="ios" />
<Switch effect="flip" />
```

---

# 🔄 Checked / Unchecked State

### TSX

```tsx
const isOn = $(false)

<Switch checked={isOn} />
```

### HTML

```html
<wui-switch checked="true"></wui-switch>
```

If `checked` is observable, clicking the switch automatically updates the observable value.

---

# 🔤 On / Off Text Labels

```tsx
<Switch on="I" off="O" />
```

HTML:

```html
<wui-switch on="I" off="O"></wui-switch>
```

---

# 📦 Basic Usage

### Default

```tsx
<Switch />
```

### With observable

```tsx
const s = $(false)
<Switch checked={s} />
```

---

# ⚡ All Effect Demonstration

```tsx
<Switch effect="effect1" />
<Switch effect="effect2" />
...
<Switch effect="effect18" />
```

---

# 📱 Style Themes

```tsx
<Switch effect="ios" />
<Switch effect="flat" />
<Switch effect="skewed" />
<Switch effect="flip" />
<Switch effect="light" />
```

---

# 🎨 Custom Styling with `cls`

### Example

```tsx
<Switch effect="ios" cls="!scale-125 ![&>div]:bg-blue-500"></Switch>
```

### HTML

```html
<wui-switch effect="ios" cls="!scale-125 ![&>div]:bg-blue-500"></wui-switch>
```

---

# 🧩 Example Layout (Toggle All)

```tsx
const s1 = $(false)
const s2 = $(false)
const s3 = $(false)

<Button onClick={() => {
    const next = !s1()
    s1(next); s2(next); s3(next)
}}>
    Toggle All
</Button>

<div class="flex gap-4">
    <Switch effect="effect1" checked={s1} />
    <Switch effect="effect2" checked={s2} />
    <Switch effect="effect3" checked={s3} />
</div>
```

---

# 🧠 Notes

- Switch generates a unique ID using `nanoid(8)`
- `<input type="checkbox">` is hidden; `<label>` toggles it
- CSS animations are defined in external `Switch.effect` styles
- `checked` updates only if it is observable
- Internal structure includes: input + track div + thumb span + label wrapper

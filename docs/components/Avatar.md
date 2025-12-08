# 🧩 Avatar Component

The **Avatar** component displays a user image, initials, or custom content inside a shaped container.  
It supports multiple **shapes**, **sizes**, **image rendering**, and works in both **TSX** and **Web Component (`<wui-avatar>`)** modes.  
:contentReference[oaicite:0]{index=0}

---

# 📌 Component Signature

### TSX
```tsx
<Avatar
    src={null}
    alt="Avatar"
    size="md"
    type="circular"
    cls=""
>
    A
</Avatar>
```

### Web Component
```html
<wui-avatar
    src=""
    alt="Avatar"
    size="md"
    type="circular"
    cls=""
>
    A
</wui-avatar>
```

---

# ✨ Features

- Supports **image avatar**, **initials**, or **custom JSX**
- Multiple shape variants: **circular**, **rounded**, **square**
- Four responsive sizes: **xs**, **sm**, **md**, **lg**
- Works with **TSX children** or **HTML inner content**
- Automatically renders an `<img>` when `src` is provided  
- Custom styling through `cls`
- Provides graceful fallback initials when image is missing

---

# 🎨 Variants Overview

| Variant | Visual Style |
|--------|--------------|
| **circular** | Fully rounded, profile-style |
| **rounded** | Rounded corner
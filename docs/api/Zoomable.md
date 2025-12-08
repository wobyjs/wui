# 🧩 Zoomable API

This API explains internal logic, gesture handling, transform math, props, and lifecycle behavior of the Zoomable component.

---

# 📦 Import

### TSX

```tsx
import { Zoomable } from "./Zoomable";
```

````

### Web Component

```ts
import "./Zoomable"; // registers <wui-zoomable> and <wui-zoomable-img>
```

---

# 🧭 Props Overview

| Prop              | Type                 | Default                  | Description                |
| ----------------- | -------------------- | ------------------------ | -------------------------- |
| **scale**         | number or Observable | `1`                      | Current zoom scale         |
| **minScale**      | number               | `0.1`                    | Minimum allowed zoom       |
| **maxScale**      | number               | `10`                     | Maximum allowed zoom       |
| **children**      | JSX.Child            | Content to render & zoom |
| **cls**           | string               | `""`                     | Additional wrapper classes |
| **...otherProps** | HTMLAttributes\<div> | —                        | Passed to root element     |

---

# ⚙️ Overall Rendering Structure

Zoomable produces:

```tsx
<div class="zoomable-wrapper [cls]">
  <div class="zoomable-content">{children}</div>
</div>
```

Where:

- `zoomable-wrapper` receives pointer-type classes
- `zoomable-content` receives transform updates

---

# 🧮 Internal State

Zoomable maintains:

```ts
scaleInternal; // number or observable-backed value
position = { x, y }; // panning offset
pointers = Map(); // active pointer positions
containerSize; // width/height of wrapper
```

---

# ✋ Pointer Tracking Behavior

### On pointer down:

- Add pointer to tracking map
- Record initial positions

### On pointer move:

- If 1 pointer → **panning**
- If 2 pointers → **pinch zoom**

### On pointer up:

- Remove pointer from map
- Reset gesture state when last pointer removed

---

# 🤏 Pinch Zoom Logic

```ts
distance = sqrt((x2-x1)² + (y2-y1)²)
scaleDelta = distance / previousDistance
scaleInternal *= scaleDelta
```

Zoom pivot = midpoint of two fingers:

```ts
pivotX = (x1 + x2) / 2;
pivotY = (y1 + y2) / 2;
```

Transform origin is simulated manually (not CSS `transform-origin`):

1. Convert pivot to content coordinates
2. Apply scale delta
3. Recalculate translate offsets
4. Apply clamping

---

# 🎚 Wheel Zoom Logic

```ts
newScale = oldScale * (1 - deltaY * 0.001);
```

Where:

- `deltaY > 0` → zoom out
- `deltaY < 0` → zoom in

Pivot is cursor location (relative to wrapper):

```
cursorX = e.clientX - wrapper.left
cursorY = e.clientY - wrapper.top
```

Position is corrected to keep content centered:

```ts
offset.x = offset.x - (cursorX - offset.x) * ratio;
offset.y = offset.y - (cursorY - offset.y) * ratio;
```

---

# ✋ Pan (Drag) Logic

If only 1 pointer:

```ts
offset.x += dx;
offset.y += dy;
```

Uses pointer movement delta.

All panning uses:

- `pointermove`
- `setPointerCapture`
- `ReleasePointerCapture` logic upon cancellation

---

# 🧯 Scale Clamping

Each zoom update includes:

```ts
scaleInternal = Math.min(maxScale, Math.max(minScale, scaleInternal));
```

If clamped, pivot translation is still corrected to avoid "jump" effect.

---

# 📐 Resize Behavior

Zoomable uses ResizeObserver:

1. On resize, reads old size + new size
2. Maintains scale
3. Adjusts position so content remains visually centered
4. Updates bounding calculations

This ensures a responsive zoom experience.

---

# 🔧 Transform Application

Zoomable calculates:

```ts
transform = translate(x, y) scale(scaleInternal)
```

Applied to zoomable-content via style binding.

GPU acceleration ensures smooth animation.

---

# 🧪 Usage Examples

### TSX

```tsx
<Zoomable scale={1}>
  <img src="/photo.png" />
</Zoomable>
```

### HTML

```html
<wui-zoomable>
  <img src="/photo.png" />
</wui-zoomable>
```

### Controlled zoom

```tsx
const s = $(1)
<Zoomable scale={s}></Zoomable>
<Button onClick={() => s(s() * 1.1)}>+</Button>
```

---

# ♿ Accessibility

- Supports pointer, touch, pen
- Prevents default scroll-on-wheel to avoid interference
- Use additional ARIA attributes depending on content (map, image, document)
- Child semantics remain untouched

---

# 📝 Summary

Zoomable provides:

- High-performance pinch + wheel + drag zoom system
- Observable-friendly scale control
- Resize-safe transform math
- Pointer-type adaptive styling
- Full TSX & Web Component compatibility
- A powerful wrapper for maps, diagrams, documents, images, charts, and more
````

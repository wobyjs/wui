# 🧩 Zoomable API

This API explains internal logic, gesture handling, transform math, props, and lifecycle behavior of the Zoomable component and its companion Img component.

---

# 📦 Import

### TSX

```tsx
import { Zoomable, Img, useZoomable } from "./Zoomable";
```

### Web Component

```ts
import "./Zoomable"; // registers <wui-zoomable> and <wui-zoomable-img>
```

---

# 🧭 Props Overview

## Zoomable

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **scale** | number or Observable | `1` | Current zoom scale |
| **x** | number or Observable | `0` | Horizontal translation offset |
| **y** | number or Observable | `0` | Vertical translation offset |
| **minScale** | number | `1` | Minimum allowed zoom |
| **maxScale** | number | `5` | Maximum allowed zoom |
| **type** | string | `"default"` | Visual variant |
| **height** | number | `400` | Container height in px |
| **width** | number | `400` | Container width in px |
| **children** | JSX.Child | `null` | Content to render inside the zoomable area |
| **cls** | string | `""` | Override/extra classes |
| **class** | string | `""` | Append classes |
| **...otherProps** | HTMLAttributes\<div> | — | Passed to root element |

## Img

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| **src** | string | `""` | Image source URL |
| **alt** | string | `"Image"` | Alt text for the image |
| **type** | string | `"default"` | Visual variant |
| **children** | JSX.Child | `null` | Additional children |
| **cls** | string | `""` | Override/extra classes |
| **class** | string | `""` | Append classes |
| **...otherProps** | HTMLAttributes | — | Passed to `<img>` |

---

# ⚙️ Overall Rendering Structure

Zoomable produces:

```tsx
<div ref={containerRef}
    class={[zoomableStyles[type], "is-dragging"|"cursor-grab", pointer-{type}, cls, class]}
    style={{ width, height }}
    onPointerDown={handlePointerDown}
    onPointerMove={handlePointerMove}
    onPointerUp={handlePointerUp}
    onWheel={handleWheel}>

    <div ref={wrapperRef} class="wrapperStyles"
        style={{ transform: `translate(x, y) scale(scale)` }}>
        {children}
    </div>
</div>
```

Where:

- `zoomableStyles` provides the default container styling (`overflow-hidden`, `touch-none`, border, rounded)
- `wrapperStyles` provides `absolute top-0 left-0 w-full h-full origin-top-left will-change-transform`
- The container tracks pointer, touch, and pen events
- `pointer-{type}` class is added dynamically based on pointer type

---

# 🧮 Internal State

Zoomable maintains:

```ts
scale;       // observable, current zoom level
translateX;  // observable, horizontal pan offset
translateY;  // observable, vertical pan offset
isDown;      // observable, whether user is pressing
startX/Y;    // anchor coordinates for gesture start
lastX/Y;     // last known pointer position for delta calculation
pointers;    // observable array of active PointerEvent objects
pointerType; // observable string: 'mouse', 'touch', or 'pen'
containerRef; // ref to the root div
wrapperRef;   // ref to the inner transform wrapper
```

---

# ✋ Pointer Tracking Behavior

### On pointer down:
- `e.preventDefault()` to prevent text selection and native zoom
- Capture pointer type (`mouse`, `touch`, or `pen`)
- Add pointer to tracking array
- Record initial and last positions

### On pointer move:
- If 2+ pointers active → **pinch zoom**
- If 1 pointer and `isDown` → **panning**

### On pointer up:
- Remove pointer from tracking array (by pointerId)
- If no pointers remain, reset `isDown` to false
- Transfer tracking to remaining pointer if any

---

# 🤏 Pinch Zoom Logic

```ts
distance = Math.hypot(x2-x1, y2-y1)
scaleDelta = currentDistance / initialDistance
newScale = clamp(scale * scaleDelta)
```

Zoom pivot is midpoint of two fingers, adjusted relative to container:

```ts
centerX = (p1.clientX + p2.clientX) / 2 - rect.left
centerY = (p1.clientY + p2.clientY) / 2 - rect.top
translateX = centerX - (centerX - translateX) * (newScale / scale)
translateY = centerY - (centerY - translateY) * (newScale / scale)
```

---

# 🎚 Wheel Zoom Logic

```ts
delta = e.deltaY < 0 ? 1.1 : 0.9
newScale = clamp(scale * delta)
```

Where:

- `deltaY < 0` (scroll up) → zoom in (multiply by 1.1)
- `deltaY > 0` (scroll down) → zoom out (multiply by 0.9)

Pivot is cursor location relative to container:

```
mouseX = e.clientX - rect.left
mouseY = e.clientY - rect.top
scaleRatio = newScale / scale
translateX = mouseX - (mouseX - translateX) * scaleRatio
translateY = mouseY - (mouseY - translateY) * scaleRatio
```

The pointer type is set to `'mouse'` on wheel events.

---

# ✋ Pan (Drag) Logic

If exactly 1 pointer and `isDown`:

```ts
deltaX = e.clientX - lastX
deltaY = e.clientY - lastY
translateX += deltaX
translateY += deltaY
lastX = e.clientX
lastY = e.clientY
```

---

# 🧯 Scale Clamping

Each zoom update includes:

```ts
clamp = Math.max(minScale, Math.min(maxScale, value))
```

---

# 📐 Resize Behavior

Zoomable uses `useEventListener(window, 'resize', adjustTransformOnResize)`:

1. On resize, reads previous container rect vs current rect
2. Calculates scale ratios for width and height
3. Multiplies translations by the respective ratios to keep content centered
4. Saves the current rect as "previous" for the next resize event

```ts
scaleRatioX = currentRect.width / previousRect.width
scaleRatioY = currentRect.height / previousRect.height
translateX *= scaleRatioX
translateY *= scaleRatioY
```

---

# 🔧 Transform Application

The inner wrapper div receives:

```ts
transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`
```

Applied via reactive style binding with `origin-top-left` for correct scaling origin.

---

# 🖼 Img Component

The `Img` component is a companion that renders a styled `<img>` inside a Zoomable:

```tsx
<img class={[imgStyles[type], cls, class]}
    alt={alt}
    src={src} />
```

`imgStyles.default` provides `absolute w-full h-full object-contain origin-top-left cursor-grab select-none pointer-events-none rounded-lg`.

---

# 🧪 Usage Examples

### TSX
```tsx
<Zoomable scale={1}>
    <img src="/photo.png" />
</Zoomable>
```

### With Img component
```tsx
<Zoomable>
    <Img src="/photo.png" alt="Photo" />
</Zoomable>
```

### HTML
```html
<wui-zoomable>
    <img src="/photo.png" />
</wui-zoomable>

<wui-zoomable>
    <wui-zoomable-img src="/photo.png" alt="Photo"></wui-zoomable-img>
</wui-zoomable>
```

### Controlled zoom
```tsx
const s = $(1)
<Zoomable scale={s}>
    <img src="/photo.png" />
</Zoomable>
<Button onClick={() => s(s() * 1.1)}>+</Button>
```

### Custom size
```tsx
<Zoomable width={800} height={600} minScale={0.5} maxScale={3}>
    <Img src="/diagram.png" />
</Zoomable>
```

---

# ♿ Accessibility

- Supports pointer, touch, pen — all captured via unified Pointer Events
- Prevents default scroll-on-wheel to avoid interference
- `pointer-{type}` class allows CSS targeting by device type
- `touch-none` prevents default touch behavior
- Add appropriate ARIA attributes depending on content (map, image, document)
- `cursor-grab` / `cursor-grabbing` classes provide visual affordance
- `select-none` prevents text selection during drag

---

# 📝 Summary

Zoomable provides:

- High-performance pinch + wheel + drag zoom system
- Observable-friendly scale, x, and y control
- Resize-safe transform math with automatic recentering
- Pointer-type adaptive styling (`pointer-mouse`, `pointer-touch`, `pointer-pen`)
- Companion `Img` component for image-specific use cases
- Full TSX & Web Component compatibility
- A powerful wrapper for maps, diagrams, documents, images, charts, and more
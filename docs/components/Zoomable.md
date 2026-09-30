# 🧩 Zoomable Component

The **Zoomable** component provides an interactive container that supports:
- Pinch-to-zoom (touch)
- Mouse wheel zoom
- Drag-to-pan
- Double-tap / double-click centering behavior
- Scale clamping (min/max)
- Reactive observable scaling
- Smooth translation updates
- Resize compensation (keeps the zoom centered on resize)
- Custom child content (images, charts, documents, cards, etc.)

Zoomable works in **TSX** and **Web Component (`<wui-zoomable>`)** formats.

---

# 📌 Component Signature

### TSX
```tsx
<Zoomable
    scale={1}
    minScale={0.5}
    maxScale={4}
    cls=""
>
    <img src="photo.jpg" />
</Zoomable>
```

### Web Component
```html
<wui-zoomable
    scale="1"
    min-scale="0.5"
    max-scale="4"
    cls=""
>
    <img src="photo.jpg" />
</wui-zoomable>
```

---

# ✨ Features

- **Pan (drag with any pointer)**  
- **Pinch-to-zoom** on touch screens  
- **Wheel zoom** with smooth scaling  
- **Scale clamping** (`minScale`, `maxScale`)  
- **Observable scale** for controlled zooming  
- **Resize compensation** (maintains visual center)  
- **Pointer-type classes** for easier styling:
  - `pointer-mouse`
  - `pointer-touch`
  - `pointer-pen`
- Auto-detects new pointer events  
- Supports any child:
  - Images
  - Graphics
  - Cards
  - Documents
  - Canvas elements
  - Custom components

---

# 🧭 Basic Usage

```tsx
<Zoomable>
    <img src="mountains.jpg" />
</Zoomable>
```

---

# 🔍 Mouse Wheel Zoom

Scroll = zoom in/out:

- Wheel up → zoom **in**
- Wheel down → zoom **out**

Zoom is centered on the cursor position.

```tsx
<Zoomable maxScale={5}>
    <img src="map.png" />
</Zoomable>
```

---

# ✋ Drag to Pan

Hold and drag to move the content:

```
+-----------------------+
|  Drag canvas area     |
|  to move zoomed view  |
+-----------------------+
```

Supported for:
- Mouse (left button)
- Touch drag
- Pen input

---

# 🤏 Pinch-to-Zoom (Multi-Touch)

Two fingers on touch screens will:

1. Track both pointer positions  
2. Calculate their distance  
3. Determine zoom strength based on pinch spread  
4. Apply scale around the pinch midpoint  

```
Finger 1 ●───────● Finger 2
          ↑ Pinch distance ↑
```

---

# 🎚 Scaling Control

### Default scale is `1`
```tsx
<Zoomable scale={1} />
```

### With observable
```tsx
const zoom = $(1)

<Zoomable scale={zoom} />
<Button onClick={() => zoom(zoom() * 1.2)}>Zoom In</Button>
```

### With limits
```tsx
<Zoomable minScale={0.8} maxScale={3} />
```

---

# 🧯 Scale Clamping

Zoomable enforces:
```
scale >= minScale
scale <= maxScale
```

When zoom exceeds limits, it auto-corrects smoothly.

---

# 🧮 Resize Compensation

When the parent resizes:

- Zoomable recalculates container size  
- Applies the previous scale to the new dimensions  
- Ensures content remains centered after resize  

This keeps your zoomed view stable across layout changes.

---

# 🖼 Zoomable Image Helper Component  
Zoomable also exports a convenience component:

```tsx
<Zoomable.Img src="photo.jpg" cls="" />
```

HTML:
```html
<wui-zoomable-img src="photo.jpg"></wui-zoomable-img>
```

---

# 📦 Example: Interactive Image Viewer

```tsx
const scale = $(1)

<Zoomable scale={scale} maxScale={6}>
    <img src="/images/galaxy.png" class="rounded-xl" />
</Zoomable>

<Button onClick={() => scale(scale() + 0.2)}>Zoom In</Button>
<Button onClick={() => scale(scale() - 0.2)}>Zoom Out</Button>
```

---

# 🧭 Example: Document / Card Zoom

```tsx
<Zoomable minScale={0.5} maxScale={3}>
    <Paper cls="p-8 shadow-xl rounded-xl">
        <h2 class="text-xl font-bold">Report</h2>
        <p>Zoom to read details.</p>
    </Paper>
</Zoomable>
```

---

# 🎨 Styling with `cls`

```tsx
<Zoomable cls="bg-[var(--wui-gray-100)] border rounded-xl">
    <img src="/images/map.jpg" />
</Zoomable>
```

### Pointer-type classes  
Automatically added to the wrapper:

- `.pointer-mouse`
- `.pointer-touch`
- `.pointer-pen`

Useful for conditional styling:

```css
.pointer-touch img {
    touch-action: none;
}
```

---

# 🧠 Notes

- Zoomable uses `transform: translate(...) scale(...)` for performance  
- Uses pointer events instead of legacy touch/mouse separation  
- Pan, pinch, and wheel events are blocked from scrolling the page  
- Observables update smoothly during gestures  
- Always wraps children in an absolutely positioned transformed layer  
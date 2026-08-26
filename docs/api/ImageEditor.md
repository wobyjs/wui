# 🧩 ImageEditor API

**`<wui-image-editor>`** is a standalone modal that crops, zooms, resizes and replaces the
pixels of an existing `<img>`. It is not tied to the rich-text editor: it takes an
`HTMLImageElement` and writes back to it, so a toolbar button, a property panel, a context
menu or an application that has never heard of `<wui-editor>` can all open it.

---

# 📦 Import

### TSX

```tsx
import { openImageEditor } from "@woby/wui";
```

### Web Component

```ts
import "@woby/wui"; // registers <wui-image-editor> as a side effect
```

```html
<wui-image-editor></wui-image-editor>
```

Placing the tag by hand is optional. `openImageEditor` finds or creates one in the image's
own root node — one instance per root, reused thereafter — so the usual integration is a
single function call with no markup at all.

---

# 🧭 Props Overview

| Prop        | Type                     | Default | Description                                |
| ----------- | ------------------------ | ------- | ------------------------------------------ |
| **children**| `CustomElementChildren`  | `null`  | Unused; present because the custom-element wiring requires a writable `children` observable |
| **cls**     | `JSX.Class` (observable) | `null`  | Additional classes on the backdrop          |
| **class**   | `JSX.Class` (observable) | `null`  | Additional classes on the backdrop          |

The modal takes everything else from the image it is pointed at, so there are no
configuration props. What it edits and how it behaves is decided by the
[`EditImageDetail`](#event-handling) it is opened with.

---

# 🚀 Opening it

```ts
openImageEditor(image: HTMLImageElement, opts?: {
    onApply?:   (src: string) => void
    onApplied?: () => void
}): void
```

| Option          | When to pass it                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------- |
| **`onApply`**   | The caller owns the image's state — a framework binding, a model the DOM is rendered from — and a direct `img.src = …` would be overwritten on the next render. Receives the new source instead of the image being written. |
| **`onApplied`** | Something must happen after the change lands. The place to push an undo step or mark a document dirty. |

```ts
openImageEditor(img)                                    // write straight to the DOM
openImageEditor(img, { onApplied: () => save() })       // push an undo step
openImageEditor(img, { onApply: src => model.src(src) })// caller owns the state
```

---

# 🧠 Internal Logic Overview

## Source of truth for editing

Cropping is destructive, so the pixels fed to the cropper are the **best available**, not
whatever is currently embedded. `pristineSource()` resolves them in this order:

| Image state                                   | What gets edited                        | Restore offered |
| --------------------------------------------- | --------------------------------------- | --------------- |
| `data-image-origin` recorded, re-fetch OK      | the original, re-fetched                | ✅              |
| origin recorded, re-fetch fails, `src` is data | the embedded copy, with a warning       | ✅              |
| no origin, `src` is `http(s)`                  | that URL, fetched — the link *is* the origin | ❌ (until applied) |
| no origin, `src` is `data:`                    | the embedded copy                       | ❌              |
| no origin, `src` is `http(s)` and CORS refuses | nothing — the modal reports why         | ❌              |

The consequence is that a second crop is a crop **of the original**, not a crop of a crop.

## Provenance

`ORIGIN_ATTR` (`data-image-origin`) holds the URL an image's pixels came from. It is
written on apply, before the `src` is overwritten, and only when the source is an
`http(s)` URL — keeping the original *bytes* would double what the document carries, while
keeping the *URL* costs a few dozen bytes.

The asymmetry is deliberate: an image that arrived from a local file has no URL to record,
so its original is gone once a crop is applied and **Restore original** is not offered.

`rememberImageOrigin` never overwrites an existing value — the first origin is the pristine
one, and a crop of a crop must not relabel itself as the source.

## Replacing the source

The source field opens **pre-filled with where the pixels come from**:

| Image state                          | Field shows                                    |
| ------------------------------------ | ---------------------------------------------- |
| Linked (`src` is `http(s)`)          | that URL                                       |
| Cropped, origin on record            | the recorded **origin** URL, not the data URI  |
| Embedded, no origin                  | `embedded image — 100 KB` (a description)      |

Editing the URL (Enter or blur), browsing for a file, or dropping an image anywhere on the
panel **stages** a replacement — nothing is written until Apply, so a source can be swapped
repeatedly and Cancel still leaves the document untouched.

A replacement descends from a different image, so:

- **Restore original** is hidden while one is staged.
- On apply the old `data-image-origin` is cleared and the new source takes its place, which
  keeps Restore and non-compounding re-crops working against the new image.

A URL whose host refuses the fetch (CORS) still goes in — as a **link**, with a warning —
and apply skips the bake rather than erroring on a tainted canvas.

## Aspect ratio

`ImageResizer` writes both `style.width` and `style.height` in pixels, so a crop that
changes the ratio would stretch the result. After the write, the height is recomputed from
the retained width and the new natural size; an undecodable result drops to
`height: auto` rather than failing the apply.

## Why this module is imperative

Same constraint as `ImageCropper` and `ImageDialog`: woby's reactive expressions do not
re-run for observables written from `addEventListener` callbacks, and everything here
starts in a pointer or keyboard event. State is closure variables, the DOM is written
directly, and handlers are bound through refs because synthetic click delegation does not
cross the shadow boundary this lives behind.

---

# 🎨 Rendering Behavior

```
<wui-image-editor>              ← open shadow root, Tailwind adopted from document
  <div data-image-editor>       ← fixed backdrop, display:none until opened; click cancels
    <div>                       ← panel; stops its own clicks, and is the drop zone
      Edit image
      <ImageCropper />          ← − / + / Fit, drag to pan, ctrl+wheel to zoom, output readout
      Source field + Browse…    ← replace by URL, picker or drop
      note                      ← info (grey) or warning (amber)
      Restore original | Cancel  Apply
```

- One instance per root node. Images inside the editor's shadow root share one; images in
  the main document share another. It is appended to the **root**, never to the image's
  parent, so it can never land inside a `contenteditable` surface.
- Escape closes, bound on `document` in the **capture** phase so it wins over the key
  handling of whatever surface the modal was opened over.
- Apply is disabled and the cursor becomes `progress` while a fetch or decode is in flight.
  Every load is token-guarded, so a slow fetch that resolves after a close or a reopen is
  discarded.

---

# ⚡ Event Handling

| Constant                | Value                | Direction | Meaning                                                   |
| ----------------------- | -------------------- | --------- | --------------------------------------------------------- |
| **`EDIT_IMAGE_EVENT`**  | `wui-edit-image`     | in        | Dispatched **on** a `<wui-image-editor>` to open it, `detail: EditImageDetail`. `openImageEditor` is the supported way to send it. |
| **`IMAGE_APPLIED_EVENT`** | `wui-image-applied` | out      | Dispatched **from the edited image** once a change lands. Bubbles and is `composed`, so a host hears it through a shadow boundary. |
| `editor-change`         | —                    | out       | Also dispatched from the image's shadow host, which is what `<wui-editor>` listens for.  |

```ts
export interface EditImageDetail {
    image: HTMLImageElement
    onApply?: (src: string) => void
    onApplied?: () => void
}
```

An `open()` that arrives before the element has rendered — the ordinary case the first time
`openImageEditor` creates it — is parked on the host and consumed by the mount effect, so
it is never dropped.

Inside `<wui-editor>` no wiring is needed: the content `MutationObserver` already sees the
`src` rewrite and pushes an undo step.

---

# 🧰 Image utilities

Everything the editor is built from is exported, so the same rules can be applied
elsewhere.

| Export                     | Purpose                                                                 |
| -------------------------- | ----------------------------------------------------------------------- |
| **`A4`**                   | `{ short: 1240, long: 1754 }` — A4 at 150 DPI, the cap embedded images are fitted to |
| **`a4Box`**, `fitWithin`   | Orientation-aware target box, and box-fitting arithmetic                 |
| **`fitToA4`**              | Downscale a `data:` URI to the A4 cap, if it exceeds it                  |
| **`resolveImageSource`**   | Turn a typed or picked source into something insertable; embeds when asked and falls back to a link with a warning when the host refuses |
| **`pristineSource`**       | The best available pixels for editing an `<img>` (table above)           |
| **`readImageOrigin`**, **`rememberImageOrigin`**, **`ORIGIN_ATTR`** | Provenance                             |
| **`bakeCrop`**, `cropRect`, `cropOutputSize` | Render a crop to a `data:` URI, and the geometry behind it |
| **`isRasterisable`**       | False for SVG and animated GIF — formats a canvas would ruin, left untouched |
| **`isAllowedSource`**      | Only `http`, `https` and `data:image` may be inserted                    |
| **`fileToDataUrl`**, `urlToDataUrl`, `loadImage`, `naturalSize`, `mimeOf`, `encodeCanvas` | Plumbing |
| **`dataUrlBytes`**, `formatBytes` | Size readouts                                                    |
| **`ImageCropper`**, **`CropperHandle`** | The pan/zoom/crop widget on its own: `load()`, `clear()`, `bake()`, `ready()` |

---

# 🧪 Usage Examples

### Make every image in a page editable

```ts
import { openImageEditor } from "@woby/wui";

document.addEventListener("dblclick", e => {
    const img = e.composedPath()[0];
    if (img instanceof HTMLImageElement) openImageEditor(img);
});
```

### React to a change

```ts
document.addEventListener("wui-image-applied", e => {
    const img = e.target as HTMLImageElement;
    console.log("new source", img.src);
});
```

### Restore an image by hand

```ts
import { ORIGIN_ATTR, readImageOrigin } from "@woby/wui";

const origin = readImageOrigin(img);
if (origin) {
    img.removeAttribute(ORIGIN_ATTR);
    img.src = origin;
    img.style.height = "auto";
}
```

### Crop without the modal

```ts
import { bakeCrop, loadImage } from "@woby/wui";

const image = await loadImage(dataUrl);
const cropped = bakeCrop(image, { w: 400, h: 300 }, { scale: 1.5, x: -20, y: -10 });
```

---

# 📝 Summary

`<wui-image-editor>` provides:

- Crop, pan, zoom and output-size control over any existing `<img>`
- Source replacement by URL, file picker or drag-and-drop, staged until Apply
- Origin tracking, so re-crops start from pristine pixels and **Restore original** works
- A deliberate, documented limit: local files have no URL to keep, so their original is
  gone once a crop is applied
- Automatic A4-capped embedding, with SVG and animated GIF left untouched
- Zero coupling to `<wui-editor>` — one function call, from anywhere

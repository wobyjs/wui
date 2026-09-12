# 🧩 Banner API

The **Banner API** describes all props, behaviors, and internal logic for the Banner component.
It applies to both **TSX usage** and **Web Component usage (`<wui-banner>`)**.

A banner is the strip that heads a page: a logo, then a line or two of text over a photographic,
solid or gradient backdrop. It owns **the backdrop and nothing else** — what reads *on* it is
slotted light DOM, so it stays as editable as the rest of the document and round-trips through
the ordinary `outerHTML` path.

---

# 📦 Import

### TSX

```tsx
import { Banner } from "@woby/wui";
```

### Web Component

```ts
import "@woby/wui"; // registers <wui-banner>
```

---

# 🧭 Props Overview

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| **type** | `"image" \| "solid" \| "gradient"` | `"image"` | What the backdrop is made of. |
| **src** | `string` | `""` | Picture URL. `type="image"` only. |
| **focus** | `"center" \| "top" \| "bottom" \| "left" \| "right"` | `"center"` | `background-position` — which part of the picture survives the crop. |
| **tint** | `string` (CSS colour) | `"#0f172a"` | Scrim colour over an image, the fill for a solid, the first stop of a gradient. |
| **tint2** | `string` (CSS colour) | `"#334155"` | The gradient's second stop. `type="gradient"` only. |
| **scrim** | `"left" \| "right" \| "top" \| "bottom" \| "full" \| "none"` | `"left"` | Direction of the wash of colour between photo and words. Image backdrops only. |
| **overlay** | `number` (0–100) | `55` | How strong that wash is. Clamped. |
| **ink** | `string` (CSS colour) | `"#ffffff"` | Text colour for the slotted content. |
| **shadow** | `boolean` | `true` | Soft halo behind the text. Dropped when printing. |
| **height** | `string` (CSS length) | `"7rem"` | Strip height — `7rem`, `28mm`, `120px`. |
| **pad** | `string` (CSS padding shorthand) | `"0.75rem 1rem"` | Inner padding. |
| **align** | `"start" \| "center" \| "end"` | `"start"` | `text-align` for the slotted content. |
| **logo** | `string` | `""` | Logo URL. **Empty means no logo** — that absence is the only "off" switch there is. |
| **logoHeight** | `string` (CSS length) | `"2.5rem"` | Logo height; width follows via `object-fit: contain`. |
| **print** | `boolean` | `false` | The su-yen preset: 209mm wide, centred, ruled, set large and bold. |
| **children** | `JSX.Child` | `null` | Slotted light DOM — heading, paragraph, table, whatever the author writes. |
| **cls** | `JSX.Class` | `""` | **Overrides** `BASE_CLASS` when non-empty. |
| **class** | `JSX.Class` | `""` | **Appends** extra classes on top of the resolved class. |

> **The defaults live in one table.** They are exported as `BANNER` and shared with the plugin
> schema in `Editor/WuiPlugins.ts`. The property panel drops an attribute whose value equals
> `PluginProp.default`, so a schema default that disagreed with the component's own fallback
> would make the widget silently revert the moment you set that value.

```ts
import { BANNER } from "@woby/wui";
BANNER.height; // "7rem"
```

---

# ⚙️ Internal Logic

## 🎨 Backdrop, by `type`

| `type` | Painted as |
| --- | --- |
| `solid` | `background: tint` |
| `gradient` | `linear-gradient(135deg, tint, tint2)` |
| `image` | `backgroundColor: tint` under `url(src)`, `cover`, positioned by `focus`, `no-repeat` |

`tint` stays **under** the photo in image mode rather than being ignored: it is what shows while
the image loads, and what shows at all if the URL is wrong. A banner with a dead `src` should
look like a coloured strip, not like a hole in the page.

## 🌗 The scrim

Rendered in image mode only — a scrim over a flat fill is just a second, dimmer flat fill, and
the row would then be a control that visibly does nothing.

| `scrim` | Result |
| --- | --- |
| `full` | `rgba(tint, overlay)` flat over the whole strip |
| `left` / `right` / `top` / `bottom` | Linear gradient fading away from that edge (100% → 55% → 0%) |
| `none`, or `type !== "image"` | Not painted (`display: none`) |

The fade runs to **the same colour at zero alpha**, not to `transparent` — `transparent` is
transparent *black*, and would drag a light scrim through grey on the way out. That is what
`rgbTriple()` is for.

Two details that are not cosmetic:

- The layer is `pointer-events: none`. It lies over the photo, and a click has to reach a node
  the editor's selection walk can see for the banner to be selectable at all.
- It is hidden with `display` rather than by not being rendered. A custom element's top-level
  return is **untracked**, so a conditional there would paint once and then stop following the
  props.

---

# 🎨 Styling Logic

```ts
const BASE_CLASS  = 'relative flex flex-row items-center overflow-hidden box-border'
const PRINT_CLASS = 'w-[209mm] mx-auto mb-[10px] border border-solid border-black text-[200%] font-bold'
```

`BASE_CLASS` deliberately carries **no width**. Width follows `print`, and two width utilities in
one class list do not resolve by the order they are written in — Tailwind emits one rule per
utility and the *stylesheet's* order decides, so `w-full w-[209mm]` is a coin toss. The two live
in a branch instead, where only one is ever present.

`PRINT_CLASS` sits **outside** the slot `cls` replaces, the way Avatar's variant and size classes
do: an override adjusts the strip, it does not un-size a printed page.

`registerBaseCls('wui-banner', BASE_CLASS)` publishes the slot, so the property panel's **Class
Override** row opens pre-filled with it.

## The shadow sheet

Banner renders a `<style>` into its shadow root. Every rule there has to be there rather than in
a class:

| Rule | Why it cannot be a class |
| --- | --- |
| `:host { display: block }` | A custom element is inline until told otherwise, and an inline banner collapses to the height of its text. |
| `print-color-adjust: exact` | Browsers drop background images and fills when printing, and a banner is *entirely* backdrop. Inherited, so it covers the scrim and logo, and survives a `cls` override. |
| `::slotted(*) { color: inherit !important }` | Slotted content lives in the **outer** tree, which wins the cascade for normal declarations — a document's `h1 { color: #1a1a1a }` would beat the ink. Important declarations reverse that ordering. |
| `@media print { .wui-banner-content { text-shadow: none !important } }` | A soft black halo reads as depth on screen and as smudge on paper. |

A rendered `<style>` node, **not `adoptedStyleSheets`**: woby overwrites a shadow root's adopted
sheets when it propagates the document's Tailwind sheet in.

The `!important` on `::slotted(*)` costs an author nothing — colouring *text* still works, because
the toolbar puts the colour on a span inside the block and `::slotted` only ever reaches the top
level of the slot.

---

# 🧩 Render Structure

```tsx
<div class={[cls || BASE_CLASS, print ? PRINT_CLASS : 'w-full', cn]}
     style={{ height, padding: pad, ...background() }}>

    {/* scrim — image mode only, display:none otherwise, never hit-tested */}
    <div class="absolute inset-0 pointer-events-none" style={{ display, background: scrimCss }} />

    {/* logo — a real <img>, hidden by display when `logo` is empty */}
    <img class="relative shrink-0 mr-4 object-contain align-middle" alt="logo"
         src={logo || undefined}
         style={{ height: logoHeight, display: logo ? 'inline-block' : 'none' }} />

    {/* the author's content, in the light DOM */}
    <div class="wui-banner-content relative w-full min-w-0"
         style={{ color: ink, textAlign: align, textShadow: shadow ? '1px 2px 2px #000' : 'none' }}>
        {children}
    </div>

    <style>{BANNER_CSS}</style>
</div>
```

The ink is set on the content wrapper rather than on the host: inheritance into slotted content
follows the flat tree, so this wrapper is what colours the author's text — and the host keeps a
clean `style` attribute in the serialized document.

---

# ✏️ In the Editor

Registered by `Editor/WuiPlugins.ts` as the **Banner** insert item (🎏), with
`editableContent: true`. That splits a click two ways:

- **the backdrop** selects the block and opens the property panel
- **the words** place the caret

Insertion seeds an `<h2>Page title</h2>` and a `<p>A line of subtitle.</p>`, because an empty
banner gives the caret nowhere to land — it would be a coloured strip you can select but not
write on.

The **Logo** row carries an `Edit…` action that opens the image editor on the `logo` attribute,
so a logo can be cropped or replaced without leaving the panel.

---

# 🧪 Usage Examples

## TSX

```tsx
<Banner src="/hero.jpg" scrim="left" overlay={60} height="9rem" logo="/logo.svg">
    <h2>Quarterly Review</h2>
    <p>Prepared for the board — Q3</p>
</Banner>
```

## HTML

```html
<wui-banner type="gradient" tint="#0f172a" tint2="#334155" align="center" shadow="false">
    <h2>Quarterly Review</h2>
</wui-banner>
```

## The su-yen preset

```html
<wui-banner print src="/letterhead.jpg" height="28mm" logo="/mark.svg" logo-height="18mm">
    <h1>Report Title</h1>
</wui-banner>
```

> camelCase props become kebab-case attributes: `logoHeight` → `logo-height`.

---

# ♿ Accessibility

- The logo is a real `<img alt="logo">`, hidden by `display` when unset rather than rendered empty.
- Everything readable is slotted light DOM, so headings stay headings to a screen reader.
- Contrast is the author's to manage; `scrim` and `overlay` exist to make it achievable over a
  busy photograph.

---

# 📝 Summary

Banner provides:

- **Three backdrops** — photograph, solid fill, gradient
- **A scrim** that keeps light text readable over a busy image, in five directions or flat
- **Slotted, editable content** rather than fixed title/subtitle slots
- **A logo spelled as a URL**, where empty is the only "off" switch
- **`print`**, the 209mm su-yen preset, kept outside the `cls` override
- **One default table** (`BANNER`) shared with the editor plugin schema

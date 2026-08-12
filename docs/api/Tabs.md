# 🧩 Tabs API

The **Tabs API** defines the behavior, props, rendering logic, tab registration, and child handling of the Tabs + Tab system.

---

# 📦 Import

### TSX

```tsx
import { Tabs, Tab } from "./Tabs";
```

### Web Component

```ts
import "./Tabs"; // registers <wui-tabs> and <wui-tab>
```

---

# 🧭 Tabs Props

| Prop              | Type                 | Default | Description                                     |
| ----------------- | -------------------- | ------- | ----------------------------------------------- |
| **activeTag**     | string or observable | `""`    | Determines which tab is visible; resolves to first tab title when unset/invalid (HtmlString) |
| **cls**           | string               | `""`    | Primary class; styles the outer wrapper (HtmlClass) |
| **class**         | string               | `""`    | Additional classes appended to the outer wrapper |
| **children**      | JSX.Child            | `null`  | Tab content (slots)                             |
| **...otherProps** | HTMLAttributes\<div> | —       | Extra props applied to the outer wrapper        |

---

# 🧭 Tab Props

| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| **title** | string or Observable<string> | `""` | Tab display title (HtmlString) |
| **cls** | string | `""` | Primary class for the tab container (HtmlClass) |
| **class** | string | `""` | Additional classes appended to the tab container |
| **children** | JSX.Child | `null` | Tab content |

---

# ⚙️ Internal Behavior

Tabs internally:

1. Holds an internal `currentTab` observable (derived from `activeTag` if not already observable)
2. Collects each `<Tab>` element or `<wui-tab>` child
3. Extracts each tab's title from its `data-tab-title` / `title` attributes
4. Builds a **navigation button row** from the titles
5. Shows only the tab whose title matches `currentTab`

---

# 🧭 Title Resolution Logic

A tab title is read from the rendered `<Tab>` element, which exposes both attributes:

```ts
const t = node.getAttribute('data-tab-title') || node.getAttribute('title')
```

When found, the title is pushed into the internal `titles` list and the nav button is generated from it.

---

# 🧩 Rendering Structure

Tabs render:

```tsx
<div class={[() => $$(cls) ? $$(cls) : "", cn]} {...otherProps} ref={mainRef}>
  <div class="flex justify-center flex-wrap gap-2 my-4 border-2 border-gray-200 py-2 rounded-lg">
    {titles.map(t => (
      <Button type="custom" buttonFunction="button" cls={[...]} onClick={e => currentTab(t)}>
        {t}
      </Button>
    ))}
  </div>

  <div ref={contentRef} class="p-4 border border-gray-200 rounded-b-lg shadow-sm bg-white min-h-[50px]">
    {children}
  </div>
</div>
```

Each `Tab` renders a container that exposes its title:

```tsx
<div class={[() => $$(cls) ? $$(cls) : "", cn]} {...otherProps} data-tab-title={$$(title)} title={$$(title)}>
  {children}
</div>
```

---

# 🔄 Reactive Active State

If `activeTag` is observable:

```ts
currentTab("Settings");
```

Tab view updates automatically. When no title matches (or `activeTag` is empty), Tabs falls back to the first tab title.

---

# 📤 DOM Visibility Logic

An effect scans the content container and toggles visibility:

- The active tab gets `display: block` and its `hidden` attribute removed
- All other tabs get `display: none` and a `hidden` attribute

In Shadow DOM (custom element) mode, `<wui-tab>` children are moved from the host's light DOM into the content container before scanning.

---

# 📦 Example

### TSX

```tsx
<Tabs activeTag="Home">
  <Tab title="Home">Home content</Tab>
  <Tab title="About">About content</Tab>
</Tabs>
```

### HTML

```html
<wui-tabs active-tag="Home">
  <wui-tab title="Home">Home content</wui-tab>
  <wui-tab title="About">About content</wui-tab>
</wui-tabs>
```

---

# ♿ Accessibility

- Buttons for navigation are semantic and keyboard-accessible
- Active tab content remains in normal flow; hidden tabs are not displayed
- Consider adding ARIA attributes if building a WCAG 2.1-compliant UI

---

# 📝 Summary

Tabs + Tab provide:

- Declarative tab structure
- Automatic navigation button generation
- Reactive tab control
- Full TSX + Web Component compatibility
- Customizable styling via `cls` + `class`
- Clean child-slot extraction and rendering
# 🧩 Tabs API

The **Tabs API** defines the behavior, props, rendering logic, tab registration, and child handling of the Tabs + Tab system.

---

# 📦 Import

### TSX

```tsx
import { Tabs, Tab } from "./Tabs";
```

````

### Web Component

```ts
import "./Tabs"; // registers <wui-tabs> and <wui-tab>
```

---

# 🧭 Tabs Props

| Prop              | Type                 | Default         | Description                     |
| ----------------- | -------------------- | --------------- | ------------------------------- |
| **activeTag**     | string or observable | first tab title | Determines which tab is visible |
| **cls**           | string               | `""`            | Styles the outer wrapper        |
| **...otherProps** | HTMLAttributes\<div> | —               | Extra props                     |

---

# 🧭 Tab Props

| Prop                 | Type      | Default | Description                          |
| -------------------- | --------- | ------- | ------------------------------------ |
| **title**            | string    | `""`    | Tab display title                    |
| **inactive-content** | string    | `""`    | Preview shown when tab is not active |
| **cls**              | string    | `""`    | Additional styling                   |
| **children**         | JSX.Child | `null`  | Tab content                          |

---

# ⚙️ Internal Behavior

Tabs internally:

1. Collects each `<Tab>` element or `<wui-tab>` child
2. Extracts:
   - `title`
   - `inactive-content`
   - `children` (tab content)
3. Builds a **navigation button row** from the titles
4. Shows only the tab whose `title === activeTag`

---

# 🧭 Title Resolution Logic

A tab title may come from multiple sources:

```ts
title = props.title
      || element.getAttribute('title')
      || element.getAttribute('data-tab-title')
      || extracted slotted text
```

---

# 🧩 Rendering Structure

Tabs render:

```tsx
<div class="tabs-wrapper">
  <div class="nav-buttons">
    <Button onClick={() => activeTag(tab.title)}>{tab.title}</Button>
  </div>

  <div class="tab-content">{activeTabContent}</div>
</div>
```

---

# 🔄 Reactive Active State

If `activeTag` is observable:

```ts
activeTag("Settings");
```

Tab view updates automatically.

---

# 📤 Child Collection Logic

Tabs uses:

```ts
let children = menu.querySelectorAll("wui-tab");
```

Then moves their content into the display container, preserving order.

This enables support for:

- Web Component HTML
- TSX children
- Function children (dynamic mapping)

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
- Customizable styling
- Clean child-slot extraction and rendering
````

# 🧩 Tabs Component

The **Tabs** component provides a structured, interactive way to display grouped content using a top navigation bar.  
It supports **reactive activeTab values**, **dynamic tab creation**, **custom styling**, **slot-to-TSX rendering**, and automatic **navigation button generation**.

Tabs work in both **TSX** and **Web Component (`<wui-tabs>`)** formats.

---

# 📌 Component Signature

### TSX
```tsx
<Tabs activeTag={active()}>
    <Tab title="Home">Home Content</Tab>
    <Tab title="Profile">Profile Content</Tab>
    <Tab title="Settings">Settings Content</Tab>
</Tabs>
```

### Web Component
```html
<wui-tabs active-tag="Home">
    <wui-tab title="Home">Home Content</wui-tab>
    <wui-tab title="Profile">Profile Content</wui-tab>
    <wui-tab title="Settings">Settings Content</wui-tab>
</wui-tabs>
```

---

# ✨ Features

- Automatic **navigation buttons** generated from tab titles  
- **Reactive** active tab support  
- Each `<Tab>` may define:
  - `title`
  - `inactive-content` (optional)
  - `data-tab-title` (when using custom content)
- Supports **dynamic tabs**
- Compatible with **slot-based HTML usage**
- Tabs can contain **anything**: forms, cards, lists, components
- Navigation buttons use the Woby `<Button>` component
- Fully customizable with `cls`, including per-tab and per-tabs styling

---

# 🧭 Basic Usage

```tsx
const active = $("Home")

<Tabs activeTag={active()}>
    <Tab title="Home">Home Content</Tab>
    <Tab title="Profile">Profile Content</Tab>
    <Tab title="Settings">Settings Content</Tab>
</Tabs>
```

---

# 🎛️ Navigation Buttons

Tabs automatically creates a **button bar** based on the titles of your `<Tab>` elements.

### Example

```tsx
<Tabs activeTag={active()}>
    <Tab title="Home">Home</Tab>
    <Tab title="About">About</Tab>
</Tabs>
```

Renders:

- A row of `<Button>`s
- Active tab button receives special styling
- Clicking a button updates the current tab

---

# 🧭 Reactive Active Tab

Tabs accept both observable and primitive values.

### Observable active tab

```tsx
const active = $("Profile")

<Tabs activeTag={active()}>
    <Tab title="Home">Home</Tab>
    <Tab title="Profile">Profile</Tab>
</Tabs>
```

You can switch tabs programmatically:

```ts
active("Home")
```

---

# 🗂 Adding an Inactive Tab Preview

`inactive-content` displays when a tab is **not active**.

```tsx
<Tab title="Chat" inactive-content="Open Chat">
    Full chat panel here...
</Tab>
```

This is useful for:

- Tooltips  
- Summaries  
- Preview text  
- Secondary UI  

---

# 🧩 Dynamic Tabs Example

```tsx
const tabs = $([
    { title: "One", content: "Content 1" },
    { title: "Two", content: "Content 2" }
])

<Tabs activeTag="One">
    {() => 
        $$(tabs).map(t => (
            <Tab title={t.title}>{t.content}</Tab>
        ))
    }
</Tabs>
```

---

# 🎨 Custom Styling with `cls`

### Tabs-level styling

```tsx
<Tabs cls="p-4 border-b border-gray-300">
    <Tab title="A">A</Tab>
    <Tab title="B">B</Tab>
</Tabs>
```

### Tab-level styling

```tsx
<Tab title="Styled" cls="text-blue-500 font-bold">
    Content...
</Tab>
```

### Navigation button styling

```tsx
<Tabs
    navCls="flex gap-2 bg-gray-100 p-2 rounded-xl"
    activeButtonCls="!bg-blue-600 !text-white"
    inactiveButtonCls="!bg-gray-200 !text-gray-700"
>
    <Tab title="Home">...</Tab>
    <Tab title="Profile">...</Tab>
</Tabs>
```

(To enable this, add `navCls`, `activeButtonCls`, `inactiveButtonCls` in your Tabs props.)

---

# 🧩 Using Tabs in HTML (Web Components)

```html
<wui-tabs active-tag="Home">
    <wui-tab title="Home">Home...</wui-tab>
    <wui-tab title="Settings">Settings...</wui-tab>
</wui-tabs>
```

Because Tabs uses Shadow DOM:

- `<wui-tab>` elements are moved into the component's content area  
- Titles are collected from attributes or from `data-tab-title`

---

# 📦 Full Example with All Features

```tsx
const activeTab = $("Settings")

<Tabs activeTag={activeTab()}>
    <Tab title="Home" inactive-content="Go Home">
        <Paper cls="p-4">Welcome Home</Paper>
    </Tab>

    <Tab title="Profile" inactive-content="User Info">
        <Avatar>U</Avatar>
        <p>Your profile details…</p>
    </Tab>

    <Tab title="Settings" inactive-content="Preferences">
        <Switch effect="ios" checked />
        <NumberField value={10} />
    </Tab>
</Tabs>
```

---

# 🧠 Notes

- Titles are resolved in this order:  
  `title prop → data-tab-title → slot text`
- Tabs hides all Tab content except the active one  
- Button navigation updates activeTab  
- Works seamlessly with Web Components & TSX  
- Shadow DOM ensures styling isolation  
- `children` inside `<Tab>` becomes tab content  
- Tabs handles both function children and static children  
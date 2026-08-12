# SideBar API

The **SideBar API** describes the props, animation logic, sub-components, and styling rules for the sidebar navigation component. It supports an open/close toggle, an optional mask overlay, and a content-push animation that slides the main content aside.

---

## Import

### TSX

```tsx
import { SideBar, MenuItem, MenuText } from "./SideBar";
```

### Web Component

```ts
import "./SideBar"; // registers <wui-sidebar>, <wui-menu-item>, <wui-menu-text>
```

---

## SideBar Props Overview

| Prop            | Type                          | Default    | Description                                          |
| --------------- | ----------------------------- | ---------- | ---------------------------------------------------- |
| **children**    | `JSX.Child`                   | `null`     | Content rendered inside the sidebar                  |
| **open**        | `boolean` (observable)        | `false`    | Controls open/closed state                           |
| **contentRef**  | `Observable<HTMLElement \| null>` | `null`  | Reference to the main content element to push aside  |
| **width**       | `string \| number` (observable) | `"250px"` | Sidebar width when open                              |
| **mask**        | `boolean` (observable)        | `false`    | Shows a dark overlay that closes the sidebar on click |
| **top**         | `string \| number` (observable) | `0`       | Top offset (e.g. `"56px"` for appbar clearance)      |
| **cls**         | `string`                      | `""`       | Override default classes                             |
| **class**       | `string`                      | `""`       | Additional classes appended to the default           |

---

## Internal Logic

### Open/Close State

The `open` observable drives the computed `sidebarWidth`:

- **Closed** (`open === false`): width resolves to `"0px"`, hiding the sidebar.
- **Open** (`open === true`): width resolves to the value of `width`, clamped to a pixel string via `useMemo`.

```ts
const sidebarWidth = useMemo(() => {
    if (!$$(open)) return '0px'
    const w = $$(width)
    return typeof w === 'number' ? `${w}px` : w
})
```

### Content Push Animation

A `useEffect` hook synchronises `margin-left` on the element referenced by `contentRef`:

1. It reads the current `contentRef` element.
2. Sets `marginLeft` to the current `sidebarWidth`.
3. Applies a CSS transition (`margin-left 0.5s ease`) for a smooth slide.

This runs after every render, keeping the layout in sync with the sidebar state.

### Background Overlay

When `mask` is `true` and the sidebar is open, a semi-transparent overlay (`fixed inset-0 bg-black/50`) appears above the main content. Clicking it toggles `open` to `false` (only if `open` is an observable).

---

## Rendering Behavior

### Sidebar Container

```tsx
<div
    class={[BASE_CLASS, () => $$(cls) ? $$(cls) : null, cn]}
    style={{ width: sidebarWidth, top: $$(top) }}
>
    <slot>
        <div class="w-full h-full flex flex-col justify-end">
            {children}
        </div>
    </slot>
</div>
```

**BASE_CLASS**:

```
fixed h-full left-0 overflow-x-hidden transition-all duration-500 ease-in-out flex items-start z-[10]
```

- **fixed** positioning locks the sidebar to the viewport.
- **left-0** anchors it to the left edge.
- **overflow-x-hidden** clips content during the width transition.
- **transition-all duration-500 ease-in-out** animates the open/close slide.
- **z-[10]** ensures it stacks above most page content.

### Background Overlay

Rendered as a sibling `<div>` outside the sidebar container, conditionally shown when `mask && open` is true.

### Sub-Components

**MenuItem** (`<wui-menu-item>`)

Renders an `<a>` element with a default class of `flex items-center w-full h-12 px-4 mt-2 rounded cursor-pointer`. Supports `cls` (override) and `class` (append) for styling.

**MenuText** (`<wui-menu-text>`)

Renders a `<span>` with a default class of `ml-3 text-sm font-medium`. Supports `cls` (override) and `class` (append).

---

## Event Handling

- **Background overlay click**: Calls `open(false)` when the mask is clicked, closing the sidebar.
- **No mouse events on the sidebar itself**: The sidebar does not emit its own click events; interaction is handled through the mask or programmatic control of the `open` observable.

---

## Usage Examples

### TSX

```tsx
import { SideBar, MenuItem, MenuText } from "./SideBar";
import { $ } from "woby";

const open = $(false);

<div class="flex">
    <SideBar
        open={open}
        contentRef={contentRef}
        mask={true}
        width="300px"
        top="56px"
    >
        <MenuItem>
            <MenuText>Dashboard</MenuText>
        </MenuItem>
        <MenuItem>
            <MenuText>Settings</MenuText>
        </MenuItem>
    </SideBar>
    <main ref={contentRef}>
        <button onClick={() => open((v) => !v)}>Toggle</button>
    </main>
</div>
```

### HTML (Web Component)

```html
<wui-sidebar id="sidebar">
    <wui-menu-item>
        <wui-menu-text>Dashboard</wui-menu-text>
    </wui-menu-item>
    <wui-menu-item>
        <wui-menu-text>Settings</wui-menu-text>
    </wui-menu-item>
</wui-sidebar>

<script>
    const sidebar = document.getElementById("sidebar");
    sidebar.props.open = true;
    sidebar.props.contentRef = document.getElementById("main-content");
    sidebar.props.mask = true;
</script>
```

---

## Accessibility

- The sidebar container uses a `<div>` with `role` determined by the consumer via `...otherProps`.
- `MenuItem` renders as a native `<a>` element, which is keyboard-focusable and supports screen reader navigation.
- `MenuText` renders as a `<span>` and should be paired with a focusable parent (MenuItem) for accessibility.
- The mask overlay is a clickable `<div>`; consumers should add `aria-label` or `role` attributes as needed.

---

## Summary

The SideBar component provides:

- Reactive open/close state driven by an observable
- Smooth width transition with content-push animation
- Optional mask overlay for closing on backdrop click
- Configurable width, top offset, and custom classes
- MenuItem and MenuText sub-components for consistent navigation structure
- No Portal dependency (renders in-place with fixed positioning)
- Works in TSX and Web Component usage
# 🧩 Editor API

The **Editor** is a rich-text contentEditable editor with a full toolbar, undo/redo history, image resizing, table editing, a property panel, and a plugin system for custom elements. It supports both TSX and Web Component usage.

---

# 📦 Import

### TSX

```tsx
import { Editor } from "./Editor";
```

### Web Component

```ts
import "./Editor"; // registers <wui-editor>
```

---

# 🧭 Props Overview

| Prop                      | Type                                                                    | Default  | Description                                              |
| ------------------------- | ----------------------------------------------------------------------- | -------- | -------------------------------------------------------- |
| **children**              | `JSX.Element \| string \| (JSX.Element \| string)[]`                    | `null`   | Initial content rendered inside the editor               |
| **cls**                   | `JSX.Class` (observable)                                                | `null`   | Additional classes on the root container                 |
| **class**                 | `JSX.Class` (observable)                                                | `null`   | Additional classes on the root container                 |
| **enableToolbar**         | `boolean` (observable)                                                  | `true`   | Show or hide the toolbar                                 |
| **externalPropertyPanel** | `{ panelOpen, propertyTarget, selectionType }` or `null`                | `null`   | External control for PropertyPanel state                 |
| **readonly**              | `boolean` (observable)                                                  | `false`  | Disable editing and hide the toolbar                     |
| **height**                | `string` (observable)                                                   | `''`     | Fixed CSS height for the editable surface                |
| **maxHeight**             | `string` (observable)                                                   | `'60vh'` | Ceiling the surface grows to before it scrolls           |
| **...otherProps**         | HTML div attributes                                                     | —        | Any standard div attributes                              |

## Scrolling

The editable surface is its own scroll container: it grows with the document up to
`maxHeight`, then scrolls internally instead of stretching the page. Set `height`
for a box that stays the same size no matter how little content it holds — it wins
over `maxHeight` when both are given. Set either to `''` to opt out and let the
surface grow without limit.

```html
<wui-editor maxHeight="400px"></wui-editor>
<wui-editor height="300px"></wui-editor>
<wui-editor maxHeight=""></wui-editor>   <!-- unbounded, grows the page -->
```

Overscroll is contained, so reaching the end of the editor does not start scrolling
the host page, and the scrollbar gutter is reserved so text does not reflow the
moment the document grows past the ceiling. The editor's floating chrome — the drag
grip, the image handles and the table cell menu — re-anchors on every scroll of the
surface.

## `externalPropertyPanel`

Pass this to drive the property panel from outside the editor (a docked sidebar,
a floating dialog). All three fields are **observables the editor writes into**:
the editor uses them as the value of its `PropertyPanelContext.Provider` instead
of creating its own, so the host holds the same references and can read the
panel's state or open it programmatically.

| Field | Type | Description |
| ----- | ---- | ----------- |
| **panelOpen** | `Observable<boolean>` | Whether the panel should be shown. The editor sets it `true` when the user opens properties for a selection. |
| **propertyTarget** | `Observable<HTMLElement \| null>` | The element the panel is editing; `null` when the selection carries no editable target. |
| **selectionType** | `Observable<SelectionType>` | What kind of selection drove the panel — see `detectSelectionType` in the PropertyExtractor API. |

```tsx
const panelOpen = $(false)
const propertyTarget = $<HTMLElement | null>(null)
const selectionType = $<SelectionType>('none')

<Editor externalPropertyPanel={{ panelOpen, propertyTarget, selectionType }} />

// The host can now observe or drive the panel:
<button onClick={() => panelOpen(!panelOpen())}>Toggle properties</button>
<span>Editing: {() => propertyTarget()?.tagName ?? 'nothing'}</span>
```

Leave it `null` (the default) and the editor creates the three observables
itself, so the panel is entirely self-contained.

---

# ⚙️ Internal Logic Overview

## Context System

The editor wires sub-components together through four nested contexts:

### EditorContext

Provides the editor's contentEditable `<div>` as a reactive observable. All toolbar buttons and surface components retrieve the editor element via `useEditor()` to apply formatting, insert content, or manage focus.

### UndoRedo

A provider component that manages history stacks (`undos`, `redos`) as observable arrays of `HistoryEntry` objects. Each entry stores the shadow DOM's `innerHTML` and the selection offsets for restoration.

- **saveDo()** — Captures the current editor HTML and pushes it onto the undo stack. Debounced at 300ms to avoid per-keystroke snapshots. Clears the redo stack on new actions.
- **undo()** — Pops the last entry from `undos`, pushes the current state onto `redos`, and restores the previous HTML and selection.
- **redo()** — Pops from `redos`, pushes the current state onto `undos`, and restores.
- **MAX_STACK = 100** — Prevents unbounded memory growth.
- **D-14 initialization** — Polls the shadow DOM up to 10 times (500ms) for meaningful content before recording the initial history entry, accommodating the light-to-shadow DOM sync delay.

### FocusManagerContext

Holds a `FocusManager` instance that prevents toolbar button clicks from stealing focus from the contentEditable editor. The FocusManager uses a capture-phase `mousedown` listener on the toolbar to call `preventDefault()` before the browser can move focus, and caches/restores the selection via offset arrays.

### ReadonlyContext

An observable boolean that controls whether the editor is in read-only or editing mode. When `true`, the toolbar is hidden, `contentEditable` is set to `"false"`, and the editor becomes non-interactive.

### PropertyPanelContext

Shared state between the `InfoButton` (toolbar) and `PropertyPanel` (editor surface). The InfoButton detects the selected element type (image, text, or custom element) and sets the target and selection type **before** opening the panel, so the panel does not need to re-detect the selection (which would fail because focus shifts to the button on click).

## Toolbar Modules

The toolbar (`EditorToolbar`) is a sticky bar organized into seven functional groups:

| Group               | Components                                                                            |
| ------------------- | ------------------------------------------------------------------------------------- |
| **History**         | `UndoRedoButton` (undo), `UndoRedoButton` (redo)                                      |
| **Text Structure**  | `TextFormatDropDown` (heading/paragraph), `FontFamilyDropDown`, `FontSize`            |
| **Inline Styles**   | `BoldButton`, `ItalicButton`, `UnderlineButton`                                       |
| **Colors**          | `TextColorPicker`, `TextBackgroundColorPicker`, `TextFormatOptionsDropDown`            |
| **Lists & Align**   | `List` (bullet/number/checkbox), `TextAlignDropDown`, `Indent` (increase/decrease)    |
| **Layout**          | `LayoutSwitch`, `ZoomControl`, `ScrollerToggle`, `PrintButton`                         |
| **Advanced Inserts**| `InsertDropDown`, `Blockquote`, `InfoButton`                                          |

Print sits with the layout switch rather than with the inserts because it is the same subject: it
puts the editor into `page` mode and prints exactly what that mode shows. See
[Layout, Zoom and Printing](#-layout-zoom-and-printing) below.

## Overlay Modules

Rendered as siblings of the editor surface inside the `<div class="relative">` container:

- **ImageResizer** — Overlays selected images with 8 resize handles, a floating mini-toolbar for align/indent/outdent, and drag-and-drop repositioning. Selection can also be driven from outside via the `wui-select-image` event (`SELECT_IMAGE_EVENT`), which is how arrow navigation reaches images.
- **TablePopupMenu** — Floating popup for table row/column operations (insert/delete above/below/left/right) and cell formatting (background color, border color, text color, border style).
- **PropertyPanel** — Right-side panel (300px) that renders a `<PropertyForm>` for the currently selected element. Supports image, text, and custom element property editing with bidirectional sync.
- **ImageDialog** — Insert dialog for images: a URL field, a file picker and a drop zone, with an "embed as data URI" choice. Embedded images are downscaled to A4 at 150 DPI; SVG and animated GIF are inserted untouched.
- **ImageEditor** — Crop, zoom, resize and source-replacement modal for an existing image. Registered as `<wui-image-editor>` and openable from anywhere via `openImageEditor(img)`, so it is not tied to this editor. See [ImageEditor.md](./ImageEditor.md).
- **DocScroller** — The navigation rail beside the surface: sheet thumbnails in `page` mode, a fisheye map of top-level blocks in `flow` and `screen`. It is a sibling of the scroll box, not a child, so it hides and shows with the editor and scrolls itself instead of stretching it. See [DocScroller.md](./DocScroller.md).

---

# 📄 Layout, Zoom and Printing

The editor surface is paginated by the **PageLayout** engine. Three modes:

| Mode | For | Sheets | Markers | Editable |
| --- | --- | --- | --- | --- |
| `flow` | Authoring | No | **Visible** — page breaks, watermarks and rules show as labelled markers | Yes |
| `page` | Proofing | Yes — real 209×296mm sheets, numbered | Consumed into real breaks | **Yes** |
| `screen` | Reading | No — reflows to the viewport | Hidden | No |

```ts
import { setEditorLayout, editorLayout, Layout } from "@woby/wui";
setEditorLayout(surface, Layout.page)
```

| Control | Drives | Observable |
| --- | --- | --- |
| `LayoutSwitch` | `setEditorLayout` → `applyLayout` | `editorLayout` |
| `ZoomControl` | `setEditorZoom` → `setLayoutZoom` | `editorZoom` |
| `ScrollerToggle` | `toggleScroller` | `scrollerOpen` |
| `PrintButton` | `printEditor` | — |

Each of those setters is exported, so a host can drive the editor from its own chrome or a
keyboard shortcut without reaching into the toolbar for a button to press. Prefer the `setEditor*`
functions over the engine's own `applyLayout` / `setLayoutZoom`: they also publish to the
observable the toolbar reads, so the readout stays honest.

Three things worth knowing before building on this:

- **`page` mode is fully editable.** Sheets are built by *re-parenting* nodes, never by cloning —
  a cloned custom element reconstructs itself and loses its identity.
- **A layout switch is not an undo step.** History snapshots go through `unpaginatedHTML`, so they
  are byte-identical across a mode change.
- **Persist the unpaginated form.** Sheets are a view, not content:
  `const html = unpaginatedHTML(surface.innerHTML)`.

Full reference: [PageLayout.md](./PageLayout.md).

## Read-Only Mode Toggle

A floating action button (FAB) in the bottom-right corner toggles between read-only and edit mode. The icon changes (pencil for read-only, eye for editing) and the button color switches between blue and green.

---

# 🎨 Rendering Behavior

## Structure

```
<div ref={container}>
  <ReadonlyContext.Provider>
    <EditorContext.Provider>
      <UndoRedo>
        <EditorToolbar />           <!-- sticky toolbar, hidden when readonly -->
        <div class="relative">
          <div class="flex flex-row">
            <div>                   <!-- scroll box -->
              <div contentEditable />   <!-- EditorSurface -->
            </div>
            <DocScroller />         <!-- navigation rail, a sibling of the scroll box -->
          </div>
          <ImageResizer />          <!-- overlay; its crop button opens the image editor -->
          <TablePopupMenu />        <!-- overlay -->
          <PropertyPanel />         <!-- right-side panel -->
          <ImageDialog />           <!-- insert-image modal -->
        </div>
      </UndoRedo>
    </EditorContext.Provider>
    <!-- Floating button for read-only toggle -->
  </ReadonlyContext.Provider>
</div>
```

## Light DOM to Shadow DOM Sync

When the editor is used as a `<wui-editor>` web component (shadow DOM attached), the editor's initial content (light DOM children) is cloned into the shadow DOM via a `MutationObserver`. This is necessary because `contentEditable` only works on content in the same DOM tree. The sync effect:

- Clones all light DOM children (except `<script>` and `<style>`) into the shadow DOM editor element.
- Preserves and restores the selection range using node-path offset arrays.
- Watches for changes in the light DOM and re-syncs automatically.
- Uses a re-entrancy guard to prevent feedback loops.

When used in non-shadow-DOM mode (JSX), children are rendered directly into the editor element.

## Toolbar Visibility

The toolbar only appears when the editor is in editing mode (`isEditing = true`) and `enableToolbar` is `true`. The `isEditing` state is set to `true` when the user clicks on the editor surface, and `false` when focus leaves the editor/toolbar composite.

---

# ⌨️ Event Handling

## Keyboard Shortcuts

| Shortcut     | Action                      |
| ------------ | --------------------------- |
| `Ctrl+Z`     | Undo                        |
| `Ctrl+Y`     | Redo                        |
| `Ctrl+B`     | Bold (via StyleEngine)      |
| `Ctrl+I`     | Italic (via StyleEngine)    |
| `Ctrl+U`     | Underline (via StyleEngine) |
| `Tab`        | Table cell navigation / indent paragraph |
| `Shift+Tab`  | Outdent / previous table cell |
| `←` `→` `↑` `↓` | Move the selection between embedded components and images |
| `Enter`      | Open a new line immediately after the selected component |
| `Backspace` / `Delete` | Delete the selected component |
| `Escape`     | Clear the component selection |

The last four rows apply **only while a component is selected**. When the
caret is inside a text-entry component — a `wui-text-field`, a `wui-text-area`, a
`wui-number-field` — those same keys belong to the component, not the editor. See
**editsInPlace** below.

## Node Selection & Navigation

A caret cannot be placed inside a shadow host, so embedded components and images are selected
as whole boxes rather than as a range of text. `data-element-selected` on the element is the
single source of truth for that selection, set by a capture-phase `pointerdown` handler on
the surface and read by `NodeMover`, `PropertyPanel`, `PropertyExtractor` and the delete path.

While a box is selected, the arrow keys step from box to box and `Enter` opens a line
immediately after the selection — in the selection's own parent, so a component nested in a
container gets its line inside that container. The geometry and the insertion rules live in
[NodeNavigation.md](./NodeNavigation.md); the editor only moves the mark.

Image selection lives in `ImageResizer`'s closure rather than in the mark, so the keyboard
reaches it through the `wui-select-image` event (`SELECT_IMAGE_EVENT`) dispatched on the
shadow root with `detail.image` set to the image, or `null` to clear.

### editsInPlace

Some embedded components own a caret of their own. `editsInPlace(e)` walks the event's
`composedPath()` — `e.target` is retargeted to the host and would never reveal what is inside
— stopping at `[data-editor-root]`, and returns `true` when it finds a text `<input>`,
a `<textarea>`, a `<select>` or a literal `contenteditable` attribute. Input types that hold
no text (`checkbox`, `radio`, `button`, `submit`, `reset`, `file`, `image`, `range`, `color`)
do not count.

When it returns `true`, the editor keeps its hands off the keystroke: `Backspace` deletes a
character instead of the component, `Enter` reaches the field, `Tab` moves through the form.

This is also why a caret cannot be placed **between** two adjacent components by clicking:
the click focuses the near one's own field and `Enter` then belongs to that field. Arrow onto
the component from a neighbour instead — that marks it without focusing it — and press
`Enter`.

## Focus Management

- **handleEditorClick** — Sets `isEditing = true` and focuses the editor element.
- **handleBlur** — Checks if focus has moved outside the editor/toolbar composite using `FocusManager.isFocused`. If focus truly left, sets `isEditing = false`.
- **holdsFocus** — Answers "is the focus inside this element?" across shadow boundaries.
  `document.activeElement` cannot: focus is retargeted at every boundary, so with the caret in
  a `wui-text-field`'s `<input>` the document still reports the outermost host, `<wui-editor>`,
  and every comparison against an element *inside* that shadow tree comes back false. The walk
  descends one boundary at a time via each host's own `shadowRoot.activeElement`. The auto-focus
  effect guards on this so it never seizes the surface from a component that already has the caret.
- **FocusManager** — Uses capture-phase `mousedown` on the toolbar to prevent button clicks from moving focus away from the contentEditable element. Caches and restores the selection using offset arrays.

## Mutation Observer

A `MutationObserver` on the editor element watches for attribute changes, child list changes, subtree changes, and character data changes. Each mutation triggers `saveDo()` to capture the current state into the undo history.

---

# 🧪 Usage Examples

### Basic Editor

```tsx
import { Editor } from "./Editor";

function App() {
  return (
    <Editor>
      <p>Initial content goes here.</p>
    </Editor>
  );
}
```

### Controlled with onChange

```tsx
import { Editor } from "./Editor";

function App() {
  const handleChange = (html: string) => {
    console.log("Editor content:", html);
  };

  return (
    <Editor onChange={handleChange}>
      <p>Edit me!</p>
    </Editor>
  );
}
```

### Read-Only Mode

```tsx
import { $ } from "woby";
import { Editor } from "./Editor";

const readonly = $(true);

<Editor readonly={readonly}>
  <p>This content is read-only.</p>
</Editor>
```

### Toolbar Disabled

```tsx
<Editor enableToolbar={false}>
  <p>No toolbar, but still editable.</p>
</Editor>
```

### Web Component

```html
<wui-editor>
  <p>Initial content in a web component.</p>
</wui-editor>
```

```ts
import "./Editor"; // registers <wui-editor>
```

---

# ♿ Accessibility

- The editor surface uses a native `contentEditable` div, which is keyboard accessible by default.
- The toolbar uses native `<button>` elements, supporting keyboard navigation and ARIA attributes.
- The InsertDropDown uses `role="menu"`, `role="menuitem"`, and `aria-orientation` for accessible dropdown behavior.
- Toolbar buttons use `title` attributes for tooltip text.
- The read-only mode toggle FAB button has a `title` attribute that changes contextually.
- The editor supports custom ARIA attributes via `...otherProps`.

---

# 📝 Summary

The Editor component provides:

- Rich-text editing with a full-featured toolbar
- Undo/redo history with debounced snapshot capture and selection restoration
- Focus management that preserves selection across toolbar interactions
- Read-only mode with an interactive toggle
- Image resizing with drag handles and align/indent controls
- Image insertion by URL, file picker or drop, with optional A4-capped embedding
- Image cropping, zooming and source replacement, with the original URL kept on record so a crop can be undone or re-taken from pristine pixels
- Table editing with row/column operations and cell formatting
- Property panel for editing element attributes (image, text, custom elements)
- Plugin system for registering custom elements in the insert menu
- Light DOM to shadow DOM content sync for web component usage
- Works in both TSX and Web Component (`<wui-editor>`) usage
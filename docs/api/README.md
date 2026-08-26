# 🧩 Woby UI — API Reference

This directory contains the **technical API documentation** for all Woby UI components.

The goal of the API documentation is to provide:

- Precise prop definitions
- Internal behavior notes
- Rendering structure
- Data flow logic
- Observable interaction guidelines
- Architectural explanations

Each component API file follows a structured pattern:

---

## 🧱 API Documentation Structure

Each file includes:

### **1. Prop Table**

Lists every available prop with:

- Types
- Default values
- Description of behavior

### **2. Internal Logic Overview**

Explains:

- State handling
- Observable interactions
- Computed values
- Derived UI states
- Validation or clamping rules

### **3. Rendering Behavior**

Details how the component outputs DOM:

- Wrapper structure
- Shadow DOM behavior
- CSS class composition
- Slot or children handling

### **4. Event Handling**

Describes:

- Which events the component emits
- How interactions update state
- When observables are triggered

### **5. Usage Examples**

One or more examples showing how to use the API in TSX and HTML.

---

## 📚 Components with API Documentation

- `Appbar.md`
- `Avatar.md`
- `Badge.md`
- `BooleanEditor.md`
- `Button.md`
- `Card.md`
- `Checkbox.md`
- `Chip.md`
- `Collapse.md`
- `ColorEditor.md`
- `DateTimeWheeler.md`
- `DropdownEditor.md`
- `Editor.md`
- `EditorPlugin.md`
- `EditorProps.md`
- `Fab.md`
- `IconButton.md`
- `ImageEditor.md`
- `MultiWheeler.md`
- `NumberEditor.md`
- `NumberField.md`
- `ObjectEditor.md`
- `Paper.md`
- `PropertyForm.md`
- `SideBar.md`
- `StringEditor.md`
- `Switch.md`
- `Tabs.md`
- `TextArea.md`
- `TextField.md`
- `ToggleButton.md`
- `Toolbar.md`
- `Wheeler.md`
- `Zoomable.md`

---

## 🧪 About the Tests

Most documented API behaviour is pinned by the snapshot suite in `src/ssr/TestXxx.tsx`
— twenty modules, each asserting the same component in two environments:

| Runner | Command / entry | What it compares |
| ------ | --------------- | ---------------- |
| Node SSR | `pnpm test` (`pnpm ssr-test`) | `renderToString` output vs. a literal expected string, per state |
| Browser | `pnpm dev` → "SSR Snapshot Tests" | live serialized DOM vs. `TestXxx.test.expect()`, re-checked on every MutationObserver tick |

Both runners surface the **actual and expected** markup for every state, so a
mismatch names the exact attribute that drifted. The browser runner prints it on
the page — a summary banner plus one `actual / expect` panel per module, opened
automatically when that module fails — as well as to the console.

The two forms differ where the serializers legitimately differ: `renderToString`
emits self-closing void elements (`<input … />`) and reflects `checked` as
`checked=""`, while the browser emits `<input …>` and keeps `checked` as a
property, never an attribute. Expectations account for that — don't "fix" one to
match the other.

These two are the whole story. The Playwright specs under `playwright/` are
**parked** — `@playwright/test` isn't a dependency and the config is renamed
`playwright.config.parked.ts` so nothing runs it. A small vitest suite for editor
internals (`pnpm exec vitest run`) exists separately; its include pattern is `.ts`
only, so `test/*.test.tsx` files are not collected.

`test/Template.testx.tsx` / `test/Template.testx.html` are scaffolding templates
for new component tests, not a live suite.

These files double as _usage references_ when designing or modifying component logic.

---

## 🧩 Extending the API Reference

When adding or modifying a component:

1. Mirror the same file structure
2. Match the table formatting
3. Keep examples consistent
4. Use short, precise descriptions
5. Avoid implementation details not relevant to the consumer

---

## ⚙️ Design Philosophy

The API documentation focuses on:

- Predictability
- Consistency
- Type safety
- Clear developer experience
- Zero ambiguity

---

If you need help generating new API docs for a component, follow the existing format—or ask the documentation generator.

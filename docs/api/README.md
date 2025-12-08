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
- `Button.md`
- `Card.md`
- `Checkbox.md`
- `Chip.md`
- `Collapse.md`
- `Fab.md`
- `IconButton.md`
- `NumberField.md`
- `Paper.md`
- `Switch.md`
- `Tabs.md`
- `TextField.md`
- `Toolbar.md`
- `Zoomable.md`

---

## 🧪 About the Tests

Many API behaviors are validated inside:

- `*.testx.tsx`
- `*.testx.html`

These test files can also be used as _usage references_ when designing or modifying component logic.

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

# 🧩 Woby UI — Component Documentation

Welcome to the **Component Documentation** section of Woby UI.

This directory contains guides for **how to use each component**, with:

- Interactive examples
- TSX + Web Component usage
- Visual behavior walkthroughs
- Styling instructions (`cls`)
- Best practices
- Tips & notes

---

# 🎨 Component Documentation Structure

Each component file provides:

### **1. Overview**

What the component does and common use cases.

### **2. Usage Examples**

With TSX and HTML (`<wui-*>`) versions.

### **3. Styling Options**

How to customize appearance using:

- `cls`
- Variants
- Effects
- Props

### **4. Behavior Summary**

Explains how the component works at a user-facing level.

### **5. Notes**

Important do’s/don’ts, edge cases, caveats.

---

# 📚 Components Documented

- **AppBar** — Application header bar
- **Avatar** — User profile circles/squares
- **Button** — Action triggers with variants
- **Card** — Container with elevation
- **Checkbox** — Controlled/uncontrolled toggles
- **Chip** — Compact labeled UI elements
- **Collapse** — Expandable content wrapper
- **Fab** — Floating action button
- **IconButton** — Icon-only button
- **NumberField** — Numeric input with increment/decrement
- **Paper** — Elevated surface container
- **Switch** — Animated toggle with 23+ effects
- **Tabs** — Section navigation with Tab views
- **TextField** — Input with 27 effects & floating label
- **Toolbar** — Horizontal layout for actions/navigation
- **Zoomable** — Pan + pinch + wheel zoom container

---

# ✨ Design-System Principles

All components follow:

- Consistent naming
- Predictable behavior
- Tailwind-class-friendly styling
- Shadow DOM isolation (Web Components)
- Woby observables for reactivity
- Clean TSX examples

---

# 🧪 Test Files as Examples

Usage is also demonstrated in each component’s:

- `*.testx.tsx`
- `*.testx.html`

These tests show real, production-safe patterns.

---

# 📝 Contributing New Components

When adding a component:

1. Create:
   ```
   docs/Component/YourComponent.md
   docs/Api/YourComponent.md
   ```
2. Follow the structure from existing docs
3. Include examples in TSX + HTML
4. Keep descriptions clean and readable
5. Keep the premium design-system style

---

Need help generating documentation for a new component?  
Just provide the `.tsx` file and test files.

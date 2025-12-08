# 🛠 Maintaining Documentation

This guide provides best practices and standardized workflows for maintaining and updating the **@woby/wui** documentation.  
Its purpose is to ensure consistency, clarity, and high quality across all docs as the library grows.

---

## 📁 Documentation Structure

The documentation is organized into four major directories:

```
docs/
  components/   → Component usage documentation
  guides/       → Developer & user guides
  api/          → Technical API references
  index.html    → Documentation homepage
```

Each directory serves a distinct purpose:

### **components/**

Houses readable, example-driven documentation for individual UI components.

### **guides/**

Provides tutorials, conceptual explanations, onboarding, styling techniques, and contribution instructions.

### **api/**

Contains technical reference material including prop definitions, internal behaviors, and rendering structures.

---

## ➕ Adding New Components

When contributing a new component to **@woby/wui**, follow this workflow:

### **1. Create Component Documentation**

Add a file to:

```
docs/components/
```

Use an existing component file as a template.

### **2. Run the Documentation Generation Script**

```sh
npm run docs:generate
```

This creates baseline documentation that must be further refined manually.

### **3. Enhance the Generated Documentation**

Update the component doc with:

- Full prop descriptions
- Usage examples (TSX + HTML)
- TypeScript definitions
- Relevant CSS class information

### **4. Add the API Reference**

Create a matching file in:

```
docs/api/
```

Include:

- Precise prop definitions
- Internal logic
- Rendering structure
- Event behavior

---

## 🔄 Updating Existing Documentation

When modifying a component, ensure you also update its documentation accordingly:

### Required updates include:

- Prop & API changes
- Usage examples
- TS definitions
- CSS classes
- Behavioral notes

Check if related _guides_ require updates—for example, if behavior changes affect tutorials or examples.

---

## 🧪 Testing Documentation Changes

Verify the following before committing documentation changes:

- All links work correctly
- Examples compile or render properly
- TypeScript definitions are accurate
- Prop descriptions match implementation
- No outdated patterns remain

Following these steps ensures the documentation stays accurate and reliable.

---

## 📝 Style Guide for Documentation

To maintain professionalism and consistency across the docs, follow these guidelines:

### ✔ Writing Style

- Use **clear and concise** language
- Prefer **active voice**
- Provide both **TSX and HTML examples**
- Document only relevant behavior

### ✔ Markdown Formatting

- Use headings to structure content
- Use code fences (` ``` `) for examples
- Use tables for prop definitions
- Keep formatting consistent across all pages

Adhering to these conventions ensures readability and reduces friction for users and contributors alike.

---

## ⚙️ Automated Documentation Generation

The documentation generator creates starting templates, but **manual refinement** is always required.

Automation helps with structure; humans supply clarity and correctness.

---

## 🤝 Contributing

Maintaining documentation is a collaborative effort.  
Following this guide ensures that **@woby/wui** remains easy to understand, consistent, and a pleasure to work with.

Thank you for helping improve the library!

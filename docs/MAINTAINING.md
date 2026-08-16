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

### **2. Derive the Prop Table from the Emitted Types**

There is no doc-generation script. The authoritative prop surface is the
declaration output, so build it first and read the component's `.d.ts`:

```sh
pnpm build          # vite build, then tsc --emitDeclarationOnly → dist/types/
cat dist/types/MyComponent.d.ts
```

Components written with woby's `defaults()` emit as a `def` factory plus a
`Defaulted` alias — the object literal inside `def` **is** the prop list:

```ts
declare const def: () => { children: CustomElementChildren; checked: ObservableMaybe<boolean>; /* … */ }
declare const Checkbox: Defaulted<typeof def>;
```

Plain function components emit `declare const X: (props: Partial<{ … }>) => JSX.Element`
instead. Either way, every key in that literal needs a row in the doc table.

### **3. Enhance the Documentation**

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

Run both suites — they log actual **and** expected markup per state, so a drifted
prop shows up as a concrete diff rather than a bare failure:

```sh
pnpm build              # must emit zero `error TS` lines
pnpm test               # pure Node.js woby SSR (src/ssr/TestXxx.tsx)
pnpm dev                # demo cum test page — scroll to "SSR Snapshot Tests"
```

Those two are the whole suite. `pnpm dev` shows each module's actual/expect pair
on the page and mirrors the same log to the console; `pnpm test` is the headless
`renderToString` equivalent. Playwright is parked (see `playwright/README.md`);
the small vitest suite for editor internals (`pnpm exec vitest run`) is separate
and not part of the release check.

`pnpm build` runs `vite build` **before** `declaration` on purpose: `vite build`
has `emptyOutDir: true`, so emitting declarations first would leave `dist/types`
wiped and the package's `"types"` field dangling. Don't reorder them.

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

## ⚙️ Keeping Docs in Sync with the Types

Docs are written by hand; `dist/types/**/*.d.ts` is the source of truth for what
props exist. When auditing a batch of pages, compare the first column of each
markdown prop table against the keys declared in the matching `.d.ts` — the
mismatches fall into two buckets:

- **Undocumented** (in the types, absent from the table) — a real gap; add the row.
- **Not in code** (in the table, absent from the types) — usually a *false
  positive*: value tables (`effect1`…`effect24` for TextArea's `effect` prop,
  the `mode` values for DateTimeWheeler), event tables (Wheeler's
  `pointerdown`/`pointermove`), section tables (Editor's History/Colors), or
  props inherited from a shared type (the PropertyForm editors all take
  `UIProps<T>` from `PropertyForm/Editors.d.ts`, which lives in a different file
  than the component). Check before deleting anything.

Automation helps with structure; humans supply clarity and correctness.

---

## 🤝 Contributing

Maintaining documentation is a collaborative effort.  
Following this guide ensures that **@woby/wui** remains easy to understand, consistent, and a pleasure to work with.

Thank you for helping improve the library!

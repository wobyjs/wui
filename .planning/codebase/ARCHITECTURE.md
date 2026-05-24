<!-- refreshed: 2026-05-24 -->
# Architecture

**Analysis Date:** 2026-05-24

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                     Component Library                         │
│                     `src/index.tsx`                           │
├──────────────────┬──────────────────┬───────────────────────┤
│  UI Components   │  Complex UI      │    Editor System      │
│  Button, Badge   │  Wheeler, Editor │   `src/Editor/`       │
│  TextField, etc  │  PropertyForm    │                       │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Woby Reactive Core                        │
│         Observable state, effects, JSX runtime               │
│         `woby`, `@woby/use`, `@woby/styled`                  │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Tailwind CSS Styling                                        │
│  `src/input.css` → `dist/wui.css`                           │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| UI Components | Basic interactive elements (Button, TextField, Switch, etc.) | `src/*.tsx` |
| Wheeler | Picker/wheel selector for dates, multi-options | `src/Wheeler/Wheeler.tsx` |
| Editor | Rich text editor with formatting toolbar | `src/Editor/Editor.tsx` |
| PropertyForm | Dynamic property editor for objects | `src/PropertyForm/PropertyForm.tsx` |
| Icons | SVG icon components for editor and UI | `src/icons/*.tsx` |
| Custom Elements | Web component registration layer | Each component registers via `customElement()` |

## Pattern Overview

**Overall:** Component Library with Reactive State

**Key Characteristics:**
- Component-based architecture using Woby (reactive framework similar to SolidJS)
- Each component is self-contained with internal observable state
- Custom Element support for use outside Woby/JSX context
- Effect-based styling system (preset variations)
- Composition over inheritance

## Layers

**Component Layer:**
- Purpose: UI elements and user interaction
- Location: `src/*.tsx`
- Contains: Presentational components, event handlers, observable props
- Depends on: Woby core, Tailwind CSS
- Used by: Application code, test files

**Subcomponent Layer:**
- Purpose: Break down complex components into reusable parts
- Location: `src/Editor/*.tsx`, `src/Wheeler/*.tsx`, `src/PropertyForm/*.tsx`
- Contains: Specialized UI pieces (toolbar buttons, picker wheels, property editors)
- Depends on: Parent component context, shared utilities
- Used by: Parent components (Editor, Wheeler, PropertyForm)

**Styling Layer:**
- Purpose: Define visual effects and theme variations
- Location: `src/*.effect.tsx`, `src/input.css`
- Contains: CSS class strings, Tailwind utilities, effect presets
- Depends on: Tailwind CSS
- Used by: Components via `effect` prop

**Utility Layer:**
- Purpose: Shared helper functions, type definitions
- Location: `src/helper/*.tsx`, `src/Editor/utils.tsx`, `src/Wheeler/WheelerType.tsx`
- Contains: DOM manipulation, selection utils, type guards
- Depends on: Woby, DOM APIs
- Used by: All layers

## Data Flow

### Primary User Interaction Path

1. User interacts with component (click, input, etc.) (`src/Button.tsx:132`)
2. Event handler updates observable state via `isObservable(checked) && checked(!$$(checked))`
3. Woby's reactive system propagates changes to dependent computations
4. UI re-renders efficiently based on observable dependencies

### Effect Selection Flow (TextField, Switch)

1. Component receives `effect` prop with effect name string (`src/TextField.tsx:122`)
2. `useMemo` looks up effect in `effectMap` Record
3. Returns CSS class string for that effect
4. Applied dynamically to component element

**State Management:**
- All state is observable using Woby's `$()` function
- Props use `ObservableMaybe<T>` type for reactivity
- Components use `defaults()` pattern for prop defaults with observable initialization
- No global state store—each component manages its own state

## Key Abstractions

**Observable Component Pattern:**
- Purpose: Make components reactive and self-updating
- Examples: All `src/*.tsx` component files
- Pattern: `defaults(def, (props) => { ... })` where `def()` returns observable defaults

**Effect Preset System:**
- Purpose: Provide pre-configured style variations
- Examples: `src/TextField.effect.tsx`, `src/Switch.effect.tsx`
- Pattern: Export named effect strings, lookup via Record/map

**Context Provider Pattern:**
- Purpose: Share state across component tree
- Examples: `src/Editor/undoredo.tsx` (EditorContext), UndoRedo provider
- Pattern: Woby context API with `useContext` hooks

**Custom Element Registration:**
- Purpose: Enable use as Web Components in any HTML
- Examples: Every component file has `customElement('wui-*', Component)` call
- Pattern: Register component, extend JSX namespace for type safety

## Entry Points

**Library Entry Point:**
- Location: `src/index.tsx`
- Triggers: Import from `@woby/wui`
- Responsibilities: Re-export all components, import global CSS

**Demo/Development Entry:**
- Location: `src/main.ts` → `src/app.tsx`
- Triggers: `pnpm run dev` or `vite`
- Responsibilities: Render demo application with all components

**Build Entry:**
- Location: `vite.config.mts` (lib build config)
- Triggers: `pnpm run build`
- Responsibilities: Compile to ESM, generate types, process Tailwind

## Architectural Constraints

- **Threading:** Single-threaded—runs in browser main thread, uses MutationObserver for DOM tracking (Editor)
- **Global state:** Minimal—only `ActiveWheelers` observable in `src/Wheeler/Wheeler.tsx:5` for tracking open pickers
- **Circular imports:** None detected—component tree is hierarchical
- **External dependencies:** Heavily tied to Woby ecosystem (`woby`, `@woby/use`, `@woby/styled`)

## Anti-Patterns

### Large Effect Files

**What happens:** Effect files like `TextField.effect.tsx` (45KB) and `Switch.effect.tsx` (47KB) contain massive CSS strings
**Why it's wrong:** Difficult to maintain, duplicates similar patterns, hard to customize
**Do this instead:** Move to separate CSS/JSON files, generate programmatically, or use CSS custom properties

### Mixed Component Demos in Source

**What happens:** `src/app.tsx` contains 5000+ lines of demo code mixed with component imports
**Why it's wrong:** Bloats source tree, should be in separate demo/ folder or docs site
**Do this instead:** Move demos to `docs/index.tsx` or `examples/` directory

### Inconsistent Prop Naming

**What happens:** Some components use `cls`, others use `class`, some support both (`src/Button.tsx:92-93`)
**Why it's wrong:** Confusing API surface, unclear which takes precedence
**Do this instead:** Standardize on `class` prop, deprecate `cls` or document clearly

## Error Handling

**Strategy:** Fail silently in production, console.warn in development

**Patterns:**
- Try-catch around DOM operations (Editor mutation observer setup)
- Guard clauses with early returns (SideBar contentRef check)
- Type narrowing with `isObservable()` checks before calling observables

## Cross-Cutting Concerns

**Logging:** Uses Woby's DEBUGGER flag in dev mode (`src/app.tsx:54-58`)

**Validation:** Runtime type checking via `isObservable()`, `$$()` unwrap utilities

**Authentication:** Not applicable (UI component library)

**Accessibility:** ARIA attributes in some components (icons have `aria-hidden`), but inconsistent coverage

---

*Architecture analysis: 2026-05-24*

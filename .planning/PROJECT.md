# WUI Rich Text Editor

## What This Is

A full-featured, production-ready rich text editor component for the Woby framework that handles all editing scenarios correctly - cross-paragraph selections, style merging/splitting, block transformations, touch interactions, keyboard shortcuts, undo/redo, and accessibility. Built from the ground up using proper DOM manipulation (no execCommand) with a comprehensive interaction layer matching the sophistication of editors like Lexical and Google Docs.

## Core Value

**Every interaction works correctly across all selection scenarios** - from simple cursor styling to complex cross-paragraph selections, style toggling, and block transformations. No half-working features.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Cross-paragraph selection styling works correctly
- [ ] Style merge/split logic handles nested styles
- [ ] Block-level transformations (P ↔ LI ↔ PRE ↔ H1-H6) work bidirectionally
- [ ] All formatting buttons functional (bold, italic, underline, lists, alignment, colors, fonts)
- [ ] Touch interactions for mobile/tablet
- [ ] Full keyboard navigation and shortcuts
- [ ] Undo/redo with proper state batching
- [ ] Copy/paste with format preservation
- [ ] Image and table insertion
- [ ] Screen reader accessibility (ARIA labels, live regions)
- [ ] Works in all major browsers (Chrome, Firefox, Safari, Edge)

### Out of Scope

- Collaborative real-time editing (future phase)
- Custom plugin system (future enhancement)
- Markdown export/import (can be added later)

## Context

**Current State:** The existing Editor component in `src/Editor/` has significant issues:
- Uses deprecated `execCommand` which is unstable and feature-limited
- Cross-paragraph styling fails (stops at block boundaries)
- No style merge/split logic (creates invalid nested styles)
- List transformations disabled (early return in code)
- No selection normalization
- Broken undo/redo (saves every keystroke instead of batching)

**Technical Environment:**
- Framework: Woby (reactive, component-based)
- Existing skills: `/dom`, `/dom-customelement`, `/woby` for patterns
- Testing: Agent browser visualizer for visual verification
- Stack: TypeScript, Tailwind CSS for styling
- Target: Custom Elements (`<wui-editor>`)

**Key Insights from Research:**
1. **Selection scenarios**: Collapsed cursor, partial word, whole paragraph, cross-paragraph partial, full multi-paragraph
2. **Style logic**: Must handle merge (adjacent same-style spans), unwrap (redundant nesting), split (toggle off partial), normalize
3. **Block transformations**: P ↔ LI requires list container management, LI ↔ H requires split/merge logic
4. **Interaction patterns**: Mouse/pointer/touch events, keyboard shortcuts, undo/redo stack, clipboard API

**Success Pattern:** Lexical editor architecture shows the way:
- State model with editor state snapshots
- Command pattern for mutations
- Listener system for reactions
- Plugin architecture for extensibility
- But adapted to Woby's reactive model and DOM-based approach

## Constraints

- **Tech Stack**: Must use Woby framework and work as Custom Element `<wui-editor>`
- **Browser Support**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Performance**: Must handle documents with 1000+ paragraphs smoothly
- **Accessibility**: WCAG 2.1 AA compliance required
- **No execCommand**: All operations via direct DOM manipulation with proper normalization

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| DOM-based architecture | Simpler integration with Woby's reactive model, no need for full state tree like Lexical | — Pending |
| Agent browser visualizer testing | Visual verification of selection, styling, interactions across scenarios | — Pending |
| No execCommand | Deprecated, unstable, limited features - proper DOM manipulation required | — Pending |
| Support all platforms (desktop, mobile, tablet, a11y) | Production-ready editor must work everywhere | — Pending |

---

*Last updated: 2026-05-25 after initialization*

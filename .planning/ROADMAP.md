# WUI Rich Text Editor Roadmap

## Overview

Build a production-ready rich text editor for Woby framework through systematic phases. Each phase delivers a complete, tested vertical slice of functionality.

**Total Phases**: 12
**Estimated Duration**: 8-12 weeks (auto mode execution)
**Execution Mode**: Parallel where possible, sequential dependencies
**Testing**: Agent-browser visualizer for every phase

---

## Phase 1: Core Infrastructure & Selection Management

**Goal**: Establish editor foundation with correct selection handling across all scenarios

**Deliverables**:
- Editor surface component with contenteditable
- Selection management module (normalize, restore, manipulate)
- Selection scenarios testing framework
- Browser compatibility layer for Range/Selection API
- Agent-browser visualizer integration

**Why First**: All subsequent features depend on correct selection handling. Without this, nothing works.

**Success Criteria**:
- All 6 selection scenarios work correctly
- Selection persists across operations
- Selection restored after blur/focus
- Works identically in Chrome, Firefox, Safari, Edge
- Visual tests pass for all scenarios

---

## Phase 2: Basic Text Formatting (Inline Styles)

**Goal**: Implement bold, italic, underline with correct cross-paragraph style logic

**Deliverables**:
- Style application module (apply, remove, toggle)
- Style merge/split logic
- Style normalization (merge adjacent, unwrap redundant)
- Toolbar buttons: Bold, Italic, Underline
- Keyboard shortcuts: Ctrl+B, Ctrl+I, Ctrl+U

**Why Second**: Most basic formatting features. Establishes patterns for other styles.

**Dependencies**: Phase 1 (selection management)

**Success Criteria**:
- Styles work across all 6 selection scenarios
- Cross-paragraph styling works
- Nested styles handled correctly
- DOM normalized after every operation
- Keyboard shortcuts work in all browsers

---

## Phase 3: Extended Inline Formatting

**Goal**: Add strikethrough, font family, font size, text color, background color

**Deliverables**:
- Extended style system for font properties
- Font family dropdown component
- Font size dropdown component
- Color picker components (text + background)
- Strikethrough button

**Why Third**: Builds on Phase 2 patterns for additional inline styles

**Dependencies**: Phase 2 (style system foundation)

**Success Criteria**:
- All extended styles work across selection scenarios
- Dropdown UIs functional and accessible
- Colors merge/split correctly
- Font changes handle nested fonts

---

## Phase 4: Paragraph & Alignment

**Goal**: Implement text alignment and indentation

**Deliverables**:
- Alignment buttons (left, center, right, justify)
- Indentation buttons (increase, decrease)
- Block-level style application
- Alignment dropdown component

**Why Fourth**: Block-level operations, different complexity from inline styles

**Dependencies**: Phase 1 (selection management for block detection)

**Success Criteria**:
- Alignment works on single/multiple blocks
- Cross-paragraph partial selection handled
- Indentation works for paragraphs and lists
- CSS classes applied correctly to blocks

---

## Phase 5: Lists (Ordered & Unordered)

**Goal**: Full list functionality with nesting, continuation, transformations

**Deliverables**:
- List insertion logic (P ↔ LI)
- List container management (UL/OL creation/removal)
- List nesting (increase/decrease indent)
- List continuation numbering
- List style dropdown
- Ordered list button
- Unordered list button

**Why Fifth**: Complex block transformation logic, requires solid foundation

**Dependencies**: Phase 4 (block operations foundation)

**Success Criteria**:
- P ↔ LI transformation works bidirectionally
- Cross-paragraph partial selection splits lists correctly
- Nested lists work (3+ levels)
- List numbering continues correctly
- Works in all browsers

---

## Phase 6: Headings & Blockquotes

**Goal**: Implement heading levels and blockquote transformation

**Deliverables**:
- Heading dropdown (H1-H6, Paragraph)
- Heading transformation logic (P ↔ H1-H6)
- Blockquote button
- Blockquote transformation logic

**Why Sixth**: More block transformations building on list patterns

**Dependencies**: Phase 5 (block transformation patterns)

**Success Criteria**:
- P ↔ H1-H6 works bidirectionally
- LI ↔ H1-H6 works (unwrap from list)
- Blockquote applied/removed correctly
- Cross-paragraph selection handled
- Semantic HTML output

---

## Phase 7: Clipboard Operations & Paste Sanitization

**Goal**: Copy, cut, paste with format preservation and security

**Deliverables**:
- Copy handler with HTML/plain text
- Cut handler with removal
- Paste handler with HTML sanitization
- Paste plain text option
- Paste image from clipboard
- XSS prevention layer

**Why Seventh**: Security-critical feature, requires robust sanitization

**Dependencies**: Phase 2 (style system for format preservation)

**Success Criteria**:
- Format preserved on copy/cut/paste
- Malicious HTML stripped on paste
- Cross-paragraph selection copied correctly
- Image paste works
- No XSS vulnerabilities

---

## Phase 8: Rich Content Insertion

**Goal**: Insert images, tables, links, horizontal rules

**Deliverables**:
- Image upload component (file picker, drag-drop)
- Image URL insertion with validation
- Image manipulation (resize, align)
- Table insertion dialog
- Link insertion/edit dialog
- Horizontal rule insertion
- Emoji/symbol picker

**Why Eighth**: Rich content features, expands beyond text editing

**Dependencies**: Phase 1 (selection restoration), Phase 7 (image paste)

**Success Criteria**:
- Image upload/URL works with validation
- Table created with correct structure
- Links inserted with validation
- XSS prevented in URLs
- Content inserted at cursor position

---

## Phase 9: Undo/Redo System

**Goal**: Full undo/redo with state batching and selection restoration

**Deliverables**:
- Undo/redo stack management
- MutationObserver with debouncing
- State batching logic (typing pause threshold)
- Selection restoration after undo/redo
- Undo button, Redo button
- Keyboard shortcuts: Ctrl+Z, Ctrl+Y

**Why Ninth**: Complex state management, requires all features to exist first

**Dependencies**: All previous phases (must track all mutations)

**Success Criteria**:
- Every operation can be undone/redone
- Typing batched correctly (not every keystroke)
- Selection restored after undo/redo
- Stack size limited to prevent memory issues
- Works across all browsers

---

## Phase 10: Keyboard Navigation & Shortcuts

**Goal**: Full keyboard support for navigation and shortcuts

**Deliverables**:
- Arrow key navigation (within/between blocks)
- Tab navigation (list nesting, table cells)
- Enter key handling (new paragraph, list item)
- All formatting shortcuts (Ctrl+B/I/U/etc.)
- Custom shortcut registration
- Keyboard shortcut documentation

**Why Tenth**: Accessibility and power-user feature

**Dependencies**: Phase 9 (undo/redo shortcuts)

**Success Criteria**:
- All navigation works via keyboard
- All shortcuts work in all browsers
- Tab cycles through toolbar buttons
- Enter creates appropriate blocks
- Screen reader announces navigation

---

## Phase 11: Touch Interactions & Mobile

**Goal**: Full touch support for mobile/tablet editing

**Deliverables**:
- Touch event handlers (touchstart/move/end)
- Long-press selection
- Touch-friendly toolbar (larger hit targets)
- Mobile keyboard quirk handling (IME, dead keys)
- Touch scrolling within editor
- Responsive toolbar layout

**Why Eleventh**: Mobile support, requires stable desktop foundation first

**Dependencies**: Phase 2 (all formatting buttons exist)

**Success Criteria**:
- Long-press selection works on mobile
- Touch scrolling smooth
- Toolbar usable on mobile
- IME input works correctly
- Tested on iOS Safari, Chrome Android

---

## Phase 12: Accessibility & Final Polish

**Goal**: WCAG 2.1 AA compliance, performance optimization, final testing

**Deliverables**:
- ARIA roles/labels for all components
- Screen reader live regions
- High contrast mode support
- Performance optimization (virtualization if needed)
- Large document testing (1000+ paragraphs)
- Full test suite execution
- Documentation and examples

**Why Last**: Requires all features complete for full accessibility audit

**Dependencies**: All previous phases

**Success Criteria**:
- JAWS, NVDA, VoiceOver work correctly
- High contrast mode works
- 1000+ paragraph document performs well
- All visual tests pass
- All browsers pass
- Zero known bugs

---

## Execution Notes

**Parallelization Opportunities**:
- Phases 3, 4, 6 can partially overlap with their dependencies
- Research phases run fully parallel
- Testing can be parallelized across browsers

**Risk Areas**:
- Phase 5 (Lists): Most complex block transformations
- Phase 7 (Clipboard): Security-critical, XSS risks
- Phase 9 (Undo/Redo): Complex state management
- Phase 11 (Mobile): Browser/platform fragmentation

**Validation Gates**:
- Every phase must pass visual tests in agent-browser
- Every phase must work across all browsers
- Every phase must handle all 6 selection scenarios
- Security features require code review

---

*Roadmap complete. 12 phases cover all critical requirements.*
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

**Plans**: 3 plans in 3 waves

Plans:
- [x] 01-01-PLAN.md — SelectionManager and BrowserCompat modules with path-based tracking
- [x] 01-02-PLAN.md — DOMNormalizer and StyleEngine with merge/unwrap/clean operations
- [x] 01-03-PLAN.md — UndoRedo enhancement, Editor integration, test suites

**Success Criteria**:
- All 6 selection scenarios work correctly
- Selection persists across operations
- Selection restored after blur/focus
- Works identically in Chrome, Firefox, Safari, Edge
- Visual tests pass for all scenarios

---

## Phase 2: Basic Text Formatting

**Goal**: Implement core inline formatting with DOM manipulation (no execCommand)

**Deliverables**:
- Bold, italic, underline, strikethrough toggle buttons
- Font family dropdown with web-safe fonts
- Font size dropdown (8-72px)
- Text color and background color pickers
- All operations work across all 6 selection scenarios

**Why Second**: Basic formatting is the most common editor operation. Must prove the no-execCommand architecture works reliably.

**Plans**: 2-3 plans (estimated)

**Success Criteria**:
- Toggle on/off works for all selection scenarios
- Nested styles handled correctly (no redundant nesting)
- Partial selections split spans correctly
- Adjacent spans with same style merge automatically
- Visual tests pass for all formatting operations

---

**Total Phases**: 12 (Phase 3-12 to be defined)
**Next Phases**: Extended Inline Formatting, Paragraph & Alignment, Lists, Headings & Blockquotes, Clipboard Operations, Rich Content Insertion, Undo/Redo System, Keyboard Navigation, Touch Interactions, Accessibility & Polish

---

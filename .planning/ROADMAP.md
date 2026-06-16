# WUI Rich Text Editor Roadmap

## Overview

Build a production-ready rich text editor for Woby framework through systematic phases. Each phase delivers a complete, tested vertical slice of functionality.

**Total Phases**: 12 + additional debug/fix phases
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

**Total Phases**: 12 (Phase 3-12 to be defined) + debug/fix phases
**Next Phases**: Extended Inline Formatting, Paragraph & Alignment, Lists, Headings & Blockquotes, Clipboard Operations, Rich Content Insertion, Undo/Redo System, Keyboard Navigation, Touch Interations, Accessibility & Polish

---

## Phase 17: Fix Editor Focus/Blur Architecture

**Goal**: Fix the editor focus/blur architecture so toolbar button clicks preserve text selection

**Deliverables**:
- FocusManager module with selection caching and focus tracking
- Capture-phase mousedown listener on toolbar container
- All toolbar buttons integrated with FocusManager for selection restoration
- Editor immediately usable (contentEditable always true)
- Visual focus affordance and proper toolbar visibility

**Why This Phase**: Toolbar button clicks currently lose text selection because Woby's event delegation prevents `mousedown.preventDefault()` from working. This breaks the core editor workflow — users cannot format text without re-selecting it after each button click.

**Plans**: 3 plans in 3 waves

Plans:
- [ ] 17-01-PLAN.md — FocusManager module with selection caching and focus tracking
- [ ] 17-02-PLAN.md — Wire FocusManager into Editor and all toolbar buttons
- [ ] 17-03-PLAN.md — isEditing default change, visual affordance, edge cases

**Requirements**:
- [FOCUS-01] Clicking any toolbar button preserves text selection
- [FOCUS-02] No blur events fire on the editable area when clicking toolbar
- [FOCUS-03] Bold/italic/underline/alignment/indent all work without losing selection
- [FOCUS-04] Editor is immediately usable (contentEditable starts as true, or has clear affordance)

**Success Criteria**:
- Clicking any toolbar button preserves text selection (FOCUS-01)
- No blur events fire on the editable area when clicking toolbar (FOCUS-02)
- Bold/italic/underline/alignment/indent all work without losing selection (FOCUS-03)
- Editor is immediately usable (contentEditable starts as true, or has clear affordance) (FOCUS-04)

---

## Phase 18: Editor Comprehensive Fix

**Goal**: Fix every correctness bug in the WUI rich text editor so ALL formatting interactions behave identically to MS Word / Google Docs across every combination of activation method, selection type, style operations, selection retention, content integrity, and undo/redo

**Deliverables**:
- Shadow DOM–aware selection API (`getComposedRanges`) throughout BrowserCompat, StyleEngine, FocusManager
- Computed-style–based toggle detection (semantic elements `<strong>/<em>` correctly detected)
- MS Word / Google Docs style-toggle semantics (ALL=remove, ANY-lacking=apply-all, partial→full)
- Cross-block selection handling with editor-root-relative offsets
- `queryCommandState()` removed; replaced with StyleEngine-based selectionchange listener
- Module-level undo/redo state moved inside UndoRedo closure (multi-instance safe)
- `syncChildren()` MutationObserver re-entrancy guard
- Selection restored after every style operation (before and after identical)
- MCP evaluate_script test suite covering all 7 permutation dimensions

**Why This Phase**: All 9 root-cause bugs identified across 7 files. Shadow DOM breaks standard Selection API causing ALL operations to work on wrong DOM nodes. This phase fixes them systematically.

**Plans**: 3 plans in 3 waves

Plans:
- [x] 18-01-PLAN.md — Wave 1: BrowserCompat (D-01) + StyleEngine (D-02, D-03, D-04) + FocusManager (D-11)
- [x] 18-02-PLAN.md — Wave 2: Button active states (D-05) + UndoRedo scoping (D-06) + syncChildren guard (D-07) + selection retention (D-08, D-09)
- [ ] 18-03-PLAN.md — Wave 3: MCP evaluate_script test suite covering all 7 permutation dimensions

**Requirements**:
- [x] [ED-01] Shadow DOM selection uses getComposedRanges throughout
- [x] [ED-02] Computed styles detect semantic elements for toggle logic
- [x] [ED-03] Style toggle matches MS Word / Google Docs semantics
- [x] [ED-04] Cross-block selections handled with editor-root-relative offsets
- [x] [ED-05] Button active states never use queryCommandState
- [x] [ED-06] Multiple editor instances have independent undo/redo state
- [x] [ED-07] syncChildren cannot trigger re-entrant sync cycles
- [x] [ED-08] Selection preserved identically before and after style application (FIXED: priority reversed to offset-first, text-search-fallback)
- [x] [ED-09] FocusManager integrated into all toolbar buttons (manual test verified 2026-06-15)
- [x] [ED-08-CRITICAL-FIX] Selection restoration uses correct occurrence (offset-based first, verified 2026-06-16)
- [ ] [ED-10] All 7 test dimensions pass via MCP evaluate_script

**Success Criteria**:
- Bold/italic/underline toggle behaves identically to Google Docs for all selection types ✅ VERIFIED 2026-06-16
- Bold works on FIRST click ✅ VERIFIED 2026-06-16
- Selection is never cleared after toolbar button click ✅ VERIFIED 2026-06-16
- Selection restored to CORRECT text occurrence (not first match) ✅ VERIFIED 2026-06-16
- Undo reverses every formatting operation; redo restores precisely
- All MCP evaluate_script tests log [TEST] &lt;name&gt;: PASS
- No console errors during any formatting operation ✅ VERIFIED 2026-06-16

---
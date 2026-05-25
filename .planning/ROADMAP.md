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

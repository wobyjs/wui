---
phase: 18
plan: "01"
subsystem: editor-selection
tags: [shadow-dom, selection, computed-style, cross-block, BrowserCompat, StyleEngine, FocusManager]
dependency_graph:
  requires: []
  provides: [shadow-dom-aware-safeGetRange, editor-root-relative-offsets, computed-style-detection]
  affects: [BrowserCompat.ts, StyleEngine.ts, FocusManager.ts]
tech_stack:
  added: []
  patterns: [getComposedRanges, staticRangeToLiveRange, TreeWalker-global-offsets, window.getComputedStyle]
key_files:
  created: []
  modified:
    - src/Editor/BrowserCompat.ts
    - src/Editor/StyleEngine.ts
    - src/Editor/FocusManager.ts
decisions:
  - D-01: safeGetRange upgraded to accept optional shadowRoot param; uses getComposedRanges when available
  - D-02: getComputedStyles replaced with window.getComputedStyle to detect semantic elements
  - D-04: saveSelectionAsOffsets now anchors to editor root, enabling cross-block selection restoration
  - D-11: staticRangeToLiveRange helper converts StaticRange from getComposedRanges to live Range
metrics:
  duration: "244s"
  completed: "2026-06-13T02:57:24Z"
  tasks: 3
  files_modified: 3
---

# Phase 18 Plan 01: Core Selection Infrastructure Summary

Shadow-DOM-aware safeGetRange via getComposedRanges, window.getComputedStyle for semantic element detection, and editor-root-relative global character offsets for cross-block selection restoration.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1.1 | BrowserCompat shadow-DOM-aware safeGetRange + FocusManager + StyleEngine wiring | 6f09da8 | BrowserCompat.ts, FocusManager.ts, StyleEngine.ts |
| 1.2 | StyleEngine getComputedStyles fix + text-decoration-line | ff4cd24 | StyleEngine.ts |
| 1.3 | StyleEngine editor-root-relative character offsets | 7fcc24d | StyleEngine.ts |

## What Was Built

### Task 1.1 — Shadow-DOM-Aware Selection (D-01, D-11)

**BrowserCompat.ts:**
- Added `staticRangeToLiveRange(sr: StaticRange): Range` helper that clones a StaticRange (returned by `getComposedRanges`) to a live Range, because `selection.addRange()` only accepts live Range
- Upgraded `safeGetRange(shadowRoot?: ShadowRoot)` with optional `shadowRoot` parameter: when provided, calls `(sel as any).getComposedRanges({ shadowRoots: [shadowRoot] })` (Chrome 137+, Firefox 142+, Safari 17+), then converts the result via `staticRangeToLiveRange`; falls back to old `getRangeAt(0)` path for older browsers with a dev-mode warning
- Updated `getSelectionInfo()` to call `safeGetRange(sr)` where `sr` is derived from `root.getRootNode()`, replacing the direct `sel.getRangeAt(0)` call

**FocusManager.ts:**
- Added `import { safeGetRange } from './BrowserCompat'`
- Updated `cacheSelection()` to call `safeGetRange(shadowRoot instanceof ShadowRoot ? shadowRoot : undefined)` using `editorEl.getRootNode()`, replacing `sel.getRangeAt(0)`

**StyleEngine.ts (Step 4 of D-01):**
- Added `getEditorShadowRoot(node?: Node | null): ShadowRoot | undefined` helper
- Updated all 6 formatting entry points (`applyStyle`, `removeStyle`, `toggleStyle`, `applyTextAlign`, `applyIndent`, `applyList`) to call `safeGetRange(focusSr)` where `focusSr = getEditorShadowRoot(window.getSelection()?.focusNode)`

### Task 1.2 — Computed Style Detection (D-02)

- Replaced `getComputedStyles()` body: `node.style` → `window.getComputedStyle(node)`; this resolves `<strong>`, `<em>`, `<b>`, `<i>` font-weight/font-style from the UA stylesheet, not just inline styles
- `applyUnderline()`: `applyStyle('textDecoration', 'underline')` → `applyStyle('textDecorationLine', 'underline')`
- `applyStrikethrough()`: `applyStyle('textDecoration', 'line-through')` → `applyStyle('textDecorationLine', 'line-through')`
- Rationale: `getComputedStyle(el).textDecoration` returns shorthand `"underline solid rgb(0,0,0)"` in Chrome; `text-decoration-line` returns the clean `"underline"` value that compares correctly

### Task 1.3 — Cross-Block Selection Offsets (D-04)

- Added `findEditorRoot(node: Node): HTMLElement | null` helper that walks ancestors looking for `[data-editor-root]`
- Replaced `saveSelectionAsOffsets()`: previously used `getBlockParent()` as anchor (returned `null` for cross-block ranges where commonAncestorContainer is the editor div, not a block tag); now uses `findEditorRoot()` and accumulates global character offsets across the entire text tree — returns `{ editorRoot, startOffset, endOffset }`
- Replaced `restoreSelectionFromOffsets()`: now accepts `(editorRoot: HTMLElement, startOffset: number, endOffset: number)` and walks from editor root; uses inclusive boundary `>= currentOffset && <= currentOffset + len` to handle edge positions correctly; wraps `range.setStart/setEnd` in try/catch
- Updated all 5 call sites from `savedSelection.block` → `savedSelection.editorRoot`
- Updated `removeStyle` parameter type: `{ block: HTMLElement | null, ... }` → `{ editorRoot: HTMLElement | null, ... }`
- Updated `normalizeDOM` calls in `applyStyle()` and `removeStyle()` to use `getBlockParent(range.commonAncestorContainer) ?? findEditorRoot(range.commonAncestorContainer)` so cross-block ranges normalize from the editor root

## Deviations from Plan

None — plan executed exactly as written.

## Wave Completion Criteria Verification

1. `safeGetRange()` has optional `shadowRoot?: ShadowRoot` parameter — YES
2. `staticRangeToLiveRange` helper exists in BrowserCompat.ts — YES
3. `getComposedRanges` path taken when `shadowRoot` is provided and API is available — YES
4. FocusManager.ts imports `safeGetRange` from `./BrowserCompat` and uses it in `cacheSelection()` — YES
5. `getSelectionInfo()` calls `safeGetRange` instead of `sel.getRangeAt(0)` — YES
6. `getComputedStyles()` calls `window.getComputedStyle(node)` — YES
7. `applyUnderline()` and `applyStrikethrough()` use `'textDecorationLine'` — YES
8. `saveSelectionAsOffsets()` returns `{ editorRoot, startOffset, endOffset }` shape — YES
9. `restoreSelectionFromOffsets()` signature is `(editorRoot: HTMLElement, startOffset: number, endOffset: number)` — YES
10. All call sites use `savedSelection.editorRoot` — YES (5 sites updated)
11. `removeStyle()` parameter type reflects `editorRoot` — YES
12. All 6 style functions call `safeGetRange(focusSr)` — YES
13. TypeScript compilation: no new errors (pre-existing tsconfig deprecation warnings only)

## Known Stubs

None.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes introduced.

## Self-Check: PASSED

- `src/Editor/BrowserCompat.ts` — modified, exists
- `src/Editor/StyleEngine.ts` — modified, exists
- `src/Editor/FocusManager.ts` — created/modified, exists
- Commit 6f09da8 — exists (Task 1.1)
- Commit ff4cd24 — exists (Task 1.2)
- Commit 7fcc24d — exists (Task 1.3)

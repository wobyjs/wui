---
phase: 18
plan: 02
subsystem: Editor
tags: [buttons, queryCommandState, shadow-dom, undo-redo, mutation-observer, selection]
dependency-graph:
  requires: [18-01]
  provides: [button-active-state, undo-redo-scoping, sync-guard, selection-verification]
  affects: [BoldButton, ItalicButton, UnderlineButton, TextStyleButton, undoredo, Editor, StyleEngine]
tech-stack:
  added: []
  patterns: [COMMAND_STYLE_MAP, re-entrancy guard, D-08 selection verification]
key-files:
  created: []
  modified:
    - src/Editor/StyleEngine.ts
    - src/Editor/TextStyleButton.tsx
    - src/Editor/BoldButton.tsx
    - src/Editor/ItalicButton.tsx
    - src/Editor/UnderlineButton.tsx
    - src/Editor/undoredo.tsx
    - src/Editor/Editor.tsx
decisions:
  - D-05: Replace queryCommandState with hasStyleInRange via COMMAND_STYLE_MAP — shadow-DOM-blind API removed from all buttons
  - D-06: debounceTimer moved into UndoRedo component closure so each editor instance has an independent timer
  - D-07: isSyncing flag added inside useEffect closure so each effect instance has its own re-entrancy guard
  - D-08: selectionTextBefore captured before DOM mutation and compared post-restoration in both applyStyle and removeStyle
metrics:
  duration: ~10 minutes
  completed: 2026-06-13T03:03:52Z
  tasks: 4
  files-modified: 7
---

# Phase 18 Plan 02: Button State + Undo/Redo + Sync Guard + Selection Retention Summary

Wave 2 of the editor comprehensive fix: replaced shadow-DOM-blind `queryCommandState` calls across all buttons with `hasStyleInRange` + `COMMAND_STYLE_MAP`, scoped `debounceTimer` to per-instance closures, guarded `syncChildren` against MutationObserver re-entrancy, and added selection-text verification logging after every style operation.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 2.1 | Remove queryCommandState, add StyleEngine hasStyleInRange (D-05) | 9957b38 | StyleEngine.ts, TextStyleButton.tsx, BoldButton.tsx, ItalicButton.tsx, UnderlineButton.tsx |
| 2.2 | Move debounceTimer into UndoRedo closure, remove dead code (D-06) | 38cbdea | undoredo.tsx |
| 2.3 | Add isSyncing guard to syncChildren (D-07) | 88e862a | Editor.tsx |
| 2.4 | Selection retention verification in applyStyle/removeStyle (D-08) | 8f50581 | StyleEngine.ts |

## Decisions Made

### D-05: queryCommandState replaced with hasStyleInRange
`document.queryCommandState()` is shadow-DOM-blind and always returns `false` for content inside the `<wui-editor>` shadow root. Replaced with `hasStyleInRange()` (now exported from StyleEngine) accessed via `COMMAND_STYLE_MAP` which maps command names (`bold`, `italic`, `underline`, `strikethrough`) to CSS property/value pairs. The new `updateStylesState` in TextStyleButton uses `safeGetRange(shadowRoot)` to pierce the shadow boundary.

### D-06: debounceTimer scoped to component instance
The module-scope `debounceTimer` caused cross-instance timer sharing when two `<wui-editor>` elements were on the same page. Moving it inside the `UndoRedo` function closure gives each instance an independent timer. Dead code (`historyStack`, `currentIndex`, unused `HistoryState` interface) removed after grep confirmed no imports elsewhere.

### D-07: isSyncing flag inside useEffect closure
Placing the guard at component scope would share it across Woby re-renders. Placing it inside the `useEffect(() => {...})` callback means each effect invocation gets its own flag, preventing MutationObserver feedback cycles where shadow DOM writes trigger another sync which triggers another write.

### D-08: Post-restore selection text comparison
`selectionTextBefore = sel.toString()` is captured before any DOM mutation. After `restoreSelectionFromOffsets()`, the restored selection text is compared and a `console.warn` is emitted if they differ (and `selectionTextBefore` was non-empty). This gives the test suite an observable signal without breaking normal operation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing functionality] Removed unused HistoryState interface**
- **Found during:** Task 2.2
- **Issue:** After removing `historyStack` and `currentIndex` (the only usages of `HistoryState`), the interface became dead code. TypeScript would report it as unused in strict mode.
- **Fix:** Removed the `HistoryState` interface declaration.
- **Files modified:** `src/Editor/undoredo.tsx`
- **Commit:** 38cbdea

None of the other plan steps required deviation — all files existed as expected, all functions were at the locations described in the plan.

## Wave Completion Criteria Check

1. `hasStyleInRange` is exported from `StyleEngine.ts` — DONE (added `export` keyword)
2. `TextStyleButton.tsx` has no `document.queryCommandState` calls — DONE
3. `BoldButton.tsx` `handleClick` has no `queryCommandState` — DONE
4. `ItalicButton.tsx` `handleClick` has no `queryCommandState` — DONE
4b. `UnderlineButton.tsx` `handleClick` has no `queryCommandState` — DONE
5. `TextStyleButton.tsx` `updateStylesState` calls `hasStyleInRange` via `COMMAND_STYLE_MAP` — DONE
6. `undoredo.tsx` has `let debounceTimer` inside `UndoRedo` function body — DONE
7. `undoredo.tsx` no longer has module-scope `historyStack` or `currentIndex` — DONE (grep confirmed)
8. `Editor.tsx` `syncChildren` body is wrapped in `if (isSyncing) return` + `try/finally` — DONE
9. `applyStyle()` logs warning if selection text changes after restoration — DONE
10. `removeStyle()` logs warning if selection text changes after restoration — DONE
11. MCP tests 2.1, 2.3, 2.4 — code inspection complete; browser tests require live environment

## Known Stubs

None — all functionality is fully wired. The `applyMap` in `TextStyleButton.handleClick` covers all four commands (bold/italic/underline/strikethrough). The `COMMAND_STYLE_MAP` covers the same set for detection.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes introduced.

## Self-Check: PASSED

Files modified confirmed present:
- `src/Editor/StyleEngine.ts` — `export function hasStyleInRange` present, `selectionTextBefore` capture in both `applyStyle` and `removeStyle`
- `src/Editor/TextStyleButton.tsx` — `COMMAND_STYLE_MAP`, `safeGetRange`, `hasStyleInRange` imports, `updateStylesState` uses new implementation
- `src/Editor/BoldButton.tsx` — `handleClick` has no `queryCommandState`
- `src/Editor/ItalicButton.tsx` — `handleClick` has no `queryCommandState`
- `src/Editor/UnderlineButton.tsx` — `handleClick` has no `queryCommandState`
- `src/Editor/undoredo.tsx` — `debounceTimer` inside function body, no module-scope `historyStack`/`currentIndex`
- `src/Editor/Editor.tsx` — `let isSyncing = false` before `syncChildren`, body wrapped in `try/finally`

Commits confirmed: 9957b38, 38cbdea, 88e862a, 8f50581

TypeScript: `npx tsc --noEmit` shows only pre-existing tsconfig deprecation warnings (not introduced by this wave).

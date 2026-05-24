# Codebase Concerns

**Analysis Date:** 2026-05-24

## Tech Debt

**Editor: Undo/Redo innerHTML manipulation:**
- Issue: `UndoRedo` component uses `innerHTML` for state serialization and restoration (`src/Editor/undoredo.tsx:72`, `src/Editor/undoredo.tsx:145`, `src/Editor/undoredo.tsx:169`). This is fragile for complex DOM structures and does not capture cursor position reliably.
- Files: `src/Editor/undoredo.tsx`
- Impact: Undo/redo may corrupt nested editor content or lose cursor position on complex edits.
- Fix approach: Consider a tree-based diff approach instead of HTML string snapshots.

**Editor: Document.execCommand usage:**
- Issue: `src/Editor/utils.tsx:75` calls `document.execCommand('defaultParagraphSeparator', ...)` and `src/Editor/TextFormatOptionsDropDown.tsx:21` uses `document.execCommand(...)` for formatting. This API is deprecated since 2015 and removed from most browsers.
- Files: `src/Editor/TextFormatOptionsDropDown.tsx`, `src/Editor/utils.tsx`
- Impact: Formatting commands (bold, italic, underline, strikethrough, subscript, superscript, highlight, case transform) may stop working as browser support is removed.
- Fix approach: Replace `execCommand` with `Selection` API + `DocumentOrShadowRoot` methods for all formatting operations.

**Editor: Placeholder icon components:**
- Issue: Several editor toolbar icons are implemented as inline JSX placeholders instead of actual SVGs (`src/Editor/TextFormatOptionsDropDown.tsx:11-17`).
- Files: `src/Editor/TextFormatOptionsDropDown.tsx`
- Impact: UI inconsistency and poor visual fidelity compared to other icons.
- Fix approach: Replace inline placeholder components with actual icon imports.

**TypeScript configuration compromises:**
- Issue: `tsconfig.json` has `strictNullChecks: false`, `noImplicitAny: false`, `noUncheckedIndexedAccess: false`, and `ignoreDeprecations: "6.0"`. These disable key TypeScript safety guarantees to make the build pass.
- Files: `tsconfig.json`, `tsconfig.test.json`, `tsconfig.web.json`
- Impact: Runtime null dereferences, missing type errors, and silent API incompatibilities go undetected at compile time.
- Fix approach: Enable strict checks incrementally and fix violations.

**Stale backup/working files in source tree:**
- Issue: `src/Tabs.copy.tsx` and `src/Tabs.working.tsx` appear to be abandoned working copies of `src/Tabs.tsx`.
- Files: `src/Tabs.copy.tsx`, `src/Tabs.working.tsx`
- Impact: Confusion about which file is the canonical implementation. May cause duplicate component registration or conflicting exports.
- Fix approach: Remove backup files once the current `Tabs.tsx` is confirmed stable.

## Known Bugs

**Wheeler: Header observable reactivity bug:**
- Issue: Previous commit (43cac06) fixed a "Wheeler header observable bug". This indicates the header prop had a history of reactive state management issues.
- Files: `src/Wheeler/Wheeler.tsx:1869`
- Impact: Header may not re-render reactively when its observable value changes.
- Fix approach: Ensure header prop changes trigger re-evaluation via dependency tracking.

**TextAlignDropDown: Alignment detection disabled:**
- Issue: `src/Editor/TextAlignDropDown.tsx:194` has a commented-out TODO for detecting current text alignment. The alignment button state is therefore unreliable.
- Files: `src/Editor/TextAlignDropDown.tsx`
- Impact: Alignment toolbar buttons do not reflect the actual alignment state of the selection.
- Fix approach: Implement selection-based alignment state detection.

## Security Considerations

**Editor: innerHTML usage without sanitization:**
- Issue: Multiple files use `innerHTML` for DOM manipulation: `src/Editor/Editor.tsx:68`, `src/Editor/List.tsx:747`, `src/Editor/utils.tsx:79`, `src/Editor/InsertDropDown.tsx:81`, `src/Editor/utils.tsx:115-116`. No HTML sanitization is applied.
- Files: `src/Editor/Editor.tsx`, `src/Editor/List.tsx`, `src/Editor/utils.tsx`, `src/Editor/InsertDropDown.tsx`
- Impact: If user-provided content is inserted via the editor, XSS is possible. The Editor currently appears to be used internally, but the pattern is unsafe for extension.
- Fix approach: Apply sanitization (e.g., DOMPurify) before innerHTML injection.

**Editor: ShadowRoot selection casting:**
- Issue: `src/Editor/utils.tsx:296` uses `(root as any).getSelection()` without runtime type verification.
- Files: `src/Editor/utils.tsx`
- Impact: Runtime errors if the ShadowRoot does not have `getSelection`.
- Current mitigation: Browser detection via `instanceof ShadowRoot`.
- Recommendations: Add explicit `getSelection` existence check.

## Performance Bottlenecks

**Wheeler: Large component with many RAF-based effects:**
- Issue: `src/Wheeler/Wheeler.tsx` (2093 lines) contains multiple `requestAnimationFrame` loops for drag/fling gestures, wheel snap logic, and visibility state. The component is the largest in the codebase by a significant margin.
- Files: `src/Wheeler/Wheeler.tsx`
- Cause: All drag/wheel logic is embedded in a single monolithic component with hand-rolled animation.
- Improvement path: Extract gesture handling into a dedicated hook or utility module.

**Editor/List: Repeated DOM queries:**
- Issue: `src/Editor/List.tsx` (1193 lines) repeatedly calls `closest()`, `querySelectorAll()`, and DOM traversal methods during list mode switching and indentation.
- Files: `src/Editor/List.tsx`
- Cause: No caching of DOM references across operations.
- Improvement path: Cache DOM element references with observable state.

**app.tsx: 4003-line demo/debugging file:**
- Issue: `src/app.tsx` is 4003 lines and appears to serve as both an app shell and a live demo/debugging harness with commented sections. It is included in the build output.
- Files: `src/app.tsx`
- Impact: TypeScript declaration generation takes longer; potential accidental inclusion in published library.
- Fix approach: Move demo content entirely out of `src/` into a dedicated `docs/` or `demo/` directory, or ensure `app.tsx` is excluded from the published package via `files` in `package.json`.

## Complexity Hotspots

**Editor/utils.tsx (1226 lines):**
- `src/Editor/utils.tsx` is a large utility file with many exported functions handling selection, DOM normalization, and node manipulation. The TODO comments at lines 574 and 764 indicate boundary detection for word-level operations is incomplete.
- High coupling: many functions depend on shared DOM state.
- Recommendation: Split into focused modules (selection.ts, normalization.ts, node-queries.ts).

**Editor/List.tsx (1193 lines):**
- `src/Editor/List.tsx` handles bullet/numbered/checkbox list management with complex state detection logic for active mode. The `switchTag` and `transformListContainer` functions use runtime `any` type casts.

**PropertyForm/DropdownEditor.tsx:**
- Uses runtime augmentation of observable objects with `selectedValue` property attached via `(arrayObservable as any).selectedValue` (`src/PropertyForm/DropdownEditor.tsx:46`, `src/PropertyForm/DropdownEditor.tsx:54`). This is a fragile anti-pattern that bypasses TypeScript and runtime type safety.

## Test Coverage Gaps

**Untested Editor utilities:**
- `src/Editor/utils.tsx` has no co-located test file. The cursor normalization and word boundary logic (lines 574, 764) is completely untested.
- High-risk area: changes to this file can break editor content management silently.

**No unit tests for Wheeler touch/drag gestures:**
- `src/Wheeler/Wheeler.tsx` touch and wheel gesture handling has no isolated unit tests. Only the DateTimeWheeler and MultiWheeler have test files.

**No unit tests for TextField effects:**
- `src/TextField.effect.tsx` and `src/Switch.effect.tsx` define only CSS class strings with no runtime tests.

**No integration tests between Editor and PropertyForm:**
- The editor property inspector (`PropertyForm/`) and the editor itself are tested in isolation. No end-to-end flow tests exist for editing content and having it reflected in property panels.

## Fragile Areas

**PropertyForm editor injection via side effects:**
- `src/PropertyForm/BooleanEditor.tsx:54` and `src/PropertyForm/ColorEditor.tsx:78` use `Editors([...$$(Editors) as any, ...])` to register editors as a side effect. This global registration pattern is order-dependent and hard to test.
- Safe modification: ensure these files are imported before any property editing occurs.

**MultiWheeler and DateTimeWheeler dynamic property access:**
- `src/Wheeler/DateTimeWheeler.tsx:14` and `src/Wheeler/MultiWheeler.tsx:10` use `null` returns and have `catch` blocks that swallow errors silently (`catch (e) { return null }`). This masks failures during date/number parsing.

**Editor/List switchTag runtime polymorphism:**
- `src/Editor/List.tsx:228` uses `config: any` parameter type. Combined with `innerHTML` injection for list wrapping, this creates a fragile code path that is difficult to reason about.

## Deprecated Code Usage

**document.execCommand (removed from browsers):**
- All text formatting in the editor toolbar relies on `document.execCommand()`, which was deprecated in 2015 and removed from Firefox 69+ and Chrome 97+.
- Files: `src/Editor/TextFormatOptionsDropDown.tsx:21`, `src/Editor/TextFormatOptionsDropDown.tsx:24`, `src/Editor/utils.tsx:75`
- This is the most critical deprecation issue in the codebase.

**TypeScript 5.x ignoreDeprecations:**
- `tsconfig.json` uses `"ignoreDeprecations": "6.0"` to suppress errors that arise from upgrading to TypeScript 6. This is a temporary measure that will stop working once TypeScript 7 is released.

## Missing Critical Features

**No keyboard accessibility for Wheeler:**
- The `Wheeler` component lacks keyboard navigation support (arrow keys, Enter to select, Escape to close). This blocks usage in non-mouse environments.

**No internationalization support:**
- All UI strings (toolbar labels, dropdown options, placeholder text) are hardcoded in English. No i18n infrastructure exists.

**No mobile/touch handling for Editor toolbar:**
- The Editor toolbar buttons have no touch event handling. Tooltips and dropdowns may not work correctly on touch-only devices.

---

*Concerns audit: 2026-05-24*
# Phase 18: Editor Comprehensive Fix — Context

**Gathered:** 2026-06-13
**Status:** Ready for planning
**Source:** User session — direct requirements + codebase audit

<domain>
## Phase Boundary

Fix every correctness bug in the WUI rich text editor so that ALL formatting interactions
behave identically to MS Word / Google Docs across every combination of:
- Activation method: keyboard / mouse / touch / pointer events
- Selection type: caret-only / partial / full-block / cross-paragraph / cross-tag / nested-tag
- Style operations: same-button toggle (bold→bold removes), different-button merge (bold+italic),
  sequential-toggle (bold→italic→bold-off leaves italic), cross-boundary formatting
- Selection retention: selection MUST survive every toolbar button click and style application
- Content integrity: DOM before/after style application must be verifiable via MCP evaluate_script
- Undo/redo: every operation must be reversible; redo must restore state precisely

Scope does NOT include: adding new formatting types, new toolbar buttons, or changing
toolbar visibility (click-to-activate is kept as-is per user decision).

</domain>

<decisions>
## Implementation Decisions

### D-01: Shadow DOM Selection API
Use `Selection.getComposedRanges({shadowRoots: [shadowRoot]})` instead of
`window.getSelection().getRangeAt(0)` everywhere the editor operates across shadow
DOM boundaries. Fall back to `getRangeAt(0)` only when inside same-document context
(non-shadow-DOM usage of the editor). `BrowserCompat.safeGetRange()` is the single
choke-point — fix it once, all callers inherit the fix.

### D-02: Computed Style Detection
Replace `node.style.getPropertyValue(prop)` with `window.getComputedStyle(node).getPropertyValue(prop)`
in `StyleEngine.hasStyle()`. This makes semantic elements (`<strong>`, `<em>`, `<b>`, `<i>`,
`<u>`, `<s>`) correctly detected for toggle logic, matching Google Docs behavior where
bold-on-`<strong>`-text toggles bold off.

### D-03: Style Toggle Semantics (MS Word / Google Docs behavior)
- If ALL text in selection has the style → REMOVE it (toggle off)
- If ANY text in selection lacks the style → APPLY to all (toggle on, partial → full)
- Collapsed caret: toggle affects the next characters typed (type-ahead style)
- This is the standard behavior in Word, Docs, Notion, etc.

### D-04: Cross-Block Selection Handling
`saveSelectionAsOffsets()` must handle selections that span multiple block elements.
Use editor-root-relative offsets instead of block-relative offsets. Walk the entire
editor subtree to compute a global character offset from the editor root.

### D-05: Button Active States — Replace queryCommandState
Remove all `document.queryCommandState()` calls. Replace with a `selectionchange`
listener that calls the StyleEngine's own `hasStyleInRange()` (after D-02 fix) to
determine if the selection is bold/italic/underline/etc. This makes active state
shadow-DOM-aware.

### D-06: Undo/Redo Scoping
Move `debounceTimer`, `historyStack`, `currentIndex` from module-level to inside the
`UndoRedo` component closure. This prevents multiple editor instances from sharing state.

### D-07: Light/Shadow DOM Sync — MutationObserver Guard
`EditorSurface.syncChildren()` runs on every mutation, including mutations it caused.
Add a guard flag (`let isSyncing = false`) to prevent re-entrant sync cycles. Only
sync when light DOM changes, not when shadow DOM changes.

### D-08: Selection Retention After Style Application
Every `applyStyle()` / `removeStyle()` call MUST restore the user's selection after DOM
manipulation. The `restoreSelectionFromOffsets()` function must use D-01 (getComposedRanges)
for restoration within shadow DOM. Selection must be identical (same text highlighted)
before and after the operation — verified by evaluating `window.getSelection().toString()`
before and after in MCP test suite.

### D-09: Test Suite Format — MCP evaluate_script with AI Monitoring
Tests are MCP `evaluate_script` calls embedded in plan tasks. Each test task:
1. Sets up a known editor state (inject HTML via editor.innerHTML or programmatic selection)
2. Performs the action (clicks button, keyboard shortcut, touch event)
3. Asserts the result (DOM structure, selection state, console errors)
The AI agent monitors each assertion in real-time via `list_console_messages()`.

### D-10: Toolbar Visibility — Keep Click-to-Activate
No change to `isEditing` gate or toolbar rendering condition. Per user decision.

### D-11: FocusManager Selection Cache — Invalidation on DOM Change
`FocusManager.cacheSelection()` stores child-index paths. After `applyStyleToRange()`
replaces text nodes with `<span>` wrappers, the cached path is stale. Fix: cache BEFORE
DOM manipulation (already done in `beginCommand()`), but also support re-caching from
`getComposedRanges()` output (D-01).

### D-12: Shadow Root Access Pattern
Editor content lives in the shadow root of `<wui-editor>`. To get the shadow root:
```javascript
const host = document.querySelector('wui-editor') // or 'wui-editor#editor-root'
const shadowRoot = host.shadowRoot
const editorDiv = shadowRoot.querySelector('[data-editor-root]')
```
All MCP test scripts must pierce shadow root this way before querying editor content.

### Claude's Discretion
- Exact order of wave execution (researcher may reorder)
- Whether to create a dedicated `selectionUtils.ts` module or fix in-place
- Whether to use `StaticRange` (from getComposedRanges) vs cloned live `Range` internally
- Animation/transition behavior during toolbar state updates

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core Editor Files (all modified in this phase)
- `src/Editor/BrowserCompat.ts` — safeGetRange, safeGetSelection (D-01 fix point)
- `src/Editor/StyleEngine.ts` — applyStyle, removeStyle, hasStyleInRange, getComputedStyles (D-02, D-03, D-04, D-08)
- `src/Editor/FocusManager.ts` — cacheSelection, restoreSelection (D-11)
- `src/Editor/undoredo.tsx` — debounceTimer, UndoRedo component (D-06)
- `src/Editor/Editor.tsx` — syncChildren, MutationObserver guard (D-07)
- `src/Editor/BoldButton.tsx` — handleClick, queryCommandState removal (D-05)
- `src/Editor/DOMNormalizer.ts` — mergeTextNodes, normalizeDOM (verify cross-block behavior)

### Supporting Files (read for patterns, may need minor updates)
- `src/Editor/ItalicButton.tsx` — same queryCommandState pattern as Bold
- `src/Editor/UnderlineButton.tsx` — same pattern
- `src/Editor/TextStyleButton.ts` — updateStylesState function
- `src/Editor/utils.tsx` — getCurrentRange, getCurrentEditor
- `editor-demo.html` — test target page (http://localhost:5179/editor-demo.html)

### GSD Artifacts
- `.planning/STATE.md` — project state
- `.planning/ROADMAP.md` — phase definitions
- `.planning/phases/17-focus-blur-architecture/17-01-PLAN.md` — FocusManager prior work
- `.planning/phases/16-editor-interaction/` — prior bug fixes

</canonical_refs>

<specifics>
## Specific Requirements from User

### 7 Test Permutation Dimensions (ALL must be covered in test suite)
1. **Activation method**: send key / mouse / touch / pointer to activate editor
2. **Selection type**: no selection (caret only) / partial / full select / cross-boundary
3. **Content type**: word / paragraph / cross-tag / nested-tag selection
4. **Toggle sequences**: same button 1/2/3/4/5 times (apply→remove→apply...); different buttons (bold then italic → merged style); sequential toggle (bold→italic→bold-off = italic only remains)
5. **Selection retention**: selection MUST NOT be cleared after applying style
6. **Content verification**: verify DOM content before AND after style applied (using getComposedRanges + MCP evaluate_script)
7. **Undo/Redo integrity**: every operation must be undoable; redo must restore precisely

### Shadow DOM Selection Pattern (user-provided reference)
```javascript
// CORRECT way to get selection across shadow DOM
const selection = window.getSelection()
const shadowRoot = document.querySelector('wui-editor').shadowRoot
const composedRanges = selection.getComposedRanges({ shadowRoots: [shadowRoot] })
if (composedRanges.length > 0) {
  const activeRange = composedRanges[0]
  // These point to actual text nodes inside shadow root
  console.log("Start:", activeRange.startContainer, activeRange.startOffset)
  console.log("End:", activeRange.endContainer, activeRange.endOffset)
}

// CORRECT way to set selection inside shadow DOM
const host = document.querySelector('wui-editor')
const internalShadow = host.shadowRoot
const editorDiv = internalShadow.querySelector('[data-editor-root]')
const startTextNode = editorDiv.querySelector('p').childNodes[0]
const endTextNode = editorDiv.querySelector('p').childNodes[0]
const newRange = document.createRange()
newRange.setStart(startTextNode, 0)
newRange.setEnd(endTextNode, 5)
const selection = window.getSelection()
selection.removeAllRanges()
selection.addRange(newRange)
```

### MCP Test Pattern (user decision D-09)
- AI agent monitors tests via `list_console_messages()` in real-time
- Tests use `evaluate_script` to set state, perform action, assert result
- Each test logs: `[TEST] <name>: PASS` or `[TEST] <name>: FAIL - <reason>`
- Test runner auto-continues to next test; agent reads failures and investigates

### MS Word / Google Docs Reference Behaviors
- Bold on partially-bold selection → makes ALL bold (not toggle off partial)
- Bold on ALL-bold selection → removes bold from all
- Bold on caret inside bold text → next typed chars are normal
- Bold then Italic → text is bold+italic (styles merge, not replace)
- Bold then Italic then Bold → text is italic only (bold toggled off, italic remains)
- Selection is preserved after EVERY toolbar action
- Undo undoes the formatting change; selection returns to pre-format state

</specifics>

<deferred>
## Deferred Ideas

- New formatting types (subscript, superscript, code blocks)
- Toolbar always-visible mode (user chose to keep click-to-activate)
- IME/CJK input handling improvements
- Virtual scrolling for 1000+ paragraph performance
- Clipboard paste with format detection

</deferred>

---

*Phase: 18-editor-comprehensive-fix*
*Context gathered: 2026-06-13 via direct user session*

# Phase 18 Research: Editor Comprehensive Fix

**Researched:** 2026-06-13
**Domain:** Rich text editor, Shadow DOM Selection API, contentEditable DOM manipulation
**Confidence:** HIGH (core API facts verified via MDN/caniuse), MEDIUM (behavioral semantics from ProseMirror source), LOW (some Quill internals from secondary sources)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Use `Selection.getComposedRanges({shadowRoots:[shadowRoot]})` everywhere instead of `getRangeAt(0)`. `BrowserCompat.safeGetRange()` is the single fix point.
- **D-02:** Replace `node.style.getPropertyValue(prop)` with `window.getComputedStyle(node).getPropertyValue(prop)` in `StyleEngine.hasStyle()`.
- **D-03:** Toggle semantics: ALL styled -> remove; ANY unstyled -> apply to all; collapsed caret -> type-ahead style.
- **D-04:** `saveSelectionAsOffsets()` must use editor-root-relative (global) character offsets, not block-relative.
- **D-05:** Remove all `document.queryCommandState()` calls. Replace with `selectionchange` listener calling `StyleEngine.hasStyleInRange()`.
- **D-06:** Move `debounceTimer`, `historyStack`, `currentIndex` from module-level into the `UndoRedo` component closure.
- **D-07:** Add `let isSyncing = false` guard to `syncChildren()` to prevent re-entrant MutationObserver cycles.
- **D-08:** Every `applyStyle()`/`removeStyle()` must restore selection after DOM manipulation using D-01 approach.
- **D-09:** Tests are MCP `evaluate_script` calls; agent monitors via `list_console_messages()`.
- **D-10:** Keep click-to-activate toolbar as-is. No change.
- **D-11:** `FocusManager.cacheSelection()` caches before DOM manipulation (already in `beginCommand()`); support re-caching from `getComposedRanges()`.
- **D-12:** Shadow root access: `document.querySelector('wui-editor').shadowRoot.querySelector('[data-editor-root]')`.

### Claude's Discretion

- Exact wave execution order
- Whether to create a dedicated `selectionUtils.ts` module or fix in-place
- Whether to use `StaticRange` (from getComposedRanges) vs cloned live `Range` internally
- Animation/transition behavior during toolbar state updates

### Deferred Ideas (OUT OF SCOPE)

- New formatting types (subscript, superscript, code blocks)
- Toolbar always-visible mode
- IME/CJK input handling improvements
- Virtual scrolling for large documents
- Clipboard paste with format detection
</user_constraints>

---

## Summary

Phase 18 fixes six distinct correctness bugs in the WUI rich text editor, all stemming from the same root cause: the editor runs inside a Shadow DOM (`<wui-editor>` custom element) but its selection, style detection, and state management code assumes a flat document context.

The most critical fix is **D-01**: every path that calls `window.getSelection().getRangeAt(0)` is shadow-DOM-blind. The browser's `Selection` object deliberately hides nodes inside shadow roots unless you call the new `getComposedRanges()` API and pass the shadow root. This API became cross-browser baseline in August 2025 (Chrome 137+, Firefox 142+, Safari 17+) with ~81% global coverage, so a `getRangeAt(0)` fallback is required for older browsers.

The second critical fix is **D-02**: `StyleEngine.getComputedStyles()` currently returns `node.style` (only inline styles), which misses `<strong>`, `<em>`, `<b>`, `<i>`, `<u>` semantic elements. `window.getComputedStyle(node)` resolves all CSS including UA stylesheet bold on `<strong>`. Browsers return `"700"` (not `"bold"`) as the computed font-weight. The existing `normalizeFontWeight()` in StyleEngine already handles this correctly once the input source is fixed.

The remaining fixes (D-03 through D-08) are interdependent: correct toggle semantics require correct style detection (D-02), which requires correct range access (D-01), which requires correct selection restoration after DOM changes (D-08), which requires editor-root-relative offsets (D-04) rather than block-relative offsets that break across paragraph boundaries.

**Primary recommendation:** Fix in this order: D-01 (BrowserCompat) -> D-02 (StyleEngine.hasStyle) -> D-04 (saveSelectionAsOffsets to global offsets) -> D-08 (restoreSelectionFromOffsets using composed range) -> D-03 (toggle semantics) -> D-05 (selectionchange active state) -> D-06 (undo/redo scoping) -> D-07 (MutationObserver guard).

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Shadow DOM range access | Browser (BrowserCompat.ts) | -- | Single choke-point; all callers inherit fix |
| Style detection (has bold?) | StyleEngine.ts | BrowserCompat.ts (for range) | Logic owns property inspection |
| Toggle semantics | StyleEngine.ts | -- | applyStyle/removeStyle control branching |
| Selection save/restore | StyleEngine.ts + FocusManager.ts | BrowserCompat.ts | Both need post-mutation restoration |
| Button active state | BoldButton/ItalicButton/etc. | StyleEngine.ts | Buttons listen, StyleEngine evaluates |
| Undo/redo history | undoredo.tsx | Editor.tsx (saveDo trigger) | State lifecycle lives in UndoRedo component |
| Light/Shadow DOM sync | Editor.tsx (syncChildren) | -- | MutationObserver guard stops re-entrancy |

---

## 1. getComposedRanges() API

### Exact Signature

```typescript
// Current spec (August 2025 baseline)
getComposedRanges(options?: { shadowRoots?: ShadowRoot[] }): StaticRange[]
```

The parameter was changed from a rest-parameter style (`...shadowRoots`) to a dictionary object (`{ shadowRoots: [...] }`) per the final specification. Use the dictionary form. [VERIFIED: MDN]

### Browser Support

| Browser | First Version | Notes |
|---------|--------------|-------|
| Chrome | 137 | Shipped stable ~May 2025 |
| Firefox | 142 | Shipped ~mid 2025 |
| Safari | 17.0 | Shipped earliest (~Sep 2023) |
| Edge | ~137 | Follows Chromium |
| Global coverage | ~81% | Per caniuse.com as of research date |

[VERIFIED: caniuse.com/mdn-api_selection_getcomposedranges]

### Return Value Behavior

- Returns an **array of `StaticRange` objects** (not live `Range` objects).
- The array contains **exactly one element** in normal single-selection scenarios (the spec notes only one is expected currently).
- Returns an **empty array** when there is no active selection (verified by WebKit's own test suite: `getComposedRanges()` returns empty sequence when nothing is selected). [VERIFIED: WebKit LayoutTests]
- If shadow roots are NOT passed in `options.shadowRoots` and the selection endpoint is inside a shadow tree, the range is **re-scoped** to the shadow host element. You get the host node, not the actual text node inside the shadow root. This is the exact bug D-01 fixes: without passing the shadow root, `getComposedRanges()` returns a range ending at `<wui-editor>`, not at the text node inside it.

### StaticRange vs Live Range

| Property | `StaticRange` (from getComposedRanges) | Live `Range` (from getRangeAt) |
|----------|----------------------------------------|-------------------------------|
| DOM updates | Fixed in time; does NOT auto-update when DOM changes | Live-updating; adjusts boundaries as DOM changes |
| Performance | Lighter weight | More resource-intensive |
| `collapsed` | Supported (inherits AbstractRange) | Supported |
| `startContainer/endContainer` | Shadow-root-aware nodes | Shadow-root-blind |
| `selection.addRange()` | **NOT accepted** -- addRange requires a live Range | Accepted |

[VERIFIED: MDN StaticRange, MDN AbstractRange]

### Cannot Pass StaticRange to addRange -- Must Clone

`selection.addRange()` only accepts a live `Range`. When restoring selection from a `StaticRange` obtained via `getComposedRanges`, clone it to a live Range:

```typescript
// CORRECT: clone StaticRange to live Range for addRange()
function staticRangeToLiveRange(staticRange: StaticRange): Range {
    const range = document.createRange()
    range.setStart(staticRange.startContainer, staticRange.startOffset)
    range.setEnd(staticRange.endContainer, staticRange.endOffset)
    return range
}

// Usage pattern for BrowserCompat.safeGetRange():
export function safeGetRange(shadowRoot?: ShadowRoot): Range | null {
    const sel = window.getSelection()
    if (!sel) return null

    // Try getComposedRanges first for shadow DOM awareness
    if (shadowRoot && typeof (sel as any).getComposedRanges === 'function') {
        const composed = (sel as any).getComposedRanges({ shadowRoots: [shadowRoot] })
        if (composed.length > 0) {
            return staticRangeToLiveRange(composed[0])
        }
        return null
    }

    // Fallback: getRangeAt (works for same-document, non-shadow usage)
    if (sel.rangeCount === 0) return null
    return sel.getRangeAt(0)
}
```

[ASSUMED: The fallback `getRangeAt(0)` is appropriate for non-shadow-DOM usage of the editor component.]

### Fallback Strategy for Older Browsers

For browsers that do not support `getComposedRanges` (Chrome < 137, Firefox < 142):
1. Check `typeof selection.getComposedRanges === 'function'` before calling.
2. Fall back to `sel.getRangeAt(0)`.
3. Add a console warning in dev mode: `[BrowserCompat] getComposedRanges not supported; shadow DOM selection may be inaccurate.`
4. The fallback will work for same-document selections but will fail when focus is inside the shadow root. Document this limitation.

---

## 2. MS Word / Google Docs Style Toggle Semantics

### Canonical Algorithm (verified against CONTEXT.md D-03 and ProseMirror source)

```
function toggleBold(selection):
    allBold = ALL text nodes in selection have bold
    if allBold:
        REMOVE bold from all text in selection
    else:  // partially bold OR no bold
        APPLY bold to all text in selection
    restore selection
```

This is the standard behavior in Microsoft Word, Google Docs, and Notion. [VERIFIED: CONTEXT.md D-03 from user]

### ProseMirror's toggleMark Implementation

ProseMirror checks `state.doc.rangeHasMark(from, to, markType)` across all ranges. With `removeWhenPresent: true` (the default), the logic is:

```
add = !ranges.some(r => state.doc.rangeHasMark(r.$from.pos, r.$to.pos, markType))
```

This means `add = true` only if NO range has the mark. The behavior with the default is: "if ANY range has bold, remove from all." With `removeWhenPresent: false`, the behavior becomes: "if not ALL ranges have bold, apply to all" -- which matches Word/Docs. [VERIFIED: ProseMirror prosemirror-commands source via WebFetch]

**Summary for WUI**: The correct toggle check is `allStyled = hasStyleInRange(range, prop, value)` (all must be styled to remove; any missing means apply). The existing `toggleStyle()` in StyleEngine.ts already has this logic correctly (lines 860-895). The only fix needed for D-03 is the D-02 fix (switch to getComputedStyle).

### Quill's Active State Detection

Quill's `getFormat()` returns a format (e.g., bold) only when it is uniformly applied across the ENTIRE selection. If partial, bold is not included in the returned formats, so the toolbar shows it as inactive, and clicking applies to all. This matches Word/Docs behavior. [VERIFIED: Quill source via WebFetch]

### Collapsed Caret Behavior

When a caret (collapsed selection) is inside bold text and the user presses Bold:
- Check `hasStyle(range.startContainer, prop, value)` -- after D-02, this uses `getComputedStyle`.
- If bold: subsequent typed characters should be plain (remove bold for type-ahead).
- Implementation: the existing `insertStyledEmptySpan` approach handles the apply case. For the remove case at caret, the existing `removeStyle()` traverses parent spans -- this is structurally correct once D-02 is in place.

---

## 3. Cross-Block Selection Handling

### What `commonAncestorContainer` Returns for Cross-Block

For a selection spanning two sibling `<p>` elements inside the editor `<div>`:

```
<div data-editor-root>
  <p>First paragraph</p>
  <p>Second paragraph</p>
</div>
```

If the range starts in `<p>` one and ends in `<p>` two, `range.commonAncestorContainer` is the **parent `<div>`** -- the `data-editor-root` element. [VERIFIED: MDN Range.commonAncestorContainer]

### TreeWalker with Cross-Block Root

When `document.createTreeWalker(commonAncestorContainer, NodeFilter.SHOW_TEXT)` is called with the editor `<div>` as root, the walker **DOES walk into both `<p>` elements** and returns all text nodes in document order. The existing TreeWalker approach in `hasStyleInRange()` and `applyStyleToRange()` is structurally correct for cross-block.

**The actual bug** is in `saveSelectionAsOffsets()` (StyleEngine.ts line 167-199): it calls `getBlockParent(range.commonAncestorContainer)` to find the block anchor. For cross-block ranges, `range.commonAncestorContainer` is the editor `<div>` itself, which is NOT in the `BLOCK_TAGS` list (`P/H1/H2.../etc.`). `getBlockParent()` returns `null`, so `saveSelectionAsOffsets()` returns `{ block: null, startOffset: 0, endOffset: 0 }`, and selection restoration is entirely skipped.

### Correct Algorithm for Cross-Block Selection Offsets (D-04)

Use the editor root (`[data-editor-root]`) as the anchor and walk ALL text nodes in the entire editor subtree, accumulating global character offsets:

```typescript
function findEditorRoot(node: Node): HTMLElement | null {
    let current: Node | null = node
    while (current) {
        if (current instanceof HTMLElement &&
            current.dataset !== undefined &&
            'editorRoot' in current.dataset) {
            return current
        }
        current = current.parentNode
    }
    return null
}

function saveSelectionAsGlobalOffsets(
    range: Range
): { editorRoot: HTMLElement | null; startOffset: number; endOffset: number } {
    const editorRoot = findEditorRoot(range.commonAncestorContainer)
    if (!editorRoot) return { editorRoot: null, startOffset: 0, endOffset: 0 }

    const walker = document.createTreeWalker(editorRoot, NodeFilter.SHOW_TEXT, null)
    let currentOffset = 0
    let startOffset = -1
    let endOffset = -1
    let node: Node | null

    while ((node = walker.nextNode())) {
        const textNode = node as Text
        const len = textNode.textContent?.length ?? 0

        if (startOffset === -1 && node === range.startContainer) {
            startOffset = currentOffset + range.startOffset
        }
        if (endOffset === -1 && node === range.endContainer) {
            endOffset = currentOffset + range.endOffset
        }

        currentOffset += len
        if (startOffset !== -1 && endOffset !== -1) break
    }

    return { editorRoot, startOffset, endOffset }
}
```

Restoration mirrors this: walk from the editor root, counting characters until reaching the saved offsets.

### TreeWalker Does Walk Both Paragraphs -- Confirmed

The existing `applyStyleToRange()` (lines 432-508) uses a TreeWalker rooted at `commonAncestorContainer` with `compareBoundaryPoints` filtering. Since `commonAncestorContainer` is the editor `<div>` for cross-block selections, the walker correctly visits text nodes in both paragraphs. No structural change needed in `applyStyleToRange()` for cross-block; the only change is in `saveSelectionAsOffsets()`.

---

## 4. Computed Style Detection for Semantic Elements

### What `getComputedStyle` Returns

| Element / Inline Style | `getComputedStyle().fontWeight` | Browser |
|------------------------|--------------------------------|---------|
| `<strong>` or `<b>` | `"700"` | Chrome, Firefox [VERIFIED: multiple sources] |
| `<strong>` or `<b>` | `"bold"` | Safari (some versions) [ASSUMED] |
| `<span style="font-weight:bold">` | `"700"` | Chrome, Firefox [VERIFIED] |
| Normal `<p>` with no bold | `"400"` | All browsers [ASSUMED] |

The existing `normalizeFontWeight()` in StyleEngine.ts already maps `"bold"` -> `"700"` and vice versa. This normalization is correct and handles the Chrome/Safari difference transparently. No change needed in normalization logic.

| Element | `getComputedStyle().fontStyle` |
|---------|-------------------------------|
| `<em>` or `<i>` | `"italic"` | All browsers [ASSUMED] |

### Text Decoration: `textDecorationLine` vs `textDecoration` Shorthand

This is a significant cross-browser pitfall:

- `getComputedStyle(el).textDecoration` in Chrome returns a **shorthand** string like `"underline solid rgb(0, 0, 0)"` -- NOT just `"underline"`. [ASSUMED based on CSS shorthand computed value behavior]
- `getComputedStyle(el).textDecorationLine` returns only the line type: `"underline"`, `"line-through"`, `"none"`. [ASSUMED]
- `getComputedStyle(el).getPropertyValue('text-decoration-line')` is the reliable cross-browser way to check.

**Action required for D-02**: When checking for underline or strikethrough, use `text-decoration-line` as the CSS property name in `hasStyle()`, not `text-decoration`. Verify that `applyUnderline()` and `applyStrikethrough()` store the style using the same property name as what `hasStyle()` checks.

Currently `applyUnderline()` calls `applyStyle('textDecoration', 'underline')` which stores as `span.style['textDecoration'] = 'underline'`. The corresponding `hasStyle()` check should use `text-decoration-line`, not `text-decoration`. There is a mismatch that needs resolving.

### Inherited Computed Styles

`getComputedStyle(span)` includes inherited values from parent elements. A `<span>` inside `<strong>` will report `fontWeight: "700"` even if the span has no inline style. This is the correct behavior for "does this text appear bold?" detection and is exactly what D-02 achieves. [VERIFIED: CSS specification]

---

## 5. queryCommandState() Replacement Pattern

### What queryCommandState('bold') Does Internally

`document.queryCommandState('bold')` checks whether the browser's internal bold state is active at the current selection. It operates on the **flat document** selection (shadow-DOM-blind) and queries the browser's own formatting detection. It is deprecated and behavior is browser-specific. [VERIFIED: MDN Document.queryCommandState]

### Current Bug in BoldButton.tsx (line 54)

```typescript
// BROKEN: runs after applyBold() which operated inside shadow DOM
isActive(document.queryCommandState(command))
```

`queryCommandState` cannot see shadow DOM content, so it always returns `false` for content inside the `<wui-editor>` shadow root. The button's active state is persistently wrong.

### Correct Replacement Pattern

The `selectionchange` handler in BoldButton.tsx already calls `updateStylesState(isActive, editor, command)`. The fix is to update `TextStyleButton.updateStylesState` to use `hasStyleInRange` from StyleEngine (after D-02 fix) rather than `queryCommandState`:

```typescript
// In TextStyleButton.ts -- replace queryCommandState with StyleEngine
import { safeGetRange } from './BrowserCompat'
import { hasStyleInRange } from './StyleEngine'  // expose this function

export function updateStylesState(
    isActive: Observable<boolean>,
    editor: Observable<HTMLDivElement> | null,
    command: string,
    shadowRoot?: ShadowRoot
): void {
    const range = safeGetRange(shadowRoot)  // D-01 fix
    if (!range) {
        isActive(false)
        return
    }
    // Map command name to style property+value
    const styleMap: Record<string, { prop: string; value: string }> = {
        bold: { prop: 'fontWeight', value: 'bold' },
        italic: { prop: 'fontStyle', value: 'italic' },
        underline: { prop: 'textDecorationLine', value: 'underline' },
        strikethrough: { prop: 'textDecorationLine', value: 'line-through' },
    }
    const entry = styleMap[command]
    if (!entry) { isActive(false); return }
    isActive(hasStyleInRange(range, entry.prop, entry.value))
}
```

Also remove `isActive(document.queryCommandState(command))` from `BoldButton.handleClick()`.

### How Tiptap Tracks Active State

Tiptap listens to ProseMirror's `onSelectionUpdate` event, then calls `editor.isActive('bold')` which inspects the active marks at the cursor position from the document model. The WUI equivalent is the `selectionchange` + `getComputedStyle`-based check described above. [CITED: tiptap.dev/docs/editor/api/events]

---

## 6. MutationObserver Re-entrancy Guard

### Timing: Microtask, Not Synchronous

MutationObserver callbacks are scheduled as **microtasks** -- they fire asynchronously after the current synchronous script completes but before the next event loop task. Multiple DOM mutations in the same synchronous call are batched into a single callback invocation. [VERIFIED: MDN MutationObserver]

This means: if `syncChildren()` runs synchronously and modifies the shadow DOM, the callback does NOT re-fire synchronously inside the current call -- it fires on the **next microtask**. However, the cycle still occurs:

1. Light DOM changes -> light DOM MutationObserver fires `syncChildren()` (microtask 1)
2. `syncChildren()` writes to shadow DOM -> shadow DOM MutationObserver fires `saveDo()` (microtask 2)
3. `saveDo()` modifies Woby observables -> Woby reactive re-render -> may modify light DOM -> goto 1

The `isSyncing` guard breaks this at step 1: if `syncChildren()` is already running (via step 3 looping back), the guard prevents it from running again.

### Two Guard Approaches

**Approach A: Boolean flag (isSyncing)** -- recommended for D-07

```typescript
// Inside the useEffect that creates syncChildren and the observer
let isSyncing = false

const syncChildren = () => {
    if (isSyncing) return
    isSyncing = true
    try {
        // ... all DOM operations ...
    } finally {
        isSyncing = false
    }
}
```

**Approach B: Disconnect/Reconnect** -- alternative but has a reconnect-window race condition

```typescript
const syncChildren = () => {
    observer.disconnect()
    try {
        // ... DOM operations ...
    } finally {
        observer.observe(host, observerOptions)
    }
}
```

[VERIFIED: MDN MutationObserver -- "call disconnect() before making changes to stop the observer triggering again"]

**Recommendation for D-07**: Use Approach A. Approach B risks losing mutations that fire in the window between `observe.disconnect()` and the `finally` reconnect.

### Current Code Gap (verified by reading Editor.tsx lines 139-237)

The `syncChildren()` function in Editor.tsx has no guard. The `observer.observe(host, ...)` at line 230 watches `childList`, `subtree`, and `characterData` on the light DOM host. When `syncChildren()` modifies the shadow DOM `el`, the second observer (lines 256-263) watching `el` fires and calls `saveDo()`, potentially triggering Woby reactivity that writes to the light DOM, retriggering `syncChildren()`.

The `isSyncing` flag must be set before any DOM write inside `syncChildren` and cleared in a `finally` block.

---

## 7. Selection Restoration After DOM Mutation

### Why the Current Approach Fails for Cross-Block

`saveSelectionAsOffsets()` uses `getBlockParent()` as reference. For cross-block selections, this returns `null` (because `range.commonAncestorContainer` is the editor `<div>`, not a `P`/`H1`/etc.). The returned `{ block: null, ... }` means the restoration code at the end of `applyStyle()` and `removeStyle()` is completely skipped for all cross-paragraph operations.

### Offset-Path vs Character-Offset Tradeoffs

| Approach | Pros | Cons |
|----------|------|------|
| **Child-index path** (current FocusManager) | Exact node reference; O(depth) | Stale when nodes are inserted/removed/wrapped by span operations |
| **Global character offset** (D-04) | Survives node restructuring while text content is preserved; works cross-block | Requires full text-tree walk on save and restore |
| **Document model position** (ProseMirror) | Exact, always valid; O(1) lookup | Requires maintaining a document model (not feasible) |

**Global character offset is correct for this editor** because:
1. `applyStyleToRange()` wraps text nodes in `<span>` elements -- child indices change but character content is preserved.
2. `normalizeDOM()` merges and unwraps spans -- child indices change again but character content is preserved.
3. Global character offsets survive both operations as long as total text content is unchanged.

### How Quill Restores Selection

Quill stores positions as character indices into the linear document stream (Delta model). After any mutation, it maps character index to the correct DOM text node. This is equivalent to the global character offset approach but backed by a model. [CITED: quilljs.com/docs/api]

### Recommended Pattern for D-08

After calling `sel.removeAllRanges()` and `sel.addRange(restoredRange)`, verify the restoration succeeded by checking `sel.toString()` equals the expected text. This is the MCP test verification step per D-09.

The `FocusManager.restoreSelectionFromOffsets()` (lines 168-189) uses child-index paths. This works correctly for same-block operations where no nodes are inserted/removed. After D-04, `StyleEngine.restoreSelectionFromOffsets()` will use global offsets and work for cross-block. The two systems coexist: FocusManager handles toolbar click focus restoration (child-index); StyleEngine handles post-DOM-mutation selection restoration (global offsets).

---

## 8. Undo/Redo Patterns

### Snapshot vs Operation-Based

| Approach | When to Use | Used By |
|----------|-------------|---------|
| **HTML snapshot** | Simple editors; DOM-direct manipulation; undo at operation boundaries | Trix, current WUI approach |
| **Operation/Delta-based** | Collaborative editors; large documents; fine-grained undo | ProseMirror, Quill, Lexical |
| **Native browser undo stack** | When execCommand is used for all edits | Legacy editors (deprecated path) |

For WUI Phase 18, the **HTML snapshot approach is correct** because:
1. The editor is not collaborative.
2. The existing `undoredo.tsx` already implements snapshot undo.
3. Delta-based undo requires rebuilding the entire document model.

### Current Snapshot Implementation (verified by reading undoredo.tsx)

The `UndoRedo` component uses Woby observables `undos` and `redos` (string arrays of editor content snapshots). The `undo()` and `redo()` functions restore content by setting `host.innerHTML` or `el.innerHTML`. These observables ARE component-local -- correct.

**Bug (D-06)**: `debounceTimer` at line 73 IS module-level. With two editor instances on a page, the second call to `saveDo()` in any instance clears the debounce timer of the other instance.

**Dead code**: `historyStack` (line 71) and `currentIndex` (line 72) are declared at module scope but never referenced inside the `UndoRedo` function body. They appear to be leftover from a previous implementation. They should be removed.

**Fix for D-06** (minimal change):
```typescript
// Move inside UndoRedo component body (after the observable declarations):
let debounceTimer: ReturnType<typeof setTimeout> | null = null
// Delete lines 71-73 from module scope entirely.
```

### Missing: Selection Preservation in Undo

The current `undo()` and `redo()` restore content but do not restore the selection that existed before the operation. Best practice: save global character offsets alongside the content snapshot in `saveDo()`, restore them in `undo()`/`redo()` using the D-04 approach. This is an enhancement on top of D-06; it can be a follow-on task within the same wave.

### Quill's Delta-Based Undo

Quill stores inverse Delta operations rather than full snapshots. `undo()` computes `currentContents.diff(previousDelta)` to derive the reversal operation. This is memory-efficient for large documents but requires Quill's entire OT infrastructure. Not applicable to WUI. [CITED: Quill History module docs, GitHub issue #2101]

---

## Implementation Guidance

### Decision-by-Decision Concrete Recommendations

**D-01: BrowserCompat.safeGetRange() fix**
- Add `staticRangeToLiveRange(sr: StaticRange): Range` helper (3 lines).
- Update `safeGetRange()` signature to `safeGetRange(shadowRoot?: ShadowRoot): Range | null`.
- Logic: if `shadowRoot` provided AND `sel.getComposedRanges` exists, call it with `{shadowRoots:[shadowRoot]}`, convert first result to live Range. Else fall back to `getRangeAt(0)`.
- Update `safeGetSelection()` -- no signature change needed (it does not return a Range).
- Update `getSelectionInfo()` to accept and pass `shadowRoot`.
- Update `FocusManager.cacheSelection()` line 93 which calls `sel.getRangeAt(0)` directly -- replace with `safeGetRange(shadowRoot)`.
- Every call site that currently calls `safeGetRange()` needs to pass the shadow root. The shadow root can be obtained via `editorEl.getRootNode()` in FocusManager context.

**D-02: StyleEngine.getComputedStyles() fix**
- Replace lines 17-25 of StyleEngine.ts:
  ```typescript
  function getComputedStyles(node: Node): CSSStyleDeclaration {
      if (node instanceof HTMLElement) {
          return window.getComputedStyle(node)
      }
      if (node instanceof Text && node.parentElement) {
          return window.getComputedStyle(node.parentElement)
      }
      return {} as CSSStyleDeclaration
  }
  ```
- No other changes needed. `normalizeFontWeight()` already handles both `"bold"` and `"700"`.
- Address `textDecoration` vs `textDecorationLine` inconsistency separately (see Section 4).

**D-03: Toggle semantics**
- After D-02 fix, toggle semantics work correctly for inline spans AND semantic elements.
- Verify `toggleStyle()` lines 860-895 use `hasStyleInRange` -- confirmed correct, no logic change needed.
- The only D-03 work is verifying the fix after D-02 with test cases.

**D-04: Global character offsets**
- Replace `saveSelectionAsOffsets()` and `restoreSelectionFromOffsets()` in StyleEngine.ts with editor-root-relative versions using `findEditorRoot()` helper.
- Update all call sites in StyleEngine: `applyStyle()`, `removeStyle()`, `applyTextAlign()`, `applyIndent()`, `applyList()`.
- The parameter name `savedSelection` in function signatures changes from `{ block, startOffset, endOffset }` to `{ editorRoot, startOffset, endOffset }`.

**D-05: Remove queryCommandState**
- Remove line 54 from `BoldButton.tsx` (`isActive(document.queryCommandState(command))`).
- Update `TextStyleButton.updateStylesState()` to use `hasStyleInRange` from StyleEngine (export it first).
- Apply same fix to `ItalicButton.tsx` and `UnderlineButton.tsx` (verify both use `updateStylesState` -- they do).

**D-06: UndoRedo scoping**
- Move `let debounceTimer = null` inside `UndoRedo` component body.
- Delete module-level `let historyStack` and `let currentIndex` declarations (dead code, never referenced in component).
- Optionally: add selection offset saving to `saveDo()` and restoration to `undo()`/`redo()`.

**D-07: MutationObserver guard**
- In `Editor.tsx` inside the `syncChildren` closure scope: add `let isSyncing = false`.
- First line of `syncChildren`: `if (isSyncing) return`.
- Wrap all DOM operations: `isSyncing = true; try { ... } finally { isSyncing = false }`.

**D-08: Selection restoration validation**
- After D-01+D-04 fixes, restoration uses global offsets + shadow-DOM-aware range creation.
- Add MCP test assertion: `window.getSelection().toString()` before and after operation must match.

---

## Key Risks

### Risk 1: getComposedRanges Fallback Gap (MEDIUM severity)
Chrome < 137 and Firefox < 142 (~19% of Chrome users) fall back to `getRangeAt(0)`. For these browsers, shadow DOM selection silently returns a range pointing to the host element. The editor formatting will appear to do nothing in-shadow. **Mitigation**: log a dev-mode console warning; document Chrome 137+ requirement.

### Risk 2: StaticRange Endpoint Stale After DOM Mutation (HIGH severity)
`getComposedRanges()` returns a `StaticRange` fixed at call-time. If you call it and then mutate the DOM (wrap text in span), the `startContainer` may point to a removed node. **Mitigation**: always call `getComposedRanges()` / `saveSelectionAsGlobalOffsets()` BEFORE any DOM mutation, then restore from the saved offsets -- never from the stale StaticRange.

### Risk 3: textDecoration Shorthand Mismatch (MEDIUM severity)
`getComputedStyle().getPropertyValue('text-decoration')` returns `"underline solid rgb(0,0,0)"` in Chrome, not `"underline"`. Comparing to `"underline"` will always return false. **Mitigation**: For D-02, use `text-decoration-line` property for underline/strikethrough detection. Review the `prop` values passed to `hasStyle()` for these two styles.

### Risk 4: FocusManager cacheSelection Shadow-DOM-Blind (HIGH severity)
`FocusManager.cacheSelection()` line 93 calls `sel.getRangeAt(0)` directly. If not updated alongside D-01, `beginCommand()` caches an incorrect (shadow-root-blind) range. **Mitigation**: D-11 addresses this; FocusManager must be updated in the same wave as BrowserCompat.

### Risk 5: Two MutationObserver Feedback Loop (HIGH severity)
Editor.tsx has two observers (light DOM and shadow DOM). The `isSyncing` guard on `syncChildren` alone may not break the full cycle if `saveDo()` triggers Woby reactivity that writes to the light DOM. **Mitigation**: rely on the 300ms debounce in `saveDo()` to absorb the cascade; if feedback loop still occurs, add a second guard on the shadow DOM observer's callback.

### Risk 6: getComputedStyle Performance (LOW severity)
`window.getComputedStyle()` forces style recalculation when styles are dirty. Called once per text node in the selection (typically 2-10 nodes). **Mitigation**: the existing TreeWalker exits early on first non-matching node; acceptable for typical usage.

### Risk 7: Dead Code historyStack/currentIndex Removal (LOW severity)
If any external consumer imports `historyStack` or `currentIndex` from `undoredo.tsx`, removing them is a breaking change. **Mitigation**: search all import sites before removing; a grep for these names should confirm they are only declared, never imported.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Safari older versions return `"bold"` for getComputedStyle fontWeight on `<strong>` instead of `"700"` | Section 4 | normalizeFontWeight handles both; no breakage |
| A2 | `getComputedStyle(em).fontStyle` returns `"italic"` across all browsers | Section 4 | if returns `"oblique"`, italic detection fails; add oblique normalization |
| A3 | Chrome's `textDecoration` shorthand includes color/style making `"underline"` comparison fail | Section 4 | if Chrome returns just `"underline"`, current code works without the text-decoration-line change |
| A4 | `historyStack` and `currentIndex` in undoredo.tsx are dead code, never referenced in UndoRedo body | Section 8 | if imported elsewhere, removing them is a breaking change; verify with grep |
| A5 | `getRangeAt(0)` fallback is sufficient for non-shadow-DOM usage of the editor | Section 1 | if someone embeds without shadow DOM, fallback works correctly |
| A6 | `safeGetRange()` without a shadow root parameter can receive the shadow root from `editorEl.getRootNode()` in FocusManager | Section 5 | if getRootNode() returns something other than ShadowRoot (e.g., Document), the cast needs guarding |

---

## Sources

### Primary (HIGH confidence)
- [MDN: Selection.getComposedRanges()](https://developer.mozilla.org/en-US/docs/Web/API/Selection/getComposedRanges) -- signature, return value, browser baseline
- [caniuse.com: getComposedRanges](https://caniuse.com/mdn-api_selection_getcomposedranges) -- Chrome 137+, Firefox 142+, Safari 17+ version support
- [MDN: StaticRange](https://developer.mozilla.org/en-US/docs/Web/API/StaticRange) -- StaticRange vs Range, addRange() restriction
- [MDN: Range.commonAncestorContainer](https://developer.mozilla.org/en-US/docs/Web/API/Range/commonAncestorContainer) -- returns parent div for cross-paragraph selection
- [WebKit LayoutTests: selection-getComposedRanges.html](https://github.com/WebKit/WebKit/blob/main/LayoutTests/fast/shadow-dom/selection-getComposedRanges.html) -- empty array when no selection
- [MDN: MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) -- microtask timing, disconnect pattern
- [MDN: Document.queryCommandState()](https://developer.mozilla.org/en-US/docs/Web/API/Document/queryCommandState) -- deprecated, shadow-DOM-blind
- Project source files (read directly): `BrowserCompat.ts`, `StyleEngine.ts`, `FocusManager.ts`, `undoredo.tsx`, `BoldButton.tsx`, `Editor.tsx`, `DOMNormalizer.ts`, `18-CONTEXT.md`

### Secondary (MEDIUM confidence)
- [ProseMirror prosemirror-commands source](https://github.com/ProseMirror/prosemirror-commands/blob/master/src/commands.ts) -- `toggleMark` logic verified via WebFetch; `removeWhenPresent` parameter
- [Tiptap Events docs](https://tiptap.dev/docs/editor/api/events) -- `onSelectionUpdate` for format state detection
- [Quill History module docs](https://quilljs.com/docs/modules/history/) -- delay-based merging, undo/redo mechanics
- [Chromium Intent to Ship: getComposedRanges](https://groups.google.com/a/chromium.org/g/blink-dev/c/4dsh58Y4ZrE) -- Chrome 137 shipping confirmation
- [caniuse.com: getComposedRanges returns multiple ranges](https://caniuse.com/mdn-api_selection_getcomposedranges_returns_multiple_ranges) -- extended support table

### Tertiary (LOW confidence)
- Web search results for font-weight computed value behavior (Chrome/Firefox return "700" for strong)
- Web search results for textDecoration shorthand behavior in Chrome
- Web search results for Quill format detection algorithm (getFormat returns bold only when ALL selected)

---

## Metadata

**Confidence breakdown:**
- Core API facts (getComposedRanges signature, browser support, StaticRange behavior): HIGH -- verified via MDN and caniuse
- Current code bug analysis (BrowserCompat, StyleEngine, FocusManager, undoredo, BoldButton, Editor): HIGH -- read all six source files directly
- Toggle semantics alignment with Word/Docs: HIGH -- verified against CONTEXT.md user decision and ProseMirror source
- Cross-block commonAncestorContainer behavior: HIGH -- verified via MDN
- Browser computed style return values (fontWeight "700" vs "bold"): MEDIUM -- confirmed by multiple secondary sources
- Quill Delta undo internals: LOW -- from secondary web search, not primary source code read

**Research date:** 2026-06-13
**Valid until:** 2026-09-13 (stable APIs; getComposedRanges support may expand to older browsers)

# Research Summary - WUI Rich Text Editor

## Executive Summary

Building a production-ready rich text editor without execCommand requires mastering DOM manipulation with the Selection/Range API, MutationObserver for history tracking, and direct style application algorithms. This is a **DOM-based editor** (not state-tree like Lexical/ProseMirror), where the DOM itself is the source of truth and Woby's reactivity syncs toolbar state.

The recommended architecture: implement **Selection Manager** (path-based restoration, normalization), **Style Engine** (merge/split/normalize), **Block Transformer** (semantic conversions), and **History Manager** (debounced MutationObserver with state deduplication).

Critical browser differences (Safari anchor/head mismatch, Firefox rangeCount=0, Chrome IME bugs) require defensive programming and cross-browser testing from day one.

**Key risks:**
- Selection loss on toolbar clicks (prevent with `mousedown.preventDefault`)
- XSS via paste (mandatory DOMPurify integration)
- Undo stack memory explosion (limit to 100 states)
- IME composition breaking CJK input (track composition state)
- Style nesting creating invalid HTML (normalize after every operation)

**All features are critical** - zero tolerance for half-working formatting, lists, or tables.

---

## Technology Stack (HIGH Confidence)

### Core APIs

| API | Browser Support | Key Considerations |
|-----|-----------------|-------------------|
| Selection/Range | Baseline since 2015 | Safari focuses elements on programmatic selection (expected), Firefox rangeCount can be 0, Chrome anchor/head order differs from Safari |
| MutationObserver | Excellent | Use for undo/redo history tracking, debounce saves (300ms), limit stack to 100 entries |
| ClipboardEvent | Baseline since March 2017 | Clipboard API excellent support, **MUST sanitize all pasted HTML with DOMPurify** |
| beforeinput | Limited iOS Safari | Useful for intercepting input, but test on iOS devices (limited support) |
| contenteditable | Universal | Browser behaviors differ, must normalize after operations |

### execCommand Replacement (CRITICAL)

**execCommand is deprecated and must be completely replaced.** Use Range API methods:

| execCommand | Replacement | Range API Method |
|------------|-------------|-----------------|
| `bold` | Apply/remove bold style | `surroundContents()`, `extractContents()` + insert styled span |
| `italic` | Apply/remove italic style | Same pattern as bold |
| `insertHTML` | Insert sanitized HTML | DOMPurify + `insertNode()` |
| `insertImage` | Insert validated image | URL validation + `insertNode()` |
| `insertOrderedList` | Convert blocks to LI in OL | Block transformer logic |
| `insertUnorderedList` | Convert blocks to LI in UL | Block transformer logic |

**Never use execCommand.** All operations must use DOM manipulation with proper normalization.

### Woby Integration

**Best practices (already in codebase):**
- Context API for shared editor state
- Observables for reactive toolbar state
- `useEffect` for MutationObserver lifecycle management
- `customElement` for web component registration
- Tailwind CSS for styling

### Performance Patterns (for 1000+ paragraphs)

| Pattern | Implementation |
|---------|---------------|
| Debounce MutationObserver | 300ms threshold for undo saves |
| Throttle selection queries | `requestAnimationFrame` throttling |
| History stack limit | 100 entries maximum |
| Batch DOM operations | DocumentFragment for insertions |
| Lazy selection queries | Only query when needed, cache results |
| Virtual scrolling | Only if 5000+ paragraphs, complex implementation |

### Security Requirements (MANDATORY)

| Vulnerability | Prevention |
|---------------|-----------|
| XSS via paste | **DOMPurify with strict whitelist** - strip script, iframe, object, embed, form, event handlers |
| JavaScript URLs | Validate all URLs (no `javascript:`, no `data:` except images) |
| Event handlers | Strip onclick, onload, onerror, onmouseover, etc. |
| CSS expressions | No `expression()`, `behavior`, `-moz-binding` in CSS |
| Trusted Types CSP | Implement Trusted Types for production |

**Security is not optional.** All paste operations must be sanitized before insertion.

---

## Feature Landscape (MEDIUM Confidence)

### Current Implementation Status: ~40% Complete

**Implemented (✅):**
- Core formatting: bold, italic, underline
- Basic lists: bullet, numbered, checklist
- Font controls: family, size, color, background color
- Tables: basic insertion and cell navigation
- Images: URL insertion (no upload, no validation)
- Undo/redo: exists but saves every keystroke (needs batching)

**Critical Missing (❌):**
- Strikethrough, superscript, subscript
- Inline code and code blocks (syntax highlighting)
- Link management (edit/remove links)
- Clear formatting functionality
- Paste plain text option
- Word count display
- Table row/column insert/delete
- Image upload, resize, alignment
- Find & replace
- Emoji picker
- Mobile touch interactions
- Cross-paragraph selection handling

### Feature Complexity Ratings

| Complexity | Features | Estimated Time |
|-----------|----------|----------------|
| **Low** (1-4 hours) | Strikethrough, clear formatting, paste plain text, word count | 1 week |
| **Medium** (4-8 hours) | Font features, link management, code blocks, table row/column ops | 2-3 weeks |
| **High** (1-3 days) | Image upload, find & replace, emoji picker, context menu, selection toolbar | 4-6 weeks |
| **Very High** (3-7 days) | Table merge/resize, mobile toolbar, performance optimization, accessibility audit | 6-8 weeks |

**Total effort: 10-12 weeks** to achieve full Lexical/Google Docs parity.

### Testing Scenarios (150+ Required)

Every feature must be tested across:
- **6 selection scenarios** (collapsed, partial word, whole paragraph, partial paragraphs, cross-paragraph partial, full multi-paragraph)
- **4 browsers** (Chrome, Firefox, Safari, Edge)
- **2 mobile platforms** (iOS Safari, Chrome Android)
- **Edge cases** (empty document, nested styles, large documents, paste from various sources)

**Testing matrix:**
```
Features × Selection Scenarios × Browsers × Edge Cases
≈ 47 features × 6 scenarios × 4 browsers × 10 edge cases
= ~1,100 test permutations
```

Focus on high-risk areas: selection, IME, paste sanitization, undo/redo, mobile.

---

## Architecture Patterns (HIGH Confidence)

### Selection Management (Foundation)

**Three-phase normalization:**
1. **Validate containers** - Check range is within editor, clamp offsets to valid positions
2. **Path-based tracking** - Use DOM path (child indices) instead of node references (survives restructures)
3. **Cache and restore** - Cache selection before operations, restore after with normalization

**Key algorithm:**
```typescript
function normalizeSelection(range: Range): Range {
  // 1. Clamp start/end to valid container boundaries
  // 2. Handle empty text nodes
  // 3. Clean up partially selected containers
  // 4. Return normalized range
}
```

**Browser differences:**
- Safari: anchorNode/headNode order differs from Chrome
- Firefox: `rangeCount` can be 0 after certain operations
- Chrome: IME composition can create extra ranges
- All: Must check `focusNode` after `rangeCount` check

### Style System (Complex)

**Merge adjacent spans:**
```typescript
function mergeAdjacentSpans(container: Node) {
  // Walk DOM, find adjacent spans with identical styles
  // Merge text content into first span
  // Remove duplicate span
  // Repeat until no adjacent duplicates
}
```

**Split algorithm (for partial toggle-off):**
```typescript
function splitSpan(span: HTMLSpanElement, range: Range) {
  // 1. Extract contents of span into DocumentFragment
  // 2. Create three spans: before-selection, selection, after-selection
  // 3. Apply style to before/after spans, remove from selection span
  // 4. Insert three spans back into DOM
  // 5. Normalize adjacent spans
}
```

**Multi-property conflict resolution:**
When applying bold to text that's already italic + colored:
1. Check existing span's style properties
2. If style already present → remove style (toggle off)
3. If style not present → add to existing style object
4. If style conflicts (different font) → split span at boundaries
5. Normalize after operation

### Block Transformer (Complex Edge Cases)

**P ↔ LI bidirectional:**
```typescript
function convertParagraphToListItem(p: HTMLElement, listType: 'ul' | 'ol') {
  // 1. Find parent list container or create new
  // 2. Convert P to LI (transfer content, styles)
  // 3. Handle partial selection: split P at boundaries
  // 4. Handle cross-paragraph: convert all selected P's
  // 5. Normalize: remove empty list containers, merge adjacent lists
}
```

**Edge cases:**
- Partial paragraph selection → split P into P + LI + P
- Cross-paragraph partial → split at boundaries, convert middle
- Nested lists → split parent list, merge siblings
- List ↔ Heading → unwrap LI or wrap in LI

**Content preservation:**
- P ↔ PRE: Convert whitespace/BR, preserve formatting
- LI ↔ H1-H6: Transfer styles, manage list container
- Blockquote: Wrap/unwrap blocks

### State Management (Undo/Redo)

**MutationObserver with debouncing:**
```typescript
const observer = new MutationObserver((mutations) => {
  // Debounce: wait 300ms before saving state
  // Deduplicate: check if content identical to last state
  // Batch: collect all mutations in batch, save once
  // Limit: max 100 states in stack
})
```

**State structure:**
```typescript
interface HistoryState {
  content: string // innerHTML
  selection: SelectionPath // path-based for restoration
  timestamp: number // for deduplication
}
```

**Selection restoration:**
- Convert path back to DOM nodes (may fail if DOM changed)
- Use fallback: move cursor to start/end of changed region
- Handle edge: if nodes deleted, move to nearest valid position

### DOM Normalization (Critical)

**After every operation:**
```typescript
function normalizeDOM(container: Node) {
  // 1. Merge adjacent text nodes
  // 2. Remove empty spans (no content, no styles)
  // 3. Unwrap redundant spans (child same style as parent)
  // 4. Merge adjacent spans with identical styles
  // 5. Clean up block boundaries (no spans spanning blocks)
}
```

**Why critical:** Without normalization, operations create invalid HTML with nested identical styles, empty spans, and broken structure. Normalization is mandatory after every mutation.

### Event Handling

**Command pattern:**
```typescript
interface EditorCommand {
  execute(range: Range): void
  undo(): void
}
```

**Event hooks:**
- `beforeCommand` - Validate selection, prepare state
- `afterCommand` - Normalize DOM, restore selection, save history
- `beforeInput` - Intercept typing (limited iOS support)
- `compositionStart/End` - Track IME state

**Plugin architecture:**
- Command registry (map of command name → implementation)
- Extension hooks (beforeCommand, afterCommand, normalize)
- Custom formats (register new style handlers)

---

## Pitfalls and Edge Cases (HIGH Confidence)

### Selection Pitfalls (#1 Problem)

| Pitfall | Prevention |
|---------|-----------|
| Selection lost on toolbar click | Use `mousedown.preventDefault()` on buttons, save/restore selection before operations |
| Safari anchor/head mismatch | Normalize by sorting anchor/head by DOM position |
| Firefox rangeCount = 0 | Check both `rangeCount` and `focusNode` before operations |
| IME creates extra ranges | Track `isComposing` state, defer operations during composition |
| Selection spans invalid containers | Clamp to editor boundaries, validate containers before operations |

**Critical pattern:**
```typescript
button.addEventListener('mousedown', (e) => {
  e.preventDefault() // Prevent focus loss
  const savedSelection = saveSelection()
  applyCommand(savedSelection)
  restoreSelection(savedSelection)
})
```

### IME Composition (CJK Languages)

| Pitfall | Prevention |
|---------|-----------|
| Chrome duplicates characters | Track `compositionEnd` timing, defer mutations |
| Android dismisses keyboard | Use `compositionEnd` to detect completion, avoid `beforeinput` |
| iOS freezes app | Avoid synchronous DOM mutations during composition |
| Korean input broken | Wait for `compositionEnd` before style operations |

**Must test on real devices** with CJK input (Chinese, Japanese, Korean).

### XSS Security (Mandatory)

| Attack Vector | Prevention |
|--------------|-------------|
| Script tags | DOMPurify strips automatically |
| Event handlers (onclick, onerror) | DOMPurify strips event attributes |
| JavaScript URLs | Validate URLs: block `javascript:`, `data:` (except images) |
| SVG onload | DOMPurify sanitizes SVG |
| CSS expressions | Whitelist CSS properties, block dangerous ones |

**Use DOMPurify with strict config:**
```typescript
import DOMPurify from 'dompurify'

const clean = DOMPurify.sanitize(pastedHTML, {
  ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'u', 'span', 'div', 'ul', 'ol', 'li', 'a', 'img'],
  ALLOWED_ATTR: ['href', 'src', 'style', 'class'],
  ALLOW_DATA_ATTR: false
})
```

### Undo/Redo Pitfalls

| Pitfall | Prevention |
|---------|-----------|
| Memory explosion (100+ states) | Limit stack to 100, deduplicate identical content |
| Performance degradation | Debounce saves (300ms), batch mutations |
| Selection lost after undo | Save selection path with state, restore after undo |
| Infinite loops | Skip saving state during undo/redo operations |

**State deduplication:**
```typescript
function saveState() {
  const content = editor.innerHTML
  if (lastState && lastState.content === content) return // Skip duplicate
  undoStack.push({ content, selection, timestamp })
  if (undoStack.length > 100) undoStack.shift() // Limit stack
}
```

### Style Nesting Pitfalls

| Pitfall | Prevention |
|---------|-----------|
| Nested identical styles (bold within bold) | Normalize after operations: unwrap child span |
| Empty style spans | Remove spans with no content and no styles |
| Partial selections break spans | Split algorithm: three spans (before, selection, after) |
| Cross-block spans | Clean up spans spanning multiple blocks |

**Normalize after EVERY operation.** No exceptions.

### Mobile Pitfalls

| Pitfall | Prevention |
|---------|-----------|
| iOS autocorrect interference | Use `autocorrect="off"` on editor, handle corrections |
| Android keyboard dismissal | Avoid `blur` events, use `mousedown` pattern |
| Samsung/Firefox keyboard quirks | Test on Samsung Internet, Firefox mobile |
| Gboard rich content insertion | Handle paste events from Gboard |
| Viewport resizing | Handle viewport changes, keep cursor visible |

**Test on real mobile devices** with multiple keyboards (Gboard, Samsung, iOS keyboard).

### Browser Differences

| Browser | Quirk | Handling |
|---------|-------|----------|
| Safari | anchorNode appears before headNode even when backwards | Normalize by comparing positions |
| Firefox | `rangeCount` can be 0 after selection changes | Check `focusNode` if `rangeCount === 0` |
| Chrome | IME composition creates extra ranges | Track `isComposing`, defer operations |
| Edge | Legacy Edge uses different Range API | Test on Chromium Edge only |

**Browser matrix testing:** Chrome, Firefox, Safari, Edge (latest 2 versions).

---

## Critical Technical Decisions

### 1. Selection Manager Implementation

**Decision:** Path-based selection tracking
**Rationale:** Node references don't survive DOM restructures. Paths (child indices) work better for restoration.
**Implementation:** Convert Range → path array, restore path → Range with fallback logic.

### 2. Style Engine Architecture

**Decision:** Multi-property span model
**Rationale:** Text can have multiple styles (bold + italic + color). Single span with style object is cleaner than nested spans.
**Implementation:** Style spans carry `style` attribute with multiple properties, normalize after operations.

### 3. Undo/Redo Strategy

**Decision:** MutationObserver with debouncing + state deduplication
**Rationale:** MutationObserver tracks all changes automatically. Debouncing prevents state explosion. Deduplication prevents identical states.
**Implementation:** 300ms debounce threshold, 100 stack limit, content comparison before save.

### 4. Block Transformation Approach

**Decision:** Content preservation + container management
**Rationale:** Converting blocks must preserve content/styles while managing containers (UL/OL creation/removal).
**Implementation:** Transfer content/styles to new block type, create/remove containers, split at selection boundaries.

### 5. Security Sanitization

**Decision:** DOMPurify with strict whitelist + URL validation
**Rationale:** XSS via paste is critical vulnerability. DOMPurify is standard solution. URL validation prevents JavaScript injection.
**Implementation:** Sanitize all pasted HTML, validate all URLs (block `javascript:`, `data:`), implement Trusted Types CSP.

---

## High-Risk Areas

| Risk | Severity | Prevention |
|------|----------|-----------|
| Selection management | **CRITICAL** | All features depend on selection. Phase 1 must deliver robust Selection Manager. |
| XSS via paste | **CRITICAL** | Mandatory DOMPurify. Security must be implemented from day 1. |
| IME composition | **HIGH** | CJK users critical. Track composition state, defer operations. |
| Undo/redo performance | **HIGH** | State explosion causes crashes. Debounce, limit stack, deduplicate. |
| Style normalization | **HIGH** | Without normalization, DOM becomes invalid HTML. Normalize after every operation. |
| Browser differences | **HIGH** | Selection/Range quirks differ per browser. Cross-browser testing from day 1. |
| Mobile support | **MEDIUM** | Touch interactions, keyboard quirks. Test on real devices. |
| Large document performance | **MEDIUM** | 1000+ paragraphs. Profile early, optimize only if issues. |
| Accessibility | **MEDIUM** | Screen reader support. ARIA roles, live regions, keyboard navigation. |

---

## Recommended Phase Structure (5 Phases)

### Phase 1: Selection Foundation and Critical Pitfalls

**Why first:** Selection is the hardest problem emphasized across all research files. All subsequent features depend on reliable selection restoration/normalization.

**Deliverables:**
- Selection Manager (path-based tracking, normalization)
- Browser compatibility layer (Safari/Firefox/Chrome quirks)
- Toolbar button pattern (`mousedown.preventDefault`)
- IME composition tracking
- DOMPurify integration for paste
- Undo/redo foundation (MutationObserver, debouncing)

**Risk:** CRITICAL. Selection must work before any other features.

**Testing:** Cross-browser selection scenarios, IME on CJK languages, XSS vectors.

---

### Phase 2: Style Engine and Basic Formatting Completion

**Why second:** Style merging/splitting is complex and must be implemented before completing missing formatting features. Current `applyStyle` creates nested spans without normalization.

**Deliverables:**
- Style Engine (merge, split, normalize algorithms)
- Strikethrough, superscript, subscript
- Inline code and code blocks (syntax highlighting)
- Link management (edit/remove)
- Clear formatting
- Paste plain text
- Word count display

**Dependencies:** Phase 1 (Selection Manager)

**Risk:** HIGH. Style normalization is mandatory for valid HTML.

**Testing:** Nested styles, partial selections, cross-paragraph styling.

---

### Phase 3: Block Transformer and Advanced Structures

**Why third:** List/table conversions are complex with many edge cases. Current implementation handles basic cases but fails on nested lists, multi-block selections, table cell operations.

**Deliverables:**
- Block Transformer (P ↔ LI ↔ PRE ↔ H1-H6)
- Table row/column insert/delete
- Image upload (file picker, drag-drop)
- Image resize and alignment
- Find & replace
- Emoji picker

**Dependencies:** Phase 2 (Style Engine for content preservation)

**Risk:** HIGH. Block transformations have complex edge cases.

**Testing:** Nested lists, multi-block selections, table operations, image upload/validation.

---

### Phase 4: Professional Features and Interaction Polish

**Why fourth:** Professional features distinguish production editors from demos. Require dedicated UI components but use existing Selection/Style engines.

**Deliverables:**
- Context menu (right-click formatting)
- Selection toolbar (floating toolbar on selection)
- Auto-link URLs
- Copy formatting (format painter)
- Autosave and draft recovery
- Export (Markdown, PDF)
- Table merge/resize (colspan/rowspan)

**Dependencies:** Phase 3 (Block Transformer for context menu)

**Risk:** MEDIUM. UI components use existing core engines.

**Testing:** Context menu interactions, selection toolbar positioning, format painter.

---

### Phase 5: Performance Optimization and Mobile Support

**Why fifth:** Performance at 1000+ paragraphs requires optimization. Mobile support is biggest gap requiring dedicated touch interactions and device testing.

**Deliverables:**
- Performance profiling and optimization
- Virtual scrolling (if needed for 5000+ paragraphs)
- Mobile touch toolbar
- Touch interactions (long-press selection)
- Mobile keyboard handling (IME, viewport)
- Accessibility audit (WCAG 2.1 AA, screen readers)
- Large document testing (1000+ paragraphs)

**Dependencies:** All phases (optimize complete editor)

**Risk:** MEDIUM. Performance may be acceptable without virtualization. Mobile requires device testing.

**Testing:** 1000+ paragraph documents, mobile device testing (iOS Safari, Chrome Android, Samsung Internet), screen readers (JAWS, NVDA, VoiceOver).

---

## Testing Requirements

### Mandatory Coverage

| Category | Scenarios |
|----------|-----------|
| Selection scenarios | 6 (collapsed, partial word, whole paragraph, partial paragraphs, cross-paragraph partial, full multi-paragraph) |
| Browsers | 4 (Chrome, Firefox, Safari, Edge) + 3 mobile (iOS Safari, Chrome Android, Samsung Internet) |
| Edge cases | 20 (empty document, single char, nested styles, nested lists, paste from sources, IME input, large documents) |
| Security | OWASP XSS vectors (script tags, event handlers, JavaScript URLs, SVG onload) |
| Accessibility | WCAG 2.1 AA checklist (ARIA roles, keyboard navigation, screen readers) |

**Testing matrix:** ~1,100 test permutations (47 features × 6 scenarios × 4 browsers × 10 edge cases)

### Critical Testing Areas

1. **Selection testing:** Cross-browser selection scenarios, selection restoration, IME composition
2. **Security testing:** XSS vectors, paste sanitization, URL validation
3. **Undo/redo testing:** State explosion, selection restoration, performance
4. **Mobile testing:** Touch interactions, keyboard quirks, device compatibility
5. **Accessibility testing:** Screen reader support, keyboard navigation, ARIA compliance

### Browser Matrix

| Browser | Version | Priority | Special Considerations |
|---------|---------|----------|------------------------|
| Chrome | Latest 2 | HIGH | IME composition bugs, anchor/head order |
| Firefox | Latest 2 | HIGH | `rangeCount` quirks, Samsung keyboard |
| Safari | Latest 2 | HIGH | anchor/head mismatch, iOS IME, selection focusing |
| Edge | Latest 2 (Chromium) | MEDIUM | Same as Chrome (Chromium-based) |
| iOS Safari | Latest | HIGH | beforeinput limited, autocorrect, keyboard dismissal |
| Chrome Android | Latest | HIGH | Gboard paste, keyboard quirks |
| Samsung Internet | Latest | MEDIUM | Samsung keyboard quirks |

**Device testing required** for mobile browsers (not just desktop simulation).

---

## Open Questions (Phase-Specific Research)

### Needs Research

| Question | Phase | Priority |
|----------|-------|----------|
| IME composition handling for CJK languages | Phase 1 | HIGH (affects international users) |
| iOS Safari beforeinput support | Phase 1 | MEDIUM (conflicting reports) |
| XSS prevention (OWASP vectors, DOMPurify validation) | Phase 1 | CRITICAL (security) |
| Table cell merge (colspan/rowspan algorithms) | Phase 3 | MEDIUM (complex feature) |
| Virtual scrolling implementation | Phase 5 | LOW (only if performance issues) |
| Mobile virtual keyboard behavior | Phase 5 | MEDIUM (device testing needed) |

### Standard Patterns (No Extra Research)

- Basic formatting (well-documented execCommand-free patterns)
- Link management (standard dialog logic)
- Find and replace (standard search algorithm)
- Autosave (standard debounce pattern)
- Word count (standard counting logic)

---

## Research Confidence

| Area | Confidence | Reasoning |
|------|------------|-----------|
| Stack | HIGH | Core APIs well-documented on MDN, browser compatibility verified |
| Features | MEDIUM | Core features documented, mobile sparse, performance unknown |
| Architecture | HIGH | DOM-based trade-offs understood, algorithms documented |
| Pitfalls | HIGH | Real-world production bugs documented in ProseMirror/Slate issues |

**Overall confidence:** HIGH for implementation approach, MEDIUM for mobile/performance, LOW for IME/virtualization.

**Gaps:** IME composition (needs CJK device testing), iOS Safari beforeinput (conflicting reports), virtual scrolling (complex, specialized), mobile keyboard (needs device testing), performance (needs benchmarking).

---

## Next Steps

**Ready for roadmap planning.** Research synthesis complete.

**Critical finding:** **Selection is the foundation.** Phase 1 must deliver robust Selection Manager before any other features.

**Proceed to:** `/gsd-plan-phase 1` to create detailed implementation plan for Selection Foundation and Critical Pitfalls.

---

*Research synthesis complete. All findings consolidated from STACK.md, features.md, ARCHITECTURE.md, pitfalls.md.*
# WUI Rich Text Editor Requirements

## Overview

Build a full-featured, production-ready rich text editor component for Woby framework that handles **all editing scenarios correctly** with zero tolerance for half-working features. Every interaction must work across all selection scenarios - from simple cursor styling to complex cross-paragraph selections.

## Core Principles

### Inviolable Constraints

1. **NO execCommand** - Deprecated, unstable, feature-limited. All operations via direct DOM manipulation.
2. **All features are critical** - No skipping, no partial implementations, no "nice to have" categorization.
3. **Cross-paragraph correctness** - Every operation must work across block boundaries.
4. **Browser compatibility** - Chrome, Firefox, Safari, Edge (latest 2 versions) must all work identically.
5. **Accessibility** - WCAG 2.1 AA compliance required for screen reader support.
6. **Performance** - Must handle 1000+ paragraph documents smoothly.
7. **Testing** - Visual verification via agent-browser visualizer for all scenarios.

### Selection Scenarios (All Must Work)

Every formatting/block operation must handle:

- **Collapsed cursor** - No selection, just cursor position
- **Partial word** - Selection within single word
- **Whole paragraph** - Full single paragraph selected
- **Partial paragraphs** - Part of multiple paragraphs selected
- **Cross-paragraph partial** - Selection spans across paragraphs but not fully
- **Full multi-paragraph** - Multiple complete paragraphs selected

## Functional Requirements

### 1. Text Formatting (All Critical)

| Feature | Requirements | Edge Cases |
|---------|-------------|-----------|
| Bold | Toggle on/off across all selection scenarios | Nested bold, partially selected bold spans |
| Italic | Toggle on/off across all selection scenarios | Nested italic, partially selected italic spans |
| Underline | Toggle on/off across all selection scenarios | Nested underline, partial selections |
| Strikethrough | Toggle on/off across all selection scenarios | Nested strikethrough |
| Font Family | Dropdown with web-safe fonts + custom | Apply to selection, change existing font spans |
| Font Size | Dropdown with sizes (8-72px) | Apply to selection, handle nested sizes |
| Text Color | Color picker | Apply to selection, handle nested colors |
| Background Color | Color picker | Apply to selection, handle nested backgrounds |
| Alignment | Left/center/right/justify | Works on blocks, cross-paragraph selections |
| Indentation | Increase/decrease indent | Works on blocks, list nesting |

**Style Logic Requirements:**
- **Merge**: Adjacent spans with same style must merge into single span
- **Unwrap**: Child span same style as parent must unwrap to parent
- **Split**: Partial toggle-off must split span into styled/unstyled parts
- **Normalize**: After every operation, DOM must be cleaned (no empty spans, no redundant nesting)

### 2. Block-Level Operations (All Critical)

| Transformation | Requirements | Edge Cases |
|---------------|-------------|-----------|
| Paragraph ↔ List Item | P ↔ LI bidirectional | Cross-paragraph partial selection, split lists, create/remove UL/OL containers |
| Paragraph ↔ Preformatted | P ↔ PRE bidirectional | Whitespace/BR conversion, preserve formatting |
| Paragraph ↔ Headings | P ↔ H1-H6 bidirectional | Nested in LI or unwrapped |
| List ↔ Heading | LI ↔ H1-H6 | Remove from list container, unwrap heading |
| List nesting | Increase/decrease nesting level | Split parent list, merge with sibling list |
| Blockquote | Apply/remove blockquote | Works on single/multiple blocks |

**Block Transformation Requirements:**
- **Container management**: Create/remove UL/OL containers as needed
- **Partial selection**: Split blocks at selection boundaries
- **Nested blocks**: Handle LI nested in UL/OL correctly
- **Whitespace preservation**: PRE blocks must preserve spaces/line breaks

### 3. Lists (All Critical)

| Feature | Requirements | Edge Cases |
|---------|-------------|-----------|
| Ordered list | Toggle on/off | Cross-paragraph selection, nested lists, list continuation |
| Unordered list | Toggle on/off | Cross-paragraph selection, nested lists |
| List nesting | Increase/decrease indent | Split parent list, merge sibling lists |
| List style | Decimal, bullet, roman, etc. | CSS counter-based styling |
| List continuation | Automatic numbering continuation | Restart numbering option |

### 4. Rich Content Insertion (All Critical)

| Feature | Requirements | Edge Cases |
|---------|-------------|-----------|
| Image upload | File upload with preview | Drag-drop, paste, file picker, URL input |
| Image URL | Insert image from URL | XSS prevention, URL validation, broken image handling |
| Image manipulation | Resize, align, caption | Inline vs block images |
| Table insertion | Table with configurable rows/cols | Cursor in table, navigation within table |
| Link insertion | URL with text | Edit existing link, remove link, validate URL |
| Horizontal rule | Insert HR element | Placement between blocks |
| Emoji/symbols | Emoji picker or insert | Unicode emoji, special characters |

### 5. Interaction Patterns (All Critical)

| Input Type | Requirements | Implementation |
|-----------|-------------|---------------|
| Mouse events | Click, double-click, triple-click | Word/paragraph selection, cursor placement |
| Pointer events | PointerDown/Move/Up | Unified mouse/touch handling |
| Touch events | TouchStart/Move/End | Mobile editing, long-press selection |
| Keyboard shortcuts | Ctrl+B, Ctrl+I, Ctrl+U, etc. | Cross-browser shortcut handling |
| Keyboard navigation | Arrow keys, Tab, Enter | Navigation within/between blocks |
| Drag-and-drop | Drag text, drag image, drop content | Move content, copy content |
| Contenteditable | Native editing behaviors | Intercept input, normalize after typing |

**Touch/Mobile Requirements:**
- Long-press selection on mobile
- Touch-friendly toolbar buttons (larger hit targets)
- Mobile keyboard quirks handling (IME, dead keys)
- Touch scrolling within editor surface

### 6. Clipboard Operations (All Critical)

| Operation | Requirements | Edge Cases |
|-----------|-------------|-----------|
| Copy | Copy with format preservation | Cross-paragraph selection, HTML/plain text |
| Cut | Cut with format preservation | Remove cut content, restore selection |
| Paste | Paste with format preservation/sanitization | Strip malicious HTML, preserve safe styles |
| Paste plain text | Option to paste as plain text | Strip all formatting |
| Paste image | Paste image from clipboard | File upload flow, inline image |

**Paste Security Requirements:**
- **HTML sanitization**: Strip script tags, event handlers, dangerous attributes
- **Style filtering**: Only allow safe CSS properties (no expression(), no behavior)
- **URL validation**: Validate all URLs (no javascript:, no data: except images)
- **Content normalization**: Clean pasted DOM structure

### 7. Undo/Redo (Critical)

| Requirement | Implementation |
|-------------|---------------|
| State batching | Batch mutations by time/operation (not every keystroke) |
| Stack management | Undo stack, redo stack, stack size limits |
| Selection restoration | Restore selection to state before/after operation |
| Operation grouping | Group related mutations (typing, style toggle, block transform) |
| Keyboard shortcuts | Ctrl+Z (undo), Ctrl+Y/Ctrl+Shift+Z (redo) |

**Undo/Redo Requirements:**
- MutationObserver must track changes, but debounce/save states
- Keyboard typing should batch until pause (300ms threshold)
- Style operations should save state before AND after
- Block transformations should save full document state
- Must restore cursor position to appropriate location

### 8. Accessibility (Critical)

| Feature | Requirement |
|---------|-------------|
| ARIA roles | Editor surface has `role="textbox"` with `aria-multiline="true"` |
| ARIA labels | All toolbar buttons have `aria-label` and `aria-pressed` states |
| Live regions | Announce formatting changes via `aria-live` region |
| Keyboard focus | Focus management for toolbar buttons, dialogs |
| Screen reader | JAWS, NVDA, VoiceOver must announce content/changes |
| High contrast | Work in Windows high contrast mode |

### 9. Advanced Features (All Critical)

| Feature | Requirements |
|---------|-------------|
| Find/replace | Search text with regex option, replace single/all |
| Spell check | Browser spell check integration |
| Autosave | Auto-save content to storage/localStorage |
| Word count | Character/word/paragraph count display |
| Fullscreen | Toggle fullscreen editing mode |
| Print | Print preview and print functionality |
| Export | Export as HTML, plain text |
| Import | Import HTML content |

## Non-Functional Requirements

### Performance

- **Large documents**: Must handle 1000+ paragraphs without lag
- **Typing latency**: < 50ms response time for keystrokes
- **Scroll performance**: Smooth scrolling with virtualization if needed
- **Memory**: No memory leaks from MutationObserver/event listeners
- **Batching**: DOM operations must be batched, not incremental

### Browser Compatibility

- **Chrome** (latest 2 versions)
- **Firefox** (latest 2 versions)
- **Safari** (latest 2 versions)
- **Edge** (latest 2 versions)
- **Mobile browsers**: iOS Safari, Chrome for Android

**Browser Quirks:**
- Range/Selection API differences must be normalized
- contenteditable behaviors differ per browser
- Keyboard event handling differs per browser
- Touch events differ per platform

### Security

- **XSS prevention**: All user input (paste, URL, HTML) must be sanitized
- **URL validation**: No javascript:, data: (except images), vbscript: URLs
- **HTML filtering**: Strip script, iframe, object, embed, form elements
- **Style filtering**: No expression(), behavior, -moz-binding in CSS
- **Event stripping**: No onclick, onload, onerror, etc.

### Integration

- **Woby framework**: Reactive component model, observable state
- **Custom Element**: `<wui-editor>` must work as Custom Element
- **CSS**: Tailwind CSS for styling, scoped styles for editor
- **TypeScript**: Full TypeScript support with type definitions

## Testing Requirements

### Visual Testing

- **Agent-browser visualizer**: Visual verification of all scenarios
- **Selection visualization**: Verify selection boundaries visually
- **Formatting verification**: Verify styles applied correctly visually
- **Block transformation**: Verify block changes visually
- **Cross-browser testing**: Test in all target browsers

### Scenario Testing

Every feature must be tested across all selection scenarios:
1. Collapsed cursor (no selection)
2. Partial word selection
3. Whole paragraph selection
4. Partial paragraphs selection
5. Cross-paragraph partial selection
6. Full multi-paragraph selection

### Edge Case Testing

- Empty document
- Single character document
- Mixed content (text + images + lists)
- Nested styles (bold within italic)
- Nested lists (3+ levels)
- Large document (1000+ paragraphs)
- Paste from various sources (Word, Google Docs, HTML)
- Mobile touch interactions
- Keyboard shortcuts combinations

## Success Criteria

**No half-working features.** Every interaction must:
1. Work across all 6 selection scenarios
2. Work in all 4 target browsers
3. Work on desktop, mobile, and tablet
4. Work with screen readers
5. Work without performance degradation
6. Pass visual verification in agent-browser

**Zero tolerance for:**
- Operations that stop at block boundaries
- Style nesting that creates invalid DOM
- Undo/redo that loses selection
- Paste that creates security vulnerabilities
- Touch interactions that don't work on mobile
- Keyboard shortcuts that don't work per browser
- Accessibility that fails screen reader tests

---

*Requirements complete. All features are critical and must be implemented.*
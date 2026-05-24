# Rich Text Editor Pitfalls & Edge Cases

**Domain:** Rich Text Editor Development
**Researched:** 2026-05-25
**Context:** Production editor with zero tolerance for half-working features

---

## Critical Pitfalls

Mistakes that cause rewrites, major bugs, or security vulnerabilities.

### 1. Selection API Browser Differences

**What goes wrong:** Selection behavior differs significantly across browsers, causing cursor positioning failures, lost selections, and incorrect range calculations.

**Why it happens:** The Selection and Range APIs have inconsistent implementations, especially around edge cases.

**Browser-specific issues:**

| Browser | Issue | Impact |
|---------|-------|--------|
| **Safari** | Inline decorations cause incorrect anchor/head during Shift+Arrow selection | Selection appears in wrong location |
| **Safari/Chrome** | Selection issues inside Shadow DOM | Cursor positioning fails in web components |
| **Firefox** | `rangeCount` can be 0 even when selection exists | Must check `focusNode` instead of relying on `getRangeAt(0)` |
| **Chrome** | Unexpected BR nodes with Chinese IME + backspace | Extra line breaks appear |
| **iOS Safari** | Tap left of checkbox moves caret to end of document | Severe navigation bug |

**Consequences:**
- Cursor jumps to wrong position after formatting
- Selection lost after toolbar interaction
- Format operations apply to wrong text
- Table navigation breaks

**Prevention:**
```javascript
// WRONG: Assume rangeCount > 0
const range = selection.getRangeAt(0);

// CORRECT: Check both conditions
function getSafeRange() {
  const sel = document.getSelection();
  if (!sel || sel.rangeCount === 0 || !sel.focusNode) {
    return null;
  }
  return sel.getRangeAt(0);
}

// Handle Safari anchor/head mismatch
function getSelectionDirection() {
  const sel = document.getSelection();
  const range = sel.getRangeAt(0);
  return sel.anchorNode === range.startContainer &&
         sel.anchorOffset === range.startOffset
    ? 'forward' : 'backward';
}
```

**Detection:**
- Test all selection operations in Safari, Chrome, Firefox, Edge
- Test with Shadow DOM if using web components
- Test with IME input (Chinese, Japanese, Korean)
- Test on mobile (iOS Safari, Chrome Android)

**Sources:**
- [ProseMirror GitHub Issues](https://github.com/ProseMirror/prosemirror/issues) - Safari inline decoration bugs
- [Slate.js GitHub Issues](https://github.com/ianstormtaylor/slate/issues) - Android keyboard issues
- [MDN Selection API](https://developer.mozilla.org/en-US/docs/Web/API/Selection_API)

---

### 2. IME Composition Edge Cases

**What goes wrong:** Input Method Editor (IME) composition for CJK (Chinese, Japanese, Korean) languages causes character duplication, cursor jumps, or lost input.

**Why it happens:** Browsers fire `compositionstart`, `compositionupdate`, and `compositionend` events differently, and `beforeinput` events may not be cancelable during composition.

**Browser-specific issues:**

| Browser | Issue | Impact |
|---------|-------|--------|
| **Chrome/Android** | Hangul composition breaks on first character when placeholder visible | Korean input fails |
| **Firefox Android + Samsung Keyboard** | Fails to insert some characters | Unusable on specific devices |
| **Chrome Windows** | CJK characters duplicate/remove on click | Data corruption |
| **iOS** | Editor unresponsive after block conversion during composition | App freeze |

**Consequences:**
- Users cannot type in their native language
- Characters appear twice or disappear
- Editor becomes unusable on mobile devices
- Lost work and frustration

**Prevention:**
```javascript
// Track composition state
let isComposing = false;

editor.addEventListener('compositionstart', (e) => {
  isComposing = true;
  // Don't apply formatting during composition
});

editor.addEventListener('compositionend', (e) => {
  isComposing = false;
  // Now safe to apply transformations
  saveUndoState();
});

// Check before applying operations
function applyFormat(command) {
  if (isComposing) {
    console.warn('Cannot format during IME composition');
    return false;
  }
  // Apply format...
}

// Handle beforeinput properly
editor.addEventListener('beforeinput', (e) => {
  if (e.isComposing) {
    // Don't interfere with composition
    return;
  }
  if (e.cancelable) {
    // Safe to prevent and handle manually
    e.preventDefault();
  }
});
```

**Detection:**
- Test with Chinese Pinyin input (Sogou, Microsoft Pinyin)
- Test with Japanese Hiragana/Katakana input
- Test with Korean Hangul input
- Test on mobile devices with native keyboards
- Test composition + formatting operations (bold during composition)

**Sources:**
- [MDN beforeinput Event](https://developer.mozilla.org/en-US/docs/Web/API/Element/beforeinput_event) - Composition limitations
- [Slate.js Issues](https://github.com/ianstormtaylor/slate/issues) - Android IME bugs
- [ProseMirror Issues](https://github.com/ProseMirror/prosemirror/issues) - Chrome CJK bugs

---

### 3. XSS via Paste Sanitization

**What goes wrong:** Pasting content from external sources (Word, Google Docs, websites) injects malicious scripts, event handlers, or dangerous HTML.

**Why it happens:** `execCommand('insertHTML')` and direct DOM manipulation accept any HTML string without sanitization.

**Attack vectors:**

| Vector | Example | Risk |
|--------|---------|------|
| Script tags | `<script>alert('XSS')</script>` | Code execution |
| Event handlers | `<img onerror="alert('XSS')" src="x">` | Code execution on error |
| JavaScript URLs | `<a href="javascript:alert('XSS')">` | Code execution on click |
| Data URLs | `<a href="data:text/html,<script>...">` | Code execution |
| SVG with scripts | `<svg onload="alert('XSS')">` | Code execution on load |
| CSS expressions | `<div style="background:url(javascript:...)">` | Legacy IE code execution |

**Consequences:**
- Session hijacking
- Data theft
- Malware distribution
- Complete application compromise

**Prevention:**
```javascript
// Use DOMPurify for sanitization
import DOMPurify from 'dompurify';

// Configure allowed tags and attributes
const CLEAN_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'span',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title',
    'class', 'style'
  ],
  ALLOW_DATA_ATTR: false, // No data-* attributes
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
};

// Sanitize on paste
editor.addEventListener('paste', (e) => {
  e.preventDefault();

  const clipboardData = e.clipboardData || window.clipboardData;
  const html = clipboardData.getData('text/html');
  const text = clipboardData.getData('text/plain');

  // Prefer HTML if available, sanitize it
  const content = html
    ? DOMPurify.sanitize(html, CLEAN_CONFIG)
    : escapeHtml(text);

  // Use Trusted Types if available
  if (window.trustedTypes && trustedTypes.createPolicy) {
    const policy = trustedTypes.createPolicy('editor-policy', {
      createHTML: (input) => DOMPurify.sanitize(input, CLEAN_CONFIG)
    });
    document.execCommand('insertHTML', false, policy.createHTML(content));
  } else {
    document.execCommand('insertHTML', false, content);
  }
});

// Escape HTML for plain text
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

**Additional mitigations:**
- Enable Trusted Types CSP: `require-trusted-types-for 'script'`
- Strip all `style` attributes if not needed (can contain expressions)
- Validate URLs: only allow `http:`, `https:`, `mailto:`
- Remove all `data:` URLs except images
- Test with OWASP XSS filter evasion examples

**Detection:**
- Test paste from Microsoft Word (complex HTML)
- Test paste from Google Docs (spans with styles)
- Test paste from websites (scripts, iframes)
- Test paste from malicious sources (XSS test cases)
- Use automated security scanners

**Sources:**
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [MDN execCommand Security](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand)

---

### 4. Undo/Redo State Explosion

**What goes wrong:** Undo stack grows unbounded, consuming excessive memory and causing browser crashes or severe slowdown.

**Why it happens:** Every keystroke, style change, and DOM mutation is saved without deduplication, batching, or limits.

**Consequences:**
- Browser tab crashes (out of memory)
- Undo/redo operations take seconds to complete
- Poor performance on large documents
- Users lose work when browser crashes

**Prevention:**
```javascript
class UndoManager {
  constructor(maxStates = 100) {
    this.undos = [];
    this.redos = [];
    this.maxStates = maxStates;
    this.lastState = null;
    this.lastSaveTime = 0;
    this.debounceMs = 300;
  }

  saveState(html) {
    const now = Date.now();

    // Debounce: Don't save if same content within debounce window
    if (html === this.lastState) {
      return;
    }

    // Batch rapid changes (typing)
    if (now - this.lastSaveTime < this.debounceMs) {
      // Replace last state instead of adding new one
      this.undos[this.undos.length - 1] = html;
      this.lastState = html;
      this.lastSaveTime = now;
      return;
    }

    // Add new state
    this.undos.push(html);
    this.lastState = html;
    this.lastSaveTime = now;

    // Clear redo stack (new action invalidates redo)
    this.redos = [];

    // Enforce limit
    if (this.undos.length > this.maxStates) {
      this.undos.shift(); // Remove oldest
    }
  }

  undo(currentHtml) {
    if (this.undos.length <= 1) return null;

    // Save current state to redo stack
    this.redos.push(currentHtml);

    // Return previous state
    const prevState = this.undos.pop();
    this.lastState = prevState;
    return prevState;
  }

  redo(currentHtml) {
    if (this.redos.length === 0) return null;

    // Save current state to undo stack
    this.undos.push(currentHtml);

    // Return next state
    const nextState = this.redos.pop();
    this.lastState = nextState;
    return nextState;
  }
}

// Usage with MutationObserver
const undoManager = new UndoManager(100);
let saveTimeout = null;

const observer = new MutationObserver(() => {
  // Debounce saves
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    undoManager.saveState(editor.innerHTML);
  }, 300);
});
```

**Additional strategies:**
- Use structural sharing (only store diffs, not full HTML)
- Compress states with LZ-String or similar
- Persist to IndexedDB for large documents
- Show undo stack size to users (warn if too large)
- Implement "compact history" operation

**Detection:**
- Test with 10,000+ character documents
- Test rapid typing (100+ chars/second)
- Monitor memory usage in DevTools
- Test undo/redo performance with 100+ states

**Sources:**
- [ProseMirror History](https://prosemirror.net/docs/ref/#history) - State compression
- [Slate.js Issues](https://github.com/ianstormtaylor/slate/issues) - Performance problems

---

### 5. Selection Lost on Toolbar Interaction

**What goes wrong:** Clicking toolbar buttons (bold, italic, etc.) causes the text selection to be lost before the command executes.

**Why it happens:** Clicking a button moves focus from the editor to the button, triggering `blur` and clearing the selection.

**Consequences:**
- Format commands apply to wrong location or fail
- Users must re-select text after every toolbar action
- Frustrating user experience

**Prevention:**
```javascript
// WRONG: onClick handler
button.addEventListener('click', (e) => {
  document.execCommand('bold'); // Selection already lost!
});

// CORRECT: onMouseDown with preventDefault
button.addEventListener('mousedown', (e) => {
  e.preventDefault(); // Prevent focus transfer
  document.execCommand('bold'); // Selection preserved
});

// Alternative: Save and restore selection
let savedSelection = null;

function saveSelection() {
  const sel = document.getSelection();
  if (sel.rangeCount > 0) {
    savedSelection = sel.getRangeAt(0).cloneRange();
  }
}

function restoreSelection() {
  if (savedSelection) {
    const sel = document.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedSelection);
  }
}

button.addEventListener('click', (e) => {
  restoreSelection();
  document.execCommand('bold');
  saveSelection(); // Save for next operation
});

editor.addEventListener('blur', (e) => {
  // Check if focus moved to toolbar
  if (toolbar.contains(e.relatedTarget)) {
    saveSelection(); // Save before losing focus
  }
});
```

**Detection:**
- Test all toolbar buttons with selected text
- Test rapid toolbar button clicks
- Test toolbar keyboard navigation
- Test on touch devices (tap vs click timing)

**Sources:**
- [TinyMCE Documentation](https://www.tiny.cloud/docs/) - Selection preservation
- [CKEditor Best Practices](https://ckeditor.com/docs/)

---

## Moderate Pitfalls

### 6. Empty Paragraph Handling

**What goes wrong:** Empty paragraphs collapse to zero height, making them unclickable and invisible, or browsers insert inconsistent `<br>` tags.

**Why it happens:** Browsers handle empty contenteditable elements differently.

**Browser differences:**

| Browser | Empty Paragraph Behavior |
|---------|-------------------------|
| **Chrome** | Inserts `<br>` in empty `<p>` |
| **Firefox** | Uses `<br>` for line breaks |
| **Safari** | May use `<div>` instead of `<p>` |
| **Edge** | Follows Chrome behavior |

**Prevention:**
```javascript
// Ensure empty paragraphs have br
function normalizeEmptyParagraphs(editor) {
  const paragraphs = editor.querySelectorAll('p, div, li');
  paragraphs.forEach(p => {
    if (p.innerHTML.trim() === '') {
      p.innerHTML = '<br>';
    }
  });
}

// Use CSS to ensure minimum height
editor p:empty::before {
  content: '\00A0'; /* Non-breaking space */
}

/* Or */
editor p {
  min-height: 1.5em;
}
```

---

### 7. Nested Style Conflicts

**What goes wrong:** Applying styles creates deeply nested spans, conflicting styles, or empty style tags that clutter the DOM.

**Example:**
```html
<!-- After multiple format operations -->
<span style="font-weight: bold">
  <span style="font-weight: normal">
    <span style="font-weight: bold">
      <strong>text</strong>
    </span>
  </span>
</span>
```

**Prevention:**
```javascript
// Normalize styles after operations
function normalizeStyles(editor) {
  // Remove empty spans
  editor.querySelectorAll('span').forEach(span => {
    if (!span.attributes.length || span.innerHTML === '') {
      span.replaceWith(...span.childNodes);
    }
  });

  // Merge adjacent spans with same styles
  // Flatten nested spans with conflicting styles
  // Use semantic elements (strong, em) instead of spans
}

// Use semantic elements
document.execCommand('bold'); // Creates strong or b
document.execCommand('italic'); // Creates em or i
```

---

### 8. List Conversion Edge Cases

**What goes wrong:** Converting between list types (bullet <-> numbered) or nesting lists creates invalid HTML or breaks structure.

**Edge cases:**
- Converting nested lists (preserve nesting?)
- Mixed content in list items (text + other elements)
- Empty list items
- Lists inside blockquotes
- Multi-level nesting (ol > ul > ol)

**Prevention:**
```javascript
// Validate list structure
function normalizeLists(editor) {
  // Ensure only li inside ul/ol
  editor.querySelectorAll('ul, ol').forEach(list => {
    Array.from(list.childNodes).forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        // Wrap orphan text in li
        const li = document.createElement('li');
        li.textContent = child.textContent;
        child.replaceWith(li);
      } else if (child.nodeType === Node.ELEMENT_NODE &&
                 child.tagName !== 'LI') {
        // Move non-li elements out
        list.parentNode.insertBefore(child, list);
      }
    });
  });

  // Remove empty lists
  editor.querySelectorAll('ul:empty, ol:empty').forEach(list => {
    list.remove();
  });
}
```

---

### 9. Cursor Positioning After Operations

**What goes wrong:** After insertions, deletions, or formatting, the cursor appears in unexpected locations.

**Common issues:**
- Cursor at start of line instead of end after Enter
- Cursor outside inserted element
- Cursor in wrong position after split
- Cursor lost after block transformation

**Prevention:**
```javascript
// Explicitly set cursor after operations
function insertNodeWithCursor(node, position = 'after') {
  const range = getCurrentRange();
  if (!range) return;

  range.deleteContents();
  range.insertNode(node);

  // Move cursor
  const newRange = document.createRange();
  const sel = document.getSelection();

  if (position === 'after') {
    newRange.setStartAfter(node);
    newRange.setEndAfter(node);
  } else if (position === 'inside') {
    newRange.selectNodeContents(node);
    newRange.collapse(true); // Cursor at start
  }

  sel.removeAllRanges();
  sel.addRange(newRange);
}

// Scroll cursor into view
function scrollCursorIntoView() {
  const sel = document.getSelection();
  if (!sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  if (rect.top < 0 || rect.bottom > window.innerHeight) {
    range.startContainer.parentElement?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }
}
```

---

### 10. Zero-Width Space Issues

**What goes wrong:** Zero-width spaces (U+200B) used for cursor positioning accumulate in content, break copy-paste, or appear as unexpected characters.

**Why it happens:** Some editors insert ZWSP to make empty elements selectable, but forget to remove them.

**Prevention:**
```javascript
// Remove ZWSP on save/export
function cleanContent(html) {
  // Remove zero-width spaces (use actual Unicode value)
  return html.replace(/​/g, '');
}

// Don't use ZWSP for positioning
// Instead: Use CSS and proper DOM structure
editor:empty::before {
  content: attr(data-placeholder);
  color: gray;
}
```

---

## Minor Pitfalls

### 11. Triple-Click Selection Differences

**What goes wrong:** Triple-click to select paragraph behaves differently across browsers.

**Browser differences:**
- **Chrome:** Selects paragraph including following whitespace
- **Firefox:** Selects paragraph content only
- **Safari:** May select extra line breaks

**Prevention:** Test triple-click behavior, normalize selection after operations.

---

### 12. Tab Key Handling

**What goes wrong:** Tab key conflicts with browser shortcuts, accessibility navigation, or table cell navigation.

**Prevention:**
```javascript
editor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();

    if (isInTableCell()) {
      navigateTableCells(e.shiftKey);
    } else {
      // Insert tab character or indent
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  }
});
```

---

### 13. Spell Check Interference

**What goes wrong:** Browser spell checker modifies content unexpectedly, adds markers that break serialization, or interferes with custom highlighting.

**Prevention:**
```javascript
// Disable spell check during critical operations
editor.spellcheck = false;

// Re-enable after
setTimeout(() => {
  editor.spellcheck = true;
}, 100);
```

---

### 14. Mobile Keyboard Quirks

**What goes wrong:** Mobile keyboards (iOS, Android, third-party) have unique behaviors that break editors.

**Known issues:**
- **iOS:** Autocorrect inserts unexpected HTML
- **Android:** Some keyboards dismiss on certain actions
- **Samsung Keyboard:** Composition issues with Firefox
- **Gboard:** May insert rich content unexpectedly

**Prevention:** Test on real devices with multiple keyboards, handle `beforeinput` events carefully.

---

### 15. Drag-and-Drop Edge Cases

**What goes wrong:** Dragging content within editor or from external sources causes duplicates, lost content, or invalid HTML.

**Prevention:**
```javascript
editor.addEventListener('drop', (e) => {
  e.preventDefault();

  // Get drop data
  const html = e.dataTransfer.getData('text/html');
  const text = e.dataTransfer.getData('text/plain');

  // Sanitize and insert
  const clean = DOMPurify.sanitize(html || text, CLEAN_CONFIG);
  document.execCommand('insertHTML', false, clean);
});
```

---

## Performance Anti-Patterns

### 16. Excessive DOM Operations

**What goes wrong:** Manipulating DOM for every keystroke causes reflows, repaints, and sluggish performance.

**Prevention:**
- Batch DOM updates
- Use `requestAnimationFrame` for visual updates
- Debounce expensive operations
- Use virtual scrolling for large documents

---

### 17. MutationObserver Memory Leaks

**What goes wrong:** MutationObserver not disconnected on component unmount continues firing, consuming memory and CPU.

**Prevention:**
```javascript
useEffect(() => {
  const observer = new MutationObserver(callback);
  observer.observe(editor, config);

  // CRITICAL: Return cleanup function
  return () => observer.disconnect();
});
```

---

### 18. Large Document Slowdown

**What goes wrong:** Documents with 10,000+ paragraphs cause severe performance degradation.

**Prevention:**
- Implement virtual rendering (only render visible content)
- Limit undo stack size
- Debounce mutation observer
- Use Web Workers for heavy computations
- Consider splitting very large documents

---

## Security Vulnerabilities

### 19. Malicious HTML via insertHTML

**What goes wrong:** Using `execCommand('insertHTML')` with unsanitized content enables XSS.

**Prevention:** Always sanitize with DOMPurify before insertion. Use Trusted Types CSP.

---

### 20. Script Injection via Image src

**What goes wrong:** `<img src="javascript:alert('XSS')">` executes code in legacy browsers.

**Prevention:** Validate all URLs, only allow `http:`, `https:`, `data:image/` protocols.

---

## Testing Edge Cases

### Must-Test Scenarios

**Selection:**
- Collapsed selection at start/end of document
- Selection spanning multiple block elements
- Selection inside nested inline elements
- Backward selection (drag right to left)
- Selection across table cells
- Selection lost on blur/focus
- Triple-click selection
- Select All (Ctrl+A)

**Input:**
- IME composition (Chinese, Japanese, Korean)
- Dead keys (accents: e, n, u)
- Paste from Word (complex HTML)
- Paste from Google Docs (spans with styles)
- Paste plain text
- Paste image from clipboard
- Drag-and-drop text
- Drag-and-drop files
- Mobile keyboard autocorrect
- Mobile keyboard predictive text

**Formatting:**
- Apply bold to collapsed selection (type after)
- Apply bold to partial word
- Apply multiple formats to same selection
- Remove format from partially formatted text
- Format nested inline elements
- Format across block boundaries

**Blocks:**
- Convert paragraph to heading
- Convert heading to paragraph
- Create bullet list from multiple paragraphs
- Convert bullet list to numbered list
- Nest lists (bullet inside numbered)
- Convert list to paragraph
- Insert blockquote
- Split block with Enter
- Merge blocks with Backspace

**Tables:**
- Navigate cells with Tab
- Insert row/column
- Delete row/column
- Merge cells
- Selection across multiple cells

**Undo/Redo:**
- Undo typing
- Undo formatting
- Undo block transformation
- Redo after undo
- Undo after new action (clears redo)
- Rapid undo/redo (stress test)

**Edge Cases:**
- Empty document
- Document with only whitespace
- Very long paragraph (10,000+ chars)
- Very deep nesting (50+ levels)
- Mixed content (text + images + tables)
- Content with special characters (emoji, RTL, zero-width)
- Copy-paste within same editor
- Copy-paste to external app
- Print editor content

**Browser Compatibility:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- iOS Safari
- Chrome Android
- Samsung Internet

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Basic text input | IME composition, dead keys | Test with CJK input, track composition state |
| Inline formatting | Selection preservation, nested styles | Use mousedown preventDefault, normalize styles |
| Block formatting | List conversion, cursor positioning | Validate HTML structure, explicit cursor placement |
| Tables | Cell navigation, selection across cells | Custom Tab handling, range validation |
| Undo/redo | State explosion, infinite loops | Limit stack size, debounce saves |
| Paste handling | XSS, style conflicts | Sanitize with DOMPurify, normalize styles |
| Mobile support | Keyboard quirks, touch selection | Test on real devices, handle beforeinput |
| Performance | Large documents, memory leaks | Virtual rendering, cleanup observers |

---

## Sources

**Official Documentation:**
- [MDN Selection API](https://developer.mozilla.org/en-US/docs/Web/API/Selection_API) - HIGH confidence
- [MDN Range API](https://developer.mozilla.org/en-US/docs/Web/API/Range) - HIGH confidence
- [MDN contenteditable](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable) - HIGH confidence
- [MDN beforeinput Event](https://developer.mozilla.org/en-US/docs/Web/API/Element/beforeinput_event) - HIGH confidence
- [MDN execCommand](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand) - HIGH confidence

**Editor Issues & Best Practices:**
- [ProseMirror GitHub Issues](https://github.com/ProseMirror/prosemirror/issues) - HIGH confidence (real-world bugs)
- [Slate.js GitHub Issues](https://github.com/ianstormtaylor/slate/issues) - HIGH confidence (real-world bugs)
- [TinyMCE Documentation](https://www.tiny.cloud/docs/) - MEDIUM confidence (vendor docs)
- [CKEditor Documentation](https://ckeditor.com/docs/) - MEDIUM confidence (vendor docs)

**Security:**
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) - HIGH confidence
- [DOMPurify GitHub](https://github.com/cure53/DOMPurify) - HIGH confidence

**Overall Confidence:** HIGH

This research is based on official MDN documentation, real-world issue trackers from major editors (ProseMirror, Slate.js), and established security best practices (OWASP, DOMPurify). The pitfalls documented here represent actual production issues encountered by widely-used editors.
# Technology Stack for Production-Ready Rich Text Editor

**Framework:** Woby (reactive, component-based, Custom Elements)
**Goal:** Full-featured rich text editor (Lexical/Google Docs style)
**Constraint:** NO execCommand (deprecated) - DOM manipulation only
**Target:** Custom Element `<wui-editor>`
**Browser Support:** Chrome, Firefox, Safari, Edge (latest 2 versions)
**Researched:** 2026-05-25

---

## Executive Summary

Building a production-ready rich text editor without execCommand requires mastering five core browser APIs: **Selection/Range API**, **MutationObserver**, **Clipboard API**, **InputEvent/beforeinput**, and **WAI-ARIA patterns**. The technology stack centers on direct DOM manipulation with Woby's fine-grained reactivity for state management and UI updates.

**Key Architecture Decision:** Use MutationObserver for undo/redo history batching, Selection API for cursor/selection management, and Woby observables for reactive state (toolbar buttons, active formats, history stacks). Avoid virtual DOM approaches—they add unnecessary overhead for contenteditable's direct DOM model.

---

## Core Technology Stack

### 1. DOM Range & Selection API

**Purpose:** Cursor positioning, text selection, and range manipulation

**Browser Compatibility:** Baseline widely available since July 2015. No significant cross-browser incompatibilities in core methods.

**Critical Methods:**
```typescript
// Get current selection
const selection = window.getSelection()
const range = selection.getRangeAt(0)

// Create and manipulate ranges
const newRange = document.createRange()
newRange.setStart(node, offset)
newRange.setEnd(node, offset)
newRange.collapse(toStart: boolean)

// Modify content
range.deleteContents()
range.insertNode(newNode)
range.surroundContents(wrapperElement)  // Throws if range splits non-text nodes
range.extractContents()  // Returns DocumentFragment
```

**Browser Quirks:**

| Browser | Issue | Solution |
|---------|-------|----------|
| Safari | Focuses element when selection is modified programmatically | Expected behavior—ensure focus management in tests |
| Chrome | Same as Safari | No workaround needed |
| Firefox | Does NOT focus element on programmatic selection | Explicitly call `.focus()` if needed |
| All | `range.surroundContents()` throws if range partially selects non-text nodes | Use `extractContents() + insertNode()` fallback |

**Shadow DOM Support:**

```typescript
// Get selection within Shadow DOM
const root = element.getRootNode()
const selection = root instanceof ShadowRoot
  ? root.getSelection()
  : window.getSelection()

// Cross shadow boundary (Chrome 96+, Firefox 96+, Safari 15.4+)
const composedRanges = selection.getComposedRanges()
```

**Implementation Pattern:**

```typescript
// utils.tsx - Already implemented in your codebase
export function getSelection(container?: HTMLElement) {
  const root = container.getRootNode() ?? document.body
  const selection = root instanceof ShadowRoot
    ? (root as any).getSelection()  // Type cast for TS
    : window.getSelection()

  if (!selection || selection.rangeCount === 0) return null

  const range = selection.getRangeAt(0)
  return {
    selection,
    state: {
      startContainer: range.startContainer,
      startContainerPath: getNodePath(range.startContainer, container),
      startOffset: range.startOffset,
      endContainer: range.endContainer,
      endContainerPath: getNodePath(range.endContainer, container),
      endOffset: range.endOffset,
      isCollapsed: range.collapsed
    }
  }
}
```

**Sources:**
- [MDN Selection API](https://developer.mozilla.org/en-US/docs/Web/API/Selection) - HIGH confidence
- [MDN Range API](https://developer.mozilla.org/en-US/docs/Web/API/Range) - HIGH confidence

---

### 2. MutationObserver for Undo/Redo

**Purpose:** Track DOM changes for history management

**Performance Pattern:** Mutations are already batched by the browser—process them with requestAnimationFrame or debounce to avoid thrashing.

**Critical Configuration:**

```typescript
const observer = new MutationObserver((mutations) => {
  // Mutations arrive in batches
  saveToHistory(mutations)
})

observer.observe(editorElement, {
  attributes: true,              // Track style/class changes
  childList: true,               // Track node insertions/deletions
  subtree: true,                 // Track all descendants
  characterData: true,           // Track text content changes
  attributeOldValue: true,       // Enable for undo
  characterDataOldValue: true    // Enable for undo
})
```

**Undo/Redo Implementation:**

```typescript
// undoredo.tsx - Already implemented
export const UndoRedo = ({ children, editor }) => {
  const undos = $([] as string[])
  const redos = $([] as string[])
  const isInitialized = $(false)

  // Initialize with current content
  useEffect(() => {
    const currentEditor = $$(editor)
    if (currentEditor && !$$(isInitialized)) {
      undos([currentEditor.innerHTML])
      isInitialized(true)
    }
  })

  const saveDo = () => {
    const el = $$(editor)
    if (!el) return

    const currentContent = el.innerHTML
    const u = $$(undos)
    const last = u.length ? u[u.length - 1] : ""

    // Only save if content changed
    if (last !== currentContent) {
      undos([...u, currentContent])
      redos([])  // Clear redo stack on new change
    }
  }

  const undo = () => {
    const u = $$(undos)
    if (u.length <= 1) return

    const contentToMoveToRedo = u.pop()
    undos([...u])

    if (contentToMoveToRedo) {
      redos([...$$(redos), contentToMoveToRedo])
    }

    const stateToRestore = u[u.length - 1]
    $$(editor).innerHTML = stateToRestore
  }

  const redo = () => {
    const r = $$(redos)
    if (r.length === 0) return

    const contentToRestore = r.pop()
    redos([...r])

    if (contentToRestore) {
      undos([...$$(undos), contentToRestore])
      $$(editor).innerHTML = contentToRestore
    }
  }

  return (
    <UndoRedoContext.Provider value={{ undos, undo, redos, redo, saveDo }}>
      {children}
    </UndoRedoContext.Provider>
  )
}
```

**Performance Optimization for Large Documents:**

```typescript
// Debounce history saves (already implicit in MutationObserver batching)
let saveTimeout
const debouncedSaveDo = () => {
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => saveDo(), 100)
}

// Or use requestAnimationFrame for smoother UX
let rafId
const rafSaveDo = () => {
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => saveDo())
}
```

**Memory Management:**

```typescript
// Always disconnect on unmount
useEffect(() => {
  const observer = new MutationObserver(callback)
  observer.observe(element, config)

  return () => observer.disconnect()  // Critical for memory
})

// Process remaining mutations before disconnect
const remaining = observer.takeRecords()
processMutations(remaining)
observer.disconnect()
```

**Limit History Stack Size:**

```typescript
const MAX_HISTORY = 100

const saveDo = () => {
  const u = $$(undos)
  const newStack = [...u, currentContent]

  // Limit memory usage
  if (newStack.length > MAX_HISTORY) {
    newStack.shift()  // Remove oldest
  }

  undos(newStack)
}
```

**Sources:**
- [MDN MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) - HIGH confidence
- [MDN MutationRecord](https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord) - HIGH confidence

---

### 3. Clipboard API for Copy/Paste

**Purpose:** Handle copy/paste with format preservation

**Browser Compatibility:** ClipboardEvent baseline since March 2017. Format preservation varies by browser.

**Critical Methods:**

```typescript
// Handle paste with HTML preservation
editor.addEventListener('paste', (e: ClipboardEvent) => {
  e.preventDefault()

  const clipboardData = e.clipboardData
  const html = clipboardData.getData('text/html')
  const plainText = clipboardData.getData('text/plain')

  if (html) {
    // Sanitize HTML before insertion
    const clean = sanitizeHTML(html)
    document.execCommand('insertHTML', false, clean)
  } else {
    document.execCommand('insertText', false, plainText)
  }
})

// Handle copy with format preservation
editor.addEventListener('copy', (e: ClipboardEvent) => {
  const selection = window.getSelection()
  const range = selection.getRangeAt(0)

  // Extract HTML from range
  const container = document.createElement('div')
  container.appendChild(range.cloneContents())

  e.clipboardData.setData('text/html', container.innerHTML)
  e.clipboardData.setData('text/plain', selection.toString())
  e.preventDefault()
})
```

**Browser Differences:**

| Browser | getData('text/html') | setData() Support |
|---------|---------------------|-------------------|
| Chrome | Yes | Full support |
| Firefox | Yes | Full support |
| Safari | Yes (with limitations) | Full support |
| Edge | Yes | Full support |

**Security: Sanitize All Pasted Content**

```typescript
// Use DOMPurify for XSS prevention
import DOMPurify from 'dompurify'

const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'u', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'br'],
    ALLOWED_ATTR: ['href', 'style']
  })
}
```

**Implementation Pattern:**

```typescript
// Editor.tsx - Add to handlePaste
const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()

  const html = e.clipboardData?.getData('text/html')
  const text = e.clipboardData?.getData('text/plain')

  const range = getCurrentRange()
  if (!range) return

  if (html) {
    const clean = sanitizeHTML(html)
    const temp = document.createElement('div')
    temp.innerHTML = clean

    range.deleteContents()
    range.insertNode(temp)

    saveDo()  // Save to history
  } else if (text) {
    range.deleteContents()
    range.insertNode(document.createTextNode(text))
    saveDo()
  }
}
```

**Sources:**
- [MDN ClipboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent) - HIGH confidence
- Web search on format preservation - MEDIUM confidence

---

### 4. Touch & Pointer Events for Mobile/Tablet

**Purpose:** Handle touch-based selection and editing

**Browser Support:** Touch Events API well-supported on mobile browsers. Pointer Events API baseline since 2018.

**Critical Events:**

```typescript
// Touch-based selection (mobile)
editor.addEventListener('touchstart', (e: TouchEvent) => {
  // Handle touch initiation
}, { passive: true })

editor.addEventListener('touchmove', (e: TouchEvent) => {
  // Handle selection expansion during drag
}, { passive: false })

// Pointer Events (cross-device)
editor.addEventListener('pointerdown', (e: PointerEvent) => {
  // Works for mouse, touch, pen
})

editor.addEventListener('pointerup', (e: PointerEvent) => {
  // Selection complete
})
```

**Selection Challenges on Mobile:**

1. **No selectionchange event during touch drag** - Use touchmove + selection API
2. **Context menu interference** - Prevent default on long-press
3. **Virtual keyboard behavior** - Monitor viewport resize

```typescript
// Handle context menu (long-press)
editor.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  // Show custom toolbar
})

// Monitor virtual keyboard (Visual Viewport API)
if ('visualViewport' in window) {
  window.visualViewport.addEventListener('resize', () => {
    // Adjust editor height
    const viewportHeight = window.visualViewport.height
    editor.style.height = `${viewportHeight}px`
  })
}
```

**Mobile-Specific Patterns:**

```typescript
// Detect touch device
const isTouchDevice = 'ontouchstart' in window

// Use pointer events for cross-device support
editor.addEventListener('pointerdown', handlePointerDown)

function handlePointerDown(e: PointerEvent) {
  if (e.pointerType === 'touch') {
    // Touch-specific handling
  } else if (e.pointerType === 'mouse') {
    // Mouse-specific handling
  }
}
```

**Sources:**
- Web search on mobile selection handling - MEDIUM confidence
- Touch Events and Pointer Events have MDN documentation - HIGH confidence

---

### 5. Keyboard Events & Shortcuts

**Purpose:** Handle keyboard shortcuts and navigation

**Browser Compatibility:** KeyboardEvent well-supported. Ctrl/Cmd key behavior consistent across browsers.

**Critical Events:**

```typescript
editor.addEventListener('keydown', (e: KeyboardEvent) => {
  // Detect shortcuts
  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case 'b':
        e.preventDefault()
        applyBold()
        break
      case 'i':
        e.preventDefault()
        applyItalic()
        break
      case 'z':
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
        break
    }
  }
})
```

**Implementation Pattern (Already in Editor.tsx):**

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    e.preventDefault()
    e.stopPropagation()

    if (isCaretInTableCell()) {
      focusNextTableCell(e.shiftKey)
    } else {
      applyIndent($$(editor), e.shiftKey, 1, 20)
      saveDo()
    }
  }

  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case 'z':
        e.preventDefault()
        undo()
        break
      case 'y':
        e.preventDefault()
        redo()
        break
    }
  }
}
```

**Cross-Platform Key Detection:**

```typescript
// Use e.key for cross-platform consistency
// e.code for physical key position (gaming apps)

// Modifiers:
// - Ctrl: Windows/Linux
// - Meta (Cmd): macOS
const isModKey = e.ctrlKey || e.metaKey

if (isModKey && e.key === 'b') {
  e.preventDefault()
  toggleBold()
}
```

**Browser Differences:**

| Browser | Key Property | Modifier Key |
|---------|-------------|--------------|
| All | e.key returns character ('b', 'B') | Ctrl (Win), Meta/Cmd (Mac) |
| Safari | Consistent with others | Same |

**Sources:**
- Web search on keyboard handling - MEDIUM confidence
- MDN KeyboardEvent documentation - HIGH confidence

---

### 6. ARIA Patterns for Accessibility

**Purpose:** Screen reader support and keyboard navigation

**Required ARIA Attributes:**

```html
<!-- Basic contenteditable -->
<div
  contenteditable="true"
  role="textbox"
  aria-multiline="true"
  aria-label="Document editor"
  aria-describedby="editor-help"
>
  <p>Content here</p>
</div>

<!-- Help text -->
<span id="editor-help" class="sr-only">
  Use keyboard shortcuts for formatting. Press Alt+F10 for toolbar.
</span>
```

**Toolbar Accessibility:**

```typescript
// Toolbar with keyboard navigation
<div
  role="toolbar"
  aria-label="Formatting options"
  aria-controls="editor-id"
>
  <button
    role="button"
    aria-label="Bold"
    aria-pressed="false"
    tabindex="0"
  >
    <BoldIcon />
  </button>
</div>
```

**Implementation Pattern:**

```typescript
// Editor.tsx - Add ARIA attributes
<div
  ref={editor}
  contentEditable={isEditing}
  role="textbox"
  aria-multiline="true"
  aria-label="Rich text editor"
  onKeyDown={handleKeyDown}
>
  {children}
</div>
```

**Announce Dynamic Changes:**

```typescript
// Live region for announcements
<div id="live-region" aria-live="polite" class="sr-only"></div>

// Announce formatting changes
const announce = (message: string) => {
  const region = document.getElementById('live-region')
  region.textContent = message
  setTimeout(() => region.textContent = '', 1000)
}

// Usage
toggleBold()
announce('Bold applied')
```

**Sources:**
- Web search on ARIA patterns - MEDIUM confidence
- WAI-ARIA Authoring Practices Guide - HIGH confidence (not fetched but well-known standard)

---

### 7. Performance Patterns for Large Documents

**Challenge:** 1000+ paragraph documents cause performance issues with MutationObserver thrashing and selection queries.

**Optimization Strategies:**

#### 1. Debounce MutationObserver Callback

```typescript
let mutationQueue: MutationRecord[] = []
let rafId: number

const observer = new MutationObserver((mutations) => {
  mutationQueue.push(...mutations)

  // Batch with requestAnimationFrame
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    processMutations(mutationQueue)
    mutationQueue = []
  })
})
```

#### 2. Throttle Selection Queries

```typescript
// Don't query selection on every keystroke
let lastSelectionQuery = 0
const SELECTION_THROTTLE = 100  // ms

const getCurrentSelection = () => {
  const now = Date.now()
  if (now - lastSelectionQuery < SELECTION_THROTTLE) {
    return cachedSelection
  }

  lastSelectionQuery = now
  cachedSelection = window.getSelection()
  return cachedSelection
}
```

#### 3. Limit History Stack Size

```typescript
const MAX_HISTORY = 100

const saveDo = () => {
  const stack = $$(undos)
  const newStack = [...stack, currentContent]

  if (newStack.length > MAX_HISTORY) {
    newStack.shift()  // Remove oldest
  }

  undos(newStack)
}
```

#### 4. Use DocumentFragment for Batch Insertions

```typescript
// Bad: Multiple DOM insertions
items.forEach(item => {
  editor.appendChild(createElement(item))
})

// Good: Single insertion
const fragment = document.createDocumentFragment()
items.forEach(item => {
  fragment.appendChild(createElement(item))
})
editor.appendChild(fragment)
```

#### 5. Avoid Layout Thrashing

```typescript
// Bad: Read-write-read-write
const height1 = element.offsetHeight
element.style.height = '100px'
const height2 = element.offsetHeight  // Forces reflow

// Good: Batch reads, then writes
const height1 = element.offsetHeight
const width1 = element.offsetWidth
element.style.height = '100px'
element.style.width = '100px'
```

#### 6. Virtual Scrolling (Advanced)

For extremely large documents (10,000+ paragraphs), consider virtual scrolling:

```typescript
// Only render visible paragraphs
const visibleStart = Math.floor(scrollTop / PARAGRAPH_HEIGHT)
const visibleEnd = visibleStart + VISIBLE_COUNT

const visibleParagraphs = paragraphs.slice(visibleStart, visibleEnd)
```

**Note:** Virtual scrolling with contenteditable is complex—consider this only if performance issues persist after other optimizations.

**Sources:**
- Web search on performance patterns - MEDIUM confidence
- MDN performance guidance - HIGH confidence

---

### 8. InputEvent and beforeinput (Optional Enhancement)

**Purpose:** Intercept and prevent user input before it happens

**Browser Support:**
- **beforeinput:** Chrome 60+, Firefox 87+, Safari 14.1+, Edge 79+
- **InputEvent:** Baseline since January 2020
- **getTargetRanges():** Chrome 60+, Firefox 87+, Safari 14.1+

**Critical Properties:**

```typescript
editor.addEventListener('beforeinput', (e: InputEvent) => {
  console.log(e.inputType)  // 'insertText', 'deleteContent', 'formatBold'
  console.log(e.data)        // Inserted characters
  console.log(e.getTargetRanges())  // StaticRange[] affected

  // Prevent unwanted input
  if (e.inputType === 'insertFromPaste') {
    e.preventDefault()
    // Handle paste manually
  }
})

editor.addEventListener('input', (e: InputEvent) => {
  console.log(e.dataTransfer)  // DataTransfer for rich content
  console.log(e.isComposing)   // True during IME composition
})
```

**Implementation Pattern:**

```typescript
// Intercept and customize paste behavior
editor.addEventListener('beforeinput', (e: InputEvent) => {
  if (e.inputType === 'insertFromPaste') {
    e.preventDefault()

    // Get clipboard data via Clipboard API
    navigator.clipboard.read().then(items => {
      // Process and sanitize
    })
  }
})
```

**Limitation:** Safari on iOS has limited support—test thoroughly on iOS devices.

**Sources:**
- [MDN InputEvent](https://developer.mozilla.org/en-US/docs/Web/API/InputEvent) - HIGH confidence
- Web search on beforeinput support - MEDIUM confidence

---

### 9. XSS Prevention & Security

**Purpose:** Prevent script injection from pasted content and user input

**Critical Measures:**

#### 1. Sanitize All Pasted HTML

```typescript
import DOMPurify from 'dompurify'

const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'u', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'br', 'span'],
    ALLOWED_ATTR: ['href', 'style', 'class'],
    ALLOW_DATA_ATTR: false
  })
}
```

#### 2. Validate URLs in Links

```typescript
DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
  if (data.attrName === 'href') {
    const url = data.attrValue

    // Only allow safe protocols
    if (!url.startsWith('http://') &&
        !url.startsWith('https://') &&
        !url.startsWith('mailto:') &&
        !url.startsWith('tel:')) {
      data.attrValue = ''  // Remove dangerous URL
    }
  }
})
```

#### 3. Strip Inline Event Handlers

```typescript
// DOMPurify automatically removes onclick, onerror, etc.
// But double-check:
const clean = sanitizeHTML(dirty)
// All event handlers are removed
```

#### 4. Use Content Security Policy (CSP)

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
">
```

**Note:** CSP 'unsafe-inline' for styles is needed for inline style attributes in editor content.

#### 5. Escape User Input in Non-Editor Contexts

```typescript
// When displaying editor content elsewhere
const escapeHTML = (str: string) => {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
```

**Implementation Pattern:**

```typescript
// Editor.tsx - Secure paste handler
const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()

  const html = e.clipboardData?.getData('text/html')
  const range = getCurrentRange()

  if (html && range) {
    const clean = sanitizeHTML(html)
    const temp = document.createElement('div')
    temp.innerHTML = clean

    range.deleteContents()
    range.insertNode(temp)
    saveDo()
  }
}
```

**Sources:**
- Web search on XSS prevention - HIGH confidence (well-established security practice)
- DOMPurify documentation - HIGH confidence

---

## Integration with Woby's Reactive Model

### Core Integration Patterns

Woby's fine-grained reactivity eliminates the need for manual state synchronization. Observables auto-track dependencies and update the DOM directly.

#### 1. Observable State for Toolbar

```typescript
// Toolbar button state
const isBold = $(false)

// Auto-updating button
<Button
  aria-pressed={() => $$(isBold)}
  class={() => $$(isBold) ? 'active' : ''}
  onClick={toggleBold}
>
  <BoldIcon />
</Button>
```

#### 2. Selection-Based Reactive State

```typescript
// Track active formats
const activeFormats = $({
  bold: false,
  italic: false,
  underline: false
})

// Update on selection change
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  const anchor = selection.anchorNode
  if (!anchor) return

  // Check for formatting
  activeFormats({
    bold: isNodeInside(anchor, 'b') || isNodeInside(anchor, 'strong'),
    italic: isNodeInside(anchor, 'i') || isNodeInside(anchor, 'em'),
    underline: isNodeInside(anchor, 'u')
  })
})
```

#### 3. Context API for Editor State

```typescript
// Already implemented in undoredo.tsx
export const EditorContext = createContext<Observable<HTMLDivElement>>()
export const useEditor = () => useContext(EditorContext)

export const UndoRedoContext = createContext<{
  undos: Observable<string[]>
  undo: () => void
  redos: Observable<string[]>
  redo: () => void
  saveDo: () => void
}>()
export const useUndoRedo = () => useContext(UndoRedoContext)
```

#### 4. Lifecycle Management with useEffect

```typescript
// Editor.tsx - MutationObserver lifecycle
useEffect(() => {
  const el = $$(editor)
  if (!el) return

  const observer = new MutationObserver((mutations) => {
    saveDo()
  })

  observer.observe(el, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true
  })

  return () => observer.disconnect()
})
```

#### 5. Custom Element Integration

```typescript
// Already implemented
customElement('wui-editor', Editor)

declare module 'woby' {
  namespace JSX {
    interface IntrinsicElements {
      'wui-editor': ElementAttributes<typeof Editor>
    }
  }
}
```

### Key Woby Patterns for Editor

| Pattern | Implementation | Why |
|---------|---------------|-----|
| **Observable state** | `$(value)` | Auto-track dependencies, fine-grained updates |
| **Function expressions** | `{() => $$(count) * 2}` | Reactive computations without useMemo |
| **useEffect without deps** | Auto-tracks observable access | No stale closures, no dependency arrays |
| **Context for shared state** | `createContext()`, `useContext()` | Pass editor/history to all components |
| **Custom elements** | `customElement('wui-editor', Editor)` | Native web component with reactive props |

**Sources:**
- Woby GitHub repository - HIGH confidence
- Existing codebase analysis - HIGH confidence

---

## execCommand Replacement Strategy

**Critical Context:** execCommand is deprecated and will be removed. Do NOT use it.

### Commands to Replace

| execCommand | Replacement |
|-------------|-------------|
| `execCommand('bold')` | `applyStyle(el => el.style.fontWeight = 'bold')` |
| `execCommand('italic')` | `applyStyle(el => el.style.fontStyle = 'italic')` |
| `execCommand('underline')` | `applyStyle(el => el.style.textDecoration = 'underline')` |
| `execCommand('insertHTML')` | `range.insertNode(parsedElement)` |
| `execCommand('insertText')` | `range.insertNode(document.createTextNode(text))` |
| `execCommand('delete')` | `range.deleteContents()` |
| `execCommand('formatBlock')` | `convertToSemanticElement(element, 'h1')` |
| `execCommand('indent')` | Custom indentation logic (see Editor.tsx) |

### Implementation Pattern

```typescript
// utils.tsx - Already implemented
export const applyStyle = (styleSetter: (element: HTMLElement) => void) => {
  const editor = $$(useEditor())
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  const spanElement = document.createElement('span')

  try {
    range.surroundContents(spanElement)
    styleSetter(spanElement)

    // Remove empty span
    if (spanElement.getAttribute('style') === '') {
      const parent = spanElement.parentNode
      while (spanElement.firstChild) {
        parent?.insertBefore(spanElement.firstChild, spanElement)
      }
      parent?.removeChild(spanElement)
    }
  } catch (e) {
    // Fallback for partial selections
    const extracted = range.extractContents()
    spanElement.appendChild(extracted)
    range.insertNode(spanElement)
    styleSetter(spanElement)
  }
}
```

**Sources:**
- Web search on execCommand alternatives - MEDIUM confidence
- MDN deprecation notices - HIGH confidence

---

## Browser Compatibility Summary

| Feature | Chrome | Firefox | Safari | Edge | Notes |
|---------|--------|---------|--------|------|-------|
| Selection API | Full | Full | Full | Full | Safari focuses element on programmatic selection |
| Range API | Full | Full | Full | Full | Avoid `range.detach()` (deprecated) |
| MutationObserver | Full | Full | Full | Full | Baseline since 2014 |
| ClipboardEvent | Full | Full | Full | Full | Baseline since March 2017 |
| beforeinput | 60+ | 87+ | 14.1+ | 79+ | Limited iOS Safari support |
| InputEvent | Full | Full | Full | Full | Baseline since January 2020 |
| ShadowRoot.getSelection() | 53+ | 63+ | 12.1+ | 79+ | Required for Shadow DOM |
| getComposedRanges() | 96+ | 96+ | 15.4+ | 96+ | Cross shadow boundary selections |
| Touch Events | Full | Full | Full | Full | Mobile only |
| Pointer Events | Full | Full | Full | Full | Cross-device |

**Recommendation:** Target latest 2 versions of Chrome, Firefox, Safari, Edge. All core APIs are stable and well-supported.

---

## Recommended Architecture

### Component Structure

```
Editor (Custom Element)
├── UndoRedo (Context Provider)
│   ├── EditorToolbar
│   │   ├── UndoRedoButton
│   │   ├── TextFormatDropDown
│   │   ├── FontFamilyDropDown
│   │   ├── FontSize
│   │   ├── BoldButton
│   │   ├── ItalicButton
│   │   ├── UnderlineButton
│   │   ├── TextColorPicker
│   │   ├── TextBackgroundColorPicker
│   │   ├── List (bullet/number/checkbox)
│   │   ├── TextAlignDropDown
│   │   ├── Indent
│   │   ├── InsertDropDown
│   │   └── Blockquote
│   └── EditorSurface (contenteditable div)
```

### Data Flow

```
User Input (keyboard/mouse/touch)
  ↓
MutationObserver detects DOM changes
  ↓
saveDo() saves innerHTML to undos stack
  ↓
Woby observables auto-update toolbar state
  ↓
User clicks undo button
  ↓
undo() pops from undos, restores innerHTML
  ↓
DOM updates, toolbar buttons update
```

### State Management

| State | Storage | Access |
|-------|---------|--------|
| Editor content | DOM (contenteditable) | `editor.innerHTML` |
| Undo stack | Observable<string[]> | `useUndoRedo().undos` |
| Redo stack | Observable<string[]> | `useUndoRedo().redos` |
| Active formats | Observable<object> | Toolbar buttons read via `$$()` |
| Selection state | Selection API | `window.getSelection()` |
| Cursor position | Range API | `selection.getRangeAt(0)` |

---

## Performance Considerations

### Document Size Limits

| Document Size | Performance | Strategy |
|---------------|-------------|----------|
| < 100 paragraphs | Excellent | No optimization needed |
| 100-1000 paragraphs | Good | Debounce history saves, throttle selection queries |
| 1000-5000 paragraphs | Acceptable | Limit history stack, use DocumentFragment |
| 5000+ paragraphs | Degraded | Consider virtual scrolling (advanced) |

### Memory Management

```typescript
// Limit history stack
const MAX_HISTORY = 100

// Disconnect observers on unmount
useEffect(() => {
  const observer = new MutationObserver(callback)
  return () => observer.disconnect()
})

// Clear selection cache
let cachedSelection: Selection | null = null
const clearCache = () => { cachedSelection = null }
```

### Optimization Checklist

- [ ] Debounce MutationObserver callback with requestAnimationFrame
- [ ] Throttle selection queries (100ms minimum)
- [ ] Limit undo/redo stack size (100 entries)
- [ ] Use DocumentFragment for batch insertions
- [ ] Avoid layout thrashing (batch reads, then writes)
- [ ] Disconnect observers when editor loses focus
- [ ] Clean up empty nodes on input (already in useBlockEnforcer)

---

## Security Concerns

### XSS Attack Vectors

1. **Pasted HTML** - Contains malicious scripts
2. **Clipboard data** - Spoofed MIME types
3. **User input** - Inline event handlers (onclick)
4. **URLs in links** - javascript: protocol
5. **Data URLs** - Embedded scripts in data: URLs

### Defense Strategy

| Attack Vector | Defense |
|---------------|---------|
| Pasted HTML | DOMPurify sanitization |
| Clipboard data | Validate MIME types, sanitize content |
| Inline event handlers | DOMPurify removes all on* attributes |
| javascript: URLs | Whitelist protocols (http, https, mailto, tel) |
| Data URLs | Strip or sanitize data: URLs |

### Implementation

```typescript
// Mandatory: Sanitize all pasted content
const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const html = e.clipboardData?.getData('text/html')
  if (html) {
    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'b', 'i', 'u', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'br', 'span'],
      ALLOWED_ATTR: ['href', 'style', 'class']
    })
    // Insert clean HTML
  }
}

// Mandatory: Validate URLs
DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
  if (data.attrName === 'href') {
    const url = data.attrValue
    if (!/^(https?|mailto|tel):/.test(url)) {
      data.attrValue = ''
    }
  }
})
```

---

## Testing Strategy

### Cross-Browser Testing

Test on:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- iOS Safari (latest 2 versions)
- Android Chrome (latest 2 versions)

### Critical Test Cases

1. **Selection API**
   - Cursor positioning at start/middle/end of text
   - Selection across multiple paragraphs
   - Selection within nested elements (lists, tables)
   - Shadow DOM selections

2. **Undo/Redo**
   - Typing and immediate undo
   - Formatting changes and undo
   - Multiple undos then redos
   - History stack limit

3. **Copy/Paste**
   - Plain text paste
   - HTML paste from Word/Google Docs
   - Copy and paste within editor
   - Cross-browser paste

4. **Keyboard Shortcuts**
   - Ctrl/Cmd + B, I, U
   - Ctrl/Cmd + Z, Y
   - Tab in tables vs paragraphs
   - Arrow key navigation

5. **Mobile/Touch**
   - Touch to position cursor
   - Long-press context menu
   - Selection handles
   - Virtual keyboard interaction

6. **Accessibility**
   - Screen reader announces formatting
   - Keyboard-only navigation
   - ARIA attributes present
   - Focus management

---

## Implementation Checklist

### Phase 1: Core Editor (No execCommand)

- [x] contenteditable div with Woby integration
- [x] MutationObserver for DOM changes
- [x] Undo/Redo with history stack
- [x] Selection API utilities (getCurrentRange, getSelection, restoreSelection)
- [ ] Keyboard shortcuts handling (partially implemented)
- [ ] Apply formatting via DOM manipulation (applyStyle function)

### Phase 2: Rich Text Features

- [ ] Bold, italic, underline (without execCommand)
- [ ] Font family and size
- [ ] Text color and background color
- [ ] Text alignment
- [ ] Lists (bullet, numbered, checkbox)
- [ ] Blockquotes
- [ ] Links

### Phase 3: Advanced Features

- [ ] Tables
- [ ] Images
- [ ] Copy/paste with format preservation
- [ ] Touch/mobile support
- [ ] Accessibility (ARIA)

### Phase 4: Performance & Security

- [ ] Debounce MutationObserver
- [ ] Throttle selection queries
- [ ] Limit history stack
- [ ] DOMPurify integration
- [ ] URL validation

---

## Dependencies

### Production Dependencies

```json
{
  "dependencies": {
    "woby": "^1.58.40",
    "@woby/use": "workspace:^",
    "dompurify": "^3.0.0"
  }
}
```

### Dev Dependencies

```json
{
  "devDependencies": {
    "@types/dompurify": "^3.0.0",
    "typescript": "^6.0.3",
    "vitest": "^4.1.7"
  }
}
```

---

## Open Questions & Research Gaps

### LOW Confidence Areas (Need Deeper Research)

1. **iOS Safari beforeinput support** - Conflicting reports on full support
2. **Mobile selection handles** - Touch event patterns need device testing
3. **Virtual scrolling with contenteditable** - Complex implementation, limited examples
4. **IME composition handling** - Complex for CJK languages, needs specialized research

### MEDIUM Confidence Areas (Verify with Implementation)

1. **Clipboard API format preservation** - Works in theory, needs cross-browser testing
2. **Shadow DOM selection across browsers** - API exists, needs real-world testing
3. **Performance at 1000+ paragraphs** - Strategies identified, needs benchmarking

### Recommended Phase-Specific Research

| Phase | Research Topic | Why |
|-------|---------------|-----|
| Phase 2 | IME composition handling | Critical for CJK users |
| Phase 3 | Mobile touch patterns | Essential for tablet/phone support |
| Phase 4 | Virtual scrolling | Only if performance issues persist |

---

## Sources

### HIGH Confidence Sources

- [MDN Selection API](https://developer.mozilla.org/en-US/docs/Web/API/Selection)
- [MDN Range API](https://developer.mozilla.org/en-US/docs/Web/API/Range)
- [MDN MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
- [MDN MutationRecord](https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord)
- [MDN ClipboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent)
- [MDN InputEvent](https://developer.mozilla.org/en-US/docs/Web/API/InputEvent)
- [Woby GitHub Repository](https://github.com/wobyjs/woby)
- Existing codebase (Editor.tsx, undoredo.tsx, utils.tsx)

### MEDIUM Confidence Sources

- Web search: Clipboard API format preservation
- Web search: Mobile touch selection patterns
- Web search: Keyboard shortcuts handling
- Web search: ARIA patterns for rich text editors
- Web search: Performance optimization patterns
- Web search: execCommand alternatives

### LOW Confidence Areas (Flag for Validation)

- iOS Safari beforeinput support (needs device testing)
- Virtual scrolling implementation patterns (needs deeper research)
- IME composition handling (needs specialized research)

---

## Next Steps

1. **Implement execCommand-free formatting** using applyStyle pattern
2. **Add DOMPurify** for paste sanitization
3. **Test on iOS devices** for touch/IME issues
4. **Benchmark performance** with 1000+ paragraph documents
5. **Conduct accessibility audit** with screen readers

---

**Research Complete**
**Overall Confidence:** HIGH for core APIs, MEDIUM for mobile patterns, LOW for advanced optimizations
**Date:** 2026-05-25

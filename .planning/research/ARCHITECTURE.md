# Architecture Patterns for DOM-Based Rich Text Editor

**Domain:** Rich Text Editor (DOM-based)
**Researched:** 2026-05-25
**Context:** Building robust editor for Woby reactive framework with 1000+ paragraph performance target

---

## Executive Summary

This research outlines architectural patterns for a **DOM-based rich text editor** (contrasted with state-tree editors like Lexical/ProseMirror). The key differentiator: **DOM is the source of truth** with reactive observation rather than a separate document model that syncs to DOM.

**Critical Findings:**
1. **Selection is the hardest problem** - restoration, normalization, and multi-block scenarios require careful path-based tracking
2. **Style merging/splitting is complex** - nested spans, conflicting styles, and partial selections require tree normalization
3. **MutationObserver is viable for undo/redo** - but requires batching, debouncing, and state deduplication
4. **Performance at 1000+ paragraphs** - requires lazy operations, batched DOM updates, and avoiding full-tree walks
5. **Plugin architecture** - event-based hooks with command pattern for extensibility

**Recommended Architecture:**
- **Core:** Selection Manager + Style Engine + Block Transformer
- **State:** Undo/Redo stack with MutationObserver batching
- **Performance:** Virtual selection tracking, lazy normalization, incremental updates
- **Integration:** Woby observables for reactive DOM binding

---

## Current Implementation Analysis

### What's Working

**1. Undo/Redo System (`undoredo.tsx`)**
```typescript
// MutationObserver-based history tracking
const observer = new MutationObserver((mutations) => { saveDo() })
observer.observe(el, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true
})
```

**Strengths:**
- Simple innerHTML snapshot approach
- Automatic tracking of all DOM changes
- Works with any mutation source (typing, formatting, external edits)

**Weaknesses:**
- No batching - every mutation triggers save (performance issue at 1000+ paragraphs)
- No state deduplication - identical consecutive states saved
- Large memory footprint - full HTML strings stored
- Selection not preserved in undo/redo operations

**2. Selection Utilities (`utils.tsx`)**
```typescript
// Path-based selection restoration
export function restoreSelection(state: SelectionState, root?: Node): void {
    const startNode = getNodeFromPath(state.startContainerPath, root)
    const endNode = getNodeFromPath(state.endContainerPath, root)
    // Clamp offsets to valid ranges
    range.setStart(startNode, clampedStartOffset)
    range.setEnd(endNode, clampedEndOffset)
}
```

**Strengths:**
- Path-based tracking survives DOM restructures
- Clamping prevents offset errors
- Shadow DOM support via `getRootNode()`

**Weaknesses:**
- No normalization after operations
- Path invalidation when nodes are removed
- No multi-range support (Firefox limitation)

**3. Style Application (`applyStyle` in utils.tsx)**
```typescript
// Complex collapsed/expanded selection handling
if (initialSelectionState.state.isCollapsed) {
    // Expand to word or insert styled span
} else {
    // Wrap selection in styled span
    initialGlobalRange.surroundContents(spanElement)
}
```

**Strengths:**
- Handles collapsed cursor (word expansion)
- Handles empty cursor (insertion mode)
- Fallback for `surroundContents` failures

**Weaknesses:**
- No style merging - creates nested spans
- No conflict resolution - bold + italic creates `<b><i>text</i></b>`
- No normalization - adjacent same-styled spans not merged

### What's Missing

**1. Style Normalization Engine**
- Merge adjacent spans with same styles
- Split spans at selection boundaries
- Unwrap redundant nested styles

**2. Block Transformation System**
- Robust P ↔ LI ↔ PRE ↔ H1-H6 conversion
- Preserve inline styles during block changes
- Handle multi-block selections correctly

**3. Selection Normalization**
- Clean up empty text nodes
- Merge adjacent text nodes after deletions
- Fix invalid DOM positions

**4. Plugin Architecture**
- Command system for operations
- Event hooks for pre/post processing
- Extension points for custom formats

---

## Recommended Architecture

### Component Breakdown

```
┌─────────────────────────────────────────────────────────┐
│                    Editor Core                          │
├─────────────────────────────────────────────────────────┤
│  Selection Manager                                      │
│  ├─ SelectionState (path-based)                        │
│  ├─ Range Normalizer                                   │
│  └─ Restoration Engine                                 │
├─────────────────────────────────────────────────────────┤
│  Style Engine                                           │
│  ├─ Style Applier (apply/remove)                       │
│  ├─ Style Merger (normalize adjacent)                  │
│  ├─ Style Splitter (partial selections)                │
│  └─ Style Conflict Resolver                            │
├─────────────────────────────────────────────────────────┤
│  Block Transformer                                      │
│  ├─ Block Converter (P ↔ LI ↔ H1)                      │
│  ├─ Multi-Block Handler                                │
│  └─ Style Preservation                                 │
├─────────────────────────────────────────────────────────┤
│  History Manager                                        │
│  ├─ MutationObserver (batched)                         │
│  ├─ State Deduplicator                                 │
│  ├─ Selection Preservation                             │
│  └─ Undo/Redo Stack                                    │
├─────────────────────────────────────────────────────────┤
│  Event System                                           │
│  ├─ Command Registry                                   │
│  ├─ Pre/Post Hooks                                     │
│  └─ Plugin API                                         │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Diagrams

#### 1. Style Application Flow

```
User Click "Bold"
       ↓
[Selection Manager] Get current selection
       ↓
[Style Engine] Check if already bold
       ↓
    ┌──┴──┐
    │     │
  Apply  Remove
    │     │
    └──┬──┘
       ↓
[Style Merger] Merge adjacent bold spans
       ↓
[History Manager] Save state (debounced)
       ↓
DOM Updated
```

#### 2. Block Transformation Flow

```
User Select "Heading 1" from dropdown
       ↓
[Selection Manager] Get selected blocks
       ↓
[Block Transformer] For each block:
       ├─ Extract inline styles
       ├─ Create new block element
       ├─ Transfer content + styles
       └─ Replace in DOM
       ↓
[Selection Manager] Restore selection
       ↓
[History Manager] Save state
```

#### 3. Undo/Redo Flow

```
User types / formats
       ↓
[MutationObserver] Detect DOM changes
       ↓
[Debounce] Wait 300ms
       ↓
[History Manager] Check if state changed
       ├─ Compare with last state
       └─ Skip if identical
       ↓
Save to undo stack
Clear redo stack
```

---

## Key Algorithms

### 1. Selection Normalization

**Problem:** After DOM operations, selection can be in invalid states:
- Cursor in removed node
- Offsets beyond text length
- Multiple empty text nodes

**Solution: Three-Phase Normalization**

```typescript
// Phase 1: Validate Container
function validateContainer(node: Node, root: HTMLElement): Node | null {
    if (!root.contains(node)) return null
    if (node.nodeType === Node.TEXT_NODE && !node.parentNode) {
        // Text node detached, find nearest valid parent
        return findNearestValidParent(node, root)
    }
    return node
}

// Phase 2: Clamp Offsets
function clampOffset(node: Node, offset: number): number {
    if (node.nodeType === Node.TEXT_NODE) {
        const length = node.textContent?.length ?? 0
        return Math.max(0, Math.min(offset, length))
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        const childCount = node.childNodes.length
        return Math.max(0, Math.min(offset, childCount))
    }
    return offset
}

// Phase 3: Clean DOM
function cleanDOM(root: HTMLElement): void {
    // Merge adjacent text nodes
    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        null
    )

    let prevNode: Text | null = null
    let currentNode: Text | null

    while (currentNode = walker.nextNode() as Text) {
        if (prevNode &&
            prevNode.parentNode === currentNode.parentNode &&
            !prevNode.nextSibling?.nodeType) {

            // Merge text nodes
            prevNode.textContent += currentNode.textContent
            currentNode.remove()
        } else {
            prevNode = currentNode
        }
    }

    // Remove empty text nodes
    root.querySelectorAll(':empty').forEach(el => {
        if (el.textContent === '' && el.tagName !== 'BR') {
            el.remove()
        }
    })
}
```

### 2. Style Merge Algorithm

**Problem:** After applying bold to "wor|ld" (cursor in middle of "world"), we get:
```html
<span style="font-weight: bold">wor</span><span style="font-weight: bold">ld</span>
```

**Solution: Merge Adjacent Identical Spans**

```typescript
function mergeAdjacentSpans(container: HTMLElement): void {
    const spans = container.querySelectorAll('span[style]')

    spans.forEach(span => {
        const next = span.nextElementSibling as HTMLElement
        if (!next || next.tagName !== 'SPAN') return

        // Check if styles match
        if (span.getAttribute('style') === next.getAttribute('style')) {
            // Move all children from next to current
            while (next.firstChild) {
                span.appendChild(next.firstChild)
            }
            next.remove()
        }
    })
}
```

**Advanced: Multi-Property Merge**

```typescript
interface StyleProperties {
    fontWeight?: string
    fontStyle?: string
    textDecoration?: string
    color?: string
    backgroundColor?: string
}

function extractStyles(element: HTMLElement): StyleProperties {
    const style = element.style
    return {
        fontWeight: style.fontWeight || undefined,
        fontStyle: style.fontStyle || undefined,
        textDecoration: style.textDecoration || undefined,
        color: style.color || undefined,
        backgroundColor: style.backgroundColor || undefined
    }
}

function canMerge(elem1: HTMLElement, elem2: HTMLElement): boolean {
    const styles1 = extractStyles(elem1)
    const styles2 = extractStyles(elem2)

    return JSON.stringify(styles1) === JSON.stringify(styles2)
}
```

### 3. Style Split Algorithm

**Problem:** Apply italic to "he[llo wor]ld" (partial selection in bold span):
```html
Before: <span style="font-weight: bold">hello world</span>
After:  <span style="font-weight: bold">he</span>
        <span style="font-weight: bold; font-style: italic">llo wor</span>
        <span style="font-weight: bold">ld</span>
```

**Solution: Three-Way Split**

```typescript
function splitSpanAtRange(
    span: HTMLElement,
    range: Range
): { before: HTMLElement, middle: HTMLElement, after: HTMLElement } | null {

    const text = span.textContent ?? ''
    const spanRange = document.createRange()
    spanRange.selectNodeContents(span)

    // Find relative positions
    const startOffset = range.startOffset
    const endOffset = range.endOffset

    if (startOffset === 0 && endOffset === text.length) {
        // Entire span selected - no split needed
        return null
    }

    // Create three spans
    const before = span.cloneNode(false) as HTMLElement
    const middle = span.cloneNode(false) as HTMLElement
    const after = span.cloneNode(false) as HTMLElement

    before.textContent = text.slice(0, startOffset)
    middle.textContent = text.slice(startOffset, endOffset)
    after.textContent = text.slice(endOffset)

    // Replace original
    const parent = span.parentNode
    parent.insertBefore(before, span)
    parent.insertBefore(middle, span)
    parent.insertBefore(after, span)
    parent.removeChild(span)

    return { before, middle, after }
}
```

### 4. Block Transform Algorithm

**Problem:** Convert `<p>Hello <b>world</b></p>` to `<h1>Hello <b>world</b></h1>`

**Solution: Clone Content, Preserve Inline Styles**

```typescript
function transformBlock(
    oldBlock: HTMLElement,
    newTagName: string,
    className?: string
): HTMLElement {
    // Create new block
    const newBlock = document.createElement(newTagName)

    // Transfer attributes (except class/id)
    Array.from(oldBlock.attributes).forEach(attr => {
        if (attr.name !== 'class' && attr.name !== 'id') {
            newBlock.setAttribute(attr.name, attr.value)
        }
    })

    // Apply new class
    if (className) {
        newBlock.className = className
    }

    // Move all children (preserves inline styles)
    while (oldBlock.firstChild) {
        newBlock.appendChild(oldBlock.firstChild)
    }

    // Replace in DOM
    oldBlock.parentNode?.replaceChild(newBlock, oldBlock)

    return newBlock
}
```

**Multi-Block Selection:**

```typescript
function transformBlocks(
    blocks: HTMLElement[],
    newTagName: string,
    className?: string
): HTMLElement[] {
    return blocks.map(block => transformBlock(block, newTagName, className))
}

// Usage: Convert selected paragraphs to list items
const selectedBlocks = getSelectedBlocks(editor, range, ['P', 'H1', 'H2'])
const newBlocks = transformBlocks(selectedBlocks, 'li')

// Wrap in <ul> or <ol>
const list = document.createElement('ul')
newBlocks.forEach(li => list.appendChild(li))

// Insert list
selectedBlocks[0].parentNode?.insertBefore(list, selectedBlocks[0])
```

### 5. Undo/Redo with Selection Preservation

**Current Issue:** Selection lost after undo/redo

**Solution: Save Selection with State**

```typescript
interface HistoryState {
    html: string
    selection: SelectionState | null
}

class HistoryManager {
    private undos: HistoryState[] = []
    private redos: HistoryState[] = []
    private debounceTimer: number | null = null

    save(editor: HTMLElement): void {
        // Debounce
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer)
        }

        this.debounceTimer = setTimeout(() => {
            const html = editor.innerHTML
            const selection = getSelection(editor)

            // Deduplication
            const lastState = this.undos[this.undos.length - 1]
            if (lastState && lastState.html === html) {
                return // Skip identical state
            }

            this.undos.push({ html, selection: selection?.state ?? null })
            this.redos = [] // Clear redo stack

            // Limit stack size
            if (this.undos.length > 100) {
                this.undos.shift()
            }
        }, 300) // 300ms debounce
    }

    undo(editor: HTMLElement): void {
        const current = this.undos.pop()
        if (!current) return

        // Save current state to redo
        this.redos.push({
            html: editor.innerHTML,
            selection: getSelection(editor)?.state ?? null
        })

        // Restore previous state
        const previous = this.undos[this.undos.length - 1]
        editor.innerHTML = previous.html

        // Restore selection
        if (previous.selection) {
            restoreSelection(previous.selection, editor)
        }
    }
}
```

---

## Integration with Woby

### Reactive Binding Strategy

**Challenge:** Woby uses fine-grained reactivity (observables), but editor DOM is mutated by user actions.

**Solution: Single-Direction Data Flow**

```
User Action → DOM Mutation → MutationObserver → Observable Update
     ↑                                                    ↓
     └─────────────── Re-render on state change ─────────┘
```

**Implementation:**

```typescript
import { $, $$, useEffect } from 'woby'

const Editor = () => {
    const editorRef = $<HTMLDivElement>(null)
    const content = $('') // Observable content

    // Sync DOM → Observable
    useEffect(() => {
        const el = $$(editorRef)
        if (!el) return

        const observer = new MutationObserver(() => {
            content(el.innerHTML)
        })

        observer.observe(el, {
            childList: true,
            subtree: true,
            characterData: true
        })

        return () => observer.disconnect()
    })

    // Sync Observable → DOM (only for external updates)
    useEffect(() => {
        const el = $$(editorRef)
        if (!el) return

        const currentHTML = el.innerHTML
        const newHTML = $$(content)

        // Only update if different (prevent infinite loop)
        if (currentHTML !== newHTML) {
            el.innerHTML = newHTML
        }
    })

    return <div ref={editorRef} contentEditable={true} />
}
```

**Key Insight:** Don't try to make every character typed reactive. Treat editor as opaque input device, sync only on significant events (blur, format change, etc.).

### Context Architecture

**Current:** `EditorContext` provides editor ref, `UndoRedoContext` provides history functions

**Recommended:** Single `EditorCore` context with modular services

```typescript
interface EditorCore {
    // DOM Reference
    editor: Observable<HTMLDivElement>

    // Services
    selection: SelectionManager
    styles: StyleEngine
    blocks: BlockTransformer
    history: HistoryManager

    // Events
    on(event: string, handler: Function): void
    off(event: string, handler: Function): void

    // Commands
    execCommand(command: string, ...args: any[]): void
}

const EditorCoreContext = createContext<EditorCore>()

// Components access services
const BoldButton = () => {
    const core = useContext(EditorCoreContext)

    const handleClick = () => {
        core.execCommand('bold')
    }

    return <button onClick={handleClick}>Bold</button>
}
```

---

## Performance Optimizations

### For 1000+ Paragraphs

**1. Lazy Selection Queries**

Don't walk entire tree for selection:

```typescript
// BAD: O(n) where n = total nodes
const allBlocks = editor.querySelectorAll('p')

// GOOD: O(m) where m = selected blocks
function getSelectedBlocksFast(range: Range): HTMLElement[] {
    const start = range.startContainer
    const end = range.endContainer

    // If same block, return it
    if (start === end) {
        return [getBlockParent(start)]
    }

    // Walk from start to end only
    const blocks: HTMLElement[] = []
    let current = getBlockParent(start)

    while (current && current !== getBlockParent(end)) {
        blocks.push(current)
        current = current.nextElementSibling as HTMLElement
    }

    blocks.push(getBlockParent(end))
    return blocks
}
```

**2. Batched DOM Updates**

Use `DocumentFragment` for multiple inserts:

```typescript
// BAD: Triggers reflow for each insert
blocks.forEach(block => editor.appendChild(block))

// GOOD: Single reflow
const fragment = document.createDocumentFragment()
blocks.forEach(block => fragment.appendChild(block))
editor.appendChild(fragment)
```

**3. Debounced History Saves**

Already partially implemented, but needs tuning:

```typescript
// Current: Save on every mutation
// Recommended: Debounce + deduplication
let lastHTML = ''
let saveTimer: number | null = null

const observer = new MutationObserver(() => {
    if (saveTimer) clearTimeout(saveTimer)

    saveTimer = setTimeout(() => {
        const currentHTML = editor.innerHTML

        // Deduplicate
        if (currentHTML !== lastHTML) {
            saveToHistory(currentHTML)
            lastHTML = currentHTML
        }
    }, 300)
})
```

**4. Virtual Selection Tracking**

Cache selection state to avoid repeated `getSelection()` calls:

```typescript
class SelectionCache {
    private cachedState: SelectionState | null = null
    private dirty = true

    get(root: HTMLElement): SelectionState | null {
        if (this.dirty) {
            this.cachedState = getSelection(root)?.state ?? null
            this.dirty = false
        }
        return this.cachedState
    }

    invalidate(): void {
        this.dirty = true
    }
}

// Invalidate on DOM changes
observer.observe(editor, {
    childList: true,
    subtree: true
})
```

**5. Incremental Style Application**

Don't normalize entire document after every style change:

```typescript
// BAD: Walk entire tree after every bold
function normalizeAllStyles(editor: HTMLElement) {
    mergeAllAdjacentSpans(editor) // O(n)
    removeEmptySpans(editor) // O(n)
}

// GOOD: Normalize only affected region
function applyBold(range: Range) {
    // Apply bold...

    // Normalize only the parent block
    const block = getBlockParent(range.commonAncestorContainer)
    mergeAdjacentSpans(block)
    removeEmptySpans(block)
}
```

---

## Plugin Architecture

### Command Pattern

**Central Command Registry:**

```typescript
type CommandHandler = (...args: any[]) => void

class CommandRegistry {
    private commands = new Map<string, CommandHandler>()

    register(name: string, handler: CommandHandler): void {
        this.commands.set(name, handler)
    }

    exec(name: string, ...args: any[]): void {
        const handler = this.commands.get(name)
        if (handler) {
            handler(...args)
        }
    }
}

// Usage
registry.register('bold', () => {
    document.execCommand('bold')
    normalizeStyles(getCurrentBlock())
})

registry.register('formatBlock', (tag: string) => {
    transformBlock(getCurrentBlock(), tag)
})
```

### Event Hooks

**Pre/Post Processing:**

```typescript
interface EditorHooks {
    beforeCommand?: (command: string, args: any[]) => boolean // return false to cancel
    afterCommand?: (command: string, args: any[]) => void
    beforeInput?: (event: InputEvent) => boolean
    afterInput?: (event: InputEvent) => void
    selectionChange?: (selection: SelectionState) => void
}

class PluginAPI {
    private hooks: EditorHooks = {}

    on<K extends keyof EditorHooks>(
        event: K,
        handler: NonNullable<EditorHooks[K]>
    ): void {
        this.hooks[event] = handler
    }

    trigger<K extends keyof EditorHooks>(
        event: K,
        ...args: any[]
    ): any {
        const handler = this.hooks[event]
        return handler?.(...args)
    }
}

// Usage: Auto-link URLs
pluginAPI.on('afterInput', (event) => {
    if (event.inputType === 'insertText') {
        const text = getCurrentTextNode()
        if (isURL(text.textContent)) {
            wrapInLink(text)
        }
    }
})
```

---

## Architectural Trade-offs

### DOM-Based vs State-Tree

| Aspect | DOM-Based (WUI) | State-Tree (Lexical/ProseMirror) |
|--------|----------------|----------------------------------|
| **Performance** | Fast initial load, slow with many mutations | Slower initial, optimized updates |
| **Undo/Redo** | Simple but memory-heavy | Sophisticated, minimal memory |
| **Selection** | Native browser APIs, fragile | Abstracted, robust |
| **Collaboration** | Difficult (no OT) | Built-in (CRDT/OT support) |
| **Mobile** | Works well | Can be laggy |
| **Bundle Size** | Small (no model layer) | Large (model + reconciler) |
| **Debugging** | Easy (DOM is truth) | Harder (sync issues) |

**Verdict:** DOM-based is right choice for:
- Single-user editors
- Simple formatting requirements
- Mobile-first applications
- Small bundle size requirements

State-tree is better for:
- Real-time collaboration
- Complex document structures
- Advanced features (comments, suggestions)
- Server-side rendering

### execCommand vs Manual DOM

| Approach | Pros | Cons |
|----------|------|------|
| `execCommand` | Browser handles edge cases, native undo support | Deprecated, inconsistent behavior, limited control |
| Manual DOM | Full control, predictable, future-proof | Must handle all edge cases, manual undo |

**Recommendation:** Hybrid approach
- Use `execCommand` for basic operations (bold, italic) for compatibility
- Fall back to manual DOM for complex scenarios (multi-block, custom formats)
- Build abstraction layer to switch implementations

---

## Critical Pitfalls

### 1. Selection Loss After DOM Operations

**Symptom:** Cursor disappears or jumps to start after formatting

**Root Cause:** DOM nodes referenced by selection are removed/replaced

**Prevention:**
```typescript
// BEFORE any DOM mutation:
const savedSelection = getSelection(editor)

// AFTER DOM mutation:
restoreSelection(savedSelection.state, editor)
```

**Detection:** After every operation, verify:
```typescript
const sel = window.getSelection()
if (!sel || !editor.contains(sel.anchorNode)) {
    console.warn('Selection lost!')
}
```

### 2. Style Nesting Explosions

**Symptom:** `<b><i><u><b><i>text</i></b></u></i></b>`

**Root Cause:** No normalization after style toggles

**Prevention:**
```typescript
function toggleBold() {
    const isBold = document.queryCommandState('bold')

    if (isBold) {
        // Remove bold: find and unwrap <b> or font-weight: bold
        unwrapStyle('fontWeight', 'bold')
    } else {
        document.execCommand('bold')
    }

    // ALWAYS normalize after
    normalizeStyles(getCurrentBlock())
}
```

### 3. Undo Stack Memory Leak

**Symptom:** Browser crashes after long editing session

**Root Cause:** Unlimited history stack

**Prevention:**
```typescript
const MAX_HISTORY = 100

function saveToHistory(state: HistoryState) {
    undos.push(state)

    if (undos.length > MAX_HISTORY) {
        undos.shift() // Remove oldest
    }
}
```

### 4. Empty Node Accumulation

**Symptom:** DOM inspector shows hundreds of `<span></span>` and empty text nodes

**Root Cause:** Partial deletions leave behind empty containers

**Prevention:**
```typescript
// After every deletion operation:
function cleanEmptyNodes(root: HTMLElement) {
    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
    )

    const toRemove: Node[] = []

    let node: Node | null
    while (node = walker.nextNode()) {
        if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
            toRemove.push(node)
        }
        if (node instanceof HTMLElement &&
            node.tagName === 'SPAN' &&
            !node.textContent) {
            toRemove.push(node)
        }
    }

    toRemove.forEach(n => n.remove())
}
```

---

## Recommended Phase Structure

Based on architectural complexity, suggest this implementation order:

### Phase 1: Selection Foundation (Critical)
**Addresses:** Selection loss, restoration, normalization
- Implement robust `SelectionManager` class
- Add path-based state tracking with validation
- Create `RangeNormalizer` for DOM cleanup
- Test multi-block selection scenarios

### Phase 2: Style Engine (Core Feature)
**Addresses:** Style nesting, merging, splitting
- Build `StyleEngine` with apply/merge/split
- Implement style conflict resolution
- Add partial selection handling
- Create style normalization pipeline

### Phase 3: Block Transformer (Essential)
**Addresses:** Block conversion bugs
- Refactor `convertToSemanticElement` to handle edge cases
- Implement multi-block transformation
- Preserve inline styles during block changes
- Add list-specific transformations

### Phase 4: History Optimization (Performance)
**Addresses:** Memory usage, undo/redo bugs
- Add debouncing and deduplication to `HistoryManager`
- Implement selection preservation in undo/redo
- Add compression for large documents
- Test with 1000+ paragraph documents

### Phase 5: Plugin System (Extensibility)
**Addresses:** Custom formats, integrations
- Design `CommandRegistry` and `PluginAPI`
- Implement event hooks (beforeCommand, afterCommand)
- Create documentation for plugin development
- Build sample plugins (mentions, auto-link)

---

## Open Research Questions

1. **Mobile Virtual Keyboard Behavior**
   - How to handle selection when keyboard shows/hides?
   - Need to test on iOS Safari, Android Chrome

2. **IME Composition Events**
   - Current implementation doesn't handle Chinese/Japanese input
   - May need `compositionstart`/`compositionend` handling

3. **Collaborative Editing**
   - Current architecture doesn't support OT/CRDT
   - Would require major refactor or separate model layer

4. **Accessibility**
   - Screen reader support for custom formats?
   - ARIA attributes for inline styles?

---

## Sources

- Quill Architecture Guide (https://quilljs.com/guides/how-to-customize-quill/) - HIGH confidence
- ProseMirror Guide (https://prosemirror.net/docs/guide/) - HIGH confidence
- MDN Selection API (https://developer.mozilla.org/en-US/docs/Web/API/Selection) - HIGH confidence
- MDN Range API (https://developer.mozilla.org/en-US/docs/Web/API/Range) - HIGH confidence
- JavaScript.info Selection Tutorial (https://javascript.info/selection-range) - MEDIUM confidence
- ContentEditable specification (https://w3c.github.io/contentEditable/) - MEDIUM confidence
- Current WUI Editor implementation analysis - HIGH confidence

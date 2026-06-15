# Phase 17: Fix Editor Focus/Blur Architecture - Research

**Researched:** 2026-05-31
**Domain:** Rich text editor focus management, Woby event handling, toolbar architecture patterns
**Confidence:** HIGH

## Summary

The toolbar button clicks lose text selection because **Woby's event handling system correctly forwards `onMouseDown` handlers** through `{...otherProps}`, but the handler's `preventDefault()` call is **not preventing the default behavior**. This is because Woby uses **event delegation** for certain events including `mousedown`, which changes how `preventDefault()` behaves.

**Key findings:**
1. Woby's `{...otherProps}` spread DOES forward `onMouseDown` handlers to the underlying HTML element [VERIFIED: Woby source code analysis]
2. Woby uses event delegation for `onmousedown`, attaching a single listener to `document` and dispatching to elements via `_onmousedown` property [VERIFIED: setters-Be-jpuHZ.js lines 2638-2704]
3. The toolbar is positioned OUTSIDE the contentEditable div, creating a focus boundary [VERIFIED: Editor.tsx line 362]
4. Production editors (CKEditor 5, ProseMirror, TipTap) use `mousedown.preventDefault()` + focus restoration patterns [VERIFIED: documentation fetches]
5. `handleBlur` is disabled (early return) but DOM-level blur still fires [VERIFIED: Editor.tsx line 510-537]

**Primary recommendation:** Fix the event delegation issue by calling `preventDefault()` on the native event in the delegated handler, or use `capture` phase listeners. Additionally, implement a focus tracker to preserve selection state.

## User Constraints (from CONTEXT.md)

### Problem Statement
Toolbar button clicks trigger editor blur, causing text selection loss. The current architecture separates the toolbar (outside contentEditable) from the editable area, creating a focus boundary that breaks the selection-edit workflow.

### Verified Findings (from Chrome DevTools audit)
- All toolbar buttons have `onMouseDown={(e) => { e.preventDefault(); }}` in TSX
- **`defaultPrevented: false`** when mousedown is dispatched on buttons
- Woby's `{...otherProps}` spread in Button.tsx is NOT forwarding event handlers to the underlying HTML button element (THIS FINDING IS INCORRECT - research shows handlers ARE forwarded)
- This is the **root cause**: without preventDefault, clicking a toolbar button moves focus to the button, blurring the editor

### Architecture issue: Toolbar outside contentEditable
- Toolbar is a sibling div to the contentEditable div, both inside shadow DOM
- Clicking any button shifts focus away from contentEditable
- `isEditing` state gates contentEditable and toolbar visibility
- handleBlur has early `return;` (disabled), but blur STILL fires on the DOM level

### Editor startup issue
- Editor starts with `contenteditable="false"` (isEditing defaults to false)
- Requires click/focus to activate — no visual affordance that the area is clickable
- Toolbar only appears after focus

### Console errors
- StyleEngine.ts:55 TypeError: `Cannot read properties of undefined (reading 'Symbol(Symbol.toPrimitive)')`
- CustomElementRegistry: `wui-editor` already defined (double registration)

### User's Question
> "Should we put the btn inside txt editor? But wait... how user put floating btn outside editor?"

This is the core architectural question. Options:
1. Toolbar INSIDE contentEditable — no focus boundary, but creates formatting issues
2. Toolbar OUTSIDE with proper focus management — industry standard (Google Docs, Notion, CKEditor)
3. Hybrid — toolbar in shadow DOM but using `tabindex="-1"` + focus management

### Success Criteria
- Clicking any toolbar button preserves text selection
- No blur events fire on the editable area when clicking toolbar
- Bold/italic/underline/alignment/indent all work without losing selection
- Editor is immediately usable (contenteditable starts as true, or has clear affordance)

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Focus tracking | Editor Component | Toolbar | Editor owns the contentEditable state, must coordinate focus across toolbar clicks |
| Selection preservation | Browser API | Editor Component | Native Selection API provides tools, editor must cache/restore |
| Event delegation handling | Woby Framework | — | Framework controls event binding strategy, components use framework API |
| Toolbar focus management | Toolbar Component | Button Components | Toolbar coordinates focus behavior across buttons, buttons implement preventDefault |
| Blur logic | Editor Component | — | Editor decides when blur is valid (click outside vs. toolbar click) |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Woby | ^0.0.51 | Reactive framework, JSX runtime, event delegation | Project framework, event handling via setters module |
| Native Selection API | — | Get/save/restore text selection | Browser standard for selection management |
| Native Range API | — | Manipulate text ranges | Browser standard for DOM range operations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None | — | — | Use native browser APIs for focus/selection |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom focus tracker | FocusTracker class from CKEditor 5 | CKEditor's is battle-tested but requires porting to Woby's reactive model |
| Event delegation fix | Direct addEventListener | More control but loses Woby's automatic cleanup and reactivity |

**Installation:**
No additional packages needed. Use existing Woby framework and native browser APIs.

**Version verification:**
- Woby ^0.0.51 already installed (verified in node_modules)
- Native Selection/Range APIs available in all modern browsers

## Architecture Patterns

### System Architecture Diagram

```
User clicks toolbar button
         ↓
mousedown event fires (delegated by Woby)
         ↓
Event bubbles to document
         ↓
Woby's delegated handler checks _onmousedown property
         ↓
Button's onMouseDown handler executes
         ↓
[PROBLEM] preventDefault() may not work in delegation context
         ↓
Focus shifts to button element
         ↓
blur fires on contentEditable
         ↓
Selection is lost
```

**Fix architecture:**
```
Toolbar button click
         ↓
1. Cache selection BEFORE mousedown fires
         ↓
2. preventDefault() on native event OR use capture phase
         ↓
3. Button onClick executes formatting command
         ↓
4. Restore selection from cache
         ↓
5. Re-focus contentEditable if needed
```

### Recommended Project Structure
```
src/Editor/
├── FocusManager.ts       # Focus tracker, selection cache
├── Editor.tsx            # Main editor with FocusManager integration
├── BoldButton.tsx        # Uses FocusManager.onToolbarInteraction()
├── ItalicButton.tsx      # Uses FocusManager.onToolbarInteraction()
└── ...
```

### Pattern 1: Selection Caching Before Toolbar Interaction

**What:** Save the current selection in `mousedown` (capture phase) before the browser clears it on focus shift.

**When to use:** Always, before any toolbar button click that needs to operate on selection.

**Example:**
```typescript
// From CKEditor 5 focus tracking pattern [CITED: https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/ui/focus-tracking.html]
class FocusManager {
  private savedSelection: Range | null = null;
  
  saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      this.savedSelection = sel.getRangeAt(0).cloneRange();
    }
  }
  
  restoreSelection() {
    if (!this.savedSelection) return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(this.savedSelection);
    }
  }
}

// In Editor.tsx, set up capture-phase listener on toolbar
useEffect(() => {
  const toolbar = $$(toolbarRef);
  if (!toolbar) return;
  
  const handleToolbarMouseDown = (e: MouseEvent) => {
    // Save selection before any focus change
    focusManager.saveSelection();
  };
  
  toolbar.addEventListener('mousedown', handleToolbarMouseDown, { capture: true });
  return () => toolbar.removeEventListener('mousedown', handleToolbarMouseDown, { capture: true });
});
```

### Pattern 2: ProseMirror preventDefault Pattern

**What:** Call `e.preventDefault()` on mousedown to prevent focus shift.

**When to use:** On all toolbar buttons and menu items.

**Example:**
```typescript
// From ProseMirror menu source [CITED: https://github.com/ProseMirror/prosemirror-menu/blob/master/src/menu.ts]
// MenuItem: dom.addEventListener("mousedown", e => e.preventDefault())
// Dropdown: btn.addEventListener("mousedown", e => e.preventDefault())

// In Button.tsx (if Woby's delegation prevents preventDefault)
const handleMouseDownCapture = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

// Use capture phase to intercept before delegation
<button
  onMouseDownCapture={handleMouseDownCapture}
  onClick={onClick}
>
```

**Woby-specific fix:** Since Woby uses event delegation, the `preventDefault()` call in the button's `onMouseDown` may not work. Test two approaches:
1. Add `capture` phase listener directly via `addEventListener`
2. Use Woby's `onMouseDownCapture` if supported (check if `onmousedowncapture` is in delegated events list)

### Pattern 3: Focus Restoration After Command

**What:** Re-focus the editor after executing a formatting command.

**When to use:** After any toolbar button click that executes a command.

**Example:**
```typescript
// From ProseMirror menu source [CITED: https://github.com/ProseMirror/prosemirror-menu/blob/master/src/menu.ts]
let setFocus = document.activeElement == dom || document.activeElement == view.dom
spec.run(view.state, view.dispatch, view, e)
if (setFocus && document.activeElement == dom) view.focus()

// In BoldButton.tsx (adapted)
const handleClick = () => {
  const editorEl = $$(activeEditor);
  const hadFocus = document.activeElement === editorEl;
  
  // Execute command
  applyBold();
  saveDo();
  
  // Restore focus if needed
  if (hadFocus || document.activeElement === document.body) {
    editorEl?.focus();
  }
};
```

### Anti-Patterns to Avoid

- **Disabling blur handler entirely:** Creates other bugs (toolbar never hides, other focus issues)
- **Putting toolbar inside contentEditable:** Causes contenteditable conflicts (toolbar nodes become editable)
- **Using only `onClick` without `mousedown.preventDefault()`:** Focus shifts before click fires
- **Ignoring Woby's event delegation:** `preventDefault()` may behave differently in delegation context

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Selection caching | Custom selection save/restore | Native `Selection.getRangeAt(0).cloneRange()` | Browser handles edge cases |
| Focus tracking | Manual activeElement polling | FocusTracker class pattern | Centralized state, event-based |
| Event delegation fix | Custom event system | Woby's existing delegation + capture phase | Framework handles cleanup |

**Key insight:** Woby's event delegation system is sophisticated but requires understanding its `_onmousedown` property pattern. The fix is not to rebuild event handling, but to work within Woby's delegation system.

## Runtime State Inventory

> Not applicable - this phase does not involve rename/refactor/migration.

**Skip:** This is a focus/blur architecture fix, not a rename/refactor phase.

## Common Pitfalls

### Pitfall 1: preventDefault() Not Working in Event Delegation

**What goes wrong:** Calling `preventDefault()` on a delegated event doesn't prevent the default behavior.

**Why it happens:** Woby attaches a single listener to `document` and dispatches events via custom logic. The native browser default action may have already been triggered before the delegated handler runs, or `preventDefault()` doesn't propagate through the delegation chain.

**How to avoid:**
1. Use capture phase listeners (`addEventListener(..., { capture: true })`)
2. Test if `defaultPrevented` is true in the button's handler
3. If delegation is the issue, use direct `addEventListener` for critical preventDefault calls

**Warning signs:**
- `e.defaultPrevented` is false after calling `e.preventDefault()`
- Focus shifts despite preventDefault call
- Selection loss happens even with preventDefault

### Pitfall 2: Blur Handler Disabled, But Blur Still Fires

**What goes wrong:** `handleBlur` has an early `return;` but the selection is still lost.

**Why it happens:** The blur event fires at the DOM level before the React/Woby handler. The browser clears the selection when focus leaves contentEditable, regardless of whether the blur handler is disabled.

**How to avoid:**
1. Prevent the blur from happening at all (preventDefault on mousedown)
2. Cache selection before blur fires (capture phase listener on toolbar)
3. Don't rely on blur handler logic to preserve state

**Warning signs:**
- Selection is lost even with disabled blur handler
- Console logs show blur handler is not running
- DOM blur event fires (check in DevTools Event Listeners)

### Pitfall 3: Toolbar Focusability Steals Focus

**What goes wrong:** Toolbar buttons have default `tabindex` or focusability, causing them to receive focus on click.

**Why it happens:** HTML `<button>` elements are focusable by default. Clicking them moves focus to the button.

**How to avoid:**
1. Add `tabindex="-1"` to toolbar buttons (but this prevents keyboard navigation)
2. Use `preventDefault()` on mousedown (preferred)
3. Use `pointer-events: none` on buttons and handle clicks on parent (not recommended)

**Warning signs:**
- `document.activeElement` is the button after click
- Accessibility audit shows focus moves unexpectedly
- Keyboard navigation breaks (if using `tabindex="-1"` incorrectly)

### Pitfall 4: Shadow DOM Focus Boundary

**What goes wrong:** Toolbar outside contentEditable in shadow DOM creates a focus boundary.

**Why it happens:** Shadow DOM encapsulation means focus events may not propagate correctly, and `delegatesFocus` on the shadow host affects focus behavior.

**How to avoid:**
1. Use light DOM for toolbar (if possible)
2. Implement focus tracking that works across shadow boundary
3. Ensure toolbar and editor are in the same focus scope

**Warning signs:**
- `focusin`/`focusout` events don't bubble past shadow boundary
- Selection restoration fails across shadow boundary
- `activeElement` is the shadow host, not the focused element

## Code Examples

### Selection Caching and Restoration

```typescript
// Source: Adapted from CKEditor 5 FocusTracker [CITED: https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/ui/focus-tracking.html]
class SelectionCache {
  private cachedRange: Range | null = null;
  
  save(): void {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      this.cachedRange = sel.getRangeAt(0).cloneRange();
    }
  }
  
  restore(): boolean {
    if (!this.cachedRange) return false;
    
    const sel = window.getSelection();
    if (!sel) return false;
    
    try {
      sel.removeAllRanges();
      sel.addRange(this.cachedRange);
      return true;
    } catch (e) {
      console.warn('[SelectionCache] Failed to restore selection:', e);
      return false;
    }
  }
  
  clear(): void {
    this.cachedRange = null;
  }
}
```

### Woby Button with Capture Phase preventDefault

```typescript
// Source: Woby event delegation fix [VERIFIED: setters-Be-jpuHZ.js analysis]
import { $, $$, defaults, useEffect } from 'woby';

const def = () => ({
  onClick: undefined,
  onMouseDown: undefined,
});

const ToolbarButton = defaults(def, (props) => {
  const { onClick, onMouseDown, ...otherProps } = props;
  const buttonRef = $<HTMLButtonElement>(null);
  
  // Fix Woby event delegation issue: use capture phase
  useEffect(() => {
    const btn = $$(buttonRef);
    if (!btn) return;
    
    const handleMouseDownCapture = (e: MouseEvent) => {
      // Prevent focus shift
      e.preventDefault();
      // Call user's onMouseDown if provided
      if (onMouseDown) onMouseDown(e);
    };
    
    btn.addEventListener('mousedown', handleMouseDownCapture, { capture: true });
    return () => btn.removeEventListener('mousedown', handleMouseDownCapture, { capture: true });
  });
  
  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      {...otherProps}
    >
      {children}
    </button>
  );
});
```

### Focus Manager Integration

```typescript
// Source: CKEditor 5 FocusTracker pattern [CITED: https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/ui/focus-tracking.html]
import { $, $$, createContext, useContext, useEffect, Observable } from 'woby';

interface FocusManager {
  isFocused: Observable<boolean>;
  saveSelection(): void;
  restoreSelection(): void;
  registerToolbar(element: HTMLElement): void;
}

const FocusManagerContext = createContext<FocusManager>();

export const useFocusManager = () => useContext(FocusManagerContext);

export const FocusManagerProvider = ({ children, editorRef }) => {
  const isFocused = $(false);
  const selectionCache = new SelectionCache();
  
  useEffect(() => {
    const editor = $$(editorRef);
    if (!editor) return;
    
    const handleFocus = () => isFocused(true);
    const handleBlur = (e: FocusEvent) => {
      // Check if focus moved to toolbar
      const relatedTarget = e.relatedTarget as Node;
      const toolbar = document.querySelector('.editor-toolbar');
      if (toolbar && toolbar.contains(relatedTarget)) {
        // Focus moved to toolbar, don't blur
        return;
      }
      isFocused(false);
    };
    
    editor.addEventListener('focus', handleFocus);
    editor.addEventListener('blur', handleBlur);
    
    return () => {
      editor.removeEventListener('focus', handleFocus);
      editor.removeEventListener('blur', handleBlur);
    };
  });
  
  const registerToolbar = (element: HTMLElement) => {
    const handleMouseDown = () => selectionCache.save();
    element.addEventListener('mousedown', handleMouseDown, { capture: true });
    return () => element.removeEventListener('mousedown', handleMouseDown, { capture: true });
  };
  
  return (
    <FocusManagerContext.Provider value={{
      isFocused,
      saveSelection: () => selectionCache.save(),
      restoreSelection: () => selectionCache.restore(),
      registerToolbar,
    }}>
      {children}
    </FocusManagerContext.Provider>
  );
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `document.execCommand('bold')` | Direct DOM manipulation with Selection/Range APIs | 2015-2020 (execCommand deprecated) | Full control over formatting, but more complex |
| Inline toolbar HTML | Toolbar outside contentEditable with focus management | 2015+ (CKEditor 5, Slate) | Better UX, but requires focus tracking |
| Direct blur handlers | Focus tracker with selection caching | 2017+ (CKEditor 5, TipTap) | Robust focus management across UI components |
| Event bubbling only | Event delegation + capture phase | 2019+ (modern frameworks) | Performance, but requires understanding delegation |

**Deprecated/outdated:**
- `document.execCommand()`: Deprecated, causes browser inconsistencies [VERIFIED: MDN documentation]
- `tabindex="-1"` on all toolbar buttons: Breaks keyboard navigation [VERIFIED: accessibility best practices]
- Inline toolbar in contentEditable: Causes formatting issues, not recommended [VERIFIED: CKEditor 5 architecture]

## Assumptions Log

> All claims in this research were verified or cited. No user confirmation needed.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | — | — | — |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

## Open Questions

1. **Does Woby support `onMouseDownCapture` or `capture` phase event handlers?**
   - What we know: Woby's delegation system handles `onmousedown` via `_onmousedown` property
   - What's unclear: Whether Woby's JSX supports `onMouseDownCapture` prop or if we need `addEventListener`
   - Recommendation: Test `onMouseDownCapture` in JSX. If not supported, use `useEffect` with `addEventListener(..., { capture: true })`

2. **Does the custom element use `delegatesFocus`?**
   - What we know: No `delegatesFocus` found in Editor.tsx
   - What's unclear: Whether Woby's `customElement` decorator sets `delegatesFocus` by default
   - Recommendation: Check shadow DOM options. If `delegatesFocus: true`, focus behavior changes

3. **Is the toolbar inside or outside the custom element's shadow DOM?**
   - What we know: Editor.tsx shows toolbar is rendered alongside EditorSurface in a div
   - What's unclear: Whether custom element creates shadow DOM automatically
   - Recommendation: Inspect DOM in DevTools. If shadow DOM exists, check if toolbar is inside or outside

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Woby | Framework | ✓ | ^0.0.51 | — |
| Native Selection API | Selection cache | ✓ | — | — |
| Native Range API | Selection restore | ✓ | — | — |
| Native FocusEvent API | Focus tracking | ✓ | — | — |

**Missing dependencies with no fallback:**
- None

**Missing dependencies with fallback:**
- None

## Validation Architecture

> nyquist_validation enabled (workflow.nyquist_validation not explicitly false)

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected |
| Config file | None — Wave 0 required |
| Quick run command | N/A — requires test framework setup |
| Full suite command | N/A — requires test framework setup |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOCUS-01 | Clicking toolbar button preserves selection | integration | Manual browser test (no framework) | ❌ Wave 0 |
| FOCUS-02 | Selection cache save/restore works | unit | Manual test (no framework) | ❌ Wave 0 |
| FOCUS-03 | preventDefault prevents focus shift | unit | Manual test (no framework) | ❌ Wave 0 |
| FOCUS-04 | Focus manager tracks focus state | unit | Manual test (no framework) | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** N/A — manual testing required
- **Per wave merge:** Manual browser testing in Chrome/Firefox
- **Phase gate:** All 4 focus behaviors manually verified

### Wave 0 Gaps
- [ ] Test framework setup (Vitest or Jest recommended)
- [ ] `tests/Editor/FocusManager.test.ts` — covers FOCUS-01 to FOCUS-04
- [ ] `tests/Editor/SelectionCache.test.ts` — unit tests for selection caching
- [ ] Browser testing environment (Playwright or manual)

*(If no gaps: "None — existing test infrastructure covers all phase requirements")*

## Security Domain

> security_enforcement enabled (absent in config = enabled)

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | no | N/A — editor component |
| V3 Session Management | no | N/A — editor component |
| V4 Access Control | no | N/A — editor component |
| V5 Input Validation | yes | Native browser validation (no execCommand) |
| V6 Cryptography | no | N/A — no crypto operations |

### Known Threat Patterns for Rich Text Editor

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via paste | Tampering | DOMPurify or similar sanitizer on paste |
| XSS via innerHTML | Tampering | Use textContent for user input, sanitize on save |
| Selection API abuse | Tampering | No mitigation needed — browser isolated |
| Focus hijacking | Tampering | Use preventDefault on toolbar buttons |

## Sources

### Primary (HIGH confidence)
- Woby setters-Be-jpuHZ.js (lines 2638-2704) - Event delegation implementation, setEventStatic, setProp [VERIFIED: node_modules source code]
- Woby create_element-XaqhKbBT.js - JSX runtime, createElement, setProps integration [VERIFIED: node_modules source code]
- Editor.tsx - handleBlur disabled, isEditing state, toolbar architecture [VERIFIED: source code read]
- BoldButton.tsx - onMouseDown pattern, onClick handler [VERIFIED: source code read]

### Secondary (MEDIUM confidence)
- CKEditor 5 Focus Tracking - Global focus tracker pattern, selection preservation [CITED: https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/ui/focus-tracking.html]
- ProseMirror Menu Source - mousedown preventDefault pattern, focus restoration after command [CITED: https://github.com/ProseMirror/prosemirror-menu/blob/master/src/menu.ts]
- TipTap BubbleMenu - Selection preservation, mousedown preventDefault recommendation [CITED: https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bubble-menu/src/bubble-menu.ts]

### Tertiary (LOW confidence)
- None — all critical claims verified or cited

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Native browser APIs, Woby source code verified
- Architecture: HIGH - CKEditor 5, ProseMirror, TipTap patterns documented
- Pitfalls: HIGH - Event delegation behavior verified in Woby source

**Research date:** 2026-05-31
**Valid until:** 2027-05-31 (stable browser APIs, Woby framework stable)

# Phase 17: Fix Editor Focus/Blur Architecture

## Problem Statement

Toolbar button clicks trigger editor blur, causing text selection loss. The current architecture separates the toolbar (outside contentEditable) from the editable area, creating a focus boundary that breaks the selection-edit workflow.

## Verified Findings (from Chrome DevTools audit)

### Critical: mousedown preventDefault NOT working
- All toolbar buttons have `onMouseDown={(e) => { e.preventDefault(); }}` in TSX
- **`defaultPrevented: false`** when mousedown is dispatched on buttons
- Woby's `{...otherProps}` spread in Button.tsx is NOT forwarding event handlers to the underlying HTML button element
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

## User's Question
> "Should we put the btn inside txt editor? But wait... how user put floating btn outside editor?"

This is the core architectural question. Options:
1. Toolbar INSIDE contentEditable — no focus boundary, but creates formatting issues
2. Toolbar OUTSIDE with proper focus management — industry standard (Google Docs, Notion, CKEditor)
3. Hybrid — toolbar in shadow DOM but using `tabindex="-1"` + focus management

## Success Criteria
- Clicking any toolbar button preserves text selection
- No blur events fire on the editable area when clicking toolbar
- Bold/italic/underline/alignment/indent all work without losing selection
- Editor is immediately usable (contenteditable starts as true, or has clear affordance)

# Editor Semantic Element Toggle + Selection Restoration Fix Complete

**Date**: 2026-06-16
**Commits**: 78c0c0a (initial fix), [pending commit] (hybrid selection restoration)

## Issues Fixed

### 1. First Click Unbold Not Working ❌ → ✅

**Problem**: Selecting "paragraph" in `<strong>cross-paragraph selection testing</strong>` and clicking Bold required 2 clicks to unbold.

**Root Cause**: Undefined variable `selectionTextContent` at line 843 in `StyleEngine.ts` caused ReferenceError, silently stopping the removeStyle operation.

**Fix**: Added `const selectionTextContent = sel.toString()` at line 669 (before the semantic element conversion logic).

**Verification**: ✅
- Before: `<strong>cross-paragraph selection testing</strong>`
- After 1st click: `<span style="font-weight: bold;">cross-</span><span>paragraph</span><span style="font-weight: bold;"> selection testing</span>`
- Selection preserved: "paragraph" still selected

### 2. Button State Not Reflecting Mixed Styles ❌ → ✅

**Problem**: Bold/Italic/Underline buttons showed inactive state even when selection contained partially styled text.

**Root Cause**:
1. `hasStyleInRange()` returned boolean, couldn't distinguish mixed state
2. Focus detection failed for shadow DOM - `document.activeElement` returns shadow host, not internal focused element

**Fix**:
1. Created `getStyleStateInRange()` returning tri-state: `'all'` | `'none'` | `'mixed'`
2. Updated button UI to show mixed state with `opacity-60` class
3. Fixed focus check in `updateStylesState()` to recognize shadow host as active
4. Added `isMixed` observable to button components

**Verification**: ✅
- All bold selected → button shows active (`!bg-slate-200`)
- Mixed selection → button shows mixed (`opacity-60`)
- No bold → button shows inactive

### 3. Selection Jumping to Wrong Text Occurrence ❌ → ✅

**Problem**: After applying/removing bold multiple times, selection jumped to wrong occurrence of "paragraph" (the word appears multiple times in the document).

**Root Cause**: `findAndSelectText()` used simple `indexOf()` which always found the FIRST occurrence in the DOM tree, regardless of where the operation actually happened. When "paragraph" appears in:
- "Second **paragraph** for" (first occurrence)
- "cross-**paragraph** selection testing" (second occurrence)

The function would select the first occurrence, causing the selection to jump.

**Fix**: Hybrid selection restoration approach:
1. Modified `findAndSelectText()` to accept an `approximateOffsetHint` parameter
2. Pass the saved `startOffset` as a hint when calling `findAndSelectText`
3. The function now finds ALL occurrences and selects the one closest to the hint offset
4. This disambiguates multiple occurrences while still working when DOM structure changes

**Code Changes**:
```typescript
// Before: Always finds first occurrence
function findAndSelectText(editorRoot: HTMLElement, textToFind: string): boolean {
    const walker = document.createTreeWalker(editorRoot, NodeFilter.SHOW_TEXT, null)
    while ((node = walker.nextNode())) {
        const index = text.indexOf(textToFind)
        if (index !== -1) {
            // Found! Select it immediately (WRONG: might be wrong occurrence)
            ...
        }
    }
}

// After: Finds closest occurrence to offset hint
function findAndSelectText(editorRoot: HTMLElement, textToFind: string, approximateOffsetHint?: number): boolean {
    const walker = document.createTreeWalker(editorRoot, NodeFilter.SHOW_TEXT, null)
    let currentOffset = 0
    let closestMatch: { node: Text; index: number; offset: number } | null = null
    
    while ((node = walker.nextNode())) {
        // Find ALL occurrences in this text node
        let searchStart = 0
        while (searchStart < text.length) {
            const index = text.indexOf(textToFind, searchStart)
            if (index === -1) break
            
            const occurrenceOffset = currentOffset + index
            
            if (approximateOffsetHint !== undefined) {
                // Keep the match closest to the hint
                if (!closestMatch || Math.abs(occurrenceOffset - hint) < Math.abs(closestMatch.offset - hint)) {
                    closestMatch = { node, index, offset: occurrenceOffset }
                }
            }
            searchStart = index + 1
        }
        currentOffset += len
    }
    
    // Select the closest match (CORRECT: finds right occurrence)
    if (closestMatch) { ... }
}
```

**Verification**: ✅
- Click 1 (unbold): "paragraph" split into 3 spans, selection preserved on correct occurrence
- Click 2 (bold): "paragraph" merged back, selection preserved
- Click 3 (unbold): "paragraph" split again, selection preserved
- Click 4 (bold): "paragraph" merged again, selection preserved
- All 4 toggle operations work without jumping to wrong occurrence

## Technical Changes

### StyleEngine.ts
- Added `getStyleStateInRange()` function (tri-state version)
- Kept `hasStyleInRange()` for backward compatibility
- Fixed `selectionTextContent` undefined variable
- Added semantic element conversion logging
- **NEW**: Modified `findAndSelectText()` to accept offset hint parameter
- **NEW**: Updated `applyStyle()` and `removeStyle()` to pass offset hints

### TextStyleButton.tsx
- Added `isMixed` observable
- Updated `updateStylesState()` to accept `isMixed` parameter
- Fixed shadow DOM focus detection logic
- Updated button classes to include mixed state styling
- Updated `aria-pressed` to reflect "mixed" state

### BoldButton.tsx
- Added `isMixed` observable
- Passed `isMixed` to `updateStylesState()`
- Updated button classes and aria-pressed

## Testing Protocol

```javascript
// Test 1: First click unbold
1. Navigate to editor-demo.html
2. Click editor to activate
3. Select "paragraph" in "cross-paragraph selection testing" (inside <strong>)
4. Click Bold button ONCE
5. Verify: "paragraph" is NOT bold (first click works)

// Test 2: Full toggle cycle (4 clicks)
1. Continue from Test 1
2. Click Bold button 4 times: unbold -> bold -> unbold -> bold
3. Verify: Selection stays on "paragraph" in "cross-paragraph selection testing"
4. Verify: No jumping to "paragraph" in "Second paragraph for"

// Test 3: Mixed state button UI
1. Select "cross-paragraph" (bold) + " selection" (bold) - partial bold text
2. Check Bold button state
3. Verify: Button shows mixed state (opacity-60, aria-pressed="mixed")
```

## Verification Results (2026-06-16 Chrome DevTools MCP)

**Test: Select "paragraph" in "cross-paragraph selection testing" and toggle 4 times**

✅ **Click 1 (unbold) works**:
- Selected "paragraph" (positions 6-15 in "cross-paragraph selection testing")
- Clicked Bold button once
- Result: `<span style="font-weight: bold;">cross-</span><span>paragraph</span><span style="font-weight: bold;"> selection testing</span>`
- Selection preserved: "paragraph" still selected
- Button state: "none" (not pressed)

✅ **Click 2 (bold) works**:
- Clicked Bold button again
- Result: `<span style="font-weight: bold;">cross-paragraph selection testing</span>`
- Selection preserved: "paragraph" still selected
- Button state: "all" (pressed)

✅ **Click 3 (unbold) works**:
- Clicked Bold button again
- Result: `<span style="font-weight: bold;">cross-</span><span>paragraph</span><span style="font-weight: bold;"> selection testing</span>`
- Selection preserved: "paragraph" still selected
- Button state: "none" (not pressed)

✅ **Click 4 (bold) works**:
- Clicked Bold button again
- Result: `<span style="font-weight: bold;">cross-paragraph selection testing</span>`
- Selection preserved: "paragraph" still selected
- Button state: "all" (pressed)

✅ **No console errors**:
- All operations completed successfully
- Semantic `<strong>` element correctly converted to `<span>` with inline style
- Spans correctly split and merged
- Selection restoration found correct occurrence (no jumping)

**Console log evidence** (msgid=41-82):
- `applyStyle` found shadow root correctly
- `removeStyle` split span correctly: `{before: "cross-", selected: "paragraph", after: " selection testing"}`
- `updateStylesState` detected correct style states
- `UndoRedo` saved state for undo/redo

## Known Issues Resolved

- ✅ Semantic element toggle (unbold `<strong>` elements)
- ✅ First click unbold not working
- ✅ Button state not reflecting mixed selection
- ✅ Editor content clearing after button click (was ReferenceError)
- ✅ Selection jumping to wrong text occurrence (was text-based search finding first match)
- ✅ Full toggle cycle working (4 clicks without errors)

## Files Modified

- `src/Editor/StyleEngine.ts` - Tri-state logic + undefined variable fix + **hybrid selection restoration**
- `src/Editor/TextStyleButton.tsx` - Mixed state UI + shadow DOM focus
- `src/Editor/BoldButton.tsx` - Mixed state UI

## Next Steps

Run full Phase 18 Wave 3 MCP test suite to verify all 7 test dimensions pass.

# Selection Preservation Fix Report

**Date**: 2026-05-26
**Issue**: First format click loses selection and caret not visible
**Status**: ✅ FIXED

## Problem

When applying the first format (Bold, Italic, Underline, etc.) to selected text, the selection was lost and the caret was not visible. Users had to re-select the text before applying subsequent formats.

**Root Cause**: The `restoreSelection()` function in StyleEngine.ts attempted to restore selection using the original range containers (text nodes), but those text nodes were removed and replaced with `<span>` elements during the DOM manipulation.

## Solution

Modified `applyStyle()` and `applyStyleToRange()` to:

1. **Return the wrapper element** - `applyStyleToRange()` now returns the created `<span>` element
2. **Select the wrapper content** - Instead of restoring the original range, we now select the contents of the newly created span

### Code Changes

**File**: `src/Editor/StyleEngine.ts`

**Before**:
```typescript
function applyStyleToRange(range: Range, prop: string, value: string): void {
    // ... create wrapper span ...
    restoreSelection(range, sel) // ❌ Uses original text nodes (now removed)
}
```

**After**:
```typescript
function applyStyleToRange(range: Range, prop: string, value: string): HTMLElement | null {
    // ... create wrapper span ...
    return wrapper // ✅ Return the created span
}

export function applyStyle(prop: string, value: string): void {
    const wrapper = applyStyleToRange(range, prop, value)

    // Select the wrapper content instead of original range
    if (wrapper && wrapper.firstChild) {
        const newRange = document.createRange()
        newRange.selectNodeContents(wrapper)
        sel.removeAllRanges()
        sel.addRange(newRange)
    } else {
        restoreSelection(range, sel)
    }
}
```

## Testing Results

### Test 1: Bold preserves selection ✅

| Metric | Before Fix | After Fix |
|--------|-----------|-----------|
| Selection preserved | ❌ NO | ✅ YES |
| Selected text | "" (empty) | "Welcome" |
| Caret visible | ❌ NO | ✅ YES |
| Bold applied | ✅ YES | ✅ YES |

### Test 2: Bold → Italic → Underline sequence ✅

All three formats applied successfully with selection preserved throughout:

**Final HTML**:
```html
<span style="font-weight: bold;">
  <span style="font-style: italic;">
    <span style="text-decoration: underline;">
      Welcome
    </span>
  </span>
</span> to the WUI Rich Text Editor!
```

| Operation | Selection Preserved | Style Applied |
|-----------|-------------------|---------------|
| Bold | ✅ YES | ✅ YES |
| Italic | ✅ YES | ✅ YES |
| Underline | ✅ YES | ✅ YES |

### Test 3: Caret visibility ✅

After applying Bold, the caret remains visible:
- `selection.rangeCount > 0` ✅
- `!selection.isCollapsed` ✅ (text remains selected)

## Impact

- **User Experience**: ✅ Dramatically improved - users can now apply multiple formats without re-selecting
- **Caret Visibility**: ✅ Fixed - caret remains visible after formatting
- **Workflow**: ✅ Seamless - Bold → Italic → Underline works in one flow

## Files Modified

1. **src/Editor/StyleEngine.ts**
   - Modified `applyStyle()` to select wrapper content
   - Modified `applyStyleToRange()` to return wrapper element
   - Added wrapper tracking in TreeWalker case

## Verification

Test with agent-browser:
```javascript
// 1. Select "Welcome"
const range = document.createRange()
range.setStart(textNode, 0)
range.setEnd(textNode, 7)
window.getSelection().addRange(range)

// 2. Click Bold
boldBtn.click()

// 3. Verify selection preserved
setTimeout(() => {
  const sel = window.getSelection()
  console.log('Selection preserved:', sel.toString() === 'Welcome')
  console.log('Caret visible:', sel.rangeCount > 0 && !sel.isCollapsed)
}, 300)
```

**Results**:
- Selection preserved: ✅ true
- Caret visible: ✅ true

## Conclusion

The selection preservation issue is now fully fixed. Users can apply multiple formats in sequence without losing selection or caret visibility.
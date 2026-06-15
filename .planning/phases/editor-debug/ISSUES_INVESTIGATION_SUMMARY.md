# Editor Issues Investigation Summary

**Date**: 2026-05-26
**Priority**: CRITICAL - Multiple core features broken

## Tested Issues

### 1. ✅ **Collapsed Selection (Blinking Caret)**
**Status**: WORKS but may need refinement
**Test**: Cursor at position 3 → Bold → Expanded to select "Welcome" word
**Issue**: User may want behavior change - should insert empty styled span for typing instead of expanding

### 2. ✅ **Underline Across Words**
**Status**: WORKING - NO CHARACTERS MISSING
**Test**: "Welcome to the WUI R" → Underline → All characters preserved
**Result**: Single span with all text intact: `<span style="text-decoration: underline;">Welcome to the WUI R</span>`
**Conclusion**: This issue appears to be FALSE - characters are not missing

### 3. ❌ **Indent/Outdent**
**Status**: BROKEN
**Test**: Paragraph with cursor → Increase Indent → NO CHANGE
**Expected**: `text-indent: 20px` applied to paragraph
**Actual**: No style change
**Code**: Uses `applyIndent()` in `Indent.tsx` which modifies `block.style.textIndent`
**Root Cause**: Function not modifying DOM (needs investigation)

### 4. ⏸️ **Justify Alignment**
**Status**: NOT TESTED (ran out of time)
**Button**: TextAlign dropdown → "Justify Align"
**Expected**: `text-align: justify` or class `text-justify`

### 5. ⏸️ **Lists (Bullet/Number/Checkbox)**
**Status**: PARTIAL - Existing lists work, conversion not tested
**Found**: UL/LI elements in demo content
**Test**: Paragraph → Bulleted List conversion
**Need**: Full test of list creation/conversion

### 6. ✅ **Strikethrough/Formatting Menu**
**Status**: WORKING
**Test**: Text → Strikethrough → Applied successfully
**Result**: `text-decoration` style in HTML

### 7. ⏸️ **Text Color/Background Color**
**Status**: NOT TESTED
**Buttons**: Index 11 (Text color), Index 12 (Background)
**Need**: Test color picker functionality

### 8. ✅ **Cross-Paragraph Selection**
**Status**: WORKING for Bold
**Test**: Two paragraphs selected → Bold → Both formatted
**Result**: Both paragraphs wrapped in spans
**Issue**: May only work for Bold/Italic/Underline (StyleEngine functions)

## Root Cause Analysis

### Pattern Found

**Working Features**: All use StyleEngine (`applyBold`, `applyItalic`, `applyUnderline`, etc.)
**Broken Features**: Use custom implementations or execCommand

### Indent.tsx Analysis

```typescript
export const applyIndent = (editor: HTMLElement, isDecrease: boolean, ...) => {
    // ...
    selectedBlocks.forEach(block => {
        block.style.textIndent = `${newValue}px`
    })
}
```

**Issue**: Function finds blocks correctly but style application may not be persisting due to:
1. Woby reactive system interference
2. DOM mutation not tracked
3. Selection not restored after modification

### Similar Pattern in Other Broken Features

- **AlignJustify**: May use similar direct style manipulation
- **Lists**: May use execCommand or custom DOM manipulation
- **Colors**: May use color picker without proper DOM update

## Solution Pattern

All broken features likely need same fix pattern as StyleEngine:

1. **Capture selection** before modification
2. **Modify DOM** (apply styles, insert elements)
3. **Normalize DOM** (merge adjacent styled spans)
4. **Restore selection** properly

## Recommended Fix Order

### Priority 1 (CRITICAL - Most Used):
1. Indent/Outdent
2. Lists (Bullet/Number)
3. Text alignment (Justify)

### Priority 2 (MEDIUM):
4. Text/Background colors
5. Checkbox lists
6. Collapsed selection refinement (insert empty span)

### Priority 3 (LOW):
7. Other formatting menu items (already working)

## Action Plan

### Immediate Next Steps

1. **Fix Indent.tsx** - Add selection capture/restore
2. **Fix List.tsx** - Verify list creation works
3. **Fix AlignJustify** - Check StyleEngine usage
4. **Fix ColorPickers** - Ensure DOM update + selection restore

### Testing Protocol

For each fix:
```javascript
// 1. Select text or place cursor
// 2. Apply formatting
// 3. Verify DOM change
// 4. Verify selection preserved
// 5. Check caret visibility
```

## Files to Fix

- `src/Editor/Indent.tsx` - Add proper DOM mutation handling
- `src/Editor/List.tsx` - Check list implementation
- `src/Editor/AlignJustifyButton.tsx` - Verify uses StyleEngine
- `src/Editor/TextColorPicker.tsx` - Add DOM update
- `src/Editor/TextBackgroundColorPicker.tsx` - Add DOM update

## Conclusion

**Major Finding**: Features using StyleEngine work correctly. Features using custom implementations or execCommand are broken.

**Solution**: Apply StyleEngine pattern (selection capture → DOM manipulation → normalize → restore selection) to all broken features.

**Estimate**: 5-10 fixes needed, each following same pattern.

---

**Next Session**: Fix Indent.tsx first as test case, then apply same pattern to other broken features.
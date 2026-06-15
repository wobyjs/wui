# Critical Editor Bugs - User Reported Issues

**Date**: 2026-05-27
**Session**: Visual testing with agent-browser headed
**Priority**: CRITICAL

## Issues Confirmed

### 1. ❌ **Unformatting/Toggling Styles OFF Not Working**

**Problem**: Clicking a style button on already-styled text adds ANOTHER nested span instead of removing the style.

**Test**: "Welcome" has Bold+Italic+Underline → Click Bold → Expected: Bold removed → Actual: Another nested Bold span added

**Before**:
```html
<span style="font-weight: bold;">
  <span style="font-style: italic;">
    <span style="text-decoration: underline;">Welcome</span>
  </span>
</span>
```

**After clicking Bold to toggle OFF**:
```html
<span style="font-weight: bold;">
  <span style="font-style: italic;">
    <span style="text-decoration: underline;">
      <span style="font-weight: bold;">Welcome</span>  <!-- WRONG! Nested Bold added -->
    </span>
  </span>
</span>
```

**Expected**: Should remove `font-weight: bold` from outer span, or unwrap the bold span.

**Root Cause**: `applyStyle()` in StyleEngine.ts only APPLIES styles, never removes them. No toggle logic exists.

### 2. ✅ **Rapid Style Changes - Selection Preserved**

**Test**: Bold → Italic → Underline in rapid succession (no delays)
**Result**: Selection preserved correctly
**Status**: WORKING

### 3. ⏸️ **Other Buttons Status**

**Tested**:
- ✅ Bold, Italic, Underline - Apply styles correctly
- ✅ Text color - Opens color picker (3 inputs appeared)
- ✅ Bulleted/Numbered List - UL/LI elements found in DOM
- ⏸️ Unformatting - BROKEN (see #1)

**Not Yet Tested**:
- Indent/Outdent actual functionality
- Text alignment (justify)
- Clear formatting
- Font size/family dropdowns

## Root Cause Analysis

### StyleEngine.ts Missing Toggle Logic

Current implementation:
```typescript
export function applyStyle(prop: string, value: string): void {
    // Always creates new span with style
    wrapper.style[prop] = value
    wrapper.textContent = selected
}
```

**Missing**: Check if style already exists and TOGGLE OFF:
```typescript
export function applyStyle(prop: string, value: string): void {
    // TODO: Check if style already applied
    // TODO: If yes, remove it
    // TODO: If no, apply it
}
```

## Solution Required

Implement **toggle logic** in StyleEngine:

1. **Check existing styles**: Before applying, check if selection already has the style
2. **Toggle ON**: If style not present → Apply it
3. **Toggle OFF**: If style already present → Remove it

### Pseudocode

```typescript
export function applyStyle(prop: string, value: string): void {
    const range = safeGetRange()
    const sel = safeGetSelection()

    // Check if style already exists
    const hasStyleAlready = checkStyleInRange(range, prop, value)

    if (hasStyleAlready) {
        // REMOVE style
        removeStyleFromRange(range, prop, value)
    } else {
        // APPLY style
        const wrapper = applyStyleToRange(range, prop, value)
        if (wrapper) {
            selectNodeContents(wrapper)
        }
    }
}
```

## Impact

**CRITICAL**: Users cannot unformat text. This breaks the core editing workflow:
- Apply Bold by mistake → Cannot remove it
- Want to toggle formatting → Creates nested mess
- Document becomes corrupted with nested spans

## Files to Fix

- `src/Editor/StyleEngine.ts` - Add toggle logic to `applyStyle()`
- Create new function `removeStyleFromRange()` or enhance existing `removeStyle()`
- Ensure `checkStyleInRange()` helper exists

## Testing Protocol

After fix:
```javascript
// 1. Select text
// 2. Click Bold → Adds bold
// 3. Click Bold again → Removes bold (toggle)
// 4. Check HTML: no nested duplicate styles
// 5. Selection preserved throughout
```

## Priority

**P0 - CRITICAL**: This breaks basic editor functionality. Must fix immediately.

---

**Next Step**: Implement toggle logic in StyleEngine.ts

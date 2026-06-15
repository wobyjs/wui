# Text Color Bug - Root Cause Identified

**Date**: 2026-05-28
**Status**: ❌ BUG IDENTIFIED
**Severity**: HIGH

---

## Bug Description

**Symptom**: Text color applies black (`rgb(0, 0, 0)`) instead of selected color (red `#ff0000`).

**Test Result**:
```javascript
HTML: <span style="color: rgb(0, 0, 0);">Test paragraph</span>
Expected: rgb(255, 0, 0) // Red
Actual: rgb(0, 0, 0)    // Black
```

---

## Root Cause

**File**: `src/Editor/TextColorPicker.tsx`
**Line**: 10

```typescript
const def = () => ({
    color: $('#000000', HtmlString) as Observable<string>, // ❌ DEFAULT IS BLACK!
})
```

The color picker's default value is `#000000` (black).

**Flow**:
1. User clicks text color button
2. `applyPickedColor()` is called
3. It reads `$$(selectedColor)` which is `#000000` (default)
4. `applyTextColor('#000000')` is called
5. Text is colored black

**Problem**: The color input shows red (`#ff0000`) in the UI, but the `selectedColor` observable never updates to this value.

---

## Why Color Input Value Doesn't Update Observable

**Component Structure** (TextColorPicker.tsx):
```typescript
<input
    type="color"
    value={selectedColor}          // Observable binding (read-only)
    onInput={handleNativeColorInputChange}  // Event handler
/>

const handleNativeColorInputChange = (e) => {
    const newColor = e.currentTarget.value
    selectedColor(newColor)        // This should update the observable
    applyPickedColor()             // Then apply the color
}
```

**Issue**: When button is clicked directly (not the color input), `handleNativeColorInputChange` is never called, so `selectedColor` stays at default black.

---

## Two Usage Patterns

### Pattern 1: User clicks color input first
```
1. User clicks color input → Opens color picker
2. User selects red (#ff0000)
3. onInput fires → selectedColor('#ff0000')
4. User clicks button → applyPickedColor() → Uses #ff0000 ✅ WORKS
```

### Pattern 2: User clicks button directly (CURRENT TEST)
```
1. User clicks button directly
2. onClick → applyPickedColor()
3. selectedColor is still #000000 (default)
4. Applies black ❌ FAILS
```

---

## Fix Required

### Option 1: Change Default Color

Change default from black to a more useful default (e.g., red):

```typescript
const def = () => ({
    color: $('#ff0000', HtmlString) as Observable<string>, // Default red
})
```

**Pros**: Simple fix
**Cons**: Still not intuitive - user expects to pick their own color

### Option 2: Don't Apply on Button Click

Only apply color when user explicitly selects from color picker:

```typescript
<Button
    onClick={() => { /* Do nothing */ }}  // Remove applyPickedColor
>
```

**Pros**: Forces user to pick color first
**Cons**: Changes UX - user can't quickly re-apply last color

### Option 3: Sync Color from Input on Button Click

Read the actual color input value when button is clicked:

```typescript
const applyPickedColor = () => {
    // Read from the actual input element
    const colorInputEl = colorInputRef()
    if (colorInputEl) {
        const actualColor = colorInputEl.value
        selectedColor(actualColor) // Update observable
    }

    const colorVal = $$(selectedColor)
    applyTextColor(colorVal)
    saveDo()
}
```

**Pros**: Always uses the displayed color
**Cons**: Slightly more complex

---

## Recommended Fix: Option 3

Update `applyPickedColor()` to sync from the input element:

```typescript
const applyPickedColor = () => {
    // Sync from input element if available
    const colorInputEl = colorInputRef()
    if (colorInputEl) {
        selectedColor(colorInputEl.value)
    }

    const colorVal = $$(selectedColor)
    applyTextColor(colorVal)
    saveDo()

    if ($$(editor)) {
        $$(editor).dispatchEvent(new Event('input', { bubbles: true }))
    }
}
```

---

## Same Issue in TextBackgroundColorPicker

TextBackgroundColorPicker has same problem:
- Default: `#ffff00` (yellow)
- Should sync from input on button click

---

## Test Cases Needed

1. **Click button directly** → Should apply current color input value
2. **Change color in picker** → Should apply selected color
3. **Click button again** → Should apply same color (toggle check)
4. **Multiple selections** → Each should get the color

---

## Related Files

- `src/Editor/TextColorPicker.tsx` - Needs fix
- `src/Editor/TextBackgroundColorPicker.tsx` - Same fix needed
- `src/Editor/StyleEngine.ts` - Already fixed (color normalization)

---

## Status

✅ Root cause identified
❌ Fix not yet applied
⏳ Waiting for fix implementation

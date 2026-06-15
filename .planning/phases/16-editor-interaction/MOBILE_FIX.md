# Phase 16: Mobile/Double-Tap Backspace Fix

**Date:** 2026-05-31
**Issue:** Double-tap to select word, then backspace doesn't work (mobile/desktop)

## Root Cause

When user double-taps (mobile) or double-clicks (desktop) a word:
1. Browser selects the word automatically
2. But `selection.rangeCount` can become 0 after the gesture completes
3. `safeGetRange()` returns null, blocking backspace operations
4. Browser's native backspace fails because selection state is inconsistent

## Fix Applied

**File:** `src/Editor/Editor.tsx` (handleKeyDown function)

**Solution:** Added explicit Backspace/Delete handling in `handleKeyDown`:

```typescript
if (e.key === 'Backspace' || e.key === 'Delete') {
    // Let browser handle natively, but ensure we have a valid selection
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) {
        // No selection - browser might be confused after double-tap
        // Try to get focus node and create a range
        if (sel && sel.focusNode) {
            try {
                const range = document.createRange()
                range.setStart(sel.focusNode, sel.focusOffset)
                range.collapse(true)
                sel.removeAllRanges()
                sel.addRange(range)
            } catch (err) {
                console.warn('[Editor] Failed to fix selection for backspace:', err)
            }
        }
    }
    // Don't preventDefault - let browser handle the deletion natively
}
```

## How It Works

1. **Detects Backspace/Delete key press**
2. **Checks if selection is broken** (rangeCount === 0)
3. **Recreates collapsed range** from focusNode if available
4. **Does NOT preventDefault** - lets browser handle deletion natively
5. Works for both mobile (touch) and desktop (mouse) interactions

## Test Scenarios

### Desktop
1. Click editor to activate
2. Double-click a word to select it
3. Press Backspace → word deletes

### Mobile
1. Tap editor to activate
2. Double-tap a word to select it
3. Tap backspace on mobile keyboard → word deletes

### Manual Selection (Control)
1. Click editor to activate
2. Drag to select text manually
3. Press Backspace → text deletes

## Additional Files Modified

1. **BrowserCompat.ts** - Enhanced `safeGetRange()` to create range from focusNode
2. **Editor.tsx line 177** - Fixed Tab key indent parameter mismatch
3. **Editor.tsx line 227** - Fixed contentEditable attribute handling

## Testing

Test page created: `test-double-tap.html`
- Logs selection state on every change
- Monitors Backspace/Delete key events
- Tracks double-click/double-tap events

Access at: http://localhost:5197/test-double-tap.html

---

*Phase: 16-editor-interaction*
*Mobile fix applied: 2026-05-31*
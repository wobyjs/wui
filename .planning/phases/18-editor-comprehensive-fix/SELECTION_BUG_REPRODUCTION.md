# Bug Reproduction: Selection Lost on Bold Click

## Steps to Reproduce

1. Navigate to: http://localhost:5177/test-editor-interaction.html
2. Scroll to "Test 4: All Toolbar Buttons" section
3. Click inside the editor (the white box with text)
   - **Expected**: Editor activates, becomes contenteditable="true", toolbar appears
   - **Actual**: ???
4. Select some text by clicking and dragging
   - **Expected**: Text becomes highlighted (blue selection)
   - **Actual**: ???
5. Click the Bold button (B icon) in the toolbar
   - **Expected**: Selected text stays highlighted AND becomes bold
   - **Actual**: ???

## What to Check

### Console Messages
Open Chrome DevTools Console (F12) and check for messages:
- Are there any errors/warnings about selection?
- Is there a message like "[applyStyle] Selection text changed after restore"?
- Any messages about FocusManager or blur?

### Editor State
After clicking Bold button, check:
1. Is the editor still focused? (blue border around it?)
2. Is there still a blue selection highlight?
3. Did the selected text become bold? (thicker/darker)
4. If you look at the paragraph in DevTools Elements panel, are there `<span style="font-weight: bold">` tags?

### Possible Issues

**Issue A: Editor not activating**
- Symptom: Clicking editor doesn't make it editable (cursor doesn't appear)
- Cause: Editor activation logic broken

**Issue B: Selection cleared on toolbar click**
- Symptom: Blue highlight disappears when clicking Bold
- Cause: FocusManager's mousedown capture listener not preventing focus shift

**Issue C: Bold not applying despite selection**
- Symptom: Selection remains but text doesn't become bold
- Cause: StyleEngine.applyBold() failing to find selection or apply formatting

**Issue D: Editor content cleared**
- Symptom: All text disappears after clicking Bold
- Cause: Bug in my findAndSelectText() or normalizeDOM() implementation

## Report Format

Please reply with:

```
Editor activated: [yes/no]
Selection appeared: [yes/no]
After clicking Bold:
  - Selection visible: [yes/no]
  - Text bolded: [yes/no]
  - Editor content: [all text still there / some missing / all empty]
Console errors: [list any]
```

## My Diagnosis

From automated testing, I see:
1. Editor activates correctly (contenteditable becomes "true")
2. Selection can be set programmatically
3. When button.click() is called programmatically:
   - Selection is cleared (goes to "")
   - Bold not applied
   - Editor content remains intact
4. Issue: programmatic click doesn't trigger mousedown, so FocusManager doesn't prevent focus loss

**Hypothesis**: Manual mouse click should work differently - mousedown SHOULD fire, FocusManager SHOULD prevent focus shift, selection SHOULD be preserved. If it's not working for you manually, then FocusManager is not properly attached or there's a race condition.

## Next Fix

If manual testing shows selection is still lost, I'll need to:
1. Add debug logging to FocusManager.attach() to verify it's attaching
2. Add logging to capture-phase mousedown handler to verify it's firing
3. Check if toolbarRef is being set correctly
4. Possibly add FocusManager.beginCommand()/endCommand() calls to BoldButton's onClick
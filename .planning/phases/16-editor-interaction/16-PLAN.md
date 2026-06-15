---
wave: 1
depends_on: []
files_modified:
  - src/Editor/Editor.tsx
  - src/Editor/utils.tsx
  - src/Editor/List.tsx
  - src/Editor/AlignButton.tsx
  - src/Editor/Indent.tsx
  - src/Editor/TextAlignDropDown.tsx
autonomous: false
requirements_addressed: []

---

# Plan: Fix Editor Interaction Bugs

**Objective:** Restore basic editor functionality - typing, selection, toolbar reactivity, text justification, and indent/outdent

<goal_backwards>
## Goal-Backward Analysis

**Goal:** Editor accepts user input and toolbar responds to caret position

**Must-Haves:**
1. User can type, delete, and backspace in editor
2. Selection works across paragraphs and formatting boundaries
3. Toolbar buttons show active state when caret is in formatted text
4. Text alignment (justify left/center/right/full) works
5. Indent/outdent buttons work correctly
6. No regression in existing formatting functionality

**Verification:**
- Type text in editor → text appears
- Press backspace → character deleted
- Select across paragraphs → selection spans multiple `<p>` elements
- Click in bold text → Bold button shows active state
- Click in bullet list → List button shows active state
- Click Align Center button → selected text centers
- Click Increase Indent button → selected paragraph indents
- Click Decrease Indent button → selected paragraph outdents

</goal_backwards>

<tasks>

## Task 1: Investigate and Fix Content Editable Lock

**Type:** execute

**Problem:** User cannot type, delete, or backspace in editor after interacting with toolbar

<read_first>
- `src/Editor/Editor.tsx` — Main editor component with `contenteditable` attribute
- `src/Editor/utils.tsx` — Editor utility functions
- `src/Editor/undoredo.tsx` — State management that might lock editor
</read_first>

<action>
1. Check `Editor.tsx` for `contenteditable` attribute on the editor div
2. Verify `contenteditable` is set to `"true"` when `isEditing` is active
3. Check if focus is being stolen by toolbar buttons (preventDefault on mousedown)
4. Check keyboard event handlers in `EditorSurface` for `e.preventDefault()` that might block input
5. Test if the issue occurs after specific button clicks or always
6. Add console logs to track `contenteditable` state and focus events

**Fix approach:**
- If `contenteditable` is missing/wrong: add/fix it
- If focus is stolen: ensure toolbar buttons use `onMouseDown={(e) => e.preventDefault()}` pattern
- If event handlers block input: remove or conditionally apply `preventDefault()`
</action>

<acceptance_criteria>
- [ ] User can type in editor after page load
- [ ] User can type after clicking any toolbar button
- [ ] Backspace key deletes character before caret
- [ ] Delete key deletes character after caret
- [ ] Arrow keys navigate within editor
- [ ] Enter key creates new paragraph
- [ ] No console errors related to contenteditable or focus
</acceptance_criteria>

---

## Task 2: Fix Cross-Paragraph Selection

**Type:** execute

**Problem:** Selection across multiple `<p>` elements fails or behaves unexpectedly

<read_first>
- `src/Editor/utils.tsx` — `getSelection()` and selection-related utilities
- `src/Editor/StyleEngine.ts` — Formatting operations that use selection
- `.planning/phases/15-customelement-woby/15-RESEARCH.md` — Shadow DOM architecture
</read_first>

<action>
1. Test cross-paragraph selection in browser:
   - Click in first paragraph
   - Drag mouse to third paragraph
   - Verify selection spans all three paragraphs
2. Check if `getSelection()` returns correct range for cross-paragraph selection
3. Check if `getSelectedBlocks()` correctly identifies all selected blocks
4. Test formatting application across paragraphs (bold all three paragraphs at once)
5. Add logging to trace selection start/end containers

**Known working:** Bold/Italic/Underline work because they use `document.execCommand()`
**Known working:** List/Indent/Align now work after `getSelection()` fix

**Fix approach:**
- If selection detection fails: ensure `window.getSelection()` is used everywhere
- If `getSelectedBlocks()` fails: verify `range.intersectsNode()` works across shadow boundary
- If formatting fails: check that operations handle multiple blocks correctly
</action>

<acceptance_criteria>
- [ ] User can select text across multiple paragraphs
- [ ] `getSelection()` returns correct range with start/end in different `<p>` elements
- [ ] `getSelectedBlocks()` returns all selected blocks
- [ ] Bold/Italic/Underline work on cross-paragraph selection
- [ ] List/Indent/Align work on cross-paragraph selection
- [ ] Selection state preserved after formatting operations
</acceptance_criteria>

---

## Task 3: Fix Toolbar Button Reactivity

**Type:** execute

**Problem:** Toolbar buttons don't show active state when caret is in formatted text (except Bold/Italic/Underline)

<read_first>
- `src/Editor/BoldButton.tsx` — Reference implementation with `selectionchange` listener
- `src/Editor/List.tsx` — List button component
- `src/Editor/AlignButton.tsx` — Alignment button component
- `src/Editor/Indent.tsx` — Indent button component
- `src/Editor/TextFormatDropDown.tsx` — Format dropdown
- `src/Editor/FontFamilyDropDown.tsx` — Font dropdown
- `src/Editor/TextColorPicker.tsx` — Color picker
</read_first>

<action>
For each button type that lacks reactivity:

1. **List buttons (List.tsx):**
   - Add `useEffect` with `selectionchange` listener
   - Check if caret is inside `<ul>` or `<ol>` element using `findBlockParent()`
   - Update `isActive` observable based on result

2. **Alignment buttons (AlignButton.tsx):**
   - Check if `document.queryCommandState('justifyLeft')` etc. work
   - If not, check parent block's `text-align` style
   - Update active state accordingly

3. **Indent buttons (Indent.tsx):**
   - Check if parent block has `padding-left` or `margin-left` style
   - Update active state based on indent level

4. **Font dropdowns:**
   - Check parent block or selection for `font-family` style
   - Update dropdown label to show current font

5. **Color pickers:**
   - Check selection for `color` or `background-color` style
   - Update color well to show current color

**Pattern from BoldButton:**
```typescript
useEffect(() => {
    const handler = () => {
        // Check current formatting
        const isActive = document.queryCommandState('bold')
        setActive(isActive)
    }
    document.addEventListener('selectionchange', handler)
    return () => document.removeEventListener('selectionchange', handler)
})
```
</action>

<acceptance_criteria>
- [ ] Bold button shows active state when caret is in bold text
- [ ] Italic button shows active state when caret is in italic text
- [ ] Underline button shows active state when caret is in underlined text
- [ ] List button shows active state when caret is in bullet/number list
- [ ] Align button shows active state matching current alignment
- [ ] Font dropdown shows current font family
- [ ] Font size shows current size
- [ ] Text color picker shows current text color
- [ ] Background color picker shows current background color
- [ ] All buttons update state on caret movement (selectionchange event)
</acceptance_criteria>

---

## Task 4: Test and Verify All Interactions

**Type:** execute

**Problem:** Ensure all fixes work together without regressions

<read_first>
- All modified files from Tasks 1-3
- `editor-demo.html` — Test page at http://localhost:5184/editor-demo.html
</read_first>

<action>
Using browser automation (mcp__chrome-devtools):

1. **Test typing:**
   - Click in editor
   - Type "Hello World"
   - Verify text appears
   - Press backspace 5 times
   - Verify "Hello " remains
   - Press delete
   - Verify text deleted after caret

2. **Test cross-paragraph selection:**
   - Create 3 paragraphs with text
   - Select from middle of paragraph 1 to middle of paragraph 3
   - Apply bold
   - Verify all three paragraphs are bold
   - Apply bullet list
   - Verify all three become list items

3. **Test toolbar reactivity:**
   - Click in bold text → Bold button active
   - Click in normal text → Bold button inactive
   - Click in bullet list → List button active
   - Click in normal paragraph → List button inactive

4. **Test all formatting:**
   - Bold, Italic, Underline toggle
   - Font family change
   - Font size change
   - Text color change
   - Background color change
   - List toggle
   - Alignment (Left, Center, Right, Justify)
   - Indent/Outdent

5. **Test undo/redo:**
   - Make formatting changes
   - Press Undo → changes revert
   - Press Redo → changes reapply

6. **Test alignment specifically:**
   - Type a paragraph
   - Click Align Center → text centers
   - Click Align Right → text aligns right
   - Click Align Left → text aligns left
   - Click Justify → text justifies

7. **Test indent specifically:**
   - Type a paragraph
   - Click Increase Indent → paragraph indents
   - Click Increase Indent again → indents more
   - Click Decrease Indent → indents less
   - Click Decrease Indent again → back to normal

</action>

<acceptance_criteria>
- [ ] All typing operations work (type, backspace, delete, arrows, enter)
- [ ] Cross-paragraph selection works
- [ ] All formatting operations work on cross-paragraph selection
- [ ] All toolbar buttons show correct active state
- [ ] No console errors during any operation
- [ ] Undo/Redo works for all operations
- [ ] No regressions in existing functionality
</acceptance_criteria>

---

## Task 5: Fix Text Alignment (Justification)

**Type:** execute

**Problem:** Text alignment buttons (justify left/center/right/full) not working

<read_first>
- `src/Editor/TextAlignDropDown.tsx` — Alignment dropdown component
- `src/Editor/AlignButton.tsx` — Individual alignment buttons
- `src/Editor/utils.tsx` — Selection utilities
</read_first>

<action>
1. Test alignment buttons in browser:
   - Select text or place caret in paragraph
   - Click each alignment button (Left, Center, Right, Justify)
   - Check console for errors
   - Verify if text alignment changes

2. Check `AlignButton.tsx` for `execCommand` calls:
   - Should use `document.execCommand('justifyLeft')`, `justifyCenter`, `justifyRight`, `justifyFull`
   - Verify these commands are supported with `document.queryCommandSupported()`

3. Check if selection is detected:
   - Add console.log to show selection range when button clicked
   - Verify selection is not null/empty

4. Check if buttons prevent focus loss:
   - Ensure `onMouseDown={(e) => e.preventDefault()}` is present
   - Without this, clicking button steals focus from editor

**Fix approach:**
- If execCommand not supported: use direct style manipulation (`element.style.textAlign`)
- If selection not detected: ensure `getSelection()` is called correctly
- If focus lost: add `onMouseDown={(e) => e.preventDefault()}`
</action>

<acceptance_criteria>
- [ ] Align Left button works (text aligns left)
- [ ] Align Center button works (text centers)
- [ ] Align Right button works (text aligns right)
- [ ] Justify Full button works (text justifies)
- [ ] Alignment applies to entire paragraph where caret is placed
- [ ] Alignment applies to all selected paragraphs
- [ ] Alignment preserved after clicking elsewhere
</acceptance_criteria>

---

## Task 6: Fix Indent/Outdent

**Type:** execute

**Problem:** Increase Indent and Decrease Indent buttons not working

<read_first>
- `src/Editor/Indent.tsx` — Indent/outdent button component
- `src/Editor/StyleEngine.ts` — `applyIndent()` function
- `src/Editor/utils.tsx` — Selection utilities
</read_first>

<action>
1. Test indent/outdent buttons in browser:
   - Select text or place caret in paragraph
   - Click Increase Indent button
   - Check console for errors
   - Verify if paragraph padding/margin increases
   - Click Decrease Indent button
   - Verify if padding/margin decreases

2. Check `Indent.tsx` implementation:
   - Verify `handleClick()` calls `applyIndent()` function
   - Check if direction ('increase'/'decrease') is passed correctly
   - Add console logs to trace execution

3. Check `StyleEngine.ts` `applyIndent()` function:
   - Verify it gets selected blocks via `getSelectedBlocks()`
   - Verify it modifies `padding-left` or `margin-left` style
   - Add console logs to show blocks being indented

4. Check if selection is preserved:
   - After indent, selection should remain on same text
   - Check if `saveDo()` is called to add to undo history

**Fix approach:**
- If `applyIndent()` not called: fix button onClick handler
- If selection not detected: ensure `getSelectedBlocks()` works
- If style not applied: check CSS property being set (padding vs margin)
- If undo broken: ensure `saveDo()` called after operation
</action>

<acceptance_criteria>
- [ ] Increase Indent adds padding/margin to paragraph
- [ ] Decrease Indent removes padding/margin from paragraph
- [ ] Multiple clicks increase/decrease indent progressively
- [ ] Indent works on single paragraph with caret
- [ ] Indent works on multiple selected paragraphs
- [ ] Undo reverts indent changes
- [ ] List items can be indented/outdented
</acceptance_criteria>

</tasks>

<must_haves>
## Must-Haves for Goal Achievement

1. **Content editable unlocked:** User can type in editor at all times
2. **Selection works:** Cross-paragraph selection detected and used by all formatting operations
3. **Toolbar reactive:** All buttons update visual state based on caret position
4. **Text alignment works:** All justify buttons functional
5. **Indent/outdent works:** Paragraphs and list items can be indented
6. **No regressions:** Existing formatting functionality continues to work

</must_haves>

<truths>
## Contextual Truths

- Selection API uses `window.getSelection()` for light DOM content in Woby custom elements
- Toolbar buttons must use `selectionchange` event to update state
- `contenteditable` must be `"true"` for editor to accept input
- `onMouseDown={(e) => e.preventDefault()}` on toolbar buttons prevents focus theft

</truths>

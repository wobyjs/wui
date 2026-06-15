---
wave: 1
depends_on: []
files_modified:
  - src/Editor/Editor.tsx
  - src/Editor/StyleEngine.ts
autonomous: false
requirements_addressed: []
---

# Plan: Comprehensive Editor Regression Test

**Objective:** Test all formatting operations with every selection permutation (partial word, full word, partial paragraph, full paragraph, cross-paragraph) using browser automation

<goal_backwards>
## Goal-Backward Analysis

**Goal:** Verify all formatting operations work correctly with all selection scenarios

**Must-Haves:**
1. Bold/Italic/Underline work with all selection types
2. Font operations work with all selection types
3. Color operations work with all selection types
4. List operations work with all selection types
5. Alignment operations work with all selection types
6. Indent operations work with all selection types
7. Selection is preserved after every operation
8. Formatting is applied correctly to selected content

**Verification:**
- Test partial word selection + formatting
- Test full word selection + formatting
- Test partial paragraph selection + formatting
- Test full paragraph selection + formatting
- Test cross-paragraph selection + formatting
- Verify selection preserved after each operation
- Verify correct HTML structure after each operation

</goal_backwards>

<tasks>

## Task 1: Test Partial Word Selection + Formatting

**Type:** test

**Problem:** Need to verify formatting works when selecting part of a word

<action>
Using browser automation:

1. Navigate to http://localhost:5197/editor-demo.html
2. Activate editor (click to make contentEditable)
3. Find word "Welcome" in first paragraph
4. Select partial word: "Welc" (characters 0-4)
5. Test formatting:
   - Click Bold button
   - Verify selection preserved
   - Verify only "Welc" is bold
   - Click Italic button
   - Verify selection preserved
   - Verify "Welc" is now bold + italic
   - Click Underline button
   - Verify selection preserved
   - Verify "Welc" is now bold + italic + underline
6. Take screenshot of result
7. Log HTML structure

**Expected:**
- Selection preserved after each operation
- Formatting applied only to selected text
- Nested spans created correctly
</action>

<acceptance_criteria>
- [ ] Partial word selection works
- [ ] Bold applied to partial word
- [ ] Italic applied to partial word
- [ ] Underline applied to partial word
- [ ] Selection preserved after each operation
- [ ] HTML structure correct
</acceptance_criteria>

---

## Task 2: Test Full Word Selection + Formatting

**Type:** test

**Problem:** Need to verify formatting works when selecting complete word

<action>
Using browser automation:

1. Reload page to get clean state
2. Activate editor
3. Select complete word "Welcome" (characters 0-7)
4. Test formatting:
   - Click Bold button
   - Verify selection preserved
   - Verify entire word "Welcome" is bold
5. Select word "This" from second paragraph
6. Test formatting:
   - Click Italic button
   - Verify selection preserved
   - Verify "This" is italic
7. Select phrase "full toolbar demo"
8. Test formatting:
   - Click Bold button
   - Verify selection preserved
   - Verify entire phrase is bold

**Expected:**
- Selection preserved after each operation
- Formatting applied to entire selected text
- Clean span structure
</action>

<acceptance_criteria>
- [ ] Full word selection works
- [ ] Bold applied to full word
- [ ] Italic applied to full word
- [ ] Selection preserved
- [ ] HTML structure clean (no extra spans)
</acceptance_criteria>

---

## Task 3: Test Partial Paragraph Selection + Formatting

**Type:** test

**Problem:** Need to verify formatting works when selecting part of a paragraph

<action>
Using browser automation:

1. Reload page
2. Activate editor
3. Select partial paragraph: "Welcome to the WUI" (characters 0-17)
4. Test formatting:
   - Click Bold button
   - Verify selection preserved
   - Verify "Welcome to the WUI" is bold
5. Select different part: "Rich Text Editor!" (characters 18-35)
6. Test formatting:
   - Click Italic button
   - Verify selection preserved
   - Verify "Rich Text Editor!" is italic
7. Verify unformatted text remains unchanged

**Expected:**
- Selection preserved
- Multiple formatting regions in same paragraph
- No overlap or gaps
</action>

<acceptance_criteria>
- [ ] Partial paragraph selection works
- [ ] Multiple formatting regions created
- [ ] Selection preserved
- [ ] No formatting overlap
- [ ] Unformatted text unchanged
</acceptance_criteria>

---

## Task 4: Test Full Paragraph Selection + Formatting

**Type:** test

**Problem:** Need to verify formatting works when selecting entire paragraph

<action>
Using browser automation:

1. Reload page
2. Activate editor
3. Select entire first paragraph (triple-click or select all)
4. Test formatting:
   - Click Bold button
   - Verify selection preserved
   - Verify entire paragraph is bold
5. Select entire second paragraph
6. Test formatting:
   - Click Italic button
   - Click Underline button
   - Verify both applied to entire paragraph
7. Check HTML structure - should have single span wrapping entire paragraph content

**Expected:**
- Selection preserved
- Entire paragraph formatted
- Clean span structure
</action>

<acceptance_criteria>
- [ ] Full paragraph selection works
- [ ] Bold applied to entire paragraph
- [ ] Multiple formats applied correctly
- [ ] Selection preserved
- [ ] Clean HTML structure
</acceptance_criteria>

---

## Task 5: Test Cross-Paragraph Selection + Formatting

**Type:** test

**Problem:** Need to verify formatting works when selecting across multiple paragraphs

<action>
Using browser automation:

1. Reload page
2. Activate editor
3. Select from "WUI" (end of first paragraph) to "This is a" (start of second paragraph)
   - Should span across the paragraph boundary
4. Test formatting:
   - Click Bold button
   - Verify selection preserved
   - Verify both paragraphs have partial bold
5. Select from middle of first paragraph to middle of third paragraph
   - Should span 3 paragraphs
6. Test formatting:
   - Click Italic button
   - Verify selection preserved
   - Verify all 3 paragraphs have italic applied to selected portions

**Expected:**
- Selection preserved across paragraph boundaries
- Formatting applied to all selected content
- Paragraph boundaries respected
</action>

<acceptance_criteria>
- [ ] Cross-paragraph selection works
- [ ] Bold applied across paragraphs
- [ ] Italic applied across paragraphs
- [ ] Selection preserved
- [ ] Paragraph boundaries intact
- [ ] No content loss or corruption
</acceptance_criteria>

---

## Task 6: Test Font Operations with All Selection Types

**Type:** test

**Problem:** Need to verify font family and size work with all selection permutations

<action>
Using browser automation:

1. Test partial word:
   - Select "Welc" from "Welcome"
   - Change font family to "Courier New"
   - Verify selection preserved
   - Verify only "Welc" has new font

2. Test full word:
   - Select "Welcome"
   - Change font size to 24
   - Verify selection preserved
   - Verify entire word has new size

3. Test partial paragraph:
   - Select "Welcome to the WUI"
   - Change font family
   - Verify selection preserved
   - Verify correct portion has new font

4. Test full paragraph:
   - Select entire paragraph
   - Change font size
   - Verify selection preserved
   - Verify entire paragraph has new size

**Expected:**
- All font operations work with all selection types
- Selection preserved
- Correct HTML structure
</action>

<acceptance_criteria>
- [ ] Font family works with partial word
- [ ] Font size works with full word
- [ ] Font operations work with partial paragraph
- [ ] Font operations work with full paragraph
- [ ] Selection preserved for all operations
</acceptance_criteria>

---

## Task 7: Test Color Operations with All Selection Types

**Type:** test

**Problem:** Need to verify text color and background color work with all selection permutations

<action>
Using browser automation:

1. Test partial word:
   - Select "Welc"
   - Apply text color (red)
   - Verify selection preserved
   - Verify only "Welc" is red

2. Test full word:
   - Select "Welcome"
   - Apply background color (yellow)
   - Verify selection preserved
   - Verify entire word has yellow background

3. Test partial paragraph:
   - Select "Welcome to the WUI"
   - Apply both text color and background color
   - Verify selection preserved
   - Verify both colors applied

4. Test cross-paragraph:
   - Select across 2 paragraphs
   - Apply text color
   - Verify selection preserved
   - Verify color applied to all selected content

**Expected:**
- All color operations work with all selection types
- Selection preserved
- Colors applied correctly
</action>

<acceptance_criteria>
- [ ] Text color works with partial word
- [ ] Background color works with full word
- [ ] Both colors work with partial paragraph
- [ ] Colors work with cross-paragraph selection
- [ ] Selection preserved for all operations
</acceptance_criteria>

---

## Task 8: Test List Operations with All Selection Types

**Type:** test

**Problem:** Need to verify list creation works with different selection types

<action>
Using browser automation:

1. Test single paragraph:
   - Place cursor in first paragraph (no selection)
   - Click Bullet List button
   - Verify paragraph converted to list item

2. Test full paragraph selection:
   - Select entire second paragraph
   - Click Numbered List button
   - Verify paragraph converted to numbered list item

3. Test cross-paragraph selection:
   - Select paragraphs 3 and 4
   - Click Bullet List button
   - Verify both paragraphs converted to list items

4. Test toggle off:
   - Select a list item
   - Click Bullet List button again
   - Verify list item converted back to paragraph

**Expected:**
- List operations work with all selection types
- Selection preserved
- Correct list structure created
</action>

<acceptance_criteria>
- [ ] List works with cursor (no selection)
- [ ] List works with full paragraph selection
- [ ] List works with cross-paragraph selection
- [ ] List toggle works
- [ ] Selection preserved
- [ ] Correct HTML structure
</acceptance_criteria>

---

## Task 9: Test Alignment Operations with All Selection Types

**Type:** test

**Problem:** Need to verify alignment works with different selection types

<action>
Using browser automation:

1. Test cursor in paragraph:
   - Place cursor in first paragraph
   - Click Align Center button
   - Verify paragraph centered

2. Test full paragraph selection:
   - Select entire second paragraph
   - Click Align Right button
   - Verify paragraph right-aligned

3. Test cross-paragraph selection:
   - Select paragraphs 3 and 4
   - Click Align Center button
   - Verify both paragraphs centered

**Expected:**
- Alignment works with all selection types
- Selection preserved
- Correct text-align style applied
</action>

<acceptance_criteria>
- [ ] Alignment works with cursor
- [ ] Alignment works with full paragraph
- [ ] Alignment works with cross-paragraph
- [ ] Selection preserved
- [ ] Correct text-align applied
</acceptance_criteria>

---

## Task 10: Test Indent Operations with All Selection Types

**Type:** test

**Problem:** Need to verify indent/outdent works with different selection types

<action>
Using browser automation:

1. Test cursor in paragraph:
   - Place cursor in first paragraph
   - Click Increase Indent button
   - Verify text-indent applied
   - Verify value is 20px

2. Test multiple indent:
   - Click Increase Indent again
   - Verify indent increased to 40px

3. Test outdent:
   - Click Decrease Indent button
   - Verify indent decreased to 20px

4. Test cross-paragraph:
   - Select paragraphs 2 and 3
   - Click Increase Indent
   - Verify both paragraphs indented

**Expected:**
- Indent works with all selection types
- Multiple indent levels work
- Outdent works correctly
- Selection preserved
</action>

<acceptance_criteria>
- [ ] Indent works with cursor
- [ ] Multiple indent levels work
- [ ] Outdent works
- [ ] Indent works with cross-paragraph
- [ ] Selection preserved
- [ ] Correct text-indent values
</acceptance_criteria>

---

## Task 11: Comprehensive Regression Test

**Type:** test

**Problem:** Run full test suite and document all results

<action>
Using browser automation:

1. Execute all tasks 1-10 in sequence
2. Document all results
3. Capture screenshots of issues
4. Log console errors
5. Verify no regressions in previously working features

Create detailed report with:
- Test name
- Selection type tested
- Operation tested
- Pass/Fail status
- Selection preserved (Yes/No)
- HTML structure correct (Yes/No)
- Any errors or issues

**Expected:**
- All tests pass
- No regressions
- All operations work with all selection types
</action>

<acceptance_criteria>
- [ ] All 10 test categories executed
- [ ] Results documented
- [ ] No critical failures
- [ ] No regressions detected
- [ ] Comprehensive report created
</acceptance_criteria>

</tasks>

<must_haves>
## Must-Haves for Goal Achievement

1. **All formatting operations tested:** Bold, Italic, Underline, Font, Color, List, Align, Indent
2. **All selection types tested:** Partial word, Full word, Partial paragraph, Full paragraph, Cross-paragraph
3. **Selection preservation verified:** After every operation
4. **HTML structure verified:** Correct nesting, no extra spans, no content loss
5. **No regressions:** Previously working features still work

</must_haves>

<truths>
## Contextual Truths

- Browser automation testing via Chrome DevTools MCP
- Selection must be preserved after every operation
- Light DOM → Shadow DOM sync must handle selection correctly
- All formatting uses StyleEngine with DOM manipulation
- HTML structure must be clean and normalized

</truths>

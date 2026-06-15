---
name: comprehensive-editor-testing-plan
description: Comprehensive permutation testing plan for ALL editor buttons with format/unformat combinations
metadata:
  type: project
---

# Comprehensive Editor Button Testing Plan

**Goal**: Test ALL buttons with complete permutations of:
- **Selection types**: (full/partial/none)
- **Text units**: (word/sentence/paragraph)
- **Position states**: (selection/caret)
- **Operations**: (format/unformat) per test
- **Format combinations**: Bold→Italic→Underline→Indent→Outdent→etc. in ANY order/combination

**CRITICAL**: Do NOT test 1 format pass and report OK. Test COMBINATIONS of formatting.

---

## Testing Groups

### Group 1: Inline Styles (StyleEngine-based)
**Buttons**: Bold, Italic, Underline, Strikethrough, Font Family, Font Size, Text Color, Text Background

**Test Matrix**:
1. Single format toggles (format → unformat)
2. Sequential combinations (Bold→Italic→Underline → Bold→Italic→Underline toggle off)
3. Random permutations (Italic→Bold→Underline→Italic→Bold)
4. Mixed with selection changes (Bold partial → select full → unformat Bold)
5. Mixed with caret position (Bold at caret → move caret → Bold toggle)

### Group 2: Block-Level Formatting
**Buttons**: Text Format (Normal, H1, H2, H3, Quote, Code Block), Text Align (Left/Center/Right/Justify), Indent/Outdent

**Test Matrix**:
1. Block format toggles (H1→Normal, Quote→H2)
2. Block + inline combinations (Bold inside H1, unformat Bold)
3. Text align + inline (Center + Bold, toggle Bold)
4. Indent sequences (Indent 3x → Outdent 2x → Indent 1x)
5. Block format changes with partial selection

### Group 3: List Formatting
**Buttons**: Bullet List, Numbered List

**Test Matrix**:
1. List creation (P→UL, P→OL)
2. List toggle off (UL→P, OL→P)
3. List switch (UL→OL, OL→UL)
4. List + inline (Bold in LI, unformat Bold)
5. Partial list selection (select 2 items → Bold → toggle Bold)
6. Nested structures (Indent inside LI)

---

## Testing Protocol for Each Test

For EVERY test permutation, verify:

1. **DOM correctness**:
   - HTML structure matches expected (e.g., `<span style="font-weight: bold;">text</span>`)
   - No nested duplicate spans (e.g., `<span style="font-weight: bold;"><span style="font-weight: bold;">text</span></span>`)
   - No empty spans left behind
   - No orphaned text nodes

2. **Selection preservation**:
   - After format/unformat, selection should remain
   - Caret should stay visible
   - Range boundaries should match original (or expanded to word)

3. **Toggle behavior**:
   - Format button toggles ON (applies style)
   - Same button toggles OFF (removes style)
   - No stacking of duplicate styles

4. **Combination behavior**:
   - Sequential formats work (Bold→Italic→Underline)
   - Sequential unformats work (Underline→Italic→Bold toggle off)
   - Random permutations work (Italic→Bold→Underline→Italic→Bold)
   - Unformat doesn't affect other styles (Bold+Italic, toggle Bold → still has Italic)

---

## Test Execution Strategy

### Phase 1: Warmup (Simple Tests)
- Test Bold, Italic, Underline individually (format/unformat)
- Verify toggle logic works

### Phase 2: Inline Combinations
- Test all 8 inline style buttons in permutations
- 3-format combinations (Bold+Italic+Underline)
- 4-format combinations (Bold+Italic+Underline+Strikethrough)
- 5+ format combinations (add Font Family, Font Size)

### Phase 3: Block Combinations
- Test block-level formatting
- Block + inline combinations
- Text align + inline
- Indent sequences

### Phase 4: List Combinations
- Test list creation/toggle
- List + inline
- List + block
- Partial selection in lists

### Phase 5: Stress Testing
- Rapid toggling (format/unformat repeatedly)
- Selection changes during formats (format partial → select full → unformat)
- Complex nested structures (H1 with Bold+Italic+Underline inside Quote)

---

## agent-browser Testing Workflow

```bash
# Start browser session
agent-browser --session editor-test open --headed http://localhost:5173/#editor

# For each test:
# 1. Clear editor
# 2. Type test text
# 3. Apply formats in sequence
# 4. Check HTML output
# 5. Apply unformats in sequence
# 6. Check HTML output again
# 7. Verify no nested duplicates
# 8. Verify selection preserved

# After all tests:
agent-browser --session editor-test close
```

---

## Expected Results

**Working buttons** (from test report):
- Bold ✅
- Italic ✅
- Underline ✅
- Font Size ✅
- Text Color ✅
- Text Background ✅
- Indent/Outdent ✅
- Alignment ✅

**Fixed buttons** (after fixes):
- Font Family ✅ (fixed applyFontFamily call)
- List ✅ (removed unreachable code in insertList)

**Buttons to check**:
- Strikethrough ⚠️ (uses deprecated <strike> tag, should use StyleEngine)
- Subscript ❓ (not tested yet)
- Superscript ❓ (not tested yet)

---

## How to Apply
- Run Phase 1-5 in sequence
- Document all failures with:
  - Test permutation name
  - Expected HTML
  - Actual HTML
  - Selection state
  - Error description
- Fix failures before moving to next phase
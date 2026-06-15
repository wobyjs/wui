---
name: editor-testing-debugging
description: Systematically test and debug all editor formatting functions
phase: editor-debug
wave: 1
depends_on: []
autonomous: false
files_modified:
  - src/Editor/TextFormatDropDown.tsx
  - src/Editor/FontFamilyDropDown.tsx
  - src/Editor/InsertDropDown.tsx
  - src/Editor/TextAlignDropDown.tsx
---

## Objective

Fix all editor formatting buttons - dropdowns don't open, selection not preserved after first format.

## Background

Testing with agent-browser revealed:
- Bold/Italic/Underline work but Bold loses selection after first click
- All dropdowns (TextFormat, FontFamily, Insert, TextAlign) fail to open due to click propagation bug

## Tasks

### Task 1: Fix Dropdown Opening Bug

**read_first:**
- src/Editor/TextFormatDropDown.tsx
- src/Editor/FontFamilyDropDown.tsx
- src/Editor/InsertDropDown.tsx

**action:**
The arrow icon's `onClick={toggleDropdown}` is nested inside the main button's click area. The main button's `handleApplyCurrent` calls `e.stopPropagation()` which prevents the arrow click from reaching the toggle handler.

Fix by moving the dropdown toggle button outside the format-apply button, or by making the button content handle toggle when clicking the dropdown icon specifically. The simplest fix: create a separate small button for the dropdown arrow that doesn't have propagation stopping.

**acceptance_criteria:**
- TextFormatDropDown opens and shows: Normal, Heading 1-3, Quote, Code Block
- FontFamilyDropDown opens and shows font options
- InsertDropDown opens and shows insert options
- TextAlignDropDown opens and shows alignment options

### Task 2: Verify Selection Preservation

**read_first:**
- src/Editor/StyleEngine.ts

**action:**
After fixing dropdowns, verify selection is preserved when applying formats. Test with agent-browser:
1. Select "Welcome" in the demo
2. Click Bold → selection should remain
3. Click Italic → selection should remain
4. Click Underline → selection should remain

If selection is lost after Bold, check StyleEngine's restoreSelection() function - it should be called after every applyStyle() operation.

**acceptance_criteria:**
- Selection preserved after applying any single format
- Multiple formats can be applied sequentially without re-selecting
- Test: Bold → Italic → Underline all applied to same text

### Task 3: Test Block Formatting (Normal/Heading/Quote/Code Block)

**read_first:**
- src/Editor/TextFormatDropDown.tsx
- src/Editor/StyleEngine.ts

**action:**
With dropdowns now working, test block formatting:
1. Select a paragraph or place cursor
2. Open TextFormatDropDown
3. Select "Heading 1" - paragraph should become `<h1>` with class "text-3xl font-bold mb-4"
4. Test all options: Normal, Heading 2, Heading 3, Quote, Code Block

**acceptance_criteria:**
- Text becomes `<h1>` with correct class when Heading 1 selected
- Text becomes `<h2>` with correct class when Heading 2 selected
- Text becomes `<blockquote>` with correct classes when Quote selected
- Text becomes `<pre>` with correct class when Code Block selected
- Text returns to `<p>` when Normal selected

### Task 4: Test Font Family Selection

**read_first:**
- src/Editor/FontFamilyDropDown.tsx
- src/Editor/StyleEngine.ts

**action:**
Test font family changes:
1. Select text
2. Open FontFamilyDropDown
3. Select "Times New Roman"
4. Verify span has `style="font-family: 'Times New Roman'"`

**acceptance_criteria:**
- Selected text wrapped in span with font-family style
- Multiple font families can be selected from dropdown
- Selection preserved after font change

### Task 5: Test Text Alignment

**read_first:**
- src/Editor/TextAlignDropDown.tsx
- src/Editor/AlignButton.tsx
- src/Editor/StyleEngine.ts

**action:**
Test text alignment buttons:
1. Place cursor in paragraph
2. Click alignment buttons (Left, Center, Right, Justify)
3. Verify block element has correct `text-align` style

**acceptance_criteria:**
- Left alignment applies `text-align: left` to block
- Center alignment applies `text-align: center` to block
- Right alignment applies `text-align: right` to block
- Justify applies `text-align: justify` to block

### Task 6: Visual Verification with agent-browser

**action:**
Run comprehensive test with agent-browser session:
1. Open http://localhost:5179/editor-demo.html
2. Click editor to enable toolbar
3. Test all 20 buttons systematically
4. Document results in EDITOR_TESTING_REPORT.md

**acceptance_criteria:**
- All 20 toolbar buttons documented
- Working buttons marked ✅
- Broken buttons marked ❌ with bug description
- Screenshots captured for any visual issues

---

## Verification

Run: `agent-browser --session editor-final open --headed http://localhost:5179/editor-demo.html`

Test script:
```javascript
// Test all formatting in sequence
// Bold → Italic → Underline → Font Size → Font Family → Text Format → Text Align
```

Expected: All formats apply without losing selection between operations.

---

## must_haves

1. All 4 dropdowns (TextFormat, FontFamily, Insert, TextAlign) open on click
2. Selection preserved after applying any single format
3. Multiple formats can be applied in sequence without re-selecting
4. Block formatting (Normal/Heading/Quote/Code) converts elements correctly
5. Text alignment applies to block elements correctly
6. Visual test verification passes for all 20 toolbar buttons
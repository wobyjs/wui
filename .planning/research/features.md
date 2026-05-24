# Rich Text Editor Feature Landscape

**Domain:** Production-ready rich text editor
**Researched:** 2026-05-25
**Goal:** Match Lexical/Google Docs capabilities with ALL interaction scenarios

---

## Executive Summary

This document catalogs the complete feature set required for a production-grade rich text editor matching industry standards (Lexical, Quill, ProseMirror, Google Docs). Features are prioritized by necessity and include implementation complexity ratings, dependencies, and testing scenarios.

**Current Implementation Status:** The wui editor already implements core formatting (bold/italic/underline), basic lists, font controls, colors, alignment, indentation, tables, images, and undo/redo. Significant gaps remain in advanced features, edge case handling, and interaction polish.

---

## Table of Contents

1. [Formatting Features](#formatting-features)
2. [Insertion Features](#insertion-features)
3. [Interaction Patterns](#interaction-patterns)
4. [Advanced Features](#advanced-features)
5. [Edge Cases & Edge Scenarios](#edge-cases--edge-scenarios)
6. [Feature Dependencies](#feature-dependencies)
7. [Implementation Priority Matrix](#implementation-priority-matrix)

---

## Formatting Features

### Tier 1: Table Stakes (Missing = Incomplete)

These features are expected in any modern editor. Users will notice immediately if they're absent.

#### Text Styling

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Bold** | ✅ Implemented | Low | None | Toggle on/off, keyboard shortcut (Ctrl+B), cross-paragraph selection, nested with italic/underline |
| **Italic** | ✅ Implemented | Low | None | Toggle on/off, keyboard shortcut (Ctrl+I), cross-paragraph selection |
| **Underline** | ✅ Implemented | Low | None | Toggle on/off, keyboard shortcut (Ctrl+U), cross-paragraph selection |
| **Strikethrough** | ❌ Missing | Low | None | Toggle on/off, keyboard shortcut (Alt+Shift+5), cross-paragraph selection |
| **Superscript** | ❌ Missing | Medium | Font size control | Toggle on/off, keyboard shortcut (Ctrl+.), mixed with normal text |
| **Subscript** | ❌ Missing | Medium | Font size control | Toggle on/off, keyboard shortcut (Ctrl+,), mixed with normal text |
| **Code (inline)** | ❌ Missing | Medium | Monospace font | Toggle on/off, keyboard shortcut (Ctrl+`), mixed content |
| **Highlight/Mark** | ❌ Missing | Medium | Background color picker | Toggle on/off, multiple colors, cross-paragraph |

#### Font Controls

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Font Family** | ✅ Implemented | Medium | Font dropdown | Apply to selection, multiple fonts in document |
| **Font Size** | ✅ Implemented | Medium | Size dropdown/input | Apply to selection, keyboard shortcuts (Ctrl+Shift+./,), mixed sizes |
| **Text Color** | ✅ Implemented | Medium | Color picker | Apply to selection, recent colors, custom colors |
| **Background Color** | ✅ Implemented | Medium | Color picker | Apply to selection, distinct from highlight/mark |

#### Paragraph Structure

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Headings (H1-H6)** | ✅ Implemented | Medium | Format dropdown | Keyboard shortcuts (Ctrl+Alt+1-6), toggle to normal, nesting |
| **Paragraph** | ✅ Implemented | Low | None | Default block, convert from other blocks |
| **Blockquote** | ✅ Implemented | Low | None | Toggle on/off, nested quotes, keyboard shortcut |
| **Code Block** | ❌ Missing | High | Syntax highlighting | Multi-line code, language selection, copy button |
| **Preformatted** | ❌ Missing | Low | Monospace font | Preserve whitespace, prevent auto-format |

#### Alignment & Indentation

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Left Align** | ✅ Implemented | Low | None | Keyboard shortcut (Ctrl+Shift+L) |
| **Center Align** | ✅ Implemented | Low | None | Keyboard shortcut (Ctrl+Shift+E) |
| **Right Align** | ✅ Implemented | Low | None | Keyboard shortcut (Ctrl+Shift+R) |
| **Justify** | ✅ Implemented | Low | None | Full justification, hyphenation |
| **Increase Indent** | ✅ Implemented | Low | None | Keyboard shortcut (Ctrl+]), nested indentation |
| **Decrease Indent** | ✅ Implemented | Low | None | Keyboard shortcut (Ctrl+[), minimum level enforcement |
| **Tab Indent** | ✅ Implemented | Medium | Indent logic | Tab key in text, Shift+Tab to outdent, in lists (nesting) |

#### Lists

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Bullet List** | ✅ Implemented | High | List service | Toggle on/off, keyboard shortcut (Ctrl+Shift+8), nested lists, mixed with paragraphs |
| **Numbered List** | ✅ Implemented | High | List service | Toggle on/off, keyboard shortcut (Ctrl+Shift+7), start number, nested lists |
| **Checklist** | ✅ Implemented | High | Checkbox component | Toggle on/off, interactive checkboxes, convert to/from other lists |
| **List Merging** | ✅ Implemented | High | List service | Merge adjacent same-type lists, cross-list selection |
| **List Splitting** | ⚠️ Partial | High | List service | Split list with paragraph, partial selection conversion |
| **Nested Lists** | ⚠️ Partial | Very High | List service | Mixed nesting (bullet inside numbered), unlimited depth, Tab to nest |
| **List Styling** | ✅ Implemented | Medium | CSS classes | Custom bullets, indented markers, RTL support |

### Tier 2: Professional Features (Expected in Serious Editors)

These features distinguish production editors from demos.

#### Advanced Formatting

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Clear Formatting** | ❌ Missing | Medium | Style removal logic | Keyboard shortcut (Ctrl+\\), remove all styles, preserve structure |
| **Copy Formatting** | ❌ Missing | High | Style state management | Keyboard shortcut (Ctrl+Shift+C/V), format painter UI |
| **Text Direction** | ❌ Missing | Medium | RTL support | LTR/RTL toggle, per-paragraph, mixed direction |
| **Line Height** | ❌ Missing | Low | CSS control | Dropdown/preset, per-paragraph |
| **Letter Spacing** | ❌ Missing | Low | CSS control | Dropdown/preset |
| **Capitalization** | ❌ Missing | Low | Text transform | Uppercase, lowercase, title case, sentence case |

#### Links & References

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Insert Link** | ⚠️ Basic | Medium | Link dialog | Keyboard shortcut (Ctrl+K), URL input, text display |
| **Edit Link** | ❌ Missing | Medium | Link dialog | Click to edit, context menu, keyboard navigation |
| **Remove Link** | ❌ Missing | Low | Selection logic | Unlink button, preserve text |
| **Link Tooltip** | ❌ Missing | Medium | Tooltip component | Hover preview, click to follow |
| **Auto-link URLs** | ❌ Missing | High | URL detection | Type URL, auto-convert on space/enter |
| **Link Validation** | ❌ Missing | Medium | URL validation | Visual feedback for broken links |

---

## Insertion Features

### Tier 1: Essential Inserts

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Image (URL)** | ✅ Implemented | Medium | Image dialog | Prompt for URL, insert at cursor |
| **Image (Upload)** | ❌ Missing | High | File API, backend | Drag & drop, file picker, progress indicator, preview |
| **Image Resize** | ❌ Missing | Medium | Resize handles | Drag handles, aspect ratio lock, dimension input |
| **Image Alignment** | ❌ Missing | Medium | Float/flexbox | Left, center, right, inline vs block |
| **Image Caption** | ❌ Missing | Medium | Figure/figcaption | Editable caption below image |
| **Horizontal Rule** | ✅ Implemented | Low | None | Insert at cursor, keyboard shortcut |
| **Table** | ✅ Implemented | High | Table service | Insert dialog, default size, basic styling |
| **Table Cell Navigation** | ✅ Implemented | Medium | Cell selection | Tab between cells, Shift+Tab reverse |
| **Table Cell Selection** | ⚠️ Partial | High | Selection logic | Click-drag multiple cells, select row/column |
| **Table Cell Merge** | ❌ Missing | Very High | Merge logic | Select cells, merge/split, colspan/rowspan |
| **Table Resize** | ❌ Missing | High | Resize handles | Column width, row height, uniform distribution |
| **Table Delete** | ❌ Missing | Medium | Context menu | Delete row/column/table |

### Tier 2: Advanced Inserts

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Emoji Picker** | ❌ Missing | Medium | Emoji dataset | Emoji palette, search, recent emojis, skin tones |
| **Special Characters** | ❌ Missing | Medium | Character map | Symbol picker, search, categories (math, arrows, etc.) |
| **Page Break** | ❌ Missing | Low | Print styling | Insert break, print preview |
| **Date/Time** | ❌ Missing | Low | Date picker | Insert current, format options |
| **Bookmark/Anchor** | ❌ Missing | Medium | ID management | Insert anchor, link to anchor |
| **Footnote** | ❌ Missing | High | Numbering system | Insert footnote, auto-number, jump to reference |
| **Video Embed** | ❌ Missing | Medium | iframe/oEmbed | YouTube, Vimeo, responsive sizing |
| **Social Embeds** | ❌ Missing | High | oEmbed API | Twitter/X, Instagram, embed codes |
| **File Attachment** | ❌ Missing | High | File API | Upload, download link, file type icons |
| **Divider Styles** | ⚠️ Partial | Low | CSS variants | Solid, dashed, dotted, custom |

---

## Interaction Patterns

### Mouse/Pointer Interactions

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Click to Edit** | ✅ Implemented | Low | None | Click to focus, cursor position |
| **Double-click Selection** | ✅ Browser default | Low | None | Word selection, extend by dragging |
| **Triple-click Selection** | ✅ Browser default | Low | None | Paragraph selection |
| **Right-click Context Menu** | ❌ Missing | High | Context menu | Cut, copy, paste, formatting options, link actions |
| **Selection Toolbar** | ❌ Missing | Very High | Floating toolbar | Appears on text selection, quick formatting |
| **Drag & Drop Text** | ✅ Browser default | Low | None | Drag selected text, drop to move |
| **Drag & Drop Files** | ❌ Missing | High | File API | Drag image into editor, upload indicator |
| **Image Drag Resize** | ❌ Missing | High | Resize handles | Drag corners, aspect ratio |
| **Click Outside to Deselect** | ✅ Implemented | Medium | Blur handling | Click outside editor, toolbar persists |

### Keyboard Navigation

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Arrow Key Navigation** | ✅ Browser default | Low | None | Move cursor, select with Shift |
| **Home/End Navigation** | ✅ Browser default | Low | None | Line start/end, document with Ctrl |
| **Page Up/Down** | ✅ Browser default | Low | None | Scroll by page |
| **Tab Navigation** | ✅ Implemented | Medium | Tab handling | Indent text, navigate tables, focus trap |
| **Enter Key Handling** | ✅ Implemented | Medium | Paragraph logic | New paragraph, exit list, split block |
| **Shift+Enter** | ✅ Browser default | Low | None | Line break within paragraph |
| **Backspace/Delete** | ✅ Browser default | Low | None | Delete character, merge blocks |
| **Ctrl+A Select All** | ✅ Browser default | Low | None | Select entire document |
| **Escape to Exit** | ❌ Missing | Low | Focus management | Exit table, clear selection, close dialog |

### Keyboard Shortcuts

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Undo** | ✅ Implemented | Medium | History stack | Ctrl+Z, multiple levels, visual feedback |
| **Redo** | ✅ Implemented | Medium | History stack | Ctrl+Y or Ctrl+Shift+Z |
| **Bold** | ✅ Implemented | Low | None | Ctrl+B, toggle |
| **Italic** | ✅ Implemented | Low | None | Ctrl+I, toggle |
| **Underline** | ✅ Implemented | Low | None | Ctrl+U, toggle |
| **Strikethrough** | ❌ Missing | Low | None | Alt+Shift+5, toggle |
| **Link** | ⚠️ Partial | Medium | Link dialog | Ctrl+K, open dialog |
| **Find** | ❌ Missing | High | Find dialog | Ctrl+F, search UI |
| **Find & Replace** | ❌ Missing | High | Replace dialog | Ctrl+H, replace/replace all |
| **Print** | ❌ Missing | Low | Print API | Ctrl+P |
| **Save** | ❌ Missing | Medium | Save API | Ctrl+S, autosave toggle |

### Touch Events (Mobile)

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Touch Selection** | ✅ Browser default | Medium | None | Touch to place cursor, drag handles |
| **Long Press Context Menu** | ❌ Missing | High | Touch context menu | Show formatting options |
| **Touch Toolbar** | ❌ Missing | Very High | Mobile toolbar | Responsive toolbar, simplified controls |
| **Pinch to Zoom** | ✅ Browser default | Low | None | Zoom editor content |
| **Swipe Gestures** | ❌ Missing | High | Gesture detection | Swipe to delete, undo/redo gestures |
| **Virtual Keyboard Handling** | ⚠️ Partial | High | Viewport API | Toolbar stays visible, scroll to cursor |

### Clipboard Operations

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Copy** | ✅ Browser default | Low | None | Ctrl+C, preserve formatting |
| **Cut** | ✅ Browser default | Low | None | Ctrl+X |
| **Paste** | ✅ Browser default | Medium | Clipboard API | Ctrl+V, preserve formatting |
| **Paste Plain Text** | ❌ Missing | Medium | Clipboard API | Ctrl+Shift+V, strip formatting |
| **Paste from Word** | ❌ Missing | Very High | HTML cleaning | Detect Word HTML, clean styles |
| **Paste Image** | ❌ Missing | High | Clipboard API | Paste from clipboard, upload |
| **Copy/Paste Table** | ⚠️ Partial | High | Table serialization | Preserve structure, cross-editor |

---

## Advanced Features

### Find & Replace

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Find Text** | ❌ Missing | High | Search logic | Find dialog, highlight matches, next/prev |
| **Replace Text** | ❌ Missing | High | Replace logic | Replace/replace all, match count |
| **Match Case** | ❌ Missing | Medium | Search options | Toggle case sensitivity |
| **Match Whole Word** | ❌ Missing | Medium | Search options | Toggle whole word match |
| **Regex Search** | ❌ Missing | High | Regex engine | Pattern matching, capture groups |
| **Search in Selection** | ❌ Missing | Medium | Selection logic | Limit search to selected text |

### Spell Check & Grammar

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Browser Spell Check** | ✅ Browser default | Low | None | Enabled by default, right-click suggestions |
| **Custom Dictionary** | ❌ Missing | High | Dictionary API | Add/remove words, user dictionary |
| **Grammar Check** | ❌ Missing | Very High | Grammar API | Integrate with service (Grammarly, etc.) |
| **Spell Check Toggle** | ❌ Missing | Low | Attribute toggle | Enable/disable per editor |

### Autosave & Recovery

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Autosave** | ❌ Missing | Medium | Debounce, storage API | Auto-save to localStorage, interval |
| **Draft Recovery** | ❌ Missing | High | Storage API | Recover unsaved content on reload |
| **Version History** | ❌ Missing | Very High | History API | Save snapshots, restore previous |
| **Conflict Resolution** | ❌ Missing | Very High | CRDT/OT | Handle concurrent edits |

### Document Statistics

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Word Count** | ❌ Missing | Medium | Count logic | Display in UI, update live |
| **Character Count** | ❌ Missing | Low | Count logic | With/without spaces |
| **Paragraph Count** | ❌ Missing | Low | Count logic | Block-level count |
| **Reading Time** | ❌ Missing | Medium | Estimation logic | Based on word count |
| **Page Count** | ❌ Missing | High | Print estimation | Approximate page count |

### Fullscreen Mode

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Fullscreen Toggle** | ❌ Missing | Medium | Fullscreen API | Toggle button, keyboard shortcut (F11) |
| **Zen Mode** | ❌ Missing | Medium | UI hiding | Hide toolbar, distraction-free |

### Export & Import

| Feature | Status | Complexity | Dependencies | Testing Scenarios |
|---------|--------|------------|--------------|-------------------|
| **Export HTML** | ⚠️ Implicit | Low | innerHTML | Get content as HTML |
| **Export Markdown** | ❌ Missing | High | Markdown converter | Convert to .md |
| **Export PDF** | ❌ Missing | Very High | Print/PDF API | Generate PDF file |
| **Export DOCX** | ❌ Missing | Very High | docx library | Generate Word document |
| **Import HTML** | ⚠️ Implicit | Low | innerHTML | Paste HTML content |
| **Import Markdown** | ❌ Missing | High | Markdown parser | Convert .md to HTML |

---

## Edge Cases & Edge Scenarios

### Selection Edge Cases

| Scenario | Status | Complexity | Testing Approach |
|----------|--------|------------|------------------|
| **Empty Editor** | ✅ Handled | Medium | Force default `<p><br></p>` structure |
| **Cross-paragraph Selection** | ✅ Handled | High | Select across multiple blocks, apply formatting |
| **Partial Word Selection** | ✅ Handled | Medium | Format part of word, preserve rest |
| **Selection Across Lists** | ⚠️ Partial | Very High | Select list items + paragraphs, convert together |
| **Selection Inside Table** | ⚠️ Partial | Very High | Cell selection, navigation, formatting |
| **Collapsed Selection (Cursor)** | ✅ Handled | Medium | Apply style to current word or insert styled |
| **All Document Selection** | ✅ Handled | Low | Select all, apply/remove formatting |
| **Selection with Images** | ❌ Missing | High | Select image + text, delete, move |
| **Selection with Nested Structures** | ⚠️ Partial | Very High | Nested lists, quotes in lists |

### Content Edge Cases

| Scenario | Status | Complexity | Testing Approach |
|----------|--------|------------|------------------|
| **Empty Lines** | ✅ Handled | Medium | Multiple `<p><br></p>`, cursor navigation |
| **Whitespace Preservation** | ⚠️ Browser default | Medium | Multiple spaces, non-breaking spaces |
| **Mixed Content (Text + Inline Elements)** | ✅ Handled | High | Text + bold + link + image inline |
| **Deeply Nested Styles** | ⚠️ Partial | Very High | Bold inside italic inside underline, conflicts |
| **Invalid HTML Cleanup** | ❌ Missing | High | Sanitize pasted content, remove invalid nesting |
| **Large Documents (10k+ words)** | ⚠️ Unknown | Very High | Performance testing, virtual scrolling |
| **Unicode & Emoji** | ✅ Handled | Low | Render correctly, cursor positioning |
| **RTL Text** | ❌ Missing | High | Arabic, Hebrew, bidirectional |
| **Copy-Paste from External Sources** | ⚠️ Browser default | Very High | Word, Google Docs, websites, clean HTML |

### Interaction Edge Cases

| Scenario | Status | Complexity | Testing Approach |
|----------|--------|------------|------------------|
| **Rapid Typing** | ✅ Handled | Medium | MutationObserver throttling, undo stack |
| **Rapid Formatting Toggles** | ⚠️ Partial | High | Toggle bold on/off quickly, state consistency |
| **Keyboard Shortcut Conflicts** | ⚠️ Partial | Medium | Browser shortcuts vs editor shortcuts, prevent default |
| **Focus Loss During Edit** | ✅ Handled | Medium | Toolbar click, dialogs, restore selection |
| **Undo Across Complex Operations** | ⚠️ Partial | Very High | Undo table insertion, list conversion, multi-step |
| **Redo After Manual Edit** | ✅ Handled | High | Clear redo stack on new input |
| **Multiple Editors on Page** | ⚠️ Unknown | Medium | Multiple instances, isolated state |
| **Editor Inside Modal/Shadow DOM** | ✅ Handled | High | Selection handling, event propagation |
| **Mobile Virtual Keyboard** | ⚠️ Partial | Very High | Viewport resizing, cursor visibility |

### List-Specific Edge Cases

| Scenario | Status | Complexity | Testing Approach |
|----------|--------|------------|------------------|
| **Empty List Item** | ✅ Handled | Medium | Delete content, preserve `<li>` structure |
| **Convert Paragraph to List** | ✅ Handled | High | Single paragraph, multiple paragraphs |
| **Convert List to Paragraph** | ✅ Handled | High | Toggle off, preserve content |
| **List Type Switching** | ✅ Handled | High | Bullet to numbered, numbered to checklist |
| **Nested List Conversion** | ⚠️ Partial | Very High | Convert parent list, preserve nesting |
| **List Merging (Same Type)** | ✅ Handled | High | Adjacent lists auto-merge |
| **List Splitting** | ✅ Handled | Very High | Insert paragraph in middle, split into two lists |
| **Delete All Items** | ✅ Handled | Medium | Remove list container |
| **Tab in List (Nest)** | ✅ Handled | High | Indent item, create nested list |
| **Backspace in Empty List Item** | ⚠️ Partial | Very High | Outdent, delete list, convert to paragraph |

### Table-Specific Edge Cases

| Scenario | Status | Complexity | Testing Approach |
|----------|--------|------------|------------------|
| **Empty Cell** | ✅ Handled | Low | `&nbsp;` or `<br>` for cursor |
| **Cell with Multiple Paragraphs** | ❌ Missing | Very High | Enter inside cell, multiple blocks |
| **Cell Selection & Formatting** | ⚠️ Partial | Very High | Select cells, apply bold/color |
| **Copy Cell Content** | ✅ Browser default | Medium | Copy cell, paste outside table |
| **Paste into Cell** | ✅ Browser default | Medium | Paste text, HTML, images |
| **Delete Table** | ❌ Missing | Medium | Select table, Delete key, context menu |
| **Table Inside List** | ❌ Missing | Very High | Invalid HTML, prevent or handle gracefully |
| **Nested Tables** | ❌ Prevented | Low | Block creation (per Lexical design) |
| **Column Resize** | ❌ Missing | High | Drag column border, maintain widths |
| **Row/Column Insert/Delete** | ❌ Missing | Very High | Context menu, insert at position |

---

## Feature Dependencies

### Dependency Graph

```
Basic Formatting (Bold, Italic, Underline)
    └── No dependencies

Font Controls
    └── Color Picker Component

Lists
    ├── List Service (convert blocks, merge/split)
    ├── Checkbox Component (for checklists)
    └── Indent Logic (Tab handling)

Tables
    ├── Table Service (cell navigation, selection)
    ├── Context Menu (insert/delete rows)
    └── Table Toolbar (merge, resize)

Links
    ├── Link Dialog Component
    └── Tooltip Component

Images
    ├── File API (for upload)
    ├── Image Dialog (URL input)
    └── Resize Handles

Undo/Redo
    ├── History Stack
    └── MutationObserver (change detection)

Find/Replace
    ├── Search Dialog
    └── Selection Management

Spell Check
    └── Browser API (built-in)

Autosave
    ├── Storage API
    └── Debounce Utility

Clipboard Operations
    ├── Clipboard API
    └── HTML Sanitizer (for paste)
```

---

## Implementation Priority Matrix

### Priority 1: Critical Missing Features (Must Have)

These features are expected in any serious editor and will be immediately noticeable if missing.

| Feature | Complexity | Estimated Effort | Risk Level |
|---------|------------|------------------|------------|
| Strikethrough | Low | 1-2 hours | Low |
| Superscript/Subscript | Medium | 4-6 hours | Low |
| Inline Code | Medium | 4-6 hours | Medium |
| Code Block | High | 2-3 days | High |
| Link Edit/Remove | Medium | 4-6 hours | Medium |
| Clear Formatting | Medium | 2-4 hours | Low |
| Paste Plain Text | Medium | 2-4 hours | Low |
| Word Count | Medium | 2-4 hours | Low |
| Table Row/Column Insert/Delete | Very High | 3-5 days | Very High |

**Total Estimated Effort:** ~2 weeks

### Priority 2: Professional Features (Should Have)

These features distinguish production editors from basic demos.

| Feature | Complexity | Estimated Effort | Risk Level |
|---------|------------|------------------|------------|
| Image Upload | High | 1-2 days | High |
| Image Resize | Medium | 1 day | Medium |
| Image Alignment | Medium | 4-6 hours | Medium |
| Find & Replace | High | 2-3 days | High |
| Emoji Picker | Medium | 1 day | Medium |
| Special Characters | Medium | 1 day | Medium |
| Copy Formatting | High | 2-3 days | High |
| Context Menu | High | 2-3 days | High |
| Table Cell Merge | Very High | 3-5 days | Very High |
| Table Resize | High | 2-3 days | High |
| Autosave | Medium | 1 day | Medium |
| Draft Recovery | High | 1-2 days | High |

**Total Estimated Effort:** ~3-4 weeks

### Priority 3: Advanced Features (Nice to Have)

These features add polish and professional-grade capabilities.

| Feature | Complexity | Estimated Effort | Risk Level |
|---------|------------|------------------|------------|
| Auto-link URLs | High | 1-2 days | High |
| Link Tooltip | Medium | 4-6 hours | Medium |
| Selection Toolbar | Very High | 3-5 days | Very High |
| Touch Toolbar (Mobile) | Very High | 1 week | Very High |
| Fullscreen Mode | Medium | 1 day | Low |
| Export Markdown | High | 2-3 days | Medium |
| Export PDF | Very High | 1 week | Very High |
| Version History | Very High | 1-2 weeks | Very High |
| Grammar Check Integration | Very High | 1-2 weeks | Very High |

**Total Estimated Effort:** ~5-6 weeks

### Priority 4: Edge Case Handling (Ongoing)

Edge case handling should be integrated into each feature implementation, but dedicated testing is needed.

| Area | Estimated Testing Effort |
|------|--------------------------|
| Cross-browser testing | 2-3 days per feature batch |
| Mobile testing | 2-3 days per feature batch |
| Accessibility audit | 1 week |
| Performance optimization | 1-2 weeks |

---

## Testing Scenarios by Feature Category

### Formatting Testing Checklist

- [ ] Apply formatting to empty selection (should apply to current word or insert styled span)
- [ ] Apply formatting to partial word
- [ ] Apply formatting to full paragraph
- [ ] Apply formatting to multiple paragraphs
- [ ] Toggle formatting on/off
- [ ] Nested formatting (bold + italic + underline)
- [ ] Conflicting formatting (bold + unbold in same selection)
- [ ] Remove formatting with Clear Formatting
- [ ] Keyboard shortcuts work in all contexts
- [ ] Toolbar buttons update state correctly
- [ ] Formatting persists across undo/redo
- [ ] Formatting survives copy/paste

### List Testing Checklist

- [ ] Convert single paragraph to list
- [ ] Convert multiple paragraphs to list
- [ ] Convert list to paragraph(s)
- [ ] Switch between bullet/numbered/checklist
- [ ] Nest list items with Tab
- [ ] Outdent with Shift+Tab
- [ ] Merge adjacent lists of same type
- [ ] Split list with paragraph insertion
- [ ] Handle empty list items
- [ ] Backspace in empty list item (outdent or delete)
- [ ] Enter in empty list item (exit list)
- [ ] Select across list and paragraphs
- [ ] Format list items (bold, color, etc.)
- [ ] Checklist checkbox interaction
- [ ] Deeply nested lists (3+ levels)

### Table Testing Checklist

- [ ] Insert table with various sizes
- [ ] Navigate cells with Tab/Shift+Tab
- [ ] Type in cells
- [ ] Format cell content
- [ ] Select single cell
- [ ] Select multiple cells
- [ ] Select row/column
- [ ] Insert row above/below
- [ ] Insert column left/right
- [ ] Delete row/column
- [ ] Delete entire table
- [ ] Merge cells
- [ ] Split merged cells
- [ ] Resize column width
- [ ] Copy/paste cell content
- [ ] Table inside list (prevent or handle)
- [ ] Nested tables (prevent per Lexical)

### Image Testing Checklist

- [ ] Insert image from URL
- [ ] Insert image via upload
- [ ] Drag & drop image
- [ ] Paste image from clipboard
- [ ] Resize image with handles
- [ ] Maintain aspect ratio while resizing
- [ ] Align image (left/center/right)
- [ ] Add caption
- [ ] Delete image
- [ ] Image with link
- [ ] Large image (auto-resize?)
- [ ] Broken image handling

### Link Testing Checklist

- [ ] Insert link with keyboard shortcut
- [ ] Insert link from toolbar
- [ ] Edit existing link
- [ ] Remove link (keep text)
- [ ] Click link (follow or edit?)
- [ ] Link tooltip on hover
- [ ] Auto-link typed URLs
- [ ] Link validation visual feedback
- [ ] Links in lists
- [ ] Links in tables
- [ ] Image with link

### Clipboard Testing Checklist

- [ ] Copy formatted text
- [ ] Cut formatted text
- [ ] Paste formatted text
- [ ] Paste plain text (Ctrl+Shift+V)
- [ ] Paste from Word
- [ ] Paste from Google Docs
- [ ] Paste from external website
- [ ] Paste image
- [ ] Paste table
- [ ] Paste into table cell
- [ ] Copy/paste between editor instances

### Undo/Redo Testing Checklist

- [ ] Undo typing
- [ ] Undo formatting
- [ ] Undo list operations
- [ ] Undo table operations
- [ ] Undo image insertion
- [ ] Redo after undo
- [ ] Clear redo stack on new action
- [ ] Undo multiple levels
- [ ] Undo across complex operations
- [ ] Undo preserves cursor position
- [ ] Undo preserves selection
- [ ] Performance with large history

### Mobile Testing Checklist

- [ ] Touch to place cursor
- [ ] Touch selection handles
- [ ] Long press for context menu
- [ ] Virtual keyboard appears
- [ ] Toolbar stays visible above keyboard
- [ ] Scroll to cursor when keyboard opens
- [ ] Touch toolbar buttons
- [ ] Touch dropdowns
- [ ] Pinch to zoom
- [ ] Responsive toolbar layout
- [ ] Touch-friendly spacing
- [ ] Orientation change handling

---

## Sources

### Official Documentation

- **Lexical Documentation** (https://lexical.dev/) - HIGH confidence
  - Features: Rich text, lists, tables, links, code blocks, history, clipboard
  - Packages: @lexical/rich-text, @lexical/list, @lexical/table, @lexical/link

- **Quill Documentation** (https://quilljs.com/) - HIGH confidence
  - Formats: Inline (bold, italic, underline, strike, color, background, font, size, link, script), Block (blockquote, header, indent, list, align, code-block)
  - Embeds: Image, video, formula

- **ProseMirror Guide** (https://prosemirror.net/docs/guide/) - HIGH confidence
  - Architecture: Immutable document model, transaction-based updates, plugin system
  - Features: Schema definition, marks, commands, collaborative editing

### Google Docs Shortcuts

- **Google Docs Keyboard Shortcuts** (https://support.google.com/docs/answer/179738) - HIGH confidence
  - Complete list of Ctrl, Alt, Shift combinations for formatting, navigation, insertion

### Community Resources

- **Stack Overflow Discussions** on contenteditable edge cases - MEDIUM confidence
- **GitHub Issues** from Lexical, Quill, ProseMirror repositories - HIGH confidence for known issues

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Core Formatting Features | HIGH | Well-documented across all major editors, standard implementation patterns |
| List Features | HIGH | Current implementation handles most cases, known edge cases documented |
| Table Features | MEDIUM | Basic implementation exists, advanced features (merge, resize) require significant work |
| Image Features | MEDIUM | Basic insertion works, upload/resize/alignment need implementation |
| Link Features | MEDIUM | Basic link exists, advanced features (auto-link, validation) need research |
| Edge Cases | MEDIUM | Many documented from real-world usage, some scenarios need testing to discover |
| Mobile Support | LOW | Limited testing on mobile, touch interactions need dedicated implementation |
| Performance | LOW | Unknown behavior with large documents, needs profiling |

---

## Next Steps

1. **Phase 1: Critical Missing Features** (2 weeks)
   - Implement strikethrough, superscript/subscript, inline code
   - Add code block with syntax highlighting
   - Complete link management (edit, remove)
   - Implement clear formatting
   - Add paste plain text
   - Add word count display
   - Implement table row/column operations

2. **Phase 2: Professional Features** (3-4 weeks)
   - Image upload, resize, alignment
   - Find & replace dialog
   - Emoji picker, special characters
   - Copy formatting (format painter)
   - Context menu
   - Table merge and resize
   - Autosave and draft recovery

3. **Phase 3: Advanced Features** (5-6 weeks)
   - Auto-link URLs
   - Selection toolbar
   - Mobile touch toolbar
   - Export options (Markdown, PDF)
   - Version history

4. **Ongoing: Edge Case Testing**
   - Cross-browser testing after each phase
   - Mobile testing after each phase
   - Performance profiling with large documents
   - Accessibility audit

---

## Conclusion

The wui editor has a solid foundation with core formatting, lists, basic tables, and undo/redo. The critical gaps are in advanced features (find/replace, image handling, code blocks) and edge case polish. This document provides a comprehensive roadmap to achieve production-ready status matching Lexical/Google Docs capabilities.

**Key Takeaways:**
- **~40% of table-stakes features are implemented**, but 60% need work
- **Edge case handling is the biggest risk** - requires extensive testing
- **Mobile support is the biggest gap** - needs dedicated touch interactions
- **Estimated total effort to full parity: 10-12 weeks** of focused development

**Recommendation:** Prioritize Phase 1 features first, as these are immediately noticeable to users. Edge case testing should be integrated throughout, not left until the end.

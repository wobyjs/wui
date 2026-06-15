# Editor Testing Strategy

## Canonical Test Page

**Single test page**: `editor-demo.html` (http://localhost:5177/editor-demo.html)

All testing should be done on this page. No separate test files for different phases.

## Why Consolidate?

**Previous problem**: Accumulated 11+ test HTML files from different phases:
- `test-editor-interaction.html` (Phase 16)
- `test-blur-behavior.html` (Phase 17)
- `test-selection-retention.html` (Phase 18)
- Multiple other debug/test files

**Issues**:
1. Maintenance burden - multiple pages to keep in sync
2. Confusion - which page tests what?
3. Regression fear - afraid to delete old tests
4. Duplication - 3+ editors on same page with identical functionality

**Solution**: Single `editor-demo.html` with clear test sections documenting the 7 dimensions.

## Test Dimensions (Phase 18 Requirements)

Editor-demo.html includes content organized around the 7 test dimensions:

1. **Activation Method**: Click editor → activate, Ctrl+B → bold
2. **Selection Type**: Caret, partial, full, cross-paragraph
3. **Content Type**: Plain text, bold text, italic text, nested formatting
4. **Toggle Sequences**: Bold 1x (on), 2x (off), 3x (on) - MS Word behavior
5. **Selection Retention**: Select text → click Bold → selection stays highlighted
6. **Content Verification**: Check DOM structure via Chrome DevTools MCP
7. **Undo/Redo Integrity**: Ctrl+Z undoes, Ctrl+Y redoes

## Testing Protocol

### Automated Testing (Phase 18 Wave 3)

Use Chrome DevTools MCP `evaluate_script` to inject test helper and run assertions:

1. Inject `window._testHelper` (see 18-03-PLAN.md)
2. Run individual test scripts for each dimension
3. Monitor console via `list_console_messages()` for PASS/FAIL
4. Investigate failures using `evaluate_script` to inspect DOM

### Manual Testing (Quick Verification)

Use Chrome DevTools MCP to interact with the editor:

```javascript
// Navigate to test page
navigate_page({ url: "http://localhost:5177/editor-demo.html" })

// Activate editor
evaluate_script({ script: "editorDiv.click()" })

// Select text
evaluate_script({ script: "selectRange(textNode, 0, 7)" })

// Click Bold button
click({ uid: "bold-button-uid" })

// Verify result
evaluate_script({ script: "checkBoldApplied()" })
```

## Removed Test Files

All these redundant files were deleted (commit to follow):

- `automated-test.html`
- `compare-test.html`
- `debug-button.html`
- `debug-editor-click.html`
- `phase16-test.html`
- `test-blur-behavior.html`
- `test-bold-toggle-fix.html`
- `test-double-tap.html`
- `test-editor-blur-standalone.html`
- `test-editor-interaction.html`
- `test-selection-retention.html`
- `test.html`
- `agent-browser-blur-test.js`
- `blur-behavior-test-script.js`
- `browser-console-blur-test.js`
- `console-test.js`
- `BLUR_TEST_INSTRUCTIONS.md`
- `MANUAL_TEST_INSTRUCTIONS.md`

## Test Documentation

All test documentation should be in:
- `.planning/phases/18-editor-comprehensive-fix/18-03-PLAN.md` - MCP test suite
- `.planning/phases/18-editor-comprehensive-fix/MANUAL_TEST_VERIFICATION.md` - Manual test results
- `.planning/ROADMAP.md` - Phase requirements and status

No separate test instruction files needed.

## Regression Prevention

If bugs are found, fix them in source code and verify via MCP tests on `editor-demo.html`.

Do NOT create new test pages. Add new test sections to `editor-demo.html` content if needed for specific scenarios.
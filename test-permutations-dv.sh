#!/bin/bash
# Comprehensive Editor Testing - Permutation Matrix using dv CLI
# Tests all combinations of selection types and formatting actions

set -e

PROFILE="profile-2"
PORT="9223"
SERVER_URL="http://localhost:5180/editor-demo.html"

# Test matrix
SELECTION_TYPES=("partial-word" "full-word" "cross-paragraph" "caret")
ACTIONS=("bold" "italic" "underline")
CLICK_COUNTS=(1 2 3)

# Counter for test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a single test
run_test() {
    local selection_type=$1
    local action=$2
    local clicks=$3

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    echo "[Test $TOTAL_TESTS] $selection_type + $action x$clicks"

    # Reload page for clean state
    dv navigate --profile $PROFILE -u "$SERVER_URL" > /dev/null 2>&1
    sleep 2

    # Activate editor
    dv eval --profile $PROFILE --script "
        const editor = document.querySelector('wui-editor');
        const shadowRoot = editor.shadowRoot;
        const content = shadowRoot.querySelector('[contenteditable]');
        content.focus();
        content.click();
    " > /dev/null 2>&1

    # Create selection based on type
    local selection_script=""
    case $selection_type in
        "partial-word")
            selection_script="
                const strong = document.querySelector('wui-editor').shadowRoot.querySelectorAll('p')[1].querySelector('strong');
                if (strong) {
                    const textNode = strong.firstChild;
                    const range = document.createRange();
                    range.setStart(textNode, 2);
                    range.setEnd(textNode, 5);
                    const sel = document.querySelector('wui-editor').shadowRoot.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            "
            ;;
        "full-word")
            selection_script="
                const strong = document.querySelector('wui-editor').shadowRoot.querySelectorAll('p')[1].querySelector('strong');
                if (strong) {
                    const textNode = strong.firstChild;
                    const range = document.createRange();
                    range.setStart(textNode, 0);
                    range.setEnd(textNode, 7);
                    const sel = document.querySelector('wui-editor').shadowRoot.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            "
            ;;
        "cross-paragraph")
            selection_script="
                const ps = document.querySelector('wui-editor').shadowRoot.querySelectorAll('p');
                const strong1 = ps[1].querySelector('strong');
                const strong2 = ps[ps.length-1].querySelector('strong');
                if (strong1 && strong2) {
                    const range = document.createRange();
                    range.setStart(strong1.firstChild, 11);
                    range.setEnd(strong2.firstChild, 21);
                    const sel = document.querySelector('wui-editor').shadowRoot.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            "
            ;;
        "caret")
            selection_script="
                const strong = document.querySelector('wui-editor').shadowRoot.querySelectorAll('p')[1].querySelector('strong');
                if (strong) {
                    const textNode = strong.firstChild;
                    const range = document.createRange();
                    range.setStart(textNode, 3);
                    range.collapse(true);
                    const sel = document.querySelector('wui-editor').shadowRoot.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            "
            ;;
    esac

    dv eval --profile $PROFILE --script "$selection_script" > /dev/null 2>&1

    # Apply action multiple times
    local button_selector=""
    case $action in
        "bold") button_selector="wui-bold-button" ;;
        "italic") button_selector="wui-italic-button" ;;
        "underline") button_selector="wui-underline-button" ;;
    esac

    for i in $(seq 1 $clicks); do
        dv eval --profile $PROFILE --script "
            document.querySelector('wui-editor').shadowRoot.querySelector('$button_selector').click();
        " > /dev/null 2>&1
        sleep 0.5
    done

    # Verify result
    local result=$(dv eval --profile $PROFILE --json --script "
        JSON.stringify((() => {
            const editor = document.querySelector('wui-editor');
            const shadowRoot = editor.shadowRoot;
            const content = shadowRoot.querySelector('[contenteditable]');
            const paragraphs = Array.from(content.querySelectorAll('p'));
            const p1 = paragraphs[1];
            const p2 = paragraphs[paragraphs.length - 1];

            return {
                p1Text: p1 ? p1.textContent : '',
                p2Text: p2 ? p2.textContent : '',
                p1Length: p1 ? p1.textContent.length : 0,
                p2Length: p2 ? p2.textContent.length : 0
            };
        })())
    " 2>/dev/null)

    # Check for regressions
    local passed=true

    # Verify text wasn't lost
    if ! echo "$result" | grep -q "toolbar demo for testing"; then
        passed=false
    fi

    if ! echo "$result" | grep -q "cross-paragraph"; then
        passed=false
    fi

    # Check for text corruption
    if echo "$result" | grep -q "undefined\|null"; then
        passed=false
    fi

    if [ "$passed" = true ]; then
        echo "  ✅ PASSED"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo "  ❌ FAILED"
        echo "  Result: $result"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo "========== Starting Permutation Tests =========="
echo "Selection types: ${SELECTION_TYPES[@]}"
echo "Actions: ${ACTIONS[@]}"
echo "Click counts: ${CLICK_COUNTS[@]}"
echo ""

# Run all test combinations
for selection_type in "${SELECTION_TYPES[@]}"; do
    for action in "${ACTIONS[@]}"; do
        for clicks in "${CLICK_COUNTS[@]}"; do
            run_test "$selection_type" "$action" "$clicks"
        done
    done
done

echo ""
echo "========== TEST SUMMARY =========="
echo "Total: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"

if [ $FAILED_TESTS -gt 0 ]; then
    exit 1
else
    exit 0
fi
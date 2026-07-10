#!/bin/bash
# Comprehensive Permutation Test using dv CLI
# Tests all combinations with clicks > 5 times

set -e

PROFILE="profile-2"
SERVER_URL="http://localhost:5180/editor-demo.html"

SELECTION_TYPES=("partial-word" "full-word" "cross-paragraph" "caret")
ACTIONS=("bold" "italic" "underline")
CLICK_COUNTS=(1 2 3 4 5 6 7)

TOTAL=0
PASSED=0
FAILED=0

echo "========================================"
echo "COMPREHENSIVE PERMUTATION TEST"
echo "========================================"
echo ""
echo "Selection Types: ${SELECTION_TYPES[@]}"
echo "Actions: ${ACTIONS[@]}"
echo "Click Counts: ${CLICK_COUNTS[@]}"
echo ""
echo "Total Test Cases: $((${#SELECTION_TYPES[@]} * ${#ACTIONS[@]} * ${#CLICK_COUNTS[@]}))"
echo ""
echo "========================================"
echo ""

# Open editor page
dv new --profile $PROFILE --url "$SERVER_URL" > /dev/null 2>&1
sleep 3

for selection in "${SELECTION_TYPES[@]}"; do
    for action in "${ACTIONS[@]}"; do
        for clicks in "${CLICK_COUNTS[@]}"; do
            TOTAL=$((TOTAL + 1))

            echo -n "Test $TOTAL: $selection + $action x$clicks ... "

            # Reload page
            dv eval --profile $PROFILE --script "window.location.reload()" > /dev/null 2>&1
            sleep 2

            # Activate editor
            dv eval --profile $PROFILE --script "
                const editor = document.querySelector('wui-editor');
                editor.shadowRoot.querySelector('[contenteditable]').focus();
            " > /dev/null 2>&1

            # Create selection
            case $selection in
                "partial-word")
                    dv eval --profile $PROFILE --script "
                        const s = document.querySelector('wui-editor').shadowRoot.querySelectorAll('p')[1].querySelector('strong').firstChild;
                        const r = document.createRange();
                        r.setStart(s, 2);
                        r.setEnd(s, 5);
                        const sel = document.querySelector('wui-editor').shadowRoot.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(r);
                    " > /dev/null 2>&1
                    ;;
                "full-word")
                    dv eval --profile $PROFILE --script "
                        const s = document.querySelector('wui-editor').shadowRoot.querySelectorAll('p')[1].querySelector('strong').firstChild;
                        const r = document.createRange();
                        r.setStart(s, 0);
                        r.setEnd(s, 7);
                        const sel = document.querySelector('wui-editor').shadowRoot.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(r);
                    " > /dev/null 2>&1
                    ;;
                "cross-paragraph")
                    dv eval --profile $PROFILE --script "
                        const ps = document.querySelector('wui-editor').shadowRoot.querySelectorAll('p');
                        const s1 = ps[1].querySelector('strong').firstChild;
                        const s2 = ps[ps.length-1].querySelector('strong').firstChild;
                        const r = document.createRange();
                        r.setStart(s1, 11);
                        r.setEnd(s2, 21);
                        const sel = document.querySelector('wui-editor').shadowRoot.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(r);
                    " > /dev/null 2>&1
                    ;;
                "caret")
                    dv eval --profile $PROFILE --script "
                        const s = document.querySelector('wui-editor').shadowRoot.querySelectorAll('p')[1].querySelector('strong').firstChild;
                        const r = document.createRange();
                        r.setStart(s, 3);
                        r.collapse(true);
                        const sel = document.querySelector('wui-editor').shadowRoot.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(r);
                    " > /dev/null 2>&1
                    ;;
            esac

            # Apply action clicks times
            BUTTON=""
            case $action in
                "bold") BUTTON="wui-bold-button" ;;
                "italic") BUTTON="wui-italic-button" ;;
                "underline") BUTTON="wui-underline-button" ;;
            esac

            for i in $(seq 1 $clicks); do
                dv eval --profile $PROFILE --script "
                    document.querySelector('wui-editor').shadowRoot.querySelector('$BUTTON').click();
                " > /dev/null 2>&1
                sleep 0.3
            done

            # Check result
            RESULT=$(dv eval --profile $PROFILE --json --script "
                JSON.stringify((() => {
                    const p = document.querySelector('wui-editor').shadowRoot.querySelectorAll('p')[1];
                    return {
                        text: p.textContent,
                        len: p.textContent.length,
                        hasToolbar: p.textContent.includes('toolbar'),
                        hasDemo: p.textContent.includes('demo')
                    };
                })())
            " 2>/dev/null)

            # Verify no text loss
            if echo "$RESULT" | grep -q "toolbar" && echo "$RESULT" | grep -q "demo"; then
                echo "✅ PASS"
                PASSED=$((PASSED + 1))
            else
                echo "❌ FAIL"
                echo "  Result: $RESULT"
                FAILED=$((FAILED + 1))
            fi
        done
    done
done

echo ""
echo "========================================"
echo "TEST SUMMARY"
echo "========================================"
echo "Total: $TOTAL"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo ""

if [ $FAILED -gt 0 ]; then
    exit 1
fi
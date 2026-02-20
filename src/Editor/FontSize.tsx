import { $, $$, Observable, JSX, useEffect, defaults, ObservableMaybe, HtmlNumber, HtmlString, customElement, ElementAttributes, HtmlBoolean, isObservable, useMemo, HtmlClass } from 'woby'
import { Button, ButtonStyles } from '../Button'
import TextIncrease from '../icons/text_increase'
import TextDecrease from '../icons/text_decrease'
import { useEditor } from './undoredo'
import { applyStyle, findBlockParent, getActiveSelection, getCurrentEditor, getCurrentRange } from './utils'

const def = () => ({
    cls: $('', HtmlClass) as JSX.Class | undefined,
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    editable: $(false, HtmlBoolean) as Observable<boolean>,
    fontSize: $(16, HtmlNumber) as ObservableMaybe<number>,
    step: $(1, HtmlNumber) as ObservableMaybe<number>,
})

/**
 * Main function to handle font size application
 */
const applyFontSize = (editor: ObservableMaybe<HTMLDivElement>, newSize: string) => {
    const editorDiv = $$(editor);
    const selection = getActiveSelection(editorDiv);

    if (!selection || selection.rangeCount === 0 || !editorDiv) return;

    // console.groupCollapsed(`[FontSize] Applying: ${newSize}`);

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();

    // 1. Identify the closest element container
    let container = range.commonAncestorContainer as HTMLElement;
    if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentElement!;
    }

    // 2. Determine state: Is it already a span? Does it match exactly?
    const isSpan = container.tagName === 'SPAN';
    const isPerfectMatch = container.textContent === selectedText;

    // console.log("[FontSize] Context:", { tag: container.tagName, isSpan, isPerfectMatch, selectedText });

    // 3. Decide: Update existing or Create new
    if (isSpan && isPerfectMatch) {
        // console.log("[FontSize] Exact span match. Updating style.");
        container.style.fontSize = newSize;
        removeNestedFontSizes(container);
    } else {
        // console.log("[FontSize] Partial selection or non-span. Creating new wrapper.");
        createSpan(editorDiv, newSize);
    }

    // console.groupEnd();
};

/**
 * Creates a new span, extracts selection into it, and cleans up internals
 */
const createSpan = (editor: HTMLDivElement, newSize: string) => {
    const selection = getActiveSelection(editor);
    const range = selection?.getRangeAt(0);
    if (!range || selection?.isCollapsed) return;

    // 1. Extract the selected content
    const contents = range.extractContents();

    // 2. Create the new "Master" span
    const masterSpan = document.createElement('span');
    masterSpan.style.fontSize = newSize;
    masterSpan.appendChild(contents);

    // 3. Deep clean the contents we just moved inside the masterSpan
    removeNestedFontSizes(masterSpan);

    // 4. PREVENT REDUNDANT WRAPPING:
    // If the masterSpan now contains exactly one child which is also a span 
    // with the SAME font size, we can flatten them.
    if (masterSpan.childNodes.length === 1 &&
        masterSpan.firstChild instanceof HTMLElement &&
        masterSpan.firstChild.tagName === 'SPAN') {
        const child = masterSpan.firstChild as HTMLElement;
        if (child.style.fontSize === newSize || !child.style.fontSize) {
            // Move child's content up and remove child
            masterSpan.innerHTML = child.innerHTML;
        }
    }

    // 5. Insert back into DOM
    range.insertNode(masterSpan);

    // 6. Restore selection
    const newRange = document.createRange();
    newRange.selectNodeContents(masterSpan);
    selection.removeAllRanges();
    selection.addRange(newRange);
};


/**
 * Removes 'fontSize' styles from children and unwraps redundant <span> tags.
 * A span is redundant if it has no attributes or if it contains no direct text
 * and only other spans.
 */
const removeNestedFontSizes = (rootElement: HTMLElement) => {
    // 1. Clear all nested font-size styles first
    const styledChildren = Array.from(rootElement.querySelectorAll('[style*="font-size"]'));
    styledChildren.forEach(child => {
        if (child instanceof HTMLElement) {
            child.style.fontSize = '';
            // If the style attribute is now empty, remove it entirely
            if (child.getAttribute('style') === '' || !child.style.cssText) {
                child.removeAttribute('style');
            }
        }
    });

    // 2. Unwrap "Useless" Spans (Spans with no attributes)
    // We do this in a loop because unwrapping one might make the parent useless
    let foundUseless = true;
    while (foundUseless) {
        foundUseless = false;
        const spans = Array.from(rootElement.querySelectorAll('span'));

        for (const span of spans) {
            // A span is useless if it has no attributes (class, style, etc.)
            if (span.attributes.length === 0) {
                span.replaceWith(...Array.from(span.childNodes));
                foundUseless = true;
                break; // Restart loop to catch newly exposed spans
            }
        }
    }
};

const FontSize = defaults(def, (props) => {
    const { cls, buttonType, editable, fontSize, step, ...otherProps } = props as any
    const editor = useEditor()
    const BASE_BTN = "w-1/5 justify-center px-2 py-1 border border-gray-300";

    // #region Synchronization (Hooks)
    /**
     * Monitors the DOM to remove empty "Ghost" spans and redundant "Onion" wrappers.
     */
    useEffect(() => {
        const el = editor ?? getCurrentEditor();
        if (!$$(el)) return;

        const performEditorCleanup = () => {
            const spans = Array.from($$(el).querySelectorAll('span'));
            const selection = window.getSelection();

            spans.forEach(span => {
                // 0. Safety: Do not modify span if cursor is inside it
                const isCursorInside = selection?.anchorNode && span.contains(selection.anchorNode);
                if (isCursorInside) return;

                // 1. Remove Ghost Spans (truly empty)
                const isEmpty = span.childNodes.length === 0 || (span.textContent === '' && span.children.length === 0);
                if (isEmpty) {
                    console.warn('[Cleanup] Removing empty ghost span');
                    span.remove();
                    return;
                }

                // 2. Remove redundant font-size from onion wrappers
                // (parent has no direct text but has children)
                const hasDirectText = Array.from(span.childNodes).some(
                    node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== ''
                );

                if (!hasDirectText && span.children.length > 0 && span.style.fontSize) {
                    // console.log('[Cleanup] Removing font-size from parent wrapper:', span.style.fontSize);

                    // Remove ONLY font-size
                    span.style.removeProperty('font-size');

                    // If no inline styles remain, remove style attribute entirely
                    if (span.style.length === 0) { span.removeAttribute('style'); }
                }

                // 3. Remove completely useless spans
                // (no attributes, no styling, no id/class)
                const hasAttributes = span.attributes.length > 0;

                if (!hasAttributes) {
                    // console.log('[Cleanup] Unwrapping useless span');
                    span.replaceWith(...Array.from(span.childNodes));
                }
            });
        };

        const observer = new MutationObserver(performEditorCleanup);

        observer.observe($$(el), { childList: true, subtree: true, characterData: true });

        performEditorCleanup(); // Initial run

        return () => observer.disconnect();
    });

    /**
    * Synchronizes the font size input field with the text at the user's cursor.
    */
    useEffect(() => {
        const el = editor ?? getCurrentEditor();
        if (!$$(el)) return;

        const syncWithSelection = () => {
            const selection = getActiveSelection($$(el));
            if (!selection?.rangeCount) return;

            let node = selection.getRangeAt(0).commonAncestorContainer;
            const element = (node.nodeType === Node.TEXT_NODE ? node.parentElement : node) as HTMLElement;

            if (element && $$(el).contains(element)) {
                const size = parseFloat(window.getComputedStyle(element).fontSize);
                if (!isNaN(size) && $$(fontSize) !== size)
                    fontSize(size)
            }
        };

        document.addEventListener('selectionchange', syncWithSelection);
        return () => document.removeEventListener('selectionchange', syncWithSelection);
    });
    // #endregion

    // #region Actions (Internal Logic)
    const applyNewSize = (size: number) => {
        const el = editor ?? getCurrentEditor();
        if (isNaN(size) || size <= 0) return;
        fontSize(size);
        applyFontSize(el, size + "px");
    };
    // #endregion

    // #region Event Handlers
    const onStepClick = (delta: number) => (e: MouseEvent) => {
        e.preventDefault(); // Prevent losing focus
        applyNewSize(Math.max(1, $$(fontSize) + delta));
    };

    const onInputChange = (e: JSX.TargetedEvent<HTMLInputElement>) => {
        const val = parseFloat(e.currentTarget.value);
        if (val > 0)
            applyNewSize(val);
        else
            e.currentTarget.value = $$(fontSize).toString();
    };
    // #endregion

    // #region UI Sub-Components
    const StepButton = ({ type, delta, icon: Icon, rounded }: any) => (
        <Button
            type="outlined"
            cls={[BASE_BTN, rounded]}
            title={`${type} Font Size`}
            onClick={onStepClick(delta)}
        >
            <Icon class="w-full h-full text-gray-500" />
        </Button>
    );

    const SizeInput = () => (
        <input
            value={fontSize}
            disabled={() => !$$(editable)}
            readOnly={() => !$$(editable)}
            onFocus={onInputChange}
            onBlur={(e) => e.currentTarget.value = $$(fontSize).toString()}
            class={[
                "text-center text-sm h-auto w-3/5 border-y border-gray-300",
                () => $$(editable) ? "bg-white" : "bg-gray-50 cursor-not-allowed",
            ]}
        />
    );
    // #endregion

    return (
        <div class={[cls, "inline-flex items-stretch rounded-md shadow-sm"]}>
            <StepButton type="Decrease" delta={-$$(step)} icon={TextDecrease} rounded="rounded-r-none" />
            <SizeInput />
            <StepButton type="Increase" delta={$$(step)} icon={TextIncrease} rounded="rounded-l-none" />
        </div>
    );
}) as typeof FontSize;

export { FontSize }

customElement('wui-font-size', FontSize);

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-font-size': ElementAttributes<typeof FontSize>
        }
    }
}

export default FontSize
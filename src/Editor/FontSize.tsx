import { $, $$, Observable, JSX, useEffect, defaults, ObservableMaybe, HtmlNumber, HtmlString, customElement, ElementAttributes, HtmlBoolean, isObservable, useMemo, HtmlClass } from 'woby'
import { Button, ButtonStyles } from '../Button'
import TextIncrease from '../icons/text_increase'
import TextDecrease from '../icons/text_decrease'
import { useEditor } from './undoredo'
import { applyStyle, findBlockParent, getSelection, getCurrentEditor, getCurrentRange, restoreSelection, selectElement, getActiveSelection } from './utils'

const def = () => ({
    cls: $('', HtmlClass) as JSX.Class | undefined,
    buttonType: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    editable: $(false, HtmlBoolean) as Observable<boolean>,
    fontSize: $(16, HtmlNumber) as ObservableMaybe<number>,
    step: $(5, HtmlNumber) as ObservableMaybe<number>,
})

const FontSize = defaults(def, (props) => {
    const { cls, buttonType, editable, fontSize, step, ...otherProps } = props as any
    const editor = useEditor()
    const BASE_BTN = "w-1/5 justify-center px-2 py-1 border border-gray-300";

    // #region Synchronization (Hooks)
    /**
    * Synchronizes the font size input field with the text at the user's cursor.
    */
    useEffect(() => {
        const syncWithSelection = () => {
            const el = editor ?? getCurrentEditor();
            if (!$$(el)) {
                console.log('[FontSize] No editor found, skipping selection sync');
                return;
            }

            const { selection, state } = getSelection($$(el));

            if (!selection?.rangeCount) return;

            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;

            // Security: Make sure the selection is actually inside the editor
            if (!$$(el).contains(container) && container !== $$(el)) return;

            let smallestSize = $$(fontSize);

            // 1. Single cursor click (No text highlighted)
            if (state.isCollapsed || container.nodeType === Node.TEXT_NODE) {
                const element = (container.nodeType === Node.TEXT_NODE ? container.parentElement : container) as HTMLElement;
                if (element) {
                    const size = parseFloat(window.getComputedStyle(element).fontSize);
                    if (!isNaN(size)) smallestSize = size;
                }
            }
            // 2. Multi-Paragraph / Multi-Element Selection
            else {
                // Create a fast scanner that only looks at Raw Text nodes inside the highlighted area
                const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
                let currentNode = walker.nextNode();

                while (currentNode) {
                    // Only process this text if the blue highlight actually touches it
                    if (range.intersectsNode(currentNode)) {
                        // Ignore invisible whitespace
                        if (currentNode.textContent && currentNode.textContent.trim().length > 0) {
                            const parentElement = currentNode.parentElement;
                            if (parentElement) {
                                // Get the exact font size of this specific piece of text
                                const size = parseFloat(window.getComputedStyle(parentElement).fontSize);
                                if (!isNaN(size)) {
                                    // Keep the smallest size we've seen so far
                                    smallestSize = Math.min(smallestSize, size);
                                }
                            }
                        }
                    }
                    currentNode = walker.nextNode();
                }

                // Fallback: If no valid text was found (e.g., highlighting an image)
                if (smallestSize === Infinity) {
                    const size = parseFloat(window.getComputedStyle(container as HTMLElement).fontSize);
                    if (!isNaN(size)) smallestSize = size;
                }
            }

            // 3. Update the UI if we found a valid size
            if (smallestSize !== Infinity && $$(fontSize) !== smallestSize) {
                console.log(`[FontSize] 🆕 Updating observed font size from ${$$(fontSize)} to ${smallestSize}`);
                if (isObservable(fontSize)) {
                    fontSize(smallestSize);
                }
            }
        };

        document.addEventListener('selectionchange', syncWithSelection);
        return () => {
            document.removeEventListener('selectionchange', syncWithSelection);
        };
    });
    // #endregion

    // #region Actions (Internal Logic)
    const applyNewSize = (size: number) => {
        const el = editor ?? getCurrentEditor();
        if (isNaN(size) || size <= 0) return;
        fontSize(size);
        applyFontSize(el, size + "px");
        performEditorCleanup(el);
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
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
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

/**
 * Main function to handle font size application
 */
const applyFontSize = (editor: ObservableMaybe<HTMLDivElement>, newSize: string) => {
    const editorDiv = $$(editor);
    const { selection } = getSelection(editorDiv);

    if (!selection || selection.rangeCount === 0 || !editorDiv) return;

    console.groupCollapsed(`[FontSize] Applying: ${newSize}`);

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();

    // 1. Identify the closest element container
    let container = range.commonAncestorContainer as HTMLElement;
    if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentElement!;
    }

    // 2. Determine state: Is it already a span? Does it match exactly?
    const isSpan = container.tagName == 'SPAN';
    const isMatch = container.textContent.trim() == selectedText.trim();
    const isContainer = container.hasAttribute('data-editor-root')
    const isList = container.tagName == 'UL' || container.tagName == 'OL';

    console.log("[FontSize] Context: ", {
        "container": { "tag": container.tagName, "text": container.textContent.trim() },
        "selection": { "text": selectedText.trim() },
        "isSpan": isSpan,
        "isMatch": isMatch,
        "isContainer": isContainer,
        "isList": isList,
    })

    if (isContainer || isList) {
        // Path A: Complex Multi-Paragraph selection
        handleMultiParagraphSelection(container, selection, range, newSize);
    } else if (isSpan && isMatch) {
        // Path B: Simple exact span match
        console.log("[FontSize] Exact span match. Updating style.");
        container.style.fontSize = newSize;
        removeNestedFontSizes(container);
    } else {
        // Path C: Partial selection or non-span
        console.log("[FontSize] Partial selection or non-span. Creating new wrapper.");
        const newSpan = createSpan(selection);
        if (newSpan) {
            applyStyleToSpan(newSpan, newSize);
        }
    }

    const { state: newState } = getSelection(editorDiv);
    restoreSelection(newState, editorDiv);

    console.groupEnd();
};

// #region Helper Function
/**
 * Wraps the current selection in a clean <span> tag and returns it.
 */
const createSpan = (selection: Selection): HTMLSpanElement | null => {

    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;

    const range = selection.getRangeAt(0);

    // 1. Extract content
    const contents = range.extractContents();

    // 2. Create wrapper
    const span = document.createElement('span');
    span.appendChild(contents);

    // 3. Insert into DOM
    range.insertNode(span);

    // update the selection to wrap the new span
    selectElement(span, selection)

    return span;
};

/**
 * Function to clean up nested font sizes and empty wrappers.
 */
const removeNestedFontSizes = (rootElement: HTMLElement) => {
    // 1. Remove specific font-size styles
    const styledElements = rootElement.querySelectorAll('[style*="font-size"]');
    styledElements.forEach(el => cleanFontSizeStyle(el as HTMLElement));

    // 2. Remove any spans that became useless (empty attributes)
    const spans = Array.from(rootElement.querySelectorAll('span')).reverse();
    spans.forEach(unwrapIfUseless);
};

/**
 * Applies the font size to a specific span and cleans up internal redundancy.
 */
const applyStyleToSpan = (span: HTMLElement, fontSize: string) => {
    // 1. Apply the style
    span.style.fontSize = fontSize;

    // 2. Clean up nested/conflicting font sizes inside
    removeNestedFontSizes(span);

    // 3. Optimization: Flatten redundant spans
    // If the span contains ONLY another span with the same style, unwrap the inner one.
    if (span.childNodes.length === 1 && span.firstElementChild?.tagName === 'SPAN') {
        const child = span.firstElementChild as HTMLElement;
        if (child.style.fontSize === fontSize || !child.style.fontSize) {
            // Move child content up to parent
            while (child.firstChild) {
                span.appendChild(child.firstChild);
            }
            child.remove();
        }
    }
};

/**
 * The cleanup runs in reverse order (bottom-up) to handle nested spans efficiently.
 * Skips spans where the cursor is currently positioned to prevent disruption.
 * 
 * @param editor - The editor element (Observable or direct HTMLDivElement reference)
 */
const performEditorCleanup = (editor: ObservableMaybe<HTMLDivElement>) => {
    const el = editor ?? getCurrentEditor();

    const spans = Array.from($$(el).querySelectorAll('span')).reverse();
    const { selection } = getSelection($$(el));

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
            // Remove ONLY font-size
            span.style.removeProperty('font-size');

            // If no inline styles remain, remove style attribute entirely
            if (span.style.length === 0) { span.removeAttribute('style'); }
        }

        // 3. Remove completely useless spans
        unwrapIfUseless(span);
    });
};

/**
 * Removes the font-size style from an element. 
 * If the style attribute becomes empty, removes the attribute entirely.
 */
const cleanFontSizeStyle = (element: HTMLElement) => {
    element.style.fontSize = '';
    if (element.getAttribute('style') === '') {
        element.removeAttribute('style');
    }
};

/**
 * unwraps spans that have no attributes (class, style, id, etc).
 * Processes in reverse (Bottom-Up) to handle nested empty spans in one pass.
 */
const unwrapIfUseless = (span: HTMLElement) => {
    if (!span.hasAttributes()) {
        span.replaceWith(...Array.from(span.childNodes));
    }
};
// #endregion

// #region Helper: Multi-Paragraph Font Sizing

/**
 * Finds all <p> tags in the editor that are currently highlighted by the user.
 */
const getAffectedParagraphs = (editorDiv: HTMLElement, selection: Selection): HTMLParagraphElement[] => {
    const allParagraphs = editorDiv.querySelectorAll('p');
    const affectedParagraphs: HTMLParagraphElement[] = [];

    allParagraphs.forEach(p => {
        if (selection.containsNode(p, true)) {
            affectedParagraphs.push(p);
        }
    });

    return affectedParagraphs;
};

/**
 * Handles the complex logic of applying font sizes across multiple paragraphs,
 * calculating intersecting ranges, wrapping spans, and restoring the selection.
 */
const handleMultiParagraphSelection = (container: HTMLElement, selection: Selection, originalRange: Range, newSize: string) => {
    console.log("[FontSize] Handling multi-paragraph selection...");

    const affectedParagraphs = getAffectedParagraphs(container, selection);
    console.log(`[FontSize] Processing ${affectedParagraphs.length} paragraphs.`);

    let firstStyledNode: HTMLElement | null = null;
    let lastStyledNode: HTMLElement | null = null;

    affectedParagraphs.forEach((p, index) => {
        // 1. Create a Range specific to THIS paragraph's selection
        const pRange = document.createRange();
        pRange.selectNodeContents(p);

        // Adjust the range start/end to match the user's selection
        if (originalRange.compareBoundaryPoints(Range.START_TO_START, pRange) > 0) {
            pRange.setStart(originalRange.startContainer, originalRange.startOffset);
        }
        if (originalRange.compareBoundaryPoints(Range.END_TO_END, pRange) < 0) {
            pRange.setEnd(originalRange.endContainer, originalRange.endOffset);
        }

        const selectedText = pRange.toString();
        console.log(`[FontSize] #${index + 1}: "${selectedText}" inside <${p.tagName}>`);

        if (!selectedText.trim()) return; // Skip empty selections

        // 2. Identify Context for this specific paragraph
        let container = pRange.commonAncestorContainer as HTMLElement;
        if (container.nodeType === Node.TEXT_NODE) {
            container = container.parentElement!;
        }

        // 🚀 THE FIX: If container is P, check if we are actually fully inside a child SPAN
        if (container.tagName === 'P') {
            console.debug('[FontSize] 🔍 Container is P tag, checking for SPAN inside');

            let startNode = pRange.startContainer;

            // 🚀 CRITICAL FIX: If startContainer IS the paragraph, we need to grab the child node
            if (startNode.nodeType === Node.ELEMENT_NODE && startNode === container) {
                // "childNodes[startOffset]" gives us the exact node the selection starts at
                const childIndex = pRange.startOffset;

                // Check if there is a node at that index
                if (childIndex < startNode.childNodes.length) {
                    startNode = startNode.childNodes[childIndex];
                }
            }

            // Case A: The selection starts inside a text node that is wrapped in a SPAN
            let targetElement = startNode.nodeType === Node.TEXT_NODE ? startNode.parentElement : startNode as HTMLElement;

            // Check if we found a SPAN
            if (targetElement && targetElement.tagName === 'SPAN') {
                const spanText = targetElement.textContent?.trim() || "";

                if (spanText === selectedText.trim()) {
                    console.debug('[FontSize] ✅ Text match! Using SPAN as container');
                    container = targetElement;
                }
            }
        }

        const isSpan = container.tagName === 'SPAN';
        const isMatch = container.textContent?.trim() === selectedText.trim();
        let currentStyledSpan: HTMLElement;

        // 3. Apply Style Logic
        if (isSpan && isMatch) {
            console.log(`[FontSize] #${index + 1}: updating existing span.`);
            applyStyleToSpan(container, newSize);
            currentStyledSpan = container;
        } else {
            console.log(`[FontSize] #${index + 1}: creating new span wrapper.`);
            const contents = pRange.extractContents();
            const span = document.createElement('span');
            span.appendChild(contents);
            pRange.insertNode(span);

            applyStyleToSpan(span, newSize);
            currentStyledSpan = span;
        }

        // 4. Track modifications for selection restoration
        if (!firstStyledNode) firstStyledNode = currentStyledSpan;
        lastStyledNode = currentStyledSpan;
    });

    // 5. Restore Exact Selection
    if (firstStyledNode && lastStyledNode) {
        selectElement(firstStyledNode, selection, lastStyledNode); // Stretches the highlight!
    }
};

// #endregion


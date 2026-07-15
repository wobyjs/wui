import { $, $$, Observable, JSX, useEffect, defaults, ObservableMaybe, HtmlNumber, HtmlString, customElement, ElementAttributes, HtmlBoolean, isObservable, HtmlClass } from 'woby'
import { Button, ButtonStyles } from '../Button'
import TextIncrease from '../icons/text_increase'
import TextDecrease from '../icons/text_decrease'
import { useEditor } from './undoredo'
import { getCurrentEditor } from './utils'
import { applyFontSize as applyFontSizeStyle } from './StyleEngine'
import { safeGetSelection, safeGetRange } from './BrowserCompat'

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
                return;
            }

            const rootNode = $$(el).getRootNode()
            const shadowRoot = rootNode instanceof ShadowRoot ? rootNode : undefined

            const selection = safeGetSelection();
            const range = safeGetRange(shadowRoot);

            if (!selection || !range) return;

            const container = range.commonAncestorContainer;

            // Security: Make sure the selection is actually inside the editor
            if (!$$(el).contains(container) && container !== $$(el)) return;

            let smallestSize = $$(fontSize);

            // 1. Single cursor click (No text highlighted)
            if (range.collapsed || container.nodeType === Node.TEXT_NODE) {
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
        if (isNaN(size) || size <= 0) return;
        fontSize(size);
        applyFontSizeStyle(size + "px");
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


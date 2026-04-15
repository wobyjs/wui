import { $, $$, defaults, type JSX, customElement, type ElementAttributes, HtmlClass, HtmlString, ObservableMaybe, HtmlBoolean, useEffect, Observable } from "woby"
import { Button, ButtonStyles } from '../Button'
import UndoIcon from '../icons/undo'
import RedoIcon from '../icons/redo'
import { EditorContext, UndoRedo, useEditor, useUndoRedo } from "./undoredo"

// #region Undo Redo Button
type UndoRedoMode = 'undo' | 'redo'

const def = () => ({
    type: $("outlined", HtmlString) as ObservableMaybe<ButtonStyles>,
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
    mode: $("undo", HtmlString) as ObservableMaybe<UndoRedoMode>,
})

const UndoRedoButton = defaults(def, (props) => {
    // We don't destructure 'title' or 'disabled' here so we can control them dynamically
    const { mode, cls, class: cn, ...otherProps } = props

    console.log('[UndoRedoButton] Attempting to use context...');
    const undoRedoContext = useUndoRedo();
    console.log('[UndoRedoButton] Context value:', undoRedoContext);

    // Create default empty observables as fallback
    const fallbackUndos = $([] as string[]);
    const fallbackRedos = $([] as string[]);
    const fallbackUndo = () => console.warn('[UndoRedoButton] Undo not available');
    const fallbackRedo = () => console.warn('[UndoRedoButton] Redo not available');

    // Use context values if available, otherwise use fallbacks
    const redo = undoRedoContext?.redo || fallbackRedo;
    const redos = undoRedoContext?.redos || fallbackRedos;
    const undo = undoRedoContext?.undo || fallbackUndo;
    const undos = undoRedoContext?.undos || fallbackUndos;

    const isUndo = () => { return $$(mode) == 'undo' }

    // Dynamic Title
    const displayTitle = () => $$(isUndo) ? 'Undo' : 'Redo'

    // Dynamic Icon
    const displayIcon = () => {
        return $$(isUndo) ? <UndoIcon class="size-5" /> : <RedoIcon class="size-5" />
    }

    // Dynamic Click Handler
    const handleClick = () => $$(isUndo) ? undo() : redo()

    // Dynamic Disabled State
    const handleDisabled = () => $$(isUndo) ? $$(undos).length === 1 : $$(redos).length === 0

    return (
        <Button
            title={displayTitle}
            // disabled={isBtnDisabled}
            disabled={handleDisabled}
            onClick={handleClick}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
            cls={() => [
                "border-none p-1.5 transition-all",
                "text-gray-700 hover:bg-gray-100 cursor-pointer",
                "disabled:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            ]}
            {...otherProps}
        >
            {displayIcon}
        </Button>
    )
})

// #endregion


// #region Editor Provider
const editorProviderDef = () => ({
    cls: $('', HtmlClass) as JSX.Class | undefined,
    class: $('', HtmlClass) as JSX.Class | undefined,
});

/**
 * EditorProvider Component
 * 
 * Creates and provides the EditorContext to all child components.
 * This allows both the Toolbar (with UndoRedoButton) and EditorSurface 
 * to access the same editor reference.
 * 
 * Usage:
 * ```tsx
 * <EditorProvider>
 *   <Toolbar />
 *   <EditorSurface />
 * </EditorProvider>
 * ```
 */
const EditorProvider = defaults(editorProviderDef, (props) => {
    const { children } = props;

    console.log('[EditorProvider] Initializing...');

    // Create an observable to hold the editor reference
    const editorRef = $<HTMLDivElement | null>(null);

    console.log('[EditorProvider] Providing EditorContext...');
    console.log('[EditorProvider] Initial editor value:', $$(editorRef));

    return (
        <EditorContext.Provider value={editorRef}>
            <UndoRedo>
                <UndoRedoButton mode="undo" />
                <UndoRedoButton mode="redo" />
                {children}
            </UndoRedo>
        </EditorContext.Provider>
    );
});
// #endregion



export { UndoRedoButton, EditorProvider }
customElement('wui-undoredo-button', UndoRedoButton)
customElement('wui-editor-provider', EditorProvider);

declare module 'woby' {
    namespace JSX {
        interface IntrinsicElements {
            'wui-undoredo-button': ElementAttributes<typeof UndoRedoButton>
            'wui-editor-provider': ElementAttributes<typeof EditorProvider>
        }
    }
}

export default UndoRedoButton
// Core utilities
export { EditorContext, useEditor } from './undoredo'
export { UndoRedoContext, useUndoRedo, UndoRedo } from './undoredo'
export type { UndoRedoType } from './undoredo'

// Selection management
export { SelectionManager } from './SelectionManager'
export type { SelectionState } from './SelectionManager'

// Browser compatibility
export { BrowserInfo, safeGetSelection, safeGetRange, normalizeRange, getDirection, getSelectionInfo, isComposing, setComposing } from './BrowserCompat'

// Utility functions
export { getSelection, restoreSelection, getCurrentRange, expandRange, getSelectedBlocks, getCurrentBlock } from './utils'
export { applyStyle } from './utils'
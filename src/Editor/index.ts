// Core utilities
export { EditorContext, useEditor } from './undoredo'
export { UndoRedoContext, useUndoRedo, UndoRedo } from './undoredo'
export type { UndoRedoType } from './undoredo'

// Selection management
export { SelectionManager } from './SelectionManager'
export type { SelectionState } from './SelectionManager'

// Browser compatibility
export { BrowserInfo, safeGetSelection, safeGetRange, normalizeRange, getDirection, getSelectionInfo, isComposing, setComposing } from './BrowserCompat'

// DOM Normalization
export { normalizeDOM, mergeTextNodes, removeEmptySpans, unwrapRedundantSpans, mergeAdjacentSpans, normalizeBlockBoundaries } from './DOMNormalizer'

// Style Engine
export { applyStyle, removeStyle, toggleStyle, applyBold, applyItalic, applyUnderline, applyStrikethrough, applyTextColor, applyBackgroundColor, applyFontFamily, applyFontSize, applyIndent } from './StyleEngine'

// Utility functions
export { getSelection, restoreSelection, getCurrentRange, expandRange, getSelectedBlocks, getCurrentBlock } from './utils'
export { applyStyle as applyStyleLegacy } from './utils'

// Focus management
export { FocusManager } from './FocusManager'

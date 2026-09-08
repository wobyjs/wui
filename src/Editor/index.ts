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
export { applyStyle, removeStyle, toggleStyle, applyBold, applyItalic, applyUnderline, applyStrikethrough, applyTextColor, applyBackgroundColor, applyFontFamily, applyFontSize, applyIndent, applyTextAlign, getStyleStateInRange } from './StyleEngine'

// Utility functions
export { getSelection, restoreSelection, getCurrentRange, expandRange, getSelectedBlocks, getCurrentBlock } from './utils'
export { applyStyle as applyStyleLegacy } from './utils'

// Focus management
export { FocusManager } from './FocusManager'

// Editor Plugin System
export { registerEditorPlugin, unregisterEditorPlugin, getEditorPlugins, getPluginForElement, pluginsToInsertItems, serializeEditorContent, resolveResizable, resolveAnchor, applyResize, constrainResize, resolvePageBreak, pageBreakTagNames } from './EditorPlugin'
export type { EditorPlugin, InsertMenuItem, PluginProp, PluginPropType, PluginAction, ResizableSpec, ResizeWrite, PageBreakKind } from './EditorPlugin'

// Page layout -- flow / page / screen.
//
// `paginate` and `applyLayout` are the engine; `unpaginate` is the one a host has to
// remember, because sheets are presentation and must come back out of the markup before
// it is saved or re-parsed. The constants are exported so an app's own stylesheet can
// target a sheet without hard-coding an attribute name that might change here.
export {
    applyLayout, configurePageLayout, currentLayout, disposeLayout, moveNode, pageMetrics,
    paginate, settle, unpaginate,
    LAYOUT_ATTR, Layout, NOT_PAGED, OVERFLOW_ATTR, OVERFLOW_LABEL_VAR, PAGE_ATTR,
    PAGE_CHROME_ATTR, PAGE_H_VAR, PAGE_SCALE_VAR, PAGE_W_VAR,
} from './PageLayout'
export type { LayoutMode, PageLayoutOptions, Mover } from './PageLayout'
export { ensurePageStyles } from './PageStyles'
export { LayoutSwitch, editorLayout, layoutText, setEditorLayout } from './LayoutSwitch'
export type { LayoutText } from './LayoutSwitch'
export { PrintButton } from './PrintButton'
export { printEditor, isPrinting, PRINT_PATH_ATTR, PRINT_HIDE_ATTR } from './Print'
export type { PrintOptions } from './Print'

// Property Panel
export { InfoButton } from './InfoButton'
export { PropertyPanel, PropertyPanelContext, usePropertyPanel } from './PropertyPanel'
export { detectSelectionType, extractImageProperties, extractTextProperties, extractCustomElementProperties } from './PropertyExtractor'
export type { SelectionType, SelectionInfo } from './PropertyExtractor'

// Node navigation -- arrow/Enter movement between embedded components and images
export { arrowDirection, insertLineAfter, navigableBoxes, navigateFrom, placeCaretIn } from './NodeNavigation'
export type { NavDirection } from './NodeNavigation'
export { SELECT_IMAGE_EVENT } from './ImageResizer'
export type { SelectImageDetail } from './ImageResizer'

// Image editing
// `wui-image-editor` is registered as a side effect of this import -- the element is
// usable from plain HTML once anything pulls the bundle in, and `openImageEditor` mounts
// it on demand for callers that would rather not place the tag.
export { ImageEditor, openImageEditor, EDIT_IMAGE_EVENT, IMAGE_APPLIED_EVENT } from './ImageEditor'
export type { EditImageDetail } from './ImageEditor'
export { ImageCropper } from './ImageCropper'
export type { CropperHandle } from './ImageCropper'
export {
    A4, ORIGIN_ATTR, a4Box, bakeCrop, clipCropRect, cropOutputSize, cropRect, dataUrlBytes,
    encodeCanvas, fileToDataUrl, fitToA4, fitWithin, formatBytes, isAllowedSource, isRasterisable,
    isWholeImage, loadImage, mimeOf, naturalSize, pristineSource, readImageOrigin,
    rememberImageOrigin, resolveImageSource, urlToDataUrl,
} from './ImageSource'
export type { CropFrame, CropTransform, PristineSource, ResolveResult, SourceRect } from './ImageSource'

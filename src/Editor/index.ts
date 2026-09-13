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
export { BUILT_IN_ORDER, registerEditorPlugin, unregisterEditorPlugin, getEditorPlugins, getPluginForElement, pluginsToInsertItems, pluginGroups, serializeEditorContent, deserializeEditorContent, resolveResizable, resolveAnchor, applyResize, constrainResize, resolvePageBreak, pageBreakTagNames } from './EditorPlugin'
export type { EditorPlugin, PluginGroup, InsertMenuItem, PluginProp, PluginPropType, PluginAction, ResizableSpec, ResizeWrite, PageBreakKind } from './EditorPlugin'

// Editor Command System -- what the editor can *do*.
//
// `registerEditorCommand` + `runEditorCommand` is the whole surface for a third party that
// wants a new formatting verb: the selection caching, shadow-root range resolution, focus
// restore and undo step are handled, and the registrant writes only `run`.
export { registerEditorCommand, unregisterEditorCommand, getEditorCommand, getEditorCommands, buildCommandContext, runEditorCommand, attachEditorRuntime, getEditorRuntime } from './EditorCommand'
export type { EditorCommand, CommandContext, EditorRuntime, RunCommandOptions } from './EditorCommand'

// Editor Toolbar System -- what the editor *shows*.
//
// Split from the commands because the relationship is not one to one: a command can have no
// button, a button can drive six commands, and hiding a button must not remove the verb.
export { TOOLBAR_GROUPS, registerToolbarItem, unregisterToolbarItem, getToolbarItems, registerToolbarGroup, getToolbarGroups, hideToolbarItem, showToolbarItem, isToolbarItemHidden, resolveToolbarItems } from './EditorToolbarItem'
export type { ToolbarItem, ToolbarGroup, ResolvedToolbarGroup } from './EditorToolbarItem'
export { ToolbarSlot } from './EditorToolbarSlot'
export { CommandButton } from './CommandButton'

// The dismissal a third-party dropdown needs. Not a convenience: `@woby/use`'s
// `useEventListener` memoises by (target, event), so a hand-rolled outside-click listener on
// `window` is silently never registered once anything else has claimed that pair -- and the
// editor lives in a shadow root, where `contains(e.target)` answers "outside" for every click
// including the ones on the menu itself. Both traps are already sprung in here.
export { useDropdownDismiss } from './useDropdownDismiss'

// Editor Keymap -- how a command is *reached* from the keyboard.
//
// The third registry, and the one that makes the split above pay off: a chord names a
// command, so binding a key needs no widget and hiding a widget does not lose the key.
// Write `Mod` for Cmd-on-macOS / Ctrl-elsewhere.
export { registerEditorKeys, unregisterEditorKeys, getEditorKeys, getChordFor, handleEditorKeyDown } from './EditorKeymap'
export type { KeyBinding } from './EditorKeymap'

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
export { LanguageSwitch } from './LanguageSwitch'
export { PrintButton } from './PrintButton'
export { printEditor, isPrinting, PRINT_PATH_ATTR, PRINT_HIDE_ATTR } from './Print'
export type { PrintOptions } from './Print'

// Document zoom. `setEditorZoom` is the one to call: it writes the scale through
// PageLayout *and* publishes it to `editorZoom`, so the toolbar readout stays honest.
// `setLayoutZoom` alone does not, which is why the engine's setter is not the public one.
export { ZoomControl, editorZoom, setEditorZoom, notifyZoomChanged, zoomText, zoomStr } from './ZoomControl'
export type { ZoomText } from './ZoomControl'
export { onZoomApplied, layoutZoom, resolvedZoom, setLayoutZoom, ZOOM_MIN, ZOOM_MAX } from './PageLayout'
export type { ZoomLevel } from './PageLayout'

// The navigation rail beside the surface, and the toolbar button that shows it.
export { DocScroller, ScrollerToggle, scrollerOpen, toggleScroller } from './DocScroller'

// The insert menu's table sizer, exported so a host's own menu can reuse it.
export { TableGridPicker } from './TableGridPicker'
export type { TableGridPickerProps } from './TableGridPicker'

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

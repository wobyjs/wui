/**
 * en.ts — English, and the reference catalogue.
 *
 * Every other pack is this file with the right-hand side replaced. Keys live here first;
 * a key that is not in this file is not translatable anywhere, because there is nothing
 * for a translator to see.
 *
 * English carries no `text` map. `tx` falls back to its own argument, so the ~265
 * plugin-authored `label:` / `hint:` strings already render correctly in English without
 * a single entry — which is the point of that catalogue being keyed by the English.
 *
 * This pack is registered eagerly by `src/i18n/index.ts` rather than filed as a loader:
 * it is the fallback for every other language, so a lazily-loaded pack that is missing a
 * key would have nothing to fall back *to* until English happened to arrive.
 *
 * @module i18n/locales/en
 */

import type { LocalePack } from '../i18n'

export const en: LocalePack = {
    code: 'en',
    name: 'English',
    english: 'English',
    dir: 'ltr',
    messages: {
        // -- Common ----------------------------------------------------------
        'common.ok': 'OK',
        'common.cancel': 'Cancel',
        'common.close': 'Close',
        'common.apply': 'Apply',
        'common.insert': 'Insert',
        'common.delete': 'Delete',
        'common.remove': 'Remove',
        'common.edit': 'Edit',
        'common.back': 'Back',
        'common.browse': 'Browse…',
        'common.reset': 'Reset',
        'common.none': 'None',
        'common.default': 'Default',
        'common.custom': 'Custom',

        // -- History ---------------------------------------------------------
        'editor.undo': 'Undo',
        'editor.redo': 'Redo',

        // -- Character formatting --------------------------------------------
        'editor.bold': 'Bold',
        'editor.italic': 'Italic',
        'editor.underline': 'Underline',
        'editor.strikethrough': 'Strikethrough',
        'editor.subscript': 'Subscript',
        'editor.superscript': 'Superscript',
        'editor.highlight': 'Highlight',
        'editor.clearFormat': 'Clear Format',
        // The menu spells it out; the button tooltip above does not.
        'editor.clearFormatting': 'Clear Formatting',
        'editor.lowercase': 'Lowercase',
        'editor.uppercase': 'Uppercase',
        'editor.capitalize': 'Capitalize',
        'editor.textFormat': 'Text format',
        'editor.moreTextFormats': 'More text formats',

        // -- Font ------------------------------------------------------------
        'editor.fontFamily': 'Font family',
        'editor.chooseFontFamily': 'Choose font family',
        'editor.fontSize': 'Font size',
        'editor.increaseFontSize': 'Increase Font Size',
        'editor.decreaseFontSize': 'Decrease Font Size',
        'editor.textColor': 'Text color',
        'editor.textBackgroundColor': 'Text background color',

        // -- Paragraph -------------------------------------------------------
        'editor.paragraphStyle': 'Choose paragraph style',
        'editor.blockquote': 'Convert to Blockquote',
        'editor.blockquoteLabel': 'Blockquote',
        'editor.codeBlock': 'Code Block',
        'editor.heading1': 'Heading 1',
        'editor.heading2': 'Heading 2',
        'editor.heading3': 'Heading 3',
        'editor.normalText': 'Normal',
        'editor.quote': 'Quote',

        // -- Lists -----------------------------------------------------------
        'editor.bulletedList': 'Bulleted List',
        'editor.numberedList': 'Numbered List',
        'editor.checkboxList': 'Checkbox List',

        // -- Alignment and indent --------------------------------------------
        'editor.align': 'Text alignment',
        'editor.alignLeft': 'Align Left',
        'editor.alignCenter': 'Align Center',
        'editor.alignRight': 'Align Right',
        'editor.alignJustify': 'Align Justify',
        'editor.alignLeftTitle': 'Align left',
        'editor.alignCenterTitle': 'Align center',
        'editor.alignRightTitle': 'Align right',
        'editor.applyAlignment': 'Apply current alignment',
        'editor.chooseAlignOrIndent': 'Choose alignment or indent',
        'editor.indent': 'Indent',
        'editor.outdent': 'Outdent',
        'editor.increaseIndent': 'Increase Indent',
        'editor.decreaseIndent': 'Decrease Indent',

        // -- Insert ----------------------------------------------------------
        'editor.insertContent': 'Insert content',
        'editor.chooseWhatToInsert': 'Choose what to insert',
        'editor.backToInsertMenu': 'Back to the insert menu',
        'editor.insert.image': 'Image',
        'editor.insert.table': 'Table',
        'editor.insert.container': 'Container',
        'editor.insert.row': 'Row (flex)',

        // -- Table -----------------------------------------------------------
        'editor.table.size': 'Table size',
        'editor.table.insertRowAbove': 'Insert row above',
        'editor.table.insertRowBelow': 'Insert row below',
        'editor.table.insertColumnLeft': 'Insert column left',
        'editor.table.insertColumnRight': 'Insert column right',
        'editor.table.deleteRow': 'Delete row',
        'editor.table.deleteColumn': 'Delete column',
        'editor.table.deleteTable': 'Delete table',
        'editor.table.mergeCells': 'Merge cells',
        'editor.table.splitCell': 'Split cell',
        'editor.table.toggleAllBorders': 'Toggle all borders',
        'editor.table.toggleCellBorder': 'Toggle cell border',
        'editor.table.cellBackgroundColor': 'Cell background color',
        'editor.table.cellBorderColor': 'Cell border color',
        'editor.table.cellTextColor': 'Cell text color',

        // -- Images ----------------------------------------------------------
        'editor.image.insert': 'Insert image',
        'editor.image.delete': 'Delete image',
        'editor.image.edit': 'Edit image (crop, zoom)',
        'editor.image.editShort': 'Edit image…',
        'editor.image.cropZoomResize': 'Crop, zoom and resize this image',
        'editor.image.fitWhole': 'Fit the whole image in the frame',
        'editor.image.restoreOriginal': 'Restore original',
        'editor.image.discardCrops': 'Discard every crop and go back to {origin}',
        // Same button, in the dialog, where the origin URL is not to hand.
        'editor.image.discardCropsPlain': 'Discard every crop and go back to the image this was made from',
        'editor.image.dragToResizeCrop': 'Drag to resize the crop frame',
        'editor.image.source': 'Source — paste a URL, browse, or drop an image here',
        'editor.image.sourceEdit': 'Source — edit the URL, browse, or drop an image on this panel to replace it',
        'editor.image.urlPlaceholder': 'https://example.com/photo.jpg',
        'editor.image.altText': 'Alt text',
        'editor.image.altPlaceholder': 'Describes the image for screen readers',
        'editor.image.embed': 'Embed the image in the document (data: URI)',

        // -- Element chrome --------------------------------------------------
        'editor.dragToMoveDialog': 'Drag to move this dialog',
        'editor.dragToMoveElement': 'Drag to move this element (or alt+drag the element itself)',
        'editor.selectParent': 'Select parent element',

        // -- Property panel --------------------------------------------------
        'editor.properties': 'Properties',
        'editor.property.empty': 'Select an element to view properties',
        'editor.property.remove': 'Remove this property',
        'editor.property.asTailwind': 'Write this property as a Tailwind class',

        // -- Style groups (StyleEditor) --------------------------------------
        'style.group.Layout': 'Layout',
        'style.group.Size': 'Size',
        'style.group.Flex & Grid': 'Flex & Grid',
        'style.group.Spacing': 'Spacing',
        'style.group.Typography': 'Typography',
        'style.group.Background': 'Background',
        'style.group.Border': 'Border',
        'style.group.Effects': 'Effects',
        'style.group.Transitions': 'Transitions',
        'style.group.Interactivity': 'Interactivity',
        'style.group.Other': 'Other',

        // -- Style editor chrome ---------------------------------------------
        'style.normalState': 'Normal state',
        'style.pseudoState': 'Styles applied on :{state}',
        'style.fromBase': "From the component's base classes — removing it rewrites Class Override",
        'style.fromVariant': "From the component's variant/size — change it through the property row, not here",
        'style.removeToken': 'Remove {token}',
        'style.classes': 'Classes',
        'style.searchProperties': 'Search properties',

        // -- Layout switch ---------------------------------------------------
        'editor.layout.flow': 'Flow',
        'editor.layout.page': 'Page',
        'editor.layout.screen': 'Read',
        'editor.layout.flowTitle': 'Continuous editing, layout markers shown',
        'editor.layout.pageTitle': 'Paginated sheets — what the printer gets',
        'editor.layout.screenTitle': 'Read-only, no paper width',

        // -- Zoom ------------------------------------------------------------
        'editor.zoom.fit': 'Fit',
        'editor.zoom.in': 'Zoom in',
        'editor.zoom.out': 'Zoom out',
        'editor.zoom.menu': 'Document zoom',

        // -- Navigation rail -------------------------------------------------
        'editor.scroller.thumbnails': 'Page thumbnails',
        'editor.scroller.map': 'Document map',

        // -- Printing and pagination -----------------------------------------
        'editor.print': 'Print — proofs on paper-sized sheets first',
        // `{page}` and `{total}` are substituted. A language that puts the total first
        // simply reorders them here; nothing in PageLayout cares.
        'editor.page.label': 'Page {page} / {total}',
        'editor.page.overflow': 'This block is taller than one page and cannot be split automatically',
        'editor.page.break': 'Page break',

        // -- Language picker -------------------------------------------------
        'editor.language': 'Language',
        'editor.language.choose': 'Choose a language',
    },
}

export default en

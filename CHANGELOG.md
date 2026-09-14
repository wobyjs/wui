# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

Everything since `v1.0.21` (2025-09-13 — 2026-09-13). `package.json` reads **1.0.35**, but
npm's latest is still **1.0.21**: 1.0.22–1.0.35 were bumped locally and never published, so
there are no tags to split this section along.

### Added

**The Editor.** The bulk of this release — a rich-text editor built on `contenteditable`
inside a shadow root, and the reason most of the rest of this list exists.

- `SelectionManager` — path-based tracking with editor-root-relative global character
  offsets, so a range survives a DOM rewrite.
- `StyleEngine` — style application and removal over a range or a caret, including nested
  and semantic elements.
- `DOMNormalizer` — normalisation with text-based selection restoration.
- `BrowserCompat` — one place for the cross-browser differences.
- `UndoRedo` — context and provider, debounced, capturing shadow-DOM `innerHTML`.
- Toolbar: bold, italic, underline, strikethrough, blockquote, alignment including justify,
  indent with a customisable pixel step, bullet / numbered / checkbox lists, font family,
  font size, text colour, case transforms, clear format.
- Insert menu, tables with a popup cell menu and a grid size picker.
- `wui-image-editor` — crop, replace and origin tracking; resize handles for plugin
  elements, not just images.
- Page layout modes, page-block plugins (`wui-page-break`, `wui-watermark`) and printing.
- `DocScroller` — page thumbnails in page mode, a fisheye document map elsewhere.
- Document zoom.
- `EditorPlugin` — the plugin system, with `actions` rendered as a button strip in the
  property panel and `PluginProp` rows that render their hints.
- Property panel and style editor, with base-class publication and a left-edge resize.
- Arrow and Enter navigation between components, without stealing focus from them.
- **Three registries behind the toolbar**, so a third party can extend it without editing
  wui: `EditorCommand` (what the editor can do), `EditorToolbarItem` (what it shows, and
  where) and `EditorKeymap` (how a command is reached from the keyboard). Deliberately not
  one registry: hiding a button must not take its chord away from it. `runEditorCommand`
  performs the four steps around a command's `run` — cache the selection, resolve the range
  through the shadow root, restore the caret, save one undo step — so a registrant writes
  only the verb. `hideToolbarItem`, `replaces` and `unregisterEditorCommand` are three
  different verbs and each leaves the other two alone.
- **A fourth registry: `EditorHelpStep`.** The in-place help tour — a balloon mounted inside
  the editor, gated on the registry — that walks a new user through the toolbar, the
  surface, the property panel and back out again. `registerHelpStep`, `registerHelpSteps`,
  `startHelpTour`, `stopHelpTour` and eight `HelpTarget` shapes
  (`surface` / `toolbar` / `panel` / `panelPart` / `prop` / `element` / `pluginGroup` /
  `selector`) cover the editor's own landmarks and anything a plugin cares to point at.
  `data-toolbar-item`, `data-panel-part`, `data-prop-row` and `data-plugin-group` attributes
  are the anchors the registry resolves against. The balloon is a registry consumer just like the toolbar slot — built-ins
  register at import time, hosts extend the same list. An empty registry is the acceptance
  criterion: an editor with no help registered renders identically to one with the
  built-ins loaded.
- **A second tour for the property panel**, registered as `'properties'` by
  `builtinHelpProperties.tsx` and launched from a "?" in the panel header rather than the
  toolbar. Ten steps over the header, the identity line, the parent hop, the property rows,
  the plugin/image action strip, the style section, delete, resize and close — each anchored
  by the new `panelPart` target against the `data-panel-part` attributes the panel now
  stamps. Kept separate from the editor tour on purpose: the editor tour answers "how do I
  write", this one answers "what is this dialog", and it starts at the moment that question
  arises, with the panel already open on the element being asked about. Every targeted step
  is gated on `getClientRects().length > 0`, which both skips the action strip for a plain
  paragraph and degrades the whole tour gracefully if the panel is closed mid-walk.
- **`data-help-clear`** — an opt-in on a floating overlay's root (the property panel carries
  it) that tells the balloon which box to stay clear of. An anchor inside an overlay is a
  small control near that overlay's edge, so "beside the anchor" and "on top of the overlay"
  are the same place; with the marker, the *outward* edge of every placement is measured
  from the overlay's box while the cross-axis alignment and the spotlight keep following the
  anchor exactly. Without it, the keep-clear box *is* the anchor box and nothing changes.
- The tour now paints at `z-index: 1150` — above the property panel (`z-[1100]`), below the
  image dialogs (`z-[1200]`), which stay on top because they are modal and a tour is not.
  Previously the panel covered the very steps that pointed into it. The card's clamp box is
  the union of the surface and the keep-clear box, intersected with the window, so a step
  anchored to a fixed overlay outside the surface still lands fully on screen.

**i18n.** A pluggable multilingual layer covering `en`, `zh-Hans`, `zh-Hant` and `ms`.
English is eager because it is the fallback; the rest are code-split behind loaders, so a
build that never asks for Malay ships none of it. `t` / `tx` / `tn` / `localized`, `Intl`
wrappers that read the locale reactively, an imperative `onLocaleChange` for text written
into the DOM by hand, and a `wui-language-switch` control that renders the registry rather
than a prop.

**Components.** `Paper`, `Sidebar`, `Toolbar`, `Tabs`, `TextArea`, `Switch`, `Zoomable`
(multi-touch zoom and pan), `NumberField`, and `Banner`, a page header with editable slotted
content. Plus a run of new icons.

**Tests.** An SSR suite across all 20 components, a Wheeler suite, and a two-suite test story
with on-page actual/expect logs.

**Docs.** `docs/api/` — a page per component, plus `I18n`, `EditorPlugin`, `EditorToolbar`,
`NodeNavigation`, `PageLayout`, `EditorProps` and `EditorHelp`. Two guides for extending the
editor: [editor-plugins](docs/guides/editor-plugins.md) and
[editor-toolbar](docs/guides/editor-toolbar.md).

### Changed

- `cls` / `class` exposed on every component, with `HtmlClass` so the binding stays reactive.
- `Portal` dropped from the sidebar, appbar and popups in favour of reactive `display`
  gating — it was causing overlap and stacking problems it could not fix.
- `style` and `exports` fields added to `package.json`; Tailwind v4 source scanning documented.
- Paper elevation shadows, Toolbar internals and Sidebar content-push reworked.

### Fixed

- **Selection and shadow DOM** — `shadowRoot.getSelection()` and `getComposedRanges`
  throughout, hybrid restoration with an offset hint, cross-paragraph and cross-cell ranges,
  caret expand-to-word, and the selection cached on `mousedown` before focus shifts away.
- **Formatting** — nested-style toggles, semantic element toggle with a mixed-state button,
  word merging when formatting adjacent runs, list item classes and styles preserved across
  operations.
- **Undo/redo** — a re-entrancy guard on the MutationObserver, watching the correct root,
  and the debounce timer scoped to the closure.
- **i18n** — the list button tooltips, then the last frozen-English tooltips anywhere in the
  editor.
- **Toolbar control heights** — the bar never set one, so each widget was as tall as its own
  content plus its own padding: five different heights (32 / 37.4 / 38 / 42.5 / 54 px) and
  three different baselines across the two wrapped rows. A shared `TOOLBAR_CONTROL` class in
  `toolbarControl.ts` pins every control to the 32px b/i/u height and is applied at all 25
  registration sites. The colour pickers additionally shrink their stacked glyph and swatch
  (`h-6`→`h-5`, `h-3`→`h-2`) so 36px of content fits a 32px box without changing how they
  look. The utilities carry `!` because Tailwind v4 emits `.py-0` before `.py-2`, so a plain
  `py-0` would lose to each widget's existing padding.
- **Components** — DateTimeWheeler z-index and `cancelOnBlur`, the Wheeler header observable,
  boolean prop round-trip, the TextField focus label, modal backdrops closing on a drag that
  began inside them, and CircularFab visibility.

### Removed

- `setStyle`, unused.
- `queryCommandState` from every button, replaced by `StyleEngine.hasStyleInRange`.
- The duplicate Horizontal Rule in the Insert menu.

## [1.0.20] - [1.0.21] - 2025-09-13

Republishes. No source changes beyond the version bump.

## [1.0.19] - 2025-09-12

### Added
- `propertyRows`, returning a `<tr>`; `PropertyForm` switched over to `TableRow`.
- Further `skippedProperties`, and new props on the property editors.

### Changed
- Functions and operators moved onto the new Wheeler.

### Fixed
- The boolean editor did not work.

## [1.0.18] - 2025-05-19

### Added
- `MultiWheeler`.
- `changeValueOnlyOnClick`.
- Renderer support.

### Changed
- Editor components moved into their respective `editors` files.

## [1.0.13] - [1.0.17] - 2025-04-09 / 2025-04-11

Republishes. No source changes beyond the version bump.

## [1.0.12] - 2025-04-09

### Added
- A generic `PropertyForm`.
- `DropdownEditor`.

### Changed
- `PropertyFormEditors` split into separate files.

## [1.0.11] - 2024-12-24

First tagged release covered by this file.

[Unreleased]: https://github.com/wobyjs/wui/compare/v1.0.21...HEAD
[1.0.21]: https://github.com/wobyjs/wui/compare/v1.0.19...v1.0.21
[1.0.19]: https://github.com/wobyjs/wui/compare/v1.0.18...v1.0.19
[1.0.18]: https://github.com/wobyjs/wui/compare/v1.0.17...v1.0.18
[1.0.17]: https://github.com/wobyjs/wui/compare/v1.0.12...v1.0.17
[1.0.12]: https://github.com/wobyjs/wui/compare/v1.0.11...v1.0.12
[1.0.11]: https://github.com/wobyjs/wui/releases/tag/v1.0.11

/**
 * WUI Component Plugins for wui-editor.
 *
 * Registers wui-* components (button, toggle-button, checkbox, switch,
 * text-field, text-area, number-field, icon-button, badge, fab, avatar, banner)
 * as editor plugins so they appear in the insert menu and support property editing.
 *
 * Import this file as a side-effect to register all plugins:
 *   import './Editor/WuiPlugins'
 */
import { registerEditorPlugin, type PluginProp } from './EditorPlugin'
import { getBaseCls } from '../helper/baseCls'
import { insertAsBlock, editImageAttr } from './BlockInsert'
import { BANNER } from '../Banner'

/**
 * Styling props shared by every wui component, appended last so they render
 * below the semantic rows.
 *
 * These are declared rather than scraped on purpose. The blind attribute scrape
 * in PropertyExtractor only runs for elements with no schema, and presence is
 * the wrong signal for these two anyway: woby's customElement reflects the
 * `cls: $('', HtmlClass)` default onto every upgraded element, so `cls=""` is
 * always "present" (it would render an empty row everywhere), while `class` is
 * never reflected, so it would be un-addable from the panel.
 *
 * `default: ''` matters: applyCustomElementProperty removes the attribute when
 * the value equals the default, so clearing either box strips it from the
 * serialized HTML instead of leaving `cls=""` behind.
 *
 * `cls` also carries a resolveDefault, because an empty box is a dead end for
 * it: the class it would replace lives inside the component and is invisible
 * from the outside, so there is nothing to start an override from. Components
 * publish that string themselves (see helper/baseCls), the row opens pre-filled
 * with it, and because it doubles as the unset value an unedited row still
 * writes no attribute -- editing it is what turns it into a real override.
 */
const styleProps: PluginProp[] = [
    {
        name: 'class', type: 'string', label: 'CSS Class', default: '',
        hint: 'Extra classes, appended after the component styling',
    },
    {
        name: 'cls', type: 'string', label: 'Class Override', default: '',
        resolveDefault: getBaseCls,
        hint: 'Replaces the component base/variant class entirely — pre-filled with that base; edit it to override, clear it to go back',
    },
]

// ── wui-button ──

/* Every `children` row below is `textContent: true`, and its `default` is only ever
   read as the fallback when the element's light DOM is empty. A pretty default there
   describes an element that does not exist: an empty <wui-button> rendered nothing
   while the panel reported "Button". Each one is the component's own (`children:
   $(null)` / `$('')`), so an empty element reads as empty. */
const buttonProps: PluginProp[] = [
    {
        name: 'type', type: 'enum', label: 'Variant', default: 'contained',
        options: [
            { value: 'contained', label: 'Contained' },
            { value: 'outlined', label: 'Outlined' },
            { value: 'text', label: 'Text' },
        ],
    },
    { name: 'children', type: 'string', label: 'Label', default: '', hint: 'Button text', textContent: true },
    { name: 'disabled', type: 'boolean', label: 'Disabled', default: false },
]

registerEditorPlugin({
    name: 'button',
    label: 'Button',
    tagName: 'wui-button',
    props: [...buttonProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '🔘'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-button')
        el.setAttribute('type', 'contained')
        el.textContent = 'Button'
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-toggle-button ──

const toggleButtonProps: PluginProp[] = [
    { name: 'children', type: 'string', label: 'Label', default: '', hint: 'Button text', textContent: true },
    { name: 'checked', type: 'boolean', label: 'Checked', default: false, live: true },
    { name: 'disabled', type: 'boolean', label: 'Disabled', default: false },
]

registerEditorPlugin({
    name: 'toggle-button',
    label: 'Toggle Button',
    tagName: 'wui-toggle-button',
    props: [...toggleButtonProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '🔀'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-toggle-button')
        el.textContent = 'Toggle'
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-checkbox ──

const checkboxProps: PluginProp[] = [
    { name: 'children', type: 'string', label: 'Label', default: '', hint: 'Label text', textContent: true },
    { name: 'checked', type: 'boolean', label: 'Checked', default: false, live: true },
    { name: 'disabled', type: 'boolean', label: 'Disabled', default: false },
    {
        // Component default is 'left' (Checkbox.tsx `labelPosition: $("left")`).
        // A plugin default that disagrees makes picking it strip the attribute and
        // silently snap the label to the other side.
        name: 'labelPosition', type: 'enum', label: 'Label Position', default: 'left',
        options: [
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
            { value: 'top', label: 'Top' },
            { value: 'bottom', label: 'Bottom' },
        ],
    },
]

registerEditorPlugin({
    name: 'checkbox',
    label: 'Checkbox',
    tagName: 'wui-checkbox',
    props: [...checkboxProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '☑️'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-checkbox')
        el.textContent = 'Checkbox'
        el.setAttribute('label-position', 'right')
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-switch ──

const switchProps: PluginProp[] = [
    { name: 'on', type: 'string', label: 'On Text', default: 'ON', hint: 'Label shown when checked' },
    { name: 'off', type: 'string', label: 'Off Text', default: 'OFF', hint: 'Label shown when unchecked' },
    { name: 'checked', type: 'boolean', label: 'Checked', default: false, live: true },
    {
        // `default` must be the component's own default (`effect: $("")`), not a
        // nice-looking one: applyCustomElementProperty deletes an attribute equal
        // to the plugin default, so declaring 'ios' here made picking "iOS" strip
        // `effect` off the element -- the row read iOS while the switch rendered
        // with no effect stylesheet at all.
        name: 'effect', type: 'enum', label: 'Effect', default: '',
        // Every key in Switch.tsx's styleMap. A switch *is* its effect, so an
        // option missing here is a variant the editor cannot reach.
        options: [
            { value: '', label: 'Default' },
            { value: 'ios', label: 'iOS' },
            { value: 'flat', label: 'Flat' },
            { value: 'skewed', label: 'Skewed' },
            { value: 'flip', label: 'Flip' },
            { value: 'light', label: 'Light' },
            { value: 'effect1', label: 'Effect 1' },
            { value: 'effect2', label: 'Effect 2' },
            { value: 'effect3', label: 'Effect 3' },
            { value: 'effect4', label: 'Effect 4' },
            { value: 'effect5', label: 'Effect 5' },
            { value: 'effect6', label: 'Effect 6' },
            { value: 'effect7', label: 'Effect 7' },
            { value: 'effect8', label: 'Effect 8' },
            { value: 'effect9', label: 'Effect 9' },
            { value: 'effect10', label: 'Effect 10' },
            { value: 'effect11', label: 'Effect 11' },
            { value: 'effect12', label: 'Effect 12' },
            { value: 'effect13', label: 'Effect 13' },
            { value: 'effect14', label: 'Effect 14' },
            { value: 'effect15', label: 'Effect 15' },
            { value: 'effect16', label: 'Effect 16' },
            { value: 'effect17', label: 'Effect 17' },
            { value: 'effect18', label: 'Effect 18' },
        ],
    },
]

registerEditorPlugin({
    name: 'switch',
    label: 'Switch',
    tagName: 'wui-switch',
    props: [...switchProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '🔛'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-switch')
        el.setAttribute('effect', 'ios')
        el.setAttribute('checked', 'true')
        el.setAttribute('on', 'ON')
        el.setAttribute('off', 'OFF')
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-text-field ──

const textFieldProps: PluginProp[] = [
    { name: 'label', type: 'string', label: 'Label', hint: 'Floating label text' },
    { name: 'value', type: 'string', label: 'Value', default: '', live: true },
    { name: 'placeholder', type: 'string', label: 'Placeholder', hint: 'Hint text inside the field' },
    {
        name: 'inputType', type: 'enum', label: 'Input Type', default: 'text',
        options: [
            { value: 'text', label: 'Text' },
            { value: 'password', label: 'Password' },
            { value: 'email', label: 'Email' },
            { value: 'number', label: 'Number' },
            { value: 'tel', label: 'Telephone' },
            { value: 'url', label: 'URL' },
            { value: 'search', label: 'Search' },
            { value: 'date', label: 'Date' },
            { value: 'time', label: 'Time' },
        ],
    },
    { name: 'disabled', type: 'boolean', label: 'Disabled', default: false },
    {
        // Every key in TextField.tsx's effectMap -- the prop existed but the panel
        // never exposed it, so all 27 focus animations were unreachable. Default ''
        // matches the component (`effect: $("")`), so only "None" clears it.
        name: 'effect', type: 'enum', label: 'Effect', default: '',
        hint: 'Focus/label animation. Effects 16+ need a Label to look right.',
        options: [
            { value: '', label: 'None' },
            { value: 'effect1', label: 'Effect 1 - Center-out underline' },
            { value: 'effect2', label: 'Effect 2 - Left-to-right underline' },
            { value: 'effect3', label: 'Effect 3 - Split center-out underline' },
            { value: 'effect4', label: 'Effect 4 - Bottom-up fill border' },
            { value: 'effect5', label: 'Effect 5 - Left-to-right fill border' },
            { value: 'effect6', label: 'Effect 6 - Right-to-left fill border' },
            { value: 'effect7', label: 'Effect 7 - Center-out split outline' },
            { value: 'effect8', label: 'Effect 8 - Corner-to-corner outline' },
            { value: 'effect9', label: 'Effect 9 - Snake/chasing outline' },
            { value: 'effect10', label: 'Effect 10 - Fade in fill' },
            { value: 'effect11', label: 'Effect 11 - Left-to-right fill' },
            { value: 'effect12', label: 'Effect 12 - Center-out fill' },
            { value: 'effect13', label: 'Effect 13 - Split center-out fill' },
            { value: 'effect14', label: 'Effect 14 - Diagonal split fill' },
            { value: 'effect15', label: 'Effect 15 - Center diamond fill' },
            { value: 'effect16', label: 'Effect 16 - Center-out underline + label' },
            { value: 'effect17', label: 'Effect 17 - Center-out from left + label' },
            { value: 'effect18', label: 'Effect 18 - Split center-out + label' },
            { value: 'effect19', label: 'Effect 19 - Split top/bottom border + label' },
            { value: 'effect20', label: 'Effect 20 - Clockwise border + label' },
            { value: 'effect21', label: 'Effect 21 - Snake border + label' },
            { value: 'effect22', label: 'Effect 22 - Fade in fill + label' },
            { value: 'effect23', label: 'Effect 23 - Split fill + label' },
            { value: 'effect24', label: 'Effect 24 - Diagonal fill + label' },
            { value: 'effect19a', label: 'Effect 19a - Split border, label cuts line' },
            { value: 'effect20a', label: 'Effect 20a - Clockwise border, label cuts line' },
            { value: 'effect21a', label: 'Effect 21a - Snake border, label cuts line' },
        ],
    },
    { name: 'assignOnEnter', type: 'boolean', label: 'Commit On Enter', default: false, hint: 'Off: commit on every keystroke' },
]

registerEditorPlugin({
    name: 'text-field',
    label: 'Text Field',
    tagName: 'wui-text-field',
    props: [...textFieldProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '📝'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-text-field')
        el.setAttribute('label', 'Name')
        el.setAttribute('placeholder', 'Enter text')
        el.setAttribute('style', 'display:inline-flex')
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-text-area ──

const textAreaProps: PluginProp[] = [
    { name: 'label', type: 'string', label: 'Label', hint: 'Floating label text' },
    { name: 'value', type: 'string', label: 'Value', default: '', live: true },
    { name: 'placeholder', type: 'string', label: 'Placeholder', hint: 'Hint text inside the field' },
    {
        // Same 27 effects as TextField, but TextArea's own default is 'effect19a'
        // (`effect: $("effect19a")`), not '' -- so that is the value that unsets.
        name: 'effect', type: 'enum', label: 'Effect', default: 'effect19a',
        hint: 'Focus/label animation. Effects 16+ need a Label to look right.',
        options: [
            // No "None": TextArea's own default is 'effect19a', and an empty value
            // just removes the attribute, so picking None would silently render 19a.
            // Selecting 'Effect 19a' below is the real way back to the default.
            { value: 'effect1', label: 'Effect 1 - Center-out underline' },
            { value: 'effect2', label: 'Effect 2 - Left-to-right underline' },
            { value: 'effect3', label: 'Effect 3 - Split center-out underline' },
            { value: 'effect4', label: 'Effect 4 - Bottom-up fill border' },
            { value: 'effect5', label: 'Effect 5 - Left-to-right fill border' },
            { value: 'effect6', label: 'Effect 6 - Right-to-left fill border' },
            { value: 'effect7', label: 'Effect 7 - Center-out split outline' },
            { value: 'effect8', label: 'Effect 8 - Corner-to-corner outline' },
            { value: 'effect9', label: 'Effect 9 - Snake/chasing outline' },
            { value: 'effect10', label: 'Effect 10 - Fade in fill' },
            { value: 'effect11', label: 'Effect 11 - Left-to-right fill' },
            { value: 'effect12', label: 'Effect 12 - Center-out fill' },
            { value: 'effect13', label: 'Effect 13 - Split center-out fill' },
            { value: 'effect14', label: 'Effect 14 - Diagonal split fill' },
            { value: 'effect15', label: 'Effect 15 - Center diamond fill' },
            { value: 'effect16', label: 'Effect 16 - Center-out underline + label' },
            { value: 'effect17', label: 'Effect 17 - Center-out from left + label' },
            { value: 'effect18', label: 'Effect 18 - Split center-out + label' },
            { value: 'effect19', label: 'Effect 19 - Split top/bottom border + label' },
            { value: 'effect20', label: 'Effect 20 - Clockwise border + label' },
            { value: 'effect21', label: 'Effect 21 - Snake border + label' },
            { value: 'effect22', label: 'Effect 22 - Fade in fill + label' },
            { value: 'effect23', label: 'Effect 23 - Split fill + label' },
            { value: 'effect24', label: 'Effect 24 - Diagonal fill + label' },
            { value: 'effect19a', label: 'Effect 19a - Split border, label cuts line' },
            { value: 'effect20a', label: 'Effect 20a - Clockwise border, label cuts line' },
            { value: 'effect21a', label: 'Effect 21a - Snake border, label cuts line' },
        ],
    },
    {
        name: 'resize', type: 'enum', label: 'Resize', default: 'none',
        options: [
            { value: 'none', label: 'None' },
            { value: 'horizontal', label: 'Horizontal' },
            { value: 'vertical', label: 'Vertical' },
            { value: 'both', label: 'Both' },
        ],
    },
    { name: 'assignOnEnter', type: 'boolean', label: 'Commit On Enter', default: false, hint: 'Off: commit on every keystroke' },
]

registerEditorPlugin({
    name: 'text-area',
    label: 'Text Area',
    tagName: 'wui-text-area',
    props: [...textAreaProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '📄'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-text-area')
        el.setAttribute('label', 'Notes')
        el.setAttribute('placeholder', 'Enter text')
        el.setAttribute('style', 'display:inline-flex;vertical-align:top')
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-number-field ──

const numberFieldProps: PluginProp[] = [
    // Default is the component's own (NumberField.tsx `value: $(0)`), not the demo's
    // 10 -- otherwise typing 10 removes the attribute and the widget falls back to 0.
    { name: 'value', type: 'number', label: 'Value', default: 0, hint: 'Current numeric value', live: true },
    { name: 'min', type: 'number', label: 'Min', default: 0 },
    { name: 'max', type: 'number', label: 'Max', default: 100 },
    { name: 'step', type: 'number', label: 'Step', default: 1 },
    { name: 'disabled', type: 'boolean', label: 'Disabled', default: false },
]

registerEditorPlugin({
    name: 'number-field',
    label: 'Number Field',
    tagName: 'wui-number-field',
    props: [...numberFieldProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '🔢'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-number-field')
        el.setAttribute('value', '10')
        el.setAttribute('min', '0')
        el.setAttribute('max', '100')
        el.setAttribute('style', 'display:inline-flex')
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-icon-button ──

const iconButtonProps: PluginProp[] = [
    { name: 'disabled', type: 'boolean', label: 'Disabled', default: false },
]

registerEditorPlugin({
    name: 'icon-button',
    label: 'Icon Button',
    tagName: 'wui-icon-button',
    props: [...iconButtonProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '🔔'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-icon-button')
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('width', '20')
        svg.setAttribute('height', '20')
        svg.setAttribute('viewBox', '0 0 24 24')
        svg.setAttribute('fill', 'currentColor')
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('d', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z')
        svg.appendChild(path)
        el.appendChild(svg)
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-badge ──

const badgeProps: PluginProp[] = [
    // Default is the component's own (Badge.tsx `badgeContent: $(null)`), not the demo's
    // 3 -- otherwise typing 3 removes the attribute and `Badge.tsx` renders an empty
    // badge, i.e. the badge vanishes rather than reverting.
    { name: 'badgeContent', type: 'string', label: 'Badge Content', default: '', hint: 'Text or number shown on the badge' },
    {
        name: 'vertical', type: 'enum', label: 'Vertical', default: 'top',
        options: [
            { value: 'top', label: 'Top' },
            { value: 'bottom', label: 'Bottom' },
        ],
    },
    {
        name: 'horizontal', type: 'enum', label: 'Horizontal', default: 'right',
        options: [
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
        ],
    },
]

registerEditorPlugin({
    name: 'badge',
    label: 'Badge',
    tagName: 'wui-badge',
    props: [...badgeProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '🏷️'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-badge')
        el.setAttribute('badge-content', '3')
        el.setAttribute('style', 'display:inline-flex')

        // inner icon-button with SVG heart
        const ib = document.createElement('wui-icon-button')
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('width', '20')
        svg.setAttribute('height', '20')
        svg.setAttribute('viewBox', '0 0 24 24')
        svg.setAttribute('fill', 'currentColor')
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('d', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z')
        svg.appendChild(path)
        ib.appendChild(svg)
        el.appendChild(ib)

        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-fab ──

const fabProps: PluginProp[] = [
    {
        // Component default is 'pill' (Fab.tsx `type: $("pill")`).
        name: 'type', type: 'enum', label: 'Shape', default: 'pill',
        options: [
            { value: 'circular', label: 'Circular' },
            { value: 'pill', label: 'Pill' },
            { value: 'custom', label: 'Custom' },
        ],
    },
    { name: 'children', type: 'string', label: 'Content', default: '', textContent: true },
    { name: 'disabled', type: 'boolean', label: 'Disabled', default: false },
]

registerEditorPlugin({
    name: 'fab',
    label: 'FAB',
    tagName: 'wui-fab',
    props: [...fabProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '➕'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-fab')
        el.setAttribute('type', 'circular')
        el.textContent = '❤️'
        el.setAttribute('style', 'display:inline-flex;position:static;transform:none;')
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})

// ── wui-avatar ──

const avatarProps: PluginProp[] = [
    {
        name: 'size', type: 'enum', label: 'Size', default: 'md',
        options: [
            { value: 'xs', label: 'Extra Small' },
            { value: 'sm', label: 'Small' },
            { value: 'md', label: 'Medium' },
            { value: 'lg', label: 'Large' },
        ],
    },
    {
        name: 'type', type: 'enum', label: 'Variant', default: 'circular',
        options: [
            { value: 'circular', label: 'Circular' },
            { value: 'rounded', label: 'Rounded' },
            { value: 'square', label: 'Square' },
            { value: 'custom', label: 'Custom' },
        ],
    },
    { name: 'src', type: 'string', label: 'Image URL', hint: 'Image source; falls back to initials' },
    { name: 'children', type: 'string', label: 'Initials', default: '', hint: 'Fallback content when no image', textContent: true },
]

registerEditorPlugin({
    name: 'avatar',
    label: 'Avatar',
    tagName: 'wui-avatar',
    props: [...avatarProps, ...styleProps],
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '👤'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-avatar')
        el.setAttribute('size', 'md')
        el.setAttribute('type', 'circular')
        el.textContent = 'JD'
        el.setAttribute('style', 'display:inline-flex;vertical-align:middle')
        range.deleteContents()
        range.insertNode(el)
        const newRange = document.createRange()
        newRange.setStartAfter(el)
        newRange.collapse(true)
        const root = editorRoot.getRootNode()
        const sel = (root instanceof ShadowRoot) ? root.getSelection() : window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(newRange)
    },
})
// ── wui-banner ──

/**
 * The page header. Unlike every other plugin in this file it is a *block*, so it gets the
 * shared block insertion from BlockInsert.ts rather than dropping at the caret — a banner
 * dropped inside a `<p>` inherits that paragraph's margins and stops being a strip.
 *
 * `editableContent: true`, for the reason `wui-cover-page` has it: the words on a banner are
 * the author's slotted light DOM, and a container that selected itself every time you clicked
 * its text would put the heading one Backspace away from deletion. Clicking the backdrop
 * selects the block and opens this panel; clicking the words places the caret.
 *
 * No `pageBreak`. A cover owns its sheet; a banner heads whatever page it happens to be on,
 * including one that continues the page before it.
 *
 * Every default below is read from BANNER — the component's own fallbacks — because the panel
 * strips an attribute whose value equals the schema default, and a schema that disagrees with
 * the component makes the widget silently revert the moment you set that value.
 */
const bannerProps: PluginProp[] = [
    {
        name: 'type', type: 'enum', label: 'Background', default: BANNER.type,
        options: [
            { value: 'image', label: 'Image' },
            { value: 'solid', label: 'Solid colour' },
            { value: 'gradient', label: 'Gradient' },
        ],
    },
    {
        name: 'src', type: 'string', label: 'Image', default: BANNER.src,
        hint: 'Any URL or data URI, used when Background is "Image". "Edit…" opens the crop/replace dialog.',
        action: {
            label: 'Edit…',
            title: 'Crop or replace the banner image',
            run: el => editImageAttr(el, 'src'),
        },
    },
    {
        name: 'focus', type: 'enum', label: 'Focus', default: BANNER.focus,
        hint: 'Which part of the image survives the crop to the strip.',
        options: [
            { value: 'center', label: 'Center' },
            { value: 'top', label: 'Top' },
            { value: 'bottom', label: 'Bottom' },
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
        ],
    },
    {
        name: 'scrim', type: 'enum', label: 'Scrim', default: BANNER.scrim,
        hint: 'The wash of colour between photo and words that keeps text readable over a busy image. Image backgrounds only.',
        options: [
            { value: 'left', label: 'Fade right from left' },
            { value: 'right', label: 'Fade left from right' },
            { value: 'bottom', label: 'Fade up from bottom' },
            { value: 'top', label: 'Fade down from top' },
            { value: 'full', label: 'Even, whole strip' },
            { value: 'none', label: 'None (bare photo)' },
        ],
    },
    {
        name: 'overlay', type: 'number', label: 'Scrim %', default: BANNER.overlay,
        hint: 'How strong that wash is, 0–100.',
    },
    {
        name: 'tint', type: 'color', label: 'Tint', default: BANNER.tint,
        hint: 'The scrim colour over an image, the fill for a solid, the first stop of a gradient.',
    },
    {
        name: 'tint2', type: 'color', label: 'Gradient end', default: BANNER.tint2,
        hint: 'The second stop, used when Background is "Gradient".',
    },
    { name: 'ink', type: 'color', label: 'Text colour', default: BANNER.ink },
    {
        name: 'shadow', type: 'boolean', label: 'Text shadow', default: BANNER.shadow,
        hint: 'A soft halo that holds white text together over a photo. Dropped when printing.',
    },
    {
        name: 'height', type: 'string', label: 'Height', default: BANNER.height,
        hint: 'Any CSS length — 7rem, 28mm, 120px.',
    },
    {
        name: 'pad', type: 'string', label: 'Padding', default: BANNER.pad,
        hint: 'Any CSS padding shorthand, e.g. 0.75rem 1rem.',
    },
    {
        name: 'align', type: 'enum', label: 'Text at', default: BANNER.align,
        options: [
            { value: 'start', label: 'Left' },
            { value: 'center', label: 'Centre' },
            { value: 'end', label: 'Right' },
        ],
    },
    {
        name: 'logo', type: 'string', label: 'Logo', default: BANNER.logo,
        hint: 'Empty means no logo — that absence is the only "off" switch there is.',
        action: {
            label: 'Edit…',
            title: 'Crop or replace the logo',
            run: el => editImageAttr(el, 'logo'),
        },
    },
    { name: 'logoHeight', type: 'string', label: 'Logo height', default: BANNER.logoHeight },
    {
        name: 'print', type: 'boolean', label: 'Print width', default: BANNER.print,
        hint: 'The su-yen preset: 209mm wide, centred, ruled, and set large and bold.',
    },
]

registerEditorPlugin({
    name: 'banner',
    // Alone among the widgets in this file, a banner is page furniture -- so it sorts
    // with the page-structure family in PageBlockPlugins, not with the buttons it is
    // registered beside. See `EditorPlugin.order`.
    order: -50,
    label: 'Banner',
    tagName: 'wui-banner',
    props: [...bannerProps, ...styleProps],
    // A backdrop, not a template: what sits on it is the author's, and clicking it types
    // rather than selects. See EditorPlugin.editableContent.
    editableContent: true,
    icon: () => {
        const span = document.createElement('span')
        span.textContent = '🎏'
        return span
    },
    onInsert: (editorRoot, range) => {
        const el = document.createElement('wui-banner')
        // Seeded rather than left empty, because an empty banner gives the caret nowhere to
        // land: it would be a coloured strip you can select but not write on.
        const h = document.createElement('h2')
        h.textContent = 'Page title'
        const p = document.createElement('p')
        p.textContent = 'A line of subtitle.'
        el.append(h, p)
        insertAsBlock(editorRoot, range, el)
    },
})
